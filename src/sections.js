// ---- Newspaper-style sections: parent headings in the masthead nav, each opening a parent page
// that lists every subcategory. One source of truth for the header, the parent pages and the sitemap.
// href starting "#" = a section on today's paper (linked as "/#id"). soon: true = Team Smarketing is on it.
export const NAV = [
  { slug: "news", icon: "📰", name: "News", blurb: "Local news, alerts and who's making the calls. Sourced, never written by us.", items: [
    ["#news", "📰", "Local news", "Today's local headlines, each with its source"],
    ["#alerts", "🚨", "Alerts", "Fires, floods, storms and road closures"],
    ["#scams", "🛡️", "Scam watch", "What's going around and how to check before you buy"],
    ["#numbers", "🔢", "News in numbers", "The day's news, by the numbers"],
    ["#bypass", "🛣️", "Bypass updates", "Progress on the bypass, from the source"],
    ["#aigb", "🤖", "AI for good, AI for bad", "What AI did this week, both sides"],
  ] },
  { slug: "council", icon: "🏛️", name: "Council Watch", blurb: "Holding the decision-makers to account. We source, you decide.", items: [
    ["#council", "🏛️", "Council watch today", "Next meeting, how to complain, what was promised"],
    ["#know", "📍", "Know your area", "Mayor, councillors, bins and council contacts"],
    ["/au", "🗳️", "Who represents you", "Your council, MPs and senators, fact-checked"],
    ["/nsw", "🏛️", "NSW Government help", "Rebates, travel help, vouchers and services you might not know about"],
  ] },
  { slug: "community", icon: "🤝", name: "Community", blurb: "Your town's notice board, family news, what's on and where to meet people.", items: [
    ["#events", "🎪", "Community events", "What's on, local submissions first"],
    ["/notices", "📌", "Notice board", "Lost pets, volunteers, clubs and classes"],
    ["#bdm", "📰", "Births, Deaths and Marriages", "Family notices in one place"],
    ["/celebrations", "🎉", "Celebrations", "New babies, engagements, weddings"],
    ["/rip", "🕊️", "Death notices", "Remembering locals"],
    ["#love", "❤️", "Why you'll love it here", "What your place has that nowhere else does"],
    ["#award", "🏅", "Mini Maverick Encouragement Award", "$50 for a local kid to spend local"],
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
    ["/watch", "📺", "What to watch tonight", "See what locals rate"],
  ] },
  { slug: "outside", icon: "🌳", name: "Outside", blurb: "Beaches, tides, trails and things to do in the fresh air.", items: [
    ["#today", "⛅", "Weather today", "Temperature, rain, wind, sunrise and moon"],
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
    ["#beer", "🍺", "Beer watch", "Today's prices"],
    ["#wine", "🍷", "Wine watch", "Today's prices"],
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

// Every on-page section id, and the section page that shows it.
export const SEC_OF = Object.fromEntries(NAV.flatMap(s => s.items.filter(i => i[0].startsWith("#")).map(i => [i[0].slice(1), s.slug])));
// Links that used to send people to the front page for a section now open that section's page, in place.
export const fixSecLinks = (html, home) => html.replace(/href="\/(\d{4})?#([a-z0-9-]+)"/g, (m, pc, id) => SEC_OF[id] ? `href="/${SEC_OF[id]}${pc && pc !== home ? "?pc=" + pc : ""}#${id}"` : m);

// The section row under the masthead. Scrolls sideways on phones, like a newspaper app.
export function navBar() {
  return `<nav class="snav" aria-label="Sections"><div>${NAV.map(s => `<a href="/${s.slug}" data-s="${s.slug}"${s.slug === "money" ? ` aria-label="Money" title="Money: affordable, local"` : ""}>${s.slug === "money" ? `$$$<span class="dim">$$</span>` : s.name}</a>`).join("")}</div></nav>
<script>(function(){var p=location.pathname.split('/')[1],n=document.querySelector('.snav');if(!p||/^\\d{4}$/.test(p))p='news';if(!n)return;n.querySelectorAll('a').forEach(function(a){if(a.dataset.s===p){a.classList.add('on');a.setAttribute('aria-current','page');a.scrollIntoView({inline:'center',block:'nearest'})}})})()<\/script>`;
}

export const NAV_CSS = `.snav a .dim{opacity:.3}.snav{border-top:1px solid var(--line);border-bottom:3px solid var(--fg);max-width:640px;margin:0 auto}.snav div{display:flex;overflow-x:auto;scrollbar-width:none;padding:0 8px}.snav div::-webkit-scrollbar{display:none}
.snav a{flex:0 0 auto;padding:9px 11px 7px;font-weight:bold;font-size:.95rem;color:var(--fg);text-decoration:none;border-bottom:4px solid transparent;margin-bottom:-3px;white-space:nowrap}.snav a:hover{color:var(--link)}.snav a.on{border-bottom-color:var(--gold)}
.subnav{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 14px}.subnav a{background:var(--soft);border-radius:999px;padding:4px 12px;font-size:.85rem;text-decoration:none;color:var(--fg)}
.secg{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}.secg a,.secg div{display:flex;gap:10px;align-items:flex-start;padding:12px;border:1px solid var(--line);border-radius:12px;text-decoration:none;color:var(--fg)}.secg a:hover{border-color:var(--gold)}.secg span.i{font-size:1.5rem;line-height:1}.secg small{display:block;color:var(--mute)}.secg .soon{border-style:dashed;border-color:var(--gold)}.secg .wipb{display:inline-block;background:var(--gold);color:#12233f;border-radius:999px;padding:0 8px;font-size:.72rem;margin-left:4px}`;

// The top of a section page. The sections themselves are the live ones from today's paper, shown right here.
export function sectionHead(slug, { esc, R, pc }) {
  const s = NAV.find(x => x.slug === slug); if (!s) return null;
  const base = `https://${R.domain}`, q = pc && pc !== R.code ? "?pc=" + pc : "";
  const ids = s.items.filter(i => i[0].startsWith("#")).map(i => i[0].slice(1));
  const pages = s.items.filter(i => !i[0].startsWith("#"));
  const fun = s.slug === "fun", ic = i => fun ? `<span class="i">${i}</span>` : "";
  const ld = { "@context": "https://schema.org", "@graph": [
    { "@type": "CollectionPage", name: `${s.name}: ${R.brand} ${R.place}`, url: `${base}/${s.slug}`, description: s.blurb,
      hasPart: s.items.filter(i => i[0] && !i[4]).map(([u, , n]) => ({ "@type": "WebPage", name: n, url: base + (u.startsWith("#") ? `/${s.slug}${u}` : u) })) },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: R.brand, item: base + "/" }, { "@type": "ListItem", position: 2, name: s.name, item: `${base}/${s.slug}` }] }] };
  const card = ([u, i, n, d, soon]) => soon
    ? `<div class="soon">${ic(i)}<span><b>${esc(n)}</b><span class="wipb">Team Smarketing is on it</span><small>${esc(d)}</small></span></div>`
    : `<a href="${esc(u)}">${ic(i)}<span><b>${esc(n)}</b><small>${esc(d)}</small></span></a>`;
  const head = `<h1 class="sech1">${esc(s.name)}</h1><p class="mute">${esc(s.blurb)}</p>
<nav class="subnav" aria-label="${esc(s.name)} sections">${s.items.filter(i => i[0] && !i[4]).map(([u, , n]) => `<a href="${esc(u)}"${u.startsWith("#") ? ` data-open="${esc(u.slice(1))}"` : ""}>${esc(n)}</a>`).join("")}</nav>
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}<\/script>
<script>window.SECT=${JSON.stringify(ids)};try{var sp=localStorage.getItem('pc');if(sp&&/^\\d{4}$/.test(sp)&&sp!==${JSON.stringify(pc)}&&!/[?&]pc=/.test(location.search))location.replace(location.pathname+'?pc='+sp+location.hash)}catch(e){}<\/script>`;
  const tail = pages.length ? `<h2>More in ${esc(s.name)}</h2><div class="secg">${pages.map(card).join("")}</div>` : "";
  return { s, ids, head, tail, title: `${s.name}: ${R.place} ${pc} local ${s.name.toLowerCase()} | The Daily Maverick`,
    opts: { desc: `${s.blurb} Local ${s.name.toLowerCase()} for ${R.place} ${pc}, free, every item sourced.`, canonical: `${base}/${s.slug}${q}` } };
}
