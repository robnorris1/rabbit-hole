import { db } from '../index.ts';
import { flags, rabbitHoles, users } from '../schema.ts';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function flagHole(userId: string, holeId: string, reason: string): Promise<void> {
  await db.insert(flags).values({ userId, holeId, reason }).onConflictDoNothing();
}

export async function hasFlagged(userId: string, holeId: string): Promise<boolean> {
  const rows = await db
    .select({ holeId: flags.holeId })
    .from(flags)
    .where(and(eq(flags.userId, userId), eq(flags.holeId, holeId)))
    .limit(1);
  return rows.length > 0;
}

export type FlaggedHole = {
  id: string;
  title: string;
  slug: string | null;
  status: 'draft' | 'published';
  authorUsername: string;
  flagCount: number;
  reasons: string[];
};

export async function getFlaggedHoles(): Promise<FlaggedHole[]> {
  return db
    .select({
      id: rabbitHoles.id,
      title: rabbitHoles.title,
      slug: rabbitHoles.slug,
      status: rabbitHoles.status,
      authorUsername: users.username,
      flagCount: sql<number>`count(${flags.userId})::int`,
      reasons: sql<string[]>`array_agg(distinct ${flags.reason})`,
    })
    .from(flags)
    .innerJoin(rabbitHoles, eq(flags.holeId, rabbitHoles.id))
    .innerJoin(users, eq(rabbitHoles.authorId, users.id))
    .groupBy(rabbitHoles.id, rabbitHoles.title, rabbitHoles.slug, rabbitHoles.status, users.username)
    .orderBy(desc(sql`count(${flags.userId})`)) as Promise<FlaggedHole[]>;
}