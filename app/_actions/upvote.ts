'use server';

import { getSession } from '@/app/_lib/session';
import { getUserByCognitoSub } from '@/db/queries/users';
import { toggleUpvote } from '@/db/queries/upvotes';

export type UpvoteResult = { voted: boolean; upvoteCount: number; error?: string };

export async function toggleUpvoteAction(holeId: string): Promise<UpvoteResult> {
  const session = await getSession();
  if (!session) return { voted: false, upvoteCount: 0, error: 'sign-in' };

  const user = await getUserByCognitoSub(session.sub);
  if (!user) return { voted: false, upvoteCount: 0, error: 'sign-in' };

  const result = await toggleUpvote(user.id, holeId);
  return result;
}