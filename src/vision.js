// ---- One way to ask the free vision model about a photo. Workers AI changed its input format, so this sends the
// current one (text + image in the message) and falls back to the older one. Handles the one-time licence "agree".
const MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";
function b64(buf) { const u = new Uint8Array(buf); let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); }
async function run(env, ask) {
  try { return await env.AI.run(MODEL, ask); }
  catch (e) { if (/agree/i.test(String(e))) { await env.AI.run(MODEL, { prompt: "agree" }); return await env.AI.run(MODEL, ask); } throw e; }
}
export async function look(env, prompt, buf, max_tokens = 120) {
  const url = "data:image/jpeg;base64," + b64(buf);
  try { const o = await run(env, { messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url } }] }], max_tokens }); return String(o?.response || ""); }
  catch (e) { const o = await run(env, { prompt, image: [...new Uint8Array(buf)], max_tokens }); return String(o?.response || ""); }
}
