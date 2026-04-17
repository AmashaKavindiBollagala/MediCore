import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─── CONFIG ───────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home",               href: "/",                  icon: "🏠", protected: false },
  { label: "Appointments",       href: "/appointments",      icon: "📅", protected: true  },
  { label: "AI Symptom Checker", href: "/symptom-checker",   icon: "🤖", protected: true  },
  { label: "Consultation",       href: "/appointments/book", icon: "🎥", protected: true  },
  { label: "Profile",            href: "/patient-dashboard",   icon: "👤", protected: true  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────
function getAuthState() {
  try {
    const token = localStorage.getItem("token");
    const user  = JSON.parse(localStorage.getItem("user") || "null");
    return { loggedIn: !!token, user };
  } catch {
    return { loggedIn: false, user: null };
  }
}

function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("localAuthChange"));
}

// ─────────────────────────────────────────────────────────────────────
export default function SharedLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [auth,     setAuth]     = useState(getAuthState);
  const [toast,    setToast]    = useState(null);
  const navigate = useNavigate();

  const loggedIn = auth.loggedIn;
  const user     = auth.user;

  // ── Keep auth state in sync with localStorage ──────────────────────
  useEffect(() => {
    const sync = () => setAuth(getAuthState());
    window.addEventListener("storage",         sync);
    window.addEventListener("localAuthChange", sync);
    return () => {
      window.removeEventListener("storage",         sync);
      window.removeEventListener("localAuthChange", sync);
    };
  }, []);

  // ── Scroll header shadow ───────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Auto-dismiss toast ─────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Logout handler ─────────────────────────────────────────────────
  const handleLogout = () => {
    clearAuth();
    setAuth({ loggedIn: false, user: null });
    setMenuOpen(false);
    navigate("/");
  };

  // ── Nav click: block protected pages when not logged in ────────────
  const handleNavClick = (e, link) => {
    if (link.protected && !loggedIn) {
      e.preventDefault();
      setMenuOpen(false);
      setToast(`Please login to access "${link.label}"`);
      setTimeout(() => navigate("/login"), 1200);
    }
  };

  // ── Derive display name from stored user object ────────────────────
  const displayName = user?.name || user?.firstName || user?.email?.split("@")[0] || "Patient";
  const initials    = displayName.slice(0, 1).toUpperCase();

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#F1FAEE", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700;900&display=swap');

        .sl-nav-link {
          text-decoration: none; color: #184E77;
          font-size: 13.5px; font-weight: 500;
          padding: 7px 13px; border-radius: 8px;
          transition: background .18s, color .18s;
          display: flex; align-items: center; gap: 6px;
          cursor: pointer; white-space: nowrap;
        }
        .sl-nav-link:hover  { background: #E1F5EE; color: #34A0A4; }
        .sl-nav-link.active { background: #E1F5EE; color: #34A0A4; }
        .sl-nav-link.locked { opacity: 0.7; }
        .sl-nav-link.locked::after {
          content: '🔒'; font-size: 10px; margin-left: 2px; opacity: 0.5;
        }

        .sl-btn-primary {
          background: linear-gradient(135deg,#184E77,#34A0A4);
          color: white; border: none;
          padding: 10px 24px; border-radius: 50px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: transform .18s, box-shadow .18s;
          text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
          font-family: inherit;
        }
        .sl-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(24,78,119,.3); }

        .sl-btn-outline {
          background: transparent; color: #184E77;
          border: 2px solid #184E77;
          padding: 9px 24px; border-radius: 50px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: all .18s; text-decoration: none;
          display: inline-flex; align-items: center;
          font-family: inherit;
        }
        .sl-btn-outline:hover { background: #184E77; color: white; }

        .sl-toast {
          position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
          background: #184E77; color: white;
          padding: 12px 24px; border-radius: 50px;
          font-size: 14px; font-weight: 500;
          box-shadow: 0 8px 32px rgba(24,78,119,.35);
          z-index: 9999; display: flex; align-items: center; gap: 8px;
          animation: slToastIn .25s ease;
          white-space: nowrap;
        }
        @keyframes slToastIn {
          from { opacity:0; transform: translateX(-50%) translateY(10px); }
          to   { opacity:1; transform: translateX(-50%) translateY(0); }
        }

        .sl-mobile-hamburger { display: none; }

        @media (max-width:768px) {
          .sl-desktop-nav  { display: none !important; }
          .sl-desktop-auth { display: none !important; }
          .sl-mobile-hamburger { display: flex !important; }
          .sl-footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div className="sl-toast">
          🔒 {toast}
        </div>
      )}

      {/* ═══ HEADER ═══════════════════════════════════════════════════ */}
      <header style={{
        position: "fixed", top:0, left:0, right:0, zIndex:100,
        background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(241,250,238,0.92)",
        backdropFilter: "blur(14px)",
        borderBottom: scrolled ? "1px solid rgba(52,160,164,.18)" : "1px solid transparent",
        boxShadow: scrolled ? "0 4px 24px rgba(24,78,119,.08)" : "none",
        transition: "all .25s",
      }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", height:66, gap:8 }}>

          {/* Logo */}
          <a href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:9, marginRight:12, flexShrink:0 }}>
            <img
              src="/MediCore_logo.png"
              alt="MediCore Logo"
              style={{ width:36, height:36, objectFit:"contain", borderRadius:8 }}
            />
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:21, fontWeight:700, color:"#184E77" }}>
              Medi<span style={{ color:"#34A0A4" }}>Core</span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="sl-desktop-nav" style={{ display:"flex", alignItems:"center", gap:2, flex:1, overflowX:"auto" }}>
            {NAV_LINKS.map(link => {
              const isLocked  = link.protected && !loggedIn;
              const isCurrent = typeof window !== "undefined" && window.location.pathname === link.href;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={e => handleNavClick(e, link)}
                  className={`sl-nav-link${isCurrent ? " active" : ""}${isLocked ? " locked" : ""}`}
                  title={isLocked ? "Login required" : ""}
                >
                  <span style={{ fontSize:14 }}>{link.icon}</span>
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Desktop auth */}
          <div className="sl-desktop-auth" style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
            {loggedIn ? (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:8, background:"white", border:"1.5px solid rgba(52,160,164,.25)", borderRadius:50, padding:"5px 14px 5px 6px" }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#34A0A4,#76C893)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:12, fontWeight:700 }}>
                    {initials}
                  </div>
                  <span style={{ fontSize:13, fontWeight:600, color:"#184E77" }}>{displayName}</span>
                </div>
                <button className="sl-btn-outline" style={{ padding:"8px 20px" }} onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/login"    className="sl-btn-outline" style={{ padding:"8px 20px" }}>Login</a>
                <a href="/register" className="sl-btn-primary" style={{ padding:"9px 20px" }}>Get Started</a>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sl-mobile-hamburger"
            style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", padding:6, flexDirection:"column", gap:5 }}
            aria-label="Toggle menu"
          >
            <div style={{ width:22, height:2, background:"#184E77", borderRadius:2, transition:"all .2s", transform: menuOpen ? "rotate(45deg) translateY(7px)" : "none" }} />
            <div style={{ width:16, height:2, background:"#34A0A4", borderRadius:2, opacity: menuOpen ? 0 : 1, transition:"opacity .2s" }} />
            <div style={{ width:22, height:2, background:"#184E77", borderRadius:2, transition:"all .2s", transform: menuOpen ? "rotate(-45deg) translateY(-7px)" : "none" }} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{ background:"white", padding:"12px 20px 20px", borderTop:"1px solid rgba(52,160,164,.12)", boxShadow:"0 8px 24px rgba(24,78,119,.08)" }}>
            {NAV_LINKS.map(link => {
              const isLocked = link.protected && !loggedIn;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={e => handleNavClick(e, link)}
                  className={`sl-nav-link${isLocked ? " locked" : ""}`}
                  style={{ padding:"12px 10px", borderBottom:"1px solid rgba(52,160,164,.08)", borderRadius:0, justifyContent:"space-between" }}
                >
                  <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span>{link.icon}</span>{link.label}
                  </span>
                  {isLocked && <span style={{ fontSize:11, color:"#34A0A4", background:"#E1F5EE", borderRadius:6, padding:"2px 8px", fontWeight:600 }}>Login required</span>}
                </a>
              );
            })}
            <div style={{ display:"flex", gap:10, marginTop:14 }}>
              {loggedIn ? (
                <button className="sl-btn-outline" style={{ flex:1, justifyContent:"center" }} onClick={handleLogout}>
                  Logout
                </button>
              ) : (
                <>
                  <a href="/login"    className="sl-btn-outline" style={{ flex:1, justifyContent:"center" }}>Login</a>
                  <a href="/register" className="sl-btn-primary" style={{ flex:1, justifyContent:"center" }}>Get Started</a>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Header spacer */}
      <div style={{ height:66 }} />

      {/* ═══ PAGE CONTENT ══════════════════════════════════════════════ */}
      <main>
        {children}
      </main>

      {/* ═══ FOOTER ════════════════════════════════════════════════════ */}
      <footer style={{ background:"#184E77", color:"white", padding:"64px 24px 32px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div className="sl-footer-grid" style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:48 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#34A0A4,#76C893)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🏥</div>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700 }}>Medi<span style={{ color:"#76C893" }}>Core</span></span>
              </div>
              <p style={{ fontSize:14, color:"rgba(255,255,255,.6)", lineHeight:1.8, maxWidth:260, marginBottom:20 }}>
                Sri Lanka's leading digital healthcare platform — making quality care accessible to everyone.
              </p>
              <div style={{ display:"flex", gap:10 }}>
                {["📘","🐦","📸","▶️"].map((icon,i) => (
                  <div key={i} style={{ width:36, height:36, borderRadius:8, background:"rgba(255,255,255,.1)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:14 }}>{icon}</div>
                ))}
              </div>
            </div>

            {[
              { title:"Services", links:[
                { label:"Book Appointment",    href:"/appointments/book", protected:true  },
                { label:"Video Consultation",  href:"/appointments/book", protected:true  },
                { label:"AI Symptom Checker",  href:"/symptom-checker",   protected:true  },
                { label:"Medical Records",     href:"/patient-reports",   protected:true  },
                { label:"Prescriptions",       href:"/patient-profile",   protected:true  },
              ]},
              { title:"Company", links:[
                { label:"About Us",  href:"#", protected:false },
                { label:"Careers",   href:"#", protected:false },
                { label:"Blog",      href:"#", protected:false },
                { label:"Contact",   href:"#", protected:false },
              ]},
              { title:"Account", links:[
                { label:"Login",           href:"/login",           protected:false },
                { label:"Register",        href:"/register",        protected:false },
                { label:"My Profile",      href:"/patient-profile", protected:true  },
                { label:"My Appointments", href:"/appointments",    protected:true  },
              ]},
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize:13, fontWeight:700, color:"#76C893", letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>{col.title}</div>
                {col.links.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={e => {
                      if (link.protected && !loggedIn) {
                        e.preventDefault();
                        setToast(`Please login to access "${link.label}"`);
                        setTimeout(() => navigate("/login"), 1200);
                      }
                    }}
                    style={{ display:"block", fontSize:14, color:"rgba(255,255,255,.6)", textDecoration:"none", marginBottom:10, transition:"color .2s" }}
                    onMouseEnter={e => e.target.style.color="#76C893"}
                    onMouseLeave={e => e.target.style.color="rgba(255,255,255,.6)"}
                  >
                    {link.label}{link.protected && !loggedIn ? " 🔒" : ""}
                  </a>
                ))}
              </div>
            ))}
          </div>

          <div style={{ borderTop:"1px solid rgba(255,255,255,.1)", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
            <div style={{ fontSize:13, color:"rgba(255,255,255,.4)" }}>© 2026 MediCore. All rights reserved. Built with ❤️ in Sri Lanka.</div>
            <div style={{ display:"flex", gap:16 }}>
              {["Privacy","Terms","Cookies"].map(item => (
                <a key={item} href="#" style={{ fontSize:13, color:"rgba(255,255,255,.4)", textDecoration:"none" }}>{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}