// ---- Emergency wait now: NSW Health's own live emergency department figures (the same data as
// emergencywait.health.nsw.gov.au, refreshed by NSW Health about every 15 minutes). Shown as NSW Health has it:
// people assessed by a triage nurse and waiting for treatment, and how many usually wait at this hour. Cached 5 min.
const API = "https://rted-web-external.citc.health.nsw.gov.au/api/";
export const ED_SRC = "https://www.emergencywait.health.nsw.gov.au/";
// Nearest emergency departments that report wait times, for each Daily Maverick.
export const ED_IDS = { "2450": [46], "2454": [46], "2481": [109, 183], "2485": [183, 136], "2430": [123], "2444": [152], "2350": [2] };
// Local hospitals whose emergency department doesn't report wait times to NSW Health.
const QUIET = { "2454": "Bellingen River District Hospital", "2481": "Byron District Hospital" };

const HDR = { accept: "application/json", "user-agent": "Mozilla/5.0 (compatible; TheDailyMaverick/1.0; +https://2450-maverick.live)", referer: ED_SRC, origin: "https://www.emergencywait.health.nsw.gov.au" };
async function one(id, errs) {
  const r = await fetch(API + "GetHospitalDetails/" + id, { headers: HDR, cf: { cacheTtl: 300 } }); if (!r.ok) { errs.push(id + ": HTTP " + r.status); return null; }
  const j = await r.json(), h = j.hospitalDetails?.[0], w = j.waitingDetails?.[0]; if (!h || !w) return null;
  const usual = (j.historicalDetails || []).find(x => x.statisticIdentifier === "usual_patients")?.statisticValue;
  return { name: h.hospitalName, phone: h.phone, wait: w.waitCount, usual: usual ?? null, at: w.lastUpdatedDate ? w.lastUpdatedDate.replace(/Z?$/, "Z") : null };
}

export async function edData(env, region) {
  const ids = ED_IDS[region]; if (!ids) return null;
  const k = `ed2:${region}`, hit = await env.DATA.get(k, "json"); if (hit) return hit;
  let list = [], errs = []; try { list = (await Promise.all(ids.map(id => one(id, errs).catch(e => { errs.push(id + ": " + String(e).slice(0, 120)); return null; })))).filter(Boolean); } catch (e) { list = []; }
  const out = { list, quiet: QUIET[region] || "", at: new Date().toISOString(), errs };
  await env.DATA.put(k, JSON.stringify(out), { expirationTtl: list.length ? 300 : 60 });
  return out;
}

const tm = iso => new Date(iso).toLocaleTimeString("en-AU", { timeZone: "Australia/Sydney", hour: "numeric", minute: "2-digit" });
export function edBlock(d, esc) {
  if (!d) return "";
  const row = h => { const busy = h.usual != null ? (h.wait > h.usual * 1.3 ? "Busier than usual" : h.wait < h.usual * 0.7 ? "Quieter than usual" : "About usual") : "";
    return `<li class="edr"><div class="edbig"><span class="edw">${h.wait}</span><span class="edwl">waiting right now</span></div>
<div class="edsub">${h.usual != null ? `Usually ${h.usual} at this time${busy ? ` · <b>${busy}</b>` : ""}` : ""}</div>
<div class="edname"><b>${esc(h.name)}</b>${h.phone ? ` · <a href="tel:${esc(h.phone.replace(/\s/g, ""))}">${esc(h.phone)}</a>` : ""}${h.at ? `<br><small class="mute">NSW Health figure from ${esc(tm(h.at))}</small>` : ""}</div></li>`; };
  return `<section id="ed"><h2>🏥 Emergency wait now</h2>
${d.list.length ? `<ul class="edl">${d.list.map(row).join("")}</ul>` : `<p class="mute">NSW Health's live figures aren't coming through right now.</p>`}
<p class="mute">The number already assessed by a triage nurse and waiting for treatment. The most seriously ill are always seen first. <b>In an emergency call <a href="tel:000">000</a>.</b></p>
${d.quiet ? `<p class="mute">${esc(d.quiet)} doesn't report wait times to NSW Health.</p>` : ""}
<p>Not sure you need emergency? Call <b>healthdirect</b> on <a href="tel:1800022222">1800 022 222</a>, 24/7, to talk to a registered nurse.</p>
<p class="src"><span class="srcw">Source:</span> <a href="${ED_SRC}" rel="noopener">NSW Health Emergency Department Waiting Times</a></p>
<style>.edl{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}.edr{padding:12px;border:1px solid var(--line);border-radius:14px;text-align:center}.edbig{display:flex;flex-direction:column;align-items:center}.edw{font-size:3rem;font-weight:800;line-height:1}.edwl{font-size:1rem;font-weight:bold;margin-top:2px}.edsub{font-size:.85rem;color:var(--mute);margin:4px 0 8px}.edname{font-size:.85rem}</style></section>`;
}
