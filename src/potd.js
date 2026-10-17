// ---- Your place today: one photo a day for each postcode, before any news.
// Free-licensed photos from Wikimedia Commons taken within 10 km of the postcode, with the photographer credited.
// Commons' own Quality, Valued and Featured picks come first. No repeats for 60 days. Picked once a day, cached.
const API = "https://commons.wikimedia.org/w/api.php";
const SKIP = /\b(map|maps|logo|diagram|plan|chart|sign|signage|plaque|grave|graves|cemetery|crash|wreck|fire|flood|damage|interior|document|screenshot|coat of arms|flag|memorial|aerial view of construction|roadworks|car park|parking)\b/i;
const strip = s => String(s || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const tidyTitle = t => t.replace(/^File:/, "").replace(/\.[a-z]{3,4}$/i, "").replace(/[_-]+/g, " ").replace(/\s*\(\d+\)$/, "").replace(/\b(IMG|DSC|DSCN|P\d{6,})\s*\d*\b/gi, "").replace(/\s+/g, " ").trim();
function seed(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

// Postcard test: reward the views that make locals proud, punish ordinary street and building shots.
const WOW = /\b(beach|beaches|sunrise|sunset|dawn|dusk|headland|head|point|cape|lookout|view|views|vista|panorama|panoramic|falls|waterfall|cascade|rainforest|forest|gorge|island|islands|bay|cove|lagoon|lake|river|creek|estuary|mountain|mount|mt|range|valley|plateau|surf|waves|ocean|sea|coast|coastline|reef|whale|whales|dolphin|dolphins|koala|kangaroo|bird|birds|lighthouse|jetty|pier|harbour|rainbow|storm clouds|milky way|stars|night sky|wildflowers|national park|nature reserve|skywalk|boardwalk|rock pool|rock pools)\b/gi;
const DULL = /\b(street|st|road|rd|avenue|ave|highway|hwy|intersection|roundabout|lane|drive|building|buildings|house|houses|home|shop|shops|store|shopping|centre|center|plaza|mall|hotel|motel|pub|club|bank|post office|office|station|school|hospital|church|hall|court|courthouse|library|museum|council|chambers|factory|warehouse|car|cars|bus|truck|train|railway|bridge|overpass|carpark|construction|development|estate|subdivision|apartment|apartments|units|signpost|street view|streetscape|footpath|cbd|interior|inside|exterior|facade|façade|entrance|gate)\b/gi;
const hits = (re, s) => (s.match(re) || []).length;
export function score(p) { const i = p.imageinfo?.[0] || {}, s = tidyTitle(p.title) + " " + strip(i.extmetadata?.ObjectName?.value);
  return (p.categories?.length ? 4 : 0) + Math.min(3, hits(WOW, s)) * 3 - hits(DULL, s) * 4 + (i.width >= 3000 ? 1 : 0); }

const RATE = `You're the photo editor of a good-news local paper. Would this photo make locals proud of where they live, like a postcard? Score it 1 to 10.
10 = stunning: a beach, sunrise or sunset, a view from a lookout, a waterfall, rainforest, wildlife, dramatic sky.
1 = dull: an ordinary street, a building, a shop front, a car park, a road, a sign, a blurry or dark photo.
Reply with ONLY the number.`;
async function rate(env, url, UA) {
  try { const r = await fetch(url, { headers: UA }); if (!r.ok) return 0; const buf = await r.arrayBuffer(); if (buf.byteLength > 1.5e6) return 0;
    const model = "@cf/meta/llama-3.2-11b-vision-instruct", ask = { messages: [{ role: "user", content: RATE }], image: [...new Uint8Array(buf)], max_tokens: 5 };
    let out; try { out = await env.AI.run(model, ask); } catch (e) { if (/agree/i.test(String(e))) { await env.AI.run(model, { prompt: "agree" }); out = await env.AI.run(model, ask); } else throw e; }
    return Math.min(10, +(String(out?.response || "").match(/\d+/)?.[0] || 0));
  } catch (e) { return 0; } }
const small = u => String(u || "").replace(/\/(\d+)px-/, "/500px-"); // standard Wikimedia width only

export function candidates(pages, recent = []) {
  return Object.values(pages || {}).map(p => ({ p, i: p.imageinfo?.[0] })).filter(({ p, i }) => i && /jpe?g$/i.test(p.title)
    && i.width >= 1200 && i.width >= i.height * 1.15 && !SKIP.test(p.title) && !SKIP.test(strip(i.extmetadata?.ObjectName?.value))
    && /^(CC|Public domain|PD)/i.test(i.extmetadata?.LicenseShortName?.value || "") && !recent.includes(p.title))
    .map(x => ({ ...x, s: score(x.p) })).filter(x => x.s >= 3).sort((a, b) => b.s - a.s || a.p.title.localeCompare(b.p.title));
}
export const shape = ({ p, i }) => { const m = i.extmetadata || {}, name = strip(m.ObjectName?.value) || tidyTitle(p.title);
  return { title: p.title, src: i.thumburl || i.url, w: i.thumbwidth || i.width, h: i.thumbheight || i.height, page: i.descriptionurl,
    caption: name.length > 90 ? name.slice(0, 87) + "…" : name, artist: (strip(m.Artist?.value) || "Unknown photographer").slice(0, 60),
    license: strip(m.LicenseShortName?.value), licenseUrl: m.LicenseUrl?.value || "" }; };

// Best of the bunch: the top keyword-scored shots (rotated daily), then the AI scores up to 4 and the best 7+ wins.
export async function pickBest(env, pages, recent, salt, UA) {
  const c = candidates(pages, recent); if (!c.length) return null;
  const top = c.slice(0, 10), start = seed(salt) % top.length, look = [...top.slice(start), ...top.slice(0, start)].slice(0, 4);
  if (!env.AI) return shape(look[0]);
  const rated = await Promise.all(look.map(async x => ({ x, r: await rate(env, small(x.i.thumburl || x.i.url), UA) })));
  rated.sort((a, b) => b.r - a.r || b.x.s - a.x.s);
  return rated[0].r >= 7 ? { ...shape(rated[0].x), wow: rated[0].r } : null;
}

export function pickPhoto(pages, recent = [], salt = "") {
  const ok = Object.values(pages || {}).map(p => ({ p, i: p.imageinfo?.[0] })).filter(({ p, i }) => i && /jpe?g$/i.test(p.title)
    && i.width >= 1200 && i.width >= i.height * 1.15 && !SKIP.test(p.title) && !SKIP.test(strip(i.extmetadata?.ObjectName?.value))
    && /^(CC|Public domain|PD)/i.test(i.extmetadata?.LicenseShortName?.value || "") && !recent.includes(p.title));
  if (!ok.length) return null;
  const best = ok.filter(({ p }) => p.categories?.length), pool = (best.length >= 2 ? best : ok).sort((a, b) => a.p.title.localeCompare(b.p.title));
  const { p, i } = pool[seed(salt) % pool.length], m = i.extmetadata || {};
  const name = strip(m.ObjectName?.value) || tidyTitle(p.title);
  return { title: p.title, src: i.thumburl || i.url, w: i.thumbwidth || i.width, h: i.thumbheight || i.height, page: i.descriptionurl,
    caption: name.length > 90 ? name.slice(0, 87) + "…" : name, artist: (strip(m.Artist?.value) || "Unknown photographer").slice(0, 60),
    license: strip(m.LicenseShortName?.value), licenseUrl: m.LicenseUrl?.value || "" };
}

export async function search(lat, lon, UA) {
  const q = new URLSearchParams({ action: "query", format: "json", generator: "geosearch", ggscoord: `${lat}|${lon}`, ggsradius: "10000", ggslimit: "500", ggsnamespace: "6",
    prop: "imageinfo|categories", iiprop: "url|size|extmetadata", iiurlwidth: "1280", iiextmetadatafilter: "Artist|LicenseShortName|LicenseUrl|ObjectName|ImageDescription",
    clcategories: "Category:Quality images|Category:Featured pictures on Wikimedia Commons|Category:Valued images", cllimit: "max", origin: "*" });
  const r = await fetch(`${API}?${q}`, { headers: UA, cf: { cacheTtl: 3600 } });
  if (!r.ok) return {};
  return (await r.json())?.query?.pages || {};
}

// Today's photo for one postcode (cached a day). Returns null if Commons has nothing suitable nearby.
export async function photoOfDay(env, pc, town, home, day, UA) {
  const k = `potd3:${pc}:${day}`, hit = await env.DATA.get(k, "json");
  if (hit) return hit.none ? null : hit;
  const rk = `potd:recent:${pc}`, recent = (await env.DATA.get(rk, "json")) || [];
  let pick = null;
  try { pick = await pickBest(env, await search(town.lat, town.lon, UA), recent, pc + day, UA)
    || (home ? await pickBest(env, await search(home.lat, home.lon, UA), recent, pc + day, UA) : null); } catch (e) { pick = null; }
  await env.DATA.put(k, JSON.stringify(pick || { none: 1 }), { expirationTtl: pick ? 2 * 86400 : 3 * 3600 });
  if (pick) await env.DATA.put(rk, JSON.stringify([pick.title, ...recent].slice(0, 60)));
  return pick;
}
