// Rules for the early-access form, shared by the browser (instant feedback)
// and the server (the only check that counts).

export const TEAM_SIZES = ['1', '2-10', '11-50', '51+'] as const;
export type TeamSize = (typeof TEAM_SIZES)[number];

/** Submissions allowed per visitor (salted IP hash) per window. */
export const RATE_LIMIT = 5;
export const RATE_WINDOW_MS = 60 * 60 * 1000;
/** Owner notification emails per UTC day; past that, sign-ups are only saved. */
export const OWNER_EMAIL_DAILY_CAP = 100;

export type SignupInput = {
  email: string;
  githubUsername: string;
  teamSize: string;
  /** Honeypot: hidden from people, so anything in it came from a bot. */
  website: string;
};

export type SignupData = {
  email: string;
  githubUsername: string | null;
  teamSize: TeamSize;
};

export type FieldErrors = Partial<
  Record<'email' | 'githubUsername' | 'teamSize', string>
>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// GitHub: 1–39 letters, digits, or single hyphens; no hyphen at either end.
const GITHUB_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeGithub(value: string) {
  return value.trim().replace(/^@/, '');
}

export function isValidEmail(value: string) {
  const email = normalizeEmail(value);
  return email.length <= 254 && EMAIL_PATTERN.test(email);
}

export function isValidGithubUsername(value: string) {
  return GITHUB_PATTERN.test(normalizeGithub(value));
}

export function isTeamSize(value: string): value is TeamSize {
  return (TEAM_SIZES as readonly string[]).includes(value);
}

/** Coerces unknown request data into strings, so later checks never throw. */
export function toSignupInput(data: unknown): SignupInput {
  const record =
    data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const str = (key: string) =>
    typeof record[key] === 'string' ? (record[key] as string).slice(0, 500) : '';
  return {
    email: str('email'),
    githubUsername: str('githubUsername'),
    teamSize: str('teamSize'),
    website: str('website')
  };
}

export function validateSignup(
  input: SignupInput
): { ok: true; data: SignupData } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const email = normalizeEmail(input.email);
  const github = normalizeGithub(input.githubUsername);

  if (!email) errors.email = 'enter your email';
  else if (!isValidEmail(email)) errors.email = 'that does not look like an email address';

  if (github && !isValidGithubUsername(github)) {
    errors.githubUsername =
      'GitHub usernames use letters, digits, and single hyphens (max 39)';
  }

  if (!isTeamSize(input.teamSize)) errors.teamSize = 'pick a team size';

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: {
      email,
      githubUsername: github || null,
      teamSize: input.teamSize as TeamSize
    }
  };
}

export type SignupResult =
  | { status: 'ok'; email: string }
  | { status: 'duplicate'; email: string }
  | { status: 'invalid'; errors: FieldErrors }
  | { status: 'rate_limited'; retryAfterMinutes: number };
