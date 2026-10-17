// ---- Hard-to-find numbers: the customer lines big companies and agencies bury behind chatbots and FAQs.
// Every number comes from the organisation's own website (linked). Phone-tree shortcuts only where a reputable
// source has published them, with that source shown. We source, we don't tell. Checked dates on every item.
// Direct local numbers (the branch that actually answers): shared by signed-in locals, labelled as shared by a local,
// with where they found it. Locals vote "worked" or "didn't work"; a number that keeps failing drops off by itself.
import LIST from "./hardnumbers.json";
import LOCAL from "./localnumbers.json";

const CATS = ["NSW essentials", "Banks", "Government", "Phone and internet", "Energy", "Travel", "Shopping and apps", "If they won't help"];
const LCATS = ["Police", "Health", "Council", "Banks", "Motoring and transport"];
const telOf = n => String(n || "").replace(/[^\d+]/g, "");
const host = u => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return "source"; } };
// Show the full address the number sits at, so readers see how deep it's buried.
const buried = u => { try { const x = new URL(u), segs = x.pathname.split("/").filter(Boolean).map(p => decodeURIComponent(p).replace(/\.(html?|aspx?|php)$/i, ""));
  return { path: [x.hostname.replace(/^www\./, ""), ...segs].join(" › "), deep: segs.length }; } catch (e) { return null; } };
const dig = u => { const b = buried(u); return b ? `<p class="hndig">🔎 Buried at: <a href="${String(u).replace(/"/g, "&quot;")}" rel="noopener">${b.path.replace(/</g, "&lt;")}</a>${b.deep >= 2 ? ` <span class="mute">(${b.deep} pages deep)</span>` : ""}</p>` : ""; };
const slug = c => c.toLowerCase().replace(/[^a-z]+/g, "-");
const okNum = n => /^(0[2378]\d{8}|04\d{8}|1[38]00\d{6}|13\d{4})$/.test(telOf(n));
const fmtNum = n => { const d = telOf(n); return d.length === 6 ? d.replace(/(\d{2})(\d{2})(\d{2})/, "$1 $2 $3") : /^1[38]00/.test(d) ? d.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3") : /^04/.test(d) ? d.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3") : d.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2 $3"); };
const gone = x => x.bad >= 3 && x.bad > x.good;
const clip = (s, n) => String(s || "").replace(/\s+/g, " ").trim().slice(0, n);

export function numbersApi({ esc, page, R, fresh, member, cleanText, nameOf, TOWNS, todayISO }) {
  const pcOf = url => { const q = (url.searchParams.get("pc") || R.code).replace(/\D/g, "").slice(0, 4); return TOWNS[q]?.live ? q : R.code; };

  const view = async (req, env, url) => {
    const pc = pcOf(url), t = TOWNS[pc], em = await member(req, env);
    const loc = ((await env.DATA.get(`lnum:${pc}`, "json")) || []).filter(x => !gone(x)).sort((a, b) => (b.good - b.bad) - (a.good - a.bad) || a.org.localeCompare(b.org));
    const item = x => `<li class="hn"><div class="hnh"><b>${esc(x.name)}</b> <a class="hnum" href="tel:${telOf(x.num)}">📞 ${esc(x.num)}</a>${x.alt ? ` <span class="mute">· ${esc(x.alt)}</span>` : ""}</div>
${x.hours ? `<small>🕘 ${esc(x.hours)}</small>` : ""}
${x.tree ? `<p class="hntree">👉 <b>To reach a person:</b> ${esc(x.tree)}<span class="src"><span class="srcw">Source:</span> <a href="${esc(x.treeSrc)}" rel="noopener">${esc(x.treeSrcName || host(x.treeSrc))}</a></span></p>` : ""}
${x.tip ? `<p class="hntree">💡 ${esc(x.tip)}</p>` : ""}
<p class="src">${fresh ? fresh(x.checked) : ""}<span class="srcw">Source:</span> <a href="${esc(x.src)}" rel="noopener">${esc(x.srcName || host(x.src))}</a> · checked ${esc(x.checked)}</p>${dig(x.src)}</li>`;
    const litem = x => `<li class="hn"><div class="hnh"><b>${esc(x.org)}</b> <span class="mute">${esc(x.branch)}</span> <a class="hnum" href="tel:${telOf(x.num)}">📞 ${esc(x.num)}</a></div>
<p class="src"><span class="srcw">Shared by:</span> ${esc(x.name)}, a local · ${esc(x.at.slice(0, 10))} · found it: ${esc(x.where)}. Not checked by us.</p>
<p class="hnv"><button type="button" data-id="${x.id}" data-v="good">✅ Worked <span>${x.good}</span></button> <button type="button" data-id="${x.id}" data-v="bad">❌ Didn't work <span>${x.bad}</span></button></p></li>`;
    const off = (LOCAL[R.code] || []).slice().sort((a, b) => LCATS.indexOf(a.cat) - LCATS.indexOf(b.cat) || a.name.localeCompare(b.name));
    const oitem = x => `<li class="hn"><div class="hnh"><b>${esc(x.name)}</b>${x.where ? ` <span class="mute">${esc(x.where)}</span>` : ""} <a class="hnum" href="tel:${telOf(x.num)}">📞 ${esc(x.num)}</a></div>
${x.hours ? `<small>🕘 ${esc(x.hours)}</small>` : ""}
<p class="src">${fresh ? fresh(x.checked) : ""}<span class="srcw">Source:</span> <a href="${esc(x.src)}" rel="noopener">${esc(x.srcName || host(x.src))}</a> · checked ${esc(x.checked)}</p>${dig(x.src)}</li>`;
    const groups = CATS.map(c => [c, LIST.filter(x => x.cat === c)]).filter(([, xs]) => xs.length);
    const form = em ? `<details class="hnadd"><summary><b>+ Share a direct local number</b></summary><form id="lnf">
<label>Business<input name="org" maxlength="50" required placeholder="e.g. CommBank"></label>
<label>Branch or suburb<input name="branch" maxlength="50" required placeholder="e.g. Park Beach Plaza"></label>
<label>Number<input name="num" inputmode="tel" maxlength="20" required placeholder="e.g. 02 6600 0000"></label>
<label>Where did you get it?<input name="where" maxlength="80" required placeholder="e.g. on the branch door, their receipt, their website"></label>
<label class="chk"><input type="checkbox" required> It's a public business number, not a person's private number.</label>
<button>Share it</button></form><p id="lnm" class="note" hidden></p></details>`
      : `<p class="note">📍 Know a number that gets you straight to the local branch? <a href="/signin?next=${encodeURIComponent("/numbers?pc=" + pc)}"><b>Sign in free</b></a> to share it.</p>`;
    const ICON = { "NSW essentials": "🚨", Banks: "🏦", Government: "🏛️", "Phone and internet": "📶", Energy: "💡", Travel: "✈️", "Shopping and apps": "🛍️", "If they won't help": "⚖️" };
    const note = c => c === "If they won't help" ? `<p class="mute">Free, independent help when a company won't sort it out.</p>` : c === "NSW essentials" ? `<p class="mute">In an emergency call <a href="tel:000">000</a>.</p>` : "";
    const nLocal = off.length + loc.length;
    return page("Hard-to-find numbers", `<p class="mute"><a href="/${pc}">‹ ${esc(pc)} ${esc(t.name)}</a></p><h1>📞 Hard-to-find numbers</h1>
<p>The numbers big companies bury behind chatbots and FAQs. One tap to call.</p>
<input id="hnq" type="search" placeholder="🔎 Type a name, e.g. Qantas, Telstra, police" autocomplete="off" aria-label="Search numbers">
<p id="hnnone" class="mute" hidden>No match. Clear the search to see every number.</p>
<details class="hng" id="local"><summary>📍 Local direct lines in ${esc(pc)} <span class="hnc">${nLocal}</span></summary>
<p class="mute">The ones that reach the actual local station, branch or office, not a call centre.</p>
${off.length ? `<ul class="hnl">${off.map(oitem).join("")}</ul>` : ""}
<p class="hnsub">Shared by locals</p>
${loc.length ? `<ul class="hnl">${loc.map(litem).join("")}</ul>` : `<p class="mute">None shared for ${esc(pc)} yet. Be the first.</p>`}
${form}</details>
${groups.map(([c, xs]) => `<details class="hng" id="${slug(c)}"><summary>${ICON[c] || "📞"} ${esc(c)} <span class="hnc">${xs.length}</span></summary>${note(c)}<ul class="hnl">${xs.map(item).join("")}</ul></details>`).join("")}
<p class="mute hnfoot">Every national number is from the organisation's own website, and every phone-tree shortcut from the published source shown under it. Menus change: if one's wrong, <a href="/feedback">tell us</a>.</p>
<style>#hnq{width:100%;font-size:1rem;padding:10px 12px;border:1px solid var(--line);border-radius:10px;margin:6px 0 12px;box-sizing:border-box}.hng{border-bottom:1px solid var(--line)}.hng>summary{cursor:pointer;list-style:none;padding:12px 2px;font-weight:bold;font-size:1.05rem;display:flex;align-items:center;gap:8px}.hng>summary::-webkit-details-marker{display:none}.hng>summary::after{content:"+";margin-left:auto;color:var(--mute);font-weight:normal}.hng[open]>summary::after{content:"–"}.hnc{font-weight:normal;font-size:.8rem;color:var(--mute);background:var(--soft);border-radius:999px;padding:1px 8px}.hnsub{font-weight:bold;font-size:.9rem;margin:12px 0 0}.hnfoot{margin-top:14px;font-size:.8rem}.hn small,.hn .src,.hndig{font-size:.78rem}.hnl{list-style:none;padding:0;margin:0 0 8px}.hn{padding:10px 0;border-bottom:1px solid var(--line)}.hnh{display:flex;flex-wrap:wrap;gap:6px;align-items:baseline}.hnum{font-weight:bold;white-space:nowrap}.hntree{margin:6px 0 2px;font-size:.92rem}.hntree .src{display:block;margin-top:2px}.hnv button{font-size:.85rem;padding:3px 10px;margin-right:6px}.hnv button.on{outline:2px solid var(--fg)}.hndig{margin:2px 0 0;font-size:.78rem;color:var(--mute);word-break:break-word}.hndig a{color:inherit}.hnadd{margin:10px 0 18px}.hnadd summary{cursor:pointer}</style>
<script>(function(){var q=document.getElementById('hnq'),none=document.getElementById('hnnone'),G=[].slice.call(document.querySelectorAll('.hng'));
G.forEach(function(g){[].slice.call(g.querySelectorAll('.hn')).forEach(function(li){li.dataset.q=(li.textContent+' '+g.querySelector('summary').textContent).toLowerCase()})});
q.oninput=function(){var v=q.value.trim().toLowerCase(),any=false;G.forEach(function(g){var hit=0;[].slice.call(g.querySelectorAll('.hn')).forEach(function(li){var ok=!v||li.dataset.q.indexOf(v)>-1;li.hidden=!ok;if(ok)hit++});
[].slice.call(g.querySelectorAll(':scope>p,:scope>form,:scope>details')).forEach(function(x){x.hidden=!!v});g.hidden=!!v&&!hit;g.open=!!v&&hit>0;if(hit)any=true});none.hidden=!v||any}})();
(function(){document.querySelectorAll('.hnv button').forEach(function(b){b.onclick=function(){fetch('/api/numbers-vote?pc=${pc}&id='+b.dataset.id+'&v='+b.dataset.v,{method:'POST'}).then(function(r){return r.json()}).then(function(j){if(j.error){alert(j.error);return}var p=b.parentNode;p.querySelector('[data-v=good] span').textContent=j.good;p.querySelector('[data-v=bad] span').textContent=j.bad;b.classList.add('on')})}});
var f=document.getElementById('lnf'),m=document.getElementById('lnm');if(!f)return;f.onsubmit=function(e){e.preventDefault();var d=Object.fromEntries(new FormData(f));
fetch('/api/numbers?pc=${pc}',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(d)}).then(function(r){return r.json()}).then(function(j){m.innerHTML=j.msg||j.error;m.hidden=false;if(j.ok){f.reset();f.hidden=true}})}})()</script>`, pc,
      { desc: "Hard-to-find customer service numbers for banks, airlines, telcos, energy and government, each from the official site, plus direct local branch numbers shared by locals." });
  };

  const add = async (req, env, url) => {
    const em = await member(req, env); if (!em) return Response.json({ error: "Sign in first." }, { status: 401 });
    const pc = pcOf(url), day = todayISO(), nk = `lnn:${em}:${day}`, n = +(await env.DATA.get(nk)) || 0;
    if (n >= 5) return Response.json({ error: "That's 5 today, thanks! Come back tomorrow for more." }, { status: 429 });
    let b = {}; try { b = await req.json(); } catch (e) {}
    const org = clip(b.org, 50), branch = clip(b.branch, 50), where = clip(b.where, 80), num = clip(b.num, 20);
    if (!org || !branch || !where) return Response.json({ error: "Fill in every box." });
    if (!okNum(num)) return Response.json({ error: "That doesn't look like an Australian phone number. Try it with the area code, like 02 6600 0000." });
    if (!(await cleanText(env, `${org} ${branch} ${where}`))) return Response.json({ error: "Our check didn't like that one. Try again with just the business, branch and where you found it." });
    const list = (await env.DATA.get(`lnum:${pc}`, "json")) || [], d = telOf(num);
    if (list.some(x => telOf(x.num) === d && !gone(x))) return Response.json({ error: "That number's already on the list. Tap ✅ on it if it worked for you." });
    await env.DATA.put(nk, String(n + 1), { expirationTtl: 2 * 86400 });
    const it = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), org, branch, where, num: fmtNum(d), name: await nameOf(env, em), email: em, at: new Date().toISOString(), good: 1, bad: 0 };
    await env.DATA.put(`lnum:${pc}`, JSON.stringify([...list, it].slice(-300)));
    await env.DATA.put(`lnv:${it.id}:${em}`, "good", { expirationTtl: 365 * 86400 });
    return Response.json({ ok: true, msg: `🎉 Thanks ${esc(it.name)}! ${esc(org)} ${esc(branch)} is on the list for ${pc}. You just saved someone a lot of hold music.` });
  };

  const vote = async (req, env, url) => {
    const em = await member(req, env); if (!em) return Response.json({ error: "Sign in free to vote, so every vote is a real local." }, { status: 401 });
    const pc = pcOf(url), id = String(url.searchParams.get("id") || "").replace(/[^a-z0-9]/g, ""), v = url.searchParams.get("v") === "bad" ? "bad" : "good";
    const list = (await env.DATA.get(`lnum:${pc}`, "json")) || [], it = list.find(x => x.id === id); if (!it) return Response.json({ error: "Not found." });
    const vk = `lnv:${id}:${em}`, was = await env.DATA.get(vk);
    if (was !== v) { if (was) it[was] = Math.max(0, it[was] - 1); it[v]++; await env.DATA.put(vk, v, { expirationTtl: 365 * 86400 }); await env.DATA.put(`lnum:${pc}`, JSON.stringify(list)); }
    return Response.json({ good: it.good, bad: it.bad });
  };

  return { view, add, vote };
}
