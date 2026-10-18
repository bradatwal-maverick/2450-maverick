// ---- Key areas: Mums, Dads, Kid Zone, Singles, LGBTQIA+. Shown up front on every postcode page, right under the
// postcode tabs, even when an area has little in it yet (then Team Smarketing says plainly it's on it).
export const AREAS = [["/kids", "🧒", "Kid Zone"], ["/mums", "👩‍👧", "Mums"], ["/dads", "👨‍👧", "Dads"], ["/singles", "💞", "Singles"], ["/lgbtqia", "🏳️‍🌈", "LGBTQIA+"]];
export const areasStrip = pc => `<nav class="areas" aria-label="Key areas">${AREAS.map(([u, i, n]) => `<a href="${u}${u === "/kids" ? "" : "?pc=" + pc}"><span>${i}</span>${n}</a>`).join("")}</nav>`;

export function areaPages({ esc, page, wip, R, TOWNS, SCHOOL_HOLS, todayISO }) {
  const back = pc => `<p class="mute"><a href="/${pc}">‹ ${pc} ${esc(TOWNS[pc].name)}</a></p>`;
  const pcOf = url => { const p = (url.searchParams.get("pc") || "").replace(/\D/g, "").slice(0, 4); return TOWNS[p]?.live ? p : R.code; };
  const card = (u, i, b, d) => `<a class="card" href="${u}">${i} <b>${b}</b> ${d} →</a>`;

  // Countdowns parents can switch on or off (saved on their phone).
  const countdowns = () => { const t = todayISO(), y = +t.slice(0, 4), xmas = `${t.slice(5) > "12-25" ? y + 1 : y}-12-25`, h = SCHOOL_HOLS.find(([, , end]) => end >= t);
    const items = [h && ["hols", "🏖️", `${h[0]} school holidays`, h[1]], ["xmas", "🎄", "Christmas", xmas]].filter(Boolean);
    return `<div class="cdown">${items.map(([k, i, n, d]) => `<div class="cd" data-k="${k}" data-d="${d}"><span>${i}</span><b class="cdn">–</b><small>${n}</small><button type="button" class="cdx" aria-label="Hide this countdown">×</button></div>`).join("")}</div>
<p class="mute cdoff" hidden><a href="#" id="cdon">Show hidden countdowns</a></p>
<script>(function(){var T=Date.parse('${t}T00:00:00Z');document.querySelectorAll('.cd').forEach(function(c){var n=Math.round((Date.parse(c.dataset.d+'T00:00:00Z')-T)/864e5);c.querySelector('.cdn').textContent=n<=0?'Now!':n+(n===1?' sleep':' sleeps');
var off=null;try{off=localStorage.getItem('cd_off_'+c.dataset.k)}catch(e){}if(off){c.hidden=true;document.querySelector('.cdoff').hidden=false}
c.querySelector('.cdx').onclick=function(){c.hidden=true;try{localStorage.setItem('cd_off_'+c.dataset.k,'1')}catch(e){}document.querySelector('.cdoff').hidden=false}});
document.getElementById('cdon').onclick=function(e){e.preventDefault();document.querySelectorAll('.cd').forEach(function(c){c.hidden=false;try{localStorage.removeItem('cd_off_'+c.dataset.k)}catch(_){}});document.querySelector('.cdoff').hidden=true}})()<\/script>`; };

  const traffic = `<a class="card" href="https://www.livetraffic.com" id="trf" rel="noopener">🚗 <b>Traffic near me, right now</b> Crashes, roadworks and closures from Live Traffic NSW →</a>
<script>(function(){var a=document.getElementById('trf');if(!a||!navigator.geolocation)return;a.addEventListener('click',function(e){e.preventDefault();navigator.geolocation.getCurrentPosition(function(p){location.href='https://www.livetraffic.com/?lat='+p.coords.latitude.toFixed(3)+'&lng='+p.coords.longitude.toFixed(3)+'&zoom=13'},function(){location.href=a.href},{timeout:6000})})})()<\/script>`;

  const parents = (pc, who) => { const t = TOWNS[pc];
    return page(`${who} in ${t.name}`, `${back(pc)}<h1>${who === "Mums" ? "👩‍👧" : "👨‍👧"} ${who} in ${esc(t.name)}</h1>
<p>Everything a local ${who === "Mums" ? "mum" : "dad"} checks, in one spot. No ads, no opinions.</p>
<h2>⏳ Countdowns</h2>${countdowns()}
<h2>🎒 School</h2>
${card("/school", "🚸", "School run check", "Pick your school once: drop-off and pick-up weather, school zones and holidays")}
${traffic}
<p class="mute">School closed for a fire, flood or storm? Closures are announced by the <a href="https://education.nsw.gov.au" rel="noopener">NSW Department of Education</a> and on your school's own app or website, which also has its phone number.</p>
<h2>🌳 For the kids</h2>
${card("/kids", "🧒", "Kid Zone", "Safe games for 12 and under, with your OK. No chat, no ads, nothing collected")}
${card("/kids/parent", "🔐", "Kid Zone secret word", "Set a word your kids need to get in")}
${card(`/${pc}#kids`, "🌳", "Get outside this weekend", "Affordable things to do outdoors with the kids")}
${card(`/${pc}#award`, "🏅", "Mini Maverick Award", "$25, $15 and $10 each month for the top 3 Kid Zone players")}
<h2>👋 Your village</h2>
${card(`/${pc}#events`, "🎪", "Community events", "Locals first, free to add")}
${card("/notices", "📌", "Community notice board", "Lost pets, volunteers, clubs and classes")}
${card(`/bdm`, "🎉", "Births & marriages", "New babies and big days, shared by local families")}
${wip(`${who}' groups, playgroups and catch-ups in ${esc(t.name)}, all in one list. Run one? You'll be able to add it free`, "/feedback", "telling us yours")}`, pc); };

  const singles = pc => { const t = TOWNS[pc];
    return page(`Singles in ${t.name}`, `${back(pc)}<h1>💞 Singles in ${esc(t.name)}</h1><p>Meet people the old-fashioned way: in real life, in your own town.</p>
${card(`/${pc}#tonight`, "📅", "What's on tonight", "Live music, trivia, specials and member nights")}
${card(`/${pc}#events`, "🎪", "Community events", "Get out and meet your neighbours")}
${card("/notices", "📌", "Clubs and classes", "Join something: sport, art, volunteering")}
${card("/open?c=lgbtq", "🏳️‍🌈", "Places that welcome everyone", "LGBTQ+ friendly local spots")}
${wip(`Singles nights and local, real-life dating events in ${esc(t.name)}, all in one list. Run one? You'll be able to add it free`, "/feedback", "telling us yours")}
<p class="mute">Meeting someone new? Meet in a public place and tell a friend where you'll be.</p>`, pc); };

  const lgbtqia = pc => { const t = TOWNS[pc];
    return page(`LGBTQIA+ in ${t.name}`, `${back(pc)}<h1>🏳️‍🌈 LGBTQIA+ in ${esc(t.name)}</h1><p>Your town, for everyone.</p>
${card("/open?c=lgbtq", "🏳️‍🌈", "LGBTQ+ friendly places", "Local spots that welcome everyone")}
${card(`/${pc}#events`, "🎪", "Community events", "What's on around town")}
<h2>💬 Someone to talk to</h2><ul><li><b>QLife</b>: free, anonymous LGBTIQ+ peer support, 3pm to 9pm every day. <a href="tel:1800184527">1800 184 527</a> or <a href="https://qlife.org.au" rel="noopener">chat online</a></li></ul>
${wip(`Local LGBTQIA+ groups, social nights and events in ${esc(t.name)}, all in one list. Run one? You'll be able to add it free`, "/feedback", "telling us yours")}`, pc); };

  return { mums: url => parents(pcOf(url), "Mums"), dads: url => parents(pcOf(url), "Dads"), singles: url => singles(pcOf(url)), lgbtqia: url => lgbtqia(pcOf(url)) };
}
