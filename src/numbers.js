// ---- Hard-to-find numbers: the customer lines big companies and agencies bury behind chatbots and FAQs.
// Every number comes from the organisation's own website (linked). Phone-tree shortcuts only where a reputable
// source has published them, with that source shown. We source, we don't tell. Checked dates on every item.
import LIST from "./hardnumbers.json";

const CATS = ["Banks", "Government", "Phone and internet", "Energy", "Travel", "Shopping and apps", "If they won't help"];
const telOf = n => String(n || "").replace(/[^\d+]/g, "");
const host = u => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return "source"; } };

export function numbersPage({ esc, page, R, fresh }) {
  return (url) => {
    const pc = (url.searchParams.get("pc") || R.code).replace(/\D/g, "").slice(0, 4);
    const item = x => `<li class="hn"><div class="hnh"><b>${esc(x.name)}</b> <a class="hnum" href="tel:${telOf(x.num)}">📞 ${esc(x.num)}</a>${x.alt ? ` <span class="mute">· ${esc(x.alt)}</span>` : ""}</div>
${x.hours ? `<small>🕘 ${esc(x.hours)}</small>` : ""}
${x.tree ? `<p class="hntree">👉 <b>To reach a person:</b> ${esc(x.tree)}<span class="src"><span class="srcw">Source:</span> <a href="${esc(x.treeSrc)}" rel="noopener">${esc(x.treeSrcName || host(x.treeSrc))}</a></span></p>` : ""}
${x.tip ? `<p class="hntree">💡 ${esc(x.tip)}</p>` : ""}
<p class="src">${fresh ? fresh(x.checked) : ""}<span class="srcw">Source:</span> <a href="${esc(x.src)}" rel="noopener">${esc(x.srcName || host(x.src))}</a> · checked ${esc(x.checked)}</p></li>`;
    const groups = CATS.map(c => [c, LIST.filter(x => x.cat === c)]).filter(([, xs]) => xs.length);
    return page("Hard-to-find numbers", `<p class="mute"><a href="/${pc}">‹ ${esc(pc)}</a></p><h1>📞 Hard-to-find numbers</h1>
<p>The phone numbers big companies and agencies bury behind chatbots, FAQs and "contact us" mazes. All in one place, one tap to call.</p>
<p class="mute">We don't make any of this up. Every number is from the organisation's own website, and every phone-tree shortcut is from the published source shown under it. Menus change, so if a shortcut no longer works, <a href="/feedback">tell us</a>.</p>
<nav class="subnav">${groups.map(([c]) => `<a href="#${c.toLowerCase().replace(/[^a-z]+/g, "-")}">${esc(c)}</a>`).join("")}</nav>
${groups.map(([c, xs]) => `<h2 id="${c.toLowerCase().replace(/[^a-z]+/g, "-")}">${esc(c)}</h2>${c === "If they won't help" ? `<p class="mute">Free, independent help when a company won't sort it out.</p>` : ""}<ul class="hnl">${xs.map(item).join("")}</ul>`).join("")}
<style>.hnl{list-style:none;padding:0}.hn{padding:10px 0;border-bottom:1px solid var(--line)}.hnh{display:flex;flex-wrap:wrap;gap:6px;align-items:baseline}.hnum{font-weight:bold;white-space:nowrap}.hntree{margin:6px 0 2px;font-size:.92rem}.hntree .src{display:block;margin-top:2px}</style>`, pc,
      { desc: "Hard-to-find customer service numbers for banks, airlines, telcos, energy and government, each from the official site, with sourced phone-tree shortcuts." });
  };
}
