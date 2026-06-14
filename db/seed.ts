import { db } from './index.ts';
import { users, rabbitHoles } from './schema.ts';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('Seeding...');

  const [author] = await db
    .insert(users)
    .values({
      cognitoSub: 'local-seed-user',
      username: 'rob',
      email: 'rob@example.com',
      bio: 'Founder. Goes down rabbit holes for a living.',
    })
    .onConflictDoNothing()
    .returning();

  const seedUser = author ?? (await db.select().from(users).where(eq(users.cognitoSub, 'local-seed-user')))[0];
  if (!seedUser) {
    console.error('Could not find or create seed user.');
    process.exit(1);
  }

  await db.delete(rabbitHoles).where(eq(rabbitHoles.authorId, seedUser.id));

  await db.insert(rabbitHoles).values([
    {
      authorId: seedUser.id,
      title: 'The bird that decided winter simply wasn\'t for it',
      slug: 'bird-that-decided-winter-wasnt-for-it',
      spark: 'A throwaway line in a nature doc: one bird sees more daylight in a year than any other animal alive. I needed to know which, and why.',
      body: `The Arctic tern migrates pole to pole, chasing summer in both hemispheres — roughly 70,000 km a year, the long way round.

What I didn't realise until I went looking is that this isn't just a long journey. It's the longest regular migration of any animal on earth, and they've been doing it for millions of years before anyone bothered to track them.

The first time scientists attached tiny geolocators to terns to record the full route, in 2010, they found the birds weren't taking the direct path. They were making a figure-of-eight loop across the Atlantic, stopping to feed in nutrient-rich upwelling zones off the coast of West Africa, then continuing south.

A bird that weighs about as much as a small chocolate bar, completing a round trip roughly equivalent to three trips to the moon over a lifetime.

What gets me is the stubbornness of it. The Arctic summer is extraordinary — constant daylight, abundant fish. The tern refuses to give that up. So it chases it to the other end of the planet instead.`,
      tags: ['birds', 'migration', 'the-long-way-round'],
      readTimeMins: 12,
      status: 'published' as const,
      featured: true,
      upvoteCount: 1284,
      publishedAt: new Date('2026-05-01'),
    },
    {
      authorId: seedUser.id,
      title: 'The clockmaker who solved a problem the Royal Society couldn\'t',
      slug: 'clockmaker-who-solved-longitude',
      spark: 'Found out sailors used to die not from storms but from not knowing how far east they were. A self-taught carpenter fixed it.',
      body: `The longitude problem killed people. Thousands of them. Ships would set out from England knowing exactly how far north or south they were, but with no reliable way of knowing how far east or west. They ran into rocks that weren't supposed to be there. They missed islands. They got lost and ran out of water.

The solution, everyone agreed, was accurate timekeeping. If you know exactly what time it is in London, and you observe local noon (when the sun is highest), the difference tells you your longitude. The problem was that no clock in existence could survive six weeks on a pitching, humid ship and stay accurate to within seconds.

John Harrison, a Yorkshire carpenter with no formal training, spent forty years solving this. His H1 through H4 watches are obsessive objects — H1 is the size of a grandfather clock, made almost entirely of wood to avoid rust, with interlocking counterweight mechanisms to compensate for the ship's motion. H4 is a pocket watch. The engineering leap between them is staggering.

He was given the £20,000 Longitude Prize — the largest scientific prize in history at that point — but only after decades of obstruction from the Astronomer Royal, who was convinced the answer had to be astronomical rather than mechanical. Harrison was 80.`,
      tags: ['history', 'horology', 'spite'],
      readTimeMins: 16,
      status: 'published' as const,
      upvoteCount: 942,
      publishedAt: new Date('2026-05-10'),
    },
    {
      authorId: seedUser.id,
      title: 'Why a Pringle is the exact shape it is, and why that\'s genius',
      slug: 'why-a-pringle-is-the-shape-it-is',
      spark: 'Stacked the can, noticed they never crack. Started reading. Did not stop for an hour.',
      body: `It's a hyperbolic paraboloid — the one shape that's structurally rigid while curved in two directions simultaneously, so the stack distributes load without snapping.

The geometry matters because a flat crisp would slide around unpredictably in a cylindrical can. A sphere would stack perfectly but be impossible to manufacture consistently and would shatter on impact. The Pringle shape is a mathematical compromise: it curves upward in one direction and downward in another, which means adjacent crisps nest perfectly, creating a stable column.

The shape is used in architecture too. The Dulles Airport roof in Washington DC uses the same principle — a hyperbolic paraboloid in concrete, which allows a huge span without internal supports. Same maths as a snack.

Procter & Gamble spent years developing the exact parabolic mould and figuring out how to get a wet potato mixture to set into that shape during frying without warping. The uniformity you take for granted when you open a can is the result of engineering that took longer to develop than the first personal computers.

The tube, incidentally, was designed to get as many crisps as possible into the smallest shipping volume. The shape came first; the tube was designed around it.`,
      tags: ['maths', 'snacks', 'geometry'],
      readTimeMins: 8,
      status: 'published' as const,
      upvoteCount: 738,
      publishedAt: new Date('2026-05-18'),
    },
    {
      authorId: seedUser.id,
      title: 'The deepest hole humans ever dug, and why they stopped',
      slug: 'deepest-hole-humans-ever-dug',
      spark: 'Wikipedia at 1am. "Deepest artificial point on Earth." That was the end of my evening.',
      body: `The Kola Superdeep Borehole reached 12.2 km before the rock got so hot it behaved like plastic. They found water where there shouldn't be any.

The Soviet Union started drilling in 1970. The stated goal was scientific — understand the composition of the continental crust — but the real motivation was Cold War one-upmanship. The Americans had tried a similar project in the early 1960s, the Mohole project, drilling through the ocean floor. It was cancelled. The Soviets saw an opening.

At 12 km, the drill bit was encountering temperatures around 180°C. The rock under those conditions doesn't behave like hard material anymore — it flows slowly, closing back around the drill hole as fast as the bit could advance. They stopped in 1992 when the Soviet Union collapsed, not because they'd reached any natural limit, but because the money ran out.

The strangest finding was mineralised water at depths where it shouldn't exist — water that had been trapped in the rock for billions of years and bore almost no resemblance to surface water. And microfossils. Single-celled organisms, 6 km down, in 2-billion-year-old rock.

The borehole is now sealed with a metal cap. If you went there today you'd find a rusted installation and a lid bolted to the ground over a hole that took 22 years to make.`,
      tags: ['geology', 'soviet-engineering', 'the-literal-rabbit-hole'],
      readTimeMins: 14,
      status: 'published' as const,
      upvoteCount: 1103,
      publishedAt: new Date('2026-05-25'),
    },
    {
      authorId: seedUser.id,
      title: 'The man who accidentally invented the microwave',
      slug: 'man-who-accidentally-invented-microwave',
      spark: 'Percy Spencer was standing next to a magnetron in 1945 when the chocolate bar in his pocket melted. Most people would have been annoyed.',
      body: `Spencer was a radar engineer at Raytheon, working with magnetrons — the devices that generate microwaves for radar systems. What he'd noticed was that microwaves from the magnetron had cooked the chocolate. Within weeks he was pointing a magnetron at popcorn kernels and watching them explode across the lab.

The first commercial microwave oven, the Radarange, was released in 1947. It was 1.8 metres tall, weighed 340kg, and cost the equivalent of about £38,000 today. It was mostly used in restaurants and ships. The domestic version didn't arrive until the late 1960s.

What I keep thinking about is the mindset. Spencer didn't see an accident — he saw a question. The leap from "my chocolate melted" to "I wonder what else this would do to food" is the entire gap between a curious person and everyone else.

Raytheon didn't initially know what to do with the discovery. Spencer apparently just started experimenting on his own time, cooking eggs and other foods, until someone senior noticed and they decided to patent it.

The patent is from 1950. It describes the process in beautifully dry technical language. Nothing in it mentions the exploding chocolate bar.`,
      tags: ['invention', 'radar', 'happy-accidents'],
      readTimeMins: 4,
      status: 'published' as const,
      upvoteCount: 512,
      publishedAt: new Date('2026-06-01'),
    },
  ]);

  console.log('Done. 5 rabbit holes seeded.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});