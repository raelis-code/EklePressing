import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const PORT = Number(process.env.PORT || 5000)
const HOST = process.env.HOST || '127.0.0.1'
const DATA_FILE = path.join(__dirname, 'data.json')
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ekleclean.cm'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'ekle-admin-demo-token'

const defaultData = {
  plans: [
    { id:'essential', name:'Forfait Essentiel', price:5000, accent:'blue', items:['Lavage','Séchage','Repassage léger'] },
    { id:'confort', name:'Forfait Confort', price:10000, accent:'green', items:['Lavage','Séchage','Repassage','Parfum du linge'] },
    { id:'premium', name:'Forfait Premium', price:15000, accent:'purple', items:['Lavage premium','Séchage délicat','Repassage parfait','Parfum du linge','Pliage soigné'] }
  ],
  clients: [], orders: [], contacts: []
}

function ensureDataFile(){ if(!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE,JSON.stringify(defaultData,null,2),'utf8') }
function readData(){
  ensureDataFile()
  try{
    const parsed=JSON.parse(fs.readFileSync(DATA_FILE,'utf8'))
    return {
      plans:Array.isArray(parsed.plans)?parsed.plans:[...defaultData.plans],
      clients:Array.isArray(parsed.clients)?parsed.clients:[],
      orders:Array.isArray(parsed.orders)?parsed.orders:[],
      contacts:Array.isArray(parsed.contacts)?parsed.contacts:[]
    }
  }catch{
    fs.writeFileSync(DATA_FILE,JSON.stringify(defaultData,null,2),'utf8'); return structuredClone(defaultData)
  }
}
function writeData(data){
  // Use a Windows-safe write strategy. A rename over an existing file can fail
  // on some Windows setups and can make the HTTP request end without JSON.
  const tmp=`${DATA_FILE}.tmp`
  const payload=JSON.stringify(data,null,2)
  fs.writeFileSync(tmp,payload,'utf8')
  try { fs.renameSync(tmp,DATA_FILE) }
  catch (err) {
    try { fs.writeFileSync(DATA_FILE,payload,'utf8'); if(fs.existsSync(tmp)) fs.unlinkSync(tmp) }
    catch (fallbackErr) { if(fs.existsSync(tmp)) fs.unlinkSync(tmp); throw fallbackErr }
  }
}
function normalizePhone(v){ return String(v||'').replace(/\D/g,'') }
function hashPassword(password,salt=crypto.randomBytes(16).toString('hex')){ return `${salt}:${crypto.scryptSync(String(password),salt,64).toString('hex')}` }
function verifyPassword(password,stored){ try{ const [salt,key]=String(stored).split(':'); if(!salt||!key)return false; const actual=crypto.scryptSync(String(password),salt,64).toString('hex'); return crypto.timingSafeEqual(Buffer.from(actual,'hex'),Buffer.from(key,'hex')) }catch{return false} }
function newToken(prefix='client'){ return `${prefix}-${crypto.randomBytes(24).toString('hex')}` }
function getBearer(req){ return req.headers.authorization?.replace(/^Bearer\s+/i,'') || '' }

ensureDataFile(); app.disable('x-powered-by'); app.use(cors({origin:true})); app.use(express.json({limit:'1mb'}))
const adminOnly=(req,res,next)=>{ if(getBearer(req)!==ADMIN_TOKEN) return res.status(401).json({message:'Accès administrateur requis.'}); next() }
const clientAuth=(req,res,next)=>{
  const token=getBearer(req); if(!token)return res.status(401).json({message:'Connexion client requise.'})
  const data=readData(); const client=data.clients.find(c=>c.sessionToken===token)
  if(!client)return res.status(401).json({message:'Session client expirée. Veuillez vous reconnecter.'})
  req.client=client; next()
}

app.get('/api/health',(req,res)=>res.json({ok:true,service:'Eklé Clean API',time:new Date().toISOString()}))
app.get('/api/plans',(req,res)=>res.json(readData().plans))

// Client accounts
app.post('/api/client/register',(req,res)=>{
  const {firstName,lastName,email,phone,password}=req.body||{}
  if(![firstName,lastName,email,phone,password].every(v=>String(v??'').trim())) return res.status(400).json({message:'Tous les champs sont obligatoires.'})
  if(String(password).length<6)return res.status(400).json({message:'Le mot de passe doit contenir au moins 6 caractères.'})
  const data=readData(); const cleanEmail=String(email).trim().toLowerCase(); const cleanPhone=String(phone).trim()
  if(data.clients.some(c=>c.email===cleanEmail))return res.status(409).json({message:'Cette adresse email est déjà utilisée.'})
  if(data.clients.some(c=>normalizePhone(c.phone)===normalizePhone(cleanPhone)))return res.status(409).json({message:'Ce numéro de téléphone est déjà associé à un compte.'})
  const client={id:`CLI-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,firstName:String(firstName).trim(),lastName:String(lastName).trim(),email:cleanEmail,phone:cleanPhone,passwordHash:hashPassword(password),sessionToken:newToken(),createdAt:new Date().toISOString()}
  data.clients.push(client); writeData(data)
  res.status(201).json({id:client.id,firstName:client.firstName,lastName:client.lastName,email:client.email,phone:client.phone,token:client.sessionToken})
})
app.post('/api/client/login',(req,res)=>{
  const {email,password}=req.body||{}; const data=readData(); const client=data.clients.find(c=>c.email===String(email||'').trim().toLowerCase())
  if(!client||!verifyPassword(password,client.passwordHash))return res.status(401).json({message:'Email ou mot de passe incorrect.'})
  client.sessionToken=newToken(); writeData(data)
  res.json({id:client.id,firstName:client.firstName,lastName:client.lastName,email:client.email,phone:client.phone,token:client.sessionToken})
})
app.get('/api/client/me',clientAuth,(req,res)=>{ const {passwordHash,sessionToken,...safe}=req.client; res.json(safe) })
app.post('/api/client/logout',clientAuth,(req,res)=>{ const data=readData(); const c=data.clients.find(x=>x.id===req.client.id); if(c){c.sessionToken=null;writeData(data)} res.json({ok:true}) })

// Orders require a logged-in client
app.post('/api/orders',clientAuth,(req,res)=>{
  const {firstName,lastName,neighborhood,doorNumber,phone,planId}=req.body||{}
  if(![firstName,lastName,neighborhood,doorNumber,phone,planId].every(v=>String(v??'').trim())) return res.status(400).json({message:'Tous les champs sont obligatoires.'})
  const data=readData(); const plan=data.plans.find(p=>p.id===planId); if(!plan)return res.status(400).json({message:'Forfait invalide ou indisponible.'})
  const order={id:`EKL-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,clientId:req.client.id,firstName:String(firstName).trim(),lastName:String(lastName).trim(),neighborhood:String(neighborhood).trim(),doorNumber:String(doorNumber).trim(),phone:String(phone).trim(),planId:plan.id,planName:plan.name,price:Number(plan.price),status:'Commande reçue',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}
  data.orders.unshift(order); writeData(data); res.status(201).json(order)
})
app.get('/api/orders/:id',(req,res)=>{ const order=readData().orders.find(o=>o.id.toUpperCase()===req.params.id.toUpperCase()); if(!order)return res.status(404).json({message:'Commande introuvable.'}); res.json(order) })
app.get('/api/client/orders',clientAuth,(req,res)=>{ const data=readData(); const wanted=normalizePhone(req.client.phone); const orders=data.orders.filter(o=>o.clientId===req.client.id || normalizePhone(o.phone)===wanted).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)); let changed=false; for(const o of orders){ if(!o.clientId){o.clientId=req.client.id; changed=true} } if(changed) writeData(data); res.json(orders) })

app.post('/api/contact',(req,res)=>{ const {name,phone,message}=req.body||{}; if(![name,phone,message].every(v=>String(v??'').trim()))return res.status(400).json({message:'Veuillez remplir les champs du formulaire.'}); const data=readData(); data.contacts.unshift({id:`MSG-${Date.now()}`,name:String(name).trim(),phone:String(phone).trim(),message:String(message).trim(),createdAt:new Date().toISOString()}); writeData(data); res.status(201).json({ok:true,message:'Message reçu. Eklé Clean vous répondra rapidement.'}) })

app.post('/api/admin/login',(req,res)=>{ const {email,password}=req.body||{}; if(email!==ADMIN_EMAIL||password!==ADMIN_PASSWORD)return res.status(401).json({message:'Identifiants administrateur incorrects.'}); res.json({id:'admin-1',name:'Administrateur',email:ADMIN_EMAIL,token:ADMIN_TOKEN}) })
app.use('/api/admin',adminOnly)
app.get('/api/admin/stats',(req,res)=>{ const {orders,contacts,clients}=readData(); const revenue=orders.reduce((s,o)=>s+Number(o.price||0),0); const byStatus=orders.reduce((a,o)=>(a[o.status]=(a[o.status]||0)+1,a),{}); const byPlan=orders.reduce((a,o)=>(a[o.planName]=(a[o.planName]||0)+1,a),{}); res.json({totalOrders:orders.length,revenue,contacts:contacts.length,totalClients:clients.length,activeOrders:orders.filter(o=>o.status!=='Livrée').length,byStatus,byPlan}) })
app.get('/api/admin/orders',(req,res)=>res.json(readData().orders))
app.patch('/api/admin/orders/:id/status',(req,res)=>{ const allowed=['Commande reçue','Collecte','Lavage','Repassage','Prête','Livrée']; const {status}=req.body||{}; if(!allowed.includes(status))return res.status(400).json({message:'Statut invalide.'}); const data=readData(); const o=data.orders.find(x=>x.id===req.params.id); if(!o)return res.status(404).json({message:'Commande introuvable.'}); o.status=status;o.updatedAt=new Date().toISOString();writeData(data);res.json(o) })
app.delete('/api/admin/orders/:id',(req,res)=>{ const data=readData(); const n=data.orders.length; data.orders=data.orders.filter(o=>o.id!==req.params.id); if(data.orders.length===n)return res.status(404).json({message:'Commande introuvable.'});writeData(data);res.json({ok:true}) })
app.get('/api/admin/contacts',(req,res)=>res.json(readData().contacts))
app.get('/api/admin/plans',(req,res)=>res.json(readData().plans))
app.post('/api/admin/plans',(req,res)=>{ const {name,price,accent='blue',items=[]}=req.body||{};const n=Number(price);if(!String(name||'').trim()||!Number.isFinite(n)||n<0)return res.status(400).json({message:'Nom et prix valides obligatoires.'});const data=readData();const p={id:`plan-${Date.now()}`,name:String(name).trim(),price:n,accent,items:Array.isArray(items)?items.filter(Boolean):[]};data.plans.push(p);writeData(data);res.status(201).json(p) })
app.patch('/api/admin/plans/:id',(req,res)=>{const data=readData();const p=data.plans.find(x=>x.id===req.params.id);if(!p)return res.status(404).json({message:'Forfait introuvable.'});const {name,price,accent,items}=req.body||{};if(name!==undefined)p.name=String(name).trim();if(price!==undefined){const n=Number(price);if(!Number.isFinite(n)||n<0)return res.status(400).json({message:'Prix invalide.'});p.price=n}if(accent!==undefined)p.accent=accent;if(items!==undefined)p.items=Array.isArray(items)?items.filter(Boolean):[];writeData(data);res.json(p)})
app.delete('/api/admin/plans/:id',(req,res)=>{const data=readData();const n=data.plans.length;data.plans=data.plans.filter(p=>p.id!==req.params.id);if(data.plans.length===n)return res.status(404).json({message:'Forfait introuvable.'});if(!data.plans.length)return res.status(400).json({message:'Conservez au moins un forfait actif.'});writeData(data);res.json({ok:true})})
app.get('/api/admin/customers',(req,res)=>{const data=readData();res.json(data.clients.map(c=>{const os=data.orders.filter(o=>o.clientId===c.id);return{id:c.id,name:`${c.firstName} ${c.lastName}`,email:c.email,phone:c.phone,orders:os.length,totalSpent:os.reduce((s,o)=>s+Number(o.price||0),0),lastOrder:os[0]?.createdAt||c.createdAt}}))})

app.use((err,req,res,next)=>{
  console.error('API error:',err)
  if(res.headersSent) return next(err)
  res.status(500).json({message:err?.message || 'Erreur interne du serveur.'})
})
process.on('uncaughtException',(err)=>console.error('Uncaught exception:',err))
process.on('unhandledRejection',(err)=>console.error('Unhandled rejection:',err))
const server=app.listen(PORT,HOST,()=>console.log(`Eklé Clean API running on http://${HOST}:${PORT}`))
process.on('SIGINT',()=>server.close(()=>process.exit(0))); process.on('SIGTERM',()=>server.close(()=>process.exit(0)))
