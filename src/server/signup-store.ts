// D1 (Drizzle) implementation of the sign-up store. Server code only.

import { and, asc, count, eq, gte, isNotNull, lt } from 'drizzle-orm';
import { db } from '~/db';
import { appSecrets, earlyAccessSignups, signupAttempts } from '~/db/schema';
import type { SignupStore } from './signup-service';

const SALT_NAME = 'visitor_hash_salt';

function randomSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const d1SignupStore: SignupStore = {
  async getSalt() {
    // The first request creates the salt; later ones read the same row.
    await db
      .insert(appSecrets)
      .values({ name: SALT_NAME, value: randomSalt() })
      .onConflictDoNothing();
    const [row] = await db
      .select({ value: appSecrets.value })
      .from(appSecrets)
      .where(eq(appSecrets.name, SALT_NAME));
    return row.value;
  },

  async attemptsSince(visitorHash, since) {
    const rows = await db
      .select({ createdAt: signupAttempts.createdAt })
      .from(signupAttempts)
      .where(
        and(
          eq(signupAttempts.visitorHash, visitorHash),
          gte(signupAttempts.createdAt, since)
        )
      )
      .orderBy(asc(signupAttempts.createdAt));
    return rows.map((row) => row.createdAt);
  },

  async recordAttempt(visitorHash, at) {
    await db.insert(signupAttempts).values({ visitorHash, createdAt: at });
  },

  async pruneAttempts(before) {
    await db.delete(signupAttempts).where(lt(signupAttempts.createdAt, before));
  },

  async insertSignup(data, at) {
    const [row] = await db
      .insert(earlyAccessSignups)
      .values({
        email: data.email,
        githubUsername: data.githubUsername,
        teamSize: data.teamSize,
        createdAt: at
      })
      .onConflictDoNothing({ target: earlyAccessSignups.email })
      .returning({ id: earlyAccessSignups.id });
    return row ?? null;
  },

  async notificationsSince(since) {
    const [row] = await db
      .select({ value: count() })
      .from(earlyAccessSignups)
      .where(
        and(
          isNotNull(earlyAccessSignups.ownerNotifiedAt),
          gte(earlyAccessSignups.ownerNotifiedAt, since)
        )
      );
    return row?.value ?? 0;
  },

  async markNotified(id, at) {
    await db
      .update(earlyAccessSignups)
      .set({ ownerNotifiedAt: at })
      .where(eq(earlyAccessSignups.id, id));
  }
};
