import { useState, useEffect, useRef, createContext, useContext } from "react";
import {
  Send, Users, BarChart3, LogOut, Moon, Sun, Menu, ChevronRight, Zap, Search, Upload,
  CheckCircle, AlertCircle, Eye, Download, TrendingUp, Mail, Settings, PieChart, Plus,
  RefreshCw, Play, Pause, Hash, Globe, Phone, Image, FileText, Video, Mic, Calendar,
  Clock, X, Paperclip, ChevronDown
} from "lucide-react";
import { authApi, messagesApi, campaignsApi, groupsApi, contactsApi, reportsApi, instancesApi } from "./api";

// ==================== THEME ====================
const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);
function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => { try { return localStorage.getItem('zapechat_theme') !== 'light'; } catch { return true; } });
  const toggle = () => setDark(d => { localStorage.setItem('zapechat_theme', !d ? 'dark' : 'light'); return !d; });
  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>;
}

// ==================== COLORS ====================
const C = (dark) => dark ? {
  bg:"#0a0f1a",bgCard:"#111827",bgCardHover:"#1a2236",bgSidebar:"#0d1220",bgInput:"#1a2236",
  border:"#1e293b",text:"#f1f5f9",textSec:"#94a3b8",textMut:"#64748b",
  accent:"#10b981",accentGlow:"rgba(16,185,129,0.15)",accentSoft:"rgba(16,185,129,0.1)",
  violet:"#8b5cf6",violetGlow:"rgba(139,92,246,0.15)",
  danger:"#ef4444",dangerSoft:"rgba(239,68,68,0.1)",
  warn:"#f59e0b",warnSoft:"rgba(245,158,11,0.1)",
  ok:"#10b981",okSoft:"rgba(16,185,129,0.1)",
  info:"#3b82f6",infoSoft:"rgba(59,130,246,0.1)",
  shadow:"0 4px 24px rgba(0,0,0,0.3)",shadowLg:"0 8px 40px rgba(0,0,0,0.4)",
} : {
  bg:"#f8fafc",bgCard:"#ffffff",bgCardHover:"#f1f5f9",bgSidebar:"#ffffff",bgInput:"#f1f5f9",
  border:"#e2e8f0",text:"#0f172a",textSec:"#475569",textMut:"#94a3b8",
  accent:"#059669",accentGlow:"rgba(5,150,105,0.1)",accentSoft:"rgba(5,150,105,0.08)",
  violet:"#7c3aed",violetGlow:"rgba(124,58,237,0.1)",
  danger:"#dc2626",dangerSoft:"rgba(220,38,38,0.08)",
  warn:"#d97706",warnSoft:"rgba(217,119,6,0.08)",
  ok:"#059669",okSoft:"rgba(5,150,105,0.08)",
  info:"#2563eb",infoSoft:"rgba(37,99,235,0.08)",
  shadow:"0 4px 24px rgba(0,0,0,0.06)",shadowLg:"0 8px 40px rgba(0,0,0,0.08)",
};

// ==================== HELPERS ====================
const inp = (c) => ({width:"100%",padding:"12px 16px",background:c.bgInput,border:`1px solid ${c.border}`,borderRadius:"12px",color:c.text,fontSize:"14px",outline:"none",boxSizing:"border-box",fontFamily:"inherit",transition:"border-color 0.2s"});
const lbl = (c) => ({display:"block",color:c.textSec,fontSize:"12px",fontWeight:"600",marginBottom:"6px",letterSpacing:"0.5px",textTransform:"uppercase"});
const btn = (c,dis) => ({padding:"12px 24px",background:dis?c.textMut:`linear-gradient(135deg,${c.accent},${c.violet})`,border:"none",borderRadius:"12px",color:"white",fontSize:"14px",fontWeight:"700",cursor:dis?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",gap:"8px",boxShadow:dis?"none":`0 4px 20px ${c.accentGlow}`,transition:"all 0.2s"});
const btnSec = (c) => ({padding:"12px 24px",background:c.bgInput,border:`1px solid ${c.border}`,borderRadius:"12px",color:c.text,fontSize:"14px",fontWeight:"600",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"8px",transition:"all 0.2s"});
const card = (c) => ({background:c.bgCard,borderRadius:"16px",padding:"24px",border:`1px solid ${c.border}`});
const statusMap = {read:{l:"Lida",c:"info"},delivered:{l:"Entregue",c:"ok"},sent:{l:"Enviada",c:"textMut"},failed:{l:"Falhou",c:"danger"},pending:{l:"Pendente",c:"warn"}};
const badge = (c,status) => {const s=statusMap[status]||{l:status,c:"textMut"};const col=c[s.c]||c.textMut;const bg=c[s.c+"Soft"]||c.bgInput;return{fontSize:"11px",fontWeight:"600",padding:"3px 8px",borderRadius:"6px",background:bg,color:col};};

// ==================== TOAST ====================
function Toast({msg,type,onClose}){
  const{dark}=useTheme();const c=C(dark);
  useEffect(()=>{const t=setTimeout(onClose,4000);return()=>clearTimeout(t);},[]);
  const bg=type==="success"?c.okSoft:type==="error"?c.dangerSoft:c.warnSoft;
  const col=type==="success"?c.ok:type==="error"?c.danger:c.warn;
  const Icon=type==="success"?CheckCircle:AlertCircle;
  return(<div style={{position:"fixed",top:"20px",right:"20px",zIndex:9999,background:bg,border:`1px solid ${col}33`,borderRadius:"14px",padding:"14px 20px",display:"flex",alignItems:"center",gap:"10px",color:col,fontSize:"14px",fontWeight:"600",boxShadow:c.shadowLg,maxWidth:"400px",animation:"slideIn 0.3s ease"}}>
    <Icon size={18}/><span style={{flex:1}}>{msg}</span><X size={16} style={{cursor:"pointer",opacity:0.6}} onClick={onClose}/>
  </div>);
}

// ==================== MEDIA PICKER ====================
function MediaPicker({onSelect,selected,onRemove}){
  const{dark}=useTheme();const c=C(dark);const ref=useRef();
  const types=[{id:"image",icon:Image,label:"Imagem",accept:"image/jpeg,image/png,image/webp"},{id:"video",icon:Video,label:"Vídeo",accept:"video/mp4,video/webm"},{id:"audio",icon:Mic,label:"Áudio",accept:"audio/mpeg,audio/ogg,audio/mp4"},{id:"document",icon:FileText,label:"Documento",accept:".pdf,.docx,.xlsx,.txt,.csv"}];
  const[activeType,setActiveType]=useState(null);

  const handleFile=(e)=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{onSelect({file,type:activeType,name:file.name,size:file.size,preview:activeType==="image"?reader.result:null,url:reader.result});};
    reader.readAsDataURL(file);
    setActiveType(null);
  };

  if(selected)return(
    <div style={{background:c.bgInput,borderRadius:"12px",padding:"14px",display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px",border:`1px solid ${c.border}`}}>
      {selected.preview?<img src={selected.preview} alt="" style={{width:"60px",height:"60px",borderRadius:"8px",objectFit:"cover"}}/>:
      <div style={{width:"48px",height:"48px",borderRadius:"8px",background:c.accentSoft,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {selected.type==="video"?<Video size={20} color={c.accent}/>:selected.type==="audio"?<Mic size={20} color={c.accent}/>:<FileText size={20} color={c.accent}/>}
      </div>}
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:"13px",fontWeight:"600",color:c.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selected.name}</div>
        <div style={{fontSize:"12px",color:c.textMut}}>{(selected.size/1024).toFixed(0)} KB • {selected.type}</div>
      </div>
      <button onClick={onRemove} style={{background:"none",border:"none",cursor:"pointer",color:c.danger,padding:"4px"}}><X size={18}/></button>
    </div>
  );

  return(<div style={{marginBottom:"16px"}}>
    <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
      {types.map(t=>(
        <button key={t.id} onClick={()=>{setActiveType(t.id);setTimeout(()=>ref.current?.click(),50);}} style={{padding:"8px 14px",borderRadius:"10px",border:`1px solid ${c.border}`,background:c.bgInput,color:c.textSec,fontSize:"12px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",transition:"all 0.2s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=c.accent;e.currentTarget.style.color=c.accent;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=c.border;e.currentTarget.style.color=c.textSec;}}>
          <t.icon size={14}/>{t.label}
        </button>
      ))}
    </div>
    <input ref={ref} type="file" accept={types.find(t=>t.id===activeType)?.accept||"*"} onChange={handleFile} style={{display:"none"}}/>
  </div>);
}

// ==================== PREVIEW MODAL ====================
function PreviewModal({number,text,media,onConfirm,onCancel,sending}){
  const{dark}=useTheme();const c=C(dark);
  return(<div style={{position:"fixed",inset:0,zIndex:9998,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}} onClick={onCancel}>
    <div style={{background:c.bgCard,borderRadius:"20px",padding:"28px",maxWidth:"420px",width:"100%",border:`1px solid ${c.border}`,boxShadow:c.shadowLg}} onClick={e=>e.stopPropagation()}>
      <h3 style={{margin:"0 0 4px",fontSize:"17px",fontWeight:"700",color:c.text}}>Confirmar Envio</h3>
      <p style={{margin:"0 0 20px",fontSize:"13px",color:c.textMut}}>Revise antes de enviar</p>
      {/* WhatsApp-like bubble */}
      <div style={{background:dark?"#005c4b":"#dcf8c6",borderRadius:"12px 12px 12px 4px",padding:"12px 14px",marginBottom:"16px",maxWidth:"90%"}}>
        {media?.preview&&<img src={media.preview} alt="" style={{width:"100%",borderRadius:"8px",marginBottom:"8px"}}/>}
        {media&&!media.preview&&<div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",padding:"8px",background:"rgba(0,0,0,0.1)",borderRadius:"8px"}}>
          <FileText size={16}/><span style={{fontSize:"12px",fontWeight:"600"}}>{media.name}</span>
        </div>}
        {text&&<p style={{margin:0,fontSize:"14px",color:dark?"#e9edef":"#111b21",whiteSpace:"pre-wrap"}}>{text}</p>}
        <div style={{textAlign:"right",marginTop:"4px"}}><span style={{fontSize:"11px",color:dark?"#8696a0":"#667781"}}>{new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</span></div>
      </div>
      <div style={{background:c.bgInput,borderRadius:"10px",padding:"10px 14px",marginBottom:"20px",display:"flex",alignItems:"center",gap:"8px"}}>
        <Phone size={14} color={c.textMut}/><span style={{fontSize:"13px",color:c.textSec,fontFamily:"monospace"}}>{number}</span>
      </div>
      <div style={{display:"flex",gap:"10px",justifyContent:"flex-end"}}>
        <button onClick={onCancel} style={btnSec(c)}>Cancelar</button>
        <button onClick={onConfirm} disabled={sending} style={btn(c,sending)}>{sending?<RefreshCw size={16} style={{animation:"spin 1s linear infinite"}}/>:<Send size={16}/>}{sending?"Enviando...":"Confirmar Envio"}</button>
      </div>
    </div>
  </div>);
}

// ==================== STAT CARD ====================
function StatCard({icon:Icon,label,value,color,colorSoft,trend}){
  const{dark}=useTheme();const c=C(dark);
  return(<div style={{...card(c),position:"relative",overflow:"hidden",transition:"all 0.3s",cursor:"default"}}
    onMouseEnter={e=>{e.currentTarget.style.borderColor=color+"44";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=c.shadow;}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor=c.border;e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
    <div style={{position:"absolute",top:"-20px",right:"-20px",width:"80px",height:"80px",borderRadius:"50%",background:colorSoft,opacity:0.5}}/>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"14px"}}>
      <div style={{width:"42px",height:"42px",borderRadius:"12px",background:colorSoft,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon size={20} color={color}/></div>
      {trend&&<span style={{fontSize:"12px",fontWeight:"600",color:c.ok,display:"flex",alignItems:"center",gap:"3px"}}><TrendingUp size={13}/>{trend}</span>}
    </div>
    <div style={{fontSize:"28px",fontWeight:"800",color:c.text,letterSpacing:"-0.5px",lineHeight:1,marginBottom:"6px"}}>{typeof value==="number"?value.toLocaleString("pt-BR"):value}</div>
    <div style={{fontSize:"13px",color:c.textMut,fontWeight:"500"}}>{label}</div>
  </div>);
}

// ==================== LOGIN ====================
function LoginPage({onLogin}){
  const{dark,toggle}=useTheme();const c=C(dark);
  const[email,setEmail]=useState("");const[password,setPassword]=useState("");const[loading,setLoading]=useState(false);const[error,setError]=useState("");
  const handleSubmit=async()=>{if(!email||!password){setError("Preencha todos os campos");return;}setLoading(true);setError("");try{const{data}=await authApi.login(email,password);localStorage.setItem('zapechat_token',data.token);localStorage.setItem('zapechat_user',JSON.stringify(data.user));onLogin(data.user);}catch(err){setError(err.response?.data?.error||"Erro ao fazer login");}finally{setLoading(false);}};
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:dark?"radial-gradient(ellipse at 20% 50%,rgba(16,185,129,0.08) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(139,92,246,0.06) 0%,transparent 50%),#0a0f1a":"radial-gradient(ellipse at 20% 50%,rgba(5,150,105,0.06) 0%,transparent 50%),#f8fafc",padding:"20px",fontFamily:"'Segoe UI',-apple-system,sans-serif"}}>
      <button onClick={toggle} style={{position:"absolute",top:"24px",right:"24px",background:c.bgCard,border:`1px solid ${c.border}`,borderRadius:"12px",padding:"10px",cursor:"pointer",color:c.textSec,display:"flex",boxShadow:c.shadow}}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button>
      <div style={{width:"100%",maxWidth:"420px"}}>
        <div style={{textAlign:"center",marginBottom:"40px"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:"12px",marginBottom:"12px"}}>
            <div style={{width:"52px",height:"52px",borderRadius:"16px",background:`linear-gradient(135deg,${c.accent},${c.violet})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 8px 32px ${c.accentGlow}`}}><Zap size={26} color="white" strokeWidth={2.5}/></div>
            <span style={{fontSize:"32px",fontWeight:"800",color:c.text}}>Zapê<span style={{color:c.accent}}>Chat</span></span>
          </div>
          <p style={{color:c.textMut,fontSize:"15px",margin:0}}>Disparos inteligentes via WhatsApp</p>
        </div>
        <div style={{background:c.bgCard,borderRadius:"20px",padding:"36px",border:`1px solid ${c.border}`,boxShadow:c.shadowLg}}>
          <h2 style={{color:c.text,fontSize:"22px",fontWeight:"700",margin:"0 0 6px"}}>Bem-vindo de volta</h2>
          <p style={{color:c.textMut,fontSize:"14px",margin:"0 0 28px"}}>Entre na sua conta para continuar</p>
          {error&&<div style={{background:c.dangerSoft,border:`1px solid ${c.danger}33`,borderRadius:"12px",padding:"12px 16px",marginBottom:"20px",display:"flex",alignItems:"center",gap:"10px",color:c.danger,fontSize:"13px"}}><AlertCircle size={16}/>{error}</div>}
          <div style={{marginBottom:"18px"}}><label style={lbl(c)}>E-mail</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" style={inp(c)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/></div>
          <div style={{marginBottom:"28px"}}><label style={lbl(c)}>Senha</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={inp(c)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/></div>
          <button onClick={handleSubmit} disabled={loading} style={{...btn(c,loading),width:"100%",justifyContent:"center",padding:"14px"}}>{loading?<RefreshCw size={18} style={{animation:"spin 1s linear infinite"}}/>:<>Entrar<ChevronRight size={18}/></>}</button>
        </div>
        <p style={{textAlign:"center",color:c.textMut,fontSize:"13px",marginTop:"24px"}}>© 2026 ZapêChat</p>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes slideIn{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}} input::placeholder{color:${c.textMut}}`}</style>
    </div>
  );
}

// ==================== SIDEBAR ====================
function Sidebar({active,onNavigate,collapsed,user}){
  const{dark,toggle}=useTheme();const c=C(dark);
  const nav=[{id:"dashboard",icon:BarChart3,label:"Dashboard"},{id:"send",icon:Send,label:"Enviar Mensagem"},{id:"mass",icon:Mail,label:"Disparo em Massa"},{id:"groups",icon:Users,label:"Grupos"},{id:"reports",icon:PieChart,label:"Relatórios"},{id:"contacts",icon:Phone,label:"Contatos"},{id:"settings",icon:Settings,label:"Configurações"}];
  const navBtn=(id,Icon,label,isActive,color)=>(
    <button key={id} onClick={()=>onNavigate(id)} style={{width:"100%",padding:collapsed?"12px 0":"11px 14px",display:"flex",alignItems:  "center",justifyContent:collapsed?"center":"flex-start",gap:"12px",background:isActive?c.accentSoft:"transparent",border:"none",borderRadius:"10px",cursor:"pointer",color:color||(isActive?c.accent:c.textSec),fontSize:"13px",fontWeight:isActive?"600":"500",marginBottom:"2px",position:"relative",transition:"all 0.15s"}}
      onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background=c.bgCardHover;}} onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background="transparent";}}>
      {isActive&&!collapsed&&<div style={{position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",width:"3px",height:"20px",borderRadius:"4px",background:c.accent}}/>}
      <Icon size={19}/>{!collapsed&&label}
    </button>
  );
  return(
    <div style={{width:collapsed?"68px":"250px",minHeight:"100vh",background:c.bgSidebar,borderRight:`1px solid ${c.border}`,display:"flex",flexDirection:"column",transition:"width 0.3s",flexShrink:0}}>
      <div style={{padding:collapsed?"18px 0":"18px 20px",display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:"10px",borderBottom:`1px solid ${c.border}`,minHeight:"64px"}}>
        <div style={{width:"34px",height:"34px",borderRadius:"10px",background:`linear-gradient(135deg,${c.accent},${c.violet})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Zap size={17} color="white" strokeWidth={2.5}/></div>
        {!collapsed&&<span style={{fontSize:"19px",fontWeight:"800",color:c.text}}>Zapê<span style={{color:c.accent}}>Chat</span></span>}
      </div>
      <nav style={{padding:"10px 8px",flex:1}}>{nav.map(i=>navBtn(i.id,i.icon,i.label,active===i.id))}</nav>
      <div style={{padding:"10px 8px",borderTop:`1px solid ${c.border}`}}>
        {navBtn("theme",dark?Sun:Moon,dark?"Modo Claro":"Modo Escuro",false)}
        {navBtn("logout",LogOut,"Sair",false,c.danger)}
      </div>
    </div>
  );
}

// ==================== HEADER ====================
function Header({title,subtitle,user,onToggleSidebar}){
  const{dark}=useTheme();const c=C(dark);
  return(<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px",borderBottom:`1px solid ${c.border}`,background:c.bgCard}}>
    <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
      <button onClick={onToggleSidebar} style={{background:"transparent",border:"none",cursor:"pointer",color:c.textSec,padding:"6px",borderRadius:"8px",display:"flex"}}><Menu size={20}/></button>
      <div><h1 style={{margin:0,fontSize:"20px",fontWeight:"700",color:c.text}}>{title}</h1>{subtitle&&<p style={{margin:"2px 0 0",fontSize:"12px",color:c.textMut}}>{subtitle}</p>}</div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
      <span style={{fontSize:"13px",color:c.textSec,fontWeight:"500"}}>{user?.name}</span>
      <div style={{width:"34px",height:"34px",borderRadius:"10px",background:`linear-gradient(135deg,${c.accent},${c.violet})`,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:"13px",fontWeight:"700"}}>{user?.name?.charAt(0).toUpperCase()||"U"}</div>
    </div>
  </div>);
}

// ==================== DASHBOARD ====================
function DashboardPage(){
  const{dark}=useTheme();const c=C(dark);
  const[stats,setStats]=useState(null);const[messages,setMessages]=useState([]);const[loading,setLoading]=useState(true);
  useEffect(()=>{(async()=>{try{const[d,m]=await Promise.all([reportsApi.dashboard(),messagesApi.history({limit:8})]);setStats(d.data);setMessages(m.data.messages||[]);}catch(e){}finally{setLoading(false);}})();},[]);
  if(loading)return<div style={{padding:"40px",textAlign:"center",color:c.textMut}}><RefreshCw size={24} style={{animation:"spin 1s linear infinite",marginBottom:"12px"}}/><p>Carregando dashboard...</p></div>;
  const t=stats?.total||{};const td=stats?.today||{};
  return(<div style={{padding:"24px"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"14px",marginBottom:"24px"}}>
      <StatCard icon={Send} label="Enviadas (total)" value={parseInt(t.total_sent)||0} color={c.accent} colorSoft={c.accentSoft}/>
      <StatCard icon={CheckCircle} label="Entregues" value={parseInt(t.total_delivered)||0} color={c.info} colorSoft={c.infoSoft}/>
      <StatCard icon={Eye} label="Lidas" value={parseInt(t.total_read)||0} color={c.violet} colorSoft={c.violetGlow}/>
      <StatCard icon={AlertCircle} label="Falharam" value={parseInt(t.total_failed)||0} color={c.danger} colorSoft={c.dangerSoft}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"24px"}}>
      <div style={card(c)}>
        <h3 style={{margin:"0 0 16px",fontSize:"15px",fontWeight:"700",color:c.text,display:"flex",alignItems:"center",gap:"8px"}}><Clock size={16} color={c.accent}/>Hoje</h3>
        {[{l:"Enviadas",v:td.sent_today,col:c.accent},{l:"Entregues",v:td.delivered_today,col:c.info},{l:"Lidas",v:td.read_today,col:c.violet},{l:"Falhas",v:td.failed_today,col:c.danger}].map((i,idx)=>(
          <div key={idx} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:idx<3?`1px solid ${c.border}`:"none"}}>
            <span style={{fontSize:"13px",color:c.textSec}}>{i.l}</span><span style={{fontSize:"15px",fontWeight:"700",color:c.text}}>{parseInt(i.v)||0}</span>
          </div>))}
      </div>
      <div style={card(c)}>
        <h3 style={{margin:"0 0 16px",fontSize:"15px",fontWeight:"700",color:c.text,display:"flex",alignItems:"center",gap:"8px"}}><BarChart3 size={16} color={c.violet}/>Resumo</h3>
        {[{icon:Phone,l:"Contatos",v:stats?.contacts||0,col:c.info},{icon:Users,l:"Grupos",v:stats?.groups||0,col:c.violet},{icon:Mail,l:"Campanhas",v:stats?.campaigns||0,col:c.accent},{icon:Zap,l:"Ativos agora",v:stats?.activeCampaigns||0,col:c.warn}].map((i,idx)=>(
          <div key={idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:idx<3?`1px solid ${c.border}`:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}><i.icon size={15} color={i.col}/><span style={{fontSize:"13px",color:c.textSec}}>{i.l}</span></div>
            <span style={{fontSize:"15px",fontWeight:"700",color:c.text}}>{i.v}</span>
          </div>))}
      </div>
    </div>
    <div style={card(c)}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"14px"}}><h3 style={{margin:0,fontSize:"15px",fontWeight:"700",color:c.text}}>Mensagens Recentes</h3></div>
      {messages.length===0?<p style={{color:c.textMut,fontSize:"13px",padding:"20px 0",textAlign:"center"}}>Nenhuma mensagem enviada ainda</p>:
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>
        {["Telefone","Mensagem","Tipo","Status","Data"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:"11px",fontWeight:"600",color:c.textMut,textTransform:"uppercase",borderBottom:`1px solid ${c.border}`}}>{h}</th>)}
      </tr></thead><tbody>
        {messages.map(m=><tr key={m.id} onMouseEnter={e=>e.currentTarget.style.background=c.bgCardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <td style={{padding:"10px 12px",fontSize:"13px",fontWeight:"600",color:c.text,fontFamily:"monospace"}}>{m.phone}</td>
          <td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec,maxWidth:"200px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.message_text||"[mídia]"}</td>
          <td style={{padding:"10px 12px",fontSize:"12px",color:c.textMut}}>{m.message_type}</td>
          <td style={{padding:"10px 12px"}}><span style={badge(c,m.status)}>{statusMap[m.status]?.l||m.status}</span></td>
          <td style={{padding:"10px 12px",fontSize:"12px",color:c.textMut}}>{m.created_at?new Date(m.created_at).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):""}</td>
        </tr>)}
      </tbody></table></div>}
    </div>
  </div>);
}

// ==================== SEND MESSAGE ====================
function SendMessagePage(){
  const{dark}=useTheme();const c=C(dark);
  const[number,setNumber]=useState("");const[message,setMessage]=useState("");const[delay,setDelay]=useState("1000");
  const[media,setMedia]=useState(null);const[sending,setSending]=useState(false);const[toast,setToast]=useState(null);const[showPreview,setShowPreview]=useState(false);

const handleSend=async()=>{
    setShowPreview(false);setSending(true);
    try{
      if(media){
        const base64Data = media.url.includes('base64,') ? media.url.split('base64,')[1] : media.url;
        if(media.type==='audio'){
          // Usa endpoint específico de áudio do WhatsApp (bolinha verde)
          await messagesApi.sendAudio({
            number,
            media: base64Data,
            delay: parseInt(delay)
          });
        }else{
          await messagesApi.sendMedia({
            number,
            media: base64Data,
            caption: message,
            mediaType: media.type,
            mimetype: media.file?.type || 'image/png',
            fileName: media.name || 'file',
            delay: parseInt(delay)
          });
        }
      }else{
        await messagesApi.sendText(number,message,{delay:parseInt(delay)});
      }
      setToast({msg:"Mensagem enviada com sucesso!",type:"success"});setNumber("");setMessage("");setMedia(null);
    }catch(err){setToast({msg:err.response?.data?.error||"Falha ao enviar mensagem",type:"error"});}finally{setSending(false);}
  };
  const canSend=number&&(message||media);

  return(<div style={{padding:"24px",maxWidth:"700px"}}>
    {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    {showPreview&&<PreviewModal number={number} text={message} media={media} onConfirm={handleSend} onCancel={()=>setShowPreview(false)} sending={sending}/>}
    <div style={card(c)}>
      <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px"}}><Send size={20} color={c.accent}/><h3 style={{margin:0,fontSize:"18px",fontWeight:"700",color:c.text}}>Enviar Mensagem</h3></div>
      <p style={{margin:"0 0 22px",fontSize:"13px",color:c.textMut}}>Envie texto ou mídia para um contato via WhatsApp</p>
      <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Número WhatsApp</label><input value={number} onChange={e=>setNumber(e.target.value)} placeholder="5511999887766" style={inp(c)}/><span style={{fontSize:"11px",color:c.textMut,marginTop:"4px",display:"block"}}>Com código do país, sem + ou espaços</span></div>
      <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Mensagem</label><textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Digite sua mensagem..." rows={4} style={{...inp(c),resize:"vertical"}}/><div style={{display:"flex",justifyContent:"flex-end",marginTop:"4px"}}><span style={{fontSize:"11px",color:c.textMut}}>{message.length} caracteres</span></div></div>
      <label style={{...lbl(c),marginBottom:"8px",display:"flex",alignItems:"center",gap:"6px"}}><Paperclip size={13}/>Anexar Mídia (opcional)</label>
      <MediaPicker selected={media} onSelect={setMedia} onRemove={()=>setMedia(null)}/>
      <div style={{marginBottom:"20px"}}><label style={lbl(c)}>Delay (ms)</label><input value={delay} onChange={e=>setDelay(e.target.value)} type="number" style={{...inp(c),width:"140px"}}/></div>
      <button onClick={()=>setShowPreview(true)} disabled={!canSend} style={btn(c,!canSend)}><Eye size={16}/>Pré-visualizar e Enviar</button>
    </div>
  </div>);
}

// ==================== MASS SEND ====================
function MassSendPage(){
  const{dark}=useTheme();const c=C(dark);
  const[numbers,setNumbers]=useState("");const[message,setMessage]=useState("");const[interval_,setInterval_]=useState("3");
  const[name,setName]=useState("");const[scheduled,setScheduled]=useState("");const[running,setRunning]=useState(false);const[toast,setToast]=useState(null);
  const[campaigns,setCampaigns]=useState([]);const[loading,setLoading]=useState(true);

  useEffect(()=>{(async()=>{try{const{data}=await campaignsApi.list();setCampaigns(data.campaigns||[]);}catch(e){}finally{setLoading(false);}})();},[]);

  const start=async()=>{
    const nums=numbers.split("\n").filter(n=>n.trim());if(!nums.length||!message||!name)return;
    setRunning(true);
    try{
      const payload={name,message,recipients:nums.map(n=>({phone:n.trim()})),interval_ms:parseInt(interval_)*1000};
      if(scheduled)payload.scheduled_at=scheduled;
      const{data:camp}=await campaignsApi.create(payload);
      if(!scheduled)await campaignsApi.start(camp.campaign.id);
      setToast({msg:scheduled?`Campanha agendada para ${new Date(scheduled).toLocaleString("pt-BR")}!`:`Disparo iniciado! ${nums.length} mensagens sendo enviadas.`,type:"success"});
      setName("");setNumbers("");setMessage("");setScheduled("");
      const{data:updated}=await campaignsApi.list();setCampaigns(updated.campaigns||[]);
    }catch(err){setToast({msg:err.response?.data?.error||"Falha ao iniciar",type:"error"});}finally{setRunning(false);}
  };

  const stStyle=s=>({completed:{bg:c.okSoft,col:c.ok,l:"Concluída"},running:{bg:c.warnSoft,col:c.warn,l:"Enviando"},scheduled:{bg:c.infoSoft,col:c.info,l:"Agendada"},draft:{bg:c.bgInput,col:c.textMut,l:"Rascunho"},paused:{bg:c.warnSoft,col:c.warn,l:"Pausada"}}[s]||{bg:c.bgInput,col:c.textMut,l:s});

  return(<div style={{padding:"24px",maxWidth:"900px"}}>
    {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    <div style={{...card(c),marginBottom:"20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px"}}><Mail size={20} color={c.violet}/><h3 style={{margin:0,fontSize:"18px",fontWeight:"700",color:c.text}}>Disparo em Massa</h3></div>
      <p style={{margin:"0 0 20px",fontSize:"13px",color:c.textMut}}>Envie a mesma mensagem para múltiplos contatos</p>
      <div style={{background:c.warnSoft,border:`1px solid ${c.warn}33`,borderRadius:"12px",padding:"12px 16px",marginBottom:"20px",display:"flex",alignItems:"flex-start",gap:"10px",color:c.warn,fontSize:"12px"}}>
        <AlertCircle size={16} style={{flexShrink:0,marginTop:"1px"}}/><span>Use intervalos de pelo menos 3 segundos para evitar bloqueio do WhatsApp.</span>
      </div>
      <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Nome da Campanha</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: Promoção Março" style={inp(c)}/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"16px"}}>
        <div><label style={lbl(c)}>Números (um por linha)</label><textarea value={numbers} onChange={e=>setNumbers(e.target.value)} placeholder={"5511999887766\n5511988776655"} rows={7} style={{...inp(c),fontFamily:"monospace",fontSize:"13px",resize:"vertical"}}/><span style={{fontSize:"11px",color:c.textMut}}>{numbers.split("\n").filter(n=>n.trim()).length} contatos</span></div>
        <div><label style={lbl(c)}>Mensagem</label><textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Sua mensagem aqui..." rows={7} style={{...inp(c),resize:"vertical",fontSize:"13px"}}/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"20px"}}>
        <div><label style={lbl(c)}>Intervalo (segundos)</label><input value={interval_} onChange={e=>setInterval_(e.target.value)} type="number" min="1" style={inp(c)}/></div>
        <div><label style={{...lbl(c),display:"flex",alignItems:"center",gap:"6px"}}><Calendar size={12}/>Agendar (opcional)</label><input value={scheduled} onChange={e=>setScheduled(e.target.value)} type="datetime-local" style={inp(c)}/></div>
      </div>
      <button onClick={start} disabled={running||!numbers.trim()||!message||!name} style={btn(c,running||!numbers.trim()||!message||!name)}>
        {running?<RefreshCw size={16} style={{animation:"spin 1s linear infinite"}}/>:scheduled?<Calendar size={16}/>:<Play size={16}/>}{running?"Processando...":scheduled?"Agendar Disparo":"Iniciar Disparo"}
      </button>
    </div>
    {campaigns.length>0&&<div style={card(c)}>
      <h3 style={{margin:"0 0 14px",fontSize:"15px",fontWeight:"700",color:c.text}}>Histórico de Campanhas</h3>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>
        {["Campanha","Total","Enviadas","Falhas","Status","Criada"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:"11px",fontWeight:"600",color:c.textMut,textTransform:"uppercase",borderBottom:`1px solid ${c.border}`}}>{h}</th>)}
      </tr></thead><tbody>
        {campaigns.map(cp=>{const st=stStyle(cp.status);return<tr key={cp.id} onMouseEnter={e=>e.currentTarget.style.background=c.bgCardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <td style={{padding:"10px 12px",fontSize:"13px",fontWeight:"600",color:c.text}}>{cp.name}</td>
          <td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec}}>{cp.total_recipients}</td>
          <td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec}}>{cp.sent_count}</td>
          <td style={{padding:"10px 12px",fontSize:"13px",color:cp.failed_count>0?c.danger:c.textSec}}>{cp.failed_count}</td>
          <td style={{padding:"10px 12px"}}><span style={{fontSize:"11px",fontWeight:"600",padding:"3px 8px",borderRadius:"6px",background:st.bg,color:st.col}}>{st.l}</span></td>
          <td style={{padding:"10px 12px",fontSize:"12px",color:c.textMut}}>{cp.created_at?new Date(cp.created_at).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):""}</td>
        </tr>;})}
      </tbody></table></div>
    </div>}
  </div>);
}

// ==================== GROUPS ====================
function GroupsPage(){
  const{dark}=useTheme();const c=C(dark);
  const[groups,setGroups]=useState([]);const[selected,setSelected]=useState(null);const[msgText,setMsgText]=useState("");
  const[loading,setLoading]=useState(true);const[syncing,setSyncing]=useState(false);const[sending,setSending]=useState(false);const[toast,setToast]=useState(null);
  const load=async()=>{try{const{data}=await groupsApi.list();setGroups(data.groups||[]);}catch(e){}finally{setLoading(false);}};
  const sync=async()=>{setSyncing(true);try{await groupsApi.sync();await load();setToast({msg:"Grupos sincronizados!",type:"success"});}catch(e){setToast({msg:"Falha ao sincronizar",type:"error"});}finally{setSyncing(false);}};
  const send=async()=>{if(!selected||!msgText)return;setSending(true);try{await groupsApi.send(selected.group_jid,msgText);setToast({msg:"Mensagem enviada ao grupo!",type:"success"});setMsgText("");}catch(e){setToast({msg:e.response?.data?.error||"Falha ao enviar",type:"error"});}finally{setSending(false);}};
  useEffect(()=>{load();},[]);
  return(<div style={{padding:"24px"}}>
    {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
      <div style={card(c)}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
          <h3 style={{margin:0,fontSize:"15px",fontWeight:"700",color:c.text}}>Seus Grupos</h3>
          <button onClick={sync} disabled={syncing} style={{...btnSec(c),padding:"7px 12px",fontSize:"12px"}}><RefreshCw size={13} style={syncing?{animation:"spin 1s linear infinite"}:{}}/>{syncing?"Sincronizando...":"Sincronizar"}</button>
        </div>
        {loading?<p style={{color:c.textMut,fontSize:"13px",textAlign:"center",padding:"20px"}}>Carregando...</p>:groups.length===0?<p style={{color:c.textMut,fontSize:"13px",textAlign:"center",padding:"30px 0"}}>Nenhum grupo. Clique em Sincronizar.</p>:
        <div style={{maxHeight:"400px",overflowY:"auto"}}>{groups.map(g=>(
          <div key={g.id} onClick={()=>setSelected(g)} style={{padding:"12px 14px",borderRadius:"10px",marginBottom:"4px",cursor:"pointer",background:selected?.id===g.id?c.accentSoft:"transparent",border:`1px solid ${selected?.id===g.id?c.accent+"33":"transparent"}`,transition:"all 0.15s"}}
            onMouseEnter={e=>{if(selected?.id!==g.id)e.currentTarget.style.background=c.bgCardHover;}} onMouseLeave={e=>{if(selected?.id!==g.id)e.currentTarget.style.background="transparent";}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <div style={{width:"38px",height:"38px",borderRadius:"10px",background:c.violetGlow,display:"flex",alignItems:"center",justifyContent:"center"}}><Hash size={16} color={c.violet}/></div>
              <div><div style={{fontSize:"13px",fontWeight:"600",color:c.text}}>{g.name||g.group_jid}</div><div style={{fontSize:"11px",color:c.textMut}}>{g.member_count||0} membros</div></div>
            </div>
          </div>
        ))}</div>}
      </div>
      <div style={card(c)}>
        <h3 style={{margin:"0 0 16px",fontSize:"15px",fontWeight:"700",color:c.text}}>Enviar para Grupo</h3>
        {selected?<>
          <div style={{background:c.bgInput,borderRadius:"10px",padding:"12px 14px",marginBottom:"16px",display:"flex",alignItems:"center",gap:"10px"}}>
            <Hash size={16} color={c.violet}/><div><div style={{fontSize:"13px",fontWeight:"600",color:c.text}}>{selected.name||selected.group_jid}</div><div style={{fontSize:"11px",color:c.textMut}}>{selected.member_count||0} membros</div></div>
          </div>
          <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Mensagem</label><textarea value={msgText} onChange={e=>setMsgText(e.target.value)} placeholder="Mensagem para o grupo..." rows={5} style={{...inp(c),resize:"vertical"}}/></div>
          <button onClick={send} disabled={sending||!msgText} style={btn(c,sending||!msgText)}><Send size={16}/>{sending?"Enviando...":"Enviar para Grupo"}</button>
        </>:<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"50px 20px",color:c.textMut,textAlign:"center"}}><Users size={36} style={{marginBottom:"12px",opacity:0.3}}/><p style={{fontSize:"13px",margin:0}}>Selecione um grupo na lista</p></div>}
      </div>
    </div>
  </div>);
}

// ==================== REPORTS ====================
function ReportsPage(){
  const{dark}=useTheme();const c=C(dark);
  const[period,setPeriod]=useState("week");const[campaigns,setCampaigns]=useState([]);const[topGroups,setTopGroups]=useState([]);const[loading,setLoading]=useState(true);const[toast,setToast]=useState(null);
  useEffect(()=>{(async()=>{setLoading(true);try{const[cp,gr]=await Promise.all([reportsApi.campaignStats(),reportsApi.topGroups()]);setCampaigns(cp.data.campaigns||[]);setTopGroups(gr.data.groups||[]);}catch(e){}finally{setLoading(false);}})();},[period]);
  const exportFile=async(type)=>{try{const res=type==="excel"?await reportsApi.exportExcel():await reportsApi.exportPdf();const url=window.URL.createObjectURL(new Blob([res.data]));const a=document.createElement('a');a.href=url;a.download=`relatorio.${type==="excel"?"xlsx":"pdf"}`;a.click();setToast({msg:"Relatório exportado!",type:"success"});}catch(e){setToast({msg:"Erro ao exportar",type:"error"});}};
  const stStyle=s=>({completed:{bg:c.okSoft,col:c.ok,l:"Concluída"},running:{bg:c.warnSoft,col:c.warn,l:"Enviando"},scheduled:{bg:c.infoSoft,col:c.info,l:"Agendada"},draft:{bg:c.bgInput,col:c.textMut,l:"Rascunho"},paused:{bg:c.warnSoft,col:c.warn,l:"Pausada"}}[s]||{bg:c.bgInput,col:c.textMut,l:s});
  if(loading)return<div style={{padding:"40px",textAlign:"center",color:c.textMut}}>Carregando...</div>;
  return(<div style={{padding:"24px"}}>
    {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    <div style={{display:"flex",gap:"8px",marginBottom:"20px",flexWrap:"wrap"}}>
      {[{id:"day",l:"Hoje"},{id:"week",l:"Semana"},{id:"month",l:"Mês"}].map(p=><button key={p.id} onClick={()=>setPeriod(p.id)} style={{padding:"7px 16px",borderRadius:"8px",border:"none",background:period===p.id?c.accent:c.bgInput,color:period===p.id?"white":c.textSec,fontSize:"12px",fontWeight:"600",cursor:"pointer"}}>{p.l}</button>)}
      <div style={{flex:1}}/>
      <button onClick={()=>exportFile("excel")} style={{...btnSec(c),padding:"7px 14px",fontSize:"12px"}}><Download size={13}/>Excel</button>
      <button onClick={()=>exportFile("pdf")} style={{...btnSec(c),padding:"7px 14px",fontSize:"12px",color:c.danger}}><Download size={13}/>PDF</button>
    </div>
    {campaigns.length>0&&<div style={{...card(c),marginBottom:"20px"}}>
      <h3 style={{margin:"0 0 14px",fontSize:"15px",fontWeight:"700",color:c.text}}>Campanhas</h3>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>
        {["Campanha","Enviadas","Entregues","Lidas","Falhas","Status"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:"11px",fontWeight:"600",color:c.textMut,textTransform:"uppercase",borderBottom:`1px solid ${c.border}`}}>{h}</th>)}
      </tr></thead><tbody>
        {campaigns.map(cp=>{const st=stStyle(cp.status);return<tr key={cp.id}><td style={{padding:"10px 12px",fontSize:"13px",fontWeight:"600",color:c.text}}>{cp.name}</td><td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec}}>{cp.sent_count}</td><td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec}}>{cp.delivered_count}</td><td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec}}>{cp.read_count}</td><td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec}}>{cp.failed_count}</td><td style={{padding:"10px 12px"}}><span style={{fontSize:"11px",fontWeight:"600",padding:"3px 8px",borderRadius:"6px",background:st.bg,color:st.col}}>{st.l}</span></td></tr>;})}
      </tbody></table></div>
    </div>}
    {topGroups.length>0&&<div style={card(c)}>
      <h3 style={{margin:"0 0 14px",fontSize:"15px",fontWeight:"700",color:c.text}}>Ranking de Grupos</h3>
      {topGroups.map((g,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<topGroups.length-1?`1px solid ${c.border}`:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}><span style={{width:"26px",height:"26px",borderRadius:"8px",background:i===0?c.warnSoft:c.bgInput,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:"700",color:i===0?c.warn:c.textMut}}>{i+1}</span><span style={{fontSize:"13px",fontWeight:"600",color:c.text}}>{g.name||g.group_jid}</span></div>
        <span style={{fontSize:"13px",color:c.textMut}}>{g.message_count||0} msgs</span>
      </div>)}
    </div>}
  </div>);
}

// ==================== CONTACTS ====================
function ContactsPage(){
  const{dark}=useTheme();const c=C(dark);
  const[contacts,setContacts]=useState([]);const[search,setSearch]=useState("");const[loading,setLoading]=useState(true);const[toast,setToast]=useState(null);
  const load=async(s)=>{try{const{data}=await contactsApi.list({search:s,limit:50});setContacts(data.contacts||[]);}catch(e){}finally{setLoading(false);}};
  useEffect(()=>{load(search);},[search]);
  const importCsv=async(e)=>{const file=e.target.files[0];if(!file)return;try{const{data}=await contactsApi.importCsv(file);setToast({msg:`Importados: ${data.imported}, Ignorados: ${data.skipped}`,type:"success"});load(search);}catch(e){setToast({msg:"Erro ao importar",type:"error"});}};
  return(<div style={{padding:"24px",maxWidth:"700px"}}>
    {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    <div style={card(c)}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
        <h3 style={{margin:0,fontSize:"15px",fontWeight:"700",color:c.text}}>Contatos</h3>
        <label style={{...btnSec(c),padding:"7px 14px",fontSize:"12px",cursor:"pointer"}}><Upload size={13}/>Importar CSV<input type="file" accept=".csv" onChange={importCsv} style={{display:"none"}}/></label>
      </div>
      <div style={{position:"relative",marginBottom:"16px"}}><Search size={15} color={c.textMut} style={{position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)"}}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." style={{...inp(c),paddingLeft:"38px"}}/></div>
      {loading?<p style={{color:c.textMut,textAlign:"center",padding:"20px"}}>Carregando...</p>:contacts.length===0?<p style={{color:c.textMut,fontSize:"13px",textAlign:"center",padding:"30px 0"}}>Nenhum contato encontrado</p>:
      contacts.map(ct=><div key={ct.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderRadius:"10px",marginBottom:"2px"}}
        onMouseEnter={e=>e.currentTarget.style.background=c.bgCardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:"36px",height:"36px",borderRadius:"50%",background:`linear-gradient(135deg,${c.accent}44,${c.violet}44)`,display:"flex",alignItems:"center",justifyContent:"center",color:c.accent,fontSize:"14px",fontWeight:"700"}}>{(ct.name||ct.phone).charAt(0).toUpperCase()}</div>
          <div><div style={{fontSize:"13px",fontWeight:"600",color:c.text}}>{ct.name||"Sem nome"}</div><div style={{fontSize:"11px",color:c.textMut,fontFamily:"monospace"}}>{ct.phone}</div></div>
        </div>
      </div>)}
    </div>
  </div>);
}

// ==================== SETTINGS ====================
function SettingsPage({user,onProfileUpdate}){
  const{dark}=useTheme();const c=C(dark);
  const[apiUrl,setApiUrl]=useState(user?.evolution_api_url||"");const[apiKey,setApiKey]=useState(user?.evolution_api_key||"");const[instance,setInstance]=useState(user?.evolution_instance||"");
  const[saving,setSaving]=useState(false);const[testing,setTesting]=useState(false);const[toast,setToast]=useState(null);

  const save=async()=>{setSaving(true);try{const{data}=await authApi.updateProfile({evolution_api_url:apiUrl,evolution_api_key:apiKey,evolution_instance:instance});setToast({msg:"Configurações salvas!",type:"success"});if(onProfileUpdate)onProfileUpdate(data.user);}catch(e){setToast({msg:"Erro ao salvar",type:"error"});}finally{setSaving(false);}};
  const test=async()=>{setTesting(true);try{const{data}=await instancesApi.status(instance);const state=data.status?.instance?.state||"unknown";setToast({msg:state==="open"?"Conectado ao WhatsApp!":`Status: ${state}`,type:state==="open"?"success":"error"});}catch(e){setToast({msg:"Falha na conexão",type:"error"});}finally{setTesting(false);}};

  return(<div style={{padding:"24px",maxWidth:"700px"}}>
    {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    <div style={card(c)}>
      <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px"}}><Settings size={20} color={c.accent}/><h3 style={{margin:0,fontSize:"18px",fontWeight:"700",color:c.text}}>Conexão Evolution API</h3></div>
      <p style={{margin:"0 0 22px",fontSize:"13px",color:c.textMut}}>Configure a conexão com seu servidor Evolution API v2</p>
      <div style={{marginBottom:"16px"}}><label style={lbl(c)}>URL do Servidor</label><input value={apiUrl} onChange={e=>setApiUrl(e.target.value)} placeholder="https://api.seuservidor.com" style={inp(c)}/></div>
      <div style={{marginBottom:"16px"}}><label style={lbl(c)}>API Key</label><input value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="Sua chave" type="password" style={inp(c)}/></div>
      <div style={{marginBottom:"22px"}}><label style={lbl(c)}>Nome da Instância</label><input value={instance} onChange={e=>setInstance(e.target.value)} placeholder="nome-instancia" style={inp(c)}/></div>
      <div style={{display:"flex",gap:"10px"}}><button onClick={save} disabled={saving} style={btn(c,saving)}>{saving?"Salvando...":"Salvar Configurações"}</button><button onClick={test} disabled={testing||!instance} style={btnSec(c)}><Globe size={16}/>{testing?"Testando...":"Testar Conexão"}</button></div>
    </div>
  </div>);
}

// ==================== MAIN ====================
function MainContent({page,user,onToggleSidebar,onProfileUpdate}){
  const{dark}=useTheme();const c=C(dark);
  const titles={dashboard:["Dashboard","Visão geral do ZapêChat"],send:["Enviar Mensagem","Texto e mídia via WhatsApp"],mass:["Disparo em Massa","Campanhas para múltiplos contatos"],groups:["Grupos","Gerencie e envie para grupos"],reports:["Relatórios","Analise seus disparos"],contacts:["Contatos","Gerencie sua lista"],settings:["Configurações","Conexão com Evolution API"]};
  return(<div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}><div style={{flex:1,background:c.bg,minHeight:"100vh"}}>
    <Header title={titles[page]?.[0]||""} subtitle={titles[page]?.[1]||""} user={user} onToggleSidebar={onToggleSidebar}/>
    {page==="dashboard"&&<DashboardPage/>}{page==="send"&&<SendMessagePage/>}{page==="mass"&&<MassSendPage/>}{page==="groups"&&<GroupsPage/>}{page==="reports"&&<ReportsPage/>}{page==="contacts"&&<ContactsPage/>}{page==="settings"&&<SettingsPage user={user} onProfileUpdate={onProfileUpdate}/>}
  </div></div>);
}

function App(){
  const[user,setUser]=useState(()=>{try{const u=localStorage.getItem('zapechat_user');return u?JSON.parse(u):null;}catch{return null;}});
  const[page,setPage]=useState("dashboard");const[collapsed,setCollapsed]=useState(false);

  useEffect(()=>{const token=localStorage.getItem('zapechat_token');if(token&&user){authApi.me().then(({data})=>{setUser(data.user);localStorage.setItem('zapechat_user',JSON.stringify(data.user));}).catch(()=>{setUser(null);localStorage.removeItem('zapechat_token');localStorage.removeItem('zapechat_user');});}},[]);

  const nav=(id)=>{
    if(id==="logout"){setUser(null);localStorage.removeItem('zapechat_token');localStorage.removeItem('zapechat_user');return;}
    if(id==="theme")return; // handled by sidebar toggle
    setPage(id);
  };
  const updateProfile=(u)=>{setUser(prev=>({...prev,...u}));localStorage.setItem('zapechat_user',JSON.stringify({...user,...u}));};

  if(!user)return<ThemeProvider><LoginPage onLogin={setUser}/></ThemeProvider>;
  return(<ThemeProvider>
    <div style={{display:"flex",minHeight:"100vh",fontFamily:"'Segoe UI',-apple-system,sans-serif"}}>
      <Sidebar active={page} onNavigate={nav} collapsed={collapsed} user={user}/>
      <MainContent page={page} user={user} onToggleSidebar={()=>setCollapsed(s=>!s)} onProfileUpdate={updateProfile}/>
    </div>
    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes slideIn{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}} *{box-sizing:border-box;margin:0;padding:0} body{margin:0} ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}`}</style>
  </ThemeProvider>);
}

export default App;
