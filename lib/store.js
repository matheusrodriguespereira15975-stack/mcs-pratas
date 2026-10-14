import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import seed from './seed.js';

function db(){
  if(!getApps().length){
    if(!process.env.FIREBASE_SERVICE_ACCOUNT)throw new Error('Defina FIREBASE_SERVICE_ACCOUNT nas variáveis de ambiente.');
    initializeApp({credential:cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))});
  }
  return getFirestore();
}
const col=()=>db().collection('products');

export async function listAll(){
  let s=await col().orderBy('order').get();
  if(s.empty){ // primeira execução: grava os 6 produtos originais (uma única vez)
    const flag=db().doc('meta/seeded');
    if(!(await flag.get()).exists){
      const b=db().batch();
      seed.forEach((p,i)=>b.set(col().doc(String(p.id)),{...p,order:i}));
      b.set(flag,{at:Date.now()});await b.commit();
      s=await col().orderBy('order').get();
    }
  }
  return s.docs.map(d=>d.data());
}
export async function getOne(id){const d=await col().doc(String(id)).get();return d.exists?d.data():null}
export async function lastOrder(){const s=await col().orderBy('order','desc').limit(1).get();return s.empty?-1:s.docs[0].data().order}
export async function nextId(){
  const ref=db().doc('meta/counter');
  return db().runTransaction(async t=>{
    const s=await t.get(ref);
    const n=s.exists?s.data().next:Math.max(0,...seed.map(p=>p.id))+1;
    t.set(ref,{next:n+1});return n;
  });
}
export const upsert=(id,item,order)=>col().doc(String(id)).set({...item,id,...(order!=null&&{order})},{merge:true});
export const remove=id=>col().doc(String(id)).delete();
export async function reorder(ids){
  const b=db().batch();ids.forEach((id,i)=>b.update(col().doc(String(id)),{order:i}));await b.commit();
}
