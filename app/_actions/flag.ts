'use server';

import { getSession } from '@/app/_lib/session';
import { getUserByCognitoSub } from '@/db/queries/users';
import { flagHole } from '@/db/queries/flags';

export async function flagHoleAction(
  holeId: string,
  reason: string,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: 'sign-in' };
  const user = await getUserByCognitoSub(session.sub);
  if (!user) return { error: 'sign-in' };
  await flagHole(user.id, holeId, reason);
  return {};
}