// ---- "What needs mavericking today?": people describe their situation (type or talk) and get everything on the site
// that's relevant, plus a few suggested steps from Mav using only that information. Suggestions can be wrong, and the
// page says so. Every answer gets a thumbs up or down, logged so we learn what helps (the personal intern gets better).
import NSW from "./nswgov.json";
import HARD from "./hardnumbers.json";
import LOCAL from "./localnumbers.json";
import SCAM from "./scamdata.json";

const STOP = new Set("a an and are at be but by can do for from get got has have how i im i'm in is it its just me my need of on or our so that the their them then there they this to too up us was we what when where which who why will with you your see think want help know like really very some about been into out still also don't cant can't".split(" "));
const words = s => String(s || "").toLowerCase().replace(/[^a-z0-9' ]+/g, " ").split(/\s+/).filter(w => w.length > 2 && !STOP.has(w)).map(w => w.replace(/'s$/, "").replace(/(ies)$/, "y").replace(/s$/, ""));

export function buildIndex({ R, NAV }) {
  const items = [];
  for (const [k, title, text, href] of R.idx || []) items.push({ k: `${k} ${title} ${text}`, title, text, href });
  for (const s of NAV) for (const [u, , n, d, soon] of s.items) if (u && !soon) items.push({ k: `${s.name} ${n} ${d}`, title: n, text: d, href: u.startsWith("#") ? `/${s.slug}${u}` : u });
  for (const x of NSW) items.push({ k: `${x.cat} ${x.name} ${x.what} ${x.who}`, title: x.name, text: x.what + (x.phone ? ` Call ${x.phone}.` : ""), href: x.url, src: x.srcName || "NSW Government" });
  for (const x of HARD) items.push({ k: `${x.cat} ${x.name} phone number call contact`, title: `${x.name}: ${x.num}`, text: x.hours || "", href: x.src, src: x.srcName || "" });
  for (const x of LOCAL[R.code] || []) items.push({ k: `${x.cat} ${x.name} ${x.where} phone number call local`, title: `${x.name}: ${x.num}`, text: x.where || "", href: x.src, src: x.srcName || "" });
  for (const x of SCAM.report || []) items.push({ k: `scam scammed fraud report ${x.step} ${x.detail}`, title: x.step, text: x.detail + (x.phone ? ` ${x.phone}` : ""), href: x.url, src: x.srcName });
  items.push({ k: "scam scams scammed fraud tips safe online", title: "Scam watch", text: "What's going around, how to check a business, how to report a scam.", href: "/scams" });
  for (const it of items) it.w = new Set(words(it.k));
  return items;
}

export function search(index, q, n = 8) {
  const w = words(q); if (!w.length) return [];
  return index.map(it => ({ it, s: w.reduce((a, x) => a + (it.w.has(x) ? 2 : (x.length >= 5 && [...it.w].some(y => y.length >= 5 && (y.startsWith(x.slice(0, 5))))) ? 1 : 0), 0) }))
    .filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, n).map(x => ({ title: x.it.title, text: x.it.text, href: x.it.href, src: x.it.src || "" }));
}

const ASK = (brand) => `You are Mav, a friendly helper on ${brand}, a free regional NSW community information hub. Someone described their situation.
Using ONLY the information listed below, suggest 2 to 5 short, logical steps they could take, in order, in plain English. Mention the specific service, number or page by name.
Rules: never give medical, legal or financial advice; point to the right service instead. If anyone may be in danger, step 1 is "Call 000". Stay neutral and kind. If the list doesn't cover it, say so and suggest telling us at /feedback.
Reply as a numbered list only, under 120 words.`;

export function helpApi({ esc, R, NAV, member, hasTier, todayISO, guard }) {
  let IDX = null;
  const ask = async (req, env) => {
    let b = {}; try { b = await req.json(); } catch (e) {}
    const q = String(b.q || "").replace(/\s+/g, " ").trim().slice(0, 500);
    if (q.length < 3) return Response.json({ error: "Tell us a bit more about what's going on." });
    const g = guard(q); if (g) return Response.json({ steps: g.reply, hits: [] });
    IDX = IDX || buildIndex({ R, NAV });
    const hits = search(IDX, q);
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6), day = todayISO();
    // Steps from Mav: 3 a day for anyone (it's a community helper), 10 a day signed in, unlimited with 110% Maverick.
    const em = await member(req, env), who = em || (req.headers.get("cf-connecting-ip") || "anon"), ck = `help:n:${who}:${day}`, n = +(await env.DATA.get(ck)) || 0;
    let steps = "", capped = false;
    if (hits.length && env.AI) {
      if (!(em && await hasTier(env, em, "every")) && n >= (em && await hasTier(env, em, "some") ? 10 : 3)) capped = true;
      else { try {
        const ctx = hits.map((h, i) => `${i + 1}. ${h.title}: ${h.text}`).join("\n");
        const r = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", { max_tokens: 260, messages: [{ role: "system", content: ASK(R.brand) + "\n\nInformation:\n" + ctx }, { role: "user", content: q }] });
        steps = String(r?.response || "").trim(); await env.DATA.put(ck, String(n + 1), { expirationTtl: 2 * 86400 });
      } catch (e) { steps = ""; } }
    }
    await env.DATA.put(`help:log:${day}:${id}`, JSON.stringify({ q, hits: hits.map(h => h.title), steps, at: new Date().toISOString(), member: !!em }), { expirationTtl: 400 * 86400 });
    return Response.json({ id, hits, steps, capped });
  };
  const vote = async (req, env) => {
    let b = {}; try { b = await req.json(); } catch (e) {}
    const id = String(b.id || "").replace(/[^a-z0-9]/g, ""), v = b.v === "down" ? "down" : "up", day = todayISO();
    const k = `help:log:${day}:${id}`, rec = id && await env.DATA.get(k, "json"); if (!rec) return Response.json({ ok: false });
    rec.vote = v; if (b.note) rec.note = String(b.note).slice(0, 300);
    await env.DATA.put(k, JSON.stringify(rec), { expirationTtl: 400 * 86400 });
    const sk = `help:votes:${day}`, s = (await env.DATA.get(sk, "json")) || { up: 0, down: 0 }; s[v]++; await env.DATA.put(sk, JSON.stringify(s), { expirationTtl: 400 * 86400 });
    const pc = ((req.headers.get("cookie") || "").match(/(?:^|;\s*)mpc=(\d{4})/) || [])[1]; // the reader's own postcode, for "What [postcode] told us"
    if (pc) { const pk = `help:votes:${day}:${pc}`, ps = (await env.DATA.get(pk, "json")) || { up: 0, down: 0 }; ps[v]++; await env.DATA.put(pk, JSON.stringify(ps), { expirationTtl: 400 * 86400 }); }
    return Response.json({ ok: true });
  };
  return { ask, vote };
}

// The button in the header and the panel it opens (under the header, never over the news).
export const HELP_UI = brand => `<button type="button" id="hmbtn" class="hmbtn" aria-haspopup="dialog" aria-controls="hmp">🔎 <span>What needs mavericking today?</span></button>`;
export const HELP_PANEL = () => `<div id="hmp" class="hmp" hidden role="dialog" aria-label="What needs mavericking today?"><div class="hmin">
<form id="hmf"><label for="hmq"><b>What needs mavericking today?</b> Tell us what's going on, in your own words.</label>
<div class="hmrow"><button type="button" id="hmmic" aria-label="Talk instead of typing">🎤</button><input id="hmq" maxlength="500" autocomplete="off" placeholder="e.g. My power bill is huge and I'm a pensioner"><button>Go</button></div></form>
<div id="hmout"></div><p class="mute hmnote">These are suggestions and could be wrong: nobody knows your situation better than you. Everything links to the source so you can check.</p>
<button type="button" id="hmx" class="ghost">Close</button></div></div>
<style>.hmbtn{display:flex;align-items:center;gap:6px;max-width:640px;width:calc(100% - 32px);margin:8px auto 0;padding:9px 14px;border:1px solid var(--line);border-radius:999px;background:var(--soft);color:var(--fg);font-size:.95rem;cursor:pointer;text-align:left}.hmbtn span{opacity:.8}
.hmp{max-width:640px;margin:8px auto;padding:0 16px}.hmin{border:1px solid var(--line);border-radius:14px;padding:12px;background:var(--bg)}.hmrow{display:flex;gap:6px;margin-top:6px}.hmrow input{flex:1;font-size:1rem;padding:9px 10px}.hmrow button{padding:8px 12px}#hmout .card{display:block;margin:6px 0}.hmsteps{white-space:pre-wrap;background:var(--soft);border-radius:10px;padding:10px;margin:8px 0}.hmvote button{margin-right:6px}.hmnote{font-size:.8rem}</style>
<script>(function(){var b=document.getElementById('hmbtn'),p=document.getElementById('hmp'),f=document.getElementById('hmf'),q=document.getElementById('hmq'),o=document.getElementById('hmout');if(!b||!p)return;
function e(x){return String(x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
b.onclick=function(){p.hidden=!p.hidden;if(!p.hidden)q.focus()};document.getElementById('hmx').onclick=function(){p.hidden=true};
var SR=window.SpeechRecognition||window.webkitSpeechRecognition,mic=document.getElementById('hmmic');if(!SR)mic.hidden=true;else mic.onclick=function(){var r=new SR();r.lang='en-AU';r.onresult=function(ev){q.value=ev.results[0][0].transcript;f.requestSubmit()};mic.textContent='👂';r.onend=function(){mic.textContent='🎤'};r.start()};
f.onsubmit=function(ev){ev.preventDefault();var v=q.value.trim();if(!v)return;o.innerHTML='<p class="mute">Looking…</p>';
fetch('/api/helpme',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({q:v})}).then(function(r){return r.json()}).then(function(j){if(j.error){o.innerHTML='<p class="note">'+e(j.error)+'</p>';return}
var h=(j.hits||[]).map(function(x){return '<a class="card" href="'+e(x.href)+'"'+(/^https?:/.test(x.href)?' rel="noopener" target="_blank"':'')+'><b>'+e(x.title)+'</b>'+(x.text?'<br><span class="mute">'+e(x.text)+'</span>':'')+(x.src?'<br><small class="mute">Source: '+e(x.src)+'</small>':'')+'</a>'}).join('');
o.innerHTML=(j.steps?'<p><b>Mav suggests</b></p><div class="hmsteps">'+e(j.steps)+'</div>':j.capped?'<p class="note">That&rsquo;s today&rsquo;s free suggestions from Mav. Here&rsquo;s everything we found. <a href="/membership">110% Maverick gets Mav unlimited</a>.</p>':'')+(h?'<p><b>What we found</b></p>'+h:'<p class="mute">We couldn&rsquo;t find anything on that yet. <a href="/feedback">Tell us</a> and we&rsquo;ll look into adding it.</p>')
+(j.id?'<p class="hmvote">Was this a little bit helpful? <button type="button" data-v="up">👍</button><button type="button" data-v="down">👎</button></p>':'');
o.querySelectorAll('.hmvote button').forEach(function(x){x.onclick=function(){fetch('/api/helpme/vote',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:j.id,v:x.dataset.v})});x.parentNode.textContent=x.dataset.v==='up'?'Thanks! That helps us get better.':'Thanks for telling us. We read every one and use it to get better.'}})}).catch(function(){o.innerHTML='<p class="note">Something went wrong. Try again.</p>'})}})()<\/script>`;
