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
// Start of each sign (month, day), same order as WEST.
const STARTS = [[3, 21], [4, 20], [5, 21], [6, 21], [7, 23], [8, 23], [9, 23], [10, 23], [11, 22], [12, 22], [1, 20], [2, 19]];
export function seasonOf(day) { const [, m, d] = day.split("-").map(Number), v = m * 100 + d; let best = 9, bv = -1;
  STARTS.forEach(([sm, sd], i) => { const x = sm * 100 + sd; if (x <= v && x > bv) { bv = x; best = i; } }); return best; }
const DAY = {
  0: ["Sunday's for slowing down.", "A lazy Sunday suits you.", "Sunday brunch energy.", "Recharge today, the week can wait."],
  1: ["Fresh week, fresh start.", "Monday's on your side.", "Ease into the week.", "New week, clean slate."],
  2: ["Tuesday brings momentum.", "Find your rhythm today.", "A steady Tuesday.", "Quiet progress day."],
  3: ["Halfway through the week.", "Midweek lift.", "Hump day, you've got this.", "Wednesday rewards focus."],
  4: ["Thursday's lining things up.", "Nearly there.", "Good day to get ahead.", "Thursday brings a nudge."],
  5: ["Friday feeling.", "The weekend's in sight.", "Finish the week strong.", "Friday treats are allowed."],
  6: ["Saturday's for fun.", "Weekend mode: on.", "Markets, beach or both.", "Saturday rewards saying yes."],
};
const MOON = ["The new moon favours fresh starts.", "The growing moon backs new plans.", "The first-quarter moon says take action.", "The moon is building towards full, so keep pushing.",
  "Full moon tonight-ish: big feelings, big fun.", "The moon is easing off, so tie up loose ends.", "Last-quarter moon: clear out what you don't need.", "The old moon says rest before the next round."];
export function moonIdx(day) { const age = ((Date.parse(day + "T09:00:00Z") - Date.UTC(2000, 0, 6, 18, 14)) / 864e5) % 29.530588853; return Math.round(age / 29.53 * 8) % 8; }
export const moonLine = day => MOON[moonIdx(day)];
// Every sign gets a different line each day, and the lines rotate so nobody gets the same one twice in a row.
export function readings(day, kind) {
  const r = rng(kind + day), idx = LINES.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const dl = DAY[new Date(day + "T12:00:00Z").getUTCDay()], off = Math.floor(r() * 4);
  return Array.from({ length: 12 }, (_, i) => ({ text: dl[(i + off) % dl.length] + " " + LINES[idx[i]], lucky: 1 + Math.floor(r() * 45) }));
}

// Vedic (Indian, sidereal) signs: the rashi. Dates run about 24 days later than Western signs.
export const VEDIC = [
  ["♈", "Mesha", "Aries", "14 Apr–14 May"], ["♉", "Vrishabha", "Taurus", "15 May–14 Jun"], ["♊", "Mithuna", "Gemini", "15 Jun–15 Jul"], ["♋", "Karka", "Cancer", "16 Jul–16 Aug"],
  ["♌", "Simha", "Leo", "17 Aug–16 Sep"], ["♍", "Kanya", "Virgo", "17 Sep–16 Oct"], ["♎", "Tula", "Libra", "17 Oct–15 Nov"], ["♏", "Vrischika", "Scorpio", "16 Nov–15 Dec"],
  ["♐", "Dhanu", "Sagittarius", "16 Dec–13 Jan"], ["♑", "Makara", "Capricorn", "14 Jan–12 Feb"], ["♒", "Kumbha", "Aquarius", "13 Feb–13 Mar"], ["♓", "Meena", "Pisces", "14 Mar–13 Apr"],
];
const VSTARTS = [[4, 14], [5, 15], [6, 15], [7, 16], [8, 17], [9, 17], [10, 17], [11, 16], [12, 16], [1, 14], [2, 13], [3, 14]];
export function vedicOf(day) { const [, m, d] = day.split("-").map(Number), v = m * 100 + d; let best = 11, bv = -1;
  VSTARTS.forEach(([sm, sd], i) => { const x = sm * 100 + sd; if (x <= v && x > bv) { bv = x; best = i; } }); return best; }
// Chinese elements follow the last digit of the year: 0-1 Metal, 2-3 Water, 4-5 Wood, 6-7 Fire, 8-9 Earth.
export const elementOf = y => ["Metal", "Water", "Wood", "Fire", "Earth"][Math.floor((((y % 10) + 10) % 10) / 2)];
const COLOURS = ["ocean blue", "sunset orange", "rainforest green", "sand gold", "coral pink", "sky blue", "banana yellow", "deep purple", "pearl white", "jacaranda mauve", "lime", "red"];
export const luckyColour = (day, kind, i) => { const r = rng("c" + kind + day + i); return COLOURS[Math.floor(r() * COLOURS.length)]; };
