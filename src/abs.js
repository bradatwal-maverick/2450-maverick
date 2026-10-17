// ---- Your area in numbers: official ABS (Australian Bureau of Statistics) figures for the council area, from the free ABS Data API.
// Estimated resident population (yearly, latest year) and Census 2021 selected medians. Cached in KV for a week; the last good copy
// is kept if the ABS beta service is down. We only show the figures as the ABS publishes them, with the date and a link. ----
const API = "https://data.api.abs.gov.au/rest/data";
// ABS LGA codes (stable across 2021 and 2025 boundaries for these councils), checked against the API on 18 Oct 2026.
export const LGA = { "2450": "11800", "2481": "11350", "2454": "10600", "2485": "17550", "2430": "15240", "2350": "10180", "2444": "16380" };
// Census 2021 G02 (selected medians and averages) MEDAVG codes, in the ABS table's column order.
const G02 = { 1: "age", 2: "income", 3: "mortgage", 4: "household", 5: "family", 6: "rent", 7: "bedroom", 8: "hhsize" };
// Fallback (fetched from the API 18 Oct 2026), so the block never shows empty while the cache warms up.
const SNAP = {
  "11800": { pop: [[2020, 78409], [2025, 82109]], med: { age: 44, income: 688, mortgage: 1685, household: 1363, family: 1733, rent: 375, hhsize: 2.4 } },
  "11350": { pop: [[2025, 38784]] }, "10600": { pop: [[2025, 13348]] }, "17550": { pop: [[2025, 101044]] },
  "15240": { pop: [[2025, 99448]] }, "10180": { pop: [[2025, 29652]] }, "16380": { pop: [[2025, 92432]] },
};

// SDMX-JSON (dimensionAtObservation=AllDimensions) -> [{dimId: valueId, ..., v}]
function obs(j) {
  const d = j.data || j, ds = (d.dataSets || [])[0], dims = (d.structure || (d.structures || [])[0] || {}).dimensions.observation;
  return Object.entries(ds.observations || {}).map(([k, val]) => {
    const o = { v: val[0] }; k.split(":").forEach((ix, i) => { o[dims[i].id] = dims[i].values[+ix].id; }); return o; });
}
async function get(path) {
  const r = await fetch(`${API}/${path}${path.includes("?") ? "&" : "?"}dimensionAtObservation=AllDimensions&format=jsondata`,
    { headers: { Accept: "application/vnd.sdmx.data+json", "User-Agent": "DailyMaverick/1.0 (community site)" } });
  if (!r.ok) throw new Error("ABS " + r.status);
  return obs(await r.json());
}

export async function refreshABS(env, code) {
  const lga = LGA[code]; if (!lga) return;
  const old = await env.DATA.get("abs:" + lga, "json");
  if (old && Date.now() - new Date(old.tried) < 7 * 864e5) return;
  const out = { ...(old || {}), tried: new Date().toISOString() };
  try {
    const yr = new Date().getFullYear(); let rows = [];
    for (const y of [yr, yr - 1]) { // the dataflow name carries the boundary year; use the newest one published
      try { rows = await get(`ABS_ANNUAL_ERP_LGA${y}/ERP.3.TOT.${lga}.LGA${y}.A?startPeriod=${y - 6}`); if (rows.length) break; } catch (e) {}
    }
    if (rows.length) { out.pop = rows.map(o => [+o.TIME_PERIOD, +o.v]).sort((a, b) => a[0] - b[0]); out.asof = out.tried; }
  } catch (e) {}
  try {
    const rows = await get(`C21_G02_LGA/.${lga}...`), med = {};
    rows.forEach(o => { const k = G02[o.MEDAVG]; if (k) med[k] = +o.v; });
    if (Object.keys(med).length) out.med = med;
  } catch (e) {}
  await env.DATA.put("abs:" + lga, JSON.stringify(out));
}

export async function absBlock(env, code, R, esc, fresh) {
  const lga = LGA[code]; if (!lga) return "";
  let d = null; try { d = await env.DATA.get("abs:" + lga, "json"); } catch (e) {}
  const s = SNAP[lga] || {}, pop = (d && d.pop && d.pop.length ? d.pop : s.pop) || [], med = (d && d.med) || s.med;
  if (!pop.length && !med) return "";
  const n = x => Math.round(x).toLocaleString("en-AU"), $ = x => "$" + n(x);
  const tile = (ico, big, small) => `<div class="tile"><span class="ico">${ico}</span><b>${esc(big)}</b><small>${esc(small)}</small></div>`;
  const [ly, lv] = pop[pop.length - 1] || [], [fy, fv] = pop.filter(p => ly - p[0] >= 5).pop() || pop[0] || [];
  const t = [];
  if (lv) t.push(tile("👥", n(lv), `people, ${ly}`));
  if (lv && fv && fy !== ly) { const g = (lv / fv - 1) * 100; t.push(tile(g >= 0 ? "📈" : "📉", (g >= 0 ? "+" : "") + g.toFixed(1) + "%", `since ${fy} (${g >= 0 ? "+" : ""}${n(lv - fv)} people)`)); }
  if (med) {
    if (med.age) t.push(tile("🎂", med.age, "median age"));
    if (med.household) t.push(tile("💵", $(med.household), "median household income a week"));
    if (med.rent) t.push(tile("🏠", $(med.rent), "median rent a week"));
    if (med.mortgage) t.push(tile("🏦", $(med.mortgage), "median mortgage a month"));
    if (med.hhsize) t.push(tile("🛋️", med.hhsize, "people per household, on average"));
  }
  const area = R.council.name.replace(/ (City |Regional |Shire )?Council$/, "").replace(/^Council of the /, "");
  return `<h3>📊 ${esc(area)} in numbers</h3>${R.status ? `<p>🏙️ <b>Town or city?</b> ${esc(R.status)}</p>` : ""}<div class="tiles">${t.join("")}</div>
<p class="src">${fresh(d && d.asof)}Figures for the whole ${esc(R.council.name)} area, from the <a href="https://www.abs.gov.au/statistics/people/population/regional-population/latest-release" rel="noopener">ABS (Australian Bureau of Statistics)</a>: population is the ABS estimate for 30 June ${ly || ""}${med ? `; ages, incomes, rent and households are from the <a href="https://abs.gov.au/census/find-census-data/quickstats/2021/LGA${lga}" rel="noopener">2021 Census</a>` : ""}. Shown as the ABS publishes them.</p>`;
}
