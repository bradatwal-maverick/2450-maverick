// ---- Newspaper-style sections: parent headings in the masthead nav, each opening a parent page
// that lists every subcategory. One source of truth for the header, the parent pages and the sitemap.
// href starting "#" = a section on today's paper (linked as "/#id"). soon: true = Team Smarketing is on it.
export const NAV = [
  { slug: "news", icon: "📰", name: "Local stories", blurb: "Local stories, alerts and who's making the calls. Sourced from local outlets, never written by us.", items: [
    ["#news", "📰", "Local stories", "Today's local headlines, each with its source"],
    ["#alerts", "🚨", "Alerts", "Fires, floods, storms and road closures"],
    ["#scams", "🛡️", "Scam watch", "What's going around and how to check before you buy"],
    ["#numbers", "🔢", "Today in numbers", "The day's facts, by the numbers"],
    ["#bypass", "🛣️", "Bypass updates", "Progress on the bypass, from the source"],
    ["#aigb", "🤖", "AI for good, AI for bad", "What AI did this week, both sides"],
    ["/travelling", "🧭", "Travelling? Every region", "Alerts, top story and what's on in every Daily Maverick"],
  ] },
  { slug: "council", icon: "🏛️", name: "Council Watch", blurb: "Your council and government, in one place. We source, you decide.", items: [
    ["#council", "🏛️", "Council watch today", "Next meeting, how to complain, what was promised"],
    ["#know", "📍", "Know your area", "Mayor, councillors, bins and council contacts"],
    ["/au", "🗳️", "Who represents you", "Your council, MPs and senators, fact-checked"],
    ["/nsw", "🏛️", "NSW Government help", "Check a licence live, plus rebates, travel help and services you might not know about"],
  ] },
  { slug: "community", icon: "🤝", name: "Community", blurb: "Your town's notice board, family news, what's on and where to meet people.", items: [
    ["#events", "🎪", "Community events", "What's on, local submissions first"],
    ["/notices", "📌", "Notice board", "Buy, sell & swap, locals' wins, lost pets, volunteers and clubs"],
    ["#bdm", "📰", "Births, Deaths and Marriages", "Family notices in one place"],
    ["/celebrations", "🎉", "Celebrations", "New babies, engagements, weddings"],
    ["/rip", "🕊️", "Death notices", "Remembering locals"],
    ["#love", "❤️", "Why you'll love it here", "What your place has that nowhere else does"],
    ["#award", "🏅", "Mini Maverick Award", "$25, $15 and $10 each month for the top 3 Kid Zone players"],
    ["/photos", "📸", "Locals' photos", "Your place, through locals' eyes"],
    ["#radio", "📻", "Local radio", "Community and public radio, one tap to listen"],
    ["/feedback", "💡", "Ideas and votes", "30 votes and we build it"],
    ["#tonight", "📅", "What's on tonight", "Pub specials, trivia, gigs and markets"],
    ["/singles", "💘", "Singles", "Meet people in real life"],
    ["#lgbtq", "🏳️‍🌈", "LGBTQ+ friendly places", "Local places that welcome everyone"],
    ["/lgbtqia", "🏳️‍🌈", "LGBTQIA+", "Your town, for everyone"],
    ["/open?c=pub", "🍺", "Pubs & bars", "Local ones only, open ones first"],
    ["/open?c=cafe", "☕", "Cafés", "Local ones only, open ones first"],
    ["/birthday", "🎂", "Birthday deals", "Local places that look after you on your big day"],
    ["/watch", "🍿", "What are you binging?", "Shows, podcasts and channels locals vote for"],
  ] },
  { slug: "outside", icon: "🌳", name: "Outside", blurb: "Beaches, tides, trails and things to do in the fresh air.", items: [
    ["#today", "⛅", "Weather today", "Temperature, rain, wind, sunrise and moon"],
    ["#trails", "🚴", "Trails, World Heritage and only here", "Cycle trails, World Heritage parks and what you can only do here"],
    ["#beaches", "🏖️", "Beaches", "Patrolled beaches and conditions"],
    ["#sea", "🌊", "Tides & fishing", "Tides, swell and fishing"],
    ["#kids", "🧒", "Get outside this weekend", "Free or under $50 a kid, outdoors"],
    ["#sport", "⚽", "Sport & field closures", "Is the ground open?"],
    ["#dogs", "🐕", "Dog friendly", "Off-leash beaches, dog parks and dog-friendly cafés"],
  ] },
  { slug: "health", icon: "🩺", name: "Health", blurb: "Help close to home, and the help regional locals often don't know about.", items: [
    ["#ed", "🏥", "Emergency wait now", "Live from NSW Health: how many are waiting"],
    ["/open?c=pharmacy", "💊", "Pharmacies", "Open ones first"],
    ["/open?c=doctor", "🩺", "Doctors & clinics", "Open ones first"],
    ["/open?c=vet", "🐾", "Vets", "For the four-legged locals"],
    ["/nsw#health", "🚑", "Medical help you might not know about", "Travel help for city specialist visits (IPTAAS: Isolated Patients Travel and Accommodation Assistance Scheme) and more"],
  ] },
  { slug: "money", icon: "💰", name: "Money", blurb: "Prices, rates, jobs and rentals. Keep more of your money local.", items: [
    ["#fuel", "⛽", "Fuel prices", "Cheapest servo near you"],
    ["#shop", "🛒", "Supermarket watch", "Everyday basics compared, twice a day"],
    ["#rates", "🏦", "Banks and the RBA", "Rates from the Reserve Bank of Australia (RBA) and the banks"],
    ["#alcohol", "🍻", "Grog watch", "Beer, wine and spirits at local bottle shops"],
    ["/jobs", "💼", "Jobs", "Every job site in one place"],
    ["/rent", "🏠", "Renting", "Every rental site, your rights, bond help"],
    ["/scams", "🛡️", "Scam watch", "Report a scam, check a business, the tips banks agree on"],
    ["/numbers", "📞", "Hard-to-find numbers", "Banks, airlines, telcos and government, one tap to call"],
    ["", "🔎", "Local Business Watch", "Does your money stay in the community?", true],
  ] },
  { slug: "family", icon: "👪", name: "Family", blurb: "The school run, the kids, your village, plus puzzles, stars and a bit of fun with your coffee.", items: [
    ["/mums", "👩", "Mums", "School run, countdowns, kids and your village"],
    ["/dads", "👨", "Dads", "School run, countdowns, kids and your village"],
    ["/kids", "🧒", "Kid Zone", "Safe games for 12 and under, with a grown-up's OK"],
    ["/school", "🚸", "School run check", "Weather and traffic for drop-off and pick-up"],
    ["#holidays", "🗓️", "Holidays", "School and public holidays"],
    ["/home", "🏡", "My home", "Bin night reminders, house-sitter sheet"],
    ["/fridge", "🧊", "What's in your fridge?", "Dinner ideas from what you've got"],
    ["/genalpha", "🗣️", "Gen Alpha interpreter", "What did your kid just say?"],
    ["#puzzles", "✏️", "Daily crossword", "Easy, medium and hard"],
    ["#stars", "✨", "Horoscopes", "Western, Vedic and Chinese"],
    ["/bdm", "👶", "Trending baby names", "Locally, across Australia and the world"],
    ["#flights", "✈️", "Flights", "Arrivals and departures"],
  ] },
];
export const NAV_SLUGS = NAV.map(s => s.slug);

// ---- Search: every section page leads with what locals actually type into Google, with the place in it.
// p = the place name (the town, or the sub-postcode's name). Titles end " | The Daily Maverick".
export const SEO = {
  news: { h1: p => `${p} local stories today`, title: p => `${p} today: local stories, alerts and scams` },
  council: { h1: p => `${p} Council watch`, title: p => `${p} council news, meetings and who represents you` },
  community: { h1: p => `${p} community: what's on, notices and family news`, title: p => `${p} community events, notices and what's on` },
  outside: { h1: p => `${p} outdoors: weather, beaches and tides`, title: p => `${p} weather, beaches, tides and trails` },
  health: { h1: p => `Health help in ${p}`, title: p => `${p} pharmacies, doctors and emergency wait times` },
  money: { h1: p => `${p} money: fuel, prices, jobs and rentals`, title: p => `${p} fuel prices, jobs, rentals and supermarket watch` },
  family: { h1: p => `${p} family: school run, kids and puzzles`, title: p => `${p} family: school run, kids, holidays and crossword` },
};
// Search-led pages: the things locals Google every day, each on its own plain URL with its own H1.
// Same live paper, showing just that section. A-Z by slug.
export const FOCUS = [
  { slug: "beaches", ids: ["beaches"], parent: "outside", h1: p => `${p} beaches and surf today`, title: p => `${p} beaches, surf and surf cams today`, desc: p => `Patrolled beaches, surf conditions and surf cams for ${p}, updated through the day. Free, every item sourced.` },
  { slug: "fuel", ids: ["fuel"], parent: "money", h1: p => `Cheapest fuel in ${p} today`, title: p => `Cheapest fuel in ${p} today`, desc: p => `Live fuel prices at ${p} servos from NSW FuelCheck, cheapest first. Free, updated through the day.` },
  { slug: "tides", ids: ["sea"], parent: "outside", h1: p => `${p} tide times and fishing today`, title: p => `${p} tide times today: tides, swell and fishing`, desc: p => `Today's high and low tides, swell and fishing conditions for ${p}. Free, every item sourced.` },
  { slug: "weather", ids: ["today"], parent: "outside", h1: p => `${p} weather today`, title: p => `${p} weather today: rain, wind, sunrise and moon`, desc: p => `Today's weather for ${p}: temperature, rain, wind, UV, sunrise and moon. Free, sourced from the Bureau of Meteorology.` },
  { slug: "whats-on", ids: ["events", "tonight"], parent: "community", h1: p => `What's on in ${p}`, title: p => `What's on in ${p} this week: events, gigs and markets`, desc: p => `Everything on in ${p}: community events, markets, live music, trivia and pub specials, local submissions first. Free to list, free to read.` },
];
export const FOCUS_SLUGS = FOCUS.map(f => f.slug);
export const PAPER_SLUGS = [...NAV_SLUGS, ...FOCUS_SLUGS];

// Every standalone page and the section it lives in, so "back" and the highlighted section are always right.
// Keys are the path (or path?query for /open?c=...). First section listed wins.
export const PARENT = {};
for (const s of NAV) for (const [u] of s.items) { if (!u || u.startsWith("#")) continue; const k = u.split("#")[0]; if (!(k in PARENT)) PARENT[k] = s.slug; const b = k.split("?")[0]; if (!(b in PARENT) && !k.includes("?")) PARENT[b] = s.slug; }
// Pages that also appear as a section on the paper (e.g. /award) belong to that section too.
for (const s of NAV) for (const [u] of s.items) if (u.startsWith("#") && !NAV_SLUGS.includes(u.slice(1)) && !(("/" + u.slice(1)) in PARENT)) PARENT["/" + u.slice(1)] = s.slug;
export const parentOf = (path, search = "") => { const c = new URLSearchParams(search).get("c"); return (c && PARENT[`${path}?c=${c}`]) || PARENT[path] || null; };

// Every on-page section id, and the section page that shows it.
export const SEC_OF = Object.fromEntries(NAV.flatMap(s => s.items.filter(i => i[0].startsWith("#")).map(i => [i[0].slice(1), s.slug])));
// Sections with their own search-led page link there instead, so Google sees locals pointing at /tides, /fuel and friends.
for (const f of FOCUS) for (const id of f.ids) SEC_OF[id] = f.slug;
// Links that used to send people to the front page for a section now open that section's page, in place.
export const fixSecLinks = (html, home) => html.replace(/href="\/(\d{4})?#([a-z0-9-]+)"/g, (m, pc, id) => SEC_OF[id] ? `href="/${SEC_OF[id]}${pc && pc !== home ? "?pc=" + pc : ""}#${id}"` : m);

// The section row under the masthead. Scrolls sideways on phones, like a newspaper app.
export function navBar() {
  return `<nav class="snav" aria-label="Sections"><div>${NAV.map(s => `<a href="/${s.slug}" data-s="${s.slug}"${s.slug === "money" ? ` aria-label="Money" title="Money: affordable, local"` : ""}>${s.slug === "money" ? `$$$<span class="dim">$$</span>` : s.name}</a>`).join("")}</div></nav>
<script>(function(){var P=${JSON.stringify(PARENT)},c=new URLSearchParams(location.search).get('c'),path=location.pathname,path=path.length>1&&path.slice(-1)==='/'?path.slice(0,-1):path,p=path.split('/')[1],n=document.querySelector('.snav');if(!p||/^\\d{4}$/.test(p))p='news';else if(P[path+'?c='+c])p=P[path+'?c='+c];else if(P[path])p=P[path];if(!n)return;n.querySelectorAll('a').forEach(function(a){if(a.dataset.s===p){a.classList.add('on');a.setAttribute('aria-current','page');a.scrollIntoView({inline:'center',block:'nearest'})}})})()<\/script>`;
}

export const NAV_CSS = `.snav a .dim{opacity:.3}.snav{border-top:1px solid var(--line);border-bottom:3px solid var(--fg);max-width:640px;margin:0 auto}.snav div{display:flex;overflow-x:auto;scrollbar-width:none;padding:0 8px}.snav div::-webkit-scrollbar{display:none}
.snav a{flex:0 0 auto;padding:9px 11px 7px;font-weight:bold;font-size:.95rem;color:var(--fg);text-decoration:none;border-bottom:4px solid transparent;margin-bottom:-3px;white-space:nowrap}.snav a:hover{color:var(--link)}.snav a.on{border-bottom-color:var(--gold)}
.subnav{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 14px}.subnav a{background:var(--soft);border-radius:999px;padding:4px 12px;font-size:.85rem;text-decoration:none;color:var(--fg)}
.secg{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}.secg a,.secg div{display:flex;gap:10px;align-items:flex-start;padding:12px;border:1px solid var(--line);border-radius:12px;text-decoration:none;color:var(--fg)}.secg a:hover{border-color:var(--gold)}.secg span.i{font-size:1.5rem;line-height:1}.secg small{display:block;color:var(--mute)}.secg .soon{border-style:dashed;border-color:var(--gold)}.crumbs{font-size:.85rem;margin:6px 0 0}.crumbs a{color:inherit}.upd{font-size:.8rem;margin-top:-6px}.secg .wipb{display:inline-block;background:var(--gold);color:#12233f;border-radius:999px;padding:0 8px;font-size:.72rem;margin-left:4px}`;

// The top of a section page. The sections themselves are the live ones from today's paper, shown right here.
export function sectionHead(slug, { esc, R, pc, place }) {
  const f = FOCUS.find(x => x.slug === slug), s = NAV.find(x => x.slug === (f ? f.parent : slug)); if (!s) return null;
  const P = place || R.place, base = `https://${R.domain}`, q = pc && pc !== R.code ? "?pc=" + pc : "";
  const ids = f ? f.ids : s.items.filter(i => i[0].startsWith("#")).map(i => i[0].slice(1));
  const pages = s.items.filter(i => !i[0].startsWith("#"));
  const seo = SEO[s.slug] || {}, h1 = f ? f.h1(P) : seo.h1 ? seo.h1(P) : s.name;
  const title = `${f ? f.title(P) : seo.title ? seo.title(P) : `${s.name}: ${P}`} | ${R.brand}`;
  const desc = f ? f.desc(P) : `${s.blurb} Local ${s.name.toLowerCase()} for ${P}, free, every item sourced.`;
  const url = `${base}/${slug}${q}`;
  const crumbs = [{ "@type": "ListItem", position: 1, name: R.brand, item: base + "/" }, { "@type": "ListItem", position: 2, name: s.name, item: `${base}/${s.slug}` }];
  if (f) crumbs.push({ "@type": "ListItem", position: 3, name: h1, item: `${base}/${f.slug}` });
  const ld = { "@context": "https://schema.org", "@graph": [
    { "@type": "CollectionPage", name: h1, url, description: desc, inLanguage: "en-AU", dateModified: new Date().toISOString(),
      isPartOf: { "@type": "WebSite", name: R.brand, url: base + "/" },
      ...(f ? {} : { hasPart: s.items.filter(i => i[0] && !i[4]).map(([u, , n]) => ({ "@type": "WebPage", name: n, url: base + (u.startsWith("#") ? `/${s.slug}${u}` : u) })) }) },
    { "@type": "BreadcrumbList", itemListElement: crumbs }] };
  const card = ([u, i, n, d, soon]) => soon
    ? `<div class="soon"><span><b>${esc(n)}</b><span class="wipb">Team Smarketing is on it</span><small>${esc(d)}</small></span></div>`
    : `<a href="${esc(u)}"><span><b>${esc(n)}</b><small>${esc(d)}</small></span></a>`;
  const crumbNav = `<nav class="crumbs mute" aria-label="Breadcrumb"><a href="/">${esc(R.brand)}</a> › ${f ? `<a href="/${s.slug}${q}">${esc(s.name)}</a> › ${esc(h1)}` : esc(s.name)}</nav>`;
  const sub = f ? "" : `<nav class="subnav" aria-label="${esc(s.name)} sections">${s.items.filter(i => i[0] && !i[4]).map(([u, , n]) => `<a href="${esc(u)}"${u.startsWith("#") ? ` data-open="${esc(u.slice(1))}"` : ""}>${esc(n)}</a>`).join("")}</nav>`;
  const head = `${crumbNav}<h1 class="sech1">${esc(h1)}</h1><p class="mute keep">${esc(f ? desc : s.blurb)}</p><p class="mute keep upd">Updated <time datetime="${new Date().toISOString()}">${new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney", weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" })}</time></p>
${sub}
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}<\/script>
<script>window.SECT=${JSON.stringify(ids)};try{var sp=localStorage.getItem('pc');if(sp&&/^\\d{4}$/.test(sp)&&sp!==${JSON.stringify(pc)}&&!/[?&]pc=/.test(location.search))location.replace(location.pathname+'?pc='+sp+location.hash)}catch(e){}<\/script>`;
  const more = f ? `<p><a href="/${s.slug}${q}"><b>More in ${esc(s.name)} →</b></a></p>` : "";
  const tail = more + (pages.length ? `<h2>More in ${esc(s.name)}</h2><div class="secg">${pages.map(card).join("")}</div>` : "");
  return { s, ids, head, tail, title, opts: { desc, canonical: url } };
}
