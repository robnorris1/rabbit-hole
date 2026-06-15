import { getFeed } from '@/db/queries/holes';
import { getSession } from './_lib/session';
import { getUserByCognitoSub } from '@/db/queries/users';
import { getUpvotedHoleIds, getWeeklyHoleIds } from '@/db/queries/upvotes';
import { FeedPage } from './_components/FeedPage';

export default async function Page() {
  const [holes, session, weeklyHoleIds] = await Promise.all([getFeed(), getSession(), getWeeklyHoleIds()]);
  const currentUser = session ? await getUserByCognitoSub(session.sub) : null;
  const votedIds = currentUser ? await getUpvotedHoleIds(currentUser.id) : [];
  return (
    <FeedPage
      holes={holes}
      currentUser={currentUser ? { username: currentUser.username } : null}
      votedIds={votedIds}
      weeklyHoleIds={weeklyHoleIds}
    />
  );
}