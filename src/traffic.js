// ---- Roads now: Transport for NSW's own Live Traffic feeds (open data, attributed), filtered to near this town.
// Crashes and incidents, roadwork, floods, fires on roads and major events. Shown as Live Traffic NSW has it. Cached 10 min.
const BASE = "https://www.livetraffic.com/traffic/hazards/";
export const TRAFFIC_SRC = "https://www.livetraffic.com";
const LICENCE = "https://opendata.transport.nsw.gov.au/dataset/live-traffic-hazards";
const FEEDS = [["incident", "🚧"], ["flood", "🌊"], ["fire", "🔥"], ["majorevent", "🎪"], ["roadwork", "🦺"]];
const km = (a, b, c, d) => { const r = Math.PI / 180, x = Math.sin((c - a) * r / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin((d - b) * r / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); };
const tidy = s => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
// Live Traffic writes in capitals: make it readable, but keep known acronyms and road codes (ITF, NSW, M1) as they are.
const SMALL = /^(of|and|the|to|at|on|in|for|by|a|an|or|via|near)$/i;
const KEEP = /^(ITF|NSW|SES|RFS|CBD|TAFE|NRL|AFL|UNE|RMS|TFNSW|QLD|ACT|NPWS|[AMB]\d+)$/;
const cap = s => tidy(s).split(" ").map((w, i) => KEEP.test(w) ? w : (i && SMALL.test(w)) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

export async function trafficNear(env, home, radius = 40) {
  const k = `traffic2:${home.lat.toFixed(2)},${home.lon.toFixed(2)}`, hit = await env.DATA.get(k, "json"); if (hit) return hit;
  const items = [];
  await Promise.all(FEEDS.map(async ([f, icon]) => {
    try {
      const r = await fetch(BASE + f + ".json", { headers: { accept: "application/json" }, cf: { cacheTtl: 300 } }); if (!r.ok) return;
      for (const ft of (await r.json()).features || []) {
        const p = ft.properties || {}, g = ft.geometry?.coordinates; if (!g || p.ended) continue;
        const d = km(home.lat, home.lon, g[1], g[0]); if (d > radius) continue;
        const rd = (p.roads || [])[0] || {};
        items.push({ icon, kind: f, title: cap(p.displayName || p.headline || p.mainCategory), road: tidy(rd.mainStreet), place: cap(rd.suburb), km: Math.round(d), major: !!p.isMajor, at: p.lastUpdated || p.created || null });
      }
    } catch (e) { }
  }));
  const order = { incident: 0, flood: 1, fire: 2, majorevent: 3, roadwork: 4 };
  items.sort((a, b) => order[a.kind] - order[b.kind] || a.km - b.km);
  const out = { items: items.slice(0, 25), n: items.length, at: new Date().toISOString() };
  await env.DATA.put(k, JSON.stringify(out), { expirationTtl: 600 });
  return out;
}

const when = ms => ms ? new Date(ms).toLocaleString("en-AU", { timeZone: "Australia/Sydney", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "";
export function trafficList(d, esc, max = 8) {
  if (!d) return `<p class="mute">Live Traffic NSW isn't coming through right now.</p>`;
  const src = `<p class="src"><span class="srcw">Source:</span> <a href="${TRAFFIC_SRC}" rel="noopener">Live Traffic NSW</a> (Transport for NSW, <a href="${LICENCE}" rel="noopener">open data</a>)</p>`;
  if (!d.items.length) return `<p>✅ Nothing listed on the roads within 40 km right now.</p>${src}`;
  const live = d.items.filter(x => x.kind !== "roadwork"), works = d.items.filter(x => x.kind === "roadwork");
  const li = x => `<li><span aria-hidden="true">${x.icon}</span> <b>${esc(x.title)}</b>${x.road || x.place ? `: ${esc([x.road, x.place].filter(Boolean).join(", "))}` : ""} <small class="mute">${x.km} km away${x.at ? " · updated " + esc(when(x.at)) : ""}</small></li>`;
  return `${live.length ? `<ul class="trl">${live.slice(0, max).map(li).join("")}</ul>` : `<p>✅ No crashes, floods or fires listed on roads within 40 km.</p>`}
${works.length ? `<details><summary>🦺 Roadwork nearby (${works.length})</summary><ul class="trl">${works.slice(0, 15).map(li).join("")}</ul></details>` : ""}
${src}<style>.trl{list-style:none;padding:0}.trl li{padding:5px 0;border-bottom:1px solid var(--line)}</style>`;
}
