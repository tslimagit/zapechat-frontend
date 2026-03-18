import { useState, useEffect, createContext, useContext } from "react";
import { 
  Send, Users, BarChart3, LogOut, Moon, Sun, 
  Menu, ChevronRight, Zap, Search, Upload, 
  CheckCircle, AlertCircle, Eye, Download, 
  TrendingUp, Mail, Settings, PieChart, Plus, 
  RefreshCw, Play, Pause, Hash, Globe, Phone
} from "lucide-react";
import { authApi, messagesApi, campaignsApi, groupsApi, contactsApi, reportsApi, instancesApi } from "./api";

// ==================== THEME ====================
const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('zapechat_theme') !== 'light'; } catch { return true; }
  });
  const toggle = () => { setDark(d => { localStorage.setItem('zapechat_theme', !d ? 'dark' : 'light'); return !d; }); };
  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>;
}

// ==================== COLORS ====================
const getStyles = (dark) => dark ? {
  bg:"#0a0f1a",bgCard:"#111827",bgCardHover:"#1a2236",bgSidebar:"#0d1220",bgInput:"#1a2236",
  border:"#1e293b",borderHover:"#334155",text:"#f1f5f9",textSecondary:"#94a3b8",textMuted:"#64748b",
  accent:"#10b981",accentHover:"#059669",accentGlow:"rgba(16,185,129,0.15)",accentSoft:"rgba(16,185,129,0.1)",
  violet:"#8b5cf6",violetGlow:"rgba(139,92,246,0.15)",danger:"#ef4444",dangerSoft:"rgba(239,68,68,0.1)",
  warning:"#f59e0b",warningSoft:"rgba(245,158,11,0.1)",success:"#10b981",successSoft:"rgba(16,185,129,0.1)",
  info:"#3b82f6",infoSoft:"rgba(59,130,246,0.1)",shadow:"0 4px 24px rgba(0,0,0,0.3)",shadowLg:"0 8px 40px rgba(0,0,0,0.4)",
} : {
  bg:"#f8fafc",bgCard:"#ffffff",bgCardHover:"#f1f5f9",bgSidebar:"#ffffff",bgInput:"#f1f5f9",
  border:"#e2e8f0",borderHover:"#cbd5e1",text:"#0f172a",textSecondary:"#475569",textMuted:"#94a3b8",
  accent:"#059669",accentHover:"#047857",accentGlow:"rgba(5,150,105,0.1)",accentSoft:"rgba(5,150,105,0.08)",
  violet:"#7c3aed",violetGlow:"rgba(124,58,237,0.1)",danger:"#dc2626",dangerSoft:"rgba(220,38,38,0.08)",
  warning:"#d97706",warningSoft:"rgba(217,119,6,0.08)",success:"#059669",successSoft:"rgba(5,150,105,0.08)",
  info:"#2563eb",infoSoft:"rgba(37,99,235,0.08)",shadow:"0 4px 24px rgba(0,0,0,0.06)",shadowLg:"0 8px 40px rgba(0,0,0,0.08)",
};

// ==================== INPUT STYLE HELPER ====================
const inputStyle = (c) => ({
  width:"100%",padding:"13px 16px",background:c.bgInput,border:`1px solid ${c.border}`,
  borderRadius:"12px",color:c.text,fontSize:"15px",outline:"none",boxSizing:"border-box",fontFamily:"inherit",
});

const labelStyle = (c) => ({
  display:"block",color:c.textSecondary,fontSize:"13px",fontWeight:"600",marginBottom:"8px",letterSpacing:"0.3px",
});

const btnPrimary = (c, disabled) => ({
  padding:"14px 32px",background:disabled?c.textMuted:`linear-gradient(135deg,${c.accent},${c.violet})`,
  border:"none",borderRadius:"12px",color:"white",fontSize:"15px",fontWeight:"700",
  cursor:disabled?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:"8px",
  boxShadow:disabled?"none":`0 4px 20px ${c.accentGlow}`,
});

// ==================== STAT CARD ====================
function StatCard({icon:Icon,label,value,color,colorSoft,trend}){
  const{dark}=useTheme();const c=getStyles(dark);
  return(<div style={{background:c.bgCard,borderRadius:"16px",padding:"22px",border:`1px solid ${c.border}`,position:"relative",overflow:"hidden"}}
    onMouseEnter={e=>{e.currentTarget.style.borderColor=color+"44";e.currentTarget.style.transform="translateY(-2px)";}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor=c.border;e.currentTarget.style.transform="translateY(0)";}}>
    <div style={{position:"absolute",top:"-20px",right:"-20px",width:"80px",height:"80px",borderRadius:"50%",background:colorSoft,opacity:0.5}}/>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px"}}>
      <div style={{width:"42px",height:"42px",borderRadius:"12px",background:colorSoft,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon size={20} color={color}/></div>
      {trend&&<span style={{fontSize:"12px",fontWeight:"600",color:c.success,display:"flex",alignItems:"center",gap:"3px"}}><TrendingUp size={13}/>{trend}</span>}
    </div>
    <div style={{fontSize:"28px",fontWeight:"800",color:c.text,letterSpacing:"-0.5px",lineHeight:1,marginBottom:"6px"}}>
      {typeof value==="number"?value.toLocaleString("pt-BR"):value}
    </div>
    <div style={{fontSize:"13px",color:c.textMuted,fontWeight:"500"}}>{label}</div>
  </div>);
}

// ==================== LOGIN PAGE ====================
function LoginPage({ onLogin }) {
  const{dark,toggle}=useTheme();const c=getStyles(dark);
  const[email,setEmail]=useState("");const[password,setPassword]=useState("");
  const[loading,setLoading]=useState(false);const[error,setError]=useState("");

  const handleSubmit=async()=>{
    if(!email||!password){setError("Preencha todos os campos");return;}
    setLoading(true);setError("");
    try{
      const{data}=await authApi.login(email,password);
      localStorage.setItem('zapechat_token',data.token);
      localStorage.setItem('zapechat_user',JSON.stringify(data.user));
      onLogin(data.user);
    }catch(err){
      setError(err.response?.data?.error||"Erro ao fazer login");
    }finally{setLoading(false);}
  };

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
      background:dark?"radial-gradient(ellipse at 20% 50%,rgba(16,185,129,0.08) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(139,92,246,0.06) 0%,transparent 50%),#0a0f1a"
      :"radial-gradient(ellipse at 20% 50%,rgba(5,150,105,0.06) 0%,transparent 50%),#f8fafc",
      padding:"20px",fontFamily:"'Segoe UI',-apple-system,sans-serif"}}>
      <button onClick={toggle} style={{position:"absolute",top:"24px",right:"24px",background:c.bgCard,border:`1px solid ${c.border}`,borderRadius:"12px",padding:"10px",cursor:"pointer",color:c.textSecondary,display:"flex"}}>
        {dark?<Sun size={18}/>:<Moon size={18}/>}
      </button>
      <div style={{width:"100%",maxWidth:"420px"}}>
        <div style={{textAlign:"center",marginBottom:"40px"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:"12px",marginBottom:"12px"}}>
            <div style={{width:"52px",height:"52px",borderRadius:"16px",background:`linear-gradient(135deg,${c.accent},${c.violet})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 8px 32px ${c.accentGlow}`}}>
              <Zap size={26} color="white" strokeWidth={2.5}/>
            </div>
            <span style={{fontSize:"32px",fontWeight:"800",color:c.text}}>Zapê<span style={{color:c.accent}}>Chat</span></span>
          </div>
          <p style={{color:c.textMuted,fontSize:"15px",margin:0}}>Disparos inteligentes via WhatsApp</p>
        </div>
        <div style={{background:c.bgCard,borderRadius:"20px",padding:"36px",border:`1px solid ${c.border}`,boxShadow:c.shadowLg}}>
          <h2 style={{color:c.text,fontSize:"22px",fontWeight:"700",marginBottom:"6px",marginTop:0}}>Bem-vindo de volta</h2>
          <p style={{color:c.textMuted,fontSize:"14px",marginBottom:"28px",marginTop:0}}>Entre na sua conta para continuar</p>
          {error&&<div style={{background:c.dangerSoft,border:`1px solid ${c.danger}33`,borderRadius:"12px",padding:"12px 16px",marginBottom:"20px",display:"flex",alignItems:"center",gap:"10px",color:c.danger,fontSize:"13px"}}><AlertCircle size={16}/>{error}</div>}
          <div style={{marginBottom:"18px"}}>
            <label style={labelStyle(c)}>E-MAIL</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" style={inputStyle(c)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/>
          </div>
          <div style={{marginBottom:"28px"}}>
            <label style={labelStyle(c)}>SENHA</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={inputStyle(c)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/>
          </div>
          <button onClick={handleSubmit} disabled={loading} style={{...btnPrimary(c,loading),width:"100%",justifyContent:"center"}}>
            {loading?<RefreshCw size={18} style={{animation:"spin 1s linear infinite"}}/>:<>Entrar<ChevronRight size={18}/></>}
          </button>
        </div>
        <p style={{textAlign:"center",color:c.textMuted,fontSize:"13px",marginTop:"24px"}}>© 2026 ZapêChat</p>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} input::placeholder{color:${c.textMuted}}`}</style>
    </div>
  );
}

// ==================== SIDEBAR ====================
function Sidebar({active,onNavigate,collapsed,user}){
  const{dark,toggle}=useTheme();const c=getStyles(dark);
  const navItems=[
    {id:"dashboard",icon:BarChart3,label:"Dashboard"},
    {id:"send",icon:Send,label:"Enviar Mensagem"},
    {id:"mass",icon:Mail,label:"Disparo em Massa"},
    {id:"groups",icon:Users,label:"Grupos"},
    {id:"reports",icon:PieChart,label:"Relatórios"},
    {id:"contacts",icon:Phone,label:"Contatos"},
    {id:"settings",icon:Settings,label:"Configurações"},
  ];
  return(
    <div style={{width:collapsed?"72px":"260px",minHeight:"100vh",background:c.bgSidebar,borderRight:`1px solid ${c.border}`,display:"flex",flexDirection:"column",transition:"width 0.3s",flexShrink:0}}>
      <div style={{padding:collapsed?"20px 0":"20px 22px",display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:"10px",borderBottom:`1px solid ${c.border}`,minHeight:"70px"}}>
        <div style={{width:"36px",height:"36px",borderRadius:"10px",background:`linear-gradient(135deg,${c.accent},${c.violet})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Zap size={18} color="white" strokeWidth={2.5}/></div>
        {!collapsed&&<span style={{fontSize:"20px",fontWeight:"800",color:c.text}}>Zapê<span style={{color:c.accent}}>Chat</span></span>}
      </div>
      <nav style={{padding:"12px 10px",flex:1}}>
        {navItems.map(item=>{const isActive=active===item.id;return(
          <button key={item.id} onClick={()=>onNavigate(item.id)} style={{width:"100%",padding:collapsed?"12px 0":"12px 14px",display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:"12px",background:isActive?c.accentSoft:"transparent",border:"none",borderRadius:"10px",cursor:"pointer",color:isActive?c.accent:c.textSecondary,fontSize:"14px",fontWeight:isActive?"600":"500",marginBottom:"4px",position:"relative"}}
            onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background=c.bgCardHover;}} onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background="transparent";}}>
            {isActive&&<div style={{position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",width:"3px",height:"24px",borderRadius:"4px",background:c.accent}}/>}
            <item.icon size={20}/>{!collapsed&&item.label}
          </button>);
        })}
      </nav>
      <div style={{padding:"12px 10px",borderTop:`1px solid ${c.border}`}}>
        <button onClick={toggle} style={{width:"100%",padding:collapsed?"12px 0":"12px 14px",display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:"12px",background:"transparent",border:"none",borderRadius:"10px",cursor:"pointer",color:c.textSecondary,fontSize:"14px",fontWeight:"500"}}
          onMouseEnter={e=>e.currentTarget.style.background=c.bgCardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          {dark?<Sun size={20}/>:<Moon size={20}/>}{!collapsed&&(dark?"Modo Claro":"Modo Escuro")}
        </button>
        <button onClick={()=>onNavigate("logout")} style={{width:"100%",padding:collapsed?"12px 0":"12px 14px",display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:"12px",background:"transparent",border:"none",borderRadius:"10px",cursor:"pointer",color:c.danger,fontSize:"14px",fontWeight:"500"}}
          onMouseEnter={e=>e.currentTarget.style.background=c.dangerSoft} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <LogOut size={20}/>{!collapsed&&"Sair"}
        </button>
      </div>
    </div>
  );
}

// ==================== HEADER ====================
function Header({title,subtitle,user,onToggleSidebar}){
  const{dark}=useTheme();const c=getStyles(dark);
  return(<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 28px",borderBottom:`1px solid ${c.border}`,background:c.bgCard}}>
    <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
      <button onClick={onToggleSidebar} style={{background:"transparent",border:"none",cursor:"pointer",color:c.textSecondary,padding:"6px",borderRadius:"8px",display:"flex"}}><Menu size={20}/></button>
      <div><h1 style={{margin:0,fontSize:"22px",fontWeight:"700",color:c.text}}>{title}</h1>{subtitle&&<p style={{margin:"2px 0 0",fontSize:"13px",color:c.textMuted}}>{subtitle}</p>}</div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
      <span style={{fontSize:"14px",color:c.textSecondary}}>{user?.name}</span>
      <div style={{width:"36px",height:"36px",borderRadius:"10px",background:`linear-gradient(135deg,${c.accent},${c.violet})`,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:"14px",fontWeight:"700"}}>{user?.name?.charAt(0).toUpperCase()||"U"}</div>
    </div>
  </div>);
}

// ==================== DASHBOARD ====================
function DashboardPage(){
  const{dark}=useTheme();const c=getStyles(dark);
  const[stats,setStats]=useState(null);const[messages,setMessages]=useState([]);const[loading,setLoading]=useState(true);

  useEffect(()=>{
    const load=async()=>{
      try{
        const[dashRes,msgRes]=await Promise.all([reportsApi.dashboard(),messagesApi.history({limit:5})]);
        setStats(dashRes.data);setMessages(msgRes.data.messages||[]);
      }catch(err){console.error("Erro dashboard:",err);}finally{setLoading(false);}
    };load();
  },[]);

  if(loading)return<div style={{padding:"40px",textAlign:"center",color:c.textMuted}}>Carregando...</div>;

  const total=stats?.total||{};const today=stats?.today||{};
  const statusLabel=s=>({read:"Lida",delivered:"Entregue",sent:"Enviada",failed:"Falhou",pending:"Pendente"}[s]||s);
  const statusColor=s=>({read:c.info,delivered:c.success,sent:c.textMuted,failed:c.danger,pending:c.warning}[s]||c.textMuted);
  const statusBg=s=>({read:c.infoSoft,delivered:c.successSoft,sent:c.bgInput,failed:c.dangerSoft,pending:c.warningSoft}[s]||c.bgInput);

  return(<div style={{padding:"24px 28px"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"16px",marginBottom:"28px"}}>
      <StatCard icon={Send} label="Enviadas (total)" value={parseInt(total.total_sent)||0} color={c.accent} colorSoft={c.accentSoft}/>
      <StatCard icon={CheckCircle} label="Entregues" value={parseInt(total.total_delivered)||0} color={c.info} colorSoft={c.infoSoft}/>
      <StatCard icon={Eye} label="Lidas" value={parseInt(total.total_read)||0} color={c.violet} colorSoft={c.violetGlow}/>
      <StatCard icon={AlertCircle} label="Falharam" value={parseInt(total.total_failed)||0} color={c.danger} colorSoft={c.dangerSoft}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"28px"}}>
      <div style={{background:c.bgCard,borderRadius:"16px",padding:"24px",border:`1px solid ${c.border}`}}>
        <h3 style={{margin:"0 0 20px",fontSize:"16px",fontWeight:"700",color:c.text}}>Hoje</h3>
        {[{l:"Enviadas hoje",v:today.sent_today,color:c.accent},{l:"Entregues",v:today.delivered_today,color:c.info},{l:"Lidas",v:today.read_today,color:c.violet},{l:"Falhas",v:today.failed_today,color:c.danger}].map((item,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<3?`1px solid ${c.border}`:"none"}}>
            <span style={{fontSize:"14px",color:c.textSecondary}}>{item.l}</span>
            <span style={{fontSize:"16px",fontWeight:"700",color:c.text}}>{parseInt(item.v)||0}</span>
          </div>
        ))}
      </div>
      <div style={{background:c.bgCard,borderRadius:"16px",padding:"24px",border:`1px solid ${c.border}`}}>
        <h3 style={{margin:"0 0 20px",fontSize:"16px",fontWeight:"700",color:c.text}}>Resumo</h3>
        {[{icon:Phone,l:"Contatos",v:stats?.contacts||0,color:c.info},{icon:Users,l:"Grupos",v:stats?.groups||0,color:c.violet},{icon:Mail,l:"Campanhas",v:stats?.campaigns||0,color:c.accent},{icon:Zap,l:"Disparos Ativos",v:stats?.activeCampaigns||0,color:c.warning}].map((item,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<3?`1px solid ${c.border}`:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px"}}><item.icon size={16} color={item.color}/><span style={{fontSize:"14px",color:c.textSecondary}}>{item.l}</span></div>
            <span style={{fontSize:"16px",fontWeight:"700",color:c.text}}>{item.v}</span>
          </div>
        ))}
      </div>
    </div>
    <div style={{background:c.bgCard,borderRadius:"16px",padding:"24px",border:`1px solid ${c.border}`}}>
      <h3 style={{margin:"0 0 18px",fontSize:"16px",fontWeight:"700",color:c.text}}>Mensagens Recentes</h3>
      {messages.length===0?<p style={{color:c.textMuted,fontSize:"14px"}}>Nenhuma mensagem enviada ainda</p>:
      <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>
        {["Telefone","Mensagem","Status","Data"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 14px",fontSize:"12px",fontWeight:"600",color:c.textMuted,textTransform:"uppercase",borderBottom:`1px solid ${c.border}`}}>{h}</th>)}
      </tr></thead><tbody>
        {messages.map(msg=><tr key={msg.id} style={{cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=c.bgCardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <td style={{padding:"12px 14px",fontSize:"14px",fontWeight:"600",color:c.text,fontFamily:"monospace"}}>{msg.phone}</td>
          <td style={{padding:"12px 14px",fontSize:"14px",color:c.textSecondary,maxWidth:"250px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{msg.message_text}</td>
          <td style={{padding:"12px 14px"}}><span style={{fontSize:"12px",fontWeight:"600",padding:"4px 10px",borderRadius:"6px",background:statusBg(msg.status),color:statusColor(msg.status)}}>{statusLabel(msg.status)}</span></td>
          <td style={{padding:"12px 14px",fontSize:"13px",color:c.textMuted}}>{msg.created_at?new Date(msg.created_at).toLocaleString("pt-BR"):""}</td>
        </tr>)}
      </tbody></table>}
    </div>
  </div>);
}

// ==================== SEND MESSAGE ====================
function SendMessagePage(){
  const{dark}=useTheme();const c=getStyles(dark);
  const[number,setNumber]=useState("");const[message,setMessage]=useState("");const[delay,setDelay]=useState("1000");
  const[sending,setSending]=useState(false);const[result,setResult]=useState(null);

  const handleSend=async()=>{
    if(!number||!message)return;
    setSending(true);setResult(null);
    try{
      await messagesApi.sendText(number,message,{delay:parseInt(delay)});
      setResult({type:"success",msg:"Mensagem enviada com sucesso!"});setNumber("");setMessage("");
    }catch(err){
      setResult({type:"error",msg:err.response?.data?.error||"Falha ao enviar"});
    }finally{setSending(false);}
  };

  return(<div style={{padding:"24px 28px",maxWidth:"700px"}}>
    <div style={{background:c.bgCard,borderRadius:"16px",padding:"28px",border:`1px solid ${c.border}`}}>
      <h3 style={{margin:"0 0 6px",fontSize:"18px",fontWeight:"700",color:c.text}}>Enviar Mensagem Individual</h3>
      <p style={{margin:"0 0 24px",fontSize:"13px",color:c.textMuted}}>Envie uma mensagem de texto para um contato via WhatsApp</p>
      {result&&<div style={{background:result.type==="success"?c.successSoft:c.dangerSoft,border:`1px solid ${result.type==="success"?c.success:c.danger}33`,borderRadius:"12px",padding:"14px 16px",marginBottom:"20px",display:"flex",alignItems:"center",gap:"10px",color:result.type==="success"?c.success:c.danger,fontSize:"14px",fontWeight:"600"}}>
        {result.type==="success"?<CheckCircle size={18}/>:<AlertCircle size={18}/>}{result.msg}
      </div>}
      <div style={{marginBottom:"18px"}}><label style={labelStyle(c)}>NÚMERO DO WHATSAPP</label><input value={number} onChange={e=>setNumber(e.target.value)} placeholder="5511999887766" style={inputStyle(c)}/><span style={{fontSize:"12px",color:c.textMuted,marginTop:"4px",display:"block"}}>Com código do país, sem + ou espaços</span></div>
      <div style={{marginBottom:"18px"}}><label style={labelStyle(c)}>MENSAGEM</label><textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Digite sua mensagem..." rows={5} style={{...inputStyle(c),resize:"vertical"}}/><span style={{fontSize:"12px",color:c.textMuted,textAlign:"right",display:"block",marginTop:"4px"}}>{message.length} caracteres</span></div>
      <div style={{marginBottom:"24px"}}><label style={labelStyle(c)}>DELAY (ms)</label><input value={delay} onChange={e=>setDelay(e.target.value)} type="number" style={{...inputStyle(c),width:"160px"}}/></div>
      <button onClick={handleSend} disabled={sending||!number||!message} style={btnPrimary(c,sending||!number||!message)}>
        {sending?<RefreshCw size={18} style={{animation:"spin 1s linear infinite"}}/>:<Send size={18}/>}{sending?"Enviando...":"Enviar Mensagem"}
      </button>
    </div>
  </div>);
}

// ==================== MASS SEND ====================
function MassSendPage(){
  const{dark}=useTheme();const c=getStyles(dark);
  const[numbers,setNumbers]=useState("");const[message,setMessage]=useState("");const[interval_,setInterval_]=useState("3");
  const[campaignName,setCampaignName]=useState("");const[running,setRunning]=useState(false);const[result,setResult]=useState(null);

  const startCampaign=async()=>{
    const nums=numbers.split("\n").filter(n=>n.trim());
    if(!nums.length||!message||!campaignName)return;
    setRunning(true);setResult(null);
    try{
      const{data:campaign}=await campaignsApi.create({name:campaignName,message,recipients:nums.map(n=>({phone:n.trim()})),interval_ms:parseInt(interval_)*1000});
      await campaignsApi.start(campaign.campaign.id);
      setResult({type:"success",msg:`Disparo iniciado! ${nums.length} mensagens sendo enviadas.`});
    }catch(err){
      setResult({type:"error",msg:err.response?.data?.error||"Falha ao iniciar disparo"});
    }finally{setRunning(false);}
  };

  return(<div style={{padding:"24px 28px",maxWidth:"800px"}}>
    <div style={{background:c.bgCard,borderRadius:"16px",padding:"28px",border:`1px solid ${c.border}`}}>
      <h3 style={{margin:"0 0 6px",fontSize:"18px",fontWeight:"700",color:c.text}}>Disparo em Massa</h3>
      <p style={{margin:"0 0 24px",fontSize:"13px",color:c.textMuted}}>Envie a mesma mensagem para múltiplos contatos</p>
      <div style={{background:c.warningSoft,border:`1px solid ${c.warning}33`,borderRadius:"12px",padding:"14px 16px",marginBottom:"22px",display:"flex",alignItems:"flex-start",gap:"10px",color:c.warning,fontSize:"13px"}}>
        <AlertCircle size={18} style={{flexShrink:0,marginTop:"1px"}}/><div><strong>Atenção:</strong> Use intervalos de pelo menos 3 segundos para evitar bloqueio.</div>
      </div>
      {result&&<div style={{background:result.type==="success"?c.successSoft:c.dangerSoft,borderRadius:"12px",padding:"14px 16px",marginBottom:"20px",color:result.type==="success"?c.success:c.danger,fontSize:"14px",fontWeight:"600",display:"flex",alignItems:"center",gap:"8px"}}>
        {result.type==="success"?<CheckCircle size={18}/>:<AlertCircle size={18}/>}{result.msg}
      </div>}
      <div style={{marginBottom:"18px"}}><label style={labelStyle(c)}>NOME DA CAMPANHA</label><input value={campaignName} onChange={e=>setCampaignName(e.target.value)} placeholder="Ex: Promoção Março" style={inputStyle(c)}/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"18px",marginBottom:"18px"}}>
        <div><label style={labelStyle(c)}>NÚMEROS (um por linha)</label><textarea value={numbers} onChange={e=>setNumbers(e.target.value)} placeholder={"5511999887766\n5511988776655"} rows={8} style={{...inputStyle(c),fontFamily:"monospace",fontSize:"14px",resize:"vertical"}}/><span style={{fontSize:"12px",color:c.textMuted}}>{numbers.split("\n").filter(n=>n.trim()).length} contatos</span></div>
        <div><label style={labelStyle(c)}>MENSAGEM</label><textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Sua mensagem aqui..." rows={8} style={{...inputStyle(c),resize:"vertical",fontSize:"14px"}}/></div>
      </div>
      <div style={{marginBottom:"24px"}}><label style={labelStyle(c)}>INTERVALO (segundos)</label><input value={interval_} onChange={e=>setInterval_(e.target.value)} type="number" min="1" style={{...inputStyle(c),width:"160px"}}/></div>
      <button onClick={startCampaign} disabled={running||!numbers.trim()||!message||!campaignName} style={btnPrimary(c,running||!numbers.trim()||!message||!campaignName)}>
        {running?<Pause size={18}/>:<Play size={18}/>}{running?"Enviando...":"Iniciar Disparo"}
      </button>
    </div>
  </div>);
}

// ==================== GROUPS ====================
function GroupsPage(){
  const{dark}=useTheme();const c=getStyles(dark);
  const[groups,setGroups]=useState([]);const[selected,setSelected]=useState(null);const[msgText,setMsgText]=useState("");
  const[loading,setLoading]=useState(true);const[syncing,setSyncing]=useState(false);const[sendResult,setSendResult]=useState(null);const[sending,setSending]=useState(false);

  const loadGroups=async()=>{try{const{data}=await groupsApi.list();setGroups(data.groups||[]);}catch(err){console.error(err);}finally{setLoading(false);}};
  const syncGroups=async()=>{setSyncing(true);try{await groupsApi.sync();await loadGroups();}catch(err){console.error(err);}finally{setSyncing(false);}};
  const sendToGroup=async()=>{
    if(!selected||!msgText)return;setSending(true);setSendResult(null);
    try{await groupsApi.send(selected.group_jid,msgText);setSendResult({type:"success",msg:"Enviada!"});setMsgText("");}
    catch(err){setSendResult({type:"error",msg:err.response?.data?.error||"Falha"});}finally{setSending(false);}
  };
  useEffect(()=>{loadGroups();},[]);

  return(<div style={{padding:"24px 28px"}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
      <div style={{background:c.bgCard,borderRadius:"16px",padding:"24px",border:`1px solid ${c.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"18px"}}>
          <h3 style={{margin:0,fontSize:"16px",fontWeight:"700",color:c.text}}>Seus Grupos</h3>
          <button onClick={syncGroups} disabled={syncing} style={{background:c.accentSoft,border:"none",borderRadius:"8px",padding:"6px 12px",color:c.accent,fontSize:"13px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"}}>
            <RefreshCw size={13} style={syncing?{animation:"spin 1s linear infinite"}:{}}/>{syncing?"Sincronizando...":"Sincronizar"}
          </button>
        </div>
        {loading?<p style={{color:c.textMuted}}>Carregando...</p>:groups.length===0?<p style={{color:c.textMuted,fontSize:"14px"}}>Nenhum grupo. Clique em Sincronizar para buscar da Evolution API.</p>:
        groups.map(group=>(
          <div key={group.id} onClick={()=>{setSelected(group);setSendResult(null);}} style={{padding:"14px 16px",borderRadius:"12px",marginBottom:"6px",cursor:"pointer",background:selected?.id===group.id?c.accentSoft:"transparent",border:`1px solid ${selected?.id===group.id?c.accent+"33":"transparent"}`}}
            onMouseEnter={e=>{if(selected?.id!==group.id)e.currentTarget.style.background=c.bgCardHover;}} onMouseLeave={e=>{if(selected?.id!==group.id)e.currentTarget.style.background="transparent";}}>
            <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
              <div style={{width:"40px",height:"40px",borderRadius:"10px",background:c.violetGlow,display:"flex",alignItems:"center",justifyContent:"center"}}><Hash size={18} color={c.violet}/></div>
              <div><div style={{fontSize:"14px",fontWeight:"600",color:c.text}}>{group.name||group.group_jid}</div><div style={{fontSize:"12px",color:c.textMuted}}>{group.member_count||0} membros</div></div>
            </div>
          </div>
        ))}
      </div>
      <div style={{background:c.bgCard,borderRadius:"16px",padding:"24px",border:`1px solid ${c.border}`}}>
        <h3 style={{margin:"0 0 18px",fontSize:"16px",fontWeight:"700",color:c.text}}>Enviar para Grupo</h3>
        {selected?<>
          <div style={{background:c.bgInput,borderRadius:"12px",padding:"14px 16px",marginBottom:"18px",display:"flex",alignItems:"center",gap:"12px"}}>
            <Hash size={18} color={c.violet}/><div><div style={{fontSize:"14px",fontWeight:"600",color:c.text}}>{selected.name||selected.group_jid}</div><div style={{fontSize:"12px",color:c.textMuted}}>{selected.member_count||0} membros</div></div>
          </div>
          {sendResult&&<div style={{background:sendResult.type==="success"?c.successSoft:c.dangerSoft,borderRadius:"12px",padding:"12px",marginBottom:"14px",color:sendResult.type==="success"?c.success:c.danger,fontSize:"13px",fontWeight:"600"}}>{sendResult.msg}</div>}
          <div style={{marginBottom:"18px"}}><label style={labelStyle(c)}>MENSAGEM</label><textarea value={msgText} onChange={e=>setMsgText(e.target.value)} placeholder="Mensagem para o grupo..." rows={6} style={{...inputStyle(c),resize:"vertical"}}/></div>
          <button onClick={sendToGroup} disabled={sending||!msgText} style={btnPrimary(c,sending||!msgText)}><Send size={18}/>{sending?"Enviando...":"Enviar para Grupo"}</button>
        </>:<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px",color:c.textMuted,textAlign:"center"}}><Users size={40} style={{marginBottom:"14px",opacity:0.3}}/><p style={{fontSize:"14px",margin:0}}>Selecione um grupo na lista</p></div>}
      </div>
    </div>
  </div>);
}

// ==================== REPORTS ====================
function ReportsPage(){
  const{dark}=useTheme();const c=getStyles(dark);
  const[period,setPeriod]=useState("week");const[data,setData]=useState([]);const[campaigns,setCampaigns]=useState([]);const[topGroups,setTopGroups]=useState([]);const[loading,setLoading]=useState(true);

  useEffect(()=>{
    const load=async()=>{setLoading(true);try{
      const[periodRes,campRes,groupRes]=await Promise.all([reportsApi.messagesByPeriod(period),reportsApi.campaignStats(),reportsApi.topGroups()]);
      setData(periodRes.data.data||[]);setCampaigns(campRes.data.campaigns||[]);setTopGroups(groupRes.data.groups||[]);
    }catch(err){console.error(err);}finally{setLoading(false);}};load();
  },[period]);

  const exportExcel=async()=>{try{const res=await reportsApi.exportExcel();const url=window.URL.createObjectURL(new Blob([res.data]));const a=document.createElement('a');a.href=url;a.download=`relatorio-${Date.now()}.xlsx`;a.click();}catch(err){alert("Erro ao exportar");}};
  const exportPdf=async()=>{try{const res=await reportsApi.exportPdf();const url=window.URL.createObjectURL(new Blob([res.data]));const a=document.createElement('a');a.href=url;a.download=`relatorio-${Date.now()}.pdf`;a.click();}catch(err){alert("Erro ao exportar");}};

  const statusStyle=s=>({completed:{bg:c.successSoft,color:c.success,l:"Concluída"},running:{bg:c.warningSoft,color:c.warning,l:"Em andamento"},scheduled:{bg:c.infoSoft,color:c.info,l:"Agendada"},draft:{bg:c.bgInput,color:c.textMuted,l:"Rascunho"},paused:{bg:c.warningSoft,color:c.warning,l:"Pausada"}}[s]||{bg:c.bgInput,color:c.textMuted,l:s});

  if(loading)return<div style={{padding:"40px",textAlign:"center",color:c.textMuted}}>Carregando...</div>;

  return(<div style={{padding:"24px 28px"}}>
    <div style={{display:"flex",gap:"8px",marginBottom:"24px"}}>
      {[{id:"day",l:"Hoje"},{id:"week",l:"Semana"},{id:"month",l:"Mês"}].map(p=>(
        <button key={p.id} onClick={()=>setPeriod(p.id)} style={{padding:"8px 18px",borderRadius:"8px",border:"none",background:period===p.id?c.accent:c.bgInput,color:period===p.id?"white":c.textSecondary,fontSize:"13px",fontWeight:"600",cursor:"pointer"}}>{p.l}</button>
      ))}
      <div style={{flex:1}}/>
      <button onClick={exportExcel} style={{padding:"8px 14px",background:c.bgInput,border:`1px solid ${c.border}`,borderRadius:"8px",color:c.accent,fontSize:"13px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"}}><Download size={13}/>Excel</button>
      <button onClick={exportPdf} style={{padding:"8px 14px",background:c.bgInput,border:`1px solid ${c.border}`,borderRadius:"8px",color:c.danger,fontSize:"13px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"}}><Download size={13}/>PDF</button>
    </div>
    {campaigns.length>0&&<div style={{background:c.bgCard,borderRadius:"16px",padding:"24px",border:`1px solid ${c.border}`,marginBottom:"24px"}}>
      <h3 style={{margin:"0 0 18px",fontSize:"16px",fontWeight:"700",color:c.text}}>Campanhas</h3>
      <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Campanha","Enviadas","Entregues","Lidas","Falhas","Status"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 14px",fontSize:"12px",fontWeight:"600",color:c.textMuted,textTransform:"uppercase",borderBottom:`1px solid ${c.border}`}}>{h}</th>)}</tr></thead><tbody>
        {campaigns.map(camp=>{const st=statusStyle(camp.status);return<tr key={camp.id}><td style={{padding:"14px",fontSize:"14px",fontWeight:"600",color:c.text}}>{camp.name}</td><td style={{padding:"14px",color:c.textSecondary}}>{camp.sent_count}</td><td style={{padding:"14px",color:c.textSecondary}}>{camp.delivered_count}</td><td style={{padding:"14px",color:c.textSecondary}}>{camp.read_count}</td><td style={{padding:"14px",color:c.textSecondary}}>{camp.failed_count}</td><td style={{padding:"14px"}}><span style={{fontSize:"12px",fontWeight:"600",padding:"4px 10px",borderRadius:"6px",background:st.bg,color:st.color}}>{st.l}</span></td></tr>;})}
      </tbody></table>
    </div>}
    {topGroups.length>0&&<div style={{background:c.bgCard,borderRadius:"16px",padding:"24px",border:`1px solid ${c.border}`}}>
      <h3 style={{margin:"0 0 18px",fontSize:"16px",fontWeight:"700",color:c.text}}>Ranking de Grupos</h3>
      {topGroups.map((g,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:i<topGroups.length-1?`1px solid ${c.border}`:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}><span style={{width:"28px",height:"28px",borderRadius:"8px",background:i===0?c.warningSoft:c.bgInput,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"700",color:i===0?c.warning:c.textMuted}}>{i+1}</span><span style={{fontSize:"14px",fontWeight:"600",color:c.text}}>{g.name||g.group_jid}</span></div>
        <span style={{fontSize:"14px",color:c.textMuted}}>{g.message_count||0} msgs</span>
      </div>)}
    </div>}
  </div>);
}

// ==================== CONTACTS ====================
function ContactsPage(){
  const{dark}=useTheme();const c=getStyles(dark);
  const[contacts,setContacts]=useState([]);const[search,setSearch]=useState("");const[loading,setLoading]=useState(true);

  const load=async(s)=>{try{const{data}=await contactsApi.list({search:s,limit:50});setContacts(data.contacts||[]);}catch(err){console.error(err);}finally{setLoading(false);}};
  useEffect(()=>{load(search);},[search]);

  const importCsv=async(e)=>{
    const file=e.target.files[0];if(!file)return;
    try{const{data}=await contactsApi.importCsv(file);alert(`Importados: ${data.imported}, Ignorados: ${data.skipped}`);load(search);}catch(err){alert("Erro ao importar");}
  };

  return(<div style={{padding:"24px 28px",maxWidth:"700px"}}>
    <div style={{background:c.bgCard,borderRadius:"16px",padding:"24px",border:`1px solid ${c.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"18px"}}>
        <h3 style={{margin:0,fontSize:"16px",fontWeight:"700",color:c.text}}>Contatos</h3>
        <label style={{background:c.accentSoft,border:"none",borderRadius:"8px",padding:"8px 14px",color:c.accent,fontSize:"13px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"}}>
          <Upload size={13}/>Importar CSV<input type="file" accept=".csv" onChange={importCsv} style={{display:"none"}}/>
        </label>
      </div>
      <div style={{position:"relative",marginBottom:"18px"}}><Search size={16} color={c.textMuted} style={{position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)"}}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar contatos..." style={{...inputStyle(c),paddingLeft:"40px"}}/></div>
      {loading?<p style={{color:c.textMuted}}>Carregando...</p>:contacts.length===0?<p style={{color:c.textMuted,fontSize:"14px"}}>Nenhum contato encontrado</p>:
      contacts.map(ct=><div key={ct.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",borderRadius:"12px",marginBottom:"4px"}}
        onMouseEnter={e=>e.currentTarget.style.background=c.bgCardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"40px",height:"40px",borderRadius:"50%",background:`linear-gradient(135deg,${c.accent}44,${c.violet}44)`,display:"flex",alignItems:"center",justifyContent:"center",color:c.accent,fontSize:"15px",fontWeight:"700"}}>{(ct.name||ct.phone).charAt(0).toUpperCase()}</div>
          <div><div style={{fontSize:"14px",fontWeight:"600",color:c.text}}>{ct.name||"Sem nome"}</div><div style={{fontSize:"12px",color:c.textMuted,fontFamily:"monospace"}}>{ct.phone}</div></div>
        </div>
      </div>)}
    </div>
  </div>);
}

// ==================== SETTINGS ====================
function SettingsPage({user,onProfileUpdate}){
  const{dark}=useTheme();const c=getStyles(dark);
  const[apiUrl,setApiUrl]=useState(user?.evolution_api_url||"");
  const[apiKey,setApiKey]=useState(user?.evolution_api_key||"");
  const[instance,setInstance]=useState(user?.evolution_instance||"");
  const[saving,setSaving]=useState(false);const[result,setResult]=useState(null);const[testing,setTesting]=useState(false);const[testResult,setTestResult]=useState(null);

  const save=async()=>{
    setSaving(true);setResult(null);
    try{
      const{data}=await authApi.updateProfile({evolution_api_url:apiUrl,evolution_api_key:apiKey,evolution_instance:instance});
      setResult({type:"success",msg:"Configurações salvas!"});
      if(onProfileUpdate)onProfileUpdate(data.user);
    }catch(err){setResult({type:"error",msg:err.response?.data?.error||"Erro ao salvar"});}finally{setSaving(false);}
  };

  const testConnection=async()=>{
    setTesting(true);setTestResult(null);
    try{
      const{data}=await instancesApi.status(instance);
      const state=data.status?.instance?.state||"unknown";
      setTestResult({type:state==="open"?"success":"warning",msg:state==="open"?"Conectado ao WhatsApp!":(`Status: ${state}. Pode ser necessário escanear o QR Code.`)});
    }catch(err){setTestResult({type:"error",msg:"Falha na conexão. Verifique a URL e API Key."});}finally{setTesting(false);}
  };

  return(<div style={{padding:"24px 28px",maxWidth:"700px"}}>
    <div style={{background:c.bgCard,borderRadius:"16px",padding:"28px",border:`1px solid ${c.border}`}}>
      <h3 style={{margin:"0 0 6px",fontSize:"18px",fontWeight:"700",color:c.text}}>Conexão Evolution API</h3>
      <p style={{margin:"0 0 24px",fontSize:"13px",color:c.textMuted}}>Configure a conexão com seu servidor Evolution API v2</p>
      {result&&<div style={{background:result.type==="success"?c.successSoft:c.dangerSoft,borderRadius:"12px",padding:"12px 16px",marginBottom:"18px",color:result.type==="success"?c.success:c.danger,fontSize:"14px",fontWeight:"600"}}>{result.msg}</div>}
      {testResult&&<div style={{background:testResult.type==="success"?c.successSoft:testResult.type==="warning"?c.warningSoft:c.dangerSoft,borderRadius:"12px",padding:"12px 16px",marginBottom:"18px",color:testResult.type==="success"?c.success:testResult.type==="warning"?c.warning:c.danger,fontSize:"14px",fontWeight:"600"}}>{testResult.msg}</div>}
      <div style={{marginBottom:"18px"}}><label style={labelStyle(c)}>URL DO SERVIDOR</label><input value={apiUrl} onChange={e=>setApiUrl(e.target.value)} placeholder="https://api.seuservidor.com" style={inputStyle(c)}/></div>
      <div style={{marginBottom:"18px"}}><label style={labelStyle(c)}>API KEY</label><input value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="Sua chave de API" type="password" style={inputStyle(c)}/></div>
      <div style={{marginBottom:"24px"}}><label style={labelStyle(c)}>NOME DA INSTÂNCIA</label><input value={instance} onChange={e=>setInstance(e.target.value)} placeholder="nome-da-instancia" style={inputStyle(c)}/></div>
      <div style={{display:"flex",gap:"12px"}}>
        <button onClick={save} disabled={saving} style={btnPrimary(c,saving)}>{saving?"Salvando...":"Salvar Configurações"}</button>
        <button onClick={testConnection} disabled={testing||!instance} style={{padding:"14px 28px",background:c.bgInput,border:`1px solid ${c.border}`,borderRadius:"12px",color:c.text,fontSize:"15px",fontWeight:"600",cursor:testing?"wait":"pointer",display:"flex",alignItems:"center",gap:"8px"}}>
          <Globe size={16}/>{testing?"Testando...":"Testar Conexão"}
        </button>
      </div>
    </div>
  </div>);
}

// ==================== MAIN APP ====================
function MainContent({page,user,onToggleSidebar,onProfileUpdate}){
  const{dark}=useTheme();const c=getStyles(dark);
  const titles={dashboard:["Dashboard","Visão geral do ZapêChat"],send:["Enviar Mensagem","Envio individual via WhatsApp"],mass:["Disparo em Massa","Envie para múltiplos contatos"],groups:["Grupos","Gerencie e envie para grupos"],reports:["Relatórios","Analise seus disparos"],contacts:["Contatos","Gerencie sua lista"],settings:["Configurações","Configure sua integração"]};
  return(<div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
    <div style={{flex:1,background:c.bg,minHeight:"100vh"}}>
      <Header title={titles[page]?.[0]||""} subtitle={titles[page]?.[1]||""} user={user} onToggleSidebar={onToggleSidebar}/>
      {page==="dashboard"&&<DashboardPage/>}
      {page==="send"&&<SendMessagePage/>}
      {page==="mass"&&<MassSendPage/>}
      {page==="groups"&&<GroupsPage/>}
      {page==="reports"&&<ReportsPage/>}
      {page==="contacts"&&<ContactsPage/>}
      {page==="settings"&&<SettingsPage user={user} onProfileUpdate={onProfileUpdate}/>}
    </div>
  </div>);
}

function App(){
  const[user,setUser]=useState(()=>{try{const u=localStorage.getItem('zapechat_user');return u?JSON.parse(u):null;}catch{return null;}});
  const[page,setPage]=useState("dashboard");const[sidebarCollapsed,setSidebarCollapsed]=useState(false);

  // Verify token on mount
  useEffect(()=>{
    const token=localStorage.getItem('zapechat_token');
    if(token&&user){
      authApi.me().then(({data})=>{setUser(data.user);localStorage.setItem('zapechat_user',JSON.stringify(data.user));}).catch(()=>{setUser(null);localStorage.removeItem('zapechat_token');localStorage.removeItem('zapechat_user');});
    }
  },[]);

  const handleNavigate=(id)=>{
    if(id==="logout"){setUser(null);localStorage.removeItem('zapechat_token');localStorage.removeItem('zapechat_user');return;}
    setPage(id);
  };

  const handleProfileUpdate=(updatedUser)=>{setUser(prev=>({...prev,...updatedUser}));localStorage.setItem('zapechat_user',JSON.stringify({...user,...updatedUser}));};

  if(!user)return<ThemeProvider><LoginPage onLogin={(u)=>{setUser(u);}}/></ThemeProvider>;

  return(<ThemeProvider>
    <div style={{display:"flex",minHeight:"100vh",fontFamily:"'Segoe UI',-apple-system,sans-serif"}}>
      <Sidebar active={page} onNavigate={handleNavigate} collapsed={sidebarCollapsed} user={user}/>
      <MainContent page={page} user={user} onToggleSidebar={()=>setSidebarCollapsed(s=>!s)} onProfileUpdate={handleProfileUpdate}/>
    </div>
    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} *{box-sizing:border-box;margin:0;padding:0} body{margin:0} ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}`}</style>
  </ThemeProvider>);
}

export default App;
