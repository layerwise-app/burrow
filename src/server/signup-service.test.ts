import { describe, expect, it, vi } from 'vitest';
import {
  isValidGithubUsername,
  OWNER_EMAIL_DAILY_CAP,
  RATE_LIMIT,
  validateSignup,
  toSignupInput
} from '~/lib/signup-rules';
import type { SignupData } from '~/lib/signup-rules';
import {
  hashVisitor,
  processSignup,
  type OwnerEmail,
  type SignupDeps,
  type SignupStore
} from './signup-service';

type Row = SignupData & { id: string; createdAt: Date; notifiedAt: Date | null };

function memoryStore() {
  const rows: Row[] = [];
  const attempts: { hash: string; at: Date }[] = [];
  let salt: string | null = null;
  const store: SignupStore = {
    async getSalt() {
      salt ??= 'test-salt';
      return salt;
    },
    async attemptsSince(hash, since) {
      return attempts
        .filter((a) => a.hash === hash && a.at >= since)
        .map((a) => a.at)
        .sort((a, b) => a.getTime() - b.getTime());
    },
    async recordAttempt(hash, at) {
      attempts.push({ hash, at });
    },
    async pruneAttempts(before) {
      for (let i = attempts.length - 1; i >= 0; i--) {
        if (attempts[i].at < before) attempts.splice(i, 1);
      }
    },
    async insertSignup(data, at) {
      if (rows.some((r) => r.email === data.email)) return null;
      const id = `row-${rows.length + 1}`;
      rows.push({ ...data, id, createdAt: at, notifiedAt: null });
      return { id };
    },
    async notificationsSince(since) {
      return rows.filter((r) => r.notifiedAt && r.notifiedAt >= since).length;
    },
    async markNotified(id, at) {
      const row = rows.find((r) => r.id === id);
      if (row) row.notifiedAt = at;
    }
  };
  return { store, rows, attempts };
}

function setup(overrides: Partial<SignupDeps> = {}) {
  const mem = memoryStore();
  const sent: OwnerEmail[] = [];
  const deps: SignupDeps = {
    store: mem.store,
    ip: '203.0.113.7',
    now: new Date('2026-11-04T12:00:00Z'),
    ownerEmail: '',
    sendEmail: vi.fn(async (message: OwnerEmail) => {
      sent.push(message);
      return { ok: true };
    }),
    ...overrides
  };
  return { ...mem, deps, sent };
}

const valid = {
  email: 'Ada@Example.com ',
  githubUsername: '@ada-lovelace',
  teamSize: '2-10',
  website: ''
};

describe('validation', () => {
  it('accepts a valid sign-up and normalizes it', () => {
    const result = validateSignup(toSignupInput(valid));
    expect(result).toEqual({
      ok: true,
      data: { email: 'ada@example.com', githubUsername: 'ada-lovelace', teamSize: '2-10' }
    });
  });

  it('requires a real-looking email', () => {
    for (const email of ['', 'ada', 'ada@', 'ada@example', 'a b@example.com']) {
      const result = validateSignup(toSignupInput({ ...valid, email }));
      expect(result.ok, email).toBe(false);
      if (!result.ok) expect(result.errors.email).toBeTruthy();
    }
  });

  it('allows an empty GitHub username', () => {
    const result = validateSignup(toSignupInput({ ...valid, githubUsername: '  ' }));
    expect(result.ok && result.data.githubUsername).toBe(null);
  });

  it('validates GitHub usernames by GitHub rules', () => {
    for (const ok of ['a', 'octo-cat', 'A1', 'x'.repeat(39), 'a-b-c']) {
      expect(isValidGithubUsername(ok), ok).toBe(true);
    }
    for (const bad of ['-octo', 'octo-', 'oc--to', 'x'.repeat(40), 'octo_cat', 'oc.to', 'octo cat']) {
      expect(isValidGithubUsername(bad), bad).toBe(false);
    }
  });

  it('only accepts the four team sizes', () => {
    for (const teamSize of ['1', '2-10', '11-50', '51+']) {
      expect(validateSignup(toSignupInput({ ...valid, teamSize })).ok).toBe(true);
    }
    for (const teamSize of ['', '0', '2–10', '100', '51']) {
      expect(validateSignup(toSignupInput({ ...valid, teamSize })).ok).toBe(false);
    }
  });

  it('treats non-string fields as empty instead of throwing', () => {
    const input = toSignupInput({ email: 42, teamSize: ['1'], website: null });
    expect(input).toEqual({ email: '', githubUsername: '', teamSize: '', website: '' });
    expect(toSignupInput(null).email).toBe('');
  });
});

describe('processSignup', () => {
  it('saves a valid sign-up', async () => {
    const { deps, rows } = setup();
    expect(await processSignup(valid, deps)).toEqual({ status: 'ok', email: 'ada@example.com' });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ email: 'ada@example.com', githubUsername: 'ada-lovelace', teamSize: '2-10' });
  });

  it('rejects invalid data on the server and saves nothing', async () => {
    const { deps, rows } = setup();
    const result = await processSignup({ ...valid, email: 'nope', githubUsername: '-x-' }, deps);
    expect(result.status).toBe('invalid');
    if (result.status === 'invalid') {
      expect(Object.keys(result.errors).sort()).toEqual(['email', 'githubUsername']);
    }
    expect(rows).toHaveLength(0);
  });

  it('answers "already on the list" for the same email and adds no row', async () => {
    const { deps, rows } = setup();
    await processSignup(valid, deps);
    const again = await processSignup({ ...valid, email: ' ADA@example.COM', teamSize: '51+' }, deps);
    expect(again).toEqual({ status: 'duplicate', email: 'ada@example.com' });
    expect(rows).toHaveLength(1);
    expect(rows[0].teamSize).toBe('2-10');
  });

  it('pretends to succeed when the honeypot is filled, saving and sending nothing', async () => {
    const { deps, rows, sent } = setup({ ownerEmail: 'owner@tunnelworks.example' });
    const result = await processSignup({ ...valid, website: 'https://spam.example' }, deps);
    expect(result.status).toBe('ok');
    expect(rows).toHaveLength(0);
    expect(sent).toHaveLength(0);
  });

  it(`allows ${RATE_LIMIT} submissions per visitor per hour`, async () => {
    const { deps, rows } = setup();
    for (let i = 0; i < RATE_LIMIT; i++) {
      const result = await processSignup({ ...valid, email: `dev${i}@example.com` }, deps);
      expect(result.status).toBe('ok');
    }
    const blocked = await processSignup({ ...valid, email: 'dev9@example.com' }, deps);
    expect(blocked).toEqual({ status: 'rate_limited', retryAfterMinutes: 60 });
    expect(rows).toHaveLength(RATE_LIMIT);
  });

  it('counts duplicates, invalid data, and honeypot hits toward the limit', async () => {
    const { deps } = setup();
    await processSignup(valid, deps);
    await processSignup(valid, deps);
    await processSignup({ ...valid, email: 'bad' }, deps);
    await processSignup({ ...valid, website: 'x' }, deps);
    await processSignup({ ...valid, email: 'five@example.com' }, deps);
    const blocked = await processSignup({ ...valid, email: 'six@example.com' }, deps);
    expect(blocked.status).toBe('rate_limited');
  });

  it('limits each visitor separately and lets them back in after an hour', async () => {
    const { deps } = setup();
    for (let i = 0; i < RATE_LIMIT; i++) {
      await processSignup({ ...valid, email: `a${i}@example.com` }, deps);
    }
    const other = await processSignup(
      { ...valid, email: 'other@example.com' },
      { ...deps, ip: '198.51.100.2' }
    );
    expect(other.status).toBe('ok');

    const later = new Date(deps.now.getTime() + 40 * 60_000);
    const stillBlocked = await processSignup({ ...valid, email: 'b@example.com' }, { ...deps, now: later });
    expect(stillBlocked).toEqual({ status: 'rate_limited', retryAfterMinutes: 20 });

    const nextHour = new Date(deps.now.getTime() + 61 * 60_000);
    const allowed = await processSignup({ ...valid, email: 'c@example.com' }, { ...deps, now: nextHour });
    expect(allowed.status).toBe('ok');
  });

  it('keys the limit by a salted hash, never the raw IP', async () => {
    const { deps, attempts } = setup();
    await processSignup(valid, deps);
    expect(attempts[0].hash).toMatch(/^[0-9a-f]{64}$/);
    expect(attempts[0].hash).not.toContain('203.0.113.7');
    expect(attempts[0].hash).toBe(await hashVisitor('203.0.113.7', 'test-salt'));
    expect(await hashVisitor('203.0.113.7', 'other-salt')).not.toBe(attempts[0].hash);
  });

  it('sends no email when ownerEmail is empty', async () => {
    const { deps, sent } = setup();
    await processSignup(valid, deps);
    expect(sent).toHaveLength(0);
  });

  it('emails only the owner, never the address the visitor typed', async () => {
    const { deps, sent, rows } = setup({ ownerEmail: 'owner@tunnelworks.example' });
    await processSignup({ ...valid, email: 'victim@example.com' }, deps);
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe('owner@tunnelworks.example');
    expect(sent[0].text).toContain('victim@example.com');
    expect(rows[0].notifiedAt).toEqual(deps.now);
  });

  it('escapes visitor input in the owner email html', async () => {
    const { deps, sent } = setup({ ownerEmail: 'owner@tunnelworks.example' });
    await processSignup({ ...valid, email: '"<b>x</b>"@example.com' }, deps);
    expect(sent[0].html).not.toContain('<b>x</b>');
  });

  it(`sends at most ${OWNER_EMAIL_DAILY_CAP} owner emails per day, then keeps saving`, async () => {
    const { deps, sent, rows } = setup({ ownerEmail: 'owner@tunnelworks.example' });
    for (let i = 0; i < OWNER_EMAIL_DAILY_CAP + 3; i++) {
      // A new visitor each time so the rate limit does not interfere.
      const result = await processSignup(
        { ...valid, email: `team${i}@example.com` },
        { ...deps, ip: `10.0.${Math.floor(i / 250)}.${i % 250}` }
      );
      expect(result.status).toBe('ok');
    }
    expect(rows).toHaveLength(OWNER_EMAIL_DAILY_CAP + 3);
    expect(sent).toHaveLength(OWNER_EMAIL_DAILY_CAP);

    const tomorrow = new Date('2026-11-05T00:05:00Z');
    await processSignup({ ...valid, email: 'tomorrow@example.com' }, { ...deps, now: tomorrow, ip: '10.9.9.9' });
    expect(sent).toHaveLength(OWNER_EMAIL_DAILY_CAP + 1);
  });

  it('still saves the sign-up when the email fails', async () => {
    const { deps, rows } = setup({
      ownerEmail: 'owner@tunnelworks.example',
      sendEmail: async () => {
        throw new Error('binding down');
      }
    });
    const result = await processSignup(valid, deps);
    expect(result.status).toBe('ok');
    expect(rows).toHaveLength(1);
    expect(rows[0].notifiedAt).toBe(null);
  });
});
