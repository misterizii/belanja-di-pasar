// Mode "Ikut Ibu ke Pasar" (Kelas 3): angka dan langkah kegiatan menghitung di setiap kios.
// Level 1 = bilangan sampai 100, level 2 = sampai 1.000. Perkalian dan pembagian selalu hasilnya ≤ 100.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.StoryData=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const STALLS=[
    {id:'telur',name:'Kios Telur',vendor:'Bu Sari',face:'👩‍🌾',icon:'🥚',color:'#e7aa4c',sticker:'🐣',outro:'Pintar sekali! Terima kasih sudah membantu Ibu menghitung telur.'},
    {id:'mainan',name:'Toko Mainan',vendor:'Pak Budi',face:'👨‍🦱',icon:'🔮',color:'#63aabb',sticker:'🔮',outro:'Wah, kamu jago! Ini sekantong kelereng untukmu. Hadiah dari Bapak!'},
    {id:'buah',name:'Kios Buah',vendor:'Pak Joko',face:'👨‍🌾',icon:'🍊',color:'#58a966',sticker:'🍊',outro:'Terima kasih! Ibumu jadi membeli jeruk sekeranjang, ya.'},
    {id:'kerupuk',name:'Kios Kerupuk',vendor:'Bu Dewi',face:'👵',icon:'🍘',color:'#da8276',sticker:'🍘',outro:'Pintar! Ini sebungkus kerupuk untuk lauk di rumah.'},
    {id:'perabot',name:'Toko Perabot',vendor:'Pak Slamet',face:'👴',icon:'🍽️',color:'#9d8bbf',sticker:'🍽️',outro:'Hebat, hitung loncatmu cepat sekali!'},
    {id:'jajan',name:'Kios Jajan Pasar',vendor:'Bu Rini',face:'👩‍🍳',icon:'🍰',color:'#e28979',sticker:'🍰',outro:'Rata semua! Ini satu kue lumpur untukmu, ya.'}
  ];
  const fmt=n=>n.toLocaleString('id-ID');

  function createTrip(level=2,random=Math.random){
    const R=(a,b)=>a+Math.floor(random()*(b-a+1)),pick=a=>a[Math.floor(random()*a.length)],L2=level===2;
    for(;;){
      const t={level};
      const racks=L2?R(11,19):R(3,8),loose=R(1,9);
      t.telur={racks,loose,total:racks*10+loose,buy:R(2,3)};
      if(L2){const zero=pick(['t','o','-','-']),h=R(1,9),tt=zero==='t'?0:R(1,9),o=zero==='o'?0:R(1,9);const target=R(1,9)*100+pick([0,R(1,9),R(1,9)])*10+pick([0,R(1,9),R(1,9)]);t.mainan={h,t:tt,o,total:h*100+tt*10+o,target};}
      else{const tt=R(2,9),o=R(0,9);t.mainan={h:0,t:tt,o,total:tt*10+o,target:R(2,9)*10+R(0,9)};}
      if(t.mainan.target===t.mainan.total)continue;
      // Jeruk ditaruh di petak-petak acak supaya tidak saling menumpuk dan mudah diketuk.
      const mark=L2?50:30,n=random()<.5?(L2?R(26,44):R(12,24)):(L2?R(56,74):R(36,48)),cols=L2?12:9,rows=L2?7:6;
      const cells=[...Array(cols*rows).keys()];for(let i=cells.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[cells[i],cells[j]]=[cells[j],cells[i]];}
      t.buah={n,mark,pos:cells.slice(0,n).map(c=>[Math.round(((c%cols)+.35+random()*.3)/cols*1000)/10,Math.round((Math.floor(c/cols)+.35+random()*.3)/rows*1000)/10])};
      if(L2){const start=R(320,699),sold=R(105,start-150);t.kerupuk={start,sold,remain:start-sold,delivery:R(1,3)*100+R(0,9)*10};}
      else{const start=R(45,90),sold=R(12,start-20);t.kerupuk={start,sold,remain:start-sold,delivery:R(10,Math.min(40,99-(start-sold)))};}
      t.kerupuk.final=t.kerupuk.remain+t.kerupuk.delivery;
      const per=L2?pick([3,4,5,6,7,8]):pick([2,5,10]),stacks=L2?R(4,Math.min(9,Math.floor(100/per))):R(3,6),buy=R(2,Math.min(3,stacks-1));
      t.perabot={per,stacks,total:per*stacks,buy,bought:per*buy};
      const boxes=L2?R(3,6):R(2,4),each=L2?R(4,10):R(3,6);
      t.jajan={boxes,each,n:boxes*each};
      const vals=[['🥚 Telur',t.telur.total],['🔮 Kelereng',t.mainan.total],['🍊 Jeruk',n],['🍘 Kerupuk',t.kerupuk.final],['🍽️ Piring',t.perabot.total]];
      if(new Set(vals.map(v=>v[1])).size<vals.length)continue;
      const i=R(0,4);let j=R(0,3);if(j>=i)j++;
      t.diary={vals,pair:[i,j]};
      return t;
    }
  }

  // Setiap langkah: say = [pembicara, kalimat], q = pertanyaan, answer = jawaban yang diperiksa.
  function steps(t,id){
    const L2=t.level===2;
    switch(id){
      case 'telur':{const e=t.telur,left=e.total-e.buy*10;return [
        {type:'count',visual:{kind:'racks',racks:e.racks,loose:e.loose,taken:0},say:['vendor','Wah, ada yang mau bantu! Ibu sedang menata telur. Satu rak isinya 10 butir, ya.'],q:'Berapa butir telur Bu Sari semuanya?',answer:e.total,unit:'butir',hint:'Ketuk raknya satu per satu sambil menghitung: 10, 20, 30, … lalu tambahkan telur yang lepas.',formula:`${e.racks} rak = ${e.racks*10} butir, ditambah ${e.loose} butir = ${e.total}`},
        {type:'count',visual:{kind:'racks',racks:e.racks,loose:e.loose,taken:e.buy},say:['ibu',`Bu Sari, saya beli ${e.buy} rak, ya.`],q:`Ibu membeli ${e.buy} rak. Sekarang telur Bu Sari tinggal berapa butir?`,answer:left,unit:'butir',hint:`${e.buy} rak berarti ${e.buy*10} butir. Kurangi ${e.total} dengan ${e.buy*10}.`,formula:`${e.total} − ${e.buy*10} = ${left}`}];}
      case 'mainan':{const m=t.mainan,d=[Math.floor(m.target/100),Math.floor(m.target/10)%10,m.target%10];return [
        {type:'count',visual:{kind:'place',theme:'marble',h:m.h,t:m.t,o:m.o},say:['vendor',L2?'Kelerengku kusimpan di toples dan kantong. Satu toples isi 100, satu kantong isi 10.':'Kelerengku kusimpan di kantong. Satu kantong isinya 10 kelereng.'],q:'Berapa kelereng Pak Budi semuanya?',answer:m.total,unit:'kelereng',hint:L2?'Toples = ratusan, kantong = puluhan, kelereng lepas = satuan. Hati-hati kalau ada yang kosong, tulis angka 0.':'Hitung kantongnya: 10, 20, 30, … lalu tambahkan kelereng yang lepas.',formula:L2?`${m.h} ratus + ${m.t} puluh + ${m.o} satuan = ${m.total}`:`${m.t} puluh + ${m.o} satuan = ${m.total}`},
        {type:'build',theme:'marble',hundreds:L2,target:m.target,say:['vendor',`Ada anak yang mau membeli ${m.target} kelereng. Bantu Bapak menyiapkannya, ya!`],q:`Siapkan tepat ${m.target} kelereng.`,hint:L2?'Lihat angkanya: angka ratusan untuk toples, angka puluhan untuk kantong, angka satuan untuk kelereng lepas.':'Angka puluhan untuk kantong, angka satuan untuk kelereng lepas.',formula:L2?`${d[0]} toples + ${d[1]} kantong + ${d[2]} kelereng = ${m.target}`:`${d[1]} kantong + ${d[2]} kelereng = ${m.target}`}];}
      case 'buah':{const b=t.buah;return [
        {type:'estimate',mark:b.mark,say:['vendor','Jerukku baru datang dan masih berserakan! Coba tebak dulu sebelum menghitung.'],q:`Kira-kira, jeruknya lebih dari ${b.mark} atau kurang dari ${b.mark}?`,answer:b.n>b.mark?'more':'less',hint:'Menaksir itu menebak dengan cermat. Tidak apa-apa kalau belum tepat, nyawamu aman.'},
        {type:'group',say:['kid','Biar mudah, jeruknya kumasukkan ke keranjang. Satu keranjang isi 10!'],q:'Berapa jeruk Pak Joko semuanya?',answer:b.n,unit:'jeruk',hint:'Ketuk jeruk untuk memasukkannya ke keranjang. Hitung keranjang yang penuh (10, 20, 30, …), lalu tambahkan sisanya.',formula:`${Math.floor(b.n/10)} keranjang = ${Math.floor(b.n/10)*10}, ditambah ${b.n%10} jeruk = ${b.n}`}];}
      case 'kerupuk':{const k=t.kerupuk;return [
        {type:'count',visual:{kind:'place',theme:'kerupuk',value:k.start},say:['vendor',`Tadi pagi Ibu membawa ${fmt(k.start)} kerupuk. Sampai sekarang sudah laku ${fmt(k.sold)}.`],q:'Berapa kerupuk Bu Dewi sekarang?',answer:k.remain,unit:'kerupuk',hint:'Kurangi kerupuk yang dibawa dengan yang sudah laku. Mulai dari satuan, lalu puluhan, lalu ratusan.',formula:`${fmt(k.start)} − ${fmt(k.sold)} = ${fmt(k.remain)}`},
        {type:'count',visual:{kind:'place',theme:'kerupuk',value:k.remain,delivery:k.delivery},say:['vendor',`Nanti siang datang kiriman ${fmt(k.delivery)} kerupuk lagi. Truknya sudah kelihatan!`],q:'Jadi, berapa kerupuk Bu Dewi setelah kiriman datang?',answer:k.final,unit:'kerupuk',hint:'Jumlahkan kerupuk yang ada dengan kerupuk kiriman. Mulai dari satuan, lalu puluhan, lalu ratusan.',formula:`${fmt(k.remain)} + ${fmt(k.delivery)} = ${fmt(k.final)}`}];}
      case 'perabot':{const p=t.perabot;return [
        {type:'count',visual:{kind:'stacks',stacks:p.stacks,per:p.per},say:['vendor',`Piring-piringku kutumpuk rapi. Setiap tumpuk isinya ${p.per} piring.`],q:`Ada ${p.stacks} tumpuk. Berapa piring semuanya?`,answer:p.total,unit:'piring',hint:`Ketuk tumpukan sambil menghitung loncat ${p.per}: ${p.per}, ${p.per*2}, ${p.per*3}, …`,formula:`${p.stacks} × ${p.per} = ${p.total}`},
        {type:'count',visual:{kind:'stacks',stacks:p.buy,per:p.per},say:['ibu',`Pak Slamet, saya beli ${p.buy} tumpuk, ya.`],q:`Ibu membeli ${p.buy} tumpuk piring. Berapa piring yang dibeli Ibu?`,answer:p.bought,unit:'piring',hint:`Hitung loncat ${p.per} sebanyak ${p.buy} kali.`,formula:`${p.buy} × ${p.per} = ${p.bought}`}];}
      case 'jajan':{const j=t.jajan;return [
        {type:'share',n:j.n,boxes:j.boxes,say:['ibu',`Bu Rini, saya pesan ${j.n} kue untuk arisan. Tolong dibagi rata ke ${j.boxes} kotak, ya. Bantu Bu Rini, Nak!`],q:'Berapa kue di setiap kotak?',answer:j.each,unit:'kue',hint:'Ketuk nampan kue untuk membagikan satu kue ke setiap kotak. Ulangi sampai kuenya habis, lalu hitung isi satu kotak.',formula:`${j.n} kue dibagi ${j.boxes} kotak = ${j.each} kue per kotak`}];}
    }
  }
  function homeSteps(t){
    const v=t.diary.vals,[i,j]=t.diary.pair,a=v[i],b=v[j],sorted=[...v].sort((x,y)=>x[1]-y[1]),big=a[1]>b[1]?a:b,small=big===a?b:a;
    return [
      {type:'sort',items:v,say:['kid','Hari ini aku menghitung banyak sekali! Aku tulis di buku harian, ah.'],q:'Ketuk kartu dari yang paling sedikit sampai yang paling banyak.',answer:sorted.map(x=>x[0]).join('|'),hint:'Bandingkan ratusannya dulu. Kalau sama, bandingkan puluhannya, lalu satuannya.',formula:sorted.map(x=>fmt(x[1])).join(' < ')},
      {type:'compare',items:[a,b],say:['ibu','Coba Ibu tanya, Nak…'],q:`Mana yang lebih banyak: ${a[0].split(' ')[1].toLowerCase()} atau ${b[0].split(' ')[1].toLowerCase()}?`,answer:big[0],hint:'Bandingkan angka ratusannya dulu, lalu puluhan, lalu satuan.',formula:`${fmt(big[1])} > ${fmt(small[1])}`},
      {type:'count',visual:{kind:'pair',items:[a,b]},say:['ibu','Pintar! Sekarang yang terakhir.'],q:`Berapa selisih ${a[0].split(' ')[1].toLowerCase()} dan ${b[0].split(' ')[1].toLowerCase()}?`,answer:big[1]-small[1],unit:'',hint:'Selisih artinya yang lebih banyak dikurangi yang lebih sedikit.',formula:`${fmt(big[1])} − ${fmt(small[1])} = ${fmt(big[1]-small[1])}`}
    ];
  }
  const totalSteps=t=>STALLS.reduce((s,x)=>s+steps(t,x.id).length,0)+homeSteps(t).length;
  return {STALLS,createTrip,steps,homeSteps,totalSteps};
});
