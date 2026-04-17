import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ─── CONFIG ───────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home",               href: "/",                  icon: "🏠", protected: false },
  { label: "Appointments",       href: "/appointments",      icon: "📅", protected: true  },
  { label: "AI Symptom Checker", href: "/symptom-checker",   icon: "🤖", protected: true  },
  { label: "Consultation",       href: "/appointments/book", icon: "🎥", protected: true  },
  { label: "Profile",            href: "/patient-profile",   icon: "👤", protected: true  },
];

const SPECIALTIES = [
  { name: "Cardiology",    icon: "❤️", color: "#FFE5EC", count: "24 Doctors" },
  { name: "Neurology",     icon: "🧠", color: "#E1F5EE", count: "18 Doctors" },
  { name: "Pediatrics",    icon: "👶", color: "#E6F1FB", count: "32 Doctors" },
  { name: "Orthopedics",   icon: "🦴", color: "#F1FAEE", count: "15 Doctors" },
  { name: "Dermatology",   icon: "🔬", color: "#FFE5EC", count: "21 Doctors" },
  { name: "Ophthalmology", icon: "👁️", color: "#E1F5EE", count: "12 Doctors" },
];

const FEATURES = [
  { title: "Book Appointments",    desc: "Search and book with top specialists in seconds. Real-time availability, instant confirmation.", icon: "📅", accent: "#34A0A4", bg: "#E1F5EE" },
  { title: "Video Consultations",  desc: "Meet your doctor face-to-face from home. Secure HD video powered by advanced telemedicine tech.", icon: "🎥", accent: "#184E77", bg: "#E6F1FB" },
  { title: "AI Symptom Checker",   desc: "Describe your symptoms and get instant AI-powered health insights and specialist recommendations.", icon: "🤖", accent: "#76C893", bg: "#F1FAEE" },
  { title: "Medical Records",      desc: "Upload, manage, and share your medical reports securely with your healthcare team anytime.", icon: "📋", accent: "#184E77", bg: "#FFE5EC" },
  { title: "Digital Prescriptions",desc: "Receive and manage digital prescriptions directly from your doctor after each consultation.", icon: "💊", accent: "#34A0A4", bg: "#E1F5EE" },
  { title: "24/7 Support",         desc: "Our care team is always available. Get help with bookings, technical issues, or medical queries.", icon: "🛡️", accent: "#76C893", bg: "#F1FAEE" },
];

const STEPS = [
  { num: "01", title: "Create Account",  desc: "Sign up in under 2 minutes. No paperwork." },
  { num: "02", title: "Find Your Doctor",desc: "Browse by specialty, rating, or availability." },
  { num: "03", title: "Book & Pay",      desc: "Choose a slot and pay securely online." },
  { num: "04", title: "Consult & Heal",  desc: "Meet in person or via video call." },
];

const STATS = [
  { value: "50,000+", label: "Patients Served" },
  { value: "1,200+",  label: "Verified Doctors" },
  { value: "98%",     label: "Satisfaction Rate" },
  { value: "24/7",    label: "Available Support" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────
/** Read current auth state from localStorage */
function getAuthState() {
  try {
    const token = localStorage.getItem("token");
    const user  = JSON.parse(localStorage.getItem("user") || "null");
    return { loggedIn: !!token, user };
  } catch {
    return { loggedIn: false, user: null };
  }
}

/** Clear auth from localStorage and fire a storage event so other tabs sync */
function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // Notify same-tab listeners (storage event only fires for OTHER tabs natively)
  window.dispatchEvent(new Event("localAuthChange"));
}

// ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [scrolled,  setScrolled]  = useState(false);
  const [auth,      setAuth]      = useState(getAuthState); // ← reads from localStorage
  const [symptom,   setSymptom]   = useState("");
  const [toast,     setToast]     = useState(null);
  const heroRef = useRef(null);
  const navigate = useNavigate();

  const loggedIn = auth.loggedIn;
  const user     = auth.user;

  // ── Keep auth state in sync with localStorage ──────────────────────
  useEffect(() => {
    const sync = () => setAuth(getAuthState());

    // Fires when Login.jsx sets localStorage (cross-tab) or we dispatch manually
    window.addEventListener("storage",        sync);
    window.addEventListener("localAuthChange", sync);

    return () => {
      window.removeEventListener("storage",        sync);
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
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior: smooth; }

        .nav-link {
          text-decoration: none; color: #184E77;
          font-size: 13.5px; font-weight: 500;
          padding: 7px 13px; border-radius: 8px;
          transition: background .18s, color .18s;
          display: flex; align-items: center; gap: 6px;
          cursor: pointer; white-space: nowrap;
        }
        .nav-link:hover  { background: #E1F5EE; color: #34A0A4; }
        .nav-link.active { background: #E1F5EE; color: #34A0A4; }

        .nav-link.locked { opacity: 0.7; }
        .nav-link.locked::after {
          content: '🔒';
          font-size: 10px;
          margin-left: 2px;
          opacity: 0.5;
        }

        .btn-primary {
          background: linear-gradient(135deg,#184E77,#34A0A4);
          color: white; border: none;
          padding: 10px 24px; border-radius: 50px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: transform .18s, box-shadow .18s;
          text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
          font-family: inherit;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(24,78,119,.3); }

        .btn-outline {
          background: transparent; color: #184E77;
          border: 2px solid #184E77;
          padding: 9px 24px; border-radius: 50px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: all .18s; text-decoration: none;
          display: inline-flex; align-items: center;
          font-family: inherit;
        }
        .btn-outline:hover { background: #184E77; color: white; }

        .feature-card {
          background: white; border-radius: 20px; padding: 32px 28px;
          transition: transform .3s, box-shadow .3s;
          border: 1px solid rgba(52,160,164,.1);
        }
        .feature-card:hover { transform: translateY(-8px); box-shadow: 0 20px 50px rgba(24,78,119,.12); }

        .specialty-card {
          border-radius: 16px; padding: 28px 20px; text-align: center;
          transition: transform .2s, box-shadow .2s;
          cursor: pointer; border: 1px solid transparent;
          text-decoration: none; display: block;
        }
        .specialty-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(24,78,119,.1); border-color: #76C893; }

        .pulse-dot {
          width:10px; height:10px; border-radius:50%; background:#76C893;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%,100% { box-shadow:0 0 0 0 rgba(118,200,147,.4); }
          50%      { box-shadow:0 0 0 8px rgba(118,200,147,0); }
        }
        .floating-badge { animation: floatY 3s ease-in-out infinite; }
        @keyframes floatY {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        .step-num {
          font-family: 'Playfair Display',serif;
          font-size: 64px; font-weight: 900;
          color: rgba(24,78,119,.08); line-height: 1;
        }
        .gradient-text {
          background: linear-gradient(135deg,#184E77,#34A0A4,#76C893);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-shape {
          position:absolute; border-radius:50%; opacity:.07;
          background: radial-gradient(circle,#34A0A4,#184E77);
        }

        .mc-toast {
          position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
          background: #184E77; color: white;
          padding: 12px 24px; border-radius: 50px;
          font-size: 14px; font-weight: 500;
          box-shadow: 0 8px 32px rgba(24,78,119,.35);
          z-index: 9999; display: flex; align-items: center; gap: 8px;
          animation: toastIn .25s ease;
          white-space: nowrap;
        }
        @keyframes toastIn {
          from { opacity:0; transform: translateX(-50%) translateY(10px); }
          to   { opacity:1; transform: translateX(-50%) translateY(0); }
        }

        .mobile-hamburger { display: none; }

        @media (max-width:768px) {
          .hero-grid      { grid-template-columns: 1fr !important; }
          .features-grid  { grid-template-columns: 1fr !important; }
          .steps-grid     { grid-template-columns: 1fr 1fr !important; }
          .stats-grid     { grid-template-columns: 1fr 1fr !important; }
          .specialty-grid { grid-template-columns: repeat(2,1fr) !important; }
          .desktop-nav    { display: none !important; }
          .desktop-auth   { display: none !important; }
          .mobile-hamburger { display: flex !important; }
          .footer-grid    { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div className="mc-toast">
          🔒 {toast}
        </div>
      )}

      {/* HEADER */}
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
    style={{
      width: 36,
      height: 36,
      objectFit: "contain",
      borderRadius: 8
    }}
  />

  <span style={{ fontFamily:"'Playfair Display',serif", fontSize:21, fontWeight:700, color:"#184E77" }}>
    Medi<span style={{ color:"#34A0A4" }}>Core</span>
  </span>

</a>

          {/* Desktop nav */}
          <nav className="desktop-nav" style={{ display:"flex", alignItems:"center", gap:2, flex:1, overflowX:"auto" }}>
            {NAV_LINKS.map(link => {
              const isLocked  = link.protected && !loggedIn;
              const isCurrent = typeof window !== "undefined" && window.location.pathname === link.href;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={e => handleNavClick(e, link)}
                  className={`nav-link${isCurrent ? " active" : ""}${isLocked ? " locked" : ""}`}
                  title={isLocked ? "Login required" : ""}
                >
                  <span style={{ fontSize:14 }}>{link.icon}</span>
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Desktop auth */}
          <div className="desktop-auth" style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
            {loggedIn ? (
              <>
                {/* User avatar pill */}
                <div style={{ display:"flex", alignItems:"center", gap:8, background:"white", border:"1.5px solid rgba(52,160,164,.25)", borderRadius:50, padding:"5px 14px 5px 6px" }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#34A0A4,#76C893)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:12, fontWeight:700 }}>
                    {initials}
                  </div>
                  <span style={{ fontSize:13, fontWeight:600, color:"#184E77" }}>{displayName}</span>
                </div>
                {/* ← Logout button */}
                <button className="btn-outline" style={{ padding:"8px 20px" }} onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/login"    className="btn-outline"  style={{ padding:"8px 20px" }}>Login</a>
                <a href="/register" className="btn-primary"  style={{ padding:"9px 20px" }}>Get Started</a>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-hamburger"
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
                  className={`nav-link${isLocked ? " locked" : ""}`}
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
                <button className="btn-outline" style={{ flex:1, justifyContent:"center" }} onClick={handleLogout}>
                  Logout
                </button>
              ) : (
                <>
                  <a href="/login"    className="btn-outline"  style={{ flex:1, justifyContent:"center" }}>Login</a>
                  <a href="/register" className="btn-primary"  style={{ flex:1, justifyContent:"center" }}>Get Started</a>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Header spacer */}
      <div style={{ height:66 }} />

      {/* HERO */}
      <section ref={heroRef} style={{ paddingTop:80, paddingBottom:80, background:"linear-gradient(160deg,#F1FAEE 0%,#E1F5EE 50%,#D6F0F0 100%)", position:"relative", overflow:"hidden" }}>
        <div className="hero-shape" style={{ width:600, height:600, top:-200, right:-150 }} />
        <div className="hero-shape" style={{ width:300, height:300, bottom:-100, left:-100, background:"radial-gradient(circle,#76C893,#34A0A4)" }} />

        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px" }}>
          <div className="hero-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }}>

            {/* Left */}
            <div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"white", borderRadius:50, padding:"6px 16px 6px 8px", marginBottom:24, boxShadow:"0 2px 12px rgba(52,160,164,.15)" }}>
                <div className="pulse-dot" />
                <span style={{ fontSize:13, color:"#34A0A4", fontWeight:600 }}>Sri Lanka's #1 Healthcare Platform</span>
              </div>

              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(36px,5vw,56px)", fontWeight:900, lineHeight:1.15, color:"#184E77", marginBottom:20 }}>
                Your Health,<br />
                <span className="gradient-text">Reimagined</span><br />
                for the Digital Age
              </h1>

              <p style={{ fontSize:17, color:"#4a7a8a", lineHeight:1.8, marginBottom:36, maxWidth:480 }}>
                Book appointments, attend video consultations, and get AI-powered health insights. All in one secure platform designed for you.
              </p>

              <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:48 }}>
                <a
                  href="/appointments/book"
                  className="btn-primary"
                  onClick={e => handleNavClick(e, { href:"/appointments/book", label:"Book Appointment", protected:true })}
                >
                  📅 Book Appointment
                </a>
                <a
                  href="/symptom-checker"
                  className="btn-outline"
                  onClick={e => handleNavClick(e, { href:"/symptom-checker", label:"AI Symptom Checker", protected:true })}
                >
                  🤖 Try AI Checker
                </a>
              </div>

              <div className="stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                {STATS.map(s => (
                  <div key={s.label} style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:"#184E77" }}>{s.value}</div>
                    <div style={{ fontSize:11, color:"#7aafba", fontWeight:500, marginTop:2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div style={{ position:"relative", display:"flex", justifyContent:"center" }}>
              <div style={{
                width:"100%", maxWidth:420,
                borderRadius:28,
                overflow:"hidden",
                boxShadow:"0 24px 64px rgba(24,78,119,.18)",
                position:"relative",
                zIndex:2,
                aspectRatio:"4/5",
              }}>
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=840&q=80&auto=format&fit=crop"
                  alt="Healthcare professionals"
                  style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                />
                <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"35%", background:"linear-gradient(to top, rgba(24,78,119,0.45), transparent)", pointerEvents:"none" }} />
              </div>

              <div className="floating-badge" style={{ position:"absolute", top:-10, right:-20, background:"white", borderRadius:16, padding:"12px 16px", boxShadow:"0 8px 24px rgba(24,78,119,.12)", zIndex:3 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:20 }}>🤖</span>
                  <div>
                    <div style={{ fontSize:11, color:"#888", fontWeight:500 }}>AI Diagnosis</div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#184E77" }}>98% Accurate</div>
                  </div>
                </div>
              </div>

              <div className="floating-badge" style={{ animationDelay:"1.5s", position:"absolute", bottom:20, left:-30, background:"white", borderRadius:16, padding:"12px 16px", boxShadow:"0 8px 24px rgba(24,78,119,.12)", zIndex:3 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:20 }}>🔒</span>
                  <div>
                    <div style={{ fontSize:11, color:"#888", fontWeight:500 }}>End-to-End</div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#184E77" }}>Encrypted</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIALTIES */}
      <section style={{ padding:"80px 24px", background:"white" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#34A0A4", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Browse by Specialty</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,4vw,40px)", color:"#184E77", fontWeight:700 }}>Find the Right Specialist</h2>
          </div>
          <div className="specialty-grid" style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:16 }}>
            {SPECIALTIES.map(s => (
              <a
                key={s.name}
                href="/appointments/book"
                onClick={e => handleNavClick(e, { href:"/appointments/book", label:"Book Appointment", protected:true })}
                className="specialty-card"
                style={{ background:s.color }}
              >
                <div style={{ fontSize:32, marginBottom:10 }}>{s.icon}</div>
                <div style={{ fontWeight:700, fontSize:13, color:"#184E77", marginBottom:4 }}>{s.name}</div>
                <div style={{ fontSize:11, color:"#34A0A4", fontWeight:600 }}>{s.count}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:"80px 24px", background:"#F1FAEE" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#34A0A4", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Everything You Need</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,4vw,40px)", color:"#184E77", fontWeight:700 }}>
              Comprehensive Healthcare,<br /><span className="gradient-text">One Platform</span>
            </h2>
          </div>
          <div className="features-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card">
                <div style={{ width:52, height:52, borderRadius:14, background:f.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, marginBottom:20 }}>{f.icon}</div>
                <h3 style={{ fontWeight:700, fontSize:17, color:"#184E77", marginBottom:10 }}>{f.title}</h3>
                <p style={{ fontSize:14, color:"#7aafba", lineHeight:1.75 }}>{f.desc}</p>
                <a href="#" style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:16, fontSize:13, fontWeight:700, color:f.accent, textDecoration:"none" }}>Learn more →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI SYMPTOM CHECKER BANNER */}
      <section style={{ padding:"80px 24px", background:"linear-gradient(135deg,#184E77 0%,#34A0A4 50%,#76C893 100%)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, opacity:.05, backgroundImage:"radial-gradient(circle at 30% 50%,white 1px,transparent 1px)", backgroundSize:"40px 40px" }} />
        <div style={{ maxWidth:800, margin:"0 auto", textAlign:"center", position:"relative" }}>
          <div style={{ fontSize:52, marginBottom:20 }}>🤖</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,4vw,44px)", color:"white", fontWeight:700, marginBottom:16 }}>Not Sure What's Wrong?</h2>
          <p style={{ fontSize:17, color:"rgba(255,255,255,.85)", marginBottom:36, lineHeight:1.8 }}>
            Describe your symptoms to our AI and get instant health insights, risk assessment, and the right specialist recommendation.
          </p>
          <div style={{ display:"flex", gap:0, maxWidth:520, margin:"0 auto 24px", background:"white", borderRadius:50, padding:"6px 6px 6px 20px", boxShadow:"0 12px 40px rgba(0,0,0,.2)" }}>
            <input
              value={symptom}
              onChange={e => setSymptom(e.target.value)}
              placeholder="e.g. headache, fever, sore throat..."
              style={{ flex:1, border:"none", outline:"none", fontSize:14, color:"#184E77", background:"transparent", fontFamily:"inherit" }}
            />
            <button
              className="btn-primary"
              style={{ fontSize:14, padding:"10px 20px", whiteSpace:"nowrap" }}
              onClick={() => {
                if (!loggedIn) {
                  setToast("Please login to use AI Symptom Checker");
                  setTimeout(() => navigate("/login"), 1200);
                } else {
                  navigate("/symptom-checker");
                }
              }}
            >
              Check Now
            </button>
          </div>
          <p style={{ fontSize:12, color:"rgba(255,255,255,.6)" }}>Not a replacement for professional medical advice.</p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding:"80px 24px", background:"white" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#34A0A4", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Simple Process</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,4vw,40px)", color:"#184E77", fontWeight:700 }}>How MediCore Works</h2>
          </div>
          <div className="steps-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:32 }}>
            {STEPS.map((step, i) => (
              <div key={step.num} style={{ position:"relative" }}>
                <div className="step-num">{step.num}</div>
                <div style={{ marginTop:-16 }}>
                  <div style={{ width:48, height:48, borderRadius:12, background: i%2===0 ? "#E1F5EE" : "#FFE5EC", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14, fontSize:22 }}>
                    {["📝","🔍","💳","🩺"][i]}
                  </div>
                  <h3 style={{ fontWeight:700, fontSize:16, color:"#184E77", marginBottom:8 }}>{step.title}</h3>
                  <p style={{ fontSize:13, color:"#7aafba", lineHeight:1.7 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + TESTIMONIALS */}
      <section style={{ padding:"80px 24px", background:"#F1FAEE" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ background:"white", borderRadius:28, padding:"56px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:32, boxShadow:"0 12px 48px rgba(24,78,119,.08)" }}>
            <div style={{ maxWidth:520 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#34A0A4", letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Start Today</div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(24px,3.5vw,36px)", color:"#184E77", fontWeight:700, marginBottom:16, lineHeight:1.3 }}>
                Take Control of Your<br />Health Journey
              </h2>
              <p style={{ fontSize:15, color:"#7aafba", lineHeight:1.8, marginBottom:28 }}>
                Join over 50,000 patients who trust MediCore for their healthcare needs. Register free and book your first appointment in under 2 minutes.
              </p>
              <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                <a href="/register" className="btn-primary">Create Free Account</a>
                <a href="/login"    className="btn-outline">Login to Book</a>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {[
                { text:"Booked my appointment in 2 minutes! Fantastic experience.", name:"Priya S., Colombo" },
                { text:"AI Symptom Checker helped me find the right specialist immediately.", name:"Kasun R., Kandy" },
              ].map((t,i) => (
                <div key={i} style={{ background:"#F1FAEE", borderRadius:16, padding:"18px 22px", maxWidth:320 }}>
                  <p style={{ fontSize:14, color:"#184E77", fontStyle:"italic", lineHeight:1.7, marginBottom:10 }}>"{t.text}"</p>
                  <div style={{ fontSize:12, fontWeight:700, color:"#34A0A4" }}>— {t.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:"#184E77", color:"white", padding:"64px 24px 32px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div className="footer-grid" style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:48 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <img
    src="/MediCore_logo.png"
    alt="MediCore Logo"
    style={{
      width: 36,
      height: 36,
      objectFit: "contain",
      borderRadius: 8
    }}
  />
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700 }}>Medi<span style={{ color:"#76C893" }}>Core</span></span>
              </div>
              <p style={{ fontSize:14, color:"rgba(255,255,255,.6)", lineHeight:1.8, maxWidth:260, marginBottom:20 }}>
                Sri Lanka's leading digital healthcare platform,  Making quality care accessible to everyone.
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
                { label:"Login",          href:"/login",           protected:false },
                { label:"Register",       href:"/register",        protected:false },
                { label:"My Profile",     href:"/patient-profile", protected:true  },
                { label:"My Appointments",href:"/appointments",    protected:true  },
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