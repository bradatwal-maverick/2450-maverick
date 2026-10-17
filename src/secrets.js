// Account-wide secrets (Cloudflare Secrets Store), shared by every Maverick site.
// Each one is bound in wrangler.jsonc as "S_<NAME>" and shows up here as plain env.<NAME>,
// so the rest of the code just reads env.STRIPE_SECRET_KEY etc. An old per-Worker secret of the
// same name still works as a fallback, so nothing breaks while moving over.
let cache = null, at = 0;
export async function withSecrets(env) {
  const keys = Object.keys(env).filter((k) => k.startsWith("S_") && env[k] && typeof env[k].get === "function");
  if (!keys.length) return env;
  if (!cache || Date.now() - at > 300000) {
    const out = {};
    await Promise.all(keys.map(async (k) => { try { out[k.slice(2)] = await env[k].get(); } catch (e) { console.log("secret", k, e); } }));
    cache = out; at = Date.now();
  }
  const e = Object.create(env);
  for (const [k, v] of Object.entries(cache)) if (v) e[k] = v;
  return e;
}
