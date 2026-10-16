// Daily horoscopes, Western and Eastern. Just for fun, always positive. Same for everyone on the same day.
export const WEST = [
  ["♈", "Aries", "21 Mar–19 Apr"], ["♉", "Taurus", "20 Apr–20 May"], ["♊", "Gemini", "21 May–20 Jun"], ["♋", "Cancer", "21 Jun–22 Jul"],
  ["♌", "Leo", "23 Jul–22 Aug"], ["♍", "Virgo", "23 Aug–22 Sep"], ["♎", "Libra", "23 Sep–22 Oct"], ["♏", "Scorpio", "23 Oct–21 Nov"],
  ["♐", "Sagittarius", "22 Nov–21 Dec"], ["♑", "Capricorn", "22 Dec–19 Jan"], ["♒", "Aquarius", "20 Jan–18 Feb"], ["♓", "Pisces", "19 Feb–20 Mar"],
];
// Chinese zodiac by year of birth (the year starts at Lunar New Year, late Jan to mid Feb).
export const EAST = [["🐀", "Rat"], ["🐂", "Ox"], ["🐅", "Tiger"], ["🐇", "Rabbit"], ["🐉", "Dragon"], ["🐍", "Snake"], ["🐎", "Horse"], ["🐐", "Goat"], ["🐒", "Monkey"], ["🐓", "Rooster"], ["🐕", "Dog"], ["🐖", "Pig"]];
export const eastYears = i => { const y = new Date().getFullYear(), out = []; for (let k = y - 96; k <= y; k++) if (((k - 4) % 12 + 12) % 12 === i) out.push(k); return out.slice(-5).join(", "); };

const LINES = [
  "Say yes to the small invitation. It turns into the best part of your week.",
  "A quick call to an old friend lifts both your days.",
  "Your patience pays off. Something you've been waiting on starts to move.",
  "Take the long way home today. You'll notice something worth noticing.",
  "A kind word from you lands at exactly the right moment for someone.",
  "Good day to finish the thing you started. The relief is worth it.",
  "Someone local has the answer you need. Ask.",
  "Get outside early. Sunshine and salt air sort out a busy head.",
  "Your sense of humour wins the room today.",
  "Let someone else drive for once. You'll enjoy the view.",
  "A small tidy-up brings a big feeling of calm.",
  "Back yourself. Your gut is right on this one.",
  "Money spent on an experience, not a thing, is money well spent today.",
  "Share a meal. The conversation is the main course.",
  "You're more appreciated than you know. Someone tells you so.",
  "A fresh idea arrives in the shower or on a walk. Write it down.",
  "Slow down at the shops and have a chat. It's a good one.",
  "Help a neighbour and it comes back to you twice.",
  "Rest is productive too. Put your feet up without guilt.",
  "Try the thing you've never tried at the café. New favourite.",
  "A plan comes together faster than you expected.",
  "Your energy is contagious today. Use it for good.",
  "Let go of a small grudge. You'll feel lighter by lunch.",
  "Good news arrives in an ordinary way, an email or a knock on the door.",
  "Be the one who organises the get-together. Everyone's been waiting.",
  "Learn one new thing today. Curiosity suits you.",
  "Say thanks to someone who never hears it. Watch them light up.",
  "Today rewards honesty. Say what you mean, kindly.",
  "A walk by the water clears up a decision.",
  "Back a local business today. Good karma, good coffee.",
  "You're on the right track. Keep going at your own pace.",
  "Laugh at the hiccup. It makes a great story later.",
];
function rng(seed) { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296; }
// Every sign gets a different line each day, and the lines rotate so nobody gets the same one twice in a row.
export function readings(day, kind) {
  const r = rng(kind + day), idx = LINES.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return Array.from({ length: 12 }, (_, i) => ({ text: LINES[idx[i]], lucky: 1 + Math.floor(r() * 45) }));
}
