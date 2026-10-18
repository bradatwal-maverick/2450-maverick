// ---- Bin night, done for you. Where the council's collection calendar is online (the Waste Info system used by
// Coffs Coast Waste Services and Port Macquarie-Hastings), locals type their address once and we show which bins go out,
// in their colours, automatically. Byron Shire's calendar is built in (North and South areas). Elsewhere, locals set
// bin night by hand. Everything about the reader's address stays on their phone; we only pass the property number on.
// Also: "Can I throw it in this bin?" Type an item, get the bin and why.

export const BIN_SRC = {
  "2450": { kind: "wi", host: "coffs-coast", name: "Coffs Coast Waste Services", phone: "1800 265 495", az: "https://www.coffscoastwaste.com.au/a-z", cal: "https://www.coffscoastwaste.com.au/calendar" },
  "2454": { kind: "wi", host: "coffs-coast", name: "Coffs Coast Waste Services", phone: "1800 265 495", az: "https://www.coffscoastwaste.com.au/a-z", cal: "https://www.coffscoastwaste.com.au/calendar" },
  "2444": { kind: "wi", host: "pmhc", name: "Port Macquarie-Hastings Council", phone: "02 6581 8111", cal: "https://www.pmhc.nsw.gov.au/Residents/Waste-recycling/Bin-services/Bin-collection" },
  "2481": { kind: "byron", name: "Byron Shire Council", phone: "1300 652 625", cal: "https://www.byron.nsw.gov.au/Residential-Services/Waste-Recycling/Bin-Collection-Services/Bin-Collection-Schedules" },
  "2485": { kind: "link", name: "Tweed Shire Council", cal: "https://www.tweed.nsw.gov.au/property-rates/waste-recycling/bin-services-collection/bin-collection-days" },
  "2350": { kind: "link", name: "Armidale Regional Council", cal: "https://www.armidale.nsw.gov.au/Services/Waste-and-Recycling-services/Waste-and-recycling-collection" },
  "2430": { kind: "link", name: "MidCoast Council" },
};

// Byron Shire 2026–27 (from the council's North and South calendars): green every week; red and yellow swap weekly,
// North and South on opposite weeks. North is red the week starting Mon 3 Aug 2026. One council exception below.
const BYRON = { start: "2026-08-03", end: "2027-07-31", over: { "2027-07-26": { north: "yellow", south: "yellow" } } };

const BASE = h => `https://${h}.waste-info.com.au/api/v1/`;
const MEM = new Map();
async function props(host) { // the full address list (about 46,000 for the Coffs Coast), kept in memory and Cloudflare's cache for a day
  const m = MEM.get(host); if (m && Date.now() - m.at < 864e5) return m.list;
  const r = await fetch(BASE(host) + "properties.json", { cf: { cacheTtl: 86400, cacheEverything: true } });
  if (!r.ok) throw new Error("bins " + r.status);
  const list = ((await r.json()).properties || []).map(p => [p.id, String(p.name || ""), String(p.zone || "")]);
  MEM.set(host, { at: Date.now(), list }); return list;
}
const norm = s => String(s).toLowerCase().replace(/\b(street)\b/g, "st").replace(/\b(road)\b/g, "rd").replace(/\b(avenue)\b/g, "ave").replace(/\b(drive)\b/g, "dr").replace(/\b(place)\b/g, "pl").replace(/\b(close)\b/g, "cl").replace(/\b(crescent)\b/g, "cres").replace(/\b(parade)\b/g, "pde").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const iso = d => d.toISOString().slice(0, 10);

export async function binsApi(url, code) {
  const src = BIN_SRC[code], J = (o, s = 200) => Response.json(o, { status: s, headers: { "cache-control": s === 200 ? "public, max-age=3600" : "no-store" } });
  if (!src || src.kind !== "wi") return J({ error: "Not available here" }, 404);
  const q = norm(url.searchParams.get("q") || ""), id = String(url.searchParams.get("id") || "").replace(/\D/g, "");
  try {
    if (q) { if (q.length < 4) return J({ list: [] }); const w = q.split(" ");
      const hit = (await props(src.host)).filter(p => { const n = norm(p[1]); return w.every(x => (" " + n + " ").includes(" " + x)); }).sort((a, b) => a[1].length - b[1].length).slice(0, 8);
      return J({ list: hit.map(([i, n, z]) => ({ id: i, name: n, zone: z })) }); }
    if (!id) return J({ error: "Add an address" }, 400);
    const t = new Date(), s = new Date(t.getTime() - 864e5), e = new Date(t.getTime() + 42 * 864e5);
    const r = await fetch(`${BASE(src.host)}properties/${id}.json?start=${iso(s)}&end=${iso(e)}`, { cf: { cacheTtl: 21600, cacheEverything: true } });
    if (!r.ok) return J({ error: "Council calendar not reachable" }, 502);
    const ev = await r.json(), days = {}, add = (d, b) => { if (d < iso(s) || d > iso(e)) return; (days[d] = days[d] || new Set()).add(b); };
    const COL = { organic: "green", waste: "red", recycle: "yellow", glass: "purple" };
    let info = null;
    for (const x of ev) {
      if (x.property) info = { address: x.property.address, zone: x.property.zone, day: x.property.collection_day };
      const b = COL[x.event_type]; if (!b) continue;
      const dow = x.daysOfWeek || x.dow;
      if (dow && dow.length) { const st = new Date((x.start_date || iso(s)) + "T00:00:00Z"); for (let d = new Date(Math.max(st, s)); d <= e; d = new Date(d.getTime() + 864e5)) if (dow.includes(d.getUTCDay())) add(iso(d), b); }
      else if (x.start) add(String(x.start).slice(0, 10), b);
    }
    const list = Object.keys(days).sort().map(d => ({ date: d, bins: ["green", "red", "yellow", "purple"].filter(b => days[d].has(b)) }));
    return J({ ...(info || {}), list, src: src.name });
  } catch (err) { return J({ error: "Council calendar not reachable" }, 502); }
}

// Can I throw it in this bin? A general NSW three-bin guide (red landfill, yellow recycling, green organics), from the
// councils' own guides. Councils differ a little, so every answer links to the local council's own A to Z.
export const BIN_ITEMS = [
  ["green", "All food scraps", "Food breaks down into compost.", "food,scraps,leftovers,fruit,vegetables,veggies,peel,bread,rice,pasta,cheese,dairy"],
  ["green", "Certified compostable bags", "Australian certified compostable bags break down with the organics. Ordinary plastic bags don't.", "compostable bag,caddy liner,compostable liner"],
  ["green", "Coffee grounds and tea leaves", "Great compost material.", "coffee grounds,coffee grinds,tea bags,tea leaves"],
  ["green", "Grass clippings, leaves and weeds", "Garden waste becomes compost.", "grass,lawn,clippings,leaves,weeds,flowers,garden"],
  ["green", "Greasy pizza boxes", "Food-soiled cardboard can't be recycled, but it composts.", "pizza box,greasy cardboard,greasy paper"],
  ["green", "Meat, bones and seafood", "Food organics bins take all food, including meat and bones.", "meat,bones,chicken,fish,seafood,prawns,prawn shells"],
  ["green", "Paper towel and tissues", "Used paper towel and tissues compost; they can't be recycled.", "paper towel,tissues,serviettes,napkins"],
  ["green", "Prunings and palm fronds", "Garden waste becomes compost. Cut branches to fit with the lid closed.", "prunings,branches,sticks,hedge,twigs,palm,fronds"],
  ["red", "Baby food pouches", "Mixed materials can't be recycled.", "baby food pouch,squeeze pouch,pouch"],
  ["red", "Batteries (never in any bin)", "Batteries start truck and recycling-centre fires. Take them to a battery drop-off or your Community Recycling Centre.", "battery,batteries,vape,vapes,lithium"],
  ["red", "Bottle lids smaller than a credit card", "Small items fall through the sorting machines.", "bottle lid,bottle top,cap,small lid"],
  ["red", "Cables, cords and rope", "They tangle the sorting machines. Electronics go to e-waste drop-off.", "cable,cord,rope,charger,wire,hose"],
  ["red", "Chip packets and lolly wrappers", "Foil-lined plastic can't be recycled.", "chip packet,chips,crisps,snack bag,lolly wrapper,wrapper,muesli bar wrapper"],
  ["red", "Cigarette butts", "Not recyclable or compostable.", "cigarette,butts,ash"],
  ["red", "Clothes and fabric", "Not accepted in recycling. Donate clothes that can still be worn.", "fabric,clothes,clothing,textiles,rags,towels,shoes"],
  ["red", "Disposable nappies", "Not recyclable or compostable.", "nappies,nappy,diapers"],
  ["red", "Laminated paper and stickers", "The plastic coating stops it being recycled.", "laminated,stickers,labels"],
  ["red", "Meat and biscuit trays, polystyrene", "Soft and foam plastics can't be recycled.", "meat tray,biscuit tray,polystyrene,styrofoam,foam"],
  ["red", "Plastic bags and soft plastics", "Soft plastics jam the sorting machines. Some supermarkets take them back.", "plastic bag,soft plastic,cling wrap,glad wrap,bread bag,shopping bag,bubble wrap"],
  ["red", "Plastic straws, plates and cutlery", "Too small or the wrong plastic to recycle.", "straw,plastic plate,cutlery,plastic fork,plastic spoon"],
  ["red", "Takeaway coffee cups", "Cups have a plastic lining, so they can't be recycled. The hard plastic lid can go in recycling.", "coffee cup,takeaway cup,paper cup"],
  ["red", "Waxed paper and baking paper", "The coating stops it being recycled.", "waxed,baking paper,wax cardboard"],
  ["red", "Wet wipes (all of them)", "Wipes don't break down, even 'flushable' ones. Keep wipes out of our pipes!", "wipes,wet wipes,baby wipes,flushable wipes,makeup wipes"],
  ["yellow", "Aluminium cans and foil", "Aluminium recycles over and over. Empty and scrunch foil into a ball.", "can,cans,aluminium,aluminum,foil,drink can,soft drink"],
  ["yellow", "Cardboard and paper", "Recycled into new paper and cardboard. Flatten boxes.", "paper,cardboard,box,boxes,cereal box,envelope,magazine,newspaper,junk mail,book,egg carton"],
  ["yellow", "Glass bottles and jars", "Glass recycles endlessly. Empty, lids off. Drinking glasses and windows go in red.", "glass,jar,bottle,wine bottle,beer bottle"],
  ["yellow", "Milk and juice cartons", "Recyclable empty, with the lid off.", "milk carton,juice carton,tetra pak,tetrapak,long life milk,juice box"],
  ["yellow", "Plastic bottles and containers", "Hard plastics are recycled. Empty, rinse, lids off.", "plastic bottle,plastic container,yoghurt tub,takeaway container,ice cream tub,punnet,shampoo bottle"],
  ["yellow", "Steel tins and aerosol cans", "Steel recycles over and over. Empty aerosols only.", "tin,tins,steel,food can,dog food can,aerosol"],
];

// Shared on the phone: works out the next collections for the reader's saved address or area, and draws coloured lids.
export const BINS_JS = (code) => String.raw`window.M2B=(function(){var CODE='${code}',BY=${JSON.stringify(BYRON)};
function g(k){try{return localStorage.getItem(k)}catch(e){return null}}function p(k,v){try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}}
function auto(){try{var a=JSON.parse(g('bin_auto'));return a&&a.code===CODE?a:null}catch(e){return null}}
function ymd(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function byron(a){var out=[],t=new Date();t.setHours(0,0,0,0);var st=new Date(BY.start+'T00:00:00'),en=new Date(BY.end+'T00:00:00');
for(var k=0;k<42;k++){var d=new Date(t);d.setDate(t.getDate()+k);if(d.getDay()!==+a.day||d<st||d>en)continue;var mon=new Date(d);mon.setDate(d.getDate()-((d.getDay()+6)%7));
var w=Math.round((mon-st)/6048e5),o=BY.over[ymd(mon)],b=o?o[a.area]:((w%2===0)===(a.area==='north')?'red':'yellow');out.push({date:ymd(d),bins:['green',b]})}return out}
function next(cb){var a=auto();if(!a)return cb(null);if(a.kind==='byron')return cb({list:byron(a),name:a.name});
var c=null;try{c=JSON.parse(g('bin_cache'))}catch(e){}if(c&&c.id===a.id&&Date.now()-c.at<12*36e5)return cb(c.d);
fetch('/api/bins?id='+a.id).then(function(r){return r.json()}).then(function(d){if(d.list){p('bin_cache',JSON.stringify({id:a.id,at:Date.now(),d:d}));cb(d)}else cb(c?c.d:null)}).catch(function(){cb(c?c.d:null)})}
var NM={green:'Organics',red:'Rubbish',yellow:'Recycling',purple:'Glass'},HX={green:'#3f9b2e',red:'#d0342c',yellow:'#f2c200',purple:'#7b3fa0'};
function lid(b,sm){return '<span class="blid'+(sm?' sm':'')+'" title="'+NM[b]+'" style="--c:'+HX[b]+'"><i></i>'+(sm?'':'<b>'+NM[b]+'</b>')+'</span>'}
function upcoming(d){var t=ymd(new Date());return (d&&d.list||[]).filter(function(x){return x.date>=t})}
function when(ds){var t=new Date();t.setHours(0,0,0,0);var d=new Date(ds+'T00:00:00'),n=Math.round((d-t)/864e5);return n===0?'today':n===1?'tomorrow':d.toLocaleDateString('en-AU',{weekday:'long'})+(n>6?' '+d.getDate()+' '+d.toLocaleDateString('en-AU',{month:'short'}):'')}
return {g:g,p:p,auto:auto,next:next,lid:lid,upcoming:upcoming,when:when,NM:NM}})();`;

export const BINS_CSS = `.blid{display:inline-flex;flex-direction:column;align-items:center;gap:2px;font-size:.75rem;margin-right:8px;vertical-align:middle}.blid i{display:block;width:26px;height:30px;border-radius:4px 4px 6px 6px;background:#2d3b2f;position:relative}.blid i::before{content:"";position:absolute;left:-3px;right:-3px;top:-5px;height:8px;border-radius:3px;background:var(--c)}.blid.sm{margin-right:3px}.blid.sm i{width:14px;height:16px;border-radius:2px 2px 4px 4px}.blid.sm i::before{left:-2px;right:-2px;top:-3px;height:5px}
.bintile{text-decoration:none;color:inherit}.wbres{display:grid;gap:8px;margin:8px 0}.wbhit{display:flex;gap:10px;align-items:flex-start;padding:10px;border-radius:10px;border-left:6px solid var(--c);background:var(--soft)}.wbhit b{display:block}.baddr{list-style:none;padding:0;margin:6px 0}.baddr li button{width:100%;text-align:left;background:var(--soft);color:var(--fg);margin:3px 0}`;
