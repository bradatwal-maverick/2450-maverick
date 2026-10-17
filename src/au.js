// Regional Australia: pick your state and postcode, land on your main council's page with everyone who represents you.
// Data is built from official sources (AEC, ABS boundaries, parliaments, state council directories) and fact-checked as at AU.as_of.
// Capital-city postcodes are deliberately left out: we're here for regional Australia.
import AU from "./au-data.json";

const STATE_NAMES = { NSW: "New South Wales", VIC: "Victoria", QLD: "Queensland", WA: "Western Australia", SA: "South Australia", TAS: "Tasmania", NT: "Northern Territory" };
const ORDER = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT"];
const LOWER = { NSW: "MP", VIC: "MP", QLD: "MP", WA: "MLA", SA: "MP", TAS: "MPs", NT: "MLA" };

const nice = iso => new Date(iso + "T00:00:00Z").toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const nextElection = s => { const m = /^(\d{4}-\d{2}-\d{2})/.exec(s); return m ? nice(m[1]) : s.split("(")[0].trim(); };
const AS_OF = nice(AU.as_of);

// postcode -> [[state, entry], ...] (a few postcodes cross a state border)
function findPc(pc) { return ORDER.filter(s => AU.pcs[s][pc]).map(s => [s, AU.pcs[s][pc]]); }
// postcodes where this council covers only part
function partly(key) { const s = AU.councils[key].state; return Object.entries(AU.pcs[s]).filter(([, v]) => v.also.includes(key)).map(([p]) => p).sort(); }

export function auHandle(p, url, h) {
  if (p === "/au" || p === "/au/") return hub(h);
  let m = p.match(/^\/au\/pc\/(\d{4})\/?$/);
  if (m) return byPostcode(m[1], url, h);
  m = p.match(/^\/au\/([a-z]{2,3})\/?$/);
  if (m && AU.pcs[m[1].toUpperCase()]) return statePage(m[1].toUpperCase(), h);
  m = p.match(/^\/au\/([a-z]{2,3}\/[a-z0-9-]+)\/?$/);
  if (m && AU.councils[m[1]]) return councilPage(m[1], url.searchParams.get("pc"), h);
  return null;
}
export const auCovers = pc => findPc(pc).length > 0;

function finder(h, state = "") {
  return `<form class="search" action="/au/go" onsubmit="event.preventDefault();var v=this.pc.value.replace(/\\D/g,'');if(v.length==4)location.href='/au/pc/'+v+(this.st.value?'?st='+this.st.value:'')">
<select name="st" aria-label="State"><option value="">State</option>${ORDER.map(s => `<option value="${s}"${s === state ? " selected" : ""}>${s}</option>`).join("")}</select>
<input name="pc" inputmode="numeric" pattern="\\d{4}" maxlength="4" placeholder="Your postcode" aria-label="Your postcode" required><button>Go</button></form>`;
}

function hub(h) {
  const n = ORDER.reduce((a, s) => a + Object.keys(AU.pcs[s]).length, 0);
  return h.page("Regional Australia: who represents you", `<h1>Who represents you?</h1>
<p>Pick your state, put in your postcode, and see your council, your federal MP, your senators and your state MP. All in one place. Free.</p>
${finder(h)}
<div class="pills">${ORDER.map(s => `<a class="my" href="/au/${s.toLowerCase()}">${s}</a>`).join(" ")}</div>
<p class="mute">${n.toLocaleString("en-AU")} regional postcodes across ${Object.keys(AU.councils).length} councils. Capital cities aren't covered: we're here for regional Australia. Everything here was checked against official sources on ${AS_OF}.</p>`);
}

function byPostcode(pc, url, h) {
  let hits = findPc(pc);
  const st = (url.searchParams.get("st") || "").toUpperCase();
  if (st && hits.some(x => x[0] === st)) hits = hits.filter(x => x[0] === st);
  if (!hits.length) return h.page(`${pc}`, `<h1>${h.esc(pc)}</h1>
<p>We don't cover ${h.esc(pc)}. Either it's a capital-city postcode (we're here for regional Australia) or it's a PO box or business-only postcode.</p>
<p>Regional and we've missed you? <a href="/suggest">Tell us</a> and we'll add it.</p>${finder(h, st)}`);
  if (hits.length > 1) return h.page(`${pc}: which state?`, `<h1>${h.esc(pc)} crosses a state border</h1><ul>${hits.map(([s, v]) =>
    `<li><a href="/au/${v.c}?pc=${pc}">${STATE_NAMES[s]}: ${h.esc(AU.councils[v.c].name)}</a></li>`).join("")}</ul>`);
  return Response.redirect(new URL(`/au/${hits[0][1].c}?pc=${pc}`, url).toString(), 302);
}

function statePage(s, h) {
  const list = Object.entries(AU.councils).filter(([, c]) => c.state === s && c.pcs.length).sort((a, b) => a[1].name.localeCompare(b[1].name));
  const g = AU.states[s];
  return h.page(`${STATE_NAMES[s]}: regional councils`, `<p class="mute"><a href="/au">Regional Australia</a> › ${s}</p><h1>${STATE_NAMES[s]}</h1>
${finder(h, s)}
<p>${h.esc(g.hog.title)}: <b>${h.esc(g.hog.name)}</b> (${h.esc(g.hog.party)}) · Next state election: ${h.esc(nextElection(g.next))}</p>
<h2>Regional councils</h2><ul class="heads">${list.map(([k, c]) => `<li><a href="/au/${k}">${h.esc(c.name)}</a> <span class="mute">${c.pcs.join(", ")}</span></li>`).join("")}</ul>
<p class="src">Postcodes are matched to the council that covers the main town. <span class="srcw">Source:</span> ABS Local Government Areas, councils from the ${STATE_NAMES[s]} government directory. Checked ${AS_OF}.</p>`);
}

const src = (h, items) => `<p class="src">${items.filter(Boolean).map(([t, u]) => u ? `<a href="${h.esc(u)}" rel="noopener">${h.esc(t)}</a>` : h.esc(t)).join(" · ")}. Checked ${AS_OF}.</p>`;

function councilPage(key, pc, h) {
  const c = AU.councils[key], s = c.state, g = AU.states[s], esc = h.esc;
  const part = partly(key);
  const all = [...c.pcs, ...part];
  const mine = pc && all.includes(pc) ? AU.pcs[s][pc] : null;
  // reps for the chosen postcode, or for the whole council area
  const pool = mine ? [pc] : c.pcs;
  const uniq = arr => [...new Set(arr)];
  const fed = uniq(pool.flatMap(p => AU.pcs[s][p].fed)), sed = uniq(pool.flatMap(p => AU.pcs[s][p].sed));
  const split = (n, what, url, who) => n > 1 ? `<p class="note">${mine ? `${esc(pc)} is split between ${n} ${what}.` : `This council area is split between ${n} ${what}.`} Yours depends on your street: <a href="${esc(url)}" rel="noopener">check your address with ${who}</a>.</p>` : "";
  const live = h.liveGazette(pc || c.pcs[0]);
  const chips = all.map(p => `<a class="pc${p === pc ? " on" : ""}" href="/au/${key}?pc=${p}">${p}${part.includes(p) ? " <small>(part)</small>" : ""}</a>`).join("");

  const body = `<p class="mute"><a href="/au">Regional Australia</a> › <a href="/au/${s.toLowerCase()}">${s}</a></p>
<div class="towns">${chips}</div>
<h1>${esc(c.name)}</h1>
${mine ? `<p><b>${esc(pc)}</b>: ${esc(mine.loc.slice(0, 12).join(", "))}${mine.loc.length > 12 ? ` and ${mine.loc.length - 12} more` : ""}</p>
${mine.also.length ? `<p class="mute">Part of ${esc(pc)} is in ${mine.also.map(k => `<a href="/au/${k}?pc=${pc}">${esc(AU.councils[k].name)}</a>`).join(", ")}.</p>` : ""}`
      : `<p class="mute">Pick your postcode above to see exactly who represents you.</p>`}
${live ? `<p class="card"><a href="${esc(live.url)}"><b>${esc(live.name)}</b></a> covers this area: what's on, news, tides, fuel and more.</p>` : ""}

<h2>Your council</h2>
${c.uninc ? `<p>There's no local council here. The state government looks after local services.</p>` : `<ul><li><b>${esc(c.name)}</b>${c.web ? ` · <a href="${esc(c.web)}" rel="noopener">Website</a>` : ""}</li>
<li>Mayor and councillors: listed on the council's website</li></ul>`}
${src(h, [["ABS Local Government Areas", "https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs-edition-3"], c.src ? ["Council directory", c.src] : null])}

<h2>Federal: House of Representatives</h2>
${split(fed.length, "federal electorates", AU.aec_lookup, "the AEC")}
<ul>${fed.map(d => { const f = AU.fed[d]; return `<li>Division of <b>${esc(d)}</b>: ${esc(f.m)} <span class="mute">(${esc(f.p)})</span></li>`; }).join("")}</ul>
${src(h, [["AEC localities by electorate (2025 boundaries)", AU.aec_lookup], ["Parliament of Australia", AU.fed[fed[0]]?.src]])}

<h2>Federal: your senators for ${STATE_NAMES[s]}</h2>
<p class="mute">Senators represent the whole state, so all of these are yours.</p>
<ul class="zod">${g.senate.map(([n, pt]) => `<li>${esc(n)} <span class="mute">(${esc(pt)})</span></li>`).join("")}</ul>
${src(h, [["Parliament of Australia: Senators", g.senate_src]])}

<h2>State: ${esc(g.house)}</h2>
${split(sed.length, "state electorates", g.lookup, "the electoral commission")}
<ul>${sed.map(d => { const x = g.seats[d]; return x ? `<li><b>${esc(d)}</b>: ${x.m.map(([n, pt]) => `${esc(n)} <span class="mute">(${esc(pt)})</span>`).join(", ")}</li>` : ""; }).join("")}</ul>
${s === "TAS" ? `<p class="mute">Tasmania elects 7 members per division, so all of these represent you.</p>` : ""}
${src(h, [[`${STATE_NAMES[s]} parliament`, g.seats[sed[0]]?.src], ["Find your electorate", g.lookup]])}

<h2>Who's in charge</h2>
<ul><li>${esc(g.hog.title)} of ${STATE_NAMES[s]}: <b>${esc(g.hog.name)}</b> <span class="mute">(${esc(g.hog.party)})</span></li>
<li>Prime Minister: <b>${esc(AU.pm.name)}</b> <span class="mute">(${esc(AU.pm.party)})</span></li>
<li>Next ${s} election: ${esc(nextElection(g.next))}</li></ul>
${src(h, [[`${g.hog.title}`, g.hog.source], ["Prime Minister", AU.pm.source]])}
<p class="mute">Spotted something out of date? Use "Did we mess up?" below and we'll fix it.</p>`;
  return h.page(`${c.name}${mine ? " · " + pc : ""}: who represents you`, body, pc || "");
}
