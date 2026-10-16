
// One engine, many towns: each Worker sets REGION (default 2450) and gets that town's settings from regions.js.
import { REGIONS } from "./regions.js";
import { GENERAL, buildCrossword } from "./crossword.js";
import { QUOTES } from "./quotes.js";
import { WEST, EAST, eastYears, readings, seasonOf, moonLine } from "./horoscope.js";
function initRegion(env) {
  if (R && R.code === (env.REGION || "2450")) return;
  R = REGIONS[env.REGION] || REGIONS["2450"];
  ({ towns: TOWNS, home: HOME, watch: WATCH, faves: FAVES, facts: FACTS, schools: SCHOOLS, mavKB: MAV_KB } = R);
  UA = { "user-agent": `${R.domain} community site (Maverick Digital)` };
  SECTIONS.find(x => x[0] === "know")[1] = `Know your ${R.code}`;
}
// 2450 Maverick — free local info, one page per postcode.
// Born and built in 2450, raised by the world. Powered by Maverick Digital.


let R, TOWNS, HOME, WATCH, FAVES, FACTS, SCHOOLS, MAV_KB, UA;
const SECTIONS = [["today", "At a glance"], ["tools", "Handy tools"], ["alerts", "Alerts"], ["events", "Community events"], ["news", "News"], ["memory", "In memory"], ["joy", "Births & marriages"], ["shop", "Supermarket watch"], ["bypass", "Bypass updates"], ["fuel", "Fuel"], ["sea", "Tides & fishing"], ["know", "Know your area"], ["council", "Council"], ["kids", "Weekend for kids"], ["sport", "Sport & field closures"], ["flights", "Flights"], ["holidays", "Holidays"], ["puzzles", "Crossword"], ["stars", "Horoscopes"], ["lotto", "Lotto results"], ["surfcams", "Surf cams"], ["beaches", "Beaches"]];

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
.tile{background:none}
.md{display:inline-flex;align-items:center;gap:6px;text-decoration:none;color:var(--fg);font-weight:bold;letter-spacing:2px;font-size:.8rem}
.say{background:var(--gold);color:#12233f;padding:0 5px;border-radius:4px;font-weight:bold}.qs{position:sticky;top:0;background:var(--bg);padding:8px 0;z-index:5}.qs input{width:100%;font-size:1.05rem}.qhit{margin:8px 0}.sq{cursor:pointer}.sq span{margin-left:4px;color:var(--mute)}.my{text-decoration:none;font-weight:bold;font-size:.9rem;background:var(--soft);padding:6px 10px;border-radius:16px}.mav{background:var(--soft);border-radius:14px;padding:14px 16px;margin:12px 0}.mav textarea{margin:8px 0}.micb{font-size:1.1rem;width:100%;padding:14px}#ex label{cursor:pointer}.setlist{list-style:none;padding:0}.setlist li{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);padding:8px 0}.setlist li.off span:first-child{opacity:.45;text-decoration:line-through}.setlist button{padding:6px 12px}.setlist button[disabled]{opacity:.3}.tg{min-width:52px}.pills{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 14px}.pills button{background:var(--soft);color:var(--fg);border-radius:18px;padding:4px 11px;font-size:.85rem}.pills button.on{background:var(--fg);color:var(--bg)}.panel{background:var(--soft);border-radius:14px;padding:4px 16px 12px;margin:8px 0}.panel h2{border:0}.ideas{list-style:none;padding:0}.idea{display:flex;gap:12px;align-items:flex-start;border-bottom:1px solid var(--line);padding:10px 0}.vote{background:var(--soft);color:var(--fg);border-radius:12px;padding:8px 10px;min-width:64px}.vote.on{background:var(--gold);color:#12233f}.bar{height:6px;background:var(--line);border-radius:3px;margin:6px 0 2px}.bar i{display:block;height:100%;background:var(--gold);border-radius:3px}.tagg{font-size:.8rem;background:var(--soft);padding:2px 8px;border-radius:10px}.ann{display:flex;justify-content:space-between;gap:8px;align-items:flex-start;background:var(--gold);color:#12233f;border-radius:12px;padding:10px 14px;margin:8px 0;text-align:left}.ann a{color:#12233f}.ann button{background:none;color:#12233f;padding:0 4px;font-size:1.2rem}.fuel{padding-left:20px}.fuel li{margin:8px 0}h3{font-size:1rem;margin:14px 0 4px}.openl{list-style:none;padding:0}.openl li{display:flex;gap:10px;border-bottom:1px solid var(--line);padding:10px 0}.openl .dot{flex:none;width:12px;height:12px;border-radius:50%;margin-top:6px;background:#9aa0a6}.openl li.open .dot{background:#1e9e4a}.openl li.shut .dot{background:#d93025}.openl li.open .st{color:#1e9e4a;font-weight:bold}.openl li.shut .st{color:#d93025;font-weight:bold}.openl li.unk .st{color:var(--mute)}#mavbtn{position:fixed;right:16px;bottom:16px;z-index:50;border-radius:24px;padding:12px 18px;background:var(--fg);color:var(--bg);box-shadow:0 4px 14px rgba(0,0,0,.2)}#mavp{position:fixed;right:12px;bottom:12px;left:12px;max-width:420px;margin-left:auto;z-index:51;background:var(--bg);border:1px solid var(--line);border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.25);display:flex;flex-direction:column;max-height:75vh}#mavp[hidden]{display:none}.mavh{padding:12px 14px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:4px}.mavh button{margin-left:auto;background:none;color:var(--fg);font-size:1.3rem;padding:0 6px}#mavlog{overflow:auto;padding:10px 14px;flex:1}.mm{margin:6px 0;padding:8px 12px;border-radius:14px;max-width:85%}.mm.mav{background:var(--soft)}.mm.me{background:var(--fg);color:var(--bg);margin-left:auto}.mm.me a{color:var(--bg)}#mavchips{padding:0 12px}#mavchips label{cursor:pointer;font-size:.8rem}#mavf{display:flex;gap:6px;padding:10px 12px;border-top:1px solid var(--line)}#mavf input{flex:1;min-width:0}#mavmic{background:var(--soft);color:var(--fg);padding:8px 12px}footer p{margin:0 0 12px}.aoc{max-width:520px;margin-left:auto!important;margin-right:auto!important;font-style:italic;font-size:.8rem}.pow{margin-top:16px!important}.pow>span:first-child{font-size:.75rem}@media print{body *{visibility:hidden}#hsout,#hsout *{visibility:visible}#hsout{position:absolute;left:0;top:0;white-space:pre-wrap;font-size:14px}}.hsout{display:none}@media print{.hsout{display:block}}.srcbtn{background:none;color:var(--mute);border:1px solid var(--line);border-radius:12px;padding:2px 10px;font-size:.78rem;margin:4px 0;cursor:pointer}.srcbtn.on{background:var(--soft);color:var(--fg)}.srcbtn span{margin-left:2px}p.src{background:var(--soft);border-radius:8px;padding:8px 10px}.tagline{display:inline-block;margin-top:4px;font-size:.75rem}.md svg{width:24px;height:21px}.brand .mark{height:22px;width:26px}.chips label{display:inline-block;margin:4px 6px 0 0;padding:6px 10px;border:1px solid var(--line);border-radius:16px;font-size:.9rem}
.chips input{margin-right:4px}.recipes li{margin:10px 0}
.tiles{display:flex;flex-wrap:wrap;gap:4px 14px;margin:8px 0 12px;padding:8px 12px;background:var(--soft);border-radius:10px;font-size:.88rem}@media(max-width:480px){.tiles{gap:4px 12px}}
.tile{display:inline-flex;align-items:baseline;gap:4px;white-space:nowrap}.tile b{font-size:.95rem}.tile small{color:var(--mute);font-size:.78rem}.ico{font-size:1rem}
.hdr{display:flex;gap:8px;align-items:center}.signin{font-weight:600}.gbtn{display:inline-flex;align-items:center;gap:10px;padding:12px 18px;border:1px solid var(--line);border-radius:10px;background:#fff;color:#1f1f1f;text-decoration:none;font-weight:600}.away{font-size:.8rem;color:var(--mute);background:var(--soft);border-radius:99px;padding:1px 8px;margin-left:4px;white-space:nowrap}.towns{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px;font-size:.8rem}.towns .pc{padding:2px 9px;border:1px solid var(--line);border-radius:99px;color:var(--mute);text-decoration:none;white-space:nowrap}.towns .pc small{font-size:inherit;opacity:.8}.towns .pc.on{background:var(--fg);color:var(--bg);border-color:var(--fg);font-weight:600}.towns select{font:inherit;padding:4px 8px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--fg);margin-left:4px}.quote{margin:10px 0 14px;padding:8px 0 8px 14px;border-left:3px solid var(--line);font-family:Georgia,'Times New Roman',serif;font-style:italic}.quote cite{display:block;font-style:normal;font-family:inherit;font-size:.82rem;color:var(--mute);margin-top:2px}.policy{font-weight:600}.jumpx{display:flex;gap:6px;overflow-x:auto;padding:2px 0 10px;margin:0 0 6px;scrollbar-width:none;-webkit-overflow-scrolling:touch}.jump::-webkit-scrollbar{display:none}.jump a{flex:none;font-size:.85rem;padding:5px 11px;border-radius:99px;background:var(--soft);color:var(--fg);text-decoration:none;white-space:nowrap}.jump a:hover{outline:1px solid var(--line)}html{scroll-behavior:smooth}section[id]{scroll-margin-top:12px}.paper .sech{font-family:Georgia,"Times New Roman",serif;font-size:1.6rem;border-top:3px solid var(--fg);border-bottom:1px solid var(--line);padding:6px 0;margin:6px 0 12px}.story{display:block;color:var(--fg);text-decoration:none;margin:0 0 14px}.story:hover .hl{text-decoration:underline}.sbody{display:flex;flex-direction:column;gap:4px}.kick{font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--accent,#c0392b)}.hl{font-family:Georgia,"Times New Roman",serif;font-weight:700;font-size:1.12rem;line-height:1.25}.lead .hl{font-size:1.6rem;line-height:1.15}.dek{color:var(--fg);opacity:.85;font-size:.93rem;line-height:1.45}.lead .dek{font-size:1.02rem}.byl{font-size:.78rem;color:var(--mute)}.simg{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:8px;background:var(--soft)}.lead{padding-bottom:14px;border-bottom:1px solid var(--line)}.lead.wimg{display:grid;grid-template-columns:1.15fr 1fr;gap:18px;align-items:start}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:0 22px}.grid2 .story{padding:12px 0;margin:0;border-bottom:1px solid var(--line)}.grid2 .wimg{display:grid;grid-template-columns:1fr 104px;gap:12px;align-items:start}.grid2 .simg{order:2;width:104px;height:78px;aspect-ratio:auto}@media(max-width:620px){.lead.wimg{display:block}.lead .simg{margin-bottom:8px}.grid2{grid-template-columns:1fr}.grid2 .dek{display:none}.lead .hl{font-size:1.35rem}}.sub{font-family:Georgia,serif;font-size:1rem;margin:10px 0 6px;text-transform:uppercase;letter-spacing:.05em}.heads{list-style:none;padding:0;margin:0}.heads li{padding:7px 0;border-bottom:1px dotted var(--line)}.heads .kick{margin-right:4px}.zod{list-style:none;padding:0;margin:0 0 10px;display:grid;grid-template-columns:1fr 1fr;gap:0 20px}.zod li{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);font-size:.92rem;line-height:1.4}.zod li.on{background:var(--soft);border-radius:8px;padding-left:6px}.zs{font-size:1.4rem;width:1.6rem;text-align:center;flex:none}@media(max-width:620px){.zod{grid-template-columns:1fr}}.rate{border-top:1px solid var(--line);margin:28px 0 0;padding:14px 0;display:flex;flex-wrap:wrap;gap:8px;align-items:center}.rate button[data-v]{background:var(--soft);color:var(--fg);border-radius:99px;padding:4px 12px;font-size:1.1rem}.rate button.on{outline:2px solid var(--fg)}.rate form{width:100%}.rate textarea,.rate input{width:100%;margin:4px 0}.wxtips{margin:-4px 0 12px;padding:0;list-style:none;font-size:.9rem}.wxtips li{padding:3px 0}.faq{border-bottom:1px solid var(--line);padding:6px 0}.faq summary{cursor:pointer;font-weight:600}.faq p{margin:6px 0 4px}.ptabs{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0 10px}.ptabs button{background:var(--soft);color:var(--fg);border-radius:99px;padding:5px 12px;font-size:.9rem}.ptabs button.on{background:var(--fg);color:var(--bg)}.pdate{font-size:.85rem;color:var(--mute)}.pdate input{font:inherit;padding:3px 6px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--fg)}.pven{padding:8px 0;border-bottom:1px solid var(--line)}.pven ul{margin:4px 0;padding-left:0;list-style:none}.pven li{padding:2px 0}.shop{list-style:none;padding:0;margin:0}.shop li{display:flex;flex-wrap:wrap;gap:6px;align-items:baseline;padding:6px 0;border-bottom:1px solid var(--line)}.shop li span:first-child{flex:1 1 60%}.fls{list-style:none;padding:0;margin:0}.fls li{padding:5px 0;border-bottom:1px solid var(--line)}.fls li.hit{background:var(--soft)}.fl{font-size:.8rem;font-weight:700;border-radius:99px;padding:1px 8px;margin-left:4px}.fl.ok{background:#e3f6e8;color:#1a7f37}.fl.warn{background:#fff4d6;color:#8a5a00}.fl.bad{background:#fde2e1;color:#b42318}.mast{font-family:Georgia,'Times New Roman',serif;font-weight:bold;font-size:1.5rem;text-align:center;margin:4px 0 0;letter-spacing:.3px;border-top:3px double var(--fg);border-bottom:1px solid var(--fg);padding:6px 0}.edition{text-align:center;font-size:.75rem;color:var(--mute);margin:4px 0 10px;text-transform:uppercase;letter-spacing:1px}.cw{border-collapse:collapse;margin:10px auto}.cw td{width:min(34px,7.6vw);height:min(34px,7.6vw);border:1px solid var(--fg);position:relative;padding:0}.cw td.bk{border:0;background:transparent}.cw input{width:100%;height:100%;border:0;border-radius:0;text-align:center;font-size:1.1rem;text-transform:uppercase;padding:0;background:var(--bg)}.cw input.bad{color:#d93025}.cn{position:absolute;top:1px;left:2px;font-size:.55rem;color:var(--mute)}.cwl>div{flex:1;min-width:220px}.cwl ol{padding-left:0;list-style:none}.ghost{background:var(--soft);color:var(--fg)}.snap span{display:inline-block;margin:8px 0 4px;background:var(--accent);color:var(--bg);border-radius:20px;padding:10px 18px;cursor:pointer;font-weight:bold}.ball{display:inline-block;min-width:28px;height:28px;line-height:28px;border-radius:50%;background:var(--gold);color:#12233f;text-align:center;font-weight:bold;font-size:.85rem;margin:3px 2px 0 0}.ball.alt{background:var(--soft);color:var(--fg)}.lotto{list-style:none;padding:0}.lotto li{margin:10px 0}.rally{background:#fbf5e6;border:1px dashed #e6d6ad;border-radius:6px;padding:10px 14px;margin:28px 0 18px;font-size:.8rem;color:var(--mute)}.rally p{margin:5px 0}.rally b{color:var(--mute)}.rallyh{margin:0 0 2px;font-size:.85rem;font-weight:600;color:var(--mute)}.rally input,.rally button{font-size:.85rem}.bar{display:block;height:5px;border-radius:99px;background:rgba(128,128,128,.2);overflow:hidden}.bar>span{display:block;height:100%;background:var(--mute);border-radius:99px}.bar.sm{height:6px;margin-top:6px}.barlab{margin:2px 0 8px;font-size:.8rem}.rallystrip{display:block;text-decoration:none;font-size:.72rem;margin:0 0 8px;opacity:.8}.note{border:1px solid var(--accent);border-radius:8px;padding:10px}details.pins{margin:8px 0}#know details{margin:6px 0}.src{font-size:.75rem;color:var(--mute);margin:2px 0 8px}.src.warn{color:#9a5b00}@media(prefers-color-scheme:dark){.src.warn{color:#f0b35a}.rally{background:#211c12!important;border-color:#4a3f26!important}}#know summary{cursor:pointer;padding:6px 0}details.pins label{display:inline-block;margin:4px 12px 0 0}.pins label{display:inline;margin-right:12px;font-size:.9rem}
/* Newspaper-style sections: each desk gets its own colour, a rule above the heading and a light panel, so nothing blends together */
#flow>section{--acc:#2b4a7a;margin:18px 0;padding:12px 16px 14px;border-radius:12px;background:color-mix(in srgb,var(--acc) 5%,var(--bg));border:1px solid color-mix(in srgb,var(--acc) 18%,var(--line))}
#flow>section>h2{margin:0 0 6px;padding:0 0 6px;border:0;border-bottom:2px solid var(--acc);font-size:1.12rem;display:flex;align-items:center;gap:6px}
#flow>section>h2::before{content:"";width:6px;height:1.1em;border-radius:3px;background:var(--acc)}
#flow>section h3{font-size:.8rem;text-transform:uppercase;letter-spacing:.06em;color:var(--acc);margin:14px 0 4px}
#flow>#today{background:none;border:0;padding:0;margin:4px 0}
#flow>#news{--acc:#12233f;background:var(--bg);border:0;border-radius:0;padding:0;margin:8px 0 22px}
#flow>#news>h2::before{display:none}
#tonight{--acc:#0f766e!important}#events,#kids{--acc:#0f766e!important}
#alerts{--acc:#b42318!important}
#memory{--acc:#6b7280!important}#joy{--acc:#c2417a!important}
#fuel,#shop,#lotto{--acc:#15803d!important}
#flights,#bypass,#sea,#beaches,#surfcams{--acc:#1d6fb8!important}
#puzzles,#stars,#holidays{--acc:#b45309!important}
#know,#council,#tools,#sport{--acc:#475569!important}
.pills button{border-left:4px solid var(--pc,var(--line))}
.pills{padding:10px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.pills::before{content:"More in today's Gazette";display:block;width:100%;font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:var(--mute);margin-bottom:2px}
@media (prefers-color-scheme:dark){#flow>section{background:color-mix(in srgb,var(--acc) 9%,var(--bg))}}
`;

function page(title, body, pc = "") {
  return new Response(`<!doctype html><html lang="en-AU"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<meta name="description" content="Everything on in your town, in one place. Free. Nobody pays to be here.">
<link rel="manifest" href="/manifest.webmanifest"><link rel="icon" href="/icon.svg"><meta name="theme-color" content="#0B1526">
<style>${CSS}</style></head><body><header class="top"><a class="brand" href="/" aria-label="${R.brand} home"><span class="badge">${R.code}</span><svg viewBox="3 4.5 28 23.5" aria-hidden="true" class="mark"><path d="M5 26 L12 11 L17.5 20 L23 8 L29 26" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="23" cy="8" r="2.6" fill="currentColor"/></svg></a><span class="hdr"><a href="/me" id="my2450" class="my">⚙️ My 2450</a> <a href="/signin" id="signin" class="my signin">👤 Sign in</a></span></header>
<script>try{var n=decodeURIComponent((document.cookie.match(/(?:^|; )m2450n=([^;]*)/)||[])[1]||"")||localStorage.getItem("name");if(n)document.getElementById("my2450").textContent="⚙️ "+n+"\u2019s 2450";if(/(?:^|; )m2450n=/.test(document.cookie)){var si=document.getElementById("signin");si.textContent="Sign out";si.href="/signout";si.classList.remove("signin")}else document.getElementById("signin").href="/signin?next="+encodeURIComponent(location.pathname)}catch(e){}<\/script>
<svg class="wave" viewBox="0 0 1200 40" preserveAspectRatio="none"><path fill="currentColor" d="M0 20 Q150 0 300 20 T600 20 T900 20 T1200 20 V40 H0Z"/></svg><main>${body}</main>
<div class="rate" id="rate"><span>Was this page useful?</span> <button type="button" data-v="up" aria-label="Yes, useful">👍</button> <button type="button" data-v="down" aria-label="No, not useful">👎</button>
<span class="mute">Did we mess up? <a href="#" id="rwrong">Tell us and we'll fix it</a>.</span>
<form id="rform" hidden><label for="rnote">What did we get wrong, or what's missing?</label><textarea id="rnote" rows="3" maxlength="800"></textarea><input type="email" id="remail" maxlength="120" placeholder="Your email if you'd like to hear back (optional)"><button>Send</button></form><p id="rmsg" class="mute" hidden></p></div>
<script>(function(){var P=location.pathname,K='rated:'+P,f=document.getElementById('rform'),m=document.getElementById('rmsg');
function send(o){o.p=P;return fetch('/api/rate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(o)}).catch(function(){})}
function say(t){m.textContent=t;m.hidden=false}
var done=null;try{done=localStorage.getItem(K)}catch(e){}
document.querySelectorAll('#rate button[data-v]').forEach(function(b){if(done===b.dataset.v)b.classList.add('on');b.onclick=function(){var v=b.dataset.v;if(done!==v){send({v:v});try{localStorage.setItem(K,v)}catch(e){}done=v}
document.querySelectorAll('#rate button[data-v]').forEach(function(x){x.classList.toggle('on',x===b)});if(v==='down'){f.hidden=false;document.getElementById('rnote').focus()}else{f.hidden=true;say('Thanks! Glad it helped.')}}});
document.getElementById('rwrong').onclick=function(e){e.preventDefault();f.hidden=false;document.getElementById('rnote').focus()};
f.onsubmit=function(e){e.preventDefault();var n=document.getElementById('rnote').value.trim();if(!n)return;send({note:n,email:document.getElementById('remail').value.trim()});f.hidden=true;say('Thanks for telling us. We read every one and fix what we got wrong.')}})();</script>
<footer><p><a href="/about">Nobody pays to be here</a> · <a href="/feedback">Make ${R.code} better</a> · <a href="/charter">Charter</a> · <a href="/privacy">Privacy</a> · <a href="/faq">FAQ</a>${pc ? ` · <a href="/submit?pc=${pc}">Add an event</a>` : ""}</p>
<p class="policy">One policy: no BS. We find the information and tell you where it came from. No opinions, no spin.</p>
<p>${R.footer}</p>
<p class="gaz">Our Gazettes: ${Object.values(REGIONS).map(x => x.code === R.code ? `<b>${esc(x.place)}</b>` : `<a href="https://${x.domain}">${esc(x.place)}</a>`).join(" · ")} · <a href="/suggest">Want one for your town?</a></p>
<p class="aoc">🙏🏽 ${R.ack} <a href="https://aiatsis.gov.au/explore/map-indigenous-australia" rel="noopener">Know whose land you're on</a>.</p>
<p class="pow"><span>Powered by</span> <a class="md" href="https://maverickdigital.com.ai" aria-label="Maverick Digital"><svg viewBox="3 4.5 28 23.5" aria-hidden="true" class="mark"><path d="M5 26 L12 11 L17.5 20 L23 8 L29 26" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="23" cy="8" r="2.6" fill="currentColor"/></svg>MAVERICK DIGITAL</a></p></footer>
${MAV_WIDGET()}
<script>document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a||a.target)return;try{var u=new URL(a.href,location.href);if(/^https?:$/.test(u.protocol)&&u.host!==location.host){a.target="_blank";a.rel=((a.rel||"")+" noopener").trim()}}catch(_){}},true)</script>
<script>(function(){var first=null,seen=false;try{seen=!!localStorage.getItem('src_hint')}catch(e){}
document.querySelectorAll('p.src').forEach(function(p){p.hidden=true;var b=document.createElement('button');b.type='button';b.className='srcbtn';b.innerHTML='ⓘ <span>Where from?</span>';
b.setAttribute('aria-label','Where this information comes from');b.setAttribute('aria-expanded','false');
b.onclick=function(){p.hidden=!p.hidden;b.setAttribute('aria-expanded',String(!p.hidden));b.classList.toggle('on',!p.hidden);try{localStorage.setItem('src_hint','1')}catch(e){}var h=document.getElementById('srchint');if(h)h.remove()};
p.parentNode.insertBefore(b,p);if(!first)first=b});
})();</script>
<script>(function(){var TW=${JSON.stringify(Object.entries(TOWNS).filter(([, t]) => t.live).map(([k, t]) => [k, t.lat, t.lon]))};var L=null;try{L=JSON.parse(localStorage.getItem("loc"))}catch(e){}document.querySelectorAll(".useloc").forEach(function(a){if(L)a.textContent="📍 Using your location (reset)";
a.onclick=function(e){e.preventDefault();if(L){try{localStorage.removeItem("loc")}catch(_){}location.reload();return}if(!navigator.geolocation){a.textContent="Location not available on this device";return}a.textContent="📍 Finding you…";
navigator.geolocation.getCurrentPosition(function(p){var la=+p.coords.latitude.toFixed(2),lo=+p.coords.longitude.toFixed(2);try{localStorage.setItem("loc",JSON.stringify([la,lo]))}catch(_){}
var best=null,bd=1e9;TW.forEach(function(t){var d=Math.pow(t[1]-la,2)+Math.pow((t[2]-lo)*Math.cos(la*Math.PI/180),2);if(d<bd){bd=d;best=t[0]}});
if(/^\\/\\d{4}\\/?$/.test(location.pathname)&&best&&bd<0.09&&location.pathname.indexOf(best)<0){try{localStorage.setItem("pc",best)}catch(_){}location.replace("/"+best)}else location.reload()},function(){a.textContent="📍 Location not allowed"},{timeout:10000})}})})();
if("serviceWorker"in navigator)navigator.serviceWorker.register("/sw.js").catch(()=>{})</script></body></html>`,
    { headers: { "content-type": "text/html;charset=utf-8" } });
}


// ---- Mav's announcements: auto-posted when a voted idea is marked Done, or posted by hand in admin ----
async function announcements(env) {
  const out = [];
  for (const { name } of await klist(env, "ann:")) { const a = await env.DATA.get(name, "json"); if (a) out.push({ id: name, ...a }); }
  return out.sort((a, b) => b.at.localeCompare(a.at));
}
async function annBanner(env) {
  const a = (await announcements(env))[0];
  if (!a || Date.now() - new Date(a.at) > 14 * 864e5) return "";
  return `<div class="ann" id="ann" data-id="${esc(a.id)}" hidden><span>🎉 <b>New from Mav:</b> ${esc(a.text)}${a.link ? ` <a href="${esc(a.link)}">Try it →</a>` : ""} <a href="/new" class="mute">What's new</a></span><button type="button" aria-label="Dismiss" onclick="try{localStorage.setItem('ann_seen',this.parentNode.dataset.id)}catch(e){}this.parentNode.remove()">×</button></div>
<script>try{var A=document.getElementById('ann');if(localStorage.getItem('ann_seen')!==A.dataset.id)A.hidden=false}catch(e){document.getElementById('ann').hidden=false}</script>`;
}
const newPage = async env => { const list = await announcements(env); return page("What's new", `<h1>🎉 What's new</h1>
<p>Every feature here was asked for by locals. <a href="/feedback">Suggest or vote for the next one</a>.</p>
<ul class="ideas">${list.map(a => `<li class="idea"><div><b>${esc(a.text)}</b>${a.link ? ` <a href="${esc(a.link)}">Try it →</a>` : ""}<br><small class="mute">${esc(fmtDate(a.at.slice(0, 10)))}${a.votes ? ` · ${a.votes} locals voted for it` : ""}</small></div></li>`).join("") || '<li class="mute">Nothing yet. Watch this space!</li>'}</ul>`); };

const home = async env => page(`${R.brand} — what's on in your town`, `
${await annBanner(env)}<div class="home"><p class="big" aria-label="${R.brand}">${R.code}<svg viewBox="3 4.5 28 23.5" aria-hidden="true" class="mark" style="height:.85em;margin-left:.12em;vertical-align:-.02em"><path d="M5 26 L12 11 L17.5 20 L23 8 L29 26" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="23" cy="8" r="2.6" fill="currentColor"/></svg></p><p class="mute">Everything on in your town, in one place. Free.</p>
<form class="search" onsubmit="event.preventDefault();var p=this.pc.value.trim();try{localStorage.setItem('pc',p)}catch(e){};location='/'+p">
<input name="pc" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="Your postcode" required aria-label="Your postcode"><button>Go</button></form>
<p id="mine"></p><p class="mute">Live now: ${Object.entries(TOWNS).filter(([, v]) => v.live).map(([k, v]) => `<a href="/${k}">${k} ${esc(v.name)}</a>`).join(" · ")}. ${R.soon}</p>
<a class="card" href="/fridge">🧊 <b>What's in your fridge?</b> Tell us what you've got, get dinner ideas.</a></div>
<script>try{var p=localStorage.getItem('pc');if(p)document.getElementById('mine').innerHTML='Your town: <a href="/'+p+'">'+p+'</a>'}catch(e){}</script>`);

async function listEvents(env, prefix) {
  const today = todayISO(), out = [];
  const keys = await klist(env, prefix);
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

// NSW school holidays, Eastern division (Coffs Harbour). Source: NSW Department of Education term dates.
// Add new years here when the department publishes them.
const SCHOOL_HOLS = [
  ["Summer", "2026-12-18", "2027-01-27"], ["Autumn", "2027-04-12", "2027-04-23"], ["Winter", "2027-07-05", "2027-07-16"],
  ["Spring", "2027-09-27", "2027-10-08"], ["Summer", "2027-12-21", "2028-01-28"],
];
const schoolHols = () => { const t = todayISO(), list = SCHOOL_HOLS.filter(([, , end]) => end >= t).slice(0, 2);
  return list.length ? `<ul>${list.map(([name, start, end]) => `<li><b>${esc(name)} school holidays</b>: ${esc(fmtDate(start))} to ${esc(fmtDate(end))}${start <= t ? ` <span class="away">on now</span>` : away(start)}</li>`).join("")}</ul>` : ""; };
// Coming up in the sky (Australia-wide). Yearly showers recur on their usual peak date; one-offs have a full date.
const SKY = [
  { name: "Eta Aquariid meteor shower peaks (best before dawn, one of the best from Australia)", md: "05-06" },
  { name: "Orionid meteor shower peaks (look north-east after midnight)", md: "10-21" },
  { name: "Leonid meteor shower peaks", md: "11-17" },
  { name: "Geminid meteor shower peaks (the year's best, look north after 11pm)", md: "12-14" },
  { name: "Total solar eclipse across Australia: total in Sydney, partial everywhere else", date: "2028-07-22" },
  { name: "Halley's Comet returns (closest to the Sun)", date: "2061-07-28" },
];
const skyNext = () => { const t = todayISO(), y = +t.slice(0, 4);
  return SKY.map(e => ({ ...e, d: e.date || (`${y}-${e.md}` >= t ? `${y}-${e.md}` : `${y + 1}-${e.md}`) })).filter(e => e.d >= t).sort((a, b) => a.d.localeCompare(b.d)); };
// "How far away" note for upcoming dates, e.g. "in 12 days".
const away = d => { const n = Math.round((new Date(d + "T00:00:00Z") - new Date(todayISO() + "T00:00:00Z")) / 864e5); return n < 0 ? "" : ` <span class="away">${n === 0 ? "today" : n === 1 ? "tomorrow" : `in ${n.toLocaleString("en-AU")} days`}</span>`; };
const fmtDate = d => new Date(d + "T00:00:00").toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
const costTag = e => e.cost == null ? "" : ` <span class="tagg">${e.cost === 0 ? "Free" : "$" + e.cost + (e.kids ? " per kid" : "")}</span>`;
const evItem = e => `<li><b>${esc(fmtDate(e.date))}${e.time ? " " + esc(e.time) : ""}</b>${away(e.date)} — ${e.link ? `<a href="${esc(e.link)}" rel="nofollow noopener">${esc(e.title)}</a>` : esc(e.title)}${e.venue ? `, ${esc(e.venue)}` : ""}${costTag(e)}${e.desc ? `<br><span class="mute">${esc(e.desc)}</span>` : ""}</li>`;

async function town(pc, env, ctx, isRoot = false) {
  const t = TOWNS[pc];
  if (!t || !t.live) return page(`${pc} — coming soon`, `<h1>${esc(pc)}${t ? " " + esc(t.name) : ""}</h1>
<p>Not live yet. ${R.coverage} Want your town next? Leave your email and you'll hear when it's up.</p>${signup(pc)}<p><a href="/${R.code}">See ${R.code} ${R.place}</a></p>`, pc);

  // Local submissions first, then events from feeds.
  const local = await listEvents(env, `event:${pc}:`);
  const feed = await listEvents(env, `feed:${pc}:`);
  const others = Object.entries(TOWNS).filter(([k, v]) => k !== pc && v.live).sort((a, b) => km(t, a[1]) - km(t, b[1]));
  let nearby = "";
  for (const [k, v] of others) { const ev = [...await listEvents(env, `event:${k}:`), ...await listEvents(env, `feed:${k}:`)].slice(0, 4);
    if (ev.length) nearby += `<h3>Nearby: ${esc(v.name)} (${k})</h3><ul>${ev.map(evItem).join("")}</ul>`; }
  const events = ((local.length ? `<h3>From locals</h3><ul>${local.map(evItem).join("")}</ul>` : "")
    + (feed.length ? `<h3>More around town</h3><ul>${feed.map(evItem).join("")}</ul>` : "")
    || `<p>Nothing listed in ${esc(pc)} yet. Know something on? <a href="/submit?pc=${pc}">Add it free</a>.</p>`) + nearby;

  const cc = clockChange(), ann = await annBanner(env), live = await liveBlocks(env, ctx, { lat: t.lat, lon: t.lon });
  const nLocals = await localsCount(env);
  const W = Object.fromEntries(await Promise.all(Object.keys(WATCH).map(async id => [id, await env.DATA.get(`srcw:${id}`, "json")])));
  const soon = (id, title, what, link, linkText) => `<section id="${id}"><h2>${title}</h2><p class="mute">${what}${link ? ` For now: <a href="${link}" rel="noopener">${linkText}</a>.` : ""}</p></section>`;
  return page(`The ${pc} Gazette: ${t.name}`, `${isRoot ? `<script>try{var sp=localStorage.getItem('pc');if(sp&&/^\\d{4}$/.test(sp)&&sp!=='${R.code}')location.replace('/'+sp)}catch(e){}</script>` : ""}
<nav class="towns" aria-label="Postcode">${Object.entries(TOWNS).filter(([, v]) => v.live).map(([k, v]) => k === pc ? `<span class="pc on" aria-current="page">${esc(k)} <small>${esc(v.name)}</small></span>` : `<a class="pc" href="/${esc(k)}" onclick="try{localStorage.setItem('pc','${esc(k)}')}catch(e){}">${esc(k)} <small>${esc(v.name)}</small></a>`).join("")}<a class="pc add" href="/suggest">+ Your town?</a></nav><p class="mast">The ${esc(pc)} Gazette</p><p class="edition">${esc(new Date(todayISO() + "T00:00:00").toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" }))} · Free, every day</p>${quoteBlock()}
<h1>${esc(t.name)} ${esc(pc)}</h1>
${rallyStrip(nLocals)}
<div class="qs"><input id="qs" type="search" placeholder="🔎 What do you need? Try bins, tides, mayor…" autocomplete="off" aria-label="Search ${esc(pc)}">
<div id="qs-saved" class="chips"></div><div id="qs-res"></div></div>
${ann}<p class="mute"><span id="date"></span> · <a href="#" class="useloc">📍 Use my location</a> · <a href="/me" class="openmav">💬 Make this page yours</a></p>
${cc.soon ? `<p class="note">⏰ ${cc.text}</p>` : ""}
<div id="flow"><section id="today"><div class="tiles">
<div class="tile"><span id="i-wx" class="ico">⛅</span><b id="t-temp">–</b><small id="t-sky">Weather</small></div>
<div class="tile"><span class="ico">🌧️</span><b id="t-rain">–</b><small>Rain chance</small></div>
<div class="tile"><span class="ico">💨</span><b id="t-wind">–</b><small id="t-windd">Wind</small></div>
<div class="tile"><span class="ico">🌅</span><b id="t-rise">–</b><small id="t-set">Sunrise</small></div>
<div class="tile"><span class="ico">🌊</span><b id="t-tide">–</b><small id="t-tide2">Next tide</small></div>
<div class="tile"><span class="ico">🏄</span><b id="t-swell">–</b><small>Swell</small></div>
<div class="tile"><span class="ico" id="i-moon">🌙</span><b id="t-moon">–</b><small id="t-moon2">Moon</small></div>
${cc.soon ? `<div class="tile"><span class="ico">⏰</span><b>${esc(cc.date)}</b><small>Clocks ${cc.dir}</small></div>` : ""}
</div><ul id="wxtips" class="wxtips" aria-live="polite"></ul></section>
${live.news}
${await plannerBlock(env)}
<section id="events"><h2>🎪 Community events</h2>${events}<p><a href="/submit?pc=${pc}">+ Add an event (free)</a></p></section>
${await memoryBlock(env)}
${await joyBlock(env)}
<section id="tools"><h2>Handy tools</h2>
<a class="card" href="/notices">📌 <b>Community notice board</b> Lost pets, volunteers, clubs and classes. No buy and sell →</a>
<a class="card" href="/home">🏡 <b>My home</b> Bin night reminders and a house-sitter sheet to print or share →</a>
<a class="card" href="/${R.why.slug}">🌊 <b>${R.why.title}</b> ${R.why.card} →</a>
<a class="card" href="/open">🟢 <b>Open now?</b> Pharmacies, mechanics, servos, cafés and more. Open ones first →</a>
<a class="card" href="/fridge">🧊 <b>What's in your fridge?</b> Dinner ideas from what you've already got →</a>
<a class="card" href="/birthday">🎂 <b>Birthday deals</b> Which local places look after you on your big day →</a>
<a class="card" href="/genalpha">🗣️ <b>Gen Alpha interpreter</b> What did your kid just say? Jimmy Joel translates →</a>
<a class="card" href="/rip">🕊️ <b>In memory</b> Remembering locals who have recently passed →</a>
<a class="card" href="/school">🚸 <b>School run report</b> Weather and traffic for your school drop-off and pick-up →</a>
</section>
${fuelBlock(t)}
${await shopBlock(env)}
${await projectBlock(env)}
<section id="sea"><h2>Tides &amp; fishing</h2><p id="tide" class="mute">Loading…</p>
<p class="mute">Tide times are modelled estimates. Not for navigation; check the Bureau of Meteorology before boating.</p></section>
<section id="know"><h2>Know your ${esc(pc)}</h2><p class="mute">The handy stuff, all in one place. Every item is sourced and shown as the source has it. We don&rsquo;t edit it. We tell you where it&rsquo;s from and how well the owner keeps it up to date.</p>
${R.know(W, accLine)}<p class="mute">Spotted something out of date? <a href="/feedback">Let us know</a>.</p></section>
${soon("council", "Council", "Council news, public notices and road works, coming soon.", R.council.url, R.council.name)}
${await kidsBlock(local, feed, pc)}
${R.fields ? `<section id="sport"><h2>Sport &amp; field closures</h2>
<div class="note">🔔 <b>Get field closure alerts</b> on your phone the moment we know. <button type="button" class="pushbtn" data-topic="fields">Turn on alerts</button><br><small class="mute pushmsg"></small></div>
${await fieldsBlock(env, ctx)}
<p class="mute">Clubs: post games, fixtures and closures free via <a href="/submit?pc=${pc}">Add an event</a>.</p></section>` : soon("sport", "Sport & field closures", "Field closures and local sport, coming soon. Clubs can post games and closures free via Add an event.")}
${await flightsBlock(env)}
${live.holidays}
<section id="puzzles"><h2>🧩 Crossword</h2><p>Today&rsquo;s ${esc(R.short)} crossword: eight words, a few minutes, no sign-up. <a href="/crossword"><b>Play today&rsquo;s →</b></a></p></section>
${starsBlock()}
${await lottoBlock(env)}
<section id="surfcams"><h2>Surf cams</h2><p class="mute">Coastalwatch charges for its live surf cam feed, so we can&rsquo;t show it here. Nobody pays to be on this site, and we don&rsquo;t pay to show other people&rsquo;s paid content either. Have a look on their site: <a href="https://www.coastalwatch.com" rel="noopener">Coastalwatch</a>.</p></section>
<section id="beaches"><h2>🏖️ Beach &amp; surf</h2><div class="tiles" id="bch">
<div class="tile"><span class="ico">🌡️</span><b id="b-sst">–</b><small>Water temp</small></div><div class="tile"><span class="ico">🌊</span><b id="b-wave">–</b><small id="b-wave2">Waves</small></div>
<div class="tile"><span class="ico">💨</span><b id="b-wind">–</b><small id="b-wind2">Wind</small></div><div class="tile"><span class="ico">☀️</span><b id="b-uv">–</b><small id="b-uv2">UV today</small></div></div>
<p class="mute">Swim between the red and yellow flags. Patrol times and beach-by-beach info: <a href="https://beachsafe.org.au" rel="noopener">Beachsafe</a>.</p>
<p class="src">Info from <a href="https://open-meteo.com" rel="noopener">Open-Meteo</a> (modelled, updated hourly). Not for navigation.</p>
<script>(function(){var t=${JSON.stringify({ lat: t.lat, lon: t.lon, mlat: t.mlat, mlon: t.mlon })},$=function(i,v){var e=document.getElementById(i);if(e)e.textContent=v},D=['N','NE','E','SE','S','SW','W','NW'],dir=function(d){return D[Math.round(d/45)%8]};
fetch('https://marine-api.open-meteo.com/v1/marine?latitude='+t.mlat+'&longitude='+t.mlon+'&current=wave_height,wave_direction,wave_period,sea_surface_temperature&timezone=Australia%2FSydney').then(function(r){return r.json()}).then(function(j){var c=j.current||{};if(c.sea_surface_temperature!=null)$('b-sst',Math.round(c.sea_surface_temperature)+'°C');if(c.wave_height!=null){$('b-wave',c.wave_height.toFixed(1)+' m');$('b-wave2',dir(c.wave_direction)+' · '+Math.round(c.wave_period)+' s')}}).catch(function(){});
fetch('https://api.open-meteo.com/v1/forecast?latitude='+t.lat+'&longitude='+t.lon+'&current=wind_speed_10m,wind_direction_10m&daily=uv_index_max&timezone=Australia%2FSydney&forecast_days=1').then(function(r){return r.json()}).then(function(j){var c=j.current||{},u=(j.daily||{}).uv_index_max;if(c.wind_speed_10m!=null){$('b-wind',Math.round(c.wind_speed_10m)+' km/h');$('b-wind2',dir(c.wind_direction_10m)+' wind')}if(u&&u[0]!=null){var v=Math.round(u[0]);$('b-uv',v);$('b-uv2',v>=11?'Extreme UV':v>=8?'Very high UV':v>=6?'High UV':v>=3?'Moderate UV':'Low UV')}}).catch(function(){});})();</script></section>
${live.alerts}</div>
<p><a class="card" href="/me">🎤 <b>Make this page yours</b> Just tell Mav what you want to see →</a></p>
${PUSH_JS()}${rally(nLocals, pc)}
<script>
try{localStorage.setItem('pc','${pc}')}catch(e){}
var IDX=[...${JSON.stringify(R.idx)},["weather temperature rain wind forecast","Weather today","Today's weather, rain chance and wind are in the tiles at the top.","#today"],
["sunrise sunset moon","Sunrise, sunset and moon","See the tiles at the top of the page.","#today"],
["tide tides fishing fish swell waves boat","Tides & fishing","Next high and low tides, waves and swell. Modelled estimates, not for navigation.","#sea"],
["surf cam beach waves","Surf cams","Live cams via Coastalwatch.","#surfcams"],["beach patrol lifeguard swim","Beaches","Patrolled beaches via Beachsafe.","#beaches"],
["event events whats on what's on markets gig music things to do weekend","What's on","Local events, with locals' submissions first.","#events"],
["add event submit list my event","Add an event","List your event free, checked before it goes live.","/submit?pc=${pc}"],
["dumping illegal dumped","Illegal dumping","Report it online via the NSW EPA (Environment Protection Authority).","#know"],
["pothole footpath streetlight report problem fix overgrown","Report a problem","Use the council request form.","#know"],
["complaint complain ombudsman unhappy","Complaints","Council first; then the NSW Ombudsman.","#know"],
["fuel petrol diesel servo cheap","Fuel","Cheapest fuel: NSW FuelCheck for now.","#fuel"],["fire fires bushfire flood alert alerts emergency","Alerts","Fires Near Me for now. Emergencies: call 000.","#alerts"],
["traffic road roads closure crash roadworks","Traffic & roads","Live Traffic NSW for now.","/school"],["school drop off pick up school run zone","School run report","Weather and traffic for your school run.","/school"],
["holiday holidays school holidays public holiday","Holidays","NSW school calendar for now.","#holidays"],
["notice board notices lost pet found dog cat volunteer club group class workshop neighbour","Community notice board","Lost pets, volunteers, clubs, classes. No buy and sell.","/notices"],["bin night bins reminder house sitter house-sitter holiday away pets home","My home","Bin night reminders and a house-sitter sheet.","/home"],["open now hours pharmacy chemist mechanic doctor vet supermarket bottle shop cafe pub takeaway","Open now?","What's open near you right now.","/open"],["fridge dinner recipe recipes cook cooking food meal","What's in your fridge?","Dinner ideas from what you've got.","/fridge"],["birthday deal deals discount free birthday","Birthday deals","Local places that look after you on your birthday.","/birthday"],
["gen alpha slang kids rizz skibidi translate","Gen Alpha interpreter","Jimmy Joel translates kid-speak.","/genalpha"],["births birth baby babies marriage marriages wedding engaged engagement anniversary celebrations hatches matches","Births & marriages","New babies, engagements and weddings. Share your news free.","/celebrations"],["obituary obituaries funeral died death passed rip memory","In memory","Recent local death notices.","/rip"],
["clock clocks daylight saving time change","Clock change","Next clock change is in the tiles at the top.","#today"],["news headlines","News","Local headlines, coming soon.","#news"],
["feedback idea suggestion contact","Make ${R.code} better","Send us your ideas.","/feedback"],["privacy data","Privacy","Plain-English privacy policy.","/privacy"],["terms charter free","Our charter","Free, forever.","/charter"]];
var qs=document.getElementById('qs'),qr=document.getElementById('qs-res'),qv=document.getElementById('qs-saved');
function esc2(x){return String(x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function saved(){try{return JSON.parse(localStorage.getItem('saved_q')||'[]')}catch(e){return[]}}
function drawSaved(){var a=saved();qv.innerHTML=a.map(function(x){return '<label class="sq">'+esc2(x)+' <span data-x="'+esc2(x)+'" title="Remove">×</span></label>'}).join('')}
qv.onclick=function(e){var x=e.target.dataset.x;if(x){try{localStorage.setItem('saved_q',JSON.stringify(saved().filter(function(y){return y!==x})))}catch(_){}drawSaved();return}
var l=e.target.closest('.sq');if(l){qs.value=l.firstChild.textContent.trim();find()}};
function find(){var v=qs.value.toLowerCase().trim();if(v.length<2){qr.innerHTML='';return}var w=v.split(/\\s+/),hits=IDX.map(function(r){var sc=w.filter(function(x){return (r[0]+' '+r[1].toLowerCase()).indexOf(x)>-1}).length;return[sc,r]}).filter(function(x){return x[0]}).sort(function(a,b){return b[0]-a[0]}).slice(0,4).map(function(x){return x[1]});
document.querySelectorAll('#events li').forEach(function(li){if(hits.length<6&&li.textContent.toLowerCase().indexOf(v)>-1)hits.push(['',li.querySelector('b')?li.textContent.slice(0,60):'Event',li.textContent.slice(0,140),'#events'])});
qr.innerHTML=(hits.length?hits.map(function(r){return '<a class="card qhit" href="'+r[3]+'"><b>'+esc2(r[1])+'</b><br><span class="mute">'+esc2(r[2])+'</span></a>'}).join(''):'<p class="mute">Nothing yet. <a href="/feedback">Tell us what you were looking for</a>.</p>')
+'<p class="mute"><a href="#" id="qs-save">☆ Save this search</a> · ⏰ Schedule it: coming soon in your weekly email</p>';
document.getElementById('qs-save').onclick=function(e){e.preventDefault();var a=saved();if(a.indexOf(v)<0){a.unshift(v);a=a.slice(0,8)}try{localStorage.setItem('saved_q',JSON.stringify(a))}catch(_){}drawSaved();this.textContent='★ Saved'}}
qr.onclick=function(e){var a=e.target.closest('a.qhit');if(a&&a.getAttribute('href').charAt(0)=='#'){var t=document.querySelector(a.getAttribute('href'));if(t){t.hidden=false;t.querySelectorAll('details').forEach(function(d){d.open=true})}}};
qs.oninput=find;drawSaved();

(function(){var g=function(k){try{return localStorage.getItem(k)}catch(e){return null}},day=g('bin_bday');if(day===null||day==='')return;var d=new Date(),diff=(+day-d.getDay()+7)%7;if(diff>1)return;
var n=new Date(d);n.setDate(d.getDate()+diff);var wk=Math.floor((Date.UTC(n.getFullYear(),n.getMonth(),n.getDate())/864e5+4)/7),a=null;try{a=JSON.parse(g('bin_anchor'))}catch(e){}var alt=a?((wk-a[0])%2===0?a[1]:3-a[1]):1;
var el=document.createElement('p');el.className='note';el.innerHTML='🗑️ <b>Bin night '+(diff===0?'tonight':'tomorrow')+':</b> '+(g('bin_bweekly')||'Red')+' + '+(alt==1?(g('bin_balt1')||'Yellow'):(g('bin_balt2')||'Green'))+' <a href="/home">change</a>';
var t=document.getElementById('today');t.parentNode.insertBefore(el,t)})();
document.getElementById('date').textContent=new Date().toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'});
(function(){var f=document.getElementById('flow'),o;try{o=JSON.parse(localStorage.getItem('order')||'null')}catch(e){}
if(o)o.forEach(function(id){var el=document.getElementById(id);if(el&&el.parentNode===f)f.appendChild(el)});
var nav=document.createElement('div');nav.className='pills';var secs=Array.prototype.filter.call(f.children,function(el){var off;try{off=localStorage.getItem('hide_'+el.id)}catch(e){}if(off){el.hidden=true;return false}return el.id!=='today'&&el.id!=='news'&&el.id!=='tonight'&&el.id!=='alerts'&&el.querySelector('h2')});
var PR=['events','bypass','memory','joy','shop','flights','lotto','puzzles','stars','sea','fuel','beaches','sport','flights','holidays','kids','council','know','tools','surfcams'];if(!o)secs.sort(function(a,b){var x=PR.indexOf(a.id),y=PR.indexOf(b.id);return (x<0?99:x)-(y<0?99:y)});
secs.forEach(function(el){el.hidden=true;el.classList.add('panel');var b=document.createElement('button');b.type='button';b.textContent=el.querySelector('h2').textContent;
try{b.style.setProperty('--pc',getComputedStyle(el).getPropertyValue('--acc'))}catch(e){}b.onclick=function(){var open=!el.hidden;secs.forEach(function(x){x.hidden=true});nav.querySelectorAll('button').forEach(function(x){x.classList.remove('on')});if(!open){el.hidden=false;b.classList.add('on');f.appendChild(el);el.scrollIntoView({behavior:'smooth',block:'start'})}};nav.appendChild(b)});
var td=document.getElementById('tonight')||document.getElementById('news')||document.getElementById('today');td.parentNode.insertBefore(nav,td.nextSibling)})();
var $=function(i,v){var e=document.getElementById(i);if(e)e.textContent=v};
var W={0:['☀️','Clear'],1:['🌤️','Mostly clear'],2:['⛅','Partly cloudy'],3:['☁️','Cloudy'],45:['🌫️','Fog'],48:['🌫️','Fog'],51:['🌦️','Drizzle'],53:['🌦️','Drizzle'],55:['🌦️','Drizzle'],61:['🌧️','Light rain'],63:['🌧️','Rain'],65:['🌧️','Heavy rain'],80:['🌦️','Showers'],81:['🌧️','Showers'],82:['⛈️','Heavy showers'],95:['⛈️','Storms'],96:['⛈️','Storms'],99:['⛈️','Storms']};
var dirs=['N','NE','E','SE','S','SW','W','NW'],tm=function(s){return new Date(s).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'})};
var age=((Date.now()-Date.UTC(2000,0,6,18,14))/864e5)%29.530588853,mi=Math.round(age/29.53*8)%8;
var MN=[['🌑','New moon'],['🌒','Waxing crescent'],['🌓','First quarter'],['🌔','Waxing gibbous'],['🌕','Full moon'],['🌖','Waning gibbous'],['🌗','Last quarter'],['🌘','Waning crescent']];
$('i-moon',MN[mi][0]);$('t-moon',MN[mi][1]);var tf=(14.765-age+29.530588853)%29.530588853,fd=Math.round(tf);$('t-moon2',(age>14&&age<15.5)?'Full moon tonight':fd<=1?'Full moon tomorrow':'Full moon in '+fd+' days');
var TIPS={},ORD=['storm','rain','hot','cold','uv','wind','nice','surf','fish'];function tip(k,h){TIPS[k]=h;document.getElementById('wxtips').innerHTML=ORD.filter(function(x){return TIPS[x]}).map(function(x){return '<li>'+TIPS[x]+'</li>'}).join('')}
var LOC=null;try{LOC=JSON.parse(localStorage.getItem('loc'))}catch(e){};var LAT=LOC?LOC[0]:${t.lat},LON=LOC?LOC[1]:${t.lon};
fetch('https://api.open-meteo.com/v1/forecast?latitude='+LAT+'&longitude='+LON+'&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max&forecast_days=1&timezone=Australia%2FSydney')
.then(function(r){return r.json()}).then(function(d){var c=d.current,y=d.daily,w=W[c.weather_code]||['🌡️',''];
$('i-wx',w[0]);$('t-temp',Math.round(c.temperature_2m)+'°');$('t-sky',w[1]+' · '+Math.round(y.temperature_2m_max[0])+'°/'+Math.round(y.temperature_2m_min[0])+'°');
$('t-rain',y.precipitation_probability_max[0]+'%');$('t-wind',Math.round(c.wind_speed_10m)+' km/h');$('t-windd','Wind from '+dirs[Math.round(c.wind_direction_10m/45)%8]);
$('t-rise',tm(y.sunrise[0]));$('t-set','Sunset '+tm(y.sunset[0]));
var rp=y.precipitation_probability_max[0],hi=y.temperature_2m_max[0],lo=y.temperature_2m_min[0],uv=y.uv_index_max?y.uv_index_max[0]:0,ws=c.wind_speed_10m,wc=c.weather_code;
if(wc>=95)tip('storm','⛈️ <b>Storms about.</b> Keep an eye on the warnings and bring the washing in.');
if(rp>=60)tip('rain','☔ <b>Take a raincoat or umbrella.</b> Rain is likely today.');else if(rp>=30)tip('rain','🌂 <b>Might rain.</b> Pop a brolly in the car just in case.');
if(hi>=32)tip('hot','🥵 <b>Hot one.</b> Drink plenty of water, and check on older neighbours.');else if(lo<=8)tip('cold','🧥 <b>Chilly start.</b> Grab a jumper for the morning.');
if(uv>=8)tip('uv','🧴 <b>UV is very high.</b> Slip, slop, slap, even if it looks cloudy.');else if(uv>=6)tip('uv','🧢 <b>UV is high.</b> Sunscreen and a hat if you’re out for long.');
if(ws>=35)tip('wind','💨 <b>Windy.</b> Tie down the trampoline and keep the bins inside.');
if(rp<20&&hi>=20&&hi<=29&&ws<25&&wc<=3)tip('nice','☀️ <b>Cracker of a day.</b> Get outside: walk, picnic or a swim between the flags.');
}).catch(function(){$('t-sky','Weather unavailable')});
fetch('https://marine-api.open-meteo.com/v1/marine?latitude=${t.mlat}&longitude=${t.mlon}&hourly=sea_level_height_msl,wave_height,swell_wave_height&forecast_days=2&timezone=Australia%2FSydney')
.then(function(r){return r.json()}).then(function(d){var h=d.hourly,s=h.sea_level_height_msl,out=[],now=Date.now();
for(var i=1;i<s.length-1;i++){if(new Date(h.time[i])<now)continue;if(s[i]>s[i-1]&&s[i]>=s[i+1])out.push(['High',h.time[i]]);else if(s[i]<s[i-1]&&s[i]<=s[i+1])out.push(['Low',h.time[i]]);if(out.length>=4)break}
var j=h.time.findIndex(function(x){return new Date(x)>=now});if(j<0)j=0;
if(out.length){$('t-tide',tm(out[0][1]));$('t-tide2','Next '+out[0][0].toLowerCase()+' tide')}
$('t-swell',(h.swell_wave_height[j]||0).toFixed(1)+' m');
var sw=h.swell_wave_height,now0=sw[j]||0,later=Math.max.apply(null,sw.slice(j+6,j+30).filter(function(x){return x!=null}).concat([0])),soon=Math.min.apply(null,sw.slice(j+6,j+30).filter(function(x){return x!=null}).concat([now0]));
if(now0>=2.5)tip('surf','🌊 <b>Big surf.</b> Experienced surfers only, and stay off the rocks.'+(soon<now0-0.6?' It eases off tomorrow.':''));
else if(now0>=1.4&&soon<now0-0.5)tip('surf','🏄 <b>Want big waves? Hurry up.</b> Good swell now, but it drops off by tomorrow.');
else if(now0<1.2&&later>=now0+0.6)tip('surf','🏄 <b>Small today, bigger tomorrow.</b> Like it small? Today’s the day. Want it big? Wait for tomorrow.');
else if(now0<0.8)tip('surf','🏖️ <b>Small surf.</b> Great for beginners, kids and swimmers. Swim between the flags.');
else tip('surf','🏄 <b>Fun-sized surf</b> around '+now0.toFixed(1)+' m. Check the banks before you paddle out.');
var hiT=out.filter(function(o){return o[0]==='High'})[0];if(hiT){var hrs=(new Date(hiT[1])-now)/36e5;if(hrs>0&&hrs<5)tip('fish','🎣 <b>Tide’s coming in.</b> High tide at '+tm(hiT[1])+'. Plenty of anglers like the run-up to the top of the tide.')}
document.getElementById('tide').innerHTML=(out.length?out.map(function(o){return o[0]+' '+tm(o[1])}).join(' · '):'Tide times unavailable')+'<br>Waves '+(h.wave_height[j]||0).toFixed(1)+' m · Swell '+(h.swell_wave_height[j]||0).toFixed(1)+' m · Moon: '+MN[mi][1];
}).catch(function(){$('tide','Tides unavailable right now.')});
</script>`, pc);
}

const LOCALS_GOAL = 15000;
// Free gift for subscribers: Maverick Digital's guide to AI in everyday life. Set the URL once the article is live.
const GIFT_URL = "";
// Free Cloudflare plans allow 1,000 storage listings a day across the whole account, so page views use a
// 10-minute memory cache and never crash if the daily allowance runs out (they show what they last knew).
const LC = new Map();
async function klist(env, prefix) {
  const hit = LC.get(prefix);
  if (hit && Date.now() - hit.at < 10 * 6e4) return hit.keys;
  try { const keys = await listAll(env, prefix); LC.set(prefix, { at: Date.now(), keys }); return keys; }
  catch (e) { return hit ? hit.keys : []; }
}
async function listAll(env, prefix) { const out = []; let cursor; do { const r = await env.DATA.list({ prefix, cursor }); out.push(...r.keys); cursor = r.list_complete ? null : r.cursor; } while (cursor); return out; }
const localsCount = async env => { const emails = new Set(); for (const pre of ["sub:", "user:"]) for (const k of await klist(env, pre)) emails.add(k.name.slice(pre.length)); return emails.size + (await klist(env, "psub:")).length; };
const rally = (n, pc) => { const pct = Math.min(100, n / LOCALS_GOAL * 100), goal = LOCALS_GOAL.toLocaleString("en-AU"); return `<section id="join" class="rally">
<h3 class="rallyh">🙏🏽 Help a brother out</h3>
<p><b>${R.code} is free, for everyone, forever.</b> Our aim: ${goal} locals signed up, ${R.goalText}. That's when a few clearly labelled local ads can cover the costs. Nobody will ever pay to be listed.</p>
<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${LOCALS_GOAL}" aria-valuenow="${n}" aria-label="Locals signed up"><span style="width:${Math.max(pct, 1).toFixed(1)}%"></span></div>
<p class="barlab mute">${n.toLocaleString("en-AU")} of ${goal} locals</p>
<p>If ${R.code} is useful to you, help us get there: get one short email a week with what's on, plus a free guide from Maverick Digital on using AI in everyday life.</p>${signup(pc)}
<p class="mute"><a href="#" onclick="event.preventDefault();var u=location.origin+'/${esc(pc)}';if(navigator.share)navigator.share({title:'${R.brand}',text:'Everything on in ${R.short}, in one place. Free.',url:u});else{navigator.clipboard&&navigator.clipboard.writeText(u);this.textContent='Link copied'}">Share ${R.code}</a> · <a href="/about">How ${R.code} stays free</a></p></section>`; };
const rallyStrip = (n) => `<a class="rallystrip mute" href="#join">Free for everyone · ${n.toLocaleString("en-AU")} of ${LOCALS_GOAL.toLocaleString("en-AU")} locals so far</a>`;
const signup = pc => `<form method="post" action="/subscribe" class="row"><input type="hidden" name="pc" value="${esc(pc)}">
<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<input type="email" name="email" placeholder="Your email" required aria-label="Your email"><button>Sign me up</button></form>
<p class="mute">By signing up you agree to get the weekly email from ${R.brand} (Maverick Digital). Unsubscribe any time. <a href="/privacy">Privacy</a></p>`;

const submitForm = pc => page("Add an event — free", `<p class="mute"><a href="/${esc(pc)}">‹ Back to ${esc(pc)}</a></p>
<h1>Add an event, free</h1><p>Nobody pays to be listed. Events are checked before they go live, usually within a day.</p>
<p class="note">💸 <b>Affordable only:</b> we list events that cost <b>$50 or less per person</b>, so there&rsquo;s always something everyone can get to.</p>
<form method="post" action="/submit"><input type="hidden" name="pc" value="${esc(pc)}"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<label>What's on *</label><input name="title" required maxlength="120" style="width:100%">
<div class="row"><div><label>Date *</label><input type="date" name="date" required min="${todayISO()}"></div><div><label>Time</label><input name="time" placeholder="7pm" maxlength="20"></div></div>
<label>Where</label><input name="venue" maxlength="120" style="width:100%">
<div class="row"><label style="display:flex;gap:6px;align-items:center"><input type="checkbox" name="kids"> Good for kids</label>
<div><label>Cost per person ($) *</label><input type="number" name="cost" min="0" max="50" step="1" required placeholder="0 = free" style="width:120px"></div></div>
<label>Link (tickets or more info)</label><input type="url" name="link" maxlength="300" style="width:100%">
<label>Short description</label><textarea name="desc" rows="3" maxlength="300"></textarea>
<label>Your email (so we can check details, never shown) *</label><input type="email" name="contact" required style="width:100%">
<p><button>Submit event</button></p></form>`, pc);

async function handleSubmit(req, env) {
  const f = await req.formData();
  if (f.get("website")) return page("Thanks", "<h1>Thanks!</h1>");
  const pc = String(f.get("pc") || R.code).slice(0, 4), date = String(f.get("date") || "");
  const link = String(f.get("link") || "");
  if (Number(f.get("cost")) > 50) return page("Over $50", `<h1>Sorry, that one&rsquo;s over our limit</h1><p>We only list events that cost <b>$50 or less per person</b>, so ${R.code} stays affordable for everyone.</p><p><a href="/submit?pc=${esc(pc)}">Add a different event</a></p>`, pc);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !f.get("title")) return page("Missing details", `<h1>Missing details</h1><p><a href="/submit?pc=${esc(pc)}">Try again</a></p>`);
  const ev = { pc, date, title: String(f.get("title")).slice(0, 120), time: String(f.get("time") || "").slice(0, 20),
    venue: String(f.get("venue") || "").slice(0, 120), link: /^https?:\/\//.test(link) ? link.slice(0, 300) : "",
    desc: String(f.get("desc") || "").slice(0, 300), contact: String(f.get("contact") || "").slice(0, 200), at: new Date().toISOString(),
    kids: !!f.get("kids"), cost: f.get("cost") === "" || f.get("cost") == null ? null : Math.max(0, Math.min(999, Math.round(+f.get("cost") || 0))) };
  const id = crypto.randomUUID().slice(0, 8);
  await env.DATA.put(`pending:${pc}:${date}:${id}`, JSON.stringify(ev));
  return page("Thanks", `<h1>Thanks, it's in!</h1><p>We'll check it and it'll appear on <a href="/${esc(pc)}">${esc(pc)}</a> soon.</p>`, pc);
}

async function handleSubscribe(req, env) {
  const f = await req.formData();
  const pc = String(f.get("pc") || R.code).slice(0, 4), email = String(f.get("email") || "").trim().toLowerCase();
  if (!f.get("website") && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    await env.DATA.put(`sub:${email}`, JSON.stringify({ email, pc, consent: true, at: new Date().toISOString() }));
  return page("You're in", `<h1>You're in!</h1><p>Thanks for helping a brother out. Watch for "This week in ${esc(pc)}".</p>
<p class="note">🎁 ${GIFT_URL ? `Your free guide: <a href="${GIFT_URL}" rel="noopener"><b>how AI can help in your everyday life</b></a>, from Maverick Digital.` : `Your free guide from Maverick Digital, <b>how AI can help in your everyday life</b>, arrives with your first weekly email.`}</p><p><a href="/${esc(pc)}">Back to ${esc(pc)}</a></p>`, pc);
}

async function admin(req, env) {
  if (!env.ADMIN_KEY) return page("Admin", "<h1>Admin not set up</h1><p>Add an ADMIN_KEY secret in Cloudflare.</p>");
  const login = `<form method="post"><input type="password" name="key" placeholder="Admin key" required><button>Log in</button></form>`;
  if (req.method !== "POST") return page("Admin", `<h1>Admin</h1>${login}`);
  const f = await req.formData();
  if (f.get("key") !== env.ADMIN_KEY) return page("Admin", `<h1>Admin</h1><p>Wrong key.</p>${login}`);
  const act = f.get("act"), k = String(f.get("k") || "");
  if (act === "vadd" || act === "vdel") {
    const L = (await env.DATA.get("vsrc:list", "json")) || [], u = String(f.get("vurl") || "").trim();
    if (act === "vadd" && /^https:\/\//.test(u) && !L.some(x => x.url === u)) L.push({ name: String(f.get("vname") || u).slice(0, 60), url: u.slice(0, 300), venue: String(f.get("vname") || "").slice(0, 60) || undefined });
    await env.DATA.put("vsrc:list", JSON.stringify(act === "vdel" ? L.filter(x => x.url !== u) : L));
  }
  if (act === "export") {
    const rows = new Map();
    for (const { name } of await listAll(env, "user:")) { const u = await env.DATA.get(name, "json"); if (u) rows.set(u.email, { ...u, weekly: "no" }); }
    for (const { name } of await listAll(env, "sub:")) { const v = await env.DATA.get(name, "json"); if (v) rows.set(v.email, { ...(rows.get(v.email) || { email: v.email, name: v.name || "", via: v.source || "email", first: v.at }), weekly: "yes", pc: v.pc }); }
    const q = x => `"${String(x ?? "").replace(/"/g, '""')}"`;
    const csv = ["email,name,signed_in_with,postcode,weekly_email,first_seen,last_seen,visits", ...[...rows.values()].map(r => [r.email, r.name, r.via, r.pc || R.code, r.weekly, r.first, r.last, r.visits].map(q).join(","))].join("\n");
    return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${R.code}-people-${todayISO()}.csv"` } });
  }
  if (act === "alert" && f.get("text")) await sendAlert(env, String(f.get("topic")) === "alerts" ? "alerts" : "fields", String(f.get("topic")) === "alerts" ? `${R.code} alert` : "Field closure update", String(f.get("text")).slice(0, 160), String(f.get("topic")) === "alerts" ? "/2450#alerts" : "/2450#sport");
  if (act === "announce" && f.get("text")) { const l = String(f.get("link") || ""); await env.DATA.put(`ann:${new Date().toISOString()}`, JSON.stringify({ text: String(f.get("text")).slice(0, 200), link: /^\/|^https?:\/\//.test(l) ? l.slice(0, 300) : "", at: new Date().toISOString() })); }
  if (k.startsWith("ann:") && act === "remove") await env.DATA.delete(k);
  if (k.startsWith("ipending:")) {
    if (act === "approve") { const v = await env.DATA.get(k); if (v) await env.DATA.put("idea:" + k.slice(9), v); }
    await env.DATA.delete(k);
  }
  if (k.startsWith("idea:") && (act === "building" || act === "done" || act === "open" || act === "remove")) {
    const v = await env.DATA.get(k, "json"); if (v) act === "remove" ? await env.DATA.delete(k) : await env.DATA.put(k, JSON.stringify({ ...v, status: act }));
    if (v && act === "done" && v.status !== "done") await env.DATA.put(`ann:${new Date().toISOString()}`, JSON.stringify({ text: `You voted, we built it: ${v.text}`, votes: v.votes, link: String(f.get("link") || ""), at: new Date().toISOString() }));
  }
  if (k.startsWith("npending:")) {
    const v = await env.DATA.get(k, "json");
    if (v && act === "approve") { await env.DATA.put("notice:" + k.slice(9), JSON.stringify({ ...v, at: new Date().toISOString() })); await sendAlert(env, "n_" + v.cat, "New notice: " + NCATS[v.cat].replace(/^\S+ /, ""), v.title, "/notices"); }
    await env.DATA.delete(k);
  }
  if (k.startsWith("notice:") && act === "remove") await env.DATA.delete(k);
  if (k.startsWith("jpending:")) {
    if (act === "approve") { const v = await env.DATA.get(k); if (v) { await env.DATA.put("joy:" + k.slice(9), v); LC.delete("joy:"); } }
    await env.DATA.delete(k);
  }
  if (k.startsWith("joy:") && act === "remove") { await env.DATA.delete(k); LC.delete("joy:"); }
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
  let jl = "";
  for (const { name } of (await env.DATA.list({ prefix: "jpending:" })).keys) { const n = await env.DATA.get(name, "json"); if (n) jl += `${joyItem(n).replace("</li>", "")}<br><span class="mute">from ${esc(n.contact)}</span><br>${btnB("approve", "Approve", name)} ${btnB("delete", "Delete", name)}</li>`; }
  let rl = "";
  for (const { name } of (await env.DATA.list({ prefix: "rpending:" })).keys) { const n = await env.DATA.get(name, "json"); if (n) rl += `${ripItem(n).replace("</li>", "")}<br><span class="mute">from ${esc(n.contact)}. Check with the funeral home first</span><br>${btnB("approve", "Approve", name)} ${btnB("delete", "Delete", name)}</li>`; }
  let il = "";
  for (const { name } of (await env.DATA.list({ prefix: "ipending:" })).keys) { const i = await env.DATA.get(name, "json"); if (i) il += `<li>${esc(i.text)}<br>${btnB("approve", "Approve for voting", name)} ${btnB("delete", "Delete", name)}</li>`; }
  const board = (await ideas(env)).map(i => `<li>👍 ${i.votes} · ${esc(i.text)} ${STATUS[i.status] || ""}<br>${btnB("building", "Building", "idea:" + i.id)} ${btnB("done", "Done", "idea:" + i.id)} ${btnB("open", "Reopen", "idea:" + i.id)} ${btnB("remove", "Remove", "idea:" + i.id)}</li>`).join("");
  return page("Admin", `<h1>Admin</h1><p>${subs} email subscribers.</p>
<h2>👍 Was this useful?</h2><ul>${(await Promise.all((await listAll(env, "rate:")).map(async k => [k.name.slice(5), await env.DATA.get(k.name, "json")]))).filter(x => x[1]).sort((a, b) => (b[1].up + b[1].down) - (a[1].up + a[1].down)).map(([pg, c]) => `<li>${esc(pg)}: 👍 ${c.up} · 👎 ${c.down}</li>`).join("") || "<li class=mute>No votes yet.</li>"}</ul>
<h2>📅 Venue pages we read</h2><p class="mute">Add a pub, club or market's own "what's on" or "specials" page. We read it twice a day.</p><ul>${(await Promise.all((await venueSources(env)).map(async v => { const d = await env.DATA.get(vkey(v.url), "json"); return `<li>${esc(v.name)} · ${d ? `${d.items.length} items${d.asof ? ", updated " + esc(asOf(d.asof)) : ""}` : "not read yet"} <a href="${esc(v.url)}" rel="noopener">page</a>${(R.venues || []).some(x => x.url === v.url) ? "" : ` <form method="post" style="display:inline"><input type="hidden" name="key" value="${key}"><input type="hidden" name="act" value="vdel"><input type="hidden" name="vurl" value="${esc(v.url)}"><button>Remove</button></form>`}</li>`; }))).join("")}</ul>
<form method="post"><input type="hidden" name="key" value="${key}"><input type="hidden" name="act" value="vadd"><input name="vname" placeholder="Venue name" maxlength="60"> <input name="vurl" type="url" placeholder="https://… their what's on page" required style="width:100%"> <button>Add venue page</button></form>
<h2>📮 Postcode requests</h2><ul>${(await Promise.all((await listAll(env, "pcsug:")).map(k => env.DATA.get(k.name, "json")))).filter(Boolean).sort((a, b) => b.count - a.count).map(x => `<li><b>${esc(x.pc)}</b> ${esc(x.towns.join(", "))} · asked ${x.count}× · ${x.emails.length} emails${x.notes.length ? `<br><span class="mute">${esc(x.notes.join(" | "))}</span>` : ""}</li>`).join("") || "<li class=mute>None yet.</li>"}</ul>
<h2>👥 People</h2><p>${(await listAll(env, "user:")).length} signed in · ${(await listAll(env, "sub:")).length} on the weekly email · ${await localsCount(env)} locals in total.</p><form method="post"><input type="hidden" name="key" value="${esc(String(f.get("key")))}"><input type="hidden" name="act" value="export"><button>Download people (CSV)</button></form>
<h2>🔔 Send a phone alert</h2><p class="mute">Goes to everyone who turned on alerts. ${(await env.DATA.list({ prefix: "psub:" })).keys.length} phones signed up.</p>
<form method="post"><input type="hidden" name="key" value="${key}"><input type="hidden" name="act" value="alert"><input name="text" maxlength="160" placeholder="e.g. All fields closed tonight due to rain" style="width:100%" required>
<div class="row"><select name="topic"><option value="fields">Field closures</option><option value="alerts">General alert</option></select><button>Send alert</button></div></form>
<h2>📣 Announce a new feature</h2><p class="mute">Marking a voted idea Done announces it automatically. Use this for anything else.</p>
<form method="post"><input type="hidden" name="key" value="${key}"><input type="hidden" name="act" value="announce"><input name="text" maxlength="200" placeholder="e.g. Fuel prices are live!" style="width:100%" required><div class="row"><input name="link" placeholder="Link, e.g. /${R.code} (optional)"><button>Announce</button></div></form>
<ul>${(await announcements(env)).slice(0, 5).map(a => `<li>${esc(a.text)} <span class="mute">${esc(a.at.slice(0, 10))}</span> ${btnB("remove", "Remove", a.id)}</li>`).join("")}</ul><h2>Ideas waiting</h2><ul>${il || "<li>None</li>"}</ul><h2>Idea board (most votes first)</h2><ul>${board || "<li>None</li>"}</ul><h2>Community notices waiting</h2><ul>${await (async () => { let h = ""; for (const { name } of (await env.DATA.list({ prefix: "npending:" })).keys) { const n = await env.DATA.get(name, "json"); if (n) h += `${noticeItem(n).replace("</li>", "")}<span class="mute">from ${esc(n.contact)}</span><br>${btnB("approve", "Approve and alert", name)} ${btnB("delete", "Delete", name)}</li>`; } return h || "<li>None</li>"; })()}</ul><h2>In memory notices waiting</h2><ul>${rl || "<li>None</li>"}</ul><h2>Births &amp; marriages waiting</h2><ul>${jl || "<li>None</li>"}</ul><h2>Birthday offers waiting</h2><ul>${bl || "<li>None</li>"}</ul><h2>Latest feedback</h2><ul>${fbl || "<li>None</li>"}</ul><h2>Events waiting (${keys.length})</h2><ul>${rows || "<li>None</li>"}</ul>`);
}

const about = async env => { const n = await localsCount(env), locals = n >= 10 ? `We're at <b>${n.toLocaleString("en-AU")}</b> so far. Every share helps.` : "We're just getting started, so every share helps."; return page("Nobody pays to be here", `<p class="mute"><a href="/">‹ ${R.code}</a></p><h1>Nobody pays to be here.</h1>
<p>Every event, business and listing on this site is here because it's happening in your community, not because anyone paid for it.</p>
<p><b>This site will never charge you.</b> Not now, not ever. No paywalls, no subscriptions, no fees to list your event, club or notice. That's the deal, and it's written into <a href="/charter">our charter</a>.</p>
<h2>How we'll keep the lights on</h2><p>Our goal is to reach as many locals as a local weekly paper: about <b>15,000 people</b>. ${locals}</p>
<p>When we get there, local businesses will be able to reach that audience through a few ads in our <b>email</b>, and only there. <b>This site stays ad-free.</b> The ads will be <b>selective</b> (local and relevant to you), <b>fairly priced</b> and <b>clearly labelled</b>. Advertisers never get your name or email address, and we never sell your details.</p>
<p>We're not here to build an empire off our community. Just to make a fair living doing something genuinely useful for it.</p>
<p><i>Global vision, local thinking.</i> The ${R.code} Gazette is <a href="https://maverickdigital.com.ai">Maverick Digital</a>'s motto in action.</p>
<p>Big tech divided us. The ${R.code} Gazette brings communities back together.</p><p>A free gift to the community from <a href="https://maverickdigital.com.ai">Maverick Digital</a>.<br><i>${R.sign}</i></p>
<h2>Your privacy</h2><p>Most of your settings live on your own phone, not with us. Read the <a href="/privacy">privacy policy</a>, in plain English.</p>`); };

const ICON = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#0B1526"/><text x="256" y="300" font-family="Arial,sans-serif" font-size="150" font-weight="bold" fill="#fff" text-anchor="middle">${R.code}</text></svg>`;
const MANIFEST = () => JSON.stringify({ name: R.brand, short_name: R.code, start_url: "/", display: "standalone", background_color: "#ffffff", theme_color: "#0B1526",
  icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }] });
const SW = () => `self.addEventListener('push',e=>{e.waitUntil(fetch('/api/alert').then(r=>r.json()).then(a=>self.registration.showNotification(a.title,{body:a.body,icon:'/icon.svg',data:a.url||'/${R.code}'})))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.openWindow(e.notification.data||'/${R.code}'))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open('v1').then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)))})`;


// ---- What's in your fridge? (members only: unlock with email) ----
const cookie = (req, k) => (req.headers.get("cookie") || "").split(/;\s*/).map(c => c.split("=")).find(([n]) => n === k)?.[1];
async function member(req, env) { const t = cookie(req, "m2450"); return t ? await env.DATA.get(`sess:${t}`) : null; }

// ---- Sign in: Google (one tap for most locals) or email. Builds the 2450 people list.
// Secrets on this Worker: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET. Google redirect URI: https://2450-maverick.live/auth/google/callback
const safeNext = n => (typeof n === "string" && /^\/(?!\/)[\w\-\/?=&#.%]*$/.test(n) ? n : "/");
function sessionHeaders(tok, name, next) {
  const h = new Headers({ location: next });
  h.append("set-cookie", `m2450=${tok}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`);
  h.append("set-cookie", `m2450n=${encodeURIComponent(name || "Local")}; Path=/; Max-Age=31536000; Secure; SameSite=Lax`);
  return h;
}
const signinPage = (env, next = "/", msg = "") => page(`Sign in to ${R.code}`, `<h1>Sign in to your ${R.code}</h1>
<p>Free, forever. Sign in so your ${R.code} knows you on any phone, unlocks the fridge, and you're counted as one of the locals helping a brother out.</p>${msg}
${env.GOOGLE_CLIENT_ID ? `<p><a class="gbtn" href="/auth/google?next=${encodeURIComponent(next)}"><svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg> Continue with Google</a></p><p class="mute">— or use your email —</p>` : ""}
<form method="post" action="/unlock"><input type="hidden" name="next" value="${esc(next)}"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<div class="row"><input name="name" placeholder="First name" maxlength="40"><input type="email" name="email" placeholder="Your email" required></div>
<label class="mute"><input type="checkbox" name="consent" required> Yes, send me the weekly email from ${R.brand} (Maverick Digital), plus the free AI guide. Unsubscribe any time.</label>
<p><button>Sign me in</button></p></form><p class="mute">We only keep your name, email and photo (if you use Google). <a href="/privacy">Privacy</a></p>`);

function startGoogle(url, env) {
  if (!env.GOOGLE_CLIENT_ID) return Response.redirect(url.origin + "/signin", 302);
  const state = crypto.randomUUID(), next = safeNext(url.searchParams.get("next") || "/");
  const to = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, redirect_uri: `${url.origin}/auth/google/callback`, response_type: "code", scope: "openid email profile", state, prompt: "select_account" });
  const h = new Headers({ location: to });
  h.append("set-cookie", `g2450s=${state}.${encodeURIComponent(next)}; Path=/auth; Max-Age=600; HttpOnly; Secure; SameSite=Lax`);
  return new Response(null, { status: 302, headers: h });
}

async function finishGoogle(req, url, env) {
  const raw = cookie(req, "g2450s") || "", [state, nextEnc] = [raw.split(".")[0], raw.split(".").slice(1).join(".")], next = safeNext(decodeURIComponent(nextEnc || "%2F"));
  const fail = msg => signinPage(env, next, `<p class="note">${msg}</p>`);
  if (!state || state !== url.searchParams.get("state") || !url.searchParams.get("code")) return fail("That sign-in didn't go through. Please try again.");
  const tr = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code: url.searchParams.get("code"), client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET || "", redirect_uri: `${url.origin}/auth/google/callback`, grant_type: "authorization_code" }) });
  const tj = await tr.json().catch(() => ({}));
  if (!tj.id_token) return fail("Google didn't let that sign-in through. Please try again.");
  let c; try { c = JSON.parse(atob(tj.id_token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))); } catch { return fail("Something went wrong. Please try again."); }
  const email = String(c.email || "").toLowerCase();
  if (!email || c.email_verified === false || c.aud !== env.GOOGLE_CLIENT_ID) return fail("We couldn't confirm that Google account. Please try again.");
  const name = String(c.given_name || c.name || "").slice(0, 40), now = new Date().toISOString();
  const prev = await env.DATA.get(`user:${email}`, "json");
  await env.DATA.put(`user:${email}`, JSON.stringify({ email, name, fullName: String(c.name || "").slice(0, 80), picture: c.picture || "", via: "google", first: prev?.first || now, last: now, visits: (prev?.visits || 0) + 1 }));
  const tok = crypto.randomUUID();
  await env.DATA.put(`sess:${tok}`, email, { expirationTtl: 31536000 });
  const subbed = await env.DATA.get(`sub:${email}`);
  const h = sessionHeaders(tok, name, subbed ? next : `/welcome?next=${encodeURIComponent(next)}`);
  h.append("set-cookie", "g2450s=; Path=/auth; Max-Age=0; Secure; SameSite=Lax");
  return new Response(null, { status: 302, headers: h });
}

const welcomePage = (url) => { const next = safeNext(url.searchParams.get("next") || "/"); return page(`Welcome to ${R.code}`, `<h1>You're in! 👋</h1>
<p>Thanks for helping a brother out. You're now one of the locals.</p>
<div class="rally"><p><b>One more tap?</b> Get "This week in ${R.code}" (one short email a week) plus the free guide from Maverick Digital on how AI can help in your everyday life.</p>
<form method="post" action="/optin"><input type="hidden" name="next" value="${esc(next)}"><button>Yes please</button> <a href="${esc(next)}" class="mute" style="margin-left:12px">Not now</a></form>
<p class="mute">Unsubscribe any time. <a href="/privacy">Privacy</a></p></div>`); };

async function optin(req, env) {
  const f = await req.formData(), next = safeNext(String(f.get("next") || "/")), email = await member(req, env);
  if (email) { const u = await env.DATA.get(`user:${email}`, "json"); await env.DATA.put(`sub:${email}`, JSON.stringify({ email, name: u?.name || "", pc: R.code, consent: true, source: "google", at: new Date().toISOString() })); }
  return new Response(null, { status: 303, headers: { location: next } });
}

async function signout(req, env) {
  const t = cookie(req, "m2450"); if (t) await env.DATA.delete(`sess:${t}`);
  const h = new Headers({ location: "/" });
  h.append("set-cookie", "m2450=; Path=/; Max-Age=0; Secure; SameSite=Lax");
  h.append("set-cookie", "m2450n=; Path=/; Max-Age=0; Secure; SameSite=Lax");
  return new Response(null, { status: 303, headers: h });
}

const FOODS = ["chicken","beef mince","sausages","steak","bacon","ham","fish","prawns","eggs","cheese","milk","cream","butter","yoghurt","tofu",
  "potatoes","onion","garlic","carrots","broccoli","spinach","capsicum","mushrooms","zucchini","tomatoes","lettuce","avocado","pumpkin","lemon",
  "rice","pasta","noodles","bread","wraps","tinned tomatoes","chickpeas","beans","coconut milk","curry paste","pesto"];

const unlockPage = (msg = "") => page("What's in your fridge?", `<h1>🧊 What's in your fridge?</h1>
<p>Tell us what you've got, how many you're feeding and what you like. Get dinner ideas in seconds, with links to the recipes.</p>
<p><b>Free for ${R.code} members.</b> Pop in your email to unlock it (and get the weekly "This week in ${R.code}" email).</p>${msg}
<form method="post" action="/unlock"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<div class="row"><input name="name" placeholder="First name" maxlength="40"><input type="email" name="email" placeholder="Your email" required></div>
<label class="mute"><input type="checkbox" name="consent" required> Yes, send me the weekly email from ${R.brand} (Maverick Digital). Unsubscribe any time.</label>
<p><button>Unlock the fridge</button></p></form>`);

// Photo of the fridge -> list of foods. Uses Cloudflare's free AI allowance; the photo is never stored.
async function fridgePhoto(req, env) {
  if (!(await member(req, env))) return Response.json({ error: "Sign in to use the fridge." }, { status: 401 });
  const buf = await req.arrayBuffer();
  if (!buf.byteLength || buf.byteLength > 2e6) return Response.json({ error: "That photo's too big. Try again." }, { status: 400 });
  const ask = { messages: [{ role: "user", content: "List the food and drink items you can see in this fridge or pantry photo. Reply with ONLY a comma-separated list of short, simple ingredient names in lowercase (e.g. eggs, milk, cheese, carrots). No other words." }], image: [...new Uint8Array(buf)], max_tokens: 200 };
  const model = "@cf/meta/llama-3.2-11b-vision-instruct";
  let out;
  try { out = await env.AI.run(model, ask); }
  catch (e) { if (/agree/i.test(String(e))) { await env.AI.run(model, { prompt: "agree" }); out = await env.AI.run(model, ask); } else throw e; }
  const items = [...new Set(String(out?.response || "").toLowerCase().replace(/\.$/, "").split(/,|\n/).map(x => x.replace(/^[\s\-*\d.]+/, "").trim()).filter(x => x && x.length < 30 && !/sorry|can't|cannot|image/.test(x)))].slice(0, 25);
  return Response.json({ items });
}

async function unlock(req, env) {
  const f = await req.formData(), email = String(f.get("email") || "").trim().toLowerCase();
  if (f.get("website")) return unlockPage();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !f.get("consent")) return unlockPage(`<p class="note">Please add your email and tick the box.</p>`);
  const name = String(f.get("name") || "").slice(0, 40), tok = crypto.randomUUID();
  await env.DATA.put(`sub:${email}`, JSON.stringify({ email, name, pc: R.code, consent: true, source: "fridge", at: new Date().toISOString() }));
  await env.DATA.put(`sess:${tok}`, email, { expirationTtl: 31536000 });
  const prev = await env.DATA.get(`user:${email}`, "json"), now = new Date().toISOString();
  await env.DATA.put(`user:${email}`, JSON.stringify({ ...(prev || {}), email, name: name || prev?.name || "", via: prev?.via || "email", first: prev?.first || now, last: now, visits: (prev?.visits || 0) + 1 }));
  return new Response(null, { status: 303, headers: sessionHeaders(tok, name, f.get("next") ? safeNext(String(f.get("next"))) : "/fridge") });
}

const fridgePage = () => page("What's in your fridge?", `<h1>🧊 What's in your fridge?</h1>
<div class="note">📸 <b>Snap your fridge</b> and we&rsquo;ll tick what we can see. <label class="snap"><input type="file" id="snap" accept="image/*" capture="environment" hidden><span>Take a photo</span></label><br><small class="mute" id="snapmsg">Your photo is only used to spot the food, then thrown away. We never keep it.</small></div>
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
document.getElementById('snap').onchange=function(){var f=this.files[0],m=document.getElementById('snapmsg');if(!f)return;m.textContent='Having a look in your fridge…';
var img=new Image();img.onload=function(){var k=Math.min(1,768/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=img.width*k;c.height=img.height*k;c.getContext('2d').drawImage(img,0,0,c.width,c.height);
c.toBlob(function(b){fetch('/api/fridge-photo',{method:'POST',body:b,headers:{'content-type':'image/jpeg'}}).then(function(r){return r.json()}).then(function(j){if(!j.items||!j.items.length){m.textContent=j.error||'Couldn’t spot much. Try a brighter photo, or tick below.';return}
var extra=[],n=0;j.items.forEach(function(it){var hit=[].slice.call(document.querySelectorAll('#ff input[name=i]')).filter(function(x){return it.indexOf(x.value)>-1||x.value.indexOf(it)>-1})[0];if(hit){if(!hit.checked){hit.checked=true;n++}}else extra.push(it)});
var ex=document.querySelector('#ff input[name=extra]');if(extra.length)ex.value=(ex.value?ex.value+', ':'')+extra.join(', ');m.textContent='Spotted: '+j.items.join(', ')+'. Check the ticks, then pick dinner below.'}).catch(function(){m.textContent='That didn’t work. Tick what you’ve got below.'})},'image/jpeg',0.7)};img.src=URL.createObjectURL(f)};
document.getElementById('ff').onsubmit=function(e){e.preventDefault();var f=new FormData(this),have=f.getAll('i').concat(String(f.get('extra')||'').toLowerCase().split(/,\\s*/).filter(Boolean)),
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
const schoolPage = () => { const t = TOWNS[R.code]; return page("School run report", `<p class="mute"><a href="/${R.code}">‹ ${R.code} ${R.place}</a></p>
<h1>🚸 School run report</h1><p>Pick your school once and this page becomes your morning and afternoon check before the school run.</p>
<label>Your school</label><select id="sch" style="width:100%"><option value="">Choose…</option>${SCHOOLS.map(x => `<option>${esc(x)}</option>`).join("")}</select>
<p class="mute">Saved on your phone only. <a href="#" class="useloc">📍 Use my location</a> for weather where you are.</p>
<div id="rep" hidden>
<div class="tiles"><div class="tile"><span class="ico">🌅</span><b id="am">–</b><small>Drop-off weather</small></div>
<div class="tile"><span class="ico">🏫</span><b id="pm">–</b><small>Pick-up weather</small></div>
<div class="tile"><span class="ico">🚸</span><b>8–9:30am</b><small>School zone 40 km/h</small></div>
<div class="tile"><span class="ico">🚸</span><b>2:30–4pm</b><small>School zone 40 km/h</small></div></div>
<p id="tip" class="note"></p>
<h2>On your route</h2><p class="mute">Crashes, roadworks and closures near <span id="sn"></span>, coming soon. For now: <a href="https://www.livetraffic.com" rel="noopener">Live Traffic NSW</a>.</p>
<h2>School holidays</h2>${schoolHols()}<p class="mute">Pupil-free days vary by school: check your school's newsletter. Info from <a href="https://education.nsw.gov.au/schooling/calendar" rel="noopener">NSW Department of Education</a>.</p>
<h2>Field closures &amp; weekend sport</h2><p class="mute">Wet-weather field closures and local junior sport fixtures, coming soon. Clubs will be able to post closures here free. For now: <a href="${R.council.url}" rel="noopener">${R.council.name}</a>.</p>
<h2>Bell times</h2><p class="mute">Your school's own bell times, coming soon. Check the school newsletter or website for now.</p></div>
<script>
var sel=document.getElementById('sch');try{sel.value=localStorage.getItem('school')||''}catch(e){}
function show(){var v=sel.value;try{v?localStorage.setItem('school',v):localStorage.removeItem('school')}catch(e){}
document.getElementById('rep').hidden=!v;document.getElementById('sn').textContent=v;if(!v)return;
var LOC=null;try{LOC=JSON.parse(localStorage.getItem('loc'))}catch(e){};var LAT=LOC?LOC[0]:${t.lat},LON=LOC?LOC[1]:${t.lon};
fetch('https://api.open-meteo.com/v1/forecast?latitude='+LAT+'&longitude='+LON+'&hourly=temperature_2m,precipitation_probability&forecast_days=1&timezone=Australia%2FSydney')
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
</script>`, R.code); };

// ---- Feedback: saved, then emailed to Brad ----
const GOAL = 30, STATUS = { open: "", building: "🔨 Being built", done: "✅ Done" };
async function ideas(env) {
  const out = [];
  for (const { name } of await klist(env, "idea:")) { const i = await env.DATA.get(name, "json"); if (i) out.push({ id: name.slice(5), ...i }); }
  return out.sort((a, b) => (a.status === "done") - (b.status === "done") || b.votes - a.votes);
}
const ideaItem = i => `<li class="idea"><button type="button" class="vote" data-id="${esc(i.id)}"${i.status === "done" ? " disabled" : ""}>👍 <b>${i.votes}</b></button>
<div><span>${esc(i.text)}</span>${STATUS[i.status] ? ` <span class="tagg">${STATUS[i.status]}</span>` : ""}
<div class="bar"><i style="width:${Math.min(100, Math.round(i.votes / GOAL * 100))}%"></i></div><small class="mute">${i.votes >= GOAL ? "🎉 Hit " + GOAL + " votes. On the build list!" : (GOAL - i.votes) + " more votes to get it built"}</small></div></li>`;
const feedbackPage = async (env, msg = "") => { const list = await ideas(env); return page(`Make ${R.code} better`, `<h1>💬 Make ${R.code} better</h1>
<p>${R.code} is built by the community. Suggest an idea or vote for one you like. When an idea hits <b>${GOAL} votes</b>, it goes on the build list.</p>${msg}
<h2>Ideas from locals</h2><ul class="ideas">${list.map(ideaItem).join("") || '<li class="mute">No ideas yet. Be the first!</li>'}</ul>
<h2>Suggest something</h2><p class="mute">Ideas are checked, then added to the list above for voting. Everything else comes straight to the team.</p>
<form method="post" action="/feedback"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<label>What's it about?</label><select name="kind" style="width:100%"><option>An idea for the site</option><option>Something's wrong or out of date</option><option>Add my club, group or event source</option><option>Just saying g'day</option></select>
<label>Your message *</label><textarea name="msg" rows="5" maxlength="2000" required></textarea>
<div class="row"><input name="name" placeholder="Name (optional)" maxlength="60"><input type="email" name="email" placeholder="Email if you'd like a reply" maxlength="120"></div>
<p><button>Send</button></p></form>
<script>
var voted;try{voted=JSON.parse(localStorage.getItem('voted')||'[]')}catch(e){voted=[]}
document.querySelectorAll('.vote').forEach(function(b){if(voted.indexOf(b.dataset.id)>-1)b.classList.add('on');
b.onclick=function(){if(b.classList.contains('on'))return;b.disabled=true;fetch('/vote',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:b.dataset.id})})
.then(function(r){return r.json()}).then(function(j){if(j.votes!=null)b.querySelector('b').textContent=j.votes;b.classList.add('on');voted.push(b.dataset.id);try{localStorage.setItem('voted',JSON.stringify(voted))}catch(e){}}).catch(function(){}).then(function(){b.disabled=false})}});
</script>`); };

async function vote(req, env) {
  let id = ""; try { id = String((await req.json()).id || "").slice(0, 20); } catch (e) {}
  const i = await env.DATA.get("idea:" + id, "json"); if (!i) return Response.json({ error: "not found" }, { status: 404 });
  const ip = req.headers.get("cf-connecting-ip") || "x", h = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip + id)))].slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("");
  if (await env.DATA.get(`vote:${id}:${h}`)) return Response.json({ votes: i.votes, already: true });
  await env.DATA.put(`vote:${id}:${h}`, "1"); i.votes++; await env.DATA.put("idea:" + id, JSON.stringify(i));
  return Response.json({ votes: i.votes });
}

async function feedback(req, env, ctx) {
  const f = await req.formData();
  if (f.get("website")) return feedbackPage(env, `<p class="note">Thanks!</p>`);
  const fb = { kind: String(f.get("kind") || "").slice(0, 60), msg: String(f.get("msg") || "").slice(0, 2000),
    name: String(f.get("name") || "").slice(0, 60), email: String(f.get("email") || "").slice(0, 120), at: new Date().toISOString() };
  if (!fb.msg.trim()) return feedbackPage(env, `<p class="note">Please add a message.</p>`);
  await env.DATA.put(`fb:${fb.at}:${crypto.randomUUID().slice(0, 6)}`, JSON.stringify(fb));
  if (fb.kind.startsWith("An idea")) await env.DATA.put(`ipending:${crypto.randomUUID().slice(0, 8)}`, JSON.stringify({ text: fb.msg.slice(0, 280), votes: 0, status: "open", at: fb.at }));
  mailUs(env, ctx, `${R.code} feedback: ${fb.kind}`, `${fb.kind}\n\n${fb.msg}\n\nFrom: ${fb.name || "(no name)"} ${fb.email || "(no email)"}\n${fb.at}`, fb.email);
  return feedbackPage(env, `<p class="note">Thanks${fb.name ? ", " + esc(fb.name) : ""}! It's on its way to us.${fb.kind.startsWith("An idea") ? " Once it's checked it'll appear in the list for voting." : ""}</p>`);
}

// ---- Birthday deals (birthday saved on the phone only; offers lodged by businesses, approved in admin) ----
const WHEN = { day: "On your birthday", week: "Your birthday week", month: "Your birthday month" };
const offerItem = o => `<li><b>${esc(o.biz)}</b>: ${esc(o.offer)}<br><span class="mute">${esc(WHEN[o.when] || "")}${o.cond ? " · " + esc(o.cond) : ""} · Say <span class="say">&ldquo;Maverick&rdquo;</span> when you redeem</span></li>`;
async function birthdayPage(env, msg = "") {
  const offers = [];
  for (const { name } of await klist(env, "bday:")) { const o = await env.DATA.get(name, "json"); if (o) offers.push(o); }
  offers.sort((a, b) => a.biz.localeCompare(b.biz));
  return page(`Birthday deals in ${R.code}`, `<p class="mute"><a href="/${R.code}">‹ ${R.code} ${R.place}</a></p><h1>🎂 Birthday deals</h1>
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
</script>`, R.code);
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
const charter = () => page("Our charter", `<p class="mute"><a href="/">${R.brand}</a></p><h1>Our charter</h1>
<p class="mute">Our terms, in plain English. Last updated ${UPDATED}.</p>
<h2>1. Free for locals, forever</h2><p>${R.brand} will never charge you to use it. No paywalls, no subscriptions, and no fees to list an event, club, notice or offer. It's run by <a href="https://maverickdigital.com.ai">Maverick Digital</a> as a free gift to the community.</p>
<h2>2. Nobody pays to be listed</h2><p>Every event, offer and listing is here because it's happening locally, never because someone paid. We don't sell placement, rankings or reviews.</p>
<h2>2a. Advertising, one day</h2><p>Once we reach about 15,000 locals, we'll sell a small number of advertising spots so the site can pay its way. Ads will be clearly labelled, kept separate from listings, selective, fairly priced and never packed in. Advertisers never get your personal details.</p>
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

const privacy = () => page("Privacy policy", `<p class="mute"><a href="/">${R.brand}</a></p><h1>Privacy policy</h1>
<p class="mute">Plain English. Last updated ${UPDATED}.</p>
<p>We collect as little as we can, we never sell it, and we follow the Australian Privacy Principles.</p>
<h2>Kept on your phone, not with us</h2><p>If you tap &ldquo;Use my location&rdquo;, it's rounded to about a kilometre and saved on your phone. It's used for your weather and to find fuel near you, never stored by us, and you can reset it any time. Your postcode, which sections you show or hide, your school and your birthday (day and month only) are saved in your own browser. We never see them. Clear your browser data and they're gone.</p>
<h2>What we do keep</h2><ul>
<li><b>Weekly email or fridge sign-up:</b> your email, first name if you give it, postcode and that you agreed to the email.</li>
<li><b>Events and birthday offers:</b> what you submit, plus a contact email so we can check details. The email is never shown publicly.</li>
<li><b>Feedback:</b> your message, and your name and email only if you add them.</li>
<li><b>Fridge photo:</b> if you snap your fridge, the photo goes to Cloudflare&rsquo;s AI just long enough to spot the food, then it&rsquo;s gone. We never store it.</li>
<li><b>Signing in:</b> your name, email and, if you use Google, your Google profile photo, plus when you first and last signed in. Google only tells us those basics, never your password. One cookie keeps you signed in on that phone for up to a year. Sign out any time.</li></ul>
<p>We don't ask for anything about your family or personal life beyond the basic contact details needed to make the site work.</p>
<h2>How we use it</h2><p>To run the site, send the email you asked for, check submissions and reply to you. Your details may be used to tell you about Maverick Digital in the weekly email, which you can stop any time. We never sell, rent or trade your details, and when we carry ads one day, advertisers will never get your personal details or use them to target you.</p>
<h2>Who else is involved</h2><ul>
<li><b>Cloudflare</b> hosts the site, stores our data and sends our emails. Like any website host, it processes basic visit data such as your internet address.</li>
<li><b>Open-Meteo</b> provides weather and tides. Your browser asks it for ${R.place}'s forecast, so it sees a request from your device, but no personal details from us.</li>
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
const genAlpha = () => page("Gen Alpha interpreter", `<p class="mute"><a href="/${R.code}">‹ ${R.code} ${R.place}</a></p><h1>🗣️ Gen Alpha interpreter</h1>
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
</script>`, R.code);

// ---- In memory: local death notices, sourced from funeral homes (approved in admin; shown for 60 days) ----
const ripItem = n => `<li><b>${esc(n.name)}</b>${n.age ? `, ${esc(n.age)}` : ""}<br><span class="mute">Passed ${esc(fmtDate(n.date))}${n.service ? ` · ${esc(n.service)}` : ""}</span><br>
<span class="src">Info from ${n.link ? `<a href="${esc(n.link)}" rel="nofollow noopener">${esc(n.home)}</a>` : esc(n.home)}</span></li>`;
// Funeral directors publish notices on their own sites. We read those pages a few times a day, pull out
// the names and dates with Cloudflare's AI, and keep only names that appear word-for-word on the page.
// Lotto: latest draw results from The Lott, refreshed every 3 hours. If it can't be reached, the section links out.
const LOTTO = { TattsLotto: "Saturday Lotto", OzLotto: "Oz Lotto", Powerball: "Powerball", MonWedLotto: "Mon & Wed Lotto", SetForLife744: "Set for Life" };
async function refreshLotto(env) {
  const old = await env.DATA.get("lotto", "json");
  if (old && Date.now() - new Date(old.asof) < 3 * 3600e3) return;
  try {
    const r = await fetch("https://data.api.thelott.com/sales/vmax/web/data/lotto/latestresults", { method: "POST", headers: { ...UA, "content-type": "application/json" },
      body: JSON.stringify({ CompanyId: "NSWLotteries", MaxDrawCountPerProduct: 1, OptionalProductFilter: Object.keys(LOTTO) }) });
    const j = await r.json(), draws = (j.DrawResults || []).filter(d => LOTTO[d.ProductId]).map(d => ({ game: LOTTO[d.ProductId], date: String(d.DrawDate || "").slice(0, 10), no: d.DrawNumber,
      main: d.PrimaryNumbers || [], extra: d.SecondaryNumbers || [], extraName: d.ProductId === "Powerball" ? "Powerball" : "Supps" }));
    if (draws.length) await env.DATA.put("lotto", JSON.stringify({ asof: new Date().toISOString(), draws }));
  } catch (e) {}
}
async function lottoBlock(env) {
  const l = await env.DATA.get("lotto", "json");
  const ball = n => `<span class="ball">${esc(String(n))}</span>`;
  const body = l?.draws?.length ? `<ul class="lotto">${l.draws.map(d => `<li><b>${esc(d.game)}</b> <span class="mute">draw ${esc(String(d.no))}, ${esc(fmtDate(d.date))}</span><br>${d.main.map(ball).join("")}${d.extra.length ? ` <span class="mute">${d.extraName}</span> ${d.extra.map(n => `<span class="ball alt">${esc(String(n))}</span>`).join("")}` : ""}</li>`).join("")}</ul>
<p class="src">Info from <a href="https://www.thelott.com/results" rel="noopener">The Lott</a>. Updated ${esc(asOf(l.asof))}. Always check your ticket with The Lott.</p>`
    : `<p>Latest draws for Saturday Lotto, Oz Lotto, Powerball and Set for Life: <a href="https://www.thelott.com/results" rel="noopener">The Lott results</a>.</p>`;
  return `<section id="lotto"><h2>🎱 Lotto results</h2><details><summary>Tap to show this week&rsquo;s numbers</summary>${body}
<p class="mute">Play for fun. If it&rsquo;s stopped being fun, call Gambling Help on <a href="tel:1800858858">1800 858 858</a> (free, 24/7) or visit <a href="https://www.gambleaware.nsw.gov.au" rel="noopener">GambleAware</a>.</p></details></section>`;
}
async function refreshObits(env) {
  const old = await env.DATA.get("obits", "json");
  if (old && Date.now() - new Date(old.asof) < 6 * 3600e3) return;
  const items = [];
  for (const f of R.funerals || []) {
    try {
      const html = await (await fetch(f.url, { headers: UA })).text();
      const txt = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<nav[\s\S]*?<\/nav>|<footer[\s\S]*?<\/footer>/g, " ").replace(/<[^>]+>/g, " ");
      const txt2 = dec(txt.replace(/&nbsp;/g, " ").replace(/&rsquo;|&lsquo;/g, "'").replace(/&ldquo;|&rdquo;/g, '"')).replace(/\s+/g, " ").slice(0, 9000);
      const today = todayISO();
      const ask = { messages: [
        { role: "system", content: "You extract funeral notices from web page text. Output ONLY JSON." },
        { role: "user", content: `Today is ${today}. From this funeral director's page, list the people named in notices, newest first, at most 12. For each give: "name" (exactly as written on the page), "passed" (date of death as YYYY-MM-DD, or null), "service" (date of the funeral or service as YYYY-MM-DD, or null), "where" (service place in a few words, or null). Never invent people or dates. Reply as {"notices":[...]}.\n\nPAGE:\n${txt2}` }], max_tokens: 1200 };
      let out; try { out = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", ask); } catch (e) { out = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", ask); }
      const raw = typeof out?.response === "string" ? out.response : JSON.stringify(out?.response || {});
      const list = (JSON.parse(raw.match(/\{[\s\S]*\}/)[0]).notices || []);
      const isDate = d => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
      for (const n of list) {
        const name = String(n.name || "").trim();
        if (!name || name.length > 80 || !txt2.includes(name)) continue; // only names really on the page
        items.push({ name, passed: isDate(n.passed), service: isDate(n.service), where: n.where ? String(n.where).slice(0, 80) : null, home: f.name, link: f.url });
      }
    } catch (e) {}
  }
  if (items.length || !old) await env.DATA.put("obits", JSON.stringify({ asof: new Date().toISOString(), items }));
}
async function obitsWithin(env, days) {
  const o = await env.DATA.get("obits", "json"), t = todayISO();
  const lo = new Date(Date.now() + 11 * 3600e3 - days * 864e5).toISOString().slice(0, 10), hi = new Date(Date.now() + 11 * 3600e3 + 7 * 864e5).toISOString().slice(0, 10);
  const manual = [];
  for (const { name } of await klist(env, "rip:")) { const n = await env.DATA.get(name, "json"); if (n) manual.push({ name: n.name, passed: n.date, service: null, where: n.service || null, home: n.home, link: n.link }); }
  const seen = new Set();
  return [...manual, ...(o?.items || [])].filter(n => (n.passed && n.passed >= lo && n.passed <= t) || (n.service && n.service >= lo && n.service <= hi))
    .filter(n => !seen.has(n.name.toLowerCase()) && seen.add(n.name.toLowerCase()))
    .sort((a, b) => (b.passed || b.service).localeCompare(a.passed || a.service));
}
const obitItem = n => `<li><b>${esc(n.name)}</b><br><span class="mute">${n.passed ? `Passed ${esc(fmtDate(n.passed))}` : ""}${n.passed && n.service ? " · " : ""}${n.service ? `Service ${esc(fmtDate(n.service))}${n.where ? `, ${esc(n.where)}` : ""}` : ""}</span><br><span class="src">Notice from <a href="${esc(n.link)}" rel="noopener">${esc(n.home)}</a></span></li>`;
async function memoryBlock(env) {
  const list = await obitsWithin(env, 5);
  return `<section id="memory"><h2>🕊️ In memory</h2><p class="mute">Remembering locals who have recently passed. Our thoughts are with their families and friends.</p>
${list.length ? `<ul>${list.slice(0, 8).map(obitItem).join("")}</ul>` : `<p class="mute">No new notices in the last five days.</p>`}<p><a href="/rip">All recent notices →</a></p></section>`;
}
async function ripPage(env, msg = "") {
  const list = await obitsWithin(env, 60);
  return page("In memory", `<p class="mute"><a href="/${R.code}">‹ ${R.code} ${R.place}</a></p><h1>🕊️ In memory</h1>
<p>Remembering locals who have passed away in the last two months. Rest in peace.</p>${msg}
<ul>${list.map(obitItem).join("") || '<li class="mute">No notices in the last two months.</li>'}</ul>
<p class="mute">Every notice is sourced from the funeral home and links to their official notice for full service details.</p>
<p class="mute">For service details, see the latest <a href="https://www.google.com/search?q=${encodeURIComponent("funeral notices " + R.place)}" rel="noopener">funeral notices for ${esc(R.place)}</a> from local funeral directors.</p>
<details><summary class="mute">For funeral directors</summary><p class="mute">If a family would like a notice shared here, you can add it below. We confirm every notice with you before it appears.</p><form method="post" action="/rip"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<label>Full name *</label><input name="name" required maxlength="100" style="width:100%">
<div class="row"><div><label>Age</label><input name="age" maxlength="10"></div><div><label>Date of passing *</label><input type="date" name="date" required max="${todayISO()}"></div></div>
<label>Service (date, time, place)</label><input name="service" maxlength="200" style="width:100%">
<label>Funeral home *</label><input name="home" required maxlength="100" style="width:100%">
<label>Link to the funeral home's notice *</label><input type="url" name="link" required maxlength="300" style="width:100%">
<label>Your email (to confirm, never shown) *</label><input type="email" name="contact" required style="width:100%">
<p><button>Submit notice</button></p></form></details>`, R.code);
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
  events: "events gig gigs music markets weekend things festival", news: "news headlines", fuel: "fuel petrol diesel car drive driving commute ute",
  sea: "fish fishing boat tide tides surf surfing swell kayak", know: "council bins rubbish rates newcomer moved mayor", council: "council rates development roadworks",
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
      { role: "system", content: `You set up a free local info page for ${R.place}, Australia. Sections (id = name): ${list}. "tools" holds: dinner ideas from your fridge, birthday deals, Gen Alpha slang interpreter, death notices, school run report. Reply with ONLY JSON: {"order": [every section id, most useful for this person first, "today" first unless they say otherwise], "hide": [ids they clearly don't want], "name": "their first name if they said it, else empty", "say": "one warm, casual Aussie sentence under 25 words telling them what you set up"}` },
      { role: "user", content: text }] });
    const j = JSON.parse(String(r.response || "").match(/\{[\s\S]*\}/)[0]), valid = SECTIONS.map(x => x[0]);
    const order = [...new Set((j.order || []).filter(id => valid.includes(id)))]; valid.forEach(id => order.includes(id) || order.push(id));
    return Response.json({ order, hide: (j.hide || []).filter(id => valid.includes(id) && id !== "today"),
      name: String(j.name || "").replace(/[^\p{L} '-]/gu, "").slice(0, 30), say: String(j.say || guess.say).slice(0, 200) });
  } catch (e) { return Response.json(guess); }
}
const mePage = () => page(`My ${R.code}`, `<h1>🎤 Make ${R.code} yours</h1>
<div class="mav"><p><b>G'day<span id="hi"></span>, I'm Mav.</b> No fiddly settings. Just tell me about your day and what you care about, and I'll set up your page.</p>
<div class="row"><button type="button" id="mic" class="micb">🎤 Tap and talk</button></div>
<textarea id="say" rows="3" maxlength="500" placeholder="e.g. ${esc(R.mavExample)}"></textarea>
<div class="chips" id="ex"><label>I fish and surf</label><label>Two kids, school run, footy on weekends</label><label>New to town, what's on?</label><label>Just weather and bins please</label></div>
<p><button type="button" id="go">✨ Set me up</button></p><p id="reply" class="note" hidden></p></div>
<h2>Your ${R.code}</h2><p class="mute">Move things up or down, or switch them off. It saves as you go, on your phone only.</p>
<label>What should we call you?</label><input id="nm" maxlength="30" placeholder="First name" style="width:100%">
<ul id="list" class="setlist"></ul>
<p><a class="card" href="/${R.code}">👀 <b>See my ${R.code}</b> →</a></p><p class="mute"><a href="#" id="reset">Start again</a></p>
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
</script>`, R.code);

// ---- Live sources: fetched by the Worker (every 30 min via cron, or on demand), cached in KV, always shown with "current as of" + source link ----
const asOf = iso => new Date(iso).toLocaleString("en-AU", { timeZone: "Australia/Sydney", hour: "numeric", minute: "2-digit", weekday: "short", day: "numeric", month: "short" });
const srcLine = (name, url, iso, note = "") => `<p class="src">Info from <a href="${url}" rel="noopener">${name}</a>.${iso ? ` Updated ${esc(asOf(iso))}.` : ""}${note ? " " + note : ""}</p>`;
const dec = x => String(x || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
const tag = (x, t) => dec((x.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)) || [])[1]);
const rss = xml0 => { const xml = String(xml0).replace(/<content:encoded>([\s\S]*?)<\/content:encoded>/g, (_, c) => { const m = c.match(/<img[^>]+src=["']([^"']+)/); return m ? `<mimg>${m[1]}</mimg>` : ""; }).slice(0, 120000); return [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/g)].map(m => ({ title: tag(m[0], "title"), link: tag(m[0], "link"), date: tag(m[0], "pubDate"),
  desc: tag(m[0], "description").replace(/<[^>]+>/g, " ").replace(/The post .* appeared first on .*$/s, "").replace(/\s+/g, " ").trim().slice(0, 400), img: itemImg(m[0]), cats: [...m[0].matchAll(/<category[^>]*>([\s\S]*?)<\/category>/g)].map(c => dec(c[1])).join(" | ") })); };
const itemImg = x => { const m = x.match(/<media:(?:content|thumbnail)[^>]+url=["']([^"']+)/) || x.match(/<enclosure[^>]+url=["']([^"']+\.(?:jpe?g|png|webp)[^"']*)/i) || x.match(/<mimg>([^<]+)<\/mimg>/) || dec(tag(x, "description")).match(/<img[^>]+src=["']([^"']+)/);
  const u = m ? dec(m[1]) : ""; return /^https:\/\//.test(u) ? u : ""; };
const cut = (t, n) => { t = String(t || ""); if (t.length <= n) return t; const c = t.slice(0, n); return c.slice(0, c.lastIndexOf(" ") > n * 0.6 ? c.lastIndexOf(" ") : n).replace(/[,.;:\s]+$/, "") + "…"; };
const km = (a, b) => { const r = Math.PI / 180, d = Math.sin((b.lat - a.lat) * r / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin((b.lon - a.lon) * r / 2) ** 2; return 12742 * Math.asin(Math.sqrt(d)); };
const firstPoint = g => !g ? null : g.type === "Point" ? { lon: g.coordinates[0], lat: g.coordinates[1] } : (g.geometries || []).map(firstPoint).find(Boolean) || null;

const SOURCES = {
  news: { get name() { return R.news.map(n => n.name).join(", "); }, get url() { return R.news[0].url; }, get: async () => {
    const all = [];
    for (const src of R.news) { try {
      const items = rss(await (await fetch(src.feed, { headers: UA })).text())
        .filter(i => (!src.skip || !src.skip.test(i.title)) && (!src.cat || src.cat.test(i.cats)) && (!src.need || src.need.test(i.title + " " + i.desc)));
      all.push(...items.slice(0, 8).map(i => ({ title: i.title, link: i.link, date: i.date, src: src.name, desc: cut(i.desc, 240), img: i.img })));
    } catch (e) {} }
    if (!all.length) throw new Error("no news");
    const seen = new Set(); return all.sort((x, y) => new Date(y.date || 0) - new Date(x.date || 0)).filter(i => { const k = i.title.toLowerCase().replace(/\W+/g, ""); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 14); } },
  fires: { name: "NSW Rural Fire Service, Fires Near Me", url: "https://www.rfs.nsw.gov.au/fire-information/fires-near-me", get: async () => {
    const j = await (await fetch("https://www.rfs.nsw.gov.au/feeds/majorIncidents.json", { headers: UA })).json();
    return (j.features || []).map(f => { const p = f.properties || {}, pt = firstPoint(f.geometry), d = p.description || "", g = k => (d.match(new RegExp(k + ":\\s*([^<]*)")) || [])[1]?.trim() || "";
      return { title: (p.title || "").trim(), level: p.category || g("ALERT LEVEL"), where: g("LOCATION"), status: g("STATUS"), size: g("SIZE"), link: p.link, pt, km: pt ? Math.round(km(HOME, pt)) : 999 }; })
      .filter(f => f.km <= 100).sort((a, b) => a.km - b.km).slice(0, 8); } },
  warnings: { name: "Bureau of Meteorology, NSW warnings", url: "http://www.bom.gov.au/nsw/warnings/", get: async () =>
    rss(await (await fetch("http://www.bom.gov.au/fwo/IDZ00054.warnings_nsw.xml", { headers: UA })).text()).filter(i => R.warnRe.test(i.title)).slice(0, 6) },
  holidays: { name: "Nager.Date public holidays", url: "https://date.nager.at", get: async () => {
    const y = new Date().getFullYear(), all = [];
    for (const yr of [y, y + 1]) all.push(...await (await fetch(`https://date.nager.at/api/v3/PublicHolidays/${yr}/AU`, { headers: UA })).json());
    const t = todayISO(); return all.filter(h => h.date >= t && (!h.counties || h.counties.includes("AU-NSW"))).slice(0, 4).map(h => ({ date: h.date, name: h.localName })); } },
};
async function refreshSource(env, key) {
  const S = SOURCES[key];
  try { const items = await S.get(); const v = { items, asof: new Date().toISOString(), ok: true }; await env.DATA.put("src:" + key, JSON.stringify(v)); return v; }
  catch (e) { const old = await env.DATA.get("src:" + key, "json"); return old ? { ...old, stale: true } : { items: [], ok: false }; }
}
async function getSource(env, ctx, key) {
  const v = await env.DATA.get("src:" + key, "json");
  if (!v) return refreshSource(env, key);
  // The 30-minute schedule keeps sources fresh; page views never do the heavy lifting.
  return v;
}
async function liveBlocks(env, ctx, at = HOME) {
  const [news, fires, warn, hol] = await Promise.all(["news", "fires", "warnings", "holidays"].map(k => getSource(env, ctx, k)));
  const S = SOURCES, fail = s => `<p class="mute">Couldn't reach the source just now.</p>`;
  const alerts = `<section id="alerts"><h2>Alerts</h2><p class="mute">In an emergency call <a href="tel:000">000</a>.</p>
<h3>🔥 Fires within 100 km</h3>${fires.ok === false ? fail() : (fires.items = fires.items.map(f => ({ ...f, km: f.pt ? Math.round(km(at, f.pt)) : f.km })).sort((a, b) => a.km - b.km)).length ? `<ul>${fires.items.map(f => `<li><b>${esc(f.title)}</b> <span class="tagg">${esc(f.level)}</span><br><span class="mute">${esc(f.where)} · ${f.km} km away${f.status ? " · " + esc(f.status) : ""}${f.size ? " · " + esc(f.size) : ""}</span></li>`).join("")}</ul>` : "<p>✅ No fires listed within 100 km.</p>"}
${srcLine(S.fires.name, S.fires.url, fires.asof)}
<h3>⚠️ Weather warnings</h3>${warn.ok === false ? fail() : warn.items.length ? `<ul>${warn.items.map(w => `<li>${w.link ? `<a href="${esc(w.link)}" rel="noopener">${esc(w.title)}</a>` : esc(w.title)}</li>`).join("")}</ul>` : "<p>✅ No current warnings for our area.</p>"}
${srcLine(S.warnings.name, S.warnings.url, warn.asof)}
<p class="mute">Roads and traffic: <a href="https://www.livetraffic.com" rel="noopener">Live Traffic NSW</a> (live feed coming soon).</p></section>`;
  const nd = n => n.date ? esc(new Date(n.date).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney", weekday: "short", day: "numeric", month: "short" })) : "";
  const nsrc = n => n.src ? `<span class="kick">${esc(n.src)}</span>` : "";
  const nimg = (n, cls) => n.img ? `<img class="${cls}" src="${esc(n.img)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.classList.remove('wimg');this.remove()">` : "";
  const story = (n, lead) => `<a class="story${lead ? " lead" : ""}${n.img ? " wimg" : ""}" href="${esc(n.link)}" rel="noopener">${nimg(n, "simg")}<span class="sbody">${nsrc(n)}<span class="hl">${esc(n.title)}</span>${n.desc ? `<span class="dek">${esc(lead ? n.desc : cut(n.desc, 95))}</span>` : ""}<span class="byl">${nd(n)} · Read the full story →</span></span></a>`;
  const ni = news.ok === false ? [] : news.items, withImg = ni.findIndex(n => n.img), leadI = withImg > -1 && withImg < 3 ? withImg : 0;
  const lead = ni[leadI], rest = ni.filter((_, k) => k !== leadI), top = rest.slice(0, 4), more = rest.slice(4);
  const newsB = `<section id="news" class="paper"><h2 class="sech">📰 Today's news</h2>
${news.ok === false ? fail() : !ni.length ? "<p class=mute>No new stories just now.</p>" : `${story(lead, true)}<div class="grid2">${top.map(n => story(n, false)).join("")}</div>${more.length ? `<h3 class="sub">More headlines</h3><ul class="heads">${more.map(n => `<li>${nsrc(n)} <a href="${esc(n.link)}" rel="noopener">${esc(n.title)}</a> <span class="mute">${nd(n)}</span></li>`).join("")}</ul>` : ""}`}
<p class="src">Headlines and summaries from ${R.news.map(n => esc(n.name)).join(", ")}. Tap a story to read it in full on their site.${news.asof ? ` Updated ${esc(asOf(news.asof))}.` : ""}</p></section>`;
  const holB = `<section id="holidays"><h2>Holidays</h2><h3>Next NSW public holidays</h3>${hol.ok === false ? fail() : `<ul>${hol.items.map(h => `<li><b>${esc(fmtDate(h.date))}</b>: ${esc(h.name)}${away(h.date)}</li>`).join("")}</ul>`}
${srcLine(S.holidays.name, S.holidays.url, hol.asof)}${(() => { const wk = new Date(Date.now() + 7 * 864e5 + 11 * 3600e3).toISOString().slice(0, 10), up = skyNext().filter(e => e.d <= wk); return up.length ? `<h3>🔭 This week in the sky</h3><ul>${up.map(e => `<li><b>${esc(fmtDate(e.d))}</b>: ${esc(e.name)}${away(e.d)}</li>`).join("")}</ul><p class="src">Dates are the usual peaks; meteor showers are best away from town lights. Info from <a href="https://www.timeanddate.com/astronomy/meteor-shower/" rel="noopener">timeanddate.com</a>.</p>` : ""; })()}<h3>Next school holidays</h3>${schoolHols()}<p class="src">${R.schoolsArea}. Info from <a href="https://education.nsw.gov.au/schooling/calendar" rel="noopener">NSW Department of Education</a> · Private schools may differ</p></section>`;
  return { alerts, news: newsB, holidays: holB };
}

// ---- FuelCheck (NSW Government API; needs free FUEL_KEY + FUEL_SECRET secrets) ----
const FUELS = { E10: "E10", U91: "Unleaded 91", P95: "Premium 95", P98: "Premium 98", DL: "Diesel" };
// Quota-safe: API.NSW allows 2,500 calls a month. We pull ALL current NSW prices in one call at most every 2 hours (~360 calls/month),
// keep only stations within 60 km of the town, and answer every visitor (any fuel type, any location) from that cached copy.
async function fuelToken(env) {
  let tok = await env.DATA.get("fuel:token");
  if (!tok) {
    const t = await (await fetch("https://api.onegov.nsw.gov.au/oauth/client_credential/accesstoken?grant_type=client_credentials", { headers: { authorization: "Basic " + btoa(env.FUEL_KEY + ":" + env.FUEL_SECRET) } })).json();
    tok = t.access_token; if (!tok) throw new Error("no token"); await env.DATA.put("fuel:token", tok, { expirationTtl: 36000 });
  }
  return tok;
}
function fuelTs() { const n = new Date(), p = x => String(x).padStart(2, "0"), h = n.getUTCHours() % 12 || 12;
  return `${p(n.getUTCDate())}/${p(n.getUTCMonth() + 1)}/${n.getUTCFullYear()} ${p(h)}:${p(n.getUTCMinutes())}:${p(n.getUTCSeconds())} ${n.getUTCHours() < 12 ? "AM" : "PM"}`; }
async function fuelData(env) {
  const c = await env.DATA.get("fuel:local", "json");
  if (c && Date.now() - new Date(c.asof) < 2 * 36e5) return c;
  if (await env.DATA.get("fuel:lock")) return c;                  // another request is already refreshing
  await env.DATA.put("fuel:lock", "1", { expirationTtl: 120 });
  try {
    const tok = await fuelToken(env);
    const r = await (await fetch("https://api.onegov.nsw.gov.au/FuelPriceCheck/v1/fuel/prices", { headers: { "content-type": "application/json", apikey: env.FUEL_KEY,
      authorization: "Bearer " + tok, transactionid: crypto.randomUUID(), requesttimestamp: fuelTs() } })).json();
    const stations = (r.stations || []).map(s => ({ code: String(s.code), name: s.name, brand: s.brand, address: s.address, lat: +s.location?.latitude, lon: +s.location?.longitude }))
      .filter(s => s.lat && km(HOME, s) <= 60);
    const codes = new Set(stations.map(s => s.code));
    const prices = (r.prices || []).filter(p => codes.has(String(p.stationcode))).map(p => ({ code: String(p.stationcode), type: p.fueltype, price: p.price, updated: p.lastupdated }));
    if (!stations.length) throw new Error("empty");
    const out = { stations, prices, asof: new Date().toISOString() };
    await env.DATA.put("fuel:local", JSON.stringify(out));
    return out;
  } catch (e) { return c; }
}
async function fuelApi(req, env) {
  const u = new URL(req.url), type = FUELS[u.searchParams.get("t")] ? u.searchParams.get("t") : "U91";
  if (!env.FUEL_KEY || !env.FUEL_SECRET) return Response.json({ error: "not_set_up" });
  const d = await fuelData(env); if (!d) return Response.json({ error: "unreachable" });
  const here = { lat: +u.searchParams.get("lat") || HOME.lat, lon: +u.searchParams.get("lon") || HOME.lon };
  const st = Object.fromEntries(d.stations.map(s => [s.code, s]));
  const list = d.prices.filter(p => p.type === type && st[p.code]).map(p => { const s = st[p.code]; return { name: s.name, brand: s.brand, address: s.address, km: km(here, s), price: p.price, updated: p.updated }; })
    .filter(x => x.km <= 15).sort((a, b) => a.price - b.price || a.km - b.km).slice(0, 6);
  return Response.json({ type, label: FUELS[type], list, asof: d.asof });
}
const fuelBlock = (t = HOME) => `<section id="fuel"><h2>Fuel</h2>
<div class="row"><select id="ft" aria-label="Fuel type">${Object.entries(FUELS).map(([k, l]) => `<option value="${k}"${k === "U91" ? " selected" : ""}>${l}</option>`).join("")}</select>
<button type="button" id="fnear">📍 Near me</button></div><div id="fout" class="mute">Loading cheapest fuel…</div>
<p class="src" id="fsrc">Info from <a href="https://www.fuelcheck.nsw.gov.au" rel="noopener">NSW FuelCheck</a></p>
<script>(function(){var ft=document.getElementById('ft'),fo=document.getElementById('fout'),pos=null;try{var L=JSON.parse(localStorage.getItem('loc'));if(L){pos=L;document.getElementById('fnear').textContent='📍 Near you'}}catch(e){}try{ft.value=localStorage.getItem('fuel')||'U91'}catch(e){}
function load(){try{localStorage.setItem('fuel',ft.value)}catch(e){}fo.textContent='Loading…';var q='/api/fuel?t='+ft.value+(pos?'&lat='+pos[0]+'&lon='+pos[1]:'&lat=${t.lat}&lon=${t.lon}');
fetch(q).then(function(r){return r.json()}).then(function(j){if(j.error){fo.innerHTML=j.error=='not_set_up'?'Live prices coming soon. For now, check <a href="https://www.fuelcheck.nsw.gov.au">NSW FuelCheck</a>.':'Couldn’t reach FuelCheck just now.';return}
if(!j.list.length){fo.textContent='No prices found nearby.';return}
fo.innerHTML='<ol class="fuel">'+j.list.map(function(s,i){return '<li><b>'+(s.price/100).toFixed(2).replace(/^/,'$')+'</b> '+(i==0?'⭐ ':'')+s.name+'<br><span class="mute">'+(s.address||'')+(s.km!=null?' · '+(+s.km).toFixed(1)+' km':'')+'</span></li>'}).join('')+'</ol>';
document.getElementById('fsrc').innerHTML='Info from <a href="https://www.fuelcheck.nsw.gov.au" rel="noopener">NSW FuelCheck</a>, the NSW Government fuel price site. Updated '+new Date(j.asof).toLocaleString('en-AU',{hour:'numeric',minute:'2-digit',weekday:'short'})+'. Prices are per litre.';}).catch(function(){fo.textContent='Couldn’t reach FuelCheck just now.'})}
ft.onchange=load;document.getElementById('fnear').onclick=function(){if(!navigator.geolocation)return;this.textContent='📍 Finding you…';var b=this;
navigator.geolocation.getCurrentPosition(function(p){pos=[+p.coords.latitude.toFixed(2),+p.coords.longitude.toFixed(2)];try{localStorage.setItem('loc',JSON.stringify(pos))}catch(e){}b.textContent='📍 Near you';load()},function(){b.textContent='📍 Near me'})};load()})();</script></section>`;

// ---- Weekend for kids: free or under $50 a kid. Locals' events tagged "good for kids" + local favourites ----
function weekendDates() { const t = new Date(todayISO() + "T00:00:00Z"), d = t.getUTCDay(), sat = new Date(t); sat.setUTCDate(t.getUTCDate() + (d === 0 ? -1 : 6 - d));
  const sun = new Date(sat); sun.setUTCDate(sat.getUTCDate() + 1); return [sat.toISOString().slice(0, 10), sun.toISOString().slice(0, 10)]; }
async function kidsBlock(local, feed, pc = R.code) {
  const [sat, sun] = weekendDates(), wk = [...local, ...feed].filter(e => e.kids && (e.cost == null || e.cost <= 50) && e.date >= sat && e.date <= sun);
  return `<section id="kids"><h2>Weekend for kids</h2><p class="mute">Free or under $50 a kid. This weekend: ${esc(fmtDate(sat))} and ${esc(fmtDate(sun))}.</p>
${wk.length ? `<h3>On this weekend</h3><ul>${wk.map(evItem).join("")}</ul>` : `<p>No kids' events listed for this weekend yet. Running one? <a href="/submit?pc=${pc}">Add it free</a> and tick "Good for kids".</p>`}
<h3>Always-good local favourites</h3><ul>${FAVES.map(([n, c, d]) => `<li><b>${esc(n)}</b> <span class="tagg">${c}</span><br><span class="mute">${esc(d)}</span></li>`).join("")}</ul>
<p class="src">Picked by locals. Check times and prices before you go · <a href="/feedback">Suggest one</a></p></section>`;
}

// ---- Field closures: watch the council page for changes; alerts go out by push to anyone who opted in ----
// ---- Accountability: we watch the pages we source from and show how current the owner keeps them.
// stated = a "last updated" date the page itself showed when we checked by hand (YYYY-MM or YYYY-MM-DD).
const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
function pageDate(html) { // a "last updated" date the page publishes about itself, if any
  let m = html.match(/(?:dateModified|article:modified_time|last-modified)["']?\s*(?:content\s*=\s*|:\s*)["'](\d{4}-\d{2}-\d{2})/i);
  if (m) return m[1];
  m = html.replace(/<[^>]+>/g, " ").match(/(?:last|page)\s+(?:updated|modified|reviewed)\s*(?:on|:)?\s*(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3})[a-z]*\.?,?\s+(\d{4})/i);
  if (m && MONTHS[m[2].toLowerCase()]) return `${m[3]}-${String(MONTHS[m[2].toLowerCase()]).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return null;
}
async function checkWatched(env) {
  for (const [id, w] of Object.entries(WATCH)) {
    try {
      const old = await env.DATA.get(`srcw:${id}`, "json"), now = new Date().toISOString();
      if (old && Date.now() - new Date(old.checked) < 20 * 3600e3) continue; // once a day is plenty
      const html = await (await fetch(w.url, { headers: UA })).text();
      const txt = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
      const h = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt)))].slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("");
      await env.DATA.put(`srcw:${id}`, JSON.stringify({ hash: h, since: old?.since || now, changed: old && old.hash !== h ? now : old?.changed || null, checked: now, found: pageDate(html) || old?.found || null }));
    } catch (e) {}
  }
}
const ago = iso => { const d = (Date.now() - new Date(iso.length === 7 ? iso + "-15" : iso)) / 864e5; return d < 1 ? "today" : d < 2 ? "yesterday" : d < 60 ? `${Math.round(d)} days ago` : d < 730 ? `${Math.round(d / 30.4)} months ago` : `${Math.floor(d / 365.25)} years ago`; };
const niceDay = iso => new Date((iso.length === 7 ? iso + "-01" : iso.slice(0, 10)) + "T00:00:00").toLocaleDateString("en-AU", iso.length === 7 ? { month: "long", year: "numeric" } : { day: "numeric", month: "short", year: "numeric" });
function accLine(id, st) {
  const w = WATCH[id], upd = st?.found || w.stated, old = upd && (Date.now() - new Date(upd.length === 7 ? upd + "-15" : upd)) / 864e5 > 365;
  const said = upd ? `<b>${esc(w.owner)} last updated it: ${esc(niceDay(upd))} (${esc(ago(upd))})</b>.${old ? " ⚠️ That&rsquo;s a while ago, so it may be out of date." : ""}` : `<b>${esc(w.owner)} doesn&rsquo;t say when they last updated it.</b>`;
  const watch = st ? ` We&rsquo;ve watched it since ${esc(niceDay(st.since))}: ${st.changed ? `last change spotted ${esc(niceDay(st.changed))}` : "no changes spotted yet"}.` : "";
  return `<p class="src${old ? " warn" : ""}">Info from <a href="${w.url}" rel="noopener">${esc(w.name)}</a>. ${said}${watch}</p>`;
}

async function checkFields(env) {
  if (!R.fields) return;
  const prev = await env.DATA.get("fields:state", "json"); if (prev && Date.now() - new Date(prev.checked) < 110 * 6e4) return; // every 2 hours
  try {
    const txt = (await (await fetch(R.fields.url, { headers: UA })).text()).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const h = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt)))].slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("");
    const old = await env.DATA.get("fields:state", "json"), now = new Date().toISOString();
    if (!old) return env.DATA.put("fields:state", JSON.stringify({ hash: h, changed: null, checked: now }));
    if (old.hash !== h) { await env.DATA.put("fields:state", JSON.stringify({ hash: h, changed: now, checked: now }));
      await sendAlert(env, "fields", "Field closure update", "Council has just updated its sports field closure page. Tap to check.", `/${R.code}#sport`); }
    else await env.DATA.put("fields:state", JSON.stringify({ ...old, checked: now }));
  } catch (e) {}
}
async function fieldsBlock(env) {
  const st = await env.DATA.get("fields:state", "json"), a = await env.DATA.get("alert:fields", "json");
  return `${a ? `<p><b>Latest:</b> ${esc(a.body)} <span class="mute">(${esc(asOf(a.at))})</span></p>` : ""}
${R.fields.info}
<p class="src">Info from <a href="${R.fields.url}" rel="noopener">${esc(R.fields.name)}</a>.${st?.changed ? ` <b>Council last changed it: ${esc(asOf(st.changed))}</b>.` : ""}${st?.checked ? ` We check it every 2 hours (last check ${esc(asOf(st.checked))}).` : ""}</p>`;
}

// ---- Web push: no paid service. Keys are made by the Worker on first use and kept in KV. ----
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
async function vapid(env) {
  let k = await env.DATA.get("vapid", "json");
  if (!k) { const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
    k = { priv: await crypto.subtle.exportKey("jwk", kp.privateKey), pub: b64u(await crypto.subtle.exportKey("raw", kp.publicKey)) }; await env.DATA.put("vapid", JSON.stringify(k)); }
  return k;
}
async function pushOne(env, sub) {
  const k = await vapid(env), aud = new URL(sub.endpoint).origin, enc = o => b64u(new TextEncoder().encode(JSON.stringify(o)));
  const unsigned = enc({ typ: "JWT", alg: "ES256" }) + "." + enc({ aud, exp: Math.floor(Date.now() / 1000) + 43200, sub: `mailto:feedback@${R.domain}` });
  const key = await crypto.subtle.importKey("jwk", k.priv, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(unsigned));
  const r = await fetch(sub.endpoint, { method: "POST", headers: { authorization: `vapid t=${unsigned}.${b64u(sig)}, k=${k.pub}`, ttl: "86400", "content-length": "0" } });
  return r.status;
}
async function sendAlert(env, topic, title, body, url) {
  await env.DATA.put("alert:" + topic, JSON.stringify({ title, body, url, at: new Date().toISOString() }));
  await env.DATA.put("alert:latest", JSON.stringify({ title, body, url, at: new Date().toISOString() }));
  await env.DATA.put("push:queue", JSON.stringify({ topic, cursor: null }));      // sent in batches by the 5-minute cron
}
async function pushBatch(env) {
  const q = await env.DATA.get("push:queue", "json"); if (!q) return;
  const page = await env.DATA.list({ prefix: "psub:", cursor: q.cursor || undefined, limit: 20 });
  for (const { name } of page.keys) {
    const s = await env.DATA.get(name, "json"); if (!s || !(s.topics || []).includes(q.topic)) continue;
    try { const st = await pushOne(env, s.sub); if (st === 404 || st === 410) await env.DATA.delete(name); } catch (e) {}
  }
  page.list_complete ? await env.DATA.delete("push:queue") : await env.DATA.put("push:queue", JSON.stringify({ ...q, cursor: page.cursor }));
}
async function pushApi(req, env, p) {
  if (p === "/api/push/key") return Response.json({ key: (await vapid(env)).pub });
  if (p === "/api/alert") return Response.json(await env.DATA.get("alert:latest", "json") || { title: R.brand, body: `Something new in ${R.code}.`, url: `/${R.code}` });
  if (p === "/api/push/sub" && req.method === "POST") {
    let j = {}; try { j = await req.json(); } catch (e) {}
    if (!j.sub?.endpoint || !/^https:\/\//.test(j.sub.endpoint)) return Response.json({ ok: false }, { status: 400 });
    const id = b64u(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(j.sub.endpoint))).slice(0, 22);
    const old = await env.DATA.get("psub:" + id, "json"), topics = [...new Set([...(old?.topics || []), ...(j.topics || ["fields"])])].filter(t => ["fields", "alerts", ...Object.keys(NCATS).map(k => "n_" + k)].includes(t));
    await env.DATA.put("psub:" + id, JSON.stringify({ sub: j.sub, topics, at: new Date().toISOString() }));
    return Response.json({ ok: true });
  }
  return null;
}
const PUSH_JS = () => `<script>(function(){var bs=document.querySelectorAll('.pushbtn');if(!bs.length)return;
function u8(b){b=b.replace(/-/g,'+').replace(/_/g,'/');var r=atob(b+'==='.slice((b.length+3)%4)),a=new Uint8Array(r.length);for(var i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a}
bs.forEach(function(b){var m=b.parentNode.querySelector('.pushmsg');try{if(localStorage.getItem('push_'+b.dataset.topic)){b.textContent='Alerts on ✓';b.disabled=true}}catch(e){}
b.onclick=function(){if(!('serviceWorker'in navigator)||!('PushManager'in window)){m.textContent='On iPhone: tap Share, then Add to Home Screen, open ${R.code} from there and try again.';return}
b.disabled=true;b.textContent='Turning on…';Notification.requestPermission().then(function(p){if(p!=='granted')throw 0;return Promise.all([navigator.serviceWorker.ready,fetch('/api/push/key').then(function(r){return r.json()})])})
.then(function(x){return x[0].pushManager.subscribe({userVisibleOnly:true,applicationServerKey:u8(x[1].key)})}).then(function(sub){return fetch('/api/push/sub',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sub:sub,topics:[b.dataset.topic]})})})
.then(function(){b.textContent='Alerts on ✓';try{localStorage.setItem('push_'+b.dataset.topic,1)}catch(e){}m.textContent='You\\u2019ll get a notification when there\\u2019s news.'})
.catch(function(){b.disabled=false;b.textContent='Turn on alerts';m.textContent='Alerts weren\\u2019t allowed. You can turn them on in your phone\\u2019s settings.'})}})})();</script>`;

// ---- Open now: OpenStreetMap places around Coffs (free, no key), cached daily; open/closed worked out on the visitor's phone ----
const OPEN_CATS = { pharmacy: ["💊 Pharmacies", 'nwr["amenity"="pharmacy"]'], doctor: ["🩺 Doctors & clinics", 'nwr["amenity"~"^(doctors|clinic)$"]'],
  mechanic: ["🔧 Mechanics & tyres", 'nwr["shop"~"^(car_repair|tyres)$"]'], fuel: ["⛽ Servos", 'nwr["amenity"="fuel"]'],
  grocery: ["🛒 Supermarkets", 'nwr["shop"~"^(supermarket|convenience)$"]'], bottle: ["🍷 Bottle shops", 'nwr["shop"="alcohol"]'],
  pub: ["🍺 Pubs & bars", 'nwr["amenity"~"^(pub|bar)$"]'], cafe: ["☕ Cafés", 'nwr["amenity"="cafe"]'], food: ["🍔 Takeaway & restaurants", 'nwr["amenity"~"^(fast_food|restaurant)$"]'],
  vet: ["🐾 Vets", 'nwr["amenity"="veterinary"]'], hardware: ["🔨 Hardware", 'nwr["shop"~"^(hardware|doityourself)$"]'] };
async function openApi(req, env) {
  const cat = new URL(req.url).searchParams.get("c"); if (!OPEN_CATS[cat]) return Response.json({ error: "bad" }, { status: 400 });
  const c = await env.DATA.get("osm:" + cat, "json");
  if (c && Date.now() - new Date(c.asof) < 864e5) return Response.json(c);
  try {
    const q = `[out:json][timeout:25];(${OPEN_CATS[cat][1]}(${R.bbox}););out center tags;`;
    const j = await (await fetch("https://overpass-api.de/api/interpreter", { method: "POST", headers: { ...UA, "content-type": "application/x-www-form-urlencoded" }, body: "data=" + encodeURIComponent(q) })).json();
    const items = (j.elements || []).filter(e => e.tags?.name).map(e => { const t = e.tags;
      return { name: t.name, hours: t.opening_hours || "", phone: t.phone || t["contact:phone"] || "", lat: e.lat ?? e.center?.lat, lon: e.lon ?? e.center?.lon,
        addr: [t["addr:housenumber"], t["addr:street"], t["addr:suburb"] || t["addr:city"]].filter(Boolean).join(" "), web: t.website || t["contact:website"] || "", osm: `${e.type}/${e.id}` }; });
    const out = { cat, items, asof: new Date().toISOString() };
    await env.DATA.put("osm:" + cat, JSON.stringify(out));
    return Response.json(out);
  } catch (e) { return Response.json(c || { error: "unreachable" }); }
}
const openPage = () => page(`Open now in ${R.short}`, `<p class="mute"><a href="/${R.code}">‹ ${R.code} ${R.place}</a></p><h1>🟢 Open now?</h1>
<p>Pick what you need. Open places come first, nearest at the top. <a href="#" class="useloc">📍 Use my location</a></p>
<div class="pills" id="cats">${Object.entries(OPEN_CATS).map(([k, [l]]) => `<button type="button" data-c="${k}">${l}</button>`).join("")}</div>
<div id="olist"><p class="mute">Choose a category above.</p></div><p class="src" id="osrc"></p>
<script>(function(){var L=null;try{L=JSON.parse(localStorage.getItem('loc'))}catch(e){}var HOME=L||[${HOME.lat},${HOME.lon}],ol=document.getElementById('olist');
var DN=['Su','Mo','Tu','We','Th','Fr','Sa'],DL=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function days(spec){var set=[];spec.split(',').forEach(function(p){var r=p.split('-'),a=DN.indexOf(r[0]),b=DN.indexOf(r[1]||r[0]);if(a<0||b<0)return;for(var i=a;;i=(i+1)%7){set.push(i);if(i==b)break}});return set}
function sched(h){if(!h)return null;h=h.trim();if(h=='24/7')return 'always';var S={};for(var d=0;d<7;d++)S[d]=null;var ok=false;
h.split(';').forEach(function(rule){rule=rule.trim();if(!rule||/^PH/.test(rule))return;var m=rule.match(/^((?:(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?,?)+)?\\s*(.*)$/);if(!m)return;
var ds=m[1]?days(m[1].replace(/,$/,'')):[0,1,2,3,4,5,6],t=m[2].trim();if(!ds.length)return;
if(/^(off|closed)$/i.test(t)){ds.forEach(function(d){S[d]=[]});ok=true;return}
var sl=[];t.split(',').forEach(function(r){var x=r.match(/(\\d\\d):(\\d\\d)\\s*-\\s*(\\d\\d):(\\d\\d)/);if(x)sl.push([+x[1]*60+ +x[2],+x[3]*60+ +x[4]])});if(sl.length){ds.forEach(function(d){S[d]=sl});ok=true}});return ok?S:null}
function fmt(m){var h=Math.floor(m/60)%24,mm=m%60;return (h%12||12)+(mm?':'+String(mm).padStart(2,'0'):'')+(h<12?'am':'pm')}
function status(h){var S=sched(h);if(S=='always')return{c:'open',t:'Open 24 hours'};if(!S)return{c:'unk',t:h?'Hours: '+h:'Hours not listed'};
var n=new Date(),d=n.getDay(),m=n.getHours()*60+n.getMinutes();
var y=S[(d+6)%7]||[];for(var i=0;i<y.length;i++)if(y[i][1]<y[i][0]&&m<y[i][1])return{c:'open',t:'Open now · closes '+fmt(y[i][1])};
var td=S[d]||[];for(i=0;i<td.length;i++){var a=td[i][0],b=td[i][1];if(b<=a?m>=a:(m>=a&&m<b))return{c:'open',t:'Open now · closes '+fmt(b)}}
for(var k=0;k<8;k++){var dd=(d+k)%7,sl=S[dd]||[];for(i=0;i<sl.length;i++)if(k>0||sl[i][0]>m)return{c:'shut',t:'Closed · opens '+fmt(sl[i][0])+(k==0?' today':k==1?' tomorrow':' '+DL[dd])}}
return{c:'shut',t:'Closed'}}
function km(a,b){var r=Math.PI/180,x=Math.sin((b[0]-a[0])*r/2),y=Math.sin((b[1]-a[1])*r/2),q=x*x+Math.cos(a[0]*r)*Math.cos(b[0]*r)*y*y;return 12742*Math.asin(Math.sqrt(q))}
function e(x){return String(x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function load(c,btn){document.querySelectorAll('#cats button').forEach(function(b){b.classList.toggle('on',b==btn)});try{localStorage.setItem('opencat',c)}catch(_){}ol.innerHTML='<p class="mute">Loading…</p>';
fetch('/api/open?c='+c).then(function(r){return r.json()}).then(function(j){if(j.error){ol.innerHTML='<p class="mute">Couldn\\u2019t reach the map data just now.</p>';return}
var rank={open:0,shut:1,unk:2},it=j.items.map(function(x){x.s=status(x.hours);x.d=x.lat?km(HOME,[x.lat,x.lon]):999;return x}).filter(function(x){return x.d<40}).sort(function(a,b){return rank[a.s.c]-rank[b.s.c]||a.d-b.d}).slice(0,40);
ol.innerHTML=it.length?'<ul class="openl">'+it.map(function(x){return '<li class="'+x.s.c+'"><span class="dot"></span><div><b>'+e(x.name)+'</b><br><span class="st">'+e(x.s.t)+'</span><br><span class="mute">'+e(x.addr||'')+(x.d<999?' · '+x.d.toFixed(1)+' km':'')+'</span><br>'
+(x.phone?'<a href="tel:'+e(x.phone.replace(/[^+\\d]/g,''))+'">📞 Call</a> · ':'')+'<a href="https://www.google.com/maps/dir/?api=1&destination='+x.lat+','+x.lon+'" rel="noopener">🧭 Directions</a>'+(x.web?' · <a href="'+e(x.web)+'" rel="noopener">Website</a>':'')+'</div></li>'}).join('')+'</ul>':'<p>Nothing listed nearby.</p>';
document.getElementById('osrc').innerHTML='Info from <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap</a>, a free map anyone can add to (© OpenStreetMap contributors). Updated '+new Date(j.asof).toLocaleString('en-AU',{weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})+'. Hours can be wrong, so call ahead if it matters. Wrong or missing hours? <a href="https://www.openstreetmap.org" rel="noopener">Anyone can fix them</a> or <a href="/feedback">tell us</a>.'})
.catch(function(){ol.innerHTML='<p class="mute">Couldn\\u2019t load just now.</p>'})}
document.querySelectorAll('#cats button').forEach(function(b){b.onclick=function(){load(b.dataset.c,b)}});
var last;try{last=localStorage.getItem('opencat')}catch(_){}var lb=last&&document.querySelector('[data-c="'+last+'"]');if(lb)load(last,lb)})();</script>`, R.code);

// ---- Mav chat: a helper on every page. Answers from the site's own info and changes settings (all stored on the phone). Nothing is logged. ----
async function mavChat(req, env) {
  let j = {}; try { j = await req.json(); } catch (e) {}
  const msgs = (Array.isArray(j.messages) ? j.messages : []).slice(-6).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "").slice(0, 500) }));
  const last = msgs.filter(m => m.role === "user").pop()?.content || "";
  const pc = /^\d{4}$/.test(j.pc) ? j.pc : R.code, ids = SECTIONS.map(x => x[0]);
  const fallback = () => { const low = last.toLowerCase(), g = mavGuess(last), hit = [["open", "/open"], ["fridge", "/fridge"], ["dinner", "/fridge"], ["school", "/school"], ["birthday", "/birthday"], ["slang", "/genalpha"], ["idea", "/feedback"]].find(([k]) => low.includes(k));
    if (/\b(move|put|show|hide|first|top|set up|setup|order|only)\b/.test(low)) return { reply: g.say, actions: [{ type: "order", ids: g.order }] };
    return { reply: hit ? `Try this page: ${hit[1]}` : `I can rearrange your page, find what's open, check fuel, and point you to anything on ${R.code}. What do you need?`, actions: hit ? [{ type: "link", url: hit[1] }] : [] }; };
  if (!last.trim()) return Response.json(fallback());
  if (!env.AI) return Response.json(fallback());
  try {
    const r = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", { max_tokens: 350, messages: [
      { role: "system", content: `You are Mav, the friendly, down-to-earth Aussie helper on ${R.brand}. Keep replies short (1-3 sentences), warm and practical. Only use facts below; if unsure, point to the right page or say to check the source. No medical, legal or financial advice beyond pointing to services; emergencies: call 000. Never ask for personal details beyond a first name.
${MAV_KB}
The person is viewing area ${pc}. Their current section order: ${JSON.stringify(j.order || ids)}; hidden: ${JSON.stringify(j.hidden || [])}; name: ${JSON.stringify(String(j.name || "").slice(0, 30))}.
Reply with ONLY JSON: {"reply":"text","actions":[...]} where actions (optional) can be: {"type":"order","ids":[all section ids in new order]}, {"type":"hide","ids":[...]}, {"type":"show","ids":[...]}, {"type":"name","value":"First"}, {"type":"area","pc":"${Object.keys(TOWNS).filter(k => TOWNS[k].live).join("|")}"}, {"type":"link","url":"/open"}, {"type":"fuel","value":"E10|U91|P95|P98|DL"}. Only use section ids: ${ids.join(", ")}.` },
      ...msgs] });
    const raw = String(r.response || ""), m = raw.match(/\{[\s\S]*\}/);
    let out; try { out = JSON.parse(m[0]); } catch (e) { out = { reply: raw.replace(/[{}"]/g, "").slice(0, 400), actions: [] }; }
    const acts = (Array.isArray(out.actions) ? out.actions : []).filter(a => a && typeof a === "object").map(a => {
      if (a.type === "order") { const o = [...new Set((a.ids || []).filter(i => ids.includes(i)))]; ids.forEach(i => o.includes(i) || o.push(i)); return { type: "order", ids: o }; }
      if (a.type === "hide" || a.type === "show") return { type: a.type, ids: (a.ids || []).filter(i => ids.includes(i) && i !== "today") };
      if (a.type === "name") return { type: "name", value: String(a.value || "").replace(/[^\p{L} '-]/gu, "").slice(0, 30) };
      if (a.type === "area" && Object.keys(TOWNS).filter(k => TOWNS[k].live).includes(String(a.pc))) return { type: "area", pc: String(a.pc) };
      if (a.type === "link" && /^\/[a-z0-9/#?=&-]*$/i.test(a.url || "")) return { type: "link", url: a.url };
      if (a.type === "fuel" && FUELS[a.value]) return { type: "fuel", value: a.value };
      return null; }).filter(Boolean).slice(0, 4);
    return Response.json({ reply: String(out.reply || "Done!").slice(0, 500), actions: acts });
  } catch (e) { return Response.json(fallback()); }
}
const MAV_WIDGET = () => `<button type="button" id="mavbtn" aria-label="Ask Mav">💬 Ask Mav</button>
<div id="mavp" hidden role="dialog" aria-label="Chat with Mav"><div class="mavh"><b>Mav</b><span class="mute"> · your ${R.code} helper</span><button type="button" id="mavx" aria-label="Close">×</button></div>
<div id="mavlog"></div><div class="chips" id="mavchips"><label>Set up my page</label><label>What's open now?</label><label>Cheapest fuel</label><label>Bin info</label><label>Hide what I don't use</label></div>
<form id="mavf"><button type="button" id="mavmic" aria-label="Talk">🎤</button><input id="mavin" placeholder="Ask Mav anything…" autocomplete="off" maxlength="500"><button>Send</button></form></div>
<script>(function(){var P=document.getElementById('mavp'),B=document.getElementById('mavbtn'),LOG=document.getElementById('mavlog'),IN=document.getElementById('mavin'),H=[];
function g(k){try{return localStorage.getItem(k)}catch(e){return null}}function p(k,v){try{v===null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}}
try{H=JSON.parse(sessionStorage.getItem('mavh')||'[]')}catch(e){}
function e(x){return String(x).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
function draw(){if(!H.length)H=[{role:'assistant',content:'G\\u2019day'+(g('name')?' '+g('name'):'')+'! I\\u2019m Mav. Ask me anything about ${R.code}, or tell me how you want your page set up.'}];
LOG.innerHTML=H.map(function(m){return '<p class="mm '+(m.role=='user'?'me':'mav')+'">'+e(m.content).replace(/(\\/[a-z0-9]+)/g,'<a href="$1">$1</a>')+'</p>'}).join('');LOG.scrollTop=1e6;try{sessionStorage.setItem('mavh',JSON.stringify(H.slice(-12)))}catch(_){}}
function open(){P.hidden=false;B.hidden=true;draw();IN.focus();try{sessionStorage.setItem('mavopen',1)}catch(_){}}
B.onclick=open;document.getElementById('mavx').onclick=function(){P.hidden=true;B.hidden=false;try{sessionStorage.removeItem('mavopen')}catch(_){}};
document.querySelectorAll('[href="/me"],.openmav').forEach(function(a){a.onclick=function(ev){ev.preventDefault();open()}});
function order(){try{return JSON.parse(g('order')||'null')}catch(e){return null}}
function apply(acts){var reload=false;(acts||[]).forEach(function(a){if(a.type=='order'){p('order',JSON.stringify(a.ids));reload=true}
else if(a.type=='hide'){a.ids.forEach(function(i){p('hide_'+i,'1')});reload=true}else if(a.type=='show'){a.ids.forEach(function(i){p('hide_'+i,null)});reload=true}
else if(a.type=='name'&&a.value){p('name',a.value);reload=true}else if(a.type=='fuel'){p('fuel',a.value);reload=true}
else if(a.type=='area'){p('pc',a.pc);setTimeout(function(){location.href='/'+a.pc},900)}else if(a.type=='link'){setTimeout(function(){location.href=a.url},900)}});
if(reload&&/^\\/\\d{4}\\/?$/.test(location.pathname))setTimeout(function(){location.reload()},900)}
function send(t){t=t.trim();if(!t)return;H.push({role:'user',content:t});H.push({role:'assistant',content:'…'});draw();IN.value='';
var hidden=[];document.querySelectorAll('#flow > section').forEach(function(s){if(g('hide_'+s.id))hidden.push(s.id)});
var pc=(location.pathname.match(/^\\/(\\d{4})/)||[])[1]||g('pc')||'${R.code}';
fetch('/api/mav',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:H.slice(0,-1).slice(-6),pc:pc,order:order(),hidden:hidden,name:g('name')})})
.then(function(r){return r.json()}).then(function(j){H[H.length-1]={role:'assistant',content:j.reply};draw();apply(j.actions)})
.catch(function(){H[H.length-1]={role:'assistant',content:'Sorry, I dropped the ball. Try again?'};draw()})}
document.getElementById('mavf').onsubmit=function(ev){ev.preventDefault();send(IN.value)};
document.getElementById('mavchips').onclick=function(ev){if(ev.target.tagName=='LABEL')send(ev.target.textContent)};
var SR=window.SpeechRecognition||window.webkitSpeechRecognition,mic=document.getElementById('mavmic');if(!SR)mic.hidden=true;else mic.onclick=function(){var r=new SR();r.lang='en-AU';mic.textContent='👂';
r.onresult=function(x){IN.value=Array.prototype.map.call(x.results,function(y){return y[0].transcript}).join(' ')};r.onend=function(){mic.textContent='🎤';if(IN.value)send(IN.value)};r.start()};
try{if(sessionStorage.getItem('mavopen'))open()}catch(_){}})();</script>`;

// ---- Why Coffs: fun facts, every one sourced ----
const whyPage = () => page(R.why.title.replace("?", ""), `<p class="mute"><a href="/${R.code}">‹ ${R.code} ${R.place}</a></p><h1>🌊 ${R.why.title}</h1>
<p>${R.why.intro}</p>
<ul class="ideas">${FACTS.map(([i, h, b, u, n]) => `<li class="idea"><span style="font-size:1.6rem">${i}</span><div><b>${esc(h)}</b><br>${esc(b)}<p class="src">Info from <a href="${u}" rel="noopener">${esc(n)}</a></p></div></li>`).join("")}</ul>
<p class="mute">Know a fact we've missed? <a href="/feedback">Tell us</a>.</p>`, R.code);

// ---- Daily crossword ----
const crosswordPage = () => {
  const day = todayISO(), { grid, nums, clues } = buildCrossword([...R.cw, ...GENERAL], R.code + day);
  const cell = (ch, r, c) => ch ? `<td><span class="cn">${nums[r + "," + c] || ""}</span><input maxlength="1" data-a="${ch}" autocomplete="off" autocapitalize="characters" aria-label="Row ${r + 1}, column ${c + 1}"></td>` : `<td class="bk"></td>`;
  const list = d => clues.filter(x => x.d === d).map(x => `<li><b>${x.n}</b> ${esc(x.clue)} (${x.w.length})</li>`).join("");
  return page(`Crossword: The ${R.code} Gazette`, `<p class="mute"><a href="/${R.code}">‹ ${R.code} ${R.place}</a></p><h1>🧩 Today's crossword</h1>
<p class="mute">${esc(fmtDate(day))} · A new one every day, with a few local words in the mix.</p>
<table class="cw" role="grid">${grid.map((row, r) => `<tr>${row.map((ch, c) => cell(ch, r, c)).join("")}</tr>`).join("")}</table>
<p><button type="button" id="cwcheck">Check</button> <button type="button" id="cwshow" class="ghost">Show answers</button> <span id="cwmsg" class="mute"></span></p>
<div class="row cwl"><div><h2>Across</h2><ol>${list("across")}</ol></div><div><h2>Down</h2><ol>${list("down")}</ol></div></div>
<script>(function(){var I=[].slice.call(document.querySelectorAll('.cw input')),M=document.getElementById('cwmsg');
I.forEach(function(x,i){x.oninput=function(){x.value=x.value.toUpperCase().replace(/[^A-Z]/g,'');x.classList.remove('bad');if(x.value&&I[i+1])I[i+1].focus()}});
document.getElementById('cwcheck').onclick=function(){var bad=0,empty=0;I.forEach(function(x){if(!x.value)empty++;else if(x.value!==x.dataset.a){bad++;x.classList.add('bad')}});
M.textContent=bad?bad+' not quite right (in red).':empty?'So far so good! '+empty+' to go.':'🎉 Solved! Same time tomorrow?'};
document.getElementById('cwshow').onclick=function(){I.forEach(function(x){x.value=x.dataset.a;x.classList.remove('bad')});M.textContent='Answers shown. A fresh one tomorrow.'};})();</script>`, R.code);
};

// ---- My home: bin night + a house-sitter sheet. Everything stays on the phone; nothing is sent to us. ----
const homePage = () => page("My home", `<p class="mute"><a href="/${R.code}">‹ ${R.code}</a></p><h1>🏡 My home</h1>
<p>Handy home info, saved on <b>your phone only</b>. Nothing here is sent to us.</p>
<h2>🗑️ Bin night</h2><div class="row"><div><label>Bins go out</label><select id="bday"><option value="">Choose…</option>${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((d, i) => `<option value="${i}">${d} night</option>`).join("")}</select></div>
<div><label>Every week</label><input id="bweekly" value="Red (general waste)" maxlength="40"></div></div>
<div class="row"><div><label>Alternating bin A</label><input id="balt1" value="Yellow (recycling)" maxlength="40"></div><div><label>Alternating bin B</label><input id="balt2" value="Green (organics)" maxlength="40"></div></div>
<label>Which alternating bin goes out this week?</label><select id="bthis"><option value="1">Bin A</option><option value="2">Bin B</option></select>
<p class="note" id="bnext" hidden></p><p class="mute">${R.binsTip} We'll remind you on your ${R.code} page the day bins go out.</p>
<h2>🧳 House-sitter sheet</h2><p>Going away? Fill in what a house-sitter needs, then print or share it.</p>
<p class="note">⚠️ Please don't put passwords, alarm codes or where the spare key is in here.</p>
${[["pets", "Pets: names, feeding, walks", 3], ["plants", "Plants and garden: what needs water and when", 2], ["routine", "House routine: mail, blinds, lights, pool", 3], ["contact", "Who to call if something goes wrong (name and phone)", 2], ["notes", "Anything else they should know", 3]].map(([id, l, r]) => `<label>${l}</label><textarea data-hs="${id}" rows="${r}" maxlength="600"></textarea>`).join("")}
<p class="row"><button type="button" id="hsprint">🖨️ Print</button><button type="button" id="hsshare" style="background:var(--soft);color:var(--fg)">📤 Share or copy</button></p>
<p class="mute">Your sheet automatically includes bin night, emergency numbers, the council's 24/7 line and links to what's open nearby.</p>
<div id="hsout" class="hsout"></div>
<script>(function(){function g(k){try{return localStorage.getItem(k)}catch(e){return null}}function p(k,v){try{localStorage.setItem(k,v)}catch(e){}}
var F=['bday','bweekly','balt1','balt2'];F.forEach(function(id){var el=document.getElementById(id),v=g('bin_'+id);if(v!==null)el.value=v;el.onchange=el.oninput=function(){p('bin_'+id,el.value);nb()}});
var bt=document.getElementById('bthis');bt.onchange=function(){var d=new Date(),wk=Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5+4)/7);p('bin_anchor',JSON.stringify([wk,+bt.value]));nb()};
function binInfo(){var day=g('bin_bday');if(day===null||day==='')return null;var d=new Date(),diff=(+day-d.getDay()+7)%7,n=new Date(d);n.setDate(d.getDate()+diff);
var wk=Math.floor((Date.UTC(n.getFullYear(),n.getMonth(),n.getDate())/864e5+4)/7),a=null;try{a=JSON.parse(g('bin_anchor'))}catch(e){}var alt=a?((wk-a[0])%2===0?a[1]:3-a[1]):1;
return{diff:diff,text:(g('bin_bweekly')||'Red (general waste)')+' + '+(alt==1?(g('bin_balt1')||'Yellow (recycling)'):(g('bin_balt2')||'Green (organics)'))}}
function nb(){var i=binInfo(),o=document.getElementById('bnext');if(!i){o.hidden=true;return}o.hidden=false;o.textContent='🗑️ '+(i.diff===0?'Tonight':i.diff===1?'Tomorrow night':'In '+i.diff+' days')+': '+i.text}
nb();document.querySelectorAll('[data-hs]').forEach(function(t){t.value=g('hs_'+t.dataset.hs)||'';t.oninput=function(){p('hs_'+t.dataset.hs,t.value)}});
function sheet(){var i=binInfo(),L=['HOUSE-SITTER SHEET','',i?'Bin night: '+['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][+g('bin_bday')]+' night. Next: '+i.text:''];
document.querySelectorAll('[data-hs]').forEach(function(t){if(t.value.trim())L.push('',t.previousElementSibling.textContent.toUpperCase(),t.value.trim())});
L.push('','EMERGENCIES: call 000','${R.council.urgent}','What\\u2019s open nearby: '+location.origin+'/open','Fire and weather alerts: '+location.origin+'/${R.code}');return L.filter(function(x,j){return x!==''||j>0}).join('\\n')}
document.getElementById('hsprint').onclick=function(){var o=document.getElementById('hsout');o.textContent=sheet();window.print()};
document.getElementById('hsshare').onclick=function(){var t=sheet();if(navigator.share)navigator.share({title:'House-sitter sheet',text:t}).catch(function(){});else if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){document.getElementById('hsshare').textContent='✓ Copied'})}})();</script>`, R.code);

// ---- Community notice board: legit local notices only (no buy/swap/sell), approved in admin, 30 days, interest alerts by push ----
const NCATS = { lost: "🐾 Lost & found", volunteer: "🤝 Volunteers wanted", groups: "👥 Clubs & groups", classes: "🎨 Classes & workshops", help: "🙋 Help a neighbour", news: "📣 Neighbourhood news" };
const noticeItem = n => `<li class="idea"><div><span class="tagg">${NCATS[n.cat] || ""}</span> <b>${esc(n.title)}</b><br>${esc(n.body)}${n.reach ? `<br><span class="mute">Contact: ${esc(n.reach)}</span>` : ""}<br><small class="mute">${esc(n.who)} · posted ${esc(fmtDate(n.at.slice(0, 10)))}</small></div></li>`;
async function noticesPage(env, msg = "") {
  const since = new Date(Date.now() - 30 * 864e5).toISOString(), list = [];
  for (const { name } of await klist(env, "notice:")) { const n = await env.DATA.get(name, "json"); if (n && n.at >= since) list.push(n); }
  list.sort((a, b) => b.at.localeCompare(a.at));
  return page("Community notice board", `<p class="mute"><a href="/${R.code}">‹ ${R.code}</a></p><h1>📌 Community notice board</h1>
<p>Real notices from real locals: lost pets, volunteers, clubs, classes, neighbours helping neighbours. <b>No buying, selling or ads.</b> Every notice is checked before it goes up and comes down after 30 days.</p>${msg}
<div class="note">🔔 <b>Tell me when there's a notice about…</b><div class="chips" id="nint">${Object.entries(NCATS).map(([k, l]) => `<label><input type="checkbox" value="${k}"> ${l}</label>`).join("")}</div>
<button type="button" id="nsub">Turn on notice alerts</button><br><small class="mute" id="nmsg"></small></div>
<div class="pills" id="nf"><button type="button" class="on" data-c="">All</button>${Object.entries(NCATS).map(([k, l]) => `<button type="button" data-c="${k}">${l}</button>`).join("")}</div>
<ul class="ideas" id="nlist">${list.map(n => noticeItem(n).replace('<li class="idea">', `<li class="idea" data-c="${n.cat}">`)).join("") || '<li class="mute">No notices yet. Be the first!</li>'}</ul>
<h2>Post a notice (free)</h2><details><summary><b>Post a notice</b></summary><form method="post" action="/notices"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<label>Type *</label><select name="cat" required>${Object.entries(NCATS).map(([k, l]) => `<option value="${k}">${l}</option>`).join("")}</select>
<label>Headline *</label><input name="title" required maxlength="80" style="width:100%" placeholder="e.g. Lost: grey cat, Toormina">
<label>Details *</label><textarea name="body" rows="4" required maxlength="500"></textarea>
<label>Your name or group *</label><input name="who" required maxlength="60" style="width:100%">
<label>How people can reach you (shown publicly, optional)</label><input name="reach" maxlength="100" style="width:100%" placeholder="e.g. 0400 000 000, or a club website">
<label>Your email (to check it's legit, never shown) *</label><input type="email" name="contact" required style="width:100%">
<p class="mute">No buying, selling, ads, politics or personal disputes. Notices that break the rules won't be posted. See <a href="/charter">our charter</a>.</p><p><button>Submit notice</button></p></form></details>
<script>(function(){var nf=document.getElementById('nf');nf.onclick=function(e){var c=e.target.dataset.c;if(c===undefined)return;nf.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b===e.target)});
document.querySelectorAll('#nlist li[data-c]').forEach(function(li){li.hidden=c&&li.dataset.c!==c})};
var saved=[];try{saved=JSON.parse(localStorage.getItem('nint')||'[]')}catch(e){}document.querySelectorAll('#nint input').forEach(function(c){c.checked=saved.indexOf(c.value)>-1});
function u8(b){b=b.replace(/-/g,'+').replace(/_/g,'/');var r=atob(b+'==='.slice((b.length+3)%4)),a=new Uint8Array(r.length);for(var i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a}
document.getElementById('nsub').onclick=function(){var b=this,m=document.getElementById('nmsg'),t=[].map.call(document.querySelectorAll('#nint input:checked'),function(c){return 'n_'+c.value});
if(!t.length){m.textContent='Tick at least one.';return}if(!('serviceWorker'in navigator)||!('PushManager'in window)){m.textContent='On iPhone: Share, then Add to Home Screen, open ${R.code} from there and try again.';return}
b.disabled=true;Notification.requestPermission().then(function(p){if(p!=='granted')throw 0;return Promise.all([navigator.serviceWorker.ready,fetch('/api/push/key').then(function(r){return r.json()})])})
.then(function(x){return x[0].pushManager.subscribe({userVisibleOnly:true,applicationServerKey:u8(x[1].key)})}).then(function(sub){return fetch('/api/push/sub',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sub:sub,topics:t})})})
.then(function(){try{localStorage.setItem('nint',JSON.stringify(t.map(function(x){return x.slice(2)})))}catch(e){}b.textContent='Alerts on ✓';m.textContent='We\\u2019ll let you know when a matching notice goes up.'})
.catch(function(){b.disabled=false;m.textContent='Alerts weren\\u2019t allowed. You can turn them on in your phone\\u2019s settings.'})}})();</script>`, R.code);
}
async function lodgeNotice(req, env) {
  const f = await req.formData();
  if (f.get("website")) return noticesPage(env);
  const cat = NCATS[f.get("cat")] ? f.get("cat") : null;
  if (!cat || !f.get("title") || !f.get("body") || !f.get("who") || !f.get("contact")) return noticesPage(env, `<p class="note">Please fill in the required details.</p>`);
  const n = { cat, title: String(f.get("title")).slice(0, 80), body: String(f.get("body")).slice(0, 500), who: String(f.get("who")).slice(0, 60), reach: String(f.get("reach") || "").slice(0, 100),
    contact: String(f.get("contact")).slice(0, 120), at: new Date().toISOString() };
  await env.DATA.put(`npending:${crypto.randomUUID().slice(0, 8)}`, JSON.stringify(n));
  return noticesPage(env, `<p class="note">Thanks! We'll check your notice and post it soon.</p>`);
}

export default {
  async scheduled(evt, env, ctx) {
    initRegion(env);
    if (evt.cron === "*/5 * * * *") return ctx.waitUntil(pushBatch(env));
    const TTL = { fires: 25, warnings: 25, news: 55, holidays: 24 * 60 }; // minutes; keeps storage writes inside the free allowance
    const due = async k => { const v = await env.DATA.get("src:" + k, "json"); return !v || Date.now() - new Date(v.asof) > (TTL[k] || 25) * 6e4; };
    ctx.waitUntil(Promise.all([...Object.keys(SOURCES).map(async k => (await due(k)) && refreshSource(env, k)), checkFields(env), checkWatched(env), refreshObits(env), refreshLotto(env), refreshVenues(env), refreshShop(env), refreshProject(env), refreshFlights(env)]));
  },
  async fetch(req, env, ctx) {
    initRegion(env);
    try { return await route(req, env, ctx); }
    catch (e) { console.log("page error", String(e)); return page("Back soon", `<h1>Back in a moment</h1><p>Something hiccuped on our end. Try again in a minute.</p><p><a href="/">Home</a></p>`); }
  },
};
async function route(req, env, ctx) {
  {
    const url = new URL(req.url), p = url.pathname;
    if (p === "/") return town(R.code, env, ctx, true);
    if (p === "/towns") return home(env);
    if (p === "/signin") return signinPage(env, safeNext(url.searchParams.get("next") || "/"));
    if (p === "/auth/google") return startGoogle(url, env);
    if (p === "/auth/google/callback") return finishGoogle(req, url, env);
    if (p === "/welcome") return welcomePage(url);
    if (p === "/optin" && req.method === "POST") return optin(req, env);
    if (p === "/signout") return signout(req, env);
    if (p === "/new") return newPage(env);
    if (p === "/api/rate" && req.method === "POST") return rate(req, env, ctx);
    if (p.startsWith("/api/push/") || p === "/api/alert") { const r = await pushApi(req, env, p); if (r) return r; }
    if (p === "/open") return openPage();
    if (p === "/api/open") return openApi(req, env);
    if (p === "/" + R.why.slug) return whyPage();
    if (p === "/crossword") return crosswordPage();
    if (p === "/home") return homePage();
    if (p === "/notices") return req.method === "POST" ? lodgeNotice(req, env) : noticesPage(env);
    if (p === "/about") return about(env);
    if (p === "/api/fuel") return fuelApi(req, env);
    if (p === "/me") return mePage();
    if (p === "/mav" && req.method === "POST") return mav(req, env);
    if (p === "/api/mav" && req.method === "POST") return mavChat(req, env);
    if (p === "/api/flights") return Response.json(await env.DATA.get("flights", "json") || { list: null }, { headers: { "access-control-allow-origin": "*", "cache-control": "max-age=300" } });
    if (p === "/faq") return faqPage();
    if (p === "/robots.txt") return robotsTxt();
    if (p === "/sitemap.xml") return sitemapXml();
    if (p === "/llms.txt") return llmsTxt();
    if (p === "/celebrations") return req.method === "POST" ? lodgeJoy(req, env, ctx) : joyPage(env);
    if (p === "/rip") return req.method === "POST" ? lodgeRip(req, env) : ripPage(env);
    if (p === "/genalpha") return genAlpha();
    if (p === "/charter") return charter();
    if (p === "/privacy") return privacy();
    if (p === "/birthday") return req.method === "POST" ? lodgeOffer(req, env) : birthdayPage(env);
    if (p === "/suggest") return req.method === "POST" ? suggest(req, env, ctx) : suggestPage();
    if (p === "/feedback") return req.method === "POST" ? feedback(req, env, ctx) : feedbackPage(env);
    if (p === "/vote" && req.method === "POST") return vote(req, env);
    if (p === "/school") return schoolPage();
    if (p === "/fridge") return (await member(req, env)) ? fridgePage() : unlockPage();
    if (p === "/unlock" && req.method === "POST") return unlock(req, env);
    if (p === "/api/fridge-photo" && req.method === "POST") return fridgePhoto(req, env).catch(() => Response.json({ error: "Couldn’t read that one. Tick what you’ve got below." }));
    if (p === "/admin") return admin(req, env);
    if (p === "/submit") return req.method === "POST" ? handleSubmit(req, env) : submitForm((url.searchParams.get("pc") || R.code).replace(/\D/g, "").slice(0, 4));
    if (p === "/subscribe" && req.method === "POST") return handleSubscribe(req, env);
    if (p === "/icon.svg") return new Response(ICON(), { headers: { "content-type": "image/svg+xml" } });
    if (p === "/manifest.webmanifest") return new Response(MANIFEST(), { headers: { "content-type": "application/manifest+json" } });
    if (p === "/sw.js") return new Response(SW(), { headers: { "content-type": "text/javascript" } });
    const m = p.match(/^\/(\d{4})\/?$/);
    if (m) return town(m[1], env, ctx);
    return page("Not found", `<h1>Not found</h1><p><a href="/">Back to ${R.code}</a></p>`);
  }
}

// A new thought every visit. Who said it shows on hover, so the quote does the talking.
function quoteBlock() {
  const [q, who, ref] = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  return `<blockquote class="quote" title="${esc(who + (ref ? " · " + ref : ""))}">“${esc(q)}”</blockquote>`;
}

// Email us (feedback, postcode requests). Never blocks the page.
function mailUs(env, ctx, subject, body, replyTo) {
  if (!env.MAILER || !env.FEEDBACK_TO) return;
  ctx.waitUntil((async () => {
    try {
      const { EmailMessage } = await import("cloudflare:email");
      const from = `feedback@${R.domain}`, clean = x => String(x).replace(/[\r\n]+/g, " ");
      const raw = [`From: ${R.brand} <${from}>`, `To: ${env.FEEDBACK_TO}`, replyTo ? `Reply-To: ${clean(replyTo)}` : "",
        `Subject: ${clean(subject)}`, `Message-ID: <${crypto.randomUUID()}@${R.domain}>`, `Date: ${new Date().toUTCString()}`,
        "MIME-Version: 1.0", "Content-Type: text/plain; charset=utf-8", "", body].filter(Boolean).join("\r\n");
      await env.MAILER.send(new EmailMessage(from, env.FEEDBACK_TO, raw));
    } catch (e) { console.log("email failed", e); }
  })());
}

// ---- Suggest a postcode: we build Gazettes for rural and community Australia on request ----
const LIVE_CODES = () => Object.values(REGIONS).flatMap(x => Object.keys(x.towns || {}));
function suggestPage(msg = "") {
  return page("Get a Gazette for your town", `<h1>📮 Get a Gazette for your town</h1>
<p>We're here to help rural and community Australia. If your postcode isn't on our list yet, tell us and we'll build your Gazette. It doesn't take us long, and it's free, like all of them.</p>
<p class="mute">Already running: ${Object.values(REGIONS).map(x => `<a href="https://${esc(x.domain)}/">${esc(x.code)} ${esc(x.place)}</a>`).join(" · ")}</p>${msg}
<form method="post" action="/suggest"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<div class="row"><input name="pc" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="Postcode *" required><input name="town" maxlength="60" placeholder="Town *" required></div>
<label>Anything we should know? (optional)</label><textarea name="note" rows="3" maxlength="600" placeholder="Local paper closed down, best sources for news, who to talk to…"></textarea>
<input type="email" name="email" maxlength="120" placeholder="Your email, so we can tell you when it's live (optional)" style="width:100%">
<p><button>Suggest my postcode</button></p></form>`);
}
async function suggest(req, env, ctx) {
  const f = await req.formData();
  if (f.get("website")) return suggestPage(`<p class="note">Thanks!</p>`);
  const pc = String(f.get("pc") || "").trim(), town = String(f.get("town") || "").trim().slice(0, 60);
  const note = String(f.get("note") || "").slice(0, 600), email = String(f.get("email") || "").trim().slice(0, 120);
  if (!/^\d{4}$/.test(pc) || !town) return suggestPage(`<p class="note">Please add a 4-digit postcode and your town.</p>`);
  if (LIVE_CODES().includes(pc)) { const r = Object.values(REGIONS).find(x => x.towns && x.towns[pc]); return suggestPage(`<p class="note">Good news: ${esc(pc)} is already covered by <a href="https://${esc(r.domain)}/${esc(pc)}">The ${esc(r.code)} Gazette</a>.</p>`); }
  const k = "pcsug:" + pc, cur = (await env.DATA.get(k, "json")) || { pc, towns: [], count: 0, emails: [], notes: [] };
  cur.count++; cur.at = new Date().toISOString();
  if (!cur.towns.includes(town)) cur.towns = [...cur.towns, town].slice(-10);
  if (email && !cur.emails.includes(email)) cur.emails = [...cur.emails, email].slice(-50);
  if (note.trim()) cur.notes = [...cur.notes, note].slice(-10);
  await env.DATA.put(k, JSON.stringify(cur));
  mailUs(env, ctx, `Gazette request: ${pc} ${town} (${cur.count} so far)`, `Postcode: ${pc}\nTown: ${town}\nAsked ${cur.count} time(s)\n\n${note}\n\nEmail: ${email || "(none)"}\nVia ${R.domain}`, email);
  return suggestPage(`<p class="note">Thanks! ${esc(pc)} ${esc(town)} is on our list${cur.count > 1 ? ` (${cur.count} locals have asked)` : ""}.${email ? " We'll email you when it's live." : ""}</p>`);
}

// ---- Horoscopes: Western and Eastern, just for fun ----
function starsBlock() {
  const d = todayISO(), sn = seasonOf(d), w = readings(d, "w"), e = readings(d, "e"), cy = ((new Date().getFullYear() - 4) % 12 + 12) % 12;
  const row = (ico, name, sub, r, on) => `<li${on ? ' class="on"' : ''}><span class="zs">${ico}</span><span><b>${esc(name)}</b> <small class="mute">${esc(sub)}</small><br>${esc(r.text)} <small class="mute">Lucky number ${r.lucky}.</small></span></li>`;
  return `<section id="stars"><h2>✨ Horoscopes</h2><p><b>Your stars for ${esc(new Date(d + "T00:00:00").toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" }))}</b>. ${esc(moonLine(d))}</p>
<p class="note">${WEST[sn][0]} It's <b>${WEST[sn][1]} season</b> (${WEST[sn][2]}). Happy birthday to every ${WEST[sn][1]} in ${esc(R.short)}!</p>
<p class="mute">Just for fun, and always on the bright side. New every morning.</p>
<h3>Western: by birthday</h3><ul class="zod">${WEST.map(([i, n, dt], k) => row(i, n, dt, w[k], k === sn)).join("")}</ul>
<h3>Eastern: by year you were born</h3><p class="mute">This is the Year of the ${EAST[cy][1]} ${EAST[cy][0]}. The Chinese zodiac year starts at Lunar New Year, so if you were born in January or early February, you may belong to the year before.</p>
<ul class="zod">${EAST.map(([i, n], k) => row(i, n, eastYears(k), e[k], k === cy)).join("")}</ul></section>`;
}

// ---- Was this useful? 👍/👎 per page, plus "did we mess up?" notes ----
async function rate(req, env, ctx) {
  let b = {}; try { b = await req.json(); } catch (e) {}
  const p = String(b.p || "/").slice(0, 80).replace(/[^\w\/-]/g, "") || "/";
  if (b.v === "up" || b.v === "down") { const k = "rate:" + p, c = (await env.DATA.get(k, "json")) || { up: 0, down: 0 }; c[b.v]++; await env.DATA.put(k, JSON.stringify(c)); }
  const note = String(b.note || "").trim().slice(0, 800), email = String(b.email || "").trim().slice(0, 120);
  if (note) {
    const fb = { kind: "We messed up (page " + p + ")", msg: note, name: "", email, at: new Date().toISOString() };
    await env.DATA.put(`fb:${fb.at}:${crypto.randomUUID().slice(0, 6)}`, JSON.stringify(fb));
    mailUs(env, ctx, `${R.code}: someone says we got something wrong on ${p}`, `Page: https://${R.domain}${p}\n\n${note}\n\nEmail: ${email || "(none)"}`, email);
  }
  return Response.json({ ok: true });
}

// ---- Births & marriages: family notices, shared by the family, checked by us before they appear ----
const JOY = { birth: ["👶", "Birth"], engagement: ["💍", "Engagement"], wedding: ["💒", "Wedding"], anniversary: ["🥂", "Anniversary"] };
const joyItem = n => `<li><b>${JOY[n.kind][0]} ${esc(n.title)}</b><br><span class="mute">${JOY[n.kind][1]} · ${esc(fmtDate(n.date))}</span>${n.msg ? `<br>${esc(n.msg)}` : ""}</li>`;
async function joyWithin(env, days) {
  const cut = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10), out = [];
  for (const { name } of await klist(env, "joy:")) { if (name.slice(4, 14) < cut) continue; const n = await env.DATA.get(name, "json"); if (n) out.push({ id: name, ...n }); }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}
async function joyBlock(env) {
  const list = await joyWithin(env, 30);
  return `<section id="joy"><h2>🎉 Births &amp; marriages</h2><p class="mute">New babies, engagements, weddings and big anniversaries, shared by local families.</p>
${list.length ? `<ul>${list.slice(0, 8).map(joyItem).join("")}</ul>` : `<p class="mute">No new notices this month yet.</p>`}<p><a href="/celebrations">Share your family's news (free) →</a></p></section>`;
}
async function joyPage(env, msg = "") {
  const list = await joyWithin(env, 90);
  return page("Births & marriages", `<p class="mute"><a href="/${R.code}">‹ ${R.code} ${R.place}</a></p><h1>🎉 Births &amp; marriages</h1>
<p>New babies, engagements, weddings and big anniversaries from around ${esc(R.place)}. Congratulations to every family here.</p>${msg}
<ul>${list.map(joyItem).join("") || '<li class="mute">No notices in the last three months yet. Be the first to share some good news.</li>'}</ul>
<h2>Share your family's news</h2><p class="mute">Free, always. Notices come from family, and we check every one before it goes up. Please use names only: no addresses, and no times or hospital details for babies.</p>
<form method="post" action="/celebrations"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<label>What are you celebrating? *</label><select name="kind" style="width:100%">${Object.entries(JOY).map(([k, v]) => `<option value="${k}">${v[0]} ${v[1]}</option>`).join("")}</select>
<label>Headline *</label><input name="title" required maxlength="90" placeholder="e.g. Welcome, baby Mia Nguyen! or Sam &amp; Priya are engaged" style="width:100%">
<label>Date *</label><input type="date" name="date" required max="${todayISO()}">
<label>A few words (optional)</label><textarea name="msg" rows="3" maxlength="280" placeholder="e.g. Proud parents Jess and Tom, and big brother Leo. Born at 3.4 kg."></textarea>
<label>Your email (so we can check, never shown) *</label><input type="email" name="contact" required maxlength="120" style="width:100%">
<label class="row"><input type="checkbox" name="ok" value="1" required style="width:auto"> I'm family, and everyone named is happy for this to be shared.</label>
<p><button>Send our news</button></p></form>`, R.code);
}
async function lodgeJoy(req, env, ctx) {
  const f = await req.formData(), kind = String(f.get("kind") || ""), date = String(f.get("date") || ""), title = String(f.get("title") || "").trim();
  if (f.get("website") || !JOY[kind] || !title || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date > todayISO() || !f.get("ok") || !f.get("contact")) return joyPage(env, `<p class="note">Please fill in the required details and tick the box.</p>`);
  const n = { kind, title: title.slice(0, 90), date, msg: String(f.get("msg") || "").trim().slice(0, 280), contact: String(f.get("contact")).slice(0, 120), at: new Date().toISOString() };
  await env.DATA.put(`jpending:${todayISO()}:${crypto.randomUUID().slice(0, 8)}`, JSON.stringify(n));
  mailUs(env, ctx, `${R.code}: new ${JOY[kind][1].toLowerCase()} notice to check`, `${n.title}\n${n.date}\n${n.msg}\n\nFrom: ${n.contact}\nApprove in admin: https://${R.domain}/admin`, n.contact);
  return joyPage(env, `<p class="note">Congratulations! 🎉 We'll check your notice and it'll appear here soon.</p>`);
}

// ---- FAQ: a long, plain-English question list for search engines and AI assistants (LLMs). Quietly linked. ----
function faqList() {
  const news = R.news.map(n => n.name).join(", "), homes = (R.funerals || []).map(f => f.name).join(" and "), G = `The ${R.code} Gazette`, base = `https://${R.domain}`;
  const places = [[R.place + " and the shire", R.code], ...Object.entries(TOWNS).filter(([, t]) => t.live).map(([pc, t]) => [t.name + " (" + pc + ")", pc])];
  const out = [];
  for (const [T, pc] of places) {
    const u = `${base}/${pc}`;
    out.push([T, [
      [`What's on in ${T} this weekend?`, `${G} lists local events for ${T} every day: markets, live music, kids' activities and community events, with free and low-cost events first. Every listing costs $50 or less per person. See ${u}#events.`],
      [`Where can I find local news for ${T}?`, `${G} gathers today's local headlines from ${news}, with a short summary and a link to the full story on the publisher's site. See ${u}#news.`],
      [`Where can I find obituaries and funeral notices in ${T}?`, `The In memory section of ${G} lists recent death notices for the area${homes ? `, sourced from local funeral directors including ${homes}` : ""}, with a link to each official notice. See ${base}/rip.`],
      [`Where can I find birth, engagement and wedding notices in ${T}?`, `${G} has a free Births & marriages section where local families share new babies, engagements, weddings and anniversaries. Every notice is checked before it appears. See ${base}/celebrations.`],
      [`What's the weather in ${T} today?`, `${G} shows today's temperature, rain chance, wind, sunrise and sunset for ${T}, plus practical tips like when to take a raincoat or wear sunscreen. See ${u}.`],
      [`What are the tide times in ${T} today?`, `${G} shows the next high and low tides, wave and swell height for ${T}. Tide times are modelled estimates, not for navigation. See ${u}#sea.`],
      [`Where is the cheapest fuel in ${T}?`, `${G} shows today's cheapest fuel near ${T} by type (E10, unleaded, premium and diesel), using the NSW Government's FuelCheck prices. See ${u}#fuel.`],
      [`What's the surf like in ${T} today?`, `${G} shows wave height, swell, sea temperature, wind and UV for local beaches, with tips like whether today suits beginners or big-wave surfers. See ${u}#beaches.`],
      [`Is it safe to swim at the beach in ${T}?`, `Always swim between the red and yellow flags at a patrolled beach. ${G} links to Beachsafe for patrol times and shows today's wave and UV conditions. See ${u}#beaches.`],
      [`When is bin night in ${T}?`, `${G} has a free bin night reminder for ${T}. Bin collections are run by ${R.council.name}. See ${base}/home.`],
      [`How do I contact ${R.council.name}?`, `${R.council.name} is on ${R.council.phone} and at ${R.council.url}. ${R.council.urgent}.`],
      [`What flights are arriving and leaving ${R.airport.name} today?`, `${G} shows today's flights for ${R.airport.name}. See ${u}#flights.`],
      [`When are the next public holidays and school holidays for ${T}?`, `${G} lists the next NSW public holidays and school holidays, with how many days away each one is. See ${u}#holidays.`],
      [`Where can I check the latest Lotto results in ${T}?`, `${G} shows the latest draw results for Saturday Lotto, Oz Lotto, Powerball and more, from The Lott. See ${u}#lotto.`],
      [`Is there a local crossword for ${T}?`, `Yes. ${G} has a free daily crossword with local clues, the same for everyone each day. See ${base}/crossword.`],
      [`Where can I read today's horoscope in ${T}?`, `${G} has free daily horoscopes, Western and Chinese zodiac, always on the bright side. See ${u}#stars.`],
      [`What's open now in ${T}?`, `${G} shows pharmacies, mechanics, servos, cafés and more near ${T}, with open places first. See ${base}/open.`],
      [`What can kids do in ${T} this weekend?`, `${G} has a Weekend for kids section with free playgrounds, library activities and family events near ${T}. See ${u}#kids.`],
      [`How do I report a lost or found pet in ${T}?`, `Post it free on the ${G} community notice board, which also lists volunteers, clubs and classes. See ${base}/notices.`],
      [`Are there any bushfires near ${T}?`, `${G} lists fires within 100 km of ${T} from NSW Rural Fire Service, and current Bureau of Meteorology weather warnings. In an emergency, call 000. See ${u}#alerts.`],
      [`Whose traditional land is ${T} on?`, `${R.ack.replace(/^The \d+ Gazette acknowledges/, "We acknowledge").replace(" and pays respect", " and pay respect")} You can explore the Map of Indigenous Australia at aiatsis.gov.au.`],
      [`How do I list an event in ${T}?`, `Add it free at ${base}/submit?pc=${pc}. Events must cost $50 or less per person.`],
      [`Which local places give birthday deals in ${T}?`, `${G} lists local places that look after you on your birthday. See ${base}/birthday.`],
      [`What can I cook for dinner tonight with what's in my fridge?`, `Tell ${G}'s fridge helper what you've got and how many you're feeding, and get dinner ideas in seconds. See ${base}/fridge.`],
      [`When is the next full moon in ${T}?`, `${G} shows the moon phase and days until the next full moon, plus meteor showers and sky events in the next week. See ${u}.`],
    ]]);
  }
  out.push(["About the Gazette", [
    [`What is ${G}?`, `${G} is a free daily community paper for ${R.place} and the shire: local news, events, alerts, tides, fuel, flights, lotto, a crossword, horoscopes, In memory, and births and marriages, all on one page. ${R.coverage}`],
    [`Is ${G} free?`, `Yes, always. No paywalls, no subscriptions and no fees to list an event or notice. The website is ad-free.`],
    [`Who runs ${G}?`, `${G} is a free gift to the community from Maverick Digital, a Coffs Harbour business that uses big tech skills for the community.`],
    [`Where does ${G} get its information?`, `Every item names its source and shows when it was last updated, from local news outlets, NSW Government services, the Bureau of Meteorology, NSW Rural Fire Service, local funeral directors and local families. One policy: no BS. No opinions, no spin.`],
    [`Can I get a Gazette for my town?`, `Yes. Any town in rural and community Australia can ask for its own Gazette at ${base}/suggest.`],
    [`What other Gazettes are there?`, Object.values(REGIONS).map(x => `The ${x.code} Gazette covers ${x.place}`).join("; ") + "."],
  ]]);
  return out;
}
function faqPage() {
  const groups = faqList(), all = groups.flatMap(g => g[1]);
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: all.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  return page(`Questions about ${R.place}`, `<p class="mute"><a href="/">‹ ${R.code}</a></p><h1>Questions about ${esc(R.place)} and the shire</h1>
<p class="mute">Quick answers to what locals ask most. Tap a question to open it.</p>
${groups.map(([g, qs]) => `<h2>${esc(g)}</h2>${qs.map(([q, a]) => `<details class="faq"><summary>${esc(q)}</summary><p>${esc(a).replace(/(https:\/\/[^\s,]+?)(?=[.,]?(\s|$))/g, '<a href="$1">$1</a>')}</p></details>`).join("")}`).join("")}
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`, R.code);
}
const robotsTxt = () => new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: https://${R.domain}/sitemap.xml\n`, { headers: { "content-type": "text/plain" } });
function sitemapXml() {
  const b = `https://${R.domain}`, paths = ["/", ...Object.keys(TOWNS).filter(k => TOWNS[k].live).map(k => "/" + k), "/faq", "/rip", "/celebrations", "/crossword", "/notices", "/open", "/home", "/birthday", "/fridge", "/" + R.why.slug, "/about", "/charter", "/privacy", "/suggest"];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(x => `<url><loc>${b}${x}</loc><changefreq>daily</changefreq></url>`).join("")}</urlset>`, { headers: { "content-type": "application/xml" } });
}
function llmsTxt() {
  const g = faqList();
  return new Response(`# The ${R.code} Gazette\n\n> A free daily community paper for ${R.place} and the shire (${Object.keys(TOWNS).join(", ")}), from Maverick Digital. Every item names its source. One policy: no BS.\n\n` +
    g.map(([h, qs]) => `## ${h}\n\n` + qs.map(([q, a]) => `- ${q} ${a}`).join("\n")).join("\n\n") + "\n", { headers: { "content-type": "text/plain; charset=utf-8" } });
}

// ---- What's on at the pubs, clubs and markets: we read each venue's own page twice a day and pull out
// weekly specials (schnitzel night, members draw, bingo, trivia, raffles) and dated gigs. Only things that
// really appear on the page are kept. Admin can add more venue pages. ----
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const KINDS = { meal: "🍽️", members: "🎟️", bingo: "🎱", raffle: "🎁", trivia: "🧠", music: "🎵", comedy: "😂", market: "🧺", kids: "🧒", sport: "🏉", other: "📌" };
async function venueSources(env) { let extra = []; try { extra = (await env.DATA.get("vsrc:list", "json")) || []; } catch (e) {} return [...(R.venues || []), ...extra]; }
const vkey = u => "venue:" + u.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "-").slice(0, 80);
async function refreshVenues(env) {
  const list = await venueSources(env), today = todayISO();
  let done = 0;
  for (const src of list) {
    if (done >= 3) break;                                   // a few per run keeps us inside the free limits
    const k = vkey(src.url), old = await env.DATA.get(k, "json");
    if (old && Date.now() - new Date(old.tried || old.asof) < 12 * 3600e3) continue;
    done++;
    try {
      const html = await (await fetch(src.url, { headers: UA })).text();
      const txt = dec(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<nav[\s\S]*?<\/nav>|<footer[\s\S]*?<\/footer>|<header[\s\S]*?<\/header>/g, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&rsquo;|&lsquo;/g, "'").replace(/&ndash;|&mdash;/g, "-")).replace(/\s+/g, " ").slice(0, 12000);
      const ask = { messages: [
        { role: "system", content: "You extract what's on at local venues from web page text. Output ONLY JSON." },
        { role: "user", content: `Today is ${today} (${DAYS[new Date(today + "T12:00:00Z").getUTCDay()]}). This page is from ${src.name}. List everything the public can go to: weekly specials (meal deals like schnitzel night), members draws, bingo, raffles, trivia, live music, comedy, markets, kids' activities and one-off events. Return {"items":[...]} with at most 40 items. Each item: "venue" (venue name as written), "what" (short title, words from the page), "detail" (price or one short detail from the page, or ""), "days" (array of weekdays it repeats on, from Mon Tue Wed Thu Fri Sat Sun, or [] if it's a one-off), "date" (YYYY-MM-DD for a one-off, choosing the next such date on or after today, else ""), "week" (for monthly things like "1st Sunday", the number 1-4, else 0), "time" (e.g. "6pm", or ""), "kind" (one of meal members bingo raffle trivia music comedy market kids sport other). Never invent anything that isn't on the page.\n\nPAGE:\n${txt}` },
      ], max_tokens: 2500 };
      let out; try { out = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", ask); } catch (e) { out = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", ask); }
      const raw = typeof out?.response === "string" ? out.response : JSON.stringify(out?.response || {});
      const got = (JSON.parse(raw.match(/\{[\s\S]*\}/)[0]).items || []), low = txt.toLowerCase(), items = [];
      for (const it of got) {
        const what = String(it.what || "").trim().slice(0, 80), detail = String(it.detail || "").trim().slice(0, 120), venue = String(src.venue || it.venue || src.name).trim().slice(0, 60);
        const ws = what.toLowerCase().split(/\W+/).filter(w => w.length > 2); if (!what || !ws.length || ws.filter(w => low.includes(w)).length < Math.ceil(ws.length * 0.6)) continue;   // must come from the page
        if ((detail.match(/\$\d+(\.\d+)?/g) || []).some(m => !txt.includes(m))) continue;                           // prices must be on the page
        if (src.only && !src.only.some(o => venue.toLowerCase().startsWith(o.toLowerCase()))) continue;
        const days = (Array.isArray(it.days) ? it.days : []).map(d => String(d).slice(0, 3)).filter(d => DAYS.includes(d));
        const date = /^\d{4}-\d{2}-\d{2}$/.test(it.date || "") && it.date >= today ? it.date : "";
        if (!days.length && !date) continue;
        items.push({ venue, what, detail, days, date, week: Math.max(0, Math.min(4, +it.week || 0)), time: String(it.time || "").slice(0, 20), kind: KINDS[it.kind] ? it.kind : (src.market ? "market" : "other") });
      }
      await env.DATA.put(k, JSON.stringify(items.length ? { name: src.name, url: src.url, items, asof: new Date().toISOString(), tried: new Date().toISOString() } : { ...(old || { name: src.name, url: src.url, items: [] }), tried: new Date().toISOString() }));
    } catch (e) { await env.DATA.put(k, JSON.stringify({ ...(old || { name: src.name, url: src.url, items: [] }), tried: new Date().toISOString() })); }
  }
}
async function plannerData(env) {
  const out = [];
  for (const src of await venueSources(env)) { const v = await env.DATA.get(vkey(src.url), "json"); if (v) for (const it of v.items) out.push({ ...it, src: v.name, url: v.url, asof: v.asof }); }
  for (const pc of Object.keys(TOWNS).filter(k => TOWNS[k].live)) for (const e of [...await listEvents(env, `event:${pc}:`), ...await listEvents(env, `feed:${pc}:`)])
    out.push({ venue: e.venue || TOWNS[pc].name, what: e.title, detail: "", days: [], date: e.date, week: 0, time: e.time || "", kind: "other", url: e.link || "", src: e.link ? "Event listing" : "Added by a local" });
  return out;
}
async function plannerBlock(env) {
  const data = await plannerData(env);
  return `<section id="tonight"><h2>📅 What's on</h2><p class="mute">Specials, members nights, bingo, trivia, live music, markets and events around ${esc(R.short)}, in one place.</p>
<div class="ptabs" role="tablist"><button type="button" data-p="0" class="on">Today</button><button type="button" data-p="1">Tomorrow</button><button type="button" data-p="w">This weekend</button><label class="pdate">Planning ahead? <input type="date" id="pdate" min="${todayISO()}"></label></div>
<div id="pout"></div>
<p class="src">Read from each venue's own website twice a day. Specials can change, so check with the venue before you go. Know a venue we're missing? <a href="/feedback">Tell us</a>.</p>
<script>(function(){var D=${JSON.stringify(data).replace(/</g, "\\u003c")},K=${JSON.stringify(KINDS)},DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],out=document.getElementById('pout');
function iso(d){return d.toLocaleDateString('en-CA',{timeZone:'Australia/Sydney'})}function at(n){var d=new Date();d.setDate(d.getDate()+n);return d}
function e(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function on(day){var dn=DN[new Date(day+'T12:00:00').getDay()],nth=Math.ceil(+day.slice(8)/7);return D.filter(function(x){return x.date?x.date===day:(x.days.indexOf(dn)>-1&&(!x.week||x.week===nth))})}
function list(day){var it=on(day);if(!it.length)return '<p class="mute">Nothing listed yet for this day.</p>';var g={};it.forEach(function(x){(g[x.venue]=g[x.venue]||[]).push(x)});
return Object.keys(g).sort().map(function(v){return '<div class="pven"><b>'+e(v)+'</b><ul>'+g[v].map(function(x){return '<li>'+(K[x.kind]||'📌')+' '+e(x.what)+(x.time?' <span class="mute">'+e(x.time)+'</span>':'')+(x.detail?' · '+e(x.detail):'')+'</li>'}).join('')+'</ul><span class="src">'+(x0=g[v][0]).src.replace(/[<>]/g,'')+(x0.url?' · <a href="'+e(x0.url)+'" rel="noopener">their page</a>':'')+'</span></div>'}).join('')}var x0;
function head(day){return '<h3>'+new Date(day+'T12:00:00').toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'})+'</h3>'}
function show(p){if(p==='w'){var w=at(0).getDay(),days=w===6?[0,1]:w===0?[0]:[6-w,7-w];out.innerHTML=days.map(function(n){var d=iso(at(n));return head(d)+list(d)}).join('')}else if(p.length>2){out.innerHTML=head(p)+list(p)}else{var d=iso(at(+p));out.innerHTML=head(d)+list(d)}}
document.querySelectorAll('.ptabs button').forEach(function(b){b.onclick=function(){document.querySelectorAll('.ptabs button').forEach(function(x){x.classList.toggle('on',x===b)});document.getElementById('pdate').value='';show(b.dataset.p)}});
document.getElementById('pdate').onchange=function(){if(!this.value)return;document.querySelectorAll('.ptabs button').forEach(function(x){x.classList.remove('on')});show(this.value)};show('0')})();</script></section>`;
}

// ---- Supermarket watch: today's price of five everyday items, from Woolworths' own online prices, checked daily ----
const SHOP = [
  { id: "888137", q: "woolworths full cream milk 2l", label: "Milk, full cream 2L", ico: "🥛" },
  { id: "581172", q: "woolworths white soft sandwich bread 650g", label: "White bread 650g", ico: "🍞" },
  { id: "224762", q: "woolworths 12 pack large free range eggs", label: "Free range eggs, 12 large", ico: "🥚" },
  { id: "814479", q: "cadbury dairy milk chocolate block 180g", label: "Cadbury Dairy Milk 180g", ico: "🍫" },
  { id: "133211", q: "cavendish bananas", label: "Banana (each)", ico: "🍌" },
];
async function refreshShop(env) {
  const old = await env.DATA.get("shop", "json");
  if (old && Date.now() - new Date(old.tried || old.asof) < 20 * 3600e3) return old;
  const items = [];
  for (const it of SHOP) {
    try {
      const j = await (await fetch("https://www.woolworths.com.au/apis/ui/Search/products?searchTerm=" + encodeURIComponent(it.q) + "&pageSize=10", { headers: { ...UA, accept: "application/json" } })).json();
      const p = (j.Products || []).flatMap(x => x.Products || []).find(x => String(x.Stockcode) === it.id);
      if (!p || typeof p.Price !== "number") continue;
      const prev = old && (old.items || []).find(x => x.id === it.id);
      items.push({ id: it.id, label: it.label, ico: it.ico, name: p.Name + (p.PackageSize ? " " + p.PackageSize : ""), price: p.Price, was: p.WasPrice && p.WasPrice > p.Price ? p.WasPrice : 0, cup: p.CupString || "", prev: prev ? (prev.price !== p.Price ? prev.price : prev.prev || 0) : 0 });
    } catch (e) {}
  }
  const now = new Date().toISOString(), v = items.length ? { asof: now, tried: now, items } : { ...(old || { items: [] }), tried: now };
  await env.DATA.put("shop", JSON.stringify(v));
  return v;
}
async function shopBlock(env) {
  const s = await env.DATA.get("shop", "json"), $$ = n => "$" + n.toFixed(2);
  const rows = s && s.items.length ? `<ul class="shop">${s.items.map(i => `<li><span>${i.ico} ${esc(i.label)}</span><b>${$$(i.price)}</b>${i.was ? ` <span class="tagg">On special, was ${$$(i.was)}</span>` : ""}${i.prev && i.prev !== i.price ? ` <small class="mute">${i.price > i.prev ? "▲ up" : "▼ down"} from ${$$(i.prev)}</small>` : ""}</li>`).join("")}</ul>
<p class="src">Woolworths online prices, checked ${esc(asOf(s.asof))}. Prices in store can differ.</p>` : `<p class="mute">Prices are on their way. Check back soon.</p>`;
  return `<section id="shop"><h2>🛒 Supermarket watch</h2><p class="mute">What the everyday basics cost today.</p>${rows}</section>`;
}

// ---- Big local projects (e.g. the Coffs Harbour bypass): the latest weekly update from the project's own page ----
async function refreshProject(env) {
  if (!R.project) return;
  const old = await env.DATA.get("project", "json");
  if (old && Date.now() - new Date(old.tried || old.asof) < 12 * 3600e3) return;
  const now = new Date().toISOString();
  try {
    const html = await (await fetch(R.project.url, { headers: UA })).text();
    const main = (html.match(/<main[\s\S]*?<\/main>/) || [html])[0];
    const txt = dec(main.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<nav[\s\S]*?<\/nav>/g, " ").replace(/<\/(p|li|h\d)>/g, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ")).replace(/[ \t]+/g, " ").replace(/\n\s*/g, "\n").slice(0, 9000);
    const ask = { messages: [
      { role: "system", content: "You summarise official road project updates for locals. Use only facts from the text. Output ONLY JSON." },
      { role: "user", content: `From this ${R.project.name} weekly update page, give {"updated":"date the update is for, as written, or empty","points":[up to 6 short plain-English points about traffic changes, closures, night work and progress, each with the place and dates as written]}. Never add anything that isn't in the text.\n\nTEXT:\n${txt}` }], max_tokens: 900 };
    let out; try { out = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", ask); } catch (e) { out = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", ask); }
    const raw = typeof out?.response === "string" ? out.response : JSON.stringify(out?.response || {}), j = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);
    const low = txt.toLowerCase(), points = (j.points || []).map(x => String(x).slice(0, 220)).filter(x => { const ws = x.toLowerCase().split(/\W+/).filter(w => w.length > 4); return ws.length && ws.filter(w => low.includes(w)).length >= ws.length * 0.6; });
    await env.DATA.put("project", JSON.stringify(points.length ? { asof: now, tried: now, updated: String(j.updated || "").slice(0, 60), points } : { ...(old || { points: [] }), tried: now }));
  } catch (e) { await env.DATA.put("project", JSON.stringify({ ...(old || { points: [] }), tried: now })); }
}
async function projectBlock(env) {
  if (!R.project) return "";
  const p = await env.DATA.get("project", "json");
  return `<section id="bypass"><h2>🚧 ${esc(R.project.name)}</h2>${p && p.points.length ? `${p.updated ? `<p class="mute">Weekly update: ${esc(p.updated)}</p>` : ""}<ul>${p.points.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p class="mute">The latest update is on its way.</p>`}
<p class="src">Info from <a href="${R.project.url}" rel="noopener">Transport for NSW's weekly update</a>${p && p.asof ? `, checked ${esc(asOf(p.asof))}` : ""}. More on the <a href="${R.project.home}" rel="noopener">project page</a>.</p></section>`;
}

// ---- Flights: today's arrivals and departures with live status, from AeroDataBox (needs a FLIGHT_KEY secret) ----
async function refreshFlights(env) {
  if (!env.FLIGHT_KEY || !R.airport.iata || R.airport.feed) return;
  const old = await env.DATA.get("flights", "json"), h = +new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney", hour: "numeric", hour12: false });
  if (h < 5 || h > 21) return;
  if (old && Date.now() - new Date(old.asof) < 55 * 6e4) return;
  try {
    const r = await (await fetch(`https://aerodatabox.p.rapidapi.com/flights/airports/iata/${R.airport.iata}?offsetMinutes=-120&durationMinutes=720&withLeg=false&direction=Both&withCancelled=true&withCodeshared=false&withCargo=false&withPrivate=false&withLocation=false`,
      { headers: { "X-RapidAPI-Key": env.FLIGHT_KEY, "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com" } })).json();
    const map = (l, dir) => (l || []).map(f => ({ dir, no: String(f.number || "").replace(/\s+/g, ""), airline: f.airline?.name || "", other: f.movement?.airport?.name || f.movement?.airport?.iata || "",
      sched: f.movement?.scheduledTime?.local || "", rev: f.movement?.revisedTime?.local || "", status: f.status || "" }));
    const list = [...map(r.departures, "dep"), ...map(r.arrivals, "arr")].filter(f => f.no && f.sched).sort((a, b) => a.sched.localeCompare(b.sched));
    if (list.length || !old) await env.DATA.put("flights", JSON.stringify({ asof: new Date().toISOString(), list }));
  } catch (e) {}
}
async function flightData(env) {
  if (R.airport.feed) { try { return await (await fetch(R.airport.feed)).json(); } catch (e) { return null; } }
  return await env.DATA.get("flights", "json");
}
async function flightsBlock(env) {
  const d = await flightData(env), A = R.airport;
  const tm = s => { if (!s) return ""; const h = +s.slice(11, 13), m = s.slice(14, 16); return (h % 12 || 12) + ":" + m + (h < 12 ? "am" : "pm"); }, late = f => f.rev && f.sched && f.rev.slice(0, 16) !== f.sched.slice(0, 16) ? Math.round((new Date(f.rev.replace(" ", "T")) - new Date(f.sched.replace(" ", "T"))) / 6e4) : 0;
  const st = f => { const m = late(f), s = f.status; if (/cancel/i.test(s)) return `<span class="fl bad">Cancelled</span>`; if (m >= 10) return `<span class="fl warn">Delayed ${m} min</span>`;
    if (/arrived|landed/i.test(s)) return `<span class="fl ok">Landed${f.rev ? " " + tm(f.rev) : ""}</span>`; if (/departed/i.test(s)) return `<span class="fl ok">Departed</span>`; if (/boarding/i.test(s)) return `<span class="fl ok">Boarding</span>`; return `<span class="fl ok">On time</span>`; };
  const now = new Date().toLocaleString("sv-SE", { timeZone: "Australia/Sydney" }).slice(0, 16), up = d && d.list ? d.list.filter(f => (f.rev || f.sched).slice(0, 16) >= now.replace("T", " ").slice(0, 16) || /delay/i.test(f.status)) : [];
  const tbl = (dir, h) => { const l = up.filter(f => f.dir === dir).slice(0, 8); return l.length ? `<h3>${h}</h3><ul class="fls">${l.map(f => `<li><b>${tm(f.sched)}</b> ${esc(f.no)} ${dir === "dep" ? "to" : "from"} ${esc(f.other)} ${st(f)}</li>`).join("")}</ul>` : ""; };
  const board = d && d.list ? (tbl("arr", "Arriving") + tbl("dep", "Departing") || `<p class="mute">No more flights listed today.</p>`) + `<p class="src">Live flight data from AeroDataBox, updated ${esc(asOf(d.asof))}. Check with your airline before you head out.</p>` : "";
  return `<section id="flights"><h2>✈️ Flights at ${esc(A.name)}</h2>${board}
<form class="row" id="flf"><input name="fn" placeholder="Your flight number, e.g. QF2134" autocapitalize="characters" maxlength="10" aria-label="Flight number"><button>Check</button></form><p id="flo"></p>
${board ? "" : `<p class="mute">See everything coming and going at <a href="${A.url}" rel="noopener">${esc(A.name)}</a> (live board on FlightAware).</p>`}
<script>(function(){var L=${JSON.stringify(up.map(f => ({ no: f.no, t: tm(f.sched), dir: f.dir, other: f.other }))).replace(/</g, "\\u003c")};document.getElementById('flf').onsubmit=function(e){e.preventDefault();var f=this.fn.value.replace(/\s+/g,'').toUpperCase();if(!f)return;
var hit=L.filter(function(x){return x.no===f})[0],o=document.getElementById('flo');if(hit){o.innerHTML='<b>'+f+'</b> '+(hit.dir==='dep'?'departs ':'arrives ')+hit.t+'. See its status in the list above.';var li=[].filter.call(document.querySelectorAll('.fls li'),function(x){return x.textContent.indexOf(f)>-1})[0];if(li){li.classList.add('hit');li.scrollIntoView({behavior:'smooth',block:'center'})}}
else window.open('https://www.google.com/search?q='+encodeURIComponent(f+' flight status'),'_blank','noopener')}})();</script></section>`;
}
