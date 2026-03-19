import { useState, useEffect, useRef, createContext, useContext } from "react";
import {
  Send, Users, BarChart3, LogOut, Moon, Sun, Menu, ChevronRight, Zap, Search, Upload,
  CheckCircle, AlertCircle, Eye, Download, TrendingUp, Mail, Settings, PieChart, Plus,
  RefreshCw, Play, Pause, Hash, Globe, Phone, Image, FileText, Video, Mic, Calendar,
  Clock, X, Paperclip, UserPlus, Shield, QrCode, Wifi, WifiOff, Trash2, Edit, ToggleLeft, ToggleRight
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
const inp=(c)=>({width:"100%",padding:"12px 16px",background:c.bgInput,border:`1px solid ${c.border}`,borderRadius:"12px",color:c.text,fontSize:"14px",outline:"none",boxSizing:"border-box",fontFamily:"inherit",transition:"border-color 0.2s"});
const lbl=(c)=>({display:"block",color:c.textSec,fontSize:"12px",fontWeight:"600",marginBottom:"6px",letterSpacing:"0.5px",textTransform:"uppercase"});
const btnP=(c,dis)=>({padding:"12px 24px",background:dis?c.textMut:`linear-gradient(135deg,${c.accent},${c.violet})`,border:"none",borderRadius:"12px",color:"white",fontSize:"14px",fontWeight:"700",cursor:dis?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",gap:"8px",boxShadow:dis?"none":`0 4px 20px ${c.accentGlow}`,transition:"all 0.2s"});
const btnS=(c)=>({padding:"12px 24px",background:c.bgInput,border:`1px solid ${c.border}`,borderRadius:"12px",color:c.text,fontSize:"14px",fontWeight:"600",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"8px",transition:"all 0.2s"});
const card=(c)=>({background:c.bgCard,borderRadius:"16px",padding:"24px",border:`1px solid ${c.border}`});
const statusMap={read:{l:"Lida",c:"info"},delivered:{l:"Entregue",c:"ok"},sent:{l:"Enviada",c:"textMut"},failed:{l:"Falhou",c:"danger"},pending:{l:"Pendente",c:"warn"}};
const badge=(c,s)=>{const m=statusMap[s]||{l:s,c:"textMut"};return{fontSize:"11px",fontWeight:"600",padding:"3px 8px",borderRadius:"6px",background:c[m.c+"Soft"]||c.bgInput,color:c[m.c]||c.textMut};};

// ==================== TOAST ====================
function Toast({msg,type,onClose}){
  const{dark}=useTheme();const c=C(dark);
  useEffect(()=>{const t=setTimeout(onClose,4000);return()=>clearTimeout(t);},[]);
  const bg=type==="success"?c.okSoft:type==="error"?c.dangerSoft:c.warnSoft;
  const col=type==="success"?c.ok:type==="error"?c.danger:c.warn;
  return(<div style={{position:"fixed",top:"20px",right:"20px",zIndex:9999,background:bg,border:`1px solid ${col}33`,borderRadius:"14px",padding:"14px 20px",display:"flex",alignItems:"center",gap:"10px",color:col,fontSize:"14px",fontWeight:"600",boxShadow:c.shadowLg,maxWidth:"400px",animation:"slideIn 0.3s ease"}}>
    {type==="success"?<CheckCircle size={18}/>:<AlertCircle size={18}/>}<span style={{flex:1}}>{msg}</span><X size={16} style={{cursor:"pointer",opacity:0.6}} onClick={onClose}/>
  </div>);
}

// ==================== MEDIA PICKER ====================
function MediaPicker({onSelect,selected,onRemove}){
  const{dark}=useTheme();const c=C(dark);const ref=useRef();
  const types=[{id:"image",icon:Image,label:"Imagem",accept:"image/jpeg,image/png,image/webp"},{id:"video",icon:Video,label:"Vídeo"},{id:"audio",icon:Mic,label:"Áudio",accept:"audio/mpeg,audio/ogg,audio/mp4"},{id:"document",icon:FileText,label:"Documento",accept:".pdf,.docx,.xlsx,.txt,.csv"}];
  const[activeType,setActiveType]=useState(null);const[videoUrl,setVideoUrl]=useState("");const[showVideoInput,setShowVideoInput]=useState(false);
  const handleFile=(e)=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{onSelect({file,type:activeType,name:file.name,size:file.size,preview:activeType==="image"?reader.result:null,url:reader.result});};reader.readAsDataURL(file);setActiveType(null);};
  const handleVideoUrl=()=>{if(!videoUrl.trim())return;onSelect({file:null,type:"video",name:videoUrl.split('/').pop()||"video.mp4",size:0,preview:null,url:videoUrl.trim(),isUrl:true});setShowVideoInput(false);setVideoUrl("");};
  if(selected)return(<div style={{background:c.bgInput,borderRadius:"12px",padding:"14px",display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px",border:`1px solid ${c.border}`}}>
    {selected.preview?<img src={selected.preview} alt="" style={{width:"60px",height:"60px",borderRadius:"8px",objectFit:"cover"}}/>:<div style={{width:"48px",height:"48px",borderRadius:"8px",background:c.accentSoft,display:"flex",alignItems:"center",justifyContent:"center"}}>{selected.type==="video"?<Video size={20} color={c.accent}/>:selected.type==="audio"?<Mic size={20} color={c.accent}/>:<FileText size={20} color={c.accent}/>}</div>}
    <div style={{flex:1,minWidth:0}}><div style={{fontSize:"13px",fontWeight:"600",color:c.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selected.name}</div><div style={{fontSize:"12px",color:c.textMut}}>{selected.size?(selected.size/1024).toFixed(0)+" KB • ":""}{selected.type}{selected.isUrl?" (URL)":""}</div></div>
    <button onClick={onRemove} style={{background:"none",border:"none",cursor:"pointer",color:c.danger,padding:"4px"}}><X size={18}/></button>
  </div>);
  return(<div style={{marginBottom:"16px"}}>
    <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>{types.map(t=><button key={t.id} onClick={()=>{if(t.id==="video"){setShowVideoInput(true);return;}setActiveType(t.id);setTimeout(()=>ref.current?.click(),50);}} style={{padding:"8px 14px",borderRadius:"10px",border:`1px solid ${c.border}`,background:c.bgInput,color:c.textSec,fontSize:"12px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",transition:"all 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=c.accent;e.currentTarget.style.color=c.accent;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=c.border;e.currentTarget.style.color=c.textSec;}}><t.icon size={14}/>{t.label}</button>)}</div>
    {showVideoInput&&<div style={{marginTop:"10px",display:"flex",gap:"8px"}}><input value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} placeholder="Cole a URL do vídeo (https://...mp4)" style={{...inp(c),flex:1}} onKeyDown={e=>e.key==='Enter'&&handleVideoUrl()}/><button onClick={handleVideoUrl} disabled={!videoUrl.trim()} style={{...btnP(c,!videoUrl.trim()),padding:"10px 16px",fontSize:"12px"}}>OK</button><button onClick={()=>{setShowVideoInput(false);setVideoUrl("");}} style={{background:"none",border:"none",cursor:"pointer",color:c.textMut}}><X size={18}/></button></div>}
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
      <div style={{background:dark?"#005c4b":"#dcf8c6",borderRadius:"12px 12px 12px 4px",padding:"12px 14px",marginBottom:"16px",maxWidth:"90%"}}>
        {media?.preview&&<img src={media.preview} alt="" style={{width:"100%",borderRadius:"8px",marginBottom:"8px"}}/>}
        {media&&!media.preview&&<div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",padding:"8px",background:"rgba(0,0,0,0.1)",borderRadius:"8px"}}><FileText size={16}/><span style={{fontSize:"12px",fontWeight:"600"}}>{media.name}</span></div>}
        {text&&<p style={{margin:0,fontSize:"14px",color:dark?"#e9edef":"#111b21",whiteSpace:"pre-wrap"}}>{text}</p>}
        <div style={{textAlign:"right",marginTop:"4px"}}><span style={{fontSize:"11px",color:dark?"#8696a0":"#667781"}}>{new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</span></div>
      </div>
      <div style={{background:c.bgInput,borderRadius:"10px",padding:"10px 14px",marginBottom:"20px",display:"flex",alignItems:"center",gap:"8px"}}><Phone size={14} color={c.textMut}/><span style={{fontSize:"13px",color:c.textSec,fontFamily:"monospace"}}>{number}</span></div>
      <div style={{display:"flex",gap:"10px",justifyContent:"flex-end"}}><button onClick={onCancel} style={btnS(c)}>Cancelar</button><button onClick={onConfirm} disabled={sending} style={btnP(c,sending)}>{sending?<RefreshCw size={16} style={{animation:"spin 1s linear infinite"}}/>:<Send size={16}/>}{sending?"Enviando...":"Confirmar"}</button></div>
    </div>
  </div>);
}

// ==================== STAT CARD ====================
function StatCard({icon:Icon,label,value,color,colorSoft}){
  const{dark}=useTheme();const c=C(dark);
  return(<div style={{...card(c),position:"relative",overflow:"hidden",transition:"all 0.3s",cursor:"default"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=color+"44";e.currentTarget.style.transform="translateY(-2px)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=c.border;e.currentTarget.style.transform="none";}}>
    <div style={{position:"absolute",top:"-20px",right:"-20px",width:"80px",height:"80px",borderRadius:"50%",background:colorSoft,opacity:0.5}}/>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"14px"}}><div style={{width:"42px",height:"42px",borderRadius:"12px",background:colorSoft,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon size={20} color={color}/></div></div>
    <div style={{fontSize:"28px",fontWeight:"800",color:c.text,letterSpacing:"-0.5px",lineHeight:1,marginBottom:"6px"}}>{typeof value==="number"?value.toLocaleString("pt-BR"):value}</div>
    <div style={{fontSize:"13px",color:c.textMut,fontWeight:"500"}}>{label}</div>
  </div>);
}

// ==================== LOGIN/SIGNUP PAGE ====================
function AuthPage({onLogin}){
  const{dark,toggle}=useTheme();const c=C(dark);
  const[mode,setMode]=useState("login");
  const[email,setEmail]=useState("");const[password,setPassword]=useState("");const[name,setName]=useState("");const[company,setCompany]=useState("");
  const[loading,setLoading]=useState(false);const[error,setError]=useState("");

  const handleSubmit=async()=>{
    if(mode==="login"){
      if(!email||!password){setError("Preencha todos os campos");return;}
      setLoading(true);setError("");
      try{const{data}=await authApi.login(email,password);localStorage.setItem('zapechat_token',data.token);localStorage.setItem('zapechat_user',JSON.stringify(data.user));onLogin(data.user);}
      catch(err){setError(err.response?.data?.error||"Erro ao fazer login");}finally{setLoading(false);}
    }else{
      if(!name||!email||!password){setError("Preencha nome, e-mail e senha");return;}
      setLoading(true);setError("");
      try{const{data}=await authApi.signup({name,email,password,company});localStorage.setItem('zapechat_token',data.token);localStorage.setItem('zapechat_user',JSON.stringify(data.user));onLogin(data.user);}
      catch(err){setError(err.response?.data?.error||"Erro ao criar conta");}finally{setLoading(false);}
    }
  };

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:dark?"radial-gradient(ellipse at 20% 50%,rgba(16,185,129,0.08) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(139,92,246,0.06) 0%,transparent 50%),#0a0f1a":"radial-gradient(ellipse at 20% 50%,rgba(5,150,105,0.06) 0%,transparent 50%),#f8fafc",padding:"20px",fontFamily:"'Segoe UI',-apple-system,sans-serif"}}>
      <button onClick={toggle} style={{position:"absolute",top:"24px",right:"24px",background:c.bgCard,border:`1px solid ${c.border}`,borderRadius:"12px",padding:"10px",cursor:"pointer",color:c.textSec,display:"flex",boxShadow:c.shadow}}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button>
      <div style={{width:"100%",maxWidth:"420px"}}>
        <div style={{textAlign:"center",marginBottom:"36px"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:"12px",marginBottom:"12px"}}>
            <div style={{width:"52px",height:"52px",borderRadius:"16px",background:`linear-gradient(135deg,${c.accent},${c.violet})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 8px 32px ${c.accentGlow}`}}><Zap size={26} color="white" strokeWidth={2.5}/></div>
            <span style={{fontSize:"32px",fontWeight:"800",color:c.text}}>Zapê<span style={{color:c.accent}}>Chat</span></span>
          </div>
          <p style={{color:c.textMut,fontSize:"15px",margin:0}}>Disparos inteligentes via WhatsApp</p>
        </div>
        <div style={{background:c.bgCard,borderRadius:"20px",padding:"36px",border:`1px solid ${c.border}`,boxShadow:c.shadowLg}}>
          {/* Tabs */}
          <div style={{display:"flex",marginBottom:"24px",background:c.bgInput,borderRadius:"10px",padding:"4px"}}>
            <button onClick={()=>{setMode("login");setError("");}} style={{flex:1,padding:"10px",borderRadius:"8px",border:"none",background:mode==="login"?c.bgCard:"transparent",color:mode==="login"?c.text:c.textMut,fontSize:"14px",fontWeight:"600",cursor:"pointer",transition:"all 0.2s",boxShadow:mode==="login"?c.shadow:"none"}}>Entrar</button>
            <button onClick={()=>{setMode("signup");setError("");}} style={{flex:1,padding:"10px",borderRadius:"8px",border:"none",background:mode==="signup"?c.bgCard:"transparent",color:mode==="signup"?c.text:c.textMut,fontSize:"14px",fontWeight:"600",cursor:"pointer",transition:"all 0.2s",boxShadow:mode==="signup"?c.shadow:"none"}}>Criar Conta</button>
          </div>
          {error&&<div style={{background:c.dangerSoft,border:`1px solid ${c.danger}33`,borderRadius:"12px",padding:"12px 16px",marginBottom:"20px",display:"flex",alignItems:"center",gap:"10px",color:c.danger,fontSize:"13px"}}><AlertCircle size={16}/>{error}</div>}
          {mode==="signup"&&<><div style={{marginBottom:"14px"}}><label style={lbl(c)}>Nome</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome" style={inp(c)}/></div>
          <div style={{marginBottom:"14px"}}><label style={lbl(c)}>Empresa (opcional)</label><input value={company} onChange={e=>setCompany(e.target.value)} placeholder="Nome da empresa" style={inp(c)}/></div></>}
          <div style={{marginBottom:"14px"}}><label style={lbl(c)}>E-mail</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" style={inp(c)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/></div>
          <div style={{marginBottom:"24px"}}><label style={lbl(c)}>Senha</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={inp(c)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/></div>
          <button onClick={handleSubmit} disabled={loading} style={{...btnP(c,loading),width:"100%",justifyContent:"center",padding:"14px"}}>{loading?<RefreshCw size={18} style={{animation:"spin 1s linear infinite"}}/>:mode==="login"?<>Entrar<ChevronRight size={18}/></>:<><UserPlus size={18}/>Criar Conta</>}</button>
        </div>
        <p style={{textAlign:"center",color:c.textMut,fontSize:"13px",marginTop:"24px"}}>© 2026 ZapêChat</p>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes slideIn{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}} input::placeholder{color:${c.textMut}}`}</style>
    </div>
  );
}

// ==================== QR CODE PAGE ====================
function QrCodePage(){
  const{dark}=useTheme();const c=C(dark);
	const[qrcode,setQrcode]=useState(null);const[status,setStatus]=useState("loading");const[loading,setLoading]=useState(false);const[disconnecting,setDisconnecting]=useState(false);const[toast,setToast]=useState(null);

  const disconnect=async()=>{setDisconnecting(true);try{await authApi.disconnect();setStatus("disconnected");setQrcode(null);setToast({msg:"WhatsApp desconectado!",type:"success"});}catch(e){setToast({msg:"Erro ao desconectar",type:"error"});}finally{setDisconnecting(false);}};

  const checkStatus=async()=>{
    try{const{data}=await authApi.connectionStatus();setStatus(data.connected?"connected":data.status);}catch(e){setStatus("error");}
  };

  const getQr=async()=>{
    setLoading(true);
    try{const{data}=await authApi.qrcode();setQrcode(data.qrcode||null);setStatus("waiting_scan");}catch(e){setStatus("error");}finally{setLoading(false);}
  };

  useEffect(()=>{checkStatus();const i=setInterval(checkStatus,5000);return()=>clearInterval(i);},[]);

if(status==="connected")return(
    <div style={{padding:"24px",display:"flex",justifyContent:"center"}}>
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
      <div style={{...card(c),maxWidth:"500px",textAlign:"center",padding:"40px"}}>
        <div style={{width:"80px",height:"80px",borderRadius:"50%",background:c.okSoft,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><Wifi size={36} color={c.ok}/></div>
        <h2 style={{color:c.text,fontSize:"22px",fontWeight:"700",margin:"0 0 8px"}}>WhatsApp Conectado!</h2>
        <p style={{color:c.textMut,fontSize:"14px",margin:"0 0 24px"}}>Seu WhatsApp está pronto para enviar mensagens.</p>
        <button onClick={disconnect} disabled={disconnecting} style={{...btnS(c),color:c.danger,borderColor:c.danger+"44"}}>{disconnecting?<RefreshCw size={16} style={{animation:"spin 1s linear infinite"}}/>:<WifiOff size={16}/>}{disconnecting?"Desconectando...":"Desconectar WhatsApp"}</button>
      </div>
    </div>
  );

  return(
    <div style={{padding:"24px",display:"flex",justifyContent:"center"}}>
      <div style={{...card(c),maxWidth:"500px",textAlign:"center",padding:"40px"}}>
        <div style={{width:"80px",height:"80px",borderRadius:"50%",background:c.warnSoft,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><WifiOff size={36} color={c.warn}/></div>
        <h2 style={{color:c.text,fontSize:"22px",fontWeight:"700",margin:"0 0 8px"}}>Conectar WhatsApp</h2>
        <p style={{color:c.textMut,fontSize:"14px",margin:"0 0 24px"}}>Escaneie o QR Code abaixo com seu WhatsApp</p>
        {qrcode?<div style={{marginBottom:"24px"}}><img src={qrcode.startsWith('data:')?qrcode:`data:image/png;base64,${qrcode}`} alt="QR Code" style={{width:"280px",height:"280px",borderRadius:"12px",border:`2px solid ${c.border}`}}/></div>
        :<button onClick={getQr} disabled={loading} style={{...btnP(c,loading),margin:"0 auto 24px"}}>{loading?<RefreshCw size={16} style={{animation:"spin 1s linear infinite"}}/>:<QrCode size={16}/>}{loading?"Gerando...":"Gerar QR Code"}</button>}
        <button onClick={getQr} disabled={loading} style={btnS(c)}><RefreshCw size={14}/>Atualizar QR Code</button>
        <p style={{color:c.textMut,fontSize:"12px",marginTop:"16px"}}>Abra o WhatsApp → Menu (⋮) → Dispositivos conectados → Conectar dispositivo</p>
      </div>
    </div>
  );
}

// ==================== ADMIN PANEL ====================
function AdminPage(){
  const{dark}=useTheme();const c=C(dark);
  const[users,setUsers]=useState([]);const[loading,setLoading]=useState(true);const[search,setSearch]=useState("");const[toast,setToast]=useState(null);
  const[showCreate,setShowCreate]=useState(false);const[newUser,setNewUser]=useState({name:"",email:"",password:"",company:""});const[creating,setCreating]=useState(false);

  const load=async()=>{try{const{data}=await authApi.listUsers({search});setUsers(data.users||[]);}catch(e){}finally{setLoading(false);}};
  useEffect(()=>{load();},[search]);

  const createUser=async()=>{
    if(!newUser.name||!newUser.email||!newUser.password){setToast({msg:"Preencha nome, email e senha",type:"error"});return;}
    setCreating(true);
    try{await authApi.register(newUser);setToast({msg:"Cliente criado com sucesso! Instância criada automaticamente.",type:"success"});setShowCreate(false);setNewUser({name:"",email:"",password:"",company:""});load();}
    catch(err){setToast({msg:err.response?.data?.error||"Erro ao criar",type:"error"});}finally{setCreating(false);}
  };

  const toggleActive=async(user)=>{
    try{await authApi.updateUser(user.id,{is_active:!user.is_active});setToast({msg:`${user.name} ${!user.is_active?"ativado":"desativado"}`,type:"success"});load();}
    catch(e){setToast({msg:"Erro ao atualizar",type:"error"});}
  };

  const deleteUser=async(user)=>{
    if(!confirm(`Tem certeza que deseja remover ${user.name}? Isso vai deletar a instância e todos os dados.`))return;
    try{await authApi.deleteUser(user.id);setToast({msg:"Usuário removido",type:"success"});load();}
    catch(e){setToast({msg:"Erro ao remover",type:"error"});}
  };

  return(<div style={{padding:"24px"}}>
    {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    <div style={{...card(c),marginBottom:"20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
        <h3 style={{margin:0,fontSize:"18px",fontWeight:"700",color:c.text,display:"flex",alignItems:"center",gap:"10px"}}><Shield size={20} color={c.violet}/>Painel Admin — Clientes</h3>
        <button onClick={()=>setShowCreate(!showCreate)} style={btnP(c,false)}><Plus size={16}/>Novo Cliente</button>
      </div>

      {showCreate&&<div style={{background:c.bgInput,borderRadius:"14px",padding:"20px",marginBottom:"20px",border:`1px solid ${c.border}`}}>
        <h4 style={{margin:"0 0 16px",color:c.text,fontSize:"15px",fontWeight:"600"}}>Criar Novo Cliente</h4>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
          <div><label style={lbl(c)}>Nome</label><input value={newUser.name} onChange={e=>setNewUser({...newUser,name:e.target.value})} placeholder="Nome do cliente" style={inp(c)}/></div>
          <div><label style={lbl(c)}>Empresa</label><input value={newUser.company} onChange={e=>setNewUser({...newUser,company:e.target.value})} placeholder="Empresa (opcional)" style={inp(c)}/></div>
          <div><label style={lbl(c)}>E-mail</label><input value={newUser.email} onChange={e=>setNewUser({...newUser,email:e.target.value})} placeholder="email@cliente.com" style={inp(c)}/></div>
          <div><label style={lbl(c)}>Senha</label><input value={newUser.password} onChange={e=>setNewUser({...newUser,password:e.target.value})} placeholder="Senha inicial" type="password" style={inp(c)}/></div>
        </div>
        <div style={{display:"flex",gap:"10px"}}><button onClick={createUser} disabled={creating} style={btnP(c,creating)}>{creating?<RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/>:<UserPlus size={14}/>}{creating?"Criando...":"Criar Cliente"}</button><button onClick={()=>setShowCreate(false)} style={btnS(c)}>Cancelar</button></div>
        <p style={{color:c.textMut,fontSize:"12px",marginTop:"10px"}}>A instância na Evolution API será criada automaticamente.</p>
      </div>}

      <div style={{position:"relative",marginBottom:"16px"}}><Search size={15} color={c.textMut} style={{position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)"}}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar clientes..." style={{...inp(c),paddingLeft:"38px"}}/></div>

      {loading?<p style={{color:c.textMut,textAlign:"center",padding:"20px"}}>Carregando...</p>:
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>
        {["Nome","Email","Empresa","Instância","Mensagens","Status","Ações"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:"11px",fontWeight:"600",color:c.textMut,textTransform:"uppercase",borderBottom:`1px solid ${c.border}`}}>{h}</th>)}
      </tr></thead><tbody>
        {users.map(u=><tr key={u.id} onMouseEnter={e=>e.currentTarget.style.background=c.bgCardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <td style={{padding:"10px 12px",fontSize:"13px",fontWeight:"600",color:c.text}}>{u.name}</td>
          <td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec}}>{u.email}</td>
          <td style={{padding:"10px 12px",fontSize:"13px",color:c.textMut}}>{u.company||"—"}</td>
          <td style={{padding:"10px 12px",fontSize:"12px",color:c.textMut,fontFamily:"monospace"}}>{u.evolution_instance||"—"}</td>
          <td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec}}>{u.total_messages||0}</td>
          <td style={{padding:"10px 12px"}}>
            <button onClick={()=>toggleActive(u)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px",color:u.is_active?c.ok:c.danger,fontSize:"12px",fontWeight:"600"}}>
              {u.is_active?<ToggleRight size={18}/>:<ToggleLeft size={18}/>}{u.is_active?"Ativo":"Inativo"}
            </button>
          </td>
          <td style={{padding:"10px 12px"}}>
            {u.role!=="admin"&&<button onClick={()=>deleteUser(u)} style={{background:"none",border:"none",cursor:"pointer",color:c.danger,padding:"4px"}} title="Remover"><Trash2 size={16}/></button>}
          </td>
        </tr>)}
      </tbody></table></div>}
    </div>
  </div>);
}

// ==================== SIDEBAR ====================
function Sidebar({active,onNavigate,collapsed,user}){
  const{dark,toggle}=useTheme();const c=C(dark);
  const isAdmin=user?.role==="admin";
  const nav=[{id:"dashboard",icon:BarChart3,label:"Dashboard"},{id:"qrcode",icon:QrCode,label:"WhatsApp"},{id:"send",icon:Send,label:"Enviar Mensagem"},{id:"mass",icon:Mail,label:"Disparo em Massa"},{id:"groups",icon:Users,label:"Grupos"},{id:"reports",icon:PieChart,label:"Relatórios"},{id:"contacts",icon:Phone,label:"Contatos"},...(isAdmin?[{id:"admin",icon:Shield,label:"Admin"}]:[]),{id:"settings",icon:Settings,label:"Configurações"}];
  const navBtn=(id,Icon,label,isActive,color)=>(<button key={id} onClick={()=>onNavigate(id)} style={{width:"100%",padding:collapsed?"12px 0":"11px 14px",display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:"12px",background:isActive?c.accentSoft:"transparent",border:"none",borderRadius:"10px",cursor:"pointer",color:color||(isActive?c.accent:c.textSec),fontSize:"13px",fontWeight:isActive?"600":"500",marginBottom:"2px",position:"relative",transition:"all 0.15s"}} onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background=c.bgCardHover;}} onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background="transparent";}}>
    {isActive&&!collapsed&&<div style={{position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",width:"3px",height:"20px",borderRadius:"4px",background:c.accent}}/>}<Icon size={19}/>{!collapsed&&label}</button>);
  return(<div style={{width:collapsed?"68px":"250px",minHeight:"100vh",background:c.bgSidebar,borderRight:`1px solid ${c.border}`,display:"flex",flexDirection:"column",transition:"width 0.3s",flexShrink:0}}>
    <div style={{padding:collapsed?"18px 0":"18px 20px",display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:"10px",borderBottom:`1px solid ${c.border}`,minHeight:"64px"}}><div style={{width:"34px",height:"34px",borderRadius:"10px",background:`linear-gradient(135deg,${c.accent},${c.violet})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Zap size={17} color="white" strokeWidth={2.5}/></div>{!collapsed&&<span style={{fontSize:"19px",fontWeight:"800",color:c.text}}>Zapê<span style={{color:c.accent}}>Chat</span></span>}</div>
    <nav style={{padding:"10px 8px",flex:1}}>{nav.map(i=>navBtn(i.id,i.icon,i.label,active===i.id))}</nav>
    <div style={{padding:"10px 8px",borderTop:`1px solid ${c.border}`}}>{navBtn("theme",dark?Sun:Moon,dark?"Modo Claro":"Modo Escuro",false)}{navBtn("logout",LogOut,"Sair",false,c.danger)}</div>
  </div>);
}

// ==================== HEADER ====================
function Header({title,subtitle,user,onToggleSidebar}){
  const{dark}=useTheme();const c=C(dark);
  return(<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px",borderBottom:`1px solid ${c.border}`,background:c.bgCard}}>
    <div style={{display:"flex",alignItems:"center",gap:"14px"}}><button onClick={onToggleSidebar} style={{background:"transparent",border:"none",cursor:"pointer",color:c.textSec,padding:"6px",borderRadius:"8px",display:"flex"}}><Menu size={20}/></button><div><h1 style={{margin:0,fontSize:"20px",fontWeight:"700",color:c.text}}>{title}</h1>{subtitle&&<p style={{margin:"2px 0 0",fontSize:"12px",color:c.textMut}}>{subtitle}</p>}</div></div>
    <div style={{display:"flex",alignItems:"center",gap:"10px"}}><span style={{fontSize:"13px",color:c.textSec,fontWeight:"500"}}>{user?.name}</span><div style={{width:"34px",height:"34px",borderRadius:"10px",background:`linear-gradient(135deg,${c.accent},${c.violet})`,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:"13px",fontWeight:"700"}}>{user?.name?.charAt(0).toUpperCase()||"U"}</div></div>
  </div>);
}

// ==================== PAGES (same as before, abbreviated) ====================
function DashboardPage(){const{dark}=useTheme();const c=C(dark);const[stats,setStats]=useState(null);const[messages,setMessages]=useState([]);const[loading,setLoading]=useState(true);useEffect(()=>{(async()=>{try{const[d,m]=await Promise.all([reportsApi.dashboard(),messagesApi.history({limit:8})]);setStats(d.data);setMessages(m.data.messages||[]);}catch(e){}finally{setLoading(false);}})();},[]);if(loading)return<div style={{padding:"40px",textAlign:"center",color:c.textMut}}><RefreshCw size={24} style={{animation:"spin 1s linear infinite"}}/></div>;const t=stats?.total||{};const td=stats?.today||{};return(<div style={{padding:"24px"}}><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"14px",marginBottom:"24px"}}><StatCard icon={Send} label="Enviadas" value={parseInt(t.total_sent)||0} color={c.accent} colorSoft={c.accentSoft}/><StatCard icon={CheckCircle} label="Entregues" value={parseInt(t.total_delivered)||0} color={c.info} colorSoft={c.infoSoft}/><StatCard icon={Eye} label="Lidas" value={parseInt(t.total_read)||0} color={c.violet} colorSoft={c.violetGlow}/><StatCard icon={AlertCircle} label="Falharam" value={parseInt(t.total_failed)||0} color={c.danger} colorSoft={c.dangerSoft}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"24px"}}><div style={card(c)}><h3 style={{margin:"0 0 16px",fontSize:"15px",fontWeight:"700",color:c.text,display:"flex",alignItems:"center",gap:"8px"}}><Clock size={16} color={c.accent}/>Hoje</h3>{[{l:"Enviadas",v:td.sent_today},{l:"Entregues",v:td.delivered_today},{l:"Lidas",v:td.read_today},{l:"Falhas",v:td.failed_today}].map((i,idx)=><div key={idx} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:idx<3?`1px solid ${c.border}`:"none"}}><span style={{fontSize:"13px",color:c.textSec}}>{i.l}</span><span style={{fontSize:"15px",fontWeight:"700",color:c.text}}>{parseInt(i.v)||0}</span></div>)}</div><div style={card(c)}><h3 style={{margin:"0 0 16px",fontSize:"15px",fontWeight:"700",color:c.text,display:"flex",alignItems:"center",gap:"8px"}}><BarChart3 size={16} color={c.violet}/>Resumo</h3>{[{icon:Phone,l:"Contatos",v:stats?.contacts||0,col:c.info},{icon:Users,l:"Grupos",v:stats?.groups||0,col:c.violet},{icon:Mail,l:"Campanhas",v:stats?.campaigns||0,col:c.accent},{icon:Zap,l:"Ativos",v:stats?.activeCampaigns||0,col:c.warn}].map((i,idx)=><div key={idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:idx<3?`1px solid ${c.border}`:"none"}}><div style={{display:"flex",alignItems:"center",gap:"8px"}}><i.icon size={15} color={i.col}/><span style={{fontSize:"13px",color:c.textSec}}>{i.l}</span></div><span style={{fontSize:"15px",fontWeight:"700",color:c.text}}>{i.v}</span></div>)}</div></div><div style={card(c)}><h3 style={{margin:"0 0 14px",fontSize:"15px",fontWeight:"700",color:c.text}}>Mensagens Recentes</h3>{messages.length===0?<p style={{color:c.textMut,fontSize:"13px",textAlign:"center",padding:"20px"}}>Nenhuma mensagem</p>:<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Telefone","Mensagem","Status","Data"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:"11px",fontWeight:"600",color:c.textMut,textTransform:"uppercase",borderBottom:`1px solid ${c.border}`}}>{h}</th>)}</tr></thead><tbody>{messages.map(m=><tr key={m.id}><td style={{padding:"10px 12px",fontSize:"13px",fontWeight:"600",color:c.text,fontFamily:"monospace"}}>{m.phone}</td><td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec,maxWidth:"200px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.message_text||"[mídia]"}</td><td style={{padding:"10px 12px"}}><span style={badge(c,m.status)}>{statusMap[m.status]?.l||m.status}</span></td><td style={{padding:"10px 12px",fontSize:"12px",color:c.textMut}}>{m.created_at?new Date(m.created_at).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):""}</td></tr>)}</tbody></table></div>}</div></div>);}

function SendMessagePage(){const{dark}=useTheme();const c=C(dark);const[number,setNumber]=useState("");const[message,setMessage]=useState("");const[delay,setDelay]=useState("1000");const[media,setMedia]=useState(null);const[sending,setSending]=useState(false);const[toast,setToast]=useState(null);const[showPreview,setShowPreview]=useState(false);const handleSend=async()=>{setShowPreview(false);setSending(true);try{if(media){if(media.type==='audio'){const b=media.url.includes('base64,')?media.url.split('base64,')[1]:media.url;await messagesApi.sendAudio({number,media:b,delay:parseInt(delay)});}else if(media.isUrl){await messagesApi.sendMedia({number,media:media.url,caption:message,mediaType:media.type,mimetype:'video/mp4',fileName:media.name||'video.mp4',delay:parseInt(delay)});}else{const b=media.url.includes('base64,')?media.url.split('base64,')[1]:media.url;await messagesApi.sendMedia({number,media:b,caption:message,mediaType:media.type,mimetype:media.file?.type||'image/png',fileName:media.name||'file',delay:parseInt(delay)});}}else{await messagesApi.sendText(number,message,{delay:parseInt(delay)});}setToast({msg:"Mensagem enviada!",type:"success"});setNumber("");setMessage("");setMedia(null);}catch(err){setToast({msg:err.response?.data?.error||"Falha ao enviar",type:"error"});}finally{setSending(false);}};const canSend=number&&(message||media);return(<div style={{padding:"24px",maxWidth:"700px"}}>{toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}{showPreview&&<PreviewModal number={number} text={message} media={media} onConfirm={handleSend} onCancel={()=>setShowPreview(false)} sending={sending}/>}<div style={card(c)}><div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px"}}><Send size={20} color={c.accent}/><h3 style={{margin:0,fontSize:"18px",fontWeight:"700",color:c.text}}>Enviar Mensagem</h3></div><p style={{margin:"0 0 22px",fontSize:"13px",color:c.textMut}}>Texto ou mídia via WhatsApp</p><div style={{marginBottom:"16px"}}><label style={lbl(c)}>Número</label><input value={number} onChange={e=>setNumber(e.target.value)} placeholder="5511999887766" style={inp(c)}/></div><div style={{marginBottom:"16px"}}><label style={lbl(c)}>Mensagem</label><textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Digite..." rows={4} style={{...inp(c),resize:"vertical"}}/></div><label style={{...lbl(c),display:"flex",alignItems:"center",gap:"6px"}}><Paperclip size={13}/>Anexar Mídia</label><MediaPicker selected={media} onSelect={setMedia} onRemove={()=>setMedia(null)}/><div style={{marginBottom:"20px"}}><label style={lbl(c)}>Delay (ms)</label><input value={delay} onChange={e=>setDelay(e.target.value)} type="number" style={{...inp(c),width:"140px"}}/></div><button onClick={()=>setShowPreview(true)} disabled={!canSend} style={btnP(c,!canSend)}><Eye size={16}/>Pré-visualizar e Enviar</button></div></div>);}

function MassSendPage(){const{dark}=useTheme();const c=C(dark);const[numbers,setNumbers]=useState("");const[message,setMessage]=useState("");const[interval_,setInterval_]=useState("3");const[name,setName]=useState("");const[scheduled,setScheduled]=useState("");const[running,setRunning]=useState(false);const[toast,setToast]=useState(null);const[campaigns,setCampaigns]=useState([]);const[loading,setLoading]=useState(true);useEffect(()=>{(async()=>{try{const{data}=await campaignsApi.list();setCampaigns(data.campaigns||[]);}catch(e){}finally{setLoading(false);}})();},[]);const start=async()=>{const nums=numbers.split("\n").filter(n=>n.trim());if(!nums.length||!message||!name)return;setRunning(true);try{const p={name,message,recipients:nums.map(n=>({phone:n.trim()})),interval_ms:parseInt(interval_)*1000};if(scheduled)p.scheduled_at=scheduled;const{data:camp}=await campaignsApi.create(p);if(!scheduled)await campaignsApi.start(camp.campaign.id);setToast({msg:scheduled?`Agendado!`:`Disparo iniciado! ${nums.length} msgs`,type:"success"});setName("");setNumbers("");setMessage("");setScheduled("");const{data:u}=await campaignsApi.list();setCampaigns(u.campaigns||[]);}catch(err){setToast({msg:err.response?.data?.error||"Falha",type:"error"});}finally{setRunning(false);}};const stS=s=>({completed:{bg:c.okSoft,col:c.ok,l:"Concluída"},running:{bg:c.warnSoft,col:c.warn,l:"Enviando"},scheduled:{bg:c.infoSoft,col:c.info,l:"Agendada"},draft:{bg:c.bgInput,col:c.textMut,l:"Rascunho"},paused:{bg:c.warnSoft,col:c.warn,l:"Pausada"}}[s]||{bg:c.bgInput,col:c.textMut,l:s});return(<div style={{padding:"24px",maxWidth:"900px"}}>{toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}<div style={{...card(c),marginBottom:"20px"}}><div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px"}}><Mail size={20} color={c.violet}/><h3 style={{margin:0,fontSize:"18px",fontWeight:"700",color:c.text}}>Disparo em Massa</h3></div><p style={{margin:"0 0 20px",fontSize:"13px",color:c.textMut}}>Envie para múltiplos contatos</p><div style={{background:c.warnSoft,border:`1px solid ${c.warn}33`,borderRadius:"12px",padding:"12px 16px",marginBottom:"20px",display:"flex",alignItems:"flex-start",gap:"10px",color:c.warn,fontSize:"12px"}}><AlertCircle size={16} style={{flexShrink:0,marginTop:"1px"}}/><span>Intervalo mínimo de 3 segundos recomendado.</span></div><div style={{marginBottom:"16px"}}><label style={lbl(c)}>Nome da Campanha</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: Promoção Março" style={inp(c)}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"16px"}}><div><label style={lbl(c)}>Números (um por linha)</label><textarea value={numbers} onChange={e=>setNumbers(e.target.value)} placeholder={"5511999887766\n5511988776655"} rows={7} style={{...inp(c),fontFamily:"monospace",fontSize:"13px",resize:"vertical"}}/><span style={{fontSize:"11px",color:c.textMut}}>{numbers.split("\n").filter(n=>n.trim()).length} contatos</span></div><div><label style={lbl(c)}>Mensagem</label><textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Sua mensagem..." rows={7} style={{...inp(c),resize:"vertical",fontSize:"13px"}}/></div></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"20px"}}><div><label style={lbl(c)}>Intervalo (seg)</label><input value={interval_} onChange={e=>setInterval_(e.target.value)} type="number" min="1" style={inp(c)}/></div><div><label style={{...lbl(c),display:"flex",alignItems:"center",gap:"6px"}}><Calendar size={12}/>Agendar (opcional)</label><input value={scheduled} onChange={e=>setScheduled(e.target.value)} type="datetime-local" style={inp(c)}/></div></div><button onClick={start} disabled={running||!numbers.trim()||!message||!name} style={btnP(c,running||!numbers.trim()||!message||!name)}>{running?<RefreshCw size={16} style={{animation:"spin 1s linear infinite"}}/>:scheduled?<Calendar size={16}/>:<Play size={16}/>}{running?"Processando...":scheduled?"Agendar":"Iniciar Disparo"}</button></div>{campaigns.length>0&&<div style={card(c)}><h3 style={{margin:"0 0 14px",fontSize:"15px",fontWeight:"700",color:c.text}}>Histórico</h3><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Campanha","Total","Enviadas","Falhas","Status"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:"11px",fontWeight:"600",color:c.textMut,textTransform:"uppercase",borderBottom:`1px solid ${c.border}`}}>{h}</th>)}</tr></thead><tbody>{campaigns.map(cp=>{const st=stS(cp.status);return<tr key={cp.id}><td style={{padding:"10px 12px",fontSize:"13px",fontWeight:"600",color:c.text}}>{cp.name}</td><td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec}}>{cp.total_recipients}</td><td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec}}>{cp.sent_count}</td><td style={{padding:"10px 12px",fontSize:"13px",color:cp.failed_count>0?c.danger:c.textSec}}>{cp.failed_count}</td><td style={{padding:"10px 12px"}}><span style={{fontSize:"11px",fontWeight:"600",padding:"3px 8px",borderRadius:"6px",background:st.bg,color:st.col}}>{st.l}</span></td></tr>;})}</tbody></table></div></div>}</div>);}

// ==========================================
// NOVA GroupsPage COMPLETA
// Substitua a função GroupsPage inteira no App.jsx por este código
// ==========================================

function GroupsPage(){
  const{dark}=useTheme();const c=C(dark);
  const[groups,setGroups]=useState([]);const[selected,setSelected]=useState(null);const[loading,setLoading]=useState(true);
  const[syncing,setSyncing]=useState(false);const[toast,setToast]=useState(null);
  const[tab,setTab]=useState("send"); // send, poll, contact, manage, create
  
  // Send state
  const[msgText,setMsgText]=useState("");const[sending,setSending]=useState(false);
  const[mentionAll,setMentionAll]=useState(false);const[mentionNumbers,setMentionNumbers]=useState("");
  
  // Poll state
  const[pollQuestion,setPollQuestion]=useState("");const[pollOptions,setPollOptions]=useState(["","",""]);
  const[pollMulti,setPollMulti]=useState(false);const[sendingPoll,setSendingPoll]=useState(false);
  
  // Contact state
  const[contactName,setContactName]=useState("");const[contactPhone,setContactPhone]=useState("");
  const[contactOrg,setContactOrg]=useState("");const[sendingContact,setSendingContact]=useState(false);
  
  // Create group state
  const[newGroupName,setNewGroupName]=useState("");const[newGroupDesc,setNewGroupDesc]=useState("");
  const[newGroupParticipants,setNewGroupParticipants]=useState("");const[creating,setCreating]=useState(false);
  
  // Manage state
  const[members,setMembers]=useState([]);const[loadingMembers,setLoadingMembers]=useState(false);
  const[editName,setEditName]=useState("");const[editDesc,setEditDesc]=useState("");
  const[addNumber,setAddNumber]=useState("");const[inviteLink,setInviteLink]=useState("");

  const load=async()=>{try{const{data}=await groupsApi.list();setGroups(data.groups||[]);}catch(e){}finally{setLoading(false);}};
  const sync=async()=>{setSyncing(true);try{await groupsApi.sync();await load();setToast({msg:"Grupos sincronizados!",type:"success"});}catch(e){setToast({msg:"Falha ao sincronizar",type:"error"});}finally{setSyncing(false);}};
  useEffect(()=>{load();},[]);

  // Load members when selecting manage tab
  const loadMembers=async(jid)=>{
    setLoadingMembers(true);
    try{const{data}=await groupsApi.members(jid);setMembers(Array.isArray(data.members)?data.members:data.members?.participants||[]);}
    catch(e){setMembers([]);}finally{setLoadingMembers(false);}
  };

  const selectGroup=(g)=>{
    setSelected(g);setTab("send");setEditName(g.name||"");setEditDesc(g.description||"");
    setMsgText("");setMentionAll(false);setMentionNumbers("");setInviteLink("");
  };

  // ===== SEND TEXT =====
  const sendText=async()=>{
    if(!selected||!msgText)return;setSending(true);
    try{
      const opts={delay:1000};
      if(mentionAll)opts.mentionsEveryOne=true;
      if(mentionNumbers.trim()){
        opts.mentioned=mentionNumbers.split("\n").filter(n=>n.trim()).map(n=>n.trim());
      }
      await groupsApi.send(selected.group_jid,msgText,opts);
      setToast({msg:"Mensagem enviada!",type:"success"});setMsgText("");setMentionAll(false);setMentionNumbers("");
    }catch(e){setToast({msg:e.response?.data?.error||"Falha",type:"error"});}finally{setSending(false);}
  };

  // ===== SEND POLL =====
  const sendPoll=async()=>{
    const opts=pollOptions.filter(o=>o.trim());
    if(!selected||!pollQuestion||opts.length<2)return;setSendingPoll(true);
    try{
      await groupsApi.sendPoll(selected.group_jid,{name:pollQuestion,values:opts,selectableCount:pollMulti?opts.length:1});
      setToast({msg:"Enquete enviada!",type:"success"});setPollQuestion("");setPollOptions(["","",""]);
    }catch(e){setToast({msg:e.response?.data?.error||"Falha ao enviar enquete",type:"error"});}finally{setSendingPoll(false);}
  };

  const addPollOption=()=>setPollOptions([...pollOptions,""]);
  const removePollOption=(i)=>setPollOptions(pollOptions.filter((_,idx)=>idx!==i));
  const updatePollOption=(i,v)=>{const n=[...pollOptions];n[i]=v;setPollOptions(n);};

  // ===== SEND CONTACT =====
  const sendContact=async()=>{
    if(!selected||!contactName||!contactPhone)return;setSendingContact(true);
    try{
      await groupsApi.sendContact(selected.group_jid,{fullName:contactName,phoneNumber:contactPhone,organization:contactOrg});
      setToast({msg:"Contato enviado!",type:"success"});setContactName("");setContactPhone("");setContactOrg("");
    }catch(e){setToast({msg:e.response?.data?.error||"Falha",type:"error"});}finally{setSendingContact(false);}
  };

  // ===== CREATE GROUP =====
  const createGroup=async()=>{
    const parts=newGroupParticipants.split("\n").filter(n=>n.trim()).map(n=>n.trim());
    if(!newGroupName||parts.length<1)return;setCreating(true);
    try{
      await groupsApi.create({subject:newGroupName,description:newGroupDesc,participants:parts});
      setToast({msg:"Grupo criado!",type:"success"});setNewGroupName("");setNewGroupDesc("");setNewGroupParticipants("");
      await sync();
    }catch(e){setToast({msg:e.response?.data?.error||"Falha ao criar grupo",type:"error"});}finally{setCreating(false);}
  };

  // ===== MANAGE =====
  const updateSubject=async()=>{
    if(!editName)return;try{await groupsApi.updateSubject(selected.group_jid,editName);setToast({msg:"Nome alterado!",type:"success"});load();}catch(e){setToast({msg:"Falha",type:"error"});}
  };
  const updateDesc=async()=>{
    try{await groupsApi.updateDescription(selected.group_jid,editDesc);setToast({msg:"Descrição alterada!",type:"success"});}catch(e){setToast({msg:"Falha",type:"error"});}
  };
  const changeSetting=async(action)=>{
    try{await groupsApi.updateSettings(selected.group_jid,action);
    const labels={announcement:"Apenas admins enviam",not_announcement:"Todos podem enviar",locked:"Apenas admins editam",unlocked:"Todos podem editar"};
    setToast({msg:labels[action]||"Alterado!",type:"success"});}catch(e){setToast({msg:"Falha",type:"error"});}
  };
  const manageParticipant=async(action,number)=>{
    try{await groupsApi.updateParticipants(selected.group_jid,action,[number]);
    const labels={add:"Adicionado!",remove:"Removido!",promote:"Promovido a admin!",demote:"Rebaixado!"};
    setToast({msg:labels[action],type:"success"});loadMembers(selected.group_jid);}catch(e){setToast({msg:e.response?.data?.error||"Falha",type:"error"});}
  };
  const addParticipant=async()=>{
    if(!addNumber.trim())return;
    await manageParticipant("add",addNumber.trim());setAddNumber("");
  };
  const getInviteLink=async()=>{
    try{const{data}=await groupsApi.inviteCode(selected.group_jid);setInviteLink(data.inviteCode?.inviteUrl||data.inviteCode||JSON.stringify(data));}catch(e){setToast({msg:"Falha",type:"error"});}
  };
  const leaveGroup=async()=>{
    if(!confirm("Tem certeza que deseja sair deste grupo?"))return;
    try{await groupsApi.leave(selected.group_jid);setToast({msg:"Saiu do grupo!",type:"success"});setSelected(null);load();}catch(e){setToast({msg:"Falha",type:"error"});}
  };

  // ===== TAB BUTTONS =====
  const tabBtn=(id,icon,label)=>{
    const Icon=icon;const active=tab===id;
    return<button key={id} onClick={()=>{setTab(id);if(id==="manage"&&selected)loadMembers(selected.group_jid);}} style={{padding:"7px 12px",borderRadius:"8px",border:"none",background:active?c.accent:c.bgInput,color:active?"white":c.textSec,fontSize:"11px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"5px",transition:"all 0.2s"}}><Icon size={13}/>{label}</button>;
  };

  // ===== RENDER =====
  return(<div style={{padding:"24px"}}>
    {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    <div style={{display:"grid",gridTemplateColumns:"320px 1fr",gap:"14px"}}>
      
      {/* LEFT: Group List */}
      <div style={card(c)}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
          <h3 style={{margin:0,fontSize:"15px",fontWeight:"700",color:c.text}}>Grupos</h3>
          <div style={{display:"flex",gap:"6px"}}>
            <button onClick={()=>{setSelected(null);setTab("create");}} style={{padding:"6px 10px",borderRadius:"8px",border:"none",background:c.accentSoft,color:c.accent,fontSize:"11px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"}}><Plus size={12}/>Criar</button>
            <button onClick={sync} disabled={syncing} style={{padding:"6px 10px",borderRadius:"8px",border:"none",background:c.bgInput,color:c.textSec,fontSize:"11px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"}}><RefreshCw size={12} style={syncing?{animation:"spin 1s linear infinite"}:{}}/>{syncing?"...":"Sync"}</button>
          </div>
        </div>
        {loading?<p style={{color:c.textMut,textAlign:"center",padding:"20px",fontSize:"13px"}}>Carregando...</p>:
        groups.length===0?<p style={{color:c.textMut,fontSize:"13px",textAlign:"center",padding:"30px 0"}}>Clique em Sync</p>:
        <div style={{maxHeight:"500px",overflowY:"auto"}}>{groups.map(g=>(
          <div key={g.id} onClick={()=>selectGroup(g)} style={{padding:"10px 12px",borderRadius:"10px",marginBottom:"3px",cursor:"pointer",background:selected?.id===g.id?c.accentSoft:"transparent",border:`1px solid ${selected?.id===g.id?c.accent+"33":"transparent"}`,transition:"all 0.15s"}}
            onMouseEnter={e=>{if(selected?.id!==g.id)e.currentTarget.style.background=c.bgCardHover;}} onMouseLeave={e=>{if(selected?.id!==g.id)e.currentTarget.style.background="transparent";}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <div style={{width:"36px",height:"36px",borderRadius:"10px",background:c.violetGlow,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Hash size={15} color={c.violet}/></div>
              <div style={{minWidth:0}}><div style={{fontSize:"13px",fontWeight:"600",color:c.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.name||g.group_jid}</div><div style={{fontSize:"11px",color:c.textMut}}>{g.member_count||0} membros</div></div>
            </div>
          </div>
        ))}</div>}
      </div>

      {/* RIGHT: Actions Panel */}
      <div style={card(c)}>
        {/* Create Group Tab */}
        {tab==="create"&&!selected&&<>
          <h3 style={{margin:"0 0 16px",fontSize:"16px",fontWeight:"700",color:c.text,display:"flex",alignItems:"center",gap:"8px"}}><Plus size={18} color={c.accent}/>Criar Grupo</h3>
          <div style={{marginBottom:"14px"}}><label style={lbl(c)}>Nome do Grupo</label><input value={newGroupName} onChange={e=>setNewGroupName(e.target.value)} placeholder="Ex: Equipe de Vendas" style={inp(c)}/></div>
          <div style={{marginBottom:"14px"}}><label style={lbl(c)}>Descrição (opcional)</label><textarea value={newGroupDesc} onChange={e=>setNewGroupDesc(e.target.value)} placeholder="Descrição do grupo..." rows={3} style={{...inp(c),resize:"vertical"}}/></div>
          <div style={{marginBottom:"18px"}}><label style={lbl(c)}>Participantes (um número por linha)</label><textarea value={newGroupParticipants} onChange={e=>setNewGroupParticipants(e.target.value)} placeholder={"5511999887766\n5511988776655"} rows={5} style={{...inp(c),fontFamily:"monospace",fontSize:"13px",resize:"vertical"}}/><span style={{fontSize:"11px",color:c.textMut}}>{newGroupParticipants.split("\n").filter(n=>n.trim()).length} participantes</span></div>
          <button onClick={createGroup} disabled={creating||!newGroupName||!newGroupParticipants.trim()} style={btnP(c,creating||!newGroupName||!newGroupParticipants.trim())}>{creating?<RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/>:<Plus size={14}/>}{creating?"Criando...":"Criar Grupo"}</button>
        </>}

        {/* No group selected */}
        {!selected&&tab!=="create"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px",color:c.textMut,textAlign:"center"}}><Users size={40} style={{marginBottom:"14px",opacity:0.3}}/><p style={{fontSize:"14px",margin:0}}>Selecione um grupo ou crie um novo</p></div>}

        {/* Group selected */}
        {selected&&<>
          {/* Group header */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <div style={{width:"42px",height:"42px",borderRadius:"12px",background:c.violetGlow,display:"flex",alignItems:"center",justifyContent:"center"}}><Hash size={18} color={c.violet}/></div>
              <div><div style={{fontSize:"15px",fontWeight:"700",color:c.text}}>{selected.name||selected.group_jid}</div><div style={{fontSize:"12px",color:c.textMut}}>{selected.member_count||0} membros</div></div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:"6px",marginBottom:"18px",flexWrap:"wrap"}}>
            {tabBtn("send",Send,"Mensagem")}
            {tabBtn("poll",BarChart3,"Enquete")}
            {tabBtn("contact",Phone,"Contato")}
            {tabBtn("manage",Settings,"Gerenciar")}
          </div>

          {/* TAB: Send Message */}
          {tab==="send"&&<>
            <div style={{marginBottom:"14px"}}><label style={lbl(c)}>Mensagem</label><textarea value={msgText} onChange={e=>setMsgText(e.target.value)} placeholder="Mensagem para o grupo..." rows={4} style={{...inp(c),resize:"vertical"}}/></div>
            <div style={{marginBottom:"14px",display:"flex",gap:"16px",flexWrap:"wrap"}}>
              <label style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",color:c.textSec,cursor:"pointer"}}><input type="checkbox" checked={mentionAll} onChange={e=>setMentionAll(e.target.checked)} style={{accentColor:c.accent}}/>Mencionar todos</label>
            </div>
            {!mentionAll&&<div style={{marginBottom:"14px"}}><label style={lbl(c)}>Menções ocultas (números, um por linha - opcional)</label><textarea value={mentionNumbers} onChange={e=>setMentionNumbers(e.target.value)} placeholder={"5511999887766\n5511988776655"} rows={3} style={{...inp(c),fontFamily:"monospace",fontSize:"12px",resize:"vertical"}}/><span style={{fontSize:"11px",color:c.textMut}}>Os mencionados recebem notificação sem aparecer na mensagem</span></div>}
            <button onClick={sendText} disabled={sending||!msgText} style={btnP(c,sending||!msgText)}>{sending?<RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/>:<Send size={14}/>}{sending?"Enviando...":"Enviar"}</button>
          </>}

          {/* TAB: Poll */}
          {tab==="poll"&&<>
            <div style={{marginBottom:"14px"}}><label style={lbl(c)}>Pergunta da Enquete</label><input value={pollQuestion} onChange={e=>setPollQuestion(e.target.value)} placeholder="Ex: Qual o melhor dia para reunião?" style={inp(c)}/></div>
            <label style={lbl(c)}>Opções</label>
            {pollOptions.map((opt,i)=>(
              <div key={i} style={{display:"flex",gap:"8px",marginBottom:"8px"}}>
                <input value={opt} onChange={e=>updatePollOption(i,e.target.value)} placeholder={`Opção ${i+1}`} style={{...inp(c),flex:1}}/>
                {pollOptions.length>2&&<button onClick={()=>removePollOption(i)} style={{background:"none",border:"none",cursor:"pointer",color:c.danger,padding:"4px"}}><X size={16}/></button>}
              </div>
            ))}
            <button onClick={addPollOption} style={{background:"none",border:"none",color:c.accent,fontSize:"13px",fontWeight:"600",cursor:"pointer",padding:"4px 0",marginBottom:"14px",display:"flex",alignItems:"center",gap:"4px"}}><Plus size={14}/>Adicionar opção</button>
            <label style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",color:c.textSec,cursor:"pointer",marginBottom:"18px"}}><input type="checkbox" checked={pollMulti} onChange={e=>setPollMulti(e.target.checked)} style={{accentColor:c.accent}}/>Permitir múltiplas respostas</label>
            <button onClick={sendPoll} disabled={sendingPoll||!pollQuestion||pollOptions.filter(o=>o.trim()).length<2} style={btnP(c,sendingPoll||!pollQuestion||pollOptions.filter(o=>o.trim()).length<2)}>{sendingPoll?<RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/>:<BarChart3 size={14}/>}{sendingPoll?"Enviando...":"Enviar Enquete"}</button>
          </>}

          {/* TAB: Contact */}
          {tab==="contact"&&<>
            <div style={{marginBottom:"14px"}}><label style={lbl(c)}>Nome do Contato</label><input value={contactName} onChange={e=>setContactName(e.target.value)} placeholder="João Silva" style={inp(c)}/></div>
            <div style={{marginBottom:"14px"}}><label style={lbl(c)}>Número do Contato</label><input value={contactPhone} onChange={e=>setContactPhone(e.target.value)} placeholder="5511999887766" style={inp(c)}/></div>
            <div style={{marginBottom:"18px"}}><label style={lbl(c)}>Empresa (opcional)</label><input value={contactOrg} onChange={e=>setContactOrg(e.target.value)} placeholder="Empresa XPTO" style={inp(c)}/></div>
            <button onClick={sendContact} disabled={sendingContact||!contactName||!contactPhone} style={btnP(c,sendingContact||!contactName||!contactPhone)}>{sendingContact?<RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/>:<Phone size={14}/>}{sendingContact?"Enviando...":"Enviar Contato"}</button>
          </>}

          {/* TAB: Manage */}
          {tab==="manage"&&<>
            {/* Edit Name */}
            <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Nome do Grupo</label><div style={{display:"flex",gap:"8px"}}><input value={editName} onChange={e=>setEditName(e.target.value)} style={{...inp(c),flex:1}}/><button onClick={updateSubject} style={{...btnP(c,false),padding:"10px 16px",fontSize:"12px"}}>Salvar</button></div></div>

            {/* Edit Description */}
            <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Descrição</label><div style={{display:"flex",gap:"8px"}}><textarea value={editDesc} onChange={e=>setEditDesc(e.target.value)} rows={2} style={{...inp(c),flex:1,resize:"vertical"}}/><button onClick={updateDesc} style={{...btnP(c,false),padding:"10px 16px",fontSize:"12px",alignSelf:"flex-start"}}>Salvar</button></div></div>

            {/* Settings */}
            <div style={{marginBottom:"16px"}}>
              <label style={lbl(c)}>Configurações do Grupo</label>
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                <button onClick={()=>changeSetting("announcement")} style={{...btnS(c),padding:"7px 12px",fontSize:"11px"}}>Só admins enviam</button>
                <button onClick={()=>changeSetting("not_announcement")} style={{...btnS(c),padding:"7px 12px",fontSize:"11px"}}>Todos enviam</button>
                <button onClick={()=>changeSetting("locked")} style={{...btnS(c),padding:"7px 12px",fontSize:"11px"}}>Só admins editam</button>
                <button onClick={()=>changeSetting("unlocked")} style={{...btnS(c),padding:"7px 12px",fontSize:"11px"}}>Todos editam</button>
              </div>
            </div>

            {/* Add Participant */}
            <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Adicionar Participante</label><div style={{display:"flex",gap:"8px"}}><input value={addNumber} onChange={e=>setAddNumber(e.target.value)} placeholder="5511999887766" style={{...inp(c),flex:1}} onKeyDown={e=>e.key==='Enter'&&addParticipant()}/><button onClick={addParticipant} style={{...btnP(c,false),padding:"10px 16px",fontSize:"12px"}}><Plus size={14}/></button></div></div>

            {/* Invite Link */}
            <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Link de Convite</label><div style={{display:"flex",gap:"8px"}}><button onClick={getInviteLink} style={{...btnS(c),padding:"7px 12px",fontSize:"11px"}}>Gerar Link</button>{inviteLink&&<input value={inviteLink} readOnly style={{...inp(c),flex:1,fontSize:"12px"}} onClick={e=>{e.target.select();navigator.clipboard?.writeText(inviteLink);setToast({msg:"Link copiado!",type:"success"});}}/>}</div></div>

            {/* Members List */}
            <div style={{marginBottom:"16px"}}>
              <label style={lbl(c)}>Membros ({members.length})</label>
              {loadingMembers?<p style={{color:c.textMut,fontSize:"13px"}}>Carregando...</p>:
              <div style={{maxHeight:"250px",overflowY:"auto",border:`1px solid ${c.border}`,borderRadius:"10px"}}>
                {members.map((m,i)=>{
                  const jid=m.id||m;const isAdmin=m.admin==="admin"||m.admin==="superadmin";const num=typeof jid==="string"?jid.replace("@s.whatsapp.net",""):jid;
                  return<div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderBottom:i<members.length-1?`1px solid ${c.border}`:"none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                      <div style={{width:"30px",height:"30px",borderRadius:"50%",background:isAdmin?c.warnSoft:c.bgInput,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"700",color:isAdmin?c.warn:c.textMut}}>{isAdmin?"A":"M"}</div>
                      <div><div style={{fontSize:"12px",fontWeight:"600",color:c.text,fontFamily:"monospace"}}>{num}</div>{isAdmin&&<div style={{fontSize:"10px",color:c.warn,fontWeight:"600"}}>Admin</div>}</div>
                    </div>
                    <div style={{display:"flex",gap:"4px"}}>
                      {!isAdmin&&<button onClick={()=>manageParticipant("promote",num)} title="Promover a admin" style={{background:"none",border:"none",cursor:"pointer",color:c.warn,padding:"3px",fontSize:"10px",fontWeight:"600"}}>Admin</button>}
                      {isAdmin&&m.admin!=="superadmin"&&<button onClick={()=>manageParticipant("demote",num)} title="Rebaixar" style={{background:"none",border:"none",cursor:"pointer",color:c.textMut,padding:"3px",fontSize:"10px",fontWeight:"600"}}>Rebaixar</button>}
                      <button onClick={()=>manageParticipant("remove",num)} title="Remover" style={{background:"none",border:"none",cursor:"pointer",color:c.danger,padding:"3px"}}><Trash2 size={13}/></button>
                    </div>
                  </div>;
                })}
              </div>}
            </div>

            {/* Leave Group */}
            <button onClick={leaveGroup} style={{...btnS(c),color:c.danger,borderColor:c.danger+"44",fontSize:"12px",padding:"8px 16px"}}><LogOut size={14}/>Sair do Grupo</button>
          </>}
        </>}
      </div>
    </div>
  </div>);
}

function ReportsPage(){const{dark}=useTheme();const c=C(dark);const[campaigns,setCampaigns]=useState([]);const[topGroups,setTopGroups]=useState([]);const[loading,setLoading]=useState(true);const[toast,setToast]=useState(null);useEffect(()=>{(async()=>{try{const[cp,gr]=await Promise.all([reportsApi.campaignStats(),reportsApi.topGroups()]);setCampaigns(cp.data.campaigns||[]);setTopGroups(gr.data.groups||[]);}catch(e){}finally{setLoading(false);}})();},[]);const exp=async(t)=>{try{const r=t==="excel"?await reportsApi.exportExcel():await reportsApi.exportPdf();const u=window.URL.createObjectURL(new Blob([r.data]));const a=document.createElement('a');a.href=u;a.download=`relatorio.${t==="excel"?"xlsx":"pdf"}`;a.click();setToast({msg:"Exportado!",type:"success"});}catch(e){setToast({msg:"Erro",type:"error"});}};const stS=s=>({completed:{bg:c.okSoft,col:c.ok,l:"Concluída"},running:{bg:c.warnSoft,col:c.warn,l:"Enviando"},scheduled:{bg:c.infoSoft,col:c.info,l:"Agendada"},draft:{bg:c.bgInput,col:c.textMut,l:"Rascunho"}}[s]||{bg:c.bgInput,col:c.textMut,l:s});if(loading)return<div style={{padding:"40px",textAlign:"center",color:c.textMut}}>Carregando...</div>;return(<div style={{padding:"24px"}}>{toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}<div style={{display:"flex",gap:"8px",marginBottom:"20px"}}><div style={{flex:1}}/><button onClick={()=>exp("excel")} style={{...btnS(c),padding:"7px 14px",fontSize:"12px"}}><Download size={13}/>Excel</button><button onClick={()=>exp("pdf")} style={{...btnS(c),padding:"7px 14px",fontSize:"12px",color:c.danger}}><Download size={13}/>PDF</button></div>{campaigns.length>0&&<div style={{...card(c),marginBottom:"20px"}}><h3 style={{margin:"0 0 14px",fontSize:"15px",fontWeight:"700",color:c.text}}>Campanhas</h3><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Campanha","Enviadas","Entregues","Lidas","Falhas","Status"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:"11px",fontWeight:"600",color:c.textMut,textTransform:"uppercase",borderBottom:`1px solid ${c.border}`}}>{h}</th>)}</tr></thead><tbody>{campaigns.map(cp=>{const st=stS(cp.status);return<tr key={cp.id}><td style={{padding:"10px 12px",fontSize:"13px",fontWeight:"600",color:c.text}}>{cp.name}</td><td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec}}>{cp.sent_count}</td><td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec}}>{cp.delivered_count}</td><td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec}}>{cp.read_count}</td><td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec}}>{cp.failed_count}</td><td style={{padding:"10px 12px"}}><span style={{fontSize:"11px",fontWeight:"600",padding:"3px 8px",borderRadius:"6px",background:st.bg,color:st.col}}>{st.l}</span></td></tr>;})}</tbody></table></div></div>}{topGroups.length>0&&<div style={card(c)}><h3 style={{margin:"0 0 14px",fontSize:"15px",fontWeight:"700",color:c.text}}>Ranking de Grupos</h3>{topGroups.map((g,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<topGroups.length-1?`1px solid ${c.border}`:"none"}}><div style={{display:"flex",alignItems:"center",gap:"10px"}}><span style={{width:"26px",height:"26px",borderRadius:"8px",background:i===0?c.warnSoft:c.bgInput,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:"700",color:i===0?c.warn:c.textMut}}>{i+1}</span><span style={{fontSize:"13px",fontWeight:"600",color:c.text}}>{g.name||g.group_jid}</span></div><span style={{fontSize:"13px",color:c.textMut}}>{g.message_count||0} msgs</span></div>)}</div>}</div>);}

function ContactsPage(){const{dark}=useTheme();const c=C(dark);const[contacts,setContacts]=useState([]);const[search,setSearch]=useState("");const[loading,setLoading]=useState(true);const[toast,setToast]=useState(null);const load=async(s)=>{try{const{data}=await contactsApi.list({search:s,limit:50});setContacts(data.contacts||[]);}catch(e){}finally{setLoading(false);}};useEffect(()=>{load(search);},[search]);const importCsv=async(e)=>{const f=e.target.files[0];if(!f)return;try{const{data}=await contactsApi.importCsv(f);setToast({msg:`Importados: ${data.imported}`,type:"success"});load(search);}catch(e){setToast({msg:"Erro",type:"error"});}};return(<div style={{padding:"24px",maxWidth:"700px"}}>{toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}<div style={card(c)}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}><h3 style={{margin:0,fontSize:"15px",fontWeight:"700",color:c.text}}>Contatos</h3><label style={{...btnS(c),padding:"7px 14px",fontSize:"12px",cursor:"pointer"}}><Upload size={13}/>Importar CSV<input type="file" accept=".csv" onChange={importCsv} style={{display:"none"}}/></label></div><div style={{position:"relative",marginBottom:"16px"}}><Search size={15} color={c.textMut} style={{position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)"}}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." style={{...inp(c),paddingLeft:"38px"}}/></div>{loading?<p style={{color:c.textMut,textAlign:"center"}}>Carregando...</p>:contacts.length===0?<p style={{color:c.textMut,fontSize:"13px",textAlign:"center",padding:"30px 0"}}>Nenhum contato</p>:contacts.map(ct=><div key={ct.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderRadius:"10px",marginBottom:"2px"}} onMouseEnter={e=>e.currentTarget.style.background=c.bgCardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><div style={{display:"flex",alignItems:"center",gap:"10px"}}><div style={{width:"36px",height:"36px",borderRadius:"50%",background:`linear-gradient(135deg,${c.accent}44,${c.violet}44)`,display:"flex",alignItems:"center",justifyContent:"center",color:c.accent,fontSize:"14px",fontWeight:"700"}}>{(ct.name||ct.phone).charAt(0).toUpperCase()}</div><div><div style={{fontSize:"13px",fontWeight:"600",color:c.text}}>{ct.name||"Sem nome"}</div><div style={{fontSize:"11px",color:c.textMut,fontFamily:"monospace"}}>{ct.phone}</div></div></div></div>)}</div></div>);}

function SettingsPage({user,onProfileUpdate}){const{dark}=useTheme();const c=C(dark);const[name,setName]=useState(user?.name||"");const[company,setCompany]=useState(user?.company||"");const[phone,setPhone]=useState(user?.phone||"");const[saving,setSaving]=useState(false);const[toast,setToast]=useState(null);const save=async()=>{setSaving(true);try{const{data}=await authApi.updateProfile({name,company,phone});setToast({msg:"Perfil atualizado!",type:"success"});if(onProfileUpdate)onProfileUpdate(data.user);}catch(e){setToast({msg:"Erro",type:"error"});}finally{setSaving(false);}};return(<div style={{padding:"24px",maxWidth:"700px"}}>{toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}<div style={card(c)}><div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px"}}><Settings size={20} color={c.accent}/><h3 style={{margin:0,fontSize:"18px",fontWeight:"700",color:c.text}}>Meu Perfil</h3></div><p style={{margin:"0 0 22px",fontSize:"13px",color:c.textMut}}>Edite suas informações</p><div style={{marginBottom:"16px"}}><label style={lbl(c)}>Nome</label><input value={name} onChange={e=>setName(e.target.value)} style={inp(c)}/></div><div style={{marginBottom:"16px"}}><label style={lbl(c)}>Empresa</label><input value={company} onChange={e=>setCompany(e.target.value)} style={inp(c)}/></div><div style={{marginBottom:"16px"}}><label style={lbl(c)}>Telefone</label><input value={phone} onChange={e=>setPhone(e.target.value)} style={inp(c)}/></div><div style={{marginBottom:"16px"}}><label style={lbl(c)}>Instância WhatsApp</label><div style={{padding:"12px 16px",background:c.bgInput,borderRadius:"12px",color:c.textSec,fontSize:"14px",border:`1px solid ${c.border}`}}>{user?.evolution_instance||"Não configurada"}</div></div><button onClick={save} disabled={saving} style={btnP(c,saving)}>{saving?"Salvando...":"Salvar"}</button></div></div>);}

// ==================== MAIN ====================
function MainContent({page,user,onToggleSidebar,onProfileUpdate}){
  const{dark}=useTheme();const c=C(dark);
  const titles={dashboard:["Dashboard","Visão geral"],qrcode:["WhatsApp","Conecte seu WhatsApp"],send:["Enviar Mensagem","Texto e mídia"],mass:["Disparo em Massa","Campanhas"],groups:["Grupos","Gerencie grupos"],reports:["Relatórios","Análises"],contacts:["Contatos","Sua lista"],admin:["Admin","Gerenciar clientes"],settings:["Configurações","Seu perfil"]};
  return(<div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}><div style={{flex:1,background:c.bg,minHeight:"100vh"}}>
    <Header title={titles[page]?.[0]||""} subtitle={titles[page]?.[1]||""} user={user} onToggleSidebar={onToggleSidebar}/>
    {page==="dashboard"&&<DashboardPage/>}{page==="qrcode"&&<QrCodePage/>}{page==="send"&&<SendMessagePage/>}{page==="mass"&&<MassSendPage/>}{page==="groups"&&<GroupsPage/>}{page==="reports"&&<ReportsPage/>}{page==="contacts"&&<ContactsPage/>}{page==="admin"&&<AdminPage/>}{page==="settings"&&<SettingsPage user={user} onProfileUpdate={onProfileUpdate}/>}
  </div></div>);
}

function App(){
  const[user,setUser]=useState(()=>{try{const u=localStorage.getItem('zapechat_user');return u?JSON.parse(u):null;}catch{return null;}});
  const[page,setPage]=useState("dashboard");const[collapsed,setCollapsed]=useState(false);

  useEffect(()=>{const token=localStorage.getItem('zapechat_token');if(token&&user){authApi.me().then(({data})=>{setUser(data.user);localStorage.setItem('zapechat_user',JSON.stringify(data.user));}).catch(()=>{setUser(null);localStorage.removeItem('zapechat_token');localStorage.removeItem('zapechat_user');});}},[]);

  const nav=(id)=>{if(id==="logout"){setUser(null);localStorage.removeItem('zapechat_token');localStorage.removeItem('zapechat_user');return;}if(id==="theme")return;setPage(id);};
  const updateProfile=(u)=>{setUser(prev=>({...prev,...u}));localStorage.setItem('zapechat_user',JSON.stringify({...user,...u}));};

  if(!user)return<ThemeProvider><AuthPage onLogin={setUser}/></ThemeProvider>;
  return(<ThemeProvider>
    <div style={{display:"flex",minHeight:"100vh",fontFamily:"'Segoe UI',-apple-system,sans-serif"}}>
      <Sidebar active={page} onNavigate={nav} collapsed={collapsed} user={user}/>
      <MainContent page={page} user={user} onToggleSidebar={()=>setCollapsed(s=>!s)} onProfileUpdate={updateProfile}/>
    </div>
    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes slideIn{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}} *{box-sizing:border-box;margin:0;padding:0} body{margin:0} ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}`}</style>
  </ThemeProvider>);
}

export default App;
