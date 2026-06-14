'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/app/_lib/session';
import { getUserByCognitoSub, getUserByUsername } from '@/db/queries/users';
import { toggleFollow } from '@/db/queries/follows';

export async function toggleFollowAction(targetUsername: string): Promise<void> {
  const session = await requireSession();
  const [viewer, target] = await Promise.all([
    getUserByCognitoSub(session.sub),
    getUserByUsername(targetUsername),
  ]);
  if (!viewer || !target || viewer.id === target.id) return;
  await toggleFollow(viewer.id, target.id);
  revalidatePath(`/u/${targetUsername}`);
}