import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { TopBar } from '@/app/_components/TopBar';
import { WriteEditor } from '@/app/_components/WriteEditor';
import { getHoleByIdForEdit } from '@/db/queries/holes';
import { requireSession } from '@/app/_lib/session';
import { getUserByCognitoSub } from '@/db/queries/users';

export const metadata: Metadata = { title: 'Write' };

interface Props {
  searchParams: Promise<{ id?: string }>;
}

export default async function WritePage({ searchParams }: Props) {
  const session = await requireSession();
  const [{ id }, currentUser] = await Promise.all([
    searchParams,
    getUserByCognitoSub(session.sub),
  ]);

  const hole = id ? await getHoleByIdForEdit(id) : null;
  if (hole && hole.authorId !== currentUser?.id) redirect('/');

  return (
    <div className="shell">
      <TopBar currentUser={currentUser ? { username: currentUser.username } : null} />
      <WriteEditor hole={hole} />
    </div>
  );
}