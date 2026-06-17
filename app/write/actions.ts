'use server';

import { db } from '@/db';
import { rabbitHoles } from '@/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { requireSession } from '@/app/_lib/session';
import { getUserByCognitoSub } from '@/db/queries/users';
import { getPublishedHoleCountByAuthor } from '@/db/queries/holes';

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .slice(0, 60)
    .replace(/^-+|-+$/g, '');
}

async function getAuthor(): Promise<{ id: string }> {
  const session = await requireSession();
  const user = await getUserByCognitoSub(session.sub);
  if (!user) throw new Error('User not found');
  return user;
}

async function getAuthorId(): Promise<string> {
  return (await getAuthor()).id;
}

export async function saveDraft(
  holeId: string | null,
  data: { title: string; body: string; tags: string[] },
): Promise<{ id: string }> {
  const authorId = await getAuthorId();

  if (holeId) {
    await db
      .update(rabbitHoles)
      .set({ title: data.title, body: data.body, tags: data.tags, updatedAt: new Date() })
      .where(and(eq(rabbitHoles.id, holeId), eq(rabbitHoles.authorId, authorId)));
    return { id: holeId };
  }

  const [row] = await db
    .insert(rabbitHoles)
    .values({ authorId, title: data.title || 'Untitled', body: data.body, tags: data.tags })
    .returning({ id: rabbitHoles.id });
  return { id: row.id };
}

export async function publishHole(holeId: string): Promise<void> {
  const authorId = await getAuthorId();

  const rows = await db
    .select({ title: rabbitHoles.title, body: rabbitHoles.body })
    .from(rabbitHoles)
    .where(and(eq(rabbitHoles.id, holeId), eq(rabbitHoles.authorId, authorId)))
    .limit(1);
  const hole = rows[0];
  if (!hole) throw new Error('Draft not found');

  const wordCount = hole.body.trim().split(/\s+/).filter(Boolean).length;
  const readTimeMins = Math.max(1, Math.round(wordCount / 250));

  const baseSlug = toSlug(hole.title) || 'untitled';
  let slug = baseSlug;
  let attempt = 0;
  while (true) {
    const existing = await db
      .select({ id: rabbitHoles.id })
      .from(rabbitHoles)
      .where(and(eq(rabbitHoles.slug, slug), ne(rabbitHoles.id, holeId)))
      .limit(1);
    if (existing.length === 0) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  await db
    .update(rabbitHoles)
    .set({ slug, readTimeMins, status: 'published', publishedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(rabbitHoles.id, holeId), eq(rabbitHoles.authorId, authorId)));

  const publishedCount = await getPublishedHoleCountByAuthor(authorId);
  redirect(`/holes/${slug}${publishedCount === 1 ? '?first=1' : ''}`);
}