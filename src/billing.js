// Daily Maverick memberships (every town): Stripe Checkout + Customer Portal. No packages, plain fetch.
//
//   Free             the sourced local information. Always free, for everyone.
//   Some Cool Things  $49 a year: your page personalised by Mav
//   Every Cool Thing  $99 a year ($50 a year for life for Founding Members): personalisation + every tool
// 14 days free with no card, then they choose to pay. 7-day money-back: cancel within 7 days of paying = automatic refund.
//
// Secret: STRIPE_SECRET_KEY (account-wide, Secrets Store, see secrets.js). Unset = payments off and nothing is locked.
// Storage: MEMBERS KV, shared by every town, so a member is a member on every Daily Maverick.
//   m:<email>    { tier, status, customer, subscription, trialUsed, town, updated }
//   c:<customer> email
// Webhook: one Stripe endpoint for all towns -> https://2450-maverick.live/api/billing/webhook.
//   No signing secret: we re-fetch each event from Stripe by id, so fakes are ignored.
//   Events for other brands (Maverick Digital) are skipped by metadata.brand.

const BRAND = "daily-maverick";
const LIVE = ["active", "trialing", "past_due"];
const RANK = { free: 0, some: 1, every: 2 };
const TRIAL_DAYS = 14, REFUND_DAYS = 7;
export const TIERS = {
  some: { name: "Some Cool Things", price: 49, key: "dm_some_year" },
  every: { name: "Every Cool Thing", price: 99, key: "dm_every_year", founding: 50, foundingKey: "dm_every_founding" },
};

function form(obj, prefix, out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object") form(v, key, out); else out.append(key, String(v));
  }
  return out;
}
async function stripe(env, method, path, params) {
  const url = "https://api.stripe.com/v1/" + path + (method !== "POST" && params ? "?" + form(params) : "");
  const r = await fetch(url, { method, headers: { authorization: "Bearer " + env.STRIPE_SECRET_KEY, "content-type": "application/x-www-form-urlencoded" }, body: method === "POST" ? form(params || {}) : undefined });
  const d = await r.json();
  if (!r.ok) throw new Error("Stripe " + path + ": " + (d.error?.message || r.status));
  return d;
}
const J = (d, status = 200) => Response.json(d, { status, headers: { "cache-control": "no-store" } });

export const paymentsOn = env => !!(env.STRIPE_SECRET_KEY && env.MEMBERS);

// "free" | "some" | "every"
export async function tierOf(env, email) {
  if (!email || !paymentsOn(env)) return "free";
  const m = await env.MEMBERS.get(`m:${email}`, "json");
  return m && LIVE.includes(m.status) && RANK[m.tier] ? m.tier : "free";
}
// Gate check. With payments off nothing is locked, so the site works exactly as it does today.
export const hasTier = async (env, email, need) => !paymentsOn(env) || RANK[await tierOf(env, email)] >= RANK[need];

// Founding Members: anyone who signed in before this town reached its target keeps the founding price for life.
async function isFounder(env, email, deps) {
  const u = await env.DATA.get(`user:${email}`, "json");
  let closed = await env.DATA.get("founding:closed");
  if (!closed && (await deps.localsCount(env)) >= deps.goal) { closed = new Date().toISOString(); await env.DATA.put("founding:closed", closed); }
  return !closed || (u?.first && u.first < closed);
}

async function checkout(req, env, url, deps) {
  let b = {}; try { b = await req.json(); } catch (e) {}
  const t = TIERS[b.tier]; if (!t) return J({ error: "bad request" }, 400);
  const email = await deps.member(req, env);
  if (!email) return J({ signin: "/signin?next=" + encodeURIComponent("/membership?buy=" + b.tier) }, 401);
  const m = (await env.MEMBERS.get(`m:${email}`, "json")) || {};
  const key = b.tier === "every" && (await isFounder(env, email, deps)) ? t.foundingKey : t.key;
  const { data } = await stripe(env, "GET", "prices", { "lookup_keys[]": key, active: "true" });
  if (!data?.[0]) return J({ error: "That membership isn't on sale yet." }, 503);
  if (m.subscription && LIVE.includes(m.status)) {
    if (RANK[b.tier] <= RANK[m.tier]) return portal(req, env, url, deps, email); // already on it (or higher): manage it there
    // Upgrade Some -> Every on the same subscription; Stripe charges only the difference for the rest of the year.
    const sub = await stripe(env, "GET", "subscriptions/" + m.subscription);
    await stripe(env, "POST", "subscriptions/" + m.subscription, { items: { 0: { id: sub.items.data[0].id, price: data[0].id } }, proration_behavior: "create_prorations", metadata: { ...sub.metadata, tier: b.tier } });
    await save(env, email, { tier: b.tier });
    return J({ url: `${url.origin}/membership?welcome=${b.tier}` });
  }
  const meta = { brand: BRAND, email, tier: b.tier, town: deps.R.code };
  const trial = !m.trialUsed;
  const s = await stripe(env, "POST", "checkout/sessions", {
    mode: "subscription",
    line_items: { 0: { price: data[0].id, quantity: 1 } },
    customer: m.customer || undefined,
    customer_email: m.customer ? undefined : email,
    metadata: meta,
    subscription_data: { metadata: meta, ...(trial ? { trial_period_days: TRIAL_DAYS, trial_settings: { end_behavior: { missing_payment_method: "cancel" } } } : {}) },
    payment_method_collection: trial ? "if_required" : undefined, // the free trial needs no card
    allow_promotion_codes: "true",
    success_url: `${url.origin}/membership?welcome=${b.tier}`,
    cancel_url: `${url.origin}/membership`,
  });
  return J({ url: s.url });
}

async function portal(req, env, url, deps, email) {
  email = email || (await deps.member(req, env));
  if (!email) return J({ error: "Sign in first." }, 401);
  const m = await env.MEMBERS.get(`m:${email}`, "json");
  if (!m?.customer) return J({ error: "No membership yet." }, 404);
  let conf = await env.MEMBERS.get("portal:config");
  if (!conf) { // our own portal settings in Stripe (no plan switching, so Founding prices stay put), found once by brand
    const { data } = await stripe(env, "GET", "billing_portal/configurations", { active: "true", limit: 100 });
    conf = data?.find(c => c.metadata?.brand === BRAND)?.id || "";
    if (conf) await env.MEMBERS.put("portal:config", conf, { expirationTtl: 86400 });
  }
  const s = await stripe(env, "POST", "billing_portal/sessions", { customer: m.customer, return_url: `${url.origin}/membership`, configuration: conf || undefined });
  return J({ url: s.url });
}

// 7-day money-back: they cancel within 7 days of paying, we refund that payment and end it now. No forms, no asking.
async function moneyBack(env, sub) {
  if (!sub.cancel_at_period_end || sub.status !== "active" || !sub.latest_invoice) return false;
  const inv = await stripe(env, "GET", "invoices/" + sub.latest_invoice);
  const paidAt = inv.status_transitions?.paid_at;
  if (inv.status !== "paid" || !inv.amount_paid || !paidAt || Date.now() / 1000 - paidAt > REFUND_DAYS * 86400) return false;
  const { data } = await stripe(env, "GET", "invoice_payments", { invoice: inv.id });
  const pi = data?.find(p => p.status === "paid")?.payment?.payment_intent;
  if (!pi) return false;
  await stripe(env, "POST", "refunds", { payment_intent: pi, reason: "requested_by_customer", metadata: { why: "7-day money-back guarantee" } });
  await stripe(env, "DELETE", "subscriptions/" + sub.id);
  return true;
}

async function save(env, email, patch) {
  const m = (await env.MEMBERS.get(`m:${email}`, "json")) || {};
  const n = { ...m, ...patch, updated: new Date().toISOString() };
  await env.MEMBERS.put(`m:${email}`, JSON.stringify(n));
  if (n.customer) await env.MEMBERS.put(`c:${n.customer}`, email);
  return n;
}

async function webhook(req, env, ctx, deps) {
  let id; try { id = String((await req.json()).id || ""); } catch (e) { return J({ error: "bad request" }, 400); }
  if (!/^evt_[A-Za-z0-9]+$/.test(id)) return J({ error: "bad request" }, 400);
  let ev; try { ev = await stripe(env, "GET", "events/" + id); } catch (e) { return J({ error: "unknown event" }, 400); }
  const o = ev.data.object;
  if (o.metadata?.brand !== BRAND) return J({ ok: true, skipped: "other brand" });

  if (ev.type === "checkout.session.completed" && o.mode === "subscription") {
    const sub = await stripe(env, "GET", "subscriptions/" + o.subscription);
    await save(env, o.metadata.email, { tier: o.metadata.tier, status: sub.status, customer: o.customer, subscription: o.subscription, town: o.metadata.town, trialUsed: true });
    ctx.waitUntil(deps.acTag(env, o.metadata.email, `Daily Maverick - ${TIERS[o.metadata.tier]?.name || o.metadata.tier}`).catch(() => {}));
  }
  if (ev.type === "customer.subscription.updated" || ev.type === "customer.subscription.deleted") {
    const email = o.metadata?.email || (await env.MEMBERS.get(`c:${o.customer}`));
    if (!email) return J({ ok: true });
    const m = await env.MEMBERS.get(`m:${email}`, "json");
    if (m?.subscription && m.subscription !== o.id) return J({ ok: true }); // an old subscription
    let status = ev.type === "customer.subscription.deleted" ? "canceled" : o.status;
    if (ev.type === "customer.subscription.updated") { try { if (await moneyBack(env, o)) status = "refunded"; } catch (e) { console.log("money-back", String(e)); } }
    await save(env, email, { status, tier: o.metadata?.tier || m?.tier, subscription: o.id, customer: o.customer });
    if (!LIVE.includes(status)) ctx.waitUntil(deps.acTag(env, email, "Daily Maverick - membership ended").catch(() => {}));
  }
  return J({ ok: true });
}

export async function billingApi(req, env, ctx, sub, deps) {
  const url = new URL(req.url);
  if (sub === "status") { const email = await deps.member(req, env); const m = email && env.MEMBERS ? await env.MEMBERS.get(`m:${email}`, "json") : null;
    return J({ on: paymentsOn(env), signedIn: !!email, tier: await tierOf(env, email), status: m?.status || null, trialUsed: !!m?.trialUsed, founder: email && paymentsOn(env) ? await isFounder(env, email, deps) : false }); }
  if (!paymentsOn(env)) return J({ error: "Memberships open soon." }, 503);
  if (req.method !== "POST") return J({ error: "method not allowed" }, 405);
  if (sub === "webhook") return webhook(req, env, ctx, deps);
  if ((req.headers.get("origin") || url.origin) !== url.origin) return J({ error: "bad request" }, 400);
  try {
    if (sub === "checkout") return await checkout(req, env, url, deps);
    if (sub === "portal") return await portal(req, env, url, deps);
  } catch (e) { console.log("billing", String(e)); return J({ error: "The payment page didn't load. Try again in a minute." }, 502); }
  return J({ error: "not found" }, 404);
}
