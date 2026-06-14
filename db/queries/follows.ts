import { and, eq, count } from 'drizzle-orm';
import { db } from '../index.ts';
import { follows } from '../schema.ts';

export async function getFollowCounts(userId: string) {
  const [followersResult, followingResult] = await Promise.all([
    db.select({ n: count() }).from(follows).where(eq(follows.followingId, userId)),
    db.select({ n: count() }).from(follows).where(eq(follows.followerId, userId)),
  ]);
  return {
    followers: followersResult[0]?.n ?? 0,
    following: followingResult[0]?.n ?? 0,
  };
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const rows = await db
    .select({ followerId: follows.followerId })
    .from(follows)
    .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
    .limit(1);
  return rows.length > 0;
}

export async function toggleFollow(
  followerId: string,
  followingId: string,
): Promise<{ following: boolean }> {
  const already = await isFollowing(followerId, followingId);
  if (already) {
    await db
      .delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    return { following: false };
  } else {
    await db.insert(follows).values({ followerId, followingId });
    return { following: true };
  }
}