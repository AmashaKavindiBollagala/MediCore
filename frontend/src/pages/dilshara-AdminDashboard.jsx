/**
 * pages/dilshara-AdminDashboard.jsx
 * MediCore — Admin Dashboard
 *
 * Features:
 *  • Stats overview (users, doctors, appointments, revenue)
 *  • User management (suspend / reactivate)
 *  • Doctor verification with AI license analysis (Claude Vision)
 *  • Appointments table
 *  • Payments / transactions table
 *
 * Reads JWT from localStorage key: "medicore_token"
 * API base: import.meta.env.VITE_ADMIN_API  (e.g. http://localhost:3009)
 */

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_ADMIN_API || "http://localhost:3009";

function getToken() {
  return localStorage.getItem("medicore_token");
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      Authorization: `Bearer ${getToken()}`,
      ...(opts.body && !(opts.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ─── Palette + shared styles (inline, no Tailwind needed beyond basics) ───────
const C = {
  bg:       "#0a0f1c",
  surface:  "#111827",
  card:     "#161e2e",
  border:   "#1f2d45",
  accent:   "#3b82f6",
  accentDim:"#1d4ed8",
  green:    "#10b981",
  yellow:   "#f59e0b",
  red:      "#ef4444",
  purple:   "#8b5cf6",
  text:     "#e2e8f0",
  muted:    "#64748b",
  white:    "#ffffff",
};

const styles = {
  page: {
    minHeight: "100vh",
    background: C.bg,
    color: C.text,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    height: 60,
    background: C.surface,
    borderBottom: `1px solid ${C.border}`,
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: "-0.5px",
    color: C.white,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    width: 28, height: 28,
    background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
    borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 800,
  },
  nav: { display: "flex", gap: 4 },
  navBtn: (active) => ({
    padding: "6px 14px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    background: active ? C.accent : "transparent",
    color: active ? C.white : C.muted,
    transition: "all 0.15s",
  }),
  main: { flex: 1, padding: "28px 32px", maxWidth: 1280, width: "100%", margin: "0 auto" },
  sectionTitle: {
    fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 20,
    display: "flex", alignItems: "center", gap: 8,
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 28,
  },
  statCard: (color) => ({
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: "20px 22px",
    borderLeft: `3px solid ${color}`,
  }),
  statLabel: { fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  statValue: { fontSize: 30, fontWeight: 800, color: C.white, lineHeight: 1 },
  statSub:   { fontSize: 12, color: C.muted, marginTop: 6 },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: C.card,
    borderRadius: 12,
    overflow: "hidden",
    border: `1px solid ${C.border}`,
  },
  th: {
    padding: "11px 16px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 600,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    background: C.surface,
    borderBottom: `1px solid ${C.border}`,
  },
  td: {
    padding: "11px 16px",
    fontSize: 13,
    color: C.text,
    borderBottom: `1px solid ${C.border}`,
  },
  btn: (color = C.accent, outline = false) => ({
    padding: "6px 14px",
    borderRadius: 8,
    border: outline ? `1px solid ${color}` : "none",
    background: outline ? "transparent" : color,
    color: outline ? color : C.white,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.15s",
  }),
  badge: (color) => ({
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    background: color + "22",
    color,
    border: `1px solid ${color}44`,
  }),
  modal: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 999,
    padding: 16,
  },
  modalBox: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: 28,
    width: "100%",
    maxWidth: 560,
    maxHeight: "90vh",
    overflowY: "auto",
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    color: C.text,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  },
  label: { fontSize: 12, color: C.muted, marginBottom: 5, display: "block", fontWeight: 500 },
  aiCard: {
    background: `linear-gradient(135deg, #1e1b4b, #0f172a)`,
    border: `1px solid ${C.purple}44`,
    borderRadius: 12,
    padding: 18,
    marginTop: 16,
  },
  fieldRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 },
};

// ─── Status helpers ────────────────────────────────────────────────────────────
function statusColor(s) {
  const map = {
    active: C.green, suspended: C.red, pending: C.yellow,
    CONFIRMED: C.green, PENDING_PAYMENT: C.yellow, CANCELLED: C.red,
    COMPLETED: C.accent, REJECTED: C.red,
    completed: C.green, failed: C.red, refunded: C.purple,
  };
  return map[s] || C.muted;
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display:"flex", justifyContent:"center", padding: 40 }}>
      <div style={{
        width: 32, height: 32,
        border: `3px solid ${C.border}`,
        borderTop: `3px solid ${C.accent}`,
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [msg]);
  if (!msg) return null;
  const bg = type === "error" ? C.red : type === "warn" ? C.yellow : C.green;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      background: bg, color: C.white,
      padding: "12px 20px", borderRadius: 10,
      fontSize: 13, fontWeight: 600,
      boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
      zIndex: 2000, maxWidth: 340,
      animation: "fadeUp 0.2s ease",
    }}>
      {msg}
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px); } }`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════════════════════
function OverviewTab({ toast }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/dashboard/stats")
      .then(setStats)
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats)  return null;

  const { users, pendingDoctors, appointments, payments, recentUsers } = stats;

  const apptTotal = Object.values(appointments).reduce((a, b) => a + Number(b), 0);

  return (
    <>
      <div style={styles.grid4}>
        <StatCard label="Total Users"    value={users.total}
                  sub={`${users.suspended} suspended`} color={C.accent} icon="👥" />
        <StatCard label="Pending Verif." value={pendingDoctors}
                  sub="doctors awaiting review" color={C.yellow} icon="🩺" />
        <StatCard label="Appointments"   value={apptTotal}
                  sub={`${appointments.confirmed || 0} confirmed`} color={C.green} icon="📅" />
        <StatCard label="Revenue"        value={`$${Number(payments.total_revenue).toFixed(2)}`}
                  sub={`$${Number(payments.total_refunds).toFixed(2)} refunded`} color={C.purple} icon="💳" />
      </div>

      {/* User role split */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:28 }}>
        <div style={{ ...styles.table, padding:0 }}>
          <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, fontWeight:700, color:C.white }}>
            👤 User Breakdown
          </div>
          {[
            { label:"Patients", value: users.patient, color: C.accent },
            { label:"Doctors",  value: users.doctor,  color: C.green  },
            { label:"Admins",   value: users.admin,   color: C.purple },
            { label:"Suspended",value: users.suspended,color: C.red   },
          ].map(r => (
            <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"11px 20px", borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:13, color: C.text }}>{r.label}</span>
              <span style={{ fontWeight:700, color: r.color }}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* Recent users */}
        <div>
          <p style={{ ...styles.sectionTitle, fontSize:15 }}>🕐 Recent Registrations</p>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Email","Role","Joined"].map(h => <th key={h} style={styles.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {(recentUsers || []).map(u => (
                <tr key={u.id}>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}><span style={styles.badge(statusColor(u.role))}>{u.role}</span></td>
                  <td style={styles.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment status bars */}
      <p style={styles.sectionTitle}>📊 Appointment Status</p>
      <div style={styles.grid4}>
        {Object.entries(appointments).map(([status, count]) => (
          <div key={status} style={{ ...styles.statCard(statusColor(status)), padding:"14px 18px" }}>
            <div style={styles.statLabel}>{status.replace(/_/g," ")}</div>
            <div style={{ ...styles.statValue, fontSize:24 }}>{count}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={styles.statCard(color)}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={styles.statLabel}>{label}</div>
          <div style={styles.statValue}>{value}</div>
          {sub && <div style={styles.statSub}>{sub}</div>}
        </div>
        <span style={{ fontSize:24 }}>{icon}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function UsersTab({ toast }) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [suspendModal, setSuspendModal] = useState(null); // user obj
  const [reason, setReason] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (role)   params.set("role", role);
    if (search) params.set("search", search);
    apiFetch(`/users?${params}`)
      .then(d => { setUsers(d.users); setTotal(d.total); })
      .catch(e => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [page, role, search]);

  useEffect(() => { load(); }, [load]);

  async function suspend(u) {
    try {
      await apiFetch(`/users/${u.id}/suspend`, {
        method: "PUT",
        body: JSON.stringify({ reason }),
      });
      toast("User suspended", "success");
      setSuspendModal(null);
      setReason("");
      load();
    } catch (e) { toast(e.message, "error"); }
  }

  async function reactivate(u) {
    try {
      await apiFetch(`/users/${u.id}/reactivate`, { method: "PUT" });
      toast("User reactivated", "success");
      load();
    } catch (e) { toast(e.message, "error"); }
  }

  return (
    <>
      {/* Filters */}
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }}
          style={{ ...styles.input, width:"auto", padding:"8px 12px" }}>
          <option value="">All roles</option>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>
        <input placeholder="Search email…" value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ ...styles.input, width:220 }} />
      </div>

      {loading ? <Spinner /> : (
        <table style={styles.table}>
          <thead>
            <tr>{["Name","Email","Role","Status","Joined","Actions"].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={styles.td}>{u.full_name || "—"}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}><span style={styles.badge(statusColor(u.role))}>{u.role}</span></td>
                <td style={styles.td}><span style={styles.badge(statusColor(u.status || "active"))}>{u.status || "active"}</span></td>
                <td style={styles.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td style={styles.td}>
                  {u.role !== "admin" && (
                    u.status === "suspended"
                      ? <button style={styles.btn(C.green)} onClick={() => reactivate(u)}>Reactivate</button>
                      : <button style={styles.btn(C.red, true)} onClick={() => setSuspendModal(u)}>Suspend</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div style={{ display:"flex", gap:8, marginTop:16, alignItems:"center" }}>
        <button disabled={page===1} onClick={() => setPage(p=>p-1)} style={styles.btn(C.accent, true)}>← Prev</button>
        <span style={{ fontSize:13, color:C.muted }}>Page {page} — {total} total</span>
        <button disabled={page * 20 >= total} onClick={() => setPage(p=>p+1)} style={styles.btn(C.accent, true)}>Next →</button>
      </div>

      {/* Suspend modal */}
      {suspendModal && (
        <div style={styles.modal} onClick={() => setSuspendModal(null)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin:"0 0 16px", color:C.white }}>Suspend {suspendModal.email}?</h3>
            <label style={styles.label}>Reason (optional)</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)}
              rows={3} style={{ ...styles.input, resize:"vertical" }} />
            <div style={{ display:"flex", gap:10, marginTop:16 }}>
              <button style={styles.btn(C.red)} onClick={() => suspend(suspendModal)}>Confirm Suspend</button>
              <button style={styles.btn(C.muted, true)} onClick={() => setSuspendModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCTORS TAB  (AI Verification)
// ═══════════════════════════════════════════════════════════════════════════════
function DoctorsTab({ toast }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);  // doctor being reviewed
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [overrides, setOverrides] = useState({});  // manual overrides on AI fields
  const fileRef = useRef();

  const loadPending = () => {
    setLoading(true);
    apiFetch("/doctors/pending")
      .then(setDoctors)
      .catch(e => toast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPending(); }, []);

  function openDoctor(d) {
    setSelected(d);
    setAiResult(d.ai_analysis ? (typeof d.ai_analysis === "string" ? JSON.parse(d.ai_analysis) : d.ai_analysis) : null);
    setOverrides({});
    setRejectReason("");
  }

  async function analyzeWithAI() {
    const file = fileRef.current?.files?.[0];
    if (!file) return toast("Please select a license image first", "warn");
    setAiLoading(true);
    setAiResult(null);
    try {
      const form = new FormData();
      form.append("license", file);
      const data = await apiFetch(`/doctors/${selected.id}/ai-analyze`, {
        method: "POST",
        body: form,
      });
      setAiResult(data.analysis);
      // Pre-fill overrides with AI result
      setOverrides({
        full_name:         data.analysis.doctor_name    || "",
        specialty:         data.analysis.specialty       || "",
        license_number:    data.analysis.license_number  || "",
        issuing_authority: data.analysis.issuing_authority || "",
        expiry_date:       data.analysis.expiry_date     || "",
      });
      toast("AI analysis complete ✓", "success");
    } catch (e) {
      toast("AI analysis failed: " + e.message, "error");
    } finally {
      setAiLoading(false);
    }
  }

  async function decide(action) {
    try {
      await apiFetch(`/doctors/${selected.id}/verify`, {
        method: "PUT",
        body: JSON.stringify({ action, rejection_reason: rejectReason }),
      });
      toast(action === "approve" ? "Doctor approved ✓" : "Doctor rejected", action === "approve" ? "success" : "warn");
      setSelected(null);
      loadPending();
    } catch (e) { toast(e.message, "error"); }
  }

  const confidenceColor = (c) => c >= 0.85 ? C.green : c >= 0.6 ? C.yellow : C.red;

  return (
    <>
      <p style={{ ...styles.statSub, marginBottom:16 }}>{doctors.length} doctor(s) pending verification</p>

      {loading ? <Spinner /> : (
        <table style={styles.table}>
          <thead>
            <tr>{["Name","Email","Specialty","Submitted","AI Status","Action"].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {doctors.length === 0 && (
              <tr><td colSpan={6} style={{ ...styles.td, textAlign:"center", color:C.muted }}>🎉 All caught up!</td></tr>
            )}
            {doctors.map(d => {
              const ai = d.ai_analysis ? (typeof d.ai_analysis === "string" ? JSON.parse(d.ai_analysis) : d.ai_analysis) : null;
              return (
                <tr key={d.id}>
                  <td style={styles.td}>{d.full_name || "—"}</td>
                  <td style={styles.td}>{d.email}</td>
                  <td style={styles.td}>{d.specialty || "—"}</td>
                  <td style={styles.td}>{new Date(d.created_at).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    {ai
                      ? <span style={styles.badge(confidenceColor(ai.confidence))}>AI {Math.round(ai.confidence*100)}%</span>
                      : <span style={styles.badge(C.muted)}>Not analyzed</span>
                    }
                  </td>
                  <td style={styles.td}>
                    <button style={styles.btn(C.accent)} onClick={() => openDoctor(d)}>Review</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* ── Verification Modal ── */}
      {selected && (
        <div style={styles.modal} onClick={() => setSelected(null)}>
          <div style={{ ...styles.modalBox, maxWidth:640 }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
              <h3 style={{ margin:0, color:C.white }}>🩺 Verify Doctor</h3>
              <button style={{ ...styles.btn(C.muted,true), padding:"4px 10px" }} onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={styles.fieldRow}>
              <div>
                <span style={styles.label}>Doctor</span>
                <span style={{ fontSize:14, color:C.text }}>{selected.full_name || "—"}</span>
              </div>
              <div>
                <span style={styles.label}>Email</span>
                <span style={{ fontSize:14, color:C.text }}>{selected.email}</span>
              </div>
            </div>

            {/* ── AI Section ── */}
            <div style={styles.aiCard}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <span style={{ fontSize:20 }}>🤖</span>
                <span style={{ fontWeight:700, color:C.white }}>AI License Analyzer</span>
                <span style={{ fontSize:11, color:C.purple, marginLeft:"auto" }}>Powered by Claude Vision</span>
              </div>

              <p style={{ fontSize:12, color:C.muted, margin:"0 0 12px" }}>
                Upload the doctor's medical license image. Claude will extract all fields automatically.
              </p>

              <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                <input ref={fileRef} type="file" accept="image/*"
                  style={{ fontSize:12, color:C.text, flex:1, minWidth:180 }} />
                <button
                  style={{ ...styles.btn(C.purple), opacity: aiLoading ? 0.6 : 1 }}
                  onClick={analyzeWithAI} disabled={aiLoading}>
                  {aiLoading ? "Analyzing…" : "✨ Analyze with AI"}
                </button>
              </div>

              {aiLoading && (
                <div style={{ marginTop:14, padding:"10px 14px", background:"rgba(139,92,246,0.1)", borderRadius:8,
                  border:`1px solid ${C.purple}33`, fontSize:12, color:C.purple }}>
                  ⏳ Claude is reading the license document…
                </div>
              )}

              {/* AI Result */}
              {aiResult && (
                <div style={{ marginTop:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <span style={styles.badge(aiResult.is_valid_document ? C.green : C.red)}>
                      {aiResult.is_valid_document ? "✓ Valid Document" : "⚠ Suspicious Document"}
                    </span>
                    <span style={styles.badge(confidenceColor(aiResult.confidence))}>
                      Confidence: {Math.round((aiResult.confidence||0)*100)}%
                    </span>
                  </div>

                  {aiResult.notes && (
                    <div style={{ padding:"8px 12px", background:"rgba(245,158,11,0.1)",
                      border:`1px solid ${C.yellow}44`, borderRadius:8, fontSize:12,
                      color:C.yellow, marginBottom:12 }}>
                      💬 {aiResult.notes}
                    </div>
                  )}

                  {/* Editable AI fields — admin can correct */}
                  <p style={{ fontSize:11, color:C.muted, marginBottom:8 }}>
                    Review and correct AI-extracted fields before approving:
                  </p>
                  <div style={styles.fieldRow}>
                    {[
                      ["doctor_name","Doctor Name","full_name"],
                      ["specialty","Specialty","specialty"],
                      ["license_number","License No.","license_number"],
                      ["issuing_authority","Issuing Authority","issuing_authority"],
                      ["expiry_date","Expiry Date","expiry_date"],
                      ["country","Country",null],
                    ].map(([aiKey, label, overrideKey]) => (
                      <div key={aiKey}>
                        <label style={styles.label}>{label}</label>
                        {overrideKey ? (
                          <input
                            value={overrides[overrideKey] ?? (aiResult[aiKey] || "")}
                            onChange={e => setOverrides(prev => ({ ...prev, [overrideKey]: e.target.value }))}
                            style={{ ...styles.input, fontSize:12 }}
                          />
                        ) : (
                          <div style={{ fontSize:13, color:C.text, paddingTop:4 }}>{aiResult[aiKey] || "—"}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reject reason */}
            <div style={{ marginTop:16 }}>
              <label style={styles.label}>Rejection reason (only needed if rejecting)</label>
              <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="e.g. License expired, unreadable document…"
                style={styles.input} />
            </div>

            {/* Actions */}
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button style={styles.btn(C.green)} onClick={() => decide("approve")}>
                ✓ Approve Doctor
              </button>
              <button style={styles.btn(C.red, true)} onClick={() => decide("reject")}
                disabled={!rejectReason}>
                ✕ Reject
              </button>
              <button style={{ ...styles.btn(C.muted, true), marginLeft:"auto" }}
                onClick={() => setSelected(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APPOINTMENTS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function AppointmentsTab({ toast }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit:20 });
    if (status) params.set("status", status);
    apiFetch(`/appointments?${params}`)
      .then(d => { setData(d.appointments); setTotal(d.total); })
      .catch(e => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const statuses = ["","PENDING_PAYMENT","CONFIRMED","COMPLETED","CANCELLED","REJECTED"];

  return (
    <>
      <div style={{ marginBottom:16 }}>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          style={{ ...styles.input, width:"auto", padding:"8px 12px" }}>
          {statuses.map(s => <option key={s} value={s}>{s || "All statuses"}</option>)}
        </select>
      </div>

      {loading ? <Spinner /> : (
        <table style={styles.table}>
          <thead>
            <tr>{["Patient","Doctor","Type","Scheduled","Status","Duration"].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={6} style={{ ...styles.td, textAlign:"center", color:C.muted }}>No appointments found</td></tr>
            )}
            {data.map(a => (
              <tr key={a.id}>
                <td style={styles.td}>{a.patient_name || a.patient_email || "—"}</td>
                <td style={styles.td}>{a.doctor_name  || a.doctor_email  || "—"}</td>
                <td style={styles.td}><span style={styles.badge(C.accent)}>{a.consultation_type}</span></td>
                <td style={styles.td}>{new Date(a.scheduled_at).toLocaleString()}</td>
                <td style={styles.td}><span style={styles.badge(statusColor(a.status))}>{a.status}</span></td>
                <td style={styles.td}>{a.duration_minutes} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ display:"flex", gap:8, marginTop:16, alignItems:"center" }}>
        <button disabled={page===1} onClick={() => setPage(p=>p-1)} style={styles.btn(C.accent,true)}>← Prev</button>
        <span style={{ fontSize:13, color:C.muted }}>Page {page} — {total} total</span>
        <button disabled={page*20>=total} onClick={() => setPage(p=>p+1)} style={styles.btn(C.accent,true)}>Next →</button>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENTS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function PaymentsTab({ toast }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit:20 });
    if (status) params.set("status", status);
    apiFetch(`/payments?${params}`)
      .then(d => { setData(d.transactions); setTotal(d.total); setSummary(d.summary); })
      .catch(e => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      {summary && (
        <div style={{ ...styles.grid4, marginBottom:20 }}>
          <StatCard label="Revenue"   value={`$${Number(summary.revenue).toFixed(2)}`}  color={C.green}  icon="💰" sub="" />
          <StatCard label="Refunds"   value={`$${Number(summary.refunds).toFixed(2)}`}  color={C.red}    icon="↩️" sub="" />
          <StatCard label="Pending"   value={summary.pending}   color={C.yellow} icon="⏳" sub="" />
          <StatCard label="Completed" value={summary.completed} color={C.accent} icon="✅" sub="" />
        </div>
      )}

      <div style={{ marginBottom:16 }}>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          style={{ ...styles.input, width:"auto", padding:"8px 12px" }}>
          {["","pending","completed","failed","refunded"].map(s =>
            <option key={s} value={s}>{s || "All statuses"}</option>
          )}
        </select>
      </div>

      {loading ? <Spinner /> : (
        <table style={styles.table}>
          <thead>
            <tr>{["Patient","Amount","Method","Type","Status","Date"].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={6} style={{ ...styles.td, textAlign:"center", color:C.muted }}>No transactions found</td></tr>
            )}
            {data.map(t => (
              <tr key={t.id}>
                <td style={styles.td}>{t.patient_email || "—"}</td>
                <td style={styles.td}><strong style={{ color:C.white }}>${Number(t.amount).toFixed(2)}</strong></td>
                <td style={styles.td}>{t.payment_method}</td>
                <td style={styles.td}><span style={styles.badge(C.muted)}>{t.transaction_type}</span></td>
                <td style={styles.td}><span style={styles.badge(statusColor(t.status))}>{t.status}</span></td>
                <td style={styles.td}>{new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ display:"flex", gap:8, marginTop:16, alignItems:"center" }}>
        <button disabled={page===1} onClick={() => setPage(p=>p-1)} style={styles.btn(C.accent,true)}>← Prev</button>
        <span style={{ fontSize:13, color:C.muted }}>Page {page} — {total} total</span>
        <button disabled={page*20>=total} onClick={() => setPage(p=>p+1)} style={styles.btn(C.accent,true)}>Next →</button>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id:"overview",      label:"📊 Overview"      },
  { id:"users",         label:"👥 Users"          },
  { id:"doctors",       label:"🩺 Verify Doctors" },
  { id:"appointments",  label:"📅 Appointments"   },
  { id:"payments",      label:"💳 Payments"       },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [toast, setToast] = useState({ msg:"", type:"" });

  // Check auth on mount
  useEffect(() => {
    if (!getToken()) {
      window.location.href = "/login";
    }
  }, []);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
  }

  function logout() {
    localStorage.removeItem("medicore_token");
    window.location.href = "/login";
  }

  const tabProps = { toast: showToast };

  return (
    <div style={styles.page}>
      {/* Topbar */}
      <header style={styles.topbar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>M</div>
          MediCore <span style={{ color:C.muted, fontWeight:400, fontSize:13 }}>Admin</span>
        </div>
        <nav style={styles.nav}>
          {TABS.map(t => (
            <button key={t.id} style={styles.navBtn(tab===t.id)} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <button style={styles.btn(C.red, true)} onClick={logout}>Sign out</button>
      </header>

      {/* Main */}
      <main style={styles.main}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:C.white }}>
            {TABS.find(t=>t.id===tab)?.label}
          </h1>
        </div>

        {tab === "overview"     && <OverviewTab     {...tabProps} />}
        {tab === "users"        && <UsersTab        {...tabProps} />}
        {tab === "doctors"      && <DoctorsTab      {...tabProps} />}
        {tab === "appointments" && <AppointmentsTab {...tabProps} />}
        {tab === "payments"     && <PaymentsTab     {...tabProps} />}
      </main>

      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg:"", type:"" })} />
    </div>
  );
}