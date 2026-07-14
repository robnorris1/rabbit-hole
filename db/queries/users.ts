import { eq } from 'drizzle-orm';
import { db } from '../index.ts';
import { users, rabbitHoles } from '../schema.ts';

export async function getUserByCognitoSub(cognitoSub: string) {
  const rows = await db.select().from(users).where(eq(users.cognitoSub, cognitoSub)).limit(1);
  return rows[0] ?? null;
}

export async function getUserByUsername(username: string) {
  const rows = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return rows[0] ?? null;
}

export async function getUserByEmail(email: string) {
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0] ?? null;
}

export async function createUser(data: { cognitoSub: string; username: string; email: string }) {
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

// Usernames of writers with at least one published hole — used by the sitemap
// so we only list profiles that actually have public content.
export async function getPublishedAuthorsForSitemap() {
  return db
    .selectDistinct({ username: users.username })
    .from(users)
    .innerJoin(rabbitHoles, eq(rabbitHoles.authorId, users.id))
    .where(eq(rabbitHoles.status, 'published'));
}