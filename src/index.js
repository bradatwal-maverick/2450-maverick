// 2450 Maverick — free local info, one page per postcode.
// Born and built in 2450, raised by the world. Powered by Maverick Digital.

const TOWNS = {
  "2450": { name: "Coffs Harbour", lat: -30.3022, lon: 153.1189, mlat: -30.30, mlon: 153.15, live: true },
  "2452": { name: "Sawtell", live: false },
  "2454": { name: "Bellingen", live: false },
  "2456": { name: "Woolgoolga", live: false },
};

const SECTIONS = [["today", "At a glance"], ["tools", "Handy tools"], ["alerts", "Alerts"], ["events", "What's on"], ["news", "News"], ["fuel", "Fuel"], ["sea", "Tides & fishing"], ["know", "Know your 2450"], ["council", "Council"], ["sport", "Sport"], ["holidays", "Holidays"], ["surfcams", "Surf cams"], ["beaches", "Beaches"]];

const esc = (s = "") => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const todayISO = () => new Date(Date.now() + 11 * 3600e3).toISOString().slice(0, 10); // Sydney (AEDT)

const CSS = `
:root{--bg:#fff;--fg:#12233f;--gold:#f2b01e;--mute:#5a6578;--link:#2b4a7a;--line:#e2e7ef;--accent:#2b4a7a;--soft:#eef2f8}
@media (prefers-color-scheme:dark){:root{--bg:#0B1526;--fg:#e8edf2;--gold:#f2b01e;--mute:#9aa6b4;--link:#9fb8e0;--line:#24324a;--accent:#7f9fd1;--soft:#13203a}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 Arial,Helvetica,sans-serif}
main{max-width:640px;margin:0 auto;padding:16px}a{color:var(--link)}h1{font-size:1.6rem;margin:.2em 0}
h2{font-size:1.1rem;margin:1.4em 0 .4em;border-bottom:1px solid var(--line);padding-bottom:4px}
.mute{color:var(--mute);font-size:.9rem}input,textarea,button,select{font:inherit;padding:10px;border:1px solid var(--line);border-radius:20px;background:var(--bg);color:var(--fg)}
textarea{border-radius:8px;width:100%}button{cursor:pointer;background:var(--accent);color:var(--bg);border:0;padding:10px 18px}
.home{min-height:70vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}
.big{font-size:3rem;font-weight:bold;letter-spacing:-1px;margin:0}.search{display:flex;gap:8px;margin:20px 0;width:100%;max-width:420px}.search input{flex:1}
ul{padding-left:18px}li{margin:6px 0}footer{border-top:1px solid var(--line);margin-top:40px;padding:16px;text-align:center;color:var(--mute);font-size:.85rem}
label{display:block;margin:10px 0 4px}.row{display:flex;gap:8px;flex-wrap:wrap}.row input{flex:1;min-width:160px}
.hp{position:absolute;left:-9999px}
header.top{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;max-width:640px;margin:0 auto}
.brand{display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--fg);font-weight:bold;font-size:1.1rem}
.badge{background:var(--gold);color:#12233f;border-radius:8px;padding:2px 8px;font-weight:bold;letter-spacing:.5px}
.wave{display:block;width:100%;height:28px;color:var(--soft)}
.card{display:block;background:var(--soft);border-radius:14px;padding:14px 16px;margin:14px 0;text-decoration:none;color:var(--fg)}.card b{color:var(--accent)}
.tile{background:var(--soft);border-color:transparent!important}
.md{display:inline-flex;align-items:center;gap:6px;text-decoration:none;color:var(--fg);font-weight:bold;letter-spacing:2px;font-size:.8rem}
.say{background:var(--gold);color:#12233f;padding:0 5px;border-radius:4px;font-weight:bold}.qs{position:sticky;top:0;background:var(--bg);padding:8px 0;z-index:5}.qs input{width:100%;font-size:1.05rem}.qhit{margin:8px 0}.sq{cursor:pointer}.sq span{margin-left:4px;color:var(--mute)}.my{text-decoration:none;font-weight:bold;font-size:.9rem;background:var(--soft);padding:6px 10px;border-radius:16px}.mav{background:var(--soft);border-radius:14px;padding:14px 16px;margin:12px 0}.mav textarea{margin:8px 0}.micb{font-size:1.1rem;width:100%;padding:14px}#ex label{cursor:pointer}.setlist{list-style:none;padding:0}.setlist li{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);padding:8px 0}.setlist li.off span:first-child{opacity:.45;text-decoration:line-through}.setlist button{padding:6px 12px}.setlist button[disabled]{opacity:.3}.tg{min-width:52px}.pills{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}.pills button{background:var(--soft);color:var(--fg);border-radius:18px;padding:8px 14px;font-size:.95rem}.pills button.on{background:var(--fg);color:var(--bg)}.panel{background:var(--soft);border-radius:14px;padding:4px 16px 12px;margin:8px 0}.panel h2{border:0}.md svg{width:24px;height:21px}.brand .mark{height:22px;width:26px}.chips label{display:inline-block;margin:4px 6px 0 0;padding:6px 10px;border:1px solid var(--line);border-radius:16px;font-size:.9rem}
.chips input{margin-right:4px}.recipes li{margin:10px 0}
.tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}@media(max-width:480px){.tiles{grid-template-columns:repeat(2,1fr)}}
.tile{border:1px solid var(--line);border-radius:12px;padding:10px;text-align:center;display:flex;flex-direction:column;gap:2px}.tile b{font-size:1.25rem}.tile small{color:var(--mute);font-size:.78rem}.ico{font-size:1.6rem}
.note{border:1px solid var(--accent);border-radius:8px;padding:10px}details.pins{margin:8px 0}#know details{margin:6px 0}.src{font-size:.75rem;color:var(--mute);margin:2px 0 8px}.src.warn{color:#9a5b00}@media(prefers-color-scheme:dark){.src.warn{color:#f0b35a}}#know summary{cursor:pointer;padding:6px 0}details.pins label{display:inline-block;margin:4px 12px 0 0}.pins label{display:inline;margin-right:12px;font-size:.9rem}`;

function page(title, body, pc = "") {
  return new Response(`<!doctype html><html lang="en-AU"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<meta name="description" content="Everything on in your town, in one place. Free. Nobody pays to be here.">
<link rel="manifest" href="/manifest.webmanifest"><link rel="icon" href="/icon.svg"><meta name="theme-color" content="#0B1526">
<style>${CSS}</style></head><body><header class="top"><a class="brand" href="/" aria-label="2450 Maverick home"><span class="badge">2450</span><svg viewBox="3 4.5 28 23.5" aria-hidden="true" class="mark"><path d="M5 26 L12 11 L17.5 20 L23 8 L29 26" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="23" cy="8" r="2.6" fill="currentColor"/></svg></a><a href="/me" id="my2450" class="my">⚙️ My 2450</a></header>
<script>try{var n=decodeURIComponent((document.cookie.match(/(?:^|; )m2450n=([^;]*)/)||[])[1]||"")||localStorage.getItem("name");if(n)document.getElementById("my2450").textContent="⚙️ "+n+"\u2019s 2450"}catch(e){}<\/script>
<svg class="wave" viewBox="0 0 1200 40" preserveAspectRatio="none"><path fill="currentColor" d="M0 20 Q150 0 300 20 T600 20 T900 20 T1200 20 V40 H0Z"/></svg><main>${body}</main>
<footer><a href="/">Find your postcode</a> · <a href="/about">Nobody pays to be here</a> · <a href="/feedback">Make 2450 better</a> · <a href="/charter">Charter</a> · <a href="/privacy">Privacy</a>${pc ? ` · <a href="/submit?pc=${pc}">Add an event</a>` : ""}<br>
2450 means Coffs Harbour. Not Brooklana (it's up the Eastern Dorrigo Way, by the way).<br>
Big tech divided us. 2450 Maverick brings communities back together.<br>
Born and built in 2450, raised by the world.<br><br><span style="font-size:.75rem">Powered by</span><br><a class="md" href="https://maverickdigital.com.ai" aria-label="Maverick Digital"><svg viewBox="3 4.5 28 23.5" aria-hidden="true" class="mark"><path d="M5 26 L12 11 L17.5 20 L23 8 L29 26" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="23" cy="8" r="2.6" fill="currentColor"/></svg>MAVERICK DIGITAL</a></footer>
<script>if("serviceWorker"in navigator)navigator.serviceWorker.register("/sw.js").catch(()=>{})</script></body></html>`,
    { headers: { "content-type": "text/html;charset=utf-8" } });
}

const home = () => page("2450 Maverick — what's on in your town", `
<div class="home"><p class="big" aria-label="2450 Maverick">2450<svg viewBox="3 4.5 28 23.5" aria-hidden="true" class="mark" style="height:.85em;margin-left:.12em;vertical-align:-.02em"><path d="M5 26 L12 11 L17.5 20 L23 8 L29 26" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="23" cy="8" r="2.6" fill="currentColor"/></svg></p><p class="mute">Everything on in your town, in one place. Free.</p>
<form class="search" onsubmit="event.preventDefault();var p=this.pc.value.trim();try{localStorage.setItem('pc',p)}catch(e){};location='/'+p">
<input name="pc" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="Your postcode" required aria-label="Your postcode"><button>Go</button></form>
<p id="mine"></p><p class="mute">Live now: <a href="/2450">2450 Coffs Harbour</a>. Coming soon: Sawtell, Bellingen, Woolgoolga.</p>
<a class="card" href="/fridge">🧊 <b>What's in your fridge?</b> Tell us what you've got, get dinner ideas.</a></div>
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
  return { soon: days <= 14, date: days === 0 ? "Today" : new Date(date + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short" }), dir, text: `<b>Clocks ${dir === "back" ? "go back" : "go forward"}</b> ${esc(when)}${days > 1 ? ` (in ${days} days)` : ""}: ${what.replace(/^go (back|forward) /, "")}` };
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
  const soon = (id, title, what, link, linkText) => `<section id="${id}"><h2>${title}</h2><p class="mute">${what}${link ? ` For now: <a href="${link}" rel="noopener">${linkText}</a>.` : ""}</p></section>`;
  return page(`${pc} ${t.name} — what's on`, `
<p class="mute"><a href="/">2450 Maverick</a> › ${esc(pc)}</p><h1>${esc(t.name)} ${esc(pc)}</h1>
<div class="qs"><input id="qs" type="search" placeholder="🔎 What do you need? Try bins, tides, mayor…" autocomplete="off" aria-label="Search 2450">
<div id="qs-saved" class="chips"></div><div id="qs-res"></div></div>
<p class="mute"><span id="date"></span> · <a href="/me">🎤 Make this page yours</a></p>
${cc.soon ? `<p class="note">⏰ ${cc.text}</p>` : ""}
<div id="flow"><section id="today"><div class="tiles">
<div class="tile"><span id="i-wx" class="ico">⛅</span><b id="t-temp">–</b><small id="t-sky">Weather</small></div>
<div class="tile"><span class="ico">🌧️</span><b id="t-rain">–</b><small>Rain chance</small></div>
<div class="tile"><span class="ico">💨</span><b id="t-wind">–</b><small id="t-windd">Wind</small></div>
<div class="tile"><span class="ico">🌅</span><b id="t-rise">–</b><small id="t-set">Sunrise</small></div>
<div class="tile"><span class="ico">🌊</span><b id="t-tide">–</b><small id="t-tide2">Next tide</small></div>
<div class="tile"><span class="ico">🏄</span><b id="t-swell">–</b><small>Swell</small></div>
<div class="tile"><span class="ico" id="i-moon">🌙</span><b id="t-moon">–</b><small>Moon</small></div>
<div class="tile"><span class="ico">⏰</span><b>${esc(cc.date)}</b><small>Clocks ${cc.dir}</small></div>
</div></section>
<section id="tools"><h2>Handy tools</h2>
<a class="card" href="/fridge">🧊 <b>What's in your fridge?</b> Dinner ideas from what you've already got →</a>
<a class="card" href="/birthday">🎂 <b>Birthday deals</b> Which local places look after you on your big day →</a>
<a class="card" href="/genalpha">🗣️ <b>Gen Alpha interpreter</b> What did your kid just say? Jimmy Joel translates →</a>
<a class="card" href="/rip">🕊️ <b>In memory</b> Remembering locals who have recently passed →</a>
<a class="card" href="/school">🚸 <b>School run report</b> Weather and traffic for your school drop-off and pick-up →</a>
</section>
${soon("alerts", "Alerts", "Bushfires, road closures and floods near 2450, coming soon.", "https://www.rfs.nsw.gov.au/fire-information/fires-near-me", "Fires Near Me (NSW Rural Fire Service)")}
<section id="events"><h2>What's on</h2>${events}<p><a href="/submit?pc=${pc}">+ Add an event (free)</a></p></section>
${soon("news", "News", "Local headlines from Coffs news outlets, linked to the full story, coming soon.")}
${soon("fuel", "Fuel", "Cheapest petrol and diesel in 2450 today, coming soon.", "https://www.fuelcheck.nsw.gov.au", "NSW FuelCheck")}
<section id="sea"><h2>Tides &amp; fishing</h2><p id="tide" class="mute">Loading…</p>
<p class="mute">Tide times are modelled estimates. Not for navigation; check the Bureau of Meteorology before boating.</p></section>
<section id="know"><h2>Know your 2450</h2><p class="mute">The handy stuff, all in one place. Every item is sourced and shown as the source has it. We don&rsquo;t edit it, we just tell you where it&rsquo;s from and how current it is.</p>
<details open><summary><b>Who runs the place</b></summary><ul>
<li>Mayor: <b>Cr Nikki Williams</b> · Deputy Mayor: <b>Cr George Cecato</b></li>
<li>Councillors: Cath Fowler, Gurminder Saro, Jonathan Cassell, Julie Sechi, Les Oxford, Paul Amos, Tony Judge. <a href="https://www.coffsharbour.nsw.gov.au/Your-Council/About-Council/Councillors" rel="noopener">Contact them</a></li>
<li><a href="https://www.coffsharbour.nsw.gov.au/Your-Council/About-Council/Council-meetings" rel="noopener">Council meetings</a>: see what's being decided</li></ul><p class="src">Source: <a href="https://www.coffsharbour.nsw.gov.au/Your-Council/About-Council/Councillors" rel="noopener">City of Coffs Harbour, Councillors page</a> · Source shows no &ldquo;last updated&rdquo; date · Checked 16 Oct 2026</p></details>
<details><summary><b>Bins &amp; rubbish</b></summary><ul>
<li>Which bin this week? Get the free <b>Coffs Coast Waste Services</b> app (App Store or Google Play)</li>
<li>Bulky goods (old couch, mattress): book a kerbside pick-up or get free tip vouchers on <a href="tel:1800265495">1800 265 495</a>. Vouchers are posted, so allow 2 weeks</li>
<li>Tip: Englands Road Waste Management Facility</li>
<li>Seen illegal dumping? <a href="https://ridonline.epa.nsw.gov.au/" rel="noopener">Report it online</a></li></ul><p class="src warn">Source: <a href="https://haveyoursay.coffsharbour.nsw.gov.au/bulky-goods-waste-service/faqs" rel="noopener">Council bulky goods FAQ</a> · ⚠️ Source describes changes from March 2018, no newer date shown · Checked 16 Oct 2026</p><p class="src">Source: <a href="https://coffscoast.newsofthearea.com.au/app-solves-the-challenge-of-which-bin-this-week" rel="noopener">News Of The Area (waste app)</a> · Published Aug 2026 · Checked 16 Oct 2026</p></details>
<details><summary><b>Got a problem?</b></summary><ul>
<li>Pothole, broken footpath, streetlight, overgrown block: <a href="https://forms.coffsharbour.nsw.gov.au/RunForm.aspx?formId=1366" rel="noopener">Council request form</a></li>
<li>Pollution or environmental issue: <a href="https://www.coffsharbour.nsw.gov.au/Environment/Compliance-and-reporting/Report-an-environmental-issue" rel="noopener">Report it</a></li>
<li>Not happy with how council handled it? <a href="https://www.ombo.nsw.gov.au" rel="noopener">NSW Ombudsman</a></li></ul><p class="src">Source: <a href="https://www.coffsharbour.nsw.gov.au/Environment/Compliance-and-reporting/Report-an-environmental-issue" rel="noopener">City of Coffs Harbour, Report an environmental issue</a> · Source shows no &ldquo;last updated&rdquo; date · Checked 16 Oct 2026</p></details>
<details><summary><b>Contact council</b></summary><ul>
<li>📞 <a href="tel:0266484000">02 6648 4000</a>, weekdays 8:30am–4:30pm. Same number 24/7 for urgent water, sewer, pollution or animal attacks</li>
<li>✉️ <a href="mailto:coffs.council@chcc.nsw.gov.au">coffs.council@chcc.nsw.gov.au</a></li>
<li>🏛️ Yarrila Place, Level 1, 27 Gordon Street. Weekdays 9am–3:30pm</li></ul><p class="src">Source: <a href="https://www.coffsharbour.nsw.gov.au/Your-Council/Contact-us/Contact-Council" rel="noopener">City of Coffs Harbour, Contact details</a> · Source shows no &ldquo;last updated&rdquo; date · Checked 16 Oct 2026</p></details>
<p class="mute">Spotted something out of date? <a href="/feedback">Let me know</a>.</p></section>
${soon("council", "Council", "Council news, public notices and road works, coming soon.", "https://www.coffsharbour.nsw.gov.au", "Coffs Harbour City Council")}
${soon("sport", "Sport", "Field closures, local games and fixtures, coming soon. Clubs will be able to post them here free.")}
${soon("holidays", "Holidays", "Public and school holiday dates, coming soon.", "https://education.nsw.gov.au/schooling/calendar", "NSW school calendar")}
${soon("surfcams", "Surf cams", "Check the waves live before you head down.", "https://www.coastalwatch.com", "Coastalwatch")}
${soon("beaches", "Beaches", "Patrolled beaches and conditions, coming soon.", "https://beachsafe.org.au", "Beachsafe")}</div>
<p><a class="card" href="/me">🎤 <b>Make this page yours</b> Just tell Mav what you want to see →</a></p>
<h2>This week in ${esc(pc)}</h2><p>One short email a week with what's on. No spam, unsubscribe any time.</p>${signup(pc)}
<script>
try{localStorage.setItem('pc','${pc}')}catch(e){}
var IDX=[["weather temperature rain wind forecast","Weather today","Today's weather, rain chance and wind are in the tiles at the top.","#today"],
["sunrise sunset moon","Sunrise, sunset and moon","See the tiles at the top of the page.","#today"],
["tide tides fishing fish swell waves boat","Tides & fishing","Next high and low tides, waves and swell. Modelled estimates, not for navigation.","#sea"],
["surf cam beach waves","Surf cams","Live cams via Coastalwatch.","#surfcams"],["beach patrol lifeguard swim","Beaches","Patrolled beaches via Beachsafe.","#beaches"],
["event events whats on what's on markets gig music things to do weekend","What's on","Local events, with locals' submissions first.","#events"],
["add event submit list my event","Add an event","List your event free, checked before it goes live.","/submit?pc=2450"],
["mayor deputy councillor councillors council who runs","Who runs the place","Mayor Cr Nikki Williams, Deputy Mayor Cr George Cecato, plus 7 councillors.","#know"],
["bin bins rubbish recycling garbage which bin","Bins","Which bin this week? Get the free Coffs Coast Waste Services app.","#know"],
["bulky couch mattress hard rubbish clean up tip voucher","Bulky goods","Book a pick-up or free tip vouchers: 1800 265 495.","#know"],
["tip dump englands road","The tip","Englands Road Waste Management Facility.","#know"],["dumping illegal dumped","Illegal dumping","Report it online via the NSW EPA (Environment Protection Authority).","#know"],
["pothole footpath streetlight report problem fix overgrown","Report a problem","Use the council request form.","#know"],
["council phone contact email call hours after hours water sewer","Contact council","02 6648 4000 (urgent water, sewer, pollution, animal attacks 24/7).","#know"],
["complaint complain ombudsman unhappy","Complaints","Council first; then the NSW Ombudsman.","#know"],
["fuel petrol diesel servo cheap","Fuel","Cheapest fuel: NSW FuelCheck for now.","#fuel"],["fire fires bushfire flood alert alerts emergency","Alerts","Fires Near Me for now. Emergencies: call 000.","#alerts"],
["traffic road roads closure crash roadworks","Traffic & roads","Live Traffic NSW for now.","/school"],["school drop off pick up school run zone","School run report","Weather and traffic for your school run.","/school"],
["holiday holidays school holidays public holiday","Holidays","NSW school calendar for now.","#holidays"],["sport field fields closure closed footy soccer netball","Sport & field closures","Field closures and fixtures.","#sport"],
["fridge dinner recipe recipes cook cooking food meal","What's in your fridge?","Dinner ideas from what you've got.","/fridge"],["birthday deal deals discount free birthday","Birthday deals","Local places that look after you on your birthday.","/birthday"],
["gen alpha slang kids rizz skibidi translate","Gen Alpha interpreter","Jimmy Joel translates kid-speak.","/genalpha"],["obituary obituaries funeral died death passed rip memory","In memory","Recent local death notices.","/rip"],
["clock clocks daylight saving time change","Clock change","Next clock change is in the tiles at the top.","#today"],["news headlines","News","Local headlines, coming soon.","#news"],
["feedback idea suggestion contact","Make 2450 better","Send us your ideas.","/feedback"],["privacy data","Privacy","Plain-English privacy policy.","/privacy"],["terms charter free","Our charter","Free, forever.","/charter"]];
var qs=document.getElementById('qs'),qr=document.getElementById('qs-res'),qv=document.getElementById('qs-saved');
function esc2(x){return String(x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function saved(){try{return JSON.parse(localStorage.getItem('saved_q')||'[]')}catch(e){return[]}}
function drawSaved(){var a=saved();qv.innerHTML=a.map(function(x){return '<label class="sq">'+esc2(x)+' <span data-x="'+esc2(x)+'" title="Remove">×</span></label>'}).join('')}
qv.onclick=function(e){var x=e.target.dataset.x;if(x){try{localStorage.setItem('saved_q',JSON.stringify(saved().filter(function(y){return y!==x})))}catch(_){}drawSaved();return}
var l=e.target.closest('.sq');if(l){qs.value=l.firstChild.textContent.trim();find()}};
function find(){var v=qs.value.toLowerCase().trim();if(v.length<2){qr.innerHTML='';return}var w=v.split(/\s+/),hits=IDX.map(function(r){var sc=w.filter(function(x){return (r[0]+' '+r[1].toLowerCase()).indexOf(x)>-1}).length;return[sc,r]}).filter(function(x){return x[0]}).sort(function(a,b){return b[0]-a[0]}).slice(0,4).map(function(x){return x[1]});
document.querySelectorAll('#events li').forEach(function(li){if(hits.length<6&&li.textContent.toLowerCase().indexOf(v)>-1)hits.push(['',li.querySelector('b')?li.textContent.slice(0,60):'Event',li.textContent.slice(0,140),'#events'])});
qr.innerHTML=(hits.length?hits.map(function(r){return '<a class="card qhit" href="'+r[3]+'"><b>'+esc2(r[1])+'</b><br><span class="mute">'+esc2(r[2])+'</span></a>'}).join(''):'<p class="mute">Nothing yet. <a href="/feedback">Tell us what you were looking for</a>.</p>')
+'<p class="mute"><a href="#" id="qs-save">☆ Save this search</a> · ⏰ Schedule it: coming soon in your weekly email</p>';
document.getElementById('qs-save').onclick=function(e){e.preventDefault();var a=saved();if(a.indexOf(v)<0){a.unshift(v);a=a.slice(0,8)}try{localStorage.setItem('saved_q',JSON.stringify(a))}catch(_){}drawSaved();this.textContent='★ Saved'}}
qr.onclick=function(e){var a=e.target.closest('a.qhit');if(a&&a.getAttribute('href').charAt(0)=='#'){var t=document.querySelector(a.getAttribute('href'));if(t){t.hidden=false;t.querySelectorAll('details').forEach(function(d){d.open=true})}}};
qs.oninput=find;drawSaved();

document.getElementById('date').textContent=new Date().toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'});
(function(){var f=document.getElementById('flow'),o;try{o=JSON.parse(localStorage.getItem('order')||'null')}catch(e){}
if(o)o.forEach(function(id){var el=document.getElementById(id);if(el&&el.parentNode===f)f.appendChild(el)});
var nav=document.createElement('div');nav.className='pills';var secs=Array.prototype.filter.call(f.children,function(el){var off;try{off=localStorage.getItem('hide_'+el.id)}catch(e){}if(off){el.hidden=true;return false}return el.id!=='today'&&el.querySelector('h2')});
if(!o)secs.sort(function(a,b){return a.querySelector('h2').textContent.localeCompare(b.querySelector('h2').textContent)});
secs.forEach(function(el){el.hidden=true;el.classList.add('panel');var b=document.createElement('button');b.type='button';b.textContent=el.querySelector('h2').textContent;
b.onclick=function(){var open=!el.hidden;secs.forEach(function(x){x.hidden=true});nav.querySelectorAll('button').forEach(function(x){x.classList.remove('on')});if(!open){el.hidden=false;b.classList.add('on');f.appendChild(el);el.scrollIntoView({behavior:'smooth',block:'start'})}};nav.appendChild(b)});
var td=document.getElementById('today');td.parentNode.insertBefore(nav,td.nextSibling)})();
var $=function(i,v){var e=document.getElementById(i);if(e)e.textContent=v};
var W={0:['☀️','Clear'],1:['🌤️','Mostly clear'],2:['⛅','Partly cloudy'],3:['☁️','Cloudy'],45:['🌫️','Fog'],48:['🌫️','Fog'],51:['🌦️','Drizzle'],53:['🌦️','Drizzle'],55:['🌦️','Drizzle'],61:['🌧️','Light rain'],63:['🌧️','Rain'],65:['🌧️','Heavy rain'],80:['🌦️','Showers'],81:['🌧️','Showers'],82:['⛈️','Heavy showers'],95:['⛈️','Storms'],96:['⛈️','Storms'],99:['⛈️','Storms']};
var dirs=['N','NE','E','SE','S','SW','W','NW'],tm=function(s){return new Date(s).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'})};
var age=((Date.now()-Date.UTC(2000,0,6,18,14))/864e5)%29.530588853,mi=Math.round(age/29.53*8)%8;
var MN=[['🌑','New moon'],['🌒','Waxing crescent'],['🌓','First quarter'],['🌔','Waxing gibbous'],['🌕','Full moon'],['🌖','Waning gibbous'],['🌗','Last quarter'],['🌘','Waning crescent']];
$('i-moon',MN[mi][0]);$('t-moon',MN[mi][1]);
fetch('https://api.open-meteo.com/v1/forecast?latitude=${t.lat}&longitude=${t.lon}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&forecast_days=1&timezone=Australia%2FSydney')
.then(function(r){return r.json()}).then(function(d){var c=d.current,y=d.daily,w=W[c.weather_code]||['🌡️',''];
$('i-wx',w[0]);$('t-temp',Math.round(c.temperature_2m)+'°');$('t-sky',w[1]+' · '+Math.round(y.temperature_2m_max[0])+'°/'+Math.round(y.temperature_2m_min[0])+'°');
$('t-rain',y.precipitation_probability_max[0]+'%');$('t-wind',Math.round(c.wind_speed_10m)+' km/h');$('t-windd','Wind from '+dirs[Math.round(c.wind_direction_10m/45)%8]);
$('t-rise',tm(y.sunrise[0]));$('t-set','Sunset '+tm(y.sunset[0]));
}).catch(function(){$('t-sky','Weather unavailable')});
fetch('https://marine-api.open-meteo.com/v1/marine?latitude=${t.mlat}&longitude=${t.mlon}&hourly=sea_level_height_msl,wave_height,swell_wave_height&forecast_days=2&timezone=Australia%2FSydney')
.then(function(r){return r.json()}).then(function(d){var h=d.hourly,s=h.sea_level_height_msl,out=[],now=Date.now();
for(var i=1;i<s.length-1;i++){if(new Date(h.time[i])<now)continue;if(s[i]>s[i-1]&&s[i]>=s[i+1])out.push(['High',h.time[i]]);else if(s[i]<s[i-1]&&s[i]<=s[i+1])out.push(['Low',h.time[i]]);if(out.length>=4)break}
var j=h.time.findIndex(function(x){return new Date(x)>=now});if(j<0)j=0;
if(out.length){$('t-tide',tm(out[0][1]));$('t-tide2','Next '+out[0][0].toLowerCase()+' tide')}
$('t-swell',(h.swell_wave_height[j]||0).toFixed(1)+' m');
document.getElementById('tide').innerHTML=(out.length?out.map(function(o){return o[0]+' '+tm(o[1])}).join(' · '):'Tide times unavailable')+'<br>Waves '+(h.wave_height[j]||0).toFixed(1)+' m · Swell '+(h.swell_wave_height[j]||0).toFixed(1)+' m · Moon: '+MN[mi][1];
}).catch(function(){$('tide','Tides unavailable right now.')});
</script>`, pc);
}

const signup = pc => `<form method="post" action="/subscribe" class="row"><input type="hidden" name="pc" value="${esc(pc)}">
<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<input type="email" name="email" placeholder="Your email" required aria-label="Your email"><button>Sign me up</button></form>
<p class="mute">By signing up you agree to get the weekly email from 2450 Maverick (Maverick Digital). Unsubscribe any time. <a href="/privacy">Privacy</a></p>`;

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
  if (k.startsWith("rpending:")) {
    if (act === "approve") { const v = await env.DATA.get(k); if (v) await env.DATA.put("rip:" + k.slice(9), v); }
    await env.DATA.delete(k);
  }
  if (k.startsWith("bpending:")) {
    if (act === "approve") { const v = await env.DATA.get(k); if (v) await env.DATA.put("bday:" + k.slice(9), v); }
    await env.DATA.delete(k);
  }
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
  const fbk = (await env.DATA.list({ prefix: "fb:" })).keys.slice(-20).reverse();
  let fbl = "";
  for (const { name } of fbk) { const x = await env.DATA.get(name, "json"); if (x) fbl += `<li><b>${esc(x.kind)}</b>: ${esc(x.msg)}<br><span class="mute">${esc(x.name)} ${esc(x.email)} · ${esc(x.at.slice(0, 10))}</span></li>`; }
  const btnB = (a, l, name) => `<form method="post" style="display:inline"><input type="hidden" name="key" value="${key}"><input type="hidden" name="k" value="${esc(name)}"><input type="hidden" name="act" value="${a}"><button>${l}</button></form>`;
  let bl = "";
  for (const { name } of (await env.DATA.list({ prefix: "bpending:" })).keys) { const o = await env.DATA.get(name, "json"); if (o) bl += `${offerItem(o).replace("</li>", "")}<br><span class="mute">from ${esc(o.contact)}</span><br>${btnB("approve", "Approve", name)} ${btnB("delete", "Delete", name)}</li>`; }
  let rl = "";
  for (const { name } of (await env.DATA.list({ prefix: "rpending:" })).keys) { const n = await env.DATA.get(name, "json"); if (n) rl += `${ripItem(n).replace("</li>", "")}<br><span class="mute">from ${esc(n.contact)}. Check with the funeral home first</span><br>${btnB("approve", "Approve", name)} ${btnB("delete", "Delete", name)}</li>`; }
  return page("Admin", `<h1>Admin</h1><p>${subs} email subscribers.</p><h2>In memory notices waiting</h2><ul>${rl || "<li>None</li>"}</ul><h2>Birthday offers waiting</h2><ul>${bl || "<li>None</li>"}</ul><h2>Latest feedback</h2><ul>${fbl || "<li>None</li>"}</ul><h2>Events waiting (${keys.length})</h2><ul>${rows || "<li>None</li>"}</ul>`);
}

const about = () => page("Nobody pays to be here", `<p class="mute"><a href="/">2450 Maverick</a></p><h1>Nobody pays to be here.</h1>
<p>Every event, business and listing on this site is here because it's happening in your community, not because anyone paid for it.</p>
<p><b>This site will never charge you.</b> Not now, not ever. No paywalls, no subscriptions, no paid listings. That's the deal, and it's written into <a href="/charter">our charter</a>.</p>
<p>Big tech divided us. 2450 Maverick brings communities back together.</p><p>A free gift to the community from <a href="https://maverickdigital.com.ai">Maverick Digital</a>.<br><i>Born and built in 2450, raised by the world.</i></p>
<h2>Your privacy</h2><p>Most of your settings live on your own phone, not with us. Read the <a href="/privacy">privacy policy</a>, in plain English.</p>`);

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#0B1526"/><text x="256" y="300" font-family="Arial,sans-serif" font-size="150" font-weight="bold" fill="#fff" text-anchor="middle">2450</text></svg>`;
const MANIFEST = JSON.stringify({ name: "2450 Maverick", short_name: "2450", start_url: "/", display: "standalone", background_color: "#ffffff", theme_color: "#0B1526",
  icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }] });
const SW = `self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open('v1').then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)))})`;


// ---- What's in your fridge? (members only: unlock with email) ----
const cookie = (req, k) => (req.headers.get("cookie") || "").split(/;\s*/).map(c => c.split("=")).find(([n]) => n === k)?.[1];
async function member(req, env) { const t = cookie(req, "m2450"); return t ? await env.DATA.get(`sess:${t}`) : null; }

const FOODS = ["chicken","beef mince","sausages","steak","bacon","ham","fish","prawns","eggs","cheese","milk","cream","butter","yoghurt","tofu",
  "potatoes","onion","garlic","carrots","broccoli","spinach","capsicum","mushrooms","zucchini","tomatoes","lettuce","avocado","pumpkin","lemon",
  "rice","pasta","noodles","bread","wraps","tinned tomatoes","chickpeas","beans","coconut milk","curry paste","pesto"];

const unlockPage = (msg = "") => page("What's in your fridge?", `<h1>🧊 What's in your fridge?</h1>
<p>Tell us what you've got, how many you're feeding and what you like. Get dinner ideas in seconds, with links to the recipes.</p>
<p><b>Free for 2450 members.</b> Pop in your email to unlock it (and get the weekly "This week in 2450" email).</p>${msg}
<form method="post" action="/unlock"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<div class="row"><input name="name" placeholder="First name" maxlength="40"><input type="email" name="email" placeholder="Your email" required></div>
<label class="mute"><input type="checkbox" name="consent" required> Yes, send me the weekly email from 2450 Maverick (Maverick Digital). Unsubscribe any time.</label>
<p><button>Unlock the fridge</button></p></form>`);

async function unlock(req, env) {
  const f = await req.formData(), email = String(f.get("email") || "").trim().toLowerCase();
  if (f.get("website")) return unlockPage();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !f.get("consent")) return unlockPage(`<p class="note">Please add your email and tick the box.</p>`);
  const name = String(f.get("name") || "").slice(0, 40), tok = crypto.randomUUID();
  await env.DATA.put(`sub:${email}`, JSON.stringify({ email, name, pc: "2450", consent: true, source: "fridge", at: new Date().toISOString() }));
  await env.DATA.put(`sess:${tok}`, email, { expirationTtl: 31536000 });
  const h = new Headers({ location: "/fridge" });
  h.append("set-cookie", `m2450=${tok}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`);
  if (name) h.append("set-cookie", `m2450n=${encodeURIComponent(name)}; Path=/; Max-Age=31536000; Secure; SameSite=Lax`);
  return new Response(null, { status: 303, headers: h });
}

const fridgePage = () => page("What's in your fridge?", `<h1>🧊 What's in your fridge?</h1>
<form id="ff"><h2>1. Tick what you've got</h2><div class="chips">${FOODS.map(x => `<label><input type="checkbox" name="i" value="${x}">${x}</label>`).join("")}</div>
<label>Anything else?</label><input name="extra" placeholder="e.g. leftover roast, feta" style="width:100%">
<h2>2. About dinner</h2><div class="row">
<div><label>How many?</label><select name="n"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>5</option><option>6+</option></select></div>
<div><label>Time</label><select name="t"><option value="20">Quick (20 min)</option><option value="40" selected>Normal (40 min)</option><option value="90">No rush</option></select></div>
<div><label>Eating</label><select name="d"><option value="">Anything</option><option>vegetarian</option><option>vegan</option><option>gluten free</option><option>dairy free</option></select></div></div>
<label>What do you like?</label><div class="chips">${["Aussie classic","Italian","Asian","Mexican","Indian","Healthy","Kid friendly"].map(x => `<label><input type="checkbox" name="c" value="${x}">${x}</label>`).join("")}</div>
<p><button>Get dinner ideas</button></p></form><div id="out"></div>
<p class="mute">Ideas link to recipes on other sites. Always check ingredients for allergies.</p>
<script>
var D=[["Chicken stir-fry",["chicken","noodles|rice","capsicum|broccoli|carrots"],"Asian",20,"meat"],["Fried rice",["rice","eggs","onion|carrots"],"Asian",20,"veg"],
["Spaghetti bolognese",["beef mince","pasta","tinned tomatoes|tomatoes"],"Italian",40,"meat"],["Cheesy pasta bake",["pasta","cheese","tinned tomatoes|cream"],"Italian",40,"veg"],
["Pesto pasta",["pasta","pesto"],"Italian",20,"veg"],["Frittata",["eggs","potatoes|zucchini|spinach","cheese|onion"],"Healthy",40,"veg"],
["Omelette",["eggs","cheese|mushrooms|ham|spinach"],"Aussie classic",20,"veg"],["Bangers and mash",["sausages","potatoes"],"Aussie classic",40,"meat"],
["Steak and salad",["steak","lettuce|tomatoes|avocado"],"Aussie classic",20,"meat"],["Chicken curry",["chicken","curry paste|coconut milk","rice"],"Indian",40,"meat"],
["Chickpea curry",["chickpeas","coconut milk|tinned tomatoes","rice|onion"],"Indian",40,"vegan"],["Tacos",["beef mince|chicken|beans","wraps","avocado|lettuce|cheese"],"Mexican",20,"meat"],
["Bean burritos",["beans","wraps","cheese|avocado"],"Mexican",20,"veg"],["Garlic prawns",["prawns","garlic","rice|pasta"],"Asian",20,"meat"],
["Fish and veg tray bake",["fish","potatoes|pumpkin|zucchini","lemon"],"Healthy",40,"meat"],["Mushroom risotto",["rice","mushrooms","onion|cheese|butter"],"Italian",90,"veg"],
["Pumpkin soup",["pumpkin","onion","cream|coconut milk"],"Healthy",40,"vegan"],["Carbonara",["pasta","bacon","eggs","cheese"],"Italian",20,"meat"],
["Toasties",["bread","cheese","ham|tomatoes"],"Kid friendly",20,"veg"],["Chicken wraps",["chicken","wraps","lettuce|avocado|tomatoes"],"Kid friendly",20,"meat"],
["Tofu noodle stir-fry",["tofu","noodles|rice","broccoli|capsicum|carrots"],"Asian",20,"vegan"],["Shepherd's pie",["beef mince","potatoes","carrots|onion"],"Aussie classic",90,"meat"],
["Zucchini slice",["zucchini","eggs","cheese|bacon"],"Kid friendly",40,"veg"],["Roast veg salad",["pumpkin|potatoes","spinach|lettuce","cheese|chickpeas"],"Healthy",40,"veg"],
["Chicken schnitzel",["chicken","eggs","bread"],"Aussie classic",40,"meat"],["Nachos",["beans|beef mince","cheese","tomatoes|avocado"],"Mexican",20,"veg"]];
var veganBad=/eggs|cheese|milk|cream|butter|yoghurt|bacon|ham|chicken|beef|steak|sausages|fish|prawns/,glutenBad=/pasta|noodles|bread|wraps/,dairyBad=/cheese|milk|cream|butter|yoghurt/;
document.getElementById('ff').onsubmit=function(e){e.preventDefault();var f=new FormData(this),have=f.getAll('i').concat(String(f.get('extra')||'').toLowerCase().split(/,\s*/).filter(Boolean)),
likes=f.getAll('c'),n=f.get('n'),t=+f.get('t'),d=f.get('d');
if(!have.length){document.getElementById('out').innerHTML='<p class="note">Tick at least one thing in your fridge.</p>';return}
var res=D.map(function(r){var need=r[1],got=need.filter(function(g){return g.split('|').some(function(x){return have.some(function(h){return h.indexOf(x)>-1||x.indexOf(h)>-1})})}).length,
all=need.join(' '),ok=!(d=='vegetarian'&&r[4]=='meat')&&!(d=='vegan'&&(r[4]!='vegan'&&veganBad.test(all)))&&!(d=='gluten free'&&glutenBad.test(all))&&!(d=='dairy free'&&dairyBad.test(all)&&!/\|/.test(all));
var score=got/need.length+(likes.indexOf(r[2])>-1?.3:0)+(r[3]<=t?.1:-.3);return{r:r,got:got,need:need,score:score,ok:ok}})
.filter(function(x){return x.ok&&x.got>0}).sort(function(a,b){return b.score-a.score}).slice(0,6);
if(!res.length){document.getElementById('out').innerHTML='<p class="note">Slim pickings! Try ticking a few more items.</p>';return}
var q=function(s){return encodeURIComponent(s)};
document.getElementById('out').innerHTML='<h2>Dinner ideas for '+n+'</h2><ul class="recipes">'+res.map(function(x){var r=x.r,missing=x.need.length-x.got,term=r[0]+(d?' '+d:'');
return '<li><b>'+r[0]+'</b> <span class="mute">· '+r[2]+' · ~'+r[3]+' min'+(missing?' · need '+missing+' more thing'+(missing>1?'s':''):' · you have it all!')+'</span><br><a href="https://www.taste.com.au/search-recipes/?q='+q(term)+'" rel="noopener">Recipes on taste.com.au</a> · <a href="https://www.google.com/search?q='+q(term+' recipe serves '+n)+'" rel="noopener">More on Google</a></li>'}).join('')+'</ul>';
document.getElementById('out').scrollIntoView({behavior:'smooth'})};
</script>`);

// ---- School run report (school choice saved on the phone only; nothing about kids is stored by us) ----
const SCHOOLS = ["Coffs Harbour Public School","Narranga Public School","Boambee Public School","Bonville Public School","Korora Public School",
  "Coramba Public School","Nana Glen Public School","Upper Orara Public School","St Augustine's Primary School","Coffs Harbour High School",
  "Orara High School","Coffs Harbour Senior College","Bishop Druitt College","John Paul College","Coffs Harbour Christian Community School"];
const schoolPage = () => { const t = TOWNS["2450"]; return page("School run report", `<p class="mute"><a href="/2450">‹ 2450 Coffs Harbour</a></p>
<h1>🚸 School run report</h1><p>Pick your school once and this page becomes your morning and afternoon check before the school run.</p>
<label>Your school</label><select id="sch" style="width:100%"><option value="">Choose…</option>${SCHOOLS.map(x => `<option>${esc(x)}</option>`).join("")}</select>
<p class="mute">Saved on your phone only.</p>
<div id="rep" hidden>
<div class="tiles"><div class="tile"><span class="ico">🌅</span><b id="am">–</b><small>Drop-off weather</small></div>
<div class="tile"><span class="ico">🏫</span><b id="pm">–</b><small>Pick-up weather</small></div>
<div class="tile"><span class="ico">🚸</span><b>8–9:30am</b><small>School zone 40 km/h</small></div>
<div class="tile"><span class="ico">🚸</span><b>2:30–4pm</b><small>School zone 40 km/h</small></div></div>
<p id="tip" class="note"></p>
<h2>On your route</h2><p class="mute">Crashes, roadworks and closures near <span id="sn"></span>, coming soon. For now: <a href="https://www.livetraffic.com" rel="noopener">Live Traffic NSW</a>.</p>
<h2>School holidays</h2><p class="mute">Holiday and pupil-free day reminders, coming soon. For now: <a href="https://education.nsw.gov.au/schooling/calendar" rel="noopener">NSW school calendar</a>.</p>
<h2>Field closures &amp; weekend sport</h2><p class="mute">Wet-weather field closures and local junior sport fixtures, coming soon. Clubs will be able to post closures here free. For now: <a href="https://www.coffsharbour.nsw.gov.au" rel="noopener">Coffs Harbour City Council</a>.</p>
<h2>Bell times</h2><p class="mute">Your school's own bell times, coming soon. Check the school newsletter or website for now.</p></div>
<script>
var sel=document.getElementById('sch');try{sel.value=localStorage.getItem('school')||''}catch(e){}
function show(){var v=sel.value;try{v?localStorage.setItem('school',v):localStorage.removeItem('school')}catch(e){}
document.getElementById('rep').hidden=!v;document.getElementById('sn').textContent=v;if(!v)return;
fetch('https://api.open-meteo.com/v1/forecast?latitude=${t.lat}&longitude=${t.lon}&hourly=temperature_2m,precipitation_probability&forecast_days=1&timezone=Australia%2FSydney')
.then(function(r){return r.json()}).then(function(d){var h=d.hourly,am=8,pm=15,ra=h.precipitation_probability[am],rp=h.precipitation_probability[pm];
document.getElementById('am').textContent=Math.round(h.temperature_2m[am])+'° · '+ra+'% rain';document.getElementById('pm').textContent=Math.round(h.temperature_2m[pm])+'° · '+rp+'% rain';
var hr=new Date().getHours(),day=new Date().getDay(),tip;
if(day==0||day==6)tip='It’s the weekend. No school run today 🎉';
else if(Math.max(ra,rp)>=50)tip='Rain likely'+(ra>=50?' at drop-off':' at pick-up')+'. Pack the umbrella and allow extra time, wet roads slow everyone down.';
else if(h.temperature_2m[pm]>=30)tip='Hot pick-up. Hats and water bottles today.';
else tip='Looks like a smooth run today. Watch the 40 km/h school zones.';
document.getElementById('tip').textContent=(hr<10?'This morning: ':hr<16?'This arvo: ':'Tomorrow, check again in the morning. Today: ')+tip;
}).catch(function(){document.getElementById('tip').textContent='Weather unavailable right now.'})}
sel.onchange=show;show();
</script>`, "2450"); };

// ---- Feedback: saved, then emailed to Brad ----
const feedbackPage = (msg = "") => page("Make 2450 better", `<h1>💬 Make 2450 better</h1>
<p>This site is for locals, so tell us what would make it more useful. Every message is read by a real person.</p>${msg}
<form method="post" action="/feedback"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<label>What's it about?</label><select name="kind" style="width:100%"><option>An idea for the site</option><option>Something's wrong or out of date</option><option>Add my club, group or event source</option><option>Just saying g'day</option></select>
<label>Your message *</label><textarea name="msg" rows="5" maxlength="2000" required></textarea>
<div class="row"><input name="name" placeholder="Name (optional)" maxlength="60"><input type="email" name="email" placeholder="Email if you'd like a reply" maxlength="120"></div>
<p><button>Send</button></p></form>`);

async function feedback(req, env, ctx) {
  const f = await req.formData();
  if (f.get("website")) return feedbackPage(`<p class="note">Thanks!</p>`);
  const fb = { kind: String(f.get("kind") || "").slice(0, 60), msg: String(f.get("msg") || "").slice(0, 2000),
    name: String(f.get("name") || "").slice(0, 60), email: String(f.get("email") || "").slice(0, 120), at: new Date().toISOString() };
  if (!fb.msg.trim()) return feedbackPage(`<p class="note">Please add a message.</p>`);
  await env.DATA.put(`fb:${fb.at}:${crypto.randomUUID().slice(0, 6)}`, JSON.stringify(fb));
  if (env.MAILER && env.FEEDBACK_TO) ctx.waitUntil((async () => {
    try {
      const { EmailMessage } = await import("cloudflare:email");
      const from = "feedback@2450-maverick.live", clean = x => x.replace(/[\r\n]+/g, " ");
      const raw = [`From: 2450 Maverick <${from}>`, `To: ${env.FEEDBACK_TO}`, fb.email ? `Reply-To: ${clean(fb.email)}` : "",
        `Subject: 2450 feedback: ${clean(fb.kind)}`, `Message-ID: <${crypto.randomUUID()}@2450-maverick.live>`, `Date: ${new Date().toUTCString()}`,
        "MIME-Version: 1.0", "Content-Type: text/plain; charset=utf-8", "",
        `${fb.kind}\n\n${fb.msg}\n\nFrom: ${fb.name || "(no name)"} ${fb.email || "(no email)"}\n${fb.at}`].filter(Boolean).join("\r\n");
      await env.MAILER.send(new EmailMessage(from, env.FEEDBACK_TO, raw));
    } catch (e) { console.log("feedback email failed", e); }
  })());
  return feedbackPage(`<p class="note">Thanks${fb.name ? ", " + esc(fb.name) : ""}! It's on its way to us.</p>`);
}

// ---- Birthday deals (birthday saved on the phone only; offers lodged by businesses, approved in admin) ----
const WHEN = { day: "On your birthday", week: "Your birthday week", month: "Your birthday month" };
const offerItem = o => `<li><b>${esc(o.biz)}</b>: ${esc(o.offer)}<br><span class="mute">${esc(WHEN[o.when] || "")}${o.cond ? " · " + esc(o.cond) : ""} · Say <span class="say">&ldquo;Maverick&rdquo;</span> when you redeem</span></li>`;
async function birthdayPage(env, msg = "") {
  const offers = [];
  for (const { name } of (await env.DATA.list({ prefix: "bday:" })).keys) { const o = await env.DATA.get(name, "json"); if (o) offers.push(o); }
  offers.sort((a, b) => a.biz.localeCompare(b.biz));
  return page("Birthday deals in 2450", `<p class="mute"><a href="/2450">‹ 2450 Coffs Harbour</a></p><h1>🎂 Birthday deals</h1>
<p>Pop in your birthday and see which local places will look after you on your big day.</p>${msg}
<div class="row"><select id="bd-d" aria-label="Day"><option value="">Day</option>${Array.from({ length: 31 }, (_, i) => `<option>${i + 1}</option>`).join("")}</select>
<select id="bd-m" aria-label="Month"><option value="">Month</option>${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => `<option value="${i}">${m}</option>`).join("")}</select></div>
<p class="mute">Just the day and month, saved on your phone only.</p><p id="bd-out" class="note" hidden></p>
<h2>Local birthday deals (${offers.length})</h2><ul>${offers.map(offerItem).join("") || "<li>No deals yet. Know a business that does one? Tell them about this page!</li>"}</ul>
<h2>Own a local business?</h2><p>List your birthday offer free. Nobody pays to be here.</p>
<details><summary><b>Add your birthday offer</b></summary><form method="post" action="/birthday"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<label>Business name *</label><input name="biz" required maxlength="80" style="width:100%">
<label>The offer *</label><input name="offer" required maxlength="140" placeholder="e.g. Free coffee, 20% off your meal" style="width:100%">
<label>When can they use it?</label><select name="when"><option value="day">On their birthday</option><option value="week">Birthday week</option><option value="month">Birthday month</option></select>
<label>Conditions</label><input name="cond" maxlength="140" placeholder="e.g. Show ID, dine-in only, 18+" style="width:100%">
<label>Your email (to confirm, never shown) *</label><input type="email" name="contact" required style="width:100%">
<p class="mute">Customers redeem by saying <span class="say">&ldquo;Maverick&rdquo;</span>. Offers are checked before they go live.</p><p><button>Add my offer</button></p></form></details>
<script>
var d=document.getElementById('bd-d'),m=document.getElementById('bd-m'),o=document.getElementById('bd-out');
try{var b=JSON.parse(localStorage.getItem('bday')||'null');if(b){d.value=b[0];m.value=b[1]}}catch(e){}
function calc(){if(!d.value||m.value===''){o.hidden=true;return}try{localStorage.setItem('bday',JSON.stringify([d.value,m.value]))}catch(e){}
var now=new Date(),t=new Date(now.getFullYear(),now.getMonth(),now.getDate()),b=new Date(now.getFullYear(),+m.value,+d.value);if(b<t)b.setFullYear(b.getFullYear()+1);
var days=Math.round((b-t)/864e5);o.hidden=false;
o.textContent=days===0?'🎉 Happy birthday! Every deal below is yours today. Say "Maverick" to redeem.':days<=7?'🎈 '+days+' day'+(days>1?'s':'')+' to go. Birthday-week deals are nearly on!':'🗓️ '+days+' days to your birthday. We’ll be here.'}
d.onchange=m.onchange=calc;calc();
</script>`, "2450");
}
async function lodgeOffer(req, env) {
  const f = await req.formData();
  if (f.get("website") || !f.get("biz") || !f.get("offer")) return birthdayPage(env);
  const o = { biz: String(f.get("biz")).slice(0, 80), offer: String(f.get("offer")).slice(0, 140), when: ["day","week","month"].includes(f.get("when")) ? f.get("when") : "day",
    cond: String(f.get("cond") || "").slice(0, 140), contact: String(f.get("contact") || "").slice(0, 120), at: new Date().toISOString() };
  await env.DATA.put(`bpending:${crypto.randomUUID().slice(0, 8)}`, JSON.stringify(o));
  return birthdayPage(env, `<p class="note">Thanks, ${esc(o.biz)}! Your offer will appear once it's checked.</p>`);
}

// ---- Charter (terms) and privacy policy. Update the date whenever either changes. ----
const UPDATED = "16 October 2026";
const charter = () => page("Our charter", `<p class="mute"><a href="/">2450 Maverick</a></p><h1>Our charter</h1>
<p class="mute">Our terms, in plain English. Last updated ${UPDATED}.</p>
<h2>1. Free, forever</h2><p>2450 Maverick will never charge you. No paywalls, no subscriptions, no paid listings, no fees to locals, clubs or businesses. It's run by <a href="https://maverickdigital.com.ai">Maverick Digital</a> as a free gift to the community.</p>
<h2>2. Nobody pays to be here</h2><p>Every event, offer and listing is here because it's happening locally, never because someone paid. We don't sell placement, rankings or reviews.</p>
<h2>3. We source, we don't spin</h2><p>Information like council details, weather and tides comes from other organisations. We show it as they publish it, name the source, and show how current the source says it is. If a source is out of date or wrong, we'll say so factually. We don't rewrite their information.</p>
<h2>4. Check before you rely on it</h2><p>We work hard to keep things right, but information here can be out of date, incomplete or wrong. Always check the original source for anything important.</p>
<ul><li><b>Emergencies:</b> this site is not an emergency service. Call <a href="tel:000">000</a>.</li>
<li><b>Tides and swell</b> are modelled estimates, not for navigation. Check the Bureau of Meteorology before boating.</li>
<li><b>Fires, floods and roads:</b> follow official sources and emergency services.</li></ul>
<h2>5. What you post</h2><p>When you add an event, offer or feedback, you confirm it's true, local and yours to share, and you let us show it on this site. We check everything before it goes live and may edit for length, decline or remove anything, including anything misleading, hateful, illegal, spammy or unsafe.</p>
<h2>6. Birthday deals and other offers</h2><p>Offers are made by the businesses, not us. Each business sets its own conditions and decides whether to honour them. Saying &ldquo;Maverick&rdquo; is just how you let them know where you found the deal.</p>
<h2>7. Links to other sites</h2><p>We link to lots of useful websites. They're not ours and we're not responsible for them. If something there charges, that's between you and them.</p>
<h2>8. Fair play</h2><p>Please don't misuse the site, scrape it in bulk, try to break it or post on someone else's behalf without permission.</p>
<h2>9. The legal bit</h2><p>The site is provided free and as is. To the extent the law allows, we're not liable for loss from using it. Nothing here limits your rights under the Australian Consumer Law. These terms are governed by the laws of New South Wales.</p>
<h2>10. Changes</h2><p>If we change this charter, we'll update the date at the top. Rule 1 won't change.</p>
<p>Questions? <a href="/feedback">Talk to us</a>. <i>Maverick Digital</i></p>`);

const privacy = () => page("Privacy policy", `<p class="mute"><a href="/">2450 Maverick</a></p><h1>Privacy policy</h1>
<p class="mute">Plain English. Last updated ${UPDATED}.</p>
<p>We collect as little as we can, we never sell it, and we follow the Australian Privacy Principles.</p>
<h2>Kept on your phone, not with us</h2><p>Your postcode, which sections you show or hide, your school and your birthday (day and month only) are saved in your own browser. We never see them. Clear your browser data and they're gone.</p>
<h2>What we do keep</h2><ul>
<li><b>Weekly email or fridge sign-up:</b> your email, first name if you give it, postcode and that you agreed to the email.</li>
<li><b>Events and birthday offers:</b> what you submit, plus a contact email so we can check details. The email is never shown publicly.</li>
<li><b>Feedback:</b> your message, and your name and email only if you add them.</li>
<li><b>Fridge login:</b> one cookie that keeps the fridge tool unlocked on your phone for up to a year.</li></ul>
<p>We don't ask for anything about your family or personal life beyond the basic contact details needed to make the site work.</p>
<h2>How we use it</h2><p>To run the site, send the email you asked for, check submissions and reply to you. Your details may be used to tell you about Maverick Digital in the weekly email, which you can stop any time. We never sell, rent or trade your details.</p>
<h2>Who else is involved</h2><ul>
<li><b>Cloudflare</b> hosts the site, stores our data and sends our emails. Like any website host, it processes basic visit data such as your internet address.</li>
<li><b>Open-Meteo</b> provides weather and tides. Your browser asks it for Coffs Harbour's forecast, so it sees a request from your device, but no personal details from us.</li>
<li>If we move our email list to a mailing service, we'll name it here.</li></ul>
<h2>Your choices</h2><ul>
<li>Unsubscribe from any email at any time.</li>
<li>Ask what we hold about you, ask us to fix it, or ask us to delete it, through the <a href="/feedback">feedback form</a>. We'll sort it within 30 days.</li>
<li>Email sign-ups are for people aged 16 and over.</li></ul>
<h2>Keeping it safe</h2><p>Data is stored on Cloudflare's secure systems and only Maverick Digital can access the admin area. If something ever goes wrong with your data, we'll tell you.</p>
<h2>Not happy?</h2><p>Tell us first through the <a href="/feedback">feedback form</a>. You can also contact the <a href="https://www.oaic.gov.au" rel="noopener">Office of the Australian Information Commissioner</a>.</p>`);

// ---- Gen Alpha interpreter, hosted by Jimmy Joel (both directions; clean terms only) ----
const SLANG = [["rizz","Charm, being good at flirting or winning people over","He's got rizz"],["skibidi","Nonsense word from a viral video. Can mean cool, bad or nothing at all","That's so skibidi"],
["sigma","A cool, independent lone wolf type","He's such a sigma"],["Ohio","Weird, cringe or random","That's so Ohio"],["fanum tax","Stealing a bit of someone's food","Fanum tax on your chips"],
["mewing","A jawline exercise; doing it means 'don't talk to me right now'","Can't talk, I'm mewing"],["mid","Average, nothing special","The movie was mid"],["bussin","Really good, usually food","This pasta is bussin"],
["no cap","No lie, seriously","No cap, it was huge"],["cap","A lie","That's cap"],["bet","OK, deal, will do","Clean your room? Bet"],["slay","Did something brilliantly","You slayed that test"],
["ate","Did it perfectly (also 'ate and left no crumbs')","She ate that"],["delulu","Delusional, unrealistic","He's delulu if he thinks he'll win"],["NPC","Someone boring who just follows the crowd (from video games: non-player character)","Stop being an NPC"],
["aura","Your cool factor. Do something cringe and you 'lose aura'","Minus 1000 aura"],["glazing","Over-praising someone, sucking up","Stop glazing the teacher"],["sus","Suspicious, dodgy","That's kinda sus"],
["lowkey","A bit, quietly, secretly","I lowkey love this"],["highkey","Very, openly","I highkey need a nap"],["it's giving","It has the vibe of","It's giving summer"],["rent free","Can't stop thinking about it","That song lives rent free in my head"],
["touch grass","Go outside, get off your screen","Bro needs to touch grass"],["cooked","In big trouble, done for","I didn't study, I'm cooked"],["crash out","Lose your temper, overreact","He crashed out over Fortnite"],
["6 7 (six seven)","A meme number with no real meaning. Kids shout it to be funny","What's 6 plus 7? SIX SEVEN!"],["brain rot","Silly, low-quality online content (or what it does to you)","Too much brain rot today"],
["GOAT","Greatest of all time","Messi is the GOAT"],["W / L","Win / loss. Something good or bad","Pizza night is a W"],["yap","Talking too much","She won't stop yapping"],
["chat","Talking to an imaginary audience, like a streamer","Chat, is this real?"],["lock in","Focus hard","I need to lock in for exams"],["mogging","Outshining someone, usually in looks","He's mogging everyone"],
["fr","For real","That's crazy fr"],["ong","On God. I swear","Ong I didn't do it"],["bruh","Exasperated 'mate'","Bruh. Seriously?"],["main character","Acting like the star of the show","Main character energy"],
["the ick","Instant turn-off","Socks with sandals gives me the ick"],["based","Holding your own opinion without caring what others think","That take is based"],["opp","Opponent, enemy, someone against you","He's an opp now"],
["glow up","A big improvement in looks or confidence","What a glow up"],["sending me","Making me laugh a lot","This video is sending me"]];
const PARENT = [["that's great|that's good|awesome|brilliant","That's a W / that's bussin (for food)"],["are you lying|you're lying|is that true","Cap? / Is that cap?"],["go outside|get off your phone|get off the screen","Go touch grass"],
["stop talking|you talk too much","Stop yapping"],["i'm serious|seriously|i mean it","No cap / fr"],["that's average|it's ok|not bad","It's mid"],["okay|deal|will do|alright","Bet"],["you look great|well done|great job","You ate / you slayed"],
["you're in trouble|you're in big trouble","You're cooked"],["focus|do your homework|concentrate","Lock in"],["that's weird|that's strange","That's so Ohio"],["that's suspicious|that's dodgy","That's sus"],
["calm down|don't overreact","Don't crash out"],["you're showing off|stop sucking up","Stop glazing"],["can i have some|i'm taking one","Fanum tax"],["i love you","Lowkey you're the GOAT (they'll still roll their eyes)"],
["that's funny|that's hilarious","That's sending me"],["you're kidding|you're joking","You're delulu"],["it's cool|so cool","That's got aura"],["listen everyone|everyone listen","Chat, listen up"]];
const genAlpha = () => page("Gen Alpha interpreter", `<p class="mute"><a href="/2450">‹ 2450 Coffs Harbour</a></p><h1>🗣️ Gen Alpha interpreter</h1>
<p>No idea what the kids are saying? <b>Jimmy Joel</b> has you covered. Type a word they used, or flip it and find out how they'd say what you mean.</p>
<div class="row"><button type="button" id="m1">Kid → Parent</button><button type="button" id="m2" style="background:var(--soft);color:var(--fg)">Parent → Kid</button></div>
<p><input id="q" placeholder="Type what they said, e.g. rizz" style="width:100%" autocomplete="off"></p><div id="res"></div>
<details><summary><b>See all ${SLANG.length} words</b></summary><ul>${SLANG.map(([w, m]) => `<li><b>${esc(w)}</b>: ${esc(m)}</li>`).join("")}</ul></details>
<p class="mute">Slang moves fast. Heard a new one? <a href="/feedback">Send it to Jimmy</a>.</p>
<script>
var S=${JSON.stringify(SLANG)},P=${JSON.stringify(PARENT)},mode=1,q=document.getElementById('q'),r=document.getElementById('res'),b1=document.getElementById('m1'),b2=document.getElementById('m2');
function e(x){return x.replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
function set(m){mode=m;b1.style.cssText=m==1?'':'background:var(--soft);color:var(--fg)';b2.style.cssText=m==2?'':'background:var(--soft);color:var(--fg)';
q.placeholder=m==1?'Type what they said, e.g. rizz':'Type what you mean, e.g. you are in trouble';go()}
function go(){var v=q.value.toLowerCase().trim().replace(/[?!.,]/g,'');if(!v){r.innerHTML='';return}var h;
if(mode==1){h=S.filter(function(s){var w=s[0].toLowerCase();return w.indexOf(v)>-1||v.indexOf(w.split(' ')[0])>-1}).slice(0,5).map(function(s){return '<p class="card"><b>'+e(s[0])+'</b><br>'+e(s[1])+'<br><span class="mute">e.g. &ldquo;'+e(s[2])+'&rdquo;</span></p>'}).join('')}
else{h=P.filter(function(p){return p[0].split('|').some(function(k){return v.indexOf(k)>-1||k.indexOf(v)>-1})}).slice(0,3).map(function(p){return '<p class="card">Say: <b>'+e(p[1])+'</b></p>'}).join('')}
r.innerHTML=h||'<p class="mute">Jimmy’s stumped on that one. <a href="/feedback">Teach him</a>.</p>'}
b1.onclick=function(){set(1)};b2.onclick=function(){set(2)};q.oninput=go;
</script>`, "2450");

// ---- In memory: local death notices, sourced from funeral homes (approved in admin; shown for 60 days) ----
const ripItem = n => `<li><b>${esc(n.name)}</b>${n.age ? `, ${esc(n.age)}` : ""}<br><span class="mute">Passed ${esc(fmtDate(n.date))}${n.service ? ` · ${esc(n.service)}` : ""}</span><br>
<span class="src">Source: ${n.link ? `<a href="${esc(n.link)}" rel="nofollow noopener">${esc(n.home)}</a>` : esc(n.home)}</span></li>`;
async function ripPage(env, msg = "") {
  const since = new Date(Date.now() - 60 * 864e5).toISOString().slice(0, 10), list = [];
  for (const { name } of (await env.DATA.list({ prefix: "rip:" })).keys) { if (name.split(":")[1] < since) continue; const n = await env.DATA.get(name, "json"); if (n) list.push(n); }
  list.sort((a, b) => b.date.localeCompare(a.date));
  return page("In memory", `<p class="mute"><a href="/2450">‹ 2450 Coffs Harbour</a></p><h1>🕊️ In memory</h1>
<p>Remembering locals who have passed away in the last two months. Rest in peace.</p>${msg}
<ul>${list.map(ripItem).join("") || '<li class="mute">No notices listed yet.</li>'}</ul>
<p class="mute">Every notice is sourced from the funeral home and links to their official notice for full service details.</p>
<h2>Funeral homes and families</h2><p>List a notice free. We check every notice with the funeral home before it goes up.</p>
<details><summary><b>Add a notice</b></summary><form method="post" action="/rip"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<label>Full name *</label><input name="name" required maxlength="100" style="width:100%">
<div class="row"><div><label>Age</label><input name="age" maxlength="10"></div><div><label>Date of passing *</label><input type="date" name="date" required max="${todayISO()}"></div></div>
<label>Service (date, time, place)</label><input name="service" maxlength="200" style="width:100%">
<label>Funeral home *</label><input name="home" required maxlength="100" style="width:100%">
<label>Link to the funeral home's notice *</label><input type="url" name="link" required maxlength="300" style="width:100%">
<label>Your email (to confirm, never shown) *</label><input type="email" name="contact" required style="width:100%">
<p><button>Submit notice</button></p></form></details>`, "2450");
}
async function lodgeRip(req, env) {
  const f = await req.formData(), date = String(f.get("date") || ""), link = String(f.get("link") || "");
  if (f.get("website") || !f.get("name") || !f.get("home") || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^https?:\/\//.test(link)) return ripPage(env, `<p class="note">Please fill in the required details.</p>`);
  const n = { name: String(f.get("name")).slice(0, 100), age: String(f.get("age") || "").slice(0, 10), date, service: String(f.get("service") || "").slice(0, 200),
    home: String(f.get("home")).slice(0, 100), link: link.slice(0, 300), contact: String(f.get("contact") || "").slice(0, 120), at: new Date().toISOString() };
  await env.DATA.put(`rpending:${date}:${crypto.randomUUID().slice(0, 8)}`, JSON.stringify(n));
  return ripPage(env, `<p class="note">Thank you. We'll confirm with the funeral home and add the notice soon.</p>`);
}

// ---- My 2450: tell Mav (voice or text) and he sets up the page. Settings stay on the phone. ----
const KEYS = { tools: "kid kids school son daughter children family cook cooking dinner recipe food fridge birthday", alerts: "fire fires flood drive driving commute roads traffic storm",
  events: "events gig gigs music markets going out weekend things to do festival", news: "news headlines what's happening", fuel: "fuel petrol diesel car drive driving commute ute",
  sea: "fish fishing boat tide tides surf surfing swell kayak", know: "council bins rubbish rates new to town moved mayor", council: "council rates development roadworks",
  sport: "sport footy soccer netball cricket kids sport field rugby", holidays: "school holidays kids school family", surfcams: "surf surfing waves board", beaches: "beach beaches swim swimming patrol dog" };
function mavGuess(text) {
  const t = " " + text.toLowerCase() + " ", score = {};
  for (const [id, ws] of Object.entries(KEYS)) score[id] = ws.split(" ").filter(w => w && t.includes(" " + w)).length;
  const ids = SECTIONS.map(x => x[0]).filter(id => id !== "today");
  const order = ["today", ...ids.filter(id => score[id] > 0).sort((a, b) => score[b] - score[a]), ...ids.filter(id => !score[id])];
  const hits = order.filter(id => score[id] > 0).map(id => SECTIONS.find(x => x[0] === id)[1]);
  return { order, hide: [], name: "", say: hits.length ? `Easy! I've put ${hits.slice(0, 3).join(", ")} up the top for you.` : "Done! Tell me a bit more, like 'I fish and have two kids', and I'll sharpen it up." };
}
async function mav(req, env) {
  let text = "";
  try { text = String((await req.json()).text || "").slice(0, 500); } catch (e) {}
  const guess = mavGuess(text);
  if (!text.trim() || !env.AI) return Response.json(guess);
  try {
    const list = SECTIONS.map(([id, l]) => `${id} = ${l}`).join("; ");
    const r = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", { max_tokens: 250, messages: [
      { role: "system", content: `You set up a free local info page for Coffs Harbour, Australia. Sections (id = name): ${list}. "tools" holds: dinner ideas from your fridge, birthday deals, Gen Alpha slang interpreter, death notices, school run report. Reply with ONLY JSON: {"order": [every section id, most useful for this person first, "today" first unless they say otherwise], "hide": [ids they clearly don't want], "name": "their first name if they said it, else empty", "say": "one warm, casual Aussie sentence under 25 words telling them what you set up"}` },
      { role: "user", content: text }] });
    const j = JSON.parse(String(r.response || "").match(/\{[\s\S]*\}/)[0]), valid = SECTIONS.map(x => x[0]);
    const order = [...new Set((j.order || []).filter(id => valid.includes(id)))]; valid.forEach(id => order.includes(id) || order.push(id));
    return Response.json({ order, hide: (j.hide || []).filter(id => valid.includes(id) && id !== "today"),
      name: String(j.name || "").replace(/[^\p{L} '-]/gu, "").slice(0, 30), say: String(j.say || guess.say).slice(0, 200) });
  } catch (e) { return Response.json(guess); }
}
const mePage = () => page("My 2450", `<h1>🎤 Make 2450 yours</h1>
<div class="mav"><p><b>G'day<span id="hi"></span>, I'm Mav.</b> No fiddly settings. Just tell me about your day and what you care about, and I'll set up your page.</p>
<div class="row"><button type="button" id="mic" class="micb">🎤 Tap and talk</button></div>
<textarea id="say" rows="3" maxlength="500" placeholder="e.g. I'm Megan, I've got two kids at Coffs Public, I love the markets and my husband fishes"></textarea>
<div class="chips" id="ex"><label>I fish and surf</label><label>Two kids, school run, footy on weekends</label><label>New to town, what's on?</label><label>Just weather and bins please</label></div>
<p><button type="button" id="go">✨ Set me up</button></p><p id="reply" class="note" hidden></p></div>
<h2>Your 2450</h2><p class="mute">Move things up or down, or switch them off. It saves as you go, on your phone only.</p>
<label>What should we call you?</label><input id="nm" maxlength="30" placeholder="First name" style="width:100%">
<ul id="list" class="setlist"></ul>
<p><a class="card" href="/2450">👀 <b>See my 2450</b> →</a></p><p class="mute"><a href="#" id="reset">Start again</a></p>
<script>
var S=${JSON.stringify(SECTIONS)},L=document.getElementById('list');
function g(k){try{return localStorage.getItem(k)}catch(e){return null}}function p(k,v){try{v===null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}}
function order(){var o;try{o=JSON.parse(g('order')||'null')}catch(e){}var ids=S.map(function(x){return x[0]});o=(o||[]).filter(function(i){return ids.indexOf(i)>-1});ids.forEach(function(i){if(o.indexOf(i)<0)o.push(i)});return o}
function lab(id){return S.filter(function(x){return x[0]==id})[0][1]}
function draw(){var o=order();L.innerHTML=o.map(function(id,i){var off=g('hide_'+id);return '<li class="'+(off?'off':'')+'"><span>'+lab(id)+'</span><span><button type="button" data-u="'+i+'" aria-label="Move up"'+(i?'':' disabled')+'>↑</button> <button type="button" data-d="'+i+'" aria-label="Move down"'+(i<o.length-1?'':' disabled')+'>↓</button> <button type="button" data-t="'+id+'" class="tg">'+(off?'Off':'On')+'</button></span></li>'}).join('')}
L.onclick=function(e){var b=e.target,o=order(),i;if(b.dataset.u){i=+b.dataset.u;o.splice(i-1,0,o.splice(i,1)[0])}else if(b.dataset.d){i=+b.dataset.d;o.splice(i+1,0,o.splice(i,1)[0])}else if(b.dataset.t){p('hide_'+b.dataset.t,g('hide_'+b.dataset.t)?null:'1')}else return;p('order',JSON.stringify(o));draw()};
var nm=document.getElementById('nm');nm.value=g('name')||decodeURIComponent((document.cookie.match(/(?:^|; )m2450n=([^;]*)/)||[])[1]||'');function hi(){document.getElementById('hi').textContent=nm.value?' '+nm.value:''}hi();
nm.oninput=function(){p('name',nm.value.trim()||null);hi()};
var ta=document.getElementById('say');document.getElementById('ex').onclick=function(e){if(e.target.tagName=='LABEL'){ta.value=e.target.textContent;ta.focus()}};
var SR=window.SpeechRecognition||window.webkitSpeechRecognition,mic=document.getElementById('mic');
if(!SR){mic.textContent='🎤 Use the mic on your keyboard';mic.onclick=function(){ta.focus()}}else{mic.onclick=function(){var r=new SR();r.lang='en-AU';r.interimResults=true;mic.textContent='👂 Listening… tap Set me up when done';
r.onresult=function(e){ta.value=Array.prototype.map.call(e.results,function(x){return x[0].transcript}).join(' ')};r.onend=function(){mic.textContent='🎤 Tap and talk'};r.onerror=r.onend;r.start()}}
document.getElementById('go').onclick=function(){var b=this,rp=document.getElementById('reply');if(!ta.value.trim()){ta.focus();return}b.disabled=true;b.textContent='Mav is thinking…';
fetch('/mav',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:ta.value})}).then(function(r){return r.json()}).then(function(j){
p('order',JSON.stringify(j.order));S.forEach(function(x){p('hide_'+x[0],(j.hide||[]).indexOf(x[0])>-1?'1':null)});if(j.name&&!nm.value){nm.value=j.name;p('name',j.name);hi()}
rp.hidden=false;rp.textContent='🗣️ '+j.say;draw()}).catch(function(){rp.hidden=false;rp.textContent='Mav dropped the ball. Try again?'}).then(function(){b.disabled=false;b.textContent='✨ Set me up'})};
document.getElementById('reset').onclick=function(e){e.preventDefault();p('order',null);S.forEach(function(x){p('hide_'+x[0],null)});draw()};
draw();
</script>`, "2450");

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url), p = url.pathname;
    if (p === "/") return home();
    if (p === "/about") return about();
    if (p === "/me") return mePage();
    if (p === "/mav" && req.method === "POST") return mav(req, env);
    if (p === "/rip") return req.method === "POST" ? lodgeRip(req, env) : ripPage(env);
    if (p === "/genalpha") return genAlpha();
    if (p === "/charter") return charter();
    if (p === "/privacy") return privacy();
    if (p === "/birthday") return req.method === "POST" ? lodgeOffer(req, env) : birthdayPage(env);
    if (p === "/feedback") return req.method === "POST" ? feedback(req, env, ctx) : feedbackPage();
    if (p === "/school") return schoolPage();
    if (p === "/fridge") return (await member(req, env)) ? fridgePage() : unlockPage();
    if (p === "/unlock" && req.method === "POST") return unlock(req, env);
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
