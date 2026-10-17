// ---- NSW Government help: rebates, travel help, vouchers and services regional locals often don't know about.
// Every item from the NSW Government's own page (linked, with the date it was checked). We source, we don't advise.
import LIST from "./nswgov.json";

const CATS = [["Health", "🩺"], ["Money and bills", "💡"], ["Family and kids", "👪"], ["Housing and renting", "🏠"], ["Seniors", "🧓"], ["Getting around", "🚗"], ["Emergencies", "🚨"], ["Small business", "🏪"], ["Your records", "📄"]];
const slug = c => c.toLowerCase().replace(/[^a-z]+/g, "-").replace(/-$/, "");

export function nswPage({ esc, page, R, fresh }) {
  return (url) => {
    const pc = (url.searchParams.get("pc") || R.code).replace(/\D/g, "").slice(0, 4);
    const item = x => `<li class="hn"><b>${esc(x.name)}</b><br>${esc(x.what)}${x.who ? `<br><small class="mute">Who: ${esc(x.who)}</small>` : ""}
${x.phone ? `<br><a class="hnum" href="tel:${esc(x.phone.replace(/[^\d+]/g, ""))}">📞 ${esc(x.phone)}</a>` : ""}
<p class="src">${fresh ? fresh(x.checked) : ""}<span class="srcw">Source:</span> <a href="${esc(x.url)}" rel="noopener">${esc(x.srcName || "NSW Government")}</a> · checked ${esc(x.checked)}</p></li>`;
    const groups = CATS.map(([c, i]) => [c, i, LIST.filter(x => x.cat === c)]).filter(([, , xs]) => xs.length);
    return page("NSW Government help", `<p class="mute"><a href="/${pc}">‹ ${esc(pc)}</a></p><h1>🏛️ NSW Government help</h1>
<p>Rebates, travel help, vouchers and services that regional locals often don't know they can get. All in one place.</p>
<input id="hnq" type="search" placeholder="🔎 Type what you need, e.g. rebate, travel, bond, seniors" autocomplete="off" aria-label="Search NSW Government help">
<p id="hnnone" class="mute" hidden>No match. Clear the search to see everything.</p>
${groups.map(([c, i, xs]) => `<details class="hng" id="${slug(c)}"><summary>${i} ${esc(c)} <span class="hnc">${xs.length}</span></summary><ul class="hnl">${xs.map(item).join("")}</ul></details>`).join("")}
<p class="mute hnfoot">Every item is from the NSW Government's own page, linked under it. We don't decide who's eligible: the page does. Programs change, so if one's wrong, <a href="/feedback">tell us</a>. Need a hand in person? Call Service NSW on <a href="tel:137788">13 77 88</a>.</p>
<style>#hnq{width:100%;font-size:1rem;padding:10px 12px;border:1px solid var(--line);border-radius:10px;margin:6px 0 12px;box-sizing:border-box}.hng{border-bottom:1px solid var(--line)}.hng>summary{cursor:pointer;list-style:none;padding:12px 2px;font-weight:bold;font-size:1.05rem;display:flex;align-items:center;gap:8px}.hng>summary::-webkit-details-marker{display:none}.hng>summary::after{content:"+";margin-left:auto;color:var(--mute);font-weight:normal}.hng[open]>summary::after{content:"–"}.hnc{font-weight:normal;font-size:.8rem;color:var(--mute);background:var(--soft);border-radius:999px;padding:1px 8px}.hnl{list-style:none;padding:0;margin:0 0 8px}.hn{padding:10px 0;border-bottom:1px solid var(--line)}.hn .src,.hn small{font-size:.78rem}.hnfoot{margin-top:14px;font-size:.8rem}</style>
<script>(function(){var q=document.getElementById('hnq'),none=document.getElementById('hnnone'),G=[].slice.call(document.querySelectorAll('.hng'));
var h=location.hash.slice(1),t=h&&document.getElementById(h);if(t&&t.tagName==='DETAILS')t.open=true;
G.forEach(function(g){[].slice.call(g.querySelectorAll('.hn')).forEach(function(li){li.dataset.q=(li.textContent+' '+g.querySelector('summary').textContent).toLowerCase()})});
q.oninput=function(){var v=q.value.trim().toLowerCase(),any=false;G.forEach(function(g){var hit=0;[].slice.call(g.querySelectorAll('.hn')).forEach(function(li){var ok=!v||li.dataset.q.indexOf(v)>-1;li.hidden=!ok;if(ok)hit++});g.hidden=!!v&&!hit;g.open=!!v&&hit>0;if(hit)any=true});none.hidden=!v||any}})()</script>`, pc,
      { desc: "NSW Government rebates, travel help, vouchers and services regional locals often don't know about, each from the official page." });
  };
}
