// Daily crossword: picks words from a clue bank (general Aussie + the town's own), lays them out
// criss-cross style, the same puzzle for everyone on the same day. No outside service needed.

export const GENERAL = [
  ["WHALE", "Humpbacks pass the coast every winter"], ["BEACH", "Where the sand meets the sea"], ["JETTY", "Walk out over the water on it"],
  ["PELICAN", "Big-billed bird waiting for fish scraps"], ["DOLPHIN", "Pod member you might see from the headland"],
  ["MARKETS", "Weekend stalls"], ["PAVLOVA", "Meringue dessert both Aussies and Kiwis claim"], ["VEGEMITE", "Black spread on toast"],
  ["THONGS", "Aussie footwear (not underwear)"], ["SUNSCREEN", "Slop it on before the beach"], ["BARBIE", "Where the snags get cooked"],
  ["ESKY", "Keeps the drinks cold"], ["ARVO", "Afternoon, Aussie style"], ["KOALA", "Eucalyptus eater (not a bear)"],
  ["KOOKABURRA", "Laughing bird"], ["WOMBAT", "Burrowing marsupial with cube-shaped poo"], ["CRICKET", "Summer bat-and-ball game"],
  ["FOOTY", "Winter's favourite game"], ["NETBALL", "Court game with goal shooters"], ["RAINFOREST", "Wet, green and ancient forest"],
  ["TIDE", "Comes in, goes out"], ["SWELL", "Surfers check it every morning"], ["MANGO", "Summer stone fruit"], ["AVOCADO", "Smashed on toast"],
  ["LAMINGTON", "Sponge cake in chocolate and coconut"], ["BILLABONG", "Waterhole in a famous song"], ["SEAGULL", "Chip thief"],
  ["MOZZIE", "Summer bloodsucker"], ["BOOMERANG", "Throw it and it comes back"], ["CUPPA", "Cup of tea"], ["BREKKIE", "First meal of the day"],
  ["RIPPER", "Excellent, in Aussie slang"], ["LOLLY", "Sweet treat"], ["SERVO", "Petrol station"], ["BOTTLO", "Where you buy a slab"],
  ["AMBO", "Paramedic"], ["TRADIE", "Plumber or chippy"], ["SPARKY", "Electrician"], ["MATE", "Friend"], ["SUNRISE", "Early start over the ocean"],
  ["LIFESAVER", "Volunteer in red and yellow"], ["FLAGS", "Swim between them"], ["SANDBAR", "Shallow spot that makes the waves break"],
  ["UMBRELLA", "Shade on the sand"], ["PICNIC", "Lunch on a blanket"], ["LIBRARY", "Free books, free wifi"], ["POSTCODE", "Four digits that say where you live"],
];

// Medium: everyday general knowledge, Aussie flavour.
export const MEDIUM = [
  ["CANBERRA", "Australia's capital"], ["ULURU", "Red rock in the heart of the NT"], ["PLATYPUS", "Egg-laying mammal with a duck-like bill"], ["ECHIDNA", "Spiny egg-laying anteater"],
  ["DINGO", "Wild dog of the outback"], ["MAGPIE", "Swoops in spring"], ["CASSOWARY", "Helmeted bird of the far north's rainforest"], ["GOANNA", "Big lizard of the bush"],
  ["JACARANDA", "Purple bloom of late spring"], ["WATTLE", "Golden national flower"], ["BANKSIA", "Native shrub with cone-like flowers"], ["WARATAH", "NSW floral emblem"],
  ["TASMANIA", "The island state"], ["DARWIN", "Top End capital"], ["HOBART", "Southernmost state capital"], ["OUTBACK", "Remote inland Australia"],
  ["DROUGHT", "Long dry spell"], ["MONSOON", "Wet-season wind of the north"], ["CYCLONE", "Tropical storm"], ["TELESCOPE", "Stargazer's tool"],
  ["ORBIT", "Path around a planet"], ["GALAXY", "The Milky Way, for one"], ["COMET", "Icy visitor with a tail"], ["VOLCANO", "Mountain that can erupt"],
  ["GLACIER", "River of ice"], ["HARBOUR", "Sheltered water for boats"], ["LIGHTHOUSE", "Tower that warns ships"], ["ANCHOR", "Holds a boat in place"],
  ["SNORKEL", "Breathing tube for swimmers"], ["KAYAK", "Paddle craft"], ["CORAL", "Reef builder"], ["OYSTER", "Shellfish that can hold a pearl"],
  ["PRAWN", "Shrimp, to an Aussie"], ["MACADAMIA", "Native nut"], ["PUMPKIN", "Orange veg for soup"], ["DAMPER", "Bush bread"],
  ["BILLY", "Bush kettle"], ["SWAG", "Bush bedroll"], ["UTE", "Work vehicle with a tray"], ["DUNNY", "Outdoor toilet, Aussie style"],
  ["BLUDGER", "Lazy so-and-so"], ["GALAH", "Pink-and-grey cockatoo, or a fool"], ["DROVER", "Moves cattle long distances"], ["SHEARER", "Takes the wool off"],
  ["STATION", "Huge outback farm"], ["BUSHFIRE", "Summer danger"], ["ANZAC", "Remembered every 25 April"], ["FEDERATION", "What happened to the colonies in 1901"],
  ["CONVICT", "Early, unwilling settler"], ["MARATHON", "42.195 km race"], ["OLYMPICS", "Games held every four years"], ["SURFING", "Riding waves"],
  ["ROWING", "Oar sport"], ["TENNIS", "The Australian Open's sport"], ["CHESS", "Game of kings and queens"], ["SUDOKU", "Number puzzle on a 9x9 grid"],
  ["ORCHESTRA", "Strings, brass, woodwind and percussion together"], ["PIANO", "It has 88 keys"], ["GUITAR", "Six strings"], ["DIDGERIDOO", "Ancient wind instrument"],
];
// Hard: tougher words and trickier clues.
export const HARD = [
  ["ARCHIPELAGO", "Chain of islands"], ["ESTUARY", "Where the river meets the tide"], ["ESCARPMENT", "Steep slope at a plateau's edge"], ["HEADLAND", "Point of land jutting into the sea"],
  ["MANGROVE", "Tree rooted in salty tidal mud"], ["TSUNAMI", "Wave set off by an undersea quake"], ["EQUINOX", "Day and night of equal length"], ["SOLSTICE", "Longest or shortest day"],
  ["MERIDIAN", "Line of longitude"], ["LATITUDE", "Distance north or south of the equator"], ["ISOBAR", "Weather-map line of equal pressure"], ["ALBATROSS", "Wandering seabird, or three under par"],
  ["MARSUPIAL", "Pouched mammal"], ["MONOTREME", "Egg-laying mammal group"], ["NOCTURNAL", "Active at night"], ["CHLOROPHYLL", "Green pigment in leaves"],
  ["NEBULA", "Cloud of gas and dust in space"], ["ECLIPSE", "One body blocks another's light"], ["APOGEE", "Farthest point from Earth in an orbit"], ["SONNET", "Fourteen-line poem"],
  ["HAIKU", "Seventeen-syllable poem"], ["PALINDROME", "Reads the same backwards"], ["ANAGRAM", "Word from rearranged letters"], ["SATIRE", "Humour that mocks the powerful"],
  ["EPHEMERAL", "Lasting a very short time"], ["UBIQUITOUS", "Found everywhere"], ["LACONIC", "Using few words, like a true-blue Aussie"], ["PRAGMATIC", "Practical over idealistic"],
  ["SERENDIPITY", "Happy accident"], ["NOSTALGIA", "Wistful longing for the past"], ["CANDOUR", "Frankness"], ["BREVITY", "Shortness, the soul of wit"],
  ["CATALYST", "Something that sparks change"], ["SCEPTIC", "Doubter"], ["MAVERICK", "Independent thinker who breaks the mould"], ["JUGGERNAUT", "Unstoppable force"],
  ["ZEITGEIST", "Spirit of the age"], ["QUIXOTIC", "Idealistic but unrealistic"], ["BYZANTINE", "Overly complicated"], ["FILIBUSTER", "Talking to delay a vote"],
  ["HANSARD", "Record of what's said in Parliament"], ["PLEBISCITE", "Public vote that doesn't change the Constitution"], ["REFERENDUM", "Vote to change the Constitution"],
  ["GALLIPOLI", "1915 Dardanelles campaign"], ["KOKODA", "Track fought along in 1942"], ["EUREKA", "1854 Ballarat stockade"], ["ENDEAVOUR", "Cook's ship"],
  ["TAPESTRY", "Woven picture"], ["MOSAIC", "Picture made of small tiles"], ["FRESCO", "Painting on wet plaster"], ["SOPRANO", "Highest singing voice"],
  ["CRESCENDO", "Gradual build in loudness"], ["STACCATO", "Short, detached notes"], ["SYMPHONY", "Large orchestral work"], ["TRIATHLON", "Swim, cycle, run"],
  ["DECATHLON", "Ten-event contest"], ["VELODROME", "Cycling track"], ["PERIHELION", "Closest point to the Sun in an orbit"],
];
// Levels: which words, how many, how long, how big the grid can get, and how much help you get.
export const LEVELS = {
  easy: { name: "Easy", emoji: "🟢", want: 7, min: 3, max: 7, maxW: 10, banks: ["general", "town"], firstLetters: true, showWrong: true },
  medium: { name: "Medium", emoji: "🟡", want: 10, min: 4, max: 10, maxW: 13, banks: ["general", "town", "medium"], firstLetters: false, showWrong: true },
  hard: { name: "Hard", emoji: "🔴", want: 12, min: 5, max: 11, maxW: 15, banks: ["medium", "hard", "town"], firstLetters: false, showWrong: false },
};

// Small seeded random so everyone gets the same puzzle on the same day.
function rng(seed) { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296; }

export function buildCrossword(bank, seed, want = 8, o = {}) {
  let best = null; const maxW = o.maxW || 12;
  for (let k = 0; k < 60; k++) { const x = build1(bank, seed + ":" + k, want, o.min, o.max); const w = Math.max(x.grid.length, x.grid[0].length);
    if (x.clues.length >= want - 1 && w <= maxW) return x; if (!best || w < best.w) best = { ...x, w }; }
  return best;
}
function build1(bank, seed, want, min = 3, max = 11) {
  const rand = rng(seed), words = bank.map(([w, c]) => [w.toUpperCase().replace(/[^A-Z]/g, ""), c]).filter(([w]) => w.length >= min && w.length <= max);
  for (let i = words.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [words[i], words[j]] = [words[j], words[i]]; }
  const N = 21, g = Array.from({ length: N }, () => Array(N).fill("")), placed = [];
  const at = (r, c) => (r < 0 || c < 0 || r >= N || c >= N ? "" : g[r][c]);
  const fits = (w, r, c, d) => {
    const dr = d === "down" ? 1 : 0, dc = d === "down" ? 0 : 1; let cross = 0;
    if (at(r - dr, c - dc) || at(r + dr * w.length, c + dc * w.length)) return -1;
    for (let i = 0; i < w.length; i++) {
      const rr = r + dr * i, cc = c + dc * i; if (rr < 0 || cc < 0 || rr >= N || cc >= N) return -1;
      const cur = g[rr][cc];
      if (cur) { if (cur !== w[i]) return -1; cross++; }
      else if (at(rr + dc, cc + dr) || at(rr - dc, cc - dr)) return -1; // no touching side by side
    }
    return cross;
  };
  const put = (w, clue, r, c, d) => { for (let i = 0; i < w.length; i++) g[r + (d === "down" ? i : 0)][c + (d === "down" ? 0 : i)] = w[i]; placed.push({ w, clue, r, c, d }); };
  for (const [w, clue] of words) {
    if (placed.length >= want) break;
    if (!placed.length) { put(w, clue, 10, Math.floor((N - w.length) / 2), "across"); continue; }
    let best = null;
    for (const p of placed) for (let i = 0; i < p.w.length; i++) for (let j = 0; j < w.length; j++) {
      if (p.w[i] !== w[j]) continue;
      const d = p.d === "across" ? "down" : "across", r = p.d === "across" ? p.r - j : p.r + i, c = p.d === "across" ? p.c + i : p.c - j;
      const x = fits(w, r, c, d); if (x > 0 && (!best || x > best.x || (x === best.x && rand() < 0.3))) best = { r, c, d, x };
    }
    if (best) put(w, clue, best.r, best.c, best.d);
  }
  // Trim to the used area and number the clues the newspaper way (top to bottom, left to right).
  let r0 = N, r1 = 0, c0 = N, c1 = 0;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (g[r][c]) { r0 = Math.min(r0, r); r1 = Math.max(r1, r); c0 = Math.min(c0, c); c1 = Math.max(c1, c); }
  const starts = placed.map(p => ({ ...p, r: p.r - r0, c: p.c - c0 })).sort((a, b) => a.r - b.r || a.c - b.c);
  const nums = {}; let n = 0;
  for (const p of starts) { const k = p.r + "," + p.c; if (!nums[k]) nums[k] = ++n; p.n = nums[k]; }
  const grid = []; for (let r = r0; r <= r1; r++) grid.push(g[r].slice(c0, c1 + 1).map(x => x || null));
  return { grid, nums, clues: starts };
}
