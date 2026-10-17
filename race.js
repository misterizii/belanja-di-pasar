// Mode balapan: dua pemain berbagi satu layar. Tiap pemain punya panel dan tombol angka sendiri,
// jadi di layar sentuh keduanya bisa bermain bersamaan. Catatan belanja keduanya sama persis.
const STEPS=21; // 5 kios × 4 tantangan + laporan di rumah
let racers=[],raceSetup=[{name:'Adi',character:'boy'},{name:'Ayu',character:'girl'}],raceStart=0,raceTimer=null,raceOver=true,raceRun=0;
const clock=ms=>{const s=Math.floor(ms/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');};
const shortName=s=>s.name.replace('Kios ','');
const steps=r=>r.game.stalls.reduce((sum,s)=>sum+(s.done?4:s.questionIndex||0),0)+(r.game.finished?1:0);

function raceSetupDialog(){
 const card=(p,n)=>`<div class="setup-card setup-${n+1}"><div class="setup-title">Pemain ${n+1}</div><div class="setup-chars">${['boy','girl'].map(c=>`<button class="setup-char ${p.character===c?'selected':''}" data-player="${n}" data-char="${c}" aria-label="${c==='boy'?'Laki-laki':'Perempuan'}">${avatar(c)}</button>`).join('')}</div><input id="racer-name-${n}" class="name-input" maxlength="12" placeholder="Nama pemain ${n+1}" value="${escapeHTML(p.name)}" aria-label="Nama pemain ${n+1}"></div>`;
 show(`<div class="dialog-hero" data-lock>🏁 🧺 🏁</div><div class="eyebrow">BALAPAN BELANJA</div><h2>Siapa paling cepat?</h2><p>Kalian mendapat catatan belanja dan uang yang <b>sama persis</b>. Pilih karakter dan tulis nama masing-masing.</p><div class="setup-grid">${raceSetup.map(card).join('')}</div><div class="budget-note">🏆 Yang pertama selesai belanja dan melaporkan sisa uang di rumah, dialah pemenangnya. Hati-hati, salah jawab mengurangi nyawa!</div><div class="actions"><button class="secondary" id="race-back">← Pilih mode</button><button class="primary" id="race-begin">Mulai balapan! 🏁</button></div>`);
 document.querySelectorAll('[data-char]').forEach(b=>b.onclick=()=>{const n=+b.dataset.player;raceSetup[n].character=b.dataset.char;document.querySelectorAll(`[data-player="${n}"]`).forEach(c=>c.classList.toggle('selected',c===b));});
 $('race-back').onclick=chooseMode;
 $('race-begin').onclick=()=>{raceSetup.forEach((p,n)=>p.name=$('racer-name-'+n).value.trim()||`Pemain ${n+1}`);startRace();};
}

function startRace(){
 mode='race';stopRace();const run=++raceRun,base=Market.createGame();
 racers=raceSetup.map((p,n)=>({n,name:p.name,character:p.character,game:JSON.parse(JSON.stringify(base)),stage:'map',stall:null,queue:[],qIndex:0,input:'',solved:false,final:false,note:'Pilih kios untuk mulai belanja.',time:null}));
 document.body.classList.add('race-mode');$('race').hidden=false;raceOver=true;
 $('race').innerHTML=`<div class="race-track"><div class="track-head"><b>🏁 Balapan Belanja</b><span class="track-budget">Uang masing-masing ${money(base.budget)}</span><span class="race-time" id="race-time">00:00</span><span class="track-tools"><button data-race="sound" title="Suara" aria-label="Suara">${$('sound').textContent}</button><button data-race="full" title="Layar penuh" aria-label="Layar penuh">⛶</button><button data-race="help" title="Cara bermain" aria-label="Cara bermain">?</button><button class="exit" data-race="exit">✕ Keluar</button></span></div><div class="lanes">${racers.map(r=>`<div class="lane lane-${r.n+1}"><div class="lane-road">${[1,2,3,4,5].map(k=>`<span class="checkpoint" style="left:${k*4/STEPS*100}%">🧺</span>`).join('')}<span class="finish">🏡</span><div class="runner" id="runner-${r.n}">${avatar(r.character)}<span>${escapeHTML(r.name)}</span></div></div></div>`).join('')}</div></div><div class="racers">${racers.map(r=>`<section class="racer racer-${r.n+1}" id="racer-${r.n}" aria-label="Panel ${escapeHTML(r.name)}"></section>`).join('')}</div><div class="countdown" id="countdown"><span>3</span></div>`;
 racers.forEach(r=>{renderRacer(r);$('racer-'+r.n).addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b&&!b.disabled)act(r,b.dataset);});});
 document.querySelectorAll('[data-race]').forEach(b=>b.onclick=()=>raceTool(b));updateTrack();$('modal-content').innerHTML='';if(modal.open)modal.close();enterFullscreen();
 const words=['3','2','1','Mulai!'];words.forEach((w,i)=>setTimeout(()=>{if(run!==raceRun)return;const c=$('countdown');c.innerHTML=`<span>${w}</span>`;tone(i===3);if(i===3)setTimeout(()=>{if(run!==raceRun)return;c.remove();raceOver=false;raceStart=Date.now();raceTimer=setInterval(()=>{$('race-time').textContent=clock(Date.now()-raceStart);},500);},600);},i*800));
}
// Balapan selalu memenuhi layar; layar penuh browser dicoba bila didukung (butuh ketukan pemain).
function enterFullscreen(){const el=document.documentElement;if(document.fullscreenElement||document.webkitFullscreenElement)return;try{const r=(el.requestFullscreen||el.webkitRequestFullscreen)?.call(el);r?.catch?.(()=>{});}catch{}}
function exitFullscreen(){try{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else if(document.webkitFullscreenElement)document.webkitExitFullscreen();}catch{}}
function raceTool(b){const t=b.dataset.race;if(t==='full'){document.fullscreenElement||document.webkitFullscreenElement?exitFullscreen():enterFullscreen();}else if(t==='sound'){$('sound').click();b.textContent=$('sound').textContent;}else if(t==='help')$('help').click();else if(t==='exit')$('mode').click();}
function stopRace(){raceRun++;clearInterval(raceTimer);raceOver=true;}
function leaveRace(){stopRace();exitFullscreen();document.body.classList.remove('race-mode');$('race').hidden=true;$('race').innerHTML='';}

function renderRacer(r){
 const g=r.game,done=g.stalls.filter(s=>s.done).length,panel=$('racer-'+r.n),flipped=panel.classList.contains('flipped');
 panel.innerHTML=`<div class="racer-top"><span class="racer-avatar">${avatar(r.character)}</span><div class="racer-name"><b>${escapeHTML(r.name)}</b><small>Pemain ${r.n+1}</small></div><span class="racer-stat" aria-label="${g.lives} nyawa">${'♥'.repeat(g.lives)}<i>${'♡'.repeat(3-g.lives)}</i></span><span class="racer-stat">👛 ${money(g.balance)}</span><span class="racer-stat">🧺 ${done}/5</span><button class="flip-btn" data-act="flip" title="Putar panel (untuk tablet yang diletakkan di meja)" aria-label="Putar panel">↻</button></div><div class="racer-stage">${stage(r)}</div>`;
 panel.classList.toggle('flipped',flipped);
}
function stage(r){
 const g=r.game,s=r.stall;
 if(r.stage==='won')return `<div class="stage-end"><div class="end-icon">🏆</div><h3>${escapeHTML(r.name)} menang!</h3><p>Semua titipan lengkap dalam <b>${clock(r.time)}</b>.</p></div>`;
 if(r.stage==='lost')return `<div class="stage-end"><div class="end-icon">🏃</div><h3>Yah, kalah cepat!</h3><p>Temanmu sudah sampai rumah duluan. Ayo coba lagi!</p></div>`;
 if(r.stage==='out')return `<div class="stage-end"><div class="end-icon">🌱</div><h3>Nyawamu habis</h3><p>Tidak apa-apa, belajar perlu latihan. Semangati temanmu, ya!</p></div>`;
 if(r.stage==='map'){const ready=g.stalls.every(s=>s.done);return `<div class="stage-title">Pilih kios <small>Belanja sesuai catatan</small></div><div class="kios-grid">${g.stalls.map(s=>`<button class="kios ${s.done?'done':s.questionIndex>0?'busy':''}" data-act="stall" data-id="${s.id}" style="--stall-color:${s.color}"><span class="kios-icon">${vendors[s.id]}</span><b>${shortName(s)}</b><small>${s.items.map(i=>i.icon+'×'+i.qty).join(' ')}</small>${s.done?'<i>✓</i>':s.questionIndex>0?'<i>…</i>':''}</button>`).join('')}<button class="kios home ${ready?'ready':''}" data-act="home"><span class="kios-icon">🏡</span><b>Pulang</b><small>${ready?'Laporkan sisa uang!':'Belanja dulu'}</small></button></div><div class="racer-note">${r.note}</div>`;}
 if(r.stage==='shop')return `<div class="stage-title">${s.icon} ${s.name} <small>${s.vendor}</small></div>${s.items.map((i,n)=>`<div class="race-product"><span class="product-icon">${i.icon}</span><div class="product-details"><b>${i.name}</b><small>${money(i.price)} / ${i.unit} · Catatan: ${i.qty} ${i.unit}</small></div><div class="stepper"><button data-act="step" data-n="${n}" data-d="-1" aria-label="Kurangi ${i.name}">−</button><b>${i.selected}</b><button data-act="step" data-n="${n}" data-d="1" aria-label="Tambah ${i.name}">+</button></div></div>`).join('')}<div class="racer-note">${r.note}</div><div class="race-actions"><button class="secondary" data-act="map">← Kios lain</button><button class="primary" data-act="checkout">Hitung belanja →</button></div>`;
 const q=r.queue[r.qIndex];
 return `<div class="q-head"><span>${r.final?'🏡 Laporan untuk orang tua':s.icon+' '+s.name}</span><span class="q-num">${r.final?'Tantangan terakhir':`Tantangan ${r.qIndex+1}/4`}</span></div><h3 class="q-title">${q.title}</h3><p class="q-text">${q.text}</p><div class="q-answer"><span class="q-display" id="display-${r.n}">${r.solved?q.answer.toLocaleString('id-ID'):'?'}</span><small>${q.unit}</small></div><div class="q-feedback ${r.solved?'success':''}" id="feedback-${r.n}" role="status">${r.solved?'Hebat! '+q.formula:'Ketuk angka, lalu tekan ✓'}</div>${r.solved?`<button class="primary next-btn" data-act="next">${r.final?'Selesai! 🏁':r.qIndex===3?'Bayar & lanjut →':'Tantangan berikutnya →'}</button>`:`<div class="numpad">${[1,2,3,4,5,6,7,8,9].map(d=>`<button data-act="digit" data-d="${d}">${d}</button>`).join('')}<button data-act="del" aria-label="Hapus">⌫</button><button data-act="digit" data-d="0">0</button><button class="ok" data-act="submit" aria-label="Periksa jawaban">✓</button></div><div class="race-actions small"><button data-act="hint">💡 Petunjuk</button>${r.final?'':'<button data-act="map">Kios lain</button>'}</div>`}`;
}
function setFeedback(r,text,kind=''){const f=$('feedback-'+r.n);f.className='q-feedback '+kind;f.textContent=text;}
function act(r,d){
 if(d.act==='flip'){$('racer-'+r.n).classList.toggle('flipped');return;}
 if(raceOver||r.game.lives===0)return;
 const g=r.game,s=r.stall;
 switch(d.act){
  case 'stall':{const st=g.stalls.find(x=>x.id===d.id);if(st.done){r.note=`✓ ${st.name} sudah selesai. Pilih kios lain!`;break;}r.stall=st;r.final=false;if(st.questionIndex>0){r.queue=Market.questions(st,g.balance);r.qIndex=st.questionIndex;r.input='';r.solved=false;r.stage='question';}else{st.items.forEach(i=>i.selected=0);r.note='Masukkan barang sesuai catatan.';r.stage='shop';}break;}
  case 'step':{const i=s.items[+d.n];i.selected=Math.max(0,Math.min(9,i.selected+ +d.d));break;}
  case 'checkout':if(s.items.some(i=>i.selected!==i.qty)){r.note='Cek catatan lagi, ya. Jumlah barang harus sama.';break;}r.queue=Market.questions(s,g.balance);r.qIndex=0;r.input='';r.solved=false;r.stage='question';break;
  case 'map':r.stage='map';r.note='Pilih kios berikutnya.';break;
  case 'home':if(!g.stalls.every(x=>x.done)){r.note='Masih ada titipan yang belum dibeli!';break;}r.final=true;r.queue=[{title:'Berapa sisa uangmu?',text:`Kamu membawa ${money(g.budget)} dan berbelanja ${money(g.budget-g.balance)}. Berapa sisa uang yang kamu bawa pulang?`,answer:g.balance,unit:'rupiah',hint:'Kurangi uang awal dengan seluruh uang yang kamu belanjakan.',formula:`${g.budget.toLocaleString('id-ID')} − ${(g.budget-g.balance).toLocaleString('id-ID')} = ${g.balance.toLocaleString('id-ID')}`}];r.qIndex=0;r.input='';r.solved=false;r.stage='question';break;
  case 'digit':if(r.input.length<7&&!(r.input===''&&d.d==='0'))r.input+=d.d;$('display-'+r.n).textContent=r.input?Number(r.input).toLocaleString('id-ID'):'?';return;
  case 'del':r.input=r.input.slice(0,-1);$('display-'+r.n).textContent=r.input?Number(r.input).toLocaleString('id-ID'):'?';return;
  case 'hint':setFeedback(r,r.queue[r.qIndex].hint);return;
  case 'submit':{if(!r.input){setFeedback(r,'Ketuk angkanya dulu, ya.');return;}const q=r.queue[r.qIndex],res=Market.answer(g,q.answer,r.input);if(res.correct){r.solved=true;tone(true);break;}tone(false);r.input='';if(g.lives===0){r.stage='out';renderRacer(r);if(racers.every(x=>x.game.lives===0))endRace(null);return;}renderRacer(r);setFeedback(r,`Belum tepat. Nyawa tersisa ${g.lives}. ${q.hint}`,'error');const disp=$('display-'+r.n);disp.classList.add('shake');return;}
  case 'next':if(r.final){g.finished=true;r.time=Date.now()-raceStart;updateTrack();endRace(r);return;}if(++r.qIndex<4){s.questionIndex=r.qIndex;r.input='';r.solved=false;}else{Market.pay(g,s);r.note=`✓ Belanja di ${s.name} selesai! Kamu membayar ${money(Market.total(s))}.`;r.stage='map';}break;
 }
 renderRacer(r);updateTrack();
}
function updateTrack(){racers.forEach(r=>{const el=$('runner-'+r.n);if(el)el.style.left=steps(r)/STEPS*100+'%';});}
function endRace(winner){
 stopRace();racers.forEach(r=>{if(winner)r.stage=r===winner?'won':r.game.lives===0?'out':'lost';renderRacer(r);});
 setTimeout(()=>{if(mode!=='race')return;const row=r=>`<div class="result-player ${r===winner?'winner':''}"><span class="racer-avatar">${avatar(r.character)}</span><b>${escapeHTML(r.name)}${r===winner?' 🏆':''}</b><small>${r.game.stalls.filter(s=>s.done).length}/5 kios · ${r.game.correct} benar · ${'♥'.repeat(r.game.lives)||'nyawa habis'}</small>${r.time!==null?`<strong>${clock(r.time)}</strong>`:''}</div>`;
  show(`<div class="big-result" data-lock>${winner?'🏆':'🤝'}</div><div class="eyebrow" style="text-align:center">BALAPAN SELESAI!</div><h2 style="text-align:center">${winner?`${escapeHTML(winner.name)} menang!`:'Belum ada pemenang'}</h2><p style="text-align:center">${winner?`Hebat! ${escapeHTML(winner.name)} paling cepat menyelesaikan semua titipan dan laporannya benar.`:'Nyawa kedua pemain habis. Ayo berlatih lagi dan coba balapan baru!'}</p><div class="result-grid">${racers.map(row).join('')}</div><div class="actions"><button class="secondary" id="result-mode">Ganti mode</button><button class="primary" id="race-again">Balapan lagi ↻</button></div>`);
  $('result-mode').onclick=()=>{leaveRace();chooseMode();};$('race-again').onclick=startRace;if(winner)celebrate();},winner?900:300);
}
