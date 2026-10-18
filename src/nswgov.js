// ---- NSW Government help: rebates, travel help, vouchers and services regional locals often don't know about.
// Every item from the NSW Government's own page (linked, with the date it was checked). We source, we don't advise.
import LIST from "./nswgov.json";

const CATS = [["Health", "🩺"], ["Money and bills", "💡"], ["Family and kids", "👪"], ["Housing and renting", "🏠"], ["Seniors", "🧓"], ["Getting around", "🚗"], ["Emergencies", "🚨"], ["Small business", "🏪"], ["Your records", "📄"]];
// ---- Live licence check, through the shared nsw-api gateway (NSW Government registers on API.NSW).
// Alphabetical. Lotteries left out on purpose (no gambling). Strata and training providers use a different API shape: not yet.
export const REGS = [
  ["asbestos", "Asbestos & demolition licences"],
  ["building_design", "Building & design practitioners"],
  ["conveyancing", "Conveyancers"],
  ["high_risk_work", "High risk work licences"],
  ["hbc", "Home Building Compensation (insurance)"],
  ["liquor", "Liquor licences"],
  ["motor", "Motor dealers & repairers"],
  ["owner_builder", "Owner builder permits"],
  ["pharmacies", "Pharmacies"],
  ["property", "Property & real estate agents"],
  ["security", "Security licences"],
  ["trades", "Tradies (home building licences)"],
  ["traffic_control", "White cards & traffic control"],
];
const pick = (o, re) => { for (const k of Object.keys(o)) if (re.test(k) && o[k] != null && typeof o[k] !== "object" && String(o[k]).trim()) return String(o[k]).trim(); return ""; };
const firstArray = j => { if (Array.isArray(j)) return j; if (j && typeof j === "object") for (const v of Object.values(j)) { const a = firstArray(v); if (a && a.length && typeof a[0] === "object") return a; } return null; };
// Quota-safe: each register + search is fetched once a day and kept in KV.
export async function nswCheckApi(req, env, nswApi) {
  const u = new URL(req.url), reg = u.searchParams.get("reg") || "", q = (u.searchParams.get("q") || "").trim().slice(0, 60);
  const R = REGS.find(r => r[0] === reg);
  if (!R) return Response.json({ error: "Pick a register" }, { status: 400 });
  if (q.length < 3) return Response.json({ error: "Type at least 3 letters or a licence number" }, { status: 400 });
  const key = `nswcheck:${reg}:${q.toLowerCase()}`, c = env.DATA && await env.DATA.get(key, "json");
  if (c) return Response.json(c);
  const isNum = /^[\w-]*\d[\w-]*$/.test(q) && !/\s/.test(q);
  const path = isNum ? `/${reg}/verify?licenceNumber=${encodeURIComponent(q)}` : `/${reg}/browse?searchText=${encodeURIComponent(q)}`;
  try {
    const r = await nswApi(env, path);
    if (!r.ok) return Response.json({ error: r.status === 404 ? "none" : "unreachable" });
    const j = await r.json(), list = firstArray(j) || (j && typeof j === "object" && !Array.isArray(j) ? [j] : []);
    const rows = list.slice(0, 15).map(o => ({
      name: pick(o, /licensee|holder|business|trading|^name$|fullname|entity|pharmacy|premises|company/i) || pick(o, /name/i),
      num: pick(o, /licen[cs]e.?(number|no)$|^licen[cs]enumber|permit.?(number|no)|certificate.?(number|no)|registration.?(number|no)|^number$/i),
      type: pick(o, /licen[cs]e.?type|class|category|^type$/i),
      status: pick(o, /status/i),
      expiry: pick(o, /expir/i),
      where: [pick(o, /suburb|locality|town/i), pick(o, /postcode/i)].filter(Boolean).join(" "),
    })).filter(x => x.name || x.num);
    const out = { reg: R[1], rows, asof: new Date().toISOString() };
    if (env.DATA) await env.DATA.put(key, JSON.stringify(out), { expirationTtl: 86400 });
    return Response.json(out);
  } catch (e) { return Response.json({ error: "unreachable" }); }
}
const checkBlock = esc => `<section id="check" class="nck"><h2>✅ Check a licence</h2>
<p class="mute">Before you hire a tradie, agent or conveyancer, check they're licensed. Live from the NSW Government's own registers.</p>
<select id="nckr" aria-label="Which register">${REGS.map(([k, l]) => `<option value="${k}"${k === "trades" ? " selected" : ""}>${esc(l)}</option>`).join("")}</select>
<input id="nckq" type="search" placeholder="Name, business or licence number" autocomplete="off" aria-label="Name, business or licence number">
<button type="button" id="nckb">Check</button>
<div id="ncko" class="mute"></div>
<p class="src"><span class="srcw">Source:</span> <a href="https://api.nsw.gov.au" rel="noopener">NSW Government registers (API.NSW)</a>. We show what the register says, nothing more. For the official record, use <a href="https://www.service.nsw.gov.au/transaction/check-a-licence" rel="noopener">Service NSW licence check</a>.</p>
<style>.nck{border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:8px 0 18px}.nck select,.nck input{width:100%;font-size:1rem;padding:10px 12px;border:1px solid var(--line);border-radius:10px;margin:4px 0;box-sizing:border-box;background:var(--bg,#fff);color:inherit}.nck button{font-size:1rem;padding:10px 18px;border-radius:10px;margin:4px 0 8px}.nckl{list-style:none;padding:0;margin:6px 0}.nckl li{padding:8px 0;border-bottom:1px solid var(--line)}.nckok{color:#1a7f37}.nckno{color:#b42318}</style>
<script>(function(){var r=document.getElementById('nckr'),q=document.getElementById('nckq'),b=document.getElementById('nckb'),o=document.getElementById('ncko');
function e(s){return String(s||'').replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function go(){var v=q.value.trim();if(v.length<3){o.textContent='Type at least 3 letters or a licence number.';return}o.className='mute';o.textContent='Checking the register…';
fetch('/api/nswcheck?reg='+encodeURIComponent(r.value)+'&q='+encodeURIComponent(v)).then(function(x){return x.json()}).then(function(j){
if(j.error==='unreachable'){o.textContent='Couldn’t reach the NSW register just now. Try again soon.';return}
if(j.error&&j.error!=='none'){o.textContent=j.error;return}
if(!j.rows||!j.rows.length){o.innerHTML='Nothing found on the <b>'+e(r.options[r.selectedIndex].text)+'</b> register for “'+e(v)+'”. Check the spelling, or try the licence number.';return}
o.className='';o.innerHTML='<ul class="nckl">'+j.rows.map(function(x){var ok=/current|active|valid|granted/i.test(x.status),bad=/expired|cancel|suspend|revok|refused|lapsed/i.test(x.status);
return '<li><b>'+e(x.name||x.num)+'</b>'+(x.status?' <span class="'+(ok?'nckok':bad?'nckno':'')+'">'+(ok?'✅ ':bad?'⚠️ ':'')+e(x.status)+'</span>':'')+'<br><span class="mute">'+[x.num&&('Licence '+e(x.num)),e(x.type),x.expiry&&('Expires '+e(String(x.expiry).slice(0,10))),e(x.where)].filter(Boolean).join(' · ')+'</span></li>'}).join('')+'</ul><p class="mute">'+j.rows.length+' result'+(j.rows.length>1?'s':'')+(j.rows.length>=15?' (first 15, narrow your search)':'')+'.</p>';
}).catch(function(){o.textContent='Couldn’t reach the NSW register just now. Try again soon.'})}
b.onclick=go;q.onkeydown=function(ev){if(ev.key==='Enter')go()}})()</script></section>`;
const slug = c => c.toLowerCase().replace(/[^a-z]+/g, "-").replace(/-$/, "");

export function nswPage({ esc, page, R, fresh }) {
  return (url) => {
    const pc = (url.searchParams.get("pc") || R.code).replace(/\D/g, "").slice(0, 4);
    const item = x => `<li class="hn"><b>${esc(x.name)}</b><br>${esc(x.what)}${x.who ? `<br><small class="mute">Who: ${esc(x.who)}</small>` : ""}
${x.phone ? `<br><a class="hnum" href="tel:${esc(x.phone.replace(/[^\d+]/g, ""))}">📞 ${esc(x.phone)}</a>` : ""}
<p class="src">${fresh ? fresh(x.checked) : ""}<span class="srcw">Source:</span> <a href="${esc(x.url)}" rel="noopener">${esc(x.srcName || "NSW Government")}</a> · checked ${esc(x.checked)}</p></li>`;
    const groups = CATS.map(([c, i]) => [c, i, LIST.filter(x => x.cat === c)]).filter(([, , xs]) => xs.length);
    return page("NSW Government help", `<p class="mute"><a href="/${pc}">‹ ${esc(pc)}</a></p><h1>🏛️ NSW Government help</h1>
<p>Check a licence live, plus rebates, travel help, vouchers and services regional locals often don't know they can get. All in one place.</p>
${checkBlock(esc)}<h2>🧾 Help you can get</h2>
<input id="hnq" type="search" placeholder="🔎 Type what you need, e.g. rebate, travel, bond, seniors" autocomplete="off" aria-label="Search NSW Government help">
<p id="hnnone" class="mute" hidden>No match. Clear the search to see everything.</p>
${groups.map(([c, i, xs]) => `<details class="hng" id="${slug(c)}"><summary>${i} ${esc(c)} <span class="hnc">${xs.length}</span></summary><ul class="hnl">${xs.map(item).join("")}</ul></details>`).join("")}
<p class="mute hnfoot">Every item is from the NSW Government's own page, linked under it. We don't decide who's eligible: the page does. Programs change, so if one's wrong, <a href="/feedback">tell us</a>. Need a hand in person? Call Service NSW on <a href="tel:137788">13 77 88</a>.</p>
<style>#hnq{width:100%;font-size:1rem;padding:10px 12px;border:1px solid var(--line);border-radius:10px;margin:6px 0 12px;box-sizing:border-box}.hng{border-bottom:1px solid var(--line)}.hng>summary{cursor:pointer;list-style:none;padding:12px 2px;font-weight:bold;font-size:1.05rem;display:flex;align-items:center;gap:8px}.hng>summary::-webkit-details-marker{display:none}.hng>summary::after{content:"+";margin-left:auto;color:var(--mute);font-weight:normal}.hng[open]>summary::after{content:"–"}.hnc{font-weight:normal;font-size:.8rem;color:var(--mute);background:var(--soft);border-radius:999px;padding:1px 8px}.hnl{list-style:none;padding:0;margin:0 0 8px}.hn{padding:10px 0;border-bottom:1px solid var(--line)}.hn .src,.hn small{font-size:.78rem}.hnfoot{margin-top:14px;font-size:.8rem}</style>
<script>(function(){var q=document.getElementById('hnq'),none=document.getElementById('hnnone'),G=[].slice.call(document.querySelectorAll('.hng'));
var h=location.hash.slice(1),t=h&&document.getElementById(h);if(t&&t.tagName==='DETAILS')t.open=true;
G.forEach(function(g){[].slice.call(g.querySelectorAll('.hn')).forEach(function(li){li.dataset.q=(li.textContent+' '+g.querySelector('summary').textContent).toLowerCase()})});
q.oninput=function(){var v=q.value.trim().toLowerCase(),any=false;G.forEach(function(g){var hit=0;[].slice.call(g.querySelectorAll('.hn')).forEach(function(li){var ok=!v||li.dataset.q.indexOf(v)>-1;li.hidden=!ok;if(ok)hit++});g.hidden=!!v&&!hit;g.open=!!v&&hit>0;if(hit)any=true});none.hidden=!v||any}})()</script>`, pc,
      { desc: "Check a NSW licence live, plus NSW Government rebates, travel help, vouchers and services regional locals often don't know about, each from the official page." });
  };
}
