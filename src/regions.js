// Town settings for the 2450 Maverick engine. One Worker per region sets env.REGION to one of these keys.
// Everything a town needs that's different from the others lives here: places, council, sources, facts, wording.

export const REGIONS = {
  "2450": {
    code: "2450", brand: "Daily 2450 Maverick", place: "Coffs Harbour", short: "Coffs", domain: "2450-maverick.live",
    venues: [
      { name: "C.ex clubs (weekly activities)", url: "https://cex.com.au/whats-on/weekly-activities/", only: ["C.ex Coffs", "C.ex Woolgoolga"] },
      { name: "C.ex clubs (free live music)", url: "https://cex.com.au/free-live/", only: ["C.ex Coffs", "C.ex Woolgoolga"] },
      { name: "Sawtell RSL (daily specials)", url: "https://sawtellrsl.com.au/dining/daily-specials/", venue: "Sawtell RSL" },
      { name: "Sawtell RSL (every week)", url: "https://sawtellrsl.com.au/whats-on/every-week/", venue: "Sawtell RSL" },
      { name: "Coffs Coast Growers Market", url: "https://www.coffsharbour.nsw.gov.au/Community-and-recreation/Community-venues-and-facilities/Coffs-Coast-Growers-Markets", venue: "Coffs Coast Growers Market", market: true },
      { name: "Harbourside Markets", url: "https://www.nsw.gov.au/visiting-and-exploring-nsw/nsw-events/harbourside-markets", venue: "Harbourside Markets", market: true },
    ],
    towns: {
  "2450": { name: "Coffs Harbour", lat: -30.3022, lon: 153.1189, mlat: -30.30, mlon: 153.15, live: true },
  "2452": { name: "Sawtell & Toormina", lat: -30.3640, lon: 153.0960, mlat: -30.37, mlon: 153.12, live: true },
  "2456": { name: "Woolgoolga & Northern Beaches", lat: -30.1100, lon: 153.2000, mlat: -30.11, mlon: 153.22, live: true },
},
    home: { lat: -30.2963, lon: 153.1135 },
    bbox: "-30.45,152.95,-30.05,153.25", // open-now search area (south,west,north,east)
    funerals: [{ name: "Victor Rullis Funeral Services", url: "https://www.funeralcoffsharbour.com.au/funeral-notices-and-rememberance" }, { name: "Keith Logue & Sons", url: "https://loguefunerals.com.au/upcoming-funerals/" }],
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
<li>Councillors: Cath Fowler, Gurminder Saro, Jonathan Cassell, Julie Sechi, Les Oxford, Paul Amos, Tony Judge. <a href="https://www.coffsharbour.nsw.gov.au/Your-Council/About-Council/Councillors" rel="noopener">Contact them</a></li>
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
      ["mayor deputy councillor councillors council who runs","Who runs the place","Mayor Cr Nikki Williams, Deputy Mayor Cr George Cecato, plus 7 councillors.","#know"],
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
  wasteapp: { owner: "News Of The Area", name: "News Of The Area (waste app)", url: "https://coffscoast.newsofthearea.com.au/app-solves-the-challenge-of-which-bin-this-week", stated: "2026-08" },
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
  ["🌙", "Muttonbird Island is a moon sacred place", "Its Gumbaynggirr name, Giidany Miirlarl, means moon sacred place. Wedge-tailed shearwaters, the muttonbirds, nest in burrows all over it.", "https://www.nationalparks.nsw.gov.au/education/stage-3-science-giidany-miirlarl-a-special-site-muttonbird-island-nature-reserve", "NSW National Parks"],
  ["🌉", "The Jetty is older than Federation", "Finished in August 1892, it reached about 500 m out to sea so steam cranes could load timber onto ships. The last commercial cargo left in 1979, it reopened restored in 1997, and it has been State Heritage listed since 2021. Technically it reaches straight out to sea like a pier, but it will always be the Jetty, and jumping off it is a Coffs rite of passage.", "https://www.coffscoastheritage.info/2018/06/the-story-of-the-coffs-harbour-jetty/", "Coffs Coast Heritage"],
  ["⛰️", "Where the mountains meet the sea", "Coffs is often described as the only place in NSW where the Great Dividing Range comes right down to the Pacific Ocean.", "https://en.wikipedia.org/wiki/Coffs_Harbour", "Wikipedia (marked as needing a source)"],
  ["🐠", "Where tropical meets temperate", "In the Solitary Islands Marine Park, the warm East Australian Current meets cooler southern water. Many species here live at the northern or southern edge of their range, and critically endangered grey nurse sharks gather here.", "https://australianmarineparks.gov.au/parks/temperate-east-marine-parks-network/solitary-islands-marine-park/", "Australian Marine Parks"],
  ["🌿", "World Heritage rainforest an hour away", "Dorrigo National Park is part of the Gondwana Rainforests of Australia World Heritage Area. Walk the Skywalk above the canopy and look all the way down to the sea.", "https://www.nationalparks.nsw.gov.au/visit-a-park/parks/dorrigo-national-park", "NSW National Parks"],
  ["☀️", "Sunnier than Brisbane and Cairns", "Coffs averages about 122 clear days a year: sunnier than Brisbane and Cairns, a little behind Townsville. Locals will also tell you the CSIRO once named it Australia's best climate. We couldn't find that study, so if you have it, send it in!", "https://en.wikipedia.org/wiki/Coffs_Harbour", "Wikipedia"],
  ["🍌", "Home of the original big thing", "The Big Banana turned 50 in 2014.", "https://en.wikipedia.org/wiki/Coffs_Harbour", "Wikipedia"]],
    mavKB: `Site: 2450 Maverick, a free local info site for the Coffs Harbour council area (2450 Coffs Harbour, 2452 Sawtell & Toormina, 2456 Woolgoolga). Never charges. A gift from Maverick Digital.
Pages: /2450 /2452 /2456 area pages; /open what's open now (pharmacies, doctors, mechanics, servos, supermarkets, bottle shops, pubs, cafes, takeaway, vets, hardware); /fridge dinner ideas from your fridge (free email unlock);
/school school run check; /birthday local birthday deals (say "Maverick"); /genalpha Gen Alpha slang interpreter with Jimmy Joel; /rip death notices; /submit add an event free; /feedback suggest and vote on ideas (30 votes gets it built); /new what's new; /privacy; /charter.
Area page sections (ids): today=At a glance tiles (weather, rain, wind, sunrise, tides, swell, moon, clock change); tools=Handy tools; alerts=fires within 100 km and weather warnings; events=What's on; news=local headlines; fuel=cheapest fuel near you;
sea=tides & fishing; know=Know your area (mayor Cr Nikki Williams, deputy Cr George Cecato, council 02 6648 4000 incl. 24/7 urgent water/sewer/pollution/animal attacks, bins via Coffs Coast Waste Services app, bulky goods 1800 265 495, tip at Englands Road, council request form, NSW Ombudsman);
council=council news; kids=Get outside this weekend (outdoor things for kids and families, free or under $50; we don't list arcades, bowling or cinemas); sport=Sport & field closures with phone alerts; holidays=public holidays; surfcams=surf cams; beaches=beaches.
Every piece of information has an ⓘ Source button showing where it comes from and how current it is.
Emergencies: 000. Tides are estimates, not for navigation.`,
  },
  "2481": {
    code: "2481", brand: "Daily 2481 Maverick", place: "Byron Bay", short: "Byron", domain: "2481-maverick.live",
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
    funerals: [{ name: "Brunswick Valley Funerals", url: "https://brunswickvalleyfunerals.com.au/currently-in-our-care/" }],
    airport: { name: "Ballina Byron Gateway Airport", url: "https://www.flightaware.com/live/airport/YBNA", iata: "BNK" },
    coverage: "We cover the whole Byron Shire: 2479, 2480, 2481, 2482 and 2483.", soon: "",
    footer: `Live in Lismore and went to Southern Cross University? You owe us a beer.<br><b>Big tech divided us. Your Daily Maverick uses them to bring regional communities back together.</b>`,
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
<li>Mayor: <b>Cr Sarah Ndiaye</b> · Deputy Mayor: <b>Cr Jack Dods</b></li>
<li>Councillors: Elia Hauge, Delta Kay, Michelle Lowe, Asren Pugh, Janet Swain, David Warth, Michael Lyon. <a href="https://www.byron.nsw.gov.au/Council/Leadership" rel="noopener">Contact them</a></li>
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
      ["mayor deputy councillor councillors council who runs","Who runs the place","Mayor Cr Sarah Ndiaye, Deputy Mayor Cr Jack Dods, plus 7 councillors.","#know"],
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
      ["🌏", "Arakwal Country", "Byron Bay is on the land of the Arakwal people of the Bundjalung Nation. The traditional name, Cavvanbah, means meeting place.", "https://www.byron.nsw.gov.au/Council/About-Byron-Shire/Aboriginal-Torres-Strait-Communities/Welcome-to-Country-Acknowledgement-of-Country-Protocols", "Byron Shire Council"],
      ["🌅", "First mainland sunrise", "Cape Byron is the easternmost point of mainland Australia.", "https://en.wikipedia.org/wiki/Byron_Bay", "Wikipedia"],
      ["🗼", "The lighthouse turns 125", "Cape Byron Lighthouse was built in 1901.", "https://en.wikipedia.org/wiki/Byron_Bay", "Wikipedia"],
      ["🐢", "Julian Rocks", "About 2.5 km offshore, Julian Rocks is one of the east coast's best dive sites, part of the Cape Byron Marine Park.", "https://en.wikipedia.org/wiki/Byron_Bay", "Wikipedia"],
      ["🐋", "From whaling to whale watching", "Byron had a whaling station until 1963. Today the same whales are the town's favourite winter show.", "https://en.wikipedia.org/wiki/Byron_Bay", "Wikipedia"]],
    mavKB: `Site: 2481 Maverick, a free local info site for the Byron Shire (2481 Byron Bay & Suffolk Park, 2479 Bangalow, 2480 Federal, 2482 Mullumbimby, 2483 Brunswick Heads & Ocean Shores). Never charges. A gift from Maverick Digital.
Pages: /2481 /2479 /2480 /2482 /2483 area pages; /open what's open now (pharmacies, doctors, mechanics, servos, supermarkets, bottle shops, pubs, cafes, takeaway, vets, hardware); /fridge dinner ideas from your fridge (free email unlock);
/school school run check; /birthday local birthday deals (say "Maverick"); /genalpha Gen Alpha slang interpreter with Jimmy Joel; /rip death notices; /crossword daily crossword; /submit add an event free; /feedback suggest and vote on ideas (30 votes gets it built); /new what's new; /privacy; /charter.
Area page sections (ids): today=At a glance tiles (weather, rain, wind, sunrise, tides, swell, moon, clock change); tools=Handy tools; alerts=fires within 100 km and weather warnings; events=What's on; news=local headlines; memory=In memory (death notices); fuel=cheapest fuel near you;
sea=tides & fishing; know=Know your area (mayor Cr Sarah Ndiaye, deputy Cr Jack Dods, Byron Shire Council 02 6626 7000, after hours emergencies 02 6622 7022, bins via the Recycle Coach app, annual free drop-off at the Byron Resource Recovery Centre, missed bins 1300 652 625, NSW Ombudsman);
council=council news; kids=Get outside this weekend (outdoor things for kids and families, free or under $50; we don't list arcades, bowling or cinemas); holidays=public and school holidays; puzzles=daily crossword; lotto=lotto results link; surfcams=surf cams; beaches=beaches.
Every piece of information has an ⓘ Where from? button showing where it comes from and how current it is.
Emergencies: 000. Tides are estimates, not for navigation.`,
  },
  "2454": {
    code: "2454", brand: "Daily 2454 Maverick", place: "Bellingen", short: "Bello", domain: "2454-maverick.live",
    venues: [
      { name: "C.ex Urunga (weekly activities)", url: "https://cex.com.au/whats-on/weekly-activities/", only: ["C.ex Urunga"] },
      { name: "Bellingen Growers Market", url: "https://www.nsw.gov.au/visiting-and-exploring-nsw/nsw-events/bellingen-growers-market", venue: "Bellingen Growers Market", market: true },
    ],
    towns: {
      "2453": { name: "Dorrigo", lat: -30.3410, lon: 152.7130, mlat: -30.50, mlon: 153.05, live: true },
      "2454": { name: "Bellingen", lat: -30.4520, lon: 152.8990, mlat: -30.50, mlon: 153.05, live: true },
      "2455": { name: "Urunga", lat: -30.4950, lon: 153.0170, mlat: -30.50, mlon: 153.05, live: true },
    },
    home: { lat: -30.4520, lon: 152.8990 },
    bbox: "-30.60,152.55,-30.25,153.10",
    funerals: [{ name: "Keith Logue & Sons", url: "https://loguefunerals.com.au/upcoming-funerals/" }, { name: "Victor Rullis Funeral Services", url: "https://www.funeralcoffsharbour.com.au/funeral-notices-and-rememberance" }],
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
<li>Tip: Raleigh Waste Management Station, Short Cut Road, Raleigh (with a Community Recycling Centre for paint, batteries and oil)</li>
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
      ["tip dump raleigh waste","The tip","Raleigh Waste Management Station, Short Cut Road.","#know"],
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
Area page sections (ids): today=At a glance; tools=Handy tools; alerts=fires and weather warnings; events=What's on; news=local headlines; memory=In memory; fuel=cheapest fuel; sea=tides; know=Know your area (mayor Cr Steve Allan, deputy Cr Graeme Shephard, council 02 6655 7300, bins via Coffs Coast Waste Services app or 1800 265 495, tip at Raleigh); kids=Weekend for kids; flights=flight status; holidays; puzzles=crossword; lotto; surfcams; beaches.
Emergencies: 000. Tides are estimates, not for navigation.`,
  },
};
