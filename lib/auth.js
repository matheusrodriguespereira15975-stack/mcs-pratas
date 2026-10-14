import crypto from 'node:crypto';
const secret=()=>process.env.SESSION_SECRET||process.env.ADMIN_PASSWORD||'';
const sign=p=>crypto.createHmac('sha256',secret()).update(p).digest('base64url');
const eq=(a,b)=>a.length===b.length&&crypto.timingSafeEqual(a,b);
export function makeToken(){const p=Buffer.from(JSON.stringify({exp:Date.now()+7*864e5})).toString('base64url');return p+'.'+sign(p)}
export function isAuthed(req){
  const [p,s]=(req.headers.authorization||'').replace('Bearer ','').split('.');
  if(!p||!s||!secret())return false;
  if(!eq(Buffer.from(s),Buffer.from(sign(p))))return false;
  try{return JSON.parse(Buffer.from(p,'base64url')).exp>Date.now()}catch{return false}
}
export const checkPassword=pw=>eq(Buffer.from(String(pw||'')),Buffer.from(process.env.ADMIN_PASSWORD||''));
