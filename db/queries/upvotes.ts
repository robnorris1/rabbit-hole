import { db } from '../index.ts';
import { upvotes, rabbitHoles } from '../schema.ts';
import { eq, and, gt, sql } from 'drizzle-orm';

export async function getUpvotedHoleIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ holeId: upvotes.holeId })
    .from(upvotes)
    .where(eq(upvotes.userId, userId));
  return rows.map((r) => r.holeId);
}

export async function isUpvoted(userId: string, holeId: string): Promise<boolean> {
  const rows = await db
    .select({ holeId: upvotes.holeId })
    .from(upvotes)
    .where(and(eq(upvotes.userId, userId), eq(upvotes.holeId, holeId)))
    .limit(1);
  return rows.length > 0;
}

export async function getWeeklyHoleIds(): Promise<string[]> {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rows = await db
    .select({ holeId: upvotes.holeId })
    .from(upvotes)
    .where(gt(upvotes.createdAt, cutoff))
    .groupBy(upvotes.holeId)
    .orderBy(sql`max(${upvotes.createdAt}) desc`);
  return rows.map((r) => r.holeId);
}

export async function toggleUpvote(
  userId: string,
  holeId: string,
): Promise<{ voted: boolean; upvoteCount: number }> {
  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(upvotes)
      .where(and(eq(upvotes.userId, userId), eq(upvotes.holeId, holeId)))
      .limit(1);

    let delta: number;
    if (existing.length > 0) {
      await tx
        .delete(upvotes)
        .where(and(eq(upvotes.userId, userId), eq(upvotes.holeId, holeId)));
      delta = -1;
    } else {
      await tx.insert(upvotes).values({ userId, holeId });
      delta = 1;
    }

    const updated = await tx
      .update(rabbitHoles)
      .set({ upvoteCount: sql`${rabbitHoles.upvoteCount} + ${delta}` })
      .where(eq(rabbitHoles.id, holeId))
      .returning({ upvoteCount: rabbitHoles.upvoteCount });

    return { voted: delta === 1, upvoteCount: updated[0]?.upvoteCount ?? 0 };
  });
}