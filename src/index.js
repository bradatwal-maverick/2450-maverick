// 2450 Maverick — free local info, one page per postcode.
// Born and built in 2450, raised by the world. Powered by Maverick Digital.

const TOWNS = {
  "2450": { name: "Coffs Harbour", lat: -30.3022, lon: 153.1189, mlat: -30.30, mlon: 153.15, live: true },
  "2452": { name: "Sawtell", live: false },
  "2454": { name: "Bellingen", live: false },
  "2456": { name: "Woolgoolga", live: false },
};

const esc = (s = "") => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const todayISO = () => new Date(Date.now() + 11 * 3600e3).toISOString().slice(0, 10); // Sydney (AEDT)

const CSS = `
:root{--bg:#fff;--fg:#202124;--mute:#5f6368;--link:#1a0dab;--line:#dadce0;--accent:#1a73e8}
@media (prefers-color-scheme:dark){:root{--bg:#202124;--fg:#e8eaed;--mute:#9aa0a6;--link:#8ab4f8;--line:#3c4043;--accent:#8ab4f8}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 Arial,Helvetica,sans-serif}
main{max-width:640px;margin:0 auto;padding:16px}a{color:var(--link)}h1{font-size:1.6rem;margin:.2em 0}
h2{font-size:1.1rem;margin:1.4em 0 .4em;border-bottom:1px solid var(--line);padding-bottom:4px}
.mute{color:var(--mute);font-size:.9rem}input,textarea,button,select{font:inherit;padding:10px;border:1px solid var(--line);border-radius:20px;background:var(--bg);color:var(--fg)}
textarea{border-radius:8px;width:100%}button{cursor:pointer;background:var(--accent);color:var(--bg);border:0;padding:10px 18px}
.home{min-height:70vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}
.big{font-size:3rem;font-weight:bold;letter-spacing:-1px;margin:0}.search{display:flex;gap:8px;margin:20px 0;width:100%;max-width:420px}.search input{flex:1}
ul{padding-left:18px}li{margin:6px 0}footer{border-top:1px solid var(--line);margin-top:40px;padding:16px;text-align:center;color:var(--mute);font-size:.85rem}
label{display:block;margin:10px 0 4px}.row{display:flex;gap:8px;flex-wrap:wrap}.row input{flex:1;min-width:160px}
.hp{position:absolute;left:-9999px}.pins label{display:inline;margin-right:12px;font-size:.9rem}`;

function page(title, body, pc = "") {
  return new Response(`<!doctype html><html lang="en-AU"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<meta name="description" content="Everything on in your town, in one place. Free. Nobody pays to be here.">
<link rel="manifest" href="/manifest.webmanifest"><link rel="icon" href="/icon.svg"><meta name="theme-color" content="#1a73e8">
<style>${CSS}</style></head><body><main>${body}</main>
<footer><a href="/">Find your postcode</a> · <a href="/about">Nobody pays to be here</a>${pc ? ` · <a href="/submit?pc=${pc}">Add an event</a>` : ""}<br>
Big tech divided us. 2450 Maverick brings communities back together.<br>
Born and built in 2450, raised by the world. Powered by <a href="https://maverickdigital.com.ai">Maverick Digital</a></footer>
<script>if("serviceWorker"in navigator)navigator.serviceWorker.register("/sw.js").catch(()=>{})</script></body></html>`,
    { headers: { "content-type": "text/html;charset=utf-8" } });
}

const home = () => page("2450 Maverick — what's on in your town", `
<div class="home"><p class="big">2450 Maverick</p><p class="mute">Everything on in your town, in one place. Free.</p>
<form class="search" onsubmit="event.preventDefault();var p=this.pc.value.trim();try{localStorage.setItem('pc',p)}catch(e){};location='/'+p">
<input name="pc" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="Your postcode" required aria-label="Your postcode"><button>Go</button></form>
<p id="mine"></p><p class="mute">Live now: <a href="/2450">2450 Coffs Harbour</a>. Coming soon: Sawtell, Bellingen, Woolgoolga.</p></div>
<script>try{var p=localStorage.getItem('pc');if(p)document.getElementById('mine').innerHTML='Your town: <a href="/'+p+'">'+p+'</a>'}catch(e){}</script>`);

async function listEvents(env, prefix) {
  const today = todayISO(), out = [];
  const { keys } = await env.DATA.list({ prefix });
  for (const k of keys) {
    const date = k.name.split(":")[2];
    if (date < today) continue;
    const v = await env.DATA.get(k.name, "json");
    if (v) out.push(v);
  }
  return out.sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
}

// NSW daylight saving: clocks forward 2am first Sunday of October, back 3am first Sunday of April.
function clockChange() {
  const today = todayISO(), y = +today.slice(0, 4);
  const firstSun = (yr, m) => { const d = new Date(Date.UTC(yr, m, 1)); d.setUTCDate(1 + (7 - d.getUTCDay()) % 7); return d.toISOString().slice(0, 10); };
  const opts = [[firstSun(y, 3), "back"], [firstSun(y, 9), "forward"], [firstSun(y + 1, 3), "back"]].filter(([d]) => d >= today);
  const [date, dir] = opts[0];
  const days = Math.round((new Date(date) - new Date(today)) / 864e5);
  const what = dir === "back" ? "go back 1 hour at 3am (to 2am). Extra sleep!" : "go forward 1 hour at 2am (to 3am). Lose an hour's sleep.";
  const when = days === 0 ? "Today" : days === 1 ? "Tonight / tomorrow morning" : fmtDate(date);
  return { soon: days <= 14, text: `<b>Clocks ${dir === "back" ? "go back" : "go forward"}</b> ${esc(when)}${days > 1 ? ` (in ${days} days)` : ""}: ${what.replace(/^go (back|forward) /, "")}` };
}

const fmtDate = d => new Date(d + "T00:00:00").toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
const evItem = e => `<li><b>${esc(fmtDate(e.date))}${e.time ? " " + esc(e.time) : ""}</b> — ${e.link ? `<a href="${esc(e.link)}" rel="nofollow noopener">${esc(e.title)}</a>` : esc(e.title)}${e.venue ? `, ${esc(e.venue)}` : ""}${e.desc ? `<br><span class="mute">${esc(e.desc)}</span>` : ""}</li>`;

async function town(pc, env) {
  const t = TOWNS[pc];
  if (!t || !t.live) return page(`${pc} — coming soon`, `<h1>${esc(pc)}${t ? " " + esc(t.name) : ""}</h1>
<p>Not live yet. 2450 Coffs Harbour is first. Want your town next? Leave your email and you'll hear when it's up.</p>${signup(pc)}<p><a href="/2450">See 2450 Coffs Harbour</a></p>`, pc);

  // Local submissions first, then events from feeds.
  const local = await listEvents(env, `event:${pc}:`);
  const feed = await listEvents(env, `feed:${pc}:`);
  const events = (local.length ? `<h3>From locals</h3><ul>${local.map(evItem).join("")}</ul>` : "")
    + (feed.length ? `<h3>More around town</h3><ul>${feed.map(evItem).join("")}</ul>` : "")
    || `<p>Nothing listed yet. Know something on? <a href="/submit?pc=${pc}">Add it free</a>.</p>`;

  const cc = clockChange();
  return page(`${pc} ${t.name} — what's on`, `
<p class="mute"><a href="/">2450 Maverick</a> › ${esc(pc)}</p><h1>${esc(t.name)} ${esc(pc)}</h1>
${cc.soon ? `<p style="border:1px solid var(--accent);border-radius:8px;padding:10px">⏰ ${cc.text}</p>` : ""}
<p class="pins mute">Show: <label><input type="checkbox" data-s="today" checked> Today</label><label><input type="checkbox" data-s="sea" checked> Tides &amp; swell</label><label><input type="checkbox" data-s="events" checked> What's on</label></p>
<section id="today"><h2>Today</h2><p id="wx" class="mute">Loading weather…</p>${cc.soon ? "" : `<p class="mute">${cc.text}</p>`}</section>
<section id="sea"><h2>Tides &amp; swell</h2><p id="tide" class="mute">Loading…</p>
<p class="mute">Tide times are modelled estimates. Not for navigation; check the Bureau of Meteorology before boating.</p></section>
<section id="events"><h2>What's on</h2>${events}<p><a href="/submit?pc=${pc}">+ Add an event (free)</a></p></section>
<h2>This week in ${esc(pc)}</h2><p>One short email a week with what's on. No spam, unsubscribe any time.</p>${signup(pc)}
<script>
try{localStorage.setItem('pc','${pc}')}catch(e){}
document.querySelectorAll('[data-s]').forEach(function(c){var k='hide_'+c.dataset.s,s=document.getElementById(c.dataset.s);
try{if(localStorage.getItem(k))c.checked=false}catch(e){}s.hidden=!c.checked;
c.onchange=function(){s.hidden=!c.checked;try{c.checked?localStorage.removeItem(k):localStorage.setItem(k,1)}catch(e){}}});
var W={0:'Clear',1:'Mostly clear',2:'Partly cloudy',3:'Cloudy',45:'Fog',48:'Fog',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',80:'Showers',81:'Showers',82:'Heavy showers',95:'Thunderstorms',96:'Thunderstorms',99:'Thunderstorms'};
var dirs=['N','NE','E','SE','S','SW','W','NW'],tm=function(s){return new Date(s).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'})};
fetch('https://api.open-meteo.com/v1/forecast?latitude=${t.lat}&longitude=${t.lon}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&forecast_days=1&timezone=Australia%2FSydney')
.then(function(r){return r.json()}).then(function(d){var c=d.current,y=d.daily;
document.getElementById('wx').innerHTML='<b>'+Math.round(c.temperature_2m)+'°C</b> '+(W[c.weather_code]||'')+' · Top '+Math.round(y.temperature_2m_max[0])+'° / low '+Math.round(y.temperature_2m_min[0])+'° · Rain chance '+y.precipitation_probability_max[0]+'%<br>Wind '+Math.round(c.wind_speed_10m)+' km/h '+dirs[Math.round(c.wind_direction_10m/45)%8]+' · Sunrise '+tm(y.sunrise[0])+' · Sunset '+tm(y.sunset[0]);
}).catch(function(){document.getElementById('wx').textContent='Weather unavailable right now.'});
fetch('https://marine-api.open-meteo.com/v1/marine?latitude=${t.mlat}&longitude=${t.mlon}&hourly=sea_level_height_msl,wave_height,swell_wave_height&forecast_days=2&timezone=Australia%2FSydney')
.then(function(r){return r.json()}).then(function(d){var h=d.hourly,s=h.sea_level_height_msl,out=[],now=Date.now();
for(var i=1;i<s.length-1;i++){if(new Date(h.time[i])<now-36e5)continue;if(s[i]>s[i-1]&&s[i]>=s[i+1])out.push('High '+tm(h.time[i]));else if(s[i]<s[i-1]&&s[i]<=s[i+1])out.push('Low '+tm(h.time[i]));if(out.length>=4)break}
var j=h.time.findIndex(function(x){return new Date(x)>=now});if(j<0)j=0;
document.getElementById('tide').innerHTML=(out.length?out.join(' · '):'Tide times unavailable')+'<br>Waves '+(h.wave_height[j]||0).toFixed(1)+' m · Swell '+(h.swell_wave_height[j]||0).toFixed(1)+' m';
}).catch(function(){document.getElementById('tide').textContent='Tides unavailable right now.'});
</script>`, pc);
}

const signup = pc => `<form method="post" action="/subscribe" class="row"><input type="hidden" name="pc" value="${esc(pc)}">
<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<input type="email" name="email" placeholder="Your email" required aria-label="Your email"><button>Sign me up</button></form>
<p class="mute">By signing up you agree to get the weekly email from 2450 Maverick (Maverick Digital). Unsubscribe any time.</p>`;

const submitForm = pc => page("Add an event — free", `<p class="mute"><a href="/${esc(pc)}">‹ Back to ${esc(pc)}</a></p>
<h1>Add an event, free</h1><p>Nobody pays to be listed. Events are checked before they go live, usually within a day.</p>
<form method="post" action="/submit"><input type="hidden" name="pc" value="${esc(pc)}"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<label>What's on *</label><input name="title" required maxlength="120" style="width:100%">
<div class="row"><div><label>Date *</label><input type="date" name="date" required min="${todayISO()}"></div><div><label>Time</label><input name="time" placeholder="7pm" maxlength="20"></div></div>
<label>Where</label><input name="venue" maxlength="120" style="width:100%">
<label>Link (tickets or more info)</label><input type="url" name="link" maxlength="300" style="width:100%">
<label>Short description</label><textarea name="desc" rows="3" maxlength="300"></textarea>
<label>Your email (so we can check details, never shown) *</label><input type="email" name="contact" required style="width:100%">
<p><button>Submit event</button></p></form>`, pc);

async function handleSubmit(req, env) {
  const f = await req.formData();
  if (f.get("website")) return page("Thanks", "<h1>Thanks!</h1>");
  const pc = String(f.get("pc") || "2450").slice(0, 4), date = String(f.get("date") || "");
  const link = String(f.get("link") || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !f.get("title")) return page("Missing details", `<h1>Missing details</h1><p><a href="/submit?pc=${esc(pc)}">Try again</a></p>`);
  const ev = { pc, date, title: String(f.get("title")).slice(0, 120), time: String(f.get("time") || "").slice(0, 20),
    venue: String(f.get("venue") || "").slice(0, 120), link: /^https?:\/\//.test(link) ? link.slice(0, 300) : "",
    desc: String(f.get("desc") || "").slice(0, 300), contact: String(f.get("contact") || "").slice(0, 200), at: new Date().toISOString() };
  const id = crypto.randomUUID().slice(0, 8);
  await env.DATA.put(`pending:${pc}:${date}:${id}`, JSON.stringify(ev));
  return page("Thanks", `<h1>Thanks, it's in!</h1><p>We'll check it and it'll appear on <a href="/${esc(pc)}">${esc(pc)}</a> soon.</p>`, pc);
}

async function handleSubscribe(req, env) {
  const f = await req.formData();
  const pc = String(f.get("pc") || "2450").slice(0, 4), email = String(f.get("email") || "").trim().toLowerCase();
  if (!f.get("website") && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    await env.DATA.put(`sub:${email}`, JSON.stringify({ email, pc, consent: true, at: new Date().toISOString() }));
  return page("You're in", `<h1>You're in!</h1><p>Watch for "This week in ${esc(pc)}".</p><p><a href="/${esc(pc)}">Back to ${esc(pc)}</a></p>`, pc);
}

async function admin(req, env) {
  if (!env.ADMIN_KEY) return page("Admin", "<h1>Admin not set up</h1><p>Add an ADMIN_KEY secret in Cloudflare.</p>");
  const login = `<form method="post"><input type="password" name="key" placeholder="Admin key" required><button>Log in</button></form>`;
  if (req.method !== "POST") return page("Admin", `<h1>Admin</h1>${login}`);
  const f = await req.formData();
  if (f.get("key") !== env.ADMIN_KEY) return page("Admin", `<h1>Admin</h1><p>Wrong key.</p>${login}`);
  const act = f.get("act"), k = String(f.get("k") || "");
  if (k.startsWith("pending:")) {
    if (act === "approve") {
      const v = await env.DATA.get(k);
      if (v) await env.DATA.put("event:" + k.slice(8), v);
    }
    await env.DATA.delete(k);
  }
  const { keys } = await env.DATA.list({ prefix: "pending:" });
  const subs = (await env.DATA.list({ prefix: "sub:" })).keys.length;
  const key = esc(f.get("key"));
  let rows = "";
  for (const { name } of keys) {
    const e = await env.DATA.get(name, "json"); if (!e) continue;
    const btn = (a, l) => `<form method="post" style="display:inline"><input type="hidden" name="key" value="${key}"><input type="hidden" name="k" value="${esc(name)}"><input type="hidden" name="act" value="${a}"><button>${l}</button></form>`;
    rows += `<li>${evItem(e)}<span class="mute">${esc(e.pc)} · from ${esc(e.contact)}</span><br>${btn("approve", "Approve")} ${btn("delete", "Delete")}</li>`;
  }
  return page("Admin", `<h1>Admin</h1><p>${subs} email subscribers.</p><h2>Events waiting (${keys.length})</h2><ul>${rows || "<li>None</li>"}</ul>`);
}

const about = () => page("Nobody pays to be here", `<p class="mute"><a href="/">2450 Maverick</a></p><h1>Nobody pays to be here.</h1>
<p>Every event, business and listing on this site is here because it's happening in your community, not because anyone paid for it.</p>
<p>If that ever changes, paid spots will be clearly marked, and they'll only go to small local businesses and new start-ups getting off the ground, not big brands with marketing budgets. That's the deal.</p>
<p>Big tech divided us. 2450 Maverick brings communities back together.</p><p><i>Born and built in 2450, raised by the world.</i><br>Brad, <a href="https://maverickdigital.com.ai">Maverick Digital</a></p>
<h2>Your privacy</h2><p>Your postcode and the sections you show or hide are saved on your own phone, not with us. If you sign up for the weekly email we keep your email address and postcode only to send it, and you can unsubscribe any time.</p>`);

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#1a73e8"/><text x="256" y="300" font-family="Arial,sans-serif" font-size="150" font-weight="bold" fill="#fff" text-anchor="middle">2450</text></svg>`;
const MANIFEST = JSON.stringify({ name: "2450 Maverick", short_name: "2450", start_url: "/", display: "standalone", background_color: "#ffffff", theme_color: "#1a73e8",
  icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }] });
const SW = `self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open('v1').then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)))})`;

export default {
  async fetch(req, env) {
    const url = new URL(req.url), p = url.pathname;
    if (p === "/") return home();
    if (p === "/about") return about();
    if (p === "/admin") return admin(req, env);
    if (p === "/submit") return req.method === "POST" ? handleSubmit(req, env) : submitForm((url.searchParams.get("pc") || "2450").replace(/\D/g, "").slice(0, 4));
    if (p === "/subscribe" && req.method === "POST") return handleSubscribe(req, env);
    if (p === "/icon.svg") return new Response(ICON, { headers: { "content-type": "image/svg+xml" } });
    if (p === "/manifest.webmanifest") return new Response(MANIFEST, { headers: { "content-type": "application/manifest+json" } });
    if (p === "/sw.js") return new Response(SW, { headers: { "content-type": "text/javascript" } });
    const m = p.match(/^\/(\d{4})\/?$/);
    if (m) return town(m[1], env);
    return page("Not found", `<h1>Not found</h1><p><a href="/">Find your postcode</a></p>`);
  },
};
