// ---- Locals' photos: signed-in locals share a photo of their postcode. A free AI check screens every one
// (a real place, safe, no close-up faces) so nothing needs a person to approve it. Approved photos queue up
// and each gets its own day as "Your place today", with the local's first name on it. Anyone can report one:
// it comes down straight away. Locals' photos always go before the Commons photo.
const DAY = 864e5;
const addDays = (iso, n) => new Date(Date.parse(iso + "T00:00:00Z") + n * DAY).toISOString().slice(0, 10);
const nice = iso => new Date(iso + "T00:00:00Z").toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

const CHECK = `You screen photos for a family-friendly local community news site. Look at this photo and reply with ONLY this JSON, no other words:
{"place": true or false, "faces": true or false, "unsafe": true or false, "what": "a few words"}
place = true if it shows a real place: beach, landscape, nature, sky, sunrise or sunset, street, town, building, park, river, wildlife or a community event seen from a distance.
faces = true if any person's face is close enough to recognise them.
unsafe = true if there is nudity, violence, blood, weapons, drugs, rude gestures, offensive text, a screenshot, a meme, an advert or a logo.
what = a short plain description, like "sunrise over the beach".`;

async function screen(env, buf) {
  const model = "@cf/meta/llama-3.2-11b-vision-instruct", ask = { messages: [{ role: "user", content: CHECK }], image: [...new Uint8Array(buf)], max_tokens: 120 };
  let out; try { out = await env.AI.run(model, ask); }
  catch (e) { if (/agree/i.test(String(e))) { await env.AI.run(model, { prompt: "agree" }); out = await env.AI.run(model, ask); } else throw e; }
  const s = String(out?.response || ""), j = (() => { try { return JSON.parse(s.match(/\{[\s\S]*\}/)?.[0] || ""); } catch (e) { return null; } })();
  if (!j) return { ok: false, why: "check" };
  const yes = v => v === true || v === "true";
  if (yes(j.unsafe)) return { ok: false, why: "unsafe" };
  if (yes(j.faces)) return { ok: false, why: "faces" };
  if (!yes(j.place)) return { ok: false, why: "place" };
  return { ok: true, what: String(j.what || "").slice(0, 60) };
}

const WHY = { unsafe: "This one can't go on a family news site. Try another shot of your place.",
  faces: "We spotted a face up close. To keep everyone's privacy, share a shot of the place itself, or with people far off in the distance.",
  place: "We're after photos of the place itself: beaches, streets, views, sunsets, wildlife. Try another one.",
  check: "Our photo check is taking a breather. Try again in a few minutes." };

// Today's local photo for a postcode, or null. The first visit of the day gives the next photo in the queue its day.
export async function localToday(env, pc, day) {
  const k = `lpotd:${pc}:${day}`, cur = await env.DATA.get(k);
  if (cur !== null) { if (!cur) return null; const m = await env.DATA.get(`photo:${cur}`, "json"); return m && m.status !== "hidden" ? m : null; }
  const q = (await env.DATA.get(`pq:${pc}`, "json")) || [];
  let pick = null; while (q.length && !pick) { const id = q.shift(), m = await env.DATA.get(`photo:${id}`, "json"); if (m && m.status === "queued") pick = m; }
  if (!pick) { await env.DATA.put(k, "", { expirationTtl: 2 * 3600 }); return null; } // look again in a couple of hours
  pick.status = "featured"; pick.day = day;
  await Promise.all([env.DATA.put(`photo:${pick.id}`, JSON.stringify(pick)), env.DATA.put(`pq:${pc}`, JSON.stringify(q)), env.DATA.put(k, pick.id, { expirationTtl: 3 * 86400 }),
    env.DATA.get(`pdone:${pc}`, "json").then(d => env.DATA.put(`pdone:${pc}`, JSON.stringify([pick.id, ...(d || [])].slice(0, 200))))]);
  return pick;
}

export function photosApi({ esc, page, member, cleanText, todayISO, TOWNS, R, nameOf }) {
  const formPage = async (req, env, url) => {
    const pc = (url.searchParams.get("pc") || R.code).replace(/\D/g, "").slice(0, 4), P = TOWNS[pc]?.live ? pc : R.code, t = TOWNS[P];
    const em = await member(req, env), q = (await env.DATA.get(`pq:${P}`, "json")) || [];
    const gate = em ? "" : `<p class="note">📸 Sign in free to share your photo, so we know it's from a real local. <a href="/signin?next=${encodeURIComponent("/photo?pc=" + P)}"><b>Sign in</b></a></p>`;
    return page(`Share a photo of ${t.name}`, `<p class="mute"><a href="/${P}">‹ ${P} ${esc(t.name)}</a></p><h1>📸 Share your ${esc(t.name)}</h1>
<p>Got a shot that shows why ${esc(t.name)} is amazing? Share it and it gets its own day as <b>Your place today</b>, the first thing every local sees, with your first name on it.</p>
<ul class="rules"><li>🏖️ The place itself: beaches, views, streets, sunsets, wildlife, a community event from a distance</li><li>🙈 No faces up close, to keep everyone's privacy</li><li>📷 Your own photo only</li></ul>
${q.length ? `<p class="mute">${q.length} local photo${q.length > 1 ? "s" : ""} already waiting for ${q.length > 1 ? "their" : "its"} day in ${P}.</p>` : `<p class="mute">Nobody's in the queue for ${P} yet. Share one today and it could be up tomorrow.</p>`}
${gate}<form id="pf"${em ? "" : " hidden"}><label>Your photo<input type="file" id="pfile" accept="image/*" required></label>
<img id="pprev" alt="" hidden style="max-width:100%;border-radius:12px;margin:8px 0">
<label>Where is it? (optional)<input id="pcap" maxlength="80" placeholder="e.g. Sunrise from the headland"></label>
<label class="chk"><input type="checkbox" id="pok" required> I took this photo, and I'm happy for The Daily Maverick to show it with my first name.</label>
<button id="pgo">Share my photo</button></form><p id="pmsg" class="note" hidden></p>
<p class="mute">A free AI check screens every photo in seconds, so it's safe for families. See something that shouldn't be there? Tap "Report" under it and it comes down straight away.</p>
<p><a href="/photos?pc=${P}">See ${esc(t.name)} through locals' eyes →</a></p>
<script>(function(){var f=document.getElementById('pf'),fi=document.getElementById('pfile'),pv=document.getElementById('pprev'),m=document.getElementById('pmsg'),bl=null;if(!f)return;
fi.onchange=function(){var x=fi.files[0];if(!x)return;var img=new Image();img.onload=function(){var k=Math.min(1,1600/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
c.toBlob(function(b){bl=b;pv.src=URL.createObjectURL(b);pv.hidden=false},'image/jpeg',.82)};img.src=URL.createObjectURL(x)};
f.onsubmit=function(e){e.preventDefault();if(!bl){m.textContent='Pick a photo first.';m.hidden=false;return}var g=document.getElementById('pgo');g.disabled=true;g.textContent='Checking your photo…';m.hidden=true;
fetch('/api/photo?pc=${P}&cap='+encodeURIComponent(document.getElementById('pcap').value.trim()),{method:'POST',body:bl,headers:{'content-type':'image/jpeg'}}).then(function(r){return r.json()}).then(function(j){m.innerHTML=j.msg||j.error;m.hidden=false;if(j.ok){f.hidden=true}else{g.disabled=false;g.textContent='Share my photo'}}).catch(function(){m.textContent='Something went wrong. Try again.';m.hidden=false;g.disabled=false;g.textContent='Share my photo'})}})();</script>`, P);
  };

  const upload = async (req, env, url) => {
    const em = await member(req, env); if (!em) return Response.json({ error: "Sign in first." }, { status: 401 });
    const pc = (url.searchParams.get("pc") || "").replace(/\D/g, "").slice(0, 4); if (!TOWNS[pc]?.live) return Response.json({ error: "Pick a postcode." }, { status: 400 });
    const day = todayISO(), nk = `pn:${em}:${day}`, n = +(await env.DATA.get(nk)) || 0;
    if (n >= 3) return Response.json({ error: "That's 3 photos today, thanks! Come back tomorrow for more." }, { status: 429 });
    const buf = await req.arrayBuffer(); if (!buf.byteLength || buf.byteLength > 2.5e6) return Response.json({ error: "That photo's too big. Try again." }, { status: 400 });
    await env.DATA.put(nk, String(n + 1), { expirationTtl: 2 * 86400 });
    let cap = String(url.searchParams.get("cap") || "").replace(/\s+/g, " ").trim().slice(0, 80);
    if (cap && !(await cleanText(env, cap))) cap = "";
    let v; try { v = await screen(env, buf); } catch (e) { v = { ok: false, why: "check" }; }
    if (!v.ok) return Response.json({ error: WHY[v.why] });
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name = await nameOf(env, em);
    const meta = { id, pc, cap: cap || v.what, name, email: em, at: new Date().toISOString(), status: "queued" };
    const q = (await env.DATA.get(`pq:${pc}`, "json")) || [];
    q.push(id);
    await env.DATA.put(`pimg:${id}`, buf);
    await env.DATA.put(`photo:${id}`, JSON.stringify(meta));
    await env.DATA.put(`pq:${pc}`, JSON.stringify(q));
    const today = await env.DATA.get(`lpotd:${pc}:${day}`), when = addDays(day, q.length - (today ? 0 : 1));
    return Response.json({ ok: true, msg: `🎉 Thanks ${esc(name)}! Your photo passed the check. It's set to be <b>Your place today</b> in ${pc} on <b>${nice(when)}</b>. Tell your friends to look out for it.` });
  };

  const image = async (env, id) => { const b = await env.DATA.get(`pimg:${id}`, "arrayBuffer"), m = await env.DATA.get(`photo:${id}`, "json");
    if (!b || !m || m.status === "hidden") return new Response("Not found", { status: 404 });
    return new Response(b, { headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=2592000" } }); };

  const report = async (req, env, url) => { const id = String(url.searchParams.get("id") || "").replace(/[^a-z0-9]/g, ""), m = id && await env.DATA.get(`photo:${id}`, "json");
    if (m && m.status !== "hidden") { m.status = "hidden"; m.reported = new Date().toISOString(); await env.DATA.put(`photo:${id}`, JSON.stringify(m)); }
    return Response.json({ ok: true }); };

  const gallery = async (env, url) => { const pc = (url.searchParams.get("pc") || R.code).replace(/\D/g, "").slice(0, 4), P = TOWNS[pc]?.live ? pc : R.code, t = TOWNS[P];
    const ids = ((await env.DATA.get(`pdone:${P}`, "json")) || []).slice(0, 60), ms = (await Promise.all(ids.map(id => env.DATA.get(`photo:${id}`, "json")))).filter(m => m && m.status !== "hidden");
    return page(`${t.name} through locals' eyes`, `<p class="mute"><a href="/${P}">‹ ${P} ${esc(t.name)}</a></p><h1>📸 ${esc(t.name)} through locals' eyes</h1>
<p>Every one shared by a local, each with its own day as Your place today.</p><p><a class="card" href="/photo?pc=${P}">📷 <b>Share yours</b> Get your shot of ${esc(t.name)} in front of every local →</a></p>
${ms.length ? `<div class="pgal">${ms.map(m => `<figure><img src="/p/${m.id}.jpg" alt="${esc(m.cap)}" loading="lazy"><figcaption>${esc(m.cap)}<small>by ${esc(m.name)} · ${esc(nice(m.day))}</small></figcaption></figure>`).join("")}</div>`
      : `<p class="mute">No locals' photos featured in ${P} yet. Be the first.</p>`}`, P); };

  return { formPage, upload, image, report, gallery };
}
