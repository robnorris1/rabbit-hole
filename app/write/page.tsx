import type { Metadata } from 'next';
import { TopBar } from '@/app/_components/TopBar';
import { WriteEditor } from '@/app/_components/WriteEditor';
import { getDraftById } from '@/db/queries/holes';
import { requireSession } from '@/app/_lib/session';
import { getUserByCognitoSub } from '@/db/queries/users';

export const metadata: Metadata = { title: 'Write — rabbithole' };

interface Props {
  searchParams: Promise<{ id?: string }>;
}

export default async function WritePage({ searchParams }: Props) {
  const session = await requireSession();
  const [{ id }, currentUser] = await Promise.all([
    searchParams,
    getUserByCognitoSub(session.sub),
  ]);
  const draft = id ? await getDraftById(id) : null;

  return (
    <div className="shell">
      <TopBar currentUser={currentUser ? { username: currentUser.username } : null} />
      <WriteEditor draft={draft} />
    </div>
  );
}