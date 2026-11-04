import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Burrow is a public marketing site with no accounts, so there are no
// authentication tables. Define tables here, then run
// `pnpm run db:generate --name <what_changed>` and `pnpm run db:migrate`.

/** One row per "Get Burrow Cloud early access" sign-up. */
export const earlyAccessSignups = sqliteTable(
  'early_access_signups',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    /** Lowercased and trimmed; unique, so the same email adds no second row. */
    email: text('email').notNull().unique(),
    githubUsername: text('github_username'),
    /** One of `1`, `2-10`, `11-50`, `51+`. */
    teamSize: text('team_size').notNull(),
    /** When the owner was emailed about this sign-up; null if not emailed. */
    ownerNotifiedAt: integer('owner_notified_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date())
  },
  (table) => [
    index('early_access_signups_notified_idx').on(table.ownerNotifiedAt)
  ]
);

/**
 * Form submissions per visitor, for the 5-per-hour rate limit. `visitorHash`
 * is a salted SHA-256 of the IP address; raw addresses are never stored.
 * Rows older than a day are deleted as new submissions arrive.
 */
export const signupAttempts = sqliteTable(
  'signup_attempts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    visitorHash: text('visitor_hash').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
  },
  (table) => [
    index('signup_attempts_visitor_idx').on(table.visitorHash, table.createdAt),
    index('signup_attempts_created_idx').on(table.createdAt)
  ]
);

/** Values generated once per database, like the salt for visitor hashes. */
export const appSecrets = sqliteTable('app_secrets', {
  name: text('name').primaryKey(),
  value: text('value').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
});
