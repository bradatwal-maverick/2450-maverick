// Renting and Jobs: every rental and job site in one place, searched for the reader's own town.
// We only link. Nobody pays to be listed. Facts checked 17 Oct 2026.

const hy = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const Hy = s => s.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "");
const enc = encodeURIComponent;

// Local tenancy advice services (free), by Daily Maverick region
const MCTAAS = { name: "Mid Coast Tenants Advice and Advocacy Service", url: "https://www.tenants.org.au/taas/mctaas", phone: "02 6583 9866", free: "1800 777 722", note: "Free advice for renters in Coffs Harbour, Bellingen, Nambucca, Kempsey, Port Macquarie-Hastings and the Taree area. Weekdays 9am–4pm. Can represent you at the Tribunal." };
const NORTAAS = { name: "Northern Rivers Tenants Advice and Advocacy Service", url: "https://www.tenants.org.au/taas/nortaas", phone: "02 6621 1022", free: "1800 649 135", note: "Free advice for renters from Tweed Heads to Grafton. Mon, Tue, Wed and Fri, 9am–12:30pm." };
const TAAS = { "2450": MCTAAS, "2454": MCTAAS, "2444": MCTAAS, "2430": MCTAAS, "2481": NORTAAS, "2485": NORTAAS };

// Council job pages, by region
const COUNCIL_JOBS = {
  "2450": [["City of Coffs Harbour: jobs", "https://coffsharbour.recruitmenthub.com.au/", "Every job going at council, from lifeguards to planners."],
    ["City of Coffs Harbour: traineeships & apprenticeships", "https://www.coffsharbour.nsw.gov.au/Your-Council/Work-With-Us/Traineeships-and-Apprenticeships", "Earn while you learn. Great first job for school leavers."]],
  "2481": [["Byron Shire Council: jobs", "https://byronshire.applynow.net.au/", "Every job going at council."]],
  "2454": [["Bellingen Shire Council: working with us", "https://www.bellingen.nsw.gov.au/Your-Council/About-Us/Working-with-us", "Jobs and traineeships at council."]],
};
const LOCAL_JOBS = {
  "2450": [["Chandler Macleod: Coffs Harbour", "https://www.chandlermacleod.com/for-jobseekers/job-results/coffs-harbour", "Recruitment agency with local temp and permanent roles."]],
};

export function rentGroups(R) {
  const p = R.place, pc = R.code, t = TAAS[pc];
  return [
    ["🔎", "Find a rental", `Every big rental site, already searched for ${p}. Check them all: some agents only list on one.`, [
      ["realestate.com.au", `https://www.realestate.com.au/rent/in-${p.toLowerCase().replace(/ /g, "+")},+nsw+${pc}/list-1`, "Australia's biggest property site."],
      ["Domain", `https://www.domain.com.au/rent/${hy(p)}-nsw-${pc}/`, "The other big one. Includes Allhomes listings."],
      ["Rent.com.au", `https://www.rent.com.au/properties/${hy(p)}-nsw-${pc}`, "Rentals only, with a free renter résumé to send agents."],
      ["Homely", `https://www.homely.com.au/for-rent/${hy(p)}-nsw-${pc}/real-estate`, "Rentals plus honest local reviews of each street."],
      ["Facebook Marketplace: rentals", "https://www.facebook.com/marketplace/category/propertyrentals", "Private landlords often list here. Never pay a deposit before you've seen the place."],
      ["Gumtree: property for rent", "https://www.gumtree.com.au/s-property-for-rent/c18364", "Private rentals. Set your location to " + p + "."],
    ]],
    ["🛏️", "Rooms & share houses", "Cheaper than renting a whole place.", [
      ["Flatmates.com.au", `https://flatmates.com.au/rooms/${hy(p)}-${pc}`, "Rooms and share houses near " + p + "."],
      ["Southern Cross University: student stays", "https://unistays.scu.edu.au/", "Student rentals and rooms near campus."],
    ]],
    ["⚖️", "Know your rights", "NSW renting rules changed in 2025 and 2026. Know where you stand before you sign.", [
      ...(t ? [[t.name, t.url, `${t.note} 📞 <a href="tel:${t.phone.replace(/ /g, "")}">${t.phone}</a> or free call <a href="tel:${t.free.replace(/ /g, "")}">${t.free}</a> (landlines).`, true]] : []),
      ["Tenants' Union of NSW", "https://www.tenants.org.au", "Plain-English factsheets on every renting question."],
      ["Renting a place to live (NSW Government)", "https://www.nsw.gov.au/housing-and-construction/renting-a-place-to-live", "The official rules: leases, repairs, rent increases, ending a lease."],
      ["NSW Rental Commissioner", "https://www.nsw.gov.au/departments-and-agencies/fair-trading/who-we-are/rental-commissioner", "Speaks up for renters and landlords in NSW."],
      ["NSW Civil and Administrative Tribunal (NCAT)", "https://ncat.nsw.gov.au", "Where renting disputes get sorted if you can't agree."],
    ]],
    ["💰", "Bond & rent help", "Money help to get into a rental, or stay in one.", [
      ["Rent Check (NSW Government)", "https://www.nsw.gov.au/rent-check", "Is the rent fair? Compare it with what others pay in " + p + "."],
      ["Smart Rental Bonds", "https://www.nsw.gov.au/housing-and-construction/renting-a-place-to-live/residential-rental-bonds/smart-rental-bonds", "Moving? Take your bond with you instead of paying two at once. Now available across NSW."],
      ["Homes NSW: private rental assistance", "https://www.nsw.gov.au/departments-and-agencies/homes-nsw/social-housing-resources/private-rental-assistance", "Interest-free bond loans (Rentstart), advance rent and help with arrears, if you're eligible."],
      ["Rent Choice", "https://www.service.nsw.gov.au/transaction/access-the-rent-choice-subsidy", "Help paying rent for up to 3 years after a setback, for young people, veterans or anyone escaping violence."],
      ["Housing Response Centre", "tel:1800422322", "Call 1800 422 322 to ask what help you can get, or if you need a roof tonight.", true],
    ]],
  ];
}

export function jobGroups(R) {
  const p = R.place, pc = R.code, loc = p + " NSW";
  return [
    ["🔎", "Job sites, already searched for " + p, "Same job, many sites. We've lined them all up so you don't miss the one only listed in one place.", [
      ["SEEK", `https://www.seek.com.au/jobs/in-${Hy(p)}-NSW-${pc}`, "Australia's biggest job site."],
      ["Indeed", `https://au.indeed.com/jobs?l=${enc(loc)}`, "Pulls jobs from employers' own websites too."],
      ["Jora", `https://au.jora.com/j?q=&l=${enc(loc)}`, "Searches lots of job sites at once."],
      ["LinkedIn Jobs", `https://www.linkedin.com/jobs/search/?location=${enc(p + ", New South Wales, Australia")}`, "Professional and office roles."],
      ["Workforce Australia", "https://www.workforceaustralia.gov.au/individuals/jobs/search", "The Australian Government's free job board."],
      ["Gumtree Jobs", "https://www.gumtree.com.au/s-jobs/c9302", "Casual, cash and small-business jobs. Set your location to " + p + "."],
    ]],
    ["🏛️", "Council, government & big local employers", "Many of the biggest local employers only advertise on their own websites.", [
      ...(COUNCIL_JOBS[pc] || []),
      ["Careers at Council", `https://www.careersatcouncil.com.au/nsw/${hy(p)}/`, "Every council job in the area, in one place."],
      ["I Work for NSW", "https://iworkfor.nsw.gov.au", "All NSW Government jobs: schools, police, transport and more."],
      ["NSW Health jobs", "https://jobs.health.nsw.gov.au", "Hospital and health jobs. Search for your local health district."],
      ["APS Jobs", "https://www.apsjobs.gov.au", "Australian Government jobs, including work-from-home roles."],
      ["Southern Cross University", "https://www.scu.edu.au/about/jobs-at-southern-cross/", "Jobs at the uni, with campuses on the North Coast."],
      ...(LOCAL_JOBS[pc] || []),
    ]],
    ["🫐", "Farm, harvest & seasonal work", "Picking, packing and farm work. Seasonal, but there's plenty of it around here.", [
      ["Harvest Trail", "https://www.harvesttrail.gov.au/individuals", "The Government's harvest job board. Free help finding farm work."],
      ["Backpacker Job Board", `https://www.backpackerjobboard.com.au/jobs-in/${hy(p)}/`, "Short-term and seasonal jobs near " + p + "."],
    ]],
    ["🤝", "Community & not-for-profit", "Jobs that do good.", [
      ["Ethical Jobs", "https://www.ethicaljobs.com.au", "Community, environment, health and not-for-profit jobs."],
    ]],
  ];
}

// Render one directory page body. esc is the site's HTML escaper. Links are external; the site adds UTM codes on click.
export function directoryBody(groups, esc) {
  return groups.map(([ico, h, intro, items]) => `<h2>${ico} ${esc(h)}</h2><p class="mute">${esc(intro)}</p>
${items.map(([n, u, d, raw]) => `<a class="card" href="${esc(u)}" rel="noopener"><b>${esc(n)}</b> ${raw ? d.replace(/<a [^>]*>|<\/a>/g, "") : esc(d)} →</a>`).join("\n")}`).join("\n");
}

// Local community radio in each region's shire. From the CBAA list of community broadcasters and the ACMA-based station list (checked 17 Oct 2026).
const RADIO = {
  "2450": [["CHY FM", "104.1 FM", "https://www.chyfm.org.au", "Coffs Harbour"], ["2AIR FM", "107.9 FM", "http://www.2airfm.com.au", "Coffs Harbour"]],
  "2454": [["2BBB (2 Triple B)", "107.3 FM", "http://www.2bbb.net.au/", "Bellingen"]],
  "2481": [["BayFM", "99.9 FM", "https://www.bayfm.org/", "Byron Bay"]],
  "2485": [["Mayhem Radio", "101.3 FM", "https://mayhemradio.com.au/", "Tweed Heads West"]],
  "2430": [["2BOB Radio", "104.7 FM", "http://www.2bobradio.org.au", "Taree"], ["Radio Ngarralinyi", "103.3 FM", "https://ngarralinyi.com.au/", "Taree, Aboriginal community radio"], ["Bucketts Radio", "104.1 FM", "http://buckettsradio.com.au/", "Gloucester"]],
  "2350": [["2ARM", "92.1 FM", "http://www.2arm.net.au", "Armidale"], ["TUNE! FM", "online", "http://www.tunefm.net", "UNE student radio, Armidale"]],
  "2444": [["2WAY FM", "103.9 FM", "http://2wayfm.com.au", "Wauchope, for Port Macquarie-Hastings"], ["Rhema FM", "99.9 FM", "https://rhema999.com.au", "Port Macquarie, Christian community radio"]],
};
export function radioSection(R, esc) {
  const list = RADIO[R.code]; if (!list) return "";
  return `<section id="radio"><h2>📻 Local radio</h2><p class="mute">Community radio from around the shire, run by locals, mostly volunteers. Tune in or listen live online.</p>
<ul>${list.map(([n, f, u, w]) => `<li><b>${esc(n)}</b> ${esc(f)}, ${esc(w)}. <a href="${esc(u)}" rel="noopener">Listen live</a></li>`).join("")}</ul>
<p class="src">Info from the <a href="https://www.cbaa.org.au" rel="noopener">Community Broadcasting Association of Australia</a> list of community stations and each station's own website. Missed a local station? <a href="/feedback">Tell us</a>.</p></section>`;
}
