import { put, del } from '@vercel/blob';
import { listAll, getOne, lastOrder, nextId, upsert, remove, reorder } from '../lib/store.js';
import { isAuthed, makeToken, checkPassword } from '../lib/auth.js';
const str=(v,n)=>String(v??'').trim().slice(0,n);
const rm=async u=>{if(u&&u.includes('blob.vercel-storage.com'))try{await del(u)}catch{}};
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  const b=req.body||{},bad=(m,c=400)=>res.status(c).json({error:m});
  try{
    if(!process.env.ADMIN_PASSWORD)return bad('Defina ADMIN_PASSWORD nas variáveis de ambiente da Vercel.',500);
    if(req.method==='POST'&&b.action==='login'){
      if(!checkPassword(b.password)){await new Promise(r=>setTimeout(r,800));return bad('Senha incorreta.',401)}
      return res.json({token:makeToken()});
    }
    if(!isAuthed(req))return bad('Sessão expirada.',401);
    if(req.method==='GET')return res.json({products:await listAll()});
    if(req.method!=='POST')return bad('Método inválido.',405);

    if(b.action==='upload'){
      const m=/^data:(image\/(?:webp|jpeg|png));base64,(.+)$/.exec(b.dataUrl||'');
      if(!m)return bad('Imagem inválida.');
      const buf=Buffer.from(m[2],'base64');if(buf.length>3e6)return bad('Imagem muito grande.');
      const r=await put(`produtos/${Date.now()}.${m[1].split('/')[1]}`,buf,{access:'public',contentType:m[1],addRandomSuffix:true});
      return res.json({url:r.url});
    }
    if(b.action==='save'){
      const q=b.product||{},price=Number(q.price),name=str(q.name,80),category=str(q.category,40),image=str(q.image,600);
      if(!name||!category||!Number.isFinite(price)||price<0)return bad('Preencha nome, categoria e um preço válido.');
      if(!/^(\/|https:\/\/)/.test(image))return bad('Envie a foto do produto.');
      const item={name,category,image,code:str(q.code,30),price:Math.round(price*100)/100,badge:str(q.badge,24),description:str(q.description,500),active:q.active!==false};
      if(q.id){
        const cur=await getOne(q.id);if(!cur)return bad('Produto não encontrado.',404);
        if(cur.image!==image)await rm(cur.image);
        await upsert(cur.id,item);
      }else await upsert(await nextId(),item,(await lastOrder())+1);
    }else if(b.action==='delete'){
      const p=await getOne(b.id);if(!p)return bad('Produto não encontrado.',404);
      await rm(p.image);await remove(b.id);
    }else if(b.action==='reorder'){
      if(!Array.isArray(b.ids))return bad('Ordem inválida.');
      await reorder(b.ids);
    }else return bad('Ação inválida.');
    res.json({products:await listAll()});
  }catch(e){console.error(e);bad('Erro no servidor: '+e.message,500)}
}
