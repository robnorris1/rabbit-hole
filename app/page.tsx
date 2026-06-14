import { getFeed, getDeepNow } from '@/db/queries/holes';
import { getSession } from './_lib/session';
import { getUserByCognitoSub } from '@/db/queries/users';
import { FeedPage } from './_components/FeedPage';

export default async function Page() {
  const [holes, deep, session] = await Promise.all([getFeed(), getDeepNow(), getSession()]);
  const currentUser = session ? await getUserByCognitoSub(session.sub) : null;
  return (
    <FeedPage
      holes={holes}
      deep={deep}
      currentUser={currentUser ? { username: currentUser.username } : null}
    />
  );
}