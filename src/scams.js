// ---- Scam watch: digital safety from Maverick Digital. Teaching digital safety is one of our values.
// Free for everyone: the latest Scamwatch alerts and product recalls (official feeds, headline and link), the
// NSW Fair Trading Complaints Register (check before you buy), how to report a scam and the tips Scamwatch and the
// big banks agree on. Signed-in members also get "Is this a scam?": Mav checks a message against those tips.
import D from "./scamdata.json";

const FEEDS = { alerts: "https://www.scamwatch.gov.au/rss/news-feed.xml", recalls: "https://www.productsafety.gov.au/rss/recalls.xml" };
const dec = s => String(s || "").replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").trim();
const tag = (x, t) => dec((x.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)) || [])[1]);
// One line on why it's worth reading: the first sentence of the source's own summary, trimmed.
const why = d => { const t = dec(d).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(), f = (t.match(/^.{20,160}?[.!?](\s|$)/) || [t])[0].trim(); return f.length > 160 ? f.slice(0, 157).replace(/\s+\S*$/, "") + "…" : f; };
const items = xml => (String(xml).match(/<item[\s\S]*?<\/item>/g) || []).map(m => ({ title: tag(m, "title").replace(/<[^>]+>/g, ""), link: tag(m, "link"), date: tag(m, "pubDate"), why: why(tag(m, "description")) }));
// Same card as a news story: Source, headline, one line on why to read it, date and the link.
const card = (x, src, esc, fallback) => `<a class="story" href="${esc(x.link)}" rel="noopener"><span class="sbody"><span class="kick"><span class="srcw">Source:</span> ${esc(src)}</span><span class="hl">${esc(x.title)}</span><span class="dek">${esc(x.why && x.why.toLowerCase() !== x.title.toLowerCase() ? x.why : fallback)}</span><span class="byl">${esc(day(x.date))} · Read the full alert →</span></span></a>`;

export async function scamFeeds(env) {
  const hit = await env.DATA.get("scamfeeds2", "json"); if (hit) return hit;
  const out = { alerts: [], recalls: [], at: new Date().toISOString() };
  await Promise.all(Object.entries(FEEDS).map(async ([k, u]) => { try { const r = await fetch(u, { headers: { accept: "application/rss+xml,text/xml" }, cf: { cacheTtl: 1800 } }); if (r.ok) out[k] = items(await r.text()).slice(0, 8); } catch (e) {} }));
  await env.DATA.put("scamfeeds2", JSON.stringify(out), { expirationTtl: out.alerts.length ? 3 * 3600 : 600 });
  return out;
}

const day = s => { const d = new Date(s); return isNaN(d) ? "" : d.toLocaleDateString("en-AU", { timeZone: "Australia/Sydney", day: "numeric", month: "short" }); };
const telOf = p => String(p || "").replace(/[^\d+]/g, "");

// Small block for the front page: the newest alert, and the register, early.
export function scamTeaser(f, esc) {
  return `<section id="scams"><h2>🛡️ Scam watch</h2>
${(f?.alerts || []).slice(0, 2).map(x => card(x, "Scamwatch (ACCC)", esc, "What's going around right now, so you can spot it before it reaches you.")).join("")}
<p>Buying from a business you don't know? <a href="${esc(D.register.url)}" rel="noopener"><b>Check the NSW Fair Trading Complaints Register first</b></a>: it lists businesses with 10 or more complaints in a month.</p>
<p><a href="/scams"><b>Scam watch: report a scam, the tips banks agree on, product recalls →</b></a></p></section>`;
}

export function scamsApi({ esc, page, R, member, fresh }) {
  const view = async (req, env, url) => {
    const pc = (url.searchParams.get("pc") || R.code).replace(/\D/g, "").slice(0, 4), em = await member(req, env), f = await scamFeeds(env);
    const feedList = (xs, src, srcUrl, fb) => xs.length ? `<div class="scl">${xs.slice(0, 6).map(x => card(x, src, esc, fb)).join("")}</div><p class="src"><span class="srcw">Source:</span> <a href="${srcUrl}" rel="noopener">${src}</a></p>` : `<p class="mute">${src} isn't coming through right now. <a href="${srcUrl}" rel="noopener">Go straight to ${src} →</a></p>`;
    const steps = D.report.map(s => `<li class="hn"><b>${esc(s.step)}</b><br>${esc(s.detail)}${s.phone ? ` <a class="hnum" href="tel:${telOf(s.phone)}">📞 ${esc(s.phone)}</a>` : ""}<p class="src"><span class="srcw">Source:</span> <a href="${esc(s.url)}" rel="noopener">${esc(s.srcName)}</a></p></li>`).join("");
    const tips = D.tips.map(t => `<li class="hn"><b>${esc(t.tip)}</b><br>${esc(t.detail)}<p class="src"><span class="srcw">Source:</span> ${t.sources.map(s => `<a href="${esc(s.url)}" rel="noopener">${esc(s.name)}</a>`).join(", ")}</p></li>`).join("");
    const check = em ? `<form id="scf"><label>Paste the message, email or link you're not sure about<textarea id="sct" maxlength="2000" rows="5" required placeholder="e.g. Your parcel is on hold. Pay the $2.99 fee here: ..."></textarea></label><button>Ask Mav</button></form><div id="scr" class="note" hidden></div>
<script>(function(){var f=document.getElementById('scf'),o=document.getElementById('scr');f.onsubmit=function(e){e.preventDefault();var b=f.querySelector('button');b.disabled=true;b.textContent='Mav is checking…';
fetch('/api/scamcheck',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({t:document.getElementById('sct').value})}).then(function(r){return r.json()}).then(function(j){o.hidden=false;o.textContent=j.answer||j.error;b.disabled=false;b.textContent='Ask Mav'}).catch(function(){o.hidden=false;o.textContent='Mav couldn\\'t check that one. Try again.';b.disabled=false;b.textContent='Ask Mav'})}})()</script>`
      : `<p class="note">🔐 <a href="/signin?next=${encodeURIComponent("/scams")}"><b>Sign in free</b></a> and Mav will check a message, email or link you're not sure about against the official scam warning signs.</p>`;
    return page("Scam watch", `<p class="mute"><a href="/${pc}">‹ ${esc(pc)}</a></p><h1>🛡️ Scam watch</h1>
<p>Digital safety from Maverick Digital. Teaching people to stay safe online is one of our values, so this is free for everyone: what's going around, how to check before you buy, and what to do if it happens to you.</p>
<details class="hng" open><summary>🔎 Is this a scam? Ask Mav</summary>${check}<p class="mute">Mav points out warning signs from Scamwatch and the banks. Mav can't promise something is safe: if in doubt, hang up, don't click, and contact the organisation on a number you find yourself.</p></details>
<details class="hng" open><summary>🚨 What's going around now</summary>${feedList(f.alerts, "Scamwatch (ACCC)", "https://www.scamwatch.gov.au/about-us/news-and-alerts/browse-news-and-alerts", "What's going around right now, so you can spot it before it reaches you.")}</details>
<details class="hng"><summary>📋 Check before you buy</summary><p>NSW Fair Trading publishes every business that got <b>10 or more complaints in a month</b>, for the past 2 years: the business, how many complaints, what about and where. Check it before you hand over money to a business you don't know.</p>
<p><a href="${esc(D.register.url)}" rel="noopener"><b>Open the NSW Fair Trading Complaints Register →</b></a></p><p class="mute">Being on the register means complaints were lodged, not that the business did anything wrong. The register is updated monthly by NSW Fair Trading (<a href="tel:133220">13 32 20</a>).</p>
<p class="mute">The ACCC (Australian Competition and Consumer Commission) doesn't publish a complaints list, but it does publish <a href="${esc(D.accc.equivalents[0].url)}" rel="noopener">public warnings about businesses</a>.</p></details>
<details class="hng"><summary>📞 How to report a scam</summary><ul class="hnl">${steps}</ul></details>
<details class="hng"><summary>✅ The tips Scamwatch and the banks agree on</summary><ul class="hnl">${tips}</ul></details>
<details class="hng"><summary>🧸 Product recalls</summary>${feedList(f.recalls, "Product Safety Australia", "https://www.productsafety.gov.au/recalls", "Check whether you have this at home, and what to do if you do.")}</details>
<p class="mute hnfoot">Every alert, number and tip is from the official source linked under it. Checked ${esc(D.checked)}.</p>
<style>.hng{border-bottom:1px solid var(--line)}.hng>summary{cursor:pointer;list-style:none;padding:12px 2px;font-weight:bold;font-size:1.05rem;display:flex;gap:8px}.hng>summary::-webkit-details-marker{display:none}.hng>summary::after{content:"+";margin-left:auto;color:var(--mute);font-weight:normal}.hng[open]>summary::after{content:"–"}.hnl,.scl{list-style:none;padding:0;margin:0 0 8px}.hn,.scl li{padding:8px 0;border-bottom:1px solid var(--line)}.hn .src{font-size:.78rem}.hnfoot{margin-top:14px;font-size:.8rem}#sct{width:100%;box-sizing:border-box}</style>`, pc,
      { desc: "Scam watch: the latest scam alerts, the NSW Fair Trading Complaints Register, how to report a scam, the tips banks agree on and product recalls. Free, from Maverick Digital." });
  };

  const ASK = `You help regional Australians spot scams. Using ONLY these official warning signs, point out any that appear in the message. Signs: ${D.tips.map(t => t.tip).join("; ")}.
Reply in plain English, under 90 words: start with "Warning signs:" and list the ones you see (or say you can't see the usual ones). Never say a message is safe or definitely legitimate. Always end with: "If in doubt, don't click or pay. Contact them on a number you find yourself, and report it at scamwatch.gov.au."`;
  const checkApi = async (req, env) => {
    const em = await member(req, env); if (!em) return Response.json({ error: "Sign in free to ask Mav." }, { status: 401 });
    const k = `scn:${em}:${new Date().toISOString().slice(0, 10)}`, n = +(await env.DATA.get(k)) || 0;
    if (n >= 10) return Response.json({ error: "That's 10 checks today. Come back tomorrow, or report it at scamwatch.gov.au." }, { status: 429 });
    let t = ""; try { t = String((await req.json()).t || "").slice(0, 2000); } catch (e) {}
    if (!t.trim()) return Response.json({ error: "Paste the message first." });
    await env.DATA.put(k, String(n + 1), { expirationTtl: 2 * 86400 });
    try { const r = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", { max_tokens: 220, messages: [{ role: "system", content: ASK }, { role: "user", content: t }] });
      return Response.json({ answer: String(r?.response || "").trim() || "Mav couldn't check that one. If in doubt, don't click or pay, and report it at scamwatch.gov.au." }); }
    catch (e) { return Response.json({ error: "Mav is taking a breather. If in doubt, don't click or pay, and report it at scamwatch.gov.au." }); }
  };
  return { view, checkApi };
}
