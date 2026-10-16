// Personalisation, all in one place: what Mav can set on someone's page, settings sync for signed-in locals,
// friends' clocks, events you like, alerts buttons. Browser code is kept as raw strings (no template escaping).
// Config arrives as window.M2C, set by the page shell.

// Settings that follow a signed-in local to any phone. Location, birthday, school and friends stay on the phone.
export const SYNC_RE = /^(order|name|fuel|pc|z_w|z_v|z_e|z_tab|saved_q|bin_bday|bin_bweekly|bin_balt1|bin_balt2|bin_anchor|pin|ev_like|hide_[a-z]+)$/;
export const LIKES = ["free", "kids", "music", "markets", "sport", "food", "arts", "outdoors", "trivia", "bingo", "comedy", "raffles", "deals"];
// How each interest matches a What's on listing kind.
export const LIKE_KINDS = { kids: "kids", music: "music", markets: "market", sport: "sport", food: "meal", trivia: "trivia", bingo: "bingo", comedy: "comedy", raffles: "raffle", deals: "members" };

export async function prefsApi(req, env, email) {
  const k = `prefs:${email}`;
  if (req.method === "GET") { const v = await env.DATA.get(k, "json"); return v ? Response.json(v) : Response.json({ prefs: null }, { status: 404 }); }
  let j = {}; try { j = await req.json(); } catch (e) {}
  const out = {};
  for (const [key, val] of Object.entries(j.prefs || {})) if (SYNC_RE.test(key) && typeof val === "string" && val.length <= 1500) out[key] = val;
  const body = JSON.stringify({ prefs: out, at: Math.min(Number(j.at) || Date.now(), Date.now() + 60e3) });
  if (body.length > 12000) return Response.json({ ok: false }, { status: 413 });
  await env.DATA.put(k, body);
  return Response.json({ ok: true });
}

// Shared browser library: storage, sync, alerts buttons, friends' clocks, events filter.
export const PERSONAL_JS = String.raw`(function(){var C=window.M2C||{};
function g(k){try{return localStorage.getItem(k)}catch(e){return null}}
function p(k,v){try{v===null||v===undefined?localStorage.removeItem(k):localStorage.setItem(k,String(v))}catch(e){}}
function j(k,d){try{var v=JSON.parse(g(k));return v==null?d:v}catch(e){return d}}
var signed=/(?:^|; )m2450n=/.test(document.cookie);
var SYNC=/^(order|name|fuel|pc|z_w|z_v|z_e|z_tab|saved_q|bin_bday|bin_bweekly|bin_balt1|bin_balt2|bin_anchor|pin|ev_like|hide_[a-z]+)$/;
function snap(){var o={};try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(SYNC.test(k))o[k]=localStorage.getItem(k)}}catch(e){}return o}
function hash(o){return JSON.stringify(Object.keys(o).sort().map(function(k){return [k,o[k]]}))}
function up(){if(!signed)return;var s=snap(),h=hash(s);if(h===g('prefs_h'))return;var at=Date.now();p('prefs_h',h);p('prefs_at',at);
var body=JSON.stringify({prefs:s,at:at});fetch('/api/prefs',{method:'POST',headers:{'content-type':'application/json'},body:body,keepalive:true}).catch(function(){})}
function down(){if(!signed)return;fetch('/api/prefs',{credentials:'same-origin'}).then(function(r){return r.ok?r.json():null}).then(function(x){
if(!x||!x.prefs){up();return}var la=+(g('prefs_at')||0);if(x.at<=la){up();return}
var cur=snap(),ch=false;Object.keys(cur).forEach(function(k){if(!(k in x.prefs)){p(k,null);ch=true}});
Object.keys(x.prefs).forEach(function(k){if(SYNC.test(k)&&cur[k]!==x.prefs[k]){p(k,x.prefs[k]);ch=true}});
p('prefs_at',x.at);p('prefs_h',hash(snap()));var once=null;try{once=sessionStorage.getItem('prefs_rl')}catch(e){}
if(ch&&!once){try{sessionStorage.setItem('prefs_rl','1')}catch(e){}location.reload()}}).catch(function(){})}
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')up()});

// Alerts buttons: one tap to turn on push alerts for a topic.
function u8(b){b=b.replace(/-/g,'+').replace(/_/g,'/');var r=atob(b+'==='.slice((b.length+3)%4)),a=new Uint8Array(r.length);for(var i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a}
function pushBind(b){if(b.dataset.bound)return;b.dataset.bound=1;var m=b.parentNode.querySelector('.pushmsg')||{};
if(g('push_'+b.dataset.topic)){b.textContent='Alerts on ✓';b.disabled=true}
b.onclick=function(){if(!('serviceWorker'in navigator)||!('PushManager'in window)){m.textContent='On iPhone: tap Share, then Add to Home Screen, open '+C.code+' from there and try again.';return}
b.disabled=true;b.textContent='Turning on…';Notification.requestPermission().then(function(x){if(x!=='granted')throw 0;return Promise.all([navigator.serviceWorker.ready,fetch('/api/push/key').then(function(r){return r.json()})])})
.then(function(x){return x[0].pushManager.subscribe({userVisibleOnly:true,applicationServerKey:u8(x[1].key)})}).then(function(sub){return fetch('/api/push/sub',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sub:sub,topics:[b.dataset.topic]})})})
.then(function(){b.textContent='Alerts on ✓';p('push_'+b.dataset.topic,1);m.textContent='You’ll get a notification when there’s news.'})
.catch(function(){b.disabled=false;b.textContent='Turn on alerts';m.textContent='Alerts weren’t allowed. You can turn them on in your phone’s settings.'})}}
document.querySelectorAll('.pushbtn').forEach(pushBind);

// Friends' clocks: when to call, and when not to.
function fstat(tz){var d=new Date(),o={};try{new Intl.DateTimeFormat('en-AU',{timeZone:tz,hour:'numeric',weekday:'short',hourCycle:'h23'}).formatToParts(d).forEach(function(x){o[x.type]=x.value})}catch(e){return null}
var h=(+o.hour)%24,we=/Sat|Sun/.test(o.weekday),t=new Intl.DateTimeFormat('en-AU',{timeZone:tz,hour:'numeric',minute:'2-digit'}).format(d).replace(' ','');
var s=h>=22||h<6?['😴','Asleep. No texts unless their phone’s on silent.']:h<8?['🌅','Just up. Text before you call.']:(!we&&h>=9&&h<17)?['💼','At work. Text, don’t call.']:h>=18&&h<20?['🍽️','Dinner time. Keep it quick.']:h>=20?['🌙','Winding down. Text only.']:['✅','Good time to call.'];
return {t:t+' '+o.weekday,e:s[0],m:s[1]}}
function esc(x){return String(x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function friendsHTML(rm){var L=j('friends',[]);return L.map(function(f,i){var s=fstat(f.tz);if(!s)return '';return '<li><b>'+s.e+' '+esc(f.n)+'</b> <span class="mute">'+esc(f.c||f.tz.split('/').pop().replace(/_/g,' '))+' · '+s.t+'</span>'+(rm?' <button type="button" class="ghost frx" data-i="'+i+'" aria-label="Remove '+esc(f.n)+'">×</button>':'')+'<br><small class="mute">'+s.m+'</small></li>'}).join('')}
function drawFriends(){var el=document.getElementById('frs');if(!el)return;var h=friendsHTML(false);el.innerHTML=h?'<p class="pinlab">📞 <b>Your people</b> · <a href="/me#friends">change</a></p><ul class="frs">'+h+'</ul>':''}
drawFriends();setInterval(drawFriends,60000);

// Events you like: filter the events list, with a one-tap way back to everything.
var LK={kids:/kid|child|family|junior|toddler|teen|youth/i,music:/music|gig|band|concert|dj|jazz|choir|acoustic|karaoke|live at/i,markets:/market|stall|fair|bazaar|car boot/i,sport:/sport|footy|rugby|soccer|cricket|netball|parkrun|fun run|swim|surf|tennis|golf|cycl/i,food:/food|lunch|dinner|breakfast|brunch|wine|beer|tasting|bbq|cook/i,arts:/art|gallery|exhibit|theatre|film|movie|craft|workshop|book|poetry|dance/i,outdoors:/walk|hike|beach|park|garden|nature|bush|whale|kayak|trail/i,trivia:/trivia|quiz/i,bingo:/bingo|housie/i,comedy:/comedy|comedian|stand-up|stand up/i,raffles:/raffle|meat tray|draw/i,deals:/members|special|deal|discount|happy hour/i};
function evFilter(){var L=j('ev_like',[]),box=document.getElementById('events');if(!box||!L.length)return;var lis=box.querySelectorAll('li'),n=0;
lis.forEach(function(li){var t=li.textContent,ok=L.some(function(k){return k==='free'?!!li.dataset.free:k==='kids'?(!!li.dataset.kids||LK.kids.test(t)):LK[k]&&LK[k].test(t)});li.hidden=!ok;if(ok)n++});
var note=document.createElement('p');note.className='note';note.innerHTML='🎯 Events you like: '+esc(L.join(', '))+' ('+n+' on). <a href="#" class="evall">Show all</a> · <a href="/me#likes">change</a>';
var h=box.querySelector('h2');box.insertBefore(note,h?h.nextSibling:box.firstChild);note.querySelector('.evall').onclick=function(e){e.preventDefault();lis.forEach(function(li){li.hidden=false});note.remove()}}
evFilter();

window.M2={g:g,p:p,j:j,up:up,signed:signed,friendsHTML:friendsHTML,drawFriends:drawFriends,fstat:fstat,pushBind:pushBind,esc:esc};
down()})();`;

// Mav chat, on every page. Sends the person's settings so Mav knows where they're at, and applies what he sets.
export const MAV_JS = String.raw`(function(){var C=window.M2C||{},M=window.M2,g=M.g,p=M.p,j=M.j,P=document.getElementById('mavp'),B=document.getElementById('mavbtn'),LOG=document.getElementById('mavlog'),IN=document.getElementById('mavin'),H=[];
try{H=JSON.parse(sessionStorage.getItem('mavh')||'[]')}catch(e){}
function e(x){return String(x).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
function draw(){if(!H.length)H=[{role:'assistant',content:'G’day'+(g('name')?' '+g('name'):'')+'! I’m Mav. Ask me anything about '+C.code+', or tell me how you want your daily page.'}];
LOG.innerHTML=H.map(function(m){return '<p class="mm '+(m.role=='user'?'me':'mav')+'">'+e(m.content).replace(/(^|\s)(\/[a-z0-9]+)/g,'$1<a href="$2">$2</a>')+'</p>'}).join('');LOG.scrollTop=1e6;try{sessionStorage.setItem('mavh',JSON.stringify(H.slice(-12)))}catch(_){}}
function open(){P.hidden=false;B.hidden=true;draw();IN.focus();try{sessionStorage.setItem('mavopen',1)}catch(_){}}
B.onclick=open;document.getElementById('mavx').onclick=function(){P.hidden=true;B.hidden=false;try{sessionStorage.removeItem('mavopen')}catch(_){}};
// Mav is the settings button: any link to My 2450 opens him instead (except his own 'see everything' link and on My 2450 itself).
document.addEventListener('click',function(ev){var a=ev.target.closest&&ev.target.closest('a[href^="/me"],.openmav');if(!a||a.classList.contains('mavall')||location.pathname==='/me')return;ev.preventDefault();open()});
function state(){var hidden=[];(C.secs||[]).forEach(function(s){if(g('hide_'+s[0]))hidden.push(s[0])});var b=j('bday',null);
return {pins:j('pin',[]),hidden:hidden,name:g('name')||'',fuel:g('fuel')||'',signs:{w:g('z_w'),v:g('z_v'),e:g('z_e')},likes:j('ev_like',[]),friends:j('friends',[]).map(function(f){return f.n+' ('+f.tz+')'}),
bins:g('bin_bday'),school:g('school')||'',birthday:b?(+b[0])+'/'+(+b[1]+1):'',saved:j('saved_q',[]),weather:g('loc')?'set':'town centre'}}
var DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
function apply(acts){var reload=false,go=null;(acts||[]).forEach(function(a){var L;
if(a.type=='pin'){L=j('pin',[]);a.ids.forEach(function(i){if(L.indexOf(i)<0)L.push(i);p('hide_'+i,null)});p('pin',JSON.stringify(L));reload=true}
else if(a.type=='unpin'){L=j('pin',[]).filter(function(i){return a.ids.indexOf(i)<0});p('pin',L.length?JSON.stringify(L):null);reload=true}
else if(a.type=='order'){p('order',JSON.stringify(a.ids));reload=true}
else if(a.type=='hide'){a.ids.forEach(function(i){p('hide_'+i,'1')});L=j('pin',[]).filter(function(i){return a.ids.indexOf(i)<0});p('pin',L.length?JSON.stringify(L):null);reload=true}
else if(a.type=='show'){a.ids.forEach(function(i){p('hide_'+i,null)});reload=true}
else if(a.type=='name'&&a.value){p('name',a.value);reload=true}
else if(a.type=='fuel'){p('fuel',a.value);reload=true}
else if(a.type=='sign'){p('z_'+a.system,a.index);p('z_tab',a.system);reload=true}
else if(a.type=='weather'){if(a.here&&navigator.geolocation){navigator.geolocation.getCurrentPosition(function(x){p('loc',JSON.stringify([Math.round(x.coords.latitude*100)/100,Math.round(x.coords.longitude*100)/100]));after(true)},function(){})}else if(a.lat){p('loc',JSON.stringify([a.lat,a.lon]));reload=true}}
else if(a.type=='bins'){p('bin_bday',a.day);reload=true}
else if(a.type=='school'){p('school',a.value)}
else if(a.type=='birthday'){p('bday',JSON.stringify([String(a.day),String(a.month-1)]))}
else if(a.type=='search'){L=j('saved_q',[]).filter(function(x){return x!==a.value});L.unshift(a.value);p('saved_q',JSON.stringify(L.slice(0,8)));reload=true}
else if(a.type=='events'){p('ev_like',a.likes.length?JSON.stringify(a.likes):null);reload=true}
else if(a.type=='friend'){L=j('friends',[]).filter(function(f){return f.n.toLowerCase()!==a.name.toLowerCase()});L.push({n:a.name,tz:a.tz,c:a.city||''});p('friends',JSON.stringify(L.slice(-12)));reload=true}
else if(a.type=='unfriend'){L=j('friends',[]).filter(function(f){return f.n.toLowerCase()!==a.name.toLowerCase()});p('friends',L.length?JSON.stringify(L):null);reload=true}
else if(a.type=='alerts'){var w=document.createElement('p');w.className='mm mav';w.innerHTML='<button type="button" class="pushbtn" data-topic="'+a.topic+'">🔔 Turn on '+(a.topic=='fields'?'field closure':'fire &amp; weather')+' alerts</button><br><small class="mute pushmsg"></small>';LOG.appendChild(w);M.pushBind(w.querySelector('button'));LOG.scrollTop=1e6}
else if(a.type=='area'){p('pc',a.pc);go='/'+a.pc}else if(a.type=='link'){go=a.url}});
after(reload,go)}
function after(reload,go){M.up();if(window.meDraw)meDraw();if(go)setTimeout(function(){location.href=go},900);else if(reload&&/^\/\d{4}\/?$/.test(location.pathname))setTimeout(function(){location.reload()},900)}
function send(t,cb){t=String(t||'').trim();if(!t)return;H.push({role:'user',content:t});H.push({role:'assistant',content:'…'});draw();IN.value='';
var pc=(location.pathname.match(/^\/(\d{4})/)||[])[1]||g('pc')||C.code;
fetch('/api/mav',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:H.slice(0,-1).slice(-6),pc:pc,state:state()})})
.then(function(r){return r.json()}).then(function(x){H[H.length-1]={role:'assistant',content:x.reply};draw();apply(x.actions);if(cb)cb(x.reply)})
.catch(function(){H[H.length-1]={role:'assistant',content:'Sorry, I dropped the ball. Try again?'};draw();if(cb)cb(null)})}
window.mavSend=send;
document.getElementById('mavf').onsubmit=function(ev){ev.preventDefault();send(IN.value)};
document.getElementById('mavchips').onclick=function(ev){if(ev.target.tagName=='LABEL')send(ev.target.textContent)};
var SR=window.SpeechRecognition||window.webkitSpeechRecognition,mic=document.getElementById('mavmic'),big=document.getElementById('mavbig');
function listen(btn,idle){var r=new SR();r.lang='en-AU';r.interimResults=true;btn.textContent='👂 Listening…';r.onresult=function(x){IN.value=Array.prototype.map.call(x.results,function(y){return y[0].transcript}).join(' ')};r.onend=function(){btn.textContent=idle;if(IN.value)send(IN.value)};r.onerror=function(){btn.textContent=idle};r.start()}
if(!SR){mic.hidden=true;big.textContent='⌨️ Type what you want below';big.onclick=function(){IN.focus()}}else{mic.onclick=function(){listen(mic,'🎤')};big.onclick=function(){listen(big,'🎤 Tap and tell Mav')}}
try{if(sessionStorage.getItem('mavopen'))open()}catch(_){}})();`;

// My <postcode>: the one spot to make the daily page yours. Tell Mav, or tap.
export const ME_JS = String.raw`(function(){var C=window.M2C,M=window.M2,g=M.g,p=M.p,j=M.j,esc=M.esc,S=C.secs.filter(function(s){return s[0]!=='today'});
function lab(id){var x=S.filter(function(s){return s[0]==id})[0];return x?x[1]:id}
function draw(){var pins=j('pin',[]).filter(function(i){return lab(i)!==i});
document.getElementById('pins').innerHTML=pins.length?pins.map(function(id,i){return '<li><span>📌 '+esc(lab(id))+'</span><span><button type="button" data-pu="'+i+'" aria-label="Move up"'+(i?'':' disabled')+'>↑</button> <button type="button" data-pd="'+i+'" aria-label="Move down"'+(i<pins.length-1?'':' disabled')+'>↓</button> <button type="button" data-unpin="'+id+'" class="tg">Unpin</button></span></li>'}).join(''):'<li class="mute">Nothing pinned yet. Tap 📌 below, or tell Mav.</li>';
document.getElementById('list').innerHTML=S.filter(function(s){return pins.indexOf(s[0])<0}).sort(function(a,b){return a[1].localeCompare(b[1])}).map(function(s){var off=g('hide_'+s[0]);return '<li class="'+(off?'off':'')+'"><span>'+esc(s[1])+'</span><span><button type="button" data-pin="'+s[0]+'" aria-label="Pin '+esc(s[1])+'">📌</button> <button type="button" data-t="'+s[0]+'" class="tg">'+(off?'Off':'On')+'</button></span></li>'}).join('');
['w','v','e'].forEach(function(k){var el=document.getElementById('z'+k);el.value=g('z_'+k)||''});
var L=j('ev_like',[]);document.querySelectorAll('#likes input').forEach(function(c){c.checked=L.indexOf(c.value)>-1});
document.getElementById('frl').innerHTML=M.friendsHTML(true)||'<li class="mute">No one yet. Add a friend or family member overseas or interstate.</li>';
var lo=j('loc',null);document.getElementById('wxnow').textContent=lo?'Set to your spot.':'Using the town centre.';
var Q=j('saved_q',[]);document.getElementById('sq').innerHTML=Q.length?Q.map(function(q,i){return '<li><span>🔎 '+esc(q)+'</span><button type="button" class="ghost" data-q="'+i+'" aria-label="Remove">×</button></li>'}).join(''):'<li class="mute">None saved. Search on the front page and tap ☆ Save.</li>';
var bd=g('bin_bday'),DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],b=j('bday',null),M3=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
document.getElementById('mbin').textContent=bd!==null&&bd!==''?DAYS[+bd]+' night':'Not set';document.getElementById('msch').textContent=g('school')||'Not set';document.getElementById('mbd').textContent=b?(+b[0])+' '+M3[+b[1]]:'Not set'}
window.meDraw=draw;
function ch(){M.up();draw()}
document.querySelector('.me').addEventListener('click',function(e){var b=e.target,d=b.dataset,pins=j('pin',[]),i;
if(d.pin){if(pins.indexOf(d.pin)<0)pins.push(d.pin);p('hide_'+d.pin,null)}else if(d.unpin){pins=pins.filter(function(x){return x!==d.unpin})}
else if(d.pu){i=+d.pu;pins.splice(i-1,0,pins.splice(i,1)[0])}else if(d.pd){i=+d.pd;pins.splice(i+1,0,pins.splice(i,1)[0])}
else if(d.t){p('hide_'+d.t,g('hide_'+d.t)?null:'1');ch();return}
else if(b.classList.contains('frx')){var F=j('friends',[]);F.splice(+d.i,1);p('friends',F.length?JSON.stringify(F):null);draw();return}
else if(d.q){var Q=j('saved_q',[]);Q.splice(+d.q,1);p('saved_q',Q.length?JSON.stringify(Q):null);ch();return}else return;
p('pin',pins.length?JSON.stringify(pins):null);ch()});
['w','v','e'].forEach(function(k){document.getElementById('z'+k).onchange=function(){var v=this.value;p('z_'+k,v===''?null:v);if(v!==''&&k==='w'&&g('z_v')===null)p('z_v',(+v+11)%12);if(v!==''&&k==='v'&&g('z_w')===null)p('z_w',(+v+1)%12);ch()}});
document.getElementById('likes').onchange=function(){var L=[];document.querySelectorAll('#likes input:checked').forEach(function(c){L.push(c.value)});p('ev_like',L.length?JSON.stringify(L):null);ch()};
var tzs=[];try{tzs=Intl.supportedValuesOf('timeZone')}catch(e){tzs=['Europe/London','America/New_York','America/Los_Angeles','Asia/Kolkata','Asia/Singapore','Asia/Tokyo','Pacific/Auckland','Australia/Perth','Australia/Brisbane','Australia/Adelaide','Australia/Darwin']}
document.getElementById('tzl').innerHTML=tzs.map(function(z){return '<option value="'+z+'">'+z.split('/').pop().replace(/_/g,' ')+'</option>'}).join('');
document.getElementById('fra').onsubmit=function(e){e.preventDefault();var n=document.getElementById('frn').value.trim().slice(0,24),z=document.getElementById('frz').value.trim(),msg=document.getElementById('frm');
if(!n){msg.textContent='Add their first name.';return}var hit=tzs.filter(function(x){return x.toLowerCase()===z.toLowerCase()||x.split('/').pop().replace(/_/g,' ').toLowerCase()===z.toLowerCase()})[0];
if(!hit||!M.fstat(hit)){msg.textContent='Pick their city from the list, or ask Mav (e.g. “Jimmy lives in Bali”).';return}
var F=j('friends',[]).filter(function(f){return f.n.toLowerCase()!==n.toLowerCase()});F.push({n:n,tz:hit,c:hit.split('/').pop().replace(/_/g,' ')});p('friends',JSON.stringify(F.slice(-12)));this.reset();msg.textContent='';draw()};
document.getElementById('wxt').onchange=function(){var t=C.towns[this.value];if(t){p('loc',JSON.stringify([t[1],t[2]]));draw()}this.value=''};
document.getElementById('wxh').onclick=function(e){e.preventDefault();if(!navigator.geolocation)return;navigator.geolocation.getCurrentPosition(function(x){p('loc',JSON.stringify([Math.round(x.coords.latitude*100)/100,Math.round(x.coords.longitude*100)/100]));draw()},function(){})};
document.getElementById('wxr').onclick=function(e){e.preventDefault();p('loc',null);draw()};
var ta=document.getElementById('say'),rp=document.getElementById('reply');document.getElementById('ex').onclick=function(e){if(e.target.tagName=='LABEL'){ta.value=e.target.textContent;ta.focus()}};
var SR=window.SpeechRecognition||window.webkitSpeechRecognition,mic=document.getElementById('mic');
if(!SR){mic.textContent='🎤 Use your keyboard mic';mic.onclick=function(){ta.focus()}}else mic.onclick=function(){var r=new SR();r.lang='en-AU';r.interimResults=true;mic.textContent='👂 Listening…';
r.onresult=function(e){ta.value=Array.prototype.map.call(e.results,function(x){return x[0].transcript}).join(' ')};r.onend=function(){mic.textContent='🎤 Talk'};r.onerror=r.onend;r.start()};
document.getElementById('go').onclick=function(){var b=this;if(!ta.value.trim()){ta.focus();return}b.disabled=true;b.textContent='Mav is on it…';
window.mavSend(ta.value,function(r){rp.hidden=false;rp.textContent='🗣️ '+(r||'Mav dropped the ball. Try again?');b.disabled=false;b.textContent='✨ Set me up';ta.value='';draw()})};
var nm=document.getElementById('nm');nm.value=g('name')||decodeURIComponent((document.cookie.match(/(?:^|; )m2450n=([^;]*)/)||[])[1]||'');
nm.oninput=function(){p('name',nm.value.trim()||null)};nm.onchange=function(){M.up()};
document.getElementById('reset').onclick=function(e){e.preventDefault();if(!confirm('Start your page again from scratch?'))return;['pin','order','ev_like','z_w','z_v','z_e','z_tab'].forEach(function(k){p(k,null)});S.forEach(function(s){p('hide_'+s[0],null)});ch()};
draw()})();`;
