import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const code=await readFile(new URL('../public/transitions.js',import.meta.url),'utf8');
const classes=()=>{const values=new Set();return {add:(...v)=>v.forEach(x=>values.add(x)),remove:(...v)=>v.forEach(x=>values.delete(x)),contains:v=>values.has(v),toggle:(v,on)=>on?values.add(v):values.delete(v)};};
function fixture({url='/shop/',products=[],reduced=false,previous=null}={}){
 const events={},documentEvents={},storage=new Map();
 const makeProduct=(id,type='card',x=0)=>({dataset:{productId:id},isConnected:true,hidden:false,classList:classes(),matches:s=>s==='.product-detail'&&type==='detail',getBoundingClientRect:()=>({left:x,top:200,right:x+300,bottom:600}),parts:['image','name','price'].map(part=>({dataset:{transitionPart:part},style:{removeProperty(name){delete this[name==='view-transition-name'?'viewTransitionName':'viewTransitionClass'];}}})),querySelectorAll(){return this.parts;}});
 const elements=products.map(p=>makeProduct(...p));
 const root={classList:classes()},header={classList:classes()};
 const location={href:'http://localhost:4173'+url,origin:'http://localhost:4173'};
 const document={documentElement:root,head:{append(){}},querySelector:s=>s==='.site-header'?header:null,querySelectorAll:s=>s==='[data-product-id]'?elements:[],addEventListener:(n,f)=>documentEvents[n]=f,createElement:()=>({})};
 const window={addEventListener:(n,f)=>events[n]=f,navigation:{activation:{from:previous?{url:'http://localhost:4173'+previous}:null}}};
 vm.runInNewContext(code,{window,document,location,matchMedia:()=>({matches:reduced}),navigator:{},innerWidth:1000,innerHeight:800,scrollY:0,URL,Date,setTimeout,clearTimeout,sessionStorage:{setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k)}});
 const transition=()=>{let finish;return {finished:new Promise(resolve=>finish=resolve),finish,skipped:false,skipTransition(){this.skipped=true;}};};
 return {events,documentEvents,elements,root,storage,transition};
}
const names=product=>product.parts.map(p=>p.style.viewTransitionName);
const expected=['perfume-image','perfume-name','perfume-price'];
test('only the chosen card is captured, even with duplicate fragrance presentations',async()=>{
 const f=fixture({products:[['millionaire','hero'],['millionaire','card'],['dubai','card']]});
 const clicked=f.elements[1];const anchor={href:'http://localhost:4173/product/millionaire-50ml/',target:'',hasAttribute:()=>false,closest:()=>clicked};
 f.documentEvents.click({target:{closest:()=>anchor},button:0});
 const vt=f.transition();f.events.pageswap({viewTransition:vt,activation:{entry:{url:anchor.href}}});
 assert.deepEqual(names(clicked),expected);assert.deepEqual(names(f.elements[0]),[undefined,undefined,undefined]);assert.deepEqual(names(f.elements[2]),[undefined,undefined,undefined]);
 vt.finish();await vt.finished;await Promise.resolve();assert.deepEqual(names(clicked),[undefined,undefined,undefined]);assert(!f.root.classList.contains('product-transition'));
});
test('detail arrival captures the image, name and price in the new page',async()=>{
 const f=fixture({url:'/product/dubai-50ml/',products:[['dubai','detail'],['sultan','card']],previous:'/collections/royal-luxury/'});const vt=f.transition();
 f.events.pagereveal({viewTransition:vt});assert.deepEqual(names(f.elements[0]),expected);assert(f.root.classList.contains('page-arriving'));
 vt.finish();await vt.finished;await Promise.resolve();assert(!f.root.classList.contains('page-arriving'));
});
test('back navigation pairs the detail with its collection card',()=>{
 const outgoing=fixture({url:'/product/dubai-50ml/',products:[['dubai','detail'],['sultan','card']]});const out=outgoing.transition();outgoing.events.pageswap({viewTransition:out,activation:{entry:{url:'http://localhost:4173/collections/royal-luxury/'}}});assert.deepEqual(names(outgoing.elements[0]),expected);
 const incoming=fixture({url:'/collections/royal-luxury/',products:[['al-sheikh','card'],['dubai','card'],['sultan','card']],previous:'/product/dubai-50ml/'});incoming.events.pagereveal({viewTransition:incoming.transition()});assert.deepEqual(names(incoming.elements[1]),expected);assert.deepEqual(names(incoming.elements[0]),[undefined,undefined,undefined]);
});
test('related product navigation captures the destination card rather than the old detail',()=>{
 const f=fixture({url:'/product/dubai-50ml/',products:[['dubai','detail'],['al-sheikh','card']]});f.events.pageswap({viewTransition:f.transition(),activation:{entry:{url:'http://localhost:4173/product/al-sheikh-50ml/'}}});assert.deepEqual(names(f.elements[1]),expected);assert.deepEqual(names(f.elements[0]),[undefined,undefined,undefined]);
});
test('reduced motion skips both outgoing and incoming transitions',()=>{
 const f=fixture({url:'/product/dubai-50ml/',products:[['dubai','detail']],reduced:true});for(const event of ['pageswap','pagereveal']){const vt=f.transition();f.events[event]({viewTransition:vt});assert(vt.skipped);assert.deepEqual(names(f.elements[0]),[undefined,undefined,undefined]);}
});
test('missing activation APIs use the same-origin journey record for return navigation',()=>{
 const f=fixture({url:'/collections/royal-luxury/',products:[['dubai','card']]});f.storage.set('omario-journey',JSON.stringify({from:'http://localhost:4173/product/dubai-50ml/',to:null,at:Date.now()}));f.events.pagereveal({viewTransition:f.transition()});assert.deepEqual(names(f.elements[0]),expected);
});
test('normal navigation without native transitions remains unmodified',()=>{
 const f=fixture({products:[['dubai','card']]});f.events.pageswap({});f.events.pagereveal({});assert.deepEqual(names(f.elements[0]),[undefined,undefined,undefined]);assert(!f.root.classList.contains('product-transition'));
});
