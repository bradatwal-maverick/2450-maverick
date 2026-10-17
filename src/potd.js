// ---- Your place today: one photo a day for each postcode, before any news.
// Free-licensed photos from Wikimedia Commons taken within 10 km of the postcode, with the photographer credited.
// Commons' own Quality, Valued and Featured picks come first. No repeats for 60 days. Picked once a day, cached.
const API = "https://commons.wikimedia.org/w/api.php";
const SKIP = /\b(map|maps|logo|diagram|plan|chart|sign|signage|plaque|grave|graves|cemetery|crash|wreck|fire|flood|damage|interior|document|screenshot|coat of arms|flag|memorial|aerial view of construction|roadworks|car park|parking)\b/i;
const strip = s => String(s || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const tidyTitle = t => t.replace(/^File:/, "").replace(/\.[a-z]{3,4}$/i, "").replace(/[_-]+/g, " ").replace(/\s*\(\d+\)$/, "").replace(/\b(IMG|DSC|DSCN|P\d{6,})\s*\d*\b/gi, "").replace(/\s+/g, " ").trim();
function seed(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

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

async function search(lat, lon, UA) {
  const q = new URLSearchParams({ action: "query", format: "json", generator: "geosearch", ggscoord: `${lat}|${lon}`, ggsradius: "10000", ggslimit: "200", ggsnamespace: "6",
    prop: "imageinfo|categories", iiprop: "url|size|extmetadata", iiurlwidth: "1400", iiextmetadatafilter: "Artist|LicenseShortName|LicenseUrl|ObjectName",
    clcategories: "Category:Quality images|Category:Featured pictures on Wikimedia Commons|Category:Valued images", cllimit: "max", origin: "*" });
  const r = await fetch(`${API}?${q}`, { headers: UA, cf: { cacheTtl: 3600 } });
  if (!r.ok) return {};
  return (await r.json())?.query?.pages || {};
}

// Today's photo for one postcode (cached a day). Returns null if Commons has nothing suitable nearby.
export async function photoOfDay(env, pc, town, home, day, UA) {
  const k = `potd:${pc}:${day}`, hit = await env.DATA.get(k, "json");
  if (hit) return hit.none ? null : hit;
  const rk = `potd:recent:${pc}`, recent = (await env.DATA.get(rk, "json")) || [];
  let pick = null;
  try { pick = pickPhoto(await search(town.lat, town.lon, UA), recent, pc + day)
    || (home ? pickPhoto(await search(home.lat, home.lon, UA), recent, pc + day) : null); } catch (e) { pick = null; }
  await env.DATA.put(k, JSON.stringify(pick || { none: 1 }), { expirationTtl: pick ? 2 * 86400 : 3 * 3600 });
  if (pick) await env.DATA.put(rk, JSON.stringify([pick.title, ...recent].slice(0, 60)));
  return pick;
}
