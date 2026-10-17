// Town settings for the 2450 Maverick engine. One Worker per region sets env.REGION to one of these keys.
// Everything a town needs that's different from the others lives here: places, council, sources, facts, wording.

export const REGIONS = {
  "2450": {
    code: "2450", brand: "The Daily Maverick", place: "Coffs Harbour", short: "Coffs", domain: "2450-maverick.live",
    status: "Officially a city. Coffs Harbour was proclaimed a city in May 1987, effective 1 September 1987, when the shire became the City of Coffs Harbour.",
    statusSrc: "https://www.coffsharbour.nsw.gov.au/Your-Council/About-our-city/Council-history",
    venues: [
      { name: "C.ex clubs (weekly activities)", url: "https://cex.com.au/whats-on/weekly-activities/", only: ["C.ex Coffs", "C.ex Woolgoolga"] },
      { name: "C.ex clubs (free live music)", url: "https://cex.com.au/free-live/", only: ["C.ex Coffs", "C.ex Woolgoolga"] },
      { name: "Sawtell RSL (daily specials)", url: "https://sawtellrsl.com.au/dining/daily-specials/", venue: "Sawtell RSL" },
      { name: "Sawtell RSL (every week)", url: "https://sawtellrsl.com.au/whats-on/every-week/", venue: "Sawtell RSL" },
      { name: "Coffs Coast Growers Market", url: "https://www.nsw.gov.au/visiting-and-exploring-nsw/nsw-events/coffs-coast-growers-market", venue: "Coffs Coast Growers Market", market: true },
      { name: "Harbourside Markets", url: "https://www.nsw.gov.au/visiting-and-exploring-nsw/nsw-events/harbourside-markets", venue: "Harbourside Markets", market: true },
      { name: "Hoey Moey (entertainment)", url: "https://hoeymoey.com.au/entertainment/", venue: "Hoey Moey" },
    ],
    towns: {
  "2450": { name: "Coffs Harbour", lat: -30.3022, lon: 153.1189, mlat: -30.30, mlon: 153.15, live: true },
  "2452": { name: "Sawtell & Toormina", lat: -30.3640, lon: 153.0960, mlat: -30.37, mlon: 153.12, live: true },
  "2456": { name: "Woolgoolga & Northern Beaches", lat: -30.1100, lon: 153.2000, mlat: -30.11, mlon: 153.22, live: true },
},
    home: { lat: -30.2963, lon: 153.1135 },
    bbox: "-30.45,152.95,-30.05,153.25", // open-now search area (south,west,north,east)
    funerals: [{ name: "Victor Rullis Funeral Services", url: "https://www.funeralcoffsharbour.com.au/funeral-notices-and-rememberance" }, { name: "Keith Logue & Sons", url: "https://loguefunerals.com.au/upcoming-funerals/", json: "https://loguefunerals.com.au/wp-json/wp/v2/memorial_tribute?per_page=15" }],
    airport: { name: "Coffs Harbour Airport", url: "https://www.flightaware.com/live/airport/YCFS", iata: "CFS" },
    project: { name: "Coffs Harbour bypass", url: "https://www.nsw.gov.au/driving-boating-and-transport/projects/coffs-harbour-bypass/weekly-update-for-coffs-harbour-bypass", home: "https://www.nsw.gov.au/driving-boating-and-transport/projects/coffs-harbour-bypass" },
    coverage: "We cover the whole Coffs Harbour council area: 2450, 2452 and 2456.", soon: "",
    footer: `<b>Big tech divided us. Your Daily Maverick uses them to bring regional communities back together.</b>`,
    ack: `2450 Maverick acknowledges the Gumbaynggirr people, the Traditional Custodians of the land on which we live and work, and pays respect to Elders past and present.`,
    sign: "Born and built in 2450, raised by the world.",
    goal: 15000, goalText: "about the reach of a local weekly paper",
    council: { name: "Coffs Harbour City Council", mayor: "Cr Nikki Williams", meetings: "https://www.coffsharbour.nsw.gov.au/Your-Council/About-Council/Council-meetings", progress: "https://www.coffsharbour.nsw.gov.au/Your-Council/Our-responsibilities/Corporate-planning-and-reporting/Quarterly-reporting", url: "https://www.coffsharbour.nsw.gov.au", phone: "02 6648 4000", urgent: "Council (24/7 for urgent water, sewer, animal attacks): 02 6648 4000" },
    binsTip: "Check your bin days in the free Coffs Coast Waste Services app.",
    mavExample: "I'm Megan, I've got two kids at Coffs Public, I love the markets and my husband fishes",
    schoolsArea: "Public schools on the Coffs Coast",
    warnRe: /mid north coast|coffs|northern tablelands|coastal waters|marine/i,
    news: [
      { name: "News Of The Area", url: "https://coffscoast.newsofthearea.com.au", feed: "https://coffscoast.newsofthearea.com.au/feed", skip: /^PROPERTY:/i },
      { name: "NBN News", url: "https://www.nbnnews.com.au", feed: "https://www.nbnnews.com.au/feed/", cat: /mid north/i, need: /coffs|sawtell|toormina|woolgoolga|woopi|bellingen|urunga|nambucca|boambee|korora|emerald beach|dorrigo/i },
    ],
    know: (W, acc) => `<details open><summary><b>Who runs the place</b></summary><ul>
<li>Mayor: <b>Cr Nikki Williams</b> · Deputy Mayor: <b>Cr George Cecato</b></li>
<li>Councillors: Cath Fowler, Gurminder Saro, Jonathan Cassell, Julie Sechi, Les Oxford, Tony Judge. One vacancy: by-election Saturday 12 December 2026. <a href="https://www.coffsharbour.nsw.gov.au/Your-Council/About-Council/Councillors" rel="noopener">Contact them</a></li>
<li><a href="https://www.coffsharbour.nsw.gov.au/Your-Council/About-Council/Council-meetings" rel="noopener">Council meetings</a>: see what's being decided</li></ul>${acc("councillors", W.councillors)}</details>
<details><summary><b>Bins &amp; rubbish</b></summary><ul>
<li>Which bin this week? Get the free <b>Coffs Coast Waste Services</b> app (App Store or Google Play)</li>
<li>Bulky goods (old couch, mattress): book a kerbside pick-up or get free tip vouchers on <a href="tel:1800265495">1800 265 495</a>. Vouchers are posted, so allow 2 weeks</li>
<li>Tip: Englands Road Waste Management Facility</li>
<li>Seen illegal dumping? <a href="https://ridonline.epa.nsw.gov.au/" rel="noopener">Report it online</a></li></ul>${acc("bulky", W.bulky)}${acc("wasteapp", W.wasteapp)}</details>
<details><summary><b>Got a problem?</b></summary><ul>
<li>Pothole, broken footpath, streetlight, overgrown block: <a href="https://forms.coffsharbour.nsw.gov.au/RunForm.aspx?formId=1366" rel="noopener">Council request form</a></li>
<li>Pollution or environmental issue: <a href="https://www.coffsharbour.nsw.gov.au/Environment/Compliance-and-reporting/Report-an-environmental-issue" rel="noopener">Report it</a></li>
<li>Not happy with how council handled it? <a href="https://www.ombo.nsw.gov.au" rel="noopener">NSW Ombudsman</a></li></ul>${acc("envreport", W.envreport)}</details>
<details><summary><b>Contact council</b></summary><ul>
<li>📞 <a href="tel:0266484000">02 6648 4000</a>, weekdays 8:30am–4:30pm. Same number 24/7 for urgent water, sewer, pollution or animal attacks</li>
<li>✉️ <a href="mailto:coffs.council@chcc.nsw.gov.au">coffs.council@chcc.nsw.gov.au</a></li>
<li>🏛️ Yarrila Place, Level 1, 27 Gordon Street. Weekdays 9am–3:30pm</li></ul>${acc("contact", W.contact)}</details>
`,
    idx: [
      ["mayor deputy councillor councillors council who runs","Who runs the place","Mayor Cr Nikki Williams, Deputy Mayor Cr George Cecato, plus 6 councillors (one vacancy, by-election 12 December 2026).","#know"],
      ["bin bins rubbish recycling garbage which bin","Bins","Which bin this week? Get the free Coffs Coast Waste Services app.","#know"],
      ["bulky couch mattress hard rubbish clean up tip voucher","Bulky goods","Book a pick-up or free tip vouchers: 1800 265 495.","#know"],
      ["tip dump englands road","The tip","Englands Road Waste Management Facility.","#know"],
      ["council phone contact email call hours after hours water sewer","Contact council","02 6648 4000 (urgent water, sewer, pollution, animal attacks 24/7).","#know"],
      ["sport field fields closure closed footy soccer netball","Sport & field closures","Field closures and fixtures.","#sport"],
      ["coffs facts history name jetty muttonbird gumbaynggirr why fun","Why Coffs?","Fun facts about Coffs, every one sourced.","/coffs"],
    ],
    cw: [["MUTTONBIRD", "Island at the harbour, named after a seabird"], ["DORRIGO", "Plateau with the rainforest Skywalk"], ["SAWTELL", "Village south of town, postcode 2452"],
      ["WOOLGOOLGA", "Beach town home to Australia's first Sikh gurdwara"], ["KORORA", "Bay just north of town"], ["SOLITARY", "___ Islands Marine Park"],
      ["ORARA", "Valley and river behind Coffs"], ["BANANA", "Big one turned 50 in 2014"], ["GUMBAYNGGIRR", "Traditional custodians of the Coffs Coast"]],
    why: { slug: "coffs", title: "Why Coffs?", card: "Fun facts: the spelling mistake, the moon island, where the mountains meet the sea", intro: "What can Coffs say that nowhere else can? Plenty. Here's the pitch, every fact sourced." },
    surf: [["Park Beach", "SSE", "W", "Patrolled all year"], ["Diggers Beach", "SE", "SW", "Patrolled in school holidays"], ["Sawtell", "SE", "WSW", "Patrolled Sep to Apr"],
      ["Woolgoolga", "ESE", "SW", "Patrolled Sep to Apr; best mid to falling tide"], ["Emerald Beach", "NE", "SSW", "Left-hand point; patrolled late Dec to late Jan only"],
      ["Moonee Beach", "SE", "W", "Small days suit beginners; not patrolled"], ["Coffs North Wall", "SE", "SW", "Not patrolled; rocks"]],
    fish: { park: ["Solitary Islands Marine Park", "https://www.dpi.nsw.gov.au/__data/assets/pdf_file/0007/656305/INT16-103355-CURRENT_Solitary_Islands_Marine_Park_Zoning_Map.pdf"], spots: [
      ["Coffs Harbour Jetty", "Jetty", "bream, trevally, whiting; sometimes kingfish and mulloway", ""], ["Northern Breakwall (Muttonbird Island)", "Breakwall", "tailor, tuna, mulloway, bream, flathead", "Rock fishing: watch the swell. No lobster traps in the harbour"],
      ["Corambirra Point & Gallows Beach", "Rocks & beach", "tailor, mulloway, bream, flathead, trevally", "Rock fishing: watch the swell"], ["Park Beach", "Beach", "tailor, bream, whiting, mulloway", ""],
      ["Coffs Creek (near the mouth)", "Estuary", "flathead, bream, blackfish, whiting", ""], ["Boambee Creek Reserve", "Estuary", "whiting, mulloway, flathead, bream, mangrove jack", "Small entry fee to the reserve"],
      ["Bonville Creek, Sawtell", "Estuary", "sand whiting, flathead, mullet, mangrove jack", ""], ["Moonee Creek & Beach", "Estuary & beach", "whiting, flathead, blackfish, bream, trevally, mangrove jack", "Marine park: line fishing only from shore here, no bait collecting"],
      ["Woolgoolga Creek & headlands", "Estuary & rocks", "mangrove jack, flathead, bream", "Headlands depend on tide and swell"], ["Corindi River & Red Rock", "Estuary", "sand whiting, bream, flathead, mangrove jack", "Part of Corindi River is a sanctuary zone (no fishing). Check the map"]] },
    fields: { url: "https://coffsharbour.nsw.gov.au/Community-and-recreation/Community-venues-and-facilities/Sports-facilities/Sports-grounds/Sports-field-closure-arrangements", info: `<h3>Who decides and when</h3><ul><li><b>Weekday training:</b> council decides by 3pm</li><li><b>C.ex Coffs International Stadium:</b> by 3pm Friday</li>
<li><b>AFL:</b> by 5pm the day before</li><li><b>Baseball:</b> 6–7am Saturday</li><li><b>Cricket:</b> Saturday morning (juniors on 105.5 Star FM just before 7am)</li><li><b>Soccer and hockey:</b> check your association's website</li></ul>`, name: "City of Coffs Harbour, Sports field closure arrangements" },
    watch: {
  councillors: { owner: "Council", name: "City of Coffs Harbour, Councillors page", url: "https://www.coffsharbour.nsw.gov.au/Your-Council/About-Council/Councillors" },
  bulky: { owner: "Council", name: "Council bulky goods FAQ", url: "https://haveyoursay.coffsharbour.nsw.gov.au/bulky-goods-waste-service/faqs", stated: "2018-03" },
  wasteapp: { owner: "News Of The Area", name: "News Of The Area (waste app)", url: "https://coffscoast.newsofthearea.com.au/app-solves-the-challenge-of-which-bin-this-week", stated: "2025-05" },
  envreport: { owner: "Council", name: "City of Coffs Harbour, Report an environmental issue", url: "https://www.coffsharbour.nsw.gov.au/Environment/Compliance-and-reporting/Report-an-environmental-issue" },
  contact: { owner: "Council", name: "City of Coffs Harbour, Contact details", url: "https://www.coffsharbour.nsw.gov.au/Your-Council/Contact-us/Contact-Council" },
},
    schools: ["Coffs Harbour Public School","Narranga Public School","Boambee Public School","Bonville Public School","Korora Public School",
  "Coramba Public School","Nana Glen Public School","Upper Orara Public School","St Augustine's Primary School","Coffs Harbour High School",
  "Orara High School","Coffs Harbour Senior College","Bishop Druitt College","John Paul College","Coffs Harbour Christian Community School"],
    faves: [["Muttonbird Island walk","Free","Short walk from the Jetty foreshore out along the breakwall. Whale-spotting in season."],
  ["Jetty foreshores & beach","Free","Playground, picnic spots and calm water by the jetty."],["North Coast Regional Botanic Garden","Free","Boardwalks, sensory garden and Coffs Creek walks."],
  ["Forest Sky Pier, Sealy Lookout","Free","Walk out over the treetops with views of the whole coast."],["Coffs Creek walk & cycleway","Free","Flat, shady path, great for scooters and bikes."]],
    facts: [
  ["🗺️", "It's named after a spelling mistake", "Ship owner John Korff sheltered here from a storm in 1847 and called it Korff's Harbour. In 1861 a Crown surveyor wrote it down wrong, and Coffs stuck.", "https://en.wikipedia.org/wiki/Coffs_Harbour", "Wikipedia"],
  ["🌏", "Gumbaynggirr Country", "Coffs is on Gumbaynggirr Country. The harbour's Gumbaynggirr name is Gitten Mirreh, meaning big moon.", "https://en.wikipedia.org/wiki/Coffs_Harbour", "Wikipedia"],
  ["🌙", "Muttonbird Island is a moon sacred place", "Its Gumbaynggirr name, Giidany Miirlarl, means moon sacred place. Wedge-tailed shearwaters, the muttonbirds, nest all over it.", "https://www.nationalparks.nsw.gov.au/education/stage-3-science-giidany-miirlarl-a-special-site-muttonbird-island-nature-reserve", "NSW National Parks"],
  ["🌉", "The Jetty is older than Federation", "Finished in August 1892, it reached about 500 m out to sea so steam cranes could load timber onto ships. The last commercial cargo left in 1979, it reopened restored in 1997, and it has been State Heritage listed since 2021. Technically it reaches straight out to sea like a pier, but it will always be the Jetty, and jumping off it is a Coffs rite of passage.", "https://www.coffscoastheritage.info/2018/06/the-story-of-the-coffs-harbour-jetty/", "Coffs Coast Heritage"],
  ["⛰️", "Where the mountains meet the sea", "Coffs is often described as the only place in NSW where the Great Dividing Range comes right down to the Pacific Ocean.", "https://en.wikipedia.org/wiki/Coffs_Harbour", "Wikipedia (marked as needing a source)"],
  ["🐠", "Where tropical meets temperate", "In the Solitary Islands Marine Park, the warm East Australian Current meets cooler southern water. Many species here live at the northern or southern edge of their range, and critically endangered grey nurse sharks gather here.", "https://australianmarineparks.gov.au/parks/temperate-east-marine-parks-network/solitary-islands-marine-park/", "Australian Marine Parks"],
  ["🌿", "World Heritage rainforest an hour away", "Dorrigo National Park is part of the Gondwana Rainforests of Australia World Heritage Area. Walk the Skywalk and look all the way from the forest to the sea.", "https://www.nationalparks.nsw.gov.au/visit-a-park/parks/dorrigo-national-park", "NSW National Parks"],
  ["☀️", "Sunnier than Brisbane and Cairns", "Coffs averages about 122 clear days a year: sunnier than Brisbane and Cairns, a little behind Townsville. Locals will also tell you the CSIRO once named it Australia's best climate. We couldn't find that study, so if you have it, send it in!", "https://en.wikipedia.org/wiki/Coffs_Harbour", "Wikipedia"],
  ["🍌", "Home of the original big thing", "The Big Banana turned 50 in 2014.", "https://en.wikipedia.org/wiki/Coffs_Harbour", "Wikipedia"]],
    mavKB: `Site: 2450 Maverick, a free local info site for the Coffs Harbour council area (2450 Coffs Harbour, 2452 Sawtell & Toormina, 2456 Woolgoolga). Never charges. A gift from Maverick Digital.
Pages: /2450 /2452 /2456 area pages; /open what's open now (pharmacies, doctors, mechanics, servos, supermarkets, bottle shops, pubs, cafes, takeaway, vets, hardware); /fridge dinner ideas from your fridge (free email unlock);
/school school run check; /birthday local birthday deals (say "Maverick"); /genalpha Gen Alpha slang interpreter with Jimmy Joel; /rip death notices; /submit add an event free; /feedback suggest and vote on ideas (30 votes gets it built); /new what's new; /privacy; /charter.
Area page sections (ids): today=At a glance tiles (weather, rain, wind, sunrise, tides, swell, moon, clock change); tools=Handy tools; alerts=fires within 100 km and weather warnings; events=What's on; news=local headlines; fuel=cheapest fuel near you;
sea=tides & fishing; know=Know your area (mayor Cr Nikki Williams, deputy Cr George Cecato, council 02 6648 4000 incl. 24/7 urgent water/sewer/pollution/animal attacks, bins via Coffs Coast Waste Services app, bulky goods 1800 265 495, tip at Englands Road, council request form, NSW Ombudsman);
council=council news; kids=Get outside this weekend (outdoor things for kids and families, free or under $50; we don't list arcades, bowling or cinemas); sport=Sport & field closures with phone alerts; holidays=public holidays; beaches=beaches.
Every piece of information has an ⓘ Source button showing where it comes from and how current it is.
Emergencies: 000. Tides are estimates, not for navigation.`,
  },
  "2481": {
    code: "2481", brand: "The Daily Maverick", place: "Byron Bay", short: "Byron", domain: "2481-maverick.live",
    venues: [
      { name: "Beach Hotel Byron Bay", url: "https://www.beachhotel.com.au/whats-on", venue: "Beach Hotel" },
    ],
    towns: {
      "2481": { name: "Byron Bay & Suffolk Park", lat: -28.6474, lon: 153.6020, mlat: -28.64, mlon: 153.64, live: true },
      "2479": { name: "Bangalow", lat: -28.6860, lon: 153.5240, mlat: -28.64, mlon: 153.64, live: true },
      "2480": { name: "Federal & surrounds", lat: -28.6500, lon: 153.4550, mlat: -28.64, mlon: 153.64, live: true },
      "2482": { name: "Mullumbimby", lat: -28.5520, lon: 153.5000, mlat: -28.54, mlon: 153.58, live: true },
      "2483": { name: "Brunswick Heads & Ocean Shores", lat: -28.5390, lon: 153.5510, mlat: -28.54, mlon: 153.58, live: true },
    },
    home: { lat: -28.6474, lon: 153.6020 },
    bbox: "-28.72,153.54,-28.60,153.66",
    funerals: [{ name: "Brunswick Valley Funerals", url: "https://brunswickvalleyfunerals.com.au/currently-in-our-care/", json: "https://brunswickvalleyfunerals.com.au/wp-json/wp/v2/bw_funeral?per_page=15" }],
    airport: { name: "Ballina Byron Gateway Airport", url: "https://www.flightaware.com/live/airport/YBNA", iata: "BNK" },
    coverage: "We cover the whole Byron Shire: 2479, 2480, 2481, 2482 and 2483.", soon: "",
    footer: `🎸 Fun fact: the person who built this site was in the same video class as Grinspoon guitarist Pat Davern, and was at the band&rsquo;s first gigs in Lismore, where Grinspoon was born.<br><b>Big tech divided us. Your Daily Maverick uses them to bring regional communities back together.</b>`,
    ack: `2481 Maverick acknowledges the Arakwal people of the Bundjalung Nation, the Traditional Custodians of the land on which Byron Bay stands, and pays respect to Elders past and present.`,
    sign: "Built in 2450, made for 2481, raised by the world.",
    goal: 5000, goalText: "about half the town",
    council: { name: "Byron Shire Council", mayor: "Cr Sarah Ndiaye", meetings: "https://www.byron.nsw.gov.au/Council/Meetings-Agendas/Meeting-Calendar", progress: "https://www.byron.nsw.gov.au/Council/Plans-Strategies/Council-Planning-Reporting/Reports-on-Our-Progress", url: "https://www.byron.nsw.gov.au", phone: "02 6626 7000", urgent: "Byron Shire Council after hours emergencies: 02 6622 7022" },
    binsTip: "Check your bin days in the free Recycle Coach app (search your address).",
    mavExample: "I'm Jess, I surf at The Pass most mornings, I've got a kid at Byron Public and I love the markets",
    schoolsArea: "Public schools in the Byron Shire",
    warnRe: /northern rivers|byron|northern tablelands|coastal waters|marine/i,
    news: [
      { name: "The Echo", url: "https://www.echo.net.au", feed: "https://www.echo.net.au/feed/" },
      { name: "NBN News", url: "https://www.nbnnews.com.au", feed: "https://www.nbnnews.com.au/feed/", cat: /northern rivers/i, need: /byron|suffolk park|bangalow|mullum|brunswick|ocean shores|lennox|ballina|lismore/i },
    ],
    know: (W, acc) => `<details open><summary><b>Who runs the place</b></summary><ul>
<li>Mayor: <b>Cr Sarah Ndiaye</b> · Deputy Mayor: <b>Cr Elia Hauge</b></li>
<li>Councillors: Jack Dods, Delta Kay, Michelle Lowe, Asren Pugh, Janet Swain, David Warth, Michael Lyon. <a href="https://www.byron.nsw.gov.au/Council/Leadership" rel="noopener">Contact them</a></li>
<li><a href="https://www.byron.nsw.gov.au/Council/Council-and-committee-meetings" rel="noopener">Council meetings</a>: see what's being decided</li></ul>${acc("leadership", W.leadership)}</details>
<details><summary><b>Bins &amp; rubbish</b></summary><ul>
<li>Which bin this week? Get the free <b>Recycle Coach</b> app and search your address</li>
<li>Yellow lid: recycling, fortnightly · Red lid: landfill, fortnightly · Green lid: food and garden, weekly (urban)</li>
<li>Big clean-up? Each household gets an annual free drop-off at the Byron Resource Recovery Centre (2 × 150 kg household waste or 500 kg green waste)</li>
<li>Missed bin? Report it within 24 hours on <a href="tel:1300652625">1300 652 625</a></li>
<li>Seen illegal dumping? <a href="https://ridonline.epa.nsw.gov.au/" rel="noopener">Report it online</a></li></ul>${acc("waste", W.waste)}</details>
<details><summary><b>Got a problem?</b></summary><ul>
<li>Pothole, broken footpath, streetlight, overgrown block: <a href="https://www.byron.nsw.gov.au/Council/Report-Requests-Feedback" rel="noopener">Report it to council</a></li>
<li>Not happy with how council handled it? <a href="https://www.ombo.nsw.gov.au" rel="noopener">NSW Ombudsman</a></li></ul>${acc("report", W.report)}</details>
<details><summary><b>Contact council</b></summary><ul>
<li>📞 <a href="tel:0266267000">02 6626 7000</a> or toll free <a href="tel:1300811942">1300 811 942</a></li>
<li>🚨 After hours emergencies: <a href="tel:0266227022">02 6622 7022</a></li>
<li>✉️ <a href="mailto:council@byron.nsw.gov.au">council@byron.nsw.gov.au</a></li>
<li>🏛️ 70 Station Street, Mullumbimby</li></ul>${acc("contact", W.contact)}</details>
`,
    idx: [
      ["mayor deputy councillor councillors council who runs","Who runs the place","Mayor Cr Sarah Ndiaye, Deputy Mayor Cr Elia Hauge, plus 7 councillors.","#know"],
      ["bin bins rubbish recycling garbage which bin recycle coach","Bins","Which bin this week? Get the free Recycle Coach app.","#know"],
      ["bulky couch mattress hard rubbish clean up tip free drop off","Free drop-off","Annual free drop-off at the Byron Resource Recovery Centre.","#know"],
      ["tip dump resource recovery myocum","The tip","Byron Resource Recovery Centre.","#know"],
      ["council phone contact email call hours after hours emergency","Contact council","02 6626 7000. After hours emergencies 02 6622 7022.","#know"],
      ["byron facts history name lighthouse cape easterly arakwal poets why fun","Why Byron?","Fun facts about Byron, every one sourced.","/why"],
    ],
    cw: [["LIGHTHOUSE", "Cape landmark built in 1901"], ["JULIAN", "___ Rocks, the famous dive site"], ["WATEGOS", "Beach tucked under the cape"],
      ["BANGALOW", "Village up the hill, postcode 2479"], ["ARAKWAL", "Traditional custodians of Byron Bay"], ["CAVVANBAH", "Traditional name meaning meeting place"],
      ["TALLOW", "Long beach south of the cape"], ["POETS", "Byron's streets are named after them"], ["SUFFOLK", "___ Park, just south of town"], ["EASTERLY", "Cape Byron is the most ___ point of the mainland"]],
    why: { slug: "why", title: "Why Byron?", card: "Fun facts: the poets' streets mix-up, the most easterly point, the meeting place", intro: "Everyone knows Byron. Here's what they don't know, every fact sourced." },
    surf: [["The Pass", "E", "SE", "Patrolled Christmas to Australia Day and April holidays; crowds and strong sweep"], ["Wategos", "NE", "S", "Point; patrolled with The Pass"],
      ["Tallow Beach", "SE", "NW", "Rips and closeouts; patrolled in summer holidays only"], ["Broken Head", "ENE", "SW", "Point for confident surfers; patrolled Christmas to Australia Day"],
      ["Brunswick Heads", "SE", "SSW", "Patrolled in summer and April holidays, weekends by the club"]],
    fish: { park: ["Cape Byron Marine Park", "https://www.dpi.nsw.gov.au/__data/assets/pdf_file/0005/656267/INT16-103353-CURRENT_Cape_Byron_Marine_Park_Zoning_Map.pdf"], spots: [
      ["Brunswick River rock walls", "Breakwall", "mulloway (in season), bream, tailor", "Rock fishing: watch the swell"], ["Brunswick River Boat Harbour", "Estuary", "", "Fishing allowed here (special purpose zone)"],
      ["Tallow Beach", "Beach", "tailor, mulloway", ""], ["Tyagarah Beach (south end)", "Beach", "", "Habitat protection zone: fishing allowed"]],
      note: "Byron Bay, Broken Head and the creeks beside Brunswick Heads have sanctuary zones where you can't fish at all. Check the map before you cast." },
    fields: null,
    watch: {
      leadership: { owner: "Council", name: "Byron Shire Council, Leadership page", url: "https://www.byron.nsw.gov.au/Council/Leadership" },
      waste: { owner: "Council", name: "Byron Shire Council, Waste guide for new residents", url: "https://www.byron.nsw.gov.au/Residential-Services/Waste-Recycling/Waste-guide-for-new-tenants-and-residents" },
      report: { owner: "Council", name: "Byron Shire Council, Report requests and feedback", url: "https://www.byron.nsw.gov.au/Council/Report-Requests-Feedback" },
      contact: { owner: "Council", name: "Byron Shire Council, Contact us", url: "https://www.byron.nsw.gov.au/Council/Report-Requests-Feedback/Contact-Byron-Shire-Council" },
    },
    schools: ["Byron Bay Public School","Byron Bay High School","St Finbarr's Catholic Primary School","Cape Byron Rudolf Steiner School"],
    faves: [["Cape Byron walking track","Free","Loop up to the lighthouse and the most easterly point of mainland Australia. Whale-spotting in season."],
      ["The Pass & Clarkes Beach","Free","Sheltered end of the bay. Swim between the flags."],["Arakwal National Park & Tallow Beach","Free","Bush tracks and a long, quieter beach."],
      ["Railway Park","Free","Playground and shade right in the middle of town."]],
    facts: [
      ["📜", "Named after the wrong Byron", "Captain Cook named Cape Byron in 1770 after Vice Admiral John Byron. A Sydney clerk later assumed it honoured his grandson, the poet Lord Byron, which is why the streets are named after poets like Keats, Jonson and Shelley.", "https://en.wikipedia.org/wiki/Byron_Bay", "Wikipedia"],
      ["🌏", "Arakwal Country", "Byron Bay is on the land of the Arakwal people of the Bundjalung Nation. The traditional name, Cavvanbah, means meeting place.", "https://en.wikipedia.org/wiki/Byron_Bay", "Wikipedia"],
      ["🌅", "First mainland sunrise", "Cape Byron is the easternmost point of mainland Australia.", "https://en.wikipedia.org/wiki/Byron_Bay", "Wikipedia"],
      ["🗼", "The lighthouse turns 125", "Cape Byron Lighthouse was built in 1901.", "https://en.wikipedia.org/wiki/Byron_Bay", "Wikipedia"],
      ["🐢", "Julian Rocks", "About 2.5 km from town, Julian Rocks is one of the east coast's best dive sites, part of the Cape Byron Marine Park.", "https://en.wikipedia.org/wiki/Byron_Bay", "Wikipedia"],
      ["🐋", "From whaling to whale watching", "Byron had a whaling station until 1963. Today the same whales are the town's favourite winter show.", "https://en.wikipedia.org/wiki/Byron_Bay", "Wikipedia"]],
    mavKB: `Site: 2481 Maverick, a free local info site for the Byron Shire (2481 Byron Bay & Suffolk Park, 2479 Bangalow, 2480 Federal, 2482 Mullumbimby, 2483 Brunswick Heads & Ocean Shores). Never charges. A gift from Maverick Digital.
Pages: /2481 /2479 /2480 /2482 /2483 area pages; /open what's open now (pharmacies, doctors, mechanics, servos, supermarkets, bottle shops, pubs, cafes, takeaway, vets, hardware); /fridge dinner ideas from your fridge (free email unlock);
/school school run check; /birthday local birthday deals (say "Maverick"); /genalpha Gen Alpha slang interpreter with Jimmy Joel; /rip death notices; /crossword daily crossword; /submit add an event free; /feedback suggest and vote on ideas (30 votes gets it built); /new what's new; /privacy; /charter.
Area page sections (ids): today=At a glance tiles (weather, rain, wind, sunrise, tides, swell, moon, clock change); tools=Handy tools; alerts=fires within 100 km and weather warnings; events=What's on; news=local headlines; memory=In memory (death notices); fuel=cheapest fuel near you;
sea=tides & fishing; know=Know your area (mayor Cr Sarah Ndiaye, deputy Cr Elia Hauge, Byron Shire Council 02 6626 7000, after hours emergencies 02 6622 7022, bins via the Recycle Coach app, annual free drop-off at the Byron Resource Recovery Centre, missed bins 1300 652 625, NSW Ombudsman);
council=council news; kids=Get outside this weekend (outdoor things for kids and families, free or under $50; we don't list arcades, bowling or cinemas); holidays=public and school holidays; puzzles=daily crossword; beaches=beaches.
Every piece of information has an ⓘ Where from? button showing where it comes from and how current it is.
Emergencies: 000. Tides are estimates, not for navigation.`,
  },
  "2454": {
    code: "2454", brand: "The Daily Maverick", place: "Bellingen", short: "Bello", domain: "2454-maverick.live",
    venues: [
      { name: "C.ex Urunga (weekly activities)", url: "https://cex.com.au/whats-on/weekly-activities/", only: ["C.ex Urunga"] },
      { name: "Bellingen Growers Market", url: "https://www.nsw.gov.au/visiting-and-exploring-nsw/nsw-events/bellingen-growers-market", venue: "Bellingen Growers Market", market: true },
      { name: "C.ex Urunga (club page)", url: "https://cex.com.au/venues/cex-urunga/", venue: "C.ex Urunga" },
      { name: "Bellingen Community Markets", url: "https://www.nsw.gov.au/visiting-and-exploring-nsw/nsw-events/bellingen-community-markets", venue: "Bellingen Community Markets", market: true },
    ],
    towns: {
      "2453": { name: "Dorrigo", lat: -30.3410, lon: 152.7130, mlat: -30.50, mlon: 153.05, live: true },
      "2454": { name: "Bellingen", lat: -30.4520, lon: 152.8990, mlat: -30.50, mlon: 153.05, live: true },
      "2455": { name: "Urunga", lat: -30.4950, lon: 153.0170, mlat: -30.50, mlon: 153.05, live: true },
    },
    home: { lat: -30.4520, lon: 152.8990 },
    bbox: "-30.60,152.55,-30.25,153.10",
    funerals: [{ name: "Keith Logue & Sons", url: "https://loguefunerals.com.au/upcoming-funerals/", json: "https://loguefunerals.com.au/wp-json/wp/v2/memorial_tribute?per_page=15" }, { name: "Victor Rullis Funeral Services", url: "https://www.funeralcoffsharbour.com.au/funeral-notices-and-rememberance" }],
    airport: { name: "Coffs Harbour Airport", url: "https://www.flightaware.com/live/airport/YCFS", iata: "CFS", feed: "https://2450-maverick.live/api/flights" },
    coverage: "We cover the whole Bellingen Shire: 2453, 2454 and 2455.", soon: "",
    footer: `<b>Big tech divided us. Your Daily Maverick uses them to bring regional communities back together.</b>`,
    ack: `2454 Maverick acknowledges the Gumbaynggirr people, the Traditional Custodians of the land on which we live and work, and pays respect to Elders past and present.`,
    sign: "Built in 2450, made for 2454, raised by the world.",
    goal: 3000, goalText: "about a third of the shire",
    council: { name: "Bellingen Shire Council", mayor: "Cr Steve Allan", meetings: "https://www.bellingen.nsw.gov.au/Your-Council/Council-Meetings-Elected-Members-Councillor-Workshops/Council-meeting-schedule", progress: "https://www.bellingen.nsw.gov.au/Your-Council/Our-Plan-for-the-Future/Our-reporting-process", url: "https://www.bellingen.nsw.gov.au", phone: "02 6655 7300", urgent: "Bellingen Shire Council: 02 6655 7300" },
    binsTip: "Check your bin days in the free Coffs Coast Waste Services app, or call 1800 265 495.",
    mavExample: "I'm Sam, I live in Dorrigo, I've got a kid at Bellingen High and I love the markets",
    schoolsArea: "Public schools in the Bellingen Shire",
    warnRe: /mid north coast|bellingen|dorrigo|urunga|northern tablelands|coastal waters|marine/i,
    news: [
      { name: "News Of The Area", url: "https://coffscoast.newsofthearea.com.au", feed: "https://coffscoast.newsofthearea.com.au/feed", skip: /^PROPERTY:/i, need: /bellingen|bello|dorrigo|urunga|mylestom|repton|raleigh|thora|kalang/i },
      { name: "NBN News", url: "https://www.nbnnews.com.au", feed: "https://www.nbnnews.com.au/feed/", cat: /mid north/i, need: /bellingen|dorrigo|urunga|mylestom|repton|raleigh/i },
    ],
    know: (W, acc) => `<details open><summary><b>Who runs the place</b></summary><ul>
<li>Mayor: <b>Cr Steve Allan</b> · Deputy Mayor: <b>Cr Graeme Shephard</b></li>
<li>Councillors: Jo Brotherton, Linda Coomber, Jennie Fenton, Dominic King, Andrew O'Keeffe. <a href="https://www.bellingen.nsw.gov.au/Your-Council/Our-Mayor-and-Councillors" rel="noopener">Contact them</a></li>
<li><a href="https://www.bellingen.nsw.gov.au/Your-Council/Council-Meetings" rel="noopener">Council meetings</a>: see what's being decided</li></ul>${acc("leadership", W.leadership)}</details>
<details><summary><b>Bins &amp; rubbish</b></summary><ul>
<li>Which bin this week? Get the free <b>Coffs Coast Waste Services</b> app, or call the hotline on <a href="tel:1800265495">1800 265 495</a></li>
<li>Tip: Raleigh Waste Management Centre, 146 Short Cut Road, Raleigh. Open Wednesday to Monday 8am to 4pm, closed Tuesdays. <a href="tel:0266553777">02 6655 3777</a> (with a Community Recycling Centre for paint, batteries and oil). <span class="srcw">Source:</span> <a href="https://www.bellingen.nsw.gov.au/Services/Waste-and-Recycling/Waste-Facilities-Charges/Raleigh-Waste-Management-Centre" rel="noopener">Bellingen Shire Council</a></li>
<li>Seen illegal dumping? <a href="https://ridonline.epa.nsw.gov.au/" rel="noopener">Report it online</a></li></ul>${acc("waste", W.waste)}</details>
<details><summary><b>Got a problem?</b></summary><ul>
<li>Pothole, broken footpath, streetlight, overgrown block: tell council on <a href="tel:0266557300">02 6655 7300</a> or <a href="mailto:council@bellingen.nsw.gov.au">council@bellingen.nsw.gov.au</a></li>
<li>Not happy with how council handled it? <a href="https://www.ombo.nsw.gov.au" rel="noopener">NSW Ombudsman</a></li></ul></details>
<details><summary><b>Contact council</b></summary><ul>
<li>📞 <a href="tel:0266557300">02 6655 7300</a></li>
<li>✉️ <a href="mailto:council@bellingen.nsw.gov.au">council@bellingen.nsw.gov.au</a></li>
<li>🏛️ 33 Hyde Street, Bellingen</li></ul>${acc("contact", W.contact)}</details>
`,
    idx: [
      ["mayor deputy councillor councillors council who runs","Who runs the place","Mayor Cr Steve Allan, Deputy Mayor Cr Graeme Shephard, plus 5 councillors.","#know"],
      ["bin bins rubbish recycling garbage which bin","Bins","Which bin this week? Coffs Coast Waste Services app or 1800 265 495.","#know"],
      ["tip dump raleigh waste","The tip","Raleigh Waste Management Centre, 146 Short Cut Road. Closed Tuesdays.","#know"],
      ["council phone contact email call","Contact council","02 6655 7300, council@bellingen.nsw.gov.au.","#know"],
      ["bellingen facts history dorrigo urunga rainforest gumbaynggirr why fun","Why Bello?","Fun facts about the shire, every one sourced.","/why"],
    ],
    cw: [["DORRIGO", "Plateau town with the rainforest Skywalk"], ["URUNGA", "Where the rivers meet the sea, postcode 2455"], ["BELLINGER", "River that runs through town"],
      ["KALANG", "River that joins the Bellinger at Urunga"], ["DANGAR", "___ Falls, just outside Dorrigo"], ["SKYWALK", "Dorrigo's walkway above the rainforest canopy"],
      ["GUMBAYNGGIRR", "Traditional custodians of the Bellingen Shire"], ["MYLESTOM", "Riverside village near Urunga"]],
    why: { slug: "why", title: "Why Bello?", card: "Fun facts: World Heritage rainforest, where the rivers meet the sea", intro: "Small shire, big story. Every fact sourced." },
    surf: [["Urunga", "E", "W", "Handles swell from north to south; punchy and wind-exposed"]], surfNote: "Hungry Head and Mylestom are patrolled September to April.",
    fish: { spots: [
      ["Urunga Boardwalk (breakwall end)", "Breakwall", "mulloway, bream, luderick", ""], ["Lido breakwall, Urunga", "Breakwall", "bream, luderick", ""], ["Kalang River rock wall", "Breakwall", "bream, luderick", ""],
      ["Newry Island bridge (Kalang River)", "Estuary", "flathead, bream, mulloway, mangrove jack", ""], ["Hungry Head", "Rocks", "bream, snapper, whiting", "Rock fishing: watch the swell"],
      ["Wenonah Headland", "Rocks", "bream, snapper, drummer, tailor, mulloway", "Dirt road can wash out"], ["North Beach, Mylestom", "Beach", "bream, tailor, mulloway, whiting", "4WD permit needed"],
      ["Bellinger River", "River", "sand whiting, luderick, mulloway; Aussie bass upstream", "Bass and estuary perch: catch and release only, May to August"]] },
    fields: null,
    watch: {
      leadership: { owner: "Council", name: "Bellingen Shire Council, Our Mayor and Councillors", url: "https://www.bellingen.nsw.gov.au/Your-Council/Our-Mayor-and-Councillors" },
      waste: { owner: "Recycling Near You", name: "Recycling Near You, Bellingen Shire", url: "https://recyclingnearyou.com.au/otherwaste/BellingenNSW" },
      contact: { owner: "Council", name: "Bellingen Shire Council website", url: "https://www.bellingen.nsw.gov.au/Your-Council/Our-Mayor-and-Councillors" },
    },
    schools: ["Bellingen Public School","Bellingen High School","Dorrigo Public School","Dorrigo High School","Urunga Public School"],
    faves: [["Dorrigo Rainforest Centre & Skywalk","Free","Walk out over the World Heritage rainforest canopy."],["Dangar Falls","Free","Short walk to the falls just outside Dorrigo."],
      ["Urunga boardwalk","Free","Walk out to where the rivers meet the sea."],["Bellingen markets","Free entry","Local food, crafts and music. Check dates before you go."]],
    facts: [
      ["🌿", "World Heritage on the doorstep", "Dorrigo National Park is part of the Gondwana Rainforests of Australia World Heritage Area.", "https://en.wikipedia.org/wiki/Dorrigo_National_Park", "Wikipedia"],
      ["🌊", "Where two rivers meet the sea", "At Urunga, the Bellinger and Kalang rivers come together and meet the ocean.", "https://en.wikipedia.org/wiki/Urunga", "Wikipedia"],
      ["🌏", "Gumbaynggirr Country", "The Bellingen Shire is on Gumbaynggirr Country.", "https://en.wikipedia.org/wiki/Gumbaynggirr", "Wikipedia"]],
    mavKB: `Site: 2454 Maverick, a free local info site for the Bellingen Shire (2453 Dorrigo, 2454 Bellingen, 2455 Urunga). Never charges. A gift from Maverick Digital.
Pages: /2453 /2454 /2455 area pages; /open what's open now; /fridge dinner ideas from your fridge (free email unlock, or snap a photo); /school school run check; /birthday local birthday deals (say "Maverick"); /genalpha Gen Alpha slang interpreter; /rip death notices; /crossword daily crossword; /submit add an event free (\$50 or less per person); /feedback; /new; /privacy; /charter.
Area page sections (ids): today=At a glance; tools=Handy tools; alerts=fires and weather warnings; events=What's on; news=local headlines; memory=In memory; fuel=cheapest fuel; sea=tides; know=Know your area (mayor Cr Steve Allan, deputy Cr Graeme Shephard, council 02 6655 7300, bins via Coffs Coast Waste Services app or 1800 265 495, tip at Raleigh); kids=Weekend for kids; flights=flight status; holidays; puzzles=crossword; beaches (beach, surf and surf cams).
Emergencies: 000. Tides are estimates, not for navigation.`,
  },
  "2485": {
    code: "2485", brand: "The Daily Maverick", place: "Tweed Heads", short: "The Tweed", domain: "2485-maverick.live",
    venues: [],
    towns: {
      "2484": { name: "Murwillumbah", lat: -28.3270, lon: 153.3950, mlat: -28.30, mlon: 153.62, live: true },
      "2485": { name: "Tweed Heads", lat: -28.1760, lon: 153.5410, mlat: -28.17, mlon: 153.60, live: true },
      "2486": { name: "Banora Point", lat: -28.2130, lon: 153.5360, mlat: -28.17, mlon: 153.60, live: true },
      "2487": { name: "Kingscliff", lat: -28.2570, lon: 153.5780, mlat: -28.26, mlon: 153.62, live: true },
    },
    home: { lat: -28.1760, lon: 153.5410 },
    bbox: "-28.65,153.00,-28.15,153.65",
    funerals: [{ name: "McGuiness Funerals", url: "https://mcguinessfunerals.com.au/tributes/" }],
    airport: { name: "Gold Coast Airport", url: "https://www.flightaware.com/live/airport/YBCG", iata: "OOL", feed: "https://2450-maverick.live/api/flights" },
    coverage: "We cover the whole Tweed Shire, starting with 2484, 2485, 2486 and 2487.", soon: "",
    footer: `<b>Big tech divided us. Your Daily Maverick uses them to bring regional communities back together.</b>`,
    ack: `2485 Maverick acknowledges the Ngandowal and Minyungbal speaking people of Bundjalung Country, the Traditional Custodians of the land and waters of the Tweed, and pays respect to Elders past and present.`,
    sign: "Built in 2450, made for 2485, raised by the world.",
    goal: 10000, goalText: "about one in ten people in the shire",
    council: { name: "Tweed Shire Council", mayor: "Cr Reece Byrnes", meetings: "https://www.tweed.nsw.gov.au/council/councillors-meetings/council-meetings", progress: "https://www.tweed.nsw.gov.au/council/policies-plans-reports/planning-reporting-to-community", url: "https://www.tweed.nsw.gov.au", phone: "02 6670 2400", urgent: "Tweed Shire Council (24 hours for urgent issues): 02 6670 2400" },
    binsTip: "Check your bin days with Find my bin day on the Tweed Shire Council website, or call 02 6670 2400.",
    mavExample: "I'm Sam, I live in Kingscliff, I've got a kid at Kingscliff High and I love the beach",
    schoolsArea: "Public schools in the Tweed Shire",
    warnRe: /northern rivers|tweed|murwillumbah|kingscliff|byron coast|coastal waters|marine/i,
    news: [
      { name: "The Northern Rivers Times", url: "https://thenorthernriverstimes.com.au", feed: "https://thenorthernriverstimes.com.au/northern-rivers-local-news/category/northern-rivers-local-news/tweed-shire-local-news/feed/", need: /tweed|murwillumbah|kingscliff|banora|terranora|pottsville|cabarita|bogangar|hastings point|fingal|chinderah|tumbulgum|\buki\b|tyalgum|chillingham|casuarina|cudgen|condong|burringbar|mooball|wollumbin/i },
      { name: "The Echo", url: "https://www.echo.net.au", feed: "https://www.echo.net.au/feed/", need: /tweed|murwillumbah|kingscliff|banora|terranora|pottsville|cabarita|bogangar|hastings point|fingal|chinderah|tumbulgum|\buki\b|tyalgum|chillingham|casuarina|cudgen|wollumbin/i },
      { name: "NBN News", url: "https://www.nbnnews.com.au", feed: "https://www.nbnnews.com.au/feed/", cat: /northern rivers/i, need: /tweed|murwillumbah|kingscliff|banora|terranora|pottsville|cabarita|fingal|chinderah|tumbulgum|\buki\b|tyalgum|casuarina/i },
    ],
    know: (W, acc) => `<details open><summary><b>Who runs the place</b></summary><ul>
<li>Mayor: <b>Cr Reece Byrnes</b> · Deputy Mayor: <b>Cr Meredith Dennis OAM</b></li>
<li>Councillors: Rhiannon Brinsmead, Chris Cherry, Nola Firth, Kimberly Hone, James Owen. <a href="https://www.tweed.nsw.gov.au/council/councillors-meetings/mayor-councillors" rel="noopener">Contact them</a></li>
<li><a href="https://www.tweed.nsw.gov.au/council/councillors-meetings/council-meetings" rel="noopener">Council meetings</a>: see what's being decided</li></ul>${acc("leadership", W.leadership)}</details>
<details><summary><b>Bins &amp; rubbish</b></summary><ul>
<li>Which bin this week? Use <a href="https://www.tweed.nsw.gov.au/property-rates/waste-recycling/bin-services-collection/bin-collection-days" rel="noopener">Find my bin day</a>, or call council on <a href="tel:0266702400">02 6670 2400</a></li>
<li>Tip: Stotts Creek Resource Recovery Centre, 298 Bartletts Road, Stotts Creek, off Tweed Valley Way (with a Community Recycling Centre)</li>
<li>Seen illegal dumping? <a href="https://ridonline.epa.nsw.gov.au/" rel="noopener">Tell the EPA online</a></li></ul>${acc("waste", W.waste)}</details>
<details><summary><b>Got a problem?</b></summary><ul>
<li>Pothole, broken footpath, streetlight, overgrown block: tell council on <a href="tel:0266702400">02 6670 2400</a> or <a href="mailto:tsc@tweed.nsw.gov.au">tsc@tweed.nsw.gov.au</a></li>
<li>Urgent (sewer overflow, water supply problem, dog attack, road hazard): call <a href="tel:0266702400">02 6670 2400</a>, any time</li>
<li>Not happy with how council handled it? <a href="https://www.ombo.nsw.gov.au" rel="noopener">NSW Ombudsman</a></li></ul></details>
<details><summary><b>Contact council</b></summary><ul>
<li>📞 <a href="tel:0266702400">02 6670 2400</a></li>
<li>✉️ <a href="mailto:tsc@tweed.nsw.gov.au">tsc@tweed.nsw.gov.au</a></li>
<li>🏛️ Civic and Cultural Centre, corner of Brett and Wharf streets, Tweed Heads</li>
<li>🏛️ Civic and Cultural Centre, 10–14 Tumbulgum Road, Murwillumbah</li></ul>${acc("contact", W.contact)}</details>
`,
    idx: [
      ["mayor deputy councillor councillors council who runs","Who runs the place","Mayor Cr Reece Byrnes, Deputy Mayor Cr Meredith Dennis OAM, plus 5 councillors.","#know"],
      ["bin bins rubbish recycling garbage which bin","Bins","Which bin this week? Find my bin day on the council website, or 02 6670 2400.","#know"],
      ["tip dump stotts creek waste","The tip","Stotts Creek Resource Recovery Centre, 298 Bartletts Road, Stotts Creek.","#know"],
      ["council phone contact email call","Contact council","02 6670 2400, tsc@tweed.nsw.gov.au.","#know"],
      ["tweed facts history wollumbin caldera border bundjalung why fun","Why the Tweed?","Fun facts about the shire, every one sourced.","/why"],
    ],
    cw: [["WOLLUMBIN", "Aboriginal name for Mount Warning"], ["MURWILLUMBAH", "Shire town on the Tweed River, postcode 2484"], ["KINGSCLIFF", "Coastal town, postcode 2487"],
      ["COOLANGATTA", "Queensland twin town of Tweed Heads"], ["CALDERA", "The Tweed sits in one of the world's largest erosion ___s"], ["TUMBULGUM", "Historic river port village"],
      ["BUNDJALUNG", "The Country the Tweed Shire sits on"], ["DURANBAH", "Surf break known as D-Bah"]],
    why: { slug: "why", title: "Why the Tweed?", card: "Fun facts: a giant caldera, a border town and two time zones", intro: "Border town, big caldera, bigger story. Every fact sourced." },
    surf: [["Duranbah", "SSE", "WSW", "Punchy lefts and rights off the breakwall; crowded when it's on, watch the rips"],
      ["Fingal Head", "NE", "SW", "Right-hand point over boulders and sand; gets hollow from head high"],
      ["Kingscliff", "NE", "SW", "Beach break, good for beginners; the rip rarely lets up"],
      ["Cabarita", "SE", "WSW", "Exposed point break, best around mid tide; watch for rocks and rips"]],
    surfNote: "Always swim between the red and yellow flags.",
    fish: { spots: [
      ["Tweed River mouth rock walls", "Breakwall", "bream, tailor, luderick, mulloway, flathead, whiting", "Strong currents: fish the turn of the tide"],
      ["Boyds Bay Bridge, Tweed Heads", "Estuary", "flathead, trevally, mulloway, luderick", ""],
      ["Chinderah, Tweed River", "Estuary", "flathead, trevally, mulloway, luderick", ""],
      ["Cudgen Creek rock wall, Kingscliff", "Breakwall", "tailor, flathead", ""],
      ["Cudgen Creek, Kingscliff", "Estuary", "whiting, bream, flathead", "Spearfishing closed north of the Kingscliff traffic bridge"],
      ["Fingal Head", "Rocks", "mulloway", "Rock fishing: only in flat seas. Cook Island Aquatic Reserve offshore is closed to all fishing"],
      ["Tweed Coast surf beaches", "Beach", "tailor, bream, dart, whiting, mulloway", "No vehicles on Tweed Shire beaches"],
      ["Tweed River", "River", "bream, mulloway, luderick, flathead, mangrove jack", "Bull sharks can be about. Bass and estuary perch: catch and release only, May to August"]] },
    fields: null,
    watch: {
      leadership: { owner: "Council", name: "Tweed Shire Council, Mayor and Councillors", url: "https://www.tweed.nsw.gov.au/council/councillors-meetings/mayor-councillors" },
      waste: { owner: "Recycling Near You", name: "Recycling Near You, Tweed Shire", url: "https://recyclingnearyou.com.au/otherwaste/TweedNSW" },
      contact: { owner: "Council", name: "Tweed Shire Council, Contact us", url: "https://www.tweed.nsw.gov.au/contact-us" },
    },
    schools: ["Banora Point Public School","Bilambil Public School","Bogangar Public School","Carool Public School","Centaur Public School","Chillingham Public School","Condong Public School","Crystal Creek Public School","Cudgen Public School","Dungay Public School","Duranbah Public School","Fingal Head Public School","Kingscliff Public School","Murwillumbah East Public School","Murwillumbah Public School","Pottsville Beach Public School","Stokers Siding Public School","Terranora Public School","Tumbulgum Public School","Tweed Heads Public School","Tweed Heads South Public School","Tyalgum Public School","Uki Public School","Banora Point High School","Kingscliff High School","Murwillumbah High School","Tweed River High School","Wollumbin High School","Caldera School"],
    faves: [["Tweed Regional Gallery & Margaret Olley Art Centre","Free","Free entry, Wednesday to Sunday, 10am to 4pm, Murwillumbah South."],["Point Danger","Free","Stand right on the NSW and Queensland border at Tweed Heads."],
      ["Cudgen Creek, Kingscliff","Free","Creek, rock wall and beach in the middle of Kingscliff."],["Duranbah Beach","Free","Watch the surfers at D-Bah, beside the Tweed River breakwall."]],
    facts: [
      ["🏔️", "Wollumbin, the cloud catcher", "Wollumbin (Mount Warning) stands 1,159 m and is part of the World Heritage-listed Gondwana Rainforests of Australia.", "https://en.wikipedia.org/wiki/Mount_Warning", "Wikipedia"],
      ["🌋", "Living inside a volcano", "The Tweed sits in one of the largest natural erosion calderas in the world.", "https://www.tweed.nsw.gov.au/council/about-council/the-tweed", "Tweed Shire Council"],
      ["🗺️", "A town on the border", "Tweed Heads sits on the Queensland border, beside its twin town Coolangatta.", "https://en.wikipedia.org/wiki/Tweed_Heads,_New_South_Wales", "Wikipedia"],
      ["⏰", "Two time zones, one street", "In daylight saving time, NSW is one hour ahead of Queensland, so Tweed Heads and Coolangatta show different times.", "https://gallery.tweed.nsw.gov.au/visit/contact-us-visiting", "Tweed Regional Gallery"],
      ["✈️", "A runway across two states", "Gold Coast Airport's main runway cuts across the Queensland and NSW border.", "https://en.wikipedia.org/wiki/Gold_Coast_Airport", "Wikipedia"],
      ["🌿", "Wild about nature", "The Tweed has the highest biodiversity in NSW and 37 km of coastline.", "https://www.tweed.nsw.gov.au/council/about-council/the-tweed", "Tweed Shire Council"],
      ["🌏", "Bundjalung Country", "The Tweed Shire is on the Country of the Ngandowal and Minyungbal speaking people of the Bundjalung nation.", "https://www.tweed.nsw.gov.au/community/community-support/people-communities/aboriginal-torres-strait-islander", "Tweed Shire Council"]],
    mavKB: `Site: 2485 Maverick, a free local info site for the Tweed Shire (2484 Murwillumbah, 2485 Tweed Heads, 2486 Banora Point and Tweed Heads South, 2487 Kingscliff). Never charges. A gift from Maverick Digital.
Pages: /2484 /2485 /2486 /2487 area pages; /open what's open now; /fridge dinner ideas from your fridge (free email unlock, or snap a photo); /school school run check; /birthday local birthday deals (say "Maverick"); /genalpha Gen Alpha slang interpreter; /rip death notices; /crossword daily crossword; /submit add an event free (\$50 or less per person); /feedback; /new; /privacy; /charter.
Area page sections (ids): today=At a glance; tools=Handy tools; alerts=fires and weather warnings; events=What's on; news=local headlines; memory=In memory; fuel=cheapest fuel; sea=tides; know=Know your area (mayor Cr Reece Byrnes, deputy Cr Meredith Dennis OAM, council 02 6670 2400, bins via Find my bin day on the council website or 02 6670 2400, tip at Stotts Creek); kids=Weekend for kids; flights=flight status; holidays; puzzles=crossword; beaches (beach, surf and surf cams).
Emergencies: 000. Tides are estimates, not for navigation. NSW and Queensland clocks differ by an hour in daylight saving time.`,
  },
  "2430": {
    code: "2430", brand: "The Daily Maverick", place: "Taree", short: "Taree", domain: "2430-maverick.live",
    venues: [],
    towns: {
      "2427": { name: "Harrington & Crowdy Head", lat: -31.8670, lon: 152.6830, mlat: -31.88, mlon: 152.78, live: true },
      "2429": { name: "Wingham", lat: -31.8670, lon: 152.3670, mlat: -31.95, mlon: 152.66, live: true },
      "2430": { name: "Taree", lat: -31.9000, lon: 152.4500, mlat: -31.95, mlon: 152.66, live: true },
    },
    home: { lat: -31.9000, lon: 152.4500 },
    bbox: "-32.10,152.25,-31.75,152.85",
    funerals: [{ name: "WT Howard Funerals", url: "https://wthowardfunerals.com.au/" }],
    airport: { name: "Port Macquarie Airport", url: "https://www.flightaware.com/live/airport/YPMQ", iata: "PQQ", feed: "" },
    coverage: "We cover the Manning Valley: 2427, 2429 and 2430.", soon: "",
    footer: `<b>Big tech divided us. Your Daily Maverick uses them to bring regional communities back together.</b>`,
    ack: `2430 Maverick acknowledges the Biripi people, the Traditional Custodians of the land on which we live and work, and pays respect to Elders past and present.`,
    sign: "Built in 2450, made for 2430, raised by the world.",
    goal: 5000, goalText: "about a third of Taree's population",
    council: { name: "MidCoast Council", mayor: "Cr Alan Tickle", meetings: "https://www.midcoast.nsw.gov.au/Your-Council/Council-meetings/Agendas-and-minutes", progress: "", url: "https://www.midcoast.nsw.gov.au", phone: "02 7955 7777", urgent: "MidCoast Council: 02 7955 7777 (water and sewer faults 24/7: 1300 133 455)" },
    binsTip: "Check your bin days by entering your address on MidCoast Council's bin collection page, or call council on 02 7955 7777.",
    mavExample: "I'm Sam, I live in Wingham, I've got a kid at Taree High and I love fishing at Harrington",
    schoolsArea: "Public schools in the Manning Valley",
    warnRe: /mid north coast|hunter|manning|taree|wingham|harrington|macquarie coast|coastal waters|marine/i,
    news: [
      { name: "Manning River Times", url: "https://www.manningrivertimes.com.au", feed: "https://www.manningrivertimes.com.au/rss.xml" },
      { name: "NBN News", url: "https://www.nbnnews.com.au", feed: "https://www.nbnnews.com.au/feed/", cat: /mid north/i, need: /taree|manning|wingham|harrington|crowdy|old bar|cundletown|tinonee|midcoast|mid-coast|mid coast/i },
    ],
    know: (W, acc) => `<details open><summary><b>Who runs the place</b></summary><ul>
<li>Mayor: <b>Cr Alan Tickle</b> · Deputy Mayor: <b>Cr Jeremy Miller</b></li>
<li>Councillors: Phillip Beazley, Michael Graham, Peter Howard, Janeece Irving, Mal McKenzie, Thomas O'Keefe, Claire Pontin, Nicole Turnbull, Digby Wilson. <a href="https://www.midcoast.nsw.gov.au/Your-Council/Mayor-Councillors" rel="noopener">Contact them</a></li>
<li><a href="https://www.midcoast.nsw.gov.au/Your-Council/Council-meetings/Agendas-and-minutes" rel="noopener">Council meetings</a>: see what's being decided</li></ul>${acc("leadership", W.leadership)}</details>
<details><summary><b>Bins &amp; rubbish</b></summary><ul>
<li>Which bin this week? <a href="https://www.midcoast.nsw.gov.au/Services/Waste-and-recycling/When-is-my-bin-collected" rel="noopener">Enter your address on council's bin page</a>, or call <a href="tel:0279557777">02 7955 7777</a></li>
<li>Tip: Taree Waste Management Centre, 6843 The Bucketts Way, Tinonee (with a Community Recycling Centre for paint, batteries and e-waste)</li>
<li>Seen illegal dumping? <a href="https://ridonline.epa.nsw.gov.au/" rel="noopener">Tell the EPA online</a></li></ul>${acc("waste", W.waste)}</details>
<details><summary><b>Got a problem?</b></summary><ul>
<li>Pothole, broken footpath, streetlight, overgrown block: tell council on <a href="tel:0279557777">02 7955 7777</a>, <a href="mailto:council@midcoast.nsw.gov.au">council@midcoast.nsw.gov.au</a> or <a href="https://www.midcoast.nsw.gov.au/Contact-us/Report-and-request" rel="noopener">online</a></li>
<li>Water or sewer fault, any time: <a href="tel:1300133455">1300 133 455</a></li>
<li>Not happy with how council handled it? <a href="https://www.ombo.nsw.gov.au" rel="noopener">NSW Ombudsman</a></li></ul></details>
<details><summary><b>Contact council</b></summary><ul>
<li>📞 <a href="tel:0279557777">02 7955 7777</a></li>
<li>✉️ <a href="mailto:council@midcoast.nsw.gov.au">council@midcoast.nsw.gov.au</a></li>
<li>🏛️ Yalawanyi Ganya, 2 Biripi Way, Taree</li></ul>${acc("contact", W.contact)}</details>
`,
    idx: [
      ["mayor deputy councillor councillors council who runs","Who runs the place","Mayor Cr Alan Tickle, Deputy Mayor Cr Jeremy Miller, plus 9 councillors.","#know"],
      ["bin bins rubbish recycling garbage which bin","Bins","Which bin this week? Council's bin page or 02 7955 7777.","#know"],
      ["tip dump tinonee waste bucketts","The tip","Taree Waste Management Centre, 6843 The Bucketts Way, Tinonee.","#know"],
      ["council phone contact email call water sewer","Contact council","02 7955 7777, council@midcoast.nsw.gov.au. Water and sewer faults 1300 133 455.","#know"],
      ["taree facts history manning wingham harrington biripi why fun","Why Taree?","Fun facts about the Manning Valley, every one sourced.","/why"],
    ],
    cw: [["MANNING", "River that splits at Taree into a double delta"], ["WINGHAM", "Town at postcode 2429"], ["HARRINGTON", "Village on the northern entrance of the Manning"],
      ["CROWDY", "___ Head, with its 1878 lighthouse"], ["ELLENBOROUGH", "___ Falls, near Elands on the Bulga Plateau"], ["BIRIPI", "Traditional custodians of the Manning Valley"],
      ["TAREEBIT", "Biripi word that gave Taree its name"], ["CUNDLETOWN", "Village settled along with Taree in 1831"]],
    why: { slug: "why", title: "Why Taree?", card: "Fun facts: a double delta river, a town named after a fig tree", intro: "Big river, big story. Every fact sourced." },
    surf: [["Old Bar", "NE", "NW", "Beach break with lefts and rights; works on all tides"]], surfNote: "",
    fish: { spots: [
      ["Harrington river wall", "Breakwall", "bream", ""], ["Manning Point spur wall", "Breakwall", "bream", ""], ["Crowdy Boat Harbour", "Harbour", "kingfish, bream", ""],
      ["Harrington Beach", "Beach", "bream, whiting, tailor, salmon", ""], ["Crowdy Beach", "Beach", "tailor", ""],
      ["Harrington estuary", "Estuary", "tailor, flathead", ""], ["Lower Manning River sand flats", "Estuary", "whiting", ""],
      ["Lansdowne River", "River", "flathead, mud crabs", ""]] },
    fields: null,
    watch: {
      leadership: { owner: "Council", name: "MidCoast Council, Mayor and Councillors", url: "https://www.midcoast.nsw.gov.au/Your-Council/Mayor-Councillors" },
      waste: { owner: "Recycling Near You", name: "Recycling Near You, MidCoast Council", url: "https://recyclingnearyou.com.au/council/MidCoastNSW" },
      contact: { owner: "Council", name: "MidCoast Council website", url: "https://www.midcoast.nsw.gov.au/Contact" },
    },
    schools: ["Taree Public School","Taree West Public School","Chatham Public School","Manning Gardens Public School","Cundletown Public School","Tinonee Public School",
      "Old Bar Public School","Wingham Public School","Wingham Brush Public School","Harrington Public School","Coopernook Public School","Lansdowne Public School",
      "Krambach Public School","Taree High School","Chatham High School","Wingham High School"],
    faves: [["Wingham Brush boardwalk","Easy walk","1.9 km loop through rainforest under a grey-headed flying-fox colony. Check NPWS alerts before you go."],["Ellenborough Falls","Free","View the falls from the top, or take the 641 steps to the bottom."],
      ["Wingham flying-fox fly-out","Sunset","Watch the flying-foxes leave over the Manning River from Wingham Riverside Reserve."],["Crowdy Head","Lookout","Headland with an 1878 lighthouse and a small fishing harbour."]],
    facts: [
      ["🌊", "A double delta river", "The Manning is called the only double delta river in the southern hemisphere with two permanent entrances to the sea, at Harrington and Old Bar.", "https://en.wikipedia.org/wiki/Manning_River", "Wikipedia"],
      ["🌳", "Named after a fig tree", "Taree comes from the Biripi word tareebit, meaning tree by the river: the sandpaper fig.", "https://en.wikipedia.org/wiki/Taree", "Wikipedia"],
      ["💦", "A huge single drop", "Ellenborough Falls, near Wingham, is described as the second longest single-drop waterfall in the Southern Hemisphere.", "https://en.wikipedia.org/wiki/Wingham,_New_South_Wales", "Wikipedia"],
      ["🏮", "Lighthouse since 1878", "Crowdy Head Light was built in 1878.", "https://en.wikipedia.org/wiki/Crowdy_Head", "Wikipedia"],
      ["🌏", "Biripi Country", "The Manning Valley is on Biripi Country.", "https://en.wikipedia.org/wiki/Biripi", "Wikipedia"]],
    mavKB: `Site: 2430 Maverick, a free local info site for the Manning Valley (2427 Harrington & Crowdy Head, 2429 Wingham, 2430 Taree). Never charges. A gift from Maverick Digital.
Pages: /2427 /2429 /2430 area pages; /open what's open now; /fridge dinner ideas from your fridge (free email unlock, or snap a photo); /school school run check; /birthday local birthday deals (say "Maverick"); /genalpha Gen Alpha slang interpreter; /rip death notices; /crossword daily crossword; /submit add an event free (\$50 or less per person); /feedback; /new; /privacy; /charter.
Area page sections (ids): today=At a glance; tools=Handy tools; alerts=fires and weather warnings; events=What's on; news=local headlines; memory=In memory; fuel=cheapest fuel; sea=tides; know=Know your area (mayor Cr Alan Tickle, deputy Cr Jeremy Miller, MidCoast Council 02 7955 7777, water and sewer faults 1300 133 455, bins via council's bin page, tip at Taree Waste Management Centre, Tinonee); kids=Weekend for kids; flights=flight status (Port Macquarie Airport, Taree has no scheduled flights); holidays; puzzles=crossword; beaches (beach, surf and surf cams).
Emergencies: 000. Tides are estimates, not for navigation.`,
  },
  "2350": {
    code: "2350", brand: "The Daily Maverick", place: "Armidale", short: "Armidale", domain: "2350-maverick.live",
    venues: [
      { name: "Armidale Farmers' Market", url: "https://www.nsw.gov.au/visiting-and-exploring-nsw/nsw-events/armidale-farmers-market", venue: "Armidale Farmers' Market", market: true },
      { name: "Armidale Sunday Markets (Beardy Street Mall)", url: "https://www.nsw.gov.au/visiting-and-exploring-nsw/nsw-events/armidale-sunday-markets-mall", venue: "Armidale Sunday Markets", market: true },
    ],
    towns: {
      "2350": { name: "Armidale", lat: -30.5000, lon: 151.6500, mlat: -30.5000, mlon: 151.6500, live: true },
      "2351": { name: "University of New England", lat: -30.4867, lon: 151.6430, mlat: -30.4867, mlon: 151.6430, live: true },
      "2365": { name: "Guyra", lat: -30.2000, lon: 151.6670, mlat: -30.2000, mlon: 151.6670, live: true },
    },
    home: { lat: -30.5000, lon: 151.6500 },
    bbox: "-30.90,151.30,-29.95,152.40",
    funerals: [{ name: "Piddington's", url: "https://piddingtons.com.au/#notices" }],
    airport: { name: "Armidale Airport", url: "https://www.flightaware.com/live/airport/YARM", iata: "ARM", feed: "https://2450-maverick.live/api/flights" },
    coverage: "We cover the Armidale region: 2350 Armidale, 2351 University of New England and 2365 Guyra.", soon: "",
    footer: `<b>Big tech divided us. Your Daily Maverick uses them to bring regional communities back together.</b>`,
    ack: `2350 Maverick acknowledges the Anaiwan people, the Traditional Custodians of the land on which we live and work, and pays respect to Elders past and present.`,
    sign: "Built in 2450, made for 2350, raised by the world.",
    goal: 10000, goalText: "about a third of the region",
    council: { name: "Armidale Regional Council", mayor: "Cr Sam Coupland", meetings: "https://www.armidale.nsw.gov.au/Council/Meetings-agendas-and-minutes", progress: "https://www.armidale.nsw.gov.au/Council/Administration/Integrated-planning-and-reporting", url: "https://www.armidale.nsw.gov.au", phone: "1300 136 833", urgent: "Armidale Regional Council: 1300 136 833" },
    binsTip: "Check your bin day on the collection calendar on council's website, or call the Waste Services Hotline on 1300 136 322.",
    mavExample: "I'm Jess, I live in Guyra, I've got a kid at Armidale Secondary College and I love the farmers' market",
    schoolsArea: "Public schools in the Armidale region",
    warnRe: /northern tablelands|new england|armidale|guyra|ebor|wollomombi/i,
    news: [
      { name: "The Armidale Express", url: "https://www.armidaleexpress.com.au", feed: "https://www.armidaleexpress.com.au/rss.xml" },
      { name: "New England Times", url: "https://www.netimes.com.au", feed: "https://www.netimes.com.au/feed/", need: /armidale|guyra|ebor|wollomombi|hillgrove|black mountain|ben lomond|university of new england|\bUNE\b/i },
      { name: "NBN News", url: "https://www.nbnnews.com.au", feed: "https://www.nbnnews.com.au/feed/", cat: /north west/i, need: /armidale|guyra|ebor|wollomombi|new england|university of new england|\bUNE\b/i },
    ],
    know: (W, acc) => `<details open><summary><b>Who runs the place</b></summary><ul>
<li>Mayor: <b>Cr Sam Coupland</b> · Deputy Mayor: <b>Cr Todd Redwood</b></li>
<li>Councillors: Kay Endres, Paul Gaddes, Eli Imad, Susan McMichael, Dorothy Robinson, Rob Taber, Bradley Widders. <a href="https://www.armidale.nsw.gov.au/Council/Councillors" rel="noopener">Contact them</a></li>
<li><a href="https://www.armidale.nsw.gov.au/Council/Meetings-agendas-and-minutes" rel="noopener">Council meetings</a>: see what's being decided</li></ul>${acc("leadership", W.leadership)}</details>
<details><summary><b>Bins &amp; rubbish</b></summary><ul>
<li>Which bin this week? Check the <a href="https://www.armidale.nsw.gov.au/Services/Waste-and-recycling-services/Waste-and-recycling-collection" rel="noopener">collection calendars and zone map</a>, or call the Waste Services Hotline on <a href="tel:1300136322">1300 136 322</a></li>
<li>Tip: Armidale Waste Management Facility, 108 Long Swamp Road, Armidale (with a Community Recycling Centre for paint, batteries and oil). Guyra Waste Transfer Station also has a Community Recycling Centre</li>
<li>Seen illegal dumping? <a href="https://ridonline.epa.nsw.gov.au/" rel="noopener">Tell the EPA online</a></li></ul>${acc("waste", W.waste)}</details>
<details><summary><b>Got a problem?</b></summary><ul>
<li>Pothole, broken footpath, streetlight, overgrown block: tell council on <a href="tel:1300136833">1300 136 833</a> or <a href="mailto:council@armidale.nsw.gov.au">council@armidale.nsw.gov.au</a></li>
<li>Not happy with how council handled it? <a href="https://www.ombo.nsw.gov.au" rel="noopener">NSW Ombudsman</a></li></ul></details>
<details><summary><b>Contact council</b></summary><ul>
<li>📞 <a href="tel:1300136833">1300 136 833</a></li>
<li>✉️ <a href="mailto:council@armidale.nsw.gov.au">council@armidale.nsw.gov.au</a></li>
<li>🏛️ 135 Rusden Street, Armidale</li></ul>${acc("contact", W.contact)}</details>
`,
    idx: [
      ["mayor deputy councillor councillors council who runs","Who runs the place","Mayor Cr Sam Coupland, Deputy Mayor Cr Todd Redwood, plus 7 councillors.","#know"],
      ["bin bins rubbish recycling garbage which bin","Bins","Which bin this week? Council's collection calendar or the Waste Services Hotline on 1300 136 322.","#know"],
      ["tip dump long swamp waste guyra","The tip","Armidale Waste Management Facility, 108 Long Swamp Road.","#know"],
      ["council phone contact email call","Contact council","1300 136 833, council@armidale.nsw.gov.au.","#know"],
      ["armidale facts history guyra une university wollomombi falls anaiwan why fun","Why Armidale?","Fun facts about the region, every one sourced.","/why"],
    ],
    cw: [["GUYRA", "Tableland town, postcode 2365"], ["WOLLOMOMBI", "Falls east of Armidale in Oxley Wild Rivers National Park"], ["ANAIWAN", "Traditional Custodians of the Armidale region"],
      ["BOOLOOMINBAH", "Historic homestead on the UNE campus"], ["DUMARESQ", "___ Dam, stocked with trout, just outside Armidale"], ["MALPAS", "___ Dam, near Guyra, stocked with trout"],
      ["SKYE", "Scottish isle whose Armadale gave the city its name"], ["CATHEDRAL", "St Peter's ___, opened for worship in 1875"]],
    why: { slug: "why", title: "Why Armidale?", card: "Fun facts: high country city, huge waterfalls, Australia's first university outside a capital", intro: "Tableland city, big story. Every fact sourced." },
    surf: [], surfNote: "",
    fish: { spots: [
      ["Dumaresq Dam", "Dam", "trout, occasionally bass", "Canoes and kayaks only: no petrol boats"],
      ["Malpas Dam (near Guyra)", "Dam", "rainbow trout (stocked)", "Trout dam, open all year: check NSW DPI rules"]] },
    fields: null,
    watch: {
      leadership: { owner: "Council", name: "Armidale Regional Council, Councillors", url: "https://www.armidale.nsw.gov.au/Council/Councillors" },
      waste: { owner: "Recycling Near You", name: "Recycling Near You, Armidale Regional Council", url: "https://recyclingnearyou.com.au/council/ArmidaleRegionalNSW" },
      contact: { owner: "Council", name: "Armidale Regional Council website", url: "https://www.armidale.nsw.gov.au" },
    },
    schools: ["Armidale City Public School","Armidale Secondary College","Ben Venue Public School","Drummond Memorial Public School","Kellys Plains Public School","Martins Gully Public School","Newling Public School","Sandon Public School","Guyra Central School"],
    faves: [["Wollomombi Falls lookout","Free","Easy walk from the picnic area to the lookout over one of Australia's tallest waterfalls."],["Dumaresq Dam Reserve","Free entry","Picnics, a jetty, kayaking and trout fishing just outside town."],
      ["Armidale Farmers' Market","Free entry","Local produce once a month. Check dates before you go."],["Armidale Sunday Markets","Free entry","Last Sunday of the month in the Beardy Street Mall. Check dates before you go."]],
    facts: [
      ["🏴", "Named after a Scottish isle", "Armidale was named after Armadale on the Isle of Skye, ancestral home of the MacDonald clan.", "https://en.wikipedia.org/wiki/Armidale", "Wikipedia"],
      ["⛰️", "High country city", "Armidale sits about 980 metres above sea level, and Armidale Airport, at 1,084 metres, is the highest licensed airport in NSW.", "https://en.wikipedia.org/wiki/Armidale", "Wikipedia"],
      ["🎓", "First of its kind", "The University of New England was the first Australian university set up outside a state capital.", "https://en.wikipedia.org/wiki/University_of_New_England_(Australia)", "Wikipedia"],
      ["💧", "A 100-metre drop", "Wollomombi Falls plunges 100 metres in a single drop, about 40 km east of Armidale.", "https://en.wikipedia.org/wiki/Wollomombi_Falls", "Wikipedia"],
      ["🌋", "A lagoon in a volcano", "Guyra's Mother of Ducks Lagoon lies within the crater of an extinct volcano.", "https://en.wikipedia.org/wiki/Guyra,_New_South_Wales", "Wikipedia"],
      ["🌏", "Anaiwan Country", "The Armidale region is on Anaiwan Country.", "https://en.wikipedia.org/wiki/Anaiwan", "Wikipedia"]],
    mavKB: `Site: 2350 Maverick, a free local info site for the Armidale region (2350 Armidale, 2351 University of New England, 2365 Guyra). Never charges. A gift from Maverick Digital.
Pages: /2350 /2351 /2365 area pages; /open what's open now; /fridge dinner ideas from your fridge (free email unlock, or snap a photo); /school school run check; /birthday local birthday deals (say "Maverick"); /genalpha Gen Alpha slang interpreter; /rip death notices; /crossword daily crossword; /submit add an event free (\$50 or less per person); /feedback; /new; /privacy; /charter.
Area page sections (ids): today=At a glance; tools=Handy tools; alerts=fires and weather warnings; events=What's on; news=local headlines; memory=In memory; fuel=cheapest fuel; know=Know your area (mayor Cr Sam Coupland, deputy Cr Todd Redwood, council 1300 136 833, bins via council's collection calendar or Waste Services Hotline 1300 136 322, tip at 108 Long Swamp Road, Armidale); kids=Weekend for kids; flights=flight status; holidays; puzzles=crossword.
Inland region: no beaches, surf or tides. Trout streams close over winter (9 June to 3 October in 2026); trout dams stay open. NSW recreational fishing fee required.
Emergencies: 000.`,
  },
  "2444": {
    code: "2444", brand: "The Daily Maverick", place: "Port Macquarie", short: "Port", domain: "2444-maverick.live",
    venues: [],
    towns: {
      "2443": { name: "Laurieton", lat: -31.6480, lon: 152.7960, mlat: -31.65, mlon: 152.90, live: true },
      "2444": { name: "Port Macquarie", lat: -31.4330, lon: 152.9080, mlat: -31.43, mlon: 153.00, live: true },
      "2445": { name: "Lake Cathie", lat: -31.5520, lon: 152.8550, mlat: -31.55, mlon: 152.95, live: true },
      "2446": { name: "Wauchope", lat: -31.4500, lon: 152.7333, mlat: -31.43, mlon: 153.00, live: true },
    },
    home: { lat: -31.4330, lon: 152.9080 },
    bbox: "-31.75,152.30,-31.10,153.00",
    funerals: [{ name: "Mark G Hammond Funeral Services", url: "https://www.mghfs.com.au/current-funerals/" }],
    airport: { name: "Port Macquarie Airport", url: "https://www.flightaware.com/live/airport/YPMQ", iata: "PQQ", feed: "https://2450-maverick.live/api/flights" },
    coverage: "We cover the Port Macquarie-Hastings: 2443 Laurieton, 2444 Port Macquarie, 2445 Lake Cathie and 2446 Wauchope.", soon: "",
    footer: `<b>Big tech divided us. Your Daily Maverick uses them to bring regional communities back together.</b>`,
    ack: `2444 Maverick acknowledges the Birpai people, the Traditional Custodians of the land on which we live and work, and pays respect to Elders past and present.`,
    sign: "Built in 2450, made for 2444, raised by the world.",
    goal: 8700, goalText: "about one in ten people across the Hastings",
    council: { name: "Port Macquarie-Hastings Council", mayor: "Cr Adam Roberts", meetings: "https://www.pmhc.nsw.gov.au/Your-Council/Council-meetings", progress: "https://www.pmhc.nsw.gov.au/Your-Council/Council-reports", url: "https://www.pmhc.nsw.gov.au", phone: "02 6581 8111", urgent: "Port Macquarie-Hastings Council: 02 6581 8111" },
    binsTip: "Check your bin days in the free WasteInfo app from Port Macquarie-Hastings Council, or call 02 6581 8111.",
    mavExample: "I'm Sam, I live in Wauchope, I've got a kid at Wauchope High and I love the beaches",
    schoolsArea: "Public schools in the Port Macquarie-Hastings",
    warnRe: /mid north coast|hastings|port macquarie|wauchope|laurieton|camden haven|lake cathie|coastal waters|marine/i,
    news: [
      { name: "News Of The Area", url: "https://portmacquarie.newsofthearea.com.au", feed: "https://portmacquarie.newsofthearea.com.au/feed", skip: /^PROPERTY:|is on the market/i, need: /port macquarie|hastings|wauchope|laurieton|camden haven|lake cathie|bonny hills|kendall|north haven|dunbogan|telegraph point|comboyne|kew\b/i },
      { name: "News Of The Area (Camden Haven)", url: "https://camdenhaven.newsofthearea.com.au", feed: "https://camdenhaven.newsofthearea.com.au/feed", skip: /^PROPERTY:|is on the market/i, need: /port macquarie|hastings|wauchope|laurieton|camden haven|lake cathie|bonny hills|kendall|north haven|dunbogan|kew\b/i },
      { name: "Port Macquarie News", url: "https://www.portnews.com.au", feed: "https://www.portnews.com.au/rss.xml", need: /port macquarie|hastings|wauchope|laurieton|camden haven|lake cathie|bonny hills|kendall|north haven|dunbogan|telegraph point|comboyne/i },
      { name: "NBN News", url: "https://www.nbnnews.com.au", feed: "https://www.nbnnews.com.au/feed/", cat: /mid north/i, need: /port macquarie|hastings|wauchope|laurieton|camden haven|lake cathie|bonny hills|kendall/i },
    ],
    know: (W, acc) => `<details open><summary><b>Who runs the place</b></summary><ul>
<li>Mayor: <b>Cr Adam Roberts</b> · Deputy Mayor: none (council voted in May 2026 not to fill the role for the rest of the term)</li>
<li>Councillors: Lauren Edwards, Mark Hornshaw, Chris Kirkman, Nik Lipovac, Danielle Maltman, Rachel Sheppard, Hamish Tubman. <a href="https://www.pmhc.nsw.gov.au/Your-Council/Mayor-and-Councillors" rel="noopener">Contact them</a></li>
<li><a href="https://www.pmhc.nsw.gov.au/Your-Council/Council-meetings" rel="noopener">Council meetings</a>: see what's being decided</li></ul>${acc("leadership", W.leadership)}</details>
<details><summary><b>Bins &amp; rubbish</b></summary><ul>
<li>Which bin this week? Get the free <b>WasteInfo</b> app from council, or call <a href="tel:0265818111">02 6581 8111</a></li>
<li>Tip: Port Macquarie waste facility, 70 Kingfisher Road (off John Oxley Drive), open daily 8am to 4pm. Bigger loads: Cairncross Waste Management Facility, 351 Telegraph Point Road, Pembrooke</li>
<li>Seen illegal dumping? <a href="https://ridonline.epa.nsw.gov.au/" rel="noopener">Tell the EPA online</a></li></ul>${acc("waste", W.waste)}</details>
<details><summary><b>Got a problem?</b></summary><ul>
<li>Pothole, broken footpath, streetlight, overgrown block: tell council on <a href="tel:0265818111">02 6581 8111</a> or <a href="mailto:council@pmhc.nsw.gov.au">council@pmhc.nsw.gov.au</a></li>
<li>Not happy with how council handled it? <a href="https://www.ombo.nsw.gov.au" rel="noopener">NSW Ombudsman</a></li></ul></details>
<details><summary><b>Contact council</b></summary><ul>
<li>📞 <a href="tel:0265818111">02 6581 8111</a></li>
<li>✉️ <a href="mailto:council@pmhc.nsw.gov.au">council@pmhc.nsw.gov.au</a></li>
<li>🏛️ 17 Burrawan Street, Port Macquarie · 49 High Street, Wauchope · 9 Laurie Street, Laurieton</li></ul>${acc("contact", W.contact)}</details>
`,
    idx: [
      ["mayor deputy councillor councillors council who runs","Who runs the place","Mayor Cr Adam Roberts, plus 7 councillors. No deputy mayor for the rest of the term.","#know"],
      ["bin bins rubbish recycling garbage which bin wasteinfo","Bins","Which bin this week? WasteInfo app or 02 6581 8111.","#know"],
      ["tip dump waste kingfisher cairncross","The tip","70 Kingfisher Road, Port Macquarie, or Cairncross at Pembrooke.","#know"],
      ["council phone contact email call","Contact council","02 6581 8111, council@pmhc.nsw.gov.au.","#know"],
      ["port macquarie facts history wauchope laurieton koala lighthouse birpai why fun","Why Port?","Fun facts about the Hastings, every one sourced.","/why"],
    ],
    cw: [["HASTINGS", "River that meets the sea at Port Macquarie"], ["WAUCHOPE", "Timber town on the Hastings, postcode 2446"], ["LAURIETON", "Town at the base of North Brother Mountain"],
      ["BIRPAI", "Traditional Custodians of the Port Macquarie area"], ["KOALA", "Patient at Port's famous hospital on Lord Street"], ["OXLEY", "Explorer who named Port Macquarie in 1818"],
      ["MACQUARIE", "Governor the town is named after"], ["TACKING", "___ Point Lighthouse, built in 1879"]],
    why: { slug: "why", title: "Why Port?", card: "Fun facts: convict-era beginnings, koalas and a lighthouse from 1879", intro: "Big river, bigger story. Every fact sourced." },
    surf: [["Town Beach (Breakwall)", "S to NE", "SW to S", "Works on swell from the south through north-east; The Middle is for experienced surfers only"],
      ["Flynns Beach", "S to E", "NW to SE", "Family-friendly patrolled beach"],
      ["Lighthouse Beach", "N to NE", "NW to NE", "Faces south and picks up all available swell; strong rips and currents"],
      ["Rainbow Beach, Bonny Hills", "E to S", "W to SW", "Right point break off the southern headland plus beach breaks"],
      ["Grants Headland", "NE", "W to NE", "Picks up the smallest swells"],
      ["North Haven (Grants Beach)", "S to E", "W to SE", "Beach breaks; the river's tidal flow affects wave quality"]],
    surfNote: "Flynns Beach is patrolled. Lake Cathie Beach is patrolled during the Christmas school holidays only.",
    fish: { spots: [
      ["Southern Breakwall, Hastings River", "Breakwall", "luderick, bream, tailor, mulloway", ""], ["Settlement Point", "Estuary", "whiting, bream, flathead", ""],
      ["Limeburners Creek", "Estuary", "bream, luderick, flathead, blue swimmer crabs", "Boats: speed and wash limits near oyster leases"],
      ["Camden Haven River (lower estuary)", "Estuary", "bream, flathead, luderick", ""], ["Lake Cathie", "Lake", "prawns, bream, luderick, flathead, mullet, garfish", ""],
      ["Town Beach to Lighthouse Beach", "Beach", "tailor, whiting, mulloway", ""], ["Queens Head", "Rocks", "drummer, luderick", "Rock fishing: watch the swell"],
      ["Perpendicular Point", "Rocks", "longtail tuna, kingfish, tailor, mulloway, mackerel tuna", "High ledges over deep water"],
      ["Hastings River (upper reaches)", "River", "Aussie bass", "Bass and estuary perch: catch and release only, May to August"]] },
    fields: null,
    watch: {
      leadership: { owner: "Council", name: "Port Macquarie-Hastings Council, Mayor and Councillors", url: "https://www.pmhc.nsw.gov.au/Your-Council/Mayor-and-Councillors" },
      waste: { owner: "Council", name: "Port Macquarie-Hastings Council, waste facility locations", url: "https://www.pmhc.nsw.gov.au/Residents/Waste-recycling/Waste-facility-locations" },
      contact: { owner: "Council", name: "Port Macquarie-Hastings Council, Contact us", url: "https://www.pmhc.nsw.gov.au/Your-Council/About-us/Contact-us" },
    },
    schools: ["Port Macquarie Public School","Tacking Point Public School","Hastings Secondary College, Port Macquarie Campus","Hastings Secondary College, Westport Campus","Wauchope Public School","Wauchope High School","Laurieton Public School","Camden Haven High School","Lake Cathie Public School"],
    faves: [["Port Macquarie Coastal Walk","Free","9 km from Town Beach to Tacking Point Lighthouse, about 3 to 4 hours one way."],["Tacking Point Lighthouse","Free","Built in 1879 and a popular whale-watching spot."],
      ["Koala Hospital","Check tickets","Australia's first dedicated koala hospital, 154 Lord Street. Open daily 8:30am to 4pm."],["Town Beach breakwall","Free","Walk the breakwall where the Hastings River meets the sea."]],
    facts: [
      ["🌏", "Birpai Country", "The Birpai people are recognised as the Traditional Custodians of the Port Macquarie area.", "https://en.wikipedia.org/wiki/Port_Macquarie", "Wikipedia"],
      ["⛓️", "Started as a penal settlement", "Port Macquarie was founded as a penal settlement in 1821, named by explorer John Oxley after Governor Lachlan Macquarie.", "https://en.wikipedia.org/wiki/Port_Macquarie", "Wikipedia"],
      ["🐨", "Koalas get their own hospital", "Port Macquarie's Koala Hospital was the first dedicated koala hospital in Australia.", "https://koalaconservationaustralia.org.au/pages/koala-hospital", "Koala Conservation Australia"],
      ["🗼", "A lighthouse from 1879", "Tacking Point Lighthouse was built in 1879 to a design by Colonial Architect James Barnet.", "https://en.wikipedia.org/wiki/Tacking_Point_Lighthouse", "Wikipedia"],
      ["🎭", "Wauchope timber in the Opera House", "Timber from the Yarras Plywood Sawmill near Wauchope was used in building the Sydney Opera House.", "https://en.wikipedia.org/wiki/Wauchope,_New_South_Wales", "Wikipedia"]],
    mavKB: `Site: 2444 Maverick, a free local info site for the Port Macquarie-Hastings (2443 Laurieton, 2444 Port Macquarie, 2445 Lake Cathie, 2446 Wauchope). Never charges. A gift from Maverick Digital.
Pages: /2443 /2444 /2445 /2446 area pages; /open what's open now; /fridge dinner ideas from your fridge (free email unlock, or snap a photo); /school school run check; /birthday local birthday deals (say "Maverick"); /genalpha Gen Alpha slang interpreter; /rip death notices; /crossword daily crossword; /submit add an event free (\$50 or less per person); /feedback; /new; /privacy; /charter.
Area page sections (ids): today=At a glance; tools=Handy tools; alerts=fires and weather warnings; events=What's on; news=local headlines; memory=In memory; fuel=cheapest fuel; sea=tides; know=Know your area (mayor Cr Adam Roberts, no deputy mayor for the rest of the term, council 02 6581 8111, bins via the WasteInfo app or 02 6581 8111, tip at 70 Kingfisher Road Port Macquarie or Cairncross at Pembrooke); kids=Weekend for kids; flights=flight status; holidays; puzzles=crossword; beaches (beach, surf and surf cams).
Emergencies: 000. Tides are estimates, not for navigation.`,
  },
};
