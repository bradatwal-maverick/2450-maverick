// Personalisation, all in one place: what Mav can set on someone's page, settings sync for signed-in locals,
// friends' clocks, events you like, alerts buttons. Browser code is kept as raw strings (no template escaping).
// Config arrives as window.M2C, set by the page shell.

// Settings that follow a signed-in local to any phone. Location, birthday, school and friends stay on the phone.
export const SYNC_RE = /^(order|name|fuel|pc|z_w|z_v|z_e|z_tab|saved_q|bin_bday|bin_bweekly|bin_balt1|bin_balt2|bin_anchor|pin|ev_like|profile|reads|hide_[a-z]+)$/;
export const LIKES = ["free", "kids", "music", "markets", "sport", "food", "arts", "outdoors", "trivia", "comedy", "deals"];
// How each interest matches a What's on listing kind.
export const LIKE_KINDS = { kids: "kids", music: "music", markets: "market", sport: "sport", food: "meal", trivia: "trivia", comedy: "comedy", deals: "members" };

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
var SYNC=/^(order|name|fuel|pc|z_w|z_v|z_e|z_tab|saved_q|bin_bday|bin_bweekly|bin_balt1|bin_balt2|bin_anchor|pin|ev_like|profile|reads|hide_[a-z]+)$/;
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

// Mav chat, on every page. Mav only makes the page more relevant to the person: he shows or hides
// sections and sets their details. He never moves the page around; the structure stays the same for everyone.
// Chat text can't be copied (it can be emailed to a signed-in member instead).
export const MAV_JS = String.raw`(function(){var C=window.M2C||{},M=window.M2,g=M.g,p=M.p,j=M.j,P=document.getElementById('mavp'),B=document.getElementById('mavbtn'),LOG=document.getElementById('mavlog'),IN=document.getElementById('mavin'),ST=document.getElementById('mavst'),H=[],busy=false,lastQ='';
try{H=JSON.parse(sessionStorage.getItem('mavh')||'[]')}catch(e){}
function e(x){return String(x).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
function hello(){return [{role:'assistant',content:'G’day'+(g('name')?' '+g('name'):'')+'! I’m Mav. Tell me what you care about and I’ll make your page about you.'}]}
function draw(){if(!H.length)H=hello();var you=H.some(function(m){return m.role=='user'});document.getElementById('mavchips').hidden=you;document.getElementById('mavbig').hidden=you;
LOG.innerHTML=H.map(function(m,i){return '<p class="mm '+(m.role=='user'?'me':'mav')+(i==H.length-1&&m.role!='user'?' last':'')+'">'+e(m.content).replace(/(^|\s)(\/[a-z0-9]+)/g,'$1<a href="$2">$2</a>')+'</p>'}).join('');LOG.scrollTop=1e6;
document.getElementById('mavmail').hidden=!(M.signed&&you);try{sessionStorage.setItem('mavh',JSON.stringify(H.slice(-12)))}catch(_){}}
function status(t,retry){ST.hidden=!t;ST.innerHTML=t?e(t)+(retry?' <button type="button" id="mavre">🔄 Refresh Mav</button>':''):'';var r=document.getElementById('mavre');if(r)r.onclick=refresh}
function refresh(){var q=lastQ;H=[];try{sessionStorage.removeItem('mavh')}catch(_){}status('');draw();if(q)send(q)}
function open(){P.hidden=false;B.hidden=true;draw();IN.focus();try{sessionStorage.setItem('mavopen',1)}catch(_){}}
B.onclick=open;document.getElementById('mavx').onclick=function(){P.hidden=true;B.hidden=false;try{sessionStorage.removeItem('mavopen')}catch(_){}};
// No copying Mav's chat. Members can have it emailed instead.
['copy','cut','contextmenu','dragstart','selectstart'].forEach(function(t){LOG.addEventListener(t,function(ev){ev.preventDefault()})});
// Mav is the settings button: any link to My 2450 opens him instead (except his own 'see everything' link and on My 2450 itself).
document.addEventListener('click',function(ev){var a=ev.target.closest&&ev.target.closest('a[href^="/me"],.openmav');if(!a||a.classList.contains('mavall')||location.pathname==='/me')return;ev.preventDefault();open()});
// Start fresh: wipes this person's page settings here and on every phone they're signed in on.
function resetAll(){var keys=[];try{for(var i=0;i<localStorage.length;i++)keys.push(localStorage.key(i))}catch(_){}
keys.forEach(function(k){if(/^(order|pin|name|fuel|z_w|z_v|z_e|z_tab|saved_q|ev_like|friends|people|todo|loc|beer|wine|prefs_h|profile|reads|hide_[a-z]+)$/.test(k))p(k,null)});
var at=Date.now();p('prefs_at',at);if(M.signed)return fetch('/api/prefs',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({prefs:{},at:at}),keepalive:true}).catch(function(){});return Promise.resolve()}
window.mavReset=resetAll;
document.getElementById('mavreset').onclick=function(){if(!confirm('Start your page fresh? Everything Mav set goes back to normal.'))return;resetAll().then(function(){H=[{role:'assistant',content:'Done, your page is back to normal. Tell me what you care about and I’ll make it about you.'}];draw();if(/^\/\d{4}\/?$/.test(location.pathname)||location.pathname=='/')setTimeout(function(){location.reload()},700)})};
function state(){var hidden=[];(C.secs||[]).forEach(function(s){if(g('hide_'+s[0]))hidden.push(s[0])});var b=j('bday',null);
return {hidden:hidden,name:g('name')||'',fuel:g('fuel')||'',signs:{w:g('z_w'),v:g('z_v'),e:g('z_e')},likes:j('ev_like',[]),friends:j('friends',[]).map(function(f){return f.n+' ('+f.tz+')'}),
profile:j('profile',{}),reads:j('reads',{}),todo:j('todo',[]).map(function(x){return x.t+' on '+x.d}),people:j('people',[]).map(function(x){return x.n+' '+x.d+'/'+x.m+(x.l?' likes '+x.l:'')}),bins:g('bin_bday'),school:g('school')||'',birthday:b?(+b[0])+'/'+(+b[1]+1):'',saved:j('saved_q',[]),weather:g('loc')?'set':'town centre'}}
function apply(acts){var reload=false,go=null;(acts||[]).forEach(function(a){var L;
if(a.type=='hide'){a.ids.forEach(function(i){p('hide_'+i,'1')});L=j('pin',[]).filter(function(i){return a.ids.indexOf(i)<0});p('pin',L.length?JSON.stringify(L):null);reload=true}
else if(a.type=='show'){a.ids.forEach(function(i){p('hide_'+i,null)});reload=true}
else if(a.type=='reset'){resetAll();reload=true}
else if(a.type=='name'&&a.value){p('name',a.value);reload=true}
else if(a.type=='fuel'){p('fuel',a.value);reload=true}
else if(a.type=='sign'){p('z_'+a.system,a.index);p('z_tab',a.system);reload=true}
else if(a.type=='weather'){if(a.here&&navigator.geolocation){navigator.geolocation.getCurrentPosition(function(x){p('loc',JSON.stringify([Math.round(x.coords.latitude*100)/100,Math.round(x.coords.longitude*100)/100]));after(true)},function(){})}else if(a.lat){p('loc',JSON.stringify([a.lat,a.lon]));reload=true}}
else if(a.type=='bins'){p('bin_bday',a.day);reload=true}
else if(a.type=='school'){p('school',a.value)}
else if(a.type=='birthday'){p('bday',JSON.stringify([String(a.day),String(a.month-1)]))}
else if(a.type=='beer'){p('beer',a.value);reload=true}
else if(a.type=='wine'){p('wine',a.value);reload=true}
else if(a.type=='search'){L=j('saved_q',[]).filter(function(x){return x!==a.value});L.unshift(a.value);p('saved_q',JSON.stringify(L.slice(0,8)));reload=true}
else if(a.type=='events'){p('ev_like',a.likes.length?JSON.stringify(a.likes):null);reload=true}
else if(a.type=='friend'){L=j('friends',[]).filter(function(f){return f.n.toLowerCase()!==a.name.toLowerCase()});L.push({n:a.name,tz:a.tz,c:a.city||''});p('friends',JSON.stringify(L.slice(-12)));reload=true}
else if(a.type=='person'){L=j('people',[]).filter(function(x){return x.n.toLowerCase()!==a.name.toLowerCase()});L.push({n:a.name,d:a.day,m:a.month,l:a.likes||''});p('people',JSON.stringify(L.slice(-20)));reload=true}
else if(a.type=='remind'){L=j('todo',[]).filter(function(x){return x.t.toLowerCase()!==a.text.toLowerCase()});L.push({t:a.text,d:a.date});p('todo',JSON.stringify(L.slice(-20)));reload=true}
else if(a.type=='unremind'){L=j('todo',[]).filter(function(x){return x.t.toLowerCase().indexOf(a.text.toLowerCase())<0});p('todo',L.length?JSON.stringify(L):null);reload=true}
else if(a.type=='unperson'){L=j('people',[]).filter(function(x){return x.n.toLowerCase()!==a.name.toLowerCase()});p('people',L.length?JSON.stringify(L):null);reload=true}
else if(a.type=='unfriend'){L=j('friends',[]).filter(function(f){return f.n.toLowerCase()!==a.name.toLowerCase()});p('friends',L.length?JSON.stringify(L):null);reload=true}
else if(a.type=='alerts'){var w=document.createElement('p');w.className='mm mav';w.innerHTML='<button type="button" class="pushbtn" data-topic="'+a.topic+'">🔔 Turn on '+(a.topic=='fields'?'field closure':'fire &amp; weather')+' alerts</button><br><small class="mute pushmsg"></small>';LOG.appendChild(w);M.pushBind(w.querySelector('button'));LOG.scrollTop=1e6}
else if(a.type=='area'){p('pc',a.pc);go='/'+a.pc}else if(a.type=='link'){go=a.url}});
after(reload,go)}
function after(reload,go){M.up();if(window.meDraw)meDraw();if(go)setTimeout(function(){location.href=go},900);else if(reload&&/^\/\d{4}\/?$/.test(location.pathname))setTimeout(function(){location.reload()},1200)}
function send(t,cb){t=String(t||'').trim();if(!t||busy)return;busy=true;lastQ=t;status('');H.push({role:'user',content:t});H.push({role:'assistant',content:'…'});draw();IN.value='';
var pc=(location.pathname.match(/^\/(\d{4})/)||[])[1]||g('pc')||C.code,ac=window.AbortController?new AbortController():null,tm=setTimeout(function(){if(ac)ac.abort()},20000);
function fail(){busy=false;clearTimeout(tm);H.pop();H.push({role:'assistant',content:'Hmm, I’m not working right now.'});draw();status('Mav’s having a moment.',true);if(cb)cb(null)}
fetch('/api/mav',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:H.slice(0,-1).slice(-6),pc:pc,state:state()}),signal:ac?ac.signal:undefined})
.then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(x){busy=false;clearTimeout(tm);if(!x||!x.reply){fail();return}H[H.length-1]={role:'assistant',content:x.reply};draw();if(x.ok===false)status('Mav’s brain is slow today, so he’s on simple mode.',true);apply(x.actions);if(cb)cb(x.reply)})
.catch(fail)}
window.mavSend=send;
document.getElementById('mavf').onsubmit=function(ev){ev.preventDefault();send(IN.value)};
document.getElementById('mavchips').onclick=function(ev){if(ev.target.tagName=='LABEL')send(ev.target.textContent)};
document.getElementById('mavmail').onclick=function(){var b=this;b.disabled=true;b.textContent='Sending…';
fetch('/api/mav/email',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:H.slice(-12)})}).then(function(r){return r.json()})
.then(function(x){b.textContent=x.ok?'📧 Sent to your inbox':'📧 '+(x.error||'Couldn’t send, try again')}).catch(function(){b.textContent='📧 Couldn’t send, try again'}).finally(function(){setTimeout(function(){b.disabled=false;b.textContent='📧 Email me this chat'},4000)})};
var SR=window.SpeechRecognition||window.webkitSpeechRecognition,mic=document.getElementById('mavmic'),big=document.getElementById('mavbig');
function listen(btn,idle){var r=new SR();r.lang='en-AU';r.interimResults=true;btn.textContent='👂 Listening…';r.onresult=function(x){IN.value=Array.prototype.map.call(x.results,function(y){return y[0].transcript}).join(' ')};r.onend=function(){btn.textContent=idle;if(IN.value)send(IN.value)};r.onerror=function(){btn.textContent=idle};r.start()}
if(!SR){mic.hidden=true;big.textContent='⌨️ Type below';big.onclick=function(){IN.focus()}}else{mic.onclick=function(){listen(mic,'🎤')};big.onclick=function(){listen(big,'🎤 Tap and tell Mav')}}
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
document.getElementById('reset').onclick=function(e){e.preventDefault();if(!confirm('Start your page fresh? Everything goes back to normal, on every phone you sign in on.'))return;(window.mavReset?window.mavReset():Promise.resolve()).then(function(){location.reload()})};
draw()})();`;

// Account settings (My page): the manual way, for people who like to set things themselves. Nothing is kept until they press Save.
// "About you" answers build a little profile; Mav can pre-fill the sections from it, and they can override anything.
export const SETTINGS_JS = String.raw`(function(){var C=window.M2C,M=window.M2,g=M.g,p=M.p,j=M.j,F=document.getElementById('setf'),msg=document.getElementById('setmsg'),dirty=false;
function q(s){return F.querySelectorAll(s)}
var PPL=[];function drawP(){var M3=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];document.getElementById('ppl').innerHTML=PPL.length?PPL.map(function(x,i){return '<li><span>🎂 <b>'+M.esc(x.n)+'</b> '+x.d+' '+M3[x.m-1]+(x.l?' · likes '+M.esc(x.l):'')+'</span><button type="button" class="ghost" data-px="'+i+'" aria-label="Remove">×</button></li>'}).join(''):'<li class="mute">No one yet. Add Mum, Dad, the kids, your best mate…</li>'}
document.getElementById('ppl').onclick=function(e){var i=e.target.dataset.px;if(i===undefined)return;PPL.splice(+i,1);drawP();mark()};
document.getElementById('padd').onclick=function(){var n=F.pn.value.trim().replace(/[<>]/g,'').slice(0,24),d=+F.pd.value,m=+F.pm.value,l=F.pl.value.trim().replace(/[<>]/g,'').slice(0,80);if(!n||!d||!m){msg.textContent='Add a name, day and month.';return}PPL=PPL.filter(function(x){return x.n.toLowerCase()!==n.toLowerCase()});PPL.push({n:n,d:d,m:m,l:l});F.pn.value=F.pl.value='';F.pd.value=F.pm.value='';drawP();mark()};
var TD=[];function drawT(){document.getElementById('tdl').innerHTML=TD.length?TD.map(function(x,i){return '<li><span>📅 '+M.esc(x.d)+' · '+M.esc(x.t)+'</span><button type="button" class="ghost" data-tx="'+i+'" aria-label="Remove">×</button></li>'}).join(''):'<li class="mute">None yet. Tell Mav, like “remind me to take Rua to the vet on Friday”.</li>'}
document.getElementById('tdl').onclick=function(e){var i=e.target.dataset.tx;if(i===undefined)return;TD.splice(+i,1);drawT();mark()};
function load(){var pr=j('profile',{});PPL=j('people',[]);drawP();TD=j('todo',[]);drawT();F.name.value=g('name')||'';['music','tv','weekend'].forEach(function(k){F[k].value=pr[k]||''});
q('[name=readfor]').forEach(function(c){c.checked=(pr.readfor||[]).indexOf(c.value)>-1});F.kids.value=pr.kids||'';F.dog.value=pr.dog||'';
var L=j('ev_like',[]);q('[name=like]').forEach(function(c){c.checked=L.indexOf(c.value)>-1});
q('[name=sec]').forEach(function(c){c.checked=!g('hide_'+c.value)});F.zw.value=g('z_w')||'';F.fuel.value=g('fuel')||'';F.bins.value=g('bin_bday')||'';dirty=false;msg.textContent=''}
function mark(){dirty=true;msg.textContent='Not saved yet. Press Save to keep it.'}
F.addEventListener('input',mark);F.addEventListener('change',mark);
function vals(n){var o=[];q('[name='+n+']:checked').forEach(function(c){o.push(c.value)});return o}
function profile(){return {readfor:vals('readfor'),music:F.music.value.trim().slice(0,80),tv:F.tv.value.trim().slice(0,80),weekend:F.weekend.value.trim().slice(0,160),kids:F.kids.value,dog:F.dog.value}}
F.onsubmit=function(ev){ev.preventDefault();p('profile',JSON.stringify(profile()));p('name',F.name.value.trim().slice(0,24)||null);
var L=vals('like');p('ev_like',L.length?JSON.stringify(L):null);q('[name=sec]').forEach(function(c){p('hide_'+c.value,c.checked?null:'1')});
p('people',PPL.length?JSON.stringify(PPL.slice(-20)):null);p('todo',TD.length?JSON.stringify(TD):null);p('z_w',F.zw.value===''?null:F.zw.value);p('fuel',F.fuel.value||null);p('bin_bday',F.bins.value===''?null:F.bins.value);M.up();dirty=false;msg.innerHTML='✓ Saved. <a href="/'+C.code+'#foryou">See your page →</a>'};
document.getElementById('mavfill').onclick=function(){var b=this,pr=profile();b.disabled=true;b.textContent='Mav is thinking…';
fetch('/api/mav/suggest',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({profile:pr,reads:j('reads',{})})}).then(function(r){return r.json()}).then(function(x){
if(x.error){msg.textContent=x.error;return}(x.hide||[]).forEach(function(id){var c=F.querySelector('[name=sec][value="'+id+'"]');if(c)c.checked=false});(x.show||[]).forEach(function(id){var c=F.querySelector('[name=sec][value="'+id+'"]');if(c)c.checked=true});
(x.likes||[]).forEach(function(v){var c=F.querySelector('[name=like][value="'+v+'"]');if(c)c.checked=true});mark();msg.textContent='✨ '+(x.say||'Mav filled it in.')+' Check it, change anything, then press Save.'})
.catch(function(){msg.textContent='Mav’s having a moment. Try again, or set it yourself.'}).finally(function(){b.disabled=false;b.textContent='✨ Let Mav fill it in'})};
document.getElementById('setreset').onclick=function(ev){ev.preventDefault();if(!confirm('Start your page fresh? Everything goes back to normal.'))return;(window.mavReset?window.mavReset():Promise.resolve()).then(function(){load();msg.textContent='Back to normal.'})};
document.getElementById('setall').onclick=function(ev){ev.preventDefault();q('[name=sec]').forEach(function(c){c.checked=true});mark()};
addEventListener('beforeunload',function(e){if(dirty){e.preventDefault();e.returnValue=''}});load()})();`;

// "For you": one spot at the top of their own paper (bookmark /#foryou). Mav picks what he thinks they'll want to know today,
// from what they've told him and what they read. It's taken from today's paper, so it's always sourced; nothing new to host.
export const FORYOU_JS = String.raw`(function(){var f=document.getElementById('flow'),M=window.M2;if(!f||!M||document.getElementById('foryou'))return;var g=M.g,p=M.p,j=M.j,esc=M.esc;
// What they read: count opens of each section, quietly, on this phone (and their account when signed in).
f.addEventListener('click',function(ev){var t=ev.target,s=t.closest&&t.closest('#flow>section'),b=t.closest&&t.closest('.pills button[data-id]'),id=b?b.dataset.id:s&&s.id;if(!id||id=='foryou')return;var R=j('reads',{});R[id]=(R[id]||0)+1;var k=Object.keys(R).sort(function(a,b){return R[b]-R[a]}).slice(0,15),o={};k.forEach(function(x){o[x]=R[x]});p('reads',JSON.stringify(o))},true);
var MAP={news:['news','alerts'],rip:['bdm'],events:['tonight','events'],weather:['sea','beaches'],sport:['sport'],council:['council'],deals:['fuel','beer','rates'],jobs:['jobs','rent'],family:['kids'],puzzles:['stars','puzzles']};
var pr=j('profile',{}),R=j('reads',{}),want=[];(pr.readfor||[]).forEach(function(v){(MAP[v]||[]).forEach(function(id){if(want.indexOf(id)<0)want.push(id)})});
Object.keys(R).filter(function(id){return R[id]>=2}).sort(function(a,b){return R[b]-R[a]}).forEach(function(id){if(want.indexOf(id)<0)want.push(id)});
if(j('ev_like',[]).length&&want.indexOf('tonight')<0)want.push('tonight');
var nm=g('name')||decodeURIComponent((document.cookie.match(/(?:^|; )m2450n=([^;]*)/)||[])[1]||'');if(nm=='Local')nm='';
var cards=[];want.forEach(function(id){if(cards.length>=5||g('hide_'+id))return;var el=document.getElementById(id);if(!el)return;var h=el.querySelector('h2');
var items=Array.prototype.filter.call(el.querySelectorAll('li'),function(li){return !li.hidden&&li.textContent.trim().length>8}).slice(0,2);if(!items.length){var pp=el.querySelector('p:not(.src):not(.mute)');if(pp)items=[pp]}if(!items.length)return;
cards.push('<div class="fyc"><b>'+esc(h?h.textContent:id)+'</b><ul>'+items.map(function(x){return '<li>'+x.innerHTML+'</li>'}).join('')+'</ul><a href="#'+id+'" data-open="'+id+'" class="mute">More →</a></div>')});
var GIFTS=[[/fish|tackle|boat/i,'🎣 Local tackle shops','/open?c=fishing'],[/book|read/i,'📚 Local bookshops','/open?c=books'],[/garden|plant|grow/i,'🌱 Local nurseries','/open?c=garden'],[/music|sing|guitar|band|country/i,'🎸 Local music shops','/open?c=music'],[/sport|footy|golf|surf|run|cycl|tennis/i,'🏉 Local sports shops','/open?c=sports'],[/craft|knit|sew|paint|art/i,'🎨 Local craft & art shops','/open?c=crafts'],[/coffee|cafe/i,'☕ A local café voucher','/open?c=cafe'],[/beer|wine|whisky|rum/i,'🍷 Local bottle shops','/open?c=bottle'],[/dog|pet/i,'🐾 Local pet shops','/open?c=pets'],[/food|cook|eat|dinner/i,'🍽️ Dinner at a local spot','/open?c=food'],[/flower/i,'💐 Local florists','/open?c=florist']];
var now=new Date(),t0=new Date(now.getFullYear(),now.getMonth(),now.getDate()),DN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],bd=[];
j('people',[]).forEach(function(x){var d=new Date(t0.getFullYear(),x.m-1,x.d);if(d<t0)d.setFullYear(d.getFullYear()+1);var n=Math.round((d-t0)/864e5);if(n<=14)bd.push([n,x,d])});
bd.sort(function(a,b){return a[0]-b[0]}).slice(0,3).forEach(function(b){var x=b[1],n=b[0],when=n===0?'today 🎉':n===1?'tomorrow':n<7?'on '+DN[b[2].getDay()]:'in '+n+' days',gi=GIFTS.filter(function(g){return x.l&&g[0].test(x.l)}).slice(0,3);if(!gi.length)gi=[['💐 Local florists','/open?c=florist'],['🎁 Local gift shops','/open?c=gifts']].map(function(a){return [0,a[0],a[1]]});
cards.unshift('<div class="fyc fybd"><b>🎂 '+esc(x.n)+'’s birthday is '+when+'</b>'+(x.l?'<br><small class="mute">Likes '+esc(x.l)+'</small>':'')+'<ul>'+gi.map(function(g){return '<li><a href="'+g[2]+'">'+g[1]+'</a></li>'}).join('')+'</ul><small class="mute">Gift ideas from local businesses only. Buy local, it stays here.</small></div>')});
// Reminders: each one links deeper to what they need to get it done, phone numbers ready (What's open has call buttons).
var HELP=[[/vet|vacc|worm|flea|desex/i,'🐾 Local vets, with numbers','/open?c=vet'],[/doctor|gp\b|check.?up|script|prescri|blood test/i,'🩺 Doctors & clinics','/open?c=doctor'],[/script|prescri|medic|chemist|pharm/i,'💊 Pharmacies open now','/open?c=pharmacy'],[/car|service|rego|tyre|mechanic|brake/i,'🔧 Local mechanics','/open?c=mechanic'],[/fuel|petrol|diesel|fill up/i,'⛽ Cheapest fuel','/#fuel'],[/groom|pet shop|dog food|cat food/i,'🐾 Pet shops & groomers','/open?c=pets'],[/walk the dog|dog beach|dog park/i,'🐕 Dog beaches & parks','/open?c=dogs'],[/present|gift|birthday/i,'🎁 Local gift shops','/open?c=gifts'],[/flower/i,'💐 Local florists','/open?c=florist'],[/bin|rubbish|recycl/i,'🗑️ Bin night details','/home'],[/school|pick.?up|drop.?off/i,'🚸 School run & traffic','/school'],[/grocer|shopping|supermarket/i,'🛒 Supermarkets open now','/open?c=grocery'],[/hardware|fix|paint|tap|plumb/i,'🔨 Local hardware','/open?c=hardware'],[/garden|plant|mow/i,'🌱 Local nurseries','/open?c=garden'],[/bank|telstra|optus|qantas|centrelink|medicare|power bill|energy/i,'☎️ Hard-to-find numbers','/numbers'],[/council|rates/i,'🏛️ Council contacts','/#know'],[/cafe|coffee|lunch|dinner|book a table/i,'🍽️ Local places to eat','/open?c=food']];
var DN2=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],tdy=new Date(),t00=new Date(tdy.getFullYear(),tdy.getMonth(),tdy.getDate());
j('todo',[]).map(function(x){var d=new Date(x.d+'T00:00:00');return [Math.round((d-t00)/864e5),x,d]}).filter(function(r){return r[0]>=0&&r[0]<=7}).sort(function(a,b){return a[0]-b[0]}).slice(0,4).reverse().forEach(function(r){
var h=HELP.filter(function(g){return g[0].test(r[1].t)}).slice(0,2),when=r[0]===0?'Today':r[0]===1?'Tomorrow':DN2[r[2].getDay()]+' '+r[2].getDate();
cards.unshift('<div class="fyc fybd"><b>📅 '+when+': '+esc(r[1].t)+'</b>'+(h.length?'<ul>'+h.map(function(g){return '<li><a href="'+g[2]+'">'+g[1]+'</a></li>'}).join('')+'</ul>':'')+'</div>')});
var box=document.createElement('section');box.id='foryou';box.className='foryou';
box.innerHTML='<h2><span class="mavav" aria-hidden="true"></span>'+(nm?esc(nm)+', here’s':'Here’s')+' what Mav thinks you’ll want to know</h2>'+(cards.length?cards.join(''):'<p>Tell Mav what you’re into, or fill in <a href="/me" class="mavall">About you</a>, and this spot fills up each morning with what matters to you.</p>')+'<p class="mute fynote">Picked from today’s paper, based on what you’ve told Mav and what you read. Bookmark this spot. <a href="/me" class="mavall">Change</a></p>';
var td=document.getElementById('today');if(td&&td.parentNode===f)f.insertBefore(box,td.nextSibling);else f.insertBefore(box,f.firstChild);
if(location.hash=='#foryou')setTimeout(function(){box.scrollIntoView({block:'start'})},80);
// Phone app: opening the home-screen app goes straight to their own Daily Maverick card (weather, bins, birthdays, Mav's picks).
// One tap opens the full paper; the ☀️ button brings the card back. Desktop keeps the spot inline. /#mine opens it anywhere.
var phone=matchMedia('(max-width: 760px)').matches,app=matchMedia('(display-mode: standalone)').matches||navigator.standalone||/[?&]src=app/.test(location.search);
var td2=document.getElementById('today'),bin=td2&&td2.previousElementSibling&&/Bin night/.test(td2.previousElementSibling.textContent)?td2.previousElementSibling:null,home=[];
var card=document.createElement('div');card.id='mycard';card.hidden=true;card.setAttribute('role','dialog');card.setAttribute('aria-label','Your Daily Maverick');
var DD=new Date().toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'});
card.innerHTML='<div class="mch"><b><span class="mavav" aria-hidden="true"></span>'+(nm?esc(nm)+'’s':'Your')+' Daily Maverick</b><small class="mute">'+DD+'</small></div><div class="mcb"></div><div class="mcq"><a href="/school">🚸 School run & traffic</a><a href="#alerts" data-close="1">🚨 Alerts</a><a href="/me" class="mavall">⚙️ My settings</a></div><button type="button" class="mcx">📰 Open the full paper</button>';
document.body.appendChild(card);var cb=card.querySelector('.mcb');
var pill=document.createElement('button');pill.type='button';pill.id='mypill';pill.textContent='☀️ My Daily';pill.hidden=true;document.body.appendChild(pill);
function openCard(){if(!card.hidden)return;home=[td2,bin,box].filter(Boolean).map(function(el){return [el,el.parentNode,el.nextSibling]});
[td2,bin,box].filter(Boolean).forEach(function(el){cb.appendChild(el)});card.hidden=false;pill.hidden=true;document.documentElement.classList.add('cardon');try{sessionStorage.setItem('cardopen','1')}catch(_){}}
function closeCard(){if(card.hidden)return;home.slice().reverse().forEach(function(h){h[1].insertBefore(h[0],h[2]&&h[2].parentNode===h[1]?h[2]:null)});card.hidden=true;document.documentElement.classList.remove('cardon');pill.hidden=!(phone&&app);try{sessionStorage.removeItem('cardopen');sessionStorage.setItem('cardseen','1')}catch(_){}}
card.querySelector('.mcx').onclick=closeCard;card.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[data-close],a[data-open],a[href^="#"]');if(a){closeCard()}});pill.onclick=openCard;window.myDaily=openCard;
var st={};try{st={o:sessionStorage.getItem('cardopen'),s:sessionStorage.getItem('cardseen')}}catch(_){}
if(location.hash=='#mine'||st.o||(phone&&app&&!st.s))openCard();else pill.hidden=!(phone&&app)})();`;
