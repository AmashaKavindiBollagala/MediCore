import { useState, useRef, useEffect } from "react";

// ── Color Palette ─────────────────────────────────────────────────────────────
// #184E77  deep ocean blue   → primary / header / active tabs
// #34A0A4  teal              → secondary / accents / hover
// #76C893  sage green        → success states / badges
// #F1FAEE  off-white cream   → page & card backgrounds
// #FFE5EC  blush pink        → warnings / soft highlights

const C = {
  navy:   "#184E77",
  teal:   "#34A0A4",
  green:  "#76C893",
  cream:  "#F1FAEE",
  blush:  "#FFE5EC",
  text:   "#1a3a4a",
  muted:  "#5a8a9a",
  border: "#c8e6e8",
};

const API_BASE = "http://localhost:8080/ai/symptoms";
const getToken = () => localStorage.getItem("token");

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconText = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
  </svg>
);
const IconFile = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const IconMic = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6" />
  </svg>
);
const IconHistory = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconSend = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

// ── Urgency Badge ─────────────────────────────────────────────────────────────
const UrgencyBadge = ({ urgency }) => {
  const map = {
    low:    { bg: C.green + "33", color: "#1a7a3a", border: C.green, label: "Low Urgency" },
    medium: { bg: "#f59e0b22",    color: "#92600a", border: "#f59e0b", label: "Medium Urgency" },
    high:   { bg: C.blush,        color: "#a02040", border: "#f4a0b0", label: "High Urgency" },
  };
  const s = map[urgency] || map.low;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 20, padding: "3px 14px", fontSize: 11,
      fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase",
    }}>{s.label}</span>
  );
};

// ── Result Card ───────────────────────────────────────────────────────────────
const ResultCard = ({ result, transcript }) => {
  if (!result) return null;
  const r = result.raw_response ? null : result;
  return (
    <div style={{
      marginTop: 24,
      background: `linear-gradient(135deg, ${C.navy}06, ${C.teal}10)`,
      border: `1.5px solid ${C.border}`,
      borderRadius: 18, padding: "24px 28px",
      animation: "fadeUp .4s ease both",
    }}>
      {transcript && (
        <div style={{ marginBottom: 18, padding: "10px 14px", background: C.teal + "15", borderRadius: 10, borderLeft: `3px solid ${C.teal}` }}>
          <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Transcript</div>
          <div style={{ color: C.text, fontStyle: "italic", fontSize: 14 }}>"{transcript}"</div>
        </div>
      )}
      {!r ? (
        <pre style={{ color: C.muted, fontSize: 13, whiteSpace: "pre-wrap" }}>{result.raw_response}</pre>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
            <div>
              <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Summary</div>
              <div style={{ color: C.text, fontSize: 15, fontWeight: 600, maxWidth: 420 }}>{r.summary}</div>
            </div>
            {r.urgency && <UrgencyBadge urgency={r.urgency} />}
          </div>
          {r.possible_conditions?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Possible Conditions</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {r.possible_conditions.map((c, i) => (
                  <span key={i} style={{
                    background: C.teal + "18", color: C.navy,
                    border: `1px solid ${C.teal}44`, borderRadius: 20,
                    padding: "3px 14px", fontSize: 13, fontWeight: 500,
                  }}>{c}</span>
                ))}
              </div>
            </div>
          )}
          {r.recommendations?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Recommendations</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {r.recommendations.map((rec, i) => (
                  <li key={i} style={{ color: C.text, fontSize: 14, marginBottom: 5 }}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
          {r.specialty_recommended && (
            <div style={{
              background: C.navy + "0d", border: `1px solid ${C.navy}30`,
              borderRadius: 12, padding: "12px 16px", marginBottom: 14,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontSize: 22 }}>🏥</span>
              <div>
                <div style={{ color: C.muted, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>Recommended Specialist</div>
                <div style={{ color: C.navy, fontWeight: 700, fontSize: 15 }}>{r.specialty_recommended}</div>
              </div>
            </div>
          )}
          {r.disclaimer && (
            <div style={{
              color: "#a06070", fontSize: 12, background: C.blush + "88",
              borderTop: `1px solid ${C.border}`, borderRadius: "0 0 10px 10px",
              padding: "10px 14px", marginTop: 4,
            }}>
              ⚠️ {r.disclaimer}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── History Item ──────────────────────────────────────────────────────────────
const HistoryItem = ({ item }) => {
  const [open, setOpen] = useState(false);
  const typeIcon = { text: "💬", file: "📄", voice: "🎙️" };
  const r = item.ai_response;
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 10, background: "#fff", boxShadow: `0 2px 8px ${C.navy}08` }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{typeIcon[item.input_type] || "💬"}</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>
              {typeof r === "object" ? r.summary : item.original_input?.slice(0, 60)}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
              {new Date(item.created_at).toLocaleString()} · {item.input_type}
            </div>
          </div>
        </div>
        <span style={{ color: C.teal, fontSize: 18 }}>{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div style={{ padding: "0 18px 16px", background: C.cream }}>
          <ResultCard result={typeof r === "object" ? r : { raw_response: r }} />
        </div>
      )}
    </div>
  );
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SymptomChecker() {
  const [tab, setTab] = useState("text");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [error, setError] = useState(null);
  const [symptoms, setSymptoms] = useState("");
  const [file, setFile] = useState(null);
  const fileRef = useRef();
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [history, setHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const resetResult = () => { setResult(null); setError(null); setTranscript(null); };

  useEffect(() => {
    if (tab === "history" && !historyLoaded) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE}/history`, { headers: { Authorization: `Bearer ${getToken()}` } });
          const data = await res.json();
          if (data.success) { setHistory(data.history); setHistoryLoaded(true); }
          else setError(data.error);
        } catch { setError("Failed to load history."); }
      })();
    }
  }, [tab]);

  const submitText = async () => {
    if (!symptoms.trim()) return;
    resetResult(); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/text`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ symptoms }) });
      const data = await res.json();
      data.success ? setResult(data.result) : setError(data.error);
    } catch { setError("Request failed."); }
    setLoading(false);
  };

  const submitFile = async () => {
    if (!file) return;
    resetResult(); setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/file`, { method: "POST", headers: { Authorization: `Bearer ${getToken()}` }, body: form });
      const data = await res.json();
      data.success ? setResult(data.result) : setError(data.error);
    } catch { setError("File upload failed."); }
    setLoading(false);
  };

  const startRecording = async () => {
    resetResult(); setAudioBlob(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => setAudioBlob(new Blob(chunksRef.current, { type: "audio/webm" }));
      mr.start(); mediaRecorderRef.current = mr; setRecording(true);
    } catch { setError("Microphone access denied."); }
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setRecording(false); };

  const submitVoice = async () => {
    if (!audioBlob) return;
    resetResult(); setLoading(true);
    try {
      const form = new FormData();
      form.append("audio", audioBlob, "recording.webm");
      const res = await fetch(`${API_BASE}/voice`, { method: "POST", headers: { Authorization: `Bearer ${getToken()}` }, body: form });
      const data = await res.json();
      if (data.success) { setResult(data.result); setTranscript(data.transcript); }
      else setError(data.error);
    } catch { setError("Voice upload failed."); }
    setLoading(false);
  };

  const tabBtn = (id, Icon, label) => {
    const active = tab === id;
    return (
      <button key={id} onClick={() => { setTab(id); resetResult(); }} style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
        padding: "13px 6px", background: active ? C.navy : "transparent",
        border: "none", borderBottom: `3px solid ${active ? C.teal : "transparent"}`,
        cursor: "pointer", color: active ? "#fff" : C.muted,
        transition: "all .2s", fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
        textTransform: "uppercase", fontFamily: "inherit",
      }}>
        <Icon />{label}
      </button>
    );
  };

  const primaryBtn = (disabled) => ({
    marginTop: 14, width: "100%", padding: "14px",
    background: disabled ? C.border : `linear-gradient(135deg, ${C.navy}, ${C.teal})`,
    border: "none", borderRadius: 14, color: disabled ? C.muted : "#fff",
    fontWeight: 700, fontSize: 15, cursor: disabled ? "not-allowed" : "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    transition: "opacity .2s", fontFamily: "inherit",
    boxShadow: disabled ? "none" : `0 4px 20px ${C.navy}35`,
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: ${C.cream}; font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{transform:scale(1);box-shadow:0 0 0 0 ${C.teal}55} 50%{transform:scale(1.05);box-shadow:0 0 0 14px ${C.teal}00} }
        textarea:focus { outline:none; border-color:${C.teal} !important; }
        button:not(:disabled):hover { opacity:.88; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:${C.cream}; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:3px; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: `radial-gradient(ellipse at 10% 20%, ${C.teal}18 0%, transparent 50%), radial-gradient(ellipse at 90% 80%, ${C.green}18 0%, transparent 50%), ${C.cream}`,
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "48px 16px 72px",
      }}>
        <div style={{ width: "100%", maxWidth: 680, animation: "fadeUp .5s ease both" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.navy, borderRadius: 40, padding: "6px 18px 6px 8px", marginBottom: 22 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${C.teal}, ${C.green})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🩺</div>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>MEDICORE</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 38, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: C.navy, letterSpacing: -1, lineHeight: 1.1 }}>
              AI Symptom <span style={{ color: C.teal }}>Checker</span>
            </h1>
            <p style={{ color: C.muted, marginTop: 10, fontSize: 15 }}>
              Describe symptoms in any language — text, file, or voice
            </p>
            {/* Color palette stripe */}
            <div style={{ display: "flex", height: 5, borderRadius: 5, overflow: "hidden", margin: "18px auto 0", maxWidth: 180 }}>
              {[C.navy, C.teal, C.green, C.cream, C.blush].map((c, i) => (
                <div key={i} style={{ flex: 1, background: c, border: i === 3 ? `1px solid ${C.border}` : "none" }} />
              ))}
            </div>
          </div>

          {/* Card */}
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 24, overflow: "hidden", boxShadow: `0 20px 60px ${C.navy}12, 0 4px 16px ${C.navy}06` }}>

            {/* Tabs */}
            <div style={{ display: "flex", background: C.cream, borderBottom: `1px solid ${C.border}` }}>
              {tabBtn("text", IconText, "Text")}
              {tabBtn("file", IconFile, "File")}
              {tabBtn("voice", IconMic, "Voice")}
              {tabBtn("history", IconHistory, "History")}
            </div>

            {/* Body */}
            <div style={{ padding: "28px 28px 24px" }}>

              {/* TEXT */}
              {tab === "text" && (
                <div style={{ animation: "fadeUp .3s ease both" }}>
                  <label style={{ color: C.muted, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>Describe your symptoms</label>
                  <textarea
                    value={symptoms} onChange={e => setSymptoms(e.target.value)}
                    placeholder="e.g. I have a headache and fever since 2 days... (any language)"
                    rows={5}
                    style={{ width: "100%", marginTop: 10, background: C.cream, border: `1.5px solid ${C.border}`, borderRadius: 14, color: C.text, padding: "14px 16px", fontSize: 14, resize: "vertical", fontFamily: "inherit", transition: "border-color .2s" }}
                  />
                  <button onClick={submitText} disabled={loading || !symptoms.trim()} style={primaryBtn(loading || !symptoms.trim())}>
                    {loading ? "Analyzing…" : <><IconSend /> Analyze Symptoms</>}
                  </button>
                </div>
              )}

              {/* FILE */}
              {tab === "file" && (
                <div style={{ animation: "fadeUp .3s ease both" }}>
                  <label style={{ color: C.muted, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>Upload lab report or image</label>
                  <div
                    onClick={() => fileRef.current.click()}
                    style={{ marginTop: 10, border: `2px dashed ${file ? C.teal : C.border}`, borderRadius: 16, padding: "44px 20px", textAlign: "center", cursor: "pointer", background: file ? C.teal + "08" : C.cream, transition: "all .2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal; }}
                    onMouseLeave={e => { if (!file) e.currentTarget.style.borderColor = C.border; }}
                  >
                    <div style={{ fontSize: 38, marginBottom: 10 }}>📎</div>
                    <div style={{ color: file ? C.navy : C.muted, fontSize: 14, fontWeight: file ? 600 : 400 }}>
                      {file ? file.name : "Click to upload PDF or image"}
                    </div>
                    {file && <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB</div>}
                  </div>
                  <input ref={fileRef} type="file" accept=".pdf,image/*" onChange={e => setFile(e.target.files[0])} style={{ display: "none" }} />
                  <button onClick={submitFile} disabled={loading || !file} style={primaryBtn(loading || !file)}>
                    {loading ? "Processing…" : "Analyze File"}
                  </button>
                </div>
              )}

              {/* VOICE */}
              {tab === "voice" && (
                <div style={{ animation: "fadeUp .3s ease both", textAlign: "center", padding: "16px 0" }}>
                  <div
                    onClick={recording ? stopRecording : startRecording}
                    style={{
                      width: 110, height: 110, borderRadius: "50%", margin: "0 auto 22px",
                      background: recording ? `radial-gradient(circle, ${C.blush}, #f9c0cc)` : `radial-gradient(circle, ${C.teal}22, ${C.navy}11)`,
                      border: `2.5px solid ${recording ? "#e07090" : C.teal}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 38, cursor: "pointer",
                      animation: recording ? "pulse 1.2s infinite" : "none",
                      transition: "all .3s",
                    }}
                  >🎙️</div>
                  <div style={{ color: recording ? "#c04060" : C.muted, fontSize: 14, fontWeight: 500, marginBottom: 20 }}>
                    {recording ? "● Recording… tap to stop" : audioBlob ? "Recording ready ✓" : "Tap to start recording"}
                  </div>
                  {audioBlob && !recording && (
                    <button onClick={submitVoice} disabled={loading} style={{ ...primaryBtn(loading), width: "auto", padding: "14px 48px" }}>
                      {loading ? "Processing…" : "Analyze Recording"}
                    </button>
                  )}
                </div>
              )}

              {/* HISTORY */}
              {tab === "history" && (
                <div style={{ animation: "fadeUp .3s ease both" }}>
                  <div style={{ color: C.muted, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600, marginBottom: 16 }}>Your recent checks</div>
                  {!historyLoaded && <div style={{ color: C.muted, textAlign: "center", padding: 50 }}>Loading…</div>}
                  {historyLoaded && history.length === 0 && (
                    <div style={{ color: C.muted, textAlign: "center", padding: 50, background: C.cream, borderRadius: 14, border: `1px dashed ${C.border}` }}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>🗒️</div>No symptom checks yet.
                    </div>
                  )}
                  {history.map(item => <HistoryItem key={item.id} item={item} />)}
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{ marginTop: 16, background: C.blush, border: "1px solid #f4a0b0", borderRadius: 12, padding: "12px 16px", color: "#a02040", fontSize: 14, fontWeight: 500 }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Result */}
              {result && tab !== "history" && <ResultCard result={result} transcript={transcript} />}
            </div>
          </div>

          <p style={{ textAlign: "center", color: C.border, fontSize: 12, marginTop: 28 }}>
            MediCore · AI Symptom Checker · Not a substitute for professional medical advice
          </p>
        </div>
      </div>
    </>
  );
}