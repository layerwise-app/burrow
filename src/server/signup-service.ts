// The early-access sign-up, independent of the database and email binding so
// it can be tested. `signup.functions.ts` wires it to D1 and env.EMAIL.

import {
  OWNER_EMAIL_DAILY_CAP,
  RATE_LIMIT,
  RATE_WINDOW_MS,
  toSignupInput,
  validateSignup,
  type SignupData,
  type SignupResult
} from '~/lib/signup-rules';

export interface SignupStore {
  /** A random salt, created once and kept secret in the database. */
  getSalt(): Promise<string>;
  /** Submissions from this visitor since `since`, oldest first. */
  attemptsSince(visitorHash: string, since: Date): Promise<Date[]>;
  recordAttempt(visitorHash: string, at: Date): Promise<void>;
  /** Deletes attempts older than `before`. */
  pruneAttempts(before: Date): Promise<void>;
  /** Inserts the sign-up; returns false when the email already exists. */
  insertSignup(data: SignupData, at: Date): Promise<{ id: string } | null>;
  /** Owner emails sent since `since` (start of the UTC day). */
  notificationsSince(since: Date): Promise<number>;
  markNotified(id: string, at: Date): Promise<void>;
}

export type OwnerEmail = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export type SignupDeps = {
  store: SignupStore;
  /** The visitor's IP address, or null when the platform gives none. */
  ip: string | null;
  now: Date;
  /** `siteConfig.ownerEmail`; empty means never email. */
  ownerEmail: string;
  sendEmail: (message: OwnerEmail) => Promise<{ ok: boolean }>;
};

export async function hashVisitor(ip: string | null, salt: string) {
  const bytes = new TextEncoder().encode(`${salt}:${ip ?? 'unknown'}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function startOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

export function ownerNotification(
  to: string,
  data: SignupData,
  at: Date
): OwnerEmail {
  const rows: [string, string][] = [
    ['Email', data.email],
    ['GitHub', data.githubUsername ?? '(not given)'],
    ['Team size', data.teamSize],
    ['Signed up', at.toISOString()]
  ];
  return {
    to,
    subject: `New Burrow Cloud early-access sign-up: ${data.email}`,
    text: [
      'Someone asked for Burrow Cloud early access.',
      '',
      ...rows.map(([k, v]) => `${k}: ${v}`),
      '',
      'All sign-ups are in the early_access_signups table.'
    ].join('\n'),
    html: `<p>Someone asked for Burrow Cloud early access.</p><table>${rows
      .map(
        ([k, v]) =>
          `<tr><th align="left" style="padding-right:12px">${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`
      )
      .join('')}</table><p>All sign-ups are in the <code>early_access_signups</code> table.</p>`
  };
}

/**
 * Order matters: the rate limit counts every submission (bots included), the
 * honeypot answers like a success without saving, and only valid data is
 * stored. The visitor is never emailed; only `ownerEmail` is.
 */
export async function processSignup(
  raw: unknown,
  deps: SignupDeps
): Promise<SignupResult> {
  const { store, now } = deps;
  const input = toSignupInput(raw);

  const salt = await store.getSalt();
  const visitor = await hashVisitor(deps.ip, salt);
  const windowStart = new Date(now.getTime() - RATE_WINDOW_MS);
  const recent = await store.attemptsSince(visitor, windowStart);
  if (recent.length >= RATE_LIMIT) {
    const oldest = recent[0].getTime();
    const retryAfterMs = oldest + RATE_WINDOW_MS - now.getTime();
    return {
      status: 'rate_limited',
      retryAfterMinutes: Math.max(1, Math.ceil(retryAfterMs / 60_000))
    };
  }
  await store.recordAttempt(visitor, now);
  await store.pruneAttempts(new Date(now.getTime() - 24 * RATE_WINDOW_MS));

  const validation = validateSignup(input);

  if (input.website.trim() !== '') {
    // Looks like success to the bot; nothing is saved or sent.
    return {
      status: 'ok',
      email: validation.ok ? validation.data.email : input.email.trim()
    };
  }

  if (!validation.ok) return { status: 'invalid', errors: validation.errors };
  const data = validation.data;

  const inserted = await store.insertSignup(data, now);
  if (!inserted) return { status: 'duplicate', email: data.email };

  if (deps.ownerEmail) {
    const sentToday = await store.notificationsSince(startOfUtcDay(now));
    if (sentToday < OWNER_EMAIL_DAILY_CAP) {
      // A failed email never fails the sign-up; the row is already saved.
      try {
        const result = await deps.sendEmail(
          ownerNotification(deps.ownerEmail, data, now)
        );
        if (result.ok) await store.markNotified(inserted.id, now);
      } catch (error) {
        console.warn('[signup] owner email failed', error);
      }
    }
  }

  return { status: 'ok', email: data.email };
}
