// ---- Kid Zone: games for kids 12 and under, with a grown-up's OK. ----
// Nothing is sent or stored on the server: no accounts, no chat, no ads, no names or ages collected.
// The grown-up's OK and game progress live only in this browser (localStorage).

export const KID_CSS = `.kzt{width:100%;border-collapse:collapse;font-size:.88rem}.kzt th,.kzt td{text-align:left;padding:6px;border-bottom:1px solid rgba(128,128,128,.25);vertical-align:top}.kpromise{margin:14px 0;padding:12px 14px;border:2px dashed currentColor;border-radius:14px;line-height:1.5}.kpromise ul{margin:6px 0 8px;padding-left:4px;list-style:none}.kz{max-width:640px}.kz .big{font-size:1.1rem}.kz .card2{border:1px solid var(--line);border-radius:14px;padding:14px;margin:12px 0}
.kz .row{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.kz .row button{border-radius:12px;padding:10px 14px}
.kz .alt{background:var(--soft);color:var(--fg)}.kz .promise li{margin:6px 0}.kz .bubble{background:var(--soft);border-radius:16px 16px 16px 4px;padding:12px 14px;margin:10px 0;max-width:90%}
.kz .from{font-size:.8rem;color:var(--mute)}.kz .fb{border-left:4px solid var(--gold);padding:8px 12px;margin:10px 0}.kz .ok{border-color:#2e9d5b}.kz .no{border-color:#d0453a}
.kz .bar{height:10px;background:var(--soft);border-radius:9px;overflow:hidden;margin:3px 0 10px}.kz .bar i{display:block;height:100%;background:var(--gold)}
.kz .pet{font-size:5rem;text-align:center;line-height:1.2;margin:6px 0}.kz .pts{font-weight:700}.kz .mute2{color:var(--mute);font-size:.85rem}
.kz input[type=text]{width:100%;max-width:280px;font-size:1rem;padding:8px;border:1px solid var(--line);border-radius:10px}`;

// Shared gate. Shows the explainer and the grown-up's OK until it's given on this device.
const GATE_JS = `function kzLog(g,w,d){try{var L=JSON.parse(localStorage.getItem('kz_log')||'[]');L.push({t:Date.now(),g:g,w:w,d:d||''});if(L.length>1500)L=L.slice(-1500);localStorage.setItem('kz_log',JSON.stringify(L))}catch(e){}}
function kzGate(start){var g=document.getElementById('kzgate'),m=document.getElementById('kzmain'),KZG=(document.querySelector('.kz h1')||{}).textContent||'Kid Zone',t0=0;
function spent(){if(!t0)return;var sec=Math.round((Date.now()-t0)/1000);t0=0;if(sec>=5)kzLog(KZG,'Time spent',sec<60?sec+' sec':Math.round(sec/60)+' min')}
document.addEventListener('visibilitychange',function(){if(document.hidden)spent();else if(!m.hidden)t0=Date.now()});addEventListener('pagehide',spent);
var ok=false;try{ok=localStorage.getItem('kz_ok')==='1'}catch(e){}
var LIM={mins:20,used:0,day:''};function dk(){return 'kz_used_'+(LIM.day||new Date().toISOString().slice(0,10))}
function usedNow(){var l=0;try{l=+localStorage.getItem(dk())||0}catch(e){}return Math.max(l,LIM.used)}
function lockOut(){spent();clearInterval(window.kzT);var b=document.getElementById('kzbar');if(b)b.remove();m.hidden=true;g.hidden=false;kzLog(KZG,'Daily time used up');
g.innerHTML='<div class="card2"><h2>⏰ That&rsquo;s Kid Zone for today!</h2><p>You&rsquo;ve used all '+LIM.mins+' minutes. Time to get outside, read a book or help out at home.</p><p><b>Come back tomorrow</b>: your pet and your points will be waiting.</p></div>'}
function bar(){var left=Math.max(0,LIM.mins*60-usedNow()),mm=Math.ceil(left/60),b=document.getElementById('kzbar');if(!b){b=document.createElement('div');b.id='kzbar';b.setAttribute('role','status');b.style.cssText='position:sticky;top:0;z-index:5;background:#fff7d6;color:#3a2e00;border-radius:10px;padding:8px 12px;margin:6px 0 10px;font-weight:bold;text-align:center';m.parentNode.insertBefore(b,m)}
b.textContent=left<=0?'⏰ Time is up for today':mm<=2?'⏰ Nearly time! '+mm+' minute'+(mm>1?'s':'')+' left today':'⏱️ Stay focused! You have '+mm+' minutes left today';if(left<=0)lockOut()}
function tick(){if(document.hidden||m.hidden)return;var u=usedNow()+15;try{localStorage.setItem(dk(),String(u))}catch(e){}LIM.used=u;fetch('/api/kz',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({tick:15})}).catch(function(){});bar()}
function show(){if(usedNow()>=LIM.mins*60)return lockOut();g.hidden=true;m.hidden=false;t0=Date.now();kzLog(KZG,'Opened');bar();clearInterval(window.kzT);window.kzT=setInterval(tick,15000);start()}
function word(){g.innerHTML='<div class="card2"><h2>🔐 Secret word, please</h2><p>Your grown-up set a secret word for Kid Zone.</p><input type="password" id="kzw" maxlength="40" autocomplete="off" placeholder="Type the secret word"><div class="row"><button type="button" id="kzwgo">Let me in</button></div><p id="kzwm" class="mute2"></p></div>';
var i=document.getElementById('kzw'),go=document.getElementById('kzwgo');function tryIt(){fetch('/api/kz',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({word:i.value})}).then(function(r){return r.json()}).then(function(j){kzLog('Kid Zone',j.ok?'Secret word right':'Secret word wrong');if(j.ok)return show();i.value='';document.getElementById('kzwm').textContent=j.msg||'Not quite.'})}
go.onclick=tryIt;i.onkeydown=function(e){if(e.key==='Enter')tryIt()}}
fetch('/api/kz').then(function(r){return r.json()}).then(function(j){if(j.mins)LIM={mins:j.mins,used:j.used||0,day:j.day||''};if(j.word&&!j.ok)return word();if(ok)return show();ask()}).catch(function(){ok?show():ask()});
function ask(){
g.innerHTML='<div class="card2"><h2>👋 Kids, grab a grown-up</h2><p>Kid Zone is for kids <b>12 and under</b>, and only with a parent or carer&rsquo;s OK.</p><div class="row"><button type="button" id="kzkid">I&rsquo;m 12 or under, my grown-up is here</button><button type="button" class="alt" id="kzteen">I&rsquo;m 13 or older</button></div></div>';
document.getElementById('kzteen').onclick=function(){kzLog('Kid Zone','Tapped "I\\u2019m 13 or older"');g.innerHTML='<div class="card2"><h2>🚫 Teen check</h2><p>Quick, name two trending memes.</p><input type="text" id="kzmeme" placeholder="Type them here" maxlength="60"><div class="row"><button type="button" id="kzmemego">Submit</button></div></div>';
document.getElementById('kzmemego').onclick=function(){g.innerHTML='<div class="card2"><h2>😎 Too cool for Kid Zone</h2><p>If you know the memes, you&rsquo;re too old for this bit. Kid Zone is for 12 and under. Try the <a href="/crossword">crossword</a> instead.</p><p class="mute2">Actually a parent? <a href="#" id="kzpar">Grown-ups, tap here</a>.</p></div>';document.getElementById('kzpar').onclick=function(e){e.preventDefault();parent()}}};
document.getElementById('kzkid').onclick=parent;}
function parent(){g.innerHTML='<div class="card2"><h2>👨‍👩‍👧 For the grown-up</h2><p>Please read this before you say yes.</p><ul class="promise"><li>🧒 <b>Made for kids 12 and under.</b> Simple games about online safety and looking after a pet.</li><li>🔒 <b>Nothing leaves this device.</b> No sign-up, no names, no ages, no photos. Progress is saved only in this browser.</li><li>💬 <b>No chat and no messages.</b> Nobody can contact your child here.</li><li>🚫 <b>No ads, no buying, no links out</b> except official help services.</li><li>⏱️ <b>A few minutes a day.</b> The pet game is built for a quick daily check-in, not hours on a screen.</li></ul><p><b>If you&rsquo;re not comfortable with your child using Kid Zone, that&rsquo;s completely fine.</b> Just don&rsquo;t tap yes, and it stays locked on this device.</p><label><input type="checkbox" id="kzc"> I&rsquo;m this child&rsquo;s parent or carer, and I&rsquo;m OK with them using Kid Zone.</label><div class="row"><button type="button" id="kzyes" disabled>Yes, let them in</button><a class="mute2" href="/">No thanks, back to the news</a></div><p class="mute2">This is a promise, not an ID check. You can lock it again any time from the bottom of each Kid Zone page.</p></div>';
var c=document.getElementById('kzc'),y=document.getElementById('kzyes');c.onchange=function(){y.disabled=!c.checked};
y.onclick=function(){try{localStorage.setItem('kz_ok','1')}catch(e){}kzLog('Kid Zone','Grown-up said OK');show()}}}
function kzLock(){try{localStorage.removeItem('kz_ok')}catch(e){}kzLog('Kid Zone','Locked by a grown-up');location.reload()}`;

const shell = (back, title, intro, main, js) => `<div class="kz"><p class="mute"><a href="/kids">‹ Kid Zone</a> · <a href="${back}">News</a></p><h1>${title}</h1><p class="big">${intro}</p>
<div id="kzgate"></div><div id="kzmain" hidden>${main}</div>
<p class="mute2">Kid Zone is for kids 12 and under, with a grown-up&rsquo;s OK. Nothing is collected. Grown-ups: <a href="/kids/log">see what they did</a> · <a href="#" onclick="kzLock();return false">lock Kid Zone on this device</a>.</p></div>
<script>${GATE_JS}
${js}</script>`;

const teach = items => `<div class="card2"><b>👨‍👩‍👧 For grown-ups: what this teaches</b><ul class="promise">${items.map(x => `<li>${x}</li>`).join("")}</ul><p class="mute2">Part of the <a href="/kids/certificate">🎓 Certified Mini Maverick</a> course.</p></div>`;
// Mini Maverick certificate: three goals, checked from what's saved on this device. Once a goal is met it stays met.
const CERT_JS = `function kzCert(){var c={};try{c=JSON.parse(localStorage.getItem('kz_cert')||'{}')}catch(e){}
try{if((+localStorage.getItem('kz_safe_best')||0)>=8)c.safe=1}catch(e){}
try{var rb=JSON.parse(localStorage.getItem('kz_rb')||'{}');if((rb.lvl||1)>=4)c.robot=1}catch(e){}
try{var pt=JSON.parse(localStorage.getItem('kz_pet')||'null');if(pt&&pt.streak>=3)c.pet=1}catch(e){}
try{localStorage.setItem('kz_cert',JSON.stringify(c))}catch(e){}return c}
var KZG=[['safe','🛡️','Safe or Sus?','Score 8 or more out of 10','/kids/safe'],['robot','🤖','Robot Builder','Reach level 4','/kids/robot'],['pet','🐾','Pet Pal','Care for your pet 3 days in a row','/kids/pet']];
function kzGoals(c){return '<ul class="promise">'+KZG.map(function(g){return '<li>'+(c[g[0]]?'✅':'⬜')+' '+g[1]+' <a href="'+g[4]+'">'+g[2]+'</a>: '+g[3]+'</li>'}).join('')+'</ul>'}`;
const COURSE = "A free training course designed by Maverick Digital to keep our community safer online.";
// Grown-ups' view of everything kids did in Kid Zone on this device. Read straight from the browser, never sent to us.
export const kidsLog = back => `<div class="kz"><p class="mute"><a href="/kids">‹ Kid Zone</a> · <a href="${back}">News</a></p><h1>👀 What the kids did</h1>
<p class="big">Every tap in Kid Zone on this device, and how they're going. It stays on this device. We never see it.</p><div id="kzl"></div></div>
<script>(function(){var L=[];try{L=JSON.parse(localStorage.getItem('kz_log')||'[]')}catch(e){}var el=document.getElementById('kzl');
function esc(x){return String(x).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
if(!L.length){el.innerHTML='<div class="card2"><p>Nothing yet. Once the kids play, every visit, answer and score shows up here.</p></div>';return}
var wk=Date.now()-7*864e5,mins=0;L.forEach(function(x){if(x.t>wk&&x.w==='Time spent')mins+=/sec/.test(x.d)?parseInt(x.d)/60:parseInt(x.d)});
var sc=L.filter(function(x){return x.g==='Safe or Sus?'&&x.w==='Score'}).map(function(x){return parseInt(x.d)}),rb=L.filter(function(x){return x.g==='Robot Builder'&&x.w==='Built it'}),pet=L.filter(function(x){return x.g==='Pet Pal'&&x.w!=='New pet'});
var trend='';if(sc.length>1){var a=sc.slice(0,Math.ceil(sc.length/2)),b=sc.slice(Math.ceil(sc.length/2)),av=function(z){return z.reduce(function(p,q){return p+q},0)/z.length};var d=av(b)-av(a);trend=d>0.4?' · 📈 Improving':d<-0.4?' · 📉 Dipping, maybe play it together':' · ➡️ Steady'}
var lvl=rb.length?Math.max.apply(null,rb.map(function(x){return +(x.d.match(/Level (\\d+)/)||[0,1])[1]})):0;
var cards='<div class="card2"><h2>This week</h2><p>⏱️ <b>'+Math.round(mins)+' min</b> in Kid Zone</p>'
+'<p>🛡️ <b>Safe or Sus?</b> '+(sc.length?'Played '+sc.length+' time'+(sc.length>1?'s':'')+'. Scores: '+sc.slice(-8).join(', ')+' (out of 10)'+trend:'Not played yet')+'</p>'
+'<p>🤖 <b>Robot Builder</b> '+(rb.length?rb.length+' built · up to level '+lvl:'Not played yet')+'</p>'
+'<p>🐾 <b>Pet Pal</b> '+(pet.length?pet.length+' care job'+(pet.length>1?'s':'')+' · '+esc((pet[pet.length-1].d.match(/\\d+-day streak/)||[''])[0]):'Not played yet')+'</p>'
+'<p class="mute2">Seeing it go up? Tell them! A bit of encouragement goes a long way.</p></div>';
var rows=L.slice(-300).reverse().map(function(x){var d=new Date(x.t);return '<tr><td>'+d.toLocaleDateString('en-AU',{day:'numeric',month:'short'})+' '+d.toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'})+'</td><td>'+esc(x.g)+'</td><td>'+esc(x.w)+(x.d?' <span class="mute2">'+esc(x.d)+'</span>':'')+'</td></tr>'}).join('');
el.innerHTML=cards+'<h2>Every touch point</h2><div style="overflow-x:auto"><table class="kzt"><thead><tr><th>When</th><th>Game</th><th>What happened</th></tr></thead><tbody>'+rows+'</tbody></table></div><p class="mute2">Showing the latest '+Math.min(L.length,300)+' of '+L.length+'. Clear it from the <a href="/kids/parent">grown-ups page</a>.</p>'})()</script>`;

export const kidsHub = back => shell(back, "🧒 Kid Zone", "Fun games for kids 12 and under. Learn something, look after something, come back tomorrow.",
`<a class="card" href="/kids/safe">🛡️ <b>Safe or Sus?</b> Someone sends you a message. What do you do? →</a>
<a class="card" href="/kids/robot">🤖 <b>Robot Builder</b> Tell the robot what to build in as few goes as you can. Learn how AI thinks →</a>
<a class="card" href="/kids/pet">🐾 <b>Pet Pal</b> Build your dream pet, then feed it, wash it, walk it and get it to bed on time →</a>
<div class="card2"><b>🎓 Become a Certified Mini Maverick</b><p>Finish all three games to earn a certificate you can print: <b>ready for the digital future</b>.</p><p class="mute2">${COURSE}</p><div id="kzgoals"></div><p><a href="/kids/certificate">See your certificate →</a></p></div>
<div class="kpromise"><b>Every game in the Kid Zone must:</b><ul><li>🛡️ teach online safety</li><li>🚀 set kids up for a digital future</li><li>🎉 be fun</li></ul>The grown-ups check every game is safe and parent-friendly. Then our Quality Control Officer (a real kid) has to give it the <b>⭐ Fun Guarantee</b>. No guarantee, no game.</div>
<p class="mute2">🔐 Grown-ups: <a href="/kids/parent">set a secret word</a> so kids need your OK to get in, and <a href="/kids/log">see everything they did</a>.</p>
<p class="mute2">More games are on the way. Grown-ups can suggest one on the <a href="/feedback">ideas page</a>.</p>`, `${CERT_JS}
kzGate(function(){document.getElementById('kzgoals').innerHTML=kzGoals(kzCert())})`);

// Safe or Sus? Ten everyday message situations. Pattern-level, age-appropriate.
const QS = [
  ["Unknown number", "Hi! You WON a free iPad 🎉 Click this link to claim it now!", ["Click it fast before it's gone", "Ignore it and show a grown-up", "Reply asking if it's real"], 1, "If it's a prize you never entered, it's a trick. Don't click. Show a grown-up and delete it."],
  ["Someone in a game", "You're really good! What school do you go to?", ["Tell them, they seem nice", "Don't share it, and tell a grown-up", "Give them a different school"], 1, "Your school, address and full name are private. Real friends already know. Keep them to yourself."],
  ["New friend online", "Send me a photo of you? Don't tell your mum and dad, it's our secret.", ["Send it, it's just one photo", "Say no, block them and tell a grown-up straight away", "Keep the secret"], 1, "A safe person will never ask you to keep secrets from your family. That's your cue to stop, block and tell."],
  ["Your friend Mia's account", "Hey can you send me your password? I need to check something", ["Send it, it's Mia", "Say no, and check with Mia in person", "Send half of it"], 1, "Passwords are just for you and your grown-ups, even with best friends. Accounts can be taken over by someone else."],
  ["Someone in class", "Nobody likes you. Everyone thinks you're weird.", ["Send something mean back", "Don't reply, screenshot it and tell a grown-up", "Keep it to yourself"], 1, "Mean messages are never your fault. Don't reply. Save it and tell a grown-up you trust."],
  ["A game pop-up", "Type in Mum's card number to get 1,000 free coins!", ["Grab Mum's card", "Close it and ask a grown-up", "Type in a made-up number"], 1, "Anything asking for card numbers or money needs a grown-up, every time."],
  ["Grandma", "Can't wait to see you Sunday! Love you xx", ["Reply with a love heart", "Block her", "Report it"], 0, "Not every message is a trick! Messages from people you know in real life, saying normal things, are fine."],
  ["Unknown number", "Your parcel is waiting. Pay $2 here to deliver it.", ["Pay, it's only $2", "Don't click, show a grown-up", "Reply STOP"], 1, "Fake delivery messages are really common. Grown-ups get tricked by these too, so show them."],
  ["Someone you met in a game", "Let's meet at the park after school. Just you, don't bring anyone.", ["Go, they seem fun", "Never meet, and tell a grown-up now", "Bring one friend"], 1, "Never meet someone from online. If they ask you to come alone, tell a grown-up straight away."],
  ["A video app", "Watch this video, then share it with 10 friends or something bad will happen!", ["Share it to be safe", "Ignore it, nothing bad will happen", "Send it to just one friend"], 1, "Chain messages are fake. Nothing bad happens if you don't share. Just ignore it."]
];
export const safePage = back => shell(back, "🛡️ Safe or Sus?", "Someone sends you a message. What would you do? Ten quick ones.",
`<div id="sq"></div>${teach(["🚩 Spotting scams: fake prizes, fake parcels, chain messages", "🔒 Keeping private things private: school, address, passwords, photos", "🗣️ Stop. Block. Tell: that it&rsquo;s always OK to tell a grown-up, and they won&rsquo;t be in trouble", "🤝 That some messages are fine, so kids learn judgement, not fear"])}<div class="card2"><b>The golden rule: Stop. Block. Tell.</b><br>If anything online makes you feel worried, scared or yucky, stop, block them, and tell a grown-up you trust. You won&rsquo;t be in trouble.</div>
<p class="mute2">Kids can call Kids Helpline any time on <a href="tel:1800551800">1800 55 1800</a>. Grown-ups: the <a href="https://www.esafety.gov.au/parents" rel="noopener">eSafety Commissioner</a> has free guides.</p>`,
`var Q=${JSON.stringify(QS)};
kzGate(function(){var el=document.getElementById('sq'),o=Q.map(function(_,i){return i}).sort(function(){return Math.random()-.5}),i=0,s=0;
function esc(x){return String(x).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
function q(){if(i>=o.length)return end();var x=Q[o[i]];el.innerHTML='<p class="mute2">Message '+(i+1)+' of '+o.length+' · Score '+s+'</p><div class="bubble"><div class="from">'+esc(x[0])+'</div>'+esc(x[1])+'</div><div class="row">'+x[2].map(function(a,k){return '<button type="button" class="alt" data-k="'+k+'">'+esc(a)+'</button>'}).join('')+'</div>';
el.querySelectorAll('button').forEach(function(b){b.onclick=function(){var r=+b.dataset.k===x[3];if(r)s++;kzLog('Safe or Sus?',r?'Right answer':'Wrong answer',x[0]);el.insertAdjacentHTML('beforeend','<div class="fb '+(r?'ok':'no')+'">'+(r?'✅ <b>Smart move!</b> ':'🤔 <b>Not quite.</b> ')+esc(x[4])+'</div><div class="row"><button type="button" id="nx">Next</button></div>');el.querySelectorAll('[data-k]').forEach(function(z){z.disabled=true});document.getElementById('nx').onclick=function(){i++;q()}}})}
function end(){var best=0;try{best=+localStorage.getItem('kz_safe_best')||0;if(s>best)localStorage.setItem('kz_safe_best',s)}catch(e){}
var badge=s===10?'🏆 Safety Superstar':s>=8?'🛡️ Safety Shield':s>=5?'👍 Getting there':'🌱 Keep learning';kzLog('Safe or Sus?','Score',s+'/10 · '+badge);
el.innerHTML='<div class="card2"><h2>'+badge+'</h2><p class="big">You got <b>'+s+' out of 10</b>.</p><p>Best score on this device: '+Math.max(s,best)+'</p><div class="row"><button type="button" id="again">Play again</button><a href="/kids/pet">Visit your Pet Pal 🐾</a></div></div>';document.getElementById('again').onclick=function(){i=0;s=0;o.sort(function(){return Math.random()-.5});q()}}
q()})`);

// Pet Pal: build a pet, care for it daily. Needs drop over real time; the pet never dies, it just gets sad until you help.
export const petPage = back => shell(back, "🐾 Pet Pal", "Build your dream pet. Feed it, wash it, play with it, walk it, and get it to bed on time. Come back every day!",
`<div id="pp"></div>${teach(["📅 Routine and responsibility: small jobs, every day", "⏰ Bedtime habits: the pet goes to bed on time, and so do they", "💛 Care and empathy: noticing what someone else needs", "📵 Healthy screen time: a quick daily check-in, not hours of play"])}`,
`kzGate(function(){var el=document.getElementById('pp'),K='kz_pet',P=null;
var A=[['🐶','Puppy'],['🐱','Kitten'],['🐰','Bunny'],['🐹','Hamster'],['🐴','Pony'],['🐢','Turtle'],['🦜','Parrot'],['🐠','Fish']];
var COL=['Golden','Black','White','Brown','Spotty','Rainbow'];
function save(){try{localStorage.setItem(K,JSON.stringify(P))}catch(e){}}
try{P=JSON.parse(localStorage.getItem(K))}catch(e){}
function esc(x){return String(x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function today(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function build(){var pick=0,col=0;el.innerHTML='<div class="card2"><h2>1. Pick your pet</h2><div class="row" id="pa">'+A.map(function(a,k){return '<button type="button" class="alt" data-k="'+k+'">'+a[0]+' '+a[1]+'</button>'}).join('')+'</div><h2>2. Pick a colour</h2><div class="row" id="pc">'+COL.map(function(c,k){return '<button type="button" class="alt" data-k="'+k+'">'+c+'</button>'}).join('')+'</div><h2>3. Give it a name</h2><input type="text" id="pn" maxlength="12" placeholder="Like Biscuit or Rex"><p class="mute2">Pick a pet name, not your own name.</p><div class="row"><button type="button" id="pgo">Bring them home 🏡</button></div></div>';
function sel(id,cb){el.querySelectorAll('#'+id+' button').forEach(function(b){b.onclick=function(){el.querySelectorAll('#'+id+' button').forEach(function(z){z.classList.add('alt')});b.classList.remove('alt');cb(+b.dataset.k)}})}
sel('pa',function(k){pick=k});sel('pc',function(k){col=k});
document.getElementById('pgo').onclick=function(){var n=document.getElementById('pn').value.replace(/[^A-Za-z \\-']/g,'').trim().slice(0,12)||A[pick][1];var now=Date.now();
kzLog('Pet Pal','New pet',n);P={a:pick,c:col,n:n,food:80,clean:80,fun:80,walk:80,sleep:80,t:now,pts:0,streak:1,last:today(),born:today(),done:{}};save();care()}}
function tick(){var h=(Date.now()-P.t)/36e5;['food','clean','fun','walk','sleep'].forEach(function(k){var rate={food:4,clean:2,fun:3,walk:3,sleep:2.5}[k];P[k]=Math.max(0,P[k]-rate*h)});P.t=Date.now();
var d=today();if(P.last!==d){var y=new Date();y.setDate(y.getDate()-1);var yd=y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate();P.streak=P.last===yd?P.streak+1:1;P.last=d;P.done={};P.pts+=5}save()}
var ACT={food:['🍖','Feed',35,'Yum! Full tummy.'],clean:['🛁','Wash',40,'Squeaky clean!'],fun:['🎾','Play',30,'Best day ever!'],walk:['🦮','Walk',40,'What a great walk!'],sleep:['🌙','Bedtime',60,'Sweet dreams…']};
function mood(){var m=Math.min(P.food,P.clean,P.fun,P.walk,P.sleep);return m>60?['😄','Happy as!']:m>30?['🙂','Doing OK']:['🥺','Needs you!']}
function care(msg){tick();var a=A[P.a],mo=mood(),hr=new Date().getHours(),late=hr>=20||hr<6;
var bars=Object.keys(ACT).map(function(k){var lab={food:'Tummy',clean:'Clean',fun:'Fun',walk:'Exercise',sleep:'Rested'}[k];return '<div>'+ACT[k][0]+' '+lab+' <span class="mute2">'+Math.round(P[k])+'%</span><div class="bar"><i style="width:'+Math.round(P[k])+'%"></i></div></div>'}).join('');
var badges=[[3,'🥉 3-day carer'],[7,'🥈 1-week carer'],[30,'🥇 Pet pro (30 days)']].filter(function(b){return P.streak>=b[0]}).map(function(b){return b[1]}).join(' · ');
el.innerHTML='<div class="card2"><div class="pet">'+a[0]+'</div><h2 style="text-align:center">'+esc(P.n)+' '+mo[0]+'</h2><p style="text-align:center" class="mute2">'+COL[P.c]+' '+a[1].toLowerCase()+' · '+mo[1]+'</p>'
+(msg?'<div class="fb ok">'+msg+'</div>':'')+(late&&P.sleep<90?'<div class="fb">🌙 It&rsquo;s getting late. Time to get '+esc(P.n)+' to bed! Bedtime now earns double points.</div>':'')
+bars+'<div class="row">'+Object.keys(ACT).map(function(k){var used=(P.done[k]||0)>=3;return '<button type="button" data-a="'+k+'"'+(used?' disabled':'')+'>'+ACT[k][0]+' '+ACT[k][1]+'</button>'}).join('')+'</div>'
+'<p><span class="pts">⭐ '+P.pts+' points</span> · 🔥 '+P.streak+'-day streak'+(badges?'<br>'+badges:'')+'</p><p class="mute2">Each care job can be done 3 times a day. Come back tomorrow to keep your streak going!</p>'
+'<p class="mute2"><a href="#" id="pnew">Start again with a new pet</a></p></div>';
el.querySelectorAll('[data-a]').forEach(function(b){b.onclick=function(){var k=b.dataset.a,x=ACT[k],gain=(k==='sleep'&&late)?20:10;if(P[k]>=95){care(esc(P.n)+' doesn&rsquo;t need that right now. Try something else!');return}
P[k]=Math.min(100,P[k]+x[2]);P.done[k]=(P.done[k]||0)+1;P.pts+=gain;save();kzLog('Pet Pal',x[1],P.n+' · '+P.streak+'-day streak'+(gain>10?' · bedtime on time':''));care(x[0]+' '+x[3]+' +'+gain+' points')}});
document.getElementById('pnew').onclick=function(e){e.preventDefault();if(confirm('Start again? Your points and streak will reset.')){try{localStorage.removeItem(K)}catch(_){}P=null;build()}}}
if(P)care();else build()})`);

// Robot Builder: a pretend AI (no real AI, nothing sent anywhere). Kids describe a picture; the robot only builds
// what they actually said and guesses the rest. Teaches clear, specific prompts. Fewer goes allowed as they level up.
const RB = {
  animal: [["dragon", "🐉"], ["cat", "🐱"], ["dog", "🐶"], ["unicorn", "🦄"], ["shark", "🦈"], ["monkey", "🐒"], ["penguin", "🐧"], ["robot", "🤖"], ["frog", "🐸"], ["owl", "🦉"]],
  colour: [["red", "🔴"], ["blue", "🔵"], ["green", "🟢"], ["purple", "🟣"], ["yellow", "🟡"], ["pink", "🩷"], ["orange", "🟠"], ["rainbow", "🌈"]],
  wearing: [["hat", "🎩"], ["crown", "👑"], ["sunglasses", "🕶️"], ["scarf", "🧣"], ["bow", "🎀"]],
  doing: [["eating pizza", "🍕", "pizza"], ["eating ice cream", "🍦", "ice cream|icecream"], ["playing guitar", "🎸", "guitar"], ["reading a book", "📚", "book|read"], ["surfing", "🏄", "surf"], ["dancing", "💃", "danc"], ["skateboarding", "🛹", "skate"], ["sleeping", "💤", "sleep|nap"]],
  place: [["on the moon", "🌙", "moon"], ["at the beach", "🏖️", "beach"], ["in the jungle", "🌴", "jungle|rainforest"], ["in space", "🚀", "space"], ["at a castle", "🏰", "castle"], ["in the city", "🏙️", "city|town"], ["in the snow", "❄️", "snow"], ["under the sea", "🌊", "sea|ocean|underwater"]]
};
export const robotPage = back => shell(back, "🤖 Robot Builder", "Tell the robot what to build. It only makes what you say, and guesses the rest! Can you get it right in as few goes as possible?",
`<div id="rb"></div>${teach(["🤖 How AI really works: it does what you say and guesses the rest", "✍️ Clear instructions: say the colour, the thing, the place, one by one", "🎯 Doing it in fewer goes: thinking before typing, the key skill for using AI well", "🧠 That AI can be wrong, so you always check what it made"])}<div class="card2"><b>💡 How AI really works</b><br>AI tools are like this robot: they do exactly what you ask, and fill in the gaps with guesses. The clearer you are, the better the result. This robot is pretend and runs on your device, so nothing you type goes anywhere.</div>`,
`var RB=${JSON.stringify(RB)},SL=['colour','animal','wearing','doing','place'];
kzGate(function(){var el=document.getElementById('rb'),S={lvl:1,pts:0};try{S=JSON.parse(localStorage.getItem('kz_rb'))||S}catch(e){}
function save(){try{localStorage.setItem('kz_rb',JSON.stringify(S))}catch(e){}}
function esc(x){return String(x).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
function slots(){return S.lvl<=2?['colour','animal','place']:S.lvl<=4?['colour','animal','wearing','place']:SL}
function goes(){return S.lvl<=3?3:S.lvl<=6?2:1}
function rnd(a){return a[Math.floor(Math.random()*a.length)]}
function key(s,v){return v[2]?v[2]:v[0]}
function words(o,ss){return (o.colour?o.colour[0]+' ':'')+(o.animal?o.animal[0]:'')+(o.wearing?' wearing a '+o.wearing[0]:'')+(o.doing?' '+o.doing[0]:'')+(o.place?' '+o.place[0]:'')}
function pic(o){return '<div class="pet" style="font-size:3rem">'+SL.filter(function(s){return o[s]}).map(function(s){return o[s][1]}).join(' ')+'</div>'}
var T,left,tries;
function newRound(){var ss=slots();T={};ss.forEach(function(s){T[s]=rnd(RB[s])});left=goes();tries=0;draw()}
function draw(res){var ss=slots();el.innerHTML='<div class="card2"><p class="mute2">Level '+S.lvl+' · ⭐ '+S.pts+' points · '+left+' go'+(left==1?'':'es')+' left</p><h2>Build this:</h2>'+pic(T)
+'<p class="mute2">Hint: say the '+ss.map(function(s){return {colour:'colour',animal:'animal',wearing:'what it wears',doing:'what it&rsquo;s doing',place:'where it is'}[s]}).join(', ')+'.</p>'
+(res||'')+'<input type="text" id="rp" maxlength="120" placeholder="Make a blue cat on the moon…" style="max-width:100%"><div class="row"><button type="button" id="rgo">🤖 Build it!</button></div></div>';
var go=document.getElementById('rgo'),inp=document.getElementById('rp');inp.onkeydown=function(e){if(e.key==='Enter')go.click()};go.onclick=function(){build(inp.value)}}
function build(txt){var t=' '+txt.toLowerCase()+' ',ss=slots(),o={},miss=[];tries++;left--;
ss.forEach(function(s){var hit=RB[s].filter(function(v){return new RegExp('\\\\b('+key(s,v)+')').test(t)})[0];if(hit)o[s]=hit;else{o[s]=rnd(RB[s]);miss.push(s)}});
var ok=ss.every(function(s){return o[s][0]===T[s][0]});
var res='<div class="fb '+(ok?'ok':'no')+'"><b>The robot made:</b> '+esc(words(o))+pic(o)
+ss.map(function(s){var g=o[s][0]===T[s][0];return (g?'✅ ':'❌ ')+{colour:'Colour',animal:'Animal',wearing:'Wearing',doing:'Doing',place:'Place'}[s]+(g?'':miss.indexOf(s)>=0?': you didn&rsquo;t say, so the robot guessed':': not quite')}).join('<br>')+'</div>';
if(ok){var gain=10*(left+1);S.pts+=gain;var up=tries===1;kzLog('Robot Builder','Built it','Level '+S.lvl+' in '+tries+' go'+(tries>1?'es':'')+(up?' · levelled up to '+(S.lvl+1):''));if(up)S.lvl++;save();
el.innerHTML='<div class="card2"><h2>🎉 Nailed it'+(tries===1?' first go!':' in '+tries+' goes!')+'</h2>'+res+'<p>+'+gain+' points'+(up?' · 🆙 Level '+S.lvl+'! You get fewer goes now, so be extra clear.':' · Get it in one go to level up.')+'</p><div class="row"><button type="button" id="rn">Next picture</button></div></div>';document.getElementById('rn').onclick=newRound;return}
if(left<=0){kzLog('Robot Builder','Out of goes','Level '+S.lvl);el.innerHTML='<div class="card2"><h2>🤖 Out of goes!</h2>'+res+'<p>The answer was: <b>'+esc(words(T))+'</b>. Tip: say every part, one by one.</p><div class="row"><button type="button" id="rn">Try a new one</button></div></div>';document.getElementById('rn').onclick=newRound;return}
draw(res)}
newRound()})`);

export const certPage = (back, code) => shell(back, "🎓 Certified Mini Maverick", "Finish all three Kid Zone games to earn your certificate.",
`<div id="cert"></div><style>@media print{header,.mute,.mute2,.noprint,#kzgate,footer,nav{display:none!important}.certbox{border:6px double #12233f!important;margin:0!important}}
.certbox{border:4px double var(--gold);border-radius:14px;padding:26px 18px;text-align:center;margin:14px 0}.certbox h2{font-size:1.7rem;margin:6px 0}.certbox .nm{font-size:2rem;font-weight:800;margin:10px 0;border-bottom:2px solid var(--line);display:inline-block;min-width:60%}</style>`,
`${CERT_JS}
kzGate(function(){var c=kzCert(),el=document.getElementById('cert'),all=KZG.every(function(g){return c[g[0]]});
if(!all){el.innerHTML='<div class="card2"><p class="big">Nearly there! Tick off all three:</p>'+kzGoals(c)+'<p class="mute2">${COURSE}</p></div>';return}
var d=new Date().toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'});
el.innerHTML='<div class="noprint card2"><label>Your first name, for the certificate (it&rsquo;s not saved anywhere):<br><input type="text" id="cn" maxlength="20" placeholder="First name"></label><div class="row"><button type="button" id="cp">🖨️ Print or save</button></div></div>'
+'<div class="certbox"><div style="font-size:2.5rem">🎓</div><p>This certifies that</p><div class="nm" id="cnm">&nbsp;</div><h2>Certified Mini Maverick</h2><p class="big"><b>Ready for the digital future</b></p>'
+'<p>Spots online tricks and keeps private things private · Gives AI clear instructions · Looks after someone every day</p>'
+'<p class="mute2" style="display:block">Awarded '+d+' · Your ${code} Maverick Kid Zone</p><p style="font-size:.85rem">${COURSE}</p></div>';
var cn=document.getElementById('cn');cn.oninput=function(){document.getElementById('cnm').textContent=cn.value.replace(/[^A-Za-z \\-']/g,'')||'\\u00a0'};
document.getElementById('cp').onclick=function(){if(typeof kzLog==='function')kzLog('cert','printed');window.print()}})`);
