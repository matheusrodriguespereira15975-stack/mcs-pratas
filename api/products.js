import { listAll } from '../lib/store.js';
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  try{res.json({products:(await listAll()).filter(p=>p.active!==false)})}
  catch(e){console.error(e);res.status(500).json({error:'Falha ao carregar produtos'})}
}
