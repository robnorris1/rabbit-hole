'use server';

import { db } from '@/db';
import { rabbitHoles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/app/_lib/session';
import { getUserByCognitoSub } from '@/db/queries/users';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  const user = await getUserByCognitoSub(session.sub);
  if (!user || user.username !== process.env.ADMIN_USERNAME) return null;
  return user;
}

export async function unpublishHoleAction(holeId: string): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  await db
    .update(rabbitHoles)
    .set({ status: 'draft', publishedAt: null })
    .where(eq(rabbitHoles.id, holeId));

  revalidatePath('/admin');
  revalidatePath('/');
}