// ---- Newspaper-style side photos: a smaller photo beside a section, like the front page of a paper.
// Same rules as Your place today (src/potd.js): only free-licensed Wikimedia Commons photos (CC BY, CC BY-SA, CC0
// or public domain) taken within 10 km of the postcode, photographer and licence credited under every one.
// Each section only gets a photo that matches it (a beach shot for Beaches, a jetty for Tides). No match, no photo.
// Wikimedia only serves standard thumbnail widths (250, 500, 960, 1280…); anything else fails to load.
// Picked once a day per postcode, cached, never the same as today's big photo.
import { search, candidates, shape } from "./potd.js";

export const THEMES = [
  ["beaches", /\b(beach|beaches|surf|waves|headland|shore|sand)\b/i],
  ["sea", /\b(jetty|harbour|marina|boat|boats|pier|estuary|river|creek|lagoon|island|fishing|breakwall)\b/i],
  ["kids", /\b(forest|falls|waterfall|rainforest|lookout|park|walk|track|trail|gorge|reserve|national park|boardwalk)\b/i],
  ["dogs", /\b(beach|park|reserve|headland)\b/i],
  ["events", /\b(festival|market|markets|show|parade|carnival|concert|fair)\b/i],
  ["love", /./], // last: any good photo left over
];
const strip = s => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
const textOf = ({ p, i }) => p.title + " " + strip(i.extmetadata?.ObjectName?.value) + " " + strip(i.extmetadata?.ImageDescription?.value);
function seed(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

// { sectionId: photo } for one postcode today.
export async function sidePics(env, pc, town, day, UA) {
  const k = `spics2:${pc}:${day}`, hit = await env.DATA.get(k, "json");
  if (hit) return hit;
  const hero = await env.DATA.get(`potd3:${pc}:${day}`, "json"), recent = (await env.DATA.get(`potd:recent:${pc}`, "json")) || [];
  let out = {};
  try {
    const c = candidates(await search(town.lat, town.lon, UA), [hero?.title, ...recent].filter(Boolean));
    const used = new Set();
    for (const [id, re] of THEMES) {
      const fit = c.filter(x => !used.has(x.p.title) && re.test(textOf(x)));
      if (!fit.length) continue;
      const top = fit.slice(0, 8), x = top[seed(pc + day + id) % top.length];
      used.add(x.p.title);
      const ph = shape(x);
      out[id] = { ...ph, src: String(ph.src).replace(/\/\d+px-/, "/500px-"), w: 500, h: Math.round(500 * ph.h / ph.w) };
    }
  } catch (e) { out = {}; }
  await env.DATA.put(k, JSON.stringify(out), { expirationTtl: Object.keys(out).length ? 2 * 86400 : 3 * 3600 });
  return out;
}

// Slot each photo in under its section's heading.
export function withPics(pics, html, esc) {
  for (const [id, ph] of Object.entries(pics || {})) {
    const fig = `<figure class="sidepic"><a href="${esc(ph.page)}" rel="noopener" data-noutm><img src="${esc(ph.src)}" width="${ph.w}" height="${ph.h}" alt="${esc(ph.caption)}" loading="lazy" decoding="async"></a>
<figcaption>${esc(ph.caption)}<small>Photo: ${esc(ph.artist)} · ${ph.licenseUrl ? `<a href="${esc(ph.licenseUrl)}" rel="noopener license" data-noutm>${esc(ph.license)}</a>` : esc(ph.license)} · <a href="${esc(ph.page)}" rel="noopener" data-noutm>Wikimedia Commons</a></small></figcaption></figure>`;
    html = html.replace(new RegExp(`(<section id="${id}"[^>]*>\\s*<h2[^>]*>[\\s\\S]*?</h2>)`), `$1${fig}`);
  }
  return html;
}

export const SIDE_CSS = `.sidepic{float:right;width:38%;max-width:300px;margin:4px 0 10px 16px;border-radius:12px;overflow:hidden;background:var(--soft)}.sidepic img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover}.sidepic figcaption{padding:6px 10px 8px;font-size:.85rem;line-height:1.35}.sidepic small{display:block;font-size:.7rem;color:var(--mute);margin-top:2px}section:has(>.sidepic){display:flow-root}@media(max-width:560px){.sidepic{float:none;width:100%;max-width:none;margin:6px 0 10px}.sidepic img{aspect-ratio:16/9}}`;
