import { getFeed, getPublishedHoleCount, getTotalUpvoteCount } from '@/db/queries/holes';
import { getSession } from './_lib/session';
import { getUserByCognitoSub } from '@/db/queries/users';
import { getUpvotedHoleIds, getWeeklyHoleIds } from '@/db/queries/upvotes';
import { FeedPage } from './_components/FeedPage';

interface Props {
  searchParams: Promise<{ welcome?: string }>;
}

export default async function Page({ searchParams }: Props) {
  const { welcome } = await searchParams;
  const [holes, session, weeklyHoleIds, holeCount, totalUpvotes] = await Promise.all([getFeed(), getSession(), getWeeklyHoleIds(), getPublishedHoleCount(), getTotalUpvoteCount()]);
  const currentUser = session ? await getUserByCognitoSub(session.sub) : null;
  const votedIds = currentUser ? await getUpvotedHoleIds(currentUser.id) : [];
  return (
    <FeedPage
      holes={holes}
      currentUser={currentUser ? { username: currentUser.username } : null}
      votedIds={votedIds}
      weeklyHoleIds={weeklyHoleIds}
      showWelcome={welcome === '1'}
      holeCount={holeCount}
      totalUpvotes={totalUpvotes}
    />
  );
}