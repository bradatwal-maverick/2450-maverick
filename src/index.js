
// One engine, many towns: each Worker sets REGION (default 2450) and gets that town's settings from regions.js.
import { REGIONS } from "./regions.js";
import { withSecrets } from "./secrets.js";
import { BIN_SRC, binsApi, BIN_ITEMS, BINS_JS, BINS_CSS } from "./bins.js";
import { billingApi, tierOf, hasTier, paymentsOn, TIERS } from "./billing.js";
import { NAV, NAV_SLUGS, NAV_CSS, navBar, sectionHead, fixSecLinks } from "./sections.js";
import { ICONS } from "./icons.js";
import { LOVE } from "./love.js";
import { photoOfDay } from "./potd.js";
import { localToday, photosApi } from "./photos.js";
import { sidePics, withPics, SIDE_CSS, THEMES } from "./sidepics.js";
import { numbersApi } from "./numbers.js";
import { edData, edBlock } from "./ed.js";
import { trafficNear, trafficList } from "./traffic.js";
import { nswPage, nswCheckApi } from "./nswgov.js";
import { scamsApi, scamFeeds, scamTeaser } from "./scams.js";
import { helpApi, HELP_UI, HELP_PANEL } from "./helpme.js";
import { areasStrip, areaPages } from "./areas.js";
import { auHandle, auCovers } from "./au.js";
import { GENERAL, MEDIUM, HARD, LEVELS, buildCrossword } from "./crossword.js";
import { QUOTES } from "./quotes.js";
import { TEAM } from "./team.js";
import { KID_CSS, kidsLog, kidsHub, safePage, petPage, robotPage, certPage } from "./kids.js";
import { PERSONAL_JS, MAV_JS, ME_JS, SETTINGS_JS, FORYOU_JS, LIKES, LIKE_KINDS, prefsApi } from "./personal.js";
import { BANKS, MOVES, CDR } from "./rates.js";
import { refreshABS, absBlock } from "./abs.js";
import { rentGroups, jobGroups, directoryBody, radioSection } from "./directory.js";
import { EXTRA_PLACES } from "./places.js";
import { WEST, EAST, VEDIC, STARTS, VSTARTS, eastYears, readings, seasonOf, vedicOf, elementOf, luckyColour, moonLine } from "./horoscope.js";
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
const SECTIONS = [["today", "At a glance"], ["oneapp", "One app instead of many"], ["tools", "Handy tools"], ["dogs", "Dog friendly"], ["lgbtq", "LGBTQ+ friendly"], ["alerts", "Alerts"], ["events", "Community events"], ["news", "News"], ["love", "Why you'll love it"], ["bdm", "Births, Deaths and Marriages"], ["numbers", "News in numbers"], ["aigb", "AI for good, AI for bad"], ["alcohol", "Grog watch"], ["rates", "Banks and the RBA"], ["bypass", "Bypass updates"], ["fuel", "Fuel"], ["sea", "Tides & fishing"], ["know", "Know your area"], ["rent", "Renting"], ["jobs", "Jobs"], ["radio", "Local radio"], ["council", "Council watch"], ["award", "Mini Maverick Encouragement Award"], ["kids", "Get outside"], ["trails", "Trails & World Heritage"], ["sport", "Sport & field closures"], ["tonight", "What's on"], ["flights", "Flights"], ["holidays", "Holidays"], ["puzzles", "Crossword"], ["stars", "Horoscopes"], ["beaches", "Beaches"]];

const esc = (s = "") => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const todayISO = () => new Date(Date.now() + 11 * 3600e3).toISOString().slice(0, 10); // Sydney (AEDT)

// One line under the masthead, different every day, so the page never looks the same twice.
function dailyLine() {
  const lines = [
    "Noise-cancelling headphones for your news. No opinions, make your own.",
    "Your personalised local daily news.",
    `Everything on in ${R.short}, in one place. Free.`,
    "One local app instead of a dozen.",
    "Sourced, never spun. You make up your own mind.",
    "Tell Mav what you like and he sets up your page.",
    "Local first. Nobody pays to be here.",
    `Built in regional Australia, raised by the world.`,
  ];
  const d = new Date(todayISO() + "T00:00:00Z");
  const day = Math.floor((d - Date.UTC(d.getUTCFullYear(), 0, 0)) / 864e5);
  return esc(lines[day % lines.length]);
}

// ---- Not done yet? Say so, clearly and with a smile. Team Smarketing is on it. ----
const WIP_LINES = ["It's a big job. We'll get there.", "Small team, big plans.", "Good things take time.", "We're building it right, not fast."];
function wip(what, link, linkText) {
  const w = String(what).trim(), h = [...w].reduce((a, c) => a + c.charCodeAt(0), 0);
  return `<div class="wip"><span class="wipb">🚧 Coming soon</span><p><b>Team Smarketing is on it.</b></p><p>${w}${/[.!?]$/.test(w) ? "" : "."}</p>${link ? `<p>For now, try <a href="${link}" rel="noopener">${linkText}</a>.</p>` : ""}<p class="mute"><small>${WIP_LINES[h % WIP_LINES.length]}</small></p></div>`;
}
// One broken feed never takes the whole page down: the block just steps aside (UX rule 1, graceful degradation).
const S = async (p, fallback = "") => { try { return await p; } catch (e) { console.log("block skipped", String(e)); return fallback; } };
const CSS = `.usp{text-align:center;font-size:.8rem;margin:2px 0 8px}.usp summary{color:var(--mute);cursor:pointer;list-style:none;display:inline;border-bottom:1px dotted var(--mute)}.usp summary::-webkit-details-marker{display:none}.usp .oeq{font-size:1.1rem}
.tsbox{max-width:480px;margin:18px auto;text-align:center;font-size:.85rem;border-top:1px dotted var(--line);padding-top:10px}.tsbox summary{cursor:pointer;color:var(--mute);font-weight:600;list-style:none}.tsbox summary::-webkit-details-marker{display:none}.tsbox .tsf{display:flex;flex-direction:column;align-items:center;gap:6px;margin-top:6px}.tsbox .tsmsg{font-size:.8rem;margin:6px 0 0}
.oapps{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:10px 0}.oapps a{text-decoration:none;background:var(--soft);color:var(--mute);border-radius:999px;padding:3px 10px;font-size:.8rem;text-decoration:line-through;text-decoration-color:var(--gold)}.oeq{text-align:center;font-size:1.5rem;margin:8px 0}.oeq b{background:var(--gold);color:#12233f;border-radius:12px;padding:4px 14px}
.wip{border:2px dashed var(--gold);border-radius:12px;padding:12px 14px;margin:12px auto;text-align:center;max-width:520px}.wip p{margin:4px 0}.wipb{display:inline-block;background:var(--gold);color:#12233f;border-radius:999px;padding:1px 10px;font-size:.8rem;font-weight:700}.done{display:inline-block;background:#1f8a4c;color:#fff;border-radius:999px;padding:1px 10px;font-size:.8rem;font-weight:700}

:root{--bg:#fff;--fg:#12233f;--gold:#f2b01e;--mute:#5a6578;--link:#2b4a7a;--line:#e2e7ef;--accent:#2b4a7a;--soft:#eef2f8}
@media (prefers-color-scheme:dark){:root{--bg:#0B1526;--fg:#e8edf2;--gold:#f2b01e;--mute:#9aa6b4;--link:#9fb8e0;--line:#24324a;--accent:#7f9fd1;--soft:#13203a}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 Arial,Helvetica,sans-serif}
main{max-width:640px;margin:0 auto;padding:16px}a{color:var(--link)}h1{font-size:1.6rem;margin:.2em 0}.hooks{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:18px 0}.hooks a{display:block;padding:10px 12px;border:1px solid var(--line);border-left:3px solid var(--gold);border-radius:8px;text-decoration:none;color:var(--fg)}.hooks a:hover{border-color:var(--gold)}.hooks small{display:block;font-size:.68rem;text-transform:uppercase;letter-spacing:.08em;color:var(--mute)}.hooks b{font-size:.92rem;line-height:1.3}
.townh{font-size:1rem;text-align:center;color:var(--mute);margin:4px 0}.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
h2{font-size:1.1rem;margin:1.4em 0 .4em;border-bottom:1px solid var(--line);padding-bottom:4px}
.mute{color:var(--mute);font-size:.9rem}input,textarea,button,select{font:inherit;padding:10px;border:1px solid var(--line);border-radius:20px;background:var(--bg);color:var(--fg)}
textarea{border-radius:8px;width:100%}button{cursor:pointer;background:var(--accent);color:var(--bg);border:0;padding:10px 18px}
.home{min-height:70vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}
.big{font-size:3rem;font-weight:bold;letter-spacing:-1px;margin:0}.search{display:flex;gap:8px;margin:20px 0;width:100%;max-width:420px}.search input{flex:1}
ul{padding-left:18px}li{margin:6px 0}footer{border-top:1px solid var(--line);margin-top:40px;padding:16px;text-align:center;color:var(--mute);font-size:.85rem}
label{display:block;margin:10px 0 4px}.row{display:flex;gap:8px;flex-wrap:wrap}.row input{flex:1;min-width:160px}
.hp{position:absolute;left:-9999px}
header.top{display:flex;align-items:center;justify-content:space-between;padding:6px 16px;max-width:640px;margin:0 auto}
.brand{display:flex;align-items:center;gap:6px;text-decoration:none;color:var(--fg);font-weight:bold;font-size:.85rem}
.badge{background:var(--gold);color:#12233f;border-radius:8px;padding:2px 8px;font-weight:bold;letter-spacing:.5px}
.wave{display:block;width:100%;height:28px;color:var(--soft)}
.card{display:block;background:var(--soft);border-radius:14px;padding:14px 16px;margin:14px 0;text-decoration:none;color:var(--fg)}.card b{color:var(--accent)}
.tile{background:none}
.md{display:inline-flex;align-items:center;gap:6px;text-decoration:none;color:var(--fg);font-weight:bold;letter-spacing:2px;font-size:.8rem}
.say{background:var(--gold);color:#12233f;padding:0 5px;border-radius:4px;font-weight:bold}.qs{position:sticky;top:0;background:var(--bg);padding:8px 0;z-index:5}.qs input{width:100%;font-size:1.05rem}.qhit{margin:8px 0}.sq{cursor:pointer}.sq span{margin-left:4px;color:var(--mute)}.my{text-decoration:none;font-weight:bold;font-size:.75rem;background:var(--soft);padding:4px 8px;border-radius:14px}.mav{background:var(--soft);border-radius:14px;padding:14px 16px;margin:12px 0}.mav textarea{margin:8px 0}.micb{font-size:1.1rem;width:100%;padding:14px}#ex label{cursor:pointer}.setlist{list-style:none;padding:0}.setlist li{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);padding:8px 0}.setlist li.off span:first-child{opacity:.45;text-decoration:line-through}.setlist button{padding:6px 12px}.setlist button[disabled]{opacity:.3}.tg{min-width:52px}.pills{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 14px}.pills button{background:var(--soft);color:var(--fg);border-radius:18px;padding:4px 11px;font-size:.85rem}.pills button.on{background:var(--fg);color:var(--bg)}.panel{background:var(--soft);border-radius:14px;padding:4px 16px 12px;margin:8px 0}.panel h2{border:0}.ideas{list-style:none;padding:0}.idea{display:flex;gap:12px;align-items:flex-start;border-bottom:1px solid var(--line);padding:10px 0}.vote{background:var(--soft);color:var(--fg);border-radius:12px;padding:8px 10px;min-width:64px}.vote.on{background:var(--gold);color:#12233f}.bar{height:6px;background:var(--line);border-radius:3px;margin:6px 0 2px}.bar i{display:block;height:100%;background:var(--gold);border-radius:3px}.tagg{font-size:.8rem;background:var(--soft);padding:2px 8px;border-radius:10px}.ann{display:flex;justify-content:space-between;gap:8px;align-items:flex-start;background:var(--gold);color:#12233f;border-radius:12px;padding:10px 14px;margin:8px 0;text-align:left}.ann a{color:#12233f}.ann button{background:none;color:#12233f;padding:0 4px;font-size:1.2rem}.cw{background:var(--soft);border-radius:14px;padding:4px 14px 10px;margin:14px 0}.cw h3{margin-top:10px}.cw .ideas{margin:6px 0}.cwh{text-align:left;font-size:.85rem;padding-top:12px}.jnote{display:block;margin:4px 0 8px;line-height:1.35}.wcatch .pills button{text-transform:none}.fuel{padding-left:20px}.fuel li{margin:8px 0}.ftw{overflow-x:auto}.ftab{width:100%;border-collapse:collapse;font-size:.95rem}.ftab th,.ftab td{padding:8px 6px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}.ftab th:first-child,.ftab td:first-child{text-align:left;white-space:normal;min-width:150px}.ftab th{font-size:.8rem;color:var(--mute);font-weight:normal}.ftab td.cheap{background:var(--gold);color:#12233f;font-weight:bold;border-radius:6px}.ftab td.cheap::before{content:"⭐ "}.fnote{font-size:.8rem;margin:6px 0 0}h3{font-size:1rem;margin:14px 0 4px}.openl{list-style:none;padding:0}.openl li{display:flex;gap:10px;border-bottom:1px solid var(--line);padding:10px 0}.openl .dot{flex:none;width:12px;height:12px;border-radius:50%;margin-top:6px;background:#9aa0a6}.openl li.open .dot{background:#1e9e4a}.openl li.shut .dot{background:#d93025}.openl li.open .st{color:#1e9e4a;font-weight:bold}.openl li.shut .st{color:#d93025;font-weight:bold}.openl li.unk .st{color:var(--mute)}#mavbtn{position:fixed;right:16px;bottom:16px;z-index:50;border-radius:24px;padding:12px 18px;background:var(--fg);color:var(--bg);box-shadow:0 4px 14px rgba(0,0,0,.2)}#mavp{position:fixed;right:12px;bottom:12px;left:12px;max-width:420px;margin-left:auto;z-index:51;background:var(--bg);border:1px solid var(--line);border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.25);display:flex;flex-direction:column;max-height:75vh}#mavp[hidden]{display:none}.mavh{padding:12px 14px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:4px}.mavh button{margin-left:auto;background:none;color:var(--fg);font-size:1.3rem;padding:0 6px}#mavlog{overflow:auto;padding:10px 14px;flex:1;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}.mm{margin:8px 0;padding:10px 14px;border-radius:16px;max-width:88%;font-size:1.02rem;line-height:1.4}.mm.mav.last{font-size:1.1rem;border-left:4px solid var(--gold)}.mavtools{display:flex;gap:10px;align-items:center;margin-left:8px;font-size:.8rem}.mavtools button{background:none;color:var(--fg);padding:0;margin:0;font-size:.8rem;text-decoration:underline}.setf label{display:block;margin:8px 0}.setf input:not([type=checkbox]),.setf select{width:100%}.setf .chips label{display:inline-block}.setg{border:1px solid var(--line);border-radius:12px;margin:10px 0;padding:6px 12px}.setg legend{font-weight:bold;padding:0 6px}.setg label{display:inline-block;margin:4px 14px 4px 0}.setbar{position:sticky;bottom:0;background:var(--bg);padding:12px 0;border-top:1px solid var(--line)}.foryou{border:1px solid var(--gold);border-radius:12px;padding:2px 12px 6px;margin:16px 0;font-size:.9rem}.foryou h2{border:0;font-size:1rem}.fyc{border-bottom:1px solid var(--line);padding:6px 0}.fyc ul{margin:4px 0;padding-left:18px}.fynote{font-size:.8rem}.tav{display:inline-block;width:1.5em;height:1.5em;vertical-align:middle;margin-right:5px;border-radius:50%}.mavav{display:inline-block;width:1.5em;height:1.5em;vertical-align:middle;margin-right:4px;background:url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Ccircle cx=%2232%22 cy=%2232%22 r=%2231%22 fill=%22%23EAF0F8%22/%3E%3Cpath d=%22M10 64c2-12 11-17 22-17s20 5 22 17z%22 fill=%22%23141414%22/%3E%3Cpath d=%22M27 42h10v7c-3 2-7 2-10 0z%22 fill=%22%23B97F52%22/%3E%3Ccircle cx=%2232%22 cy=%2231%22 r=%2213%22 fill=%22%23C9915F%22/%3E%3Cpath d=%22M18.5 29c0-10 6-16 13.5-16s13.5 6 13.5 16z%22 fill=%22%23F2B705%22/%3E%3Crect x=%2217.5%22 y=%2225%22 width=%2229%22 height=%226%22 rx=%223%22 fill=%22%23D99E00%22/%3E%3Ccircle cx=%2232%22 cy=%2212%22 r=%223.2%22 fill=%22%23F2B705%22/%3E%3Cpath d=%22M28 37.5q4 3 8 0%22 fill=%22none%22 stroke=%22%237A4A2A%22 stroke-width=%221.8%22 stroke-linecap=%22round%22/%3E%3Cpath d=%22M17 31c0-14 6.5-21 15-21s15 7 15 21%22 fill=%22none%22 stroke=%22%230B1526%22 stroke-width=%223%22/%3E%3Crect x=%2213%22 y=%2227%22 width=%227%22 height=%2212%22 rx=%223.5%22 fill=%22%230B1526%22/%3E%3Crect x=%2244%22 y=%2227%22 width=%227%22 height=%2212%22 rx=%223.5%22 fill=%22%230B1526%22/%3E%3C/svg%3E") center/contain no-repeat}#mavbtn .mavav{width:1.9em;height:1.9em;margin:-6px 6px -6px -6px}.mch .mavav{width:2.2em;height:2.2em}#mycard{position:fixed;inset:0;z-index:49;background:var(--bg);overflow:auto;padding:14px 16px 90px;display:flex;flex-direction:column}#mycard[hidden]{display:none}.cardon body{overflow:hidden}.mch{display:flex;flex-direction:column;margin-bottom:8px}.mch b{font-size:1.3rem}#mycard #foryou{margin-top:8px}.mcq{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.mcq a{background:var(--soft);border-radius:16px;padding:8px 12px;text-decoration:none;font-size:.9rem}.mcx{position:sticky;bottom:0;width:100%;padding:14px;font-size:1.05rem;margin-top:auto}#mypill{position:fixed;left:16px;bottom:16px;z-index:50;border-radius:24px;padding:12px 16px;background:var(--gold);color:#12233f;box-shadow:0 4px 14px rgba(0,0,0,.2)}#mypill[hidden]{display:none}.fybd{background:var(--soft);border-radius:10px;padding:8px 12px;margin:6px 0;border:0}.mavst{margin:0 14px;padding:8px 10px;background:var(--soft);border-radius:10px;font-size:.85rem}.mavst button{margin-left:6px;padding:4px 10px}.mavmailw{margin:0;padding:0 12px;text-align:center}.mavmailw button{font-size:.8rem;padding:4px 10px}.mm.mav{background:var(--soft)}.mm.me{background:var(--fg);color:var(--bg);margin-left:auto}.mm.me a{color:var(--bg)}#mavchips{padding:0 12px}#mavchips label{cursor:pointer;font-size:.8rem}#mavf{display:flex;gap:6px;padding:10px 12px;border-top:1px solid var(--line)}#mavf input{flex:1;min-width:0}#mavmic{background:var(--soft);color:var(--fg);padding:8px 12px}footer p{margin:0 0 12px}.aoc{max-width:520px;margin-left:auto!important;margin-right:auto!important;font-style:italic;font-size:.8rem}.pow{margin-top:16px!important}.pow>span:first-child{font-size:.75rem}@media print{body *{visibility:hidden}#hsout,#hsout *{visibility:visible}#hsout{position:absolute;left:0;top:0;white-space:pre-wrap;font-size:14px}}.hsout{display:none}@media print{.hsout{display:block}}.srcbtn{background:none;color:var(--mute);border:1px solid var(--line);border-radius:12px;padding:2px 10px;font-size:.78rem;margin:4px 0;cursor:pointer}.srcbtn.on{background:var(--soft);color:var(--fg)}.srcbtn span{margin-left:2px}p.src{background:var(--soft);border-radius:8px;padding:8px 10px}.tagline{display:inline-block;margin-top:4px;font-size:.75rem}.md svg{width:24px;height:21px}.brand .mark{height:16px;width:19px}.chips label{display:inline-block;margin:4px 6px 0 0;padding:6px 10px;border:1px solid var(--line);border-radius:16px;font-size:.9rem}
.chips input{margin-right:4px}.recipes li{margin:10px 0}
.tiles{display:flex;flex-wrap:wrap;gap:10px 14px;margin:8px 0 12px;padding:8px 12px;background:var(--soft);border-radius:10px;font-size:.88rem}@media(max-width:480px){.tiles{gap:4px 12px}}
.tile{display:inline-flex;align-items:baseline;gap:4px;white-space:nowrap}.tile b{font-size:.95rem}.tile small{color:var(--mute);font-size:.78rem}.ico{font-size:1rem}
.hdr{display:flex;gap:8px;align-items:center}.inst{border:0;cursor:pointer;font:inherit;font-size:.95rem;line-height:1;background:var(--soft);border-radius:50%;width:28px;height:28px;padding:0;display:inline-flex;align-items:center;justify-content:center}.inst[hidden]{display:none}@media (max-width:380px){.hdr{gap:5px}.hdr .my{padding:4px 6px}}.instsheet{border:0;border-radius:16px;padding:20px 22px;max-width:min(420px,calc(100vw - 32px));background:var(--bg);color:var(--fg);box-shadow:0 12px 40px rgba(0,0,0,.35)}.instsheet::backdrop{background:rgba(11,21,38,.55)}.instsheet h2{margin:0 0 8px;font-size:1.15rem}.instsheet p{margin:8px 0;line-height:1.45}.instsheet button{margin-top:6px;width:100%;padding:10px;border:0;border-radius:10px;background:#0B1526;color:#fff;font:inherit;font-weight:bold;cursor:pointer}.signin{font-weight:600}.tipsp{border:1px solid var(--line);border-radius:10px;padding:8px 12px;margin:10px 0}.tipsall{border:1px solid var(--line);border-radius:10px;padding:8px 12px;margin:10px 0;line-height:1.9}.tipsall b{white-space:nowrap}.tipsp legend{font-weight:600;padding:0 4px}.tipsp label{display:block;padding:3px 0}ul.why{list-style:none;padding:0;margin:8px 0 12px}ul.why li{padding:6px 0;border-bottom:1px solid var(--line)}.nerdcta{margin:10px 0 0;padding:10px 12px;border-radius:10px;background:var(--soft);font-weight:600}.nerdcta a{color:var(--fg);text-decoration:none}.nerdcta a:hover{text-decoration:underline}.av{width:22px;height:22px;border-radius:50%;vertical-align:middle;margin-right:5px;object-fit:cover}.av.lg{width:40px;height:40px;margin-right:10px}.hello{display:flex;align-items:center;font-weight:600;margin:4px 0 8px}.hello[hidden]{display:none}.gbtn{display:inline-flex;align-items:center;gap:10px;padding:12px 18px;border:1px solid var(--line);border-radius:10px;background:#fff;color:#1f1f1f;text-decoration:none;font-weight:600}.away{font-size:.8rem;color:var(--mute);background:var(--soft);border-radius:99px;padding:1px 8px;margin-left:4px;white-space:nowrap}.towns{display:flex;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;gap:6px;margin:0 0 6px;font-size:.8rem}.towns::-webkit-scrollbar{display:none}.towns .pc{padding:2px 9px;border:1px solid var(--line);border-radius:99px;color:var(--mute);text-decoration:none;white-space:nowrap}.towns .pc small{font-size:inherit;opacity:.8}.towns .pc.on{background:var(--fg);color:var(--bg);border-color:var(--fg);font-weight:600}.towns select{font:inherit;padding:4px 8px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--fg);margin-left:4px}.quote{margin:10px 0 14px;padding:8px 0 8px 14px;border-left:3px solid var(--line);font-family:Georgia,'Times New Roman',serif;font-style:italic}.quote cite{display:block;font-style:normal;font-family:inherit;font-size:.82rem;color:var(--mute);margin-top:2px}.policy{font-weight:600}.jumpx{display:flex;gap:6px;overflow-x:auto;padding:2px 0 10px;margin:0 0 6px;scrollbar-width:none;-webkit-overflow-scrolling:touch}.jump::-webkit-scrollbar{display:none}.jump a{flex:none;font-size:.85rem;padding:5px 11px;border-radius:99px;background:var(--soft);color:var(--fg);text-decoration:none;white-space:nowrap}.jump a:hover{outline:1px solid var(--line)}html{scroll-behavior:smooth}section[id]{scroll-margin-top:12px}.paper .sech{font-family:Georgia,"Times New Roman",serif;font-size:1.6rem;border-top:3px solid var(--fg);border-bottom:1px solid var(--line);padding:6px 0;margin:6px 0 12px}.story{display:block;color:var(--fg);text-decoration:none;margin:0 0 14px}.story:hover .hl{text-decoration:underline}.sbody{display:flex;flex-direction:column;gap:4px}.kick{font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--accent,#c0392b)}.srcw{font-weight:400;text-transform:none;letter-spacing:0;color:var(--mute);font-style:italic}.hl{font-family:Georgia,"Times New Roman",serif;font-weight:700;font-size:1.12rem;line-height:1.25}.lead .hl{font-size:1.6rem;line-height:1.15}.dek{color:var(--fg);opacity:.85;font-size:.93rem;line-height:1.45}.lead .dek{font-size:1.02rem}.byl{font-size:.78rem;color:var(--mute)}.simg{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:8px;background:var(--soft)}.lead{padding-bottom:14px;border-bottom:1px solid var(--line)}.lead.wimg{display:grid;grid-template-columns:1.15fr 1fr;gap:18px;align-items:start}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:0 22px}.namesbox{margin:16px 0;padding:14px 16px;border:2px solid var(--gold);border-radius:14px;background:linear-gradient(180deg,var(--soft),var(--bg) 70%)}.nkick{margin:0;font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--mute)}.nhead{margin:2px 0 8px;font-family:Georgia,serif;font-size:1.35rem}.nsub{font-weight:700;margin:4px 0 6px}.ntabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 0 10px;padding:2px 0}.ntabs::-webkit-scrollbar{display:none}.ntabs button,.nchips button{flex:none;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:99px;padding:5px 12px;font-size:.85rem;cursor:pointer}.ntabs button.on,.nchips button.on{background:var(--fg);color:var(--bg);border-color:var(--fg)}.nchips{display:flex;flex-wrap:wrap;gap:6px}.names li.n1 b{font-size:1.15em}.nwork{text-align:center;padding:14px;color:var(--mute)}.nlook{display:flex;gap:6px}.nlook input{flex:1}.nout{margin:8px 0}.nspark{display:flex;align-items:flex-end;gap:4px;height:70px;margin:6px 0}.nspark span{flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:100%;text-align:center}.nspark i{display:block;background:var(--gold);border-radius:3px 3px 0 0}.nspark small{font-size:.65rem;color:var(--mute)}.mavq{display:flex;gap:10px;align-items:center}.mavq p{margin:0}.nq{font-weight:600;margin:12px 0 5px}.nidea input{max-width:100%;margin:2px 0}.nidea input[name=heritage],.nidea input[name=extra]{width:100%}.nlist{list-style:none;padding:0;margin:6px 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0 16px}.nlist li{padding:7px 0;border-bottom:1px solid var(--line)}.npop{font-size:.72rem;background:var(--soft);border-radius:99px;padding:1px 7px;font-weight:400;white-space:nowrap}.names{margin:4px 0 6px;padding-left:1.6em}.names li{margin:2px 0}.up{color:#2E8B57;font-size:.85em}.namest{width:100%;border-collapse:collapse;margin:4px 0}.namest th,.namest td{text-align:left;padding:3px 6px;border-bottom:1px solid var(--line)}.namest tbody th{font-weight:600;width:3.5em}.namesw{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:4px 18px}.namesw p{margin:2px 0}.dn{color:#b4483c;font-size:.85em}.grid2 .story{padding:12px 0;margin:0;border-bottom:1px solid var(--line)}.grid2 .wimg{display:grid;grid-template-columns:1fr 104px;gap:12px;align-items:start}.grid2 .simg{order:2;width:104px;height:78px;aspect-ratio:auto}@media(max-width:620px){.lead.wimg{display:block}.lead .simg{margin-bottom:8px}.grid2{grid-template-columns:1fr}.grid2 .dek{display:none}.lead .hl{font-size:1.35rem}}.sub{font-family:Georgia,serif;font-size:1rem;margin:10px 0 6px;text-transform:uppercase;letter-spacing:.05em}.heads{list-style:none;padding:0;margin:0}.heads li{display:flex;align-items:baseline;gap:8px;padding:6px 0;border-bottom:1px dotted var(--line);font-size:.9rem}.heads li a{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.heads li time{flex:none;white-space:nowrap;font-size:.8rem}.heads li .kick{flex:none}.heads .kick{margin-right:4px}.zod{list-style:none;padding:0;margin:0 0 10px;display:grid;grid-template-columns:1fr 1fr;gap:0 20px}.zod li{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);font-size:.92rem;line-height:1.4}.zod li.on{background:var(--soft);border-radius:8px;padding-left:6px}.zs{font-size:1.4rem;width:1.6rem;text-align:center;flex:none}@media(max-width:620px){.zod{grid-template-columns:1fr}}.rate{border-top:1px solid var(--line);margin:28px 0 0;padding:14px 0;display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;text-align:center}.rate>.mute{width:100%}.rate button[data-v]{background:var(--soft);color:var(--fg);border-radius:99px;padding:4px 12px;font-size:1.1rem}.rate button.on{outline:2px solid var(--fg)}.rate form{width:100%}.rate textarea,.rate input{width:100%;margin:4px 0}.wxtips{margin:-4px 0 12px;padding:0;list-style:none;font-size:.9rem}.wxtips li{padding:3px 0}.faq{border-bottom:1px solid var(--line);padding:6px 0}.faq summary{cursor:pointer;font-weight:600}.faq p{margin:6px 0 4px}.ptabs{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0 10px}.ptabs button{background:var(--soft);color:var(--fg);border-radius:99px;padding:5px 12px;font-size:.9rem}.ptabs button.on{background:var(--fg);color:var(--bg)}.pdate{font-size:.85rem;color:var(--mute)}.pdate input{font:inherit;padding:3px 6px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--fg)}.pven{padding:8px 0;border-bottom:1px solid var(--line)}.pven ul{margin:4px 0;padding-left:0;list-style:none}.pven li{padding:2px 0}.tscroll{overflow-x:auto}.shopt{width:100%;border-collapse:collapse;font-size:.92rem}.shopt th,.shopt td{padding:7px 6px;border-bottom:1px solid var(--line);text-align:right;vertical-align:top}.shopt th[scope=row],.shopt thead th:first-child{text-align:left;font-weight:600}.shopt td.cheap{background:#e3f6e8;color:#14532d;font-weight:700;border-radius:6px}.shop{list-style:none;padding:0;margin:0}.shop li{display:flex;flex-wrap:wrap;gap:6px;align-items:baseline;padding:6px 0;border-bottom:1px solid var(--line)}.shop li span:first-child{flex:1 1 60%}.fls{list-style:none;padding:0;margin:0}.fls li{padding:5px 0;border-bottom:1px solid var(--line)}.fls li.hit{background:var(--soft)}.fl{font-size:.8rem;font-weight:700;border-radius:99px;padding:1px 8px;margin-left:4px}.fl.ok{background:#e3f6e8;color:#1a7f37}.fl.warn{background:#fff4d6;color:#8a5a00}.fl.bad{background:#fde2e1;color:#b42318}.gath{text-align:center;font-size:.78rem;color:var(--mute);margin:6px 0 6px}.tloc{text-align:center;font-size:.85rem;color:var(--mute);margin:0 0 22px}.num{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)}.num>div{display:flex;flex-direction:column;text-align:center}.num b{font-size:1.7rem;font-family:Georgia,serif;color:var(--acc)}.num span{font-weight:600;font-size:.9rem}.num small{color:var(--mute);font-size:.75rem}.num .vs{font-weight:700;color:var(--mute)}.num .src{grid-column:1/-1;text-align:center;margin:2px 0 0}.prom{list-style:none;padding:0;margin:0}.prom li{display:flex;gap:10px;padding:7px 0;border-bottom:1px solid var(--line)}.pl{font-size:1.2rem}.aig{display:grid;grid-template-columns:1fr 1fr;gap:12px}.aib{padding:10px 12px;border-radius:10px;background:var(--bg);border:1px solid var(--line)}.aib.good{border-left:4px solid #15803d}.aib.bad{border-left:4px solid #b42318}.aib a{color:var(--fg);text-decoration:none}@media(max-width:560px){.aig{grid-template-columns:1fr}}.ailog{list-style:none;padding:0}.ailog li{padding:8px 0;border-bottom:1px solid var(--line)}.fresh{display:inline-block;width:.6em;height:.6em;border-radius:50%;margin-right:5px;vertical-align:middle}.fresh.g{background:#16a34a}.fresh.a{background:#f59e0b}.fresh.r{background:#dc2626}.legend{font-size:.8rem;color:var(--mute)}.numd{grid-column:1/-1;margin:0;font-size:.75rem;color:var(--mute);text-align:center}.mast{font-family:Georgia,'Times New Roman',serif;font-weight:bold;font-size:clamp(2rem,9vw,3rem);line-height:1.1;text-align:center;margin:4px 0 0;letter-spacing:.3px;border-top:3px double var(--fg);border-bottom:1px solid var(--fg);padding:6px 0}.edition{text-align:center;font-size:.75rem;color:var(--mute);margin:4px 0 10px;text-transform:uppercase;letter-spacing:1px}.cw{border-collapse:collapse;margin:10px auto}.cw td{width:min(34px,calc((100vw - 34px)/var(--n,10)));height:min(34px,calc((100vw - 34px)/var(--n,10)));border:1px solid var(--fg);position:relative;padding:0}.cw td.bk{border:0;background:transparent}.cw input{width:100%;height:100%;border:0;border-radius:0;text-align:center;font-size:1.1rem;text-transform:uppercase;padding:0;background:var(--bg)}.cw input.bad{color:#d93025}.cn{position:absolute;top:1px;left:2px;font-size:.55rem;color:var(--mute)}.cwl>div{flex:1;min-width:220px}.cwl ol{padding-left:0;list-style:none}.ghost{background:var(--soft);color:var(--fg)}.snap span{display:inline-block;margin:8px 0 4px;background:var(--accent);color:var(--bg);border-radius:20px;padding:10px 18px;cursor:pointer;font-weight:bold}.ball{display:inline-block;min-width:28px;height:28px;line-height:28px;border-radius:50%;background:var(--gold);color:#12233f;text-align:center;font-weight:bold;font-size:.85rem;margin:3px 2px 0 0}.ball.alt{background:var(--soft);color:var(--fg)}.rally{background:#12233f;color:#e8edf2;box-shadow:0 0 0 100vmax #12233f;clip-path:inset(0 -100vmax);padding:26px 0 22px;margin:36px 0 0;font-size:.9rem}.rally a{color:#f2b01e}.rally .mute,.rally .barlab{color:#b9c4d4}.rally input{background:#fff;color:#12233f}.rally button{background:#f2b01e;color:#12233f}.rallyl{font-size:.82rem}.spot{border:2px solid var(--gold);border-radius:14px;padding:16px 18px;margin:22px 0;text-align:center}.spot h3{margin:2px 0 6px;font-size:1.3rem}.spotk{margin:0;font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--mute)}.rally p{margin:5px 0}.rally b{color:var(--mute)}.rallyh{margin:0 0 6px;font-size:1.15rem;font-weight:700;color:#fff}.rally input,.rally button{font-size:.85rem}.bar{display:block;height:5px;border-radius:99px;background:rgba(128,128,128,.2);overflow:hidden}.bar>span{display:block;height:100%;background:var(--mute);border-radius:99px}.bar.sm{height:6px;margin-top:6px}.barlab{margin:2px 0 8px;font-size:.8rem}.rallystrip{display:block;text-decoration:none;font-size:.72rem;margin:0 0 8px;opacity:.8}.note{border:1px solid var(--accent);border-radius:8px;padding:10px}details.pins{margin:8px 0}#know details{margin:6px 0}.src{font-size:.75rem;color:var(--mute);margin:2px 0 8px}.src.warn{color:#9a5b00}@media(prefers-color-scheme:dark){.src.warn{color:#f0b35a}.rally{background:#060d19!important;box-shadow:0 0 0 100vmax #060d19!important}}#know summary{cursor:pointer;padding:6px 0}details.pins label{display:inline-block;margin:4px 12px 0 0}.pins label{display:inline;margin-right:12px;font-size:.9rem}
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
#memory{--acc:#6b7280!important}#joy,#love{--acc:#c2417a!important}
.areas{display:flex;gap:8px;overflow-x:auto;padding:8px 0 10px;margin:4px 0 6px;scrollbar-width:none}.areas::-webkit-scrollbar{display:none}.areas a{flex:1 0 auto;min-width:76px;display:flex;flex-direction:column;align-items:center;gap:2px;padding:9px 10px;border-radius:14px;background:var(--soft);text-decoration:none;color:var(--fg);font-weight:600;font-size:.82rem;border:1px solid var(--line)}.areas a span{font-size:1.5rem;line-height:1}
#radiobar{display:flex;align-items:center;gap:8px;padding:7px 12px;margin:4px 0;border-radius:99px;background:#0B1526;color:#fff;font-size:.88rem}#radiobar[hidden]{display:none}#radiobar a{color:var(--gold);font-weight:700;text-decoration:none;margin-left:auto}#radiobar button{background:none;border:0;color:#fff9;cursor:pointer;font-size:1rem}.rfav{background:none;border:0;cursor:pointer;font-size:1.05rem;padding:0 4px}
.cdown{display:flex;gap:8px;flex-wrap:wrap}.cd{position:relative;flex:1 1 140px;padding:10px 12px;border-radius:12px;background:var(--soft);display:flex;flex-direction:column}.cd[hidden]{display:none}.cd span{font-size:1.4rem}.cd b{font-size:1.25rem}.cd small{color:var(--mute)}.cdx{position:absolute;top:4px;right:6px;background:none;border:0;color:var(--mute);cursor:pointer;font-size:1rem}
.found{border:2px solid var(--gold);border-radius:12px;padding:10px 12px;margin:10px 0}
.potd{margin:10px 0 14px;border-radius:14px;overflow:hidden;background:var(--soft)}.potd img{display:block;width:100%;height:auto;max-height:62vh;object-fit:cover}.potd figcaption{padding:8px 12px 10px;font-size:.95rem;line-height:1.4}.potd figcaption b{display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:var(--mute);margin-bottom:2px}.pgal{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}.pgal figure{margin:0;border-radius:12px;overflow:hidden;background:var(--soft)}.pgal img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover}.pgal figcaption{padding:6px 10px 8px;font-size:.9rem}.pgal small{display:block;color:var(--mute);font-size:.75rem}label.chk{display:flex;gap:8px;align-items:flex-start;margin:8px 0}.potd small{display:block;font-size:.75rem;color:var(--mute);margin-top:4px}#bdm{--acc:#6b7280!important}
#numbers,#aigb{--acc:#7c3aed!important}#fuel,#shop,#rates{--acc:#15803d!important}
#flights,#bypass,#sea,#beaches{--acc:#1d6fb8!important}
#puzzles,#stars,#holidays{--acc:#b45309!important}
#know,#council,#tools,#sport{--acc:#475569!important}
.pills button{border-left:4px solid var(--pc,var(--line))}
.pills{padding:10px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.pills::before{content:"More in today's Maverick";display:block;width:100%;font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:var(--mute);margin-bottom:2px}
@media (prefers-color-scheme:dark){#flow>section{background:color-mix(in srgb,var(--acc) 9%,var(--bg))}}
.mavtalk{padding:0 14px 8px;display:flex;flex-direction:column;gap:4px}.mavtalk small{font-size:.75rem}.pinlab{font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:var(--mute);margin:14px 0 4px}.pinlab b{color:var(--fg)}.frs{list-style:none;padding:0;margin:0 0 8px}.frs li{padding:6px 0;border-bottom:1px solid var(--line);font-size:.92rem}.frs small{font-size:.8rem}.frx{padding:0 8px;margin-left:4px}.me .row{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end}.me .row input{flex:1 1 130px}.me .row label{flex:1 1 140px}.me .row select{width:100%}.rules li{margin:4px 0}#sq li{display:flex;justify-content:space-between;align-items:center}
/* UX rules: keyboard focus you can see, a skip link, calmer motion, live-data timestamps, fix-it links */
:focus-visible{outline:3px solid var(--accent);outline-offset:2px}.skip{position:absolute;left:-9999px;top:8px}.skip:focus{left:12px;z-index:100;background:var(--fg);color:var(--bg);padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:700}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
.tile[hidden],.tiles[hidden]{display:none!important}.upd{font-size:.75rem;color:var(--mute);margin:-6px 0 10px}.upd:empty{display:none}.fix{font-size:.78rem;color:var(--mute);margin:4px 0 0}.xh{display:flex;align-items:center;gap:8px}.xh .xoff{margin-left:auto}.xw{position:relative}.tiles .tile.xw{padding:6px 34px 6px 8px;border-radius:10px;background:var(--bg);touch-action:pan-y;user-select:none;-webkit-user-select:none}.tiles .xw .xoff{top:50%;right:4px;transform:translateY(-50%);width:24px;height:24px}.dh{background:none;color:var(--mute);border:0;padding:4px 6px;margin:-4px 2px -4px -6px;font-size:1.1rem;cursor:grab;touch-action:none;line-height:1}.dragging{opacity:.75;outline:2px dashed var(--gold);outline-offset:2px;position:relative;z-index:6}.nodrag,.nodrag *{user-select:none;-webkit-user-select:none;cursor:grabbing!important}.tailor{margin:4px 0;font-size:.82rem}.xw .xoff{position:absolute;top:2px;right:2px;width:22px;height:22px;font-size:.7rem}.xoff{border:1px solid var(--line);background:var(--bg);color:var(--fg);border-radius:50%;width:28px;height:28px;padding:0;cursor:pointer;font-size:.85rem;line-height:1;flex:none;opacity:.8}.xoff:hover,.xoff:focus-visible{opacity:1;background:var(--soft)}.hidbar{font-size:.8rem;margin:6px 0 0}.hidtoast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:#0B1526;color:#fff;padding:10px 16px;border-radius:10px;z-index:60;box-shadow:0 6px 20px rgba(0,0,0,.3)}.hidtoast a{color:#f2b01e;font-weight:600}.mavask{position:fixed;left:16px;right:16px;bottom:16px;max-width:380px;margin:0 auto;display:flex;gap:10px;align-items:flex-start;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:14px;padding:12px 40px 12px 12px;box-shadow:0 10px 30px rgba(0,0,0,.25);z-index:55}.mavask .xoff{position:absolute;top:8px;right:8px;width:24px;height:24px}.mavface{width:44px;height:44px;flex:none;border-radius:50%}.mavwhy{display:flex;gap:6px;margin:8px 0 4px}.mavwhy input{flex:1;min-width:0}.mavskip{font-size:.8rem}.mavbtns{display:flex;gap:8px;margin-top:8px}.mavbtns button{font-size:1.2rem;padding:4px 14px;border-radius:999px;border:1px solid var(--line);background:var(--soft);cursor:pointer}.foldh{cursor:pointer;position:relative;padding-right:28px}.foldh::after{content:"▾";position:absolute;right:4px;top:50%;transform:translateY(-50%);font-size:.9em;color:var(--mute);transition:transform .2s}.folded .foldh::after{transform:translateY(-50%) rotate(-90deg)}.folded .foldh{margin-bottom:6px}.folded{padding-bottom:2px}#flow>section.folded{margin:0;border-bottom:1px solid var(--line)}#flow>section.folded h2{margin:10px 0}.foldall{font-size:.8rem;text-align:right;margin:0 0 6px}.pbar{height:14px;background:var(--soft);border-radius:7px;overflow:hidden;margin:8px 0 4px}.pbar span{display:block;height:100%;background:var(--acc,#f2b01e)}#xerr{border:0;border-radius:14px;padding:20px;width:min(440px,calc(100vw - 32px));box-shadow:0 12px 40px rgba(0,0,0,.25);background:var(--bg);color:var(--fg)}#xerr::backdrop{background:rgba(11,21,38,.55)}#xerr h2{margin:0 0 6px;font-size:1.15rem}#xerr label{display:block;margin:12px 0 4px;font-weight:600}#xerr select,#xerr textarea,#xerr input{width:100%;box-sizing:border-box;font:inherit}.xbtns{margin-top:14px;display:flex;gap:8px}.xno{background:none;border:1px solid currentColor;opacity:.75}
`;

// Formal look: emojis come off headings, buttons, cards and notes across the site (about 10% left).
// Fun places keep them: Kid Zone, crossword, the Fun section, the key-area zones and in-page fun blocks.
let CUR_PATH = "/";
const EMO = /(?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:\uFE0F|\u20E3|[\u{1F3FB}-\u{1F3FF}]|\u200D(?:\p{Extended_Pictographic}|\p{Regional_Indicator})\uFE0F?)*\uFE0F?\s?/gu;
const FUN_PATHS = /^\/(kids|crossword|fun|genalpha)(\/|$)/;
const KEEP_EMO = /<nav class="areas"[\s\S]*?<\/nav>|<div class="tiles">[\s\S]*?<\/div>(?=<p class="mute tloc")|<section id="(?:stars|puzzles|kids)"[\s\S]*?<\/section>|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<select[\s\S]*?<\/select>/g;
const LIGHTS = /[\u{1F7E2}\u{1F7E1}\u{1F534}]/u; // freshness traffic lights stay: they carry meaning
function formal(html) {
  if (FUN_PATHS.test(CUR_PATH)) return html;
  const kept = [];
  return html.replace(KEEP_EMO, m => `\u0000${kept.push(m) - 1}\u0000`)
    .replace(/>([^<]+)</g, (m, x) => ">" + x.replace(EMO, e => LIGHTS.test(e) ? e : "") + "<")
    .replace(/\u0000(\d+)\u0000/g, (_, k) => kept[+k]);
}

// Front-page teasers: little hooks that push readers to deeper parts of the site, by interest. Shuffled daily.
function hooksStrip(pc) {
  const q = pc === R.code ? "" : "?pc=" + pc, qa = "?pc=" + pc;
  const H = [["Council watchers", "How's council doing? Make your vote count.", `/council${q}`],
    ["Parents", "Games mum will approve of", "/kids"],
    ["Puzzlers", "The daily crossword", `/family${q}#puzzles`],
    ["Water lovers", "Tides, swell and today's beaches", `/outside${q}#sea`],
    ["In memoriam", "Remembering locals this week", "/bdm?f=deaths"],
    ["Mums", "The school run, sorted", `/mums${qa}`],
    ["Dads", "Countdowns, kids and your village", `/dads${qa}`],
    ["Singles", "Meet people in real life", `/singles${qa}`],
    ["Everyone welcome", "LGBTQIA+ friendly, right here", `/lgbtqia${qa}`],
    ["Saving money", "Where's the cheapest fuel today?", `/money${q}#fuel`],
    ["Dog owners", "Off-leash beaches near you", `/outside${q}#dogs`],
    ["New babies", "Welcome to the world", "/bdm?f=births"]];
  return `<nav class="hooks" aria-label="More to explore">${dayMix(H, "hooks" + pc).slice(0, 8).map(([k, h, u]) => `<a href="${esc(u)}"><small>${esc(k)}</small><b>${esc(h)}</b></a>`).join("")}</nav>`;
}

// Footer lists always read A to Z
const abc = (list, key) => [...list].sort((a, b) => key(a).localeCompare(key(b), "en-AU", { sensitivity: "base" }));
// Traffic lights everywhere prices are compared: green = cheapest, amber = in between, red = dearest.
// Solid colours with white or navy text so they read clearly in light and dark mode.
const TL_CSS = `.cheap,.shopt td.cheap,.ftab td.cheap{background:#1e7a3c!important;color:#fff!important;font-weight:700;border-radius:6px}.cheap::before,.ftab td.cheap::before{content:none!important}
.mid,.shopt td.mid,.ftab td.mid{background:#f2b01e!important;color:#12233f!important;border-radius:6px}.dear,.shopt td.dear,.ftab td.dear{background:#c0392b!important;color:#fff!important;border-radius:6px}
.cheap small,.dear small,.cheap .mute,.dear .mute{color:#fff!important;opacity:.9}.mid small,.mid .mute{color:#12233f!important}
.tlkey{font-size:.8rem;margin:6px 0}.alcp{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 12px}.alcp button{background:var(--soft);color:var(--fg);border-radius:18px;padding:4px 11px;font-size:.85rem}.alcp button.on{background:var(--fg);color:var(--bg)}.tlkey i{display:inline-block;width:.8em;height:.8em;border-radius:50%;vertical-align:-1px;margin:0 3px 0 8px}.tlkey i:first-child{margin-left:0}
main,footer,#flow{max-width:100%;overflow-x:clip}main img,main video,main iframe,main svg{max-width:100%}main img,main video{height:auto}main{overflow-wrap:break-word}main a{word-break:break-word}main table{max-width:100%}.ptr{position:fixed;top:6px;left:50%;transform:translate(-50%,0);opacity:0;z-index:60;background:var(--fg);color:var(--bg);border-radius:99px;padding:6px 14px;font-size:.85rem;font-weight:700;pointer-events:none;transition:opacity .15s}.hdr-r{display:flex;align-items:center;gap:10px}header #my2450{width:38px;height:38px;padding:0!important;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:var(--fg);color:var(--bg);font-size:1.05rem;font-weight:700;overflow:hidden;flex:none}header #my2450 svg{width:20px;height:20px}header #my2450 .av{width:100%;height:100%;margin:0}header .inst{width:38px!important;height:38px!important;background:#1e7a3c!important;color:#fff!important;box-shadow:0 0 0 4px rgba(30,122,60,.22);animation:instp 2s ease-out 1s 3}header .inst svg{width:20px;height:20px}header .inst:hover{filter:brightness(1.12)}@keyframes instp{0%{box-shadow:0 0 0 0 rgba(30,122,60,.55)}100%{box-shadow:0 0 0 12px rgba(30,122,60,0)}}@media (prefers-reduced-motion:reduce){header .inst{animation:none}}.instsheet .m2go{background:#1e7a3c!important;font-size:1.05rem;padding:12px!important}.instsheet .xno{background:var(--soft)!important;color:var(--fg)!important}
.rally b,.rally strong{color:#fff!important}.rally .bar span{background:var(--gold)!important}.rally .barlab{color:#e8edf2!important}`;
const TL_KEY = `<p class="tlkey mute"><i style="background:#1e7a3c"></i>Cheapest <i style="background:#f2b01e"></i>In between <i style="background:#c0392b"></i>Dearest</p>`;
const tlc = (v, vals) => { const L = vals.filter(x => x != null); if (v == null || L.length < 2) return ""; const lo = Math.min(...L), hi = Math.max(...L); return lo === hi ? "" : v === lo ? "cheap" : v === hi ? "dear" : "mid"; };
// Pages open instantly: Chrome and Edge start loading a link as soon as your finger or mouse rests on it.
const SPEC_RULES = `<script type="speculationrules">{"prerender":[{"where":{"and":[{"href_matches":"/*"},{"not":{"href_matches":"/(api|auth|signin|signout|admin|unlock|optin|welcome|me|go|subscribe|vote|feedback)"}},{"not":{"href_matches":"/(api|auth|signin|signout|admin|unlock|optin|welcome|me|go|subscribe|vote|feedback)/*"}},{"not":{"selector_matches":"[rel~=nofollow],[target=_blank]"}}]},"eagerness":"moderate"}]}</script>`;
// ---- The menu: one button top right. Sign in, download the app and every page, A to Z, so nothing is hidden.
const az = t => t.replace(/^[^A-Za-z0-9]+/, "").toLowerCase();
function menuDrawer(signin, inst) {
  const G = allGroups().map(([h, L]) => [h, [...L].sort((a, b) => az(a[1]).localeCompare(az(b[1])))]).sort((a, b) => az(a[0]).localeCompare(az(b[0])));
  return `<dialog id="m2nav" class="mdraw" aria-label="Menu"><div class="mtop"><b>Menu</b><button type="button" class="mx" id="m2x" aria-label="Close menu">✕</button></div>
<div class="mme"><div class="mrow">${signin}<a id="my2450t" href="/signin?next=/me">Sign in, free</a></div><div class="mrow">${inst}</div></div>
<input id="m2q" type="search" placeholder="🔎 Find a page, e.g. fuel, bins, licence" autocomplete="off" aria-label="Find a page">
<p id="m2none" class="mute" hidden>No page matches. <a href="/all">See everything</a></p>
${G.map(([h, L]) => `<details class="mg"><summary>${esc(h)}</summary><ul>${L.map(([u, n, d]) => `<li><a href="${u}"><b>${esc(n)}</b><small>${esc(d)}</small></a></li>`).join("")}</ul></details>`).join("")}
<p class="mute mfoot"><a href="/all">Everything on one page →</a></p></dialog>
<script>(function(){var d=document.getElementById('m2nav'),b=document.getElementById('m2menu'),q=document.getElementById('m2q'),no=document.getElementById('m2none'),G=[].slice.call(d.querySelectorAll('.mg'));if(!d||!b)return;
b.onclick=function(){d.showModal?d.showModal():d.setAttribute('open','')};document.getElementById('m2x').onclick=function(){d.close?d.close():d.removeAttribute('open')};
d.addEventListener('click',function(e){if(e.target===d)d.close();if(e.target.closest&&e.target.closest('.mg a'))d.close()});
var ib=document.getElementById('m2inst');if(ib)ib.addEventListener('click',function(){d.close()});
q.oninput=function(){var v=q.value.trim().toLowerCase(),any=false;G.forEach(function(g){var hit=0;g.querySelectorAll('li').forEach(function(li){var ok=!v||li.textContent.toLowerCase().indexOf(v)>-1;li.hidden=!ok;if(ok)hit++});g.hidden=!!v&&!hit;g.open=!!v&&hit>0;if(hit)any=true});no.hidden=!v||any}})()<\/script>`;
}
const MENU_CSS = `.menub{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:var(--bg);color:var(--fg);border-radius:999px;padding:5px 12px 5px 9px;font:inherit;font-weight:600;font-size:.9rem;cursor:pointer}.menub svg{width:20px;height:20px}
.mdraw{margin:0 0 0 auto;height:100dvh;max-height:100dvh;width:min(380px,100vw);max-width:100vw;border:0;padding:0 16px 24px;box-sizing:border-box;background:var(--bg);color:var(--fg);overflow-y:auto;box-shadow:-8px 0 30px rgba(0,0,0,.3)}.mdraw::backdrop{background:rgba(11,21,38,.55)}
.mtop{position:sticky;top:0;background:var(--bg);display:flex;align-items:center;justify-content:space-between;padding:14px 0 10px;font-size:1.1rem;z-index:1}.mx{border:0;background:var(--soft);color:var(--fg);border-radius:50%;width:34px;height:34px;font-size:1rem;cursor:pointer}
.mme{border:1px solid var(--line);border-radius:12px;padding:4px 12px;margin:0 0 12px}.mrow{display:flex;align-items:center;gap:10px;padding:8px 0}.mrow+.mrow{border-top:1px solid var(--line)}.mrow:has(.inst[hidden]){display:none}.mrow a{color:var(--fg);font-weight:600;text-decoration:none}
.mdraw .my{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:var(--soft);flex:none}.mdraw .my svg{width:18px;height:18px}
.mdraw .inst{width:auto;height:auto;border-radius:0;background:none;color:var(--fg);gap:10px;font-weight:600;font-size:1rem;padding:0}.mdraw .inst svg{width:30px;height:30px;padding:6px;box-sizing:border-box;border-radius:50%;background:var(--soft)}
#m2q{width:100%;font-size:1rem;padding:10px 12px;border:1px solid var(--line);border-radius:10px;margin:0 0 6px;box-sizing:border-box;background:var(--bg);color:var(--fg)}
.mg{border-bottom:1px solid var(--line)}.mg>summary{cursor:pointer;list-style:none;padding:12px 2px;font-weight:bold;display:flex}.mg>summary::-webkit-details-marker{display:none}.mg>summary::after{content:"+";margin-left:auto;color:var(--mute);font-weight:normal}.mg[open]>summary::after{content:"–"}
.mg ul{list-style:none;padding:0;margin:0 0 8px}.mg li a{display:block;padding:7px 4px;color:var(--fg);text-decoration:none;border-radius:8px}.mg li a:hover{background:var(--soft)}.mg small{display:block;color:var(--mute);font-size:.8rem}.mfoot{margin-top:14px}`;
function page(title, body, pc = "", opts = {}) {
  return new Response(`<!doctype html><html lang="en-AU"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<meta name="description" content="${esc(opts.desc || "Your personalised local daily news. Everything on in your town, in one place. Free. Nobody pays to be here.")}">${opts.canonical ? `<link rel="canonical" href="${esc(opts.canonical)}">` : ""}
<link rel="manifest" href="/manifest.webmanifest" crossorigin="use-credentials"><link rel="icon" href="/icon.svg"><meta name="theme-color" content="#0B1526">
<link rel="apple-touch-icon" href="/icon-180.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="${R.code}"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<style>${CSS}${MENU_CSS}${NAV_CSS}${SIDE_CSS}${TL_CSS}${BINS_CSS}</style>${SPEC_RULES}<meta name="m2v" content="${BUILD}"></head><body><a class="skip" href="#main">Skip to content</a><header class="top"><span class="hdr"><a class="brand" href="/" aria-label="${R.brand} home"><span class="badge">${R.code}</span><svg viewBox="3 4.5 28 23.5" aria-hidden="true" class="mark"><path d="M5 26 L12 11 L17.5 20 L23 8 L29 26" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="23" cy="8" r="2.6" fill="currentColor"/></svg></a></span><span class="hdr-r"><button type="button" id="m2menu" class="menub" aria-haspopup="dialog" aria-controls="m2nav" aria-label="Menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg><span>Menu</span></button></span></header>${menuDrawer(`<a href="/signin?next=/me" id="my2450" class="my signin" aria-label="Sign in" title="Sign in"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="4" fill="currentColor"/><path d="M4.5 20.5c.8-4 3.9-6 7.5-6s6.7 2 7.5 6" fill="currentColor"/></svg></a>`, `<button type="button" id="m2inst" class="inst" hidden aria-haspopup="dialog" aria-label="Download the app" title="Download the app"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m0 0l-4.5-4.5M12 14l4.5-4.5M4.5 15.5v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Download the app</span></button>`)}${navBar()}${HELP_UI(R.brand)}${HELP_PANEL()}
<script>try{var a=document.getElementById("my2450");if(/(?:^|; )m2450n=/.test(document.cookie)){var n=(decodeURIComponent((document.cookie.match(/(?:^|; )m2450n=([^;]*)/)||[])[1]||"")||localStorage.getItem("name")||"").trim();if(n==="Local")n="";a.href="/me";a.classList.remove("signin");a.classList.add("in");var t=(n?n.split(" ")[0]+"\u2019s ":"My ")+"${R.code}";a.title=t;a.setAttribute("aria-label",t);if(n){a.innerHTML="";a.textContent=n.charAt(0).toUpperCase()}var pp=(document.cookie.match(/(?:^|; )m2450p=([^;]*)/)||[])[1];var t2=document.getElementById("my2450t");if(t2){t2.textContent=t;t2.href="/me"}if(pp){var im=new Image();im.src=decodeURIComponent(pp);im.alt="";im.className="av";im.onload=function(){a.textContent="";a.appendChild(im)}}}}catch(e){}<\/script>
<script>/* 🔒 Locks: everyone sees everything; a lock shows on what their plan can't use yet. LOCKS = path -> level needed (some = free with email, every = Every Cool Thing). */
(function(){var LOCKS={"/fridge":2,"/genalpha":1,"/home":1,"/me":1,"/school":1},T={1:"Free when you sign in with your email",2:"Part of Every Cool Thing"};
function paint(rank){var st=document.createElement("style");st.textContent=".lk{font-size:.8em;margin-left:2px;padding:4px 6px;opacity:.75;text-decoration:none;white-space:nowrap;cursor:pointer;border-radius:6px}.lk:hover{opacity:1;background:rgba(242,176,30,.25)}";document.head.appendChild(st);
document.querySelectorAll("a[href]").forEach(function(a){var u;try{u=new URL(a.getAttribute("href"),location.href)}catch(e){return}if(u.origin!==location.origin)return;var need=LOCKS[u.pathname];if(!need||rank>=need||a.querySelector(".lk"))return;
var i=document.createElement("span");i.className="lk";i.textContent="🔒";i.title=T[need];i.setAttribute("aria-label","Locked: "+T[need]+". Tap to unlock");i.setAttribute("role","button");i.tabIndex=0;
var go=function(e){e.preventDefault();e.stopPropagation();var nx=need===2?"/membership?need=every":u.pathname+u.search;location.href=rank>=1?nx:"/signin?next="+encodeURIComponent(nx)};
i.addEventListener("click",go);i.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" ")go(e)});var b=a.querySelector("b");(b||a).appendChild(i)})}
var k=(/(?:^|; )m2450n=/.test(document.cookie)?"in":"out")+(/[?&]welcome=/.test(location.search)?"w":""),c;try{c=(sessionStorage.getItem("dmrank")||"").split(":")}catch(e){c=[]}if(c[0]===k){paint(+c[1]);return}
fetch("/api/billing/status").then(function(r){return r.json()}).then(function(j){var r=j.tier==="every"?2:j.signedIn?1:0;try{sessionStorage.setItem("dmrank",k+":"+r)}catch(e){}paint(r)}).catch(function(){paint(/(?:^|; )m2450n=/.test(document.cookie)?1:0)})})();<\/script>
<svg class="wave" viewBox="0 0 1200 40" preserveAspectRatio="none"><path fill="currentColor" d="M0 20 Q150 0 300 20 T600 20 T900 20 T1200 20 V40 H0Z"/></svg><main id="main" tabindex="-1">${fixSecLinks(formal(body), R.code).replace(/class="ico"/g, 'class="ico" aria-hidden="true"')}</main>
<div id="rate" hidden><p id="rmsg" class="mute" hidden></p></div>
<dialog id="xerr" aria-labelledby="xerrh"><form id="rform" method="dialog"><h2 id="xerrh">Spot an error?</h2>
<p class="mute">Thanks for helping keep ${R.code} right. We'll send this page's link with it, so we can find it.</p>
<label for="xwhere">Where is it?</label><select id="xwhere"></select>
<label for="rnote">What's wrong, or what's missing?</label><textarea id="rnote" rows="4" maxlength="800" required></textarea>
<div class="optmail"><label for="remail">Your email <span class="mute">(optional)</span></label><input type="email" id="remail" maxlength="120" placeholder="Leave blank to stay anonymous">${joinNote()}</div>
<div class="xbtns"><button type="submit">Send</button> <button type="button" class="xno" id="xcancel">Cancel</button></div></form>
<div id="xdone" hidden><h2>Thanks, got it 🙏</h2><p>We read every one and fix what we got wrong.<span id="xjoin"></span></p><button type="button" id="xclose">Close</button></div></dialog>
<script>(function(){var P=location.pathname,K='rated:'+P,d=document.getElementById('xerr'),f=document.getElementById('rform'),w=document.getElementById('xwhere'),m=document.getElementById('rmsg');
function send(o){o.p=P;return fetch('/api/rate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(o)}).catch(function(){})}
function say(t){m.textContent=t;m.hidden=false}
/* Spot an error: pops up straight away, asks where, and sends the page link with it. Name and email are optional. */
window.m2err=function(sec){w.innerHTML='';var seen={};[].forEach.call(document.querySelectorAll('main h2'),function(h){var t=h.textContent.trim().slice(0,80);if(!t||seen[t])return;seen[t]=1;var o=document.createElement('option');o.textContent=t;w.appendChild(o)});
var o=document.createElement('option');o.textContent='Somewhere else on this page';w.appendChild(o);w.value=sec&&seen[sec]?sec:o.textContent;
f.hidden=false;document.getElementById('xdone').hidden=true;if(d.showModal)d.showModal();else d.setAttribute('open','');setTimeout(function(){document.getElementById('rnote').focus()},30)};
function shut(){if(d.close)d.close();else d.removeAttribute('open')}
document.getElementById('xcancel').onclick=shut;document.getElementById('xclose').onclick=shut;
d.addEventListener('click',function(e){if(e.target===d)shut()});
var done=null;try{done=localStorage.getItem(K)}catch(e){}
[].forEach.call(document.querySelectorAll('#rate button[data-v]'),function(b){if(done===b.dataset.v)b.classList.add('on');b.onclick=function(){var v=b.dataset.v;if(done!==v){send({v:v});try{localStorage.setItem(K,v)}catch(e){}done=v}
document.querySelectorAll('#rate button[data-v]').forEach(function(x){x.classList.toggle('on',x===b)});if(v==='down')m2err();else say('Thanks! Glad it helped.')}});
var rw=document.getElementById('rwrong');if(rw)rw.onclick=function(e){e.preventDefault();m2err()};
f.onsubmit=function(e){e.preventDefault();var n=document.getElementById('rnote'),em=document.getElementById('remail');if(!n.value.trim()){n.focus();return}
send({note:n.value.trim(),email:em?em.value.trim():'',sec:w.value}).then(function(r){return r&&r.json()}).then(function(j){if(j&&j.joined)document.getElementById('xjoin').textContent=' You’re signed in and on the community list. Welcome, local!'}).catch(function(){});n.value='';f.hidden=true;document.getElementById('xdone').hidden=false;document.getElementById('xclose').focus()}})();${JOIN_JS}</script>
<footer><p>${abc([["/about", "Nobody pays to be here"], ["/feedback", `Make ${R.code} better`], ["/charter", "Charter"], ["/privacy", "Privacy"], ["/faq", "FAQ"], ["/all", "Everything"], ["/results" + (pc ? "?pc=" + pc : ""), pc ? `What ${pc} told us` : "What locals told us"], ["/regional", "What regional Australia told us"], ["/credits", "Photo credits"], ["/status", "What's done"], ...(pc ? [[`/submit?pc=${pc}`, "Add an event"]] : [])], x => x[1]).map(([u, t]) => `<a href="${u}">${t}</a>`).join(" · ")}</p>
<p class="legend"><span class="fresh g"></span> updated in the last week · <span class="fresh a"></span> in the last 3 months · <span class="fresh r"></span> older than 3 months</p>
<p>${R.footer}</p>
<p class="gaz">Supporting regional Australia: ${abc(Object.values(REGIONS), x => x.code).map(x => x.code === R.code ? `<b title="${esc(x.place)}">${x.code}</b>` : `<a href="https://${x.domain}" title="${esc(x.place)}">${x.code}</a>`).join(" · ")} · <a href="/suggest">Want one for your town?</a> · <a href="https://2450-maverick.live/au">Regional Australia: who represents you?</a></p>
<p class="aoc">${R.ack}<br><a href="https://aiatsis.gov.au/explore/map-indigenous-australia" rel="noopener">Know whose land you're on</a>.</p>
<p class="pow"><span>Powered by</span> <a class="md" href="https://maverickdigital.com.ai" aria-label="Maverick Digital"><svg viewBox="3 4.5 28 23.5" aria-hidden="true" class="mark"><path d="M5 26 L12 11 L17.5 20 L23 8 L29 26" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="23" cy="8" r="2.6" fill="currentColor"/></svg>MAVERICK DIGITAL</a></p></footer>
<script>window.M2C=${JSON.stringify({ code: R.code, secs: SECTIONS, towns: Object.fromEntries(Object.entries(TOWNS).filter(([, v]) => v.live).map(([k, v]) => [k, [v.name, v.lat, v.lon]])) }).replace(/</g, "\\u003c")}<\/script><script>${PERSONAL_JS}<\/script>
${MAV_WIDGET()}
<script>${MAV_ASK_JS}<\/script><script>${HIDE_JS}<\/script><script>${FOLD_JS}<\/script>
<script>/* ActiveCampaign context: remember the reader's chosen postcode and the page they're on, so sign-ups record both */
try{var _pc=localStorage.getItem("pc");if(/^\\d{4}$/.test(_pc||""))document.cookie="mpc="+_pc+"; Path=/; Max-Age=31536000; Secure; SameSite=Lax";if(!/(^|; )mutm=/.test(document.cookie)){var _q=new URLSearchParams(location.search),_u={};["source","medium","campaign","content","term"].forEach(function(k){var v=_q.get("utm_"+k);if(v)_u[k]=v.slice(0,100)});var _r="";try{_r=document.referrer?new URL(document.referrer).hostname:""}catch(_){}if(_r&&_r!==location.hostname)_u.ref=_r;_u.land=location.pathname.slice(0,100);if(_u.source||_u.ref||_q.has("gclid")||_q.has("fbclid")){if(!_u.source&&_q.has("gclid"))_u.source="google",_u.medium="cpc";if(!_u.source&&_q.has("fbclid"))_u.source="facebook",_u.medium="social"}document.cookie="mutm="+encodeURIComponent(JSON.stringify(_u))+"; Path=/; Max-Age=7776000; Secure; SameSite=Lax"}if(!/^\\/(signin|welcome|unlock|optin|auth|subscribe|api)/.test(location.pathname))document.cookie="mpg="+encodeURIComponent(location.pathname)+"; Path=/; Max-Age=86400; Secure; SameSite=Lax"}catch(_){}<\/script>
<script>/* External links: open in a new tab and tell the site the visit came from this Daily Maverick (UTM tags), so their analytics credit us. */
function m2utm(a){try{var u=new URL(a.href,location.href);if(!/^https?:$/.test(u.protocol)||u.host===location.host||u.host==="accounts.google.com"||(/(^|\\.)google\\./.test(u.host)&&/^\\/maps/.test(u.pathname))||u.searchParams.has("utm_source")||a.dataset.noutm!=null)return u;
var s=a.closest("section[id]");u.searchParams.set("utm_source",location.host);u.searchParams.set("utm_medium","referral");u.searchParams.set("utm_campaign","daily-maverick");if(s)u.searchParams.set("utm_content",s.id);a.href=u.toString();return u}catch(_){return null}}
["click","auxclick","contextmenu"].forEach(function(ev){document.addEventListener(ev,function(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a)return;var u=m2utm(a);if(ev==="click"&&u&&!a.target&&/^https?:$/.test(u.protocol)&&u.host!==location.host){a.target="_blank";a.rel=((a.rel||"")+" noopener").trim()}},true)})</script>
<script>/* UX rules 1, 4 and 9: live tiles say when they were updated, step aside if a feed is down, and every sourced feed has a fix-it link */
(function(){function hm(){return new Date().toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'})}
document.querySelectorAll('.tiles').forEach(function(c){if(!c.querySelector('.tile b'))return;var st=document.createElement('p');st.className='upd';st.setAttribute('aria-live','polite');c.parentNode.insertBefore(st,c.nextSibling);
function live(){return[].some.call(c.querySelectorAll('.tile b'),function(b){return b.textContent.trim()!=='–'})}
new MutationObserver(function(){if(live())st.textContent='Live data · updated '+hm()}).observe(c,{subtree:true,characterData:true,childList:true});
setTimeout(function(){var all=[].slice.call(c.querySelectorAll('.tile')),dead=all.filter(function(t){var b=t.querySelector('b');return b&&b.textContent.trim()==='–'});if(!dead.length)return;dead.forEach(function(t){t.hidden=true});if(dead.length===all.length){c.hidden=true;st.textContent='Live data is taking a short break. Check back soon.'}},12000)});
setTimeout(function(){document.querySelectorAll('main p,main span,main div').forEach(function(e){if(!e.children.length&&/^(Loading…|checking…)$/.test(e.textContent.trim()))e.textContent='Couldn’t load just now. Check back soon.'})},15000);
var f=document.getElementById('rform');document.querySelectorAll('#flow>section,main section').forEach(function(sc){var ps=sc.querySelectorAll('p.src');if(!ps.length||sc.querySelector('.fix'))return;var h=sc.querySelector('h2'),nm=h?h.textContent.trim():'this section',p=document.createElement('p');p.className='fix';p.innerHTML='<a href="#rate">Spot an error, or want to add something?</a>';
p.querySelector('a').onclick=function(e){if(!window.m2err)return;e.preventDefault();window.m2err(nm)};var last=ps[ps.length-1];last.parentNode.insertBefore(p,last.nextSibling)})})();</script>
<script>(function(){var first=null,seen=false;try{seen=!!localStorage.getItem('src_hint')}catch(e){}
document.querySelectorAll('p.src').forEach(function(p){p.hidden=true;var b=document.createElement('button');b.type='button';b.className='srcbtn';b.innerHTML='ⓘ <span>Where from?</span>';
b.setAttribute('aria-label','Where this information comes from');b.setAttribute('aria-expanded','false');
b.onclick=function(){p.hidden=!p.hidden;b.setAttribute('aria-expanded',String(!p.hidden));b.classList.toggle('on',!p.hidden);try{localStorage.setItem('src_hint','1')}catch(e){}var h=document.getElementById('srchint');if(h)h.remove()};
p.parentNode.insertBefore(b,p);if(!first)first=b});
})();</script>
<script>(function(){var TW=${JSON.stringify(Object.entries(TOWNS).filter(([, t]) => t.live).map(([k, t]) => [k, t.lat, t.lon]))};var L=null;try{L=JSON.parse(localStorage.getItem("loc"))}catch(e){}document.querySelectorAll(".useloc").forEach(function(a){if(L)a.textContent=a.dataset.on||"🎯 Tuned to exactly where you are (reset)";
a.onclick=function(e){e.preventDefault();if(L){try{localStorage.removeItem("loc")}catch(_){}location.reload();return}if(!navigator.geolocation){a.textContent="Location not available on this device";return}a.textContent="📍 Finding you…";
navigator.geolocation.getCurrentPosition(function(p){var la=+p.coords.latitude.toFixed(2),lo=+p.coords.longitude.toFixed(2);try{localStorage.setItem("loc",JSON.stringify([la,lo]))}catch(_){}
var best=null,bd=1e9;TW.forEach(function(t){var d=Math.pow(t[1]-la,2)+Math.pow((t[2]-lo)*Math.cos(la*Math.PI/180),2);if(d<bd){bd=d;best=t[0]}});
if(/^\\/\\d{4}\\/?$/.test(location.pathname)&&best&&bd<0.09&&location.pathname.indexOf(best)<0){try{localStorage.setItem("pc",best)}catch(_){}location.replace("/"+best)}else location.reload()},function(){a.textContent="📍 Location not allowed"},{timeout:10000})}})})();
if("serviceWorker"in navigator)navigator.serviceWorker.register("/sw.js").then(function(r){r.update()}).catch(()=>{})</script>
<script>${APP_JS}<\/script>
<dialog id="m2sheet" class="instsheet" aria-labelledby="m2sh"><h2 id="m2sh">Download ${esc(/^the /i.test(R.brand) ? R.brand : "the " + R.brand)} ${esc(R.short)} app to your home screen</h2><p id="m2how"></p><p class="mute">One tap and you're in. No app store, nothing to update. Free.</p><button type="button" id="m2go" class="m2go" hidden>⬇️ Download</button><form method="dialog"><button class="xno">Not now</button></form></dialog>
<script>/* "Get the app": installs this Daily Maverick to the phone home screen or computer desktop. Chrome/Edge/Android get the one-tap prompt; iPhone/iPad and Safari get two-step instructions. Hidden once installed. */
(function(){var b=document.getElementById("m2inst"),s=document.getElementById("m2sheet"),how=document.getElementById("m2how"),ev=null,ua=navigator.userAgent;
var inApp=matchMedia("(display-mode: standalone)").matches||navigator.standalone;if(inApp||!b)return;
var ios=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1),safari=/Safari/.test(ua)&&!/Chrome|CriOS|FxiOS|EdgiOS|Edg\\//.test(ua),mac=/Macintosh/.test(ua)&&!ios,ff=/Firefox|FxiOS/.test(ua);
var told=false;function done(){b.hidden=true;if(told)return;told=true;fetch("/api/installed",{method:"POST"}).catch(function(){})}
var nm=decodeURIComponent((document.cookie.match(/(?:^|; )m2450n=([^;]*)/)||[])[1]||"").trim().split(" ")[0];if(nm&&nm!=="Local")document.getElementById("m2sh").textContent="Download "+nm+"\u2019s Daily Maverick app to your home screen";
var go=document.getElementById("m2go");go.onclick=function(){if(!ev)return;ev.prompt();ev.userChoice.then(function(c){if(c.outcome==="accepted"){done();s.close&&s.close()}ev=null;go.hidden=true}).catch(function(){})};
addEventListener("beforeinstallprompt",function(e){e.preventDefault();ev=e;b.hidden=false});
addEventListener("appinstalled",function(){ev=null;done()});
if(ios)how.innerHTML=safari?"Tap the <b>Share</b> button <span aria-hidden=true>⬆️</span> at the bottom of Safari, scroll down and tap <b>Add to Home Screen</b>.":"Tap <b>Share</b> <span aria-hidden=true>⬆️</span> (top right or bottom of the screen), then <b>Add to Home Screen</b>. If you can't see it, open this page in Safari.";
else if(mac&&safari)how.innerHTML="In the menu bar, click <b>File</b> then <b>Add to Dock</b>. It'll sit in your Dock like any other app.";
else if(ff)how.innerHTML=/Android/.test(ua)?"Tap the <b>⋮ menu</b> then <b>Install</b> (or <b>Add to Home screen</b>).":"Firefox can't install sites as apps yet. Open ${R.domain} in <b>Chrome</b>, <b>Edge</b> or <b>Safari</b> and tap the green download button.";
else how.innerHTML="Open your browser's <b>⋮ menu</b> and choose <b>Install app</b> or <b>Add to Home screen</b>.";
if(ios||(mac&&safari)||ff)b.hidden=false;
b.onclick=function(){if(ev){go.hidden=false;how.textContent="Tap Download and it goes straight onto your home screen, like any other app."}else go.hidden=true;
if(s.showModal)s.showModal();else alert(document.getElementById("m2sh").textContent+". "+how.textContent)}})();</script></body></html>`,
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
  { name: "Eta Aquariid meteor shower peaks (best before dawn, one of the best from Australia)", md: "05-06", major: true },
  { name: "Orionid meteor shower peaks (look north-east after midnight)", md: "10-21" },
  { name: "Leonid meteor shower peaks", md: "11-17" },
  { name: "Geminid meteor shower peaks (the year's best, look north after 11pm)", md: "12-14", major: true },
  { name: "Total solar eclipse across Australia: total along a path from the Kimberley through the NT, south-west Queensland and NSW, including Sydney; partial everywhere else in Australia", date: "2028-07-22", major: true },
  { name: "Halley's Comet returns (closest to the Sun)", date: "2061-07-28" },
];
const skyNext = () => { const t = todayISO(), y = +t.slice(0, 4);
  return SKY.map(e => ({ ...e, d: e.date || (`${y}-${e.md}` >= t ? `${y}-${e.md}` : `${y + 1}-${e.md}`) })).filter(e => e.d >= t).sort((a, b) => a.d.localeCompare(b.d)); };
// "How far away" note for upcoming dates, e.g. "in 12 days".
const away = d => { const n = Math.round((new Date(d + "T00:00:00Z") - new Date(todayISO() + "T00:00:00Z")) / 864e5); return n < 0 ? "" : ` <span class="away">${n === 0 ? "today" : n === 1 ? "tomorrow" : `in ${n.toLocaleString("en-AU")} days`}</span>`; };
const fmtDate = d => new Date(d + "T00:00:00").toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
const costTag = e => e.cost == null ? "" : ` <span class="tagg">${e.cost === 0 ? "Free" : "$" + e.cost + (e.kids ? " per kid" : "")}</span>`;
const evItem = e => `<li${e.cost === 0 ? ' data-free="1"' : ""}${e.kids ? ' data-kids="1"' : ""}><b>${esc(fmtDate(e.date))}${e.time ? " " + esc(e.time) : ""}</b>${away(e.date)} — ${e.link ? `<a href="${esc(e.link)}" rel="nofollow noopener">${esc(e.title)}</a>` : esc(e.title)}${e.venue ? `, ${esc(e.venue)}` : ""}${costTag(e)}${e.desc ? `<br><span class="mute">${esc(e.desc)}</span>` : ""}</li>`;

async function town(pc, env, ctx, isRoot = false, secSlug = "") {
  const t = TOWNS[pc];
  if (!t || !t.live) return page(`${pc} — coming soon`, `<h1>${esc(pc)}${t ? " " + esc(t.name) : ""}</h1>
${wip(`This one isn't live yet`)}<p>${R.coverage} Want your town next? Leave your email and you'll hear when it's up.</p>${signup(pc)}<p><a href="/${R.code}">See ${R.code} ${R.place}</a></p>`, pc);

  // Local submissions first, then events from feeds.
  const others = Object.entries(TOWNS).filter(([k, v]) => k !== pc && v.live).sort((a, b) => km(t, a[1]) - km(t, b[1]));
  const [local, feed, near] = await Promise.all([listEvents(env, `event:${pc}:`), listEvents(env, `feed:${pc}:`),
    Promise.all(others.map(([k]) => Promise.all([listEvents(env, `event:${k}:`), listEvents(env, `feed:${k}:`)]).then(([a, b]) => [...a, ...b].slice(0, 4))))]);
  let nearby = ""; others.forEach(([k, v], i) => { const ev = near[i]; if (ev.length) nearby += `<h3>Nearby: ${esc(v.name)} (${k})</h3><ul>${ev.map(evItem).join("")}</ul>`; });
  const events = ((local.length ? `<h3>From locals</h3><ul>${local.map(evItem).join("")}</ul>` : "")
    + (feed.length ? `<h3>More around town</h3><ul>${feed.map(evItem).join("")}</ul>` : "")
    || `<p>Nothing listed in ${esc(pc)} yet. Know something on? <a href="/submit?pc=${pc}">Add it free</a>.</p>`) + nearby;

  const cc = clockChange(), ann = await S(annBanner(env)), live = { newsLead: "", news: "", alerts: "", alertNote: "", holidays: "", ...(await S(liveBlocks(env, ctx, { lat: t.lat, lon: t.lon }), {})) };
  const nLocals = await S(localsCount(env), 0);
  const W = Object.fromEntries(await Promise.all(Object.keys(WATCH).map(async id => [id, await S(env.DATA.get(`srcw:${id}`, "json"), null)])));
  const soon = (id, title, what, link, linkText) => `<section id="${id}"><h2>${title}</h2>${wip(what.replace(/,? coming soon\.?/i, "."), link, linkText)}</section>`;
  const SH = secSlug ? sectionHead(secSlug, { esc, R, pc }) : null;
  const hero = SH ? "" : await S(potdBlock(env, pc)); let edB = ""; try { edB = edBlock(await edData(env, R.code), esc); } catch (e) { edB = ""; } let scB = ""; try { scB = scamTeaser(await scamFeeds(env), esc); } catch (e) { scB = ""; }
  let pics = {}; try { pics = await sidePics(env, pc, t, todayISO(), UA); } catch (e) { pics = {}; }
  // Section pages are today's paper filtered to that section: the nameplate and front-page extras step aside.
  const secCss = SH ? `<style>.mast,.edition,.gath,.tloc,#lead,.usp,.townh,main>nav.towns,#radiobar,main>.qs,main>.note,main>.alertnote,main>p.mute,#founding{display:none!important}#flow>:not(section):not(script){display:none}${SH.ids.includes("news") ? "#lead{display:block!important}" : ""}</style>` : "";
  return page(SH ? SH.title : `The Daily Maverick: ${t.name} ${pc}`, withPics(pics, `${SH ? secCss + SH.head : ""}${isRoot ? `<script>try{var sp=localStorage.getItem('pc');if(sp&&/^\\d{4}$/.test(sp)&&sp!=='${R.code}')location.replace('/'+sp+location.hash)}catch(e){}</script>` : ""}
<p class="mast">The Daily Maverick</p><p class="edition">${esc(new Date(todayISO() + "T00:00:00").toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" }))}</p><p class="gath" id="pers">${dailyLine()}</p><p class="tloc"><a href="#" class="useloc" data-on="Reset">Refine your local news</a></p>${hero}${live.newsLead}<details class="usp"><summary id="uspl">📱 Your app saves you ${appsSaved().length} apps</summary>${appChips()}<p class="oeq">= <b>1 Daily Maverick</b></p></details><script>(function(){try{var A=${JSON.stringify(appsSaved().map(x => x[1]))},n=A.filter(function(id){return localStorage.getItem("hide_"+id)!=="1"}).length,l=document.getElementById("uspl");if(l&&n<A.length)l.textContent="📱 Your app saves you "+n+" apps"}catch(e){}})()<\/script><script>try{if(/(?:^|; )m2450n=/.test(document.cookie)){var pn=decodeURIComponent((document.cookie.match(/(?:^|; )m2450n=([^;]*)/)||[])[1]||"").trim();if(pn&&pn!=="Local")document.getElementById("pers").textContent="✨ "+pn+"\\u2019s personalised local daily news."}}catch(e){}<\/script>
<h1 class="townh sr">${esc(t.name)} ${esc(pc)}</h1>
<nav class="towns" aria-label="Postcode">${Object.entries(TOWNS).filter(([, v]) => v.live).map(([k, v]) => k === pc ? `<span class="pc on" aria-current="page">${esc(v.name)} ${esc(k)}</span>` : `<a class="pc" href="/${esc(k)}" title="${esc(v.name)}" aria-label="${esc(k)} ${esc(v.name)}" onclick="try{localStorage.setItem('pc','${esc(k)}')}catch(e){}">${esc(k)}</a>`).join("")}<a class="pc add" href="/suggest" title="Add your town" aria-label="Add your town">+</a></nav>
<div id="radiobar" hidden></div>
<script>/* Your station: pick one with ☆ in Local radio and it sits up top, one tap to listen live. */
(function(){var bar=document.getElementById('radiobar');function fav(){try{return JSON.parse(localStorage.getItem('radio_fav'))}catch(e){return null}}
function draw(){var f=fav();if(!f){bar.hidden=true;bar.innerHTML='';}else{bar.hidden=false;bar.innerHTML='<span>📻 Your station: <b></b></span><a rel="noopener" target="_blank">▶ Listen live</a><button type="button" aria-label="Remove my station">×</button>';bar.querySelector('b').textContent=f.n;bar.querySelector('a').href=f.u;bar.querySelector('button').onclick=function(){try{localStorage.removeItem('radio_fav')}catch(e){}draw()}}
document.querySelectorAll('.rfav').forEach(function(b){b.textContent=f&&f.u===b.dataset.u?'★':'☆'})}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.rfav');if(!b)return;var f=fav();try{if(f&&f.u===b.dataset.u)localStorage.removeItem('radio_fav');else localStorage.setItem('radio_fav',JSON.stringify({n:b.dataset.n,u:b.dataset.u}))}catch(_){}draw()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',draw);else draw()})()</script>
<div class="qs" hidden><input id="qs" type="search" placeholder="🔎 What do you need? Try bins, tides, mayor…" autocomplete="off" aria-label="Search ${esc(pc)}">
<div id="qs-saved" class="chips"></div><div id="qs-res" role="status" aria-live="polite"></div></div>
${ann}${live.alertNote}
${cc.soon ? `<p class="note">⏰ ${cc.text}</p>` : ""}
<div id="flow"><section id="today"><div class="tiles">
<div class="tile"><span id="i-wx" class="ico">⛅</span><b id="t-temp">–</b><small id="t-sky">Weather</small></div>
<div class="tile"><span class="ico">🌧️</span><b id="t-rain">–</b><small>Rain chance</small></div>
<div class="tile"><span class="ico">💨</span><b id="t-wind">–</b><small id="t-windd">Wind</small></div>
<div class="tile"><span class="ico">🌅</span><b id="t-rise">–</b><small id="t-set">Sunrise</small></div>
<div class="tile"><span class="ico">🌊</span><b id="t-tide">–</b><small id="t-tide2">Next tide</small></div>
<div class="tile"><span class="ico">🏄</span><b id="t-swell">–</b><small>Swell</small></div>
<div class="tile"><span class="ico" id="i-moon">🌙</span><b id="t-moon">–</b><small id="t-moon2">Moon</small></div>
${BIN_SRC[R.code] && BIN_SRC[R.code].kind !== "link" ? `<a class="tile bintile" href="/home#bauto"><span class="ico" id="i-bin">🗑️</span><b id="t-bin">Bins</b><small id="t-bin2">Set your bin night</small></a>
<script>${BINS_JS(R.code)}(function(){var B=window.M2B;if(!B.auto())return;B.next(function(d){var x=B.upcoming(d)[0];if(!x)return;
document.getElementById('i-bin').innerHTML=x.bins.map(function(b){return B.lid(b,1)}).join('');document.getElementById('t-bin').textContent=B.when(x.date).replace(/^./,function(c){return c.toUpperCase()});
document.getElementById('t-bin2').textContent=x.bins.map(function(b){return B.NM[b]}).join(' + ')})})()<\/script>` : ""}
${cc.soon ? `<div class="tile"><span class="ico">⏰</span><b>${esc(cc.date)}</b><small>Clocks ${cc.dir}</small></div>` : ""}
</div><div id="frs"></div></section>
${live.alerts}
${live.news}
${oneAppBlock(nLocals)}
${edB}
${scB}
${hooksStrip(pc)}
${SH && SH.ids.includes("love") ? loveBlock(pc) : ""}
${await S(plannerBlock(env))}
<section id="events"><h2>🎪 Community events</h2>${events}<p><a href="/submit?pc=${pc}">+ Add an event (free)</a></p></section>
${await S(bdmBlock(env, ctx))}
<section id="tools"><h2>Handy tools</h2>
<a class="card" href="/all">☰ <b>Everything on the Daily Maverick</b> Every page we have, in one place →</a>
${await S(tsLine(env))}
<a class="card" href="/notices">📌 <b>Community notice board</b> Lost pets, volunteers, clubs and classes. No buy and sell →</a>
<a class="card" href="/home">🏡 <b>My home</b> Bin night reminders and a house-sitter sheet to print or share →</a>
<a class="card" href="/${R.why.slug}${LOVE[pc] ? "?pc=" + pc : ""}">❤️ <b>${LOVE[pc] ? `Why ${esc(LOVE[pc].name)}?` : R.why.title}</b> ${LOVE[pc] ? `What ${esc(pc)} has that nowhere else does, plus the whole area` : R.why.card} →</a>
<a class="card" href="/open">🟢 <b>What&rsquo;s open?</b> Local or visiting: pharmacies, doctors, servos, cafés, mechanics and more. Open ones first →</a>
<a class="card" href="/open?c=dogs">🐕 <b>Dog beaches & parks</b> Off-leash spots near you →</a>
<a class="card" href="/open?c=petfriendly">🐶 <b>Dog-friendly cafés & pubs</b> Places happy to see your dog →</a>
<a class="card" href="/open?c=lgbtq">🏳️‍🌈 <b>LGBTQ+ friendly</b> Local places that welcome everyone →</a>
<a class="card" href="/watch">🍿 <b>What are you binging?</b> Shows, podcasts and channels locals vote for, and why →</a>
<a class="card" href="/fridge">🧊 <b>What's in your fridge?</b> Dinner ideas from what you've already got →</a>
<a class="card" href="/birthday">🎂 <b>Birthday deals</b> Which local places look after you on your big day →</a>
<a class="card" href="/kids">🧒 <b>Kid Zone</b> Games for kids 12 and under, with a grown-up&rsquo;s OK. No chat, no ads, nothing collected →</a>
<a class="card" href="/genalpha"><img class="tav" src="/team/jimmy-joel.svg" alt="" width="24" height="24"><b>Gen Alpha interpreter</b> What did your kid just say? Jimmy Joel translates →</a>
<a class="card" href="/bdm">📰 <b>Births, Deaths and Marriages</b> Family notices, filtered by what you&rsquo;re looking for →</a>
<a class="card" href="/rent">🏠 <b>Renting</b> Every rental site, plus your rights and bond help, in one place →</a>
<a class="card" href="/jobs">💼 <b>Jobs</b> Every job site in one place, already searched for ${esc(R.place)} →</a>
<a class="card" href="/school">🚸 <b>School run check</b> Weather and traffic for your school drop-off and pick-up →</a>
</section>
<section id="dogs"><h2>🐕 Dog friendly</h2><p class="mute">Off-leash beaches, dog parks and places happy to see your dog. If there&rsquo;s nothing mapped, it says so.</p><div id="dogs-l"></div>
<script>(function(){var B=document.getElementById('dogs-l'),C=[['dogs','🐕 Dog beaches &amp; parks'],['petfriendly','🐶 Dog-friendly caf&eacute;s &amp; pubs']],L=null;try{L=JSON.parse(localStorage.getItem('loc'))}catch(e){}var H=L||[${t.lat},${t.lon}],e=function(x){return String(x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var km=function(a,b){var r=Math.PI/180,x=Math.sin((b[0]-a[0])*r/2),y=Math.sin((b[1]-a[1])*r/2);return 12742*Math.asin(Math.sqrt(x*x+Math.cos(a[0]*r)*Math.cos(b[0]*r)*y*y))};
B.innerHTML=C.map(function(c){return '<div class="card" id="dogs-'+c[0]+'"><b>'+c[1]+'</b> <span class="mute">checking…</span></div>'}).join('');
C.forEach(function(c){fetch('/api/open?c='+c[0]).then(function(r){return r.json()}).then(function(j){var el=document.getElementById('dogs-'+c[0]),it=(j.items||[]).filter(function(x){return x.lat}).map(function(x){x.d=km(H,[x.lat,x.lon]);return x}).filter(function(x){return x.d<40}).sort(function(a,b){return a.d-b.d});
el.innerHTML='<b>'+c[1]+'</b>: '+(it.length?it.length+' near you. '+it.slice(0,3).map(function(x){return e(x.name)+' ('+x.d.toFixed(1)+' km)'}).join(', ')+(it.length>3?'…':'')+' <a href="/open?c='+c[0]+'">See all →</a>':'<b>none listed near you.</b> Know one? <a href="/feedback">Tell us</a>.')}).catch(function(){var el=document.getElementById('dogs-'+c[0]);el.innerHTML='<b>'+c[1]+'</b>: couldn&rsquo;t check just now.'})})})();</script>
<p class="src"><span class="srcw">Source:</span> <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap</a> (© OpenStreetMap contributors), the free map anyone can add to.</p></section>
<section id="lgbtq"><h2>🏳️‍🌈 LGBTQ+ friendly</h2><p class="mute">Local places that welcome everyone. If there&rsquo;s nothing mapped, it says so.</p><div id="lgbtq-l"></div>
<script>(function(){var B=document.getElementById('lgbtq-l'),C=[['lgbtq','🏳️‍🌈 LGBTQ+ friendly places']],L=null;try{L=JSON.parse(localStorage.getItem('loc'))}catch(e){}var H=L||[${t.lat},${t.lon}],e=function(x){return String(x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var km=function(a,b){var r=Math.PI/180,x=Math.sin((b[0]-a[0])*r/2),y=Math.sin((b[1]-a[1])*r/2);return 12742*Math.asin(Math.sqrt(x*x+Math.cos(a[0]*r)*Math.cos(b[0]*r)*y*y))};
B.innerHTML=C.map(function(c){return '<div class="card" id="lgbtq-'+c[0]+'"><b>'+c[1]+'</b> <span class="mute">checking…</span></div>'}).join('');
C.forEach(function(c){fetch('/api/open?c='+c[0]).then(function(r){return r.json()}).then(function(j){var el=document.getElementById('lgbtq-'+c[0]),it=(j.items||[]).filter(function(x){return x.lat}).map(function(x){x.d=km(H,[x.lat,x.lon]);return x}).filter(function(x){return x.d<40}).sort(function(a,b){return a.d-b.d});
el.innerHTML='<b>'+c[1]+'</b>: '+(it.length?it.length+' near you. '+it.slice(0,3).map(function(x){return e(x.name)+' ('+x.d.toFixed(1)+' km)'}).join(', ')+(it.length>3?'…':'')+' <a href="/open?c='+c[0]+'">See all →</a>':'<b>none listed near you.</b> Know one? <a href="/feedback">Tell us</a>.')}).catch(function(){var el=document.getElementById('lgbtq-'+c[0]);el.innerHTML='<b>'+c[1]+'</b>: couldn&rsquo;t check just now.'})})})();</script>
<p class="src"><span class="srcw">Source:</span> <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap</a> (© OpenStreetMap contributors), the free map anyone can add to.</p></section>
${fuelBlock(t)}
${await S(shopBlock(env))}
${await S(numbersBlock(env))}
${await S(aiBlock(env))}
${alcoholBlock()}
${await S(ratesBlock(env))}
${await S(projectBlock(env))}
<section id="sea"><h2>Tides &amp; fishing</h2><p id="tide" class="mute">Loading…</p>
<p class="mute">Tide times are modelled estimates. Not for navigation; check the Bureau of Meteorology before boating.</p>${fishBlock(t)}</section>
<section id="know"><h2>Know your ${esc(pc)}</h2><p class="mute">The handy stuff, all in one place. Every item is sourced and shown as the source has it. We don&rsquo;t edit it. We tell you where it&rsquo;s from and how well the owner keeps it up to date.</p>
${R.know(W, accLine)}${await S(absBlock(env, R.code, R, esc, fresh))}<p class="mute">Spotted something out of date? <a href="/feedback">Let us know</a>.</p></section>
${dirSection("rent", "🏠 Renting", `Looking for a place in ${R.place}? Every rental site, already searched for you.`, rentGroups(R), "/rent", "Every rental site, your rights and bond help")}
${dirSection("jobs", "💼 Jobs", `Looking for work in ${R.place}? Every job site, already searched for you.`, jobGroups(R), "/jobs", "Every job site, plus council, harvest and local employers")}
${radioSection(R, esc)}
${await S(councilBlock(env))}
${awardBlock()}
${await S(kidsBlock(local, feed, pc))}
${outdoorBlock()}
${R.fields ? `<section id="sport"><h2>Sport &amp; field closures</h2>
<div class="note">🔔 <b>Get field closure alerts</b> on your phone the moment we know. <button type="button" class="pushbtn" data-topic="fields">Turn on alerts</button><br><small class="mute pushmsg"></small></div>
${await S(fieldsBlock(env, ctx))}
<p class="mute">Clubs: post games, fixtures and closures free via <a href="/submit?pc=${pc}">Add an event</a>.</p></section>` : soon("sport", "Sport & field closures", "Field closures and local sport, coming soon. Clubs can post games and closures free via Add an event.")}
${await S(flightsBlock(env))}
${live.holidays}
<section id="puzzles"><h2>🧩 Crossword</h2><p>Today&rsquo;s ${esc(R.short)} crossword in three levels: 🟢 Easy, 🟡 Medium and 🔴 Hard. Sign in free to keep your streak and best times. <a href="/crossword"><b>Play today&rsquo;s →</b></a></p></section>
${starsBlock()}
<section id="beaches"><h2>🏖️ Beach, surf &amp; surf cams</h2><div class="tiles" id="bch">
<div class="tile"><span class="ico">🌡️</span><b id="b-sst">–</b><small>Water temp</small></div><div class="tile"><span class="ico">🌊</span><b id="b-wave">–</b><small id="b-wave2">Waves</small></div>
<div class="tile"><span class="ico">💨</span><b id="b-wind">–</b><small id="b-wind2">Wind</small></div><div class="tile"><span class="ico">☀️</span><b id="b-uv">–</b><small id="b-uv2">UV today</small></div></div>
${R.surf ? `<div id="bbest"></div>` : ""}
<h3>📹 Surf cams</h3><p class="mute">Coastalwatch charges for its live surf cam feed, so we can&rsquo;t show it here. Nobody pays to be on this site, and we don&rsquo;t pay to show other people&rsquo;s paid content either. Have a look on their site: <a href="https://www.coastalwatch.com" rel="noopener">Coastalwatch</a>.</p>
<p class="mute">Swim between the red and yellow flags. Patrol times and beach-by-beach info: <a href="https://beachsafe.org.au" rel="noopener">Beachsafe</a>.</p>
<p class="src"><span class="srcw">Source:</span> <a href="https://open-meteo.com" rel="noopener">Open-Meteo</a> (modelled, updated hourly). Not for navigation.${R.surf ? ` Which swell and wind suit each beach: <a href="https://www.surf-forecast.com" rel="noopener">surf-forecast.com</a> break guides; patrols from council.` : ""}</p>
<script>(function(){var t=${JSON.stringify({ lat: t.lat, lon: t.lon, mlat: t.mlat, mlon: t.mlon })},SURF=${JSON.stringify(R.surf || [])},SNOTE=${JSON.stringify(R.surfNote || "")},SW=null,WD=null,$=function(i,v){var e=document.getElementById(i);if(e)e.textContent=v},D=['N','NE','E','SE','S','SW','W','NW'],dir=function(d){return D[Math.round(d/45)%8]};
var C16={N:0,NNE:22.5,NE:45,ENE:67.5,E:90,ESE:112.5,SE:135,SSE:157.5,S:180,SSW:202.5,SW:225,WSW:247.5,W:270,WNW:292.5,NW:315,NNW:337.5};
function ad(a,b){var d=Math.abs(a-b)%360;return d>180?360-d:d}
function best(){var B=document.getElementById('bbest');if(!B||!SURF.length||!SW||!WD||SW[0]==null)return;var h=SW[1]||0;
var r=SURF.map(function(b){var s=ad(SW[0],C16[b[1]]),w=ad(WD[0],C16[b[2]]),lite=WD[1]<10,ex=s<=25?1:s<=50?0.7:0.4,wave=h*ex,note=b[3].toLowerCase(),pat=/patrolled/.test(note)&&!/not patrolled/.test(note),rocky=/rock|point|reef|breakwall/.test(note);
var sc=(wave>=0.3&&wave<=1?3:wave<0.3?1.5:wave<=1.4?1:-2)+(lite?2:w<=35?2:w<=70?1:0)+(pat?1.5:0)+(/beginner/.test(note)?1.5:0)-(rocky?3:0);
return{b:b,sc:sc,wave:wave,why:'waves around '+wave.toFixed(1)+' m, '+(lite?'light winds':w<=70?'offshore '+dir(WD[0])+' wind':'onshore wind, a bit messy')+(pat?', patrolled':'')}}).sort(function(a,b){return b.sc-a.sc});
var top=r.filter(function(x){return x.wave<=1.4&&x.sc>=2}).slice(0,3);
B.innerHTML='<h3>🏄 Best for beginners today</h3><p class="mute">Learning, or just want a gentle paddle away from the crowd? These look friendliest today.</p>'+(top.length?'<ol class="fls">'+top.map(function(x,i){return '<li'+(i?'':' class="hit"')+'><b>'+(i?'':'⭐ ')+x.b[0]+'</b><br><small>'+x.why+'. '+x.b[3]+'</small></li>'}).join('')+'</ol>':'<p class="note">🌊 Too big for beginners today. Stay in the shallows between the flags, or try again tomorrow.</p>')
+(SNOTE?'<p class="mute">'+SNOTE+'</p>':'')+'<p class="mute">A guide from forecast models and surf guides, not a promise. Check it with your own eyes before you paddle out, and swim between the flags.</p>'}
fetch('https://marine-api.open-meteo.com/v1/marine?latitude='+t.mlat+'&longitude='+t.mlon+'&current=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,sea_surface_temperature&timezone=Australia%2FSydney').then(function(r){return r.json()}).then(function(j){var c=j.current||{};SW=[c.swell_wave_direction!=null?c.swell_wave_direction:c.wave_direction,c.swell_wave_height!=null?c.swell_wave_height:c.wave_height];best();if(c.sea_surface_temperature!=null)$('b-sst',Math.round(c.sea_surface_temperature)+'°C');if(c.wave_height!=null){$('b-wave',c.wave_height.toFixed(1)+' m');$('b-wave2',dir(c.wave_direction)+' · '+Math.round(c.wave_period)+' s')}}).catch(function(){});
fetch('https://api.open-meteo.com/v1/forecast?latitude='+t.lat+'&longitude='+t.lon+'&current=wind_speed_10m,wind_direction_10m&daily=uv_index_max&timezone=Australia%2FSydney&forecast_days=1').then(function(r){return r.json()}).then(function(j){var c=j.current||{},u=(j.daily||{}).uv_index_max;if(c.wind_speed_10m!=null){WD=[c.wind_direction_10m,c.wind_speed_10m];best();$('b-wind',Math.round(c.wind_speed_10m)+' km/h');$('b-wind2',dir(c.wind_direction_10m)+' wind')}if(u&&u[0]!=null){var v=Math.round(u[0]);$('b-uv',v);$('b-uv2',v>=11?'Extreme UV':v>=8?'Very high UV':v>=6?'High UV':v>=3?'Moderate UV':'Low UV')}}).catch(function(){});})();</script></section>
</div>
${SH ? SH.tail : ""}${PUSH_JS()}${rally(nLocals, pc)}
<script>
try{localStorage.setItem('pc','${pc}')}catch(e){}
var IDX=[...${JSON.stringify(R.idx)},["weather temperature rain wind forecast","Weather today","Today's weather, rain chance and wind are in the tiles at the top.","#today"],
["sunrise sunset moon","Sunrise, sunset and moon","See the tiles at the top of the page.","#today"],
["tide tides fishing fish swell waves boat","Tides & fishing","Next high and low tides, waves and swell. Modelled estimates, not for navigation.","#sea"],
["surf cam beach waves","Surf cams","Where to find live surf cams, in Beach & surf.","#beaches"],["beach patrol lifeguard swim","Beaches","Patrolled beaches via Beachsafe.","#beaches"],
["event events whats on what's on markets gig music things to do weekend","What's on","Local events, with locals' submissions first.","#events"],
["add event submit list my event","Add an event","List your event free, checked before it goes live.","/submit?pc=${pc}"],
["dumping illegal dumped","Illegal dumping","Report it online via the NSW EPA (Environment Protection Authority).","#know"],
["pothole footpath streetlight report problem fix overgrown","Report a problem","Use the council request form.","#know"],
["complaint complain ombudsman unhappy","Complaints","Council first; then the NSW Ombudsman.","#know"],
["fuel petrol diesel servo cheap","Fuel","Cheapest fuel: NSW FuelCheck for now.","#fuel"],["fire fires bushfire flood alert alerts emergency","Alerts","Fires from the NSW RFS (Rural Fire Service); get the Hazards Near Me app for warnings. Emergencies: call 000.","#alerts"],
["traffic road roads closure crash roadworks","Traffic & roads","Live Traffic NSW for now.","/school"],["school drop off pick up school run zone","School run check","Weather and traffic for your school run.","/school"],
["holiday holidays school holidays public holiday","Holidays","NSW school calendar for now.","#holidays"],
["kids kid zone games game children child pet online safety robot ai","🧒 Kid Zone","Games for kids 12 and under, with a grown-up's OK.","/kids"],["dog dogs dog beach dog beaches off leash off-leash dog park dog parks dog friendly pet friendly","🐕 Dog beaches & parks","Off-leash beaches and dog parks near you.","/open?c=dogs"],["dog friendly cafe cafes pub pubs pet friendly bring my dog","🐶 Dog-friendly cafés & pubs","Places happy to see your dog.","/open?c=petfriendly"],["lgbtq lgbt lgbtqi gay lesbian queer trans rainbow pride inclusive welcoming","🏳️‍🌈 LGBTQ+ friendly","Local places that welcome everyone.","/open?c=lgbtq"],["pet shop pet shops groomer grooming animal shelter rescue adopt boarding kennel cattery pets animals","🐾 Pets & animals","Pet shops, groomers, shelters and boarding.","/open?c=pets"],["lgbtq lgbtqi lgbtqia gay lesbian queer trans bi rainbow pride friendly inclusive","🏳️‍🌈 LGBTQ+ friendly","Places that welcome everyone.","/open?c=lgbtq"],["radio community radio station fm listen live music local radio","📻 Local radio","Community radio stations in the shire.","#radio"],["rent rental rentals renting lease tenant tenants bond house flat unit room share house flatmates real estate","🏠 Renting","Every rental site, your rights and bond help.","/rent"],["job jobs work employment career careers hiring vacancy vacancies seek apprenticeship traineeship harvest picking","💼 Jobs","Every job site in one place.","/jobs"],["notice board notices lost pet found dog cat volunteer club group class workshop neighbour","Community notice board","Lost pets, volunteers, clubs, classes. No buy and sell.","/notices"],["bin night bins reminder house sitter house-sitter holiday away pets home","My home","Bin night reminders and a house-sitter sheet.","/home"],["open now hours pharmacy chemist mechanic doctor vet supermarket bottle shop cafe pub takeaway","Open now?","What's open near you right now.","/open"],["fridge dinner recipe recipes cook cooking food meal","What's in your fridge?","Dinner ideas from what you've got.","/fridge"],["birthday deal deals discount free birthday","Birthday deals","Local places that look after you on your birthday.","/birthday"],
["gen alpha slang kids rizz skibidi translate","Gen Alpha interpreter","Jimmy Joel translates kid-speak.","/genalpha"],["births birth baby babies marriage marriages wedding engaged engagement anniversary celebrations hatches matches","Births, Deaths and Marriages","New babies, engagements and weddings. Share your news free.","/bdm?f=births"],["baby name names ideas popular trending top girls boys generator meaning my name","👶 Baby names","Trending names, your name's history and name ideas with Mav.","/names"],["obituary obituaries funeral died death passed rip memory","Births, Deaths and Marriages","Recent local death notices.","/bdm?f=deaths"],
["clock clocks daylight saving time change","Clock change","Next clock change is in the tiles at the top.","#today"],["news headlines","News","Local news is live: the latest local headlines.","#news"],
["feedback idea suggestion contact","Make ${R.code} better","Send us your ideas.","/feedback"],["privacy data","Privacy","Plain-English privacy policy.","/privacy"],["terms charter free","Our charter","Free, forever.","/charter"]];
var qs=document.getElementById('qs'),qr=document.getElementById('qs-res'),qv=document.getElementById('qs-saved');
function esc2(x){return String(x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function saved(){try{return JSON.parse(localStorage.getItem('saved_q')||'[]')}catch(e){return[]}}
function drawSaved(){var a=saved();qv.innerHTML=a.map(function(x){return '<label class="sq">'+esc2(x)+' <span data-x="'+esc2(x)+'" title="Remove">×</span></label>'}).join('')}
qv.onclick=function(e){var x=e.target.dataset.x;if(x){try{localStorage.setItem('saved_q',JSON.stringify(saved().filter(function(y){return y!==x})))}catch(_){}drawSaved();return}
var l=e.target.closest('.sq');if(l){qs.value=l.firstChild.textContent.trim();find()}};
function find(){var v=qs.value.toLowerCase().trim();if(v.length<2){qr.innerHTML='';return}var w=v.split(/\\s+/),hits=IDX.map(function(r){var sc=w.filter(function(x){return (r[0]+' '+r[1].toLowerCase()).indexOf(x)>-1}).length;return[sc,r]}).filter(function(x){return x[0]}).sort(function(a,b){return b[0]-a[0]}).slice(0,4).map(function(x){return x[1]});
document.querySelectorAll('#events li').forEach(function(li){if(hits.length<6&&li.textContent.toLowerCase().indexOf(v)>-1)hits.push(['',li.querySelector('b')?li.textContent.slice(0,60):'Event',li.textContent.slice(0,140),'#events'])});
/* Unified search: today's stories, headlines, notices and listings too, not just the index */
var seenQ={};document.querySelectorAll('#flow .story,#flow .heads li,#flow section:not(#events) li').forEach(function(el){if(hits.length>=10)return;var tx=el.textContent.replace(/\\s+/g,' ').trim();if(!tx||seenQ[tx]||tx.toLowerCase().indexOf(v)<0)return;seenQ[tx]=1;var sc=el.closest('section[id]'),h=sc&&sc.querySelector('h2'),a=el.matches('a[href]')?el:el.querySelector('a[href]');hits.push(['',(h?h.textContent.trim()+': ':'')+tx.slice(0,70),tx.slice(0,140),(a&&a.getAttribute('href'))||('#'+(sc?sc.id:'flow'))])});
qr.innerHTML=(hits.length?hits.map(function(r){return '<a class="card qhit" href="'+r[3]+'"><b>'+esc2(r[1])+'</b><br><span class="mute">'+esc2(r[2])+'</span></a>'}).join(''):'<p class="mute">Nothing yet. <a href="/feedback">Tell us what you were looking for</a>.</p>')
+'<p class="mute"><a href="#" id="qs-save">☆ Save this search</a> · ⏰ Schedule it: 🚧 coming soon</p>';
document.getElementById('qs-save').onclick=function(e){e.preventDefault();var a=saved();if(a.indexOf(v)<0){a.unshift(v);a=a.slice(0,8)}try{localStorage.setItem('saved_q',JSON.stringify(a))}catch(_){}drawSaved();this.textContent='★ Saved'}}
qr.onclick=function(e){var a=e.target.closest('a.qhit');if(a&&a.getAttribute('href').charAt(0)=='#'){var t=document.querySelector(a.getAttribute('href'));if(t&&t.classList.contains('panel')&&window.openPanel){e.preventDefault();openPanel(t.id);return}if(t){t.hidden=false;t.querySelectorAll('details').forEach(function(d){d.open=true})}}};
qs.oninput=find;drawSaved();

(function(){var g=function(k){try{return localStorage.getItem(k)}catch(e){return null}},day=g('bin_bday');if(day===null||day==='')return;var d=new Date(),diff=(+day-d.getDay()+7)%7;if(diff>1)return;
var n=new Date(d);n.setDate(d.getDate()+diff);var wk=Math.floor((Date.UTC(n.getFullYear(),n.getMonth(),n.getDate())/864e5+4)/7),a=null;try{a=JSON.parse(g('bin_anchor'))}catch(e){}var alt=a?((wk-a[0])%2===0?a[1]:3-a[1]):1;
var el=document.createElement('p');el.className='note';el.innerHTML='🗑️ <b>Bin night '+(diff===0?'tonight':'tomorrow')+':</b> '+(g('bin_bweekly')||'Green')+' + '+(alt==1?(g('bin_balt1')||'Red'):(g('bin_balt2')||'Yellow'))+' <a href="/home">change</a>';
var t=document.getElementById('today');t.parentNode.insertBefore(el,t)})();
(function(){var f=document.getElementById('flow'),o;try{o=JSON.parse(localStorage.getItem('order')||'null')}catch(e){}
if(window.SECT){Array.prototype.forEach.call(f.children,function(el){if(el.tagName!=='SCRIPT')el.hidden=SECT.indexOf(el.id)<0});SECT.forEach(function(id){var el=document.getElementById(id);if(el&&el.parentNode===f){el.hidden=false;f.appendChild(el)}});
window.openPanel=function(id){var el=document.getElementById(id);if(el){el.hidden=false;el.scrollIntoView({behavior:'smooth',block:'start'})}};document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[data-open]');if(a){e.preventDefault();history.replaceState(null,'','#'+a.dataset.open);openPanel(a.dataset.open)}});
var sh=location.hash.slice(1);if(sh&&document.getElementById(sh))setTimeout(function(){document.getElementById(sh).scrollIntoView({block:'start'})},60);return}
var nav=document.createElement('div');nav.className='pills';var secs=Array.prototype.filter.call(f.children,function(el){var off;try{off=localStorage.getItem('hide_'+el.id)}catch(e){}if(off){el.hidden=true;return false}return el.id!=='today'&&el.id!=='news'&&el.querySelector('h2')});
// Everything is on the page. Readers drag to reorder (⠿) and ✕ what they don't want. Order is saved (and follows signed-in members).
var O=Array.isArray(o)?o:[];secs.sort(function(a,b){var x=O.indexOf(a.id),y=O.indexOf(b.id);return (x<0?999:x)-(y<0?999:y)});var tail=document.getElementById('news')||document.getElementById('today');
var anchor=tail.nextSibling;secs.forEach(function(el){el.hidden=false;f.insertBefore(el,anchor)});
var nm=function(el){return el.querySelector('h2').textContent.replace(/^[^A-Za-z0-9]+/,'').replace(/✕|⠿/g,'').trim()};
secs.slice().sort(function(a,b){return nm(a).toLowerCase().localeCompare(nm(b).toLowerCase())}).forEach(function(el){var b=document.createElement('button');b.type='button';b.textContent=nm(el);b.dataset.id=el.id;try{b.style.setProperty('--pc',getComputedStyle(el).getPropertyValue('--acc'))}catch(e){}b.onclick=function(){el.scrollIntoView({behavior:'smooth',block:'start'})};nav.appendChild(b)});
var tip=document.createElement('p');tip.className='mute tailor';tip.innerHTML='✋ <b>Make it yours:</b> drag ⠿ to move things, ✕ to remove them. Saved on this phone'+(/(?:^|; )m2450n=/.test(document.cookie)?' and your account':'')+'.';
tail.parentNode.insertBefore(tip,tail.nextSibling);tail.parentNode.insertBefore(nav,tip.nextSibling);nav.hidden=secs.length<2;
window.openPanel=function(id){var el=document.getElementById(id);if(el){el.hidden=false;el.scrollIntoView({behavior:'smooth',block:'start'})}};
// Drag and drop that works with a finger or a mouse (pointer events): sections by their ⠿ handle, weather tiles by press-and-hold.
function sortable(box,sel,useHandle,key){var drag=null,timer=null;
function items(){return [].filter.call(box.children,function(x){return x.matches(sel)&&!x.hidden})}
function save(){try{localStorage.setItem(key,JSON.stringify(items().map(function(x){return x.id||x.dataset.k})))}catch(e){}if(window.m2up)window.m2up()}
function start(el,e){drag=el;el.classList.add('dragging');document.body.classList.add('nodrag');try{el.setPointerCapture&&el.setPointerCapture(e.pointerId)}catch(_){}}
box.addEventListener('pointerdown',function(e){var el=e.target.closest(sel);if(!el||el.parentNode!==box||e.target.closest('.xoff'))return;
if(useHandle){if(!e.target.closest('.dh'))return;e.preventDefault();start(el,e)}else{timer=setTimeout(function(){start(el,e)},350)}});
box.addEventListener('pointermove',function(e){if(!drag){if(timer&&(Math.abs(e.movementX)+Math.abs(e.movementY))>6){clearTimeout(timer);timer=null}return}e.preventDefault();
var over=document.elementFromPoint(e.clientX,e.clientY),t=over&&over.closest(sel);if(!t||t===drag||t.parentNode!==box)return;var r=t.getBoundingClientRect(),after=useHandle?(e.clientY>r.top+r.height/2):(e.clientX>r.left+r.width/2);box.insertBefore(drag,after?t.nextSibling:t)});
function end(){clearTimeout(timer);timer=null;if(!drag)return;drag.classList.remove('dragging');document.body.classList.remove('nodrag');drag=null;save()}
box.addEventListener('pointerup',end);box.addEventListener('pointercancel',end);box.addEventListener('lostpointercapture',end)}
secs.forEach(function(el){var h=el.querySelector('h2'),d=document.createElement('button');d.type='button';d.className='dh';d.textContent='⠿';d.title='Drag to move';d.setAttribute('aria-label','Move '+nm(el)+' (drag), or use the arrow keys');
d.onkeydown=function(e){var sib=e.key==='ArrowUp'?el.previousElementSibling:e.key==='ArrowDown'?el.nextElementSibling:null;if(!sib||!sib.matches('#flow>section')||sib.id==='today'||sib.id==='news')return;e.preventDefault();f.insertBefore(el,e.key==='ArrowUp'?sib:sib.nextSibling);d.focus();try{localStorage.setItem('order',JSON.stringify(secs.slice().sort(function(a,b){return a.compareDocumentPosition(b)&4?-1:1}).map(function(x){return x.id})))}catch(_){}if(window.m2up)window.m2up()};h.insertBefore(d,h.firstChild)});
sortable(f,'#flow>section:not(#today):not(#news)',true,'order');
var TL=document.querySelector('#today .tiles');if(TL){[].forEach.call(TL.children,function(t,i){var b=t.querySelector('b[id]');t.dataset.k=(b&&b.id)||('n'+i)});var TO=[];try{TO=JSON.parse(localStorage.getItem('tileorder')||'[]')||[]}catch(e){}
if(TO.length)[].slice.call(TL.children).sort(function(a,b){var x=TO.indexOf(a.dataset.k),y=TO.indexOf(b.dataset.k);return (x<0?999:x)-(y<0?999:y)}).forEach(function(t){TL.appendChild(t)});sortable(TL,'.tile',false,'tileorder')}
var hop=function(){var h=decodeURIComponent(location.hash.slice(1)),t=h&&document.getElementById(h),sc=t&&t.closest&&t.closest('#flow>section');if(sc&&sc.hidden){openPanel(sc.id);if(t!==sc)setTimeout(function(){t.scrollIntoView({block:'start'})},50)}};window.addEventListener('hashchange',hop);hop();
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[data-open]');if(a){e.preventDefault();openPanel(a.dataset.open)}})})();
var $=function(i,v){var e=document.getElementById(i);if(e)e.textContent=v};
var W={0:['☀️','Clear'],1:['🌤️','Mostly clear'],2:['⛅','Partly cloudy'],3:['☁️','Cloudy'],45:['🌫️','Fog'],48:['🌫️','Fog'],51:['🌦️','Drizzle'],53:['🌦️','Drizzle'],55:['🌦️','Drizzle'],61:['🌧️','Light rain'],63:['🌧️','Rain'],65:['🌧️','Heavy rain'],80:['🌦️','Showers'],81:['🌧️','Showers'],82:['⛈️','Heavy showers'],95:['⛈️','Storms'],96:['⛈️','Storms'],99:['⛈️','Storms']};
var dirs=['N','NE','E','SE','S','SW','W','NW'],tm=function(s){return new Date(s).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'})};
var age=((Date.now()-Date.UTC(2000,0,6,18,14))/864e5)%29.530588853,mi=Math.round(age/29.53*8)%8;
var MN=[['🌑','New moon'],['🌒','Waxing crescent'],['🌓','First quarter'],['🌔','Waxing gibbous'],['🌕','Full moon'],['🌖','Waning gibbous'],['🌗','Last quarter'],['🌘','Waning crescent']];
$('i-moon',MN[mi][0]);$('t-moon',MN[mi][1]);var tf=(14.765-age+29.530588853)%29.530588853,fd=Math.round(tf);$('t-moon2',(age>14&&age<15.5)?'Full moon tonight':fd<=1?'Full moon tomorrow':'Full moon in '+fd+' days');
var TIPS={},ORD=['storm','rain','hot','cold','uv','wind','nice','surf','fish'];function tip(k,h){var el=document.getElementById('wxtips');if(!el)return;TIPS[k]=h;el.innerHTML=ORD.filter(function(x){return TIPS[x]}).map(function(x){return '<li>'+TIPS[x]+'</li>'}).join('')}
var LOC=null;try{LOC=JSON.parse(localStorage.getItem('loc'))}catch(e){};
(function(){var TN=${JSON.stringify(t.name)},TT=${JSON.stringify(Object.values(TOWNS).filter(x => x.lat).map(x => [x.name, x.lat, x.lon]))},TA=${t.lat},TO=${t.lon},el=document.querySelector('.tloc'),km=0,h='';if(LOC){var r=Math.PI/180,a=Math.sin((LOC[0]-TA)*r/2),b=Math.sin((LOC[1]-TO)*r/2);km=Math.round(12742*Math.asin(Math.sqrt(a*a+Math.cos(TA*r)*Math.cos(LOC[0]*r)*b*b)))}
if(LOC&&km>30){LOC=null;h='Your saved spot is '+km+' km from '+TN+'. '}else if(LOC){var nt=null,nd=1e9;TT.forEach(function(x){var d=Math.pow(x[1]-LOC[0],2)+Math.pow((x[2]-LOC[1])*Math.cos(LOC[0]*Math.PI/180),2);if(d<nd){nd=d;nt=x}});h='Tuned to your area: near <b>'+(nt?nt[0]:TN)+'</b><span id="nbch"></span>. ';
fetch('/api/open?c=beach').then(function(r){return r.json()}).then(function(j){var b=null,bd=1e9;(j.items||[]).forEach(function(x){if(x.lat==null)return;var r2=Math.PI/180,p=Math.sin((x.lat-LOC[0])*r2/2),q=Math.sin((x.lon-LOC[1])*r2/2),d=12742*Math.asin(Math.sqrt(p*p+Math.cos(LOC[0]*r2)*Math.cos(x.lat*r2)*q*q));if(d<bd){bd=d;b=x}});var n=document.getElementById('nbch');if(b&&n&&bd<40)n.textContent=', and your nearest beach is '+b.name+' ('+(bd<1?'under 1':Math.round(bd))+' km)'}).catch(function(){})}
if(el){var s=document.createElement('span');s.innerHTML=h;el.insertBefore(s,el.firstChild);var u=el.querySelector('.useloc');if(u&&h.indexOf(' km from ')>-1){u.textContent='Clear';u.dataset.on='Clear'}}})();
var LAT=LOC?LOC[0]:${t.lat},LON=LOC?LOC[1]:${t.lon};
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
</script>`, esc), pc, SH ? SH.opts : {});
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
<h3 class="rallyh">Help a brother out</h3>
<p><b>${R.code} is free for everyone, forever.</b> We're aiming for ${goal} locals, ${R.goalText}. At that point a few clearly labelled local ads cover the costs. Nobody ever pays to be listed.</p>
<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${LOCALS_GOAL}" aria-valuenow="${n}" aria-label="Locals signed up"><span style="width:${Math.max(pct, 1).toFixed(1)}%"></span></div>
<p class="barlab">${n.toLocaleString("en-AU")} of ${goal} locals</p>
<p>Sign up for one short email a week with what's on, plus a free Maverick Digital guide to using AI in everyday life.</p>${signup(pc)}
<p class="rallyl"><a href="#" onclick="event.preventDefault();var u=location.origin+'/${esc(pc)}';if(navigator.share)navigator.share({title:'${R.brand}',text:'Everything on in ${R.short}, in one place. Free.',url:u});else{navigator.clipboard&&navigator.clipboard.writeText(u);this.textContent='Link copied'}">Share ${R.code}</a> · <a href="/about">How ${R.code} stays free</a></p></section>
<section id="founding" class="spot"><p class="spotk">Founding Members</p><h3>$49 a year, for life</h3><p>The first ${goal} locals to sign in free lock in $49 a year, for life, if they ever choose Every Cool Thing. No obligation, ever.</p><p><a href="/membership"><b>How it works →</b></a></p></section>`; };
const rallyStrip = (n) => `<a class="rallystrip mute" href="#join">Target: ${LOCALS_GOAL.toLocaleString("en-AU")} locals · ${n.toLocaleString("en-AU")} so far</a>`;
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

// Sign-up context for ActiveCampaign: the sub-region postcode the reader chose (falls back to the page's postcode, then the town)
// and the page they signed up from (last page they were reading, else the referring page).
function joinCtx(req, pc) {
  const chosen = cookie(req, "mpc"), okPc = x => /^\d{4}$/.test(String(x || "")) ? String(x) : "";
  let page = ""; try { page = decodeURIComponent(cookie(req, "mpg") || ""); } catch {}
  if (!/^\/[\w\-\/.%]{0,200}$/.test(page)) { try { page = new URL(req.headers.get("referer") || "").pathname; } catch { page = ""; } }
  if (/^\/(signin|welcome|unlock|optin|auth|subscribe)/.test(page)) page = "";
  let u = {}; try { u = JSON.parse(decodeURIComponent(cookie(req, "mutm") || "{}")) || {}; } catch {}
  const t = k => String(u[k] || "").replace(/[^\w\-.~ %+@:/]/g, "").slice(0, 100);
  const utm = { source: t("source") || t("ref") || "direct", medium: t("medium") || (t("ref") ? "referral" : "none"), campaign: t("campaign") || "(none)", content: t("content") || "(none)", term: t("term") || "(none)", ref: t("ref") || "(none)", land: t("land") || "/" };
  return { pc: okPc(chosen) || okPc(pc) || R.code, page: (page || "/").slice(0, 200), utm };
}

async function handleSubscribe(req, env) {
  const f = await req.formData();
  const pc = String(f.get("pc") || R.code).slice(0, 4), email = String(f.get("email") || "").trim().toLowerCase();
  if (!f.get("website") && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    { const cx = joinCtx(req, pc); await env.DATA.put(`sub:${email}`, JSON.stringify({ email, pc: cx.pc, page: cx.page, utm: cx.utm, consent: true, source: "email", at: new Date().toISOString() })); await acQueue(env, email); }
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
  if (act === "stats") {
    const rows = (await Promise.all((await listAll(env, "stats:")).map(k => env.DATA.get(k.name, "json")))).filter(Boolean).sort((a, b) => a.date.localeCompare(b.date));
    const cols = statCols(), csv = [cols.join(","), ...rows.map(r => cols.map(c => r[c] ?? "").join(","))].join("\n");
    return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${R.code}-daily-stats-${todayISO()}.csv"` } });
  }
  if (act === "export") {
    const rows = new Map();
    for (const { name } of await listAll(env, "user:")) { const u = await env.DATA.get(name, "json"); if (u) rows.set(u.email, { ...u, weekly: "no" }); }
    for (const { name } of await listAll(env, "sub:")) { const v = await env.DATA.get(name, "json"); if (v) rows.set(v.email, { ...(rows.get(v.email) || { email: v.email, name: v.name || "", via: v.source || "email", first: v.at }), weekly: "yes", pc: v.pc, tips: v.tips || "" }); }
    const q = x => `"${String(x ?? "").replace(/"/g, '""')}"`;
    const csv = ["email,name,signed_in_with,postcode,weekly_email,tips_from,first_seen,last_seen,visits", ...[...rows.values()].map(r => [r.email, r.name, r.via, r.pc || R.code, r.weekly, r.tips ? "tips-" + r.tips : "", r.first, r.last, r.visits].map(q).join(","))].join("\n");
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
  const clicks = {}; for (const { name } of await listAll(env, "click:")) { const [, slug] = name.split(":"); clicks[slug] = (clicks[slug] || 0) + (+(await env.DATA.get(name)) || 0); }
const picks = {}; for (const { name } of await listAll(env, "sub:")) { const v = await env.DATA.get(name, "json"); if (v?.tips) picks[v.tips] = (picks[v.tips] || 0) + 1; }
  return page("Admin", `<h1>Admin</h1><p>${subs} email subscribers.</p><p>AI tips from: ${TIPPERS.map(([k, n]) => `${n} <b>${picks[k] || 0}</b>`).join(" · ")}</p><p>Clicks to Maverick Digital: ${Object.entries(clicks).map(([k, v]) => `${esc(k)} <b>${v}</b>`).join(" · ") || "none yet"}.</p>
<h2>👍 Was this useful?</h2><ul>${(await Promise.all((await listAll(env, "rate:")).map(async k => [k.name.slice(5), await env.DATA.get(k.name, "json")]))).filter(x => x[1]).sort((a, b) => (b[1].up + b[1].down) - (a[1].up + a[1].down)).map(([pg, c]) => `<li>${esc(pg)}: 👍 ${c.up} · 👎 ${c.down}</li>`).join("") || "<li class=mute>No votes yet.</li>"}</ul>
<h2>🩺 Source health</h2><ul>${(await health(env)).map(x => `<li>${x.ok ? "🟢" : "🔴"} ${esc(x.name)} · ${x.last ? `worked ${x.hours < 1 ? "under an hour" : x.hours + " hours"} ago` : "not working yet"}${x.note ? ` · ${esc(x.note)}` : ""}</li>`).join("")}</ul>
<h2>📅 Venue pages we read</h2><p class="mute">Add a pub, club or market's own "what's on" or "specials" page. We read it twice a day.</p><ul>${(await Promise.all((await venueSources(env)).map(async v => { const d = await env.DATA.get(vkey(v.url), "json"); return `<li>${esc(v.name)} · ${d ? `${d.items.length} items${d.asof ? ", updated " + esc(asOf(d.asof)) : ""}` : "not read yet"} <a href="${esc(v.url)}" rel="noopener">page</a>${(R.venues || []).some(x => x.url === v.url) ? "" : ` <form method="post" style="display:inline"><input type="hidden" name="key" value="${key}"><input type="hidden" name="act" value="vdel"><input type="hidden" name="vurl" value="${esc(v.url)}"><button>Remove</button></form>`}</li>`; }))).join("")}</ul>
<form method="post"><input type="hidden" name="key" value="${key}"><input type="hidden" name="act" value="vadd"><input name="vname" placeholder="Venue name" maxlength="60"> <input name="vurl" type="url" placeholder="https://… their what's on page" required style="width:100%"> <button>Add venue page</button></form>
<h2>📮 Postcode requests</h2><ul>${(await Promise.all((await listAll(env, "pcsug:")).map(k => env.DATA.get(k.name, "json")))).filter(Boolean).sort((a, b) => b.count - a.count).map(x => `<li><b>${esc(x.pc)}</b> ${esc(x.towns.join(", "))} · asked ${x.count}× · ${x.emails.length} emails${x.notes.length ? `<br><span class="mute">${esc(x.notes.join(" | "))}</span>` : ""}</li>`).join("") || "<li class=mute>None yet.</li>"}</ul>
<h2>👥 People</h2><p>${(await listAll(env, "user:")).length} signed in · ${(await listAll(env, "sub:")).length} on the weekly email · ${await localsCount(env)} locals in total.</p><form method="post"><input type="hidden" name="key" value="${esc(String(f.get("key")))}"><input type="hidden" name="act" value="export"><button>Download people (CSV)</button></form><form method="post"><input type="hidden" name="key" value="${esc(String(f.get("key")))}"><input type="hidden" name="act" value="stats"><button>Download daily stats (CSV)</button></form>
<h2>🔔 Send a phone alert</h2><p class="mute">Goes to everyone who turned on alerts. ${(await env.DATA.list({ prefix: "psub:" })).keys.length} phones signed up.</p>
<form method="post"><input type="hidden" name="key" value="${key}"><input type="hidden" name="act" value="alert"><input name="text" maxlength="160" placeholder="e.g. All fields closed tonight due to rain" style="width:100%" required>
<div class="row"><select name="topic"><option value="fields">Field closures</option><option value="alerts">General alert</option></select><button>Send alert</button></div></form>
<h2>📣 Announce a new feature</h2><p class="mute">Marking a voted idea Done announces it automatically. Use this for anything else.</p>
<form method="post"><input type="hidden" name="key" value="${key}"><input type="hidden" name="act" value="announce"><input name="text" maxlength="200" placeholder="e.g. Fuel prices are live!" style="width:100%" required><div class="row"><input name="link" placeholder="Link, e.g. /${R.code} (optional)"><button>Announce</button></div></form>
<ul>${(await announcements(env)).slice(0, 5).map(a => `<li>${esc(a.text)} <span class="mute">${esc(a.at.slice(0, 10))}</span> ${btnB("remove", "Remove", a.id)}</li>`).join("")}</ul><h2>Ideas waiting</h2><ul>${il || "<li>None</li>"}</ul><h2>Idea board (most votes first)</h2><ul>${board || "<li>None</li>"}</ul><h2>Community notices waiting</h2><ul>${await (async () => { let h = ""; for (const { name } of (await env.DATA.list({ prefix: "npending:" })).keys) { const n = await env.DATA.get(name, "json"); if (n) h += `${noticeItem(n).replace("</li>", "")}<span class="mute">from ${esc(n.contact)}</span><br>${btnB("approve", "Approve and alert", name)} ${btnB("delete", "Delete", name)}</li>`; } return h || "<li>None</li>"; })()}</ul><h2>In memory notices waiting</h2><ul>${rl || "<li>None</li>"}</ul><h2>Births &amp; marriages waiting</h2><ul>${jl || "<li>None</li>"}</ul><h2>Birthday offers waiting</h2><ul>${bl || "<li>None</li>"}</ul><h2>Latest feedback</h2><ul>${fbl || "<li>None</li>"}</ul><h2>Events waiting (${keys.length})</h2><ul>${rows || "<li>None</li>"}</ul>`);
}

const about = async env => { const n = await localsCount(env), locals = n >= 10 ? `We're at <b>${n.toLocaleString("en-AU")}</b> so far. Every share helps.` : "We're just getting started, so every share helps."; return page("Nobody pays to be here", `<p class="mute"><a href="/">‹ ${R.code}</a></p><h1>Nobody pays to be here.</h1>
<p>Every event, business and listing on this site is here because it's happening in your community, not because anyone paid for it.</p>
<h2>We gather, we don't report</h2><p>${R.code} Maverick is an aggregator. We don't write news stories or create the information you see here. We gather it from local news outlets, councils, government services, venues, funeral directors and local families, and every item names its source and links back to it. The information belongs to them. If you're a source and want something changed or removed, <a href="/feedback">tell us</a> and we'll fix it straight away.</p>
<p><b>The local information here will always be free.</b> No paywall on it, ever, and no fees to list your event, club or notice. Optional paid extras (personal tools) are there for those who want them, and help keep it running. That's the deal, and it's written into <a href="/charter">our charter</a>.</p>
<h2>How we'll keep the lights on</h2><p>Our goal is to reach as many locals as a local weekly paper: about <b>15,000 people</b>. ${locals}</p>
<p>When we get there, local businesses will be able to reach that audience through a few ads in our <b>email</b>, and only there. <b>This site stays ad-free.</b> The ads will be <b>selective</b> (local and relevant to you), <b>fairly priced</b> and <b>clearly labelled</b>. Advertisers never get your name or email address, and we never sell your details.</p>
<p>We're not here to build an empire off our community. Just to make a fair living doing something genuinely useful for it.</p>
<p><i>Global vision, local thinking.</i> ${R.code} Maverick is <a href="https://maverickdigital.com.ai">Maverick Digital</a>'s motto in action.</p>
<p>Your local information, all in one place, bringing regional communities together.</p><p>A free gift to the community from <a href="https://maverickdigital.com.ai">Maverick Digital</a>.<br><i>${R.sign}</i></p>
<h2>Your privacy</h2><p>Most of your settings live on your own phone, not with us. Read the <a href="/privacy">privacy policy</a>, in plain English.</p>`); };

const ICON = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#0B1526"/><text x="256" y="300" font-family="Arial,sans-serif" font-size="150" font-weight="bold" fill="#fff" text-anchor="middle">${R.code}</text></svg>`;
const MANIFEST = (first = "") => JSON.stringify({ id: "/", name: first ? `${first}'s Daily Maverick` : `${R.brand} ${R.short}`, short_name: first && first.length <= 7 ? `${first}'s Mav` : first ? "My Maverick" : R.code, description: `Your personalised local daily news for ${R.place}. Free.`, lang: "en-AU",
  start_url: "/?src=app", scope: "/", display: "standalone", background_color: "#0B1526", theme_color: "#0B1526", categories: ["news", "lifestyle"],
  icons: [...(ICONS[R.code] ? [{ src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }] : []),
    { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }] });
const AREA = () => areaPages({ esc, page, wip, R, TOWNS, SCHOOL_HOLS, todayISO });
const nameOf = async (env, em) => { const u = await env.DATA.get(`user:${em}`, "json"); return String(u?.name || em.split("@")[0]).split(/\s+/)[0].slice(0, 30); };
const PHOTOS = () => photosApi({ esc, page, member, cleanText, todayISO, TOWNS, R,
  nameOf });
// Home-screen PNG icons (baked in by tools/build-icons.py). Falls back to the SVG for a brand-new town until the script is re-run.
function iconPng(size) { const b = ICONS[R.code]?.[size]; if (!b) return Response.redirect("/icon.svg", 302);
  return new Response(Uint8Array.from(atob(b), c => c.charCodeAt(0)), { headers: { "content-type": "image/png", "cache-control": "public, max-age=604800" } }); }
// ---- The installed app always shows the latest version: when you come back to it (or every 10 minutes while it's open),
// it checks whether the site has been updated and reloads if so. Plus pull down to refresh, like any app.
const APP_JS = String.raw`(function(){var V=(document.querySelector('meta[name=m2v]')||{}).content,away=0,app=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
function check(){fetch('/api/v',{cache:'no-store'}).then(function(r){return r.json()}).then(function(j){if(j.v&&V&&j.v!==V&&j.v!=='dev')location.reload()}).catch(function(){})}
document.addEventListener('visibilitychange',function(){if(document.hidden)away=Date.now();else if(away&&Date.now()-away>20000)check()});
addEventListener('pageshow',function(e){if(e.persisted)check()});setInterval(function(){if(!document.hidden)check()},6e5);
if(!app)return;var y0=null,d=0,ind=document.createElement('div');ind.className='ptr';ind.setAttribute('aria-hidden','true');document.body.appendChild(ind);
addEventListener('touchstart',function(e){if(scrollY<=0&&!e.target.closest('dialog,#mavp,.tiles,input,textarea,select'))y0=e.touches[0].clientY;else y0=null},{passive:true});
addEventListener('touchmove',function(e){if(y0==null)return;d=Math.max(0,e.touches[0].clientY-y0);if(d>10){ind.style.transform='translate(-50%,'+Math.min(d,120)*0.6+'px)';ind.style.opacity=Math.min(1,d/80);ind.textContent=d>80?'↻ Let go to refresh':'↓ Pull to refresh'}},{passive:true});
addEventListener('touchend',function(){if(y0==null)return;if(d>80){ind.textContent='↻ Refreshing…';location.reload()}else{ind.style.opacity=0;ind.style.transform='translate(-50%,0)'}y0=null;d=0})})();`;
const SW = () => `self.addEventListener('push',e=>{e.waitUntil(self.registration.pushManager.getSubscription().then(s=>fetch('/api/alert',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({e:s&&s.endpoint})})).then(r=>r.json()).then(a=>self.registration.showNotification(a.title,{body:a.body,icon:'/icon.svg',data:a.url||'/${R.code}'})))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.openWindow(e.notification.data||'/${R.code}'))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open('v1').then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)))})`;


// ---- What's in your fridge? (members only: unlock with email) ----
// The reader's own postcode (their chosen part of the shire), only if it's one of this paper's live postcodes.
const okTown = x => { x = String(x || "").replace(/\D/g, ""); return x && TOWNS[x] && TOWNS[x].live ? x : ""; };
const cookie = (req, k) => (req.headers.get("cookie") || "").split(/;\s*/).map(c => c.split("=")).find(([n]) => n === k)?.[1];
async function member(req, env) { const t = cookie(req, "m2450"); return t ? await env.DATA.get(`sess:${t}`) : null; }

// ---- Fresh every day: anything that isn't brand new gets a new order each day (same all day, new tomorrow).
// Dates stay on every item, so it's honest: we only move things around, we never change them.
const daySeed = salt => { let h = 2166136261; for (const c of todayISO() + salt) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
function dayMix(arr, salt = "") {
  const a = [...arr]; let x = daySeed(salt) || 1;
  for (let i = a.length - 1; i > 0; i--) { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; const j = (x >>> 0) % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const freshFirst = (items, salt, hrs = 24) => { const cut = Date.now() - hrs * 36e5, isNew = i => new Date(i.date || 0) >= cut;
  return [...items.filter(isNew), ...dayMix(items.filter(i => !isNew(i)), salt)]; };

// ---- Who people want their everyday-AI tips from (Team Smarketing). Tags them for ActiveCampaign.
const TIPPERS = [["anne", `<img class="tav" src="/team/anne-audit.svg" alt="" width="24" height="24">Anne Audit`, "checking AI is right"], ["johal", `<img class="tav" src="/team/jargon-johal.svg" alt="" width="24" height="24">Jargon Johal`, "the AI words explained"], ["leaf", `<img class="tav" src="/team/leaf.svg" alt="" width="24" height="24">Leaf`, "doing the right thing"],
  ["mav", `<span class="mavav" aria-hidden="true"></span>Mav`, "everyday life"], ["sam", `<img class="tav" src="/team/strategi-sam.svg" alt="" width="24" height="24">Strategi Sam`, "saving time"], ["tezza", `<img class="tav" src="/team/terry-techy.svg" alt="" width="24" height="24">Tezza the Techie`, "apps and phone tricks"]];
// Everyone gets tips from every member of the team (no picking since 2026-10-18).
const tipPick = () => "all";
const TIPS_PICK = `<p class="tipsall">🧑‍🏫 Your free AI tips come from the whole of Team Smarketing: ${TIPPERS.map(([, n]) => `<b>${n}</b>`).join(", ")}.</p>`;

// ---- Daily stats snapshot, kept forever, for the one-year "what we built" press release.
// Once a day (first cron after midnight Sydney): people, list size, how they joined, tips picks, clicks to Maverick Digital.
const statCols = () => ["date", "locals", "signed_in", "weekly_email", "app_installs", "via_google", "via_email", "tips_all", ...TIPPERS.map(t => "tips_" + t[0]), ...Object.keys(GO).map(k => "clicks_" + k)];
async function dailyStats(env) {
  const day = todayISO(); if (await env.DATA.get(`stats:${day}`)) return;
  const users = await listAll(env, "user:"), subs = await listAll(env, "sub:"), row = { date: day, locals: await localsCount(env), signed_in: users.length, weekly_email: subs.length, via_google: 0, via_email: 0 };
  for (const { name } of users) { const u = await env.DATA.get(name, "json"); if (u) row[u.via === "google" ? "via_google" : "via_email"]++; }
  row.app_installs = 0; for (const { name } of await listAll(env, "install:")) row.app_installs += +(await env.DATA.get(name)) || 0;
  row.tips_all = 0; for (const t of TIPPERS) row["tips_" + t[0]] = 0;
  for (const { name } of subs) { const v = await env.DATA.get(name, "json"); if (v?.tips) row["tips_" + v.tips]++; }
  for (const k of Object.keys(GO)) { let n = 0; for (const { name } of await listAll(env, `click:${k}:`)) n += +(await env.DATA.get(name)) || 0; row["clicks_" + k] = n; }
  await env.DATA.put(`stats:${day}`, JSON.stringify(row));
}

// ---- Kid Zone secret word. A grown-up sets it on their account; kids type it to get in on that account.
// Stored only as a salted hash. Wrong guesses are counted and shown to the grown-up. 5 wrong in a row = 15 min pause.
const kzHash = async (salt, word) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + ":" + String(word).trim().toLowerCase())))].map(b => b.toString(16).padStart(2, "0")).join("");
// Daily time limit: 20 minutes unless the grown-up sets another on /kids/parent. Time used is counted on the account
// (every device) when signed in, and on the device otherwise. When it runs out, Kid Zone locks until tomorrow.
const KZ_MINS = 20;
async function kzApi(req, env) {
  const em = await member(req, env), rec = em ? await env.DATA.get(`kzw:${em}`, "json") : null, day = todayISO();
  const mins = em ? ((await env.DATA.get(`kzt:${em}`, "json"))?.mins ?? KZ_MINS) : KZ_MINS, uk = em ? `kzu:${em}:${day}` : "";
  const used = em ? +(await env.DATA.get(uk)) || 0 : 0;
  if (req.method !== "POST") return Response.json({ word: !!rec, ok: !rec || cookie(req, "kzok") === "1", mins, used, day });
  const body = await req.json().catch(() => ({}));
  if (body.tick) { const add = Math.max(0, Math.min(60, +body.tick || 0)); if (em) await env.DATA.put(uk, String(used + add), { expirationTtl: 2 * 86400 }); return Response.json({ mins, used: used + add }); }
  if (!rec) return Response.json({ ok: true });
  if (rec.pause && Date.now() < rec.pause) return Response.json({ ok: false, msg: "Too many tries. Ask your grown-up, then try again in a little while." });
  const { word } = body;
  if (word && (await kzHash(rec.salt, word)) === rec.hash) {
    rec.row = 0; delete rec.pause; await env.DATA.put(`kzw:${em}`, JSON.stringify(rec));
    return Response.json({ ok: true }, { headers: { "set-cookie": "kzok=1; Path=/; Max-Age=14400; HttpOnly; Secure; SameSite=Lax" } });
  }
  rec.wrong = (rec.wrong || 0) + 1; rec.row = (rec.row || 0) + 1; rec.lastWrong = new Date().toISOString();
  if (rec.row >= 5) { rec.pause = Date.now() + 15 * 6e4; rec.row = 0; }
  await env.DATA.put(`kzw:${em}`, JSON.stringify(rec));
  return Response.json({ ok: false, msg: "That's not the secret word. Ask your grown-up." });
}
async function kzParent(req, env) {
  const em = await member(req, env);
  if (!em) return new Response(null, { status: 303, headers: { location: "/signin?next=/kids/parent" } });
  let rec = await env.DATA.get(`kzw:${em}`, "json"), note = "";
  if (req.method === "POST") {
    const f = await req.formData(), w = String(f.get("word") || "").trim();
    if (f.get("act") === "mins") { const m = Math.max(5, Math.min(120, Math.round(+f.get("mins") || KZ_MINS))); await env.DATA.put(`kzt:${em}`, JSON.stringify({ mins: m })); note = `Saved. Kid Zone now stops after ${m} minutes a day on your account, on every device.`; }
    else if (f.get("act") === "off") { await env.DATA.delete(`kzw:${em}`); rec = null; note = "Secret word removed. Kid Zone opens with the usual grown-up check."; }
    else if (w.length < 3 || w.length > 40) note = "Pick a word between 3 and 40 letters.";
    else { const salt = crypto.randomUUID(); rec = { salt, hash: await kzHash(salt, w), set: new Date().toISOString(), wrong: 0 }; await env.DATA.put(`kzw:${em}`, JSON.stringify(rec)); note = "Saved. Kids now need this word to open Kid Zone on your account. Change it as often as you like."; }
  }
  const when = d => esc(new Date(d).toLocaleString("en-AU", { timeZone: "Australia/Sydney", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }));
  return page("Kid Zone secret word", `<h1>🔐 Kid Zone secret word</h1>
<p>Kid Zone is safe: no chat, no ads, nothing collected. But if you're not cool with it, neither are we. Set a secret word and your kids will need it to open Kid Zone when they're on your account.</p>
${note ? `<p class="note">${note}</p>` : ""}
${rec ? `<p><b>Secret word is on</b> (set ${when(rec.set)}).<br>${rec.wrong ? `⚠️ <b>${rec.wrong} wrong ${rec.wrong === 1 ? "guess" : "guesses"}</b> since you set it, the last on ${when(rec.lastWrong)}.` : "✅ No wrong guesses since you set it."}</p>` : `<p><b>No secret word yet.</b></p>`}
<form method="post"><label>${rec ? "Change it to" : "Your secret word"}</label><div class="row"><input name="word" type="password" minlength="3" maxlength="40" required autocomplete="off" placeholder="Something the kids won't guess"><button>${rec ? "Change word" : "Turn it on"}</button></div></form>
${rec ? `<form method="post"><input type="hidden" name="act" value="off"><button class="ghost">Turn the secret word off</button></form>` : ""}
<h2>⏱️ Daily time limit</h2><p>Kid Zone stops after <b>${(await env.DATA.get(`kzt:${em}`, "json"))?.mins ?? KZ_MINS} minutes a day</b>, with a countdown so kids know how long is left. Then it's locked until tomorrow, on every device signed in to your account.</p>
<form method="post"><input type="hidden" name="act" value="mins"><div class="row"><input name="mins" type="number" min="5" max="120" step="5" value="${(await env.DATA.get(`kzt:${em}`, "json"))?.mins ?? KZ_MINS}" aria-label="Minutes a day"><button>Save minutes a day</button></div></form>
<h2>👀 What the kids did</h2><p>Every visit, answer, score and minute in Kid Zone is kept on the device they played on. <a href="/kids/log">See it here</a> (open it on the kids&rsquo; device). <button type="button" class="ghost" onclick="if(confirm('Clear the Kid Zone activity on this device?')){try{localStorage.removeItem('kz_log')}catch(e){}alert('Cleared on this device.')}">Clear it on this device</button></p>
<h2>🕵️ How kids get around controls (ours included)</h2>
<p>Kids are often a step ahead with tech. Here's how they commonly get around controls, so you know what to look for. We'd rather you hear it from us.</p>
<ul class="rules">
<li><b>A private or incognito window, another browser, or clearing the history.</b> On a device that isn't signed in, this resets our time count and wipes the activity log. Sign in to your account on their device: then the time limit counts across every device and can't be reset. <i>Sign to look for: an empty activity log when you know they played.</i></li>
<li><b>Another device.</b> A tablet, a sibling's phone or a friend's device. Our limit follows your account, not a device that isn't signed in.</li>
<li><b>Watching you type the secret word</b>, or guessing it. Wrong guesses are counted above, so you'll see if someone's been trying. Change the word now and then.</li>
<li><b>Changing the date or time on the device</b> to beat screen-time limits. Our signed-in limit uses our clock, not theirs, but some device limits can be fooled this way.</li>
<li><b>A fake birthday</b> to get past age checks on apps and games, and <b>second accounts</b> parents don't know about.</li>
<li><b>A VPN or proxy app</b> to get around home or school filters, and <b>hidden apps</b> tucked in folders or disguised as a calculator.</li>
</ul>
<p><b>What helps most:</b> use the controls built into the device as well as ours (Apple Screen Time, Google Family Link, or your internet router's settings), keep devices in shared spaces, and talk about it: kids who know why the rules exist are less likely to dodge them.</p>
<p><a href="https://www.esafety.gov.au/parents" rel="noopener"><b>eSafety Commissioner: advice for parents and carers →</b></a> · <a href="https://www.apple.com/au/families/" rel="noopener">Apple: Screen Time and Family Sharing</a> · <a href="https://families.google/familylink/" rel="noopener">Google Family Link</a></p>
<p class="mute">We only keep a scrambled version of the word, never the word itself, so even we can't read it. Forgot it? Just set a new one here. <a href="/kids">Back to Kid Zone</a></p>`);
}

// ---- Mav asks once a week: "Is your Daily Maverick saving you time?" Thumbs up or down, then a quick "why?".
// First asked on a reader's second day back, or after a few pages on day one; then at most once every 7 days.
// Mav smiles at a thumbs up and facepalms at a thumbs down. Results (and the reasons, counted) show on /results.
const MAV_ASK_JS = String.raw`(function(){function g(k){try{return localStorage.getItem(k)}catch(e){return null}}function s(k,v){try{localStorage.setItem(k,v)}catch(e){}}
var now=Date.now(),last=+g('mav_tsq')||0;if(last&&now-last<7*864e5)return;var day=new Date().toDateString(),fs=+g('mav_fs')||0;if(!fs){fs=now;s('mav_fs',String(fs))}
var days=[];try{days=JSON.parse(g('mav_days')||'[]')}catch(e){}if(days.indexOf(day)<0){days.push(day);s('mav_days',JSON.stringify(days.slice(-5)))}
var pv=(+g('mav_pv')||0)+1;s('mav_pv',String(pv));var age=(now-fs)/864e5;
if(!(days.length>=2||pv>=6||age>=3))return;if(/^\/(signin|welcome|unlock|optin|kids)/.test(location.pathname))return;
function post(o){o.q='saving-time';return fetch('/api/poll',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(o)}).catch(function(){})}
setTimeout(function(){var b=document.createElement('div');b.className='mavask';b.setAttribute('role','dialog');b.setAttribute('aria-label','Quick question from Mav');
b.innerHTML='<img class="mavface" src="/mav.svg" alt="" width="44" height="44"><div class="mavq"><b>Mav here. Quick one:</b><br>Is your Daily Maverick saving you time?<div class="mavbtns"><button type="button" data-v="up" aria-label="Yes">👍</button><button type="button" data-v="down" aria-label="No">👎</button></div></div><button type="button" class="xoff" aria-label="Close">✕</button>';
document.body.appendChild(b);var q=b.querySelector('.mavq'),f=b.querySelector('.mavface'),mood='';
b.addEventListener('click',function(e){var t=e.target.closest('button');if(!t)return;s('mav_tsq',String(Date.now()));
if(t.classList.contains('xoff')){b.remove();return}
if(t.dataset.v){mood=t.dataset.v;post({v:mood});f.src='/mav.svg?m='+(mood==='up'?'happy':'facepalm');
q.innerHTML='<b>'+(mood==='up'?'Love that!':'Ah, facepalm.')+'</b> '+(mood==='up'?'What&rsquo;s saving you the most time?':'What would save you more time?')+'<form class="mavwhy"><input maxlength="200" placeholder="'+(mood==='up'?'e.g. fuel prices, bin night':'e.g. too much to scroll')+'" aria-label="Why?"><button>Send</button></form><a href="#" class="mavskip mute">Skip</a>';
var fm=q.querySelector('form');setTimeout(function(){fm.querySelector('input').focus()},50);
fm.onsubmit=function(ev){ev.preventDefault();var w=fm.querySelector('input').value.trim();if(w)post({v:mood,why:w});done(w)};q.querySelector('.mavskip').onclick=function(ev){ev.preventDefault();done('')};return}});
function done(w){q.innerHTML='<b>Thanks!</b> '+(w?'I&rsquo;ll pass that on to Team Smarketing. ':'')+'<a href="/results#poll-saving-time">See what locals said</a>';setTimeout(function(){b.remove()},6000)}},2500)})();`;

// ---- Turn off anything on the home page: every section and tile gets a clear ✕. Hidden items can be brought back in one tap.
const HIDE_JS = String.raw`(function(){var f=document.getElementById('flow');if(!f)return;function g(k){try{return localStorage.getItem(k)}catch(e){return null}}function s(k,v){try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}}
var items=[];[].forEach.call(f.children,function(el){var h=el.querySelector&&el.querySelector('h2');if(el.tagName==='SECTION'&&el.id&&h&&el.id!=='today')items.push([el,el.id,h.textContent.trim(),h])});
[].forEach.call(document.querySelectorAll('#today .tile'),function(t,i){var b=t.querySelector('b[id]'),k='tile'+((b&&b.id)||('n'+i)).replace(/[^a-z]/gi,'').toLowerCase(),nm=(t.querySelector('small')||{}).textContent||'this';items.push([t,k,nm.trim(),null])});
var fr=document.getElementById('frs');if(fr)items.push([fr,'frs',"Friends' clocks",null]);
function count(){return items.filter(function(x){return g('hide_'+x[1])}).length}
var bar=document.createElement('p');bar.className='hidbar mute';var td=document.getElementById('today');if(td)td.appendChild(bar);
function drawBar(){var n=count();bar.hidden=!n;bar.innerHTML=n?n+' thing'+(n>1?'s':'')+' hidden · <a href="#" id="unhide">Show '+(n>1?'them':'it')+' again</a>':''}
function toast(nm,k){var t=document.getElementById('hidtoast');if(t)t.remove();t=document.createElement('div');t.id='hidtoast';t.className='hidtoast';t.setAttribute('role','status');
t.innerHTML='Hidden '+nm.replace(/</g,'')+'. <a href="#">Undo</a>';t.querySelector('a').onclick=function(e){e.preventDefault();s('hide_'+k,null);location.reload()};document.body.appendChild(t);setTimeout(function(){t.remove()},6000)}
items.forEach(function(x){var el=x[0],k=x[1],nm=x[2];if(g('hide_'+k)){el.hidden=true;el.classList.add('xhid')}
var b=document.createElement('button');b.type='button';b.className='xoff';b.textContent='✕';b.title='Hide this';b.setAttribute('aria-label','Hide '+nm);
b.onclick=function(e){e.preventDefault();e.stopPropagation();s('hide_'+k,'1');el.hidden=true;el.classList.add('xhid');var pb=document.querySelector('.pills button[data-id="'+k+'"]');if(pb)pb.hidden=true;drawBar();toast(nm,k);if(window.m2up)window.m2up()};
if(x[3]){x[3].classList.add('xh');x[3].appendChild(b)}else{el.classList.add('xw');el.appendChild(b)}});
document.addEventListener('click',function(e){if(e.target.id!=='unhide')return;e.preventDefault();items.forEach(function(x){s('hide_'+x[1],null)});location.reload()});drawBar()})();`;

// ---- Inner pages stay tidy: every section is folded to its heading unless the reader opens it (remembered), it's linked to,
// or it's the page's first section. Home keeps its own layout. Sections with maps or live widgets stay open.
// Less scrolling: every section folds to its heading, so readers only open what they're interested in.
// The daily paper keeps "At a glance" and the news open; everything else starts as a heading you tap. Each reader's
// opened sections are remembered on their phone. Pills, links to #section and Mav's "open" all open the section first.
const FOLD_JS = String.raw`(function(){var m=document.getElementById('main');if(!m)return;var f=document.getElementById('flow');
function g(k){try{return localStorage.getItem(k)}catch(e){return null}}function s(k,v){try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}}
var P=location.pathname,hash=decodeURIComponent(location.hash.slice(1)),KEEP={today:1,news:1};
var secs=f?[].filter.call(f.children,function(sc){return sc.tagName==='SECTION'&&sc.querySelector('h2')&&!KEEP[sc.id]}):[].filter.call(m.querySelectorAll('section'),function(sc){return sc.querySelector(':scope>h2')&&!sc.closest('dialog')&&!sc.parentNode.closest('section')});
if(!f&&secs.length<3)return;if(!secs.length)return;
function head(sc){return sc.querySelector(':scope>h2')||sc.querySelector('h2')}
function set(sc,o){var b=sc.querySelector(':scope>.foldb'),h=sc.querySelector('.foldh');if(!b)return;b.hidden=!o;h.setAttribute('aria-expanded',String(o));sc.classList.toggle('folded',!o);if(o)setTimeout(function(){try{window.dispatchEvent(new Event('resize'))}catch(e){}},30)}
secs.forEach(function(sc,i){var h=head(sc),key='fold:'+P+':'+(sc.id||i);if(!h||h.parentNode!==sc)return;
var body=document.createElement('div');body.className='foldb';var n=h.nextSibling;while(n){var nx=n.nextSibling;body.appendChild(n);n=nx}sc.appendChild(body);
var open=(!f&&i===0)||g(key)==='1'||(hash&&(sc.id===hash||sc.querySelector('[id="'+hash.replace(/"/g,'')+'"]')));
h.classList.add('foldh');h.setAttribute('role','button');h.tabIndex=0;set(sc,!!open);
function tog(){var o=body.hidden;set(sc,o);s(key,o?'1':null)}h.addEventListener('click',function(e){if(e.target.closest('a,button'))return;tog()});h.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();tog()}})});
function openId(id){var el=document.getElementById(id);if(!el)return;var sc=el.classList.contains('foldb')?el.parentNode:(el.tagName==='SECTION'&&el.querySelector(':scope>.foldb')?el:el.closest('section'));while(sc&&!sc.querySelector(':scope>.foldb'))sc=sc.parentNode.closest('section');if(sc&&sc.classList.contains('folded'))set(sc,true)}
var op=window.openPanel;window.openPanel=function(id){openId(id);if(op)op(id)};
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.pills button[data-id]');if(b)openId(b.dataset.id);var a=e.target.closest&&e.target.closest('a[href*="#"]');if(a){try{var u=new URL(a.href);if(u.pathname===location.pathname&&u.hash)openId(decodeURIComponent(u.hash.slice(1)))}catch(_){}}},true);
window.addEventListener('hashchange',function(){openId(decodeURIComponent(location.hash.slice(1)))});
var bar=document.createElement('p');bar.className='foldall mute';bar.innerHTML='Tap a heading to open it · <a href="#" data-a="1">Open all</a> · <a href="#" data-a="0">Close all</a>';secs[0].parentNode.insertBefore(bar,secs[0]);
bar.onclick=function(e){var a=e.target.dataset&&e.target.dataset.a;if(a==null)return;e.preventDefault();secs.forEach(function(sc){set(sc,a==='1')})}})();`;

// ---- One-off reader polls (thumbs up/down). Counts only, no personal details. Shown on /results.
const POLLS = { "saving-time": "Is your Daily Maverick saving you time?", council: "How's council doing?" };
// What each vote is for: shown on /results so everyone knows how their vote helps.
const POLL_AIMS = { "saving-time": "You keep us accountable. If it isn't saving you time, we change it, and the reasons tell us what to fix first.",
  council: "An unofficial monthly thumbs up or down from locals, so council can see how the community feels in one place, without wading through its website." };
async function pollApi(req, env) {
  let b = {}; try { b = await req.json(); } catch {}
  if (!POLLS[b.q] || (b.v !== "up" && b.v !== "down")) return Response.json({ ok: false }, { status: 400 });
  const mon = todayISO().slice(0, 7), pc = okTown(cookie(req, "mpc"));
  if (b.why) { const k = `pollwhy:${b.q}:${mon}`, L = (await env.DATA.get(k, "json")) || []; // the reasons behind the thumbs; never shown with who said them
    const t = String(b.why).replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 200); let ok = false; try { ok = await cleanText(env, t); } catch (e) {}
    L.unshift({ v: b.v, t, ok, pc, at: new Date().toISOString() }); await env.DATA.put(k, JSON.stringify(L.slice(0, 500))); return Response.json({ ok: true }); }
  for (const k of [`poll:${b.q}`, `poll:${b.q}:${mon}`, ...(pc ? [`pollpc:${b.q}:${pc}`, `pollpc:${b.q}:${mon}:${pc}`] : [])]) { const c = (await env.DATA.get(k, "json")) || { up: 0, down: 0 }; c[b.v]++; await env.DATA.put(k, JSON.stringify(c)); }
  return Response.json({ ok: true });
}

// ---- What locals told us: every vote and question on the Daily Maverick, out in the open (counts only, never who said what),
// each with what the vote is for. It starts with how we're doing: the community keeps us accountable too.
async function resultsPage(env, req) {
  // Whose results: ?pc=2452 for one postcode, ?pc=all for the whole shire, otherwise the reader's own postcode (if they've picked one).
  const qp = new URL(req.url).searchParams.get("pc") || "", pc = qp === "all" ? "" : okTown(qp) || (qp ? "" : okTown(cookie(req, "mpc")));
  const shireOnly = pc ? ` <span class="shtag">Whole shire</span>` : "";
  const mon = todayISO().slice(0, 7), lastMon = new Date(Date.UTC(+mon.slice(0, 4), +mon.slice(5) - 2, 1)).toISOString().slice(0, 7);
  const monName = m => new Date(m + "-15").toLocaleDateString("en-AU", { month: "long", year: "numeric" });
  const bar = (c, upL = "Yes", downL = "No") => { const n = (c?.up || 0) + (c?.down || 0); if (!n) return `<p class="mute">No answers yet. Check back soon.</p>`; const pu = Math.round(c.up / n * 100);
    return `<div class="pbar" role="img" aria-label="${pu}% ${upL}, ${100 - pu}% ${downL}"><span style="width:${pu}%"></span></div><p><b>👍 ${pu}% ${upL}</b> · 👎 ${100 - pu}% ${downL} <span class="mute">(${n.toLocaleString("en-AU")} ${n === 1 ? "answer" : "answers"})</span></p>`; };
  const aim = t => `<p class="aim"><b>What this vote is for:</b> ${t}</p>`;
  const why = async q => { const L = ((await env.DATA.get(`pollwhy:${q}:${mon}`, "json")) || []).concat((await env.DATA.get(`pollwhy:${q}:${lastMon}`, "json")) || []).filter(x => x.ok && (!pc || x.pc === pc));
    const li = v => L.filter(x => x.v === v).slice(0, 5).map(x => `<li>“${esc(x.t)}”</li>`).join("");
    return L.length ? `<div class="whyc"><div><h3>👍 What locals like</h3>${li("up") ? `<ul>${li("up")}</ul>` : `<p class="mute">Nothing yet.</p>`}</div><div><h3>👎 What locals don't like</h3>${li("down") ? `<ul>${li("down")}</ul>` : `<p class="mute">Nothing yet.</p>`}</div></div><p class="mute">The latest reasons${pc ? ` from ${pc}` : ""}, in locals' own words (checked for anything rude first). Never shown with a name.</p>` : ""; };
  const [st, stMon, cNow, cLast, ts, nLoc, ideaL, watchL] = await Promise.all([env.DATA.get("poll:saving-time", "json"), env.DATA.get(`poll:saving-time:${mon}`, "json"), env.DATA.get(`poll:council:${mon}`, "json"), env.DATA.get(`poll:council:${lastMon}`, "json"),
    env.DATA.get("ts:total", "json").then(v => v || { mins: 0 }), localsCount(env), ideas(env), watchList(env).catch(() => [])]);
  const [stP, stMonP, cNowP, cLastP, rP] = pc ? await Promise.all([`pollpc:saving-time:${pc}`, `pollpc:saving-time:${mon}:${pc}`, `pollpc:council:${mon}:${pc}`, `pollpc:council:${lastMon}:${pc}`, `ratepc:${pc}`].map(k => env.DATA.get(k, "json"))) : [];
  // Two bars when a postcode is picked: that postcode first, then the whole shire to compare against.
  const two = (whole, mine, upL, downL) => pc ? `<div class="two"><div><p class="who">📍 ${pc} <span class="mute">${esc(TOWNS[pc].name)}</span></p>${bar(mine, upL, downL)}</div><div><p class="who">🗺️ Whole shire</p>${bar(whole, upL, downL)}</div></div>` : bar(whole, upL, downL);
  const rates = (await Promise.all((await klist(env, "rate:")).map(async k => [k.name.slice(5), await env.DATA.get(k.name, "json")]))).filter(x => x[1]);
  const rTot = rates.reduce((a, [, c]) => ({ up: a.up + (c.up || 0), down: a.down + (c.down || 0) }), { up: 0, down: 0 });
  const rTop = rates.filter(x => x[1].up + x[1].down >= 3).sort((a, b) => (b[1].up + b[1].down) - (a[1].up + a[1].down)).slice(0, 10);
  const days30 = [...Array(30)].map((_, k) => new Date(Date.now() - k * 864e5).toISOString().slice(0, 10)), sumV = L => L.reduce((a, c) => ({ up: a.up + (c?.up || 0), down: a.down + (c?.down || 0) }), { up: 0, down: 0 }),
    mavV = sumV(await Promise.all(days30.map(d => env.DATA.get(`help:votes:${d}`, "json")))), mavP = pc ? sumV(await Promise.all(days30.map(d => env.DATA.get(`help:votes:${d}:${pc}`, "json")))) : null;
  const top = ideaL.filter(i => i.status !== "done").sort((a, b) => b.votes - a.votes).slice(0, 5);
  const picks = {}, joinPc = {}; for (const { name } of await klist(env, "sub:")) { const v = await env.DATA.get(name, "json"); if (v?.tips) picks[v.tips] = (picks[v.tips] || 0) + 1; if (v?.pc) joinPc[v.pc] = (joinPc[v.pc] || 0) + 1; }
  const noms = async k => Object.values(k === "alcohol" ? await alcNoms(env) : await wnoms(env, k)).sort((a, b) => !!a.live - !!b.live || b.voters.length - a.voters.length).slice(0, 5);
  const [nShop, nGrog] = await Promise.all([noms("shop"), noms("alcohol")]);
  const nomList = L => L.length ? `<ul>${L.map(n => `<li>${esc(n.text)} <span class="mute">👍 ${n.voters.length}${n.live ? " · ✅ now watched" : ` of ${WATCH_GOAL}`}</span></li>`).join("")}</ul>` : `<p class="mute">No ideas yet.</p>`;
  const tv = watchL.sort((a, b) => b.ups.length - a.ups.length).slice(0, 5);
  const S = [
    ["council", "🏛️ How's council doing?", `${aim(POLL_AIMS.council)}<h3>${monName(mon)}</h3>${two(cNow, cNowP, "doing well", "could do better")}<h3>${monName(lastMon)}</h3>${two(cLast, cLastP, "doing well", "could do better")}${await why("council")}<p><a href="/council">Have your say in Council watch →</a></p>`],
    ["ideas", "💡 What locals want built next", `${shireOnly}${aim("You decide what we build. Ideas that reach 30 votes get built, in the order locals choose, not the order we'd pick.")}${top.length ? `<ol>${top.map(i => `<li>${esc(i.text)} <span class="mute">👍 ${i.votes}</span></li>`).join("")}</ol>` : `<p class="mute">No ideas yet.</p>`}<p><a href="/feedback">Suggest or vote →</a></p>`],
    ["locals", "🙌 Locals signed up", `${aim("Help a brother out: once we reach the goal, a few clearly labelled local ads cover the costs and it stays free for everyone, forever.")}<p><b>${nLoc.toLocaleString("en-AU")}</b> of our ${LOCALS_GOAL.toLocaleString("en-AU")} goal, across the whole shire.</p>${Object.keys(joinPc).length ? `<ul>${Object.keys(TOWNS).filter(k => TOWNS[k].live).sort().map(k => `<li${k === pc ? ' class="me"' : ""}><b>${k}</b> ${esc(TOWNS[k].name)}: ${(joinPc[k] || 0).toLocaleString("en-AU")} on the weekly email</li>`).join("")}</ul>` : ""}`],
    ["useful", "⭐ Most-rated pages", `${shireOnly}${aim("The 👍 and 👎 at the bottom of every page tell us what's useful and what to fix or drop.")}${rTop.length ? `<ul>${rTop.map(([p, c]) => `<li><a href="${esc(p)}">${esc(p)}</a>: 👍 ${c.up} · 👎 ${c.down}</li>`).join("")}</ul>` : `<p class="mute">Not enough ratings yet.</p>`}`],
    ["saved", "⏱️ Time saved", `${shireOnly}${aim("So we can show, honestly, whether one Daily Maverick really beats checking lots of apps and sites.")}${ts.mins > 0 ? `<p>Locals say our tools save them <b>${tsH(ts.mins)} a week</b> all up, about <b>${tsH(ts.mins * 52)} a year</b>.</p>` : `<p class="mute">No time-saved reports yet.</p>`}`],
    ["tv", "🍿 What locals are binging", `${shireOnly}${aim("Less time scrolling, more time watching: locals vote for what's worth it, and say why.")}${tv.length ? `<ul>${tv.map(x => `<li>${esc(x.title)} <span class="mute">${esc(x.tag)} · 👍 ${x.ups.length}</span></li>`).join("")}</ul>` : `<p class="mute">Nothing shared yet.</p>`}<p><a href="/watch">Share yours →</a></p>`],
    ["watch", "🗳️ What locals want us to watch", `${shireOnly}${aim(`Locals choose what we track, not us. ${WATCH_GOAL} votes and an item goes up for everyone, all by itself.`)}<h3>🍻 Grog watch</h3>${nomList(nGrog)}<h3>🛒 Supermarket watch</h3>${nomList(nShop)}`],
    ["numbers", "📞 Hard-to-find numbers", `${aim("Locals vote on whether a number worked, so the ones that don't drop off by themselves.")}<p><a href="/numbers">See the numbers and vote →</a></p>`],
  ].sort((a, b) => a[1].replace(/^\P{L}+/u, "").localeCompare(b[1].replace(/^\P{L}+/u, "")));
  const who = pc ? pc : "the shire", liveP = Object.keys(TOWNS).filter(k => TOWNS[k].live).sort();
  return page(`What ${who} told us`, `<h1>What ${who} told us</h1>
<nav class="towns" aria-label="Pick a postcode">${pc ? `<a class="pc" href="/results?pc=all">Whole shire</a>` : `<span class="pc on">Whole shire</span>`}${liveP.map(k => k === pc ? `<span class="pc on">${k}</span>` : `<a class="pc" href="/results?pc=${k}" title="${esc(TOWNS[k].name)}">${k}</a>`).join("")}</nav>
<p>${pc ? `Your part of the shire, <b>${pc}</b> (${esc(TOWNS[pc].name)}), next to the whole shire. Ideas, watch lists and a few others are shire-wide, and say so.` : `All of ${R.council.name}'s area together. Pick a postcode above to see just your part.`}</p>
<p>Every vote and question on ${R.brand} ${R.code}, out in the open, with what each one is for. Counts only: we never show who said what. <span class="mute">Unofficial and from readers, so it's not a scientific survey.</span></p>
<section id="poll-saving-time" class="us"><h2>🪞 How we're doing</h2><p>We keep council and everyone else accountable, so you keep us accountable too. This is how locals rate the Daily Maverick.</p>
${aim(POLL_AIMS["saving-time"])}<h3>Is your Daily Maverick saving you time?</h3><p class="mute">All time</p>${two(st, stP)}<p class="mute">${monName(mon)}</p>${two(stMon, stMonP)}${await why("saving-time")}
<h3>Pages: useful or not?</h3>${two(rTot, rP, "useful", "not useful")}<h3>Mav's answers: helpful or not? <span class="mute">(last 30 days)</span></h3>${two(mavV, mavP, "helpful", "not helpful")}</section>
<p class="mute">Want the bigger picture? <a href="/regional">See what regional Australia told us →</a></p>
<nav class="alcp" aria-label="Jump to">${S.map(([id, t]) => `<a class="tagg" href="#${id === "council" ? "poll-council" : id}">${t.replace(/^\P{L}+/u, "")}</a>`).join(" ")}</nav>
${S.map(([id, t, b]) => `<section id="${id === "council" ? "poll-council" : id}"><h2>${t}</h2>${b}</section>`).join("")}
<style>.aim{background:var(--soft);border-left:4px solid var(--gold);border-radius:8px;padding:8px 12px;font-size:.9rem}.whyc{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.us{border:2px solid var(--gold);border-radius:14px;padding:4px 16px 12px}.two{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:4px 16px}.who{margin:6px 0 2px;font-weight:600}.shtag{display:inline-block;font-size:.75rem;background:var(--soft);border-radius:99px;padding:1px 8px;margin-bottom:6px}li.me{font-weight:600}</style>`, pc);
}

// ---- What regional Australia told us: every Daily Maverick shares its public counts at /api/results.json
// (counts and already-public, checked comments only, never who said what). /regional pulls them all together.
async function regionStats(env) {
  const hit = await env.DATA.get("rstats", "json"); if (hit && Date.now() - hit.t < 600e3) return hit.d;
  const mon = todayISO().slice(0, 7), lastMon = new Date(Date.UTC(+mon.slice(0, 4), +mon.slice(5) - 2, 1)).toISOString().slice(0, 7);
  const get = k => env.DATA.get(k, "json");
  const [cNow, cLast, st, stMon, ts, nLoc, ideaL, wNow, wLast] = await Promise.all([get(`poll:council:${mon}`), get(`poll:council:${lastMon}`), get("poll:saving-time"), get(`poll:saving-time:${mon}`),
    get("ts:total"), localsCount(env), ideas(env), get(`pollwhy:council:${mon}`), get(`pollwhy:council:${lastMon}`)]);
  const why = [...(wNow || []), ...(wLast || [])].filter(x => x.ok);
  const rates = (await Promise.all((await klist(env, "rate:")).map(async k => [k.name.slice(5), await get(k.name)]))).filter(x => x[1]);
  const joinPc = {}; for (const { name } of await klist(env, "sub:")) { const v = await get(name); if (v?.pc) joinPc[v.pc] = (joinPc[v.pc] || 0) + 1; }
  const noms = async k => Object.values(k === "alcohol" ? await alcNoms(env) : await wnoms(env, k)).map(n => ({ text: n.text, votes: n.voters.length, live: !!n.live })).sort((a, b) => b.votes - a.votes).slice(0, 8);
  const d = { code: R.code, place: R.place, council: R.council.name, domain: R.domain, at: new Date().toISOString(), mon, lastMon,
    locals: nLoc, goal: LOCALS_GOAL, tsMins: ts?.mins || 0, councilNow: cNow, councilLast: cLast, saving: st, savingMon: stMon,
    rate: rates.reduce((a, [, c]) => ({ up: a.up + (c.up || 0), down: a.down + (c.down || 0) }), { up: 0, down: 0 }),
    pages: rates.map(([p, c]) => ({ p, up: c.up || 0, down: c.down || 0 })).sort((a, b) => (b.up + b.down) - (a.up + a.down)).slice(0, 12),
    ideas: ideaL.filter(i => i.status !== "done").slice(0, 10).map(i => ({ text: i.text, votes: i.votes })),
    worries: why.filter(x => x.v === "down").slice(0, 10).map(x => ({ t: x.t, pc: x.pc || "" })), likes: why.filter(x => x.v === "up").slice(0, 6).map(x => ({ t: x.t, pc: x.pc || "" })),
    shop: await noms("shop"), grog: await noms("alcohol"), joinPc };
  await env.DATA.put("rstats", JSON.stringify({ t: Date.now(), d })).catch(() => {});
  return d;
}
async function allRegions(env) {
  const hit = await env.DATA.get("regional:all", "json"); if (hit && Date.now() - hit.t < 900e3) return hit.L;
  const L = (await Promise.all(Object.values(REGIONS).map(async r => {
    if (r.code === R.code) return regionStats(env).catch(() => null);
    try { const ac = new AbortController(), tm = setTimeout(() => ac.abort(), 6000); const res = await fetch(`https://${r.domain}/api/results.json`, { signal: ac.signal, headers: UA }); clearTimeout(tm); return res.ok ? await res.json() : null; } catch (e) { return null; }
  }))).filter(r => r && r.place && Array.isArray(r.worries) && Array.isArray(r.ideas));
  await env.DATA.put("regional:all", JSON.stringify({ t: Date.now(), L })).catch(() => {});
  return L;
}
// One short, neutral read of what's worrying people, from locals' own checked comments. Rebuilt at most once a day.
async function worryThemes(env, L) {
  const day = todayISO(), hit = await env.DATA.get("regional:themes", "json"); if (hit && hit.day === day) return hit.themes;
  const lines = L.flatMap(r => [...r.worries.map(w => `[${r.place}] worry: ${w.t}`), ...r.ideas.slice(0, 5).map(i => `[${r.place}] wants: ${i.text}`)]).slice(0, 120);
  let themes = [];
  if (lines.length >= 5) try {
    const ask = { messages: [{ role: "system", content: "You group comments from regional Australians into themes. No opinions, no judgement, plain English. Output ONLY JSON." },
      { role: "user", content: `Group these comments into at most 5 themes, biggest first. For each give "theme" (3-6 words), "towns" (the place names in brackets that raised it) and "count". Return {"themes":[...]}.\n\n${lines.join("\n")}` }] };
    let out; try { out = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", ask); } catch (e) { out = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", ask); }
    const raw = typeof out?.response === "string" ? out.response : JSON.stringify(out?.response || {});
    themes = (JSON.parse(raw.match(/\{[\s\S]*\}/)[0]).themes || []).slice(0, 5).map(x => ({ theme: String(x.theme || "").slice(0, 60), towns: [].concat(x.towns || []).map(String).slice(0, 8), count: +x.count || 0 })).filter(x => x.theme);
  } catch (e) { themes = []; }
  await env.DATA.put("regional:themes", JSON.stringify({ day, themes })).catch(() => {});
  return themes;
}
async function regionalPage(env) {
  const L = abc(await allRegions(env), r => r.place), n = c => (c?.up || 0) + (c?.down || 0), pct = c => n(c) ? Math.round(c.up / n(c) * 100) : null;
  const sum = k => L.reduce((a, r) => ({ up: a.up + (r[k]?.up || 0), down: a.down + (r[k]?.down || 0) }), { up: 0, down: 0 });
  const num = x => Number(x || 0).toLocaleString("en-AU");
  const row = (r, c, lab) => { const p = pct(c); return `<li${r.code === R.code ? ' class="me"' : ""}><a href="https://${esc(r.domain)}/results">${esc(r.place)} <span class="mute">${esc(r.code)}</span></a>${p == null ? `<span class="mute">No answers yet</span>` : `<span class="rbar" role="img" aria-label="${p}% ${lab}"><span style="width:${p}%"></span></span><span><b>${p}%</b> <span class="mute">(${num(n(c))})</span></span>`}</li>`; };
  const cmp = (k, lab) => `<ul class="cmp">${L.map(r => row(r, r[k], lab)).join("")}</ul>`;
  const totLocals = L.reduce((a, r) => a + (r.locals || 0), 0), totMins = L.reduce((a, r) => a + (r.tsMins || 0), 0), cAll = sum("councilNow"), sAll = sum("saving");
  // Ideas and watch votes merged across every paper by the same wording, with the towns that asked.
  const merge = (k, f = x => x.votes) => { const m = {}; for (const r of L) for (const i of r[k] || []) { const key = i.text.toLowerCase().replace(/\W+/g, " ").trim(); (m[key] ||= { text: i.text, votes: 0, towns: [] }); m[key].votes += f(i); if (!m[key].towns.includes(r.place)) m[key].towns.push(r.place); } return Object.values(m).sort((a, b) => b.votes - a.votes).slice(0, 10); };
  const mlist = (k, empty) => { const M = merge(k); return M.length ? `<ol>${M.map(i => `<li>${esc(i.text)} <span class="mute">👍 ${num(i.votes)} · ${i.towns.map(esc).join(", ")}</span></li>`).join("")}</ol>` : `<p class="mute">${empty}</p>`; };
  const pages = {}; for (const r of L) for (const p of r.pages || []) { (pages[p.p] ||= { up: 0, down: 0 }); pages[p.p].up += p.up; pages[p.p].down += p.down; }
  const topPages = Object.entries(pages).filter(([, c]) => n(c) >= 3).sort((a, b) => b[1].up - a[1].up).slice(0, 10);
  const themes = await worryThemes(env, L).catch(() => []);
  const worries = L.flatMap(r => r.worries.map(w => ({ ...w, place: r.place }))).slice(0, 12);
  const mon = L[0]?.mon ? new Date(L[0].mon + "-15").toLocaleDateString("en-AU", { month: "long", year: "numeric" }) : "this month";
  const S = [
    ["council", "🏛️ How's council doing?", `<p class="aim"><b>Compare councils:</b> the share of locals giving their council a thumbs up in ${esc(mon)}. Every council, side by side, in locals' words, not ours.</p>${cmp("councilNow", "doing well")}<p class="mute">All of regional Australia: ${pct(cAll) == null ? "no answers yet" : `<b>${pct(cAll)}%</b> thumbs up from ${num(n(cAll))} answers`}.</p>`],
    ["worried", "😟 What's on regional Australia's mind", `${themes.length ? `<ul class="themes">${themes.map(t => `<li><b>${esc(t.theme)}</b> <span class="mute">${t.towns.map(esc).join(", ")}</span></li>`).join("")}</ul><p class="mute">Grouped by Team Smarketing from locals' own checked comments and ideas. Sorting only, no opinion added.</p>` : ""}${worries.length ? `<h3>In locals' own words</h3><ul>${worries.map(w => `<li>“${esc(w.t)}” <span class="mute">${esc(w.place)}${w.pc ? " " + esc(w.pc) : ""}</span></li>`).join("")}</ul>` : `<p class="mute">Not enough comments yet. Have your say in Council watch on your Daily Maverick.</p>`}`],
    ["ideas", "💡 What regional Australia wants built", `<p class="aim">The same idea from different towns is counted together, so you can see what's wanted everywhere, not just at home.</p>${mlist("ideas", "No ideas yet.")}`],
    ["saving", "🪞 Is the Daily Maverick saving people time?", `${cmp("saving", "yes")}<p class="mute">All papers: ${pct(sAll) == null ? "no answers yet" : `<b>${pct(sAll)}%</b> say yes`}. Locals say our tools save them <b>${tsH(totMins)} a week</b> all up.</p>`],
    ["watch", "🗳️ What locals want watched", `<h3>🛒 Supermarket watch</h3>${mlist("shop", "No ideas yet.")}<h3>🍻 Grog watch</h3>${mlist("grog", "No ideas yet.")}`],
    ["useful", "⭐ Most useful across regional Australia", topPages.length ? `<ul>${topPages.map(([p, c]) => `<li>${esc(p)}: 👍 ${num(c.up)} · 👎 ${num(c.down)}</li>`).join("")}</ul>` : `<p class="mute">Not enough ratings yet.</p>`],
    ["locals", "🙌 Locals signed up, town by town", `<ul class="cmp">${L.map(r => { const p = Math.min(100, Math.round((r.locals || 0) / (r.goal || LOCALS_GOAL) * 100)); return `<li${r.code === R.code ? ' class="me"' : ""}><a href="https://${esc(r.domain)}/">${esc(r.place)} <span class="mute">${esc(r.code)}</span></a><span class="rbar"><span style="width:${Math.max(p, 1)}%"></span></span><span><b>${num(r.locals)}</b> <span class="mute">of ${num(r.goal || LOCALS_GOAL)}</span></span></li>`; }).join("")}</ul>`],
  ].sort((a, b) => a[1].replace(/^\P{L}+/u, "").localeCompare(b[1].replace(/^\P{L}+/u, "")));
  return page("What regional Australia told us", `<h1>What regional Australia told us</h1>
<p>Every Daily Maverick, together: what regional communities are thinking, worried about and asking for, and how towns compare. Counts and checked comments only, never who said what. <span class="mute">Unofficial and from readers, so it's not a scientific survey.</span></p>
<div class="rtot"><div><b>${L.length}</b><span>Daily Mavericks</span></div><div><b>${num(totLocals)}</b><span>locals signed up</span></div><div><b>${num(n(cAll) + n(sAll))}</b><span>answers given</span></div><div><b>${tsH(totMins)}</b><span>saved a week</span></div></div>
<nav class="alcp" aria-label="Jump to">${S.map(([id, t]) => `<a class="tagg" href="#${id}">${t.replace(/^\P{L}+/u, "")}</a>`).join(" ")}</nav>
${S.map(([id, t, b]) => `<section id="${id}"><h2>${t}</h2>${b}</section>`).join("")}
<p>Town not here yet? <a href="/suggest">Ask for a Daily Maverick for your town →</a> · <a href="/results">What ${R.code} told us →</a></p>
<p class="mute">Updated every 15 minutes. Each paper's own numbers are on its What locals told us page.</p>
<style>.aim{background:var(--soft);border-left:4px solid var(--gold);border-radius:8px;padding:8px 12px;font-size:.9rem}.cmp{list-style:none;padding:0;margin:8px 0}.cmp li{display:grid;grid-template-columns:minmax(120px,1.2fr) 2fr auto;gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid var(--line)}.cmp li.me{font-weight:600}.cmp a{color:var(--fg)}.rbar{display:block;height:10px;border-radius:99px;background:var(--soft);overflow:hidden}.rbar>span{display:block;height:100%;background:var(--gold)}.rtot{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin:14px 0}.rtot div{border:2px solid var(--gold);border-radius:12px;padding:10px;text-align:center;display:flex;flex-direction:column}.rtot b{font-family:Georgia,serif;font-size:1.6rem}.rtot span{font-size:.85rem;color:var(--mute)}.themes li{padding:4px 0}@media(max-width:480px){.cmp li{grid-template-columns:1fr auto}.cmp .rbar{grid-column:1/-1;order:3}}</style>`, "", { desc: "What regional Australia is thinking, worried about and asking for, from every Daily Maverick, with town-by-town comparisons." });
}

// ---- Tracked links to Maverick Digital (key conversion events). Counts clicks per day, then adds UTM tags
// so the Maverick Digital site and ActiveCampaign can see which Gazette and section the lead came from.
const GO = { "nerd-ai": { url: "https://maverickdigital.com.ai/nerd/", content: "ai-good-bad" } };
async function goLink(slug, env) {
  const g = GO[slug]; if (!g) return new Response("Not found", { status: 404 });
  const day = new Date().toISOString().slice(0, 10), key = `click:${slug}:${day}`;
  try { await env.DATA.put(key, String((+(await env.DATA.get(key)) || 0) + 1), { expirationTtl: 34560000 }); } catch {}
  const to = g.url + "?" + new URLSearchParams({ utm_source: R.domain, utm_medium: "referral", utm_campaign: "daily-maverick", utm_content: g.content });
  return new Response(null, { status: 302, headers: { location: to, "cache-control": "no-store" } });
}

// ---- ActiveCampaign: everyone who signs in or subscribes goes to AC, tagged with the postcode of the Daily Maverick they joined from.
// Secrets on each Worker: AC_URL (e.g. https://youraccount.api-us1.com) and AC_KEY. Off until both are set.
// Only people who ticked yes to the weekly email (a sub: record) go on list 4, so we stay on the right side of the Spam Act.
// Google sign-ins who haven't opted in yet are still added as contacts (with postcode), just not to the list.
// New people are queued (acq:) and sent every half hour. The first run also queues everyone already signed up.
const AC_LIST = 4, AC_PC = "DAILY_MAVERICK_POSTCODE";
const acQueue = (env, email) => env.DATA.put(`acq:${email}`, "1").catch(() => {});
async function ac(env, path, body, method) {
  const r = await fetch(`${env.AC_URL.replace(/\/+$/, "")}/api/3/${path}`, { method: method || (body ? "POST" : "GET"), headers: { "Api-Token": env.AC_KEY, "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  if (!r.ok && r.status !== 422) throw new Error(`AC ${path} ${r.status}`);
  return r.json().catch(() => ({}));
}
async function acFieldId(env) { // finds (or makes, once) the "Daily Maverick postcode" field, shared by every town's site
  let id = await env.DATA.get("ac:field"); if (id) return id;
  const f = (await ac(env, `fields?limit=100&filters[perstag]=${AC_PC}`)).fields?.find(x => x.perstag === AC_PC);
  if (f) id = f.id;
  else { id = (await ac(env, "fields", { field: { type: "text", title: "Daily Maverick postcode", perstag: AC_PC, description: "Which Daily Maverick site they joined from" } })).field?.id; if (id) await ac(env, "fieldRels", { fieldRel: { field: id, relid: 0 } }); }
  if (id) await env.DATA.put("ac:field", String(id));
  return id;
}
// Brad's segmentation fields (created in AC under "Daily Maverick"), looked up by personalisation tag and cached.
const AC_REGION = "MAVERICK_REGION", AC_REGION_PC = "MAVERICK_REGION_POSTCODE", AC_PAGE = "SUBSCRIBED_PAGE";
async function acFieldByTag(env, tag) {
  let id = await env.DATA.get(`ac:f:${tag}`); if (id) return id === "-" ? null : id;
  const f = (await ac(env, `fields?limit=100&filters[perstag]=${tag}`)).fields?.find(x => x.perstag === tag);
  if (f) await env.DATA.put(`ac:f:${tag}`, String(f.id)); else await env.DATA.put(`ac:f:${tag}`, "-", { expirationTtl: 3600 });
  return f ? String(f.id) : null;
}
// UTM fields: made once in AC if missing, then cached. First visit's source, so you see what brought each person in.
const AC_UTM = [["UTM_SOURCE", "UTM Source", "source"], ["UTM_MEDIUM", "UTM Medium", "medium"], ["UTM_CAMPAIGN", "UTM Campaign", "campaign"], ["UTM_CONTENT", "UTM Content", "content"], ["UTM_TERM", "UTM Term", "term"], ["REFERRER", "Referrer", "ref"], ["LANDING_PAGE", "Landing Page", "land"]];
async function acFieldEnsure(env, tag, title) {
  let id = await env.DATA.get(`ac:f:${tag}`); if (id && id !== "-") return id;
  id = (await ac(env, `fields?limit=100&filters[perstag]=${tag}`)).fields?.find(x => x.perstag === tag)?.id;
  if (!id) { id = (await ac(env, "fields", { field: { type: "text", title, perstag: tag, description: "First visit, from the Daily Maverick sites" } })).field?.id; if (id) await ac(env, "fieldRels", { fieldRel: { field: id, relid: 0 } }); }
  if (id) await env.DATA.put(`ac:f:${tag}`, String(id));
  return id ? String(id) : null;
}
// The Daily Maverick form in AC (form 5): every opted-in sign-up is also put through it, so its list and form automations fire.
const AC_FORM = { host: "https://bradatwal.activehosted.com", id: "5", consentField: "6", consent: "I understand I am being added to a list." };
async function acForm(email, first, vals) {
  const b = new URLSearchParams({ u: AC_FORM.id, f: AC_FORM.id, s: "", c: "0", m: "0", act: "sub", v: "2", email, firstname: first || "Local" });
  b.append(`field[${AC_FORM.consentField}][]`, "~|"); b.append(`field[${AC_FORM.consentField}][]`, AC_FORM.consent);
  for (const [tag, v] of Object.entries(vals)) b.append(`field[%${tag}%,0]`, v);
  const r = await fetch(`${AC_FORM.host}/proc.php?${b}&jsonp=true`); if (!r.ok) throw new Error(`AC form ${r.status}`);
}
async function acTagId(env, name) {
  let id = await env.DATA.get(`ac:tag:${name}`); if (id) return id;
  id = (await ac(env, `tags?search=${encodeURIComponent(name)}`)).tags?.find(t => t.tag === name)?.id || (await ac(env, "tags", { tag: { tag: name, tagType: "contact", description: "Daily Maverick AI tips pick" } })).tag?.id;
  if (id) await env.DATA.put(`ac:tag:${name}`, String(id));
  return id;
}
async function acTag(env, email, name) { // tags one person in ActiveCampaign (memberships)
  if (!env.AC_URL || !env.AC_KEY) return;
  const c = (await ac(env, "contact/sync", { contact: { email } })).contact, t = await acTagId(env, name);
  if (c?.id && t) await ac(env, "contactTags", { contactTag: { contact: c.id, tag: t } });
}
async function acSync(env) {
  if (!env.AC_URL || !env.AC_KEY) return;
  // One-off re-send of everyone so the new region, postcode and page fields are filled for people who joined before them.
  if (!(await env.DATA.get("ac:backfill3"))) { for (const pre of ["user:", "sub:"]) for (const { name } of await listAll(env, pre)) await acQueue(env, name.slice(pre.length)); await env.DATA.put("ac:backfill3", new Date().toISOString()); await env.DATA.put("ac:backfill", "1"); }
  if (!(await env.DATA.get("ac:backfill"))) { for (const pre of ["user:", "sub:"]) for (const { name } of await listAll(env, pre)) await acQueue(env, name.slice(pre.length)); await env.DATA.put("ac:backfill", new Date().toISOString()); }
  const q = (await env.DATA.list({ prefix: "acq:", limit: 40 })).keys; if (!q.length) return;
  const field = await acFieldId(env), fRegion = await acFieldByTag(env, AC_REGION), fPc = await acFieldByTag(env, AC_REGION_PC), fPage = await acFieldByTag(env, AC_PAGE);
  const region = R.domain.replace(/\.live$/, "");
  const fUtm = []; for (const [tag, title, key] of AC_UTM) fUtm.push([await acFieldEnsure(env, tag, title), key, tag]);
  for (const { name } of q) {
    const email = name.slice(4);
    try {
      const u = await env.DATA.get(`user:${email}`, "json"), sub = await env.DATA.get(`sub:${email}`, "json");
      if (u || sub) {
        const pc = String(sub?.pc || u?.pc || R.code), first = String(sub?.name || u?.name || "").slice(0, 40), page = String(sub?.page || u?.page || "/ (joined before page tracking)");
        const utm = sub?.utm || u?.utm || {}, uv = k => String(utm[k] || (k === "source" ? "unknown (before tracking)" : "(none)"));
        const fv = [[field, pc], [fRegion, region], [fPc, pc], [fPage, page], ...fUtm.map(([f, k]) => [f, uv(k)])].filter(([f]) => f).map(([f, value]) => ({ field: String(f), value }));
        const c = (await ac(env, "contact/sync", { contact: { email, ...(first ? { firstName: first } : {}), fieldValues: fv } })).contact;
        if (sub?.consent && !(await env.DATA.get(`acf:${email}`))) { await acForm(email, first, { [AC_REGION]: region, [AC_REGION_PC]: pc, [AC_PAGE]: page, ...Object.fromEntries(fUtm.map(([, k, tag]) => [tag, uv(k)])) }); await env.DATA.put(`acf:${email}`, "1"); }
        if (c?.id && sub?.consent) await ac(env, "contactLists", { contactList: { list: AC_LIST, contact: c.id, status: 1 } });
        if (c?.id && sub?.tips) { const t = await acTagId(env, sub.tips === "all" ? "Tips: Team Smarketing (all)" : `Tips: ${TIPPERS.find(x => x[0] === sub.tips)?.[1].replace(/<[^>]+>/g, "").trim() || sub.tips}`); if (t) await ac(env, "contactTags", { contactTag: { contact: c.id, tag: t } }); }
      }
      await env.DATA.delete(name);
    } catch (e) { break; } // AC hiccup or rate limit: leave the rest queued for the next run
  }
}

// ---- Gravatar: a public photo and first name from just an email (GRAVATAR_API_KEY secret).
// Only public profile data. Cached a week per email hash (misses too), so we rarely call Gravatar.
const okPic = u => (typeof u === "string" && /^https:\/\/([\w-]+\.)*(gravatar\.com|googleusercontent\.com)\//.test(u) ? u.slice(0, 300) : "");
async function gravatar(env, email) {
  email = String(email || "").trim().toLowerCase();
  if (!env.GRAVATAR_API_KEY || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return null;
  const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email)))].map(b => b.toString(16).padStart(2, "0")).join("");
  const key = `grav:${hash}`, hit = await env.DATA.get(key, "json");
  if (hit) return hit.none ? null : hit;
  let out = null;
  try {
    const r = await fetch(`https://api.gravatar.com/v3/profiles/${hash}`, { headers: { authorization: `Bearer ${env.GRAVATAR_API_KEY}` } });
    if (r.ok) { const j = await r.json(); out = { first: String(j.first_name || String(j.display_name || "").split(" ")[0] || "").slice(0, 40), photo: okPic(j.avatar_url ? j.avatar_url + "?s=96&d=404" : "") }; }
    else if (r.status !== 404) return null; // Gravatar hiccup: don't cache, try next time
  } catch { return null; }
  await env.DATA.put(key, JSON.stringify(out || { none: true }), { expirationTtl: 604800 });
  return out;
}
// Sign-in forms ask this when someone types their email, to say g'day and fill in their name.
async function helloApi(req, env) {
  const { email } = await req.json().catch(() => ({}));
  const g = await gravatar(env, email);
  return Response.json(g ? { first: g.first, photo: g.photo } : {});
}
const HELLO_JS = `<p class="hello" id="hello" hidden></p><script>(function(){var f=document.currentScript.previousElementSibling.previousElementSibling,e=f&&f.querySelector('[name=email]'),n=f&&f.querySelector('[name=name]'),h=document.getElementById('hello'),last='';if(!e)return;
e.addEventListener('change',function(){var v=e.value.trim().toLowerCase();if(!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(v)||v===last)return;last=v;
fetch('/api/hello',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:v})}).then(function(r){return r.json()}).then(function(g){if(!g.first&&!g.photo){h.hidden=true;return}
if(g.first&&n&&!n.value)n.value=g.first;h.innerHTML='';if(g.photo){var i=new Image();i.src=g.photo;i.alt='';i.className='av lg';i.onerror=function(){i.remove()};h.appendChild(i)}h.appendChild(document.createTextNode(g.first?'G\\u2019day '+g.first+' \\uD83D\\uDC4B':'G\\u2019day \\uD83D\\uDC4B'));h.hidden=false}).catch(function(){})})})();<\/script>`;

// ---- Sign in: Google (one tap for most locals) or email. Builds the 2450 people list.
// Secrets on this Worker: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GRAVATAR_API_KEY. Google redirect URI: https://2450-maverick.live/auth/google/callback
const safeNext = n => (typeof n === "string" && /^\/(?!\/)[\w\-\/?=&#.%]*$/.test(n) ? n : "/");
function sessionHeaders(tok, name, next, pic = "") {
  const h = new Headers({ location: next });
  if (okPic(pic)) h.append("set-cookie", `m2450p=${encodeURIComponent(okPic(pic))}; Path=/; Max-Age=31536000; Secure; SameSite=Lax`);
  h.append("set-cookie", `m2450=${tok}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`);
  h.append("set-cookie", `m2450n=${encodeURIComponent(name || "Local")}; Path=/; Max-Age=31536000; Secure; SameSite=Lax`);
  return h;
}
const JOIN_WHY = () => `<ul class="why">
<li><span class="mavav" aria-hidden="true"></span><b>Mav.</b> Tell him about your day and he sets up your page in seconds. Signed-in members get more; paid members get unlimited Mav.</li>
<li>📱 <b>Your page on any phone.</b> Your pins, stars, bin night and saved searches follow you (free when you sign in).</li>
<li>🧊 <b>What's in your fridge?</b> Snap it, get dinner ideas (Every Cool Thing members).</li>
<li>🙌 <b>You count.</b> You're one of the locals helping a brother out.</li></ul>
<div class="note"><b>🧠 Plus, free tips on using AI in everyday life</b> from our friends at Maverick Digital. The better you get at telling AI what you want, the better your Daily Maverick gets, because Mav works the same way: just tell him.</div>`;
const signinPage = (env, next = "/", msg = "") => page(`Join ${R.brand}`, `<h1>Join your Daily Maverick</h1>
<p><b>Signing in is free, forever. One tap.</b> Here's what you can get:</p>${JOIN_WHY()}${msg}
${env.GOOGLE_CLIENT_ID ? `<p><a class="gbtn" href="/auth/google?next=${encodeURIComponent(next)}"><svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg> Continue with Google</a></p><p class="mute">— or use your email —</p>` : ""}
<form method="post" action="/unlock"><input type="hidden" name="next" value="${esc(next)}"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<div class="row"><input name="name" placeholder="First name" maxlength="40"><input type="email" name="email" placeholder="Your email" required></div>
${TIPS_PICK}<label class="mute"><input type="checkbox" name="consent" required> Yes, send me the weekly email from ${R.brand} (Maverick Digital), plus the free AI guide. Unsubscribe any time.</label>
<p><button>Sign me in</button></p></form>${HELLO_JS}<p class="mute">We only keep your name, email and photo (from Google, or your public Gravatar if you have one). <a href="/privacy">Privacy</a></p>`);

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
  await env.DATA.put(`user:${email}`, JSON.stringify({ email, name, fullName: String(c.name || "").slice(0, 80), picture: c.picture || "", via: "google", pc: prev?.pc || joinCtx(req).pc, utm: prev?.utm || joinCtx(req).utm, page: prev?.page || (next !== "/" ? next.split("?")[0] : joinCtx(req).page), first: prev?.first || now, last: now, visits: (prev?.visits || 0) + 1 }));
  if (!prev) await acQueue(env, email);
  const tok = crypto.randomUUID();
  await env.DATA.put(`sess:${tok}`, email, { expirationTtl: 31536000 });
  const subbed = await env.DATA.get(`sub:${email}`);
  const h = sessionHeaders(tok, name, subbed ? next : `/welcome?next=${encodeURIComponent(next)}`, c.picture);
  h.append("set-cookie", "g2450s=; Path=/auth; Max-Age=0; Secure; SameSite=Lax");
  return new Response(null, { status: 302, headers: h });
}

const welcomePage = (url) => { const next = safeNext(url.searchParams.get("next") || "/"); return page(`Welcome to ${R.code}`, `<h1>You're in! 👋</h1>
<p>Thanks for helping a brother out. You're now one of the locals.</p>
<div class="rally"><p><b>One more tap?</b> Get "This week in ${R.code}" (one short email a week) plus free tips from our friends at Maverick Digital on using AI in everyday life. The better you get at telling AI what you want, the better your Daily Maverick gets.</p>
<form method="post" action="/optin"><input type="hidden" name="next" value="${esc(next)}">${TIPS_PICK}<button>Yes please</button> <a href="${esc(next)}" class="mute" style="margin-left:12px">Not now</a></form>
<p class="mute">Unsubscribe any time. <a href="/privacy">Privacy</a></p></div>`); };

async function optin(req, env) {
  const f = await req.formData(), next = safeNext(String(f.get("next") || "/")), email = await member(req, env);
  if (email) { const u = await env.DATA.get(`user:${email}`, "json"); await env.DATA.put(`sub:${email}`, JSON.stringify({ email, name: u?.name || "", ...(cx => ({ pc: cx.pc, page: u?.page || (next !== "/" ? next.split("?")[0] : cx.page), utm: u?.utm || cx.utm }))(joinCtx(req)), consent: true, source: "google", tips: tipPick(f.get("tips")), at: new Date().toISOString() })); await acQueue(env, email); }
  return new Response(null, { status: 303, headers: { location: next } });
}

async function signout(req, env) {
  const t = cookie(req, "m2450"); if (t) await env.DATA.delete(`sess:${t}`);
  const h = new Headers({ location: "/" });
  h.append("set-cookie", "m2450=; Path=/; Max-Age=0; Secure; SameSite=Lax");
  h.append("set-cookie", "m2450n=; Path=/; Max-Age=0; Secure; SameSite=Lax");
  h.append("set-cookie", "m2450p=; Path=/; Max-Age=0; Secure; SameSite=Lax");
  return new Response(null, { status: 303, headers: h });
}

const FOODS = ["chicken","beef mince","sausages","steak","bacon","ham","fish","prawns","eggs","cheese","milk","cream","butter","yoghurt","tofu",
  "potatoes","onion","garlic","carrots","broccoli","spinach","capsicum","mushrooms","zucchini","tomatoes","lettuce","avocado","pumpkin","lemon",
  "rice","pasta","noodles","bread","wraps","tinned tomatoes","chickpeas","beans","coconut milk","curry paste","pesto"];

const unlockPage = (msg = "") => page("What's in your fridge?", `<h1>🧊 What's in your fridge?</h1>
<p>Tell us what you've got, how many you're feeding and what you like. Get dinner ideas in seconds, with links to the recipes.</p>
<p><b>Part of Every Cool Thing membership.</b> Pop in your email to sign in first (and get the weekly "This week in ${R.code}" email).</p>${msg}
<form method="post" action="/unlock"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<div class="row"><input name="name" placeholder="First name" maxlength="40"><input type="email" name="email" placeholder="Your email" required></div>
${TIPS_PICK}<label class="mute"><input type="checkbox" name="consent" required> Yes, send me the weekly email from ${R.brand} (Maverick Digital). Unsubscribe any time.</label>
<p><button>Unlock the fridge</button></p></form>${HELLO_JS}`);

// Photo of the fridge -> list of foods. Uses Cloudflare's free AI allowance; the photo is never stored.
async function fridgePhoto(req, env) {
  const fem = await member(req, env);
  if (!fem) return Response.json({ error: "Sign in to use the fridge." }, { status: 401 });
  if (!(await hasTier(env, fem, "every"))) return Response.json({ error: "The fridge is part of Every Cool Thing." }, { status: 402 });
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
  // Already have an account? Prove it's you: we email a one-tap sign-in link (no passwords, ever).
  if ((await env.DATA.get(`user:${email}`)) && env.MAILER) return sendSignInLink(req, env, email, f.get("next") ? safeNext(String(f.get("next"))) : "/");
  const g = await gravatar(env, email);
  const name = String(f.get("name") || g?.first || "").slice(0, 40), tok = crypto.randomUUID();
  const cx = joinCtx(req, f.get("pc")), nx = f.get("next") ? safeNext(String(f.get("next"))) : "";
  await env.DATA.put(`sub:${email}`, JSON.stringify({ email, name, pc: cx.pc, page: nx && nx !== "/" ? nx.split("?")[0] : cx.page, utm: cx.utm, consent: true, source: "email", tips: tipPick(f.get("tips")), at: new Date().toISOString() }));
  await env.DATA.put(`sess:${tok}`, email, { expirationTtl: 31536000 });
  await acQueue(env, email);
  const prev = await env.DATA.get(`user:${email}`, "json"), now = new Date().toISOString();
  await env.DATA.put(`user:${email}`, JSON.stringify({ ...(prev || {}), email, name: name || prev?.name || "", picture: prev?.picture || g?.photo || "", via: prev?.via || "email", first: prev?.first || now, last: now, visits: (prev?.visits || 0) + 1 }));
  return new Response(null, { status: 303, headers: sessionHeaders(tok, name, f.get("next") ? safeNext(String(f.get("next"))) : "/fridge", prev?.picture || g?.photo) });
}

// ---- Optional email on a form = a free sign-in plus the community list. Every form says so right beside the box (joinNote).
const joinNote = () => `<small class="mute jnote">📬 Adding your email signs you in free and adds you to the ${R.brand.replace(/^The /, "")} community list: &ldquo;This week in ${R.code}&rdquo; (one short email a week) plus free AI tips from Maverick Digital. Unsubscribe any time. <a href="/privacy">Privacy</a></small>`;
// Signed-in readers don't need the email box: the page swaps it for "Sending as …".
const JOIN_JS = `(function(){var n=(document.cookie.match(/(?:^|; )m2450n=([^;]*)/)||[])[1];if(!n)return;document.querySelectorAll('.optmail').forEach(function(b){b.innerHTML='<small class="mute">Sending as <b>'+decodeURIComponent(n).replace(/[<>&"]/g,'')+'</b> (signed in).</small>'})})();`;
async function joinQuiet(req, env, email, name, source) { // returns set-cookie values for a brand-new local, [] otherwise
  email = String(email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || (await member(req, env))) return [];
  const cx = joinCtx(req), now = new Date().toISOString(), prev = await env.DATA.get(`user:${email}`, "json");
  if (!(await env.DATA.get(`sub:${email}`))) await env.DATA.put(`sub:${email}`, JSON.stringify({ email, name: String(name || "").slice(0, 40), pc: cx.pc, page: cx.page, utm: cx.utm, consent: true, source, at: now }));
  await acQueue(env, email);
  if (prev) return []; // existing account: they're on the list, but only they can sign in (stops anyone signing in as someone else)
  const g = await gravatar(env, email).catch(() => null), nm = String(name || g?.first || "").slice(0, 40), tok = crypto.randomUUID();
  await env.DATA.put(`user:${email}`, JSON.stringify({ email, name: nm, picture: g?.photo || "", via: "email", source, first: now, last: now, visits: 1 }));
  await env.DATA.put(`sess:${tok}`, email, { expirationTtl: 31536000 });
  const h = sessionHeaders(tok, nm, "/", g?.photo);
  return h.getSetCookie ? h.getSetCookie() : [h.get("set-cookie")];
}
const withCookies = (res, cookies) => { if (!cookies.length) return res; const r = new Response(res.body, res); cookies.forEach(c => r.headers.append("set-cookie", c)); return r; };
const joinedMsg = cookies => cookies.length ? ` You're signed in and on the ${R.code} community list. Welcome, local!` : "";

// ---- One-tap email sign-in link: valid 15 minutes, works once. Max 5 a day per email. ----
async function sendSignInLink(req, env, email, next) {
  const k = `maglim:${email}:${todayISO()}`, n = +(await env.DATA.get(k) || 0);
  const done = (m) => page("Check your email", `<h1>📬 Check your email</h1>${m}<p><a href="/">Back to ${esc(R.code)}</a></p>`);
  if (n >= 5) return done(`<p>We've sent a few links today already. Use the latest one in your inbox, or sign in with Google.</p>`);
  const tok = crypto.randomUUID().replace(/-/g, ""), origin = new URL(req.url).origin;
  await env.DATA.put(`magic:${tok}`, JSON.stringify({ email, next }), { expirationTtl: 900 });
  await env.DATA.put(k, String(n + 1), { expirationTtl: 172800 });
  try {
    const { EmailMessage } = await import("cloudflare:email"), from = `hello@${R.domain}`, link = `${origin}/auth/link?t=${tok}`;
    const body = `G'day,\n\nTap this link to sign in to ${R.brand}:\n\n${link}\n\nIt works once and runs out in 15 minutes. No password needed, ever.\n\nDidn't ask for this? Just ignore it. Nobody can sign in without this link.\n\n${R.brand}, powered by Maverick Digital`;
    const raw = [`From: ${R.brand} <${from}>`, `To: ${email}`, `Subject: Your sign-in link for ${R.brand}`, `Message-ID: <${crypto.randomUUID()}@${R.domain}>`, `Date: ${new Date().toUTCString()}`, "MIME-Version: 1.0", "Content-Type: text/plain; charset=utf-8", "", body].join("\r\n");
    await env.MAILER.send(new EmailMessage(from, email, raw));
  } catch (e) { console.log("sign-in link", e); return done(`<p>We couldn't send the email just now. Please try again in a minute, or sign in with Google.</p>`); }
  return done(`<p>We've sent a sign-in link to <b>${esc(email)}</b>. Tap it on this phone or computer and you're in.</p><p class="mute">It runs out in 15 minutes. Not there? Check your junk folder.</p>`);
}
async function signInFromLink(url, env) {
  const tok = String(url.searchParams.get("t") || "").replace(/[^a-f0-9]/g, ""), m = tok && await env.DATA.get(`magic:${tok}`, "json");
  if (!m) return page("Link expired", `<h1>That link has run out</h1><p>Sign-in links work once and last 15 minutes. <a href="/signin">Get a new one</a>.</p>`);
  await env.DATA.delete(`magic:${tok}`);
  const prev = await env.DATA.get(`user:${m.email}`, "json"), now = new Date().toISOString(), s = crypto.randomUUID();
  await env.DATA.put(`user:${m.email}`, JSON.stringify({ ...(prev || {}), email: m.email, last: now, visits: (prev?.visits || 0) + 1, first: prev?.first || now, via: prev?.via || "email" }));
  await env.DATA.put(`sess:${s}`, m.email, { expirationTtl: 31536000 });
  return new Response(null, { status: 303, headers: sessionHeaders(s, prev?.name || "", safeNext(m.next || "/"), prev?.picture) });
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

// ---- School run check (school choice saved on the phone only; nothing about kids is stored by us) ----
const schoolPage = async (env) => { const t = TOWNS[R.code]; let tr = null; try { tr = await trafficNear(env, HOME); } catch (e) { tr = null; } return page("School run check", `<p class="mute"><a href="/${R.code}">‹ ${R.code} ${R.place}</a></p>
<h1>🚸 School run check</h1><p>Pick your school once and this page becomes your morning and afternoon check before the school run.</p>
<label>Your school</label><select id="sch" style="width:100%"><option value="">Choose…</option>${SCHOOLS.map(x => `<option>${esc(x)}</option>`).join("")}</select>
<p class="mute">Saved on your phone only. <a href="#" class="useloc">📍 Use my location</a> for weather where you are.</p>
<div id="rep" hidden>
<div class="tiles"><div class="tile"><span class="ico">🌅</span><b id="am">–</b><small>Drop-off weather</small></div>
<div class="tile"><span class="ico">🏫</span><b id="pm">–</b><small>Pick-up weather</small></div>
<div class="tile"><span class="ico">🚸</span><b>8–9:30am</b><small>School zone 40 km/h</small></div>
<div class="tile"><span class="ico">🚸</span><b>2:30–4pm</b><small>School zone 40 km/h</small></div></div>
<p id="tip" class="note"></p>
<h2>On the roads near you</h2>${trafficList(tr, esc)}
<h2>School holidays</h2>${schoolHols()}<p class="mute">Pupil-free days vary by school: check your school's newsletter. <span class="srcw">Source:</span> <a href="https://education.nsw.gov.au/schooling/calendars" rel="noopener">NSW Department of Education</a>.</p>
<h2>Field closures &amp; weekend sport</h2>${wip("Wet-weather field closures and junior sport fixtures. Clubs will be able to post closures here free", R.council.url, R.council.name)}
<h2>Bell times</h2>${wip("Your school's own bell times. Check the school newsletter or website for now")}</div>
<script>
var sel=document.getElementById('sch');try{sel.value=localStorage.getItem('school')||''}catch(e){}
function show(){var v=sel.value;try{v?localStorage.setItem('school',v):localStorage.removeItem('school')}catch(e){}
document.getElementById('rep').hidden=!v;var sn=document.getElementById('sn');if(sn)sn.textContent=v;if(!v)return;
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
<p>${R.code} is built by the community. Suggest an idea or vote for one you like. <b>${GOAL} votes and we build it.</b></p>${msg}
<h2>Ideas from locals</h2><ul class="ideas">${list.map(ideaItem).join("") || '<li class="mute">No ideas yet. Be the first!</li>'}</ul>
<h2>Suggest something</h2><p class="mute">Ideas are checked, then added to the list above for voting. Everything else comes straight to the team.</p>
<form method="post" action="/feedback"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<label>What's it about?</label><select name="kind" style="width:100%"><option>An idea for the site</option><option>Something's wrong or out of date</option><option>Add my club, group or event source</option><option>Just saying g'day</option></select>
<label>Your message *</label><textarea name="msg" rows="5" maxlength="2000" required></textarea>
<div class="optmail"><div class="row"><input name="name" placeholder="Name (optional)" maxlength="60"><input type="email" name="email" placeholder="Email if you'd like a reply (optional)" maxlength="120"></div>${joinNote()}</div><script>${JOIN_JS}</script>
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
  const me = await member(req, env); if (me && !fb.email) fb.email = me;
  mailUs(env, ctx, `${R.code} feedback: ${fb.kind}`, `${fb.kind}\n\n${fb.msg}\n\nFrom: ${fb.name || "(no name)"} ${fb.email || "(no email)"}\n${fb.at}`, fb.email);
  const ck = await joinQuiet(req, env, me ? "" : fb.email, fb.name, "feedback");
  return withCookies(await feedbackPage(env, `<p class="note">Thanks${fb.name ? ", " + esc(fb.name) : ""}! It's on its way to us.${fb.kind.startsWith("An idea") ? " Once it's checked it'll appear in the list for voting." : ""}${joinedMsg(ck)}</p>`), ck);
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
<h2>1. Free for locals, forever</h2><p>The local information on ${R.brand} will always be free. No paywall on it, ever, and no fees to list an event, club, notice or offer. Optional paid extras (personal tools) are there for those who want them, and help keep it running. <b>Community services are never charged for, whatever you pay:</b> Scam watch and digital safety, Kid Zone, alerts, emergency wait times, hard-to-find numbers and NSW Government help stay free for everyone. It's run by <a href="https://maverickdigital.com.ai">Maverick Digital</a> as a free gift to the community.</p>
<h2>2. Nobody pays to be listed</h2><p>Every event, offer and listing is here because it's happening locally, never because someone paid. We don't sell placement, rankings or reviews.</p>
<h2>2a. Advertising, one day</h2><p>Once we reach about 15,000 locals, we'll sell a small number of advertising spots so the site can pay its way. Ads will be clearly labelled, kept separate from listings, selective, fairly priced and never packed in. Advertisers never get your personal details.</p>
<h2>3. We source, we don't spin</h2><p>Information like council details, weather and tides comes from other organisations. We show it as they publish it, name the source, and show how current the source says it is. If a source is out of date or wrong, we'll say so factually. We don't rewrite their information.</p>
<h2>4. Check before you rely on it</h2><p>We work hard to keep things right, but information here can be out of date, incomplete or wrong. Always check the original source for anything important.</p>
<ul><li><b>Emergencies:</b> this site is not an emergency service. Call <a href="tel:000">000</a>.</li>
<li><b>Tides and swell</b> are modelled estimates, not for navigation. Check the Bureau of Meteorology before boating.</li>
<li><b>Fires, floods and roads:</b> follow official sources and emergency services.</li></ul>
<h2>5. What you post</h2><p>When you add an event, offer or feedback, you confirm it's true, local and yours to share, and you let us show it on this site. Everything here is sourced and labelled with where it's from. Things locals post (prices, picks, events) are screened automatically and can be reported, and come down if they're wrong. We may edit for length, decline or remove anything, including anything misleading, hateful, illegal, spammy or unsafe.</p>
<h2>6. Birthday deals and other offers</h2><p>Offers are made by the businesses, not us. Each business sets its own conditions and decides whether to honour them. Saying &ldquo;Maverick&rdquo; is just how you let them know where you found the deal.</p>
<h2>7. Links to other sites</h2><p>We link to lots of useful websites. They're not ours and we're not responsible for them. If something there charges, that's between you and them.</p>
<h2>8. Fair play</h2><p>Please don't misuse the site, scrape it in bulk, try to break it or post on someone else's behalf without permission.</p>
<h2>9. The legal bit</h2><p>The site is provided free and as is. To the extent the law allows, we're not liable for loss from using it. Nothing here limits your rights under the Australian Consumer Law. These terms are governed by the laws of New South Wales.</p>
<h2>10. Changes</h2><p>If we change this charter, we'll update the date at the top. Rule 1 won't change.</p>
<p>Questions? <a href="/feedback">Talk to us</a>. <i>Maverick Digital</i></p>`);

const privacy = () => page("Privacy policy", `<p class="mute"><a href="/">${R.brand}</a></p><h1>Privacy policy</h1>
<p class="mute">Plain English. Last updated ${UPDATED}.</p>
<p>We collect as little as we can, we never sell it, and we follow the Australian Privacy Principles.</p>
<h2>Kept on your phone, not with us</h2><p>If you tap to fine-tune your weather to your exact location, it's rounded to about a kilometre and saved on your phone. It's used for your weather and to find fuel near you, never stored by us, and you can reset it any time. Your postcode, which sections you show or hide, your school and your birthday (day and month only) are saved in your own browser. If you sign in, your page settings (what you pin, show or hide, your stars, the events you like, saved searches and bin night) are also saved to your account, so they follow you to any phone. Your location, school, birthday and friends&rsquo; clocks stay on your phone only. We never see them. Clear your browser data and they're gone.</p>
<h2>What we do keep</h2><ul>
<li><b>Weekly email or fridge sign-up:</b> your email, first name if you give it, postcode and that you agreed to the email.</li>
<li><b>Events and birthday offers:</b> what you submit, plus a contact email so we can check details. The email is never shown publicly.</li>
<li><b>Feedback:</b> your message, and your name and email only if you add them.</li>
<li><b>Fridge photo:</b> if you snap your fridge, the photo goes to Cloudflare&rsquo;s AI just long enough to spot the food, then it&rsquo;s gone. We never store it.</li>
<li><b>Kid Zone activity:</b> visits, answers, scores and time spent in Kid Zone are saved only in that device's browser, so grown-ups can see them at /kids/log. They never come to us.</li>
<li><b>Kid Zone secret word:</b> if a grown-up sets one, we keep only a scrambled version of it on their account (never the word itself), plus a count of wrong guesses so they can see them. Remove it any time.</li>
<li><b>Signing in:</b> your name, email and, if you use Google, your Google profile photo, plus, if you sign in with email, the public photo and first name from your <a href="https://gravatar.com" rel="noopener">Gravatar</a> profile if you have one (only what you've already made public there), plus when you first and last signed in. Google only tells us those basics, never your password. A few small cookies keep you signed in and remember your settings on that phone for up to a year. Sign out any time.</li></ul>
<p>Anything personal (like kids at home, a dog, favourite music or family birthdays) is optional, only used to personalise your page, and you can delete it any time.</p>
<h2>How we use it</h2><p>To run the site, send the email you asked for, check submissions and reply to you. Your details may be used to tell you about Maverick Digital in the weekly email, which you can stop any time. We never sell, rent or trade your details, and when we carry ads one day, advertisers will never get your personal details or use them to target you.</p>
<h2>Who else is involved</h2><ul>
<li><b>Cloudflare</b> hosts the site, stores our data and sends our emails. Like any website host, it processes basic visit data such as your internet address.</li>
<li><b>Open-Meteo</b> provides weather and tides. Your browser asks it for ${R.place}'s forecast, so it sees a request from your device, but no personal details from us.</li>
<li><b>ActiveCampaign</b> is the email service your sign-up details (email, first name, postcode) are sent to, so we can send the weekly email you asked for.</li>
<li><b>Stripe</b> processes payments for paid members. Your card details go straight to Stripe; we never see or store them.</li></ul>
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
<p><img class="tav" src="/team/jimmy-joel.svg" alt="" width="24" height="24">No idea what the kids are saying? <b>Jimmy Joel</b> has you covered. Type a word they used, or flip it and find out how they'd say what you mean.</p>
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
<span class="src"><span class="srcw">Source:</span> ${n.link ? `<a href="${esc(n.link)}" rel="nofollow noopener">${esc(n.home)}</a>` : esc(n.home)}</span></li>`;
// Funeral directors publish notices on their own sites. We read those pages a few times a day, pull out
// the names and dates with Cloudflare's AI, and keep only names that appear word-for-word on the page.
async function refreshObits(env) {
  const old = await env.DATA.get("obits", "json");
  if (old && Date.now() - new Date(old.asof) < 6 * 3600e3) return;
  const items = [];
  for (const f of R.funerals || []) {
    try {
      // Funeral homes on WordPress publish their notices as data (JSON): cleaner than reading the page, and each notice keeps its own link.
      const J = f.json ? await (await fetch(f.json, { headers: UA })).json().catch(() => null) : null;
      const html = Array.isArray(J) ? J.map(e => `<p>${e.title?.rendered || ""} (published ${String(e.date || "").slice(0, 10)}): ${String(e.content?.rendered || "").slice(0, 700)}</p>`).join("") : await (await fetch(f.url, { headers: UA })).text();
      const links = Array.isArray(J) ? J.map(e => [dec(String(e.title?.rendered || "").replace(/<[^>]+>/g, "")), e.link]) : [];
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
        const own = links.find(([t, u]) => u && /^https:\/\//.test(u) && t.toLowerCase().includes(name.toLowerCase().split(" ").pop()));
        items.push({ name, passed: isDate(n.passed), service: isDate(n.service), where: n.where ? String(n.where).slice(0, 80) : null, home: f.name, link: own ? own[1] : f.url });
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
const obitItem = n => `<li><b>${esc(n.name)}</b><br><span class="mute">${n.passed ? `Passed ${esc(fmtDate(n.passed))}` : ""}${n.passed && n.service ? " · " : ""}${n.service ? `Service ${esc(fmtDate(n.service))}${n.where ? `, ${esc(n.where)}` : ""}` : ""}</span><br><span class="src"><span class="srcw">Source:</span> <a href="${esc(n.link)}" rel="noopener">${esc(n.home)}</a></span></li>`;
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
  sport: "sport footy soccer netball cricket kids sport field rugby", holidays: "school holidays kids school family", beaches: "surf surfing waves board cam beach beaches swim swimming patrol dog" };
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
      { role: "system", content: `You set up a free local info page for ${R.place}, Australia. Sections (id = name): ${list}. "tools" holds: dinner ideas from your fridge, birthday deals, Gen Alpha slang interpreter, death notices, school run check. Reply with ONLY JSON: {"order": [every section id, most useful for this person first, "today" first unless they say otherwise], "hide": [ids they clearly don't want], "name": "their first name if they said it, else empty", "say": "one warm, casual Aussie sentence under 25 words telling them what you set up"}` },
      { role: "user", content: text }] });
    const j = JSON.parse(String(r.response || "").match(/\{[\s\S]*\}/)[0]), valid = SECTIONS.map(x => x[0]);
    const order = [...new Set((j.order || []).filter(id => valid.includes(id)))]; valid.forEach(id => order.includes(id) || order.push(id));
    return Response.json({ order, hide: (j.hide || []).filter(id => valid.includes(id) && id !== "today"),
      name: String(j.name || "").replace(/[^\p{L} '-]/gu, "").slice(0, 30), say: String(j.say || guess.say).slice(0, 200) });
  } catch (e) { return Response.json(guess); }
}
const mePage = (name = "") => page(`My ${R.code}`, `<div class="me"><h1>⚙️ ${name ? esc(name) + "&rsquo;s" : "My"} ${R.code}</h1>
<p class="gath"><b>Your local daily news, your way.</b> Tell Mav, or tap below. Everything here only changes your own page.</p>
<div class="mav"><p><b>G'day, I'm Mav.</b> I know ${R.short} inside out. Tell me about your day and what you care about, and I'll set up your page.</p>
<textarea id="say" rows="3" maxlength="500" placeholder="e.g. ${esc(R.mavExample)}"></textarea>
<div class="chips" id="ex"><label>I fish and surf, pin tides and beaches</label><label>Two kids, school run, only free events</label><label>I'm a Libra, Year of the Dragon</label><label>Add Jimmy in London to my friends</label><label>Bins go out Tuesday night</label></div>
<p><button type="button" id="go">✨ Set me up</button> <button type="button" id="mic" class="ghost">🎤 Talk</button></p><p id="reply" class="note" hidden></p></div>
<label for="nm">What should we call you?</label><input id="nm" maxlength="30" placeholder="First name" style="width:100%">
<h2>☀️ Your morning</h2><p class="mute">Pinned sections open at the top of your page every day, in this order.</p><ul id="pins" class="setlist"></ul>
<h2>📰 Everything else</h2><p class="mute">These sit behind the buttons on your page. Tap 📌 to pin one, or switch off what you never read.</p><ul id="list" class="setlist"></ul>
<h2 id="friends">📞 Friends&rsquo; clocks</h2><p class="mute">Family and friends in other time zones, with a nudge on when to call (and when not to). Kept on this phone only.</p>
<ul id="frl" class="frs"></ul>
<form id="fra" class="row"><input id="frn" maxlength="24" placeholder="First name" aria-label="Friend's first name"><input id="frz" list="tzl" placeholder="City, e.g. London" aria-label="Their city or time zone"><datalist id="tzl"></datalist><button>Add</button></form><p id="frm" class="mute"></p>
<h2 id="likes-h">🎯 What you like doing</h2><p class="mute">What&rsquo;s on shows these first, marked ⭐ For you. Community events show just these, with a one-tap Show all.</p>
<div id="likes" class="pins">${LIKES.map(l => `<label><input type="checkbox" value="${l}"> ${{ free: "🆓 Free", kids: "🧒 Kids", music: "🎸 Music", markets: "🧺 Markets", sport: "🏉 Sport", food: "🍽️ Food & drink", arts: "🎨 Arts", outdoors: "🌿 Outdoors", trivia: "🧠 Trivia", comedy: "😂 Comedy", deals: "🎟️ Members deals & specials" }[l]}</label>`).join("")}</div>
<h2>✨ Your stars</h2><div class="row">
<label>Western<br><select id="zw"><option value="">Pick…</option>${WEST.map((x, k) => `<option value="${k}">${x[0]} ${x[1]}</option>`).join("")}</select></label>
<label>Vedic (Indian)<br><select id="zv"><option value="">Pick…</option>${VEDIC.map((x, k) => `<option value="${k}">${x[0]} ${x[1]}</option>`).join("")}</select></label>
<label>Chinese<br><select id="ze"><option value="">Pick…</option>${EAST.map((x, k) => `<option value="${k}">${x[0]} ${x[1]}</option>`).join("")}</select></label></div>
<h2>⛅ Weather spot</h2><p class="mute"><span id="wxnow"></span> <a href="#" id="wxh">📍 Use where I am</a> · <a href="#" id="wxr">Reset</a></p>
<select id="wxt" aria-label="Weather for"><option value="">Or pick a town…</option>${Object.entries(TOWNS).filter(([, v]) => v.live).map(([k, v]) => `<option value="${k}">${esc(v.name)} ${k}</option>`).join("")}</select>
<h2>🔎 Saved searches</h2><ul id="sq" class="setlist"></ul>
<h2>More about you</h2>
<a class="card" href="/home">🗑️ <b>Bin night</b> <span id="mbin"></span> →</a>
<a class="card" href="/school">🚸 <b>School run</b> <span id="msch"></span> →</a>
<a class="card" href="/birthday">🎂 <b>Birthday deals</b> <span id="mbd"></span> →</a>
<div class="note">🔔 <b>Alerts on your phone</b><br><button type="button" class="pushbtn" data-topic="alerts">Fires &amp; weather</button> ${R.fields ? `<button type="button" class="pushbtn" data-topic="fields">Field closures</button>` : ""}<br><small class="mute pushmsg"></small></div>
<h2>Mav&rsquo;s rules</h2><ul class="rules">
<li>Mav only changes <b>your own page</b>. He never adds, edits, deletes or posts anything on ${R.code}, and never changes what anyone else sees.</li>
<li>We gather, we don't judge. Mav has no opinions on news, people, businesses or council.</li>
<li>Mav never asks for personal details. A first name, your bin night and your stars are plenty.</li>
<li>Signed in, your settings follow you to any phone. Your location, birthday, school and friends&rsquo; clocks stay on this phone only.</li></ul>
<p><a class="card" href="/${R.code}">👀 <b>See my ${R.code}</b> →</a></p>
<p class="mute">✓ Signed in. <a href="#" id="reset">Start again</a> · <a href="/signout">Sign out</a></p></div>
<script>addEventListener("DOMContentLoaded",function(){${ME_JS}})<\/script>`, R.code);

// ---- Live sources: fetched by the Worker (every 30 min via cron, or on demand), cached in KV, always shown with "current as of" + source link ----
const asOf = iso => new Date(iso).toLocaleString("en-AU", { timeZone: "Australia/Sydney", hour: "numeric", minute: "2-digit", weekday: "short", day: "numeric", month: "short" });
// Freshness light on every source: green = updated in the last week, amber = in the last 3 months, red = older.
const fresh = iso => { if (!iso) return ""; const d = (Date.now() - new Date(iso)) / 864e5, k = d <= 7 ? "g" : d <= 92 ? "a" : "r";
  return `<span class="fresh ${k}" title="${k === "g" ? "Updated in the last week" : k === "a" ? "Updated in the last 3 months" : "More than 3 months old"}" aria-label="${k === "g" ? "Fresh" : k === "a" ? "A bit old" : "Old"}"></span>`; };
const srcLine = (name, url, iso, note = "") => `<p class="src">${fresh(iso)}<span class="srcw">Source:</span> <a href="${url}" rel="noopener">${name}</a>.${iso ? ` Updated ${esc(asOf(iso))}.` : ""}${note ? " " + note : ""}</p>`;
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

// ---- The good, the bad and the ugly: the free AI sorts each headline by what it's about, never by our opinion.
// good = community, achievements, events, nature, good outcomes; bad = crime, crashes, emergencies, deaths, court;
// ugly = politics and money (council, government, elections, budgets, prices, rates, business finance).
const TONE_ASK = `Sort each news headline into one group. Reply with ONLY a JSON array of letters, one per headline, in order.
G = good news: community, achievements, events, sport wins, nature, health or good outcomes.
B = bad news: crime, court, crashes, fires, floods, emergencies, deaths, injuries.
U = politics or money: council, government, elections, MPs, budgets, prices, rates, tax, business finance, property market.`;
async function toneTag(env, list) {
  if (!env?.AI || !list.length) return;
  const q = list.map((n, i) => `${i + 1}. ${n.title}`).join("\n");
  const r = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", { max_tokens: 120, messages: [{ role: "system", content: TONE_ASK }, { role: "user", content: q }] });
  const arr = JSON.parse(String(r?.response || "").match(/\[[\s\S]*\]/)?.[0] || "[]");
  list.forEach((n, i) => { const t = String(arr[i] || "").toUpperCase(); n.tone = t === "G" ? "good" : t === "B" ? "bad" : t === "U" ? "ugly" : ""; });
}

// ---- National outlets: when the big papers and broadcasters mention one of our towns, it goes in the news too.
// Headline and link only (their words stay on their site). Paywalled outlets are clearly labelled.
const NATIONAL = [
  { name: "ABC News", feed: "https://www.abc.net.au/news/feed/51120/rss.xml" },
  { name: "SBS News", feed: "https://www.sbs.com.au/news/feed" },
  { name: "The Guardian", feed: "https://www.theguardian.com/australia-news/rss" },
  { name: "news.com.au", feed: "https://www.news.com.au/content-feeds/latest-news-national/" },
  { name: "The Sydney Morning Herald", feed: "https://www.smh.com.au/rss/feed.xml", gated: "May need a subscription" },
  { name: "The Daily Telegraph", feed: "https://www.dailytelegraph.com.au/news/nsw/rss", gated: "Subscribers only" },
];
// Town names that are also everyday words or other places would match the wrong stories, so they're left out.
const NAT_SKIP = /^(federal|central|northern beaches|north|south|east|west|beaches|harbour|heads|point|lake|valley|hills|park|island)$/i;
const natRe = () => { const ph = [...new Set([R.place, ...Object.values(TOWNS).filter(t => t.live).flatMap(t => String(t.name).split(/\s*(?:&|\/|,| and )\s*/))]
  .map(x => x.trim()).filter(x => x.length >= 4 && !NAT_SKIP.test(x)))];
  return ph.length ? new RegExp(`\\b(${ph.map(x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`) : null; };
// Paywalled sites, labelled wherever their stories show up (hard paywall first, then metered).
const GATED = [[/(^|\.)(dailytelegraph|theaustralian|couriermail|heraldsun|goldcoastbulletin|afr)\.com(\.au)?$/, "Subscribers only"],
  [/(^|\.)(smh|theage|portnews|manningrivertimes|armidaleexpress|northerndailyleader)\.(com|net)\.au$/, "May need a subscription"]];
const gateOf = host => (GATED.find(([re]) => re.test(host)) || [])[1] || "";
// Brave Search news (optional: set a BRAVE_KEY secret). Catches mentions anywhere, not just the feeds above. Checked every 3 hours.
async function braveNews(env, re) {
  if (!env?.BRAVE_KEY) return [];
  const k = "brave:news", hit = await env.DATA.get(k, "json"); if (hit) return hit;
  const words = String(re.source).replace(/^\\b\(|\)\\b$/g, "").split("|").slice(0, 6), q = words.map(w => `"${w.replace(/\\/g, "")}"`).join(" OR ");
  let out = [];
  try { const r = await fetch(`https://api.search.brave.com/res/v1/news/search?q=${encodeURIComponent(q)}&country=AU&search_lang=en&freshness=pd&count=20`, { headers: { accept: "application/json", "X-Subscription-Token": env.BRAVE_KEY } });
    if (r.ok) out = ((await r.json()).results || []).filter(i => re.test(i.title + " " + (i.description || ""))).map(i => { const host = (i.meta_url?.hostname || (() => { try { return new URL(i.url).hostname; } catch (e) { return ""; } })()).replace(/^www\./, "");
      return { title: String(i.title || "").replace(/<[^>]+>/g, ""), link: i.url, date: i.page_age || null, src: i.meta_url?.netloc || host, gated: gateOf(host), national: 1 }; }).slice(0, 8); } catch (e) { out = []; }
  await env.DATA.put(k, JSON.stringify(out), { expirationTtl: 3 * 3600 });
  return out;
}
async function nationalNews(env) {
  const re = natRe(); if (!re) return [];
  const out = [];
  try { out.push(...await braveNews(env, re)); } catch (e) {}
  await Promise.all(NATIONAL.map(async src => { try {
    const r = await fetch(src.feed, { headers: UA, cf: { cacheTtl: 900 } }); if (!r.ok) return;
    for (const i of rss(await r.text())) if (re.test(i.title + " " + i.desc)) out.push({ title: i.title, link: i.link, date: i.date, src: src.name, gated: src.gated || "", national: 1 });
  } catch (e) {} }));
  return out.slice(0, 8);
}

const SOURCES = {
  news: { get name() { return R.news.map(n => n.name).join(", "); }, get url() { return R.news[0].url; }, get: async (env) => {
    const all = [];
    for (const src of R.news) { try {
      const items = rss(await (await fetch(src.feed, { headers: UA })).text())
        .filter(i => (!src.skip || !src.skip.test(i.title)) && (!src.cat || src.cat.test(i.cats)) && (!src.need || src.need.test(i.title + " " + i.desc)));
      all.push(...items.slice(0, 8).map(i => ({ title: i.title, link: i.link, date: i.date, src: src.name, desc: cut(i.desc, 240), img: i.img, gated: (() => { try { return gateOf(new URL(i.link).hostname.replace(/^www\./, "")); } catch (e) { return ""; } })() })));
    } catch (e) {} }
    try { all.push(...await nationalNews(env)); } catch (e) {}
    if (!all.length) throw new Error("no news");
    const seen = new Set(), list = all.sort((x, y) => new Date(y.date || 0) - new Date(x.date || 0)).filter(i => { const k = i.title.toLowerCase().replace(/\W+/g, ""); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 14);
    try { await toneTag(env, list); } catch (e) {}
    return list; } },
  fires: { name: "NSW Rural Fire Service, Fires Near Me", url: "https://www.rfs.nsw.gov.au/fire-information/fires-near-me", get: async () => {
    const j = await (await fetch("https://www.rfs.nsw.gov.au/feeds/majorIncidents.json", { headers: UA })).json();
    return (j.features || []).map(f => { const p = f.properties || {}, pt = firstPoint(f.geometry), d = p.description || "", g = k => (d.match(new RegExp(k + ":\\s*([^<]*)")) || [])[1]?.trim() || "";
      return { title: (p.title || "").trim(), level: p.category || g("ALERT LEVEL"), where: g("LOCATION"), status: g("STATUS"), size: g("SIZE"), link: p.link, pt, km: pt ? Math.round(km(HOME, pt)) : 999 }; })
      .filter(f => f.km <= 100).sort((a, b) => a.km - b.km).slice(0, 8); } },
  fdr: { name: "NSW Rural Fire Service, Fire Danger Ratings", url: "https://www.rfs.nsw.gov.au/fire-information/fdr-and-tobans", get: async () => {
    const x = await (await fetch("https://www.rfs.nsw.gov.au/feeds/fdrToban.xml", { headers: UA })).text(), want = R.council.name.replace(/\s+(City\s+|Shire\s+)?Council$/i, "").toLowerCase();
    const tag = (d, t) => ((d.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)) || [])[1] || "").replace(/<!\[CDATA\[|\]\]>/g, "").trim();
    const d = (x.match(/<District>[\s\S]*?<\/District>/g) || []).find(d => tag(d, "Councils").toLowerCase().includes(want)); if (!d) throw new Error("no district");
    return [{ district: tag(d, "Name"), today: tag(d, "DangerLevelToday"), tomorrow: tag(d, "DangerLevelTomorrow"), banToday: /^yes/i.test(tag(d, "FireBanToday")), banTomorrow: /^yes/i.test(tag(d, "FireBanTomorrow")) }]; } },
  warnings: { name: "Bureau of Meteorology, NSW warnings", url: "https://www.bom.gov.au/nsw/warnings/", get: async () =>
    rss(await (await fetch("https://www.bom.gov.au/fwo/IDZ00054.warnings_nsw.xml", { headers: UA })).text()).filter(i => R.warnRe.test(i.title)).slice(0, 6) },
  babynames: { name: "NSW Registry of Births, Deaths and Marriages (Data.NSW)", url: "https://www.nsw.gov.au/family-and-relationships/births/popular-baby-names", get: async () => {
    let csvUrl = "https://data.nsw.gov.au/data/dataset/a677cbe2-91e1-4e45-b771-08830d3d9e41/resource/2adcb228-9101-4c95-a786-b3216539b4a2/download/popular_baby_names_1952_to_2025.csv";
    try { // the file name changes each year, so ask the catalogue for the current CSV first
      const j = await (await fetch("https://data.nsw.gov.au/data/api/3/action/package_show?id=popular-baby-names-from-1952", { headers: UA })).json();
      const r = (j.result?.resources || []).filter(r => /csv/i.test(r.format || r.url)).sort((a, b) => String(b.last_modified || b.created).localeCompare(String(a.last_modified || a.created)))[0];
      if (r?.url) csvUrl = r.url;
    } catch (e) {}
    const lines = (await (await fetch(csvUrl, { headers: UA })).text()).split(/\r?\n/).filter(Boolean);
    const head = lines.shift().split(",").map(h => h.replace(/"/g, "").trim().toLowerCase()), col = k => head.findIndex(h => h.startsWith(k));
    const [iR, iN, iC, iG, iY] = ["rank", "name", "number", "gender", "year"].map(col);
    const rows = lines.map(l => l.split(",").map(c => c.replace(/"/g, "").trim())).map(c => ({ rank: +c[iR], name: c[iN], n: +c[iC] || 0, g: /^(m|b)/i.test(c[iG]) ? "boys" : "girls", y: +c[iY] })).filter(r => r.name && r.y && r.rank);
    const Y = Math.max(...rows.map(r => r.y)), out = { year: Y };
    for (const g of ["boys", "girls"]) {
      const now = rows.filter(r => r.y === Y && r.g === g).sort((a, b) => a.rank - b.rank), prev = new Map(rows.filter(r => r.y === Y - 1 && r.g === g).map(r => [r.name.toLowerCase(), r.rank]));
      const withPrev = now.map(r => ({ name: r.name, rank: r.rank, n: r.n, prev: prev.get(r.name.toLowerCase()) || 0 }));
      out[g] = withPrev.slice(0, 10);
      out[g + "Climb"] = withPrev.filter(r => r.prev).sort((a, b) => (b.prev - b.rank) - (a.prev - a.rank))[0] || null;
      out[g + "New"] = withPrev.filter(r => !r.prev).sort((a, b) => a.rank - b.rank)[0] || null;
    }
    if (!out.boys.length || !out.girls.length) throw new Error("no names");
    // Number one each decade, by every baby given the name in that decade (best average rank if counts are missing).
    const Y0 = Math.min(...rows.map(r => r.y)), hasN = rows.some(r => r.n); out.decades = [];
    for (let dd = Math.floor(Y0 / 10) * 10; dd <= Y; dd += 10) { const x = { d: dd, from: Math.max(dd, Y0), to: Math.min(dd + 9, Y) };
      for (const g of ["boys", "girls"]) { const t = {}; for (const r of rows) if (r.g === g && r.y >= x.from && r.y <= x.to) t[r.name] = (t[r.name] || 0) + (hasN ? r.n : 101 - r.rank);
        x[g === "boys" ? "boy" : "girl"] = Object.entries(t).sort((a, b) => b[1] - a[1])[0]?.[0] || ""; }
      out.decades.push(x); }
    // Every name's ranks, saved on its own so pages never load it: name -> [display, "year:rank,..." boys, girls].
    const names = {}; for (const r of rows.slice().sort((a, b) => a.y - b.y)) { const k = r.name.toLowerCase(), e = names[k] || (names[k] = [r.name, "", ""]), i = r.g === "boys" ? 1 : 2;
      e[i] += (e[i] ? "," : "") + r.y + ":" + r.rank; }
    out._side = { "names:idx": { from: Y0, to: Y, names } };
    return out; } },
  neo: { name: "NASA's Jet Propulsion Laboratory Center for Near-Earth Object Studies", url: "https://cneos.jpl.nasa.gov/ca/", get: async () => {
    // Asteroids passing within 0.05 au (about 20 times the Moon's distance) in the next 14 days.
    const j = await (await fetch("https://ssd-api.jpl.nasa.gov/cad.api?date-min=now&date-max=%2B14&dist-max=0.05&sort=dist", { headers: UA })).json();
    const f = j.fields || [], at = k => f.indexOf(k);
    return (j.data || []).map(r => { const au = +r[at("dist")], h = +r[at("h")], cd = r[at("cd")] || "";
      const d = new Date(cd.replace(/-(\w{3})-/, " $1 ") + " UTC");
      const lo = Math.round(1329 / Math.sqrt(0.25) * 10 ** (-h / 5) * 1000), hi = Math.round(1329 / Math.sqrt(0.05) * 10 ** (-h / 5) * 1000);
      return { des: r[at("des")], when: isNaN(d) ? "" : d.toISOString(), ld: au * 389.17, km: Math.round(au * 149597870.7), kms: +(+r[at("v_rel")]).toFixed(1), sizeLo: lo, sizeHi: hi,
        major: au <= 0.00257 || h <= 22 };
    }).filter(a => a.when).slice(0, 12); } },
  holidays: { name: "Nager.Date public holidays", url: "https://date.nager.at", get: async () => {
    const y = new Date().getFullYear(), all = [];
    for (const yr of [y, y + 1]) all.push(...await (await fetch(`https://date.nager.at/api/v3/PublicHolidays/${yr}/AU`, { headers: UA })).json());
    const t = todayISO(); return all.filter(h => h.date >= t && (!h.counties || h.counties.includes("AU-NSW"))).slice(0, 4).map(h => ({ date: h.date, name: h.localName })); } },
};
async function refreshSource(env, key) {
  const S = SOURCES[key];
  try { const items = await S.get(env); if (items && items._side) { for (const [k, val] of Object.entries(items._side)) await env.DATA.put(k, JSON.stringify(val)); delete items._side; } const v = { items, asof: new Date().toISOString(), ok: true }; await env.DATA.put("src:" + key, JSON.stringify(v)); return v; }
  catch (e) { const old = await env.DATA.get("src:" + key, "json"); return old ? { ...old, stale: true } : { items: [], ok: false }; }
}
async function getSource(env, ctx, key) {
  const v = await env.DATA.get("src:" + key, "json");
  if (!v) return refreshSource(env, key);
  // The 30-minute schedule keeps sources fresh; page views never do the heavy lifting.
  return v;
}
// ---- Where to fish & what's biting. Spots and seasons from NSW DPIRD's GoFishing Coffs Coast guide, coffscoast.com.au,
// the marine park user guides and local fishing guides. Rules and links straight from NSW DPIRD.
const FISH_SEASON = [["Snapper", [1,2,3,4,5,6,7,8,9,10,11,12], [4,5,6,7,8,9,10]], ["Pearl perch", [1,2,3,4,5,6,7,8,9,10,11,12]], ["Spanish mackerel", [2,3,4,5]],
  ["Longtail tuna & cobia", [2,3,4,5]], ["Sand whiting", [11,12,1,2,3,4]], ["Tailor, whiting & flathead", [9,10,11,3,4,5]]];
// Rough shore-fishing spot locations, for the 20 km "near you" filter
const FISH_AT = { "Coffs Harbour Jetty": [-30.3043, 153.1447], "Northern Breakwall (Muttonbird Island)": [-30.305, 153.152], "Corambirra Point & Gallows Beach": [-30.314, 153.144],
  "Park Beach": [-30.289, 153.143], "Coffs Creek (near the mouth)": [-30.298, 153.142], "Boambee Creek Reserve": [-30.353, 153.11], "Bonville Creek, Sawtell": [-30.38, 153.1],
  "Moonee Creek & Beach": [-30.208, 153.16], "Woolgoolga Creek & headlands": [-30.111, 153.201], "Corindi River & Red Rock": [-29.983, 153.229],
  "Urunga Boardwalk (breakwall end)": [-30.497, 153.028], "Lido breakwall, Urunga": [-30.496, 153.023], "Kalang River rock wall": [-30.499, 153.025], "Newry Island bridge (Kalang River)": [-30.51, 153.01],
  "Hungry Head": [-30.52, 153.035], "Wenonah Headland": [-30.495, 153.035], "North Beach, Mylestom": [-30.463, 153.045], "Bellinger River": [-30.47, 153.0],
  "Brunswick River rock walls": [-28.538, 153.56], "Brunswick River Boat Harbour": [-28.537, 153.553], "Tallow Beach": [-28.665, 153.623], "Tyagarah Beach (south end)": [-28.605, 153.595],
  "Tweed River mouth rock walls": [-28.165, 153.56], "Boyds Bay Bridge, Tweed Heads": [-28.191, 153.537], "Chinderah, Tweed River": [-28.235, 153.56], "Cudgen Creek rock wall, Kingscliff": [-28.256, 153.587],
  "Cudgen Creek, Kingscliff": [-28.262, 153.578], "Fingal Head": [-28.2, 153.573], "Tweed Coast surf beaches": [-28.29, 153.58], "Tweed River": [-28.22, 153.54],
  "Harrington river wall": [-31.87, 152.7], "Manning Point spur wall": [-31.893, 152.668], "Crowdy Boat Harbour": [-31.838, 152.741], "Harrington Beach": [-31.865, 152.708], "Crowdy Beach": [-31.8, 152.75],
  "Harrington estuary": [-31.875, 152.69], "Lower Manning River sand flats": [-31.89, 152.65], "Lansdowne River": [-31.785, 152.54],
  "Southern Breakwall, Hastings River": [-31.428, 152.918], "Settlement Point": [-31.415, 152.895], "Limeburners Creek": [-31.38, 152.92], "Camden Haven River (lower estuary)": [-31.64, 152.83],
  "Lake Cathie": [-31.55, 152.855], "Town Beach to Lighthouse Beach": [-31.45, 152.93], "Queens Head": [-31.65, 152.84], "Perpendicular Point": [-31.644, 152.838], "Hastings River (upper reaches)": [-31.42, 152.75],
  "Dumaresq Dam": [-30.46, 151.61], "Malpas Dam (near Guyra)": [-30.27, 151.56] };
function fishBlock(t = HOME) {
  const F = R.fish; if (!F) return "";
  const m = +todayISO().slice(5, 7), mn = new Date(todayISO() + "T00:00:00").toLocaleDateString("en-AU", { month: "long" });
  const biting = FISH_SEASON.filter(x => x[1].includes(m)).map(([n, , best]) => `<li>🐟 <b>${n}</b>${best && best.includes(m) ? " <span class=\"fl ok\">peak</span>" : ""}</li>`).join("");
  const map = q => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q + ", " + R.place + " NSW")}`;
  // "What are you hoping to catch today?": every fish the local spots are known for, A to Z
  const spKey = s => String(s || "").toLowerCase().replace(/\(.*?\)/g, "").split(/,|;|\band\b|\bsometimes\b/).map(x => x.trim()).filter(x => x.length > 2);
  const catchList = [...new Set(F.spots.flatMap(x => spKey(x[2])))].sort();
  const inSeason = FISH_SEASON.map(([n, months, best]) => [n.toLowerCase(), months.includes(m), !!(best && best.includes(m))]);
  return `${catchList.length ? `<div class="wcatch"><h3>🎣 What are you hoping to catch today?</h3><div class="pills" id="catchp"><button type="button" data-c="" class="on">Anything</button>${catchList.map(c => `<button type="button" data-c="${esc(c)}">${esc(c[0].toUpperCase() + c.slice(1))}</button>`).join("")}</div><p id="catchmsg" class="note" hidden></p></div>` : ""}
<h3>🎣 What's biting in ${esc(mn)}</h3><ul class="fls">${biting}</ul>${m >= 5 && m <= 8 ? `<p class="mute">Aussie bass and estuary perch: catch and release only until the end of August.</p>` : ""}
<p class="src">Seasons: <span class="srcw">Source:</span> <a href="https://www.dpird.nsw.gov.au/__data/assets/pdf_file/0010/1276660/16610-GoFishingGuide_CoffsCoastWeb-2024.pdf" rel="noopener">NSW Department of Primary Industries and Regional Development GoFishing guide (Coffs Coast)</a>${R.code === "2481" ? ", the nearest official guide" : ""} and <a href="https://www.coffscoast.com.au/article/fishing-on-the-coffs-coast/" rel="noopener">Coffs Coast tourism</a>.</p>
<h3>📍 Where to fish within 20 km</h3><ul class="fls" id="fishnear">${F.spots.map(([n, ty, sp, note]) => `<li data-sp="${esc(spKey(sp).join("|"))}"${FISH_AT[n] ? ` data-at="${FISH_AT[n].join(",")}"` : ""}><b>${esc(n)}</b> <span class="mute">${esc(ty)}</span><span class="fkm mute"></span>${sp ? `<br>Known for: ${esc(sp)}` : ""}${note ? `<br><small>⚠️ ${esc(note)}</small>` : ""}<br><a href="${map(n)}" rel="noopener">🧭 Directions</a></li>`).join("")}</ul><p id="fishnone" class="mute" hidden>No listed shore spots within 20 km of you.</p><details id="fishfar" hidden><summary>Further than 20 km</summary><ul class="fls"></ul></details>
<script>(function(){var T=[${t.lat},${t.lon}],L=null;try{L=JSON.parse(localStorage.getItem('loc'))}catch(e){}var km=function(a,b){var r=Math.PI/180,x=Math.sin((b[0]-a[0])*r/2),y=Math.sin((b[1]-a[1])*r/2);return 12742*Math.asin(Math.sqrt(x*x+Math.cos(a[0]*r)*Math.cos(b[0]*r)*y*y))};
var H=L&&km(L,T)<=30?L:T,U=document.getElementById('fishnear'),F=document.getElementById('fishfar'),FL=F.querySelector('ul'),li=[].slice.call(U.children);li.forEach(function(x){var a=x.dataset.at;x._d=a?km(H,a.split(',').map(Number)):0;if(a)x.querySelector('.fkm').textContent=' · '+x._d.toFixed(1)+' km'});
li.sort(function(a,b){return a._d-b._d}).forEach(function(x){(x._d>20?FL:U).appendChild(x)});if(!U.children.length)document.getElementById('fishnone').hidden=false;if(FL.children.length)F.hidden=false;
var P=document.getElementById('catchp'),M=document.getElementById('catchmsg'),S=${JSON.stringify(inSeason)};if(!P)return;
P.onclick=function(ev){var b=ev.target.closest('button');if(!b)return;[].forEach.call(P.children,function(x){x.classList.toggle('on',x===b)});var c=b.dataset.c,n=0,near=0;
li.forEach(function(x){var ok=!c||(x.dataset.sp||'').split('|').some(function(y){return y.indexOf(c)>-1||c.indexOf(y)>-1});x.hidden=!ok;if(ok){n++;if(x._d<=20)near++}});
F.hidden=!c?!FL.children.length:![].some.call(FL.children,function(x){return !x.hidden});if(c&&near==0&&n)F.open=true;
if(!c){M.hidden=true;return}var w=c.split(' ').pop(),z=S.filter(function(s){return s[0].indexOf(w)>-1})[0];
M.hidden=false;M.innerHTML=(n?'📍 <b>'+n+' spot'+(n>1?'s':'')+'</b> known for '+c+', closest first.':'No listed spots are known for '+c+' yet. Ask at the local tackle shop.')+(z?(z[2]?' 🔥 It&rsquo;s peak season right now.':z[1]?' 🐟 In season now.':' 🙃 Not really in season this month, so it could be a slow day.'):'');
document.getElementById('fishnear').scrollIntoView({behavior:'smooth',block:'nearest'})}})();</script>
${F.note ? `<p class="note">⚠️ ${esc(F.note)}</p>` : ""}
<details><summary><b>Before you cast: licence, limits and no-fishing zones</b></summary><ul>
<li>🪪 <b>You need a NSW fishing licence</b> (from $7 for 3 days). <a href="https://www.dpird.nsw.gov.au/fishing/recreational/recreational-fishing-fee" rel="noopener">Get one</a></li>
<li>📏 <a href="https://www.dpird.nsw.gov.au/fishing/recreational/fishing-rules-and-regs/saltwater-bag-and-size-limits" rel="noopener">Bag and size limits</a>, or carry them in the free <a href="https://www.dpird.nsw.gov.au/fishing/recreational/resources/fishsmart-app" rel="noopener">FishSmart app</a> (it shows marine park zones too)</li>
${F.park ? `<li>🚫 <b>${esc(F.park[0])}</b> has sanctuary zones where all fishing is banned. <a href="${F.park[1]}" rel="noopener">Zoning map</a></li>` : ""}
<li>🦺 Rock fishing? A lifejacket is strongly recommended. <a href="https://www.nsw.gov.au/environment-land-and-water/coasts-waterways-and-marine/rock-fishing-lifejacket-law" rel="noopener">NSW rock fishing safety</a></li></ul></details>`;
}

// Fire danger rating + plain-English "can I light it?", straight from the RFS rules. Total Fire Ban rules from rfs.nsw.gov.au/fire-information/fdr-and-tobans/total-fire-ban-rules
const FDR = { "no rating": ["⚪", "#9ca3af", "No rating today. Stay alert."], moderate: ["🟢", "#16a34a", "Plan and prepare."], high: ["🟡", "#eab308", "Be ready to act."],
  extreme: ["🟠", "#ea580c", "Take action now to protect life and property."], catastrophic: ["🔴", "#991b1b", "For your survival, leave bush fire risk areas."] };
function fdrBlock(fdr) {
  const f = fdr?.items?.[0]; if (!f) return "";
  const lv = t => FDR[String(t || "").toLowerCase()] || FDR["no rating"], pill = (t, ban) => { const [e, c] = lv(t); return `<span class="fdr" style="--c:${c}">${e} ${esc(t || "No rating")}</span>${ban ? ` <span class="fdr ban">🚫 Total Fire Ban</span>` : ""}`; };
  const ban = f.banToday, can = ban ? `<div class="fdrgrid"><div class="aib bad"><b>❌ Not allowed today</b><ul>
<li>Wood, charcoal or heat-bead BBQs outside</li><li>Wood-fired pizza ovens outside</li><li>Campfires, fire pits and burning off</li><li>Welding, grinding or anything that sparks, outside</li></ul></div>
<div class="aib good"><b>✅ Allowed, if you follow the rules</b><ul><li><b>Gas BBQ:</b> only within 20 m of a home, or in a picnic area approved by council, NPWS (National Parks and Wildlife Service) or State Forests; an adult there at all times, nothing that burns within 2 m, and water ready</li>
<li><b>Electric BBQ:</b> only within 20 m of a home, or in a picnic area approved by council, NPWS (National Parks and Wildlife Service) or State Forests; an adult there at all times, nothing that burns within 2 m, and water ready</li></ul></div></div>
<p class="mute">On-the-spot fines start at $2,200; the maximum penalty is $132,000 and/or 14 years' jail. <a href="https://www.rfs.nsw.gov.au/fire-information/fdr-and-tobans/total-fire-ban-rules" rel="noopener">Full Total Fire Ban rules (RFS)</a> · <a href="https://www.rfs.nsw.gov.au/__data/assets/pdf_file/0016/9430/NSW-RFS-Total-Fire-Bans-A5-Factsheet.pdf" rel="noopener">RFS factsheet (PDF)</a></p>`
    : `<p>✅ <b>No Total Fire Ban today.</b> Gas, electric, wood and charcoal BBQs are fine with care: keep an adult on it, water handy and nothing that burns nearby. Burning off or a fire in the open? <a href="https://www.rfs.nsw.gov.au/fire-information/BFDP" rel="noopener">Check if you need a permit</a>.</p>`;
  return `<h3>🔥 Fire danger today</h3><p>${pill(f.today, f.banToday)} <b>${esc(lv(f.today)[2])}</b></p>${can}
<p class="mute">Tomorrow: ${pill(f.tomorrow, f.banTomorrow)}</p>
<style>.fdr{display:inline-block;padding:2px 10px;border-radius:99px;font-weight:700;font-size:.85rem;color:#fff;background:var(--c)}.fdr.ban{background:#7f1d1d}.fdrgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:6px 0}.fdrgrid ul{margin:4px 0;padding-left:18px}.fdrgrid li{padding:2px 0}@media(max-width:560px){.fdrgrid{grid-template-columns:1fr}}</style>
${srcLine(SOURCES.fdr.name + ` (${f.district})`, SOURCES.fdr.url, fdr.asof)}`;
}
// ---- Sky watch: big sky events and notable asteroid fly-bys in the next 14 days get a note at the top of the page. ----
const sydDate = iso => new Date(new Date(iso).getTime() + 11 * 3600e3).toISOString().slice(0, 10);
const rockSize = a => { const avg = (a.sizeLo + a.sizeHi) / 2, like = avg >= 300 ? "bigger than three footy fields" : avg >= 100 ? "about the size of a footy field" : avg >= 40 ? "about the size of a jumbo jet" : avg >= 15 ? "about the size of a bus" : "about the size of a car";
  return `${like} (roughly ${a.sizeLo.toLocaleString("en-AU")} to ${a.sizeHi.toLocaleString("en-AU")} m)`; };
const rockDist = a => a.ld < 1 ? `closer than the Moon (${a.km.toLocaleString("en-AU")} km away)` : `${a.ld.toFixed(1)} times as far away as the Moon`;
function skyFortnight(neo) {
  const end = new Date(Date.now() + 14 * 864e5 + 11 * 3600e3).toISOString().slice(0, 10);
  const events = skyNext().filter(e => e.d <= end);
  const all = neo && neo.ok !== false ? (neo.items || []).filter(a => sydDate(a.when) >= todayISO() && sydDate(a.when) <= end) : [];
  const rocks = [...all.filter(a => a.major), ...all.filter(a => !a.major)].slice(0, 4);
  const big = [...events.filter(e => e.major).map(e => ({ d: e.d, t: e.name })), ...all.filter(a => a.major).map(a => ({ d: sydDate(a.when), t: `Asteroid ${a.des} passes ${rockDist(a)}` }))].sort((a, b) => a.d.localeCompare(b.d));
  const banner = big.length ? `<p class="note">🔭 <b>Coming up in the sky:</b> ${big.slice(0, 2).map(b => `${esc(b.t)}, ${esc(fmtDate(b.d))}${away(b.d)}`).join(" · ")}. <a href="#sky" data-open="holidays">More in the sky →</a></p>` : "";
  return { events, rocks, banner };
}
async function liveBlocks(env, ctx, at = HOME) {
  let tr = null; try { tr = await trafficNear(env, at); } catch (e) { tr = null; }
  const [news, fires, warn, hol, fdr, neo] = await Promise.all(["news", "fires", "warnings", "holidays", "fdr", "neo"].map(k => getSource(env, ctx, k)));
  const S = SOURCES, fail = s => wip("We couldn't reach the source just now, so we'll try again within 30 minutes");
  const alerts = `<section id="alerts"><h2>Alerts</h2><p class="mute">In an emergency call <a href="tel:000">000</a>.</p>
${fdrBlock(fdr)}
<h3>🔥 Fires within 100 km</h3>${fires.ok === false ? fail() : (fires.items = fires.items.map(f => ({ ...f, km: f.pt ? Math.round(km(at, f.pt)) : f.km })).sort((a, b) => a.km - b.km)).length ? `<ul>${fires.items.map(f => `<li><b>${esc(f.title)}</b> <span class="tagg">${esc(f.level)}</span><br><span class="mute">${esc(f.where)} · ${f.km} km away${f.status ? " · " + esc(f.status) : ""}${f.size ? " · " + esc(f.size) : ""}</span></li>`).join("")}</ul>` : "<p>✅ No fires listed within 100 km.</p>"}
${srcLine(S.fires.name, S.fires.url, fires.asof)}
<h3>⚠️ Weather warnings</h3>${warn.ok === false ? fail() : warn.items.length ? `<ul>${warn.items.map(w => `<li>${w.link ? `<a href="${esc(w.link)}" rel="noopener">${esc(w.title)}</a>` : esc(w.title)}</li>`).join("")}</ul>` : "<p>✅ No current warnings for our area.</p>"}
${srcLine(S.warnings.name, S.warnings.url, warn.asof)}
<h3>🚗 Roads now</h3>${trafficList(tr, esc)}</section>`;
  const ago2 = n => { if (!n.date) return ""; const m = Math.round((Date.now() - new Date(n.date)) / 6e4); return m < 1 ? "just now" : m < 60 ? m + "m ago" : m < 24 * 60 ? Math.round(m / 60) + "h ago" : m < 48 * 60 ? "yesterday" : nd(n); };
  const nd = n => n.date ? esc(new Date(n.date).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney", weekday: "short", day: "numeric", month: "short" })) : "";
  const nsrc = n => n.src ? `<span class="kick"><span class="srcw">Source:</span> ${esc(n.src)}${n.gated ? ` <span class="gate">🔒 ${esc(n.gated)}</span>` : ""}</span>` : "";
  const nimg = (n, cls) => n.img ? `<img class="${cls}" src="${esc(n.img)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.classList.remove('wimg');this.remove()">` : "";
  const story = (n, lead) => `<a class="story${lead ? " lead" : ""}${n.img ? " wimg" : ""}" data-tone="${esc(n.tone || "")}" href="${esc(n.link)}" rel="noopener">${nimg(n, "simg")}<span class="sbody">${nsrc(n)}<span class="hl">${esc(n.title)}</span>${n.desc ? `<span class="dek">${esc(lead ? n.desc : cut(n.desc, 95))}</span>` : ""}<span class="byl">${nd(n)} · Read the full story →</span></span></a>`;
  const ni = news.ok === false ? [] : freshFirst(news.items, "news"), withImg = ni.findIndex(n => n.img), leadI = withImg > -1 && withImg < 3 ? withImg : 0;
  const lead = ni[leadI], rest = ni.filter((_, k) => k !== leadI), top = rest.slice(0, 4), more = rest.slice(4);
  const toneBar = ni.some(n => n.tone) ? `<div class="tones" role="group" aria-label="Filter news"><button type="button" data-t="" class="on">All</button><button type="button" data-t="good">😊 The good</button><button type="button" data-t="bad">😟 The bad</button><button type="button" data-t="ugly">🏛️ The ugly <small>(politics &amp; money)</small></button></div>
<script>(function(){var b=document.currentScript.previousElementSibling;b.addEventListener('click',function(e){var t=e.target.closest('button');if(!t)return;b.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===t)});var v=t.dataset.t;document.querySelectorAll('#news [data-tone],#lead [data-tone]').forEach(function(el){el.style.display=!v||el.dataset.tone===v?'':'none'})})})()<\/script>
<style>.tones{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 10px}.tones button{border:1px solid var(--line);background:var(--bg);border-radius:999px;padding:4px 12px;font-size:.85rem;cursor:pointer}.tones button.on{background:var(--fg);color:var(--bg)}.tones small{opacity:.7}</style>` : "";
  const newsB = `<section id="news" class="paper"><h2 class="sech">📰 More news today</h2>${toneBar}
${news.ok === false ? fail() : !ni.length ? "<p class=mute>No new stories just now.</p>" : `<div class="grid2">${top.map(n => story(n, false)).join("")}</div>${quoteBlock()}${more.length ? `<h3 class="sub">More headlines</h3><ul class="heads">${more.map(n => `<li data-tone="${esc(n.tone || "")}">${nsrc(n)}<a href="${esc(n.link)}" rel="noopener" title="${esc(n.title)}">${esc(n.title)}</a><time class="mute"${n.date ? ` datetime="${esc(new Date(n.date).toISOString())}"` : ""}>${ago2(n)}</time></li>`).join("")}</ul>` : ""}`}
<p class="src">These stories are written and owned by ${R.news.map(n => esc(n.name)).join(", ")} and, when they mention your area, national outlets like the ABC, SBS and The Guardian, not us. We show the headline (and for local outlets a short summary); tap a story to read it in full on their site. 🔒 means that site may ask you to subscribe. The good, the bad and the ugly are sorted by a free AI from each headline&rsquo;s topic, not by our opinion.${news.asof ? ` Updated ${esc(asOf(news.asof))}.` : ""}</p></section>`;
  const newsLead = news.ok !== false && lead ? `<section id="lead" class="paper" aria-label="Top story">${story(lead, true)}</section>` : "";
  const sky = skyFortnight(neo);
  const holB = `<section id="holidays"><h2>Holidays</h2><h3>Next NSW public holidays</h3>${hol.ok === false ? fail() : `<ul>${hol.items.map(h => `<li><b>${esc(fmtDate(h.date))}</b>: ${esc(h.name)}${away(h.date)}</li>`).join("")}</ul>`}
${srcLine(S.holidays.name, S.holidays.url, hol.asof)}${(() => { const up = sky.events, rocks = sky.rocks; return up.length || rocks.length ? `<h3 id="sky">🔭 In the sky, next 14 days</h3>${up.length ? `<ul>${up.map(e => `<li><b>${esc(fmtDate(e.d))}</b>: ${e.major ? "⭐ " : ""}${esc(e.name)}${away(e.d)}</li>`).join("")}</ul><p class="src">Dates are the usual peaks; meteor showers are best away from town lights. <span class="srcw">Source:</span> <a href="https://www.timeanddate.com/astronomy/meteor-shower/" rel="noopener">timeanddate.com</a>.</p>` : ""}${rocks.length ? `<h3>☄️ Asteroids passing by</h3><ul>${rocks.map(a => `<li><b>${esc(fmtDate(sydDate(a.when)))}</b>: ${a.major ? "⭐ " : ""}${esc(a.des)}, ${rockSize(a)}, passes ${rockDist(a)} at ${a.kms} km a second${away(sydDate(a.when))}</li>`).join("")}</ul>${srcLine(S.neo.name, S.neo.url, neo.asof, "None of these will hit Earth. Most are too faint to see without a big telescope")}` : ""}` : ""; })()}<h3>Next school holidays</h3>${schoolHols()}<p class="src">${R.schoolsArea}. <span class="srcw">Source:</span> <a href="https://education.nsw.gov.au/schooling/calendars" rel="noopener">NSW Department of Education</a> · Private schools may differ</p></section>`;
  const nf = fires.ok === false ? 0 : fires.items.length, nw = warn.ok === false ? 0 : warn.items.length;
  const alertNote = nf || nw ? `<p class="note alertnote">⚠️ <b>Live alerts:</b> ${[nf ? `${nf} fire${nf > 1 ? "s" : ""} within 100 km` : "", nw ? `${nw} weather warning${nw > 1 ? "s" : ""}` : ""].filter(Boolean).join(" · ")}. <a href="#alerts" data-open="alerts">See alerts →</a></p>`
    : `<p class="mute alertnote">✅ No fires or weather warnings near us right now. <a href="#alerts" data-open="alerts">Alerts</a></p>`;
  return { alerts, alertNote: alertNote + sky.banner, news: ni.length ? newsB : newsB + quoteBlock(), newsLead, holidays: holB };
}

// ---- FuelCheck, via the shared nsw-api gateway (keys live there, not here) ----
const FUELS = { E10: "E10", U91: "Unleaded 91", P95: "Premium 95", P98: "Premium 98", DL: "Diesel" };
const FUEL_COLS = [["U91", "Unleaded"], ["E10", "E10"], ["P95", "Premium 95"], ["DL", "Diesel"]];
// Calls the nsw-api Worker: through the NSW service binding when it's there, otherwise over HTTPS.
const nswApi = (env, path) => env.NSW ? env.NSW.fetch("https://nsw" + path) : fetch("https://nsw-api.bradatwal.workers.dev" + path);
// Quota-safe: API.NSW allows 2,500 calls a month, so each spot (rounded to ~5 km) is fetched at most every 30 minutes and kept in KV.
async function fuelNear(env, lat, lon) {
  lat = Math.round(lat * 20) / 20; lon = Math.round(lon * 20) / 20;
  const key = `fuel:near:${lat}:${lon}`, c = await env.DATA.get(key, "json");
  if (c && Date.now() - new Date(c.asof) < 30 * 6e4) return c;
  try {
    const res = await Promise.all(FUEL_COLS.map(([t]) => nswApi(env, `/fuel/near?fuel=${t}&lat=${lat}&lng=${lon}&radius=15`).then(r => r.ok ? r.json() : null).catch(() => null)));
    const st = {}, prices = [];
    res.forEach((r, i) => { if (!r) return;
      (r.stations || []).forEach(s => { st[String(s.code)] ||= { code: String(s.code), name: s.name, brand: s.brand, address: s.address, km: +s.location?.distance, lat: +s.location?.latitude, lon: +s.location?.longitude }; });
      (r.prices || []).forEach(p => prices.push({ code: String(p.stationcode), type: p.fueltype || FUEL_COLS[i][0], price: p.price, updated: p.lastupdated })); });
    const stations = Object.values(st);
    if (!stations.length) throw new Error("empty");
    const out = { stations, prices, asof: new Date().toISOString() };
    await env.DATA.put(key, JSON.stringify(out), { expirationTtl: 86400 });
    if (lat === Math.round(HOME.lat * 20) / 20 && lon === Math.round(HOME.lon * 20) / 20) await env.DATA.put("fuel:local", JSON.stringify(out)); // feeds News in numbers
    return out;
  } catch (e) { return c; }
}
async function fuelApi(req, env) {
  const u = new URL(req.url);
  const d = await fuelNear(env, +u.searchParams.get("lat") || HOME.lat, +u.searchParams.get("lon") || HOME.lon);
  if (!d) return Response.json({ error: "unreachable" });
  const rows = d.stations.map(s => ({ name: s.name, brand: s.brand, address: s.address, km: s.km, p: Object.fromEntries(d.prices.filter(x => x.code === s.code).map(x => [x.type, x.price])) }))
    .filter(r => Object.keys(r.p).length).sort((a, b) => a.km - b.km).slice(0, 4);
  const best = Object.fromEntries(FUEL_COLS.map(([t]) => [t, Math.min(...rows.map(r => r.p[t] ?? Infinity))]));
  return Response.json({ cols: FUEL_COLS, rows, best, asof: d.asof });
}
const fuelBlock = (t = HOME) => `<section id="fuel"><h2>⛽ Fuel</h2>
<div class="row"><button type="button" id="fnear">📍 Near me</button></div><div id="fout" class="mute">Loading fuel prices…</div>
<p class="src" id="fsrc"><span class="srcw">Source:</span> <a href="https://www.fuelcheck.nsw.gov.au" rel="noopener">NSW FuelCheck</a></p>
<script>(function(){var fo=document.getElementById('fout'),nb=document.getElementById('fnear'),pos=null;try{var L=JSON.parse(localStorage.getItem('loc'));if(L){pos=L;nb.textContent='📍 Near you'}}catch(e){}
function c(v){return v==null?'<span class="mute">–</span>':(v/100).toFixed(2).replace(/^/,'$')}
function load(){var q='/api/fuel?'+(pos?'lat='+pos[0]+'&lon='+pos[1]:'lat=${t.lat}&lon=${t.lon}');
fetch(q).then(function(r){return r.json()}).then(function(j){if(j.error||!j.rows){fo.textContent='Couldn’t reach FuelCheck just now. Try again soon.';return}
if(!j.rows.length){fo.textContent='No servos found within 15 km.';return}
var hi={};j.cols.forEach(function(k){var L=j.rows.map(function(r){return r.p[k[0]]}).filter(function(x){return x!=null});hi[k[0]]=L.length?Math.max.apply(null,L):null});function tl(v,t){if(v==null||j.best[t]===hi[t])return '';return v===j.best[t]?'cheap':v===hi[t]?'dear':'mid'}
fo.className='';fo.innerHTML='<div class="ftw"><table class="ftab"><thead><tr><th>Nearest servos</th>'+j.cols.map(function(k){return '<th>'+k[1]+'</th>'}).join('')+'</tr></thead><tbody>'+j.rows.map(function(s){return '<tr><td><b>'+s.name+'</b><br><span class="mute">'+(s.km!=null?(+s.km).toFixed(1)+' km · ':'')+(s.address||'')+'</span></td>'+j.cols.map(function(k){var v=s.p[k[0]];return '<td class="'+tl(v,k[0])+'">'+c(v)+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>${TL_KEY.replace(/'/g, "\\'")}<p class="mute fnote">Closest first. Price a litre.</p>';
document.getElementById('fsrc').innerHTML='<span class="srcw">Source:</span> <a href="https://www.fuelcheck.nsw.gov.au" rel="noopener">NSW FuelCheck</a>, the NSW Government fuel price site. Updated '+new Date(j.asof).toLocaleString('en-AU',{hour:'numeric',minute:'2-digit',weekday:'short'})+'.';}).catch(function(){fo.textContent='Couldn’t reach FuelCheck just now. Try again soon.'})}
nb.onclick=function(){if(!navigator.geolocation)return;nb.textContent='📍 Finding you…';
navigator.geolocation.getCurrentPosition(function(p){pos=[+p.coords.latitude.toFixed(2),+p.coords.longitude.toFixed(2)];try{localStorage.setItem('loc',JSON.stringify(pos))}catch(e){}nb.textContent='📍 Near you';load()},function(){nb.textContent='📍 Near me'})};load()})();</script></section>`;

// ---- Outside highlights: cycle trails, World Heritage and what you can only do here. Every line sourced (regions.js outdoor).
function outdoorBlock() {
  const o = R.outdoor; if (!o) return "";
  const src = u => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } };
  const card = ([h, t, u]) => `<li><b>${esc(h)}</b><br>${esc(t)} <span class="src">Source: <a href="${esc(u)}" rel="noopener">${esc(src(u))}</a></span></li>`;
  const grp = (ico, title, L) => L && L.length ? `<div class="ogrp"><h3>${ico} ${title}</h3><ul class="olist">${L.map(card).join("")}</ul></div>` : "";
  return `<section id="trails"><h2>🚴 Trails, World Heritage and only here</h2><p class="mute">The big outdoor reasons to live in, or visit, ${esc(R.place)} and the shire.</p>
${grp("🚴", "Cycle and mountain bike trails", o.trails)}${grp("✨", "Only here", o.only)}${grp("🌏", "World Heritage", o.heritage)}
<style>.olist{list-style:none;padding:0;margin:0 0 8px}.olist li{padding:8px 0;border-bottom:1px solid var(--line)}.olist .src{display:block;margin:2px 0 0}</style></section>`;
}
// ---- Get outside this weekend: outdoor, free or under $50 a kid. Locals' events tagged "good for kids" + local favourites ----
function weekendDates() { const t = new Date(todayISO() + "T00:00:00Z"), d = t.getUTCDay(), sat = new Date(t); sat.setUTCDate(t.getUTCDate() + (d === 0 ? -1 : 6 - d));
  const sun = new Date(sat); sun.setUTCDate(sat.getUTCDate() + 1); return [sat.toISOString().slice(0, 10), sun.toISOString().slice(0, 10)]; }
// Kids and families: we only promote affordable things to do outside. Arcades, bowling, cinemas and the like are a Google search away.
const INDOOR = /\b(arcade|bowling|bowl|cinema|movies?|film screening|laser ?tag|trampoline|escape room|indoor|play ?centre|gaming|video games?|bingo|pokies|casino)\b/i;
async function kidsBlock(local, feed, pc = R.code) {
  const [sat, sun] = weekendDates(), wk = [...local, ...feed].filter(e => e.kids && (e.cost == null || e.cost <= 50) && e.date >= sat && e.date <= sun && !INDOOR.test(`${e.title} ${e.venue || ""} ${e.desc || ""}`));
  return `<section id="kids"><h2>🌳 Get outside this weekend</h2><p class="mute">Things for kids and families to do outdoors, free or under $50 a kid. This weekend: ${esc(fmtDate(sat))} and ${esc(fmtDate(sun))}.</p>
${wk.length ? `<h3>On this weekend</h3><ul>${wk.map(evItem).join("")}</ul>` : `<p>No kids' events listed for this weekend yet. Running one? <a href="/submit?pc=${pc}">Add it free</a> and tick "Good for kids".</p>`}
<h3>Always-good local favourites</h3><ul>${dayMix(FAVES, "faves").map(([n, c, d]) => `<li><b>${esc(n)}</b> <span class="tagg">${c}</span><br><span class="mute">${esc(d)}</span></li>`).join("")}</ul>
<p class="src">Outdoor and affordable, picked by locals. Check times and prices before you go · <a href="/feedback">Suggest one</a></p></section>`;
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
  return `<p class="src${old ? " warn" : ""}"><span class="srcw">Source:</span> <a href="${w.url}" rel="noopener">${esc(w.name)}</a>. ${said}${watch}</p>`;
}

async function checkFields(env) {
  if (!R.fields) return;
  const prev = await env.DATA.get("fields:state", "json"); if (prev && Date.now() - new Date(prev.checked) < 25 * 6e4) return; // every half hour (council decides by 3pm)
  try {
    const txt = (await (await fetch(R.fields.url, { headers: UA })).text()).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const h = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt)))].slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("");
    const old = await env.DATA.get("fields:state", "json"), now = new Date().toISOString();
    if (!old) return env.DATA.put("fields:state", JSON.stringify({ hash: h, changed: null, checked: now }));
    if (old.hash !== h) { await env.DATA.put("fields:state", JSON.stringify({ hash: h, changed: now, checked: now }));
      const L = await fieldsList(env, txt).catch(() => null), shut = (L?.grounds || []).filter(g => g.status === "closed").map(g => g.name);
      await sendAlert(env, "fields", "Field closure update", shut.length ? `Closed: ${shut.slice(0, 4).join(", ")}${shut.length > 4 ? ` +${shut.length - 4} more` : ""}. Tap for the full list.` : "Council has just updated its sports field closure page. Tap to check.", `/${R.code}#sport`); }
    else { await env.DATA.put("fields:state", JSON.stringify({ ...old, checked: now })); if (!(await env.DATA.get("fields:list"))) await fieldsList(env, txt).catch(() => {}); }
  } catch (e) {}
}
// Reads council's closure summary into a ground-by-ground list. Only grounds named on council's page, statuses as council gives them.
async function fieldsList(env, txt) {
  const i = Math.max(0, txt.search(/closure summary|ground closure|field closure/i)), part = txt.slice(i, i + 3500);
  const ask = { messages: [{ role: "system", content: "You copy sports ground statuses from a council page. Never invent. Output ONLY JSON." },
    { role: "user", content: `From this council text, list every sports ground or field it names with a current status. Return {"updated":"the date/time the summary says it was updated, exactly as written, or empty","grounds":[{"name":"ground name exactly as written","status":"open" or "closed" or "partial" or "unknown","note":"council's own wording about it, under 15 words, or empty"}]}. If no grounds are named with a status, return {"updated":"","grounds":[]}.\n\n${part}` }], max_tokens: 1200 };
  let r; try { r = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", ask); } catch (e) { r = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", ask); }
  const raw = typeof r?.response === "string" ? r.response : JSON.stringify(r?.response || {}), j = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
  const low = txt.toLowerCase(), grounds = (Array.isArray(j.grounds) ? j.grounds : []).filter(g => g?.name && low.includes(String(g.name).toLowerCase().slice(0, 12)))
    .map(g => ({ name: String(g.name).slice(0, 80), status: ["open", "closed", "partial"].includes(g.status) ? g.status : "unknown", note: String(g.note || "").slice(0, 120) })).slice(0, 40);
  const out = { updated: String(j.updated || "").slice(0, 60), grounds, at: new Date().toISOString() };
  await env.DATA.put("fields:list", JSON.stringify(out)); return out;
}
async function fieldsBlock(env) {
  const st = await env.DATA.get("fields:state", "json"), a = await env.DATA.get("alert:fields", "json");
  const L = await env.DATA.get("fields:list", "json"), G = L?.grounds || [], ord = { closed: 0, partial: 1, open: 2, unknown: 3 };
  const lab = { closed: "🔴 Closed", partial: "🟠 Partly closed", open: "🟢 Open", unknown: "⚪ Check with council" };
  const list = L ? (G.length ? `<h3>Grounds right now${L.updated ? ` <span class="mute">(council updated ${esc(L.updated)})</span>` : ""}</h3><ul class="fls">${[...G].sort((x, y) => ord[x.status] - ord[y.status] || x.name.localeCompare(y.name)).map(g => `<li class="${g.status === "closed" ? "hit" : ""}"><b>${esc(g.name)}</b> <span class="fl ${g.status === "open" ? "ok" : g.status === "closed" ? "bad" : "warn"}">${lab[g.status]}</span>${g.note ? `<br><small class="mute">${esc(g.note)}</small>` : ""}</li>`).join("")}</ul>`
    : `<p>🟢 <b>Council's summary isn't listing any closed grounds right now.</b> <a href="${R.fields.url}" rel="noopener">Double-check on council's page</a> before you head out.</p>`) : "";
  return `${a ? `<p><b>Latest:</b> ${esc(a.body)} <span class="mute">(${esc(asOf(a.at))})</span></p>` : ""}
${list}
<details><summary>How closures work</summary>${R.fields.info}</details>
<p class="src"><span class="srcw">Source:</span> <a href="${R.fields.url}" rel="noopener">${esc(R.fields.name)}</a>.${st?.changed ? ` <b>Council last changed it: ${esc(asOf(st.changed))}</b>.` : ""}${st?.checked ? ` We check it every half hour (last check ${esc(asOf(st.checked))}).` : ""}</p>`;
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
  if (p === "/api/alert") {
    if (req.method === "POST") { let j = {}; try { j = await req.json(); } catch (e) {}
      if (j.e) { const id = b64u(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(j.e)))).slice(0, 22), pa = await env.DATA.get("palert:" + id, "json");
        if (pa) { await env.DATA.delete("palert:" + id); return Response.json(pa); } } }
    return Response.json(await env.DATA.get("alert:latest", "json") || { title: R.brand, body: `Something new in ${R.code}.`, url: `/${R.code}` }); }
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
const PUSH_JS = () => ""; // alerts buttons are bound by PERSONAL_JS on every page

// ---- Open now: OpenStreetMap places around Coffs (free, no key), cached daily; open/closed worked out on the visitor's phone ----
const OPEN_CATS = { pharmacy: ["💊 Pharmacies", 'nwr["amenity"="pharmacy"]'], doctor: ["🩺 Doctors & clinics", 'nwr["amenity"~"^(doctors|clinic)$"]'],
  mechanic: ["🔧 Mechanics & tyres", 'nwr["shop"~"^(car_repair|tyres)$"]'], fuel: ["⛽ Servos", 'nwr["amenity"="fuel"]'],
  grocery: ["🛒 Supermarkets", 'nwr["shop"~"^(supermarket|convenience)$"]'], bottle: ["🍷 Bottle shops", 'nwr["shop"="alcohol"]'],
  pub: ["🍺 Pubs & bars", 'nwr["amenity"~"^(pub|bar)$"]'], cafe: ["☕ Cafés", 'nwr["amenity"="cafe"]'], food: ["🍔 Takeaway & restaurants", 'nwr["amenity"~"^(fast_food|restaurant)$"]'],
  vet: ["🐾 Vets", 'nwr["amenity"="veterinary"]'], dogs: ["🐕 Dog beaches & parks", 'nwr["leisure"="dog_park"];nwr["natural"="beach"]["dog"~"^(yes|leashed|unleashed|designated)$"];nwr["dog"~"^(unleashed|designated)$"]["leisure"~"^(park|beach_resort)$"]'], petfriendly: ["🐶 Dog-friendly cafés & pubs", 'nwr["amenity"~"^(cafe|restaurant|pub|bar|fast_food)$"]["dog"~"^(yes|leashed|outside)$"]'], pets: ["🐾 Pet shops, groomers & shelters", 'nwr["shop"~"^(pet|pet_grooming)$"];nwr["amenity"~"^(animal_shelter|animal_boarding)$"]'],
  lgbtq: ["🏳️‍🌈 LGBTQ+ friendly", 'nwr["lgbtq"~"^(welcome|primary|friendly|yes)$"]'], nudist: ["🏖️ Clothing-optional beaches", 'nwr["natural"="beach"]["nudism"~"^(yes|designated|customary|permissive)$"]'], hardware: ["🔨 Hardware", 'nwr["shop"~"^(hardware|doityourself)$"]'],
  gifts: ["🎁 Gift shops", 'nwr["shop"~"^(gift|antiques|jewelry)$"]'], florist: ["💐 Florists", 'nwr["shop"="florist"]'], books: ["📚 Bookshops", 'nwr["shop"="books"]'], fishing: ["🎣 Tackle & fishing", 'nwr["shop"~"^(fishing|outdoor)$"]'],
  garden: ["🌱 Nurseries & garden", 'nwr["shop"="garden_centre"]'], music: ["🎸 Music shops", 'nwr["shop"~"^(musical_instrument|music)$"]'], sports: ["🏉 Sports shops", 'nwr["shop"="sports"]'], crafts: ["🎨 Craft & art shops", 'nwr["shop"~"^(craft|art|fabric|sewing)$"]'] };
const NEAR_CATS = { beach: ["Beaches", 'nwr["natural"="beach"]["name"]'] };
// Local regional businesses only: anything the map tags with a brand (chains and multinationals) is left out of every category.
// Add the places we found on the web, skipping any the map already has
function withExtras(cat, out) {
  const ex = (EXTRA_PLACES[R.code] || {})[cat] || []; if (!ex.length || !out || out.error) return out;
  const key = n => String(n).toLowerCase().replace(/[^a-z0-9]/g, ""), have = new Set((out.items || []).map(x => key(x.name)));
  return { ...out, items: [...(out.items || []), ...ex.filter(x => !have.has(key(x.name))).map(x => ({ name: x.name, hours: x.hours || "", phone: "", lat: x.lat, lon: x.lon, addr: x.addr || "", web: x.web || "", note: x.note || "", src: x.src, url: x.url }))], extra: true };
}
async function openApi(req, env) {
  const cat = new URL(req.url).searchParams.get("c"), CAT = OPEN_CATS[cat] || NEAR_CATS[cat]; if (!CAT) return Response.json({ error: "bad" }, { status: 400 });
  const c = await env.DATA.get("osm3:" + cat, "json");
  if (c && Date.now() - new Date(c.asof) < 864e5) return Response.json(withExtras(cat, c));
  try {
    const q = `[out:json][timeout:25];(${CAT[1].split(";").map(s => s + `(${R.bbox});`).join("")});out center tags;`;
    const j = await (await fetch("https://overpass-api.de/api/interpreter", { method: "POST", headers: { ...UA, "content-type": "application/x-www-form-urlencoded" }, body: "data=" + encodeURIComponent(q) })).json();
    const items = (j.elements || []).filter(e => e.tags?.name && (NEAR_CATS[cat] || !(e.tags["brand:wikidata"] || e.tags.brand))).map(e => { const t = e.tags;
      return { name: t.name, hours: t.opening_hours || "", phone: t.phone || t["contact:phone"] || "", lat: e.lat ?? e.center?.lat, lon: e.lon ?? e.center?.lon,
        addr: [t["addr:housenumber"], t["addr:street"], t["addr:suburb"] || t["addr:city"]].filter(Boolean).join(" "), web: t.website || t["contact:website"] || "", osm: `${e.type}/${e.id}` }; });
    const out = { cat, items, asof: new Date().toISOString() };
    await env.DATA.put("osm3:" + cat, JSON.stringify(out));
    return Response.json(withExtras(cat, out));
  } catch (e) { return Response.json(withExtras(cat, c) || { error: "unreachable" }); }
}
const openPage = () => page(`What's open in ${R.place}`, `<p class="mute"><a href="/${R.code}">‹ ${R.code} ${R.place}</a></p><h1>🟢 What&rsquo;s open in ${esc(R.place)}</h1>
<p>Local or just visiting? Pick what you need. Open places come first, nearest at the top. <a href="#" class="useloc">📍 Use my location</a></p>
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
var rank={open:0,shut:1,unk:2},it=j.items.filter(function(x){return c!='nudist'||!/tyagarah/i.test(x.name)}).map(function(x){x.s=status(x.hours);x.d=x.lat?km(HOME,[x.lat,x.lon]):999;return x}).filter(function(x){return x.d<40}).sort(function(a,b){return rank[a.s.c]-rank[b.s.c]||a.d-b.d}).slice(0,40);
ol.innerHTML=it.length?'<ul class="openl">'+it.map(function(x){return '<li class="'+x.s.c+'"><span class="dot"></span><div><b>'+e(x.name)+'</b><br><span class="st">'+e(x.s.t)+'</span><br><span class="mute">'+e(x.addr||'')+(x.d<999?' · '+x.d.toFixed(1)+' km':'')+'</span><br>'
+(x.phone?'<a href="tel:'+e(x.phone.replace(/[^+\\d]/g,''))+'">📞 Call</a> · ':'')+'<a href="https://www.google.com/maps/dir/?api=1&destination='+x.lat+','+x.lon+'" rel="noopener">🧭 Directions</a>'+(x.web?' · <a href="'+e(x.web)+'" rel="noopener">Website</a>':'')+(x.note?'<br><small>'+e(x.note)+'</small>':'')+(x.src?'<br><small class="mute">Found on <a href="'+e(x.url)+'" rel="noopener">'+e(x.src)+'</a></small>':'')+'</div></li>'}).join('')+'</ul>':(c=='nudist'?'<p><b>No legal clothing-optional beaches in this area.</b> Tyagarah Beach near Byron Bay lost its clothing-optional status on 30 August 2024.</p>':c=='lgbtq'?'<p>No places tagged as LGBTQ+ friendly nearby yet. Know one? <a href="/feedback">Tell us</a> and we\\u2019ll get it on the map.</p>':'<p>Nothing listed nearby yet. Know one? <a href="/feedback">Tell us</a>.</p>');
document.getElementById('osrc').innerHTML='<span class="srcw">Source:</span> <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap</a>, a free map anyone can add to (© OpenStreetMap contributors). Updated '+new Date(j.asof).toLocaleString('en-AU',{weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})+'. Hours can be wrong, so call ahead if it matters. Wrong or missing hours? <a href="https://www.openstreetmap.org" rel="noopener">Anyone can fix them</a> or <a href="/feedback">tell us</a>.'})
.catch(function(){ol.innerHTML='<p class="mute">Couldn\\u2019t load just now.</p>'})}
document.querySelectorAll('#cats button').forEach(function(b){b.onclick=function(){load(b.dataset.c,b)}});
var last=new URLSearchParams(location.search).get('c');if(!last)try{last=localStorage.getItem('opencat')}catch(_){}var lb=last&&document.querySelector('[data-c="'+last+'"]');if(lb)load(last,lb)})();</script>`, R.code);

// ---- Mav chat: a helper on every page. Answers from the site's own info and changes settings (all stored on the phone). Nothing is logged. ----
// First chat with Mav is free. After that, sign in (free) to keep using him.
async function mavChat(req, env) {
  const em = await member(req, env);
  if (em && (await hasTier(env, em, "some"))) return mavAnswer(req, env);
  if (cookie(req, "mav1")) return Response.json({ reply: `Loved helping! To keep chatting with me, sign in to My ${R.code}. It's free, one tap, and unlocks Some Cool Things: your page personalised, and me, any time: /signin`, actions: [], signin: true });
  const r = await mavAnswer(req, env), h = new Headers(r.headers);
  h.append("set-cookie", "mav1=1; Path=/; Max-Age=31536000; Secure; SameSite=Lax");
  return new Response(r.body, { status: r.status, headers: h });
}
// Off-limits: Mav only knows what's published on the site. Anything dangerous or nasty gets a polite no, before any AI sees it.
const MAV_NO = /\b(bomb|explosive|detonat|nuclear|uranium|plutonium|nerve agent|sarin|ricin|anthrax|bioweapon|chemical weapon|weapon|gun|firearm|ammo|ammunition|silencer|3d.?print(ed)? gun|meth|cocaine|heroin|fentanyl|synthesi[sz]e|cook (meth|drugs)|hack|malware|ransomware|phishing|ddos|keylogger|exploit|password crack|steal|poison|kill|murder|stab|shoot|terror|porn|nude|naked|sex|escort|suicide|self.?harm|hurt myself|end my life)\b/i;
const MAV_HURT = /\b(suicide|self.?harm|hurt myself|end my life|kill myself|don'?t want to live)\b/i;
function mavGuard(text) {
  if (MAV_HURT.test(text)) return { reply: "I'm sorry you're going through this. Please talk to someone now: Lifeline 13 11 14 (any time), or 000 if you're in danger.", actions: [] };
  if (MAV_NO.test(text)) return { reply: `That's not something I can help with. I only know what's in ${R.brand}, and I'm here to make your page about you.`, actions: [] };
  return null;
}
async function mavAnswer(req, env) {
  let j = {}; try { j = await req.json(); } catch (e) {}
  const msgs = (Array.isArray(j.messages) ? j.messages : []).slice(-6).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "").slice(0, 500) }));
  const last = msgs.filter(m => m.role === "user").pop()?.content || "";
  const pc = /^\d{4}$/.test(j.pc) ? j.pc : R.code, ids = SECTIONS.map(x => x[0]), live = Object.keys(TOWNS).filter(k => TOWNS[k].live);
  const stop = mavGuard(last); if (stop) return Response.json(stop);
  // Simple mode, when the AI is down: still hides, shows and resets by plain words.
  const fallback = (ok) => { const low = last.toLowerCase(), hit = [["open", "/open"], ["fridge", "/fridge"], ["dinner", "/fridge"], ["school", "/school"], ["birthday", "/birthday"], ["slang", "/genalpha"], ["baby", "/names?t=ideas"], ["name idea", "/names?t=ideas"], ["idea", "/feedback"]].find(([k]) => low.includes(k));
    const named = ids.filter(id => id !== "today" && (low.includes(SECTIONS.find(x => x[0] === id)[1].toLowerCase()) || new RegExp(`\\b${id}\\b`).test(low)));
    if (/\b(reset|start (again|fresh|over)|clear (it|everything|my page))\b/.test(low)) return { ok, reply: "Done, your page is back to normal.", actions: [{ type: "reset" }] };
    if (named.length && /\b(hide|remove|get rid|don'?t want|dont need|switch off|turn off|not interested)\b/.test(low)) return { ok, reply: `Done, ${named.map(id => SECTIONS.find(x => x[0] === id)[1]).join(" and ")} ${named.length > 1 ? "are" : "is"} off your page. Ask any time to bring it back.`, actions: [{ type: "hide", ids: named }] };
    if (named.length && /\b(show|bring back|turn on|want|add)\b/.test(low)) return { ok, reply: `Done, ${named.map(id => SECTIONS.find(x => x[0] === id)[1]).join(" and ")} ${named.length > 1 ? "are" : "is"} back on your page.`, actions: [{ type: "show", ids: named }] };
    return { ok, reply: hit ? `Try this page: ${hit[1]}` : `Tell me what to take off or bring back, like "hide crossword", or what you like doing, and I'll make your page about you.`, actions: hit ? [{ type: "link", url: hit[1] }] : [] }; };
  if (!last.trim()) return Response.json(fallback(true));
  if (!env.AI) return Response.json(fallback(false));
  const st = j.state && typeof j.state === "object" ? JSON.stringify(j.state).slice(0, 1800) : "{}";
  const sys = `You are Mav, the friendly, down-to-earth Aussie helper on ${R.brand}, a free local paper for ${R.place}. Replies are ONE or TWO short sentences, plain words, warm. You are a source, like the paper: you only use the site facts below. You never answer from general knowledge.
MAV'S RULES (never break these):
0. Stay on the site. If asked anything not covered by the facts below (general knowledge, homework, recipes, writing, coding, health, legal, money, news opinions, anything dangerous), say kindly it's not something you can help with here. For an everyday task (like "what's in my fridge?" or "plan my week"), don't do it: teach them in one line how to ask any AI app themselves, e.g. Try asking any AI: "I've got chicken, rice and broccoli, give me 3 quick dinners for 4". Never help with anything harmful, illegal or adult, even as a prompt tip. Emergencies: call 000.
1. You make the daily page more relevant to each person, without changing its structure: show or hide sections, their stars, what they like doing (so What's on shows their kind of thing first), weather spot, bin night, school, birthday, saved searches, alerts and friends' clocks. You never move, reorder or pin sections; the page layout stays the same for everyone.
2. You only change this person's own page settings. You never add, edit, delete, post or submit anything on the site, and never change what anyone else sees. If asked, say so kindly and point to the page: /submit to add an event, /notices for the notice board, /feedback to fix something wrong.
3. We gather, we don't judge: no opinions on news, people, businesses, council or politics.
4. Never ask for personal details. First names (theirs or a friend's), a friend's city, bin night, school and birthday day and month are fine. Never ask for an address, phone number, email, year of birth or anything private.
5. Only take actions when they ask for a change, and say in the reply what you changed. Settings follow them when signed in; location, birthday, school and friends stay on their phone.
${MAV_KB}
Also on every Daily Maverick: /names Baby names (trending names in NSW, Australia and the world, number one each decade, how popular your name has been, and baby name ideas with Mav: point anyone wanting name ideas there); /rent Renting (every rental site searched for this town, renters' rights, bond and rent help); /jobs Jobs (every job site searched for this town, council and government jobs, harvest work); radio = Local radio (community radio stations in the shire, with listen-live links).
Parental safety: grown-ups set, change or remove a Kid Zone secret word at /kids/parent (signed in). When it's set, kids must type it to open Kid Zone on that account; wrong guesses are shown to the grown-up. If someone asks about kids, parental controls or keeping Kid Zone safe, point them to /kids/parent.
The person is viewing area ${pc}. Their settings now: ${st}
Reply with ONLY JSON: {"reply":"text","actions":[...]}. Actions (optional, max 6):
{"type":"hide","ids":[...]} takes sections they don't care about off their page; {"type":"show","ids":[...]} brings them back; {"type":"reset"} puts their whole page back to normal (only when they ask to reset or start fresh);
{"type":"name","value":"First"}; {"type":"area","pc":"${live.join("|")}"}; {"type":"fuel","value":"E10|U91|P95|P98|DL"};
{"type":"sign","system":"w|v|e","value":"sign or animal"} (w Western by birthday, v Vedic Indian, e Chinese by birth year); {"type":"weather","pc":"${live.join("|")}"} or {"type":"weather","here":true};
{"type":"bins","day":"Monday"}; {"type":"school","value":"exact name from: ${SCHOOLS.join("; ")}"}; {"type":"birthday","day":1-31,"month":1-12}; {"type":"search","value":"a few words"};
{"type":"alerts","topic":"alerts|fields"} (alerts = fires and weather warnings, fields = sport field closures; shows a button they tap); {"type":"events","likes":[${LIKES.join(",")}]} (what they like doing: tailors What's on, with their picks first as "For you", and Community events; [] shows all; when they tell you their interests, set this);
{"type":"remind","text":"short plain task, e.g. Take Rua to the vet","date":"YYYY-MM-DD"} saves a reminder on their phone; their page then links them to the local help they need (vets, mechanics, pharmacies…) with numbers ready. Today is ${todayISO()}; work out dates like "Friday" from that; {"type":"unremind","text":"words from the task"};
{"type":"person","name":"Dad","day":1-31,"month":1-12,"likes":"what they like, e.g. fishing, country music"} remembers someone's birthday (on their phone only) so their page reminds them with local gift ideas; {"type":"unperson","name":"Dad"};
{"type":"friend","name":"Jimmy","tz":"IANA time zone, e.g. Europe/London","city":"London"}; {"type":"unfriend","name":"Jimmy"}; {"type":"link","url":"/open"};
{"type":"wine","value":"wine and size, e.g. Shiraz 750ml"} suggests (and votes for) a wine for Grog watch; {"type":"beer","value":"beer name and pack, e.g. Great Northern Original 24 pack"} suggests (and votes for) any beer, cider or spirit for Grog watch (local bottle shops only; default Tooheys New 24 cans).
Section ids: ${SECTIONS.map(([id, l]) => `${id} = ${l}`).join("; ")}.`;
  try {
    const ask = { max_tokens: 450, messages: [{ role: "system", content: sys }, ...msgs] };
    const run = async model => { const r = await env.AI.run(model, ask), raw = typeof r.response === "string" ? r.response : JSON.stringify(r.response || {});
      const o = JSON.parse((raw.match(/\{[\s\S]*\}/) || [])[0]); if (!o || typeof o.reply !== "string" || !o.reply.trim()) throw new Error("bad reply"); return o; };
    let out; try { out = await run("@cf/meta/llama-3.3-70b-instruct-fp8-fast"); } catch (e) { try { out = await run("@cf/meta/llama-3.1-8b-instruct-fast"); } catch (e2) { return Response.json(fallback(false)); } }
    let acts = cleanActs(out.actions, ids, live), reply = String(out.reply).replace(/https?:\/\/\S+/g, "").slice(0, 300);
    if (MAV_NO.test(reply)) { reply = `That's not something I can help with. I only know what's in ${R.brand}.`; acts = []; }
    const wa = acts.filter(a => ["watch", "unwatch", "beer", "wine"].includes(a.type));
    if (wa.length) { acts = acts.filter(a => !wa.includes(a)); const em = await member(req, env);
      if (!em) reply = "Locals vote on what Supermarket watch checks. Sign in free and I'll put your vote in: /signin";
      else { const said = []; for (const a of wa) said.push(a.type === "unwatch" ? "We don't keep personal lists. Locals vote on what we watch, and anything that hits " + WATCH_GOAL + " votes goes up for everyone." : (await nominateWatch(env, a.type === "beer" || a.type === "wine" ? "alcohol" : "shop", em, a.item || a.value)).msg); if (said.length) reply = said.join(" "); } }
    return Response.json({ reply, actions: acts });
  } catch (e) { return Response.json(fallback(false)); }
}
// Email a signed-in member their Mav chat (the chat itself can't be copied). Up to 5 a day, only ever to their own inbox.
async function mavEmail(req, env, ctx) {
  const em = await member(req, env); if (!em) return Response.json({ ok: false, error: "Sign in first" }, { status: 401 });
  const k = `mavmail:${em}:${todayISO()}`, n = +(await env.DATA.get(k) || 0); if (n >= 5) return Response.json({ ok: false, error: "That's 5 today, try tomorrow" }, { status: 429 });
  let j = {}; try { j = await req.json(); } catch (e) {}
  const msgs = (Array.isArray(j.messages) ? j.messages : []).slice(-12).map(m => `${m.role === "user" ? "You" : "Mav"}: ${String(m.content || "").replace(/[\r\n]+/g, " ").slice(0, 500)}`).filter(x => !x.endsWith(": …"));
  if (!msgs.length) return Response.json({ ok: false, error: "Nothing to send yet" });
  if (!env.MAILER) return Response.json({ ok: false, error: "Email's not switched on yet" });
  try {
    const { EmailMessage } = await import("cloudflare:email"), from = `mav@${R.domain}`;
    const body = `G'day from Mav,\n\nHere's our chat on ${R.brand}:\n\n${msgs.join("\n\n")}\n\nAnything else? Just ask me on https://${R.domain}/\n\nMav\n${R.brand}, powered by Maverick Digital`;
    const raw = [`From: Mav at ${R.brand} <${from}>`, `To: ${em}`, `Subject: Your chat with Mav`, `Message-ID: <${crypto.randomUUID()}@${R.domain}>`, `Date: ${new Date().toUTCString()}`, "MIME-Version: 1.0", "Content-Type: text/plain; charset=utf-8", "", body].join("\r\n");
    await env.MAILER.send(new EmailMessage(from, em, raw)); await env.DATA.put(k, String(n + 1), { expirationTtl: 172800 });
    return Response.json({ ok: true });
  } catch (e) { console.log("mav email", e); return Response.json({ ok: false, error: "Couldn't send, try again later" }); }
}
// Everything Mav sets is checked here first. Anything not on this list is dropped.
function cleanActs(list, ids, live) {
  const nm = s => String(s || "").replace(/[^\p{L} '-]/gu, "").trim().slice(0, 24), low = s => String(s || "").trim().toLowerCase();
  const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const sign = (sys, v) => { const x = low(v).replace(/^year of the /, "").replace(/sheep|ram/, "goat").replace(/chicken/, "rooster");
    const w = WEST.findIndex(s => low(s[1]) === x), vd = VEDIC.findIndex(s => low(s[1]) === x || low(s[2]) === x), e = EAST.findIndex(s => low(s[1]) === x);
    if (sys === "e" || (!sys && e > -1)) return e > -1 ? { system: "e", index: e } : null;
    if (sys === "v" || (!sys && VEDIC.some(s => low(s[1]) === x))) return vd > -1 ? { system: "v", index: vd } : null;
    return w > -1 ? { system: "w", index: w } : null; };
  return (Array.isArray(list) ? list : []).filter(a => a && typeof a === "object").map(a => {
    const sec = (arr, noToday) => (Array.isArray(arr) ? arr : []).filter(i => ids.includes(i) && !(noToday && i === "today"));
    switch (a.type) {
      case "pin": case "show": { const s = sec(a.ids, true); return s.length ? { type: "show", ids: s } : null; }
      case "hide": { const s = sec(a.ids, true); return s.length ? { type: "hide", ids: s } : null; }
      case "reset": return { type: "reset" };
      case "name": return nm(a.value) ? { type: "name", value: nm(a.value) } : null;
      case "area": return live.includes(String(a.pc)) ? { type: "area", pc: String(a.pc) } : null;
      case "fuel": return FUELS[a.value] ? { type: "fuel", value: a.value } : null;
      case "sign": { const s = sign(["w", "v", "e"].includes(a.system) ? a.system : "", a.value); return s ? { type: "sign", ...s } : null; }
      case "weather": if (a.here) return { type: "weather", here: true }; return live.includes(String(a.pc)) ? { type: "weather", lat: TOWNS[a.pc].lat, lon: TOWNS[a.pc].lon } : null;
      case "bins": { const d = typeof a.day === "number" ? a.day : DAYS.findIndex(x => low(a.day).startsWith(x.slice(0, 3))); return d >= 0 && d <= 6 ? { type: "bins", day: d } : null; }
      case "school": { const s = SCHOOLS.find(x => low(x) === low(a.value)) || SCHOOLS.find(x => low(a.value).length > 3 && low(x).includes(low(a.value))); return s ? { type: "school", value: s } : null; }
      case "birthday": { const d = +a.day, m = +a.month; return d >= 1 && d <= 31 && m >= 1 && m <= 12 ? { type: "birthday", day: d, month: m } : null; }
      case "search": { const v = String(a.value || "").replace(/[<>]/g, "").trim().slice(0, 60); return v.length > 1 ? { type: "search", value: v.toLowerCase() } : null; }
      case "alerts": return ["alerts", "fields"].includes(a.topic) ? { type: "alerts", topic: a.topic } : null;
      case "events": return { type: "events", likes: (Array.isArray(a.likes) ? a.likes : []).filter(x => LIKES.includes(x)) };
      case "friend": { const n = nm(a.name), tz = String(a.tz || ""); if (!n || !/^[A-Za-z_]+(\/[A-Za-z_+-]+){1,2}$/.test(tz)) return null;
        try { new Intl.DateTimeFormat("en-AU", { timeZone: tz }); } catch (e) { return null; }
        return { type: "friend", name: n, tz, city: String(a.city || "").replace(/[<>]/g, "").slice(0, 40) }; }
      case "unfriend": return nm(a.name) ? { type: "unfriend", name: nm(a.name) } : null;
      case "person": { const n = nm(a.name), d = +a.day, m = +a.month; return n && d >= 1 && d <= 31 && m >= 1 && m <= 12 ? { type: "person", name: n, day: d, month: m, likes: String(a.likes || "").replace(/[<>]/g, "").slice(0, 80) } : null; }
      case "remind": { const t = String(a.text || "").replace(/[<>]/g, "").trim().slice(0, 80), d = String(a.date || ""); return t.length > 2 && /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(new Date(d)) ? { type: "remind", text: t, date: d } : null; }
      case "unremind": { const t = String(a.text || "").replace(/[<>]/g, "").trim().slice(0, 80); return t.length > 1 ? { type: "unremind", text: t } : null; }
      case "unperson": return nm(a.name) ? { type: "unperson", name: nm(a.name) } : null;
      case "link": return /^\/[a-z0-9/#?=&-]*$/i.test(a.url || "") ? { type: "link", url: a.url } : null;
      case "wine": { const v = String(a.value || "").replace(/[<>]/g, "").trim().slice(0, 60); return v.length > 2 ? { type: "wine", value: v } : null; }
      case "beer": { const v = String(a.value || "").replace(/[<>]/g, "").trim().slice(0, 60); return v.length > 2 ? { type: "beer", value: v } : null; }
      case "watch": case "unwatch": { const v = String(a.item || "").replace(/[<>]/g, "").trim().slice(0, 50); return v.length > 2 ? { type: a.type, item: v } : null; }
      default: return null;
    }
  }).filter(Boolean).slice(0, 8);
}
// ---- My page (account settings): the manual way, laid out by the paper's parent sections. Mav can pre-fill it; nothing sticks until Save. ----
const READFOR = [["news", "📰 Local news"], ["rip", "🕊️ Death notices"], ["events", "🎪 What's on"], ["weather", "⛅ Weather & tides"], ["sport", "🏉 Sport"], ["council", "🏛️ Council"], ["deals", "🛒 Prices & deals"], ["jobs", "💼 Jobs & renting"], ["family", "🧒 Things for the kids"], ["puzzles", "🧩 Puzzles & stars"]];
function settingsPage(first) {
  const ids = SECTIONS.map(x => x[0]).filter(id => id !== "today"), lab = id => SECTIONS.find(x => x[0] === id)[1], seen = new Set();
  const groups = NAV.map(n => [n.icon + " " + n.name, n.items.map(i => i[0]).filter(h => h.startsWith("#")).map(h => h.slice(1)).filter(id => ids.includes(id) && !seen.has(id) && seen.add(id))]).filter(g => g[1].length);
  const rest = ids.filter(id => !seen.has(id)); if (rest.length) groups.push(["➕ More", rest]);
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return page(`${first ? esc(first) + "'s" : "My"} ${R.code}`, `<h1>⚙️ ${first ? esc(first) + "&rsquo;s" : "My"} settings</h1>
<p>Easiest way: just tell Mav. Like setting things yourself? It's all here. The paper stays the same for everyone; this only decides what&rsquo;s on <b>your</b> page. <a href="/${R.code}#foryou">See your page →</a></p>
<form id="setf" class="setf">
<h2>👋 About you</h2><p class="mute">No age, no address. Just enough so Mav knows what you&rsquo;d like to read.</p>
<label>First name<br><input name="name" maxlength="24" autocomplete="given-name"></label>
<p><b>What do you read the paper for?</b></p><div class="chips">${READFOR.map(([v, l]) => `<label><input type="checkbox" name="readfor" value="${v}"> ${l}</label>`).join("")}</div>
<label>Favourite singer or kind of music<br><input name="music" maxlength="80" placeholder="e.g. Slim Dusty, country"></label>
<label>Favourite TV show<br><input name="tv" maxlength="80" placeholder="e.g. Gardening Australia"></label>
<label>What do you like doing on the weekend?<br><input name="weekend" maxlength="160" placeholder="e.g. fishing, the markets, walking the dog"></label>
<div class="row"><label>Kids at home?<br><select name="kids"><option value="">Rather not say</option><option>Yes</option><option>No</option></select></label>
<label>Got a dog?<br><select name="dog"><option value="">Rather not say</option><option>Yes</option><option>No</option></select></label></div>
<p><button type="button" id="mavfill">✨ Let Mav fill it in</button> <small class="mute">He ticks what suits you below. You check it, then Save.</small></p>
<h2>📅 Your reminders</h2><p class="mute">Tell Mav what you need to do. Your page links you straight to the local help, numbers ready. Stays on this phone only.</p><ul id="tdl" class="setlist"></ul>
<h2>🎂 Your people</h2><p class="mute">Birthdays to remember, and what they like. Mav reminds you on your page, with local gift ideas. Stays on this phone only.</p>
<ul id="ppl" class="setlist"></ul>
<div class="row"><input name="pn" maxlength="24" placeholder="Who? e.g. Dad"><select name="pd" aria-label="Day"><option value="">Day</option>${Array.from({ length: 31 }, (_, i) => `<option>${i + 1}</option>`).join("")}</select><select name="pm" aria-label="Month"><option value="">Month</option>${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => `<option value="${i + 1}">${m}</option>`).join("")}</select></div>
<input name="pl" maxlength="80" placeholder="What do they like? e.g. fishing, country music" style="width:100%"><p><button type="button" id="padd" class="ghost">+ Add</button></p>
<h2>🎯 What you like doing</h2><div class="chips">${LIKES.map(l => `<label><input type="checkbox" name="like" value="${l}"> ${l[0].toUpperCase() + l.slice(1)}</label>`).join("")}</div>
<h2>📰 On my page</h2><p class="mute">Untick what you don&rsquo;t read. <a href="#" id="setall">Tick all</a></p>
${groups.map(([h, its]) => `<fieldset class="setg"><legend>${esc(h)}</legend>${its.map(id => `<label><input type="checkbox" name="sec" value="${id}"> ${esc(lab(id))}</label>`).join("")}</fieldset>`).join("")}
<h2>🧾 Your details</h2><div class="row">
<label>Star sign<br><select name="zw"><option value="">Pick…</option>${WEST.map((x, k) => `<option value="${k}">${x[0]} ${x[1]}</option>`).join("")}</select></label>
<label>Fuel<br><select name="fuel"><option value="">Pick…</option>${Object.entries(FUELS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
<label>Bin night<br><select name="bins"><option value="">Pick…</option>${DAYS.map((d, i) => `<option value="${i}">${d}</option>`).join("")}</select></label></div>
<div class="setbar"><button>💾 Save</button> <span id="setmsg" class="mute" role="status"></span></div>
</form>
<p class="mute">More: <a href="/home">bin details</a> · <a href="/school">school run</a> · <a href="/birthday">birthday deals</a> · <a href="/kids/parent">Kid Zone secret word</a></p>
<p class="mute"><a href="#" id="setreset">↺ Start fresh</a> · <a href="/signout"><b>Sign out</b></a></p>
<script>addEventListener("DOMContentLoaded",function(){${SETTINGS_JS}})<\/script>`, R.code);
}
// Mav reads someone's "About you" answers (and what they read) and suggests what to show or hide. Suggests only; nothing is saved here.
async function mavSuggest(req, env) {
  let j = {}; try { j = await req.json(); } catch (e) {}
  const pr = j.profile && typeof j.profile === "object" ? j.profile : {}, text = JSON.stringify(pr).slice(0, 900);
  if (mavGuard(text)) return Response.json({ error: "Mav can only help with your page here." });
  const ids = SECTIONS.map(x => x[0]).filter(id => id !== "today"), rf = Array.isArray(pr.readfor) ? pr.readfor : [];
  const reads = j.reads && typeof j.reads === "object" ? Object.keys(j.reads).filter(id => ids.includes(id) && +j.reads[id] >= 2) : [];
  const MAP = { news: ["news", "alerts", "numbers"], rip: ["bdm"], events: ["events", "tonight"], weather: ["sea", "beaches"], sport: ["sport"], council: ["council", "know", "bypass"], deals: ["fuel", "alcohol", "rates"], jobs: ["jobs", "rent"], family: ["kids", "award"], puzzles: ["puzzles", "stars"] };
  const base = { show: [...new Set([...rf.flatMap(v => MAP[v] || []), ...reads])], hide: [], likes: [], say: "Mav ticked what matches what you read." };
  const t = text.toLowerCase(); if (/country|music|band|gig|singer/.test(t) || pr.music) base.likes.push("music"); if (/fish/.test(t)) base.show.push("sea"); if (/market/.test(t)) base.likes.push("markets"); if (pr.kids === "Yes") base.likes.push("kids"); if (pr.dog === "Yes") base.show.push("dogs");
  if (!env.AI || (!rf.length && !pr.music && !pr.tv && !pr.weekend)) return Response.json(base);
  try {
    const r = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", { max_tokens: 300, messages: [{ role: "system", content: `You tailor a local daily paper for ${R.place}. Sections (id = name): ${ids.map(id => `${id} = ${SECTIONS.find(x => x[0] === id)[1]}`).join("; ")}. Interests: ${LIKES.join(", ")}. From the reader's answers, reply ONLY JSON: {"show":[ids they'd read],"hide":[ids they clearly wouldn't],"likes":[interests],"say":"one short friendly sentence"}. Be gentle: only hide what clearly doesn't fit.` }, { role: "user", content: text }] });
    const o = JSON.parse(String(typeof r.response === "string" ? r.response : JSON.stringify(r.response)).match(/\{[\s\S]*\}/)[0]);
    const ok = a => (Array.isArray(a) ? a : []).filter(id => ids.includes(id)), show = [...new Set([...base.show, ...ok(o.show)])];
    return Response.json({ show, hide: ok(o.hide).filter(id => !show.includes(id)), likes: [...new Set([...base.likes, ...(Array.isArray(o.likes) ? o.likes : []).filter(x => LIKES.includes(x))])], say: mavGuard(String(o.say || "")) ? base.say : String(o.say || base.say).slice(0, 160) });
  } catch (e) { return Response.json(base); }
}
// Mav: a friendly, faceless local in a beanie and his noise-cancelling headphones. Human, but not anyone.
const MAV_SVG_BASE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#EAF0F8"/><path d="M10 64c2-12 11-17 22-17s20 5 22 17z" fill="#141414"/><path d="M27 42h10v7c-3 2-7 2-10 0z" fill="#B97F52"/><circle cx="32" cy="31" r="13" fill="#C9915F"/><path d="M18.5 29c0-10 6-16 13.5-16s13.5 6 13.5 16z" fill="#F2B705"/><rect x="17.5" y="25" width="29" height="6" rx="3" fill="#D99E00"/><circle cx="32" cy="12" r="3.2" fill="#F2B705"/><path d="M28 37.5q4 3 8 0" fill="none" stroke="#7A4A2A" stroke-width="1.8" stroke-linecap="round"/><path d="M17 31c0-14 6.5-21 15-21s15 7 15 21" fill="none" stroke="#0B1526" stroke-width="3"/><rect x="13" y="27" width="7" height="12" rx="3.5" fill="#0B1526"/><rect x="44" y="27" width="7" height="12" rx="3.5" fill="#0B1526"/></svg>`;
// Mav's moods: the same face everywhere, with a big smile for a thumbs up and a facepalm for a thumbs down.
const mavSvg = (m = "") => m === "happy" ? MAV_SVG_BASE.replace('<path d="M28 37.5q4 3 8 0" fill="none" stroke="#7A4A2A" stroke-width="1.8" stroke-linecap="round"/>', '<path d="M25 34.5q7 9 14 0z" fill="#5a2e1a"/><path d="M26 35.2q6 3 12 0v.6q-6 3-12 0z" fill="#fff"/><circle cx="23.5" cy="34" r="1.6" fill="#e88a6a" opacity=".6"/><circle cx="40.5" cy="34" r="1.6" fill="#e88a6a" opacity=".6"/>')
  : m === "facepalm" ? MAV_SVG_BASE.replace('<path d="M28 37.5q4 3 8 0" fill="none" stroke="#7A4A2A" stroke-width="1.8" stroke-linecap="round"/>', '<path d="M28.5 39.5q3.5-2.4 7 0" fill="none" stroke="#7A4A2A" stroke-width="1.8" stroke-linecap="round"/><path d="M21 24.5c3-2.5 8-3 12-2.2l6.5 1.5c1.8.4 2 2.6.3 3.2l-1.2.4 1.4.6c1.6.7 1.2 2.9-.5 3l-1.6.1.9.9c1.2 1.2.1 3.1-1.5 2.7L24 31.8c-3-.8-4.6-4.5-3-7.3z" fill="#B97F52" stroke="#7A4A2A" stroke-width=".8"/><path d="M24 33l-4 13" stroke="#B97F52" stroke-width="5" stroke-linecap="round"/>')
  : MAV_SVG_BASE;
const MAV_SVG = mavSvg();
const MAV_WIDGET = () => `<button type="button" id="mavbtn" aria-label="Ask Mav"><span class="mavav" aria-hidden="true"></span>Ask Mav</button>
<div id="mavp" hidden role="dialog" aria-label="Chat with Mav"><div class="mavh"><b><span class="mavav" aria-hidden="true"></span>Mav</b><span class="mavtools"><button type="button" id="mavreset" title="Put my page back to normal">↺ Start fresh</button><a href="/me" class="mavall">⚙️ My settings</a><a href="/signout" class="mavout" hidden>Sign out</a></span><button type="button" id="mavx" aria-label="Close">×</button></div>
<div id="mavlog"></div><p id="mavst" class="mavst" hidden></p><div class="mavtalk"><button type="button" id="mavbig" class="micb">🎤 Tap and tell Mav</button></div><div class="chips" id="mavchips"><label>Hide what I don't read</label><label>I love trivia and live music</label><label>Remind me of Dad’s birthday</label><label>Remind me to take the dog to the vet Friday</label><label>Start my page fresh</label></div>
<p class="mavmailw"><button type="button" id="mavmail" class="ghost" hidden>📧 Email me this chat</button></p>
<form id="mavf"><button type="button" id="mavmic" aria-label="Talk">🎤</button><input id="mavin" placeholder="Tell Mav…" autocomplete="off" maxlength="500"><button>Send</button></form></div>
<script>try{if(/(?:^|; )m2450n=/.test(document.cookie))document.querySelector('.mavout').hidden=false}catch(e){}<\/script>
<script>addEventListener('DOMContentLoaded',function(){setTimeout(function(){${FORYOU_JS}},0)})<\/script>
<script>${MAV_JS}<\/script>`;

// ---- Renting and Jobs: every site in one place, searched for this town. We only link; nobody pays to be listed. ----
function dirSection(id, title, intro, groups, href, more) {
  const top = groups[0][3].slice(0, 4);
  return `<section id="${id}"><h2>${title}</h2><p class="mute">${esc(intro)}</p><ul>${top.map(([n, u, d]) => `<li><a href="${esc(u)}" rel="noopener">${esc(n)}</a>: ${esc(d)}</li>`).join("")}</ul><p><a href="${href}"><b>${esc(more)} →</b></a></p></section>`;
}
function dirPage(kind) {
  const rent = kind === "rent", groups = rent ? rentGroups(R) : jobGroups(R);
  return page(`${rent ? "Renting" : "Jobs"} in ${R.place}: ${R.brand}`, `<p class="mute"><a href="/${R.code}">‹ ${R.code} ${R.place}</a></p>
<h1>${rent ? "🏠 Renting in " : "💼 Jobs in "}${esc(R.place)}</h1>
<p>${rent ? `There are so many rental sites out there. Here they all are in one place, already searched for ${esc(R.place)}, plus where to go for your rights, your bond and help with rent.` : `There are so many job sites out there, and plenty of local employers only post jobs on their own websites. Here they all are in one place, already searched for ${esc(R.place)}.`}</p>
${directoryBody(groups, esc)}
<div class="note">${rent ? "Know a rental site or local agent we've missed?" : "Local business with jobs on your own website? Know a job site we've missed?"} <a href="/feedback">Tell us and we'll add it</a>. Free, always.</div>
<p class="src">We only link to these sites; we don&rsquo;t edit or check their listings. Nobody pays to be here. Links checked 17 October 2026.</p>`);
}

// ---- Locals choose what we watch. Signed-in locals nominate an item for Supermarket, Beer or Wine watch and vote.
// WATCH_GOAL votes and it goes live by itself (no one has to check): it joins the table, and an announcement goes up.
const WATCH_GOAL = 50;
const WKINDS = { shop: ["Supermarket watch", "Vegemite 380g", "#shop"], alcohol: ["Grog watch", "Great Northern Original 24 cans", "#alcohol"], beer: ["Grog watch", "Great Northern Original 24 cans", "#alcohol"], wine: ["Grog watch", "Jacob's Creek Shiraz 750ml", "#alcohol"] };
const itemKey = s => String(s || "").toLowerCase().replace(/(\d)\s+(g|kg|ml|l|pk|pack)\b/g, "$1$2").replace(/[^a-z0-9.\- ]/g, " ").replace(/\s+/g, " ").trim().slice(0, 50);
const wnoms = async (env, kind) => (await env.DATA.get(`wnoms:${kind}`, "json")) || {};
const alcNoms = async env => ({ ...(await wnoms(env, "wine")), ...(await wnoms(env, "beer")), ...(await wnoms(env, "alcohol")) }); // Beer and Wine watch ideas carry over
const wHash = async s => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))].slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("");
async function wScreen(env, kind, text) { // AI check so nothing rude or silly goes up without a person checking. Says no if unsure.
  try {
    const r = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", { messages: [
      { role: "system", content: `Answer only YES or NO. Is the text a real, specific product a person could buy at ${kind === "shop" ? "an Australian supermarket" : "an Australian bottle shop"}, with nothing rude, hateful, personal, political or spammy in it?` },
      { role: "user", content: text }] });
    return /^\s*yes\b/i.test(String(r.response || ""));
  } catch (e) { return false; }
}
async function nominateWatch(env, kind, em, text) { // returns { ok, msg, item }
  const all = kind === "alcohol" ? await alcNoms(env) : await wnoms(env, kind), me = await wHash(em), clean = String(text || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 50), id = itemKey(clean);
  if (id.length < 3) return { ok: false, msg: `Tell us the product and size, like ${WKINDS[kind][1]}.` };
  if (!all[id]) {
    if (Object.values(all).filter(n => n.by === me && !n.live).length >= 3) return { ok: false, msg: "You've got 3 ideas waiting for votes. Give them time to catch on first." };
    if (!(await wScreen(env, kind, clean))) return { ok: false, msg: `That doesn't look like something we can watch. Try the product name and size, like ${WKINDS[kind][1]}.` };
    all[id] = { text: clean, voters: [], by: me, at: new Date().toISOString() };
  }
  const n = all[id], fresh = !n.voters.includes(me);
  if (fresh) n.voters.push(me);
  if (!n.live && n.voters.length >= WATCH_GOAL) {
    n.live = new Date().toISOString();
    await env.DATA.put(`ann:${n.live}`, JSON.stringify({ text: `You voted, we're watching it: ${n.text} is now in ${WKINDS[kind][0]}`, votes: n.voters.length, link: `/${R.code}${WKINDS[kind][2]}`, at: n.live }));
  }
  await env.DATA.put(`wnoms:${kind}`, JSON.stringify(all));
  const left = WATCH_GOAL - n.voters.length, extra = kind === "alcohol" ? " " + await alcCanCant(env, n.text) : "";
  return { ok: true, item: n, msg: (n.live ? `${n.text} is live in ${WKINDS[kind][0]}.` : `${fresh ? "Vote counted" : "You've already voted"} for ${n.text}. ${left} more vote${left === 1 ? "" : "s"} and we watch it.`) + extra };
}
async function cwatchApi(req, env, url) {
  let kind = WKINDS[url.searchParams.get("kind")] ? url.searchParams.get("kind") : "shop"; if (kind === "beer" || kind === "wine") kind = "alcohol"; const em = await member(req, env);
  let msg = "";
  if (req.method === "POST") {
    if (!em) return Response.json({ error: "signin" }, { status: 401 });
    let b = {}; try { b = await req.json(); } catch (e) {}
    const all = kind === "alcohol" ? await alcNoms(env) : await wnoms(env, kind), r = await nominateWatch(env, kind, em, b.id && all[b.id] ? all[b.id].text : b.text);
    if (!r.ok) return Response.json({ error: r.msg }, { status: 400 });
    msg = r.msg;
  }
  const all = kind === "alcohol" ? await alcNoms(env) : await wnoms(env, kind), me = em ? await wHash(em) : "";
  const items = Object.entries(all).map(([id, n]) => ({ id, text: n.text, votes: n.voters.length, live: !!n.live, mine: n.voters.includes(me) }))
    .sort((a, b) => a.live - b.live || b.votes - a.votes || a.text.localeCompare(b.text));
  return Response.json({ kind, goal: WATCH_GOAL, signedIn: !!em, msg, items }, { headers: { "cache-control": "no-store" } });
}
// The voting panel under each watch. Live items show in the watch itself; this lists the ones still collecting votes.
const cwatchPanel = kind => `<div class="cw" data-kind="${kind}"><h3>🗳️ You choose what we watch</h3><p class="mute">Suggest something for ${WKINDS[kind][0]}, or vote for a local&rsquo;s idea. <b>${WATCH_GOAL} votes and it goes up</b>, all by itself.</p><div class="cwl mute">Loading ideas…</div>
<form class="cwf row"><input maxlength="50" placeholder="e.g. ${esc(WKINDS[kind][1])}" aria-label="Suggest an item"><button>Suggest</button></form><p class="cwm mute" role="status"></p></div>`;
const CWATCH_JS = `(function(){var e=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
document.querySelectorAll('.cw').forEach(function(P){if(P.dataset.on)return;P.dataset.on=1;var k=P.dataset.kind,L=P.querySelector('.cwl'),M=P.querySelector('.cwm'),F=P.querySelector('.cwf');
function draw(j){if(j.msg)M.textContent=j.msg;var o=j.items.filter(function(i){return !i.live});
L.className='cwl';L.innerHTML=o.length?'<ul class="ideas">'+o.map(function(i){return '<li class="idea"><button type="button" class="vote'+(i.mine?' on':'')+'" data-id="'+e(i.id)+'"'+(i.mine?' disabled':'')+'>👍 <b>'+i.votes+'</b></button><div><span>'+e(i.text)+'</span><div class="bar"><i style="width:'+Math.min(100,Math.round(i.votes/j.goal*100))+'%"></i></div><small class="mute">'+(j.goal-i.votes)+' more votes and we watch it</small></div></li>'}).join('')+'</ul>':'<p class="mute">No ideas waiting yet. Be the first.</p>';
L.querySelectorAll('.vote').forEach(function(b){b.onclick=function(){send({id:b.dataset.id})}})}
function send(body){if(!window._cwIn){location.href='/signin?next='+encodeURIComponent(location.pathname+'#'+P.parentNode.id);return}M.textContent='Counting…';
fetch('/api/cwatch?kind='+k,{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json()}).then(function(j){if(j.error){M.textContent=j.error=='signin'?'Sign in free to vote.':j.error;return}draw(j)}).catch(function(){M.textContent='Couldn’t reach us just now. Try again.'})}
F.onsubmit=function(ev){ev.preventDefault();var i=F.querySelector('input'),v=i.value.trim();if(!v)return;send({text:v});i.value=''};
fetch('/api/cwatch?kind='+k,{credentials:'same-origin'}).then(function(r){return r.json()}).then(function(j){window._cwIn=j.signedIn;if(!j.signedIn)F.querySelector('button').textContent='Sign in to suggest';draw(j);P.dispatchEvent(new CustomEvent('cwlive',{detail:j.items.filter(function(i){return i.live})}))}).catch(function(){L.textContent=''})})})();`;
// Live supermarket picks are price-checked at Woolworths and ALDI twice a day (6am and 2pm), a few items each run.
async function refreshShopList(env) {
  const all = await wnoms(env, "shop"), keys = Object.keys(all).filter(k => all[k].live).sort().slice(0, 300);
  const x = (await env.DATA.get("shopx", "json")) || {}, slot = d => { const t = new Date(new Date(d).toLocaleString("en-US", { timeZone: "Australia/Sydney" })), h = t.getHours(); if (h < 6) t.setDate(t.getDate() - 1); return t.toDateString() + (h >= 6 && h < 14 ? " am" : " pm"); };
  const due = keys.filter(k => !x[k] || slot(x[k].at) !== slot(Date.now())).slice(0, 8);
  for (const k of due) {
    const words = k.split(" ").filter(w => w.length > 1), re = { test: n => { const t = itemKey(n); return words.every(w => t.includes(w)); } }, it = { q: all[k].text, re }, now = new Date().toISOString(), row = { at: now, label: all[k].text };
    for (const st of ["w", "a"]) { let r = null; try { r = st === "w" ? await shopWoolies(it) : await shopAldi(it); } catch (e) {}
      const prev = x[k] && x[k][st]; if (r) row[st] = { ...r, prev: prev && prev.price !== r.price ? prev.price : (prev && prev.prev) || 0 }; else if (prev) row[st] = { ...prev, stale: true }; }
    x[k] = row;
  }
  Object.keys(x).forEach(k => all[k]?.live || delete x[k]);
  await env.DATA.put("shopx", JSON.stringify(x));
}

// ---- Time saved: people tell us how long a job took before and how long it takes now with our tool. We add it up and show it. ----
const TS_TOOLS = { daily: "Your Daily Maverick", "/open": "Open now?", "/fridge": "What's in your fridge?", "/school": "School run check", "/birthday": "Birthday deals",
  "/rent": "Renting", "/jobs": "Jobs", "/genalpha": "Gen Alpha interpreter", "/home": "My home", "/notices": "Community notice board", "/bdm": "Births, Deaths and Marriages", "/watch": "What are you binging?" };
const tsHours = m => { const h = m / 60; return h >= 10 ? Math.round(h).toLocaleString("en-AU") : h >= 1 ? h.toFixed(1) : Math.round(m) + " min"; };
const tsH = m => { const t = tsHours(m); return /min$/.test(t) ? t : t + (t === "1.0" ? " hour" : " hours"); };
async function timeApi(req, env, url) {
  if (req.method !== "POST") {
    const t = url.searchParams.get("tool"), tot = (await env.DATA.get("ts:total", "json")) || { n: 0, mins: 0 };
    const a = TS_TOOLS[t] ? await env.DATA.get("ts:" + t, "json") : null;
    return Response.json({ total: tot, tool: a && a.n >= 3 ? { n: a.n, before: Math.round(a.before / a.n), after: Math.round(a.after / a.n), mins: a.mins } : null }, { headers: { "cache-control": "no-store" } });
  }
  let j = {}; try { j = await req.json(); } catch (e) {}
  const t = String(j.tool || ""), b = Math.round(+j.before), a = Math.round(+j.after), f = +j.freq;
  if (!TS_TOOLS[t] || !(b >= 1 && b <= 600) || !(a >= 0 && a <= b) || ![7, 3, 1, 0.25].includes(f)) return Response.json({ error: "Check your numbers" }, { status: 400 });
  let id = cookie(req, "tsid"); const fresh = !/^[a-f0-9-]{36}$/.test(id || ""); if (fresh) id = crypto.randomUUID();
  const k = `tsv:${t}:${id}`, prev = await env.DATA.get(k, "json"), w = (b - a) * f, now = { b, a, f, w, at: new Date().toISOString() };
  const agg = (await env.DATA.get("ts:" + t, "json")) || { n: 0, mins: 0, before: 0, after: 0 }, tot = (await env.DATA.get("ts:total", "json")) || { n: 0, mins: 0 };
  if (prev) { agg.n--; agg.mins -= prev.w; agg.before -= prev.b; agg.after -= prev.a; tot.n--; tot.mins -= prev.w; }
  agg.n++; agg.mins += w; agg.before += b; agg.after += a; tot.n++; tot.mins += w;
  await Promise.all([env.DATA.put(k, JSON.stringify(now)), env.DATA.put("ts:" + t, JSON.stringify(agg)), env.DATA.put("ts:total", JSON.stringify(tot))]);
  const h = new Headers({ "content-type": "application/json" }); if (fresh) h.append("set-cookie", `tsid=${id}; Path=/; Max-Age=63072000; Secure; SameSite=Lax`);
  return new Response(JSON.stringify({ ok: true, week: w, total: tot }), { headers: h });
}
async function tsLine(env) {
  const t = await env.DATA.get("ts:total", "json");
  return t && t.mins > 0 ? `<p class="note">⏱️ Locals have saved <b>${tsH(t.mins)} a week</b> with these tools, about <b>${tsH(t.mins * 52)} a year</b>. <a href="/timesaved">See where the time goes</a></p>` : "";
}
async function timeSavedPage(env) {
  const tot = (await env.DATA.get("ts:total", "json")) || { n: 0, mins: 0 }, rows = [];
  for (const [k, n] of Object.entries(TS_TOOLS)) { const a = await env.DATA.get("ts:" + k, "json"); if (a && a.n > 0) rows.push([k, n, a]); }
  rows.sort((x, y) => y[2].mins - x[2].mins);
  return page(`Time saved: ${R.brand}`, `<p class="mute"><a href="/${R.code}">‹ ${R.code} ${R.place}</a></p><h1>⏱️ Time saved</h1>
<p>Every tool here exists to give you time back. So we ask: how long did this take you before, and how long now? Here&rsquo;s what locals have told us.</p>
${tot.mins > 0 ? `<div class="tiles"><div class="tile"><b>${tsHours(tot.mins)}</b><small>${/min$/.test(tsHours(tot.mins)) ? "saved a week" : "hours saved a week"}</small></div><div class="tile"><b>${tsHours(tot.mins * 52)}</b><small>${/min$/.test(tsHours(tot.mins * 52)) ? "saved a year" : "hours saved a year"}</small></div><div class="tile"><b>${tot.n}</b><small>answers so far</small></div></div>` : `<p class="note">No answers yet. Use a tool, then tell us how much time it saved you at the bottom of its page.</p>`}
${rows.length ? `<div class="tscroll"><table class="shopt"><thead><tr><th>Tool</th><th>Before</th><th>Now</th><th>Saved a week</th></tr></thead><tbody>${rows.map(([k, n, a]) => `<tr><th scope="row">${k === "daily" ? esc(n) : `<a href="${k}">${esc(n)}</a>`}</th>${a.n >= 3 ? `<td>${Math.round(a.before / a.n)} min</td><td>${Math.round(a.after / a.n)} min</td>` : `<td class="mute" colspan="2">needs 3 answers</td>`}<td>${tsH(a.mins)}</td></tr>`).join("")}</tbody></table></div>` : ""}
<p class="src">From what people tell us at the bottom of each tool. Averages show once a tool has 3 answers, so nobody&rsquo;s own answer can be picked out. One answer per tool per device; answering again replaces your last one.</p>`);
}
const TS_JS = `(function(){var T=${JSON.stringify(TS_TOOLS)},p=location.pathname.replace(/\\/$/,'')||'/',k=T[p]?p:(/^\\/(\\d{4})?$/.test(p)?'daily':null);if(!k)return;var f=document.querySelector('footer');if(!f)return;
var d=document.createElement('section');d.id='timesaved';d.className='tsbox';d.innerHTML='<details><summary>⏱️ Did this save you time? Tell us</summary><p class="mute">We add it to the time we&rsquo;ve saved locals. Takes 10 seconds.</p><form class="tsf"><label>Before, it took me <input name="b" type="number" min="1" max="600" inputmode="numeric" required style="width:5em"> min</label><label>Now it takes <input name="a" type="number" min="0" max="600" inputmode="numeric" required style="width:5em"> min</label><label>I do this <select name="f"><option value="7">every day</option><option value="3">a few times a week</option><option value="1" selected>once a week</option><option value="0.25">once a month</option></select></label><button>Count my time saved</button></form></details><p class="tsmsg mute"></p>';
f.parentNode.insertBefore(d,f);var M=d.querySelector('.tsmsg'),H=function(m){var h=m/60;return h>=10?Math.round(h)+' hours':h>=1?h.toFixed(1)+' hours':Math.round(m)+' min'};
fetch('/api/timesaved?tool='+encodeURIComponent(k)).then(function(r){return r.json()}).then(function(j){var s=[];if(j.tool)s.push('Locals say this used to take '+j.tool.before+' min and now takes '+j.tool.after+' min.');if(j.total&&j.total.mins>0)s.push('All up, locals have saved '+H(j.total.mins)+' a week.');if(s.length)M.textContent=s.join(' ')}).catch(function(){});
d.querySelector('form').addEventListener('submit',function(e){e.preventDefault();var F=e.target,b=+F.b.value,a=+F.a.value;if(a>b){M.textContent='Now should be less than before. If it takes longer, tell us how to fix it at /feedback.';return}
fetch('/api/timesaved',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({tool:k,before:b,after:a,freq:+F.f.value})}).then(function(r){return r.json()}).then(function(j){if(!j.ok){M.textContent=j.error||'Something went wrong.';return}
M.innerHTML='<b>You save '+H(j.week)+' a week, about '+H(j.week*52)+' a year.</b> Thanks for telling us. All up, locals have saved '+H(j.total.mins)+' a week.'}).catch(function(){M.textContent='Something went wrong. Try again?'})})})();`;

// ---- Memberships: honest terms, no tricks. Three choices (see billing.js):
//   Free for life (no sign-in) · Some Cool Things (free with your email) · Every Cool Thing ($49 a year).
// Founding Members (the first 15,000 locals to sign in) lock in $49 a year for Every Cool Thing, for life.
const FOUNDING_PRICE = TIERS.every.founding, PRICE = TIERS.every.price, FOUNDING_SPOTS = LOCALS_GOAL;
async function membershipPage(env, req, url) { const n = await localsCount(env), left = Math.max(0, FOUNDING_SPOTS - n), on = paymentsOn(env);
  const em = await member(req, env), tier = em ? await tierOf(env, em) : "free", need = url.searchParams.get("need"), welcome = url.searchParams.get("welcome");
  const mine = t => tier === t || (!on && em && t === "some");
  const card = (t, title, price, tag, items, cta) => `<div class="tier${mine(t) ? " mine" : ""}${t === "every" ? " hot" : ""}"><h2>${title}</h2><p class="tprice">${price}</p><p class="ttag">${tag}</p><ul>${items.map(i => `<li>${i}</li>`).join("")}</ul>${mine(t) ? `<p><b>✅ You're on this one.</b></p>` : cta}</div>`;
  const everyBtn = on ? `<button class="btn" data-tier="every">Try 14 days free</button><p class="mute small">No card needed</p>` : `<p class="mute">Opening soon.</p>`;
  return page(`Memberships: ${R.brand}`, `<p class="mute"><a href="/${R.code}">‹ ${R.code} ${R.place}</a></p><h1>Pick how you want your Daily Maverick</h1>
${welcome === "some" ? `<p class="found"><b>You're in. Some Cool Things is on.</b> Tell Mav what you care about and he'll set up your page.</p>` : welcome === "every" ? `<p class="found"><b>You're in. Every Cool Thing is on.</b> Thanks for helping a brother out. Enjoy your Daily Maverick.</p>` : ""}
${need === "some" ? `<p class="found">That's part of <b>Some Cool Things</b>. It's free: just sign in with your email.</p>` : need === "every" ? `<p class="found">That tool is part of <b>Every Cool Thing</b>. Try it free for 14 days, no card needed.</p>` : ""}
<style>.tiers{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin:16px 0}.tier{border:1px solid #d9dee6;border-radius:12px;padding:14px;display:flex;flex-direction:column}.tier.hot{border-color:#f2b01e;border-width:2px}.tier.mine{border-color:#12233f;border-width:2px}.tier h2{margin:0 0 4px;font-size:1.15rem}.tprice{font-weight:700;font-size:1.3rem;margin:0}.ttag{margin:2px 0 10px;color:#5b6575}.tier ul{padding-left:18px;margin:0 0 12px;flex:1}.tier .btn{width:100%}.small{font-size:.85rem;margin:6px 0 0;text-align:center}.beer{background:#fff8e6;border-radius:12px;padding:14px;margin:18px 0}.beer h2{margin:0 0 6px}</style>
<div class="tiers">
${card("free", "Free for life", "$0", "No sign-in, no email", ["Every bit of local information we source", "News, weather, tides, events, Council watch and more", "Anything you can find, we find. We just get it to you quicker"], `<a class="btn ghost" href="/${R.code}">Read today's</a>`)}
${card("some", "Some Cool Things", "Free", "Just your email", ["Everything in Free for life", "Your page, personalised: your name on the masthead", "Mav sets it up. Just tell him what you care about", "A few cool tools, worth an email", "Your setup on every phone you sign in on"], `<a class="btn" href="/signin?next=${encodeURIComponent("/membership?welcome=some")}">Sign in free</a>`)}
${card("every", "Every Cool Thing", `$${PRICE} a year`, "Less than a dollar a week", ["Everything in Some Cool Things", "Every tool unlocked, like What's in your fridge", "Everything we build next, you get too. No extra cost", "Try new tools while we build them", "Nominate and vote on what comes next"], everyBtn)}
</div>
<div class="beer"><h2>🍺 Less than a case of beer. For a whole year.</h2>
<p>Most of us spend that on a weekend without thinking. $${PRICE} a year backs a local who sources your news without the noise, keeps council accountable, and builds the tools your community votes for. Give me a chance.</p></div>
<h2>The deal</h2><ul class="rules">
<li>🆓 <b>14 days free, no credit card.</b> Like it? Then you pay. Don't? Do nothing and it simply ends</li>
<li>↩️ <b>7-day money-back.</b> Cancel within 7 days of paying and your money comes straight back. No forms, no questions</li>
<li>🔓 <b>No lock-in.</b> Cancel any time${tier === "every" ? ` · <a href="#" id="manage">Manage my membership</a>` : ""}</li>
<li>🔒 Secure payment by Stripe. We never see your card</li>
<li>🛡️ Community services (Scam watch, digital safety, Kid Zone) are always free, whatever you choose</li></ul>
<div class="found"><h2>🏅 Founding Members: $${FOUNDING_PRICE} a year, for life</h2><p>The first ${FOUNDING_SPOTS.toLocaleString("en-AU")} locals to sign in are Founding Members. You never have to pay a cent. But if you ever choose Every Cool Thing, you pay <b>$${FOUNDING_PRICE} a year, forever</b>, even when the price goes up for everyone else.</p>
<p><b>${left.toLocaleString("en-AU")} founding spots left.</b> ${n ? `${n.toLocaleString("en-AU")} locals already in.` : ""}</p>${em ? "" : `<p><a href="/signin?next=/membership"><b>Sign in free to claim yours</b></a></p>`}</div>
<p class="mute" id="paymsg" role="status"></p>
<script>(function(){var M=document.getElementById('paymsg');function go(path,body){M.textContent='Opening secure checkout…';fetch('/api/billing/'+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body||{})}).then(function(r){return r.json()}).then(function(j){if(j.url)location.href=j.url;else if(j.signin)location.href=j.signin;else M.textContent=j.error||'Something went wrong. Try again?'}).catch(function(){M.textContent='Something went wrong. Try again?'})}
document.querySelectorAll('[data-tier]').forEach(function(b){b.onclick=function(){go('checkout',{tier:b.dataset.tier})}});var m=document.getElementById('manage');if(m)m.onclick=function(e){e.preventDefault();go('portal')};
var buy=new URLSearchParams(location.search).get('buy');if(buy==='every'){var b=document.querySelector('[data-tier="every"]');if(b)b.click()}})();</script>`); }


// ---- What's done and what's in the works, in one honest list ----
function statusPage(env) {
  const done = [["Your daily page", "Weather, tides, swell, moon, sunrise and clock changes"], ["Alerts", "Fires within 100 km and weather warnings"], ["News", "Local headlines, sourced"],
    ["Community events", "Locals first, free to add"], ["Births, Deaths and Marriages", "Family notices"], 
    ["Renting", "Every rental site in one place"], ["Jobs", "Every job site in one place"], ["Local radio", "Community stations in the shire"], ["Time saved", "How much time our tools give back"],
    ["Open now?", "What's open near you"], ["What's in your fridge?", "Dinner ideas"], ["Birthday deals", "Say \"Maverick\""], ["Kid Zone", "Safe games, with a grown-up's OK"], ["Crossword", "Three levels, every day"], ["Mav", "Talk or type to set up your page"]];
  if (R.fields) done.push(["Sport & field closures", "With phone alerts"]);
  done.push(["Fuel", "Nearest servos compared"]);
  done.push(["Roads now", "Crashes, floods, fires and roadwork within 40 km, from Live Traffic NSW"]);
  const todo = [["Coles prices", "Coles blocks our checks. We're finding another way"], ["School bell times", "Your school's own times"],
    ["Memberships", "Free for life, Some Cool Things free with your email, Every Cool Thing $49 a year: 14 days free, no card, 7-day money-back. Founding Members lock in $49 for life"], ["Saved searches by email", "Your searches, in your weekly email"]];
  if (!R.fields) todo.push(["Sport & field closures", "Field closures and local fixtures"]);
  const li = (b, cls, txt) => b.map(([n, d]) => `<li><span class="${cls}">${txt}</span> <b>${esc(n)}</b> <span class="mute">${esc(d)}</span></li>`).join("");
  return page(`What's done: ${R.brand}`, `<p class="mute"><a href="/${R.code}">‹ ${R.code} ${R.place}</a></p><h1>What's done, what's next</h1>
<p>We're rebuilding regional news from scratch, so here's exactly where it's at. No spin.</p>
<h2>Live now</h2><ul class="fls">${li(done, "done", "✅ Live")}</ul>
<h2>Coming soon</h2><p class="mute">Team Smarketing is on it. Want something here sooner, or something new? <a href="/feedback">Vote for it</a>: 30 votes and it gets built.</p><ul class="fls">${li(todo, "wipb", "🚧 Coming soon")}</ul>`);
}

// ---- One app instead of many: every app or site this page saves you checking. Counted honestly from what's actually here. ----
function appsSaved() { // [app, the section on this page that replaces it, where it lives]
  const a = [["BOM (Bureau of Meteorology) Weather", "today", "https://www.bom.gov.au"], ["WillyWeather (tides)", "sea", "https://www.willyweather.com.au"], ["Hazards Near Me", "alerts", "https://www.rfs.nsw.gov.au/fire-information/fires-near-me"],
    ["Live Traffic NSW", "alerts", "https://www.livetraffic.com"], ["FuelCheck", "fuel", "https://www.fuelcheck.nsw.gov.au"], ...R.news.map(n => [n.name, "news", n.url]),
    ["Facebook community groups", "events", "https://www.facebook.com/groups"], ["Eventbrite", "events", "https://www.eventbrite.com.au"], ["Council website", "know", R.council.url],
    ["realestate.com.au", "rent", "https://www.realestate.com.au"], ["Domain", "rent", "https://www.domain.com.au"], ["Rent.com.au", "rent", "https://www.rent.com.au"], ["Flatmates", "rent", "https://flatmates.com.au"],
    ["SEEK", "jobs", "https://www.seek.com.au"], ["Indeed", "jobs", "https://au.indeed.com"], ["Jora", "jobs", "https://au.jora.com"], ["LinkedIn Jobs", "jobs", "https://www.linkedin.com/jobs"],
    ["Google Maps (what's open)", "tools", "https://www.google.com/maps"], ["Horoscope app", "stars", "/#stars"], ["Crossword app", "puzzles", "/crossword"],
    ["School holiday calendar", "holidays", "https://education.nsw.gov.au/schooling/calendars"], ["Bank and rates news", "rates", "https://www.rba.gov.au"]];
  if (R.surf) a.push(["Surf report app", "beaches", "https://www.coastalwatch.com"]);
  if (R.airport) a.push(["Flight tracker", "flights", R.airport.url]);
  if (R.funerals) a.push(...R.funerals.map(f => [f.name + " notices", "bdm", f.url]));
  return a;
}
const appChips = () => `<div class="oapps">${appsSaved().map(([n, s, u]) => `<a href="${esc(u)}" rel="noopener" data-s="${s}">${esc(n)}</a>`).join("")}</div>`;
// "Your app saves you N apps": counts only the apps behind sections this reader keeps on their page, so hiding a section lowers it.
// Time is an honest rule of thumb: about a minute to open and check each app.
const MIN_PER_APP = 1;
const timeTxt = m => m >= 60 ? `${Math.floor(m / 60)} hr${m % 60 ? ` ${m % 60} min` : ""}` : `${m} min`;
function oneAppBlock(nLocals) {
  const a = appsSaved().map(x => x[0]), n = a.length, checks = nLocals > 0 ? nLocals * n : 0;
  return `<section id="oneapp"><h2>📱 Your app saves you <span class="oan">${n}</span> apps</h2><p>No more checking <span class="oan">${n}</span> apps and websites every morning: that&rsquo;s about <b class="oat">${timeTxt(n * MIN_PER_APP)}</b> back every day, or <b class="oaw">${timeTxt(n * MIN_PER_APP * 7)}</b> a week (at about a minute an app). Everything below is on your page or one tap away.</p>
${appChips()}<p class="oeq">= <b>1 Daily Maverick</b>, your way</p>
<script>(function(){var c=0;document.querySelectorAll('#oneapp .oapps a').forEach(function(a){var off=null;try{off=localStorage.getItem('hide_'+a.dataset.s)}catch(e){}if(off)a.hidden=true;else c++});
function tt(m){return m>=60?Math.floor(m/60)+' hr'+(m%60?' '+(m%60)+' min':''):m+' min'}
document.querySelectorAll('#oneapp .oan').forEach(function(x){x.textContent=c});var t=document.querySelector('#oneapp .oat'),w=document.querySelector('#oneapp .oaw');if(t)t.textContent=tt(c*${MIN_PER_APP});if(w)w.textContent=tt(c*${MIN_PER_APP}*7)})()<\/script>
${checks ? `<p class="note">With ${nLocals.toLocaleString("en-AU")} locals on board, that&rsquo;s <b>${checks.toLocaleString("en-AU")} app checks saved every day</b>.</p>` : ""}</section>`;
}

// ---- Grog watch (was Beer watch and Wine watch): any drink, local bottle shops only. Shops post their own price;
// locals search for anything, filter by type and vote on what we watch. We say plainly what we can and can't find. ----
const ALC_DEFAULTS = ["Tooheys New 24 cans", "Shiraz 750ml bottle"];
const ALC_TYPES = [["beer", "🍺 Beer"], ["cider", "🍏 Cider & premixed"], ["spirits", "🥃 Spirits"], ["wine", "🍷 Wine"]];
const alcType = t => { t = String(t).toLowerCase(); return /\b(cider|seltzer|premix|rtd|cruiser|ready to drink)\b/.test(t) ? "cider"
  : /\b(wine|shiraz|merlot|cabernet|pinot|chardonnay|sauvignon|riesling|rose|rosé|prosecco|champagne|sparkling|moscato|grenache|tempranillo|malbec|cask|semillon|verdelho|fiano)\b/.test(t) ? "wine"
  : /\b(gin|vodka|rum|whisky|whiskey|bourbon|scotch|tequila|brandy|liqueur|ouzo|sambuca|baileys|jagermeister|spirit)\b/.test(t) ? "spirits" : "beer"; };
const alcWords = q => String(q).toLowerCase().replace(/\b(x|cans?|bottles?|ml|l|litres?|pack|carton|block|case|stubbies|dozen|cask)\b/g, " ").split(/\W+/).filter(w => w.length > 1 && !/^\d+$/.test(w));
const alcAll = async env => { const fresh = x => Date.now() - new Date(x.at) < 30 * 864e5;
  const [a, b, c] = await Promise.all(["alcolocal", "beerlocal", "winelocal"].map(k => env.DATA.get(k, "json").then(v => v || []).catch(() => [])));
  return [...a, ...b.map(x => ({ ...x, item: x.beer })), ...c.map(x => ({ ...x, item: x.beer }))].map(x => ({ shop: x.shop, sub: x.sub, item: x.item || x.beer, price: x.price, at: x.at })).filter(fresh); };
const alcFind = (L, q) => { const w = alcWords(q); return w.length ? L.filter(x => { const t = x.item.toLowerCase(); return w.every(y => t.includes(y)); }).sort((a, b) => a.price - b.price) : []; };
async function alcoholApi(req, env, url) {
  if (req.method === "POST") {
    const f = await req.formData(); if (f.get("website")) return new Response(null, { status: 303, headers: { location: `/${R.code}#alcohol` } });
    const shop = String(f.get("shop") || "").replace(/[<>]/g, "").trim().slice(0, 60), sub = String(f.get("suburb") || "").replace(/[<>]/g, "").trim().slice(0, 40),
      item = String(f.get("item") || f.get("beer") || f.get("wine") || "").replace(/[<>]/g, "").trim().slice(0, 60), price = Math.round(+f.get("price") * 100) / 100;
    if (!shop || !sub || item.length < 3 || !(price > 3 && price < 600) || f.get("ok") !== "yes") return page("Check your details", `<h1>Nearly</h1><p>Please add the shop, suburb, the drink and size, a price, and tick the box. <a href="/${R.code}#alcohol">Back</a></p>`);
    const L = ((await env.DATA.get("alcolocal", "json")) || []), k = (shop + "|" + item).toLowerCase();
    await env.DATA.put("alcolocal", JSON.stringify([{ shop, sub, item, price, at: new Date().toISOString() }, ...L.filter(x => (x.shop + "|" + x.item).toLowerCase() !== k)].slice(0, 600)));
    return page("Price posted", `<h1>Thanks, it&rsquo;s up!</h1><p>${esc(shop)}: ${esc(item)} at $${price.toFixed(2)}. It shows for 30 days, so post again whenever it changes.</p><p><a href="/${R.code}#alcohol">See Grog watch</a></p>`);
  }
  const L = await alcAll(env), q = String(url.searchParams.get("q") || "").slice(0, 60), type = url.searchParams.get("type") || "";
  if (q) return Response.json({ q, items: alcFind(L, q) }, { headers: { "cache-control": "no-store" } });
  return Response.json({ items: L.filter(x => !type || alcType(x.item) === type).sort((a, b) => a.item.localeCompare(b.item) || a.price - b.price).slice(0, 60) }, { headers: { "cache-control": "no-store" } });
}
// What we can and can't find for a suggestion, said plainly.
const alcCanCant = async (env, text) => { const hits = alcFind(await alcAll(env), text);
  return hits.length ? `Good news: ${hits.length} local shop${hits.length > 1 ? "s have" : " has"} posted a price for ${text}, from $${hits[0].price.toFixed(2)}.`
    : `No local bottle shop has posted ${text} yet. We only show prices local shops post themselves. The big chains aren't in it: we're local only.`; };
const alcoholBlock = () => `<section id="alcohol"><span id="beer"></span><span id="wine"></span><h2 id="alch">🍻 <span id="alcn">Grog watch</span></h2><p class="mute">Beer, wine, spirits, cider: the price at <b>local</b> bottle shops, posted by the shops themselves. Search for anything, or filter by type. Local only, so your money stays in town.</p>
<form class="row" id="alcf" role="search"><input id="alcq" maxlength="60" placeholder="What are you after? e.g. Tooheys New 24 cans, gin, Shiraz" aria-label="Search local bottle shop prices"><button>Search</button></form>
<div class="alcp" id="alcp"><button type="button" class="on" data-t="">All</button>${ALC_TYPES.map(([k, n]) => `<button type="button" data-t="${k}">${n}</button>`).join("")}</div>
<div id="alcout" class="mute">Checking local prices…</div>${TL_KEY}
<details><summary><b>Own a local bottle shop? Post your price free</b></summary><form method="post" action="/api/alcohol"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<div class="row"><input name="shop" maxlength="60" placeholder="Shop name *" required><input name="suburb" maxlength="40" placeholder="Suburb *" required></div>
<div class="row"><input name="item" maxlength="60" placeholder="Drink and size, e.g. Tooheys New 24 cans *" required aria-label="Drink and size"><input name="price" type="number" step="0.01" min="3" max="600" placeholder="Price $ *" required></div>
<label><input type="checkbox" name="ok" value="yes" required> I run or work at this shop, and this is our current price</label><br><button>Post my price</button></form></details>
${cwatchPanel("alcohol")}
<p class="src"><span class="srcw">Source:</span> prices posted by local shops, with the date they posted. Shown for 30 days. We don't check the big chains: local only. Please drink responsibly.</p>
<script>${CWATCH_JS}(function(){var O=document.getElementById('alcout'),Q=document.getElementById('alcq'),T='',m=function(n){return '$'+Number(n).toFixed(2)},e=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var D=new Date(),ago=function(a){var d=Math.round((D-new Date(a))/864e5);return d<1?'today':d===1?'yesterday':d+' days ago'};
var H=document.getElementById('alcn'),NM={'':'Grog watch',beer:'Beer watch',wine:'Wine watch',spirits:'Spirits watch',cider:'Cider watch'};
function ty(t){t=String(t).toLowerCase();return /\\b(cider|seltzer|premix|rtd|cruiser|ready to drink)\\b/.test(t)?'cider':/\\b(wine|shiraz|merlot|cabernet|pinot|chardonnay|sauvignon|riesling|rose|rosé|prosecco|champagne|sparkling|moscato|grenache|tempranillo|malbec|cask|semillon|verdelho|fiano)\\b/.test(t)?'wine':/\\b(gin|vodka|rum|whisky|whiskey|bourbon|scotch|tequila|brandy|liqueur|ouzo|sambuca|baileys|jagermeister|spirits?)\\b/.test(t)?'spirits':/\\b(beer|lager|ale|stout|pale|ipa|tooheys|vb|xxxx|carlton|great northern|corona|heineken|coopers|hahn|stone|furphy|balter|pils)\\b/.test(t)?'beer':''}
function name(t){if(H)H.textContent=NM[t]||NM['']}
function tl(v,L){var lo=Math.min.apply(null,L),hi=Math.max.apply(null,L);return L.length<2||lo===hi?'':v===lo?'cheap':v===hi?'dear':'mid'}
function table(items,head){var by={};items.forEach(function(x){(by[x.item]=by[x.item]||[]).push(x)});return '<div class="tscroll"><table class="shopt"><thead><tr><th>'+head+'</th><th>Local price</th></tr></thead><tbody>'+Object.keys(by).sort().map(function(k){var L=by[k].map(function(x){return x.price});return by[k].sort(function(a,b){return a.price-b.price}).map(function(x,i){return '<tr><th scope="row">'+(i?'':e(k))+'</th><td class="'+tl(x.price,L)+'">'+m(x.price)+'<br><small>'+e(x.shop)+', '+e(x.sub)+' · '+ago(x.at)+'</small></td></tr>'}).join('')}).join('')+'</tbody></table></div>'}
function none(q){return '<p><b>We can&rsquo;t find '+e(q)+' at a local shop yet.</b></p><p class="mute">What we can do: show prices that local bottle shops post themselves, and put it to a vote below so shops know locals want it. What we can&rsquo;t do: check the big chains. They don&rsquo;t let us, and we&rsquo;re local only. Know a local shop that stocks it? Ask them to post their price here, free.</p>'}
function list(){O.className='mute';O.textContent='Checking local prices…';fetch('/api/alcohol'+(T?'?type='+T:'')).then(function(r){return r.json()}).then(function(j){O.className='';O.innerHTML=j.items.length?table(j.items,'Drink'):'<p class="mute">No local shop has posted '+(T?'a price in this type':'a price')+' in the last 30 days. Shop owners: post yours below, free.</p>'}).catch(function(){O.textContent='Couldn’t reach us just now. Try again soon.'})}
document.getElementById('alcf').onsubmit=function(ev){ev.preventDefault();var q=Q.value.trim();if(q.length<2){name(T);list();return}name(ty(q));O.className='mute';O.textContent='Searching local shops…';fetch('/api/alcohol?q='+encodeURIComponent(q)).then(function(r){return r.json()}).then(function(j){O.className='';O.innerHTML=j.items.length?'<p class="mute">'+j.items.length+' local price'+(j.items.length>1?'s':'')+' for '+e(q)+'.</p>'+table(j.items,'Drink'):none(q)}).catch(function(){O.textContent='Couldn’t reach us just now. Try again soon.'})};
document.getElementById('alcp').onclick=function(ev){var b=ev.target.closest('button');if(!b)return;T=b.dataset.t;name(T);[].forEach.call(this.children,function(x){x.classList.toggle('on',x===b)});Q.value='';list()};list()})();</script></section>`;

// ---- Mini Maverick Encouragement Award: grown-ups nominate a local kid; the winner gets $50 to spend at a local business of their choice. Never fast food. ----
const AWARD_INFO = `<p>Every month one local kid gets the <b>Mini Maverick Encouragement Award</b>: <b>$50 to spend wherever they like</b> at a local ${"${R.place}"} business. Bookshop, surf shop, bakery, the footy club canteen. Anywhere local, except fast food.</p>
<p class="note">📍 The award must be spent at a <b>local ${"${R.place}"} business</b>. No multinationals, no chains, no fast food.</p>
<p class="mute">Kindness, courage, trying hard, helping out. Anything worth encouraging. Grown-ups nominate; kids don&rsquo;t sign up themselves.</p>`;
const awardBlock = () => `<section id="award"><h2>🏅 Mini Maverick Encouragement Award</h2>${AWARD_INFO.split("${R.place}").join(esc(R.place))}<p><a href="/award"><b>Nominate a local kid →</b></a> · <a href="/award#apply">Clubs and local businesses: apply</a></p></section>`;
async function plusList(env) {
  const A = ((await env.DATA.get("award:apps", "json")) || []).filter(x => x.plus10 && x.pc === R.code);
  return `<h2>💪 Making it go 10% further</h2>${A.length ? `<p class="mute">These local businesses add 10% when a winner spends their award with them.</p><ul class="fls">${A.map(x => `<li><b>${esc(x.org)}</b>${x.sub ? `, ${esc(x.sub)}` : ""}</li>`).join("")}</ul>` : `<p class="mute">No local business has signed up yet. Be the first: tick the 10% box below.</p>`}`;
}
async function awardPage(req, env, ctx) {
  const head = `<p class="mute"><a href="/${R.code}">‹ ${R.code} ${R.place}</a></p><h1>🏅 Mini Maverick Encouragement Award</h1>${AWARD_INFO.split("${R.place}").join(esc(R.place))}`;
  if (req.method === "POST") {
    const f = await req.formData(); if (f.get("website")) return page("Thanks", head + `<p class="note">Thanks, it&rsquo;s in.</p>`);
    const v = k => String(f.get(k) || "").replace(/[<>]/g, "").trim();
    if (f.get("form") === "apply") {
      const org = v("org").slice(0, 80), sub = v("asub").slice(0, 40), plus10 = f.get("plus10") === "yes", kind = v("kind").slice(0, 40), who = v("who").slice(0, 40), mail = v("aemail").slice(0, 80), more = v("more").slice(0, 600);
      if (!org || !kind || !who || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) return page("Nearly there", head + `<p class="note">Please fill in every field marked *.</p>`);
      const A = (await env.DATA.get("award:apps", "json")) || []; await env.DATA.put("award:apps", JSON.stringify([{ org, sub, plus10, kind, who, mail, more, pc: R.code, at: new Date().toISOString() }, ...A.filter(x => x.org.toLowerCase() !== org.toLowerCase())].slice(0, 500)));
      mailUs(env, ctx, `Encouragement Award application: ${org} (${kind}, ${R.code})`, `Organisation: ${org}${sub ? " (" + sub + ")" : ""}\nType: ${kind}\nMakes it go 10% further: ${plus10 ? "YES" : "no"}\nContact: ${who}\nEmail: ${mail}\n\n${more}\n\nDaily Maverick: ${R.code}`, mail);
      return page("Application in", head + `<p class="note">Thanks, ${esc(who)}! ${esc(org)}&rsquo;s application is in. We&rsquo;ll be in touch by email.</p>`);
    }
    const kid = v("kid").slice(0, 30), where = v("where").slice(0, 60), why = v("why").slice(0, 600), me = v("me").slice(0, 40), email = v("email").slice(0, 80), role = v("role").slice(0, 40);
    if (!kid || !why || !me || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || f.get("ok") !== "yes") return page("Nearly there", head + `<p class="note">Please fill in every field marked * and tick the box.</p>`);
    const n = { kid, where, why, me, email, role, pc: R.code, at: new Date().toISOString() }, L = (await env.DATA.get("award:noms", "json")) || [];
    await env.DATA.put("award:noms", JSON.stringify([n, ...L].slice(0, 500)));
    mailUs(env, ctx, `Encouragement Award nomination: ${kid} (${R.code})`, `Kid's first name: ${kid}\nSchool, club or group: ${where}\nWhy: ${why}\n\nNominated by: ${me} (${role})\nEmail: ${email}\nDaily Maverick: ${R.code}`, email);
    return page("Nomination in", head + `<p class="note">Thanks, ${esc(me)}! ${esc(kid)}&rsquo;s nomination is in. If they win, we&rsquo;ll email you to sort out the $50 with their parent or carer. It must be spent at a local business, never a multinational or fast food.</p>`);
  }
  return page(`Mini Maverick Encouragement Award: ${R.brand}`, head + `<form method="post"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<label>Kid&rsquo;s first name only *</label><input name="kid" maxlength="30" required>
<label>School, club or group (optional)</label><input name="where" maxlength="60">
<label>What did they do? *</label><textarea name="why" rows="4" maxlength="600" required placeholder="e.g. Kept showing up to training all winter and helped the little ones"></textarea>
<label>Your name *</label><input name="me" maxlength="40" required>
<label>You are their… *</label><select name="role" required><option value="">Choose</option><option>Parent or carer</option><option>Teacher</option><option>Coach</option><option>Family friend</option><option>Other grown-up</option></select>
<label>Your email * (only to contact you if they win)</label><input name="email" type="email" maxlength="80" required>
<label><input type="checkbox" name="ok" value="yes" required> I&rsquo;m an adult, and the kid&rsquo;s parent or carer is OK with this nomination</label>
<button>Nominate</button></form>
<p class="src">We only ever show a winner&rsquo;s first name, with their parent or carer&rsquo;s OK. Nominations go straight to us and are never shared.</p>
${await plusList(env)}
<h2 id="apply">Clubs, schools and local businesses: apply</h2>
<p>Run a junior sporting club or association? Swap the fast-food voucher for the <b>Mini Maverick Encouragement Award</b> at your presentations or player of the week. Run a local business? Apply to be a place where winners can spend their $50, and <b>make it go 10% further</b>: $55 of goods for the winner, and your name on this page.</p>
<form method="post"><input type="hidden" name="form" value="apply"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<label>Club, school or business name *</label><input name="org" maxlength="80" required>
<label>Suburb</label><input name="asub" maxlength="40">
<label>You are a… *</label><select name="kind" required><option value="">Choose</option><option>Sporting club or association</option><option>School</option><option>Community group</option><option>Local business (where winners can spend it)</option></select>
<label>Your name *</label><input name="who" maxlength="40" required>
<label>Your email *</label><input name="aemail" type="email" maxlength="80" required>
<label><input type="checkbox" name="plus10" value="yes"> 💪 We&rsquo;ll make it go <b>10% further</b>: a winner spending their $50 with us gets $55 worth</label>
<label>Tell us a bit more (optional)</label><textarea name="more" rows="3" maxlength="600" placeholder="e.g. Under 9s to under 14s, about 200 kids, presentations in September"></textarea>
<button>Apply</button></form>
<p class="src">Local regional businesses only. No fast food, no multinationals.</p>`);
}

// ---- Everything: every page on the Daily Maverick, in one place, so nothing is hidden ----
function allGroups() {
  return [["🗞️ Sections", NAV.map(x => [`/${x.slug}`, x.name, x.blurb])], ["📰 Your daily paper", [[`/${R.code}`, `${R.place} ${R.code}`, "Your daily page"], ...Object.entries(TOWNS).filter(([k, v]) => v.live && k !== R.code).map(([k, v]) => [`/${k}`, `${v.name} ${k}`, "Daily page"]), ["/towns", "All our towns", "Every Daily Maverick"], ["/au", "Who represents you", "Regional Australia: council, MPs and senators"]]],
    ["👪 Your people", [["/mums", "Mums", "School run, countdowns, kids and your village"], ["/dads", "Dads", "School run, countdowns, kids and your village"], ["/kids", "Kid Zone", "Safe games for 12 and under"], ["/singles", "Singles", "Meet people in real life"], ["/lgbtqia", "LGBTQIA+", "Your town, for everyone"], ["/membership", "Memberships", "Free for life, Some Cool Things or Every Cool Thing"]]],
    ["🧰 Handy tools", [["/nsw", "NSW Government help", "Check a licence live, rebates and services"], ["/numbers", "Hard-to-find numbers", "Banks, airlines, telcos and government, one tap to call"], ["/scams", "Scam watch", "What's going around, check before you buy, report a scam"], ["/photo", "Share a photo", "Get your shot of your place in front of every local"], ["/photos", "Locals' photos", "Your place, through locals' eyes"], ["/open", "What's open", "Pharmacies, servos, cafés, dog beaches and more"], ["/rent", "Renting", "Every rental site, your rights, bond help"], ["/jobs", "Jobs", "Every job site in one place"], ["/school", "School run check", "Weather and traffic for drop-off"], ["/home", "My home", "Bin night reminders, house-sitter sheet"], ["/fridge", "What's in your fridge?", "Dinner ideas"], ["/birthday", "Birthday deals", "Local places that look after you"], ["/watch", "What are you binging?", "Shows, podcasts and channels locals rate"], ["/genalpha", "Gen Alpha interpreter", "What did your kid just say?"], [`/${R.why.slug}`, R.why.title, "Fun facts, every one sourced"]]],
    ["🤝 Community", [["/notices", "Community notice board", "Lost pets, volunteers, clubs"], ["/bdm", "Births, Deaths and Marriages", "Family notices"], ["/rip", "Death notices", "In memory"], ["/celebrations", "Celebrations", "Births, engagements, milestones"], ["/award", "Mini Maverick Encouragement Award", "Nominate a local kid, or apply as a club"], ["/submit", "Add an event", "Free, always"], ["/feedback", "Ideas and feedback", "Suggest and vote; 30 votes gets it built"], ["/suggest", "Want one for your town?", "Ask for your postcode"]]],
    ["🧒 Kid Zone", [["/kids", "Kid Zone", "Games for kids 12 and under"], ["/kids/parent", "Grown-ups: Kid Zone settings", "Set the secret word"], ["/crossword", "Daily crossword", "Easy, medium and hard"]]],
    ["👤 You", [["/me", "My page", "Your settings and what Mav knows"], ["/signin", "Sign in", "Free, one tap"]]],
    ["ℹ️ About us", [["/about", "Nobody pays to be here", "How we stay free"], ["/charter", "Our charter", "No BS, no opinions, just sources"], ["/status", "What's done", "Live now and coming soon"], ["/timesaved", "Time saved", "How much time we give back"], ["/new", "What's new", "Latest changes"], ["/ai-log", "AI log", "What our AI does, in the open"], ["/faq", "FAQ", "Common questions"], ["/privacy", "Privacy", "What we keep, and don't"]]]];
}
function allPage() {
  const G = allGroups();
  return page(`Everything on ${R.brand}`, `<p class="mute"><a href="/${R.code}">‹ ${R.code} ${R.place}</a></p><h1>Everything on the Daily Maverick</h1><p class="mute">Every page we have, in one place.</p>
${G.map(([h, L]) => `<h2>${h}</h2>${L.map(([u, n, d]) => `<a class="card" href="${u}"><b>${esc(n)}</b> ${esc(d)} →</a>`).join("")}`).join("\n")}`);
}

// ---- Why Coffs: fun facts, every one sourced ----
// Each postcode's own reasons to love it (src/love.js): only things that postcode has and its neighbours don't. Every fact sourced.
const factLi = ([i, h, b, u, n]) => `<li class="idea"><span style="font-size:1.6rem">${i}</span><div><b>${esc(h)}</b><br>${esc(b)}<p class="src"><span class="srcw">Source:</span> <a href="${u}" rel="noopener">${esc(n)}</a></p></div></li>`;
const wikiUrl = name => `https://en.wikipedia.org/wiki/Special:Search?go=Go&search=${encodeURIComponent(name + ", New South Wales")}`;
const aboutLinks = pc => `<a href="${wikiUrl(TOWNS[pc].name)}" rel="noopener" data-noutm>${esc(TOWNS[pc].name)} on Wikipedia</a> · <a href="/credits?pc=${pc}">Photo credits</a>`;
// ---- Photo credits: every photo on today's paper, who took it and its free licence, plus how locals can keep their place up to date.
async function creditsPage(env, url) {
  const q = (url.searchParams.get("pc") || R.code).replace(/\D/g, "").slice(0, 4), pc = TOWNS[q]?.live ? q : R.code, t = TOWNS[pc], day = todayISO(), nm = esc(t.name);
  const hero = await env.DATA.get(`potd5:${pc}:${day}`, "json"), side = (await env.DATA.get(`spics4:${pc}:${day}`, "json")) || {};
  const label = Object.fromEntries(THEMES.map(([id]) => [id, (NAV.flatMap(n => n.items).find(i => i[0] === "#" + id) || [])[2] || id]));
  const row = (where, ph) => `<li><b>${esc(where)}</b>: <a href="${esc(ph.page)}" rel="noopener" data-noutm>${esc(ph.caption)}</a><br><span class="mute">Photo: ${esc(ph.artist)} · ${ph.licenseUrl ? `<a href="${esc(ph.licenseUrl)}" rel="noopener license" data-noutm>${esc(ph.license)}</a>` : esc(ph.license)} · Wikimedia Commons</span></li>`;
  const rows = [...(hero && !hero.none ? [row("Your place today", hero)] : []), ...Object.entries(side).map(([id, ph]) => row(label[id], ph))];
  return page(`Photo credits: ${t.name}`, `<p class="mute"><a href="/${pc}">‹ ${pc} ${nm}</a></p><h1>Photo credits</h1>
<p>Every photo on The Daily Maverick is either shared by a local or is a free, open-licensed photo from <a href="https://commons.wikimedia.org" rel="noopener" data-noutm>Wikimedia Commons</a>, the free photo library behind Wikipedia. We only use photos licensed CC BY, CC BY-SA (Creative Commons), CC0 or public domain, and we credit the photographer and licence under every one. Nothing paid, nothing with strings attached.</p>
<h2>Today in ${pc}</h2>${rows.length ? `<ul>${rows.join("")}</ul>` : `<p class="mute">No Commons photos on today's ${pc} paper yet.</p>`}
<h2>Learn more about ${nm}</h2><p><a href="${wikiUrl(t.name)}" rel="noopener" data-noutm><b>${nm} on Wikipedia →</b></a></p>
<h2>Help keep ${nm} up to date</h2><p>Wikipedia and Wikimedia Commons are written and photographed by volunteers. The better locals keep them, the better your Daily Maverick looks.</p>
<ul class="ideas"><li class="idea"><span style="font-size:1.6rem">📷</span><div><b>Add your photos to Wikimedia Commons</b><br>Upload your shots of ${nm} under a free licence and turn on the location, so they show up here for everyone. <a href="https://commons.wikimedia.org/wiki/Special:UploadWizard" rel="noopener" data-noutm>Upload to Commons →</a></div></li>
<li class="idea"><span style="font-size:1.6rem">✏️</span><div><b>Fix or add to ${nm}'s Wikipedia page</b><br>Something out of date? Anyone can edit. Hit "Edit" at the top of the page. <a href="${wikiUrl(t.name)}" rel="noopener" data-noutm>Open the page →</a></div></li>
<li class="idea"><span style="font-size:1.6rem">🌅</span><div><b>Share a photo with us directly</b><br>It gets its own day as Your place today, with your first name on it. <a href="/photo?pc=${pc}">Share your photo →</a></div></li>
<li class="idea"><span style="font-size:1.6rem">🚩</span><div><b>Wrong photo, wrong place?</b><br>Tell us and we'll sort it. <a href="/feedback">Let us know →</a></div></li></ul>`, pc);
}
async function potdBlock(env, pc) { const t = TOWNS[pc], nm = esc(LOVE[pc]?.name || t.name), day = todayISO(); let lo = null, ph = null;
  try { lo = await localToday(env, pc, day); } catch (e) { lo = null; }
  const share = `<a href="/photo?pc=${pc}"><b>📷 Share your shot of ${nm}</b></a> and it gets its own day here, with your name on it.`;
  if (lo) return `<figure class="potd"><a href="/photos?pc=${pc}"><img src="/p/${lo.id}.jpg" alt="${esc(lo.cap)}" fetchpriority="high" decoding="async"></a>
<figcaption><b>📸 Your place today, shot by ${esc(lo.name)}, a local</b> ${esc(lo.cap)}<small>${share} · ${aboutLinks(pc)} · <a href="#" class="prep" data-id="${lo.id}">Report</a></small></figcaption></figure>
<script>document.querySelectorAll('.prep').forEach(function(a){a.onclick=function(e){e.preventDefault();if(!confirm('Report this photo? It comes down straight away.'))return;fetch('/api/photo-report?id='+a.dataset.id,{method:'POST'}).then(function(){a.closest('figure').remove()})}})<\/script>`;
  try { ph = await photoOfDay(env, pc, t, HOME, day, UA); } catch (e) { ph = null; }
  if (!ph) return `<p class="card">📸 <b>Your place today</b> ${share}</p>`;
  return `<figure class="potd"><a href="${esc(ph.page)}" rel="noopener" data-noutm><img src="${esc(ph.src)}" width="${ph.w}" height="${ph.h}" alt="${esc(ph.caption)}" fetchpriority="high" decoding="async"></a>
<figcaption><b>📸 Your place today</b> ${esc(ph.caption)}<small>Photo: ${esc(ph.artist)} · ${ph.licenseUrl ? `<a href="${esc(ph.licenseUrl)}" rel="noopener license" data-noutm>${esc(ph.license)}</a>` : esc(ph.license)} · <a href="${esc(ph.page)}" rel="noopener" data-noutm>Wikimedia Commons</a><br>${share} · ${aboutLinks(pc)}</small></figcaption></figure>`; }
function loveBlock(pc) { const L = LOVE[pc]; if (!L?.facts?.length) return "";
  return `<section id="love"><h2>❤️ Why you'll love ${esc(L.name)}</h2><p class="mute">What ${esc(pc)} has that nowhere else does. Every fact sourced.</p>
<ul class="ideas">${dayMix(L.facts, "love" + pc).slice(0, 3).map(factLi).join("")}</ul><p><a href="/${R.why.slug}?pc=${pc}">All the reasons to love ${esc(L.name)} →</a></p></section>`; }
const whyPage = (url) => { const pc = url.searchParams.get("pc"), L = TOWNS[pc]?.live && LOVE[pc];
  return page(L ? `Why ${L.name}` : R.why.title.replace("?", ""), `<p class="mute"><a href="/${L ? pc : R.code}">‹ ${L ? `${pc} ${esc(L.name)}` : `${R.code} ${R.place}`}</a></p>
${L ? `<h1>❤️ Why ${esc(L.name)}?</h1><p>What ${esc(pc)} has that nowhere else does. Every fact sourced.</p><ul class="ideas">${dayMix(L.facts, "love" + pc).map(factLi).join("")}</ul>
<nav class="towns" aria-label="Other postcodes">${Object.entries(TOWNS).filter(([k, v]) => v.live && LOVE[k]).map(([k, v]) => k === pc ? `<span class="pc on">${k}</span>` : `<a class="pc" href="/${R.why.slug}?pc=${k}" title="${esc(v.name)}">${k}</a>`).join("")}</nav>
<h2>🌊 And the whole area: ${R.why.title}</h2>` : `<h1>🌊 ${R.why.title}</h1>`}
<p>${R.why.intro}</p>
<ul class="ideas">${dayMix(FACTS, "facts").map(([i, h, b, u, n]) => `<li class="idea"><span style="font-size:1.6rem">${i}</span><div><b>${esc(h)}</b><br>${esc(b)}<p class="src"><span class="srcw">Source:</span> <a href="${u}" rel="noopener">${esc(n)}</a></p></div></li>`).join("")}</ul>
<p class="mute">Know a fact we've missed? <a href="/feedback">Tell us</a>.</p>`, L ? pc : R.code); };

// ---- Daily crossword: three levels, the same puzzle for everyone per level per day.
// Anyone can play. Signed-in locals get their streak, solved count and best times saved (cwr:email) on any phone.
const cwPuzzle = (lv, day) => { const L = LEVELS[lv], B = { general: GENERAL, medium: MEDIUM, hard: HARD, town: R.cw };
  return buildCrossword(L.banks.flatMap(b => B[b]), R.code + day + (lv === "easy" ? "" : lv), L.want, L); };
const crosswordPage = (url) => {
  const day = todayISO(), q = url.searchParams.get("l"), lv = LEVELS[q] ? q : "easy", L = LEVELS[lv], { grid, nums, clues } = cwPuzzle(lv, day);
  const first = new Set(L.firstLetters ? clues.map(x => x.r + "," + x.c) : []);
  const cell = (ch, r, c) => ch ? `<td><span class="cn">${nums[r + "," + c] || ""}</span><input maxlength="1" data-a="${ch}"${first.has(r + "," + c) ? ` value="${ch}" readonly class="giv"` : ""} autocomplete="off" autocapitalize="characters" aria-label="Row ${r + 1}, column ${c + 1}"></td>` : `<td class="bk"></td>`;
  const list = d => clues.filter(x => x.d === d).map(x => `<li><b>${x.n}</b> ${esc(x.clue)} (${x.w.length})</li>`).join("");
  return page(`Crossword: ${R.code} Maverick`, `<p class="mute"><a href="/${R.code}">‹ ${R.code} ${R.place}</a></p><h1>🧩 Today's crossword</h1>
<p class="mute">${esc(fmtDate(day))} · A new one every day in three levels, with a few local words in the mix.</p>
<nav class="ptabs" aria-label="Level">${Object.entries(LEVELS).map(([k, x]) => `<a href="/crossword?l=${k}" class="cwlv${k === lv ? " on" : ""}" data-l="${k}"${k === lv ? ' aria-current="page"' : ""}>${x.emoji} ${x.name}</a>`).join("")}</nav>
<p class="mute">${lv === "easy" ? "First letters are filled in for you. Wrong letters show in red." : lv === "medium" ? "No head start. Wrong letters show in red." : "No head start, and Check only tells you how many are wrong, not which ones."}</p>
<div id="cwstats" class="cwstats"></div>
<table class="cw" role="grid" style="--n:${grid[0].length}">${grid.map((row, r) => `<tr>${row.map((ch, c) => cell(ch, r, c)).join("")}</tr>`).join("")}</table>
<p><button type="button" id="cwcheck">Check</button> <button type="button" id="cwshow" class="ghost">Show answers</button> <span id="cwtime" class="mute">⏱️ 0:00</span> <span id="cwmsg" class="mute"></span></p>
<div id="cwboard"></div>
<div class="row cwl"><div><h2>Across</h2><ol>${list("across")}</ol></div><div><h2>Down</h2><ol>${list("down")}</ol></div></div>
<style>.cwlv{padding:5px 12px;border-radius:99px;background:var(--soft);color:var(--fg);text-decoration:none;font-size:.9rem}.cwlv.on{background:var(--fg);color:var(--bg)}.cw input.giv{color:var(--mute)}.cwstats{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:.9rem;margin:4px 0 6px}.cwstats:empty{display:none}.cwstats b{font-family:Georgia,serif}#cwboard{margin:10px 0}#cwboard ol{padding-left:22px;margin:4px 0}#cwboard li{padding:3px 0}#cwboard li.me{font-weight:700}#cwboard .t{float:right;font-family:Georgia,serif}</style>
<script>(function(){var DAY='${day}',LV='${lv}',SHOW=${L.showWrong},NM=${JSON.stringify(Object.fromEntries(Object.entries(LEVELS).map(([k, x]) => [k, x.emoji + " " + x.name])))};
var I=[].slice.call(document.querySelectorAll('.cw input')),M=document.getElementById('cwmsg'),T=document.getElementById('cwtime'),ST=document.getElementById('cwstats');
var IN=/(?:^|; )m2450n=/.test(document.cookie),t0=null,tick=null,checks=0,done=false,shown=false;
function g(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}function p(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
p('cwlv',LV);if(!/[?&]l=/.test(location.search)){var sv=g('cwlv0');if(sv&&sv!==LV&&NM[sv]){location.replace('/crossword?l='+sv);return}}
[].forEach.call(document.querySelectorAll('.cwlv'),function(a){a.onclick=function(){p('cwlv0',a.dataset.l)}});
function mmss(s){return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
function secs(){return t0?Math.round((Date.now()-t0)/1000):0}
function start(){if(t0||done)return;t0=Date.now();tick=setInterval(function(){T.textContent='⏱️ '+mmss(secs())},1000)}
function stats(j){if(!j||!j.solved){ST.innerHTML=IN?'':'<span>🔥 Keep a streak and beat your best times. <a href="/signin?next=/crossword">Sign in free</a></span>';return}
ST.innerHTML='<span>🔥 Streak <b>'+(j.streak||0)+'</b></span><span>✅ Solved <b>'+j.solved+'</b></span>'+Object.keys(NM).map(function(k){return j.best&&j.best[k]?'<span>'+NM[k]+' best <b>'+mmss(j.best[k])+'</b></span>':''}).join('')}
function local(){var L=g('cwlog')||{},best={},days=Object.keys(L).sort(),n=0,st=0;days.forEach(function(d){Object.keys(L[d]).forEach(function(k){n++;if(!best[k]||L[d][k]<best[k])best[k]=L[d][k]})});
var d=new Date(DAY+'T00:00:00');if(!L[DAY])d.setDate(d.getDate()-1);while(L[d.toISOString().slice(0,10)]){st++;d.setDate(d.getDate()-1)}return{solved:n,best:best,streak:st}}
if(IN){var lg=g('cwlog');fetch('/api/cw',lg?{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({import:lg})}:{}).then(function(r){return r.json()}).then(function(j){if(j.ok){if(lg)try{localStorage.removeItem('cwlog')}catch(e){}stats(j)}}).catch(function(){})}else stats(local());
I.forEach(function(x,i){x.onfocus=start;x.oninput=function(){start();x.value=x.value.toUpperCase().replace(/[^A-Z]/g,'');x.classList.remove('bad');var n=i+1;while(I[n]&&I[n].readOnly)n++;if(x.value&&I[n])I[n].focus()}});
function board(){fetch('/api/cwboard?l='+LV).then(function(r){return r.json()}).then(function(j){var B=document.getElementById('cwboard'),h='<h2>🏆 Today\u2019s '+NM[LV]+' leaderboard</h2>';
if(!j.n){B.innerHTML=h+'<p class="mute">No one\u2019s on the board yet. Be the first'+(IN?'!':': <a href="/signin?next=/crossword?l='+LV+'">sign in free</a> and solve it.')+'</p>';return}
B.innerHTML=h+'<p class="mute">'+j.n+' local'+(j.n>1?'s have':' has')+' solved it today.'+(j.me?' You\u2019re <b>#'+j.me.rank+'</b>.':IN?'':' <a href="/signin?next=/crossword?l='+LV+'">Sign in free</a> to get on the board.')+'</p><ol>'+j.top.map(function(x){return '<li'+(x.me?' class="me"':'')+'>'+e(x.n)+(x.me?' (you)':'')+' <span class="t">'+mmss(x.s)+'</span></li>'}).join('')+'</ol>'}).catch(function(){})}
function e(x){return String(x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
board();
function solved(){done=true;clearInterval(tick);var s=Math.max(secs(),1);M.textContent='🎉 Solved in '+mmss(s)+'! Same time tomorrow?';
if(IN)fetch('/api/cw',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({day:DAY,level:LV,secs:s,checks:checks})}).then(function(r){return r.json()}).then(function(j){if(j.ok){stats(j);board();if(j.pb)M.textContent+=' 🏅 New personal best!'}}).catch(function(){});
else{var L=g('cwlog')||{};L[DAY]=L[DAY]||{};var pb=!local().best[LV]||s<local().best[LV];if(!L[DAY][LV]||s<L[DAY][LV])L[DAY][LV]=s;p('cwlog',L);stats(local());M.innerHTML+=(pb?' 🏅 New personal best!':'')+' <a href="/signin?next=/crossword">Sign in free</a> to keep your streak on any phone.'}}
document.getElementById('cwcheck').onclick=function(){if(done)return;checks++;var bad=0,empty=0;I.forEach(function(x){if(!x.value)empty++;else if(x.value!==x.dataset.a){bad++;if(SHOW)x.classList.add('bad')}});
if(!bad&&!empty){if(shown){M.textContent='Answers were shown, so this one doesn\\u2019t count. A fresh one tomorrow.'}else solved();return}
M.textContent=bad?bad+' not quite right'+(SHOW?' (in red).':'. Keep going!'):'So far so good! '+empty+' to go.'};
document.getElementById('cwshow').onclick=function(){if(done)return;shown=true;done=true;clearInterval(tick);I.forEach(function(x){x.value=x.dataset.a;x.classList.remove('bad')});M.textContent='Answers shown. This one won\\u2019t count toward your streak. A fresh one tomorrow.'};
})();</script>`, R.code);
};
async function cwApi(req, env) {
  const em = await member(req, env); if (!em) return Response.json({ ok: false, signin: true });
  const key = `cwr:${em}`, r = (await env.DATA.get(key, "json")) || { days: {} }, day = todayISO();
  const add = (d, lv, s) => { if (!LEVELS[lv] || !/^\d{4}-\d\d-\d\d$/.test(d) || !(s >= 15 && s < 86400)) return false; r.days[d] = r.days[d] || {}; if (r.days[d][lv] && r.days[d][lv] <= s) return false; r.days[d][lv] = Math.round(s); return true; };
  let pb = false;
  if (req.method === "POST") {
    const j = await req.json().catch(() => ({}));
    if (j.import && typeof j.import === "object") for (const [d, v] of Object.entries(j.import).slice(-120)) if (d <= day && v && typeof v === "object") for (const [lv, s] of Object.entries(v)) add(d, lv, +s);
    if (j.day === day && LEVELS[j.level]) { const before = Math.min(...Object.values(r.days).map(x => x[j.level]).filter(Boolean)); if (add(day, j.level, +j.secs)) { if (+j.secs < before) pb = true;
      const u = await env.DATA.get(`user:${em}`, "json"), bk = `cwb:${day}:${j.level}`, b = ((await env.DATA.get(bk, "json")) || []).filter(x => x.e !== em);
      b.push({ e: em, n: String(u?.name || "").split(" ")[0].slice(0, 20) || "A local", s: r.days[day][j.level] }); b.sort((x, y) => x.s - y.s);
      await env.DATA.put(bk, JSON.stringify(b.slice(0, 200)), { expirationTtl: 3456000 }); } }
    const ds = Object.keys(r.days).sort(); for (const d of ds.slice(0, -400)) delete r.days[d]; // keep about a year
    await env.DATA.put(key, JSON.stringify(r));
  }
  const best = {}; let solved = 0;
  for (const v of Object.values(r.days)) for (const [lv, s] of Object.entries(v)) { solved++; if (!best[lv] || s < best[lv]) best[lv] = s; }
  let streak = 0; const d = new Date(day + "T00:00:00Z"); if (!r.days[day]) d.setUTCDate(d.getUTCDate() - 1);
  while (r.days[d.toISOString().slice(0, 10)]) { streak++; d.setUTCDate(d.getUTCDate() - 1); }
  return Response.json({ ok: true, solved, best, streak, pb, today: r.days[day] || {} });
}
// Today's community leaderboard for one level: first names only, fastest first. Anyone can see it; sign in to get on it.
async function cwBoard(url, req, env) {
  const lv = LEVELS[url.searchParams.get("l")] ? url.searchParams.get("l") : "easy", em = await member(req, env);
  const b = (await env.DATA.get(`cwb:${todayISO()}:${lv}`, "json")) || [], me = em ? b.findIndex(x => x.e === em) : -1;
  return Response.json({ n: b.length, top: b.slice(0, 10).map(x => ({ n: x.n, s: x.s, me: x.e === em })), me: me >= 0 ? { rank: me + 1, s: b[me].s } : null }, { headers: { "cache-control": "no-store" } });
}

// ---- What are you binging? Locals share what they're watching or listening to (any show, movie, podcast or video channel,
// on any service: we don't name or favour any), say why, label it (comedy, fishing, politics…) and vote. Anyone can search
// what the community suggested: "what are you looking for?". Signed-in locals only, each pick checked by AI, no manual work.
const BFORMS = [["show", "📺 Show or movie"], ["podcast", "🎧 Podcast"], ["channel", "🎥 Video channel"], ["other", "✨ Something else"]];
const BTAGS = ["Comedy", "Crime", "Documentary", "Drama", "Family", "Fishing", "Food", "History", "Music", "Nature", "Politics", "Reality", "Sci-fi", "Sport", "Surf", "True story", "Other"];
async function watchList(env) { const cut = Date.now() - 120 * 864e5; return ((await env.DATA.get("watch:list", "json")) || []).filter(x => new Date(x.at) > cut).map(x => ({ form: "show", tag: "Other", ...x })); }
async function cleanText(env, txt) { // true if fine to show
  if (!txt.trim()) return true;
  try { const r = await env.AI.run("@cf/meta/llama-guard-3-8b", { messages: [{ role: "user", content: txt }] }); const v = r?.response; return !(v?.safe === false || /unsafe/i.test(typeof v === "string" ? v : JSON.stringify(v || ""))); }
  catch (e) { return !/(fuck|shit|cunt|nigg|fag|bitch|porn)/i.test(txt); }
}
async function watchPost(req, env) {
  const em = await member(req, env); if (!em) return new Response(null, { status: 303, headers: { location: "/signin?next=/watch" } });
  const f = await req.formData(), L = await watchList(env);
  if (f.get("up")) { const x = L.find(x => x.id === f.get("up")); if (x && !x.ups.includes(em)) x.ups.push(em); }
  else {
    const title = String(f.get("title") || "").replace(/\s+/g, " ").trim().slice(0, 80), why = String(f.get("why") || "").replace(/\s+/g, " ").trim().slice(0, 140);
    const form = BFORMS.some(x => x[0] === f.get("form")) ? String(f.get("form")) : "show", tag = BTAGS.includes(f.get("tag")) ? String(f.get("tag")) : "Other";
    if (title.length < 2 || why.length < 3) return watchPage(req, env, "Add the name and a few words on why it's worth it.");
    if (!(await cleanText(env, title + "\n" + why))) return watchPage(req, env, "That one didn't go through. Keep it to the name and a few kind words.");
    const same = L.find(x => x.title.toLowerCase() === title.toLowerCase() && x.form === form);
    if (same) { if (!same.ups.includes(em)) same.ups.push(em); }
    else { const u = await env.DATA.get(`user:${em}`, "json"); L.unshift({ id: crypto.randomUUID().slice(0, 8), title, form, tag, why, by: String(u?.name || "").split(" ")[0].slice(0, 20) || "A local", e: em, ups: [em], at: new Date().toISOString() }); }
  }
  await env.DATA.put("watch:list", JSON.stringify(L.slice(0, 300)));
  return new Response(null, { status: 303, headers: { location: "/watch" } });
}
async function watchPage(req, env, msg = "") {
  const em = await member(req, env), L = (await watchList(env)).sort((a, b) => b.ups.length - a.ups.length || b.at.localeCompare(a.at));
  const FN = Object.fromEntries(BFORMS), tags = BTAGS.filter(t => L.some(x => x.tag === t));
  const item = x => `<li data-f="${esc(x.form)}" data-t="${esc(x.tag)}"><div><b>${esc(x.title)}</b> <span class="wsvc">${FN[x.form] || FN.show}</span> <span class="wsvc">${esc(x.tag)}</span>${x.why ? `<br><span>Why: “${esc(x.why)}”</span>` : ""}<br><small class="mute">Shared by ${esc(x.by)} · ${x.ups.length} local${x.ups.length > 1 ? "s" : ""} vote${x.ups.length > 1 ? "" : "s"} for it</small></div>
<form method="post"><input type="hidden" name="up" value="${x.id}"><button class="ghost"${em && x.ups.includes(em) ? " disabled" : ""} title="Vote for it">👍 ${x.ups.length}</button></form></li>`;
  return page(`What are you binging? ${R.code} Maverick`, `<p class="mute"><a href="/${R.code}">‹ ${R.code} ${R.place}</a></p><h1>🍿 What are you binging?</h1>
<p>We all spend longer scrolling than watching. Here's what locals are binging: shows, movies, podcasts, video channels, on whatever they use. Each one with why it's worth it. Vote for the good ones.</p>
${msg ? `<p class="note">${esc(msg)}</p>` : ""}
<label for="wq"><b>🔎 What are you looking for?</b></label><input id="wq" type="search" maxlength="60" placeholder="e.g. something funny, fishing, true crime podcast" autocomplete="off">
<div class="alcp" id="wff"><button type="button" class="on" data-f="">All</button>${BFORMS.filter(([k]) => L.some(x => x.form === k)).map(([k, n]) => `<button type="button" data-f="${k}">${n}</button>`).join("")}</div>
${tags.length ? `<div class="alcp" id="wft"><button type="button" class="on" data-t="">Every topic</button>${tags.map(t => `<button type="button" data-t="${esc(t)}">${esc(t)}</button>`).join("")}</div>` : ""}
<p><button type="button" id="wpick">🎲 Can't decide? Pick one for me</button> <span id="wout"></span></p>
${L.length ? `<ul class="wlist" id="wl">${L.map(item).join("")}</ul><p class="mute" id="wnone" hidden>Nothing like that yet. Be the first to share one below.</p>` : `<p class="mute">No picks yet. Be the first to share what you're binging.</p>`}
<h2>➕ What are you binging?</h2>
${em ? `<form method="post"><input name="title" maxlength="80" required placeholder="Name of the show, movie, podcast or channel">
<div class="row"><select name="form" aria-label="What is it?">${BFORMS.map(([k, n]) => `<option value="${k}">${n}</option>`).join("")}</select><select name="tag" aria-label="Topic">${BTAGS.map(t => `<option>${esc(t)}</option>`).join("")}</select></div>
<input name="why" maxlength="140" required placeholder="Why is it worth it? A few words"><p><button>Share it</button></p></form>`
    : `<p><a href="/signin?next=/watch"><b>Sign in free</b></a> to share what you're binging and vote for others.</p>`}
<p class="mute">Picks are shared by locals and checked automatically to keep it friendly. We don't name or favour any streaming service. Spotted something off? <a href="/feedback">Tell us</a>.</p>
<style>.wlist{list-style:none;padding:0}.wlist li{display:flex;gap:10px;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--line)}.wlist form{margin:0}.wsvc{font-size:.75rem;font-weight:700;background:var(--soft);border-radius:99px;padding:1px 8px}#wq{width:100%;margin:4px 0 8px}</style>
<script>(function(){var F='',T='',Q='',L=[].slice.call(document.querySelectorAll('#wl li')),N=document.getElementById('wnone');
function run(){var n=0,w=Q.toLowerCase().split(/\\s+/).filter(function(x){return x.length>1});L.forEach(function(li){var tx=li.textContent.toLowerCase()+' '+li.dataset.t.toLowerCase(),ok=(!F||li.dataset.f===F)&&(!T||li.dataset.t===T)&&w.every(function(x){return tx.indexOf(x.replace(/s$/,''))>-1});li.hidden=!ok;if(ok)n++});if(N)N.hidden=n>0}
function pills(id,cb){var P=document.getElementById(id);if(!P)return;P.onclick=function(e){var b=e.target.closest('button');if(!b)return;[].forEach.call(P.children,function(x){x.classList.toggle('on',x===b)});cb(b);run()}}
pills('wff',function(b){F=b.dataset.f});pills('wft',function(b){T=b.dataset.t});var q=document.getElementById('wq');q.oninput=function(){Q=q.value.trim();run()};
document.getElementById('wpick').onclick=function(){var v=L.filter(function(li){return !li.hidden}).slice(0,15),o=document.getElementById('wout');if(!v.length){o.textContent='Nothing to pick from yet.';return}var li=v[Math.floor(Math.random()*v.length)];o.innerHTML='Tonight: <b>'+li.querySelector('b').textContent+'</b> 🍿';li.scrollIntoView({behavior:'smooth',block:'center'})};})();</script>`, R.code);
}
// ---- Bin night, automatic: type your address once (or pick your area), and the coloured bins show up on your front page.
function binAutoUI() {
  const src = BIN_SRC[R.code];
  if (!src) return "";
  if (src.kind === "link") return `<p>${src.cal ? `Find your bin days on the <a href="${src.cal}" rel="noopener">${esc(src.name)} website</a>, then` : `Check your bin days with ${esc(src.name)}, then`} set them below and we'll show the right bins on your front page.</p>`;
  const pick = src.kind === "wi" ? `<label for="baq">Your street address</label><div class="row"><input id="baq" maxlength="80" placeholder="e.g. 11 Smith Street" autocomplete="street-address"><button type="button" id="bago">Find</button></div><ul class="baddr" id="bares" aria-live="polite"></ul>`
    : `<div class="row"><div><label for="baarea">Your area</label><select id="baarea"><option value="">Choose…</option><option value="north">North: Billinudgel, Brunswick Heads, Federal, Mullumbimby, New Brighton, Ocean Shores, South Golden Beach</option><option value="south">South: Bangalow, Byron Bay, Ewingsdale, Suffolk Park</option></select></div>
<div><label for="baday">Collection day</label><select id="baday"><option value="">Choose…</option>${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d, i) => `<option value="${i + 1}">${d}</option>`).join("")}</select></div></div><p class="mute">Not sure of your day? Search your address in the free Recycle Coach app. Rural properties: see the <a href="${src.cal}" rel="noopener">rural calendar</a>.</p>`;
  return `<div id="bauto"><p>${src.kind === "wi" ? "Type your address once and we'll show which bins go out, in their colours, on your front page. It updates by itself from the council's own calendar." : "Pick your area and day once, and we'll show which bins go out, in their colours, on your front page."}</p>
${pick}<div id="banext"></div><p class="src"><span class="srcw">Source:</span> <a href="${src.cal}" rel="noopener">${esc(src.name)}</a> collection calendar.${src.phone ? ` Questions: <a href="tel:${src.phone.replace(/\s/g, "")}">${esc(src.phone)}</a>.` : ""} Your address stays on your phone.</p></div>
<script>${BINS_JS(R.code)}(function(){var B=window.M2B,out=document.getElementById('banext');
function draw(){var a=B.auto();if(!a){out.innerHTML='';return}out.innerHTML='<p class="mute">Checking your bins…</p>';B.next(function(d){var L=B.upcoming(d).slice(0,5);
out.innerHTML='<p><b>📍 '+String(a.name).replace(/</g,'')+'</b> <a href="#" id="bareset">change</a></p>'+(L.length?'<ul class="fls">'+L.map(function(x){return '<li><b>'+B.when(x.date).replace(/^./,function(c){return c.toUpperCase()})+'</b>: '+x.bins.map(function(b){return B.lid(b)}).join('')+'</li>'}).join('')+'</ul>':'<p class="mute">The council calendar isn’t answering just now. Try again soon.</p>');
document.getElementById('bareset').onclick=function(e){e.preventDefault();B.p('bin_auto',null);B.p('bin_cache',null);draw()}})}
var q=document.getElementById('baq');if(q){var res=document.getElementById('bares'),go=function(){var v=q.value.trim();if(v.length<4){res.innerHTML='<li class="mute">Type your house number and street.</li>';return}res.innerHTML='<li class="mute">Searching…</li>';
fetch('/api/bins?q='+encodeURIComponent(v)).then(function(r){return r.json()}).then(function(j){if(j.error){res.innerHTML='<li class="mute">Couldn\u2019t reach the council calendar. Try again soon.</li>';return}res.innerHTML=(j.list||[]).length?j.list.map(function(x){return '<li><button type="button" data-id="'+x.id+'" data-n="'+x.name.replace(/"/g,'')+'">'+x.name.replace(/</g,'')+' <small class="mute">'+String(x.zone||'').replace(/</g,'')+'</small></button></li>'}).join(''):'<li class="mute">No match. Try just the number and street name, like 11 Smith.</li>'}).catch(function(){res.innerHTML='<li class="mute">Couldn’t reach the council calendar. Try again soon.</li>'})};
document.getElementById('bago').onclick=go;q.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();go()}};
res.onclick=function(e){var b=e.target.closest('button');if(!b)return;B.p('bin_auto',JSON.stringify({code:'${R.code}',kind:'wi',id:b.dataset.id,name:b.dataset.n}));res.innerHTML='';q.value='';draw()}}
var ar=document.getElementById('baarea'),dy=document.getElementById('baday');if(ar){var a=B.auto();if(a){ar.value=a.area;dy.value=a.day}var sv=function(){if(ar.value&&dy.value){B.p('bin_auto',JSON.stringify({code:'${R.code}',kind:'byron',area:ar.value,day:+dy.value,name:(ar.value==='north'?'North':'South')+' area, '+dy.options[dy.selectedIndex].text}));B.p('bin_cache',null);draw()}};ar.onchange=dy.onchange=sv}
draw()})()</script>`;
}
// ---- Can I throw it in this bin? Type an item, get the bin and why.
function whichBinUI() {
  const src = BIN_SRC[R.code] || {};
  return `<h2 id="whichbin">🤔 Can I throw it in this bin?</h2><p>Type an item and we'll tell you which bin, and why.</p>
<input id="wbq" type="search" maxlength="40" placeholder="e.g. pizza box, coffee cup, batteries" autocomplete="off" aria-label="What are you throwing out?"><div class="wbres" id="wbres" aria-live="polite"></div>
<p class="src"><span class="srcw">Source:</span> the councils' own bin guides. Councils differ a little${src.az ? `: check the <a href="${src.az}" rel="noopener">${esc(src.name)} A to Z</a>` : src.cal ? `: check <a href="${src.cal}" rel="noopener">${esc(src.name)}</a>` : ""}.</p>
<script>(function(){var I=${JSON.stringify(BIN_ITEMS).replace(/</g, "\\u003c")},C={green:['#3f9b2e','Green bin (organics)'],red:['#d0342c','Red bin (rubbish)'],yellow:['#f2c200','Yellow bin (recycling)']},q=document.getElementById('wbq'),o=document.getElementById('wbres');
q.oninput=function(){var s=q.value.trim().toLowerCase();if(s.length<2){o.innerHTML='';return}var sc=function(i){var b=0;i[3].split(',').concat(i[1].toLowerCase()).forEach(function(k){if(k.indexOf(s)>-1||s.indexOf(k)>-1)b=Math.max(b,Math.min(k.length,s.length)+(k===s?50:0))});return b};var h=I.map(function(i){return [sc(i),i]}).filter(function(x){return x[0]>0}).sort(function(a,b){return b[0]-a[0]||a[1][1].localeCompare(b[1][1])}).map(function(x){return x[1]}).slice(0,5);
o.innerHTML=h.length?h.map(function(i){var c=C[i[0]];return '<div class="wbhit" style="--c:'+c[0]+'"><span class="blid" style="--c:'+c[0]+'"><i></i></span><div><b>'+(i[1].indexOf('never in any bin')>-1?'Not in any bin':c[1])+': '+i[1]+'</b><span class="mute">'+i[2]+'</span></div></div>'}).join(''):'<p class="mute">Not sure about that one.${src.phone ? ` Call ${esc(src.name)} on <a href="tel:${src.phone.replace(/\s/g, "")}">${esc(src.phone)}</a>.` : " Check with your council."}</p>'}})()</script>`;
}
// ---- My home: bin night + a house-sitter sheet. Everything stays on the phone; nothing is sent to us. ----
const homePage = () => page("My home", `<p class="mute"><a href="/${R.code}">‹ ${R.code}</a></p><h1>🏡 My home</h1>
<p>Handy home info, saved on <b>your phone only</b>. Nothing here is sent to us.</p>
<h2>🗑️ Bin night</h2>${binAutoUI()}
<details id="bman"${BIN_SRC[R.code] && BIN_SRC[R.code].kind !== "link" ? "" : " open"}><summary><b>Set bin night by hand</b></summary><div class="row"><div><label>Bins go out</label><select id="bday"><option value="">Choose…</option>${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((d, i) => `<option value="${i}">${d} night</option>`).join("")}</select></div>
</div>
<label>This bin night, which one goes out with the green bin?</label><select id="bthis"><option value="">Choose…</option><option value="1">Red (general waste)</option><option value="2">Yellow (recycling)</option></select>
<p class="mute">That&rsquo;s it. Green goes out every week; red and yellow swap each fortnight, and we work out the rest.</p>
<div id="bcal"></div>
<details><summary class="mute">Different bins where you live?</summary><div class="row"><div><label>Every week</label><input id="bweekly" value="Green (organics)" maxlength="40"></div><div><label>Fortnightly bin 1</label><input id="balt1" value="Red (general waste)" maxlength="40"></div><div><label>Fortnightly bin 2</label><input id="balt2" value="Yellow (recycling)" maxlength="40"></div></div></details>
<p class="note" id="bnext" hidden></p></details><p class="mute">${R.binsTip} We'll remind you on your ${R.code} page the day bins go out.</p>
${whichBinUI()}
<h2>🧳 House-sitter sheet</h2><p>Going away? Fill in what a house-sitter needs, then print or share it.</p>
<p class="note">⚠️ Please don't put passwords, alarm codes or where the spare key is in here.</p>
${[["pets", "Pets: names, feeding, walks", 3], ["plants", "Plants and garden: what needs water and when", 2], ["routine", "House routine: mail, blinds, lights, pool", 3], ["contact", "Who to call if something goes wrong (name and phone)", 2], ["notes", "Anything else they should know", 3]].map(([id, l, r]) => `<label>${l}</label><textarea data-hs="${id}" rows="${r}" maxlength="600"></textarea>`).join("")}
<p class="row"><button type="button" id="hsprint">🖨️ Print</button><button type="button" id="hsshare" style="background:var(--soft);color:var(--fg)">📤 Share or copy</button></p>
<p class="mute">Your sheet automatically includes bin night, emergency numbers, the council's 24/7 line and links to what's open nearby.</p>
<div id="hsout" class="hsout"></div>
<script>(function(){function g(k){try{return localStorage.getItem(k)}catch(e){return null}}function p(k,v){try{localStorage.setItem(k,v)}catch(e){}}
var F=['bday','bweekly','balt1','balt2'];F.forEach(function(id){var el=document.getElementById(id),v=g('bin_'+id);if(v!==null)el.value=v;el.onchange=el.oninput=function(){p('bin_'+id,el.value);nb()}});
var bt=document.getElementById('bthis');function lab(){bt.options[1].text=document.getElementById('balt1').value;bt.options[2].text=document.getElementById('balt2').value}lab();
bt.onchange=function(){if(!bt.value)return;var day=g('bin_bday'),d=new Date(),diff=day===null||day===''?0:(+day-d.getDay()+7)%7,n=new Date(d);n.setDate(d.getDate()+diff);var wk=Math.floor((Date.UTC(n.getFullYear(),n.getMonth(),n.getDate())/864e5+4)/7);p('bin_anchor',JSON.stringify([wk,+bt.value]));nb()};
function binInfo(){var day=g('bin_bday');if(day===null||day==='')return null;var d=new Date(),diff=(+day-d.getDay()+7)%7,n=new Date(d);n.setDate(d.getDate()+diff);
var wk=Math.floor((Date.UTC(n.getFullYear(),n.getMonth(),n.getDate())/864e5+4)/7),a=null;try{a=JSON.parse(g('bin_anchor'))}catch(e){}var alt=a?((wk-a[0])%2===0?a[1]:3-a[1]):1;
return{diff:diff,text:(g('bin_bweekly')||'Green (organics)')+' + '+(alt==1?(g('bin_balt1')||'Red (general waste)'):(g('bin_balt2')||'Yellow (recycling)'))}}
function nb(){lab();var i=binInfo(),o=document.getElementById('bnext'),c=document.getElementById('bcal');if(!i){o.hidden=true;c.innerHTML='';return}o.hidden=false;o.textContent='🗑️ '+(i.diff===0?'Tonight':i.diff===1?'Tomorrow night':'In '+i.diff+' days')+': '+i.text;
var a=null;try{a=JSON.parse(g('bin_anchor'))}catch(e){}if(a)bt.value=String((Math.floor((Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()+i.diff)/864e5+4)/7)-a[0])%2===0?a[1]:3-a[1]);
var d=new Date(),out=[];for(var k=0;k<4;k++){var n=new Date(d);n.setDate(d.getDate()+i.diff+7*k);var wk=Math.floor((Date.UTC(n.getFullYear(),n.getMonth(),n.getDate())/864e5+4)/7),alt=a?((wk-a[0])%2===0?a[1]:3-a[1]):1;out.push('<li><b>'+n.toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short'})+'</b>: '+(g('bin_bweekly')||'Green (organics)')+' + '+(alt==1?(g('bin_balt1')||'Red (general waste)'):(g('bin_balt2')||'Yellow (recycling)'))+'</li>')}
c.innerHTML=a?'<p class="mute">Your next four bin nights:</p><ul class="fls">'+out.join('')+'</ul>':''}
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
    env = await withSecrets(env);
    initRegion(env);
    // One cron per Worker (the free plan allows 5 across the account): every 5 minutes for push alerts,
    // and every half hour the rest of the work.
    ctx.waitUntil(pushBatch(env));
    ctx.waitUntil(dailyStats(env).catch(() => {}));
    if (new Date(evt.scheduledTime || Date.now()).getUTCMinutes() % 30 >= 5) return;
    ctx.waitUntil(acSync(env).catch(() => {}));
    ctx.waitUntil(Promise.all(Object.entries(TOWNS).filter(([, t]) => t.live).map(([pc, t]) => localToday(env, pc, todayISO()).then(lo => lo || photoOfDay(env, pc, t, HOME, todayISO(), UA)).catch(() => {}))));
    const TTL = { fires: 25, warnings: 25, news: 55, holidays: 24 * 60, fdr: 55, babynames: 7 * 24 * 60, neo: 12 * 60 }; // minutes; keeps storage writes inside the free allowance
    const due = async k => { const v = await env.DATA.get("src:" + k, "json"); return !v || Date.now() - new Date(v.asof) > (TTL[k] || 25) * 6e4; };
    ctx.waitUntil(Promise.all([...Object.keys(SOURCES).map(async k => (await due(k)) && refreshSource(env, k)), checkFields(env), checkWatched(env), refreshObits(env), refreshVenues(env), refreshProject(env), refreshFlights(env), refreshCouncil(env), refreshABS(env, R.code).catch(() => {}), refreshProgress(env), refreshShop(env).then(() => refreshShopList(env)).catch(() => {}), refreshBankRates(env), refreshAiNews(env), healthMail(env, ctx)]));
  },
  async fetch(req, env, ctx) {
    env = await withSecrets(env);
    initRegion(env);
    BUILD = (env.CF_VERSION_METADATA && env.CF_VERSION_METADATA.id) || "dev";
    try { const u = new URL(req.url); CUR_PATH = u.pathname;
      if (u.pathname === "/api/v") return Response.json({ v: BUILD }, { headers: { "cache-control": "no-store" } });
      if (req.method === "GET" && isPaperPath(u.pathname)) return await edgeCached(u, ctx, () => route(req, env, ctx));
      return await route(req, env, ctx); }
    catch (e) { console.log("page error", String(e)); return page("Back soon", `<h1>Back in a moment</h1><p>Something hiccuped on our end. Try again in a minute.</p><p><a href="/">Home</a></p>`); }
  },
};
// ---- Speed: the daily paper and its section pages are the same for everyone (personal touches are added on the phone),
// so each one is built at most once a minute and served from Cloudflare's edge cache. A page older than a minute is still
// served instantly while a fresh copy is built in the background. Pages for signed-in members, forms and APIs are never cached.
const EDGE_FRESH = 60, EDGE_KEEP = 900;
let BUILD = "dev"; // this deploy's version id: a new deploy gets new cache entries straight away
const isPaperPath = p => p === "/" || /^\/\d{4}\/?$/.test(p) || NAV_SLUGS.includes(p.replace(/^\/|\/$/g, ""));
async function edgeCached(url, ctx, make) {
  const k = new URL(url); [...k.searchParams.keys()].filter(x => /^(utm_|gclid|fbclid|msclkid)/.test(x)).forEach(x => k.searchParams.delete(x)); k.searchParams.set("__v", BUILD);
  const key = new Request(k.toString()), cache = caches.default;
  const build = async () => { const r = await make(); if (r.status !== 200) return r; const body = await r.arrayBuffer(), h = new Headers(r.headers);
    h.set("cache-control", `public, max-age=${EDGE_KEEP}`); h.set("x-built", String(Date.now())); await cache.put(key, new Response(body, { status: 200, headers: h }));
    return new Response(body, { status: 200, headers: r.headers }); };
  const out = r => { const o = new Response(r.body, r); o.headers.set("cache-control", "no-cache"); o.headers.delete("x-built"); return o; };
  let hit = null; try { hit = await cache.match(key); } catch (e) {}
  if (hit) { if (Date.now() - (+hit.headers.get("x-built") || 0) > EDGE_FRESH * 1000) ctx.waitUntil(build().catch(() => {})); return out(hit); }
  return out(await build());
}
async function route(req, env, ctx) {
  {
    const url = new URL(req.url), p = url.pathname;
    if (p.startsWith("/api/billing/")) return billingApi(req, env, ctx, p.slice(13), { member, localsCount, goal: LOCALS_GOAL, R, acTag });
    if (p === "/") return town(R.code, env, ctx, true);
    if (p === "/towns") return home(env);
    if (p === "/social" || p === "/social/") return Response.redirect(new URL("/community", url).toString(), 301);
    if (p === "/fun" || p === "/fun/") return Response.redirect(`https://${url.host}/family${url.search}`, 301);
    if (NAV_SLUGS.includes(p.replace(/^\/|\/$/g, ""))) { const q = (url.searchParams.get("pc") || "").replace(/\D/g, ""); return town(TOWNS[q] && TOWNS[q].live ? q : R.code, env, ctx, false, p.replace(/^\/|\/$/g, "")); }
    if (p === "/signin") return signinPage(env, safeNext(url.searchParams.get("next") || "/"));
    if (p === "/auth/google") return startGoogle(url, env);
    if (p === "/auth/google/callback") return finishGoogle(req, url, env);
    if (p === "/welcome") return welcomePage(url);
    if (p === "/optin" && req.method === "POST") return optin(req, env);
    if (p === "/signout") return signout(req, env);
    if (p === "/new") return newPage(env);
    if (p === "/api/rate" && req.method === "POST") return rate(req, env, ctx);
    if (p === "/api/poll" && req.method === "POST") return pollApi(req, env);
    if (p === "/results") return resultsPage(env, req);
    if (p === "/api/results.json") return Response.json(await regionStats(env), { headers: { "access-control-allow-origin": "*", "cache-control": "public, max-age=600" } });
    if (p === "/regional") return regionalPage(env);
    if (p.startsWith("/api/push/") || p === "/api/alert") { const r = await pushApi(req, env, p); if (r) return r; }
    if (p === "/open") return openPage();
    if (p === "/whatsopen" || p === "/visiting") return Response.redirect(new URL("/open", url).toString(), 302);
    if (p === "/api/open") return openApi(req, env);
    if (p === "/" + R.why.slug) return whyPage(url);
    if (p === "/crossword") return crosswordPage(url);
    if (p === "/api/cw") return cwApi(req, env);
    if (p === "/api/cwboard") return cwBoard(url, req, env);
    if (p === "/kids" || p === "/kids/") return page(`Kid Zone: ${R.code} Maverick`, `<style>${KID_CSS}</style>` + kidsHub("/" + R.code));
    if (p === "/kids/parent") return kzParent(req, env);
    if (p === "/kids/log") return page(`What the kids did: Kid Zone`, `<style>${KID_CSS}</style>` + kidsLog("/" + R.code));
    if (p === "/api/kz") return kzApi(req, env);
    if (p === "/kids/safe") return page(`Safe or Sus? Kid Zone`, `<style>${KID_CSS}</style>` + safePage("/" + R.code));
    if (p === "/kids/pet") return page(`Pet Pal: Kid Zone`, `<style>${KID_CSS}</style>` + petPage("/" + R.code));
    if (p === "/kids/certificate") return page(`Certified Mini Maverick: Kid Zone`, `<style>${KID_CSS}</style>` + certPage("/" + R.code, R.code));
    if (p === "/kids/robot") return page(`Robot Builder: Kid Zone`, `<style>${KID_CSS}</style>` + robotPage("/" + R.code));
    if (p === "/home") return homePage();
    if (p === "/api/bins") return binsApi(url, R.code);
    if (p === "/rent") return dirPage("rent");
    if (p === "/timesaved") return timeSavedPage(env);
    if (p === "/all" || p === "/everything") return allPage();
    if (p === "/award") return awardPage(req, env, ctx);
    if (p === "/api/alcohol" || p === "/api/beer" || p === "/api/wine") return alcoholApi(req, env, url);
    if (p === "/status") return statusPage(env);
    if (p === "/api/timesaved") return timeApi(req, env, url);
    if (p === "/jobs") return dirPage("jobs");
    if (p === "/api/cwatch") return cwatchApi(req, env, url);
    if (p === "/notices") return req.method === "POST" ? lodgeNotice(req, env) : noticesPage(env);
    if (p === "/about") return about(env);
    if (p === "/api/fuel") return fuelApi(req, env);
    if (p === "/api/nswcheck") return nswCheckApi(req, env, nswApi);
    if (p === "/me") { const em = await member(req, env); if (!em) return new Response(null, { status: 303, headers: { location: "/signin?next=/me" } }); if (!(await hasTier(env, em, "some"))) return new Response(null, { status: 303, headers: { location: "/membership?need=some" } }); const u = await env.DATA.get(`user:${em}`, "json"); return settingsPage((u?.name || "").split(" ")[0]); }
    if (p === "/api/prefs") { const em = await member(req, env); return !em ? Response.json({ error: "Sign in" }, { status: 401 }) : (await hasTier(env, em, "some")) ? prefsApi(req, env, em) : Response.json({ error: "Part of Some Cool Things", join: "/membership" }, { status: 402 }); }
    if (p === "/mav" && req.method === "POST") return mav(req, env);
    if (p === "/api/mav" && req.method === "POST") return mavChat(req, env);
    if (p === "/api/mav/email" && req.method === "POST") return mavEmail(req, env, ctx);
    if (p === "/api/mav/suggest" && req.method === "POST") { const em = await member(req, env); if (!em) return Response.json({ error: "Sign in first, then Mav can help." }); if (!(await hasTier(env, em, "some"))) return Response.json({ error: "Mav filling this in is part of Some Cool Things. It's free: just sign in." }); return mavSuggest(req, env); }
    if (p === "/api/flights/track" && req.method === "POST") return flightTrack(req, env);
    if (p === "/api/flights") return Response.json(await env.DATA.get("flights", "json") || { list: null }, { headers: { "access-control-allow-origin": "*", "cache-control": "max-age=300" } });
    if (p === "/api/health") return Response.json({ gazette: R.code, checked: new Date().toISOString(), sources: await health(env) }, { headers: { "access-control-allow-origin": "*" } });
    if (p === "/ai-log") return aiLogPage(env);
    if (p === "/faq") return faqPage();
    if (p === "/robots.txt") return robotsTxt();
    if (p === "/sitemap.xml") return sitemapXml();
    if (p === "/llms.txt") return llmsTxt();
    if (p === "/watch") return req.method === "POST" ? watchPost(req, env) : watchPage(req, env);
    if (p === "/celebrations") return req.method === "POST" ? lodgeJoy(req, env, ctx) : joyPage(env);
    if (p === "/bdm") return bdmPage(env, ctx);
    if (p === "/names") return Response.redirect(`${url.origin}/bdm?t=${encodeURIComponent(url.searchParams.get("t") || "nsw")}#names`, 302);
    if (p === "/api/names/lookup") return namesLookup(url, env);
    if (p === "/api/names/ideas" && req.method === "POST") return namesIdeas(req, env).catch(() => Response.json({ error: "Mav couldn't think just now. Try again soon." }));
    if (p === "/rip") return req.method === "POST" ? lodgeRip(req, env) : ripPage(env);
    if (p === "/genalpha") return genAlpha();
    if (p === "/charter") return charter();
    if (p === "/privacy") return privacy();
    if (p === "/birthday") return req.method === "POST" ? lodgeOffer(req, env) : birthdayPage(env);
    if (p === "/suggest") return req.method === "POST" ? suggest(req, env, ctx) : suggestPage();
    if (p === "/feedback") return req.method === "POST" ? feedback(req, env, ctx) : feedbackPage(env);
    if (p === "/vote" && req.method === "POST") return vote(req, env);
    if (p === "/school") return schoolPage(env);
    if (p === "/fridge") { const em = await member(req, env); return !em ? unlockPage() : (await hasTier(env, em, "every")) ? fridgePage() : new Response(null, { status: 303, headers: { location: "/membership?need=every" } }); }
    if (p === "/unlock" && req.method === "POST") return unlock(req, env);
    if (p === "/auth/link") return signInFromLink(url, env);
    if (p === "/api/hello" && req.method === "POST") return helloApi(req, env);
    if (p.startsWith("/go/")) return goLink(p.slice(4), env);
    if (p === "/api/fridge-photo" && req.method === "POST") return fridgePhoto(req, env).catch(() => Response.json({ error: "Couldn’t read that one. Tick what you’ve got below." }));
    if (p === "/admin") return admin(req, env);
    if (p === "/submit") return req.method === "POST" ? handleSubmit(req, env) : submitForm((url.searchParams.get("pc") || R.code).replace(/\D/g, "").slice(0, 4));
    if (p === "/subscribe" && req.method === "POST") return handleSubscribe(req, env);
    if (p === "/icon.svg") return new Response(ICON(), { headers: { "content-type": "image/svg+xml" } });
    if (p === "/icon-180.png" || p === "/apple-touch-icon.png" || p === "/apple-touch-icon-precomposed.png") return iconPng(180);
    if (p === "/icon-192.png") return iconPng(192);
    if (p === "/mums") return AREA().mums(url);
    if (p === "/dads") return AREA().dads(url);
    if (p === "/singles") return AREA().singles(url);
    if (p === "/lgbtqia" || p === "/lgbtq") return AREA().lgbtqia(url);
    if (p === "/membership") return membershipPage(env, req, url);
    if (p === "/localsforlife") return Response.redirect(`https://${url.host}/membership`, 301);
    if (p === "/photo") return PHOTOS().formPage(req, env, url);
    if (p === "/photos") return PHOTOS().gallery(env, url);
    if (p === "/credits") return creditsPage(env, url);
    if (p === "/nsw") return nswPage({ esc, page, R, fresh })(url);
    if ((p === "/api/helpme" || p === "/api/helpme/vote") && req.method === "POST") { const H = helpApi({ esc, R, NAV, member, hasTier, todayISO, guard: mavGuard }); return p === "/api/helpme" ? H.ask(req, env) : H.vote(req, env); }
    if (p === "/scams") return scamsApi({ esc, page, R, member, fresh }).view(req, env, url);
    if (p === "/api/scamcheck" && req.method === "POST") return scamsApi({ esc, page, R, member, fresh }).checkApi(req, env);
    if (p === "/api/ed") { const d = await edData(env, R.code); return Response.json({ ok: !!d?.list?.length, n: d?.list?.length || 0, errs: d?.errs || [], at: d?.at }); }
    if (p === "/numbers" || p === "/api/numbers" || p === "/api/numbers-vote") { const N = numbersApi({ esc, page, R, fresh, member, cleanText, nameOf, TOWNS, todayISO });
      if (p === "/numbers") return N.view(req, env, url); if (req.method !== "POST") return new Response("Not found", { status: 404 }); return p === "/api/numbers" ? N.add(req, env, url) : N.vote(req, env, url); }
    if (p === "/api/photo" && req.method === "POST") return PHOTOS().upload(req, env, url);
    if (p === "/api/photo-report" && req.method === "POST") return PHOTOS().report(req, env, url);
    if (p.startsWith("/p/") && p.endsWith(".jpg")) return PHOTOS().image(env, p.slice(3, -4).replace(/[^a-z0-9]/g, ""));
    if (p === "/icon-512.png") return iconPng(512);
    if (p === "/api/installed" && req.method === "POST") { const k = `install:${todayISO()}`; ctx.waitUntil(env.DATA.get(k).then(n => env.DATA.put(k, String((+n || 0) + 1)))); return new Response(null, { status: 204 }); }
    { const tm = p.match(/^\/team\/([a-z-]+)\.svg$/); if (tm && TEAM[tm[1]]) return new Response(TEAM[tm[1]], { headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400" } }); }
    if (p === "/mav.svg") return new Response(mavSvg(url.searchParams.get("m") || ""), { headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400" } });
    if (p === "/manifest.webmanifest") { const f = decodeURIComponent(cookie(req, "m2450n") || "").split(" ")[0].replace(/[^\p{L}'-]/gu, "").slice(0, 20); return new Response(MANIFEST(f && f !== "Local" ? f : ""), { headers: { "content-type": "application/manifest+json", "cache-control": "private, no-store", vary: "Cookie" } }); }
    if (p === "/sw.js") return new Response(SW(), { headers: { "content-type": "text/javascript" } });
    if (p === "/au" || p.startsWith("/au/")) { const r = auHandle(p, url, AU_HELPERS); if (r) return r; }
    const m = p.match(/^\/(\d{4})\/?$/);
    if (m && !(TOWNS[m[1]] && TOWNS[m[1]].live) && auCovers(m[1])) return Response.redirect(new URL("/au/pc/" + m[1], url).toString(), 302);
    if (m) return town(m[1], env, ctx);
    return page("Not found", `<h1>Not found</h1><p><a href="/">Back to ${R.code}</a></p>`);
  }
}

// Helpers the regional-Australia pages borrow from this engine.
const AU_HELPERS = {
  page: (...a) => page(...a), esc: x => esc(x),
  liveGazette: pc => { const r = Object.values(REGIONS).find(x => x.towns && x.towns[pc] && x.towns[pc].live); return r ? { name: `${r.brand} ${r.code}`, url: `https://${r.domain}/${pc}` } : null; },
};

// A new thought every visit, credited underneath (who said it, and where).
function quoteBlock() {
  const [q, who, ref] = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  return `<blockquote class="quote">“${esc(q)}”<cite>— ${esc(who)}${ref ? `, <i>${esc(ref)}</i>` : ""}</cite></blockquote>`;
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

// ---- Suggest a postcode: we build local pages for rural and community Australia on request ----
const LIVE_CODES = () => Object.values(REGIONS).flatMap(x => Object.keys(x.towns || {}));
function suggestPage(msg = "") {
  return page("Get a Maverick for your town", `<h1>📮 Get a Maverick for your town</h1>
<p>We're here to help rural and community Australia. If your postcode isn't on our list yet, tell us and we'll build one for you. It doesn't take us long, and it's free, like all of them.</p>
<p class="mute">Already running: ${Object.values(REGIONS).map(x => `<a href="https://${esc(x.domain)}/">${esc(x.code)} ${esc(x.place)}</a>`).join(" · ")}</p>${msg}
<form method="post" action="/suggest"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<div class="row"><input name="pc" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="Postcode *" required><input name="town" maxlength="60" placeholder="Town *" required></div>
<label>Anything we should know? (optional)</label><textarea name="note" rows="3" maxlength="600" placeholder="Local paper closed down, best sources for news, who to talk to…"></textarea>
<div class="optmail"><input type="email" name="email" maxlength="120" placeholder="Your email, so we can tell you when it's live (optional)" style="width:100%">${joinNote()}</div><script>${JOIN_JS}</script>
<p><button>Suggest my postcode</button></p></form>`);
}
async function suggest(req, env, ctx) {
  const f = await req.formData();
  if (f.get("website")) return suggestPage(`<p class="note">Thanks!</p>`);
  const pc = String(f.get("pc") || "").trim(), town = String(f.get("town") || "").trim().slice(0, 60);
  const note = String(f.get("note") || "").slice(0, 600), email = String(f.get("email") || "").trim().slice(0, 120);
  if (!/^\d{4}$/.test(pc) || !town) return suggestPage(`<p class="note">Please add a 4-digit postcode and your town.</p>`);
  if (LIVE_CODES().includes(pc)) { const r = Object.values(REGIONS).find(x => x.towns && x.towns[pc]); return suggestPage(`<p class="note">Good news: ${esc(pc)} is already covered by <a href="https://${esc(r.domain)}/${esc(pc)}">${esc(r.brand)} ${esc(r.code)}</a>.</p>`); }
  const k = "pcsug:" + pc, cur = (await env.DATA.get(k, "json")) || { pc, towns: [], count: 0, emails: [], notes: [] };
  cur.count++; cur.at = new Date().toISOString();
  if (!cur.towns.includes(town)) cur.towns = [...cur.towns, town].slice(-10);
  if (email && !cur.emails.includes(email)) cur.emails = [...cur.emails, email].slice(-50);
  if (note.trim()) cur.notes = [...cur.notes, note].slice(-10);
  await env.DATA.put(k, JSON.stringify(cur));
  mailUs(env, ctx, `New town request: ${pc} ${town} (${cur.count} so far)`, `Postcode: ${pc}\nTown: ${town}\nAsked ${cur.count} time(s)\n\n${note}\n\nEmail: ${email || "(none)"}\nVia ${R.domain}`, email);
  const ck = await joinQuiet(req, env, email, "", "town request");
  return withCookies(suggestPage(`<p class="note">Thanks! ${esc(pc)} ${esc(town)} is on our list${cur.count > 1 ? ` (${cur.count} locals have asked)` : ""}.${email ? " We'll email you when it's live." : ""}${joinedMsg(ck)}</p>`), ck);
}

// ---- Horoscopes: Western and Eastern, just for fun ----
function starsBlock() {
  const d = todayISO(), sn = seasonOf(d), vn = vedicOf(d), y = new Date(d + "T00:00:00").getFullYear(), cy = ((y - 4) % 12 + 12) % 12;
  const pack = (kind, list, sub) => { const r = readings(d, kind); return list.map((x, k) => ({ i: x[0], n: x[1], s: sub(x, k), t: r[k].text, l: r[k].lucky, c: luckyColour(d, kind, k) })); };
  const data = { w: pack("w", WEST, x => x[2]), v: pack("v", VEDIC, x => `${x[2]} · ${x[3]}`), e: pack("e", EAST, (x, k) => `born ${eastYears(k)}`), def: { w: sn, v: vn, e: cy }, sw: STARTS, sv: VSTARTS };
  const opts = (list, lab) => list.map((x, k) => `<option value="${k}">${x[0]} ${esc(lab(x, k))}</option>`).join("");
  return `<section id="stars"><h2>✨ Horoscopes</h2><p><b>Your stars for ${esc(new Date(d + "T00:00:00").toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" }))}</b>. ${esc(moonLine(d))} This is the Year of the ${elementOf(y)} ${EAST[cy][1]} ${EAST[cy][0]}.</p>
<div class="ptabs" id="zt"><button type="button" data-k="w" class="on">Western</button><button type="button" data-k="v">Vedic (Indian)</button><button type="button" data-k="e">Chinese</button></div>
<p><select id="zsel" aria-label="Pick your sign" style="width:100%">
<optgroup data-k="w">${opts(WEST, x => `${x[1]} (${x[2]})`)}</optgroup><optgroup data-k="v" hidden>${opts(VEDIC, x => `${x[1]}, ${x[2]} (${x[3]})`)}</optgroup><optgroup data-k="e" hidden>${opts(EAST, (x, k) => `${x[1]} (${eastYears(k)})`)}</optgroup></select></p>
<ul class="zod one"><li class="on"><span class="zs" id="zi"></span><span><b id="zn"></b> <small class="mute" id="zs"></small><br><span id="zx"></span> <small class="mute" id="zl"></small></span></li></ul>
<p class="mute" id="zh"></p>
<p class="pdate">🎂 Add your birthday and we'll set your Western and Vedic signs: <select id="zbd" aria-label="Day"><option value="">Day</option>${Array.from({ length: 31 }, (_, i) => `<option>${i + 1}</option>`).join("")}</select> <select id="zbm" aria-label="Month"><option value="">Month</option>${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => `<option value="${i}">${m}</option>`).join("")}</select> <button type="button" id="zbs">Save</button> <span id="zbok" class="mute" role="status"></span></p>
<script>(function(){var D=${JSON.stringify(data)},H={w:'Western signs go by your birthday.',v:'Vedic (Jyotish) astrology comes from India. It uses the stars as they sit in the sky today, so your sign is often one before your Western sign.',e:'Chinese signs go by the year you were born. The year starts at Lunar New Year, so if you were born in January or early February, you may belong to the year before.'},
k='w',sel=document.getElementById('zsel'),g=function(x){try{return localStorage.getItem(x)}catch(e){return null}},p=function(x,v){try{localStorage.setItem(x,v)}catch(e){}},$=function(i){return document.getElementById(i)};
function show(){var mine=g('z_'+k),i=mine!==null?+mine:D.def[k],r=D[k][i];sel.querySelectorAll('optgroup').forEach(function(o){o.hidden=o.dataset.k!==k;o.disabled=o.dataset.k!==k});
sel.value=String(i);var o=sel.querySelector('optgroup[data-k="'+k+'"] option[value="'+i+'"]');if(o)o.selected=true;
$('zi').textContent=r.i;$('zn').textContent=r.n;$('zs').textContent=r.s;$('zx').textContent=r.t;$('zl').textContent='Lucky number '+r.l+', lucky colour '+r.c+'.';
$('zh').textContent=(mine===null?(k==='e'?'Showing this year’s sign. ':'Showing the sign in season today. ')+'Pick yours above. ':'')+H[k];
document.querySelectorAll('#zt button').forEach(function(b){b.classList.toggle('on',b.dataset.k===k)})}
document.querySelectorAll('#zt button').forEach(function(b){b.onclick=function(){k=b.dataset.k;p('z_tab',k);show()}});
function at(S,m,d){var v=m*100+d,b=-1,bv=-1;S.forEach(function(x,i){var q=x[0]*100+x[1];if(q<=v&&q>bv){bv=q;b=i}});if(b<0){S.forEach(function(x,i){var q=x[0]*100+x[1];if(q>bv){bv=q;b=i}})}return b}
function fromBday(force){var b=null;try{b=JSON.parse(g('bday')||'null')}catch(e){}if(!b||b[0]===''||b[1]==='')return;var d=+b[0],m=+b[1]+1;if(force||g('z_w')===null)p('z_w',at(D.sw,m,d));if(force||g('z_v')===null)p('z_v',at(D.sv,m,d));$('zbd').value=String(d);$('zbm').value=String(m-1);if(!force)$('zbok').textContent='✓ Saved'}
function bd(){var d=$('zbd').value,m=$('zbm').value;if(!d||m===''){$('zbok').textContent='Pick a day and a month first';return}p('bday',JSON.stringify([d,m]));fromBday(true);show();if(window.M2)M2.up();$('zbok').textContent='✓ Saved. Your signs are set'}$('zbd').onchange=function(){$('zbok').textContent=''};$('zbm').onchange=function(){$('zbok').textContent=''};$('zbs').onclick=bd;
sel.onchange=function(){var i=+sel.value;p('z_'+k,i);if(k==='w'&&g('z_v')===null)p('z_v',(i+11)%12);if(k==='v'&&g('z_w')===null)p('z_w',(i+1)%12);show();if(window.M2)M2.up()};var t=g('z_tab');if(t&&D[t])k=t;fromBday(false);show()})();</script></section>`;
}

// ---- Was this useful? 👍/👎 per page, plus "did we mess up?" notes ----
async function rate(req, env, ctx) {
  let b = {}; try { b = await req.json(); } catch (e) {}
  const p = String(b.p || "/").slice(0, 80).replace(/[^\w\/-]/g, "") || "/";
  if (b.v === "up" || b.v === "down") { const k = "rate:" + p, c = (await env.DATA.get(k, "json")) || { up: 0, down: 0 }; c[b.v]++; await env.DATA.put(k, JSON.stringify(c));
    const pc = okTown(cookie(req, "mpc")); if (pc) { const kp = "ratepc:" + pc, cp = (await env.DATA.get(kp, "json")) || { up: 0, down: 0 }; cp[b.v]++; await env.DATA.put(kp, JSON.stringify(cp)); } }
  const note = String(b.note || "").trim().slice(0, 800), email = String(b.email || "").trim().slice(0, 120);
  if (note) {
    const sec = String(b.sec || "").trim().slice(0, 80);
    const fb = { kind: "Spot an error: " + p + (sec ? " › " + sec : ""), msg: note, name: "", email: email || "anonymous", page: `https://${R.domain}${p}`, sec, at: new Date().toISOString() };
    await env.DATA.put(`fb:${fb.at}:${crypto.randomUUID().slice(0, 6)}`, JSON.stringify(fb));
    const me = await member(req, env), from = me || email;
    mailUs(env, ctx, `${R.code} error spotted: ${p}${sec ? " › " + sec : ""}`, `Page: https://${R.domain}${p}\nWhere: ${sec || "(not given)"}\n\n${note}\n\nFrom: ${from || "anonymous"}`, from);
    const ck = await joinQuiet(req, env, email, "", "spot an error");
    return withCookies(Response.json({ ok: true, joined: ck.length > 0 }), ck);
  }
  return Response.json({ ok: true });
}


// ---- Births, Deaths and Marriages: one place, filter by what you're looking for ----
const BDM_F = [["all", "All"], ["births", "👶 Births"], ["deaths", "🕊️ Deaths"], ["marriages", "💍 Marriages"]];
async function bdmGroups(env, joyDays, obitDays, max) {
  const joy = await joyWithin(env, joyDays), obits = await obitsWithin(env, obitDays), cut = a => max ? a.slice(0, max) : a;
  return [
    ["births", "👶 Births", "Welcome to the world.", cut(joy.filter(n => n.kind === "birth")).map(joyItem), `<a href="/celebrations">Share a birth (free) →</a>`],
    ["deaths", "🕊️ Deaths", "Remembering locals who have passed. Our thoughts are with their families and friends.", cut(obits).map(obitItem), `<a href="/rip">All recent notices →</a>`],
    ["marriages", "💍 Marriages", "Engagements, weddings and big anniversaries.", cut(joy.filter(n => n.kind !== "birth")).map(joyItem), `<a href="/celebrations">Share your news (free) →</a>`]];
}
const bdmHtml = (groups, id) => `<div class="pills" id="${id}f">${BDM_F.map(([k, l], i) => `<button type="button" data-f="${k}"${i ? "" : ' class="on"'}>${l}</button>`).join("")}</div>
${groups.map(([k, h, sub, items, more]) => `<div data-g="${k}"><h3>${h}</h3><p class="mute">${sub}</p>${items.length ? `<ul>${items.join("")}</ul>` : `<p class="mute">No recent notices.</p>`}<p>${more}</p></div>`).join("")}
<script>(function(){var w=document.getElementById('${id}f');function set(f){w.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.dataset.f===f)});w.parentNode.querySelectorAll('[data-g]').forEach(function(g){g.hidden=f!=='all'&&g.dataset.g!==f})}
w.querySelectorAll('button').forEach(function(b){b.onclick=function(){set(b.dataset.f)}});var q=new URLSearchParams(location.search).get('f');if(q&&/^(births|deaths|marriages)$/.test(q))set(q)})()</script>`;
// ---- Trending baby names: the official NSW lists since 1952, with movement on the year before. Sourced, never edited. ----
// Fallback = the top 5s as published by NSW on 26 March 2026, used only if the data can't be reached.
const NAMES_FALLBACK = { year: 2025, boys: [["Noah", 1], ["Oliver", 2], ["Theodore", 3], ["Luca", 4], ["Leo", 0]].map(([name, prev], i) => ({ name, rank: i + 1, prev })),
  girls: [["Charlotte", 1], ["Amelia", 2], ["Olivia", 3], ["Isla", 5], ["Mia", 4]].map(([name, prev], i) => ({ name, rank: i + 1, prev })) };
// Around Australia and the world: official registry lists, updated once a year when each country publishes.
const NAMES_AU = { year: 2025, src: "each state and territory's Births, Deaths and Marriages registry", rows: [["NSW", "Charlotte", "Noah"], ["VIC", "Charlotte", "Noah"], ["QLD", "Charlotte", "Oliver"], ["WA", "Isla", "Noah"], ["SA", "Charlotte", "Oliver"], ["TAS", "Charlotte", "Noah"], ["ACT", "Evelyn", "Oliver"], ["NT", "Amelia", "Noah"]] };
const NAMES_WORLD = [
  { flag: "🇳🇿", place: "New Zealand", year: 2025, girls: ["Isla", "Charlotte", "Amelia", "Hazel", "Olivia"], boys: ["Noah", "Luca", "Oliver", "George", "Theodore"], src: "NZ Department of Internal Affairs", url: "https://www.govt.nz/browse/family-and-whanau/having-a-baby/top-baby-names/" },
  { flag: "🇺🇸", place: "United States", year: 2025, girls: ["Olivia", "Charlotte", "Emma", "Amelia", "Sophia"], boys: ["Liam", "Noah", "Oliver", "Theodore", "Henry"], src: "US Social Security Administration", url: "https://www.ssa.gov/oact/babynames/" },
  { flag: "🇨🇦", place: "Canada", year: 2025, girls: ["Charlotte", "Olivia", "Emma", "Sophia", "Amelia"], boys: ["Noah", "Theodore", "Liam", "Leo", "William"], src: "Statistics Canada", url: "https://www150.statcan.gc.ca/n1/daily-quotidien/260923/dq260923e-eng.htm" },
  { flag: "🇬🇧", place: "England & Wales", year: 2025, girls: ["Olivia", "Lily", "Amelia", "Isla", "Florence"], boys: ["Muhammad", "Noah", "Leo", "Luca", "Arthur"], src: "UK Office for National Statistics", url: "https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/livebirths" },
  { flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", place: "Scotland", year: 2025, girls: ["Freya", "Isla", "Olivia", "Amelia", "Grace"], boys: ["Noah", "Luca", "Rory", "Muhammad", "Oliver"], src: "National Records of Scotland", url: "https://nrscotland.gov.uk/publications/babies-first-names-2025/" },
  { flag: "🇮🇪", place: "Ireland", year: 2025, girls: ["Lily", "Éabha", "Fiadh", "Grace", "Sadie"], boys: ["Rían", "Jack", "Noah", "James", "Oisín"], src: "Central Statistics Office", url: "https://www.cso.ie/en/releasesandpublications/ep/p-ibn/irishbabiesnames2025/keyfindings" }];
const namesWorldTally = () => { const c = {}; for (const w of NAMES_WORLD) for (const n of [...w.girls, ...w.boys]) c[n] = (c[n] || 0) + 1;
  return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 3); };
async function namesBlock(env, ctx) {
  // Never make a page wait on the big file: read what's stored, and fetch in the background (at most hourly) if nothing is.
  const v = await env.DATA.get("src:babynames", "json");
  if ((!v || !v.items?.decades) && ctx && !(await env.DATA.get("try:babynames"))) { await env.DATA.put("try:babynames", "1", { expirationTtl: 3600 }); ctx.waitUntil(refreshSource(env, "babynames")); }
  const live = v && v.ok !== false && v.items?.boys?.length, d = live ? v.items : NAMES_FALLBACK;
  const move = r => !r.prev ? (live ? `<span class="mute"> new</span>` : "") : r.prev === r.rank ? `<span class="mute"> =</span>` : r.prev > r.rank ? `<span class="up"> ▲${r.prev - r.rank}</span>` : `<span class="dn"> ▼${r.rank - r.prev}</span>`;
  const col = (g, ico) => `<div><h3>${ico} ${g === "boys" ? "Boys" : "Girls"}</h3><ol class="names">${d[g].map(r => `<li value="${r.rank}"${r.rank === 1 ? ' class="n1"' : ""}><b>${esc(r.name)}</b>${move(r)}</li>`).join("")}</ol>
${d[g + "Climb"] && d[g + "Climb"].prev - d[g + "Climb"].rank > 0 ? `<p class="mute">🚀 Biggest climber: <b>${esc(d[g + "Climb"].name)}</b>, up ${d[g + "Climb"].prev - d[g + "Climb"].rank} to #${d[g + "Climb"].rank}</p>` : ""}${d[g + "New"] ? `<p class="mute">✨ Highest new entry: <b>${esc(d[g + "New"].name)}</b> at #${d[g + "New"].rank}</p>` : ""}</div>`;
  const nswSrc = `<a href="${SOURCES.babynames.url}" rel="noopener">NSW Registry of Births, Deaths and Marriages</a>`;
  const working = what => `<p class="nwork">🛠️ Team Smarketing is pulling ${what} from the ${nswSrc}. Check back soon.</p>`;
  const tally = namesWorldTally();
  const tabs = [["nsw", "NSW"], ["au", "Australia"], ["world", "World"], ["decades", "By decade"], ["yours", "Your name"], ["ideas", "✨ Ideas with Mav"]];
  return `<div class="namesbox" id="names"><p class="nkick">Just for curiosity</p><h3 class="nhead">👶 Trending baby names</h3>
<div class="ntabs" role="tablist">${tabs.map(([k, l], i) => `<button type="button" data-t="${k}"${i ? "" : ' class="on"'}>${l}</button>`).join("")}</div>
<div data-p="nsw"><p class="nsub">Top ${d.boys.length} across NSW, ${d.year}</p><div class="grid2">${col("girls", "👧")}${col("boys", "👦")}</div>
<p class="src">${live ? fresh(v.asof) : ""}Source: the latest full-year list from the ${nswSrc}. Arrows show the move since ${d.year - 1}. NSW doesn't publish names by town.${live ? ` Checked ${esc(asOf(v.asof))}.` : " As published 26 March 2026."}</p></div>
<div data-p="au" hidden><p class="nsub">Number one in every state, ${NAMES_AU.year}</p>
<table class="namest"><thead><tr><th></th><th>👧 Girls</th><th>👦 Boys</th></tr></thead><tbody>${NAMES_AU.rows.map(([st, g, b]) => `<tr><th>${st}</th><td>${g}</td><td>${b}</td></tr>`).join("")}</tbody></table>
<p class="src">Source: ${NAMES_AU.src}. There's no single official list for all of Australia.</p></div>
<div data-p="world" hidden><p class="nsub">Top 5 around the world, ${NAMES_WORLD[0].year}</p><div class="namesw">${NAMES_WORLD.map(c => `<div><p><b>${c.flag} ${c.place}</b></p><p class="mute">👧 ${c.girls.join(", ")}</p><p class="mute">👦 ${c.boys.join(", ")}</p><p class="src">Source: <a href="${c.url}" rel="noopener">${c.src}</a></p></div>`).join("")}</div>
<p class="mute">💡 Names that travel: ${tally.map(([n, c]) => `<b>${n}</b> (top 5 in ${c} places)`).join(", ")}.</p></div>
<div data-p="decades" hidden><p class="nsub">NSW's number one, decade by decade</p>${live && d.decades?.length ? `<table class="namest"><thead><tr><th></th><th>👧 Girls</th><th>👦 Boys</th></tr></thead><tbody>${d.decades.slice().reverse().map(x => `<tr><th>${x.from === x.to ? x.from : `${x.d}s`}</th><td>${esc(x.girl || "")}</td><td>${esc(x.boy || "")}</td></tr>`).join("")}</tbody></table>
<p class="src">Source: ${nswSrc}, counting every baby given each name in the decade. NSW lists start in ${d.decades[0].from}${d.decades[0].from % 10 ? `, so the ${d.decades[0].d}s are ${d.decades[0].from} to ${d.decades[0].to}` : ""}; the ${d.decades[d.decades.length - 1].d}s run to ${d.decades[d.decades.length - 1].to}.</p>` : working("every year since 1952")}</div>
<div data-p="yours" hidden><p class="nsub">How popular has your name been in NSW?</p>
<form class="nlook"><input name="n" maxlength="30" placeholder="Type a first name, e.g. Megan" autocomplete="off" required><button>Look it up</button></form><div class="nout" aria-live="polite"></div>
<p class="src">Source: ${nswSrc}, top 100 boys' and girls' names every year since 1952.</p></div>
<div data-p="ideas" hidden><div class="mavq"><img src="/mav.svg" alt="" width="40" height="40"><p><b>G'day, I'm Mav.</b> Tell me a bit about what you like and I'll come up with names to think about.</p></div>
<form class="nidea"><p class="nq">1. Who are we naming?</p><div class="nchips" data-k="g" data-one="1"><button type="button" data-v="girl">Girl</button><button type="button" data-v="boy">Boy</button><button type="button" data-v="either" class="on">Either / surprise me</button></div>
<p class="nq">2. What style? <span class="mute">Pick any</span></p><div class="nchips" data-k="style">${["Classic", "Modern", "Short and sweet", "Nature", "Beachy", "Strong", "Soft", "Unusual", "Old-fashioned comeback", "Works in any language"].map(s => `<button type="button" data-v="${s}">${s}</button>`).join("")}</div>
<p class="nq">3. A language or heritage? <span class="mute">Optional</span></p><input name="heritage" maxlength="60" placeholder="e.g. Irish, Hindi, Italian, Greek, Japanese, Samoan">
<p class="nq">4. Anything else? <span class="mute">Optional</span></p><input name="letter" maxlength="1" placeholder="Starts with…" style="width:8em"> <input name="surname" maxlength="30" placeholder="Surname, so it flows" style="width:14em">
<input name="extra" maxlength="160" placeholder="e.g. after Nan Rose, not too popular, easy to spell">
<p><button>✨ Give me names</button></p></form><div class="nideas" aria-live="polite"></div>
<p class="src">Ideas from Mav, using AI. Meanings and origins are a starting point: check them before you decide. Popularity comes from the ${nswSrc}.</p></div>
<script>(function(){var b=document.getElementById('names');if(!b||b.dataset.on)return;b.dataset.on=1;var T=b.querySelectorAll('.ntabs button');
function set(t){T.forEach(function(x){x.classList.toggle('on',x.dataset.t===t)});b.querySelectorAll('[data-p]').forEach(function(p){p.hidden=p.dataset.p!==t})}
T.forEach(function(x){x.onclick=function(){set(x.dataset.t)}});var q=new URLSearchParams(location.search).get('t');if(q&&b.querySelector('[data-p="'+q+'"]'))set(q);
function e(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var L=b.querySelector('.nlook'),O=b.querySelector('.nout');L.onsubmit=function(ev){ev.preventDefault();O.textContent='Looking…';fetch('/api/names/lookup?n='+encodeURIComponent(L.n.value.trim())).then(function(r){return r.json()}).then(function(j){O.innerHTML=j.html||e(j.error||'Try again soon.')}).catch(function(){O.textContent='Try again soon.'})};
b.querySelectorAll('.nchips button').forEach(function(x){x.onclick=function(){var w=x.parentNode;if(w.dataset.one)w.querySelectorAll('button').forEach(function(y){y.classList.remove('on')});x.classList.toggle('on',w.dataset.one?true:!x.classList.contains('on'))}});
var F=b.querySelector('.nidea'),N=b.querySelector('.nideas');F.onsubmit=function(ev){ev.preventDefault();var pick=function(k){return [].map.call(F.querySelectorAll('[data-k="'+k+'"] .on'),function(x){return x.dataset.v})};
N.innerHTML='<p class="mute">Mav is thinking…</p>';fetch('/api/names/ideas',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({g:pick('g')[0]||'either',style:pick('style'),heritage:F.heritage.value,letter:F.letter.value,surname:F.surname.value,extra:F.extra.value})}).then(function(r){return r.json()}).then(function(j){
if(!j.names||!j.names.length){N.innerHTML='<p class="nwork">'+e(j.error||j.say||'Mav couldn’t think of any just now. Try again.').replace(/(\\/(signin|membership))/,'<a href="$1">$1</a>')+'</p>';return}
N.innerHTML=(j.say?'<p><b>'+e(j.say)+'</b></p>':'')+'<ul class="nlist">'+j.names.map(function(n){return '<li><b>'+e(n.name)+(F.surname.value?' <span class="mute">'+e(F.surname.value)+'</span>':'')+'</b>'+(n.pop?' <span class="npop">'+e(n.pop)+'</span>':'')+'<br><span class="mute">'+e([n.origin,n.meaning].filter(Boolean).join(' · '))+'</span></li>'}).join('')+'</ul><p class="mute">Not quite? Change a pick and ask again.</p>'}).catch(function(){N.innerHTML='<p class="nwork">Mav couldn’t think just now. Try again soon.</p>'})}})()</script></div>`;
}
// Your name's NSW history, from the index saved with the official list.
async function namesLookup(url, env) {
  const raw = String(url.searchParams.get("n") || "").trim().slice(0, 30), k = raw.toLowerCase();
  if (!/^[\p{L}' -]{2,30}$/u.test(raw)) return Response.json({ error: "Type a first name, letters only." });
  const idx = await env.DATA.get("names:idx", { type: "json", cacheTtl: 3600 });
  if (!idx) return Response.json({ html: `<p class="nwork">🛠️ Team Smarketing is loading every NSW list since 1952. Check back soon.</p>` });
  const hit = idx.names[k], fmt = s => (s || "").split(",").filter(Boolean).map(p => p.split(":").map(Number));
  if (!hit) return Response.json({ html: `<p><b>${esc(raw)}</b> hasn't made the NSW top 100 in any year since ${idx.from}. A true original. 🌟</p>` });
  const out = [["girls", "👧", fmt(hit[2])], ["boys", "👦", fmt(hit[1])]].filter(x => x[2].length).map(([g, ico, ys]) => {
    const best = ys.reduce((a, b) => b[1] < a[1] || (b[1] === a[1] && b[0] > a[0]) ? b : a), last = ys[ys.length - 1];
    const now = last[0] !== idx.to ? `last in the top 100 in ${last[0]}` : best === last ? `#${last[1]} in ${idx.to} is its best yet` : `#${last[1]} in ${idx.to}`;
    const bars = []; for (let d = Math.floor(idx.from / 10) * 10; d <= idx.to; d += 10) { const inD = ys.filter(y => y[0] >= d && y[0] < d + 10), b = inD.length ? Math.min(...inD.map(y => y[1])) : 0;
      bars.push(`<span title="${d}s${b ? `: best #${b}` : ": not in the top 100"}"><i style="height:${b ? Math.max(8, 101 - b) : 2}%"></i><small>${String(d).slice(2)}</small></span>`); }
    return `<p>${ico} <b>${esc(hit[0])}</b> (${g}): in the NSW top 100 for <b>${ys.length}</b> year${ys.length > 1 ? "s" : ""}. ${best === last && last[0] === idx.to ? `${now[0].toUpperCase()}${now.slice(1)}` : `Peak <b>#${best[1]}</b> in ${best[0]}; ${now}`}.</p><div class="nspark" aria-hidden="true">${bars.join("")}</div>`; });
  return Response.json({ html: out.join("") + `<p class="mute">Best rank each decade. Taller means more popular.</p>` });
}
// Baby name ideas: Mav asks a few questions, AI suggests names, the official NSW list adds how common each one is.
async function namesIdeas(req, env) {
  let j = {}; try { j = await req.json(); } catch (e) {}
  const clip = (s, n) => String(s || "").replace(/[<>{}]/g, "").trim().slice(0, n);
  const g = ["girl", "boy"].includes(j.g) ? j.g : "either", style = (Array.isArray(j.style) ? j.style : []).map(s => clip(s, 30)).slice(0, 10);
  const heritage = clip(j.heritage, 60), letter = clip(j.letter, 1).replace(/[^\p{L}]/gu, ""), surname = clip(j.surname, 30), extra = clip(j.extra, 160);
  const stop = mavGuard([heritage, surname, extra].join(" ")); if (stop) return Response.json({ error: stop.reply });
  const em = await member(req, env), day = todayISO();
  if (!em && cookie(req, "names1")) return Response.json({ error: `Loved helping! For more name ideas, sign in to My ${R.code}. It's free and takes one tap: /signin` });
  if (em) { const used = +(await env.DATA.get(`nameideas:${em}:${day}`)) || 0;
    if (used >= 10) return Response.json({ error: "That's 10 rounds of ideas today. Sleep on the shortlist and Mav will have more tomorrow." });
    await env.DATA.put(`nameideas:${em}:${day}`, String(used + 1), { expirationTtl: 172800 }); }
  if (!env.AI) return Response.json({ error: "Mav is having a rest. Try again soon." });
  const sys = `You are Mav, a warm, down-to-earth Aussie helper suggesting baby names. Suggest 10 real, kind, easy-to-say first names that fit the brief. Never suggest anything rude, a brand, or a famous person's full name. Origins and meanings must be well-known and accurate; if unsure of a meaning, leave it "". Reply ONLY JSON: {"say":"one short friendly sentence","names":[{"name":"","gender":"girl|boy|either","origin":"language or culture","meaning":"a few words"}]}`;
  const brief = `Naming a: ${g}. Style: ${style.join(", ") || "any"}. Language or heritage: ${heritage || "any"}. Starts with: ${letter || "any letter"}. Surname: ${surname || "not given"} (names should flow with it). Other wishes: ${extra || "none"}.`;
  let out; const run = async model => { const r = await env.AI.run(model, { max_tokens: 700, messages: [{ role: "system", content: sys }, { role: "user", content: brief }] });
    const raw = typeof r.response === "string" ? r.response : JSON.stringify(r.response || {}), o = JSON.parse((raw.match(/\{[\s\S]*\}/) || [])[0]);
    if (!Array.isArray(o?.names) || !o.names.length) throw new Error("no names"); return o; };
  try { out = await run("@cf/meta/llama-3.3-70b-instruct-fp8-fast"); } catch (e) { try { out = await run("@cf/meta/llama-3.1-8b-instruct-fast"); } catch (e2) { return Response.json({ error: "Mav couldn't think of any just now. Try again." }); } }
  const idx = await env.DATA.get("names:idx", { type: "json", cacheTtl: 3600 });
  const seen = new Set(), names = out.names.map(n => ({ name: clip(n.name, 30), gender: n.gender, origin: clip(n.origin, 40), meaning: clip(n.meaning, 60) }))
    .filter(n => /^[\p{L}' -]{2,30}$/u.test(n.name) && !MAV_NO.test(n.name) && !seen.has(n.name.toLowerCase()) && seen.add(n.name.toLowerCase())).slice(0, 12)
    .map(n => { if (!idx) return n; const h = idx.names[n.name.toLowerCase()]; if (!h) return { ...n, pop: "Rare in NSW" };
      const sets = (g === "boy" ? [h[1]] : g === "girl" ? [h[2]] : [h[1], h[2]]).join(",").split(",").filter(Boolean).map(p => p.split(":").map(Number));
      const now = sets.filter(p => p[0] === idx.to).sort((a, b) => a[1] - b[1])[0];
      return { ...n, pop: now ? `NSW #${now[1]} in ${idx.to}` : sets.length ? `Last in NSW top 100: ${Math.max(...sets.map(p => p[0]))}` : `Rare for ${g}s in NSW` }; });
  const res = Response.json({ say: clip(out.say, 140), names }), h = new Headers(res.headers);
  if (!em) h.append("set-cookie", "names1=1; Path=/; Max-Age=31536000; Secure; SameSite=Lax");
  return new Response(res.body, { status: res.status, headers: h });
}
async function bdmBlock(env, ctx) {
  return `<section id="bdm"><h2>Births, Deaths and Marriages</h2>${bdmHtml(await bdmGroups(env, 30, 5, 5), "bdmh")}${await namesBlock(env, ctx)}<p><a href="/bdm"><b>See all Births, Deaths and Marriages →</b></a></p></section>`;
}
async function bdmPage(env, ctx) {
  return page("Births, Deaths and Marriages", `<p class="mute"><a href="/${R.code}">‹ ${R.code} ${R.place}</a></p><h1>Births, Deaths and Marriages</h1>
<p>Family notices from around ${esc(R.place)}. Pick what you&rsquo;re looking for.</p>
${bdmHtml(await bdmGroups(env, 90, 60, 0), "bdmp")}
${await namesBlock(env, ctx)}
<p class="mute">Births and marriages are shared by families and checked before they appear. Death notices come from funeral homes and link to the official notice.</p>`, R.code);
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
  const news = R.news.map(n => n.name).join(", "), homes = (R.funerals || []).map(f => f.name).join(" and "), G = `${R.code} Maverick`, base = `https://${R.domain}`;
  const places = [[R.place + " and the shire", R.code], ...Object.entries(TOWNS).filter(([, t]) => t.live).map(([pc, t]) => [t.name + " (" + pc + ")", pc])];
  const out = [];
  for (const [T, pc] of places) {
    const u = `${base}/${pc}`;
    out.push([T, [
      [`What's on in ${T} this weekend?`, `${G} lists local events for ${T} every day: markets, live music, kids' activities and community events, with free and low-cost events first. Every listing costs $50 or less per person. See ${u}#events.`],
      [`Where can I find local news for ${T}?`, `${G} gathers today's local headlines from ${news}, with a short summary and a link to the full story on the publisher's site. See ${u}#news.`],
      [`Where can I find obituaries and funeral notices in ${T}?`, `The Births, Deaths and Marriages section of ${G} lists recent death notices for the area${homes ? `, sourced from local funeral directors including ${homes}` : ""}, with a link to each official notice. See ${base}/rip.`],
      [`Where can I find birth, engagement and wedding notices in ${T}?`, `${G} has a free Births & marriages section where local families share new babies, engagements, weddings and anniversaries. Every notice is checked before it appears. See ${base}/celebrations.`],
      [`What's the weather in ${T} today?`, `${G} shows today's temperature, rain chance, wind, sunrise and sunset for ${T}. See ${u}.`],
      [`What are the tide times in ${T} today?`, `${G} shows the next high and low tides, wave and swell height for ${T}. Tide times are modelled estimates, not for navigation. See ${u}#sea.`],
      [`Where is the cheapest fuel in ${T}?`, `${G} shows today's cheapest fuel near ${T} by type (E10, unleaded, premium and diesel), using the NSW Government's FuelCheck prices. See ${u}#fuel.`],
      [`What's the surf like in ${T} today?`, `${G} shows wave height, swell, sea temperature, wind and UV for local beaches, with tips like whether today suits beginners or big-wave surfers. See ${u}#beaches.`],
      [`Is it safe to swim at the beach in ${T}?`, `Always swim between the red and yellow flags at a patrolled beach. ${G} links to Beachsafe for patrol times and shows today's wave and UV conditions. See ${u}#beaches.`],
      [`When is bin night in ${T}?`, `${G} has a free bin night reminder for ${T}. Bin collections are run by ${R.council.name}. See ${base}/home.`],
      [`How do I contact ${R.council.name}?`, `${R.council.name} is on ${R.council.phone} and at ${R.council.url}. ${R.council.urgent}.`],
      [`What flights are arriving and leaving ${R.airport.name} today?`, `${G} shows today's flights for ${R.airport.name}. See ${u}#flights.`],
      [`When are the next public holidays and school holidays for ${T}?`, `${G} lists the next NSW public holidays and school holidays, with how many days away each one is. See ${u}#holidays.`],
      [`Is there a local crossword for ${T}?`, `Yes. ${G} has a free daily crossword with local clues, the same for everyone each day. See ${base}/crossword.`],
      [`Where can I read today's horoscope in ${T}?`, `${G} has free daily horoscopes (Western, Vedic Indian and Chinese), always on the bright side. See ${u}#stars.`],
      [`What's open now in ${T}?`, `${G} shows pharmacies, mechanics, servos, cafés and more near ${T}, with open places first. See ${base}/open.`],
      [`What can kids do in ${T} this weekend?`, `${G} has a Get outside this weekend section with free playgrounds, walks, beaches and outdoor family events near ${T}. See ${u}#kids.`],
      [`How do I report a lost or found pet in ${T}?`, `Post it free on the ${G} community notice board, which also lists volunteers, clubs and classes. See ${base}/notices.`],
      [`Are there any bushfires near ${T}?`, `${G} lists fires within 100 km of ${T} from NSW Rural Fire Service, and current Bureau of Meteorology weather warnings. In an emergency, call 000. See ${u}#alerts.`],
      [`Whose traditional land is ${T} on?`, `${R.ack.replace(/^\d+ Maverick acknowledges/, "We acknowledge").replace(" and pays respect", " and pay respect")} You can explore the Map of Indigenous Australia at aiatsis.gov.au.`],
      [`How do I list an event in ${T}?`, `Add it free at ${base}/submit?pc=${pc}. Events must cost $50 or less per person.`],
      [`Which local places give birthday deals in ${T}?`, `${G} lists local places that look after you on your birthday. See ${base}/birthday.`],
      [`What can I cook for dinner tonight with what's in my fridge?`, `Tell ${G}'s fridge helper what you've got and how many you're feeding, and get dinner ideas in seconds. See ${base}/fridge.`],
      [`When is the next full moon in ${T}?`, `${G} shows the moon phase and days until the next full moon, plus meteor showers and sky events in the next 14 days. See ${u}.`],
    ]]);
  }
  out.push([`About ${R.code} Maverick`, [
    [`What is ${G}?`, `${G} is a free daily community paper for ${R.place} and the shire: local news, events, alerts, tides, fuel, flights, a crossword, horoscopes, In memory, and births and marriages, all on one page. ${R.coverage}`],
    ...(R.status ? [[`Is ${R.place} a town or a city?`, `${R.status} People often still call it a town because of its relaxed feel. ${R.statusSrc ? "Source: " + R.statusSrc : ""}`.trim()]] : []),
    [`What is the population of ${R.place}?`, `The ABS (Australian Bureau of Statistics) publishes an estimated population for the whole ${R.council.name} area every year. ${G} shows the latest figure, plus median age, income and rent from the Census, in Know your ${R.code}. See ${base}/${R.code}#know.`],
    [`Is ${G} free?`, `Yes. The local information is free forever, with no paywall on it and no fees to list an event or notice. Optional paid extras (personal tools) are there for those who want them. The website is ad-free.`],
    [`Who runs ${G}?`, `${G} is a free gift to the community from Maverick Digital, a Coffs Harbour business that uses big tech skills for the community.`],
    [`Does ${G} write its own news?`, `No. ${G} is an aggregator: it gathers information from local news outlets, councils, government services, venues and local families, and every item names and links to its source. The stories and information belong to those sources.`],
    [`Where does ${G} get its information?`, `Every item names its source and shows when it was last updated, from local news outlets, NSW Government services, the Bureau of Meteorology, NSW Rural Fire Service, local funeral directors and local families. One policy: no BS. No opinions, no spin.`],
    [`Can I get one of these for my town?`, `Yes. Any town in rural and community Australia can ask for its own at ${base}/suggest.`],
    [`Which other towns have one?`, Object.values(REGIONS).map(x => `${x.code} Maverick covers ${x.place}`).join("; ") + "."],
  ]]);
  return out;
}
function faqPage() {
  const groups = faqList(), all = groups.flatMap(g => g[1]), about = groups.find(g => /^About /.test(g[0])), main = groups[0];
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: all.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  // People see one tidy set, grouped by topic. Every town's version stays in the data for search engines and AI.
  const TOP = [["📰 News, events &amp; notices", /news|what's on|event|obituar|funeral|birth|wedding|engagement/i], ["🌊 Weather, beach &amp; sea", /weather|tide|surf|swim|beach|moon|bushfire|fire/i],
    ["🚗 Getting around", /fuel|flight|open now|traffic/i], ["🏛️ Council &amp; community", /bin|council|pet|traditional land|list an event/i],
    ["🧒 Family, food &amp; fun", /kids|holiday|crossword|horoscope|birthday|cook|fridge|dinner/i]];
  const qs = main ? main[1] : [], used = new Set(), sec = TOP.map(([h, re]) => [h, qs.filter(x => !used.has(x) && re.test(x[0]) && used.add(x))]);
  const rest = qs.filter(x => !used.has(x)); if (rest.length) sec.push(["More questions", rest]);
  if (about) sec.push(["ℹ️ About the Daily Maverick", about[1]]);
  const qa = ([q, a]) => `<details class="faq"><summary>${esc(q)}</summary><p>${esc(a).replace(/(https:\/\/[^\s,]+?)(?=[.,]?(\s|$))/g, '<a href="$1">$1</a>')}</p></details>`;
  const towns = groups.filter(g => g !== main && g !== about).map(g => g[0]);
  return page(`Questions about ${R.place}`, `<p class="mute"><a href="/">‹ ${R.code}</a></p><h1>Questions about ${esc(R.place)}</h1>
<p class="mute">Quick answers to what locals ask most. This page is mostly here so search engines and AI assistants get the facts right, but every answer is here for you too.</p>
<input id="faqq" type="search" placeholder="🔎 Search the questions" aria-label="Search the questions" style="width:100%;margin:6px 0 10px">
<script>document.getElementById('faqq').oninput=function(){var q=this.value.toLowerCase();document.querySelectorAll('details.faq').forEach(function(d){var hit=!q||d.textContent.toLowerCase().indexOf(q)>-1;d.style.display=hit?'':'none';if(q&&hit)d.open=true})}</script>
${sec.filter(x => x[1].length).map(([h, L]) => `<h2>${h}</h2>${L.map(qa).join("")}`).join("")}
${towns.length ? `<p class="mute">The same answers apply to ${towns.map(esc).join(", ")}.</p>` : ""}
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`, R.code);
}
const robotsTxt = () => new Response(`User-agent: *\nAllow: /\nAllow: /api/health\nDisallow: /admin\nDisallow: /api/\nSitemap: https://${R.domain}/sitemap.xml\n`, { headers: { "content-type": "text/plain" } });
function sitemapXml() {
  const b = `https://${R.domain}`, paths = ["/", ...NAV_SLUGS.map(x => "/" + x), ...Object.keys(TOWNS).filter(k => TOWNS[k].live).map(k => "/" + k), "/faq", "/rip", "/celebrations", "/ai-log", "/crossword", "/watch", "/notices", "/open", "/home", "/rent", "/jobs", "/timesaved", "/status", "/award", "/all", "/celebrations", "/ai-log", "/new", "/towns", "/birthday", "/fridge", "/" + R.why.slug, "/about", "/charter", "/privacy", "/suggest"];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(x => `<url><loc>${b}${x}</loc><changefreq>daily</changefreq></url>`).join("")}</urlset>`, { headers: { "content-type": "application/xml" } });
}
function llmsTxt() {
  const g = faqList();
  return new Response(`# The Daily Maverick, ${R.code} ${R.place}\n\n> A free daily community paper for ${R.place} and the shire (${Object.keys(TOWNS).join(", ")}), from Maverick Digital. Every item names its source. One policy: no BS.\n\n` +
    g.map(([h, qs]) => `## ${h}\n\n` + qs.map(([q, a]) => `- ${q} ${a}`).join("\n")).join("\n\n") + "\n", { headers: { "content-type": "text/plain; charset=utf-8" } });
}

// ---- What's on at the pubs, clubs and markets: we read each venue's own page twice a day and pull out
// weekly specials (schnitzel night, trivia) and dated gigs. No gambling (bingo, raffles, meat trays, draws). Only things that
// really appear on the page are kept. Admin can add more venue pages. ----
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const KINDS = { meal: "🍽️", members: "🎟️", trivia: "🧠", music: "🎵", comedy: "😂", market: "🧺", kids: "🧒", sport: "🏉", other: "📌" };
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
      const vr = await fetch(src.url, { headers: UA });
      if ([401, 403, 429, 451].includes(vr.status)) { await env.DATA.put(k, JSON.stringify({ ...(old || { name: src.name, url: src.url, items: [] }), blocked: vr.status, tried: new Date().toISOString() })); continue; }
      const html = await vr.text();
      const txt = dec(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<nav[\s\S]*?<\/nav>|<footer[\s\S]*?<\/footer>|<header[\s\S]*?<\/header>/g, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&rsquo;|&lsquo;/g, "'").replace(/&ndash;|&mdash;/g, "-")).replace(/\s+/g, " ").slice(0, 12000);
      const ask = { messages: [
        { role: "system", content: "You extract what's on at local venues from web page text. Output ONLY JSON." },
        { role: "user", content: `Today is ${today} (${DAYS[new Date(today + "T12:00:00Z").getUTCDay()]}). This page is from ${src.name}. List everything the public can go to: weekly specials (meal deals like schnitzel night), trivia, live music, comedy, markets, kids' activities and one-off events. Leave out bingo, raffles, meat trays, members draws, pokies and any other gambling. Return {"items":[...]} with at most 40 items. Each item: "venue" (venue name as written), "what" (short title, words from the page), "detail" (price or one short detail from the page, or ""), "days" (array of weekdays it repeats on, from Mon Tue Wed Thu Fri Sat Sun, or [] if it's a one-off), "date" (YYYY-MM-DD for a one-off, choosing the next such date on or after today, else ""), "week" (for monthly things like "1st Sunday", the number 1-4, else 0), "time" (e.g. "6pm", or ""), "kind" (one of meal members trivia music comedy market kids sport other). Never invent anything that isn't on the page.\n\nPAGE:\n${txt}` },
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
      await env.DATA.put(k, JSON.stringify(items.length ? { name: src.name, url: src.url, items, asof: new Date().toISOString(), tried: new Date().toISOString(), blocked: 0 } : { ...(old || { name: src.name, url: src.url, items: [] }), tried: new Date().toISOString() }));
    } catch (e) { await env.DATA.put(k, JSON.stringify({ ...(old || { name: src.name, url: src.url, items: [] }), tried: new Date().toISOString() })); }
  }
}
async function plannerData(env) {
  const out = []; out.blocked = [];
  for (const src of await venueSources(env)) { const v = await env.DATA.get(vkey(src.url), "json"); if (v && v.blocked) out.blocked.push(v.name); if (v) for (const it of v.items) out.push({ ...it, src: v.name, url: v.url, asof: v.asof }); }
  for (const pc of Object.keys(TOWNS).filter(k => TOWNS[k].live)) for (const e of [...await listEvents(env, `event:${pc}:`), ...await listEvents(env, `feed:${pc}:`)])
    out.push({ venue: e.venue || TOWNS[pc].name, what: e.title, detail: "", days: [], date: e.date, week: 0, time: e.time || "", kind: "other", url: e.link || "", src: e.link ? "Event listing" : "Added by a local" });
  return out;
}
async function plannerBlock(env) {
  const data = await plannerData(env);
  return `<section id="tonight"><h2>📅 What's on</h2><p class="mute">Specials, members nights, trivia, live music, markets and events around ${esc(R.short)}, in one place.</p>
<div class="ptabs" role="tablist"><button type="button" data-p="0" class="on">Today</button><button type="button" data-p="1">Tomorrow</button><button type="button" data-p="w">This weekend</button><label class="pdate">Planning ahead? <input type="date" id="pdate" min="${todayISO()}"></label></div>
<div id="pout"></div>
${data.blocked.length ? `<p class="note">🚫 These venues' websites block automatic reading, so we can't show their specials: ${data.blocked.map(esc).join(", ")}. Check with them directly.</p>` : ""}<p class="src">Read from each venue's own website twice a day. Specials can change, so check with the venue before you go. Know a venue we're missing? <a href="/feedback">Tell us</a>.</p>
<script>(function(){var D=${JSON.stringify(data).replace(/</g, "\\u003c")},K=${JSON.stringify(KINDS)},DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],out=document.getElementById('pout');
function fr(a){if(!a)return '';var d=(Date.now()-new Date(a))/864e5,k=d<=7?'g':d<=92?'a':'r';return '<span class="fresh '+k+'"></span>'}function iso(d){return d.toLocaleDateString('en-CA',{timeZone:'Australia/Sydney'})}function at(n){var d=new Date();d.setDate(d.getDate()+n);return d}
function e(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function on(day){var dn=DN[new Date(day+'T12:00:00').getDay()],nth=Math.ceil(+day.slice(8)/7);return D.filter(function(x){return x.date?x.date===day:(x.days.indexOf(dn)>-1&&(!x.week||x.week===nth))})}
var LK=${JSON.stringify(LIKE_KINDS)},MY=[];try{MY=(JSON.parse(localStorage.getItem('ev_like')||'[]')||[]).map(function(l){return LK[l]}).filter(Boolean)}catch(_){}
function list(day){var it=on(day);if(!it.length)return '<p class="mute">Nothing listed yet for this day.</p>';if(!MY.length)return grp(it);
var mine=it.filter(function(x){return MY.indexOf(x.kind)>-1}),rest=it.filter(function(x){return MY.indexOf(x.kind)<0});
return (mine.length?'<p class="pinlab">⭐ <b>For you</b> · <a href="/me#likes-h">change</a></p>'+grp(mine):'<p class="mute">Nothing matching what you like this day. <a href="/me#likes-h">Change</a></p>')+(rest.length?'<details'+(mine.length?'':' open')+'><summary>Everything else ('+rest.length+')</summary>'+grp(rest)+'</details>':'')}
function grp(it){var g={};it.forEach(function(x){(g[x.venue]=g[x.venue]||[]).push(x)});
return Object.keys(g).sort().map(function(v){return '<div class="pven"><b>'+e(v)+'</b><ul>'+g[v].map(function(x){return '<li>'+(K[x.kind]||'📌')+' '+e(x.what)+(x.time?' <span class="mute">'+e(x.time)+'</span>':'')+(x.detail?' · '+e(x.detail):'')+'</li>'}).join('')+'</ul><span class="src">'+(x0=g[v][0]).src.replace(/[<>]/g,'')+(x0.url?' · <a href="'+e(x0.url)+'" rel="noopener">their page</a>':'')+'</span></div>'}).join('')}var x0;
function head(day){return '<h3>'+new Date(day+'T12:00:00').toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'})+'</h3>'}
function show(p){if(p==='w'){var w=at(0).getDay(),days=w===6?[0,1]:w===0?[0]:[6-w,7-w];out.innerHTML=days.map(function(n){var d=iso(at(n));return head(d)+list(d)}).join('')}else if(p.length>2){out.innerHTML=head(p)+list(p)}else{var d=iso(at(+p));out.innerHTML=head(d)+list(d)}}
document.querySelectorAll('.ptabs button').forEach(function(b){b.onclick=function(){document.querySelectorAll('.ptabs button').forEach(function(x){x.classList.toggle('on',x===b)});document.getElementById('pdate').value='';show(b.dataset.p)}});
document.getElementById('pdate').onchange=function(){if(!this.value)return;document.querySelectorAll('.ptabs button').forEach(function(x){x.classList.remove('on')});show(this.value)};show('0')})();</script></section>`;
}

// ---- Supermarket watch: the price of seven everyday items at Woolworths, ALDI and Coles, checked daily from each
// supermarket's own website, so locals can see where the basics are cheapest. House brand where there is one. ----
const SHOP = [
  { id: "milk", basket: true, label: "Full cream milk 2L", ico: "🥛",
    w: { q: "woolworths full cream milk 2l", re: /^woolworths full cream milk\b.*2\s?l/i }, c: { q: "coles full cream milk 2l", re: /^coles full cream milk\b.*2\s?l/i }, a: { q: "full cream milk 2l", re: /full cream milk.*2\s?l/i } },
  { id: "bread", basket: true, label: "White sandwich bread 650g", ico: "🍞",
    w: { q: "woolworths white sandwich bread 650g", re: /^woolworths white.*sandwich.*650\s?g/i }, c: { q: "coles white sandwich bread 650g", re: /^coles .*white.*sandwich.*650\s?g/i }, a: { q: "white sandwich bread 650g", re: /white.*(sandwich|toast).*650\s?g/i } },
  { id: "eggs", basket: true, label: "Free range eggs, 12 pack", ico: "🥚",
    w: { q: "woolworths 12 pack large free range eggs", re: /^woolworths 12 pack large free range eggs/i }, c: { q: "coles free range eggs 12 pack", re: /^coles .*free range eggs.*(12|600\s?g)/i }, a: { q: "free range eggs 12 pack", re: /free range eggs.*(12|600\s?g)/i } },
  { id: "choc", basket: true, label: "Cadbury Dairy Milk 180g", ico: "🍫",
    w: { q: "cadbury dairy milk chocolate block 180g", re: /^cadbury dairy milk chocolate block.*180\s?g/i }, c: { q: "cadbury dairy milk chocolate block 180g", re: /^cadbury dairy milk (milk )?chocolate block.*180\s?g/i }, a: { q: "cadbury dairy milk 180g", re: /cadbury dairy milk.*180\s?g/i } },
  { id: "evoo", label: "Extra virgin olive oil 750ml", ico: "🫒",
    w: { q: "woolworths extra virgin olive oil 750ml", re: /^woolworths .*extra virgin olive oil.*750\s?ml/i }, c: { q: "coles extra virgin olive oil 750ml", re: /^coles .*extra virgin olive oil.*750\s?ml/i }, a: { q: "extra virgin olive oil 750ml", re: /extra virgin olive oil.*750\s?ml/i } },
  { id: "weetbix", label: "Weet-Bix 575g", ico: "🥣",
    w: { q: "sanitarium weet-bix 575g", re: /weet-?bix.*575\s?g/i }, c: { q: "sanitarium weet-bix 575g", re: /weet-?bix.*575\s?g/i }, a: { q: "weet-bix 575g", re: /weet-?bix.*575\s?g/i } },
  { id: "banana", label: "Bananas", ico: "🍌",
    w: { q: "cavendish bananas", re: /^cavendish bananas\b/i }, c: { q: "bananas", re: /^(coles )?(cavendish )?bananas?\b/i }, a: { q: "bananas", re: /banana/i } },
];
const STORES = { w: "Woolworths", a: "ALDI", c: "Coles" }; // Coles last: its website blocks our price checks
const money = n => "$" + Number(n).toFixed(2);
const shopJson = async (u, h) => { const r = await fetch(u, h); if (!r.ok) throw { status: r.status }; return r.json(); };
async function shopWoolies(it) {
  const j = await shopJson("https://www.woolworths.com.au/apis/ui/Search/products?searchTerm=" + encodeURIComponent(it.q) + "&pageSize=12", { headers: { ...UA, accept: "application/json" } });
  const p = (j.Products || []).flatMap(x => x.Products || []).find(x => it.re.test(x.Name + " " + (x.PackageSize || "")) && typeof x.Price === "number");
  return p && { name: p.Name + (p.PackageSize ? " " + p.PackageSize : ""), price: p.Price, was: p.WasPrice > p.Price ? p.WasPrice : 0, unit: p.CupString || "" };
}
async function shopColes(it, build) {
  const j = await shopJson(`https://www.coles.com.au/_next/data/${build}/en/search/products.json?q=${encodeURIComponent(it.q)}`, { headers: { ...UA, accept: "application/json" } });
  const p = (j.pageProps?.searchResults?.results || []).filter(x => x._type === "PRODUCT").find(x => it.re.test((x.brand ? x.brand + " " : "") + x.name + " " + (x.size || "")) && x.pricing && typeof x.pricing.now === "number");
  return p && { name: (p.brand ? p.brand + " " : "") + p.name + (p.size ? " " + p.size : ""), price: p.pricing.now, was: p.pricing.was > p.pricing.now ? p.pricing.was : 0, unit: p.pricing.comparable || "" };
}
async function shopAldi(it) {
  const j = await shopJson("https://api.aldi.com.au/v3/product-search?currency=AUD&serviceType=walk-in&limit=12&q=" + encodeURIComponent(it.q), { headers: { ...UA, accept: "application/json" } });
  const p = (j.data || []).find(x => it.re.test((x.brandName ? x.brandName + " " : "") + x.name + " " + (x.sellingSize || "")) && x.price && typeof x.price.amount === "number");
  return p && { name: (p.brandName ? p.brandName + " " : "") + p.name + (p.sellingSize ? " " + p.sellingSize : ""), price: p.price.amount / 100, was: p.price.wasPriceDisplay ? 0 : 0, unit: p.price.comparisonDisplay || "" };
}
async function refreshShop(env) {
  const old = await env.DATA.get("shop", "json");
  // Twice a day: a morning check from 6am and an afternoon check from 2pm (Sydney time)
  const slot = d => { const t = new Date(new Date(d).toLocaleString("en-US", { timeZone: "Australia/Sydney" })), h = t.getHours(); if (h < 6) t.setDate(t.getDate() - 1); return t.toDateString() + (h >= 6 && h < 14 ? " am" : " pm"); };
  if (old && old.v === 2 && slot(old.tried) === slot(Date.now())) return old;
  const now = new Date().toISOString(), out = { v: 2, tried: now, stores: {}, items: {} };
  let build = "", blocked = {};
  try { const cr = await fetch("https://www.coles.com.au/", { headers: UA }); build = ((await cr.text()).match(/"buildId":"([^"]+)"/) || [])[1] || ""; if (!build) blocked.c = cr.status >= 400 ? cr.status : 403; } catch (e) { blocked.c = 403; }
  for (const k of Object.keys(STORES)) {
    let got = 0;
    for (const it of SHOP) {
      let r = null;
      try { r = k === "w" ? await shopWoolies(it[k]) : k === "c" ? (build ? await shopColes(it[k], build) : null) : await shopAldi(it[k]); } catch (e) { blocked[k] = blocked[k] || (e && e.status) || "error"; }
      const prev = old && old.items && old.items[it.id] && old.items[it.id][k];
      if (r) { got++; (out.items[it.id] = out.items[it.id] || {})[k] = { ...r, prev: prev && prev.price !== r.price ? prev.price : (prev && prev.prev) || 0, at: now }; }
      else if (prev) (out.items[it.id] = out.items[it.id] || {})[k] = { ...prev, stale: true };
    }
    out.stores[k] = got ? now : (old && old.stores && old.stores[k]) || null;
    if (!got) (out.blocked = out.blocked || {})[k] = blocked[k] || "no data";
  }
  await env.DATA.put("shop", JSON.stringify(out));
  return out;
}
async function shopBlock(env) {
  const s = await env.DATA.get("shop", "json"), ks = Object.keys(STORES);
  if (!s || s.v !== 2 || !Object.keys(s.items || {}).length) return `<section id="shop"><h2>Supermarket watch</h2>${wip("Comparing everyday prices at Woolworths, ALDI and Coles. The first prices land at the next check")}${cwatchPanel("shop")}<script>${CWATCH_JS}</script></section>`;
  const px = (await env.DATA.get("shopx", "json")) || {}, picks = Object.values(px).filter(x => x.label && (x.w || x.a)).sort((a, b) => a.label.localeCompare(b.label));
  const tot = {}; ks.forEach(k => { tot[k] = SHOP.filter(i => i.basket).every(i => s.items[i.id] && s.items[i.id][k]) ? SHOP.filter(i => i.basket).reduce((a, i) => a + s.items[i.id][k].price, 0) : null; });
  const best = ks.filter(k => tot[k] != null).sort((a, b) => tot[a] - tot[b])[0];
  const refused = v => [401, 403, 429].includes(+v), blk = Object.fromEntries(Object.entries(s.blocked || {}).filter(([k, v]) => refused(v) || k === "c")), miss = Object.keys(s.blocked || {}).filter(k => !blk[k]), row = i => { const p = i._p || s.items[i.id] || {}, vals = ks.map(k => p[k] && p[k].price).filter(x => x != null), lo = Math.min(...vals);
    return `<tr><th scope="row">${esc(i.label)}</th>${ks.map(k => { const x = p[k]; if (!x) return blk[k] ? `<td class="mute" title="${STORES[k]} blocks our price checks">blocked</td>` : `<td class="mute">–</td>`;
      return `<td class="${tlc(x.price, vals)}" title="${esc(x.name)}${x.unit ? " · " + esc(x.unit) : ""}">${money(x.price)}${x.was ? `<br><small class="tagg">special</small>` : ""}${x.prev && x.prev !== x.price ? `<br><small class="mute">${x.price > x.prev ? "▲" : "▼"} ${money(x.prev)}</small>` : ""}</td>`; }).join("")}</tr>`; };
  return `<section id="shop"><h2>Supermarket watch</h2><p class="mute">The everyday basics at each supermarket today. Green is cheapest, red is dearest. We update these prices <b>twice a day</b>, around 6am and 2pm, so you always know how fresh they are.</p>
${best ? `<p class="note">Cheapest basket today (milk, bread, eggs, chocolate): <b>${STORES[best]}</b> at ${money(tot[best])}${ks.filter(k => k !== best && tot[k] != null).map(k => `, ${STORES[k]} ${money(tot[k])}`).join("")}.</p>` : ""}
<div class="tscroll"><table class="shopt"><thead><tr><th></th>${ks.map(k => `<th>${STORES[k]}${blk[k] ? `<br><small class="mute">blocks us</small>` : ""}</th>`).join("")}</tr></thead><tbody>${SHOP.map(row).join("")}</tbody>${picks.length ? `<tbody><tr><th colspan="${ks.length + 1}" class="cwh">🗳️ Picked by locals</th></tr>${picks.map(i => row({ id: "_", label: i.label, _p: i })).join("")}</tbody>` : ""}</table></div>
${Object.keys(blk).length ? `<p class="note"><b>${Object.keys(blk).map(k => STORES[k]).join(" and ")} ${Object.keys(blk).length > 1 ? "don&rsquo;t" : "doesn&rsquo;t"} let us check ${Object.keys(blk).length > 1 ? "their" : "its"} prices.</b> ${Object.keys(blk).length > 1 ? "Their websites block" : "Its website blocks"} automatic price checks, so we can&rsquo;t show ${Object.keys(blk).length > 1 ? "them" : "it"} side by side with the others. That&rsquo;s ${Object.keys(blk).length > 1 ? "their" : "its"} choice, not ours. We show what we can find, and we tell you when we can&rsquo;t.</p>` : ""}${cwatchPanel("shop")}<script>${CWATCH_JS}</script>${miss.length ? `<p class="mute">${miss.map(k => STORES[k]).join(" and ")} prices didn&rsquo;t load at this check. We&rsquo;ll try again at the next one.</p>` : ""}<p class="src">${fresh(Object.values(s.stores).filter(Boolean).sort().pop())}Online prices from each supermarket's own website, house brand where there is one. Checked: ${ks.map(k => `${STORES[k]} ${s.stores[k] ? esc(asOf(s.stores[k])) : "not available today"}`).join(" · ")}. Prices in store and specials can differ.</p></section>`;
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
  return `<section id="bypass"><h2>🚧 ${esc(R.project.name)}</h2>${p && p.points.length ? `${p.updated ? `<p class="mute">Weekly update: ${esc(p.updated)}</p>` : ""}<ul>${p.points.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : wip("The latest weekly update lands at the next check")}
<p class="src">${p && p.asof ? fresh(p.asof) : ""}<span class="srcw">Source:</span> <a href="${R.project.url}" rel="noopener">Transport for NSW's weekly update</a>${p && p.asof ? `, checked ${esc(asOf(p.asof))}` : ""}. More on the <a href="${R.project.home}" rel="noopener">project page</a>.</p></section>`;
}

// ---- Flights: today's arrivals and departures with live status, from AeroDataBox (needs a FLIGHT_KEY secret) ----
// Coffs Harbour Airport publishes its own live board as JSON (the one on its arrivals and departures page).
const ddmm = s => { const m = String(s || "").match(/(\d\d)\/(\d\d)\/(\d{4}) (\d\d:\d\d)/); return m ? `${m[3]}-${m[2]}-${m[1]} ${m[4]}` : ""; };
async function refreshAirportJson(env) {
  const old = await env.DATA.get("flights", "json"); if (old && Date.now() - new Date(old.asof) < 9 * 6e4) return;
  try {
    const j = await (await fetch(R.airport.json, { headers: { ...UA, accept: "application/json" } })).json();
    const list = (j?.flight_set?.flights?.flight || []).map(f => ({ dir: f.leg === "D" ? "dep" : "arr", no: String(f.flight_number || "").replace(/\s+/g, ""), airline: f.airline || "", other: (f.locations || []).join(", "),
      sched: ddmm(f.scheduled_time), rev: ddmm(f.actual_time || f.estimated_time), status: f.primary_remark || f.alternate_remark_one || "", gate: f.gate || "", belt: f.carousel || "" })).filter(f => f.no && f.sched).sort((a, b) => a.sched.localeCompare(b.sched));
    if (list.length || !old) await env.DATA.put("flights", JSON.stringify({ asof: new Date().toISOString(), list, src: "airport" }));
    await flightAlerts(env, list);
  } catch (e) {}
}
// Friends' flights: people track a flight number; when its status changes we send that phone a personal alert.
const flStatus = f => { const t = s => s ? s.slice(11, 16) : ""; if (/cancel/i.test(f.status)) return "Cancelled";
  const late = f.rev && f.sched && f.rev !== f.sched ? Math.round((new Date(f.rev.replace(" ", "T")) - new Date(f.sched.replace(" ", "T"))) / 6e4) : 0;
  if (/landed|arrived/i.test(f.status)) return `Landed ${t(f.rev)}`; if (/departed/i.test(f.status)) return `Departed ${t(f.rev)}`; if (/boarding/i.test(f.status)) return "Boarding";
  return late >= 10 ? `Delayed ${late} min, now ${t(f.rev)}` : `On time, ${t(f.sched)}`; };
async function flightAlerts(env, list) {
  const tr = (await env.DATA.get("ftrack", "json")) || []; if (!tr.length) return;
  let changed = false;
  for (const t of tr) { const f = list.find(x => x.no === t.no); if (!f) continue; const st = flStatus(f); if (st === t.last) continue;
    t.last = st; changed = true; const s = await env.DATA.get("psub:" + t.id, "json"); if (!s) continue;
    await env.DATA.put("palert:" + t.id, JSON.stringify({ title: `✈️ ${f.no} ${f.dir === "dep" ? "to" : "from"} ${f.other}`, body: st + (f.belt && /landed/i.test(st) ? ` · bags on carousel ${f.belt}` : ""), url: `/${R.code}#flights` }), { expirationTtl: 86400 });
    try { await pushOne(env, s.sub); } catch (e) {} }
  if (changed) await env.DATA.put("ftrack", JSON.stringify(tr.filter(t => Date.now() - new Date(t.at) < 3 * 86400e3)));
}
async function flightTrack(req, env) {
  let j = {}; try { j = await req.json(); } catch (e) {}
  const no = String(j.no || "").replace(/\s+/g, "").toUpperCase().slice(0, 10); if (!/^[A-Z0-9]{2}\d{1,5}$/.test(no)) return Response.json({ error: "That doesn't look like a flight number. Try something like QF2134." });
  if (!j.endpoint || !/^https:\/\//.test(j.endpoint)) return Response.json({ error: "Turn on alerts first." });
  const id = b64u(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(j.endpoint))).slice(0, 22);
  if (!(await env.DATA.get("psub:" + id))) return Response.json({ error: "Turn on alerts first." });
  const tr = ((await env.DATA.get("ftrack", "json")) || []).filter(t => !(t.id === id && t.no === no) && Date.now() - new Date(t.at) < 3 * 86400e3);
  if (tr.filter(t => t.id === id).length >= 5) return Response.json({ error: "You're tracking 5 flights already." });
  const d = await env.DATA.get("flights", "json"), f = (d?.list || []).find(x => x.no === no);
  tr.push({ id, no, at: new Date().toISOString(), last: f ? flStatus(f) : "" });
  await env.DATA.put("ftrack", JSON.stringify(tr));
  return Response.json({ ok: true, msg: f ? `Tracking ${no}: ${flStatus(f)}. We'll alert this phone if anything changes.` : `Tracking ${no}. It's not on today's board yet: we'll alert this phone when it shows up and if anything changes.` });
}
async function refreshFlights(env) {
  if (R.airport?.json) return refreshAirportJson(env);
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
  if (R.airport.json) { let d = await env.DATA.get("flights", "json"); if (!d || Date.now() - new Date(d.asof) > 15 * 6e4) { await refreshAirportJson(env); d = await env.DATA.get("flights", "json"); } return d; }
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
  const board = d && d.list ? (tbl("arr", "Arriving") + tbl("dep", "Departing") || `<p class="mute">No more flights listed today.</p>`) + `<p class="src">${fresh(d.asof)}${d.src === "airport" ? `<span class="srcw">Source:</span> <a href="${esc(A.url)}" rel="noopener">${esc(A.name)}</a> live board` : "Live flight data from AeroDataBox"}, updated ${esc(asOf(d.asof))}. Check with your airline before you head out.</p>` : "";
  return `<section id="flights"><h2>✈️ Flights at ${esc(A.name)}</h2>${board}
<form class="row" id="flf"><input name="fn" placeholder="Your flight number, e.g. QF2134" autocapitalize="characters" maxlength="10" aria-label="Flight number"><button>Check</button></form><p id="flo"></p>
${d && d.list ? `<h3>👋 Someone flying in?</h3><p class="mute">Pop in their flight number and we'll send an alert to this phone if it's delayed, when it lands and which carousel the bags are on.</p>
<form class="row" id="flt"><input name="fn" placeholder="Their flight number, e.g. QF2134" autocapitalize="characters" maxlength="10" aria-label="Flight to track"><button>Track it</button></form><p id="fltm" class="note" hidden></p>
<script>(function(){var f=document.getElementById('flt'),m=document.getElementById('fltm');function u8(b){var p='='.repeat((4-b.length%4)%4),s=atob((b+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(s,function(c){return c.charCodeAt(0)})}
function say(t){m.textContent=t;m.hidden=false}
f.onsubmit=function(e){e.preventDefault();var no=f.fn.value.replace(/\\s+/g,'').toUpperCase();if(!no)return;if(!('serviceWorker'in navigator)||!('PushManager'in window))return say('This browser cannot do alerts. On iPhone, add the site to your home screen first.');
say('Setting up alerts…');Promise.all([navigator.serviceWorker.register('/sw.js').then(function(){return navigator.serviceWorker.ready}),fetch('/api/push/key').then(function(r){return r.json()})])
.then(function(x){return x[0].pushManager.getSubscription().then(function(s){return s||x[0].pushManager.subscribe({userVisibleOnly:true,applicationServerKey:u8(x[1].key)})})})
.then(function(sub){return fetch('/api/push/sub',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sub:sub,topics:['alerts']})}).then(function(){return sub})})
.then(function(sub){return fetch('/api/flights/track',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({no:no,endpoint:sub.endpoint})})}).then(function(r){return r.json()})
.then(function(j){say(j.msg||j.error);if(j.ok){try{var L=JSON.parse(localStorage.getItem('fl_track')||'[]');if(L.indexOf(no)<0)L.push(no);localStorage.setItem('fl_track',JSON.stringify(L))}catch(_){}f.reset()}})
.catch(function(){say('Alerts were blocked. Allow notifications for this site, then try again.')})};
try{(JSON.parse(localStorage.getItem('fl_track')||'[]')).forEach(function(no){document.querySelectorAll('.fls li').forEach(function(li){if(li.textContent.replace(/\\s+/g,'').toUpperCase().indexOf(no)>-1)li.style.fontWeight='bold'})})}catch(_){}})()<\/script>` : ""}
${board ? "" : `<p class="mute">See everything coming and going at <a href="${A.url}" rel="noopener">${esc(A.name)}</a> (live board).</p>`}
<script>(function(){var L=${JSON.stringify(up.map(f => ({ no: f.no, t: tm(f.sched), dir: f.dir, other: f.other }))).replace(/</g, "\\u003c")};document.getElementById('flf').onsubmit=function(e){e.preventDefault();var f=this.fn.value.replace(/\\s+/g,'').toUpperCase();if(!f)return;
var hit=L.filter(function(x){return x.no===f})[0],o=document.getElementById('flo');if(hit){o.innerHTML='<b>'+f+'</b> '+(hit.dir==='dep'?'departs ':'arrives ')+hit.t+'. See its status in the list above.';var li=[].filter.call(document.querySelectorAll('.fls li'),function(x){return x.textContent.indexOf(f)>-1})[0];if(li){li.classList.add('hit');li.scrollIntoView({behavior:'smooth',block:'center'})}}
else window.open('https://www.google.com/search?q='+encodeURIComponent(f+' flight status'),'_blank','noopener')}})();</script></section>`;
}

// ---- Source health: every source we gather from, with when it last worked. Red = not working for too long.
// Shown in admin, served at /api/health (no private data), and emailed to us once a day when something's broken. ----
async function health(env) {
  const age = iso => iso ? (Date.now() - new Date(iso)) / 36e5 : Infinity, out = [];
  const add = (name, url, iso, maxH, note = "") => out.push({ name, url, last: iso || null, hours: iso ? Math.round(age(iso)) : null, ok: age(iso) <= maxH, note });
  for (const [k, maxH] of [["news", 6], ["fires", 3], ["warnings", 3], ["holidays", 96]]) { const v = await env.DATA.get("src:" + k, "json"); add(SOURCES[k].name, SOURCES[k].url, v && v.asof, maxH); }
  const ob = await env.DATA.get("obits", "json"); add("Funeral notices (" + (R.funerals || []).map(f => f.name).join(", ") + ")", (R.funerals || [])[0]?.url || "", ob && ob.asof, 24, ob && !ob.items.length ? "no notices found" : "");
  const sh = await env.DATA.get("shop", "json"); for (const [k, n] of Object.entries(STORES)) add("Supermarket prices (" + n + ")", { w: "https://www.woolworths.com.au", c: "https://www.coles.com.au", a: "https://www.aldi.com.au" }[k], sh && sh.stores && sh.stores[k], 48, sh && sh.blocked && sh.blocked[k] ? "blocks automatic checks (" + sh.blocked[k] + ")" : "");
  if (R.project) { const pr = await env.DATA.get("project", "json"); add(R.project.name + " weekly update", R.project.url, pr && pr.points && pr.points.length ? pr.asof : null, 48); }
  if (env.FLIGHT_KEY && !R.airport.feed) { const fl = await env.DATA.get("flights", "json"); add("Flights (AeroDataBox)", "https://aerodatabox.com", fl && fl.asof, 12); }
  { const fu = await env.DATA.get("fuel:local", "json"); add("Fuel prices (NSW FuelCheck)", "https://www.fuelcheck.nsw.gov.au", fu && fu.asof, 24); }
  { const rn = await env.DATA.get("rates:now", "json"); for (const [k, n] of Object.entries(BANKS)) add("Home loan rates (" + n + ")", CDR[k], rn && rn.banks[k] && rn.banks[k].rate ? rn.banks[k].asof : null, 72); }
  if (R.council.meetings) { const cn = await env.DATA.get("council:next", "json"); add("Council meetings page", R.council.meetings, cn && cn.asof, 72); }
  if (R.council.progress) { const cp = await env.DATA.get("council:progress", "json"); add("Council progress reports", R.council.progress, cp && cp.asof, 120 * 24); }
  { const al = await env.DATA.get("ailog", "json"); add("AI news (The Guardian, Google News)", AI_FEEDS[0][1], al && al.items && al.items.length ? al.items[0].at : null, 72); }
  for (const v of await venueSources(env)) { const d = await env.DATA.get(vkey(v.url), "json"); add("Venue: " + v.name, v.url, d && d.items && d.items.length ? d.asof : null, 48, d ? d.items.length + " items" : "not read yet"); }
  return out;
}
async function healthMail(env, ctx) {
  const today = todayISO();
  if ((await env.DATA.get("health:mailed")) === today) return;
  const h = +new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney", hour: "numeric", hour12: false });
  if (h < 7) return;
  const bad = (await health(env)).filter(x => !x.ok);
  await env.DATA.put("health:mailed", today, { expirationTtl: 2 * 86400 });
  if (!bad.length) return;
  mailUs(env, ctx, `${R.code} Maverick: ${bad.length} source${bad.length > 1 ? "s" : ""} not working`, bad.map(x => `- ${x.name}: ${x.last ? "last worked " + x.hours + " hours ago" : "never worked"}${x.note ? " (" + x.note + ")" : ""}\n  ${x.url}`).join("\n") + `\n\nFull list: https://${R.domain}/admin`);
}

// ---- News in numbers: facts from named sources, side by side. No opinions, no captions; readers make up their own minds. ----
const NUMBERS = [
  { d: "2026-06-30", g: "Big tech watch", a: ["People using ChatGPT", "900 million", "every week (February 2026)"], b: ["People using Facebook, Instagram, WhatsApp or Messenger", "3.6 billion", "every day (June 2026)"],
    src: [["OpenAI, via TechCrunch", "https://techcrunch.com/2026/02/27/chatgpt-reaches-900m-weekly-active-users"], ["Meta second quarter 2026 results", "https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-Second-Quarter-2026-Results/"]] },
  { d: "2026-03-31", g: "Big tech watch", a: ["Australians using AI tools", "13.6 million", "58% of people 14+, in an average four weeks (Jan to Mar 2026)"], b: ["Kids' social media accounts deactivated or restricted", "about 4.7 million", "under Australia's under-16 ban (reported January 2026)"],
    src: [["Roy Morgan", "https://www.roymorgan.com/findings/10248-artificial-intelligence-ai-tools-usage-march-2026"], ["eSafety Commissioner, via Associated Press", "https://www.waff.com/2026/01/16/heres-how-many-social-media-accounts-platforms-removed-after-australia-banned-them-children"]] },
  { d: "2026-06-30", g: "Big tech watch", a: ["Meta's revenue", "US$60.8 billion", "April to June 2026"], b: ["Meta's profit", "US$15.85 billion", "April to June 2026"],
    src: [["Meta second quarter 2026 results", "https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-Second-Quarter-2026-Results/"]] },
  { d: "2021-12-31", g: "Life and death", a: ["Australians killed by horses", "222", "2001 to 2021"], b: ["Australians killed by sharks", "39", "2001 to 2021"],
    src: [["National Coronial Information System, via ScienceAlert", "https://www.sciencealert.com/deadliest-animal-in-australia-revealed-and-its-a-big-surprise"]] },
  { d: "2021-12-31", g: "Life and death", a: ["Australians killed by spiders", "0", "2001 to 2021"], b: ["Australians killed by bees", "45", "2001 to 2021, all from allergic reactions"],
    src: [["National Coronial Information System, via ScienceAlert", "https://www.sciencealert.com/deadliest-animal-in-australia-revealed-and-its-a-big-surprise"]] },
];
async function numbersBlock(env) {
  const pair = n => `<div class="num">${n.d ? `<p class="numd">${fresh(n.d)}Figures from ${esc(new Date(n.d).toLocaleDateString("en-AU", { month: "long", year: "numeric" }))}</p>` : ""}<div><b>${esc(n.a[1])}</b><span>${esc(n.a[0])}</span><small>${esc(n.a[2])}</small></div><div class="vs">vs</div><div><b>${esc(n.b[1])}</b><span>${esc(n.b[0])}</span><small>${esc(n.b[2])}</small></div><p class="src">${n.src.map(([t, u]) => `<a href="${u}" rel="noopener">${esc(t)}</a>`).join(" · ")}</p></div>`;
  let fuel = "";
  try {
    const f = await env.DATA.get("fuel:local", "json");
    const u = f && f.prices ? f.prices.filter(x => x.type === "U91" && x.price > 50).map(x => x.price) : [];
    if (u.length >= 3) { const avg = u.reduce((a, b) => a + b, 0) / u.length;
      fuel = pair({ d: f.asof, a: ["Unleaded petrol near " + R.short + " today", avg.toFixed(1) + "c", "average a litre across " + u.length + " local servos, " + asOf(f.asof)], b: ["National average a year ago", "179.4c", "a litre, October 2025"],
        src: [["NSW FuelCheck", "https://www.fuelcheck.nsw.gov.au"], ["Australian Institute of Petroleum, via NT Treasury", "https://treasury.nt.gov.au/__data/assets/pdf_file/0004/1569010/Fuel-prices-2025-October.pdf"]] }); }
  } catch (e) {}
  return `<section id="numbers"><h2>🔢 News in numbers</h2><p class="mute">Facts from the sources named, side by side. No opinions: make up your own mind.</p>${fuel ? `<h3>Cost of living</h3>${fuel}` : ""}${[...new Set(NUMBERS.map(n => n.g))].map(g => `<h3>${esc(g)}</h3>${NUMBERS.filter(n => n.g === g).map(pair).join("")}`).join("")}</section>`;
}

// ---- Council watch: accountability. Next meeting (read from the council's own page), how to have your say or complain,
// and how council says it's tracking on its own plan, quoted from its own progress reports (we never set a status ourselves). ----
async function refreshCouncil(env) {
  if (!R.council.meetings) return;
  const old = await env.DATA.get("council:next", "json"), now = new Date().toISOString();
  if (old && Date.now() - new Date(old.tried) < 20 * 3600e3 && (!old.date || old.date >= todayISO())) return;
  try {
    const html = await (await fetch(R.council.meetings, { headers: UA })).text();
    const txt = dec(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<nav[\s\S]*?<\/nav>|<footer[\s\S]*?<\/footer>/g, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ")).replace(/\s+/g, " ").slice(0, 9000);
    const ask = { messages: [{ role: "system", content: "You read council web pages. Output ONLY JSON." },
      { role: "user", content: `Today is ${todayISO()}. From this ${R.council.name} meetings page, give the next council meeting on or after today: {"date":"YYYY-MM-DD or empty","time":"as written or empty","what":"e.g. Ordinary Council meeting","where":"place as written or empty"}. If the page only gives a rule like "third Wednesday of each month", work out the next date from the rule. Never invent.\n\nPAGE:\n${txt}` }], max_tokens: 200 };
    let out; try { out = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", ask); } catch (e) { out = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", ask); }
    const raw = typeof out?.response === "string" ? out.response : JSON.stringify(out?.response || {}), j = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);
    const ok = /^\d{4}-\d{2}-\d{2}$/.test(j.date || "") && j.date >= todayISO();
    await env.DATA.put("council:next", JSON.stringify(ok ? { date: j.date, time: String(j.time || "").slice(0, 40), what: String(j.what || "Council meeting").slice(0, 60), where: String(j.where || "").slice(0, 80), asof: now, tried: now } : { ...(old || {}), tried: now }));
  } catch (e) { await env.DATA.put("council:next", JSON.stringify({ ...(old || {}), tried: now })); }
}
// "How's council doing?" Unofficial monthly Maverick poll: thumbs up or down plus an optional few words. One answer per phone a month.
async function councilPoll(env) {
  const mon = todayISO().slice(0, 7), c = (await env.DATA.get(`poll:council:${mon}`, "json")) || { up: 0, down: 0 }, n = c.up + c.down, pu = n ? Math.round(c.up / n * 100) : 0;
  return `<div class="cpoll" id="cpoll"><h3>🗳️ How's council doing?</h3><p class="mute">The unofficial Maverick poll, once a month. ${n ? `This month so far: <b>👍 ${pu}%</b> · 👎 ${100 - pu}% (${n} local${n > 1 ? "s" : ""}).` : "Be the first this month."} <a href="/results#poll-council">All results</a></p>
<div class="mavbtns" id="cpb"><button type="button" data-v="up" aria-label="Council is doing well">👍</button><button type="button" data-v="down" aria-label="Council could do better">👎</button></div><form id="cpw" class="mavwhy" hidden><input maxlength="200" placeholder="Why? (optional, a few words)" aria-label="Why?"><button>Send</button></form><p id="cpm" class="mute" role="status"></p></div>
<script>(function(){var k='cpoll:${mon}',B=document.getElementById('cpb'),W=document.getElementById('cpw'),M=document.getElementById('cpm'),v='';try{if(localStorage.getItem(k)){B.hidden=true;M.textContent='Thanks, you&rsquo;ve had your say this month. Back next month.'.replace('&rsquo;','\u2019')}}catch(e){}
function post(o){o.q='council';return fetch('/api/poll',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(o)}).catch(function(){})}
B.onclick=function(e){var t=e.target.closest('button');if(!t)return;v=t.dataset.v;post({v:v});try{localStorage.setItem(k,v)}catch(_){}B.hidden=true;W.hidden=false;M.textContent='Counted. Want to say why?';W.querySelector('input').focus()};
W.onsubmit=function(e){e.preventDefault();var w=W.querySelector('input').value.trim();if(w)post({v:v,why:w});W.hidden=true;M.textContent='Thanks! Your words are counted with everyone else\u2019s, never with your name.'}})()<\/script>`;
}
async function councilBlock(env) {
  const c = R.council, nx = await env.DATA.get("council:next", "json");
  const meet = nx && nx.date && nx.date >= todayISO() ? `<p><b>Next meeting: ${esc(fmtDate(nx.date))}${nx.time ? ", " + esc(nx.time) : ""}</b>${away(nx.date)}<br><span class="mute">${esc(nx.what)}${nx.where ? " · " + esc(nx.where) : ""}. Meetings are open to the public, and you can ask to speak.</span></p>` : `<p class="mute">Meeting dates are on the council's <a href="${c.meetings || c.url}" rel="noopener">meetings page</a>.</p>`;
  return `<section id="council"><h2>🏛️ Council watch</h2><p class="mute">Keeping an eye on ${esc(c.name)}, with every item linked to its source.</p>
${meet}${nx && nx.asof ? `<p class="src">${fresh(nx.asof)}Read from the <a href="${c.meetings}" rel="noopener">council's meetings page</a>, ${esc(asOf(nx.asof))}.</p>` : ""}
${await progressBlock(env)}
${await councilPoll(env)}
<h3>Have your say or make a complaint</h3><ul>
<li>Report a problem or make a request: ${esc(c.name)} on <a href="tel:${c.phone.replace(/\s/g, "")}">${esc(c.phone)}</a> or <a href="${c.url}" rel="noopener">their website</a>.</li>
<li>Not happy with how council handled it? <a href="https://www.ombo.nsw.gov.au" rel="noopener">NSW Ombudsman</a>.</li>
<li>Concerns about a councillor's conduct: <a href="https://www.olg.nsw.gov.au" rel="noopener">Office of Local Government</a>.</li>
<li>Suspect corruption: <a href="https://www.icac.nsw.gov.au" rel="noopener">NSW ICAC (Independent Commission Against Corruption)</a>.</li>
<li>Have your say at a meeting: ask the council about speaking at public forum before the <a href="${c.meetings || c.url}" rel="noopener">next meeting</a>.</li></ul></section>`;
}

// ---- AI for good, AI for bad: the latest AI news, sorted by AI into good and harmful. Every article is logged at /ai-log. ----
const AI_FEEDS = [["The Guardian", "https://www.theguardian.com/technology/artificialintelligenceai/rss"], ["Google News", "https://news.google.com/rss/search?q=artificial+intelligence+when:2d&hl=en-AU&gl=AU&ceid=AU:en"]];
async function refreshAiNews(env) {
  const log = (await env.DATA.get("ailog", "json")) || { items: [], tried: null };
  if (log.tried && Date.now() - new Date(log.tried) < 6 * 3600e3) return;
  const seen = new Set(log.items.map(x => x.link)), fresh = [];
  for (const [name, url] of AI_FEEDS) { try { for (const i of rss(await (await fetch(url, { headers: UA })).text()).slice(0, 10)) if (i.link && !seen.has(i.link)) { seen.add(i.link); fresh.push({ ...i, src: name }); } } catch (e) {} }
  const batch = fresh.slice(0, 10);
  if (batch.length) {
    try {
      const ask = { messages: [{ role: "system", content: "You sort news headlines. Output ONLY JSON." },
        { role: "user", content: `For each numbered AI news item, say whether the story is mainly about AI doing good for people (e.g. medical breakthroughs, helping communities, saving time or money, safety) or AI causing harm (e.g. scams, job losses, misinformation, deepfakes, privacy, safety failures), or neither (business deals, product launches, opinion). Return {"items":[{"n":1,"v":"good|bad|neither","why":"under 15 words, from the headline and summary only"}]}.\n\n` + batch.map((b, k) => `${k + 1}. ${b.title} — ${String(b.desc || "").slice(0, 200)}`).join("\n") }], max_tokens: 900 };
      let out; try { out = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", ask); } catch (e) { out = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", ask); }
      const raw = typeof out?.response === "string" ? out.response : JSON.stringify(out?.response || {}), j = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);
      for (const r of j.items || []) { const b = batch[(+r.n || 0) - 1]; if (!b || !["good", "bad", "neither"].includes(r.v)) continue;
        log.items.unshift({ title: b.title.slice(0, 200), link: b.link, src: b.src, date: b.date ? new Date(b.date).toISOString() : new Date().toISOString(), v: r.v, why: String(r.why || "").slice(0, 120), at: new Date().toISOString() }); }
    } catch (e) {}
  }
  log.items = log.items.slice(0, 300); log.tried = new Date().toISOString();
  await env.DATA.put("ailog", JSON.stringify(log));
}
async function aiBlock(env) {
  const log = await env.DATA.get("ailog", "json"), it = log ? log.items : [];
  const card = (v, h, cls) => { const all = it.filter(i => i.v === v).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);
    // Newest story if it's from the last day or so; otherwise a different recent one each day
    const x = all[0] && Date.now() - new Date(all[0].date) < 36 * 36e5 ? all[0] : dayMix(all, "ai" + v)[0];
    return `<div class="aib ${cls}"><p class="kick">${h}</p>${x ? `<a href="${esc(x.link)}" rel="noopener"><b>${esc(x.title)}</b></a><br><small class="mute">${esc(x.src)} · ${esc(new Date(x.date).toLocaleDateString("en-AU", { day: "numeric", month: "short" }))}${x.why ? " · " + esc(x.why) : ""}</small>` : `<p class="mute">The first story is on its way.</p>`}</div>`; };
  return `<section id="aigb"><h2>🤖 AI for good, AI for bad</h2><p class="mute">A recent AI story of each kind from the news, so you see both sides.</p><div class="aig">${card("good", "😇 AI for good", "good")}${card("bad", "😈 AI for bad", "bad")}</div>
<p class="src">Headlines from The Guardian and Google News, sorted into good and bad by AI, so check the full story. <a href="/ai-log">See every story we've logged</a>.</p>
<p class="nerdcta"><a href="/go/nerd-ai" target="_blank" rel="noopener">🧠 Learn how AI can help in your everyday life, from your local experts at Maverick Digital &rarr;</a></p></section>`;
}
async function aiLogPage(env) {
  const log = await env.DATA.get("ailog", "json"), it = (log ? log.items : []).filter(i => i.v !== "neither");
  return page("AI for good, AI for bad", `<p class="mute"><a href="/">‹ ${R.code}</a></p><h1>🤖 AI for good, AI for bad: the log</h1><p>Every AI news story we've sorted, newest first. ${it.filter(i => i.v === "good").length} good, ${it.filter(i => i.v === "bad").length} bad so far.</p>
<ul class="ailog">${it.map(i => `<li>${i.v === "good" ? "😇" : "😈"} <a href="${esc(i.link)}" rel="noopener">${esc(i.title)}</a><br><small class="mute">${esc(i.src)} · ${esc(new Date(i.date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }))}${i.why ? " · " + esc(i.why) : ""}</small></li>`).join("") || "<li class=mute>Nothing logged yet.</li>"}</ul>
<p class="src">Sorted by AI from the headline and summary, so it can get it wrong. The stories belong to their publishers.</p>`, R.code);
}

// Council's own progress reports: every quarter NSW councils report how they're tracking on their Delivery Program and
// Operational Plan. We find the newest report on the council's page, read it, and quote council's own statuses. Fully automatic.
async function refreshProgress(env) {
  if (!R.council.progress) return;
  const old = await env.DATA.get("council:progress", "json"), now = new Date().toISOString();
  if (old && Date.now() - new Date(old.tried) < 3 * 86400e3) return;
  const save = v => env.DATA.put("council:progress", JSON.stringify(v));
  try {
    const page = await (await fetch(R.council.progress, { headers: UA })).text();
    const links = [...page.matchAll(/<a[^>]+href="([^"]+\.pdf)[^"]*"[^>]*>([\s\S]{0,200}?)<\/a>/gi)].map(m => ({ url: new URL(m[1].replace(/&amp;/g, "&"), R.council.progress).href, text: dec(m[2].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim() }))
      .filter(l => /progress|quarter/i.test(l.text + " " + l.url) && !/annual|financial|budget/i.test(l.text));
    const pick = links[0];
    if (!pick) return save({ ...(old || {}), tried: now });
    if (old && old.url === pick.url && old.asof) return save({ ...old, tried: now });
    const buf = await (await fetch(pick.url, { headers: UA })).arrayBuffer();
    if (buf.byteLength > 30e6 || !env.AI.toMarkdown) return save({ ...(old || {}), tried: now });
    const md = await env.AI.toMarkdown([{ name: "report.pdf", blob: new Blob([buf], { type: "application/pdf" }) }]);
    const text = String((md && md[0] && md[0].data) || "").replace(/\s+/g, " ");
    if (text.length < 500) return save({ ...(old || {}), tried: now });
    const lines = text.split(/(?<=[.|])\s+/).filter(l => /\b(completed?|on track|not on track|behind|delayed|deferred|at risk|off track)\b/i.test(l)).map(l => l.slice(0, 260));
    const sample = lines.slice(0, 160).join("\n");
    const ask = { messages: [{ role: "system", content: "You read council progress reports. Quote, never judge. Output ONLY JSON." },
      { role: "user", content: `These lines come from ${R.council.name}'s report "${pick.text}". Return {"period":"the period covered, as written","totals":{"completed":number or null,"on_track":number or null,"behind":number or null} (only if the report itself states totals, else nulls),"behind":[up to 8 {"action":"the action's name exactly as written","status":"status exactly as written","comment":"council's own comment, quoted, under 25 words, or empty"}] for actions the report marks behind, delayed, deferred, off track or at risk,"done":[up to 5 {"action":"exactly as written"}] for actions marked completed}. Copy wording exactly. Never invent.\n\n${sample}` }], max_tokens: 1500 };
    let out; try { out = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", ask); } catch (e) { out = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", ask); }
    const raw = typeof out?.response === "string" ? out.response : JSON.stringify(out?.response || {}), j = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);
    const low = text.toLowerCase(), real = x => x && String(x).length > 4 && low.includes(String(x).toLowerCase().replace(/\s+/g, " ").trim());
    const num = x => Number.isInteger(x) && x >= 0 && x < 5000 && low.includes(String(x)) ? x : null;
    await save({ url: pick.url, title: pick.text.replace(/\(PDF.*$/i, "").trim().slice(0, 140), period: real(j.period) ? String(j.period).slice(0, 80) : "",
      totals: j.totals ? { completed: num(j.totals.completed), on_track: num(j.totals.on_track), behind: num(j.totals.behind) } : {},
      behind: (j.behind || []).filter(b => real(b.action)).slice(0, 8).map(b => ({ action: String(b.action).slice(0, 160), status: real(b.status) ? String(b.status).slice(0, 40) : "", comment: real(b.comment) ? String(b.comment).slice(0, 200) : "" })),
      done: (j.done || []).filter(d => real(d.action)).slice(0, 5).map(d => ({ action: String(d.action).slice(0, 160) })), asof: now, tried: now });
  } catch (e) { await save({ ...(old || {}), tried: now }); }
}
async function progressBlock(env) {
  const p = await env.DATA.get("council:progress", "json"), c = R.council;
  if (!p || !p.asof) return `<h3>Is council doing what it said?</h3><p class="mute">Every three months ${esc(c.name)} reports on its own plan. We'll show its latest report here, in its own words.${c.progress ? ` For now: <a href="${c.progress}" rel="noopener">council's progress reports</a>.` : ""}</p>`;
  const t = p.totals || {}, tot = [["completed", "✅", "completed"], ["on_track", "🟢", "on track"], ["behind", "🟠", "behind"]].filter(([k]) => t[k] != null);
  return `<h3>Is council doing what it said?</h3><p class="mute">In council's own words, from its latest report: <a href="${esc(p.url)}" rel="noopener">${esc(p.title)}</a>${p.period ? ` (${esc(p.period)})` : ""}.</p>
${tot.length ? `<p><b>${tot.map(([k, i, l]) => `${i} ${t[k]} ${l}`).join(" · ")}</b></p>` : ""}
${p.behind.length ? `<p><b>Council reports these as behind or delayed:</b></p><ul class="prom">${p.behind.map(b => `<li><span class="pl">🟠</span><span><b>${esc(b.action)}</b>${b.status ? ` <span class="tagg">${esc(b.status)}</span>` : ""}${b.comment ? `<br><small class="mute">Council says: “${esc(b.comment)}”</small>` : ""}</span></li>`).join("")}</ul>` : ""}
${p.done.length ? `<p><b>Council reports these as completed:</b></p><ul class="prom">${p.done.map(d => `<li><span class="pl">✅</span><span>${esc(d.action)}</span></li>`).join("")}</ul>` : ""}
<p class="src">${fresh(p.asof)}Statuses are council's own, quoted from its report and checked against the original. We don't add, judge or change them. Read ${esc(asOf(p.asof))}.</p>`;
}

// ---- Banks and the RBA: today's lowest advertised variable home loan rate at each big four bank (from their official Open Banking
// data, checked daily, one bank per run), plus how fast each passed on past RBA changes. Numbers only. ----
async function refreshBankRates(env) {
  const cur = (await env.DATA.get("rates:now", "json")) || { banks: {}, hist: {} };
  const due = Object.keys(BANKS).find(k => !cur.banks[k] || Date.now() - new Date(cur.banks[k].tried) > 20 * 3600e3);
  if (!due) return;
  const H = { "x-v": "4", "x-min-v": "1", accept: "application/json", ...UA }, now = new Date().toISOString();
  try {
    const list = await (await fetch(CDR[due] + "/banking/products?product-category=RESIDENTIAL_MORTGAGES&page-size=50", { headers: { ...H, "x-v": "3" } })).json();
    const prods = (list.data && list.data.products || []).filter(p => !/invest|business|bridging|construction|reverse|green/i.test(p.name || "")).slice(0, 25);
    let best = null;
    for (const p of prods) {
      try {
        const d = (await (await fetch(CDR[due] + "/banking/products/" + encodeURIComponent(p.productId), { headers: H })).json()).data || {};
        for (const r of d.lendingRates || []) {
          const v = parseFloat(r.rate) * 100;
          if (r.lendingRateType === "VARIABLE" && (!r.loanPurpose || r.loanPurpose === "OWNER_OCCUPIED") && (!r.repaymentType || r.repaymentType === "PRINCIPAL_AND_INTEREST") && v > 2 && v < 15 && (!best || v < best.rate)) best = { rate: +v.toFixed(2), product: d.name || p.name };
        }
      } catch (e) {}
    }
    const day = todayISO();
    if (best) { cur.banks[due] = { ...best, asof: now, tried: now }; (cur.hist[due] = cur.hist[due] || {})[day] = best.rate; const ks = Object.keys(cur.hist[due]).sort(); if (ks.length > 400) delete cur.hist[due][ks[0]]; }
    else cur.banks[due] = { ...(cur.banks[due] || {}), tried: now };
  } catch (e) { cur.banks[due] = { ...(cur.banks[due] || {}), tried: now }; }
  await env.DATA.put("rates:now", JSON.stringify(cur));
}
async function ratesBlock(env) {
  const cur = (await env.DATA.get("rates:now", "json")) || { banks: {} }, ks = Object.keys(BANKS);
  const days = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5), dd = d => new Date(d + "T12:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  const now = ks.filter(k => cur.banks[k] && cur.banks[k].rate);
  const low = now.length ? Math.min(...now.map(k => cur.banks[k].rate)) : null;
  const today = now.length ? `<h3>Lowest advertised variable rate today</h3><p class="mute">Owner-occupier, principal and interest, best rate across each bank's home loans.</p><table class="shopt"><tbody>${ks.map(k => { const b = cur.banks[k]; return `<tr><th scope="row">${BANKS[k]}</th><td class="${b && b.rate ? tlc(b.rate, now.map(x => cur.banks[x].rate)) : ""}" title="${b ? esc(b.product || "") : ""}">${b && b.rate ? b.rate.toFixed(2) + "%" : "–"}</td></tr>`; }).join("")}</tbody></table><p class="src">${fresh(now.map(k => cur.banks[k].asof).sort().pop())}From each bank's official Open Banking product data, checked daily. Your rate depends on your loan; check with the bank.</p>` : "";
  const avg = (k, up) => { const l = MOVES.filter(m => (m.ch > 0) === up && m.banks[k]).map(m => days(m.d, m.banks[k][0])); return l.length ? (l.reduce((a, b) => a + b, 0) / l.length).toFixed(1) : "–"; };
  const passed = (k, up) => { const l = MOVES.filter(m => (m.ch > 0) === up && m.banks[k]); return l.length ? l.filter(m => Math.abs(m.banks[k][1]) >= Math.abs(m.ch)).length + " of " + l.length : "–"; };
  const speed = `<h3>How fast they passed on RBA changes</h3><table class="shopt"><thead><tr><th></th>${ks.map(k => `<th>${BANKS[k]}</th>`).join("")}</tr></thead><tbody>
<tr><th scope="row">Average days to pass on a rise</th>${ks.map(k => `<td>${avg(k, true)}</td>`).join("")}</tr>
<tr><th scope="row">Average days to pass on a cut</th>${ks.map(k => `<td>${avg(k, false)}</td>`).join("")}</tr>
<tr><th scope="row">Rises passed on in full</th>${ks.map(k => `<td>${passed(k, true)}</td>`).join("")}</tr>
<tr><th scope="row">Cuts passed on in full</th>${ks.map(k => `<td>${passed(k, false)}</td>`).join("")}</tr></tbody></table>
<p class="mute">Days from the RBA's decision to the date the bank's new variable rate took effect, for the ${MOVES.length} RBA moves since February 2025.</p>`;
  const hist = `<details><summary>Every RBA move and what each bank did</summary><div class="tscroll"><table class="shopt"><thead><tr><th>RBA decision</th>${ks.map(k => `<th>${BANKS[k]}</th>`).join("")}</tr></thead><tbody>${MOVES.map(m => `<tr><th scope="row">${dd(m.d)}<br><small class="mute">${m.ch > 0 ? "▲ +" : "▼ "}${m.ch.toFixed(2)} to ${m.cash.toFixed(2)}%</small></th>${ks.map(k => { const b = m.banks[k]; return b ? `<td>${b[1] > 0 ? "+" : ""}${b[1].toFixed(2)}<br><small class="mute">${dd(b[0])} · ${days(m.d, b[0])} days</small></td>` : "<td>–</td>"; }).join("")}</tr>`).join("")}</tbody></table></div>
<p class="src">${MOVES.map(m => `<a href="${m.src[1]}" rel="noopener">${esc(m.src[0])}</a>`).filter((v, i, a) => a.indexOf(v) === i).join(" · ")}. Cash rate from the <a href="https://www.rba.gov.au/statistics/cash-rate/" rel="noopener">Reserve Bank of Australia</a>.</p></details>`;
  return `<section id="rates"><h2>🏦 Banks and the RBA</h2><p class="mute">Home loan rates at the big four, and how quickly each passed on the Reserve Bank's (RBA) rate changes. Numbers only.</p><p><b>Cash rate: ${MOVES[0].cash.toFixed(2)}%</b> <span class="mute">since ${dd(MOVES[0].d)}</span></p>${today}${speed}${hist}</section>`;
}
