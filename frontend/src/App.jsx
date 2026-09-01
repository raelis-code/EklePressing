import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, Check, ChevronRight, ClipboardList, Clock3, Droplets,
  Headphones, MapPin, Package, Phone, Shirt, Sparkles, Truck, UserRound,
  WashingMachine, X, Menu, MessageCircle, Search, ShieldCheck, HeartHandshake,
  LayoutDashboard, Users, BarChart3, LogOut, Plus, Pencil, Trash2, RefreshCw, Mail, DollarSign,
  ClipboardCheck, LogIn
} from 'lucide-react'

const API = '/api'
const WHATSAPP = '237695286454'
const PHONE = '+237 69 52 86 54'

const fallbackPlans = [
  { id:'essential', name:'Forfait Essentiel', price:5000, accent:'blue', items:['Lavage','Séchage','Repassage léger'] },
  { id:'confort', name:'Forfait Confort', price:10000, accent:'green', items:['Lavage','Séchage','Repassage','Parfum du linge'] },
  { id:'premium', name:'Forfait Premium', price:15000, accent:'purple', items:['Lavage premium','Séchage délicat','Repassage parfait','Parfum du linge','Pliage soigné'] }
]

function App() {
  const [plans, setPlans] = useState(fallbackPlans)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [modal, setModal] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [trackingId, setTrackingId] = useState('')
  const [trackedOrder, setTrackedOrder] = useState(null)
  const [toast, setToast] = useState('')
  const [authMode, setAuthMode] = useState(false)
  const [adminMode, setAdminMode] = useState(false)
  const [clientMode, setClientMode] = useState(false)
  const [clientSession, setClientSession] = useState(() => { try { return JSON.parse(localStorage.getItem('ekle_client_session') || 'null') } catch { return null } })

  useEffect(() => {
    fetch(`${API}/plans`).then(r => r.json()).then(setPlans).catch(() => {})
  }, [])

  const openOrder = (plan) => {
    if (!clientSession) { setAuthMode(true); return }
    setSelectedPlan(plan || null)
    setModal('order')
  }

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 3500)
  }

  const trackOrder = async () => {
    if (!trackingId.trim()) return
    try {
      const res = await fetch(`${API}/orders/${trackingId.trim()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setTrackedOrder(data)
      setModal('tracking')
    } catch {
      showToast('Commande introuvable. Vérifiez votre numéro de commande.')
    }
  }

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior:'smooth' })
    setMobileMenu(false)
  }

  if (adminMode) return <AdminPanel plans={plans} setPlans={setPlans} onExit={()=>setAdminMode(false)} showToast={showToast}/>
  if (clientMode) return <ClientPanel session={clientSession} setSession={setClientSession} onExit={()=>setClientMode(false)} showToast={showToast} onOrder={()=>{setClientMode(false);setSelectedPlan(null);setModal('order')}}/>
  if (authMode) return <LoginChoice onClose={()=>setAuthMode(false)} onAdmin={()=>{setAuthMode(false);setAdminMode(true)}} onClient={(session)=>{setClientSession(session);setAuthMode(false);setClientMode(true)}}/>

  return (
    <div className="app">
      <header className="navbar glass">
        <button className="brand" onClick={() => scrollTo('home')} aria-label="Accueil">
          <img src="/ekle-clean-logo.png" alt="Eklé Clean" />
        </button>

        <nav className={mobileMenu ? 'nav-links open' : 'nav-links'}>
          <button className="active" onClick={() => scrollTo('home')}>Accueil</button>
          <button onClick={() => scrollTo('plans')}>Nos Forfaits</button>
          <button onClick={() => scrollTo('tracking')}>Suivi Commande</button>
          <button onClick={() => scrollTo('about')}>À propos</button>
          <button onClick={() => scrollTo('contact')}>Contact</button>
        </nav>

        <div className="nav-actions">
          <a className="phone-link" href={`tel:${PHONE.replaceAll(' ','')}`}><Phone size={18}/><span>{PHONE}</span></a>
          <button className="admin-login-btn" onClick={() => setAuthMode(true)}><LogIn size={17}/> Connexion</button>
          <button className="primary small" onClick={() => scrollTo('contact')}>Nous contacter <MessageCircle size={17}/></button>
        </div>
        <button className="menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>
          {mobileMenu ? <X/> : <Menu/>}
        </button>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="hero-bg"></div>
          <div className="hero-copy reveal">
            <div className="eyebrow"><Sparkles size={17}/> Propreté garantie 100%</div>
            <h1>Votre linge mérite<br/><span>le meilleur soin</span></h1>
            <p>Eklé Clean s'occupe de votre linge avec professionnalisme.<br/>Rapide, propre et fiable.</p>

            <div className="trust-row">
              <div><Truck size={17}/> Collecte & Livraison</div>
              <div><Shirt size={17}/> Qualité Premium</div>
              <div><Check size={17}/> Satisfaction Garantie</div>
            </div>

            <div className="hero-buttons">
              <button className="primary" onClick={() => openOrder()}>Commander maintenant <ArrowRight size={19}/></button>
              <button className="outline" onClick={() => scrollTo('plans')}>Voir nos forfaits</button>
            </div>
          </div>

          <div className="hero-visual reveal delay-1">
            <div className="floating-badge"><Sparkles size={22}/><strong>Propreté<br/>Garantie<br/>100%</strong></div>
            <div className="laundry-scene">
              <div className="washer"><WashingMachine size={130}/></div>
              <div className="towels">
                <i></i><i></i><i></i><i></i><i></i>
              </div>
              <div className="basket"><Package size={40}/></div>
            </div>
          </div>

          <div className="tracking-card glass reveal delay-2">
            <div className="card-title"><Package size={21}/> <span>Suivre ma commande</span></div>
            <p>Entrez votre numéro de commande</p>
            <div className="input-wrap"><Search size={18}/><input value={trackingId} onChange={e=>setTrackingId(e.target.value)} placeholder="Ex: EKL-2026-A1B2C3"/></div>
            <button className="primary full" onClick={trackOrder}>Suivre</button>
            <div className="delivery-note"><Truck size={34}/><div><b>Livraison rapide</b><span>À domicile, partout où vous êtes !</span></div></div>
          </div>
        </section>

        <section id="plans" className="section plans-section">
          <div className="section-heading">
            <span>Nos Forfaits</span>
            <h2>Un service adapté à votre quotidien</h2>
            <p>Choisissez le niveau de soin qui correspond à vos besoins.</p>
          </div>

          <div className="plans-grid">
            {plans.map((plan, i) => (
              <article key={plan.id} className={`plan-card ${plan.accent} ${i === 1 ? 'popular' : ''}`}>
                {i === 1 && <div className="popular-tag">LE PLUS POPULAIRE</div>}
                <div className="plan-icon">{i===0?<WashingMachine/>:i===1?<Shirt/>:<Sparkles/>}</div>
                <span className="plan-name">{plan.name}</span>
                <div className="price">{plan.price.toLocaleString('fr-FR')} <small>FCFA</small></div>
                <ul>{plan.items.map(item => <li key={item}><Check size={16}/>{item}</li>)}</ul>
                <button className="plan-btn" onClick={() => openOrder(plan)}>Choisir ce forfait <ArrowRight size={17}/></button>
              </article>
            ))}
          </div>

          <div className="benefit-banner">
            <Truck size={38}/>
            <div><b>Collecte & Livraison GRATUITES !</b><span>Profitez de notre service à domicile sans frais supplémentaires.</span></div>
          </div>
        </section>

        <section id="about" className="section how-section">
          <div className="section-heading">
            <span>Simple & rapide</span>
            <h2>Comment ça marche ?</h2>
          </div>
          <div className="steps">
            {[
              [ClipboardList,'Commandez','Remplissez le formulaire en ligne en quelques clics.'],
              [Package,'Collecte','Nous collectons votre linge à l’adresse indiquée.'],
              [WashingMachine,'Traitement','Votre linge est lavé avec soin et professionnalisme.'],
              [Shirt,'Repassage','Repassé et plié avec le plus grand soin.'],
              [Truck,'Livraison','Livré propre et parfumé à votre porte.']
            ].map(([Icon,title,text], i) => (
              <div className="step" key={title}>
                <div className="step-line"></div>
                <div className="step-icon"><Icon/></div>
                <div className="step-number">{i+1}</div>
                <h3>{title}</h3><p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="quality-strip">
          <div><ShieldCheck/><b>Satisfait ou remboursé !</b><span>Votre satisfaction avant tout.</span></div>
          <div><Clock3/><b>Service rapide</b><span>Des délais respectés.</span></div>
          <div><HeartHandshake/><b>Soin du linge</b><span>Traitement délicat et professionnel.</span></div>
          <div className="help"><Headphones/><b>Besoin d'aide ?</b><strong>{PHONE}</strong></div>
        </section>

        <section id="contact" className="contact-section">
          <div className="contact-copy">
            <span>Contact</span>
            <h2>Besoin d'une information ?</h2>
            <p>Notre équipe est disponible pour vous accompagner et répondre à vos questions.</p>
            <div className="contact-info"><Phone/><div><b>Téléphone</b><a href={`tel:${PHONE.replaceAll(' ','')}`}>{PHONE}</a></div></div>
            <div className="contact-info"><MapPin/><div><b>Zone de service</b><span>Yaoundé et environs</span></div></div>
          </div>
          <ContactForm onSuccess={showToast}/>
        </section>
      </main>

      <div className="floating-actions">
        <a className="float-call" href={`tel:${PHONE.replaceAll(' ','')}`}><Phone/></a>
        <a className="float-wa" href={`https://wa.me/${WHATSAPP}?text=Bonjour%20Eklé%20Clean,%20je%20souhaite%20avoir%20des%20informations.`} target="_blank" rel="noreferrer"><MessageCircle/></a>
      </div>

      <footer><img src="/ekle-clean-logo.png" alt="Eklé Clean"/><span>© 2026 Eklé Clean — La propreté qui se voit.</span><button className="admin-entry" onClick={()=>setAuthMode(true)}><LogIn size={14}/> Connexion</button></footer>

      {modal === 'order' && <OrderModal plan={selectedPlan} plans={plans} session={clientSession} onClose={()=>setModal(null)} onNeedLogin={()=>{setModal(null);setAuthMode(true)}} onSuccess={(order)=>{setModal(null); setTrackedOrder(order); setTrackingId(order.id); showToast(`Commande ${order.id} créée avec succès.`); if(clientSession) setClientMode(true)}}/>}
      {modal === 'tracking' && <TrackingModal order={trackedOrder} onClose={()=>setModal(null)}/>}
      {toast && <div className="toast"><Check size={18}/>{toast}</div>}
    </div>
  )
}


function LoginChoice({onClose,onAdmin,onClient}) {
  const [view,setView]=useState('choice')
  const [mode,setMode]=useState('login')
  const [form,setForm]=useState({firstName:'',lastName:'',email:'',phone:'',password:''})
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const submit=async e=>{
    e.preventDefault(); setLoading(true); setError('')
    try{
      const endpoint=mode==='register'?'/api/client/register':'/api/client/login'
      const body=mode==='register'?form:{email:form.email,password:form.password}
      const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
      const raw=await res.text()
      let data={}
      try { data=raw ? JSON.parse(raw) : {} } catch { data={} }
      if(!res.ok) throw new Error(data.message || `Erreur serveur (${res.status})`)
      if(!data.token) throw new Error('Le serveur n’a pas renvoyé la session client. Vérifiez que le backend fonctionne sur le port 5000.')
      localStorage.setItem('ekle_client_session',JSON.stringify(data)); onClient(data)
    }catch(err){setError(err?.message || 'Impossible de contacter le serveur.')} finally{setLoading(false)}
  }
  if(view==='choice') return <div className="auth-page"><div className="auth-card"><button className="close auth-close" onClick={onClose}><X/></button><img src="/ekle-clean-logo.png" alt="Eklé Clean"/><span className="auth-kicker">ACCÈS À VOTRE ESPACE</span><h1>Connexion</h1><p>Choisissez votre type de compte pour continuer.</p><div className="auth-options"><button className="auth-option admin" onClick={onAdmin}><div className="auth-option-icon"><ShieldCheck/></div><div><b>Administrateur</b><small>Gérer les commandes, forfaits, clients et messages</small></div><ChevronRight/></button><button className="auth-option client" onClick={()=>setView('client')}><div className="auth-option-icon"><UserRound/></div><div><b>Client</b><small>Créer un compte, passer des commandes et suivre leur progression</small></div><ChevronRight/></button></div><button className="back-link" onClick={onClose}>← Retour au site</button></div></div>
  return <div className="auth-page"><div className="client-login-card"><button className="close auth-close" onClick={onClose}><X/></button><img src="/ekle-clean-logo.png" alt="Eklé Clean"/><div className="client-icon"><UserRound/></div><span>ESPACE CLIENT</span><h1>{mode==='register'?'Créer mon compte':'Connexion client'}</h1><p>{mode==='register'?'Créez votre compte pour conserver toutes vos commandes et les retrouver à tout moment.':'Connectez-vous pour retrouver votre historique de commandes.'}</p><div className="auth-tabs"><button className={mode==='login'?'active':''} onClick={()=>{setMode('login');setError('')}}>Connexion</button><button className={mode==='register'?'active':''} onClick={()=>{setMode('register');setError('')}}>Créer un compte</button></div>{error&&<div className="form-error">{error}</div>}<form onSubmit={submit}>{mode==='register'&&<><label>Prénom<input required value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})}/></label><label>Nom<input required value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})}/></label><label>Téléphone<input required type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label></>}<label>Email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Mot de passe<input required minLength={6} type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label><button className="primary full" disabled={loading}>{loading?'Veuillez patienter...':mode==='register'?'Créer mon compte':'Se connecter'} <ArrowRight size={18}/></button></form><button className="back-link" onClick={()=>setView('choice')}>← Choisir un autre espace</button></div></div>
}

function ClientPanel({session,setSession,onExit,showToast,onOrder}) {
  const [orders,setOrders]=useState([])
  const [loading,setLoading]=useState(false)
  const [selectedOrder,setSelectedOrder]=useState(null)
  const statuses=['Commande reçue','Collecte','Lavage','Repassage','Prête','Livrée']
  const load=async()=>{ if(!session?.token)return; setLoading(true); try{const res=await fetch(`${API}/client/orders`,{headers:{Authorization:`Bearer ${session.token}`}});const data=await res.json();if(!res.ok)throw new Error(data.message||'Impossible de charger vos commandes.');setOrders(data);if(selectedOrder){const fresh=data.find(o=>o.id===selectedOrder.id);if(fresh)setSelectedOrder(fresh)}}catch(err){showToast(err.message);if(String(err.message).includes('Session')){localStorage.removeItem('ekle_client_session');setSession(null)}}finally{setLoading(false)}}
  useEffect(()=>{load()},[session?.token])
  const logout=async()=>{try{await fetch(`${API}/client/logout`,{method:'POST',headers:{Authorization:`Bearer ${session.token}`}})}catch{} localStorage.removeItem('ekle_client_session');setSession(null);onExit()}
  const currentStatus=o=>statuses.indexOf(o?.status||'Commande reçue')
  if(!session)return <div className="auth-page"><div className="auth-card"><UserRound size={45}/><h1>Connexion requise</h1><p>Connectez-vous ou créez un compte client pour passer une commande.</p><button className="primary" onClick={onExit}>Retour</button></div></div>
  return <div className="client-page client-dashboard"><header className="client-topbar"><div className="client-brand"><img src="/ekle-clean-logo.png" alt="Eklé Clean"/><span>ESPACE CLIENT</span></div><div className="client-actions"><span>{session.firstName} {session.lastName}</span><button onClick={logout}><LogOut size={16}/> Déconnexion</button><button className="outline" onClick={onExit}>Voir le site</button></div></header><main className="client-main"><div className="client-welcome"><div><span>MON ESPACE</span><h1>Mes commandes</h1><p>Bonjour {session.firstName}, retrouvez ici toutes vos commandes, même celles passées les jours précédents.</p></div><div className="client-welcome-actions"><button className="primary" onClick={onOrder}>+ Nouvelle commande</button><button className="outline" onClick={load}><RefreshCw size={16}/> Actualiser</button></div></div><div className="history-note"><ClipboardList size={18}/><span>Votre historique est conservé dans votre compte. Cliquez sur une commande pour voir sa progression.</span></div><div className="client-order-grid">{orders.map(o=>{const current=currentStatus(o);return <button className="client-order-card clickable" key={o.id} onClick={()=>setSelectedOrder(o)}><div className="client-order-head"><div><span>NUMÉRO DE COMMANDE</span><h3>{o.id}</h3></div><em className={o.status==='Livrée'?'done':''}>{o.status}</em></div><div className="client-order-info"><div><small>Forfait</small><b>{o.planName}</b></div><div><small>Montant</small><b>{Number(o.price).toLocaleString('fr-FR')} FCFA</b></div><div><small>Date</small><b>{new Date(o.createdAt).toLocaleDateString('fr-FR')}</b></div><div><small>Quartier</small><b>{o.neighborhood}</b></div></div><div className="client-progress">{statuses.map((s,i)=><div key={s} className={i<=current?'active':''}><i></i><small>{s}</small></div>)}</div><div className="view-order-link">Voir le détail et la progression <ChevronRight size={15}/></div></button>})}</div>{!orders.length&&<div className="client-empty"><Package size={38}/><h3>Aucune commande</h3><p>Passez votre première commande pour commencer votre historique.</p><button className="primary" onClick={onOrder}>Commander maintenant <ArrowRight size={17}/></button></div>}{selectedOrder&&<ClientOrderDetail order={selectedOrder} statuses={statuses} onClose={()=>setSelectedOrder(null)}/>}</main></div>
}

function ClientOrderDetail({order,statuses,onClose}){const current=statuses.indexOf(order.status);return <div className="modal-backdrop"><div className="modal order-detail-modal"><button className="close" onClick={onClose}><X/></button><span className="eyebrow">SUIVI DE COMMANDE</span><h2>{order.id}</h2><p>Votre commande est actuellement : <b>{order.status}</b></p><div className="detail-grid"><div><small>Forfait</small><b>{order.planName}</b></div><div><small>Montant</small><b>{Number(order.price).toLocaleString('fr-FR')} FCFA</b></div><div><small>Date</small><b>{new Date(order.createdAt).toLocaleString('fr-FR')}</b></div><div><small>Adresse</small><b>{order.neighborhood}, porte {order.doorNumber}</b></div></div><div className="progress-track">{statuses.map((s,i)=><div className={`progress-step ${i<=current?'done':''}`} key={s}><div className="progress-dot">{i<current?<Check size={14}/>:i===current?<WashingMachine size={14}/>:<span>{i+1}</span>}</div><b>{s}</b></div>)}</div><button className="primary full" onClick={onClose}>Fermer</button></div></div>}

function AdminPanel({plans,setPlans,onExit,showToast}) {
  const [logged,setLogged]=useState(localStorage.getItem('ekle_admin') === '1')
  const [login,setLogin]=useState({email:'admin@ekleclean.cm',password:'admin123'})
  const [tab,setTab]=useState('dashboard')
  const [stats,setStats]=useState(null)
  const [orders,setOrders]=useState([])
  const [contacts,setContacts]=useState([])
  const [customers,setCustomers]=useState([])
  const [editing,setEditing]=useState(null)
  const [form,setForm]=useState({name:'',price:'',accent:'blue',items:''})
  const [loading,setLoading]=useState(false)
  const adminFetch=async (url,options={})=>{
    const token=localStorage.getItem('ekle_admin_token')
    const headers={...(options.headers||{}),...(token?{Authorization:`Bearer ${token}`}:{})}
    let response
    try { response=await fetch(url,{...options,headers}) }
    catch { throw new Error('Backend inaccessible. Lancez le serveur avec: npm run dev --prefix backend') }
    let data=null
    try { data=await response.json() } catch {}
    if(response.status===401){ localStorage.removeItem('ekle_admin'); localStorage.removeItem('ekle_admin_token'); setLogged(false); throw new Error('Session administrateur expirée. Veuillez vous reconnecter.') }
    if(!response.ok) throw new Error(data?.message || `Erreur HTTP ${response.status}`)
    return data
  }

  const load=async()=>{
    try {
      const [st,ord,msg,pl,cust]=await Promise.all([adminFetch(`${API}/admin/stats`),adminFetch(`${API}/admin/orders`),adminFetch(`${API}/admin/contacts`),adminFetch(`${API}/admin/plans`),adminFetch(`${API}/admin/customers`)])
      setStats(st); setOrders(ord); setContacts(msg); setPlans(pl); setCustomers(cust)
    } catch (err) { showToast(err.message || 'Impossible de charger les données administrateur.') }
  }
  useEffect(()=>{ if(logged) load() },[logged])

  const doLogin=async e=>{
    e.preventDefault(); setLoading(true)
    try {
      let r
      try { r=await fetch(`${API}/admin/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(login)}) }
      catch { throw new Error('Backend inaccessible. Lancez le serveur avec: npm run dev --prefix backend') }
      const d=await r.json().catch(()=>({}))
      if(!r.ok) throw new Error(d.message || 'Connexion impossible.')
      localStorage.setItem('ekle_admin','1'); localStorage.setItem('ekle_admin_token',d.token); setLogged(true); showToast('Bienvenue dans l’administration.')
    } catch(err){showToast(err.message)} finally{setLoading(false)}
  }
  const logout=()=>{localStorage.removeItem('ekle_admin');localStorage.removeItem('ekle_admin_token');setLogged(false)}
  const updateStatus=async(id,status)=>{ try { await adminFetch(`${API}/admin/orders/${id}/status`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})}); await load(); showToast('Statut de la commande mis à jour.') } catch(err){showToast(err.message)} }
  const savePlan=async e=>{
    e.preventDefault(); const payload={name:form.name,price:Number(form.price),accent:form.accent,items:form.items.split(',').map(x=>x.trim()).filter(Boolean)}
    const url=editing?`${API}/admin/plans/${editing}`:`${API}/admin/plans`; const method=editing?'PATCH':'POST'
    try { await adminFetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); const wasEditing=Boolean(editing); setEditing(null); setForm({name:'',price:'',accent:'blue',items:''}); await load(); showToast(wasEditing?'Forfait modifié.':'Forfait ajouté.') } catch(err){showToast(err.message)}
  }
  const deletePlan=async id=>{if(!confirm('Supprimer ce forfait ?'))return; try {await adminFetch(`${API}/admin/plans/${id}`,{method:'DELETE'});await load();showToast('Forfait supprimé.')} catch(err){showToast(err.message)}}
  const startEdit=p=>{setEditing(p.id);setForm({name:p.name,price:p.price,accent:p.accent,items:p.items.join(', ')})}

  if(!logged) return <div className="admin-login-page"><div className="admin-login-card"><img src="/ekle-clean-logo.png"/><div className="admin-lock"><ShieldCheck/></div><span>ESPACE SÉCURISÉ</span><h1>Administration</h1><p>Connectez-vous pour gérer Eklé Clean.</p><form onSubmit={doLogin}><label>Email<input type="email" value={login.email} onChange={e=>setLogin({...login,email:e.target.value})}/></label><label>Mot de passe<input type="password" value={login.password} onChange={e=>setLogin({...login,password:e.target.value})}/></label><button className="primary full" disabled={loading}>{loading?'Connexion...':'Se connecter'} <ArrowRight size={18}/></button></form><button className="back-link" onClick={onExit}>← Retour au site</button><small>Démo : admin@ekleclean.cm / admin123</small></div></div>

  const nav=[['dashboard','Dashboard',LayoutDashboard],['orders','Commandes',ClipboardCheck],['plans','Forfaits',WashingMachine],['customers','Clients',Users],['messages','Messages',Mail]]
  return <div className="admin-app">
    <aside className="admin-sidebar"><div className="admin-brand"><img src="/ekle-clean-logo.png"/><span>ADMIN</span></div><div className="admin-nav">{nav.map(([id,label,Icon])=><button className={tab===id?'selected':''} onClick={()=>setTab(id)} key={id}><Icon size={19}/>{label}</button>)}</div><div className="admin-side-bottom"><button onClick={load}><RefreshCw size={17}/> Actualiser</button><button onClick={logout}><LogOut size={17}/> Déconnexion</button><button onClick={onExit} className="back-site">← Voir le site</button></div></aside>
    <main className="admin-main"><header className="admin-topbar"><div><span>ESPACE ADMINISTRATEUR</span><h1>{tab==='dashboard'?'Vue d’ensemble':tab==='orders'?'Gestion des commandes':tab==='plans'?'Gestion des forfaits':tab==='customers'?'Gestion des clients':'Messages clients'}</h1></div><div className="admin-user"><div className="avatar">A</div><div><b>Administrateur</b><small>Super Admin</small></div></div></header>
      {tab==='dashboard' && <Dashboard stats={stats} orders={orders}/>}
      {tab==='orders' && <OrdersAdmin orders={orders} updateStatus={updateStatus}/>}
      {tab==='customers' && <CustomersAdmin customers={customers}/>}
      {tab==='plans' && <PlansAdmin plans={plans} form={form} setForm={setForm} editing={editing} setEditing={setEditing} savePlan={savePlan} startEdit={startEdit} deletePlan={deletePlan}/>}
      {tab==='messages' && <MessagesAdmin contacts={contacts}/>}
    </main>
  </div>
}

function Dashboard({stats,orders}) {
  const cards=[['Commandes',stats?.totalOrders??0,ClipboardCheck],['Commandes actives',stats?.activeOrders??0,Package],['Chiffre d’affaires',`${(stats?.revenue??0).toLocaleString('fr-FR')} FCFA`,DollarSign],['Messages',stats?.contacts??0,Mail]]
  return <div className="admin-content"><div className="stat-grid">{cards.map(([label,val,Icon])=><div className="stat-card" key={label}><div className="stat-icon"><Icon/></div><div><span>{label}</span><strong>{val}</strong></div></div>)}</div><div className="admin-grid-2"><div className="admin-card"><div className="card-header"><div><span>ACTIVITÉ</span><h2>Commandes récentes</h2></div><BarChart3/></div>{orders.slice(0,5).map(o=><div className="mini-row" key={o.id}><div><b>{o.id}</b><small>{o.firstName} {o.lastName} · {o.planName}</small></div><strong>{o.price.toLocaleString('fr-FR')} FCFA</strong><em className={o.status==='Livrée'?'done':''}>{o.status}</em></div>)}{!orders.length&&<div className="empty">Aucune commande pour le moment.</div>}</div><div className="admin-card"><div className="card-header"><div><span>STATUTS</span><h2>Suivi opérationnel</h2></div><ClipboardCheck/></div>{Object.entries(stats?.byStatus||{}).map(([s,n])=><div className="bar-row" key={s}><div><span>{s}</span><b>{n}</b></div><i><u style={{width:`${Math.min(100,n*20)}%`}}></u></i></div>)}{!Object.keys(stats?.byStatus||{}).length&&<div className="empty">Les statistiques apparaîtront après la première commande.</div>}</div></div></div>
}

function OrdersAdmin({orders,updateStatus}) { const statuses=['Commande reçue','Collecte','Lavage','Repassage','Prête','Livrée']; return <div className="admin-content"><div className="admin-card table-card"><div className="card-header"><div><span>OPERATIONS</span><h2>Toutes les commandes</h2></div><span className="count-pill">{orders.length} commande(s)</span></div><div className="table-wrap"><table><thead><tr><th>Commande</th><th>Client</th><th>Forfait</th><th>Montant</th><th>Statut</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><b>{o.id}</b><small>{new Date(o.createdAt).toLocaleString('fr-FR')}</small></td><td>{o.firstName} {o.lastName}<small>{o.phone} · {o.neighborhood}</small></td><td>{o.planName}</td><td><b>{o.price.toLocaleString('fr-FR')} FCFA</b></td><td><select value={o.status} onChange={e=>updateStatus(o.id,e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table></div>{!orders.length&&<div className="empty">Aucune commande enregistrée.</div>}</div></div> }

function CustomersAdmin({customers}) { return <div className="admin-content"><div className="admin-card table-card"><div className="card-header"><div><span>CLIENTS</span><h2>Clients enregistrés</h2></div><span className="count-pill">{customers.length} client(s)</span></div><div className="table-wrap"><table><thead><tr><th>Client</th><th>Téléphone</th><th>Quartier</th><th>Commandes</th><th>Total dépensé</th></tr></thead><tbody>{customers.map(c=><tr key={c.id}><td><b>{c.name}</b><small>Dernière commande : {new Date(c.lastOrder).toLocaleDateString('fr-FR')}</small></td><td>{c.phone}</td><td>{c.neighborhood}</td><td><b>{c.orders}</b></td><td><b>{c.totalSpent.toLocaleString('fr-FR')} FCFA</b></td></tr>)}</tbody></table></div>{!customers.length&&<div className="empty">Les clients apparaîtront après leur première commande.</div>}</div></div> }

function PlansAdmin({plans,form,setForm,editing,setEditing,savePlan,startEdit,deletePlan}) { return <div className="admin-content"><div className="admin-grid-2 plans-admin-grid"><div className="admin-card"><div className="card-header"><div><span>CATALOGUE</span><h2>Forfaits actuels</h2></div><WashingMachine/></div>{plans.map(p=><div className="plan-admin-row" key={p.id}><div className={`plan-dot ${p.accent}`}></div><div><b>{p.name}</b><small>{p.items.join(' · ')}</small></div><strong>{p.price.toLocaleString('fr-FR')} FCFA</strong><button onClick={()=>startEdit(p)}><Pencil size={15}/></button><button onClick={()=>deletePlan(p.id)}><Trash2 size={15}/></button></div>)}</div><div className="admin-card"><div className="card-header"><div><span>{editing?'MODIFICATION':'NOUVEAU'}</span><h2>{editing?'Modifier le forfait':'Ajouter un forfait'}</h2></div><Plus/></div><form className="admin-form" onSubmit={savePlan}><label>Nom<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Prix (FCFA)<input required type="number" min={0} value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label><label>Couleur<select value={form.accent} onChange={e=>setForm({...form,accent:e.target.value})}><option value="blue">Bleu</option><option value="green">Vert</option><option value="purple">Violet</option></select></label><label>Prestations<input placeholder="Lavage, Séchage, Repassage" value={form.items} onChange={e=>setForm({...form,items:e.target.value})}/></label><div className="admin-form-actions"><button className="primary">{editing?'Enregistrer':'Ajouter'} <ArrowRight size={17}/></button>{editing&&<button type="button" className="outline" onClick={()=>{setEditing(null);setForm({name:'',price:'',accent:'blue',items:''})}}>Annuler</button>}</div></form></div></div></div> }

function MessagesAdmin({contacts}) { return <div className="admin-content"><div className="admin-card"><div className="card-header"><div><span>CLIENTS</span><h2>Messages reçus</h2></div><Mail/></div><div className="messages-list">{contacts.map(m=><article key={m.id}><div className="message-avatar"><UserRound/></div><div><b>{m.name}</b><small>{m.phone} · {new Date(m.createdAt).toLocaleString('fr-FR')}</small><p>{m.message}</p></div></article>)}{!contacts.length&&<div className="empty">Aucun message reçu.</div>}</div></div></div> }


function OrderModal({plan,plans,session,onClose,onNeedLogin,onSuccess}) {
  const [selected,setSelected]=useState(plan || null)
  const [form,setForm]=useState({firstName:session?.firstName||'',lastName:session?.lastName||'',neighborhood:'',doorNumber:'',phone:session?.phone||''})
  const [loading,setLoading]=useState(false)
  const submit=async e=>{e.preventDefault();if(!session?.token){onNeedLogin();return}if(!selected){alert('Veuillez sélectionner un forfait avant de continuer.');return}setLoading(true);try{const res=await fetch(`${API}/orders`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.token}`},body:JSON.stringify({...form,planId:selected.id})});const data=await res.json();if(!res.ok)throw new Error(data.message);onSuccess(data)}catch(err){alert(`Impossible d'enregistrer la commande.\n\n${err.message||'Serveur inaccessible'}`)}finally{setLoading(false)}}
  return <div className="modal-backdrop"><div className="modal"><button className="close" onClick={onClose}><X/></button><div className="modal-head"><Sparkles/><div><span>{selected?'Votre sélection':'Choisissez votre forfait'}</span><h2>{selected?selected.name:'Sélectionnez un forfait'}</h2>{selected&&<b>{selected.price.toLocaleString('fr-FR')} FCFA / mois</b>}</div></div>{!selected&&<div className="plan-picker"><p className="picker-label">Aucun forfait n'est sélectionné par défaut. Choisissez celui qui vous convient :</p><div className="picker-grid">{plans.map(p=><button type="button" key={p.id} className={`picker-option ${p.accent}`} onClick={()=>setSelected(p)}><span>{p.name}</span><strong>{p.price.toLocaleString('fr-FR')} FCFA</strong><small>{p.items.join(' · ')}</small></button>)}</div></div>}{selected&&<form onSubmit={submit} className="form-grid"><label>Prénom<input required value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})}/></label><label>Nom<input required value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})}/></label><label>Quartier<input required value={form.neighborhood} onChange={e=>setForm({...form,neighborhood:e.target.value})}/></label><label>N° de porte<input required value={form.doorNumber} onChange={e=>setForm({...form,doorNumber:e.target.value})}/></label><label className="full-field">Numéro de téléphone<input required type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><div className="full-field selected-plan-actions"><button type="button" className="outline" onClick={()=>setSelected(null)}>Changer de forfait</button><button className="primary" disabled={loading}>{loading?'Enregistrement...':'Enregistrer ma commande'} <ArrowRight size={18}/></button></div></form>}</div></div>
}
function TrackingModal({order,onClose}) {
  const statuses=['Commande reçue','Collecte','Lavage','Repassage','Prête','Livrée']
  const current=statuses.indexOf(order?.status ?? 'Commande reçue')
  return <div className="modal-backdrop"><div className="modal tracking-modal">
    <button className="close" onClick={onClose}><X/></button>
    <span className="eyebrow">Suivi en temps réel</span>
    <h2>Commande {order?.id}</h2>
    <p>Bonjour {order?.firstName}, voici l'avancement de vos habits.</p>
    <div className="progress-track">
      {statuses.map((s,i)=><div className={`progress-step ${i<=current?'done':''}`} key={s}><div className="progress-dot">{i<current?<Check size={14}/>:i===current?<WashingMachine size={14}/>:<span>{i+1}</span>}</div><b>{s}</b></div>)}
    </div>
    <div className="order-summary"><span>Forfait</span><b>{order?.planName}</b><span>Total</span><b>{order?.price?.toLocaleString('fr-FR')} FCFA</b></div>
  </div></div>
}

function ContactForm({onSuccess}) {
  const [form,setForm]=useState({name:'',phone:'',message:''})
  const submit=async e=>{
    e.preventDefault()
    try{
      const res=await fetch(`${API}/contact`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
      const data=await res.json()
      if(!res.ok) throw new Error(data.message)
      setForm({name:'',phone:'',message:''}); onSuccess(data.message)
    }catch(err){alert(err.message)}
  }
  return <form className="contact-form" onSubmit={submit}>
    <label>Nom<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
    <label>Téléphone<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label>
    <label>Votre message<textarea required rows="5" value={form.message} onChange={e=>setForm({...form,message:e.target.value})}></textarea></label>
    <button className="primary">Envoyer le message <ArrowRight size={18}/></button>
  </form>
}

export default App
