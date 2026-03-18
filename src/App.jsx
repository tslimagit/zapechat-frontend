import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import { 
  MessageSquare, Send, Users, BarChart3, LogOut, Moon, Sun, 
  Menu, X, ChevronRight, Zap, Search, Upload, Clock, 
  CheckCircle, AlertCircle, Eye, Download, Filter, 
  ArrowUpRight, TrendingUp, Mail, UserPlus, Settings,
  FileText, PieChart, Calendar, ChevronDown, Plus, Trash2,
  RefreshCw, Play, Pause, Hash, Globe, Phone, Image as ImageIcon
} from "lucide-react";

// ==================== THEME CONTEXT ====================
const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

// ==================== AUTH CONTEXT ====================
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

// ==================== THEME PROVIDER ====================
function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true);
  const toggle = () => setDark(d => !d);
  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ==================== MOCK DATA ====================
const mockStats = {
  sent: 12847,
  delivered: 11932,
  read: 9841,
  failed: 215,
  groups: 34,
  contacts: 2891,
  campaigns: 18,
  activeNow: 3
};

const mockMessages = [
  { id: 1, to: "5511999887766", text: "Promoção especial para você!", status: "read", time: "14:32", date: "2026-03-17" },
  { id: 2, to: "5511988776655", text: "Seu pedido foi confirmado", status: "delivered", time: "14:28", date: "2026-03-17" },
  { id: 3, to: "5511977665544", text: "Bem-vindo ao nosso serviço!", status: "sent", time: "14:15", date: "2026-03-17" },
  { id: 4, to: "5511966554433", text: "Lembrete: reunião amanhã às 10h", status: "failed", time: "13:55", date: "2026-03-17" },
  { id: 5, to: "5511955443322", text: "Obrigado pela sua compra!", status: "read", time: "13:40", date: "2026-03-17" },
];

const mockGroups = [
  { id: 1, name: "Clientes VIP", members: 128, lastMessage: "Promoção exclusiva!", active: true },
  { id: 2, name: "Equipe Vendas", members: 24, lastMessage: "Meta batida!", active: true },
  { id: 3, name: "Suporte Técnico", members: 56, lastMessage: "Ticket #4521 resolvido", active: false },
  { id: 4, name: "Marketing Digital", members: 42, lastMessage: "Nova campanha aprovada", active: true },
  { id: 5, name: "Parceiros", members: 89, lastMessage: "Contrato renovado", active: true },
];

const mockCampaigns = [
  { id: 1, name: "Black Friday 2026", sent: 4500, delivered: 4200, read: 3100, status: "completed", date: "2026-03-10" },
  { id: 2, name: "Boas-vindas Março", sent: 1200, delivered: 1150, read: 890, status: "completed", date: "2026-03-05" },
  { id: 3, name: "Reengajamento Q1", sent: 800, delivered: 0, read: 0, status: "running", date: "2026-03-17" },
  { id: 4, name: "Lançamento Produto X", sent: 0, delivered: 0, read: 0, status: "scheduled", date: "2026-03-20" },
];

const mockChartData = [
  { day: "Seg", sent: 1820, delivered: 1700, read: 1400 },
  { day: "Ter", sent: 2100, delivered: 1950, read: 1600 },
  { day: "Qua", sent: 1950, delivered: 1820, read: 1500 },
  { day: "Qui", sent: 2400, delivered: 2250, read: 1900 },
  { day: "Sex", sent: 2800, delivered: 2600, read: 2100 },
  { day: "Sáb", sent: 1200, delivered: 1100, read: 850 },
  { day: "Dom", sent: 577, delivered: 512, read: 391 },
];

// ==================== CSS STYLES ====================
const getStyles = (dark) => {
  const colors = dark ? {
    bg: "#0a0f1a",
    bgCard: "#111827",
    bgCardHover: "#1a2236",
    bgSidebar: "#0d1220",
    bgInput: "#1a2236",
    border: "#1e293b",
    borderHover: "#334155",
    text: "#f1f5f9",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",
    accent: "#10b981",
    accentHover: "#059669",
    accentGlow: "rgba(16, 185, 129, 0.15)",
    accentSoft: "rgba(16, 185, 129, 0.1)",
    violet: "#8b5cf6",
    violetGlow: "rgba(139, 92, 246, 0.15)",
    danger: "#ef4444",
    dangerSoft: "rgba(239, 68, 68, 0.1)",
    warning: "#f59e0b",
    warningSoft: "rgba(245, 158, 11, 0.1)",
    success: "#10b981",
    successSoft: "rgba(16, 185, 129, 0.1)",
    info: "#3b82f6",
    infoSoft: "rgba(59, 130, 246, 0.1)",
    shadow: "0 4px 24px rgba(0,0,0,0.3)",
    shadowLg: "0 8px 40px rgba(0,0,0,0.4)",
  } : {
    bg: "#f8fafc",
    bgCard: "#ffffff",
    bgCardHover: "#f1f5f9",
    bgSidebar: "#ffffff",
    bgInput: "#f1f5f9",
    border: "#e2e8f0",
    borderHover: "#cbd5e1",
    text: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#94a3b8",
    accent: "#059669",
    accentHover: "#047857",
    accentGlow: "rgba(5, 150, 105, 0.1)",
    accentSoft: "rgba(5, 150, 105, 0.08)",
    violet: "#7c3aed",
    violetGlow: "rgba(124, 58, 237, 0.1)",
    danger: "#dc2626",
    dangerSoft: "rgba(220, 38, 38, 0.08)",
    warning: "#d97706",
    warningSoft: "rgba(217, 119, 6, 0.08)",
    success: "#059669",
    successSoft: "rgba(5, 150, 105, 0.08)",
    info: "#2563eb",
    infoSoft: "rgba(37, 99, 235, 0.08)",
    shadow: "0 4px 24px rgba(0,0,0,0.06)",
    shadowLg: "0 8px 40px rgba(0,0,0,0.08)",
  };
  return colors;
};

// ==================== LOGIN PAGE ====================
function LoginPage({ onLogin }) {
  const { dark, toggle } = useTheme();
  const c = getStyles(dark);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Preencha todos os campos"); return; }
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      onLogin({ email, name: email.split("@")[0] });
    }, 1500);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: dark 
        ? "radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 50%), #0a0f1a"
        : "radial-gradient(ellipse at 20% 50%, rgba(5,150,105,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.04) 0%, transparent 50%), #f8fafc",
      padding: "20px",
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background decoration */}
      <div style={{
        position: "absolute",
        top: "-200px",
        right: "-200px",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background: dark ? "rgba(16,185,129,0.03)" : "rgba(5,150,105,0.03)",
        filter: "blur(80px)",
      }} />
      <div style={{
        position: "absolute",
        bottom: "-150px",
        left: "-150px",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: dark ? "rgba(139,92,246,0.03)" : "rgba(124,58,237,0.03)",
        filter: "blur(80px)",
      }} />

      {/* Theme toggle */}
      <button onClick={toggle} style={{
        position: "absolute",
        top: "24px",
        right: "24px",
        background: c.bgCard,
        border: `1px solid ${c.border}`,
        borderRadius: "12px",
        padding: "10px",
        cursor: "pointer",
        color: c.textSecondary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s",
        boxShadow: c.shadow,
      }}>
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div style={{
        width: "100%",
        maxWidth: "420px",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
          }}>
            <div style={{
              width: "52px",
              height: "52px",
              borderRadius: "16px",
              background: `linear-gradient(135deg, ${c.accent}, ${c.violet})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 32px ${c.accentGlow}`,
            }}>
              <Zap size={26} color="white" strokeWidth={2.5} />
            </div>
            <span style={{
              fontSize: "32px",
              fontWeight: "800",
              color: c.text,
              letterSpacing: "-0.5px",
            }}>
              Zapê<span style={{ color: c.accent }}>Chat</span>
            </span>
          </div>
          <p style={{
            color: c.textMuted,
            fontSize: "15px",
            margin: 0,
            letterSpacing: "0.3px",
          }}>
            Disparos inteligentes via WhatsApp
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: c.bgCard,
          borderRadius: "20px",
          padding: "36px",
          border: `1px solid ${c.border}`,
          boxShadow: c.shadowLg,
        }}>
          <h2 style={{
            color: c.text,
            fontSize: "22px",
            fontWeight: "700",
            marginBottom: "6px",
            marginTop: 0,
          }}>
            Bem-vindo de volta
          </h2>
          <p style={{
            color: c.textMuted,
            fontSize: "14px",
            marginBottom: "28px",
            marginTop: 0,
          }}>
            Entre na sua conta para continuar
          </p>

          {error && (
            <div style={{
              background: c.dangerSoft,
              border: `1px solid ${c.danger}33`,
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: c.danger,
              fontSize: "13px",
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div style={{ marginBottom: "18px" }}>
            <label style={{
              display: "block",
              color: c.textSecondary,
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "8px",
              letterSpacing: "0.3px",
            }}>E-MAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={{
                width: "100%",
                padding: "13px 16px",
                background: c.bgInput,
                border: `1px solid ${c.border}`,
                borderRadius: "12px",
                color: c.text,
                fontSize: "15px",
                outline: "none",
                transition: "all 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={e => { e.target.style.borderColor = c.accent; e.target.style.boxShadow = `0 0 0 3px ${c.accentGlow}`; }}
              onBlur={e => { e.target.style.borderColor = c.border; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={{
              display: "block",
              color: c.textSecondary,
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "8px",
              letterSpacing: "0.3px",
            }}>SENHA</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "13px 16px",
                background: c.bgInput,
                border: `1px solid ${c.border}`,
                borderRadius: "12px",
                color: c.text,
                fontSize: "15px",
                outline: "none",
                transition: "all 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={e => { e.target.style.borderColor = c.accent; e.target.style.boxShadow = `0 0 0 3px ${c.accentGlow}`; }}
              onBlur={e => { e.target.style.borderColor = c.border; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? c.textMuted : `linear-gradient(135deg, ${c.accent}, ${c.violet})`,
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontSize: "15px",
              fontWeight: "700",
              cursor: loading ? "wait" : "pointer",
              transition: "all 0.3s",
              boxShadow: loading ? "none" : `0 4px 20px ${c.accentGlow}`,
              letterSpacing: "0.3px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {loading ? (
              <RefreshCw size={18} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <>Entrar <ChevronRight size={18} /></>
            )}
          </button>
        </div>

        <p style={{
          textAlign: "center",
          color: c.textMuted,
          fontSize: "13px",
          marginTop: "24px",
        }}>
          © 2026 ZapêChat — Todos os direitos reservados
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder {
          color: ${c.textMuted};
        }
      `}</style>
    </div>
  );
}

// ==================== STAT CARD ====================
function StatCard({ icon: Icon, label, value, color, colorSoft, trend }) {
  const { dark } = useTheme();
  const c = getStyles(dark);
  return (
    <div style={{
      background: c.bgCard,
      borderRadius: "16px",
      padding: "22px",
      border: `1px solid ${c.border}`,
      transition: "all 0.3s",
      cursor: "default",
      position: "relative",
      overflow: "hidden",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = color + "44"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = c.shadow; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{
        position: "absolute",
        top: "-20px",
        right: "-20px",
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        background: colorSoft,
        opacity: 0.5,
      }} />
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "14px",
      }}>
        <div style={{
          width: "42px",
          height: "42px",
          borderRadius: "12px",
          background: colorSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Icon size={20} color={color} />
        </div>
        {trend && (
          <span style={{
            fontSize: "12px",
            fontWeight: "600",
            color: c.success,
            display: "flex",
            alignItems: "center",
            gap: "3px",
          }}>
            <TrendingUp size={13} /> {trend}
          </span>
        )}
      </div>
      <div style={{
        fontSize: "28px",
        fontWeight: "800",
        color: c.text,
        letterSpacing: "-0.5px",
        lineHeight: 1,
        marginBottom: "6px",
      }}>
        {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
      </div>
      <div style={{
        fontSize: "13px",
        color: c.textMuted,
        fontWeight: "500",
      }}>
        {label}
      </div>
    </div>
  );
}

// ==================== MINI CHART ====================
function MiniChart({ data, color }) {
  const { dark } = useTheme();
  const c = getStyles(dark);
  const max = Math.max(...data.map(d => d.sent));
  const barW = 100 / data.length;

  return (
    <div style={{
      display: "flex",
      alignItems: "flex-end",
      gap: "4px",
      height: "120px",
      padding: "0 4px",
    }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <div style={{
            width: "100%",
            maxWidth: "36px",
            height: `${(d.sent / max) * 90}px`,
            borderRadius: "6px 6px 2px 2px",
            background: `linear-gradient(180deg, ${c.accent}, ${c.violet}88)`,
            transition: "height 0.5s ease",
            position: "relative",
            cursor: "pointer",
            opacity: 0.85,
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "1"}
          onMouseLeave={e => e.currentTarget.style.opacity = "0.85"}
          />
          <span style={{ fontSize: "11px", color: c.textMuted, fontWeight: "500" }}>{d.day}</span>
        </div>
      ))}
    </div>
  );
}

// ==================== SIDEBAR ====================
function Sidebar({ active, onNavigate, collapsed, onCollapse, user }) {
  const { dark, toggle } = useTheme();
  const c = getStyles(dark);

  const navItems = [
    { id: "dashboard", icon: BarChart3, label: "Dashboard" },
    { id: "send", icon: Send, label: "Enviar Mensagem" },
    { id: "mass", icon: Mail, label: "Disparo em Massa" },
    { id: "groups", icon: Users, label: "Grupos" },
    { id: "reports", icon: PieChart, label: "Relatórios" },
    { id: "contacts", icon: Phone, label: "Contatos" },
    { id: "settings", icon: Settings, label: "Configurações" },
  ];

  return (
    <div style={{
      width: collapsed ? "72px" : "260px",
      minHeight: "100vh",
      background: c.bgSidebar,
      borderRight: `1px solid ${c.border}`,
      display: "flex",
      flexDirection: "column",
      transition: "width 0.3s ease",
      position: "relative",
      zIndex: 10,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? "20px 0" : "20px 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: "10px",
        borderBottom: `1px solid ${c.border}`,
        minHeight: "70px",
      }}>
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: `linear-gradient(135deg, ${c.accent}, ${c.violet})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <Zap size={18} color="white" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <span style={{
            fontSize: "20px",
            fontWeight: "800",
            color: c.text,
            letterSpacing: "-0.3px",
          }}>
            Zapê<span style={{ color: c.accent }}>Chat</span>
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ padding: "12px 10px", flex: 1 }}>
        {navItems.map(item => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: "100%",
                padding: collapsed ? "12px 0" : "12px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: "12px",
                background: isActive ? c.accentSoft : "transparent",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                color: isActive ? c.accent : c.textSecondary,
                fontSize: "14px",
                fontWeight: isActive ? "600" : "500",
                marginBottom: "4px",
                transition: "all 0.2s",
                position: "relative",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = c.bgCardHover; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              {isActive && (
                <div style={{
                  position: "absolute",
                  left: collapsed ? "50%" : "0",
                  top: "50%",
                  transform: collapsed ? "translate(-50%, -50%)" : "translateY(-50%)",
                  width: collapsed ? "4px" : "3px",
                  height: "24px",
                  borderRadius: "4px",
                  background: c.accent,
                }} />
              )}
              <item.icon size={20} />
              {!collapsed && item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "12px 10px", borderTop: `1px solid ${c.border}` }}>
        <button onClick={toggle} style={{
          width: "100%",
          padding: collapsed ? "12px 0" : "12px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: "12px",
          background: "transparent",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          color: c.textSecondary,
          fontSize: "14px",
          fontWeight: "500",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = c.bgCardHover}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
          {!collapsed && (dark ? "Modo Claro" : "Modo Escuro")}
        </button>

        <button onClick={() => onNavigate("logout")} style={{
          width: "100%",
          padding: collapsed ? "12px 0" : "12px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: "12px",
          background: "transparent",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          color: c.danger,
          fontSize: "14px",
          fontWeight: "500",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = c.dangerSoft}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <LogOut size={20} />
          {!collapsed && "Sair"}
        </button>
      </div>
    </div>
  );
}

// ==================== HEADER ====================
function Header({ title, subtitle, user, onToggleSidebar }) {
  const { dark } = useTheme();
  const c = getStyles(dark);
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "20px 28px",
      borderBottom: `1px solid ${c.border}`,
      background: c.bgCard,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={onToggleSidebar} style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: c.textSecondary,
          padding: "6px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
        }}
        onMouseEnter={e => e.currentTarget.style.background = c.bgCardHover}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: c.text }}>{title}</h1>
          {subtitle && <p style={{ margin: "2px 0 0", fontSize: "13px", color: c.textMuted }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: `linear-gradient(135deg, ${c.accent}, ${c.violet})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "14px",
          fontWeight: "700",
        }}>
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>
    </div>
  );
}

// ==================== DASHBOARD PAGE ====================
function DashboardPage() {
  const { dark } = useTheme();
  const c = getStyles(dark);

  const statusIcon = (status) => {
    switch (status) {
      case "read": return <Eye size={14} color={c.info} />;
      case "delivered": return <CheckCircle size={14} color={c.success} />;
      case "sent": return <Send size={14} color={c.textMuted} />;
      case "failed": return <AlertCircle size={14} color={c.danger} />;
      default: return null;
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case "read": return "Lida";
      case "delivered": return "Entregue";
      case "sent": return "Enviada";
      case "failed": return "Falhou";
      default: return status;
    }
  };

  return (
    <div style={{ padding: "24px 28px" }}>
      {/* Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "28px",
      }}>
        <StatCard icon={Send} label="Mensagens Enviadas" value={mockStats.sent} color={c.accent} colorSoft={c.accentSoft} trend="+12.5%" />
        <StatCard icon={CheckCircle} label="Entregues" value={mockStats.delivered} color={c.info} colorSoft={c.infoSoft} trend="+8.3%" />
        <StatCard icon={Eye} label="Lidas" value={mockStats.read} color={c.violet} colorSoft={c.violetGlow} trend="+5.1%" />
        <StatCard icon={AlertCircle} label="Falharam" value={mockStats.failed} color={c.danger} colorSoft={c.dangerSoft} />
      </div>

      {/* Chart + Activity */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr",
        gap: "16px",
        marginBottom: "28px",
      }}>
        {/* Chart */}
        <div style={{
          background: c.bgCard,
          borderRadius: "16px",
          padding: "24px",
          border: `1px solid ${c.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: c.text }}>Disparos da Semana</h3>
            <span style={{ fontSize: "12px", color: c.textMuted, background: c.bgInput, padding: "4px 10px", borderRadius: "6px" }}>Últimos 7 dias</span>
          </div>
          <MiniChart data={mockChartData} color={c.accent} />
        </div>

        {/* Quick Stats */}
        <div style={{
          background: c.bgCard,
          borderRadius: "16px",
          padding: "24px",
          border: `1px solid ${c.border}`,
        }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: "700", color: c.text }}>Resumo Rápido</h3>
          {[
            { icon: Users, label: "Grupos Ativos", value: mockStats.groups, color: c.violet },
            { icon: Phone, label: "Total Contatos", value: mockStats.contacts, color: c.info },
            { icon: Mail, label: "Campanhas", value: mockStats.campaigns, color: c.accent },
            { icon: Zap, label: "Disparos Ativos", value: mockStats.activeNow, color: c.warning },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: i < 3 ? `1px solid ${c.border}` : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <item.icon size={16} color={item.color} />
                <span style={{ fontSize: "14px", color: c.textSecondary }}>{item.label}</span>
              </div>
              <span style={{ fontSize: "16px", fontWeight: "700", color: c.text }}>
                {item.value.toLocaleString("pt-BR")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Messages */}
      <div style={{
        background: c.bgCard,
        borderRadius: "16px",
        padding: "24px",
        border: `1px solid ${c.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: c.text }}>Mensagens Recentes</h3>
          <span style={{ fontSize: "13px", color: c.accent, cursor: "pointer", fontWeight: "600" }}>Ver todas →</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Destinatário", "Mensagem", "Status", "Horário"].map(h => (
                  <th key={h} style={{
                    textAlign: "left",
                    padding: "10px 14px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: c.textMuted,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    borderBottom: `1px solid ${c.border}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockMessages.map(msg => (
                <tr key={msg.id}
                  style={{ transition: "background 0.2s", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = c.bgCardHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "12px 14px", fontSize: "14px", fontWeight: "600", color: c.text, fontFamily: "monospace" }}>
                    {msg.to.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, "+$1 ($2) $3-$4")}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "14px", color: c.textSecondary, maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {msg.text}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: msg.status === "read" ? c.infoSoft : msg.status === "delivered" ? c.successSoft : msg.status === "failed" ? c.dangerSoft : c.bgInput,
                      color: msg.status === "read" ? c.info : msg.status === "delivered" ? c.success : msg.status === "failed" ? c.danger : c.textMuted,
                    }}>
                      {statusIcon(msg.status)} {statusLabel(msg.status)}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "13px", color: c.textMuted }}>
                    {msg.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== SEND MESSAGE PAGE ====================
function SendMessagePage() {
  const { dark } = useTheme();
  const c = getStyles(dark);
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");
  const [delay, setDelay] = useState("1000");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!number || !message) return;
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); setTimeout(() => setSent(false), 3000); setNumber(""); setMessage(""); }, 2000);
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: "700px" }}>
      <div style={{
        background: c.bgCard,
        borderRadius: "16px",
        padding: "28px",
        border: `1px solid ${c.border}`,
      }}>
        <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: "700", color: c.text }}>Enviar Mensagem Individual</h3>
        <p style={{ margin: "0 0 24px", fontSize: "13px", color: c.textMuted }}>
          Envie uma mensagem de texto para um contato via WhatsApp
        </p>

        {sent && (
          <div style={{
            background: c.successSoft,
            border: `1px solid ${c.success}33`,
            borderRadius: "12px",
            padding: "14px 16px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: c.success,
            fontSize: "14px",
            fontWeight: "600",
          }}>
            <CheckCircle size={18} /> Mensagem enviada com sucesso!
          </div>
        )}

        <div style={{ marginBottom: "18px" }}>
          <label style={{ display: "block", color: c.textSecondary, fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
            NÚMERO DO WHATSAPP
          </label>
          <input
            value={number}
            onChange={e => setNumber(e.target.value)}
            placeholder="5511999887766"
            style={{
              width: "100%",
              padding: "13px 16px",
              background: c.bgInput,
              border: `1px solid ${c.border}`,
              borderRadius: "12px",
              color: c.text,
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={e => e.target.style.borderColor = c.accent}
            onBlur={e => e.target.style.borderColor = c.border}
          />
          <span style={{ fontSize: "12px", color: c.textMuted, marginTop: "4px", display: "block" }}>
            Com código do país, sem + ou espaços
          </span>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label style={{ display: "block", color: c.textSecondary, fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
            MENSAGEM
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Digite sua mensagem aqui..."
            rows={5}
            style={{
              width: "100%",
              padding: "13px 16px",
              background: c.bgInput,
              border: `1px solid ${c.border}`,
              borderRadius: "12px",
              color: c.text,
              fontSize: "15px",
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
            onFocus={e => e.target.style.borderColor = c.accent}
            onBlur={e => e.target.style.borderColor = c.border}
          />
          <span style={{ fontSize: "12px", color: c.textMuted, textAlign: "right", display: "block", marginTop: "4px" }}>
            {message.length} caracteres
          </span>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", color: c.textSecondary, fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
            DELAY (ms)
          </label>
          <input
            value={delay}
            onChange={e => setDelay(e.target.value)}
            type="number"
            style={{
              width: "160px",
              padding: "13px 16px",
              background: c.bgInput,
              border: `1px solid ${c.border}`,
              borderRadius: "12px",
              color: c.text,
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <span style={{ fontSize: "12px", color: c.textMuted, marginTop: "4px", display: "block" }}>
            Tempo de presença antes do envio (simula digitação)
          </span>
        </div>

        <button
          onClick={handleSend}
          disabled={sending || !number || !message}
          style={{
            padding: "14px 32px",
            background: (!number || !message) ? c.textMuted : `linear-gradient(135deg, ${c.accent}, ${c.violet})`,
            border: "none",
            borderRadius: "12px",
            color: "white",
            fontSize: "15px",
            fontWeight: "700",
            cursor: (!number || !message) ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: (!number || !message) ? "none" : `0 4px 20px ${c.accentGlow}`,
          }}
        >
          {sending ? <RefreshCw size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={18} />}
          {sending ? "Enviando..." : "Enviar Mensagem"}
        </button>
      </div>
    </div>
  );
}

// ==================== MASS SEND PAGE ====================
function MassSendPage() {
  const { dark } = useTheme();
  const c = getStyles(dark);
  const [numbers, setNumbers] = useState("");
  const [message, setMessage] = useState("");
  const [interval, setInterval_] = useState("3");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);

  const startCampaign = () => {
    const nums = numbers.split("\n").filter(n => n.trim());
    if (!nums.length || !message) return;
    setTotal(nums.length);
    setProgress(0);
    setRunning(true);
    let i = 0;
    const timer = window.setInterval(() => {
      i++;
      setProgress(i);
      if (i >= nums.length) { window.clearInterval(timer); setRunning(false); }
    }, 400);
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: "800px" }}>
      <div style={{
        background: c.bgCard,
        borderRadius: "16px",
        padding: "28px",
        border: `1px solid ${c.border}`,
        marginBottom: "20px",
      }}>
        <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: "700", color: c.text }}>Disparo em Massa</h3>
        <p style={{ margin: "0 0 24px", fontSize: "13px", color: c.textMuted }}>
          Envie a mesma mensagem para múltiplos contatos com intervalo configurável
        </p>

        {/* Warning */}
        <div style={{
          background: c.warningSoft,
          border: `1px solid ${c.warning}33`,
          borderRadius: "12px",
          padding: "14px 16px",
          marginBottom: "22px",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          color: c.warning,
          fontSize: "13px",
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "1px" }} />
          <div>
            <strong>Atenção:</strong> Use intervalos de pelo menos 3 segundos entre mensagens para evitar bloqueio do WhatsApp.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "18px" }}>
          <div>
            <label style={{ display: "block", color: c.textSecondary, fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
              NÚMEROS (um por linha)
            </label>
            <textarea
              value={numbers}
              onChange={e => setNumbers(e.target.value)}
              placeholder={"5511999887766\n5511988776655\n5511977665544"}
              rows={8}
              style={{
                width: "100%",
                padding: "13px 16px",
                background: c.bgInput,
                border: `1px solid ${c.border}`,
                borderRadius: "12px",
                color: c.text,
                fontSize: "14px",
                outline: "none",
                resize: "vertical",
                fontFamily: "monospace",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
              <span style={{ fontSize: "12px", color: c.textMuted }}>
                {numbers.split("\n").filter(n => n.trim()).length} contatos
              </span>
              <button style={{
                background: "none",
                border: "none",
                color: c.accent,
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}>
                <Upload size={12} /> Importar CSV
              </button>
            </div>
          </div>
          <div>
            <label style={{ display: "block", color: c.textSecondary, fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
              MENSAGEM
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Olá! Confira nossa promoção especial..."
              rows={8}
              style={{
                width: "100%",
                padding: "13px 16px",
                background: c.bgInput,
                border: `1px solid ${c.border}`,
                borderRadius: "12px",
                color: c.text,
                fontSize: "14px",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", color: c.textSecondary, fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
            INTERVALO ENTRE MENSAGENS (segundos)
          </label>
          <input
            value={interval}
            onChange={e => setInterval_(e.target.value)}
            type="number"
            min="1"
            style={{
              width: "160px",
              padding: "13px 16px",
              background: c.bgInput,
              border: `1px solid ${c.border}`,
              borderRadius: "12px",
              color: c.text,
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Progress */}
        {(running || progress > 0) && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", color: c.textSecondary, fontWeight: "600" }}>
                {running ? "Enviando..." : "Concluído!"}
              </span>
              <span style={{ fontSize: "13px", color: c.text, fontWeight: "700" }}>
                {progress}/{total}
              </span>
            </div>
            <div style={{
              width: "100%",
              height: "8px",
              background: c.bgInput,
              borderRadius: "4px",
              overflow: "hidden",
            }}>
              <div style={{
                width: `${total ? (progress / total) * 100 : 0}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${c.accent}, ${c.violet})`,
                borderRadius: "4px",
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={startCampaign}
            disabled={running || !numbers.trim() || !message}
            style={{
              padding: "14px 32px",
              background: running ? c.textMuted : `linear-gradient(135deg, ${c.accent}, ${c.violet})`,
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontSize: "15px",
              fontWeight: "700",
              cursor: running ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {running ? <Pause size={18} /> : <Play size={18} />}
            {running ? "Enviando..." : "Iniciar Disparo"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== GROUPS PAGE ====================
function GroupsPage() {
  const { dark } = useTheme();
  const c = getStyles(dark);
  const [selected, setSelected] = useState(null);
  const [msgText, setMsgText] = useState("");

  return (
    <div style={{ padding: "24px 28px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Groups List */}
        <div style={{
          background: c.bgCard,
          borderRadius: "16px",
          padding: "24px",
          border: `1px solid ${c.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: c.text }}>Seus Grupos</h3>
            <button style={{
              background: c.accentSoft,
              border: "none",
              borderRadius: "8px",
              padding: "6px 12px",
              color: c.accent,
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}>
              <RefreshCw size={13} /> Atualizar
            </button>
          </div>

          {mockGroups.map(group => (
            <div
              key={group.id}
              onClick={() => setSelected(group)}
              style={{
                padding: "14px 16px",
                borderRadius: "12px",
                marginBottom: "6px",
                cursor: "pointer",
                background: selected?.id === group.id ? c.accentSoft : "transparent",
                border: `1px solid ${selected?.id === group.id ? c.accent + "33" : "transparent"}`,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { if (selected?.id !== group.id) e.currentTarget.style.background = c.bgCardHover; }}
              onMouseLeave={e => { if (selected?.id !== group.id) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: c.violetGlow,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Hash size={18} color={c.violet} />
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: c.text }}>{group.name}</div>
                    <div style={{ fontSize: "12px", color: c.textMuted, marginTop: "2px" }}>{group.members} membros</div>
                  </div>
                </div>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: group.active ? c.success : c.textMuted,
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Send to Group */}
        <div style={{
          background: c.bgCard,
          borderRadius: "16px",
          padding: "24px",
          border: `1px solid ${c.border}`,
        }}>
          <h3 style={{ margin: "0 0 18px", fontSize: "16px", fontWeight: "700", color: c.text }}>
            Enviar para Grupo
          </h3>

          {selected ? (
            <>
              <div style={{
                background: c.bgInput,
                borderRadius: "12px",
                padding: "14px 16px",
                marginBottom: "18px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}>
                <Hash size={18} color={c.violet} />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: c.text }}>{selected.name}</div>
                  <div style={{ fontSize: "12px", color: c.textMuted }}>{selected.members} membros</div>
                </div>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", color: c.textSecondary, fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
                  MENSAGEM
                </label>
                <textarea
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  placeholder="Digite a mensagem para o grupo..."
                  rows={6}
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    background: c.bgInput,
                    border: `1px solid ${c.border}`,
                    borderRadius: "12px",
                    color: c.text,
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  color: c.textSecondary,
                  cursor: "pointer",
                }}>
                  <input type="checkbox" /> Mencionar todos
                </label>
              </div>

              <button style={{
                marginTop: "20px",
                padding: "14px 32px",
                background: `linear-gradient(135deg, ${c.accent}, ${c.violet})`,
                border: "none",
                borderRadius: "12px",
                color: "white",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <Send size={18} /> Enviar para Grupo
              </button>
            </>
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 20px",
              color: c.textMuted,
              textAlign: "center",
            }}>
              <Users size={40} style={{ marginBottom: "14px", opacity: 0.3 }} />
              <p style={{ fontSize: "14px", margin: 0 }}>Selecione um grupo na lista ao lado para enviar mensagens</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== REPORTS PAGE ====================
function ReportsPage() {
  const { dark } = useTheme();
  const c = getStyles(dark);
  const [period, setPeriod] = useState("week");

  const campaignStatus = (status) => {
    const map = {
      completed: { bg: c.successSoft, color: c.success, label: "Concluída" },
      running: { bg: c.warningSoft, color: c.warning, label: "Em andamento" },
      scheduled: { bg: c.infoSoft, color: c.info, label: "Agendada" },
    };
    return map[status] || {};
  };

  return (
    <div style={{ padding: "24px 28px" }}>
      {/* Period Selector */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {[
          { id: "day", label: "Hoje" },
          { id: "week", label: "Semana" },
          { id: "month", label: "Mês" },
        ].map(p => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              background: period === p.id ? c.accent : c.bgInput,
              color: period === p.id ? "white" : c.textSecondary,
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "24px",
      }}>
        <StatCard icon={Send} label="Total Enviadas" value={12847} color={c.accent} colorSoft={c.accentSoft} />
        <StatCard icon={CheckCircle} label="Taxa de Entrega" value="92.8%" color={c.success} colorSoft={c.successSoft} />
        <StatCard icon={Eye} label="Taxa de Leitura" value="76.5%" color={c.violet} colorSoft={c.violetGlow} />
        <StatCard icon={AlertCircle} label="Taxa de Falha" value="1.7%" color={c.danger} colorSoft={c.dangerSoft} />
      </div>

      {/* Chart */}
      <div style={{
        background: c.bgCard,
        borderRadius: "16px",
        padding: "24px",
        border: `1px solid ${c.border}`,
        marginBottom: "24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: c.text }}>Disparos por Período</h3>
          <button style={{
            background: c.bgInput,
            border: "none",
            borderRadius: "8px",
            padding: "6px 12px",
            color: c.accent,
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}>
            <Download size={13} /> Exportar
          </button>
        </div>
        <MiniChart data={mockChartData} color={c.accent} />
      </div>

      {/* Campaigns Table */}
      <div style={{
        background: c.bgCard,
        borderRadius: "16px",
        padding: "24px",
        border: `1px solid ${c.border}`,
        marginBottom: "24px",
      }}>
        <h3 style={{ margin: "0 0 18px", fontSize: "16px", fontWeight: "700", color: c.text }}>Histórico de Campanhas</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Campanha", "Enviadas", "Entregues", "Lidas", "Status", "Data"].map(h => (
                <th key={h} style={{
                  textAlign: "left",
                  padding: "10px 14px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: c.textMuted,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  borderBottom: `1px solid ${c.border}`,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockCampaigns.map(camp => {
              const st = campaignStatus(camp.status);
              return (
                <tr key={camp.id}
                  style={{ transition: "background 0.2s", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = c.bgCardHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px", fontSize: "14px", fontWeight: "600", color: c.text }}>{camp.name}</td>
                  <td style={{ padding: "14px", fontSize: "14px", color: c.textSecondary }}>{camp.sent.toLocaleString()}</td>
                  <td style={{ padding: "14px", fontSize: "14px", color: c.textSecondary }}>{camp.delivered.toLocaleString()}</td>
                  <td style={{ padding: "14px", fontSize: "14px", color: c.textSecondary }}>{camp.read.toLocaleString()}</td>
                  <td style={{ padding: "14px" }}>
                    <span style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: st.bg,
                      color: st.color,
                    }}>
                      {st.label}
                    </span>
                  </td>
                  <td style={{ padding: "14px", fontSize: "13px", color: c.textMuted }}>{camp.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Top Groups */}
      <div style={{
        background: c.bgCard,
        borderRadius: "16px",
        padding: "24px",
        border: `1px solid ${c.border}`,
      }}>
        <h3 style={{ margin: "0 0 18px", fontSize: "16px", fontWeight: "700", color: c.text }}>Ranking de Grupos Mais Ativos</h3>
        {mockGroups.sort((a, b) => b.members - a.members).map((group, i) => (
          <div key={group.id} style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 0",
            borderBottom: i < mockGroups.length - 1 ? `1px solid ${c.border}` : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: i === 0 ? c.warningSoft : i === 1 ? c.bgInput : i === 2 ? c.accentSoft : c.bgInput,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: "700",
                color: i === 0 ? c.warning : i === 1 ? c.textSecondary : i === 2 ? c.accent : c.textMuted,
              }}>
                {i + 1}
              </span>
              <span style={{ fontSize: "14px", fontWeight: "600", color: c.text }}>{group.name}</span>
            </div>
            <span style={{ fontSize: "14px", color: c.textMuted }}>{group.members} membros</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== CONTACTS PAGE ====================
function ContactsPage() {
  const { dark } = useTheme();
  const c = getStyles(dark);
  const [search, setSearch] = useState("");

  const contacts = [
    { name: "João Silva", number: "5511999887766", lastMessage: "Há 2 horas" },
    { name: "Maria Santos", number: "5511988776655", lastMessage: "Há 5 horas" },
    { name: "Pedro Costa", number: "5511977665544", lastMessage: "Ontem" },
    { name: "Ana Oliveira", number: "5511966554433", lastMessage: "Há 2 dias" },
    { name: "Carlos Souza", number: "5511955443322", lastMessage: "Há 3 dias" },
    { name: "Fernanda Lima", number: "5511944332211", lastMessage: "Há 1 semana" },
  ];

  const filtered = contacts.filter(ct =>
    ct.name.toLowerCase().includes(search.toLowerCase()) ||
    ct.number.includes(search)
  );

  return (
    <div style={{ padding: "24px 28px", maxWidth: "700px" }}>
      <div style={{
        background: c.bgCard,
        borderRadius: "16px",
        padding: "24px",
        border: `1px solid ${c.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: c.text }}>Contatos</h3>
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={{
              background: c.accentSoft,
              border: "none",
              borderRadius: "8px",
              padding: "8px 14px",
              color: c.accent,
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}>
              <Upload size={13} /> Importar CSV
            </button>
            <button style={{
              background: `linear-gradient(135deg, ${c.accent}, ${c.violet})`,
              border: "none",
              borderRadius: "8px",
              padding: "8px 14px",
              color: "white",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}>
              <Plus size={13} /> Adicionar
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "18px" }}>
          <Search size={16} color={c.textMuted} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar contatos..."
            style={{
              width: "100%",
              padding: "12px 16px 12px 40px",
              background: c.bgInput,
              border: `1px solid ${c.border}`,
              borderRadius: "12px",
              color: c.text,
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* List */}
        {filtered.map((ct, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderRadius: "12px",
            marginBottom: "4px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = c.bgCardHover}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${c.accent}44, ${c.violet}44)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: c.accent,
                fontSize: "15px",
                fontWeight: "700",
              }}>
                {ct.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: c.text }}>{ct.name}</div>
                <div style={{ fontSize: "12px", color: c.textMuted, fontFamily: "monospace" }}>{ct.number}</div>
              </div>
            </div>
            <span style={{ fontSize: "12px", color: c.textMuted }}>{ct.lastMessage}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== SETTINGS PAGE ====================
function SettingsPage() {
  const { dark } = useTheme();
  const c = getStyles(dark);
  const [apiUrl, setApiUrl] = useState("https://api.seuservidor.com");
  const [apiKey, setApiKey] = useState("••••••••••••••••");
  const [instance, setInstance] = useState("zapechat-main");

  return (
    <div style={{ padding: "24px 28px", maxWidth: "700px" }}>
      <div style={{
        background: c.bgCard,
        borderRadius: "16px",
        padding: "28px",
        border: `1px solid ${c.border}`,
        marginBottom: "20px",
      }}>
        <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: "700", color: c.text }}>Conexão Evolution API</h3>
        <p style={{ margin: "0 0 24px", fontSize: "13px", color: c.textMuted }}>
          Configure a conexão com seu servidor Evolution API v2
        </p>

        {[
          { label: "URL DO SERVIDOR", value: apiUrl, onChange: setApiUrl, placeholder: "https://api.seuservidor.com" },
          { label: "API KEY", value: apiKey, onChange: setApiKey, placeholder: "Sua chave de API", type: "password" },
          { label: "NOME DA INSTÂNCIA", value: instance, onChange: setInstance, placeholder: "nome-da-instancia" },
        ].map((field, i) => (
          <div key={i} style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", color: c.textSecondary, fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
              {field.label}
            </label>
            <input
              value={field.value}
              onChange={e => field.onChange(e.target.value)}
              type={field.type || "text"}
              placeholder={field.placeholder}
              style={{
                width: "100%",
                padding: "13px 16px",
                background: c.bgInput,
                border: `1px solid ${c.border}`,
                borderRadius: "12px",
                color: c.text,
                fontSize: "15px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        ))}

        <div style={{ display: "flex", gap: "12px" }}>
          <button style={{
            padding: "14px 28px",
            background: `linear-gradient(135deg, ${c.accent}, ${c.violet})`,
            border: "none",
            borderRadius: "12px",
            color: "white",
            fontSize: "15px",
            fontWeight: "700",
            cursor: "pointer",
          }}>
            Salvar Configurações
          </button>
          <button style={{
            padding: "14px 28px",
            background: c.bgInput,
            border: `1px solid ${c.border}`,
            borderRadius: "12px",
            color: c.text,
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <Globe size={16} /> Testar Conexão
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN CONTENT ====================
function MainContent({ page, pageTitle, user, onToggleSidebar }) {
  const { dark } = useTheme();
  const c = getStyles(dark);
  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, background: c.bg, minHeight: "100vh" }}>
        <Header
          title={pageTitle[page]?.[0] || ""}
          subtitle={pageTitle[page]?.[1] || ""}
          user={user}
          onToggleSidebar={onToggleSidebar}
        />
        {page === "dashboard" && <DashboardPage />}
        {page === "send" && <SendMessagePage />}
        {page === "mass" && <MassSendPage />}
        {page === "groups" && <GroupsPage />}
        {page === "reports" && <ReportsPage />}
        {page === "contacts" && <ContactsPage />}
        {page === "settings" && <SettingsPage />}
      </div>
    </div>
  );
}

// ==================== MAIN APP ====================
function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleNavigate = (id) => {
    if (id === "logout") { setUser(null); return; }
    setPage(id);
  };

  const pageTitle = {
    dashboard: ["Dashboard", "Visão geral do seu ZapêChat"],
    send: ["Enviar Mensagem", "Envio individual via WhatsApp"],
    mass: ["Disparo em Massa", "Envie para múltiplos contatos"],
    groups: ["Grupos", "Gerencie e envie para grupos"],
    reports: ["Relatórios", "Analise seus disparos"],
    contacts: ["Contatos", "Gerencie sua lista de contatos"],
    settings: ["Configurações", "Configure sua integração"],
  };

  if (!user) {
    return (
      <ThemeProvider>
        <LoginPage onLogin={setUser} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        <Sidebar
          active={page}
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed}
          user={user}
        />
        <MainContent
          page={page}
          pageTitle={pageTitle}
          user={user}
          onToggleSidebar={() => setSidebarCollapsed(s => !s)}
        />
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>
    </ThemeProvider>
  );
}

export default App;
