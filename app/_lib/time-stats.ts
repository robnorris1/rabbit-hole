const statsByMinutes: { maxMins: number; lines: string[] }[] = [
  {
    maxMins: 2,
    lines: [
      'In the time you spent reading this, your eyes made approximately 600 small involuntary movements across the page. You directed none of them consciously. They have already stopped.',
      'Since you started reading, a standard set of traffic lights nearby has completed approximately one full cycle. It is currently on a colour. There is no way to know which one.',
      'You could have tied your shoelaces approximately twice. Over a lifetime this adds up to roughly 5 days.',
      'Your kettle, if switched on at the moment you started reading, would not yet have boiled. It is still going. This post was not long enough.',
      'You could have completed a supermarket self-checkout. Under normal conditions this takes 2 minutes 10 seconds. In the presence of an unexpected item in the bagging area, 4 minutes 30 seconds.',
      'You got through this one. Most people skim. You may have also skimmed. There is no way to verify this.',
    ],
  },
  {
    maxMins: 5,
    lines: [
      'You could have peeled a kilogram of potatoes. They did not exist 8 months ago.',
      'By the time you finished reading this, your body had shed approximately 600 skin cells. They are now on your clothes, your chair, or the immediate surrounding area. This is not a problem. It is just what happened.',
      'You could have made a cup of tea. Over a lifetime, the average British person spends approximately 6 months standing near a kettle.',
      'In the time it took you to read this, the ISS travelled approximately 2,000 kilometres. It is now over a completely different country than when you started. It has no particular opinion about this.',
      'In the time it took you to read this, a standard AA battery in a television remote drained by an amount too small to measure and too real to ignore.',
      'You could have started a journal. Statistically, you would have stopped by Thursday.',
      'You could have sent approximately 40 texts. Each takes 6 seconds to write and about 2 seconds to be read. The replies are not yet in.',
    ],
  },
  {
    maxMins: 9,
    lines: [
      'In the time you spent reading this, light left the sun and reached Earth. This has been happening continuously for approximately 4.6 billion years.',
      'In the time it took you to read this, your heart beat approximately 630 times. It did this without being asked and without acknowledgement. It will do the same again tomorrow, and the day after, until at some point it does not.',
      'You have just used your entire daily average of queueing time. The average person spends 8 minutes a day in queues, totalling approximately 6 months over a lifetime.',
      'By the time you finished reading this, a candle lit at the moment you started had burned down approximately 1.5mm. The wax is now in a slightly different place than it was. No record of its previous position exists.',
      'Somewhere, someone started explaining something at roughly the same time you started reading. They are still explaining it. They are getting to the point.',
      'At some point this stopped being research and became procrastination. The transition was seamless. You did not notice it happen.',
      'You now know more about this than most people ever will. This is either useful or it is a fact about you. Possibly both.',
    ],
  },
  {
    maxMins: 14,
    lines: [
      'Whilst you have been reading this, your body has produced approximately 180 million red blood cells. They will each last around 120 days and then be quietly disposed of. You did not authorise this and were not informed.',
      'During this time, a standard washing machine cycle has advanced by roughly a third. It is now in a phase you could not name if asked. The clothes are fine.',
      'Since you started reading, the earth has travelled approximately 10,000 kilometres further along its orbit. It is now very slightly further into the current season than it was. The difference is not yet detectable by any means available to you.',
      'Since you started reading, the ISS has travelled approximately 4,500 kilometres and is now above a completely different part of the earth. Nobody on board was aware you were reading. This is fine. It is just worth knowing.',
      'You have read approximately 2,000 words. The average person retains about 10% of what they read. You will remember the bit that was least useful.',
      'Somewhere, someone decided to start something at roughly the same time you began reading. They are now 14 minutes into it. You have been reading. Neither of you is wrong.',
      'Your hair grew approximately 0.1mm whilst reading this. This is still undetectable. It did not need to be mentioned. It has been mentioned.',
    ],
  },
  {
    maxMins: 20,
    lines: [
      'You have spent longer reading this than the average person spends eating dinner. Dinner, at least, has an obvious endpoint.',
      'In the time it took you to read this, your stomach lining quietly replaced a portion of itself. It did not notify you. There is no record of what was there before. The process is already underway again.',
      'This is the kind of thing you will describe to someone this week as something you came across. You will not mention how long you spent on it.',
      'At no point during this did your phone notify you of anything important. You checked anyway.',
      'You now know more about this than you did 20 minutes ago. Whether that changes anything is, statistically, unlikely but not impossible.',
      'You finished this. That is not nothing. It is also not something you will put on a list.',
      'At some point in the last 20 minutes you thought about something else entirely. You do not remember what it was. It is gone.',
    ],
  },
  {
    maxMins: Infinity,
    lines: [
      'You could have listened to a Steven Bartlett episode and completely reinvented your relationship with failure.',
      'A standard sourdough takes 24 hours to make, of which approximately 23 hours 50 minutes is waiting. You have completed roughly 1% of one.',
      'Most people who started this did not finish it. You did. This says something about you. It is unclear what.',
      'Most people would have stopped. Most people are fine.',
      'At some point this stopped being casual reading and became a thing you did today.',
      'You have now spent longer reading about this topic than most people will spend thinking about it this year. This either means something or it does not.',
      'In the time it took you to read this, your body shed approximately 1,800 skin cells, produced several billion red blood cells, and quietly got on with things without involving you once. You were busy reading.'
    ],
  },
];

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return h;
}

// Stable per-slug so it doesn't flicker on re-render
export function getTimeStat(readTimeMins: number, slug: string): string {
  const bucket = statsByMinutes.find((b) => readTimeMins <= b.maxMins)!;
  return bucket.lines[hashSlug(slug) % bucket.lines.length];
}
