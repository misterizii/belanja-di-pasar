// Mode "Ikut Ibu ke Pasar" (Kelas 3): anak menemani Ibu belanja dan membantu menghitung barang di 6 kios.
// Kegiatan menghitung (html + act) dipakai bersama oleh mode sendiri (di dialog) dan mode balapan (di panel).
const Story=(()=>{
 const D=StoryData,MAX_LIVES=5,stallOf=id=>D.STALLS.find(s=>s.id===id);
 const wares={telur:'🥚🥚🥚',mainan:'🔮🪀🧸',buah:'🍊🍌🍊',kerupuk:'<i class="sv-krupuk"></i><i class="sv-krupuk"></i>🥫',perabot:'🍽️🥣🫖',jajan:'🍰🧁🍡'};
 const buys=(t,id)=>({telur:`Ibu membeli ${t.telur.buy} rak telur`,mainan:'Kamu dapat hadiah kelereng 😉',buah:'Ibu membeli sekeranjang jeruk',kerupuk:'Bu Dewi memberi sebungkus kerupuk',perabot:`Ibu membeli ${t.perabot.buy} tumpuk piring`,jajan:`Ibu memesan ${t.jajan.boxes} kotak kue arisan`}[id]);
 const plan={telur:'Beli telur',mainan:'Lihat-lihat mainan',buah:'Beli jeruk',kerupuk:'Beli kerupuk',perabot:'Beli piring',jajan:'Pesan kue arisan'};
 let level=2,sess=null;

 // ---------- Sesi & kegiatan ----------
 function newSession(trip,character,name){return {trip,character,name,lives:MAX_LIVES,correct:0,done:{},stepAt:{},stickers:[],estimate:null,cur:null,progress:0,found:0,chicks:[]};}
 const doneCount=s=>Object.keys(s.done).length;
 function fresh(st){return {input:'',solved:false,fb:null,ui:{counted:[],picked:[],given:0,h:0,t:0,o:0,picks:[]}};}
 // Membuka kios (atau 'home' untuk buku harian). Mengembalikan 'stall-done' bila semua langkahnya sudah terjawab.
 function open(s,id){const steps=id==='home'?D.homeSteps(s.trip):D.steps(s.trip,id),i=s.stepAt[id]||0;s.cur={id,steps,i,...fresh(steps[i])};if(i>=steps.length)return finish(s);return 'open';}
 function finish(s){const id=s.cur.id;s.cur=null;if(id==='home'){s.homeDone=true;return 'home-done';}if(!s.done[id]){s.done[id]=true;s.stickers.push(stallOf(id).sticker);}return 'stall-done';}
 function solve(s,msg){const c=s.cur;c.solved=true;s.progress++;s.stepAt[c.id]=c.i+1;c.fb=[msg,'success'];}
 function judge(s,ok){
  const c=s.cur,st=c.steps[c.i];
  if(ok){s.correct++;let msg='Hebat! '+st.formula;if(st.type==='group'&&s.estimate!==null)msg+=s.estimate?' Taksiranmu tadi tepat! 🎯':' Taksiranmu tadi belum tepat, tapi hitunganmu benar!';solve(s,msg);return 'correct';}
  s.lives--;c.input='';c.fb=[`Belum tepat. Nyawa tersisa ${s.lives}. ${st.hint}`,'error'];return s.lives<=0?'out':'wrong';
 }
 function act(s,d){
  const c=s.cur;if(!c)return null;const st=c.steps[c.i],ui=c.ui;
  if(c.solved&&d.act!=='next')return null;
  switch(d.act){
   case 'digit':if(c.input.length<4&&!(c.input===''&&d.d==='0'))c.input+=d.d;return 'input';
   case 'del':c.input=c.input.slice(0,-1);return 'input';
   case 'hint':c.fb=['🧕 '+st.hint,''];return 'render';
   case 'tap':{const i=+d.i,k=ui.counted.indexOf(i);k>=0?ui.counted.splice(k,1):ui.counted.push(i);return 'render';}
   case 'pick':if(!ui.picked.includes(+d.i))ui.picked.push(+d.i);return 'render';
   case 'groupall':ui.picked=s.trip.buah.pos.map((_,i)=>i);c.fb=['🧕 Ibu membantu memasukkan jeruk ke keranjang. Sekarang hitung keranjangnya, ya!',''];return 'render';
   case 'share':if(ui.given*st.boxes<st.n)ui.given++;return 'render';
   case 'bld':ui[d.k]=Math.max(0,Math.min(9,ui[d.k]+ +d.d));return 'render';
   case 'sortpick':if(!ui.picks.includes(+d.i))ui.picks.push(+d.i);return 'render';
   case 'sortreset':ui.picks=[];return 'render';
   case 'submit':if(!c.input){c.fb=['Ketuk angkanya dulu, ya.',''];return 'render';}return judge(s,Number(c.input)===st.answer);
   case 'check':
    if(st.type==='build')return judge(s,ui.h*100+ui.t*10+ui.o===st.target);
    if(ui.picks.length<st.items.length){c.fb=['Ketuk semua kartunya dulu, ya.',''];return 'render';}
    {const r=judge(s,ui.picks.map(i=>st.items[i][0]).join('|')===st.answer);if(r!=='correct')ui.picks=[];return r;}
   case 'choose':
    if(st.type==='estimate'){s.estimate=d.v===st.answer;solve(s,'Oke, taksiranmu dicatat! Sekarang ayo hitung untuk membuktikannya.');return 'correct';}
    return judge(s,d.v===st.answer);
   case 'next':if(++c.i<c.steps.length){Object.assign(c,fresh(c.steps[c.i]));return 'next';}return finish(s);
  }
  return null;
 }

 // ---------- Tampilan kegiatan ----------
 const n2=n=>n.toLocaleString('id-ID');
 function placeVisual(v){
  const value=v.value??v.h*100+v.t*10+v.o,h=Math.floor(value/100),t=Math.floor(value/10)%10,o=value%10,m=v.theme==='marble';
  const H=m?'🫙':'🥫',T=m?'👝':'🛍️',O=k=>m?`<i class="sv-dot c${k%5}"></i>`:'<i class="sv-krupuk"></i>';
  const showH=h>0;
  return `<div class="sv-legend">${showH?`${H} ${m?'toples':'kaleng'} isi 100 · `:''}${T} ${m?'kantong':'plastik'} isi 10 · ${m?'<i class="sv-dot c0"></i> kelereng':'<i class="sv-krupuk"></i> kerupuk'} satuan</div><div class="sv-place">${showH?`<div class="sv-group big">${H.repeat(h)||'<em>kosong</em>'}</div>`:''}<div class="sv-group">${T.repeat(t)||'<em>kosong</em>'}</div><div class="sv-group small">${[...Array(o)].map((_,k)=>O(k)).join('')||'<em>kosong</em>'}</div>${v.delivery?`<div class="sv-truck">🚚 <b>+${n2(v.delivery)}</b></div>`:''}</div>`;
 }
 function orangeTable(t,ui,interactive){
  const picked=new Set(ui.picked),full=Math.floor(ui.picked.length/10),rest=ui.picked.length%10;
  return `<div class="sv-table">${t.buah.pos.map((p,i)=>picked.has(i)?'':interactive?`<button class="sv-orange" data-act="pick" data-i="${i}" style="left:${p[0]}%;top:${p[1]}%" aria-label="Jeruk">🍊</button>`:`<span class="sv-orange" style="left:${p[0]}%;top:${p[1]}%">🍊</span>`).join('')}</div>${interactive?`<div class="sv-baskets">${'<span class="sv-basket full">🧺<b>10</b></span>'.repeat(full)}${rest?`<span class="sv-basket">🧺<b>${rest}</b></span>`:''}${!ui.picked.length?'<small>Ketuk jeruk untuk memasukkannya ke keranjang (isi 10).</small>':''}${ui.picked.length<t.buah.n?'<button class="sv-help" data-act="groupall">🧕 Minta bantuan Ibu</button>':''}</div>`:''}`;
 }
 function visual(s,st,c){
  const ui=c.ui;
  if(st.type==='estimate')return orangeTable(s.trip,ui,false);
  if(st.type==='group')return orangeTable(s.trip,ui,!c.solved);
  if(st.type==='share'){const left=st.n-ui.given*st.boxes;return `<button class="sv-tray" data-act="share" ${left?'':'disabled'}><span class="sv-cakes">${'🧁'.repeat(left)}</span><small>${left?'Ketuk nampan: satu kue untuk setiap kotak':'Kuenya sudah habis dibagi!'}</small></button><div class="sv-boxes">${[...Array(st.boxes)].map(()=>`<div class="sv-box ${left?'':'even'}">${'🧁'.repeat(ui.given)}</div>`).join('')}</div>`;}
  if(st.type==='build'){const rows=[['h','🫙','Toples','isi 100'],['t','👝','Kantong','isi 10'],['o','dot','Kelereng','satuan']].filter(r=>st.hundreds||r[0]!=='h');
   return `<div class="sv-order">📝 Pesanan: <b>${n2(st.target)}</b> kelereng</div>${rows.map(([k,icon,name,isi])=>`<div class="sv-build-row"><span class="sv-build-label">${icon==='dot'?'<i class="sv-dot c1"></i>':icon} <b>${name}</b><small>${isi}</small></span><button data-act="bld" data-k="${k}" data-d="-1" aria-label="Kurangi ${name}">−</button><span class="sv-build-items">${[...Array(ui[k])].map((_,i)=>icon==='dot'?`<i class="sv-dot c${i%5}"></i>`:`<span>${icon}</span>`).join('')}</span><button data-act="bld" data-k="${k}" data-d="1" aria-label="Tambah ${name}">+</button></div>`).join('')}${c.solved?`<div class="sv-order done">✓ ${n2(st.target)} kelereng siap!</div>`:''}`;}
  if(st.type==='sort')return `<div class="sv-picks">${ui.picks.length?ui.picks.map(i=>`<span class="sv-card picked">${st.items[i][0]}<b>${n2(st.items[i][1])}</b></span>`).join('<i>→</i>'):'<small>Paling sedikit → paling banyak</small>'}</div><div class="sv-cards">${st.items.map((it,i)=>ui.picks.includes(i)?'':`<button class="sv-card" data-act="sortpick" data-i="${i}">${it[0]}<b>${n2(it[1])}</b></button>`).join('')}</div>`;
  if(st.type==='compare')return `<div class="sv-cards compare">${st.items.map(it=>`<button class="sv-card big" data-act="choose" data-v="${it[0]}" ${c.solved?'disabled':''}>${it[0]}<b>${n2(it[1])}</b></button>`).join('')}</div>`;
  const v=st.visual;
  if(v.kind==='racks')return `<div class="sv-legend">🥚 1 rak = 10 butir · ketuk rak untuk menghitung</div><div class="sv-racks">${[...Array(v.racks)].map((_,i)=>{const taken=i>=v.racks-v.taken,k=ui.counted.indexOf(i);return `<button class="sv-rack ${taken?'taken':''} ${k>=0?'counted':''}" data-act="tap" data-i="${i}" ${taken||c.solved?'disabled':''} aria-label="Rak telur isi 10">${k>=0?`<b>${(k+1)*10}</b>`:''}${taken?'<em>Ibu</em>':''}</button>`;}).join('')}</div><div class="sv-loose">${'🥚'.repeat(v.loose)}</div>`;
  if(v.kind==='stacks')return `<div class="sv-legend">🍽️ 1 tumpuk = ${v.per} piring · ketuk tumpukan untuk menghitung loncat</div><div class="sv-stacks">${[...Array(v.stacks)].map((_,i)=>{const k=ui.counted.indexOf(i);return `<button class="sv-stack ${k>=0?'counted':''}" data-act="tap" data-i="${i}" ${c.solved?'disabled':''} aria-label="Tumpukan ${v.per} piring">${'<i></i>'.repeat(v.per)}${k>=0?`<b>${(k+1)*v.per}</b>`:''}</button>`;}).join('')}</div>`;
  if(v.kind==='place')return placeVisual(v);
  if(v.kind==='pair')return `<div class="sv-cards compare">${v.items.map(it=>`<span class="sv-card big">${it[0]}<b>${n2(it[1])}</b></span>`).join('')}</div>`;
  return '';
 }
 function html(s,leave='Ke peta'){
  const c=s.cur,st=c.steps[c.i],home=c.id==='home',meta=home?{name:'Buku Harian',icon:'📖',face:'🧕',vendor:'Ibu'}:stallOf(c.id);
  const who=st.say[0],face=who==='kid'?avatar(s.character):`<span class="face-emoji">${who==='ibu'?'🧕':meta.face}</span>`,speaker=who==='ibu'?'Ibu':who==='kid'?escapeHTML(s.name):meta.vendor;
  const numeric=['count','group','share'].includes(st.type),last=c.i===c.steps.length-1;
  const tip={count:'Ketuk angka, lalu tekan ✓',group:'Ketuk angka, lalu tekan ✓',share:'Bagikan kuenya dulu, lalu jawab.',build:'Ketuk + dan − untuk mengambil kelereng.',sort:'Ketuk kartu satu per satu.',compare:'Ketuk kartu yang lebih banyak.',estimate:'Menaksir tidak mengurangi nyawa. Tebak dengan cermat!'}[st.type];
  let controls='';
  if(c.solved)controls=`${numeric?`<div class="q-answer solved"><span class="q-display">${n2(st.answer)}</span><small>${st.unit}</small></div>`:''}<button class="primary next-btn" data-act="next">${last?(home?'Selesai! 📖':'Selesai di kios ini ✓'):'Lanjut →'}</button>`;
  else if(numeric)controls=`<div class="q-answer"><span class="q-display" data-display>${c.input||'?'}</span><small>${st.unit}</small></div>${numpadHTML()}`;
  else if(st.type==='build')controls='<button class="primary next-btn" data-act="check">Siapkan ✓</button>';
  else if(st.type==='sort')controls=`<div class="race-actions"><button class="secondary" data-act="sortreset">↺ Ulangi</button><button class="primary" data-act="check" ${c.ui.picks.length<st.items.length?'disabled':''}>Periksa ✓</button></div>`;
  else if(st.type==='estimate')controls=`<div class="sv-choices"><button class="primary" data-act="choose" data-v="more">Lebih dari ${st.mark}</button><button class="primary alt" data-act="choose" data-v="less">Kurang dari ${st.mark}</button></div>`;
  return `<div class="act act-${st.type}"><div class="act-main"><div class="q-head"><span>${meta.icon} ${meta.name}</span><span class="q-num">Langkah ${c.i+1}/${c.steps.length}</span></div><div class="bubble"><span class="bubble-face">${face}</span><div class="bubble-text"><b>${speaker}</b><p>${st.say[1]}</p></div></div><div class="act-visual">${visual(s,st,c)}</div></div><div class="act-side"><h3 class="q-title">${st.q}</h3><div class="q-feedback ${c.fb?.[1]||''}" role="status">${c.fb?.[0]||tip}</div>${controls}<div class="race-actions small"><button data-act="hint" ${c.solved?'disabled':''}>💡 Petunjuk Ibu</button><button data-act="leave">${leave}</button></div></div></div>`;
 }

 // ---------- Mode sendiri: peta, cerita, buku harian ----------
 const spots=[[18,9],[50,9],[82,9],[18,60],[50,60],[82,60]],stand=[[18,47],[50,47],[82,47],[18,53],[50,53],[82,53]];
 const chickSpots=[[6,46],[27,54],[37,43],[63,53],[73,44],[94,50],[8,94],[30,95],[70,95],[93,94]];
 function ibuSVG(){return `<svg viewBox="0 0 70 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ibu"><ellipse cx="35" cy="106" rx="20" ry="4" fill="#758549" opacity=".2"/><path d="M25 92h8v12h-9zM37 92h8v12h-8z" fill="#7a5a44"/><path d="M18 50q17-8 34 0l8 46H10Z" fill="#3f8f7a"/><path d="M19 54l-8 22M51 54l8 22" stroke="#3f8f7a" stroke-width="9" stroke-linecap="round"/><circle cx="11" cy="78" r="4" fill="#e8b47c"/><circle cx="59" cy="78" r="4" fill="#e8b47c"/><path d="M11 32Q11 4 35 4Q59 4 59 32L61 56Q35 68 9 56Z" fill="#e2703a"/><ellipse cx="35" cy="31" rx="15" ry="17" fill="#f0c28d"/><path d="M19 27Q20 12 35 12Q50 12 51 27Q44 17 35 17Q26 17 19 27Z" fill="#c95d2e"/><circle cx="29" cy="31" r="1.9" fill="#43342b"/><circle cx="41" cy="31" r="1.9" fill="#43342b"/><path d="M30 38q5 4 10 0" fill="none" stroke="#a25d44" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="37" r="2.6" fill="#e89672" opacity=".5"/><circle cx="46" cy="37" r="2.6" fill="#e89672" opacity=".5"/><path d="M50 78h18l-3 15H53Z" fill="#c9974f"/><path d="M53 78q6-11 12 0" fill="none" stroke="#a07a3d" stroke-width="2"/><circle cx="56" cy="76" r="3.5" fill="#58a966"/><circle cx="62" cy="76" r="3" fill="#e7aa4c"/></svg>`;}
 function walk(x,y){walkTo(x,y);const i=$('ibu');i.style.left=Math.min(96,x+6)+'%';i.style.top=y+'%';}
 function renderMap(){
  const s=sess,done=doneCount(s),ready=done===6;
  $('stalls').innerHTML=D.STALLS.map((m,i)=>{const busy=!s.done[m.id]&&(s.stepAt[m.id]||0)>0;return `<button class="stall ${s.done[m.id]?'completed':busy?'in-progress':''}" data-story-stall="${m.id}" style="left:${spots[i][0]}%;top:${spots[i][1]}%;--stall-color:${m.color}" aria-label="${m.name}${s.done[m.id]?', sudah dibantu':''}"><span class="building"><span class="roof"></span><span class="vendor">${m.face}</span><span class="wares">${wares[m.id]}</span><span class="counter"></span><span class="badge" aria-hidden="true">${s.done[m.id]?'✓':busy?'…':'!'}</span></span><span class="stall-label"><span class="status">${s.done[m.id]?'✓':'○'}</span><span>${m.name.replace(/^(Kios|Toko) /,'<span class="kios-word">$1 </span>')}</span></span></button>`;}).join('');
  document.querySelectorAll('[data-story-stall]').forEach(el=>el.onclick=()=>visit(el.dataset.storyStall));
  $('chicks').innerHTML=s.chicks.map((p,i)=>p?`<button class="chick" data-chick="${i}" style="left:${p[0]}%;top:${p[1]}%" aria-label="Anak ayam">🐥</button>`:'').join('');
  document.querySelectorAll('[data-chick]').forEach(el=>el.onclick=()=>findChick(+el.dataset.chick,el));
  $('balance').textContent=`${done} / 6`;$('lives').textContent='♥ '.repeat(s.lives)+'♡ '.repeat(MAX_LIVES-s.lives);$('lives').setAttribute('aria-label',s.lives+' nyawa');$('score').textContent=`🐥 ${s.found}/5 anak ayam`;
  $('progress').textContent=`${done} / 6 kios`;$('list-count').textContent=`${done}/6`;$('list-bar').style.width=done/6*100+'%';
  $('shopping-list').innerHTML=D.STALLS.map(m=>`<div class="list-item ${s.done[m.id]?'checked':''}"><span class="check">${s.done[m.id]?'✓':''}</span><span class="item-name">${m.icon} ${s.done[m.id]?buys(s.trip,m.id):plan[m.id]}</span><span class="qty">${s.done[m.id]?'':m.vendor}</span></div>`).join('');
  $('list-footer').innerHTML=`Stiker: ${D.STALLS.map(m=>`<span class="sticker-slot ${s.done[m.id]?'got':''}">${m.sticker}</span>`).join('')}`;
  $('avatar').innerHTML=avatar(character);$('player-label').textContent=playerName;$('ibu').innerHTML=ibuSVG()+'<span>Ibu</span>';
  $('home').classList.toggle('ready',ready);$('home').querySelector('b').textContent='Pulang naik becak';$('home').querySelector('small').textContent=ready?'Tulis buku harian':'Bantu semua kios dulu';
 }
 function start(lv,withStory=true){
  if(lv)level=lv;track='ibu';mode='solo';leaveRace();setTrackTexts();
  sess=newSession(D.createTrip(level),character,playerName);
  sess.chicks=[...chickSpots].sort(()=>Math.random()-.5).slice(0,5);
  walk(38,50);renderMap();if(withStory)opening();else{$('modal-content').innerHTML='';modal.close();}
 }
 const scenes=()=>[
  {hero:'🏡 ☀️ 🐓',who:'Ibu',text:`Minggu pagi yang cerah. “${escapeHTML(playerName)}, temani Ibu belanja ke pasar, yuk!”`},
  {hero:'🛺 💨 🌳',text:'Kalian berangkat naik becak. Angin pagi terasa sejuk, dan Pak Becak mengayuh sambil bersiul.'},
  {hero:'🏪 🧺 🏪',who:escapeHTML(playerName),text:'“Wah, pasarnya ramai! Barangnya banyak sekali… Ada berapa, ya?”'},
  {hero:'🐥 🐥 🐥',who:'Ibu',text:'“Ibu akan belanja di 6 kios. Kamu bantu menghitung barang-barangnya, ya. Oh iya, katanya anak ayam Bu Sari lepas di pasar, ada 5 ekor. Kalau melihatnya, ketuk ya!”',note:`♥ Kamu punya ${MAX_LIVES} nyawa. Salah menjawab mengurangi 1 nyawa. Tombol 💡 Petunjuk Ibu gratis.`}
 ];
 function opening(k=0){
  const sc=scenes(),x=sc[k],last=k===sc.length-1;
  show(`<div class="scene"><div class="scene-hero">${x.hero}</div><div class="scene-dots">${sc.map((_,i)=>`<i class="${i===k?'on':''}"></i>`).join('')}</div>${x.who?`<div class="bubble"><span class="bubble-face">${x.who==='Ibu'?'<span class="face-emoji">🧕</span>':avatar(character)}</span><div class="bubble-text"><b>${x.who}</b><p>${x.text}</p></div></div>`:`<p class="scene-text">${x.text}</p>`}${x.note?`<div class="budget-note">${x.note}</div>`:''}<div class="actions">${k?'<button class="secondary" id="scene-back">←</button>':''}<button class="primary" id="scene-next">${last?'Ayo masuk pasar! →':'Lanjut →'}</button></div></div>`);
  if(k)$('scene-back').onclick=()=>opening(k-1);$('scene-next').onclick=()=>last?modal.close():opening(k+1);
 }
 function findChick(i,el){if(!sess.chicks[i])return;sess.chicks[i]=null;sess.found++;tone(true);el.classList.add('found');setTimeout(renderMap,400);toast(sess.found===5?'Hore! Semua anak ayam Bu Sari ketemu! 🐥🐥🐥🐥🐥':`Ketemu! 🐥 ${sess.found}/5 anak ayam`);}
 function visit(id){
  if(!sess||sess.lives<=0)return;const i=D.STALLS.findIndex(m=>m.id===id),m=stallOf(id);walk(...stand[i]);
  if(sess.done[id]){show(`<div class="dialog-hero">${m.sticker}</div><div class="eyebrow">${m.name.toUpperCase()} · SUDAH DIBANTU</div><h2>${m.vendor}: “Terima kasih lagi, ya!”</h2><p>${buys(sess.trip,id)}. Ayo bantu kios yang lain!</p><div class="actions"><button class="primary" id="story-ok">Kembali ke peta →</button></div>`);$('story-ok').onclick=()=>modal.close();return;}
  if(open(sess,id)==='stall-done'){stallDone(id);return;}
  showAct();
 }
 function showAct(){show(`<div class="story-act">${html(sess)}</div>`,true);}
 function handle(d){
  if(d.act==='leave'){sess.cur=null;modal.close();renderMap();return;}
  const id=sess.cur?.id,out=act(sess,d);
  if(out==='input'){const el=document.querySelector('#modal-content [data-display]');if(el)el.textContent=sess.cur.input||'?';return;}
  if(out==='out'){tone(false);renderMap();lose();return;}
  if(out==='stall-done'){stallDone(id);return;}
  if(out==='home-done'){diary();return;}
  if(out==='correct'){tone(true);celebrate(6);}
  if(out)showAct();
  if(out==='wrong'){tone(false);document.querySelector('#modal-content .q-display')?.classList.add('shake');}
  if(out==='correct'||out==='wrong')renderMap();
 }
 function stallDone(id){
  renderMap();const m=stallOf(id),left=6-doneCount(sess);
  show(`<div class="dialog-hero sticker-hero">${m.sticker}</div><div class="eyebrow">STIKER BARU UNTUK BUKU HARIANMU!</div><h2>${m.vendor}: “${m.outro}”</h2><p>🧺 ${buys(sess.trip,id)}. ${left?`Masih ada ${left} kios lagi. Ayo, Ibu masih mau belanja!`:'Semua kios sudah kamu bantu! Ayo ketuk 🏡 di peta untuk pulang naik becak dan menulis buku harian.'}</p><div class="actions"><button class="primary" id="story-ok">Kembali ke peta →</button></div>`);
  $('story-ok').onclick=()=>modal.close();celebrate(16);
 }
 function home(){
  if(!sess||sess.lives<=0)return;
  if(doneCount(sess)<6){toast('Ibu masih mau belanja. Bantu semua kios dulu, ya!');return;}
  walk(50,80);
  show(`<div class="scene"><div class="scene-hero">🛺 🏡 📖</div><p class="scene-text">Belanjaan sudah lengkap. Kalian pulang naik becak. Sampai di rumah, kamu membuka buku harian untuk menulis semua yang kamu hitung hari ini.</p><div class="actions"><button class="primary" id="story-diary">Tulis buku harian ✏️</button></div></div>`);
  $('story-diary').onclick=()=>open(sess,'home')==='home-done'?diary():showAct();
 }
 function diary(){
  const t=sess.trip;
  const stickers=[...sess.stickers,...(sess.found===5?['🐥']:[])];
  show(`<div class="diary" data-lock><div class="diary-date">Hari Minggu · Pasar Kedungadem</div><h2>📖 Buku Harian ${escapeHTML(playerName)}</h2><p class="diary-text">Hari ini aku ikut Ibu ke Pasar Kedungadem. Aku membantu menghitung <b>${n2(t.telur.total)} butir telur</b>, <b>${n2(t.mainan.total)} kelereng</b>, <b>${t.buah.n} jeruk</b>, <b>${n2(t.kerupuk.final)} kerupuk</b>, dan <b>${t.perabot.total} piring</b>. Aku juga membagi <b>${t.jajan.n} kue</b> ke ${t.jajan.boxes} kotak dengan rata!${sess.found?` Aku menemukan <b>${sess.found} anak ayam</b> Bu Sari yang lepas.`:''}</p><div class="diary-stickers">${stickers.map(x=>`<span>${x}</span>`).join('')}</div></div><div class="stat-row"><div><strong>${sess.correct}</strong>jawaban benar</div><div><strong>${sess.lives} ♥</strong>nyawa tersisa</div></div><p style="text-align:center">“Terima kasih sudah membantu Ibu, Nak. Kamu pintar menghitung!” 🧕</p><div class="actions"><button class="secondary" id="story-mode">Ganti mode</button><button class="primary" id="story-again">Ke pasar lagi ↻</button></div>`);
  $('story-mode').onclick=chooseMode;$('story-again').onclick=()=>start(null,false);celebrate();
 }
 function lose(){
  show(`<div class="big-result" data-lock>🌱</div><div class="eyebrow" style="text-align:center">NYAWAMU HABIS</div><h2 style="text-align:center">Tidak apa-apa, ${escapeHTML(playerName)}.</h2><p>“Menghitung memang perlu latihan, Nak. Besok kita ke pasar lagi, ya,” kata Ibu sambil tersenyum. Kamu sudah menjawab <b>${sess.correct} soal</b> dengan benar dan membantu <b>${doneCount(sess)} kios</b>.</p><div class="budget-note">Tips: ketuk rak, tumpukan, atau jeruk sambil menghitung, dan pakai tombol 💡 Petunjuk Ibu.</div><div class="actions"><button class="secondary" id="story-mode">Ganti mode</button><button class="primary" id="story-again">Coba lagi ↻</button></div>`);
  $('story-mode').onclick=chooseMode;$('story-again').onclick=()=>start(null,false);
 }
 function init(){
  $('modal-content').addEventListener('click',e=>{if(track!=='ibu'||mode!=='solo'||!sess?.cur)return;const b=e.target.closest('.story-act [data-act]');if(b&&!b.disabled)handle(b.dataset);});
  document.addEventListener('keydown',e=>{if(track!=='ibu'||mode!=='solo'||!modal.open||!sess?.cur||!document.querySelector('#modal-content [data-display]'))return;if(/^[0-9]$/.test(e.key))handle({act:'digit',d:e.key});else if(e.key==='Backspace')handle({act:'del'});else if(e.key==='Enter'){e.preventDefault();handle({act:'submit'});}});
 }

 // ---------- Mode balapan ----------
 RaceKinds.ibu={
  title:'🏁 Balapan Ikut Ibu',finish:'📖',winText:'paling cepat membantu semua kios dan menulis buku harian dengan benar.',
  setup:{hero:'🏁 🧕 🏁',eyebrow:'BALAPAN IKUT IBU · KELAS 3',text:'Kalian sama-sama ikut ibu ke pasar dan menghitung barang yang <b>sama persis</b>. Pilih karakter dan tulis nama masing-masing.',rule:`🏆 Yang pertama membantu menghitung di 6 kios lalu menulis buku harian, dialah pemenangnya. Hati-hati, salah jawab mengurangi nyawa (${MAX_LIVES} nyawa)!`},
  create:()=>D.createTrip(level),total:t=>D.totalSteps(t),label:t=>t.level===2?'⭐⭐ Bilangan sampai 1.000':'⭐ Bilangan sampai 100',
  checkpoints:t=>{let at=0;return D.STALLS.map(m=>[at+=D.steps(t,m.id).length,m.icon]);},
  player:(t,p)=>({sess:newSession(t,p.character,p.name),note:'Pilih kios untuk mulai membantu menghitung.'}),
  steps:r=>r.sess.progress,out:r=>r.sess.lives<=0,
  summary:r=>`${doneCount(r.sess)}/6 kios · ${r.sess.correct} benar · ${'♥'.repeat(r.sess.lives)||'nyawa habis'}`,
  stats:r=>`<span class="racer-stat" aria-label="${r.sess.lives} nyawa">${'♥'.repeat(r.sess.lives)}<i>${'♡'.repeat(MAX_LIVES-r.sess.lives)}</i></span><span class="racer-stat">⭐ ${doneCount(r.sess)}/6</span>`,
  stage(r){
   const s=r.sess;if(s.cur)return `<div class="story-act">${html(s,'Kios lain')}</div>`;
   const ready=doneCount(s)===6;
   return `<div class="stage-title">Pilih kios <small>Bantu menghitung barangnya</small></div><div class="kios-grid">${D.STALLS.map(m=>{const busy=!s.done[m.id]&&(s.stepAt[m.id]||0)>0;return `<button class="kios ${s.done[m.id]?'done':busy?'busy':''}" data-act="stall" data-id="${m.id}" style="--stall-color:${m.color}"><span class="kios-icon">${m.face}</span><b>${shortName(m)}</b><small>${wares[m.id]}</small>${s.done[m.id]?`<i>✓</i>`:busy?'<i>…</i>':''}</button>`;}).join('')}<button class="kios home ${ready?'ready':''}" data-act="home"><span class="kios-icon">📖</span><b>Pulang</b><small>${ready?'Tulis buku harian!':'Bantu semua kios dulu'}</small></button></div><div class="racer-note">${r.note}</div>`;
  },
  act(r,d,panel){
   const s=r.sess;
   if(d.act==='stall'){const m=stallOf(d.id);if(s.done[d.id]){r.note=`✓ ${m.name} sudah dibantu. Pilih kios lain!`;return;}if(open(s,d.id)==='stall-done')r.note=`✓ ${m.name} selesai!`;return;}
   if(d.act==='home'){if(doneCount(s)<6){r.note='Ibu masih mau belanja. Bantu semua kios dulu!';return;}if(open(s,'home')==='home-done'){tone(true);return 'finish';}return;}
   if(d.act==='leave'){s.cur=null;r.note='Pilih kios berikutnya.';return;}
   const id=s.cur?.id,out=act(s,d);
   if(out==='input'){const el=panel.querySelector('[data-display]');if(el)el.textContent=s.cur.input||'?';return 'skip';}
   if(out==='out'){tone(false);return 'out';}
   if(out==='home-done'){tone(true);return 'finish';}
   if(out==='stall-done'){const m=stallOf(id);tone(true);r.note=`✓ ${m.name} selesai! Kamu dapat stiker ${m.sticker}.`;return;}
   if(out==='correct')tone(true);
   if(out==='wrong'){tone(false);renderRacer(r);panel.querySelector('.q-display')?.classList.add('shake');return 'skip';}
   if(!out)return 'skip';
  }
 };
 return {start,home,init,renderMap,setLevel:l=>{level=l;},get level(){return level;},get sess(){return sess;}};
})();
