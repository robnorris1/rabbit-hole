import { db } from '@/db';
import { rabbitHoles, users } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

export async function getFeed() {
  return db
    .select({
      id: rabbitHoles.id,
      title: rabbitHoles.title,
      slug: rabbitHoles.slug,
      excerpt: sql<string>`LEFT(SPLIT_PART(${rabbitHoles.body}, E'\n\n', 1), 180)`,
      tags: rabbitHoles.tags,
      readTimeMins: rabbitHoles.readTimeMins,
      upvoteCount: rabbitHoles.upvoteCount,
      publishedAt: rabbitHoles.publishedAt,
      authorUsername: users.username,
    })
    .from(rabbitHoles)
    .innerJoin(users, eq(rabbitHoles.authorId, users.id))
    .where(eq(rabbitHoles.status, 'published'))
    .orderBy(desc(rabbitHoles.publishedAt))
    .limit(50);
}

export async function getDeepNow() {
  return db
    .select({
      title: rabbitHoles.title,
      slug: rabbitHoles.slug,
      readTimeMins: rabbitHoles.readTimeMins,
      authorUsername: users.username,
    })
    .from(rabbitHoles)
    .innerJoin(users, eq(rabbitHoles.authorId, users.id))
    .where(eq(rabbitHoles.status, 'published'))
    .orderBy(desc(rabbitHoles.upvoteCount))
    .limit(4);
}

export async function getHoleBySlug(slug: string) {
  const rows = await db
    .select({
      id: rabbitHoles.id,
      title: rabbitHoles.title,
      slug: rabbitHoles.slug,
      body: rabbitHoles.body,
      tags: rabbitHoles.tags,
      readTimeMins: rabbitHoles.readTimeMins,
      upvoteCount: rabbitHoles.upvoteCount,
      publishedAt: rabbitHoles.publishedAt,
      authorUsername: users.username,
      authorBio: users.bio,
    })
    .from(rabbitHoles)
    .innerJoin(users, eq(rabbitHoles.authorId, users.id))
    .where(eq(rabbitHoles.slug, slug))
    .limit(1);

  return rows[0] ?? null;
}

export async function getTotalUpvoteCount(): Promise<number> {
  const rows = await db
    .select({ total: sql<number>`COALESCE(SUM(${rabbitHoles.upvoteCount}), 0)::int` })
    .from(rabbitHoles)
    .where(eq(rabbitHoles.status, 'published'));
  return rows[0]?.total ?? 0;
}

export async function getPublishedHoleCount(): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(rabbitHoles)
    .where(eq(rabbitHoles.status, 'published'));
  return rows[0]?.count ?? 0;
}

export async function getPublishedHoleCountByAuthor(authorId: string): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(rabbitHoles)
    .where(and(eq(rabbitHoles.authorId, authorId), eq(rabbitHoles.status, 'published')));
  return rows[0]?.count ?? 0;
}

export async function getDraftsByAuthor(authorId: string) {
  return db
    .select({ id: rabbitHoles.id, title: rabbitHoles.title, updatedAt: rabbitHoles.updatedAt })
    .from(rabbitHoles)
    .where(and(eq(rabbitHoles.authorId, authorId), eq(rabbitHoles.status, 'draft')))
    .orderBy(desc(rabbitHoles.updatedAt));
}

export async function getHolesByAuthorId(authorId: string) {
  return db
    .select({
      id: rabbitHoles.id,
      title: rabbitHoles.title,
      slug: rabbitHoles.slug,
      excerpt: sql<string>`LEFT(SPLIT_PART(${rabbitHoles.body}, E'\n\n', 1), 180)`,
      tags: rabbitHoles.tags,
      readTimeMins: rabbitHoles.readTimeMins,
      upvoteCount: rabbitHoles.upvoteCount,
      publishedAt: rabbitHoles.publishedAt,
    })
    .from(rabbitHoles)
    .where(and(eq(rabbitHoles.authorId, authorId), eq(rabbitHoles.status, 'published')))
    .orderBy(desc(rabbitHoles.publishedAt));
}

export async function getDraftById(id: string) {
  const rows = await db
    .select({ id: rabbitHoles.id, title: rabbitHoles.title, body: rabbitHoles.body, tags: rabbitHoles.tags })
    .from(rabbitHoles)
    .where(and(eq(rabbitHoles.id, id), eq(rabbitHoles.status, 'draft')))
    .limit(1);
  return rows[0] ?? null;
}

export async function getHoleByIdForEdit(id: string) {
  const rows = await db
    .select({
      id: rabbitHoles.id,
      title: rabbitHoles.title,
      body: rabbitHoles.body,
      tags: rabbitHoles.tags,
      status: rabbitHoles.status,
      authorId: rabbitHoles.authorId,
      slug: rabbitHoles.slug,
    })
    .from(rabbitHoles)
    .where(eq(rabbitHoles.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export type FeedHole = Awaited<ReturnType<typeof getFeed>>[number];
export type DeepItem = Awaited<ReturnType<typeof getDeepNow>>[number];
export type FullHole = NonNullable<Awaited<ReturnType<typeof getHoleBySlug>>>;
export type DraftItem = Awaited<ReturnType<typeof getDraftsByAuthor>>[number];
export type DraftDetail = NonNullable<Awaited<ReturnType<typeof getDraftById>>>;
export type EditableHole = NonNullable<Awaited<ReturnType<typeof getHoleByIdForEdit>>>;