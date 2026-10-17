(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.Market=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const catalog=[
    {id:'sayur',name:'Kios Sayuran',vendor:'Bu Sari',icon:'🥬',color:'#58a966',items:[['Wortel','🥕','buah',1000,2000],['Kentang','🥔','buah',1000,2000],['Tomat','🍅','buah',1000,2000],['Bayam','🥬','ikat',2000,3000]]},
    {id:'daging',name:'Kios Daging',vendor:'Pak Budi',icon:'🍗',color:'#da8276',items:[['Ayam','🍗','bungkus',4000,6000],['Daging sapi','🥩','bungkus',5000,7000]]},
    {id:'bersih',name:'Kios Kebersihan',vendor:'Bu Rini',icon:'🧼',color:'#63aabb',items:[['Sabun','🧼','batang',2000,3000],['Odol','🪥','tube',3000,4000],['Obat pel','🧴','botol',3000,5000]]},
    {id:'buah',name:'Kios Buah',vendor:'Pak Joko',icon:'🍊',color:'#e7aa4c',items:[['Jeruk','🍊','buah',1000,2000],['Pisang','🍌','buah',1000,2000],['Apel','🍎','buah',2000,3000]]},
    {id:'sembako',name:'Kios Sembako',vendor:'Bu Dewi',icon:'🥚',color:'#9d8bbf',items:[['Telur','🥚','butir',2000,3000],['Beras','🍚','bungkus',4000,5000],['Gula','🛍️','bungkus',3000,4000]]}
  ];
  function createGame(random=Math.random){
    const pick=(a)=>a[Math.floor(random()*a.length)];
    const stalls=catalog.map(stall=>{
      const available=[...stall.items];const items=[];
      for(let i=0;i<2;i++){const raw=available.splice(Math.floor(random()*available.length),1)[0];items.push({name:raw[0],icon:raw[1],unit:raw[2],price:pick([raw[3],raw[4]]),qty:pick([1,2,3]),selected:0});}
      return {...stall,items,done:false};
    });
    let cost=stalls.reduce((sum,s)=>sum+total(s),0);
    while(cost>78000){const reducible=stalls.flatMap(s=>s.items).filter(i=>i.qty>1).sort((a,b)=>b.price-a.price);reducible[0].qty--;cost-=reducible[0].price;}
    const budget=Math.ceil((cost+pick([8000,10000]))/10000)*10000;
    return {stalls,budget,balance:budget,lives:3,correct:0,mistakes:0,finished:false};
  }
  const rp=n=>n.toLocaleString('id-ID');
  const total=s=>s.items.reduce((sum,i)=>sum+i.qty*i.price,0);
  function questions(stall,balance){const [a,b]=stall.items;return [
    {kind:'jumlah',title:'Berapa jumlah barangnya?',text:`Ada ${a.qty} ${a.unit} ${a.name.toLowerCase()} dan ${b.qty} ${b.unit} ${b.name.toLowerCase()}. Berapa jumlah semua barang?`,answer:a.qty+b.qty,unit:'barang',hint:`Jumlahkan kedua jumlah barang: ${a.qty} + ${b.qty}.`,formula:`${a.qty} + ${b.qty} = ${a.qty+b.qty}`},
    {kind:'kali',title:`Hitung harga ${a.name.toLowerCase()}`,text:`Harga satu ${a.unit} ${a.name.toLowerCase()} Rp${a.price.toLocaleString('id-ID')}. Berapa harga ${a.qty} ${a.unit}?`,answer:a.qty*a.price,unit:'rupiah',hint:`Perkalian adalah penjumlahan berulang. Jumlahkan ${a.price.toLocaleString('id-ID')} sebanyak ${a.qty} kali.`,formula:`${a.qty} × ${a.price.toLocaleString('id-ID')} = ${(a.qty*a.price).toLocaleString('id-ID')}`},
    {kind:'total',title:'Berapa yang harus dibayar?',text:`Harga ${a.name.toLowerCase()} seluruhnya Rp${(a.qty*a.price).toLocaleString('id-ID')} dan ${b.name.toLowerCase()} Rp${(b.qty*b.price).toLocaleString('id-ID')}. Berapa total belanja di kios ini?`,answer:total(stall),unit:'rupiah',hint:'Jumlahkan harga kedua jenis barang, bukan harga satuannya.',formula:`${rp(a.qty*a.price)} + ${rp(b.qty*b.price)} = ${rp(total(stall))}`},
    {kind:'sisa',title:'Hitung sisa uang di dompet',text:`Uangmu Rp${balance.toLocaleString('id-ID')}. Belanja ini Rp${total(stall).toLocaleString('id-ID')}. Berapa sisa uangmu setelah membayar?`,answer:balance-total(stall),unit:'rupiah',hint:'Kurangi uang di dompet dengan total belanja kios ini.',formula:`${rp(balance)} − ${rp(total(stall))} = ${rp(balance-total(stall))}`}
  ];}
  function parseAnswer(value){const v=String(value).trim().replace(/^rp\.?\s*/i,'').replace(/\s+/g,'');if(!/^\d+(?:[.,]\d{3})*$/.test(v))return null;return Number(v.replace(/[.,]/g,''));}
  function answer(game,expected,value){const n=parseAnswer(value);if(n===null)return {valid:false};if(game.lives===0||game.finished)return {valid:false};if(n===expected){game.correct++;return {valid:true,correct:true};}game.lives--;game.mistakes++;return {valid:true,correct:false};}
  function pay(game,stall){if(stall.done||game.lives===0||game.finished)return false;game.balance-=total(stall);stall.done=true;return true;}
  return {catalog,createGame,total,questions,parseAnswer,answer,pay};
});
