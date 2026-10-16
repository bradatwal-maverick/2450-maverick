// Banks and the RBA: how fast the big four passed on each Reserve Bank (RBA) cash rate change, from published reports.
// Facts only. d = RBA decision date, cash = new cash rate, ch = change in percentage points; banks = [effective date, change].
export const BANKS = { cba: "CommBank", wbc: "Westpac", nab: "NAB", anz: "ANZ" };
export const MOVES = [
  { d: "2026-09-29", cash: 4.60, ch: 0.25, banks: { cba: ["2026-10-09", 0.25], wbc: ["2026-10-09", 0.25], nab: ["2026-10-09", 0.25], anz: ["2026-10-09", 0.25] },
    src: ["Integrated Finance Group", "https://integratedfinancegroup.com.au/blog/banks-pass-on-rba-rate-rise-october-2026/"] },
  { d: "2026-05-05", cash: 4.35, ch: 0.25, banks: { cba: ["2026-05-15", 0.25], wbc: ["2026-05-15", 0.25], nab: ["2026-05-15", 0.25], anz: ["2026-05-15", 0.25] },
    src: ["Mortgage Professional Australia", "https://www.mpamag.com/au/news/general/big-four-banks-pass-on-rba-rate-rise/574060"] },
  { d: "2026-03-17", cash: 4.10, ch: 0.25, banks: { cba: ["2026-03-27", 0.25], wbc: ["2026-03-31", 0.25], nab: ["2026-03-27", 0.25], anz: ["2026-03-27", 0.25] },
    src: ["Savings.com.au", "https://www.savings.com.au/news/rba-rate-hike-march-26"] },
  { d: "2026-02-03", cash: 3.85, ch: 0.25, banks: { cba: ["2026-02-13", 0.25], wbc: ["2026-02-17", 0.25], nab: ["2026-02-13", 0.25], anz: ["2026-02-13", 0.25] },
    src: ["Canstar", "https://www.canstar.com.au/finance-news/westpac-nab-and-anz-hike-variable-rates-quiet-on-savings/"] },
  { d: "2025-08-12", cash: 3.60, ch: -0.25, banks: { cba: ["2025-08-22", -0.25], wbc: ["2025-08-26", -0.25], nab: ["2025-08-25", -0.25], anz: ["2025-08-22", -0.25] },
    src: ["Finder", "https://www.finder.com.au/rba-cash-rate/interest-rate-cuts/august-2025-interest-rate-cuts"] },
  { d: "2025-05-20", cash: 3.85, ch: -0.25, banks: { cba: ["2025-05-30", -0.25], wbc: ["2025-06-03", -0.25], nab: ["2025-05-30", -0.25], anz: ["2025-05-30", -0.25] },
    src: ["Savings.com.au", "https://www.savings.com.au/news/how-the-big-4-banks-responded-to-rba-may-cash-rate-cut"] },
  { d: "2025-02-18", cash: 4.10, ch: -0.25, banks: { cba: ["2025-02-28", -0.25], wbc: ["2025-03-04", -0.25], nab: ["2025-02-28", -0.25], anz: ["2025-02-28", -0.25] },
    src: ["The Motley Fool", "https://www.fool.com.au/2025/02/18/did-the-asx-200-banks-pass-on-the-rba-rate-cut-in-full/"] },
];
// Open Banking (Consumer Data Right) product data each bank must publish: no login, official.
export const CDR = { cba: "https://api.commbank.com.au/public/cds-au/v1", wbc: "https://digital-api.westpac.com.au/cds-au/v1", nab: "https://openbank.api.nab.com.au/cds-au/v1", anz: "https://api.anz/cds-au/v1" };
