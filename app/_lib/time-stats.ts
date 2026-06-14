const statsByMinutes: { maxMins: number; lines: string[] }[] = [
  {
    maxMins: 2,
    lines: [
      "Quick one. You've spent longer queuing for coffee.",
      'Shorter than most adverts. Suspicious, really.',
      "That's two minutes of your life. You seem fine with that.",
    ],
  },
  {
    maxMins: 5,
    lines: [
      'Your food delivery would have arrived by now.',
      'A goldfish has forgotten nine things since you started reading.',
      "In that time you could have replied to that email you've been ignoring.",
    ],
  },
  {
    maxMins: 9,
    lines: [
      'You could have watched half an episode of something forgettable.',
      'In that time, someone, somewhere started and quit a new gym routine.',
      "That's the same time it takes Jeff Bezos to earn £4,200. You chose this.",
    ],
  },
  {
    maxMins: 14,
    lines: [
      'You could have watched 1.5 episodes of Friends instead.',
      'This took the same amount of time as the average 5k run. They are fitter than you now.',
      "That's how long it takes to hard-boil an egg. You could have had breakfast.",
    ],
  },
  {
    maxMins: Infinity,
    lines: [
      "You've been here long enough that your laptop screen probably dimmed. Worth it.",
      "That's a full episode of something. You chose to read about this instead. Respect.",
      'Most people would have given up. Most people are fine.',
    ],
  },
];

// Stable per-slug so it doesn't flicker on re-render — takes first char of slug as seed
export function getTimeStat(readTimeMins: number, slug: string): string {
  const bucket = statsByMinutes.find((b) => readTimeMins <= b.maxMins)!;
  const seed = slug.charCodeAt(0) % bucket.lines.length;
  return bucket.lines[seed];
}