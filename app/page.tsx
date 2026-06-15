import { getFeed, getDeepNow } from '@/db/queries/holes';
import { getSession } from './_lib/session';
import { getUserByCognitoSub } from '@/db/queries/users';
import { getUpvotedHoleIds } from '@/db/queries/upvotes';
import { FeedPage } from './_components/FeedPage';

export default async function Page() {
  const [holes, deep, session] = await Promise.all([getFeed(), getDeepNow(), getSession()]);
  const currentUser = session ? await getUserByCognitoSub(session.sub) : null;
  const votedIds = currentUser ? await getUpvotedHoleIds(currentUser.id) : [];
  return (
    <FeedPage
      holes={holes}
      deep={deep}
      currentUser={currentUser ? { username: currentUser.username } : null}
      votedIds={votedIds}
    />
  );
}