import { useState, useEffect, useRef, createContext, useContext } from "react";
import {
  Send, Users, BarChart3, LogOut, Moon, Sun, Menu, ChevronRight, Zap, Search, Upload,
  CheckCircle, AlertCircle, Eye, Download, TrendingUp, Mail, Settings, PieChart, Plus,
  RefreshCw, Play, Pause, Hash, Globe, Phone, Image, FileText, Video, Mic, Calendar,
  Clock, X, Paperclip, UserPlus, Shield, QrCode, Wifi, WifiOff, Trash2, Edit, ToggleLeft, ToggleRight, Camera, Brain
} from "lucide-react";
import { authApi, messagesApi, campaignsApi, groupsApi, contactsApi, reportsApi, instancesApi, automationsApi, uploadApi, aiAssistantsApi, apiKeysApi, trainingSourcesApi, groupEventsApi, profileApi } from "./api";

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
  const[activeType,setActiveType]=useState(null);const[videoUrl,setVideoUrl]=useState("");const[showVideoInput,setShowVideoInput]=useState(false);const[uploading,setUploading]=useState(false);

  const handleFile=async(e)=>{const file=e.target.files[0];if(!file)return;
    const sizeMB=file.size/(1024*1024);
    // Arquivos grandes (>5MB) ou vídeos/áudios vão pro MinIO
    if(sizeMB>5||activeType==="video"||activeType==="audio"){
      setUploading(true);
      try{
        const reader=new FileReader();
        reader.onload=async()=>{
          const base64=reader.result.includes('base64,')?reader.result.split('base64,')[1]:reader.result;
          const{data}=await uploadApi.upload({file:base64,mimetype:file.type,fileName:file.name});
          onSelect({file:null,type:activeType,name:file.name,size:file.size,preview:activeType==="image"?reader.result:null,url:data.url,isUrl:true,minioObject:data.objectName});
          setActiveType(null);setUploading(false);
        };
        reader.readAsDataURL(file);
      }catch(err){console.error("Upload falhou:",err);setUploading(false);
        // Fallback: usar base64 direto
        const reader2=new FileReader();
        reader2.onload=()=>{onSelect({file,type:activeType,name:file.name,size:file.size,preview:activeType==="image"?reader2.result:null,url:reader2.result});setActiveType(null);};
        reader2.readAsDataURL(file);
      }
    }else{
      const reader=new FileReader();
      reader.onload=()=>{onSelect({file,type:activeType,name:file.name,size:file.size,preview:activeType==="image"?reader.result:null,url:reader.result});setActiveType(null);};
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUrl=()=>{if(!videoUrl.trim())return;onSelect({file:null,type:"video",name:videoUrl.split('/').pop()||"video.mp4",size:0,preview:null,url:videoUrl.trim(),isUrl:true});setShowVideoInput(false);setVideoUrl("");};

  if(uploading)return(<div style={{background:c.bgInput,borderRadius:"12px",padding:"18px",marginBottom:"16px",border:`1px solid ${c.border}`,textAlign:"center"}}><RefreshCw size={20} color={c.accent} style={{animation:"spin 1s linear infinite",marginBottom:"8px"}}/><div style={{fontSize:"13px",color:c.textSec,fontWeight:"600"}}>Enviando arquivo...</div><div style={{fontSize:"11px",color:c.textMut,marginTop:"4px"}}>Upload para o servidor</div></div>);

  if(selected)return(<div style={{background:c.bgInput,borderRadius:"12px",padding:"14px",display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px",border:`1px solid ${c.border}`}}>
    {selected.preview?<img src={selected.preview} alt="" style={{width:"60px",height:"60px",borderRadius:"8px",objectFit:"cover"}}/>:<div style={{width:"48px",height:"48px",borderRadius:"8px",background:c.accentSoft,display:"flex",alignItems:"center",justifyContent:"center"}}>{selected.type==="video"?<Video size={20} color={c.accent}/>:selected.type==="audio"?<Mic size={20} color={c.accent}/>:<FileText size={20} color={c.accent}/>}</div>}
    <div style={{flex:1,minWidth:0}}><div style={{fontSize:"13px",fontWeight:"600",color:c.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selected.name}</div><div style={{fontSize:"12px",color:c.textMut}}>{selected.size?(selected.size/1024).toFixed(0)+" KB • ":""}{selected.type}{selected.isUrl?" (URL)":""}</div></div>
    <button onClick={onRemove} style={{background:"none",border:"none",cursor:"pointer",color:c.danger,padding:"4px"}}><X size={18}/></button>
  </div>);

  return(<div style={{marginBottom:"16px"}}>
    <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>{types.map(t=><button key={t.id} onClick={()=>{if(t.id==="video"){setShowVideoInput(true);return;}setActiveType(t.id);setTimeout(()=>ref.current?.click(),50);}} style={{padding:"8px 14px",borderRadius:"10px",border:`1px solid ${c.border}`,background:c.bgInput,color:c.textSec,fontSize:"12px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",transition:"all 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=c.accent;e.currentTarget.style.color=c.accent;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=c.border;e.currentTarget.style.color=c.textSec;}}><t.icon size={14}/>{t.label}</button>)}</div>
    {showVideoInput&&<div style={{marginTop:"10px"}}><div style={{display:"flex",gap:"8px",marginBottom:"8px"}}><input value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} placeholder="Cole a URL do vídeo (https://...mp4)" style={{...inp(c),flex:1}} onKeyDown={e=>e.key==='Enter'&&handleVideoUrl()}/><button onClick={handleVideoUrl} disabled={!videoUrl.trim()} style={{...btnP(c,!videoUrl.trim()),padding:"10px 16px",fontSize:"12px"}}>OK</button><button onClick={()=>{setShowVideoInput(false);setVideoUrl("");}} style={{background:"none",border:"none",cursor:"pointer",color:c.textMut}}><X size={18}/></button></div><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><div style={{flex:1,height:"1px",background:c.border}}/><span style={{fontSize:"11px",color:c.textMut}}>ou</span><div style={{flex:1,height:"1px",background:c.border}}/></div><button onClick={()=>{setActiveType("video");setShowVideoInput(false);setTimeout(()=>ref.current?.click(),50);}} style={{...btnS(c),width:"100%",justifyContent:"center",fontSize:"12px",marginTop:"4px"}}><Upload size={14}/>Upload de vídeo (via MinIO)</button></div>}
    <input ref={ref} type="file" accept={activeType==="video"?"video/mp4,video/webm,video/avi":types.find(t=>t.id===activeType)?.accept||"*"} onChange={handleFile} style={{display:"none"}}/>
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

// ==========================================
// NOVA AutomationsPage - Adicionar no App.jsx
// Não esqueça de importar automationsApi no topo do App.jsx:
// import { authApi, messagesApi, ..., automationsApi } from "./api";
// ==========================================
 
function AutomationsPage(){
  const{dark}=useTheme();const c=C(dark);
  const[automations,setAutomations]=useState([]);const[logs,setLogs]=useState([]);const[loading,setLoading]=useState(true);
  const[toast,setToast]=useState(null);const[webhookUrl,setWebhookUrl]=useState("");
  const[showCreate,setShowCreate]=useState(false);const[creating,setCreating]=useState(false);
  const[tab,setTab]=useState("list"); // list, logs
  const[editId,setEditId]=useState(null);
 
  // Form state
  const[form,setForm]=useState({name:"",platform:"hotmart",event_type:"purchase_approved",message_template:"",support_phone:"",support_email:""});
 
  const platforms=[{id:"hotmart",label:"Hotmart"},{id:"eduzz",label:"Eduzz"},{id:"kiwify",label:"Kiwify"},{id:"voomp",label:"Voomp"}];
  const events=[
    {id:"purchase_approved",label:"Compra Aprovada",emoji:"✅"},
    {id:"boleto_generated",label:"Boleto Gerado",emoji:"📄"},
    {id:"pix_generated",label:"PIX Gerado",emoji:"💰"},
    {id:"cart_abandoned",label:"Carrinho Abandonado",emoji:"🛒"},
  ];
 
  const templates={
    purchase_approved:"Olá {nome}! 🎉\n\nSua compra do *{produto}* foi aprovada com sucesso!\n\nEm caso de dúvidas, entre em contato:\n📱 {telefone_suporte}\n📧 {email_suporte}\n\nObrigado pela confiança!",
    boleto_generated:"Olá {nome}! 📄\n\nSeu boleto para o *{produto}* foi gerado!\n\nNão esqueça de efetuar o pagamento até o vencimento.\n\nDúvidas? {telefone_suporte}",
    pix_generated:"Olá {nome}! 💰\n\nSeu PIX para o *{produto}* foi gerado!\n\nEfetue o pagamento para liberar seu acesso.\n\nDúvidas? {telefone_suporte}",
    cart_abandoned:"Olá {nome}! 👋\n\nNotamos que você demonstrou interesse no *{produto}* mas não finalizou a compra.\n\nPosso te ajudar com alguma dúvida?\n\n📱 {telefone_suporte}",
  };
 
  const load=async()=>{
    try{
      const[autoRes,logRes]=await Promise.all([automationsApi.list(),automationsApi.logs({limit:20})]);
      setAutomations(autoRes.data.automations||[]);setLogs(logRes.data.logs||[]);
    }catch(e){console.error(e);}finally{setLoading(false);}
  };
  useEffect(()=>{load();},[]);
 
  const save=async()=>{
    if(!form.name||!form.message_template){setToast({msg:"Preencha nome e mensagem",type:"error"});return;}
    setCreating(true);
    try{
      if(editId){
        await automationsApi.update(editId,form);setToast({msg:"Automação atualizada!",type:"success"});
      }else{
        await automationsApi.create(form);setToast({msg:"Automação criada!",type:"success"});
      }
      setShowCreate(false);setEditId(null);setForm({name:"",platform:"hotmart",event_type:"purchase_approved",message_template:"",support_phone:"",support_email:""});load();
    }catch(e){setToast({msg:e.response?.data?.error||"Erro",type:"error"});}finally{setCreating(false);}
  };
 
  const toggleActive=async(auto)=>{
    try{await automationsApi.update(auto.id,{is_active:!auto.is_active});setToast({msg:`${auto.is_active?"Desativada":"Ativada"}!`,type:"success"});load();}
    catch(e){setToast({msg:"Erro",type:"error"});}
  };
 
  const deleteAuto=async(auto)=>{
    if(!confirm(`Remover automação "${auto.name}"?`))return;
    try{await automationsApi.delete(auto.id);setToast({msg:"Removida!",type:"success"});load();}catch(e){setToast({msg:"Erro",type:"error"});}
  };
 
  const startEdit=(auto)=>{
    setForm({name:auto.name,platform:auto.platform,event_type:auto.event_type,message_template:auto.message_template,support_phone:auto.support_phone||"",support_email:auto.support_email||""});
    setEditId(auto.id);setShowCreate(true);
  };
 
  const useTemplate=(eventType)=>{setForm({...form,event_type:eventType,message_template:templates[eventType]||""});};
 
  const copyUrl=()=>{navigator.clipboard?.writeText(webhookUrl);setToast({msg:"URL copiada!",type:"success"});};
 
  const statusColor=(s)=>s==="sent"?c.ok:s==="failed"?c.danger:c.warn;
  const statusLabel=(s)=>s==="sent"?"Enviada":s==="failed"?"Falhou":"Ignorada";
  const eventLabel=(e)=>events.find(ev=>ev.id===e)?.label||e;
  const eventEmoji=(e)=>events.find(ev=>ev.id===e)?.emoji||"📌";
 
  if(loading)return<div style={{padding:"40px",textAlign:"center",color:c.textMut}}><RefreshCw size={24} style={{animation:"spin 1s linear infinite"}}/></div>;
 
  return(<div style={{padding:"24px"}}>
    {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
 
    {/* Tabs */}
    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
      <button onClick={()=>setTab("list")} style={{padding:"8px 18px",borderRadius:"8px",border:"none",background:tab==="list"?c.accent:c.bgInput,color:tab==="list"?"white":c.textSec,fontSize:"13px",fontWeight:"600",cursor:"pointer"}}>Automações</button>
      <button onClick={()=>setTab("logs")} style={{padding:"8px 18px",borderRadius:"8px",border:"none",background:tab==="logs"?c.accent:c.bgInput,color:tab==="logs"?"white":c.textSec,fontSize:"13px",fontWeight:"600",cursor:"pointer"}}>Histórico</button>
      <div style={{flex:1}}/>
      <button onClick={()=>{setShowCreate(true);setEditId(null);setForm({name:"",platform:"hotmart",event_type:"purchase_approved",message_template:"",support_phone:"",support_email:""});}} style={btnP(c,false)}><Plus size={14}/>Nova Automação</button>
    </div>
 
    {/* Create/Edit Form */}
    {showCreate&&<div style={{...card(c),marginBottom:"16px"}}>
      <h3 style={{margin:"0 0 16px",fontSize:"16px",fontWeight:"700",color:c.text}}>{editId?"Editar":"Nova"} Automação</h3>
      
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"14px"}}>
        <div><label style={lbl(c)}>Nome</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ex: Boas-vindas Compra" style={inp(c)}/></div>
        <div><label style={lbl(c)}>Plataforma</label><select value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})} style={inp(c)}>{platforms.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></div>
      </div>
 
      <div style={{marginBottom:"14px"}}><label style={lbl(c)}>Evento</label>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>{events.map(e=>(
          <button key={e.id} onClick={()=>useTemplate(e.id)} style={{padding:"8px 14px",borderRadius:"10px",border:`1px solid ${form.event_type===e.id?c.accent:c.border}`,background:form.event_type===e.id?c.accentSoft:c.bgInput,color:form.event_type===e.id?c.accent:c.textSec,fontSize:"12px",fontWeight:"600",cursor:"pointer"}}>{e.emoji} {e.label}</button>
        ))}</div>
      </div>
 
      <div style={{marginBottom:"14px"}}><label style={lbl(c)}>Mensagem (use variáveis: {"{nome}"}, {"{produto}"}, {"{telefone_suporte}"}, {"{email_suporte}"}, {"{valor}"})</label>
        <textarea value={form.message_template} onChange={e=>setForm({...form,message_template:e.target.value})} rows={6} style={{...inp(c),resize:"vertical",fontSize:"13px"}} placeholder="Olá {nome}! Sua compra do {produto} foi aprovada..."/>
        <div style={{display:"flex",gap:"6px",marginTop:"6px",flexWrap:"wrap"}}>
          {["{nome}","{produto}","{valor}","{telefone_suporte}","{email_suporte}","{transacao}"].map(v=>(
            <button key={v} onClick={()=>setForm({...form,message_template:form.message_template+v})} style={{padding:"3px 8px",borderRadius:"6px",border:`1px solid ${c.border}`,background:c.bgInput,color:c.accent,fontSize:"11px",fontWeight:"600",cursor:"pointer"}}>{v}</button>
          ))}
        </div>
      </div>
 
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"18px"}}>
        <div><label style={lbl(c)}>Telefone de Suporte</label><input value={form.support_phone} onChange={e=>setForm({...form,support_phone:e.target.value})} placeholder="5511999887766" style={inp(c)}/></div>
        <div><label style={lbl(c)}>Email de Suporte</label><input value={form.support_email} onChange={e=>setForm({...form,support_email:e.target.value})} placeholder="suporte@empresa.com" style={inp(c)}/></div>
      </div>
 
      {/* Preview */}
      {form.message_template&&<div style={{marginBottom:"18px"}}>
        <label style={lbl(c)}>Pré-visualização</label>
        <div style={{background:dark?"#005c4b":"#dcf8c6",borderRadius:"12px 12px 12px 4px",padding:"12px 14px",maxWidth:"350px"}}>
          <p style={{margin:0,fontSize:"13px",color:dark?"#e9edef":"#111b21",whiteSpace:"pre-wrap"}}>{form.message_template.replace(/\{nome\}/gi,"João Silva").replace(/\{produto\}/gi,"Curso XYZ").replace(/\{valor\}/gi,"R$ 197,00").replace(/\{telefone_suporte\}/gi,form.support_phone||"(11) 99988-7766").replace(/\{email_suporte\}/gi,form.support_email||"suporte@empresa.com").replace(/\{transacao\}/gi,"TRX123456")}</p>
        </div>
      </div>}
 
      <div style={{display:"flex",gap:"10px"}}>
        <button onClick={save} disabled={creating} style={btnP(c,creating)}>{creating?<RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/>:<CheckCircle size={14}/>}{creating?"Salvando...":editId?"Salvar":"Criar Automação"}</button>
        <button onClick={()=>{setShowCreate(false);setEditId(null);}} style={btnS(c)}>Cancelar</button>
      </div>
    </div>}
 
    {/* List */}
    {tab==="list"&&<div style={card(c)}>
      <h3 style={{margin:"0 0 14px",fontSize:"15px",fontWeight:"700",color:c.text}}>Suas Automações</h3>
      {automations.length===0?<p style={{color:c.textMut,fontSize:"13px",textAlign:"center",padding:"30px 0"}}>Nenhuma automação criada. Clique em "Nova Automação".</p>:
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>
        {["Nome","Plataforma","Evento","Enviadas","Falhas","Status","Webhook","Ações"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:"11px",fontWeight:"600",color:c.textMut,textTransform:"uppercase",borderBottom:`1px solid ${c.border}`}}>{h}</th>)}
      </tr></thead><tbody>
        {automations.map(a=><tr key={a.id} onMouseEnter={e=>e.currentTarget.style.background=c.bgCardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <td style={{padding:"10px 12px",fontSize:"13px",fontWeight:"600",color:c.text}}>{a.name}</td>
          <td style={{padding:"10px 12px",fontSize:"12px",color:c.textSec,textTransform:"capitalize"}}>{a.platform}</td>
          <td style={{padding:"10px 12px",fontSize:"12px",color:c.textSec}}>{eventEmoji(a.event_type)} {eventLabel(a.event_type)}</td>
          <td style={{padding:"10px 12px",fontSize:"13px",color:c.ok,fontWeight:"600"}}>{a.total_sent}</td>
          <td style={{padding:"10px 12px",fontSize:"13px",color:a.total_failed>0?c.danger:c.textMut}}>{a.total_failed}</td>
          <td style={{padding:"10px 12px"}}>
            <button onClick={()=>toggleActive(a)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px",color:a.is_active?c.ok:c.danger,fontSize:"12px",fontWeight:"600"}}>
              {a.is_active?<ToggleRight size={18}/>:<ToggleLeft size={18}/>}{a.is_active?"Ativa":"Inativa"}
            </button>
          </td>
          <td style={{padding:"10px 12px"}}><button onClick={()=>{navigator.clipboard?.writeText(a.webhook_url);setToast({msg:"URL copiada!",type:"success"});}} style={{...btnS(c),padding:"5px 10px",fontSize:"11px"}}>Copiar URL</button></td>
          <td style={{padding:"10px 12px",display:"flex",gap:"6px"}}>
            <button onClick={()=>startEdit(a)} style={{background:"none",border:"none",cursor:"pointer",color:c.info,padding:"3px"}} title="Editar"><Edit size={15}/></button>
            <button onClick={()=>deleteAuto(a)} style={{background:"none",border:"none",cursor:"pointer",color:c.danger,padding:"3px"}} title="Remover"><Trash2 size={15}/></button>
          </td>
        </tr>)}
      </tbody></table></div>}
    </div>}
 
    {/* Logs */}
    {tab==="logs"&&<div style={card(c)}>
      <h3 style={{margin:"0 0 14px",fontSize:"15px",fontWeight:"700",color:c.text}}>Histórico de Envios Automáticos</h3>
      {logs.length===0?<p style={{color:c.textMut,fontSize:"13px",textAlign:"center",padding:"30px 0"}}>Nenhum envio automático registrado ainda.</p>:
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>
        {["Data","Plataforma","Evento","Comprador","Telefone","Produto","Status"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:"11px",fontWeight:"600",color:c.textMut,textTransform:"uppercase",borderBottom:`1px solid ${c.border}`}}>{h}</th>)}
      </tr></thead><tbody>
        {logs.map(l=><tr key={l.id}>
          <td style={{padding:"8px 12px",fontSize:"12px",color:c.textMut}}>{l.created_at?new Date(l.created_at).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):""}</td>
          <td style={{padding:"8px 12px",fontSize:"12px",color:c.textSec,textTransform:"capitalize"}}>{l.platform}</td>
          <td style={{padding:"8px 12px",fontSize:"12px",color:c.textSec}}>{eventEmoji(l.event_type)} {eventLabel(l.event_type)}</td>
          <td style={{padding:"8px 12px",fontSize:"12px",color:c.text}}>{l.buyer_name||"—"}</td>
          <td style={{padding:"8px 12px",fontSize:"12px",color:c.textMut,fontFamily:"monospace"}}>{l.buyer_phone||"—"}</td>
          <td style={{padding:"8px 12px",fontSize:"12px",color:c.textSec}}>{l.product_name||"—"}</td>
          <td style={{padding:"8px 12px"}}><span style={{fontSize:"11px",fontWeight:"600",padding:"3px 8px",borderRadius:"6px",background:l.status==="sent"?c.okSoft:l.status==="failed"?c.dangerSoft:c.warnSoft,color:statusColor(l.status)}}>{statusLabel(l.status)}</span></td>
        </tr>)}
      </tbody></table></div>}
    </div>}
  </div>);
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

  // Auto-refresh QR Code a cada 15 segundos enquanto não conectar
  useEffect(()=>{
    if(status==="connected"||status==="loading")return;
    if(!qrcode)return;
    const i=setInterval(()=>{getQr();},15000);
    return()=>clearInterval(i);
  },[status,qrcode]);

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
  const nav=[{id:"dashboard",icon:BarChart3,label:"Dashboard"},{id:"qrcode",icon:QrCode,label:"Contas"},{id:"send",icon:Send,label:"Enviar Mensagem"},{id:"mass",icon:Mail,label:"Disparo em Massa"},{id:"groups",icon:Users,label:"Grupos"},{id:"reports",icon:PieChart,label:"Relatórios"},{id:"contacts",icon:Phone,label:"Contatos"},...(isAdmin?[{id:"admin",icon:Shield,label:"Admin"}]:[]),{id:"ai",icon:Brain,label:"Assistente IA"},{id:"group-events",icon:Users,label:"Monitor Grupos"},{id:"automations",icon:Zap,label:"Automações"},{id:"settings",icon:Settings,label:"Configurações"}];
  const navBtn=(id,Icon,label,isActive,color)=>(<button key={id} onClick={()=>onNavigate(id)} style={{width:"100%",padding:collapsed?"12px 0":"11px 14px",display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:"12px",background:isActive?c.accentSoft:"transparent",border:"none",borderRadius:"10px",cursor:"pointer",color:color||(isActive?c.accent:c.textSec),fontSize:"13px",fontWeight:isActive?"600":"500",marginBottom:"2px",position:"relative",transition:"all 0.15s"}} onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background=c.bgCardHover;}} onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background="transparent";}}>
    {isActive&&!collapsed&&<div style={{position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",width:"3px",height:"20px",borderRadius:"4px",background:c.accent}}/>}<Icon size={19}/>{!collapsed&&label}</button>);
  return(<div style={{width:collapsed?"68px":"250px",minHeight:"100vh",background:c.bgSidebar,borderRight:`1px solid ${c.border}`,display:"flex",flexDirection:"column",transition:"width 0.3s",flexShrink:0}}>
    <div style={{padding:collapsed?"18px 0":"18px 20px",display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:"10px",borderBottom:`1px solid ${c.border}`,minHeight:"64px"}}><div style={{width:"34px",height:"34px",borderRadius:"10px",background:`linear-gradient(135deg,${c.accent},${c.violet})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Zap size={17} color="white" strokeWidth={2.5}/></div>{!collapsed&&<span style={{fontSize:"19px",fontWeight:"800",color:c.text}}>Zapê<span style={{color:c.accent}}>Chat</span></span>}</div>
    <nav style={{padding:"10px 8px",flex:1}}>{nav.map(i=>navBtn(i.id,i.icon,i.label,active===i.id))}</nav>
    <div style={{padding:"10px 8px",borderTop:`1px solid ${c.border}`}}><button onClick={toggle} style={{width:"100%",padding:collapsed?"12px 0":"11px 14px",display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:"12px",background:"transparent",border:"none",borderRadius:"10px",cursor:"pointer",color:c.textSec,fontSize:"13px",fontWeight:"500",marginBottom:"2px"}} onMouseEnter={e=>e.currentTarget.style.background=c.bgCardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{dark?<Sun size={19}/>:<Moon size={19}/>}{!collapsed&&(dark?"Modo Claro":"Modo Escuro")}</button>{navBtn("logout",LogOut,"Sair",false,c.danger)}</div>
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
function DashboardPage(){const{dark}=useTheme();const c=C(dark);const[stats,setStats]=useState(null);const[messages,setMessages]=useState([]);const[loading,setLoading]=useState(true);useEffect(()=>{(async()=>{try{const[d,m]=await Promise.all([reportsApi.dashboard(),messagesApi.history({limit:8})]);setStats(d.data);setMessages(m.data.messages||[]);}catch(e){}finally{setLoading(false);}})();},[]);if(loading)return<div style={{padding:"40px",textAlign:"center",color:c.textMut}}><RefreshCw size={24} style={{animation:"spin 1s linear infinite"}}/></div>;return(<div style={{padding:"24px"}}><div style={{...card(c),marginBottom:"24px"}}><h3 style={{margin:"0 0 16px",fontSize:"15px",fontWeight:"700",color:c.text,display:"flex",alignItems:"center",gap:"8px"}}><BarChart3 size={16} color={c.violet}/>Resumo</h3>{[{icon:QrCode,l:"Contas",v:1,col:c.ok},{icon:Phone,l:"Contatos",v:stats?.contacts||0,col:c.info},{icon:Users,l:"Grupos",v:stats?.groups||0,col:c.violet},{icon:Brain,l:"Assistentes IA",v:stats?.aiAssistants||0,col:c.accent},{icon:Zap,l:"Automações Ativas",v:stats?.activeCampaigns||0,col:c.warn}].map((i,idx)=><div key={idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:idx<4?`1px solid ${c.border}`:"none"}}><div style={{display:"flex",alignItems:"center",gap:"8px"}}><i.icon size={15} color={i.col}/><span style={{fontSize:"13px",color:c.textSec}}>{i.l}</span></div><span style={{fontSize:"15px",fontWeight:"700",color:c.text}}>{i.v}</span></div>)}</div><div style={card(c)}><h3 style={{margin:"0 0 14px",fontSize:"15px",fontWeight:"700",color:c.text}}>Mensagens Recentes</h3>{messages.length===0?<p style={{color:c.textMut,fontSize:"13px",textAlign:"center",padding:"20px"}}>Nenhuma mensagem</p>:<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Telefone","Mensagem","Status","Data"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:"11px",fontWeight:"600",color:c.textMut,textTransform:"uppercase",borderBottom:`1px solid ${c.border}`}}>{h}</th>)}</tr></thead><tbody>{messages.map(m=><tr key={m.id}><td style={{padding:"10px 12px",fontSize:"13px",fontWeight:"600",color:c.text,fontFamily:"monospace"}}>{m.phone}</td><td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec,maxWidth:"200px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.message_text||"[mídia]"}</td><td style={{padding:"10px 12px"}}><span style={badge(c,m.status)}>{statusMap[m.status]?.l||m.status}</span></td><td style={{padding:"10px 12px",fontSize:"12px",color:c.textMut}}>{m.created_at?new Date(m.created_at).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):""}</td></tr>)}</tbody></table></div>}</div></div>);}

function SendMessagePage(){const{dark}=useTheme();const c=C(dark);const[number,setNumber]=useState("");const[message,setMessage]=useState("");const[delay,setDelay]=useState("1000");const[media,setMedia]=useState(null);const[sending,setSending]=useState(false);const[toast,setToast]=useState(null);const[showPreview,setShowPreview]=useState(false);const[scheduled,setScheduled]=useState("");const variables=["{nome}","{primeiro_nome}","{email}","{telefone}"];const handleSend=async()=>{setShowPreview(false);setSending(true);try{if(scheduled){const recipients=[{phone:number.trim(),name:"",email:""}];const p={name:"Envio Individual - "+number,message:message||'',recipients,interval_ms:1000,scheduled_at:scheduled};if(media){p.media_url=media.url||media.preview||'';p.media_type=media.type;}const{data:camp}=await campaignsApi.create(p);setToast({msg:`Mensagem agendada para ${new Date(scheduled).toLocaleString("pt-BR")}!`,type:"success"});}else{if(media){if(media.type==='audio'){const b=media.url.includes('base64,')?media.url.split('base64,')[1]:media.url;await messagesApi.sendAudio({number,media:b,delay:parseInt(delay)});}else if(media.isUrl){await messagesApi.sendMedia({number,media:media.url,caption:message,mediaType:media.type,mimetype:'video/mp4',fileName:media.name||'video.mp4',delay:parseInt(delay)});}else{const b=media.url.includes('base64,')?media.url.split('base64,')[1]:media.url;await messagesApi.sendMedia({number,media:b,caption:message,mediaType:media.type,mimetype:media.file?.type||'image/png',fileName:media.name||'file',delay:parseInt(delay)});}}else{await messagesApi.sendText(number,message,{delay:parseInt(delay)});}setToast({msg:"Mensagem enviada!",type:"success"});}setNumber("");setMessage("");setMedia(null);setScheduled("");}catch(err){setToast({msg:err.response?.data?.error||"Falha ao enviar",type:"error"});}finally{setSending(false);}};const canSend=number&&(message||media);return(<div style={{padding:"24px",maxWidth:"700px"}}>{toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}{showPreview&&<PreviewModal number={number} text={message} media={media} onConfirm={handleSend} onCancel={()=>setShowPreview(false)} sending={sending}/>}<div style={card(c)}><div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px"}}><Send size={20} color={c.accent}/><h3 style={{margin:0,fontSize:"18px",fontWeight:"700",color:c.text}}>Enviar Mensagem</h3></div><p style={{margin:"0 0 22px",fontSize:"13px",color:c.textMut}}>Texto ou mídia via WhatsApp</p><div style={{marginBottom:"16px"}}><label style={lbl(c)}>Número</label><input value={number} onChange={e=>setNumber(e.target.value)} placeholder="5511999887766" style={inp(c)}/></div><div style={{marginBottom:"16px"}}><label style={lbl(c)}>Mensagem</label><textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Olá {primeiro_nome}! Como posso ajudar?" rows={4} style={{...inp(c),resize:"vertical"}}/><div style={{display:"flex",gap:"4px",marginTop:"6px",flexWrap:"wrap"}}>{variables.map(v=><button key={v} onClick={()=>setMessage(prev=>prev+v)} type="button" style={{padding:"3px 8px",borderRadius:"6px",border:`1px solid ${c.border}`,background:c.bgInput,color:c.accent,fontSize:"11px",fontWeight:"600",cursor:"pointer"}}>{v}</button>)}</div></div><label style={{...lbl(c),display:"flex",alignItems:"center",gap:"6px"}}><Paperclip size={13}/>Anexar Mídia</label><MediaPicker selected={media} onSelect={setMedia} onRemove={()=>setMedia(null)}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"20px"}}><div><label style={lbl(c)}>Delay (ms)</label><input value={delay} onChange={e=>setDelay(e.target.value)} type="number" style={inp(c)}/></div><div><label style={{...lbl(c),display:"flex",alignItems:"center",gap:"6px"}}><Calendar size={12}/>Agendar (opcional)</label><input value={scheduled} onChange={e=>setScheduled(e.target.value)} type="datetime-local" style={inp(c)}/></div></div>{message&&message.includes("{")&&<div style={{marginBottom:"16px"}}><label style={lbl(c)}>Pré-visualização</label><div style={{background:dark?"#005c4b":"#dcf8c6",borderRadius:"12px 12px 12px 4px",padding:"12px 14px",maxWidth:"350px"}}><p style={{margin:0,fontSize:"13px",color:dark?"#e9edef":"#111b21",whiteSpace:"pre-wrap"}}>{message.replace(/\{nome\}/gi,"João da Silva").replace(/\{primeiro_nome\}/gi,"João").replace(/\{email\}/gi,"joao@email.com").replace(/\{telefone\}/gi,number||"5511999887766")}</p></div></div>}<button onClick={()=>setShowPreview(true)} disabled={!canSend} style={btnP(c,!canSend)}>{scheduled?<Calendar size={16}/>:<Eye size={16}/>}{scheduled?"Agendar Envio":"Pré-visualizar e Enviar"}</button></div></div>);}

// ==========================================
// NOVA MassSendPage v3 - Com tags e variáveis
// Substitua a função MassSendPage inteira no App.jsx
// ==========================================

function MassSendPage(){
  const{dark}=useTheme();const c=C(dark);
  const[numbers,setNumbers]=useState("");const[message,setMessage]=useState("");const[interval_,setInterval_]=useState("3");
  const[name,setName]=useState("");const[scheduled,setScheduled]=useState("");
  const[running,setRunning]=useState(false);const[toast,setToast]=useState(null);
  const[campaigns,setCampaigns]=useState([]);const[loading,setLoading]=useState(true);
  const[media,setMedia]=useState(null);

  // Tags
  const[tags,setTags]=useState([]);const[selectedTag,setSelectedTag]=useState("");
  const[tagContacts,setTagContacts]=useState([]);const[loadingTag,setLoadingTag]=useState(false);
  const[inputMode,setInputMode]=useState("manual"); // manual, tag

  useEffect(()=>{(async()=>{try{const[cRes,tRes]=await Promise.all([campaignsApi.list(),contactsApi.tags()]);setCampaigns(cRes.data.campaigns||[]);setTags(tRes.data.tags||[]);}catch(e){}finally{setLoading(false);}})();},[]);

  // Carregar contatos por tag
  const loadByTag=async(tag)=>{
    setSelectedTag(tag);if(!tag){setTagContacts([]);return;}
    setLoadingTag(true);
    try{const{data}=await contactsApi.byTag(tag);setTagContacts(data.contacts||[]);
      // Preencher números automaticamente
      setNumbers(data.contacts.map(ct=>ct.phone).join("\n"));
    }catch(e){setToast({msg:"Erro ao carregar contatos",type:"error"});}finally{setLoadingTag(false);}
  };

  // Substituir variáveis por contato
  const buildMessageForContact=(template,contact)=>{
    let msg=template;
    const fullName=contact.name||contact.contact_name||"Cliente";
    const firstName=fullName.split(" ")[0];
    msg=msg.replace(/\{nome\}/gi,fullName);
    msg=msg.replace(/\{primeiro_nome\}/gi,firstName);
    msg=msg.replace(/\{email\}/gi,contact.email||"");
    msg=msg.replace(/\{telefone\}/gi,contact.phone||"");
    return msg;
  };

  const start=async()=>{
    const nums=numbers.split("\n").filter(n=>n.trim());
    if(!nums.length||!name)return;
    if(!message&&!media){setToast({msg:"Preencha a mensagem ou anexe uma mídia",type:"error"});return;}
    setRunning(true);
    try{
      // Construir lista de destinatários com dados pra variáveis
      const recipients=nums.map(phone=>{
        const contact=tagContacts.find(ct=>ct.phone===phone.trim())||{phone:phone.trim()};
        return{phone:phone.trim(),name:contact.name||null,email:contact.email||null};
      });

      const p={name,message:message||'',recipients,interval_ms:parseInt(interval_)*1000,use_variables:message.includes('{')};
      if(media){p.media_url=media.url||media.preview||'';p.media_type=media.type;}
      if(scheduled)p.scheduled_at=scheduled;

      const{data:camp}=await campaignsApi.create(p);
      if(!scheduled){
        const startData={};
        if(media&&!media.isUrl){startData.media_base64=media.url;startData.media_mimetype=media.file?.type||'image/png';startData.media_filename=media.name||'file';}
        await campaignsApi.start(camp.campaign.id,startData);
      }
      setToast({msg:scheduled?`Agendado!`:`Disparo iniciado! ${nums.length} msgs`,type:"success"});
      setName("");setNumbers("");setMessage("");setScheduled("");setMedia(null);setSelectedTag("");setTagContacts([]);
      const{data:u}=await campaignsApi.list();setCampaigns(u.campaigns||[]);
    }catch(err){setToast({msg:err.response?.data?.error||"Falha",type:"error"});}finally{setRunning(false);}
  };

  const stS=s=>({completed:{bg:c.okSoft,col:c.ok,l:"Concluída"},running:{bg:c.warnSoft,col:c.warn,l:"Enviando"},scheduled:{bg:c.infoSoft,col:c.info,l:"Agendada"},draft:{bg:c.bgInput,col:c.textMut,l:"Rascunho"},paused:{bg:c.warnSoft,col:c.warn,l:"Pausada"}}[s]||{bg:c.bgInput,col:c.textMut,l:s});
  const canStart=name&&numbers.trim()&&(message||media);

  const variables=["{nome}","{primeiro_nome}","{email}","{telefone}"];

  return(<div style={{padding:"24px",maxWidth:"900px"}}>{toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    <div style={{...card(c),marginBottom:"20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px"}}><Mail size={20} color={c.violet}/><h3 style={{margin:0,fontSize:"18px",fontWeight:"700",color:c.text}}>Disparo em Massa</h3></div>
      <p style={{margin:"0 0 20px",fontSize:"13px",color:c.textMut}}>Envie texto e/ou mídia para múltiplos contatos com variáveis personalizadas</p>

      <div style={{background:c.warnSoft,border:`1px solid ${c.warn}33`,borderRadius:"12px",padding:"12px 16px",marginBottom:"20px",display:"flex",alignItems:"flex-start",gap:"10px",color:c.warn,fontSize:"12px"}}><AlertCircle size={16} style={{flexShrink:0,marginTop:"1px"}}/><span>Intervalo mínimo de 3 segundos recomendado.</span></div>

      <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Nome da Campanha</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: Promoção Março" style={inp(c)}/></div>

      {/* Modo de seleção: Manual ou Tag */}
      <div style={{marginBottom:"16px"}}>
        <label style={lbl(c)}>Destinatários</label>
        <div style={{display:"flex",gap:"8px",marginBottom:"12px"}}>
          <button onClick={()=>{setInputMode("manual");setSelectedTag("");setTagContacts([]);}} style={{padding:"8px 16px",borderRadius:"8px",border:"none",background:inputMode==="manual"?c.accent:c.bgInput,color:inputMode==="manual"?"white":c.textSec,fontSize:"12px",fontWeight:"600",cursor:"pointer"}}>Digitar Números</button>
          <button onClick={()=>setInputMode("tag")} style={{padding:"8px 16px",borderRadius:"8px",border:"none",background:inputMode==="tag"?c.accent:c.bgInput,color:inputMode==="tag"?"white":c.textSec,fontSize:"12px",fontWeight:"600",cursor:"pointer"}}>Selecionar por Tag</button>
        </div>

        {inputMode==="tag"&&<>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"12px"}}>
            {tags.length===0?<span style={{fontSize:"12px",color:c.textMut}}>Nenhuma tag criada. Crie tags na tela de Contatos.</span>:
            tags.map(t=>(
              <button key={t.id} onClick={()=>loadByTag(t.name)} style={{padding:"6px 14px",borderRadius:"8px",border:`1px solid ${selectedTag===t.name?t.color||c.accent:c.border}`,background:selectedTag===t.name?(t.color||c.accent)+"22":"transparent",color:selectedTag===t.name?t.color||c.accent:c.textSec,fontSize:"12px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"}}><div style={{width:"8px",height:"8px",borderRadius:"50%",background:t.color||c.accent}}/>{t.name} ({t.contact_count||0})</button>
            ))}
          </div>
          {loadingTag&&<p style={{fontSize:"12px",color:c.textMut}}>Carregando contatos...</p>}
          {tagContacts.length>0&&<div style={{background:c.bgInput,borderRadius:"10px",padding:"10px 14px",marginBottom:"10px",border:`1px solid ${c.border}`}}>
            <span style={{fontSize:"12px",color:c.ok,fontWeight:"600"}}>{tagContacts.length} contatos carregados da tag "{selectedTag}"</span>
          </div>}
        </>}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
          <div><label style={{...lbl(c),fontSize:"11px"}}>Números {inputMode==="tag"?"(carregados da tag)":"(um por linha)"}</label><textarea value={numbers} onChange={e=>setNumbers(e.target.value)} placeholder={"5511999887766\n5511988776655"} rows={6} style={{...inp(c),fontFamily:"monospace",fontSize:"13px",resize:"vertical"}}/><span style={{fontSize:"11px",color:c.textMut}}>{numbers.split("\n").filter(n=>n.trim()).length} contatos</span></div>
          <div>
            <label style={{...lbl(c),fontSize:"11px"}}>Mensagem {media?"(legenda)":""}</label>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder={media?"Legenda da mídia (opcional)...":"Olá {primeiro_nome}! Sua mensagem aqui..."} rows={6} style={{...inp(c),resize:"vertical",fontSize:"13px"}}/>
            <div style={{display:"flex",gap:"4px",marginTop:"6px",flexWrap:"wrap"}}>
              {variables.map(v=><button key={v} onClick={()=>setMessage(prev=>prev+v)} style={{padding:"3px 8px",borderRadius:"6px",border:`1px solid ${c.border}`,background:c.bgInput,color:c.accent,fontSize:"11px",fontWeight:"600",cursor:"pointer"}}>{v}</button>)}
            </div>
            <span style={{fontSize:"11px",color:c.textMut,marginTop:"4px",display:"block"}}>Use variáveis pra personalizar cada mensagem</span>
          </div>
        </div>
      </div>

      {/* Preview com variáveis */}
      {message&&message.includes("{")&&<div style={{marginBottom:"16px"}}>
        <label style={lbl(c)}>Pré-visualização</label>
        <div style={{background:dark?"#005c4b":"#dcf8c6",borderRadius:"12px 12px 12px 4px",padding:"12px 14px",maxWidth:"350px"}}>
          <p style={{margin:0,fontSize:"13px",color:dark?"#e9edef":"#111b21",whiteSpace:"pre-wrap"}}>{message.replace(/\{nome\}/gi,"João da Silva").replace(/\{primeiro_nome\}/gi,"João").replace(/\{email\}/gi,"joao@email.com").replace(/\{telefone\}/gi,"5511999887766")}</p>
        </div>
      </div>}

      <label style={{...lbl(c),display:"flex",alignItems:"center",gap:"6px"}}><Paperclip size={13}/>Anexar Mídia (opcional)</label>
      <MediaPicker selected={media} onSelect={setMedia} onRemove={()=>setMedia(null)}/>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"20px"}}>
        <div><label style={lbl(c)}>Intervalo (seg)</label><input value={interval_} onChange={e=>setInterval_(e.target.value)} type="number" min="1" style={inp(c)}/></div>
        <div><label style={{...lbl(c),display:"flex",alignItems:"center",gap:"6px"}}><Calendar size={12}/>Agendar (opcional)</label><input value={scheduled} onChange={e=>setScheduled(e.target.value)} type="datetime-local" style={inp(c)}/></div>
      </div>

      <button onClick={start} disabled={running||!canStart} style={btnP(c,running||!canStart)}>{running?<RefreshCw size={16} style={{animation:"spin 1s linear infinite"}}/>:scheduled?<Calendar size={16}/>:<Play size={16}/>}{running?"Processando...":scheduled?"Agendar":"Iniciar Disparo"}</button>
    </div>

    {campaigns.length>0&&<div style={card(c)}><h3 style={{margin:"0 0 14px",fontSize:"15px",fontWeight:"700",color:c.text}}>Histórico</h3><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Campanha","Tipo","Total","Enviadas","Falhas","Status"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:"11px",fontWeight:"600",color:c.textMut,textTransform:"uppercase",borderBottom:`1px solid ${c.border}`}}>{h}</th>)}</tr></thead><tbody>{campaigns.map(cp=>{const st=stS(cp.status);return<tr key={cp.id}><td style={{padding:"10px 12px",fontSize:"13px",fontWeight:"600",color:c.text}}>{cp.name}</td><td style={{padding:"10px 12px",fontSize:"12px",color:c.textMut}}>{cp.media_type?cp.media_type:"texto"}</td><td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec}}>{cp.total_recipients}</td><td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec}}>{cp.sent_count}</td><td style={{padding:"10px 12px",fontSize:"13px",color:cp.failed_count>0?c.danger:c.textSec}}>{cp.failed_count}</td><td style={{padding:"10px 12px"}}><span style={{fontSize:"11px",fontWeight:"600",padding:"3px 8px",borderRadius:"6px",background:st.bg,color:st.col}}>{st.l}</span></td></tr>;})}</tbody></table></div></div>}
  </div>);
}

// ==========================================
// NOVA GroupsPage COMPLETA v2 - Substitua a função GroupsPage inteira no App.jsx
// Inclui: mídia, criação múltipla, disparo em massa para grupos
// ==========================================

function GroupsPage(){
  const{dark}=useTheme();const c=C(dark);
  const[groups,setGroups]=useState([]);const[selected,setSelected]=useState(null);const[loading,setLoading]=useState(true);
  const[syncing,setSyncing]=useState(false);const[toast,setToast]=useState(null);
  const[tab,setTab]=useState("send");

  // Send state
  const[msgText,setMsgText]=useState("");const[sending,setSending]=useState(false);
  const[mentionAll,setMentionAll]=useState(false);const[mentionNumbers,setMentionNumbers]=useState("");
  const[groupMedia,setGroupMedia]=useState(null);

  // Poll state
  const[pollQuestion,setPollQuestion]=useState("");const[pollOptions,setPollOptions]=useState(["","",""]);
  const[pollMulti,setPollMulti]=useState(false);const[sendingPoll,setSendingPoll]=useState(false);

  // Contact state
  const[contactName,setContactName]=useState("");const[contactPhone,setContactPhone]=useState("");
  const[contactOrg,setContactOrg]=useState("");const[sendingContact,setSendingContact]=useState(false);

  // Create group state
  const[newGroupName,setNewGroupName]=useState("");const[newGroupDesc,setNewGroupDesc]=useState("");
  const[newGroupParticipants,setNewGroupParticipants]=useState("");const[creating,setCreating]=useState(false);
  const[createMode,setCreateMode]=useState("single"); // single, multiple
  const[multipleGroups,setMultipleGroups]=useState([{subject:"",participants:""}]);

  // Mass send state
  const[massSelectedGroups,setMassSelectedGroups]=useState([]);const[massText,setMassText]=useState("");
  const[massMedia,setMassMedia]=useState(null);const[massInterval,setMassInterval]=useState("3");
  const[massMentionAll,setMassMentionAll]=useState(false);const[massSending,setMassSending]=useState(false);const[massScheduled,setMassScheduled]=useState("");

  // Manage state
  const[members,setMembers]=useState([]);const[loadingMembers,setLoadingMembers]=useState(false);
  const[editName,setEditName]=useState("");const[editDesc,setEditDesc]=useState("");
  const[addNumber,setAddNumber]=useState("");const[inviteLink,setInviteLink]=useState("");

  const load=async()=>{try{const{data}=await groupsApi.list();setGroups(data.groups||[]);}catch(e){}finally{setLoading(false);}};
  const sync=async()=>{setSyncing(true);try{await groupsApi.sync();await load();setToast({msg:"Grupos sincronizados!",type:"success"});}catch(e){setToast({msg:"Falha ao sincronizar",type:"error"});}finally{setSyncing(false);}};
  useEffect(()=>{load();},[]);

  const loadMembers=async(jid)=>{setLoadingMembers(true);try{const{data}=await groupsApi.members(jid);setMembers(Array.isArray(data.members)?data.members:data.members?.participants||[]);}catch(e){setMembers([]);}finally{setLoadingMembers(false);}};

  const selectGroup=(g)=>{setSelected(g);setTab("send");setEditName(g.name||"");setEditDesc(g.description||"");setMsgText("");setMentionAll(false);setMentionNumbers("");setInviteLink("");setGroupMedia(null);};

  // ===== SEND TEXT + MEDIA =====
  const sendToGroup=async()=>{
    if(!selected||(!msgText&&!groupMedia))return;setSending(true);
    try{
      if(groupMedia){
        await groupsApi.sendMedia(selected.group_jid,{
          media:groupMedia.isUrl?groupMedia.url:(groupMedia.url||''),
          mediaType:groupMedia.type,
          mimetype:groupMedia.file?.type||'image/png',
          fileName:groupMedia.name||'file',
          caption:msgText||'',
        });
      }else{
        const opts={delay:1000};
        if(mentionAll)opts.mentionsEveryOne=true;
        if(mentionNumbers.trim())opts.mentioned=mentionNumbers.split("\n").filter(n=>n.trim()).map(n=>n.trim());
        await groupsApi.send(selected.group_jid,msgText,opts);
      }
      setToast({msg:"Enviada!",type:"success"});setMsgText("");setMentionAll(false);setMentionNumbers("");setGroupMedia(null);
    }catch(e){setToast({msg:e.response?.data?.error||"Falha",type:"error"});}finally{setSending(false);}
  };

  // ===== SEND POLL =====
  const sendPoll=async()=>{const opts=pollOptions.filter(o=>o.trim());if(!selected||!pollQuestion||opts.length<2)return;setSendingPoll(true);try{await groupsApi.sendPoll(selected.group_jid,{name:pollQuestion,values:opts,selectableCount:pollMulti?opts.length:1});setToast({msg:"Enquete enviada!",type:"success"});setPollQuestion("");setPollOptions(["","",""]);setPollMulti(false);}catch(e){setToast({msg:e.response?.data?.error||"Falha",type:"error"});}finally{setSendingPoll(false);}};
  const addPollOption=()=>setPollOptions([...pollOptions,""]);
  const removePollOption=(i)=>setPollOptions(pollOptions.filter((_,idx)=>idx!==i));
  const updatePollOption=(i,v)=>{const n=[...pollOptions];n[i]=v;setPollOptions(n);};

  // ===== SEND CONTACT =====
  const sendContact=async()=>{if(!selected||!contactName||!contactPhone)return;setSendingContact(true);try{await groupsApi.sendContact(selected.group_jid,{fullName:contactName,phoneNumber:contactPhone,organization:contactOrg});setToast({msg:"Contato enviado!",type:"success"});setContactName("");setContactPhone("");setContactOrg("");}catch(e){setToast({msg:e.response?.data?.error||"Falha",type:"error"});}finally{setSendingContact(false);}};

  // ===== CREATE GROUP =====
  const createGroup=async()=>{
    if(createMode==="multiple"){
      const validGroups=multipleGroups.filter(g=>g.subject&&g.participants.trim());
      if(validGroups.length===0){setToast({msg:"Preencha pelo menos 1 grupo",type:"error"});return;}
      setCreating(true);
      try{
        const groupList=validGroups.map(g=>({subject:g.subject,participants:g.participants.split("\n").filter(n=>n.trim()).map(n=>n.trim())}));
        const{data}=await groupsApi.createMultiple({groups:groupList});
        const ok=data.results.filter(r=>r.success).length;
        const fail=data.results.filter(r=>!r.success).length;
        setToast({msg:`${ok} grupo(s) criado(s)${fail>0?`, ${fail} falha(s)`:""}`  ,type:ok>0?"success":"error"});
        setMultipleGroups([{subject:"",participants:""}]);
        await sync();
      }catch(e){setToast({msg:"Falha ao criar grupos",type:"error"});}finally{setCreating(false);}
    }else{
      const parts=newGroupParticipants.split("\n").filter(n=>n.trim()).map(n=>n.trim());
      if(!newGroupName||parts.length<1)return;setCreating(true);
      try{await groupsApi.create({subject:newGroupName,description:newGroupDesc,participants:parts});setToast({msg:"Grupo criado!",type:"success"});setNewGroupName("");setNewGroupDesc("");setNewGroupParticipants("");await sync();}catch(e){setToast({msg:e.response?.data?.error||"Falha",type:"error"});}finally{setCreating(false);}
    }
  };

  const addMultipleGroup=()=>setMultipleGroups([...multipleGroups,{subject:"",participants:""}]);
  const removeMultipleGroup=(i)=>setMultipleGroups(multipleGroups.filter((_,idx)=>idx!==i));
  const updateMultipleGroup=(i,field,val)=>{const n=[...multipleGroups];n[i][field]=val;setMultipleGroups(n);};

  // ===== MASS SEND =====
  const toggleMassGroup=(jid)=>{setMassSelectedGroups(prev=>prev.includes(jid)?prev.filter(j=>j!==jid):[...prev,jid]);};
  const selectAllGroups=()=>{if(massSelectedGroups.length===groups.length)setMassSelectedGroups([]);else setMassSelectedGroups(groups.map(g=>g.group_jid));};

  const massSendToGroups=async()=>{
    if(massSelectedGroups.length===0||(!massText&&!massMedia)){setToast({msg:"Selecione grupos e preencha mensagem/mídia",type:"error"});return;}
    setMassSending(true);
    try{
      const data={groupJids:massSelectedGroups,text:massText||'',interval_ms:parseInt(massInterval)*1000,mentionsEveryOne:massMentionAll};
      if(massMedia){data.media=massMedia.isUrl?massMedia.url:(massMedia.url||'');data.mediaType=massMedia.type;data.mimetype=massMedia.file?.type||'image/png';data.fileName=massMedia.name||'file';data.caption=massText||'';}
      await groupsApi.massSend(data);
      setToast({msg:`Disparo iniciado para ${massSelectedGroups.length} grupos!`,type:"success"});setMassText("");setMassMedia(null);setMassSelectedGroups([]);
    }catch(e){setToast({msg:e.response?.data?.error||"Falha",type:"error"});}finally{setMassSending(false);}
  };

  // ===== MANAGE =====
  const updateSubject=async()=>{if(!editName)return;try{await groupsApi.updateSubject(selected.group_jid,editName);setToast({msg:"Nome alterado!",type:"success"});load();}catch(e){setToast({msg:"Falha",type:"error"});}};
  const updateDesc=async()=>{try{await groupsApi.updateDescription(selected.group_jid,editDesc);setToast({msg:"Descrição alterada!",type:"success"});}catch(e){setToast({msg:"Falha",type:"error"});}};
  const changeSetting=async(action)=>{try{await groupsApi.updateSettings(selected.group_jid,action);const labels={announcement:"Apenas admins enviam",not_announcement:"Todos enviam",locked:"Apenas admins editam",unlocked:"Todos editam"};setToast({msg:labels[action]||"Alterado!",type:"success"});}catch(e){setToast({msg:"Falha",type:"error"});}};
  const manageParticipant=async(action,number)=>{try{await groupsApi.updateParticipants(selected.group_jid,action,[number]);const labels={add:"Adicionado!",remove:"Removido!",promote:"Promovido!",demote:"Rebaixado!"};setToast({msg:labels[action],type:"success"});loadMembers(selected.group_jid);}catch(e){setToast({msg:e.response?.data?.error||"Falha",type:"error"});}};
  const addParticipant=async()=>{if(!addNumber.trim())return;await manageParticipant("add",addNumber.trim());setAddNumber("");};
  const getInviteLink=async()=>{try{const{data}=await groupsApi.inviteCode(selected.group_jid);setInviteLink(data.inviteCode?.inviteUrl||data.inviteCode||JSON.stringify(data));}catch(e){setToast({msg:"Falha",type:"error"});}};
  const leaveGroup=async()=>{if(!confirm("Tem certeza que deseja sair deste grupo?"))return;try{await groupsApi.leave(selected.group_jid);setToast({msg:"Saiu do grupo!",type:"success"});setSelected(null);load();}catch(e){setToast({msg:"Falha",type:"error"});}};

  // ===== TAB BUTTON =====
  const tabBtn=(id,icon,label)=>{const Icon=icon;const active=tab===id;return<button key={id} onClick={()=>{setTab(id);if(id==="manage"&&selected)loadMembers(selected.group_jid);}} style={{padding:"7px 12px",borderRadius:"8px",border:"none",background:active?c.accent:c.bgInput,color:active?"white":c.textSec,fontSize:"11px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"5px",transition:"all 0.2s"}}><Icon size={13}/>{label}</button>;};

  return(<div style={{padding:"24px"}}>{toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    <div style={{display:"grid",gridTemplateColumns:"320px 1fr",gap:"14px"}}>

      {/* LEFT: Group List */}
      <div style={card(c)}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
          <h3 style={{margin:0,fontSize:"15px",fontWeight:"700",color:c.text}}>Grupos</h3>
          <div style={{display:"flex",gap:"6px"}}>
            <button onClick={()=>{setSelected(null);setTab("create");}} style={{padding:"6px 10px",borderRadius:"8px",border:"none",background:c.accentSoft,color:c.accent,fontSize:"11px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"}}><Plus size={12}/>Criar</button>
            <button onClick={()=>{setSelected(null);setTab("mass");}} style={{padding:"6px 10px",borderRadius:"8px",border:"none",background:c.violetGlow,color:c.violet,fontSize:"11px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"}}><Mail size={12}/>Massa</button>
            <button onClick={sync} disabled={syncing} style={{padding:"6px 10px",borderRadius:"8px",border:"none",background:c.bgInput,color:c.textSec,fontSize:"11px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"}}><RefreshCw size={12} style={syncing?{animation:"spin 1s linear infinite"}:{}}/></button>
          </div>
        </div>
        {loading?<p style={{color:c.textMut,textAlign:"center",padding:"20px",fontSize:"13px"}}>Carregando...</p>:
        groups.length===0?<p style={{color:c.textMut,fontSize:"13px",textAlign:"center",padding:"30px 0"}}>Clique em Sync</p>:
        <div style={{maxHeight:"500px",overflowY:"auto"}}>{groups.map(g=>(
          <div key={g.id} onClick={()=>selectGroup(g)} style={{padding:"10px 12px",borderRadius:"10px",marginBottom:"3px",cursor:"pointer",background:selected?.id===g.id?c.accentSoft:"transparent",border:`1px solid ${selected?.id===g.id?c.accent+"33":"transparent"}`,transition:"all 0.15s"}} onMouseEnter={e=>{if(selected?.id!==g.id)e.currentTarget.style.background=c.bgCardHover;}} onMouseLeave={e=>{if(selected?.id!==g.id)e.currentTarget.style.background="transparent";}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px"}}><div style={{width:"36px",height:"36px",borderRadius:"10px",background:c.violetGlow,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Hash size={15} color={c.violet}/></div><div style={{minWidth:0}}><div style={{fontSize:"13px",fontWeight:"600",color:c.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.name||g.group_jid}</div><div style={{fontSize:"11px",color:c.textMut}}>{g.member_count||0} membros</div></div></div>
          </div>
        ))}</div>}
      </div>

      {/* RIGHT */}
      <div style={card(c)}>

        {/* TAB: Create */}
        {tab==="create"&&!selected&&<>
          <h3 style={{margin:"0 0 16px",fontSize:"16px",fontWeight:"700",color:c.text,display:"flex",alignItems:"center",gap:"8px"}}><Plus size={18} color={c.accent}/>Criar Grupo</h3>
          <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}><button onClick={()=>setCreateMode("single")} style={{padding:"7px 14px",borderRadius:"8px",border:"none",background:createMode==="single"?c.accent:c.bgInput,color:createMode==="single"?"white":c.textSec,fontSize:"12px",fontWeight:"600",cursor:"pointer"}}>Grupo Único</button><button onClick={()=>setCreateMode("multiple")} style={{padding:"7px 14px",borderRadius:"8px",border:"none",background:createMode==="multiple"?c.accent:c.bgInput,color:createMode==="multiple"?"white":c.textSec,fontSize:"12px",fontWeight:"600",cursor:"pointer"}}>Múltiplos Grupos</button></div>

          {createMode==="single"?<>
            <div style={{marginBottom:"14px"}}><label style={lbl(c)}>Nome do Grupo</label><input value={newGroupName} onChange={e=>setNewGroupName(e.target.value)} placeholder="Ex: Equipe de Vendas" style={inp(c)}/></div>
            <div style={{marginBottom:"14px"}}><label style={lbl(c)}>Descrição (opcional)</label><textarea value={newGroupDesc} onChange={e=>setNewGroupDesc(e.target.value)} placeholder="Descrição do grupo..." rows={2} style={{...inp(c),resize:"vertical"}}/></div>
            <div style={{marginBottom:"18px"}}><label style={lbl(c)}>Participantes (um número por linha)</label><textarea value={newGroupParticipants} onChange={e=>setNewGroupParticipants(e.target.value)} placeholder={"5511999887766\n5511988776655"} rows={4} style={{...inp(c),fontFamily:"monospace",fontSize:"13px",resize:"vertical"}}/><span style={{fontSize:"11px",color:c.textMut}}>{newGroupParticipants.split("\n").filter(n=>n.trim()).length} participantes</span></div>
            <button onClick={createGroup} disabled={creating||!newGroupName||!newGroupParticipants.trim()} style={btnP(c,creating||!newGroupName||!newGroupParticipants.trim())}>{creating?<RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/>:<Plus size={14}/>}{creating?"Criando...":"Criar Grupo"}</button>
          </>:<>
            {multipleGroups.map((g,i)=><div key={i} style={{background:c.bgInput,borderRadius:"12px",padding:"14px",marginBottom:"10px",border:`1px solid ${c.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}><span style={{fontSize:"13px",fontWeight:"600",color:c.text}}>Grupo {i+1}</span>{multipleGroups.length>1&&<button onClick={()=>removeMultipleGroup(i)} style={{background:"none",border:"none",cursor:"pointer",color:c.danger}}><X size={16}/></button>}</div>
              <div style={{marginBottom:"8px"}}><input value={g.subject} onChange={e=>updateMultipleGroup(i,"subject",e.target.value)} placeholder="Nome do grupo" style={inp(c)}/></div>
              <div><textarea value={g.participants} onChange={e=>updateMultipleGroup(i,"participants",e.target.value)} placeholder={"Participantes (um por linha)\n5511999887766"} rows={3} style={{...inp(c),fontFamily:"monospace",fontSize:"12px",resize:"vertical"}}/></div>
            </div>)}
            <button onClick={addMultipleGroup} style={{background:"none",border:"none",color:c.accent,fontSize:"13px",fontWeight:"600",cursor:"pointer",padding:"4px 0",marginBottom:"14px",display:"flex",alignItems:"center",gap:"4px"}}><Plus size={14}/>Adicionar grupo</button>
            <button onClick={createGroup} disabled={creating} style={btnP(c,creating)}>{creating?<RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/>:<Plus size={14}/>}{creating?"Criando...":"Criar Todos"}</button>
          </>}
        </>}

        {/* TAB: Mass Send */}
        {tab==="mass"&&!selected&&<>
          <h3 style={{margin:"0 0 16px",fontSize:"16px",fontWeight:"700",color:c.text,display:"flex",alignItems:"center",gap:"8px"}}><Mail size={18} color={c.violet}/>Disparo em Massa para Grupos</h3>

          <div style={{marginBottom:"14px"}}><label style={lbl(c)}>Selecionar Grupos ({massSelectedGroups.length}/{groups.length})</label>
            <button onClick={selectAllGroups} style={{...btnS(c),padding:"5px 10px",fontSize:"11px",marginBottom:"8px"}}>{massSelectedGroups.length===groups.length?"Desmarcar todos":"Selecionar todos"}</button>
            <div style={{maxHeight:"180px",overflowY:"auto",border:`1px solid ${c.border}`,borderRadius:"10px"}}>
              {groups.map(g=>{const checked=massSelectedGroups.includes(g.group_jid);return<div key={g.id} onClick={()=>toggleMassGroup(g.group_jid)} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 12px",cursor:"pointer",background:checked?c.accentSoft:"transparent",borderBottom:`1px solid ${c.border}`}}>
                <input type="checkbox" checked={checked} readOnly style={{accentColor:c.accent}}/>
                <div><div style={{fontSize:"12px",fontWeight:"600",color:c.text}}>{g.name||g.group_jid}</div><div style={{fontSize:"10px",color:c.textMut}}>{g.member_count||0} membros</div></div>
              </div>;})}
            </div>
          </div>

          <div style={{marginBottom:"14px"}}><label style={lbl(c)}>Mensagem</label><textarea value={massText} onChange={e=>setMassText(e.target.value)} placeholder="Mensagem para os grupos..." rows={4} style={{...inp(c),resize:"vertical"}}/></div>

          <label style={{...lbl(c),display:"flex",alignItems:"center",gap:"6px"}}><Paperclip size={13}/>Anexar Mídia (opcional)</label>
          <MediaPicker selected={massMedia} onSelect={setMassMedia} onRemove={()=>setMassMedia(null)}/>

		<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"14px",marginBottom:"14px",alignItems:"end"}}>
            <div><label style={lbl(c)}>Intervalo (seg)</label><input value={massInterval} onChange={e=>setMassInterval(e.target.value)} type="number" min="1" style={inp(c)}/></div>
            <div><label style={{...lbl(c),display:"flex",alignItems:"center",gap:"6px"}}><Calendar size={12}/>Agendar (opcional)</label><input value={massScheduled||""} onChange={e=>setMassScheduled(e.target.value)} type="datetime-local" style={inp(c)}/></div>
            <label style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",color:c.textSec,cursor:"pointer",paddingBottom:"12px"}}><input type="checkbox" checked={massMentionAll} onChange={e=>setMassMentionAll(e.target.checked)} style={{accentColor:c.accent}}/>Mencionar todos</label>
          </div>

          <button onClick={massSendToGroups} disabled={massSending||massSelectedGroups.length===0||(!massText&&!massMedia)} style={btnP(c,massSending||massSelectedGroups.length===0||(!massText&&!massMedia))}>{massSending?<RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/>:massScheduled?<Calendar size={14}/>:<Play size={14}/>}{massSending?"Enviando...":massScheduled?"Agendar Disparo":"Iniciar Disparo"}</button>
        </>}

         {/* Mini histórico */}
          <div style={{marginTop:"20px",paddingTop:"16px",borderTop:`1px solid ${c.border}`}}>
            <h4 style={{margin:"0 0 10px",fontSize:"13px",fontWeight:"700",color:c.textMut}}>Últimos Disparos</h4>
            <p style={{fontSize:"12px",color:c.textMut}}>Acesse a tela "Disparo em Massa" para ver o histórico completo com estatísticas.</p>
          </div>
		  
        {/* No group selected */}
        {!selected&&tab!=="create"&&tab!=="mass"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px",color:c.textMut,textAlign:"center"}}><Users size={40} style={{marginBottom:"14px",opacity:0.3}}/><p style={{fontSize:"14px",margin:0}}>Selecione um grupo, crie ou dispare em massa</p></div>}

        {/* Group selected */}
        {selected&&<>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px"}}><div style={{width:"42px",height:"42px",borderRadius:"12px",background:c.violetGlow,display:"flex",alignItems:"center",justifyContent:"center"}}><Hash size={18} color={c.violet}/></div><div><div style={{fontSize:"15px",fontWeight:"700",color:c.text}}>{selected.name||selected.group_jid}</div><div style={{fontSize:"12px",color:c.textMut}}>{selected.member_count||0} membros</div></div></div>
          </div>

          <div style={{display:"flex",gap:"6px",marginBottom:"18px",flexWrap:"wrap"}}>
            {tabBtn("send",Send,"Mensagem")}{tabBtn("poll",BarChart3,"Enquete")}{tabBtn("contact",Phone,"Contato")}{tabBtn("manage",Settings,"Gerenciar")}
          </div>

          {/* TAB: Send Message + Media */}
          {tab==="send"&&<>
            <div style={{marginBottom:"14px"}}><label style={lbl(c)}>Mensagem {groupMedia?"(legenda)":""}</label><textarea value={msgText} onChange={e=>setMsgText(e.target.value)} placeholder={groupMedia?"Legenda da mídia (opcional)...":"Mensagem para o grupo..."} rows={4} style={{...inp(c),resize:"vertical"}}/></div>

            <label style={{...lbl(c),display:"flex",alignItems:"center",gap:"6px"}}><Paperclip size={13}/>Anexar Mídia</label>
            <MediaPicker selected={groupMedia} onSelect={setGroupMedia} onRemove={()=>setGroupMedia(null)}/>

            {!groupMedia&&<div style={{marginBottom:"14px",display:"flex",gap:"16px",flexWrap:"wrap"}}>
              <label style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",color:c.textSec,cursor:"pointer"}}><input type="checkbox" checked={mentionAll} onChange={e=>setMentionAll(e.target.checked)} style={{accentColor:c.accent}}/>Mencionar todos</label>
            </div>}
            {!groupMedia&&!mentionAll&&<div style={{marginBottom:"14px"}}><label style={lbl(c)}>Menções ocultas (números, um por linha)</label><textarea value={mentionNumbers} onChange={e=>setMentionNumbers(e.target.value)} placeholder={"5511999887766"} rows={2} style={{...inp(c),fontFamily:"monospace",fontSize:"12px",resize:"vertical"}}/></div>}
            <button onClick={sendToGroup} disabled={sending||(!msgText&&!groupMedia)} style={btnP(c,sending||(!msgText&&!groupMedia))}>{sending?<RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/>:<Send size={14}/>}{sending?"Enviando...":"Enviar"}</button>
          </>}

          {/* TAB: Poll */}
          {tab==="poll"&&<>
            <div style={{marginBottom:"14px"}}><label style={lbl(c)}>Pergunta da Enquete</label><input value={pollQuestion} onChange={e=>setPollQuestion(e.target.value)} placeholder="Ex: Qual o melhor dia?" style={inp(c)}/></div>
            <label style={lbl(c)}>Opções</label>
            {pollOptions.map((opt,i)=><div key={i} style={{display:"flex",gap:"8px",marginBottom:"8px"}}><input value={opt} onChange={e=>updatePollOption(i,e.target.value)} placeholder={`Opção ${i+1}`} style={{...inp(c),flex:1}}/>{pollOptions.length>2&&<button onClick={()=>removePollOption(i)} style={{background:"none",border:"none",cursor:"pointer",color:c.danger,padding:"4px"}}><X size={16}/></button>}</div>)}
            <button onClick={addPollOption} style={{background:"none",border:"none",color:c.accent,fontSize:"13px",fontWeight:"600",cursor:"pointer",padding:"4px 0",marginBottom:"14px",display:"flex",alignItems:"center",gap:"4px"}}><Plus size={14}/>Adicionar opção</button>
            <label style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",color:c.textSec,cursor:"pointer",marginBottom:"18px"}}><input type="checkbox" checked={pollMulti} onChange={e=>setPollMulti(e.target.checked)} style={{accentColor:c.accent}}/>Múltiplas respostas</label>
            <button onClick={sendPoll} disabled={sendingPoll||!pollQuestion||pollOptions.filter(o=>o.trim()).length<2} style={btnP(c,sendingPoll||!pollQuestion||pollOptions.filter(o=>o.trim()).length<2)}>{sendingPoll?<RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/>:<BarChart3 size={14}/>}{sendingPoll?"Enviando...":"Enviar Enquete"}</button>
          </>}

          {/* TAB: Contact */}
          {tab==="contact"&&<>
            <div style={{marginBottom:"14px"}}><label style={lbl(c)}>Nome do Contato</label><input value={contactName} onChange={e=>setContactName(e.target.value)} placeholder="João Silva" style={inp(c)}/></div>
            <div style={{marginBottom:"14px"}}><label style={lbl(c)}>Número</label><input value={contactPhone} onChange={e=>setContactPhone(e.target.value)} placeholder="5511999887766" style={inp(c)}/></div>
            <div style={{marginBottom:"18px"}}><label style={lbl(c)}>Empresa (opcional)</label><input value={contactOrg} onChange={e=>setContactOrg(e.target.value)} placeholder="Empresa" style={inp(c)}/></div>
            <button onClick={sendContact} disabled={sendingContact||!contactName||!contactPhone} style={btnP(c,sendingContact||!contactName||!contactPhone)}>{sendingContact?<RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/>:<Phone size={14}/>}{sendingContact?"Enviando...":"Enviar Contato"}</button>
          </>}

          {/* TAB: Manage */}
          {tab==="manage"&&<>
            <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Nome do Grupo</label><div style={{display:"flex",gap:"8px"}}><input value={editName} onChange={e=>setEditName(e.target.value)} style={{...inp(c),flex:1}}/><button onClick={updateSubject} style={{...btnP(c,false),padding:"10px 16px",fontSize:"12px"}}>Salvar</button></div></div>
            <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Descrição</label><div style={{display:"flex",gap:"8px"}}><textarea value={editDesc} onChange={e=>setEditDesc(e.target.value)} rows={2} style={{...inp(c),flex:1,resize:"vertical"}}/><button onClick={updateDesc} style={{...btnP(c,false),padding:"10px 16px",fontSize:"12px",alignSelf:"flex-start"}}>Salvar</button></div></div>
            <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Configurações</label><div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}><button onClick={()=>changeSetting("announcement")} style={{...btnS(c),padding:"7px 12px",fontSize:"11px"}}>Só admins enviam</button><button onClick={()=>changeSetting("not_announcement")} style={{...btnS(c),padding:"7px 12px",fontSize:"11px"}}>Todos enviam</button><button onClick={()=>changeSetting("locked")} style={{...btnS(c),padding:"7px 12px",fontSize:"11px"}}>Só admins editam</button><button onClick={()=>changeSetting("unlocked")} style={{...btnS(c),padding:"7px 12px",fontSize:"11px"}}>Todos editam</button></div></div>
            <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Adicionar Participante</label><div style={{display:"flex",gap:"8px"}}><input value={addNumber} onChange={e=>setAddNumber(e.target.value)} placeholder="5511999887766" style={{...inp(c),flex:1}} onKeyDown={e=>e.key==='Enter'&&addParticipant()}/><button onClick={addParticipant} style={{...btnP(c,false),padding:"10px 16px",fontSize:"12px"}}><Plus size={14}/></button></div></div>
            <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Link de Convite</label><div style={{display:"flex",gap:"8px"}}><button onClick={getInviteLink} style={{...btnS(c),padding:"7px 12px",fontSize:"11px"}}>Gerar Link</button>{inviteLink&&<input value={inviteLink} readOnly style={{...inp(c),flex:1,fontSize:"12px"}} onClick={e=>{e.target.select();navigator.clipboard?.writeText(inviteLink);setToast({msg:"Copiado!",type:"success"});}}/>}</div></div>
            <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Membros ({members.length})</label>{loadingMembers?<p style={{color:c.textMut,fontSize:"13px"}}>Carregando...</p>:<div style={{maxHeight:"250px",overflowY:"auto",border:`1px solid ${c.border}`,borderRadius:"10px"}}>{members.map((m,i)=>{const jid=m.id||m;const isAdmin=m.admin==="admin"||m.admin==="superadmin";const num=typeof jid==="string"?jid.replace("@s.whatsapp.net",""):jid;return<div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderBottom:i<members.length-1?`1px solid ${c.border}`:"none"}}><div style={{display:"flex",alignItems:"center",gap:"8px"}}><div style={{width:"30px",height:"30px",borderRadius:"50%",background:isAdmin?c.warnSoft:c.bgInput,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"700",color:isAdmin?c.warn:c.textMut}}>{isAdmin?"A":"M"}</div><div><div style={{fontSize:"12px",fontWeight:"600",color:c.text,fontFamily:"monospace"}}>{num}</div>{isAdmin&&<div style={{fontSize:"10px",color:c.warn,fontWeight:"600"}}>Admin</div>}</div></div><div style={{display:"flex",gap:"4px"}}>{!isAdmin&&<button onClick={()=>manageParticipant("promote",num)} title="Admin" style={{background:"none",border:"none",cursor:"pointer",color:c.warn,padding:"3px",fontSize:"10px",fontWeight:"600"}}>Admin</button>}{isAdmin&&m.admin!=="superadmin"&&<button onClick={()=>manageParticipant("demote",num)} title="Rebaixar" style={{background:"none",border:"none",cursor:"pointer",color:c.textMut,padding:"3px",fontSize:"10px",fontWeight:"600"}}>Rebaixar</button>}<button onClick={()=>manageParticipant("remove",num)} title="Remover" style={{background:"none",border:"none",cursor:"pointer",color:c.danger,padding:"3px"}}><Trash2 size={13}/></button></div></div>;})}</div>}</div>
            <button onClick={leaveGroup} style={{...btnS(c),color:c.danger,borderColor:c.danger+"44",fontSize:"12px",padding:"8px 16px"}}><LogOut size={14}/>Sair do Grupo</button>
          </>}
        </>}
      </div>
    </div>
  </div>);
}

function ReportsPage(){const{dark}=useTheme();const c=C(dark);const[campaigns,setCampaigns]=useState([]);const[topGroups,setTopGroups]=useState([]);const[loading,setLoading]=useState(true);const[toast,setToast]=useState(null);useEffect(()=>{(async()=>{try{const[cp,gr]=await Promise.all([reportsApi.campaignStats(),reportsApi.topGroups()]);setCampaigns(cp.data.campaigns||[]);setTopGroups(gr.data.groups||[]);}catch(e){}finally{setLoading(false);}})();},[]);const exp=async(t)=>{try{const r=t==="excel"?await reportsApi.exportExcel():await reportsApi.exportPdf();const u=window.URL.createObjectURL(new Blob([r.data]));const a=document.createElement('a');a.href=u;a.download=`relatorio.${t==="excel"?"xlsx":"pdf"}`;a.click();setToast({msg:"Exportado!",type:"success"});}catch(e){setToast({msg:"Erro",type:"error"});}};const stS=s=>({completed:{bg:c.okSoft,col:c.ok,l:"Concluída"},running:{bg:c.warnSoft,col:c.warn,l:"Enviando"},scheduled:{bg:c.infoSoft,col:c.info,l:"Agendada"},draft:{bg:c.bgInput,col:c.textMut,l:"Rascunho"}}[s]||{bg:c.bgInput,col:c.textMut,l:s});if(loading)return<div style={{padding:"40px",textAlign:"center",color:c.textMut}}>Carregando...</div>;return(<div style={{padding:"24px"}}>{toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}<div style={{display:"flex",gap:"8px",marginBottom:"20px"}}><div style={{flex:1}}/><button onClick={()=>exp("excel")} style={{...btnS(c),padding:"7px 14px",fontSize:"12px"}}><Download size={13}/>Excel</button><button onClick={()=>exp("pdf")} style={{...btnS(c),padding:"7px 14px",fontSize:"12px",color:c.danger}}><Download size={13}/>PDF</button></div>{campaigns.length>0&&<div style={{...card(c),marginBottom:"20px"}}><h3 style={{margin:"0 0 14px",fontSize:"15px",fontWeight:"700",color:c.text}}>Campanhas</h3><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Campanha","Enviadas","Entregues","Lidas","Falhas","Status"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:"11px",fontWeight:"600",color:c.textMut,textTransform:"uppercase",borderBottom:`1px solid ${c.border}`}}>{h}</th>)}</tr></thead><tbody>{campaigns.map(cp=>{const st=stS(cp.status);return<tr key={cp.id}><td style={{padding:"10px 12px",fontSize:"13px",fontWeight:"600",color:c.text}}>{cp.name}</td><td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec}}>{cp.sent_count}</td><td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec}}>{cp.delivered_count}</td><td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec}}>{cp.read_count}</td><td style={{padding:"10px 12px",fontSize:"13px",color:c.textSec}}>{cp.failed_count}</td><td style={{padding:"10px 12px"}}><span style={{fontSize:"11px",fontWeight:"600",padding:"3px 8px",borderRadius:"6px",background:st.bg,color:st.col}}>{st.l}</span></td></tr>;})}</tbody></table></div></div>}{topGroups.length>0&&<div style={card(c)}><h3 style={{margin:"0 0 14px",fontSize:"15px",fontWeight:"700",color:c.text}}>Ranking de Grupos</h3>{topGroups.map((g,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<topGroups.length-1?`1px solid ${c.border}`:"none"}}><div style={{display:"flex",alignItems:"center",gap:"10px"}}><span style={{width:"26px",height:"26px",borderRadius:"8px",background:i===0?c.warnSoft:c.bgInput,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:"700",color:i===0?c.warn:c.textMut}}>{i+1}</span><span style={{fontSize:"13px",fontWeight:"600",color:c.text}}>{g.name||g.group_jid}</span></div><span style={{fontSize:"13px",color:c.textMut}}>{g.message_count||0} msgs</span></div>)}</div>}</div>);}

function ContactsPage(){
  const{dark}=useTheme();const c=C(dark);
  const[contacts,setContacts]=useState([]);const[tags,setTags]=useState([]);
  const[search,setSearch]=useState("");const[filterTag,setFilterTag]=useState("");
  const[loading,setLoading]=useState(true);const[toast,setToast]=useState(null);
  const[showCreate,setShowCreate]=useState(false);const[editId,setEditId]=useState(null);
  const[selected,setSelected]=useState([]);const[showTagForm,setShowTagForm]=useState(false);
  const[newTagName,setNewTagName]=useState("");const[newTagColor,setNewTagColor]=useState("#10b981");
  const[bulkTagName,setBulkTagName]=useState("");
  const[pagination,setPagination]=useState({page:1,total:0});
 
  // Contact form
  const[form,setForm]=useState({name:"",phone:"",email:"",tags:[],notes:""});
  const[tagInput,setTagInput]=useState("");
 
  const load=async()=>{
    try{
      const[cRes,tRes]=await Promise.all([
        contactsApi.list({search,tag:filterTag||undefined,limit:50,page:pagination.page}),
        contactsApi.tags(),
      ]);
      setContacts(cRes.data.contacts||[]);setPagination(prev=>({...prev,total:cRes.data.pagination?.total||0}));
      setTags(tRes.data.tags||[]);
    }catch(e){}finally{setLoading(false);}
  };
  useEffect(()=>{setLoading(true);load();},[search,filterTag]);
 
  const resetForm=()=>{setForm({name:"",phone:"",email:"",tags:[],notes:""});setTagInput("");setEditId(null);};
 
  const saveContact=async()=>{
    if(!form.phone){setToast({msg:"Telefone obrigatório",type:"error"});return;}
    try{
      if(editId){await contactsApi.update(editId,form);setToast({msg:"Contato atualizado!",type:"success"});}
      else{await contactsApi.create(form);setToast({msg:"Contato criado!",type:"success"});}
      setShowCreate(false);resetForm();load();
    }catch(e){setToast({msg:e.response?.data?.error||"Erro",type:"error"});}
  };
 
  const editContact=(ct)=>{
    setForm({name:ct.name||"",phone:ct.phone||"",email:ct.email||"",tags:ct.tags||[],notes:ct.notes||""});
    setEditId(ct.id);setShowCreate(true);
  };
 
  const deleteContact=async(id)=>{
    if(!confirm("Remover contato?"))return;
    try{await contactsApi.delete(id);setToast({msg:"Removido!",type:"success"});load();}catch(e){setToast({msg:"Erro",type:"error"});}
  };
 
  const addTagToForm=()=>{
    if(!tagInput.trim())return;
    const tag=tagInput.trim().toLowerCase();
    if(!form.tags.includes(tag))setForm({...form,tags:[...form.tags,tag]});
    setTagInput("");
  };
 
  const removeTagFromForm=(tag)=>{setForm({...form,tags:form.tags.filter(t=>t!==tag)});};
 
  // Bulk tag operations
  const toggleSelect=(id)=>{setSelected(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);};
  const selectAll=()=>{if(selected.length===contacts.length)setSelected([]);else setSelected(contacts.map(c=>c.id));};
 
  const applyBulkTag=async()=>{
    if(!bulkTagName.trim()||selected.length===0){setToast({msg:"Selecione contatos e digite uma tag",type:"error"});return;}
    try{await contactsApi.bulkTag({contact_ids:selected,tag:bulkTagName.trim()});setToast({msg:`Tag "${bulkTagName}" aplicada a ${selected.length} contatos`,type:"success"});setBulkTagName("");setSelected([]);load();}
    catch(e){setToast({msg:"Erro",type:"error"});}
  };
 
  // Tags CRUD
  const createTag=async()=>{
    if(!newTagName.trim())return;
    try{await contactsApi.createTag({name:newTagName.trim(),color:newTagColor});setToast({msg:"Tag criada!",type:"success"});setNewTagName("");setShowTagForm(false);load();}
    catch(e){setToast({msg:"Erro",type:"error"});}
  };
 
  const deleteTag=async(name)=>{
    if(!confirm(`Remover tag "${name}" de todos os contatos?`))return;
    try{await contactsApi.deleteTag(name);setToast({msg:"Tag removida!",type:"success"});load();}catch(e){setToast({msg:"Erro",type:"error"});}
  };
 
  // CSV import
  const importCsv=async(e)=>{
    const f=e.target.files[0];if(!f)return;
    const importTags=prompt("Tags para aplicar a todos os contatos importados (separar por vírgula, ou deixe vazio):");
    try{const{data}=await contactsApi.importCsv(f,importTags||"");setToast({msg:`Importados: ${data.imported}, Erros: ${data.errors}`,type:data.imported>0?"success":"error"});load();}
    catch(e){setToast({msg:"Erro na importação",type:"error"});}
    e.target.value="";
  };
 
  const tagColors=["#10b981","#8b5cf6","#3b82f6","#f59e0b","#ef4444","#ec4899","#06b6d4","#84cc16"];
 
  return(<div style={{padding:"24px"}}>{toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
 
    {/* Tags Bar */}
    <div style={{...card(c),marginBottom:"16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
        <h3 style={{margin:0,fontSize:"15px",fontWeight:"700",color:c.text}}>Tags</h3>
        <button onClick={()=>setShowTagForm(!showTagForm)} style={{...btnS(c),padding:"6px 12px",fontSize:"11px"}}><Plus size={12}/>Nova Tag</button>
      </div>
 
      {showTagForm&&<div style={{display:"flex",gap:"8px",marginBottom:"12px",alignItems:"center"}}>
        <input value={newTagName} onChange={e=>setNewTagName(e.target.value)} placeholder="Nome da tag" style={{...inp(c),flex:1,padding:"8px 12px"}} onKeyDown={e=>e.key==='Enter'&&createTag()}/>
        <div style={{display:"flex",gap:"4px"}}>{tagColors.map(cl=><div key={cl} onClick={()=>setNewTagColor(cl)} style={{width:"24px",height:"24px",borderRadius:"6px",background:cl,cursor:"pointer",border:newTagColor===cl?`2px solid ${c.text}`:"2px solid transparent"}}/>)}</div>
        <button onClick={createTag} style={{...btnP(c,false),padding:"8px 14px",fontSize:"12px"}}>Criar</button>
      </div>}
 
      <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
        <button onClick={()=>setFilterTag("")} style={{padding:"5px 12px",borderRadius:"8px",border:`1px solid ${!filterTag?c.accent:c.border}`,background:!filterTag?c.accentSoft:c.bgInput,color:!filterTag?c.accent:c.textSec,fontSize:"12px",fontWeight:"600",cursor:"pointer"}}>Todos ({pagination.total})</button>
        {tags.map(t=>(
          <div key={t.id} style={{display:"flex",alignItems:"center",gap:"4px"}}>
            <button onClick={()=>setFilterTag(t.name)} style={{padding:"5px 12px",borderRadius:"8px",border:`1px solid ${filterTag===t.name?t.color:c.border}`,background:filterTag===t.name?t.color+"22":"transparent",color:filterTag===t.name?t.color:c.textSec,fontSize:"12px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"}}><div style={{width:"8px",height:"8px",borderRadius:"50%",background:t.color}}/>{t.name} ({t.contact_count||0})</button>
            <button onClick={()=>deleteTag(t.name)} style={{background:"none",border:"none",cursor:"pointer",color:c.textMut,padding:"2px"}}><X size={12}/></button>
          </div>
        ))}
      </div>
    </div>
 
    {/* Toolbar */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"10px"}}>
      <div style={{position:"relative",flex:1,maxWidth:"400px"}}><Search size={15} color={c.textMut} style={{position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)"}}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nome, telefone ou email..." style={{...inp(c),paddingLeft:"38px",width:"100%"}}/></div>
      <div style={{display:"flex",gap:"8px"}}>
        {selected.length>0&&<div style={{display:"flex",gap:"6px",alignItems:"center"}}><input value={bulkTagName} onChange={e=>setBulkTagName(e.target.value)} placeholder="Tag" style={{...inp(c),width:"120px",padding:"8px 12px"}} onKeyDown={e=>e.key==='Enter'&&applyBulkTag()}/><button onClick={applyBulkTag} style={{...btnP(c,false),padding:"8px 14px",fontSize:"12px"}}>Aplicar tag ({selected.length})</button></div>}
        <label style={{...btnS(c),padding:"8px 14px",fontSize:"12px",cursor:"pointer"}}><Upload size={13}/>CSV<input type="file" accept=".csv" onChange={importCsv} style={{display:"none"}}/></label>
        <button onClick={()=>{setShowCreate(true);resetForm();}} style={btnP(c,false)}><Plus size={14}/>Novo Contato</button>
      </div>
    </div>
 
    {/* Create/Edit Form */}
    {showCreate&&<div style={{...card(c),marginBottom:"16px"}}>
      <h3 style={{margin:"0 0 16px",fontSize:"16px",fontWeight:"700",color:c.text}}>{editId?"Editar":"Novo"} Contato</h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"14px",marginBottom:"14px"}}>
        <div><label style={lbl(c)}>Nome</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="João Silva" style={inp(c)}/></div>
        <div><label style={lbl(c)}>Telefone</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="5511999887766" style={inp(c)}/></div>
        <div><label style={lbl(c)}>Email</label><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="email@exemplo.com" style={inp(c)}/></div>
      </div>
      <div style={{marginBottom:"14px"}}><label style={lbl(c)}>Tags</label>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"8px"}}>{form.tags.map(t=><span key={t} style={{padding:"4px 10px",borderRadius:"6px",background:c.accentSoft,color:c.accent,fontSize:"12px",fontWeight:"600",display:"flex",alignItems:"center",gap:"4px"}}>{t}<button onClick={()=>removeTagFromForm(t)} style={{background:"none",border:"none",cursor:"pointer",color:c.accent,padding:0}}><X size={12}/></button></span>)}</div>
        <div style={{display:"flex",gap:"6px"}}><input value={tagInput} onChange={e=>setTagInput(e.target.value)} placeholder="Adicionar tag..." style={{...inp(c),flex:1}} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addTagToForm())}/><button onClick={addTagToForm} type="button" style={{...btnS(c),padding:"8px 14px",fontSize:"12px"}}>+</button></div>
      </div>
      <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Notas</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Observações..." rows={2} style={{...inp(c),resize:"vertical"}}/></div>
      <div style={{display:"flex",gap:"10px"}}><button onClick={saveContact} style={btnP(c,false)}><CheckCircle size={14}/>{editId?"Salvar":"Criar"}</button><button onClick={()=>{setShowCreate(false);resetForm();}} style={btnS(c)}>Cancelar</button></div>
    </div>}
 
    {/* Contacts List */}
    <div style={card(c)}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
        <h3 style={{margin:0,fontSize:"15px",fontWeight:"700",color:c.text}}>Contatos {filterTag&&<span style={{fontSize:"12px",color:c.accent,fontWeight:"600"}}>— tag: {filterTag}</span>}</h3>
        {contacts.length>0&&<button onClick={selectAll} style={{...btnS(c),padding:"5px 12px",fontSize:"11px"}}>{selected.length===contacts.length?"Desmarcar":"Selecionar"} todos</button>}
      </div>
 
      {loading?<p style={{color:c.textMut,textAlign:"center",padding:"20px"}}>Carregando...</p>:
      contacts.length===0?<p style={{color:c.textMut,fontSize:"13px",textAlign:"center",padding:"30px 0"}}>Nenhum contato{filterTag?` com tag "${filterTag}"`:""}</p>:
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>
        <th style={{width:"30px",padding:"8px"}}></th>
        {["Nome","Telefone","Email","Tags","Notas","Ações"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:"11px",fontWeight:"600",color:c.textMut,textTransform:"uppercase",borderBottom:`1px solid ${c.border}`}}>{h}</th>)}
      </tr></thead><tbody>
        {contacts.map(ct=><tr key={ct.id} onMouseEnter={e=>e.currentTarget.style.background=c.bgCardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <td style={{padding:"8px",textAlign:"center"}}><input type="checkbox" checked={selected.includes(ct.id)} onChange={()=>toggleSelect(ct.id)} style={{accentColor:c.accent}}/></td>
          <td style={{padding:"10px 12px",fontSize:"13px",fontWeight:"600",color:c.text}}>{ct.name||"—"}</td>
          <td style={{padding:"10px 12px",fontSize:"12px",color:c.textSec,fontFamily:"monospace"}}>{ct.phone}</td>
          <td style={{padding:"10px 12px",fontSize:"12px",color:c.textSec}}>{ct.email||"—"}</td>
          <td style={{padding:"10px 12px"}}><div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>{(ct.tags||[]).map(t=><span key={t} style={{padding:"2px 8px",borderRadius:"4px",background:c.accentSoft,color:c.accent,fontSize:"10px",fontWeight:"600"}}>{t}</span>)}</div></td>
          <td style={{padding:"10px 12px",fontSize:"12px",color:c.textMut,maxWidth:"150px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ct.notes||"—"}</td>
          <td style={{padding:"10px 12px",display:"flex",gap:"6px"}}>
            <button onClick={()=>editContact(ct)} style={{background:"none",border:"none",cursor:"pointer",color:c.info,padding:"3px"}}><Edit size={15}/></button>
            <button onClick={()=>deleteContact(ct.id)} style={{background:"none",border:"none",cursor:"pointer",color:c.danger,padding:"3px"}}><Trash2 size={15}/></button>
          </td>
        </tr>)}
      </tbody></table></div>}
    </div>
  </div>);
}
 
function SettingsPage({user,onProfileUpdate}){
  const{dark}=useTheme();const c=C(dark);
  const[profile,setProfile]=useState({full_name:"",phone:"",company:"",billing_email:"",avatar_url:""});
  const[loading,setLoading]=useState(true);const[toast,setToast]=useState(null);const[saving,setSaving]=useState(false);
  const[tab,setTab]=useState("profile");
  const[passwords,setPasswords]=useState({current_password:"",new_password:"",confirm_password:""});
  const[changingPw,setChangingPw]=useState(false);
 
  useEffect(()=>{(async()=>{try{const{data}=await profileApi.get();setProfile(data.profile||{});}catch(e){}finally{setLoading(false);}})();},[]);
 
  const saveProfile=async()=>{
    setSaving(true);
    try{
      const{data}=await profileApi.update({full_name:profile.full_name,phone:profile.phone,company:profile.company,billing_email:profile.billing_email});
      setProfile(data.profile);setToast({msg:"Perfil atualizado!",type:"success"});
      try{if(onProfileUpdate)onProfileUpdate(data.profile);}catch(e2){}
    }catch(e){setToast({msg:"Erro ao salvar",type:"error"});}finally{setSaving(false);}
  };
 
  const uploadAvatar=async(e)=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=async()=>{
      try{
        const{data}=await profileApi.updateAvatar({avatar:reader.result});
        setProfile(prev=>({...prev,avatar_url:data.avatar_url}));
        setToast({msg:"Foto atualizada!",type:"success"});
        if(onProfileUpdate)onProfileUpdate({...profile,avatar_url:data.avatar_url});
      }catch(e){setToast({msg:"Erro ao salvar foto",type:"error"});}
    };
    reader.readAsDataURL(file);
  };
 
  const changePassword=async()=>{
    if(!passwords.current_password||!passwords.new_password){setToast({msg:"Preencha as senhas",type:"error"});return;}
    if(passwords.new_password!==passwords.confirm_password){setToast({msg:"Senhas não conferem",type:"error"});return;}
    if(passwords.new_password.length<6){setToast({msg:"Mínimo 6 caracteres",type:"error"});return;}
    setChangingPw(true);
    try{
      await profileApi.changePassword({current_password:passwords.current_password,new_password:passwords.new_password});
      setToast({msg:"Senha alterada!",type:"success"});setPasswords({current_password:"",new_password:"",confirm_password:""});
    }catch(e){setToast({msg:e.response?.data?.error||"Erro ao alterar senha",type:"error"});}finally{setChangingPw(false);}
  };
 
  const planLabels={complete:"Plano Completo",groups:"Grupos",automations:"Automações",ai:"Assistente IA",groups_automations:"Grupos + Automações"};
 
  if(loading)return<div style={{padding:"40px",textAlign:"center",color:c.textMut}}><RefreshCw size={24} style={{animation:"spin 1s linear infinite"}}/></div>;
 
  return(<div style={{padding:"24px",maxWidth:"800px"}}>{toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
 
    {/* Tabs */}
    <div style={{display:"flex",gap:"8px",marginBottom:"20px"}}>
      <button onClick={()=>setTab("profile")} style={{padding:"8px 18px",borderRadius:"8px",border:"none",background:tab==="profile"?c.accent:c.bgInput,color:tab==="profile"?"white":c.textSec,fontSize:"13px",fontWeight:"600",cursor:"pointer"}}>Perfil</button>
      <button onClick={()=>setTab("plan")} style={{padding:"8px 18px",borderRadius:"8px",border:"none",background:tab==="plan"?c.accent:c.bgInput,color:tab==="plan"?"white":c.textSec,fontSize:"13px",fontWeight:"600",cursor:"pointer"}}>Plano</button>
      <button onClick={()=>setTab("security")} style={{padding:"8px 18px",borderRadius:"8px",border:"none",background:tab==="security"?c.accent:c.bgInput,color:tab==="security"?"white":c.textSec,fontSize:"13px",fontWeight:"600",cursor:"pointer"}}>Segurança</button>
    </div>
 
    {/* Profile Tab */}
    {tab==="profile"&&<div style={card(c)}>
      <h3 style={{margin:"0 0 20px",fontSize:"18px",fontWeight:"700",color:c.text}}>Meu Perfil</h3>
 
      {/* Avatar */}
      <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"24px"}}>
        <div style={{position:"relative"}}>
          {profile.avatar_url?
            <img src={profile.avatar_url} alt="" style={{width:"72px",height:"72px",borderRadius:"50%",objectFit:"cover",border:`3px solid ${c.accent}`}}/>:
            <div style={{width:"72px",height:"72px",borderRadius:"50%",background:`linear-gradient(135deg,${c.accent},${c.violet})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"28px",fontWeight:"800",color:"white"}}>{(profile.full_name||profile.email||"U")[0].toUpperCase()}</div>
          }
          <label style={{position:"absolute",bottom:"-4px",right:"-4px",width:"28px",height:"28px",borderRadius:"50%",background:c.accent,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:`2px solid ${c.bg}`}}>
            <Camera size={14} color="white"/>
            <input type="file" accept="image/*" onChange={uploadAvatar} style={{display:"none"}}/>
          </label>
        </div>
        <div><div style={{fontSize:"16px",fontWeight:"700",color:c.text}}>{profile.full_name||"Sem nome"}</div><div style={{fontSize:"13px",color:c.textMut}}>{profile.email}</div></div>
      </div>
 
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"16px"}}>
        <div><label style={lbl(c)}>Nome Completo</label><input value={profile.full_name||""} onChange={e=>setProfile({...profile,full_name:e.target.value})} placeholder="Seu nome" style={inp(c)}/></div>
        <div><label style={lbl(c)}>Telefone</label><input value={profile.phone||""} onChange={e=>setProfile({...profile,phone:e.target.value})} placeholder="11999887766" style={inp(c)}/></div>
        <div><label style={lbl(c)}>Empresa</label><input value={profile.company||""} onChange={e=>setProfile({...profile,company:e.target.value})} placeholder="Sua empresa" style={inp(c)}/></div>
        <div><label style={lbl(c)}>Email de Cobrança</label><input value={profile.billing_email||""} onChange={e=>setProfile({...profile,billing_email:e.target.value})} placeholder="financeiro@empresa.com" style={inp(c)}/></div>
      </div>
 
      <div style={{padding:"14px",borderRadius:"12px",background:c.bgInput,border:`1px solid ${c.border}`,marginBottom:"20px"}}>
        <div style={{fontSize:"12px",color:c.textMut,marginBottom:"4px"}}>Email de login</div>
        <div style={{fontSize:"14px",color:c.text,fontWeight:"600"}}>{profile.email}</div>
      </div>
 
      <button onClick={saveProfile} disabled={saving} style={btnP(c,saving)}>{saving?"Salvando...":"Salvar Perfil"}</button>
    </div>}
 
    {/* Plan Tab */}
    {tab==="plan"&&<div style={card(c)}>
      <h3 style={{margin:"0 0 20px",fontSize:"18px",fontWeight:"700",color:c.text}}>Meu Plano</h3>
 
      <div style={{background:`linear-gradient(135deg,${c.accent}15,${c.violet}15)`,borderRadius:"16px",padding:"24px",marginBottom:"20px",border:`1px solid ${c.accent}33`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:"12px",color:c.textMut,fontWeight:"600",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"6px"}}>Plano Atual</div>
            <div style={{fontSize:"24px",fontWeight:"800",color:c.text}}>{planLabels[profile.plan]||"Completo"}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:"32px",fontWeight:"900",color:c.accent}}>R$ 97</div>
            <div style={{fontSize:"13px",color:c.textMut}}>/mês</div>
          </div>
        </div>
        {profile.plan_expires_at&&<div style={{marginTop:"12px",fontSize:"12px",color:c.textMut}}>Válido até: {new Date(profile.plan_expires_at).toLocaleDateString("pt-BR")}</div>}
      </div>
 
      <div style={{marginBottom:"16px"}}>
        <div style={{fontSize:"14px",fontWeight:"700",color:c.text,marginBottom:"12px"}}>Funcionalidades Inclusas</div>
        {["Assistente IA (OpenAI, Claude, Gemini)","Disparo em massa ilimitado","Automações de vendas (Hotmart, Eduzz, Kiwify, Voomp)","Gestão completa de grupos","Monitor de entrada/saída","Relatórios com exportação","Upload via MinIO","Agendamentos + lembretes WhatsApp","Suporte via WhatsApp"].map(f=>
          <div key={f} style={{display:"flex",alignItems:"center",gap:"8px",padding:"6px 0",fontSize:"13px",color:c.textSec}}>
            <CheckCircle size={14} color={c.ok}/>{f}
          </div>
        )}
      </div>
 
      <div style={{padding:"14px",borderRadius:"10px",background:c.bgInput,border:`1px solid ${c.border}`,fontSize:"13px",color:c.textMut}}>
        Para alterar ou cancelar seu plano, entre em contato via WhatsApp.
      </div>
    </div>}
 
    {/* Security Tab */}
    {tab==="security"&&<div style={card(c)}>
      <h3 style={{margin:"0 0 20px",fontSize:"18px",fontWeight:"700",color:c.text}}>Segurança</h3>
 
      <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Senha Atual</label><input type="password" value={passwords.current_password} onChange={e=>setPasswords({...passwords,current_password:e.target.value})} placeholder="••••••" style={inp(c)}/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"20px"}}>
        <div><label style={lbl(c)}>Nova Senha</label><input type="password" value={passwords.new_password} onChange={e=>setPasswords({...passwords,new_password:e.target.value})} placeholder="Mínimo 6 caracteres" style={inp(c)}/></div>
        <div><label style={lbl(c)}>Confirmar Nova Senha</label><input type="password" value={passwords.confirm_password} onChange={e=>setPasswords({...passwords,confirm_password:e.target.value})} placeholder="Repita a nova senha" style={inp(c)}/></div>
      </div>
 
      <button onClick={changePassword} disabled={changingPw} style={btnP(c,changingPw)}>{changingPw?"Alterando...":"Alterar Senha"}</button>
 
      <div style={{marginTop:"24px",paddingTop:"20px",borderTop:`1px solid ${c.border}`}}>
        <div style={{fontSize:"14px",fontWeight:"700",color:c.text,marginBottom:"8px"}}>Informações da Conta</div>
        <div style={{fontSize:"13px",color:c.textMut}}>Email: {profile.email}</div>
        <div style={{fontSize:"13px",color:c.textMut}}>Criada em: {profile.created_at?new Date(profile.created_at).toLocaleDateString("pt-BR"):""}</div>
        <div style={{fontSize:"13px",color:c.textMut}}>Status: <span style={{color:profile.is_active?c.ok:c.danger,fontWeight:"600"}}>{profile.is_active?"Ativa":"Inativa"}</span></div>
      </div>
    </div>}
  </div>);
}
	  
// ==========================================
// NOVA GroupEventsPage - Adicionar no App.jsx
// Importar groupEventsApi no topo
// Sidebar: {id:"group-events",icon:Users,label:"Monitor Grupos"} (antes de automations)
// MainContent: {page==="group-events"&&<GroupEventsPage/>}
// Titles: "group-events":["Monitor de Grupos","Entrada e saída"]
// ==========================================
 
function GroupEventsPage(){
  const{dark}=useTheme();const c=C(dark);
  const[events,setEvents]=useState([]);const[stats,setStats]=useState({});const[groupStats,setGroupStats]=useState([]);
  const[loading,setLoading]=useState(true);const[toast,setToast]=useState(null);
  const[tab,setTab]=useState("events");
  const[filterGroup,setFilterGroup]=useState("");const[filterAction,setFilterAction]=useState("");
  const[n8nUrl,setN8nUrl]=useState("");const[savingConfig,setSavingConfig]=useState(false);
 
  const load=async()=>{
    try{
      const[evRes,grRes,cfRes]=await Promise.all([
        groupEventsApi.list({group_jid:filterGroup||undefined,action:filterAction||undefined,limit:100}),
        groupEventsApi.groups(),
        groupEventsApi.getWebhookConfig(),
      ]);
      setEvents(evRes.data.events||[]);setStats(evRes.data.stats||{});
      setGroupStats(grRes.data.groups||[]);setN8nUrl(cfRes.data.n8n_webhook_url||"");
    }catch(e){}finally{setLoading(false);}
  };
  useEffect(()=>{load();},[filterGroup,filterAction]);
 
  const saveConfig=async()=>{
    setSavingConfig(true);
    try{await groupEventsApi.saveWebhookConfig({n8n_webhook_url:n8nUrl});setToast({msg:"Configuração salva!",type:"success"});}
    catch(e){setToast({msg:"Erro ao salvar",type:"error"});}finally{setSavingConfig(false);}
  };
 
  const clearEvents=async()=>{
    if(!confirm("Limpar todo o histórico de eventos?"))return;
    try{await groupEventsApi.clear();setToast({msg:"Histórico limpo!",type:"success"});load();}catch(e){setToast({msg:"Erro",type:"error"});}
  };
 
  const exportEvents=async()=>{
    try{
      const{data}=await groupEventsApi.export({group_jid:filterGroup||undefined,action:filterAction||undefined});
      const blob=new Blob([JSON.stringify(data.events,null,2)],{type:'application/json'});
      const url=window.URL.createObjectURL(blob);const a=document.createElement('a');
      a.href=url;a.download=`group-events-${new Date().toISOString().split('T')[0]}.json`;a.click();
      setToast({msg:`${data.total} eventos exportados!`,type:"success"});
    }catch(e){setToast({msg:"Erro ao exportar",type:"error"});}
  };
 
  const actionLabel=(a)=>({add:"Entrou",remove:"Saiu",join:"Entrou",leave:"Saiu"}[a]||a);
  const actionColor=(a)=>(a==="add"||a==="join")?c.ok:c.danger;
 
  if(loading)return<div style={{padding:"40px",textAlign:"center",color:c.textMut}}><RefreshCw size={24} style={{animation:"spin 1s linear infinite"}}/></div>;
 
  return(<div style={{padding:"24px"}}>{toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
 
    {/* Stats */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"14px",marginBottom:"20px"}}>
      <StatCard icon={Users} label="Entradas" value={parseInt(stats.total_joined)||0} color={c.ok} colorSoft={c.okSoft}/>
      <StatCard icon={LogOut} label="Saídas" value={parseInt(stats.total_left)||0} color={c.danger} colorSoft={c.dangerSoft}/>
      <StatCard icon={BarChart3} label="Total de Eventos" value={parseInt(stats.total_events)||0} color={c.info} colorSoft={c.infoSoft}/>
    </div>
 
    {/* Config n8n */}
    <div style={{...card(c),marginBottom:"16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
        <h3 style={{margin:0,fontSize:"15px",fontWeight:"700",color:c.text,display:"flex",alignItems:"center",gap:"8px"}}><Globe size={16} color={c.accent}/>Webhook n8n (opcional)</h3>
      </div>
      <div style={{display:"flex",gap:"8px"}}>
        <input value={n8nUrl} onChange={e=>setN8nUrl(e.target.value)} placeholder="https://seu-n8n.com/webhook/grupo-eventos" style={{...inp(c),flex:1,fontSize:"13px"}}/>
        <button onClick={saveConfig} disabled={savingConfig} style={{...btnP(c,savingConfig),padding:"10px 18px",fontSize:"12px"}}>{savingConfig?"...":"Salvar"}</button>
      </div>
      <span style={{fontSize:"11px",color:c.textMut,marginTop:"4px",display:"block"}}>Eventos de entrada/saída serão encaminhados automaticamente pra esta URL</span>
    </div>
 
    {/* Tabs + Filters */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"10px"}}>
      <div style={{display:"flex",gap:"8px"}}>
        <button onClick={()=>setTab("events")} style={{padding:"8px 18px",borderRadius:"8px",border:"none",background:tab==="events"?c.accent:c.bgInput,color:tab==="events"?"white":c.textSec,fontSize:"13px",fontWeight:"600",cursor:"pointer"}}>Eventos</button>
        <button onClick={()=>setTab("groups")} style={{padding:"8px 18px",borderRadius:"8px",border:"none",background:tab==="groups"?c.accent:c.bgInput,color:tab==="groups"?"white":c.textSec,fontSize:"13px",fontWeight:"600",cursor:"pointer"}}>Por Grupo</button>
      </div>
      <div style={{display:"flex",gap:"8px"}}>
        <select value={filterAction} onChange={e=>{setFilterAction(e.target.value);setLoading(true);}} style={{...inp(c),padding:"8px 12px",fontSize:"12px",width:"auto"}}>
          <option value="">Todos</option>
          <option value="add">Entradas</option>
          <option value="remove">Saídas</option>
        </select>
        <button onClick={exportEvents} style={{...btnS(c),padding:"8px 14px",fontSize:"12px"}}><Download size={13}/>Exportar</button>
        <button onClick={clearEvents} style={{...btnS(c),padding:"8px 14px",fontSize:"12px",color:c.danger}}>Limpar</button>
        <button onClick={()=>{setLoading(true);load();}} style={{...btnS(c),padding:"8px 14px",fontSize:"12px"}}><RefreshCw size={13}/>Atualizar</button>
      </div>
    </div>
 
    {/* Events Tab */}
    {tab==="events"&&<div style={card(c)}>
      <h3 style={{margin:"0 0 14px",fontSize:"15px",fontWeight:"700",color:c.text}}>Histórico de Eventos</h3>
      {events.length===0?<p style={{color:c.textMut,fontSize:"13px",textAlign:"center",padding:"30px 0"}}>Nenhum evento registrado ainda. Os eventos aparecerão quando alguém entrar ou sair de um grupo.</p>:
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>
        {["Data","Grupo","Participante","Ação"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:"11px",fontWeight:"600",color:c.textMut,textTransform:"uppercase",borderBottom:`1px solid ${c.border}`}}>{h}</th>)}
      </tr></thead><tbody>
        {events.map(ev=><tr key={ev.id} onMouseEnter={e=>e.currentTarget.style.background=c.bgCardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <td style={{padding:"10px 12px",fontSize:"12px",color:c.textMut}}>{ev.timestamp?new Date(ev.timestamp).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):""}</td>
          <td style={{padding:"10px 12px",fontSize:"13px",fontWeight:"600",color:c.text}}>{ev.group_name||ev.group_jid?.replace("@g.us","")}</td>
          <td style={{padding:"10px 12px",fontSize:"12px",color:c.textSec,fontFamily:"monospace"}}>{ev.participant_jid?.replace("@s.whatsapp.net","")}</td>
          <td style={{padding:"10px 12px"}}><span style={{fontSize:"11px",fontWeight:"700",padding:"3px 10px",borderRadius:"6px",background:(ev.action==="add"||ev.action==="join")?c.okSoft:c.dangerSoft,color:actionColor(ev.action)}}>{actionLabel(ev.action)}</span></td>
        </tr>)}
      </tbody></table></div>}
    </div>}
 
    {/* Groups Tab */}
    {tab==="groups"&&<div style={card(c)}>
      <h3 style={{margin:"0 0 14px",fontSize:"15px",fontWeight:"700",color:c.text}}>Eventos por Grupo</h3>
      {groupStats.length===0?<p style={{color:c.textMut,fontSize:"13px",textAlign:"center",padding:"30px 0"}}>Nenhum evento registrado.</p>:
      <div>{groupStats.map(g=>(
        <div key={g.group_jid} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px",borderRadius:"12px",marginBottom:"8px",background:c.bgInput,border:`1px solid ${c.border}`,cursor:"pointer"}} onClick={()=>{setFilterGroup(g.group_jid);setTab("events");setLoading(true);}} onMouseEnter={e=>e.currentTarget.style.borderColor=c.accent+"44"} onMouseLeave={e=>e.currentTarget.style.borderColor=c.border}>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            <div style={{width:"40px",height:"40px",borderRadius:"10px",background:c.violetGlow,display:"flex",alignItems:"center",justifyContent:"center"}}><Hash size={16} color={c.violet}/></div>
            <div><div style={{fontSize:"14px",fontWeight:"700",color:c.text}}>{g.group_name||g.group_jid?.replace("@g.us","")}</div><div style={{fontSize:"11px",color:c.textMut}}>Último evento: {g.last_event?new Date(g.last_event).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):""}</div></div>
          </div>
          <div style={{display:"flex",gap:"16px",alignItems:"center"}}>
            <div style={{textAlign:"center"}}><div style={{fontSize:"16px",fontWeight:"700",color:c.ok}}>{g.joined||0}</div><div style={{fontSize:"10px",color:c.textMut}}>Entradas</div></div>
            <div style={{textAlign:"center"}}><div style={{fontSize:"16px",fontWeight:"700",color:c.danger}}>{g.left_count||0}</div><div style={{fontSize:"10px",color:c.textMut}}>Saídas</div></div>
          </div>
        </div>
      ))}</div>}
      {filterGroup&&<button onClick={()=>{setFilterGroup("");setLoading(true);}} style={{...btnS(c),marginTop:"10px",fontSize:"12px"}}>Limpar filtro</button>}
    </div>}
  </div>);
}

// ==========================================
// NOVA AIAssistantPage COMPLETA v2
// Substitua a função AIAssistantPage inteira no App.jsx
// Não esqueça de importar apiKeysApi no import do topo
// ==========================================
 
function AIAssistantPage(){
  const{dark}=useTheme();const c=C(dark);
  const[assistants,setAssistants]=useState([]);const[loading,setLoading]=useState(true);const[toast,setToast]=useState(null);
  const[showForm,setShowForm]=useState(false);const[editId,setEditId]=useState(null);const[step,setStep]=useState(1);
  const[conversations,setConversations]=useState([]);const[viewConvId,setViewConvId]=useState(null);
 
  // API Keys state
  const[apiKeys,setApiKeys]=useState([]);const[showKeyForm,setShowKeyForm]=useState(false);
  const[keyForm,setKeyForm]=useState({name:"",provider:"openai",api_key:""});const[savingKey,setSavingKey]=useState(false);
 
  // Form state
  const[form,setForm]=useState({
    name:"",provider:"openai",model:"gpt-4o-mini",api_key_id:"",api_key:"",
    system_prompt:"Você é um assistente útil e amigável. Responda de forma clara e objetiva.",
    training_text:"",response_delay:2,answer_without_question:false,
    first_response_text:"",respond_admins:false,scope:"private",
    max_tokens:1000,temperature:0.7,
	use_work_hours:false, work_start_time:"09:00", work_end_time:"18:00", work_days:["1","2","3","4","5"], out_of_hours_message:"",
  });
 
  const providers=[
    {id:"openai",label:"OpenAI (ChatGPT)",models:[{id:"gpt-4o",label:"GPT-4o"},{id:"gpt-4o-mini",label:"GPT-4o Mini"},{id:"gpt-4.1-mini",label:"GPT-4.1 Mini"},{id:"gpt-4.1-nano",label:"GPT-4.1 Nano"}]},
    {id:"anthropic",label:"Anthropic (Claude)",models:[{id:"claude-sonnet-4-20250514",label:"Claude Sonnet 4"},{id:"claude-haiku-4-5-20251001",label:"Claude Haiku 4.5"}]},
    {id:"gemini",label:"Google (Gemini)",models:[{id:"gemini-2.0-flash",label:"Gemini 2.0 Flash"},{id:"gemini-2.5-flash-preview-05-20",label:"Gemini 2.5 Flash"},{id:"gemini-2.5-pro-preview-05-06",label:"Gemini 2.5 Pro"}]},
  ];
 
  const currentModels=providers.find(p=>p.id===form.provider)?.models||[];
  const filteredKeys=apiKeys.filter(k=>k.provider===form.provider&&k.is_active);
 
  const load=async()=>{
    try{
      const[aRes,kRes]=await Promise.all([aiAssistantsApi.list(),apiKeysApi.list()]);
      setAssistants(aRes.data.assistants||[]);setApiKeys(kRes.data.keys||[]);
    }catch(e){}finally{setLoading(false);}
  };
  useEffect(()=>{load();},[]);
 
  const resetForm=()=>{setForm({name:"",provider:"openai",model:"gpt-4o-mini",api_key_id:"",api_key:"",system_prompt:"Você é um assistente útil e amigável. Responda de forma clara e objetiva.",training_text:"",response_delay:2,answer_without_question:false,first_response_text:"",respond_admins:false,scope:"private",max_tokens:1000,temperature:0.7,use_work_hours:false,work_start_time:"09:00",work_end_time:"18:00",work_days:["1","2","3","4","5"],out_of_hours_message:""});setStep(1);setEditId(null);};
 
  // API Key CRUD
  const saveKey=async()=>{
    if(!keyForm.name||!keyForm.api_key){setToast({msg:"Preencha nome e chave",type:"error"});return;}
    setSavingKey(true);
    try{
      await apiKeysApi.create(keyForm);
      setToast({msg:"Chave salva!",type:"success"});setShowKeyForm(false);setKeyForm({name:"",provider:"openai",api_key:""});
      const{data}=await apiKeysApi.list();setApiKeys(data.keys||[]);
    }catch(e){setToast({msg:"Erro ao salvar chave",type:"error"});}finally{setSavingKey(false);}
  };
  const deleteKey=async(id)=>{
    if(!confirm("Remover esta chave?"))return;
    try{await apiKeysApi.delete(id);setToast({msg:"Chave removida!",type:"success"});const{data}=await apiKeysApi.list();setApiKeys(data.keys||[]);}catch(e){setToast({msg:"Erro",type:"error"});}
  };
 
  // Assistant CRUD
  const save=async()=>{
    if(!form.name){setToast({msg:"Preencha o nome",type:"error"});return;}
    if(!form.api_key_id&&!form.api_key){setToast({msg:"Selecione ou cadastre uma API Key",type:"error"});return;}
    try{
      const payload={...form};
      // Se selecionou uma key existente, buscar a key real pra salvar no assistente
      if(form.api_key_id&&!form.api_key){
        // Backend vai buscar pela api_key_id
        payload.api_key=form.api_key_id; // Temporário, o backend resolve
      }
      if(editId){await aiAssistantsApi.update(editId,payload);setToast({msg:"Assistente atualizado!",type:"success"});}
      else{await aiAssistantsApi.create(payload);setToast({msg:"Assistente criado! Webhook configurado automaticamente.",type:"success"});}
      setShowForm(false);resetForm();load();
    }catch(e){setToast({msg:e.response?.data?.error||"Erro",type:"error"});}
  };
 
  const toggle=async(a)=>{try{await aiAssistantsApi.toggle(a.id);setToast({msg:`${a.is_active?"Desativado":"Ativado"}!`,type:"success"});load();}catch(e){setToast({msg:"Erro",type:"error"});}};
  const deleteAssistant=async(a)=>{if(!confirm(`Remover "${a.name}"?`))return;try{await aiAssistantsApi.delete(a.id);setToast({msg:"Removido!",type:"success"});load();}catch(e){setToast({msg:"Erro",type:"error"});}};
  const startEdit=(a)=>{setForm({name:a.name,provider:a.provider,model:a.model,api_key_id:"",api_key:"",system_prompt:a.system_prompt||"",training_text:a.training_text||"",response_delay:a.response_delay||2,answer_without_question:a.answer_without_question||false,first_response_text:a.first_response_text||"",respond_admins:a.respond_admins||false,scope:a.scope||"private",max_tokens:a.max_tokens||1000,temperature:a.temperature||0.7});setEditId(a.id);setStep(1);setShowForm(true);};
  const viewConversations=async(a)=>{try{const{data}=await aiAssistantsApi.conversations(a.id);setConversations(data.conversations||[]);setViewConvId(a.id);}catch(e){setToast({msg:"Erro",type:"error"});}};
  const clearConv=async(id)=>{if(!confirm("Limpar histórico?"))return;try{await aiAssistantsApi.clearConversations(id);setConversations([]);setToast({msg:"Limpo!",type:"success"});}catch(e){setToast({msg:"Erro",type:"error"});}};
 
  const providerLabel=(p)=>providers.find(pr=>pr.id===p)?.label||p;
  const scopeLabel=(s)=>({private:"Privado",groups:"Grupos",both:"Ambos"}[s]||s);
 
  if(loading)return<div style={{padding:"40px",textAlign:"center",color:c.textMut}}><RefreshCw size={24} style={{animation:"spin 1s linear infinite"}}/></div>;
 
  return(<div style={{padding:"24px"}}>{toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
 
    {/* API Keys Section */}
    <div style={{...card(c),marginBottom:"16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
        <h3 style={{margin:0,fontSize:"15px",fontWeight:"700",color:c.text,display:"flex",alignItems:"center",gap:"8px"}}><Settings size={16} color={c.accent}/>Chaves de API</h3>
        <button onClick={()=>setShowKeyForm(!showKeyForm)} style={{...btnP(c,false),padding:"7px 14px",fontSize:"12px"}}><Plus size={13}/>Nova Chave</button>
      </div>
 
      {showKeyForm&&<div style={{background:c.bgInput,borderRadius:"12px",padding:"16px",marginBottom:"14px",border:`1px solid ${c.border}`}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr",gap:"10px",marginBottom:"10px"}}>
          <div><label style={lbl(c)}>Nome</label><input value={keyForm.name} onChange={e=>setKeyForm({...keyForm,name:e.target.value})} placeholder="Ex: Minha OpenAI" style={inp(c)}/></div>
          <div><label style={lbl(c)}>Provider</label><select value={keyForm.provider} onChange={e=>setKeyForm({...keyForm,provider:e.target.value})} style={inp(c)}><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option><option value="gemini">Gemini</option></select></div>
          <div><label style={lbl(c)}>API Key</label><input value={keyForm.api_key} onChange={e=>setKeyForm({...keyForm,api_key:e.target.value})} placeholder="sk-..." type="password" style={inp(c)}/></div>
        </div>
        <div style={{display:"flex",gap:"8px"}}><button onClick={saveKey} disabled={savingKey} style={{...btnP(c,savingKey),padding:"7px 14px",fontSize:"12px"}}>{savingKey?"Salvando...":"Salvar"}</button><button onClick={()=>setShowKeyForm(false)} style={{...btnS(c),padding:"7px 14px",fontSize:"12px"}}>Cancelar</button></div>
      </div>}
 
      {apiKeys.length===0?<p style={{color:c.textMut,fontSize:"13px",textAlign:"center",padding:"10px 0"}}>Nenhuma chave cadastrada</p>:
      <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>{apiKeys.map(k=>(
        <div key={k.id} style={{display:"flex",alignItems:"center",gap:"8px",background:c.bgInput,borderRadius:"10px",padding:"8px 12px",border:`1px solid ${c.border}`}}>
          <div style={{width:"8px",height:"8px",borderRadius:"50%",background:k.is_active?c.ok:c.danger}}/>
          <span style={{fontSize:"12px",fontWeight:"600",color:c.text}}>{k.name}</span>
          <span style={{fontSize:"11px",color:c.textMut,textTransform:"capitalize"}}>{k.provider}</span>
          <span style={{fontSize:"11px",color:c.textMut,fontFamily:"monospace"}}>{k.api_key_preview}</span>
          <button onClick={()=>deleteKey(k.id)} style={{background:"none",border:"none",cursor:"pointer",color:c.danger,padding:"2px"}}><X size={14}/></button>
        </div>
      ))}</div>}
    </div>
 
    {/* Header */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <div/>
      <button onClick={()=>{setShowForm(true);resetForm();}} style={btnP(c,false)}><Plus size={14}/>Novo Assistente</button>
    </div>
 
    {/* Form - Wizard Steps */}
    {showForm&&<div style={{...card(c),marginBottom:"16px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"0",marginBottom:"24px"}}>
        {[{n:1,l:"Escolher IA"},{n:2,l:"Treinamento"},{n:3,l:"Configurar"}].map((s,i)=>(
          <div key={s.n} style={{display:"flex",alignItems:"center",flex:1}}>
            <div onClick={()=>setStep(s.n)} style={{width:"32px",height:"32px",borderRadius:"50%",background:step>=s.n?c.accent:c.bgInput,color:step>=s.n?"white":c.textMut,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"700",cursor:"pointer"}}>{s.n}</div>
            <span style={{fontSize:"12px",color:step>=s.n?c.text:c.textMut,fontWeight:"600",marginLeft:"8px",whiteSpace:"nowrap"}}>{s.l}</span>
            {i<2&&<div style={{flex:1,height:"2px",background:step>s.n?c.accent:c.border,margin:"0 12px"}}/>}
          </div>
        ))}
      </div>
 
      {/* Step 1 */}
      {step===1&&<>
 
        <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Modelo</label>
          <select value={form.model} onChange={e=>setForm({...form,model:e.target.value})} style={inp(c)}>
            {currentModels.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>
 
        <div style={{marginBottom:"16px"}}><label style={lbl(c)}>API Key</label>
          {filteredKeys.length>0?<>
            <select value={form.api_key_id} onChange={e=>setForm({...form,api_key_id:e.target.value,api_key:""})} style={{...inp(c),marginBottom:"8px"}}>
              <option value="">Selecione uma chave...</option>
              {filteredKeys.map(k=><option key={k.id} value={k.id}>{k.name} ({k.api_key_preview})</option>)}
            </select>
            {!form.api_key_id&&<div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}><div style={{flex:1,height:"1px",background:c.border}}/><span style={{fontSize:"11px",color:c.textMut}}>ou digite uma nova</span><div style={{flex:1,height:"1px",background:c.border}}/></div>}
            {!form.api_key_id&&<input value={form.api_key} onChange={e=>setForm({...form,api_key:e.target.value})} placeholder={form.provider==="openai"?"sk-...":form.provider==="anthropic"?"sk-ant-...":"AIza..."} type="password" style={inp(c)}/>}
          </>:<>
            <input value={form.api_key} onChange={e=>setForm({...form,api_key:e.target.value})} placeholder={form.provider==="openai"?"sk-...":form.provider==="anthropic"?"sk-ant-...":"AIza..."} type="password" style={inp(c)}/>
            <span style={{fontSize:"11px",color:c.textMut}}>Cadastre chaves na seção acima para reutilizar</span>
          </>}
        </div>
 
        <div style={{display:"flex",justifyContent:"flex-end",gap:"10px"}}><button onClick={()=>{setShowForm(false);resetForm();}} style={btnS(c)}>Cancelar</button><button onClick={()=>setStep(2)} style={btnP(c,false)}>Próxima →</button></div>
      </>}
 
      {/* Step 2 - Treinamento */}
      {step===2&&<>
        <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Instruções de Comportamento</label>
          <textarea value={form.system_prompt} onChange={e=>setForm({...form,system_prompt:e.target.value})} rows={5} style={{...inp(c),resize:"vertical",fontSize:"13px"}} placeholder="Ex: Você é um agente de suporte..."/>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:"11px",color:c.textMut}}>Define como a IA se comporta</span><span style={{fontSize:"11px",color:form.system_prompt.length>2800?c.danger:c.textMut}}>{form.system_prompt.length}/3000</span></div>
        </div>
 
        {/* Fontes de Treinamento */}
        <div style={{marginBottom:"16px"}}>
          <label style={lbl(c)}>Adicionar Fontes de Conhecimento</label>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"12px"}}>
            <button type="button" onClick={()=>{const i=document.createElement('input');i.type='file';i.accept='.pdf';i.onchange=async(e)=>{const f=e.target.files[0];if(!f)return;setToast({msg:"Extraindo texto do PDF...",type:"success"});try{const r=new FileReader();r.onload=async()=>{try{const{data}=await trainingSourcesApi.extractPdf({file:r.result,fileName:f.name});setForm(prev=>({...prev,training_text:(prev.training_text?prev.training_text+'\n\n--- Fonte: '+f.name+' ---\n\n':'')+data.text}));setToast({msg:`PDF extraído! ${data.pages} páginas, ${data.chars} caracteres`,type:"success"});}catch(err){setToast({msg:err.response?.data?.error||"Erro ao extrair PDF",type:"error"});}};r.readAsDataURL(f);}catch(err){setToast({msg:"Erro ao ler arquivo",type:"error"});}};i.click();}} style={{padding:"8px 14px",borderRadius:"10px",border:`1px solid ${c.border}`,background:c.bgInput,color:c.textSec,fontSize:"12px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"6px"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=c.accent;e.currentTarget.style.color=c.accent}} onMouseLeave={e=>{e.currentTarget.style.borderColor=c.border;e.currentTarget.style.color=c.textSec}}>📄 PDF</button>
 
            <button type="button" onClick={()=>{const url=prompt("Cole a URL do site:");if(!url)return;setToast({msg:"Extraindo conteúdo do site...",type:"success"});trainingSourcesApi.extractUrl({url}).then(({data})=>{setForm(prev=>({...prev,training_text:(prev.training_text?prev.training_text+'\n\n--- Fonte: '+data.title+' ---\n\n':'')+data.text}));setToast({msg:`Site extraído! ${data.chars} caracteres`,type:"success"});}).catch(err=>{setToast({msg:err.response?.data?.error||"Erro ao extrair site",type:"error"});});}} style={{padding:"8px 14px",borderRadius:"10px",border:`1px solid ${c.border}`,background:c.bgInput,color:c.textSec,fontSize:"12px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"6px"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=c.accent;e.currentTarget.style.color=c.accent}} onMouseLeave={e=>{e.currentTarget.style.borderColor=c.border;e.currentTarget.style.color=c.textSec}}>🌐 Site / URL</button>
 
            <button type="button" onClick={()=>{const url=prompt("Cole a URL do vídeo do YouTube:");if(!url)return;setToast({msg:"Extraindo transcrição do YouTube...",type:"success"});trainingSourcesApi.extractYoutube({url}).then(({data})=>{setForm(prev=>({...prev,training_text:(prev.training_text?prev.training_text+'\n\n--- Fonte: YouTube ('+data.videoId+') ---\n\n':'')+data.text}));setToast({msg:`YouTube extraído! ${data.duration}, ${data.chars} caracteres`,type:"success"});}).catch(err=>{setToast({msg:err.response?.data?.error||"Erro ao extrair YouTube",type:"error"});});}} style={{padding:"8px 14px",borderRadius:"10px",border:`1px solid ${c.border}`,background:c.bgInput,color:c.textSec,fontSize:"12px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"6px"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=c.accent;e.currentTarget.style.color=c.accent}} onMouseLeave={e=>{e.currentTarget.style.borderColor=c.border;e.currentTarget.style.color=c.textSec}}>🎬 YouTube</button>
          </div>
        </div>
 
        <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Base de Conhecimento</label>
          <textarea value={form.training_text} onChange={e=>setForm({...form,training_text:e.target.value})} rows={8} style={{...inp(c),resize:"vertical",fontSize:"13px"}} placeholder="Cole informações sobre seu produto, FAQ, etc. Ou use os botões acima para importar de PDFs, sites e YouTube."/>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:"11px",color:c.textMut}}>Limite: 20.000 caracteres • Use os botões acima para importar fontes</span><span style={{fontSize:"11px",color:form.training_text.length>19000?c.danger:c.textMut}}>{form.training_text.length}/20000</span></div>
        </div>
 
        <div style={{display:"flex",justifyContent:"space-between",gap:"10px"}}><button onClick={()=>setStep(1)} style={btnS(c)}>← Voltar</button><button onClick={()=>setStep(3)} style={btnP(c,false)}>Próxima →</button></div>
      </>}
 
      {/* Step 3 - Configurar */}
      {step===3&&<>
        <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Nome do Assistente</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ex: Suporte ao Cliente" style={inp(c)}/></div>
        <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Primeira resposta fixa (opcional)</label>
          <textarea value={form.first_response_text} onChange={e=>setForm({...form,first_response_text:e.target.value})} rows={3} style={{...inp(c),resize:"vertical",fontSize:"13px"}} placeholder="Ex: Olá! Sou o assistente virtual..."/>
          <span style={{fontSize:"11px",color:c.textMut}}>Enviada antes da IA, apenas na primeira mensagem</span>
        </div>
 
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"16px"}}>
          <div><label style={lbl(c)}>Responder sem "?"</label><div style={{display:"flex",gap:"12px"}}><label style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",color:c.textSec,cursor:"pointer"}}><input type="radio" name="question" checked={form.answer_without_question} onChange={()=>setForm({...form,answer_without_question:true})} style={{accentColor:c.accent}}/>Sim</label><label style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",color:c.textSec,cursor:"pointer"}}><input type="radio" name="question" checked={!form.answer_without_question} onChange={()=>setForm({...form,answer_without_question:false})} style={{accentColor:c.accent}}/>Não</label></div></div>
          <div><label style={lbl(c)}>Responder admins</label><div style={{display:"flex",gap:"12px"}}><label style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",color:c.textSec,cursor:"pointer"}}><input type="radio" name="admins" checked={form.respond_admins} onChange={()=>setForm({...form,respond_admins:true})} style={{accentColor:c.accent}}/>Sim</label><label style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",color:c.textSec,cursor:"pointer"}}><input type="radio" name="admins" checked={!form.respond_admins} onChange={()=>setForm({...form,respond_admins:false})} style={{accentColor:c.accent}}/>Não</label></div></div>
        </div>
 
        <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Tipo</label><div style={{display:"flex",gap:"8px"}}>{[{id:"private",l:"Privado"},{id:"groups",l:"Grupos"},{id:"both",l:"Ambos"}].map(s=>(<button key={s.id} onClick={()=>setForm({...form,scope:s.id})} style={{padding:"8px 18px",borderRadius:"10px",border:`1px solid ${form.scope===s.id?c.accent:c.border}`,background:form.scope===s.id?c.accentSoft:c.bgInput,color:form.scope===s.id?c.accent:c.textSec,fontSize:"13px",fontWeight:"600",cursor:"pointer"}}>{s.l}</button>))}</div></div>
 
        {/* Intervalo digitável */}
        <div style={{marginBottom:"16px"}}><label style={lbl(c)}>Intervalo entre respostas (segundos)</label>
          <input type="number" min="0" max="120" value={form.response_delay} onChange={e=>setForm({...form,response_delay:parseInt(e.target.value)||0})} placeholder="Ex: 5" style={{...inp(c),width:"200px"}}/>
          <span style={{fontSize:"11px",color:c.textMut,marginTop:"4px",display:"block"}}>Tempo de espera antes de enviar a resposta da IA (0 = imediato)</span>
        </div>
 
        {/* Horário de expediente */}
        <div style={{background:c.bgInput,borderRadius:"14px",padding:"18px",border:`1px solid ${c.border}`,marginBottom:"16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
            <label style={{fontSize:"14px",fontWeight:"700",color:c.text,display:"flex",alignItems:"center",gap:"8px"}}><Clock size={16} color={c.accent}/>Horário de Expediente</label>
            <div style={{display:"flex",gap:"8px"}}><label style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",color:c.textSec,cursor:"pointer"}}><input type="radio" checked={form.use_work_hours} onChange={()=>setForm({...form,use_work_hours:true})} style={{accentColor:c.accent}}/>Ativado</label><label style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",color:c.textSec,cursor:"pointer"}}><input type="radio" checked={!form.use_work_hours} onChange={()=>setForm({...form,use_work_hours:false})} style={{accentColor:c.accent}}/>Desativado</label></div>
          </div>
 
          {form.use_work_hours&&<>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"14px"}}>
              <div><label style={lbl(c)}>Início</label><input type="time" value={form.work_start_time||"09:00"} onChange={e=>setForm({...form,work_start_time:e.target.value})} style={inp(c)}/></div>
              <div><label style={lbl(c)}>Fim</label><input type="time" value={form.work_end_time||"18:00"} onChange={e=>setForm({...form,work_end_time:e.target.value})} style={inp(c)}/></div>
            </div>
 
            <div style={{marginBottom:"14px"}}><label style={lbl(c)}>Dias de funcionamento</label>
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>{[{id:"1",l:"Seg"},{id:"2",l:"Ter"},{id:"3",l:"Qua"},{id:"4",l:"Qui"},{id:"5",l:"Sex"},{id:"6",l:"Sáb"},{id:"0",l:"Dom"}].map(d=>{
                const days=form.work_days||["1","2","3","4","5"];
                const active=days.includes(d.id);
                return<button key={d.id} onClick={()=>{const newDays=active?days.filter(x=>x!==d.id):[...days,d.id];setForm({...form,work_days:newDays});}} style={{padding:"6px 14px",borderRadius:"8px",border:`1px solid ${active?c.accent:c.border}`,background:active?c.accentSoft:c.bgCard,color:active?c.accent:c.textMut,fontSize:"12px",fontWeight:"600",cursor:"pointer"}}>{d.l}</button>;
              })}</div>
            </div>
 
            <div><label style={lbl(c)}>Mensagem fora do expediente</label>
              <textarea value={form.out_of_hours_message||""} onChange={e=>setForm({...form,out_of_hours_message:e.target.value})} rows={3} style={{...inp(c),resize:"vertical",fontSize:"13px"}} placeholder="Ex: Nosso horário de atendimento é de segunda a sexta, das 9h às 18h. Retornaremos assim que possível!"/>
              <span style={{fontSize:"11px",color:c.textMut}}>Enviada automaticamente quando alguém manda mensagem fora do expediente</span>
            </div>
          </>}
        </div>
 
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"20px"}}>
          <div><label style={lbl(c)}>Max Tokens</label><input type="number" value={form.max_tokens} onChange={e=>setForm({...form,max_tokens:parseInt(e.target.value)||1000})} style={inp(c)}/></div>
          <div><label style={lbl(c)}>Temperatura ({form.temperature})</label><input type="range" min="0" max="1" step="0.1" value={form.temperature} onChange={e=>setForm({...form,temperature:parseFloat(e.target.value)})} style={{width:"100%",accentColor:c.accent,marginTop:"10px"}}/><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:"10px",color:c.textMut}}>Preciso</span><span style={{fontSize:"10px",color:c.textMut}}>Criativo</span></div></div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",gap:"10px"}}><button onClick={()=>setStep(2)} style={btnS(c)}>← Voltar</button><button onClick={save} style={btnP(c,false)}><CheckCircle size={14}/>{editId?"Salvar":"Criar Assistente"}</button></div>
      </>}
    </div>}

    {/* Conversations */}
    {viewConvId&&<div style={{...card(c),marginBottom:"16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
        <h3 style={{margin:0,fontSize:"15px",fontWeight:"700",color:c.text}}>Conversas</h3>
        <div style={{display:"flex",gap:"8px"}}><button onClick={()=>clearConv(viewConvId)} style={{...btnS(c),padding:"6px 12px",fontSize:"11px",color:c.danger}}>Limpar</button><button onClick={()=>{setViewConvId(null);setConversations([]);}} style={{...btnS(c),padding:"6px 12px",fontSize:"11px"}}>Fechar</button></div>
      </div>
      {conversations.length===0?<p style={{color:c.textMut,fontSize:"13px",textAlign:"center",padding:"20px"}}>Nenhuma conversa</p>:
      conversations.map(conv=><div key={conv.id} style={{background:c.bgInput,borderRadius:"12px",padding:"14px",marginBottom:"10px",border:`1px solid ${c.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><span style={{fontSize:"12px",fontWeight:"600",color:c.text,fontFamily:"monospace"}}>{conv.remote_jid.replace("@s.whatsapp.net","")}</span><span style={{fontSize:"11px",color:c.textMut}}>{conv.last_message_at?new Date(conv.last_message_at).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):""}</span></div>
        <div style={{maxHeight:"200px",overflowY:"auto"}}>{(Array.isArray(conv.messages)?conv.messages:[]).slice(-6).map((m,i)=>(
          <div key={i} style={{marginBottom:"6px",display:"flex",justifyContent:m.role==="user"?"flex-start":"flex-end"}}>
            <div style={{background:m.role==="user"?c.bgCard:(dark?"#005c4b":"#dcf8c6"),borderRadius:"10px",padding:"8px 12px",maxWidth:"80%"}}>
              <div style={{fontSize:"10px",color:c.textMut,marginBottom:"2px"}}>{m.role==="user"?"👤 Cliente":"🤖 IA"}</div>
              <div style={{fontSize:"12px",color:c.text,whiteSpace:"pre-wrap"}}>{m.content?.substring(0,300)}{m.content?.length>300?"...":""}</div>
            </div>
          </div>
        ))}</div>
      </div>)}
    </div>}
 
    {/* List */}
    <div style={card(c)}>
      <h3 style={{margin:"0 0 14px",fontSize:"15px",fontWeight:"700",color:c.text}}>Seus Assistentes IA</h3>
      {assistants.length===0?<p style={{color:c.textMut,fontSize:"13px",textAlign:"center",padding:"30px 0"}}>Nenhum assistente criado.</p>:
      <div>{assistants.map(a=>(
        <div key={a.id} style={{background:c.bgInput,borderRadius:"14px",padding:"18px",marginBottom:"10px",border:`1px solid ${a.is_active?c.accent+"33":c.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
              <div style={{width:"44px",height:"44px",borderRadius:"12px",background:a.is_active?c.accentSoft:c.bgCard,display:"flex",alignItems:"center",justifyContent:"center"}}><Zap size={20} color={a.is_active?c.accent:c.textMut}/></div>
              <div><div style={{fontSize:"15px",fontWeight:"700",color:c.text}}>{a.name}</div><div style={{fontSize:"12px",color:c.textMut,marginTop:"2px"}}>{providerLabel(a.provider)} • {a.model} • {scopeLabel(a.scope)}</div></div>
            </div>
            <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
              <button onClick={()=>toggle(a)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px",color:a.is_active?c.ok:c.danger,fontSize:"12px",fontWeight:"600"}}>{a.is_active?<ToggleRight size={20}/>:<ToggleLeft size={20}/>}</button>
              <button onClick={()=>viewConversations(a)} style={{background:"none",border:"none",cursor:"pointer",color:c.info,padding:"4px"}} title="Conversas"><Eye size={16}/></button>
              <button onClick={()=>startEdit(a)} style={{background:"none",border:"none",cursor:"pointer",color:c.textSec,padding:"4px"}} title="Editar"><Edit size={16}/></button>
              <button onClick={()=>deleteAssistant(a)} style={{background:"none",border:"none",cursor:"pointer",color:c.danger,padding:"4px"}} title="Remover"><Trash2 size={16}/></button>
            </div>
          </div>
          <div style={{display:"flex",gap:"20px",marginTop:"12px",paddingTop:"12px",borderTop:`1px solid ${c.border}`}}>
            <div><span style={{fontSize:"11px",color:c.textMut}}>Mensagens</span><div style={{fontSize:"16px",fontWeight:"700",color:c.text}}>{a.total_messages||0}</div></div>
            <div><span style={{fontSize:"11px",color:c.textMut}}>Tokens</span><div style={{fontSize:"16px",fontWeight:"700",color:c.text}}>{(a.total_tokens_used||0).toLocaleString("pt-BR")}</div></div>
            <div><span style={{fontSize:"11px",color:c.textMut}}>Delay</span><div style={{fontSize:"16px",fontWeight:"700",color:c.text}}>{a.response_delay||0}s</div></div>
            <div><span style={{fontSize:"11px",color:c.textMut}}>Status</span><div style={{fontSize:"13px",fontWeight:"600",color:a.is_active?c.ok:c.danger}}>{a.is_active?"Ativo":"Inativo"}</div></div>
          </div>
        </div>
      ))}</div>}
    </div>
  </div>);
}

// ==================== MAIN ====================
function MainContent({page,user,onToggleSidebar,onProfileUpdate}){
  const{dark}=useTheme();const c=C(dark);
  const titles={dashboard:["Dashboard","Visão geral"],qrcode:["WhatsApp","Gerencie sua conta WhatsApp"],send:["Enviar Mensagem","Texto e mídia"],mass:["Disparo em Massa","Campanhas"],groups:["Grupos","Gerencie grupos"],"group-events":["Monitor de Grupos","Entrada e saída"],reports:["Relatórios","Análises"],contacts:["Contatos","Sua lista"],admin:["Admin","Gerenciar clientes"],ai:["Assistente IA","Resposta automática com IA"],automations:["Automações","Webhooks de pagamento"],settings:["Configurações","Seu perfil"]};
  return(<div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}><div style={{flex:1,background:c.bg,minHeight:"100vh"}}>
    <Header title={titles[page]?.[0]||""} subtitle={titles[page]?.[1]||""} user={user} onToggleSidebar={onToggleSidebar}/>
    {page==="dashboard"&&<DashboardPage/>}{page==="qrcode"&&<QrCodePage/>}{page==="send"&&<SendMessagePage/>}{page==="mass"&&<MassSendPage/>}{page==="groups"&&<GroupsPage/>}{page==="group-events"&&<GroupEventsPage/>}{page==="reports"&&<ReportsPage/>}{page==="contacts"&&<ContactsPage/>}{page==="admin"&&<AdminPage/>}{page==="ai"&&<AIAssistantPage/>}{page==="automations"&&<AutomationsPage/>}{page==="settings"&&<SettingsPage user={user} onProfileUpdate={onProfileUpdate}/>}
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
      <MainContent page={page} user={user} onToggleSidebar={()=>setCollapsed(!collapsed)} onProfileUpdate={(p)=>setUser(prev=>({...prev,...p}))}/>
    </div>
    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes slideIn{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}} *{box-sizing:border-box;margin:0;padding:0} body{margin:0} ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}`}</style>
  </ThemeProvider>);
}

export default App;
