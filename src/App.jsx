import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   LEVLR  ·  Premium Self-Improvement RPG
   Design: Dark Luxury Athletic · Obsidian + Gold · Bebas Neue + DM Sans
───────────────────────────────────────────────────────────────────────────── */

const STORAGE_KEY = "levlr_v3";
const XP_PER_LEVEL = 600;

const LEVELS = [
  { name: "INITIATE",      min: 0    },
  { name: "OPERATOR",      min: 600  },
  { name: "ENFORCER",      min: 1200 },
  { name: "APEX",          min: 1800 },
  { name: "ASCENDANT",     min: 2400 },
  { name: "PRIME PROTOCOL",min: 3000 },
];

const STATS = [
  { key:"power",    label:"POWER",    sub:"Training",   icon:"⚡", accent:"#38BDF8", dim:"#0C2A3A" },
  { key:"presence", label:"PRESENCE", sub:"Grooming",   icon:"💎", accent:"#D946EF", dim:"#2C1050" },
  { key:"fuel",     label:"FUEL",     sub:"Nutrition",  icon:"🔋", accent:"#22D3A0", dim:"#1C0E2E" },
  { key:"recharge", label:"RECHARGE", sub:"Recovery",   icon:"🌙", accent:"#818CF8", dim:"#18194A" },
  { key:"intel",    label:"INTEL",    sub:"CS Study",   icon:"⬡",  accent:"#FBBF24", dim:"#2A1C00" },
  { key:"wealth",   label:"WEALTH",   sub:"Finance",    icon:"◈",  accent:"#FB923C", dim:"#2A1000" },
  { key:"aura",     label:"AURA",     sub:"Social",     icon:"◉",  accent:"#F472B6", dim:"#2A0A1A" },
  { key:"clarity",  label:"CLARITY",  sub:"Mindset",    icon:"✦",  accent:"#A78BFA", dim:"#231540" },
];

const MISSIONS = {
  power:   [
    {id:"p1",label:"Complete full workout",xp:80,type:"check"},
    {id:"p2",label:"Push-ups",xp:0,type:"number",unit:"reps",xpPer:0.8},
    {id:"p3",label:"Sprint rounds",xp:0,type:"number",unit:"rounds",xpPer:10},
    {id:"p4",label:"Jump training session",xp:60,type:"check"},
    {id:"p5",label:"Mobility & stretching",xp:30,type:"check"},
  ],
  presence:[
    {id:"g1",label:"Morning skincare",xp:40,type:"check"},
    {id:"g2",label:"Evening skincare",xp:40,type:"check"},
    {id:"g3",label:"Water intake",xp:0,type:"number",unit:"L",xpPer:25},
    {id:"g4",label:"Grooming routine",xp:30,type:"check"},
  ],
  fuel:[
    {id:"f1",label:"Protein intake",xp:0,type:"number",unit:"g",xpPer:0.4},
    {id:"f2",label:"No junk food today",xp:60,type:"check"},
    {id:"f3",label:"Meal prepped",xp:50,type:"check"},
    {id:"f4",label:"No sugary drinks",xp:40,type:"check"},
  ],
  recharge:[
    {id:"r1",label:"8h sleep achieved",xp:80,type:"check"},
    {id:"r2",label:"In bed before 10 PM",xp:50,type:"check"},
    {id:"r3",label:"No screens 30min before bed",xp:40,type:"check"},
    {id:"r4",label:"Active recovery / walk",xp:30,type:"check"},
  ],
  intel:[
    {id:"i1",label:"Study session",xp:0,type:"number",unit:"hrs",xpPer:50},
    {id:"i2",label:"CS50 / freeCodeCamp",xp:70,type:"check"},
    {id:"i3",label:"Read 30 minutes",xp:40,type:"check"},
    {id:"i4",label:"No procrastination",xp:30,type:"check"},
  ],
  wealth:[
    {id:"w1",label:"Tracked expenses",xp:40,type:"check"},
    {id:"w2",label:"No unnecessary spending",xp:50,type:"check"},
    {id:"w3",label:"Saved money today",xp:60,type:"check"},
    {id:"w4",label:"Income action taken",xp:80,type:"check"},
  ],
  aura:[
    {id:"a1",label:"Intentional conversation",xp:40,type:"check"},
    {id:"a2",label:"Helped someone",xp:50,type:"check"},
    {id:"a3",label:"No people-pleasing",xp:40,type:"check"},
    {id:"a4",label:"Social engagement",xp:30,type:"check"},
  ],
  clarity:[
    {id:"c1",label:"Morning intention set",xp:30,type:"check"},
    {id:"c2",label:"4-4-6 breathing done",xp:30,type:"check"},
    {id:"c3",label:"Brain dump / journal",xp:40,type:"check"},
    {id:"c4",label:"Worry window (9 PM)",xp:30,type:"check"},
    {id:"c5",label:"Sunlight walk",xp:40,type:"check"},
  ],
};

const DEFAULT_STATE = {
  xp: 0, streak: 0, lastLog: null,
  stats: Object.fromEntries(STATS.map(s => [s.key, 0])),
  completed: {}, numbers: {}, punishments: 0,
  log: [], name: "OPERATOR",
};

function load() {
  try { return { ...DEFAULT_STATE, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
  catch { return DEFAULT_STATE; }
}
function save(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

function getLevelInfo(xp) {
  let lvl = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) { lvl = i; break; }
  }
  const next = LEVELS[lvl + 1];
  const base = LEVELS[lvl].min;
  const cap  = next ? next.min : LEVELS[lvl].min + XP_PER_LEVEL;
  const pct  = Math.min(100, ((xp - base) / (cap - base)) * 100);
  return { lvl, name: LEVELS[lvl].name, pct, xpLeft: next ? cap - xp : 0 };
}

/* ─── GLOBAL STYLES — MOON PALETTE + NEUMORPHIC DARK ─────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    /* Moon Palette */
    --bg:        #160A22;
    --surf1:     #1C0E2E;
    --surf2:     #231540;
    --surf3:     #2C1A50;

    /* Neumorphic shadows — light from top-left */
    --neu-out:   -4px -4px 10px rgba(255,255,255,0.04), 6px 6px 16px rgba(0,0,0,0.55);
    --neu-in:    inset 3px 3px 8px rgba(0,0,0,0.6), inset -2px -2px 6px rgba(255,255,255,0.04);
    --neu-card:  0 2px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.5);

    /* Accent — Moon violet → periwinkle */
    --accent:    #7B337E;
    --accent2:   #6667AB;
    --accent-hi: #B06BB3;
    --accent-glow: rgba(123,51,126,0.35);

    /* Text */
    --text:      #F5D5E0;
    --text2:     #9980AA;
    --text3:     #4A3560;

    /* Border */
    --border:    rgba(102,103,171,0.12);
    --border2:   rgba(102,103,171,0.22);
  }

  html, body, #root {
    height: 100%;
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 2px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 4px; opacity: 0.4; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-7px); }
  }
  @keyframes glow-pulse {
    0%, 100% { opacity: 0.3; }
    50%       { opacity: 0.8; }
  }
  @keyframes orb-drift {
    0%   { transform: translate(0,0) scale(1); }
    33%  { transform: translate(12px,-8px) scale(1.05); }
    66%  { transform: translate(-8px,10px) scale(0.97); }
    100% { transform: translate(0,0) scale(1); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes complete-pop {
    0%   { transform: scale(1); }
    45%  { transform: scale(1.1); }
    100% { transform: scale(1); }
  }

  .fade-up  { animation: fadeUp 0.45s cubic-bezier(.22,.68,0,1.2) both; }
  .fade-in  { animation: fadeIn 0.25s ease both; }
  .tap:active { transform: scale(0.94); transition: transform 0.08s; }

  /* Neumorphic card */
  .neu-card {
    background: var(--surf1);
    box-shadow: var(--neu-card);
    border: 1px solid var(--border);
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .neu-raised {
    background: var(--surf1);
    box-shadow: var(--neu-out);
  }
  .neu-inset {
    background: var(--bg);
    box-shadow: var(--neu-in);
  }

  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
  input[type=number] { -moz-appearance: textfield; }
`;

/* ─── SMALL COMPONENTS ────────────────────────────────────────────────────── */

function XPBar({ pct, animated = false }) {
  const barRef = useRef(null);
  useEffect(() => {
    if (!animated || !barRef.current) return;
    barRef.current.style.width = "0%";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (barRef.current) barRef.current.style.width = pct + "%";
      });
    });
  }, [pct, animated]);

  return (
    <div style={{
      height: 5, borderRadius: 5,
      background: "rgba(0,0,0,0.4)",
      boxShadow: "inset 1px 1px 4px rgba(0,0,0,0.5)",
      overflow: "hidden", width: "100%",
    }}>
      <div ref={barRef} style={{
        height: "100%", borderRadius: 5,
        background: "linear-gradient(90deg, #420D4B, #7B337E, #B06BB3)",
        width: animated ? "0%" : pct + "%",
        transition: animated ? "width 1.2s cubic-bezier(.4,0,.2,1)" : "none",
        boxShadow: "0 0 10px rgba(176,107,179,0.6)",
      }} />
    </div>
  );
}

function StatBar({ pct, accent, animated = false }) {
  const barRef = useRef(null);
  useEffect(() => {
    if (!animated || !barRef.current) return;
    barRef.current.style.width = "0%";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (barRef.current) barRef.current.style.width = pct + "%";
    }));
  }, [pct, animated]);
  return (
    <div style={{
      height: 3, borderRadius: 3,
      background: "rgba(255,255,255,0.06)",
      overflow: "hidden",
    }}>
      <div ref={barRef} style={{
        height: "100%", borderRadius: 3,
        background: accent,
        width: animated ? "0%" : pct + "%",
        transition: animated ? "width 1s cubic-bezier(.4,0,.2,1)" : "none",
        boxShadow: `0 0 6px ${accent}80`,
      }} />
    </div>
  );
}

function Pill({ label, accent = "#B06BB3" }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 10px", borderRadius: 999,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
      background: accent + "18",
      color: accent,
      border: `1px solid ${accent}30`,
    }}>{label}</span>
  );
}

/* ─── TAB: HOME ────────────────────────────────────────────────────────────── */
function HomeTab({ state, dispatch }) {
  const { lvl, name, pct, xpLeft } = getLevelInfo(state.xp);
  const today = new Date().toDateString();
  const isLoggedToday = state.lastLog === today;

  const totalMissions = Object.values(MISSIONS).flat().length;
  const doneToday = Object.keys(state.completed).filter(k => state.completed[k] === today).length;
  const dayPct = Math.round((doneToday / totalMissions) * 100);

  const topStats = [...STATS]
    .sort((a,b) => (state.stats[b.key]||0) - (state.stats[a.key]||0))
    .slice(0, 3);

  return (
    <div style={{ paddingBottom: 100 }}>

      {/* ── HERO HEADER ── */}
      <div className="fade-up" style={{
        position: "relative", overflow: "hidden",
        background: `linear-gradient(165deg, #231540 0%, #160A22 70%)`,
        borderBottom: "1px solid rgba(102,103,171,0.15)",
        padding: "52px 20px 28px",
        boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
      }}>
        {/* ambient orbs */}
        <div style={{
          position:"absolute", top:-50, right:-30,
          width:220, height:220, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(176,107,179,0.14) 0%, transparent 65%)",
          pointerEvents:"none",
          animation:"orb-drift 8s ease-in-out infinite",
        }} />
        <div style={{
          position:"absolute", bottom:-70, left:-50,
          width:260, height:260, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(102,103,171,0.1) 0%, transparent 65%)",
          pointerEvents:"none",
          animation:"orb-drift 11s ease-in-out infinite reverse",
        }} />

        <p style={{ color:"var(--text2)", fontSize:11, letterSpacing:"0.15em", fontWeight:600, marginBottom:4 }}>
          GOOD {getGreeting()},
        </p>
        <h1 style={{
          fontFamily:"Bebas Neue, sans-serif",
          fontSize:44, letterSpacing:"0.04em", lineHeight:1,
          color:"var(--text)", marginBottom:20,
        }}>
          {state.name}
        </h1>

        {/* Level badge + streak */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, flexWrap:"wrap" }}>
          <div style={{
            background:"linear-gradient(135deg, #420D4B, #7B337E)",
            borderRadius:10, padding:"5px 14px",
            boxShadow:"0 0 16px rgba(123,51,126,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}>
            <span style={{ fontSize:11, fontWeight:800, color:"#F5D5E0", letterSpacing:"0.14em" }}>LVL {lvl + 1}</span>
          </div>
          <Pill label={name} accent="#B06BB3" />
          {state.streak > 0 && (
            <Pill label={`🔥 ${state.streak}d`} accent="#FB923C" />
          )}
        </div>

        {/* XP bar */}
        <div style={{ marginBottom:8 }}>
          <XPBar pct={pct} animated />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontSize:11, color:"var(--text2)" }}>{state.xp.toLocaleString()} XP total</span>
          {xpLeft > 0 && <span style={{ fontSize:11, color:"var(--text3)" }}>{xpLeft} to next level</span>}
        </div>
      </div>

      <div style={{ padding:"20px 16px 0", display:"flex", flexDirection:"column", gap:14 }}>

        {/* ── TODAY'S PROGRESS ── */}
        <div className="fade-up" style={{ animationDelay:"0.05s",
          background:"#1C0E2E",
          borderRadius:24,
          border:"1px solid rgba(102,103,171,0.14)",
          borderTop:"1px solid rgba(255,255,255,0.06)",
          padding:20, overflow:"hidden", position:"relative",
          boxShadow:"-3px -3px 8px rgba(255,255,255,0.03), 5px 5px 20px rgba(0,0,0,0.55)",
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
            background:`linear-gradient(90deg, transparent, rgba(123,51,126,${dayPct/100 * 1.5}), transparent)` }} />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
            <div>
              <p style={{ fontSize:11, color:"var(--text2)", letterSpacing:"0.12em", fontWeight:600, marginBottom:4 }}>TODAY'S PROTOCOL</p>
              <p style={{ fontFamily:"Bebas Neue", fontSize:32, letterSpacing:"0.04em", lineHeight:1 }}>
                <span style={{ color:"#B06BB3" }}>{doneToday}</span>
                <span style={{ color:"var(--text3)", fontSize:20 }}>/{totalMissions}</span>
              </p>
            </div>
            <div style={{
              width:56, height:56, borderRadius:"50%",
              background:`conic-gradient(#7B337E ${dayPct * 3.6}deg, rgba(255,255,255,0.04) 0deg)`,
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 0 16px rgba(123,51,126,0.35)",
            }}>
              <div style={{
                width:42, height:42, borderRadius:"50%",
                background:"#160A22",
                boxShadow:"inset 2px 2px 6px rgba(0,0,0,0.6)",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <span style={{ fontFamily:"Bebas Neue", fontSize:13, color:"#B06BB3" }}>{dayPct}%</span>
              </div>
            </div>
          </div>
          <div style={{ height:2, background:"rgba(255,255,255,0.05)", borderRadius:2, overflow:"hidden" }}>
            <div style={{
              height:"100%", borderRadius:2,
              background:"linear-gradient(90deg, #420D4B, #B06BB3)",
              width: dayPct + "%",
              transition:"width 1s ease",
              boxShadow:"0 0 8px rgba(176,107,179,0.5)",
            }} />
          </div>
        </div>

        {/* ── TOP STATS ── */}
        <div className="fade-up" style={{ animationDelay:"0.1s" }}>
          <p style={{ fontSize:11, color:"var(--text2)", letterSpacing:"0.12em", fontWeight:600, marginBottom:10 }}>YOUR ATTRIBUTES</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {topStats.map((s, i) => (
              <div key={s.key} className="fade-up" style={{
                animationDelay: `${0.1 + i * 0.06}s`,
                background:"#1C0E2E", borderRadius:16,
                border:"1px solid rgba(102,103,171,0.12)",
                borderTop:"1px solid rgba(255,255,255,0.05)",
                padding:"12px 16px",
                display:"flex", alignItems:"center", gap:14,
                boxShadow:"-2px -2px 6px rgba(255,255,255,0.02), 4px 4px 14px rgba(0,0,0,0.5)",
              }}>
                <div style={{
                  width:40, height:40, borderRadius:12, flexShrink:0,
                  background: s.dim,
                  border:`1px solid ${s.accent}25`,
                  boxShadow:`inset 2px 2px 6px rgba(0,0,0,0.5), 0 0 10px ${s.accent}20`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:18,
                }}>
                  {s.icon}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontFamily:"Bebas Neue", fontSize:14, letterSpacing:"0.08em" }}>{s.label}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:s.accent }}>
                      {Math.round(state.stats[s.key] || 0)}
                    </span>
                  </div>
                  <StatBar pct={Math.min(100,(state.stats[s.key]||0)/5)} accent={s.accent} animated />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── STREAK CARD ── */}
        {state.streak > 0 && (
          <div className="fade-up" style={{ animationDelay:"0.25s",
            background:"linear-gradient(135deg, #1A0F00, #2A1800)",
            borderRadius:16, border:"1px solid rgba(251,146,60,0.2)",
            padding:"16px 20px",
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <div>
              <p style={{ fontSize:11, color:"rgba(251,146,60,0.7)", letterSpacing:"0.12em", fontWeight:600, marginBottom:4 }}>STREAK BONUS</p>
              <p style={{ fontFamily:"Bebas Neue", fontSize:26, letterSpacing:"0.04em", color:"#FB923C" }}>
                +{Math.min(state.streak * 3, 198)}% XP
              </p>
            </div>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontFamily:"Bebas Neue", fontSize:44, lineHeight:1, color:"#FB923C" }}>{state.streak}</p>
              <p style={{ fontSize:11, color:"rgba(251,146,60,0.6)" }}>DAY STREAK</p>
            </div>
          </div>
        )}

        {/* ── QUOTE ── */}
        <div className="fade-up" style={{ animationDelay:"0.3s",
          borderLeft:"2px solid rgba(176,107,179,0.5)",
          paddingLeft:16, paddingTop:2, paddingBottom:2,
        }}>
          <p style={{ fontSize:14, color:"var(--text2)", fontStyle:"italic", lineHeight:1.6 }}>
            "{getDailyQuote()}"
          </p>
        </div>

      </div>
    </div>
  );
}

/* ─── TAB: MISSIONS ───────────────────────────────────────────────────────── */
function MissionsTab({ state, dispatch }) {
  const [activeStat, setActiveStat] = useState("power");
  const [numberVals, setNumberVals] = useState({});
  const [justCompleted, setJustCompleted] = useState(null);

  const today = new Date().toDateString();
  const stat  = STATS.find(s => s.key === activeStat);

  function isDone(id) { return state.completed[id] === today; }

  function complete(mission) {
    if (isDone(mission.id)) return;
    const xpGain = mission.type === "check" ? mission.xp
      : Math.round((parseFloat(numberVals[mission.id] || 0)) * mission.xpPer);
    if (mission.type === "number" && xpGain === 0) return;

    const bonus   = 1 + (state.streak * 0.03);
    const earned  = Math.round(xpGain * bonus);
    const statInc = earned * 0.1;

    setJustCompleted(mission.id);
    setTimeout(() => setJustCompleted(null), 600);

    dispatch({ type:"COMPLETE", id:mission.id, today, earned, statKey:activeStat, statInc });
  }

  return (
    <div style={{ paddingBottom:100 }}>
      {/* header */}
      <div style={{
        padding:"52px 16px 16px",
        borderBottom:"1px solid var(--border)",
        background:"var(--surf1)",
      }}>
        <p className="fade-up" style={{ fontSize:11, color:"var(--text2)", letterSpacing:"0.15em", fontWeight:600, marginBottom:4 }}>DAILY PROTOCOL</p>
        <h2 className="fade-up" style={{ fontFamily:"Bebas Neue", fontSize:34, letterSpacing:"0.04em", animationDelay:"0.05s" }}>MISSIONS</h2>
      </div>

      {/* stat picker */}
      <div style={{ padding:"14px 0 0", borderBottom:"1px solid var(--border)", background:"var(--surf1)" }}>
        <div style={{
          display:"flex", gap:8, paddingLeft:16,
          overflowX:"auto", paddingBottom:16,
          scrollbarWidth:"none",
        }}>
          {STATS.map((s, i) => {
            const active = s.key === activeStat;
            const doneCt = MISSIONS[s.key]?.filter(m => state.completed[m.id] === today).length || 0;
            const totCt  = MISSIONS[s.key]?.length || 0;
            return (
              <button key={s.key} className="tap" onClick={() => setActiveStat(s.key)}
                style={{
                  flexShrink:0, display:"flex", flexDirection:"column",
                  alignItems:"center", gap:4,
                  padding:"10px 14px",
                  borderRadius:12, border:"none", cursor:"pointer",
                  transition:"all 0.2s",
                  background: active ? s.dim : "transparent",
                  outline: active ? `1px solid ${s.accent}40` : "1px solid transparent",
                  animationDelay: `${i * 0.03}s`,
                }}>
                <span style={{ fontSize:20 }}>{s.icon}</span>
                <span style={{ fontFamily:"Bebas Neue", fontSize:10, letterSpacing:"0.1em",
                  color: active ? s.accent : "var(--text3)", }}>
                  {s.label}
                </span>
                <span style={{ fontSize:9, color: active ? s.accent : "var(--text3)" }}>
                  {doneCt}/{totCt}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* missions list */}
      <div style={{ padding:"16px 16px 0", display:"flex", flexDirection:"column", gap:10 }}>
        {MISSIONS[activeStat].map((m, i) => {
          const done   = isDone(m.id);
          const popped = justCompleted === m.id;
          return (
            <div key={m.id} className="fade-up" style={{
              animationDelay: `${i * 0.07}s`,
              borderRadius:16,
              border:`1px solid ${done ? stat.accent + "30" : "var(--border)"}`,
              background: done ? stat.dim : "var(--surf1)",
              padding:"14px 16px",
              transform: popped ? "scale(1.03)" : "scale(1)",
              transition:"transform 0.3s cubic-bezier(.22,.68,0,1.3), background 0.3s, border-color 0.3s",
              overflow:"hidden", position:"relative",
            }}>
              {done && <div style={{
                position:"absolute", top:0, left:0, right:0, height:1,
                background:`linear-gradient(90deg, transparent, ${stat.accent}, transparent)`,
              }} />}
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                {/* checkbox / status */}
                <button className="tap" onClick={() => done ? null : complete(m)}
                  style={{
                    width:28, height:28, borderRadius:8, flexShrink:0,
                    border:`1.5px solid ${done ? stat.accent : "var(--border2)"}`,
                    background: done ? stat.accent : "transparent",
                    cursor: done ? "default" : "pointer",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"all 0.25s",
                    boxShadow: done ? `0 0 10px ${stat.accent}50` : "none",
                  }}>
                  {done && <span style={{ color:"#000", fontSize:13, fontWeight:800 }}>✓</span>}
                </button>

                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{
                    fontSize:14, fontWeight:done ? 500 : 400,
                    color: done ? stat.accent : "var(--text)",
                    textDecoration: done ? "none" : "none",
                    marginBottom: m.type === "number" ? 8 : 0,
                  }}>{m.label}</p>

                  {m.type === "number" && !done && (
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <input
                        type="number" min="0"
                        value={numberVals[m.id] || ""}
                        onChange={e => setNumberVals(p => ({ ...p, [m.id]: e.target.value }))}
                        placeholder="0"
                        style={{
                          width:70, padding:"6px 10px",
                          background:"rgba(255,255,255,0.05)",
                          border:"1px solid var(--border2)", borderRadius:8,
                          color:"var(--text)", fontSize:13,
                          outline:"none",
                        }}
                      />
                      <span style={{ fontSize:12, color:"var(--text2)" }}>{m.unit}</span>
                      <button className="tap" onClick={() => complete(m)} style={{
                        marginLeft:"auto",
                        padding:"6px 14px", borderRadius:8, border:"none",
                        background:`linear-gradient(135deg, ${stat.accent}22, ${stat.accent}11)`,
                        color:stat.accent, fontSize:12, fontWeight:700,
                        cursor:"pointer", letterSpacing:"0.06em",
                        border:`1px solid ${stat.accent}30`,
                      }}>LOG</button>
                    </div>
                  )}
                </div>

                <span style={{ fontSize:11, fontWeight:700, color: done ? stat.accent : "var(--text3)", whiteSpace:"nowrap" }}>
                  +{m.type === "check" ? m.xp : `${m.xpPer}/${m.unit}`} XP
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── TAB: STATS ─────────────────────────────────────────────────────────── */
function StatsTab({ state }) {
  const { lvl, name, pct } = getLevelInfo(state.xp);

  return (
    <div style={{ paddingBottom:100 }}>
      <div style={{
        padding:"52px 16px 20px",
        borderBottom:"1px solid var(--border)",
        background:"var(--surf1)",
      }}>
        <p className="fade-up" style={{ fontSize:11, color:"var(--text2)", letterSpacing:"0.15em", fontWeight:600, marginBottom:4 }}>CHARACTER SHEET</p>
        <h2 className="fade-up" style={{ fontFamily:"Bebas Neue", fontSize:34, letterSpacing:"0.04em", animationDelay:"0.05s" }}>ATTRIBUTES</h2>
      </div>

      {/* XP overview */}
      <div style={{ padding:"20px 16px 0" }}>
        <div className="fade-up" style={{
          background:"var(--surf1)", borderRadius:24,
          border:"1px solid var(--border)",
          padding:20, marginBottom:16, position:"relative", overflow:"hidden",
        }}>
          <div style={{
            position:"absolute", top:-30, right:-30, width:120, height:120,
            borderRadius:"50%",
            background:"radial-gradient(circle, rgba(123,51,126,0.12) 0%, transparent 70%)",
          }} />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:16 }}>
            <div>
              <p style={{ fontSize:11, color:"var(--text2)", letterSpacing:"0.12em", fontWeight:600, marginBottom:8 }}>TOTAL EXPERIENCE</p>
              <p style={{ fontFamily:"Bebas Neue", fontSize:44, letterSpacing:"0.04em", lineHeight:1, color:"#B06BB3" }}>
                {state.xp.toLocaleString()}
                <span style={{ fontSize:18, color:"var(--text3)", marginLeft:6 }}>XP</span>
              </p>
            </div>
            <div style={{ textAlign:"right" }}>
              <Pill label={name} accent="#B06BB3" />
              <p style={{ fontSize:11, color:"var(--text3)", marginTop:6 }}>Level {lvl + 1}</p>
            </div>
          </div>
          <XPBar pct={pct} animated />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
            <span style={{ fontSize:10, color:"var(--text3)" }}>LEVEL {lvl + 1}</span>
            {lvl < LEVELS.length - 1 && <span style={{ fontSize:10, color:"var(--text3)" }}>LEVEL {lvl + 2}</span>}
          </div>
        </div>

        {/* Attribute grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {STATS.map((s, i) => {
            const val = Math.round(state.stats[s.key] || 0);
            const pct2 = Math.min(100, val / 5);
            return (
              <div key={s.key} className="fade-up" style={{
                animationDelay: `${i * 0.05}s`,
                background:"var(--surf1)", borderRadius:16,
                border:`1px solid ${val > 0 ? s.accent + "22" : "var(--border)"}`,
                padding:"14px 14px",
                position:"relative", overflow:"hidden",
                transition:"border-color 0.3s",
              }}>
                {val > 0 && <div style={{
                  position:"absolute", top:0, left:0, right:0, height:1,
                  background:`linear-gradient(90deg, transparent, ${s.accent}60, transparent)`,
                }} />}
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <div style={{
                    width:34, height:34, borderRadius:9, flexShrink:0,
                    background:s.dim, border:`1px solid ${s.accent}20`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:16,
                  }}>{s.icon}</div>
                  <div>
                    <p style={{ fontFamily:"Bebas Neue", fontSize:13, letterSpacing:"0.08em", lineHeight:1 }}>{s.label}</p>
                    <p style={{ fontSize:10, color:"var(--text2)", marginTop:2 }}>{s.sub}</p>
                  </div>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}>
                  <span style={{ fontFamily:"Bebas Neue", fontSize:28, color: val > 0 ? s.accent : "var(--text3)" }}>{val}</span>
                  <span style={{ fontSize:10, color:"var(--text3)" }}>pts</span>
                </div>
                <StatBar pct={pct2} accent={s.accent} animated />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── TAB: PROFILE ───────────────────────────────────────────────────────── */
function ProfileTab({ state, dispatch }) {
  const { lvl, name } = getLevelInfo(state.xp);
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState(state.name);

  function saveN() {
    if (nameInput.trim()) dispatch({ type:"SET_NAME", name: nameInput.trim().toUpperCase() });
    setEditName(false);
  }

  const MILESTONES = [
    { label:"First Step",    target:1,   stat:"streak", icon:"👣" },
    { label:"One Week",      target:7,   stat:"streak", icon:"🔥" },
    { label:"21 Days",       target:21,  stat:"streak", icon:"⚡" },
    { label:"Apex Streak",   target:30,  stat:"streak", icon:"🏆" },
    { label:"66-Day Lock",   target:66,  stat:"streak", icon:"🔒" },
    { label:"Ascendant",     target:90,  stat:"streak", icon:"🌟" },
    { label:"Level 2",       target:600, stat:"xp",     icon:"⬡" },
    { label:"Level 3",       target:1200,stat:"xp",     icon:"💎" },
    { label:"Level 4",       target:1800,stat:"xp",     icon:"👑" },
  ];

  function milestoneProgress(m) {
    const val = m.stat === "streak" ? state.streak : state.xp;
    return Math.min(100, (val / m.target) * 100);
  }
  function milestoneDone(m) {
    const val = m.stat === "streak" ? state.streak : state.xp;
    return val >= m.target;
  }

  return (
    <div style={{ paddingBottom:100 }}>
      <div style={{
        padding:"52px 16px 20px",
        borderBottom:"1px solid var(--border)",
        background:"var(--surf1)",
      }}>
        <p className="fade-up" style={{ fontSize:11, color:"var(--text2)", letterSpacing:"0.15em", fontWeight:600, marginBottom:4 }}>YOUR IDENTITY</p>
        <h2 className="fade-up" style={{ fontFamily:"Bebas Neue", fontSize:34, letterSpacing:"0.04em", animationDelay:"0.05s" }}>PROFILE</h2>
      </div>

      <div style={{ padding:"20px 16px 0", display:"flex", flexDirection:"column", gap:14 }}>

        {/* identity card */}
        <div className="fade-up" style={{
          background:`linear-gradient(145deg, #1C0E2E, #231540)`,
          borderRadius:24,
          border:"1px solid var(--border)",
          padding:20, position:"relative", overflow:"hidden",
        }}>
          <div style={{
            position:"absolute", top:-40, right:-20, width:160, height:160, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(123,51,126,0.08) 0%, transparent 70%)",
            animation:"float 6s ease-in-out infinite",
          }} />
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
            <div style={{
              width:60, height:60, borderRadius:16,
              background:"linear-gradient(135deg, #2C1A50, #1C0E2E)",
              border:"1.5px solid rgba(102,103,171,0.35)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:26,
              boxShadow:"0 0 20px rgba(123,51,126,0.12)",
            }}>⚔️</div>
            <div>
              {editName ? (
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <input
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && saveN()}
                    autoFocus
                    style={{
                      background:"rgba(255,255,255,0.07)",
                      border:"1px solid var(--border2)",
                      borderRadius:8, color:"var(--text)",
                      fontFamily:"Bebas Neue", fontSize:22,
                      padding:"4px 10px", width:140, outline:"none",
                      letterSpacing:"0.06em",
                    }}
                  />
                  <button className="tap" onClick={saveN} style={{
                    padding:"6px 12px", borderRadius:8,
                    background:"rgba(123,51,126,0.18)",
                    color:"#B06BB3", border:"1px solid rgba(102,103,171,0.35)",
                    fontSize:12, fontWeight:700, cursor:"pointer",
                  }}>SAVE</button>
                </div>
              ) : (
                <button className="tap" onClick={() => setEditName(true)} style={{
                  background:"none", border:"none", cursor:"pointer", textAlign:"left", padding:0
                }}>
                  <p style={{ fontFamily:"Bebas Neue", fontSize:26, letterSpacing:"0.06em", lineHeight:1, color:"var(--text)" }}>{state.name}</p>
                  <p style={{ fontSize:11, color:"var(--text2)", marginTop:4 }}>Tap to rename</p>
                </button>
              )}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            {[
              { label:"LEVEL", value: lvl + 1, accent:"#B06BB3" },
              { label:"STREAK", value: `${state.streak}d`, accent:"#FB923C" },
              { label:"RANK", value: name.split(" ")[0], accent:"#818CF8" },
            ].map(item => (
              <div key={item.label} style={{
                background:"rgba(255,255,255,0.03)", borderRadius:12,
                padding:"10px 0", textAlign:"center",
                border:"1px solid var(--border)",
              }}>
                <p style={{ fontFamily:"Bebas Neue", fontSize:22, color:item.accent, letterSpacing:"0.06em" }}>{item.value}</p>
                <p style={{ fontSize:9, color:"var(--text3)", letterSpacing:"0.1em", marginTop:2 }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* milestones */}
        <div className="fade-up" style={{ animationDelay:"0.1s" }}>
          <p style={{ fontSize:11, color:"var(--text2)", letterSpacing:"0.12em", fontWeight:600, marginBottom:10 }}>MILESTONES</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {MILESTONES.map((m, i) => {
              const done = milestoneDone(m);
              const p = milestoneProgress(m);
              return (
                <div key={m.label} className="fade-up" style={{
                  animationDelay:`${0.1 + i*0.04}s`,
                  background: done ? "rgba(123,51,126,0.05)" : "var(--surf1)",
                  borderRadius:12,
                  border:`1px solid ${done ? "rgba(102,103,171,0.25)" : "var(--border)"}`,
                  padding:"12px 14px",
                  display:"flex", alignItems:"center", gap:12,
                }}>
                  <span style={{ fontSize:20, filter: done ? "none" : "grayscale(1) opacity(0.4)" }}>{m.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontSize:13, fontWeight:500, color: done ? "#B06BB3" : "var(--text)" }}>{m.label}</span>
                      <span style={{ fontSize:11, color: done ? "#B06BB3" : "var(--text3)" }}>
                        {done ? "✓ DONE" : `${Math.round(p)}%`}
                      </span>
                    </div>
                    <div style={{ height:2, background:"rgba(255,255,255,0.05)", borderRadius:2, overflow:"hidden" }}>
                      <div style={{
                        height:"100%", borderRadius:2,
                        background: done ? "linear-gradient(90deg, #420D4B, #B06BB3)" : "rgba(255,255,255,0.15)",
                        width: p + "%",
                        transition:"width 1s ease",
                        boxShadow: done ? "0 0 6px rgba(176,107,179,0.5)" : "none",
                      }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* danger zone */}
        <div className="fade-up" style={{ animationDelay:"0.2s",
          background:"rgba(239,68,68,0.04)", borderRadius:16,
          border:"1px solid rgba(239,68,68,0.15)", padding:16,
        }}>
          <p style={{ fontSize:12, color:"rgba(239,68,68,0.7)", letterSpacing:"0.1em", fontWeight:700, marginBottom:12 }}>DANGER ZONE</p>
          <button className="tap" onClick={() => {
            if (window.confirm("Reset ALL progress? This cannot be undone.")) {
              localStorage.removeItem(STORAGE_KEY);
              window.location.reload();
            }
          }} style={{
            padding:"10px 16px", borderRadius:10,
            background:"rgba(239,68,68,0.08)",
            border:"1px solid rgba(239,68,68,0.25)",
            color:"rgba(239,68,68,0.8)", fontSize:12, fontWeight:700,
            cursor:"pointer", letterSpacing:"0.08em",
          }}>RESET PROTOCOL</button>
        </div>

      </div>
    </div>
  );
}

/* ─── REDUCER ─────────────────────────────────────────────────────────────── */
function reducer(state, action) {
  switch (action.type) {
    case "COMPLETE": {
      const today = action.today;
      const wasToday = state.lastLog === today;
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = state.lastLog === yesterday.toDateString();
      const newStreak = wasToday ? state.streak : (wasYesterday ? state.streak + 1 : 1);
      const next = {
        ...state,
        xp: state.xp + action.earned,
        streak: newStreak,
        lastLog: today,
        completed: { ...state.completed, [action.id]: today },
        stats: { ...state.stats, [action.statKey]: (state.stats[action.statKey] || 0) + action.statInc },
        log: [{ id:action.id, xp:action.earned, ts: Date.now() }, ...state.log.slice(0,49)],
      };
      save(next); return next;
    }
    case "SET_NAME": {
      const next = { ...state, name: action.name };
      save(next); return next;
    }
    default: return state;
  }
}

/* ─── UTILITIES ───────────────────────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "MORNING";
  if (h < 17) return "AFTERNOON";
  return "EVENING";
}

const QUOTES = [
  "The only way out is through.",
  "Discipline is choosing what you want most over what you want now.",
  "Excellence is not a destination — it's a continuous journey.",
  "Don't count the days. Make the days count.",
  "Pain is temporary. Quitting lasts forever.",
  "Be so good they can't ignore you.",
  "The secret is there is no secret. Just work.",
  "Champions aren't born. They're forged.",
];
function getDailyQuote() {
  return QUOTES[new Date().getDate() % QUOTES.length];
}

/* ─── GUIDE DATA ─────────────────────────────────────────────────────────── */

const TRAINING_DAYS = {
  1: { // Monday
    name: "PUSH DAY",
    tag: "CHEST · TRICEPS · SHOULDERS",
    accent: "#38BDF8",
    dim: "#0C2A3A",
    icon: "💪",
    tip: "Rest 60 seconds between sets. Focus on controlled reps, not speed.",
    exercises: [
      { name: "Push-ups", sets: "4 x 20 reps", note: "Full range, chest to floor" },
      { name: "Wide Push-ups", sets: "3 x 15 reps", note: "Elbows flared — chest focus" },
      { name: "Diamond Push-ups", sets: "3 x 12 reps", note: "Hands together — triceps" },
      { name: "Pike Push-ups", sets: "4 x 12 reps", note: "Hips high, head toward floor — shoulders" },
      { name: "Decline Push-ups", sets: "3 x 12 reps", note: "Feet on chair" },
      { name: "Slow Negatives", sets: "3 x 8 reps", note: "3 seconds down, explode up" },
      { name: "Plank", sets: "3 x 60 sec", note: "Core tight, don't let hips drop" },
      { name: "Side Plank", sets: "2 x 45 sec each side", note: "" },
    ],
  },
  2: { // Tuesday
    name: "LEGS + VERTICAL",
    tag: "EXPLOSIVENESS · DUNKING",
    accent: "#22D3A0",
    dim: "#1C0E2E",
    icon: "🦵",
    tip: "Rest 90 sec between vertical sets, 60 sec between strength sets.",
    exercises: [
      { name: "Depth Jumps", sets: "4 x 8", note: "Step off chair, land and IMMEDIATELY jump — zero pause" },
      { name: "Box Jumps", sets: "4 x 10", note: "Use a step or low wall" },
      { name: "Broad Jumps", sets: "4 x 8", note: "Max horizontal distance each jump" },
      { name: "Single Leg Bounds", sets: "3 x 10 each leg", note: "Drive knee up aggressively" },
      { name: "Rim Touches", sets: "5 x 5", note: "Jump and reach your absolute highest point every rep" },
      { name: "Squats", sets: "4 x 20", note: "Bodyweight, full depth" },
      { name: "Bulgarian Split Squats", sets: "4 x 12 each leg", note: "Rear foot on chair" },
      { name: "Wall Sit", sets: "3 x 60 sec", note: "Quads parallel to floor" },
      { name: "Calf Raises", sets: "4 x 30", note: "Full extension at top" },
      { name: "Glute Bridges", sets: "3 x 20", note: "Squeeze at top, hold 1 second" },
    ],
  },
  3: { // Wednesday
    name: "PULL + CORE",
    tag: "BACK · ABS · POSTURE",
    accent: "#A78BFA",
    dim: "#231540",
    icon: "🔥",
    tip: "Table rows are your pull-ups. Do them strict. Squeeze shoulder blades.",
    exercises: [
      { name: "Table Rows", sets: "4 x 12", note: "Lie under table, grab edge, pull chest up" },
      { name: "Towel Rows", sets: "4 x 15", note: "Loop towel around door handle, lean back and row" },
      { name: "Superman Holds", sets: "4 x 12", note: "Face down, lift arms and legs simultaneously" },
      { name: "Reverse Snow Angels", sets: "3 x 15", note: "Face down, sweep arms wide" },
      { name: "Lying Leg Raises", sets: "4 x 20", note: "Lower back flat on floor the whole time" },
      { name: "Bicycle Crunches", sets: "4 x 30", note: "Slow and deliberate, feel the obliques" },
      { name: "V-ups", sets: "3 x 15", note: "Reach hands to feet simultaneously" },
      { name: "Russian Twists", sets: "3 x 20", note: "Feet off floor for max difficulty" },
      { name: "Hollow Body Hold", sets: "3 x 30 sec", note: "Lower back pressed to floor, arms overhead" },
    ],
  },
  4: { // Thursday
    name: "BASKETBALL + CONDITIONING",
    tag: "SKILLS · SPEED · COURT IQ",
    accent: "#FBBF24",
    dim: "#2A1C00",
    icon: "🏀",
    tip: "This is your most important day. Skills beat athleticism. Watch highlights tonight.",
    exercises: [
      { name: "Shadow Shooting (Mirror)", sets: "50 reps", note: "Form perfect every rep — muscle memory is built here" },
      { name: "Triple Threat Stance", sets: "3 x 30 sec", note: "Hold position, feel your balance point" },
      { name: "Jab Step Series", sets: "3 x 10 each direction", note: "Jab, read, go — decisive" },
      { name: "Drop Step Practice", sets: "3 x 10", note: "Post move fundamentals" },
      { name: "Defensive Slides", sets: "4 x 30 sec", note: "Stay low, move your feet" },
      { name: "Sprint 40m", sets: "10 x 40m (rest 30 sec)", note: "Max effort, full recovery between" },
      { name: "Jump Rope / Mimics", sets: "3 x 3 minutes", note: "" },
      { name: "EVENING: Watch NBA SG Highlights", sets: "20 mins", note: "Study one play. Visualise yourself executing it." },
    ],
  },
  5: { // Friday
    name: "FULL BODY + EXPLOSIVENESS",
    tag: "CIRCUIT · POWER · CONDITIONING",
    accent: "#FB923C",
    dim: "#2A1000",
    icon: "⚡",
    tip: "4 rounds of the circuit, 90 sec rest between rounds. Leave nothing in the tank.",
    exercises: [
      { name: "CIRCUIT x4: Squat Jumps", sets: "15 reps", note: "Land soft, spring straight back up" },
      { name: "CIRCUIT x4: Push-ups", sets: "15 reps", note: "" },
      { name: "CIRCUIT x4: Alternating Lunges", sets: "20 reps", note: "" },
      { name: "CIRCUIT x4: Clap Push-ups", sets: "8 reps", note: "Maximum explosiveness off the floor" },
      { name: "CIRCUIT x4: Tuck Jumps", sets: "10 reps", note: "Knees to chest, land and go again" },
      { name: "CIRCUIT x4: Mountain Climbers", sets: "30 sec", note: "Fast feet" },
      { name: "Burpees", sets: "5 x 10", note: "Full range — chest to floor, jump at top" },
      { name: "Sprint In Place", sets: "5 x 20 sec max effort", note: "Pump arms, drive knees" },
    ],
  },
  6: { // Saturday
    name: "ACTIVE RECOVERY",
    tag: "REST · RESET · RECHARGE",
    accent: "#818CF8",
    dim: "#18194A",
    icon: "🌙",
    tip: "Recovery is where growth happens. Don't skip it. Sunday: batch cook for the week.",
    exercises: [
      { name: "20 Minute Walk", sets: "Minimum", note: "No phone. Just think. Let your mind wander." },
      { name: "Full Body Stretch", sets: "10 mins", note: "Hold each stretch 30+ seconds" },
      { name: "Foam Roll / Massage", sets: "If available", note: "Focus on quads, calves, shoulders" },
      { name: "Sleep 8-9 hours", sets: "Both nights", note: "Non-negotiable — this is training" },
    ],
  },
  0: { // Sunday
    name: "REST + REVIEW",
    tag: "RECOVERY · REFLECTION · PREP",
    accent: "#818CF8",
    dim: "#18194A",
    icon: "🌟",
    tip: "Sunday is your most strategic day. Prep food, review the week, set 3 goals.",
    exercises: [
      { name: "Batch Cook", sets: "1 hour", note: "Boil eggs (12), cook rice (big batch), prep oats" },
      { name: "Weekly Review", sets: "15 mins", note: "7 questions: train every day? Ate clean 80%? Study 3hrs? Best/worst moment? What to change? Closer to your vision?" },
      { name: "20 Minute Walk", sets: "Minimum", note: "Set 3 goals for next week" },
      { name: "Full Body Stretch", sets: "10 mins", note: "" },
    ],
  },
};

const BOOKS = [
  { n:1,  title:"The Alchemist",         author:"Paulo Coelho",    pages:197, month:1,  why:"Belief in your own path — the foundation of everything you're building." },
  { n:2,  title:"Atomic Habits",         author:"James Clear",     pages:320, month:2,  why:"The complete science of habit building. Directly powers your 66-day system." },
  { n:3,  title:"The Obstacle Is The Way",author:"Ryan Holiday",   pages:224, month:3,  why:"Stoicism — turn every hard exam, every tight budget into fuel." },
  { n:4,  title:"Think and Grow Rich",   author:"Napoleon Hill",   pages:320, month:4,  why:"The psychology of building wealth from nothing. Read before first real income." },
  { n:5,  title:"Can't Hurt Me",         author:"David Goggins",   pages:364, month:5,  why:"Building from nothing through pure discipline. Your hard training days companion." },
  { n:6,  title:"Psychology of Money",   author:"Morgan Housel",   pages:256, month:6,  why:"The best money book ever written. Read at month 6 when income starts." },
  { n:7,  title:"How to Win Friends",    author:"Dale Carnegie",   pages:288, month:7,  why:"Directly addresses your social habits. Communication becomes your weapon." },
  { n:8,  title:"Deep Work",             author:"Cal Newport",     pages:296, month:8,  why:"CS professor on focused work. Will double your study output immediately." },
  { n:9,  title:"Meditations",           author:"Marcus Aurelius", pages:254, month:9,  why:"Roman emperor's private journal. One page a day. Life-changing slowly." },
  { n:10, title:"Zero to One",           author:"Peter Thiel",     pages:224, month:10, why:"Building something new. Directly applicable to Levlr." },
  { n:11, title:"The 48 Laws of Power",  author:"Robert Greene",   pages:452, month:11, why:"How power and social dynamics actually work. Read carefully." },
  { n:12, title:"Steve Jobs",            author:"Walter Isaacson", pages:571, month:12, why:"A CS student building an app needs to understand this story end to end." },
];

const MEALS = [
  { time:"6:20 AM", label:"Breakfast",        food:"Oats + banana + peanut butter  OR  3 scrambled eggs + bread",   macros:"380–400 cal · 15–22g protein" },
  { time:"9:15 AM", label:"Mid-morning snack", food:"2 boiled eggs + 1 banana",                                      macros:"220 cal · 14g protein" },
  { time:"12:00 PM",label:"Lunch",             food:"1 cup rice + 3 eggs + ½ can beans + vegetables + spices",       macros:"550 cal · 28g protein" },
  { time:"4:00 PM", label:"Pre-workout",       food:"1 banana + 2 tbsp peanut butter",                               macros:"280 cal · 8g protein" },
  { time:"6:00 PM", label:"Post-workout",      food:"1 cup rice + 3–4 eggs + 1 can tuna — eat within 30 mins",       macros:"600 cal · 45g protein" },
  { time:"8:00 PM", label:"Dinner",            food:"½ can beans + 3 eggs scrambled + bread  OR  pasta + sardines",  macros:"450–520 cal · 30–32g protein" },
  { time:"9:40 PM", label:"Before bed",        food:"2 boiled eggs + peanut butter on bread",                        macros:"300 cal · 16g protein" },
];

const SKINCARE_MORNING = [
  "Wet face with lukewarm water — never hot",
  "Apply pea-sized gentle face wash — circular motions 30 seconds",
  "Rinse thoroughly, pat dry — never rub",
  "Apply lightweight moisturiser while skin slightly damp",
  "Apply SPF 30+ over moisturiser — every single morning",
  "Ice cube on face 1–2 minutes (reduces puffiness, tightens pores)",
];
const SKINCARE_EVENING = [
  "Gentle face wash — removes sweat, bacteria, pollution",
  "Apply ketoconazole shampoo to eyebrows, moustache, ears (3x/week)",
  "Leave ketoconazole on 3–5 minutes then rinse",
  "Apply slightly more moisturiser than morning — night is repair time",
  "Brush teeth + floss",
];
const SKINCARE_WEEKLY = [
  { day:"2x/week", action:"Baking soda exfoliate", note:"Tiny pinch with face wash, gentle circular motions" },
  { day:"1x/week", action:"Face steam", note:"Boil water, bowl, towel over head 5–10 mins — clears pores" },
  { day:"1x/week", action:"Honey mask", note:"Raw honey 10 mins then rinse — natural antibacterial" },
  { day:"Weekly",  action:"Change pillowcase", note:"Biggest hidden cause of skin issues" },
];

const SCHEDULE = [
  { time:"6:00", action:"Wake up", detail:"No snooze. Feet on floor immediately.", stat:"Clarity", icon:"🌅" },
  { time:"6:01", action:"Full glass of water", detail:"Before anything else.", stat:"Fuel", icon:"💧" },
  { time:"6:02", action:"10 deep breaths", detail:"4 in · hold 4 · out 6. Set your intention.", stat:"Clarity", icon:"🌬️" },
  { time:"6:05", action:"Cold shower", detail:"5 minutes. Non-negotiable.", stat:"Recharge", icon:"🚿" },
  { time:"6:10", action:"Morning skincare", detail:"Face wash → moisturiser → SPF.", stat:"Presence", icon:"💎" },
  { time:"6:13", action:"Grooming + get dressed", detail:"Brush teeth, deodorant, clean clothes that fit.", stat:"Presence", icon:"👕" },
  { time:"6:20", action:"Breakfast", detail:"Oats or eggs. Eat within 30 mins of waking.", stat:"Fuel", icon:"🍳" },
  { time:"6:30", action:"Journal", detail:"3 gratitudes + goal for today + one non-compromise.", stat:"Clarity", icon:"📓" },
  { time:"6:40", action:"Review missions", detail:"Open Levlr. Check what needs doing today.", stat:"Intel", icon:"📱" },
  { time:"6:45", action:"Walk to class", detail:"Podcast or silence. No scrolling.", stat:"Power", icon:"🚶" },
  { time:"7:15", action:"Deep CS study", detail:"Hardest material first. Phone away. 2 full hours.", stat:"Intel", icon:"💻" },
  { time:"9:15", action:"Break", detail:"Walk outside. No phone. Let brain reset.", stat:"Recharge", icon:"🌳" },
  { time:"9:30", action:"Classes / continued study", detail:"2 hours.", stat:"Intel", icon:"📚" },
  { time:"11:30", action:"Review notes", detail:"Summarise what you learned in your own words.", stat:"Intel", icon:"✏️" },
  { time:"12:00", action:"Lunch", detail:"Rice + protein. 20 minutes.", stat:"Fuel", icon:"🍚" },
  { time:"12:20", action:"Sunlight walk", detail:"10 minutes outside. No exceptions.", stat:"Recharge", icon:"☀️" },
  { time:"12:30", action:"Basketball IQ or reading", detail:"15 mins highlights or book.", stat:"Intel", icon:"🏀" },
  { time:"13:00", action:"Afternoon study", detail:"Coding practice. 2 hours.", stat:"Intel", icon:"⌨️" },
  { time:"15:00", action:"Break", detail:"Stretch, hydrate, snack.", stat:"Fuel", icon:"🧃" },
  { time:"15:15", action:"Review + prep", detail:"Practice problems, prep for tomorrow.", stat:"Intel", icon:"📐" },
  { time:"16:00", action:"Pre-workout", detail:"Banana + peanut butter.", stat:"Fuel", icon:"🍌" },
  { time:"16:30", action:"TRAINING SESSION", detail:"See today's workout in Guide → Training.", stat:"Power", icon:"⚡", highlight: true },
  { time:"17:45", action:"Cool down + stretching", detail:"15 minutes. Don't skip this.", stat:"Recharge", icon:"🧘" },
  { time:"18:00", action:"Post-workout meal", detail:"Rice + eggs + tuna. Within 30 mins of finishing.", stat:"Fuel", icon:"🥚" },
  { time:"18:30", action:"Personal project", detail:"App work, portfolio, side projects.", stat:"Intel", icon:"🛠️" },
  { time:"19:30", action:"Social time", detail:"Real conversations. Be present.", stat:"Aura", icon:"🤝" },
  { time:"20:30", action:"Finance check", detail:"Log what you spent today. 10 minutes.", stat:"Wealth", icon:"💰" },
  { time:"20:40", action:"Shadow shooting", detail:"Mirror work on form. 10 minutes.", stat:"Power", icon:"🏀" },
  { time:"20:50", action:"Read", detail:"20 pages minimum.", stat:"Clarity", icon:"📖" },
  { time:"21:10", action:"Brain dump + Worry window", detail:"Empty your mind onto paper. Then let it go.", stat:"Clarity", icon:"🧠" },
  { time:"21:20", action:"Evening skincare", detail:"Face wash → moisturiser → brush + floss.", stat:"Presence", icon:"🌙" },
  { time:"21:30", action:"Log all missions", detail:"Open Levlr. Mark everything you completed.", stat:"ALL", icon:"📱", highlight: true },
  { time:"21:40", action:"Before bed snack", detail:"2 boiled eggs + peanut butter bread.", stat:"Fuel", icon:"🥜" },
  { time:"21:45", action:"No screens", detail:"Prepare clothes for tomorrow.", stat:"Clarity", icon:"👕" },
  { time:"22:00", action:"SLEEP", detail:"8 hours. Non-negotiable.", stat:"Recharge", icon:"😴", highlight: true },
];

const STAT_COLORS = {
  Power:"#38BDF8", Presence:"#D946EF", Fuel:"#22D3A0", Recharge:"#818CF8",
  Intel:"#FBBF24", Wealth:"#FB923C", Aura:"#F472B6", Clarity:"#A78BFA", ALL:"#B06BB3",
};

/* ─── GUIDE TAB ───────────────────────────────────────────────────────────── */
function GuideTab({ state }) {
  const [section, setSection] = useState("training");
  const [openIdx, setOpenIdx] = useState(null);

  const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon … 6=Sat
  const hour = new Date().getHours();
  const isMorning = hour < 13;

  // determine current book
  const monthsIn = Math.min(11, Math.max(0, Math.floor(state.streak / 30)));
  const currentBook = BOOKS[monthsIn];
  const pagesPerDay = 20;
  const dayOfMonth = new Date().getDate();
  const suggestedPageStart = Math.min(currentBook.pages - pagesPerDay, (dayOfMonth - 1) * pagesPerDay + 1);
  const suggestedPageEnd = Math.min(currentBook.pages, suggestedPageStart + pagesPerDay - 1);

  const training = TRAINING_DAYS[dayOfWeek];
  const isRestDay = dayOfWeek === 0 || dayOfWeek === 6;

  const SECTIONS = [
    { key:"training", label:"TRAINING",  icon:"⚡" },
    { key:"schedule", label:"SCHEDULE",  icon:"🗓️" },
    { key:"nutrition",label:"NUTRITION", icon:"🔋" },
    { key:"skincare", label:"SKIN",      icon:"💎" },
    { key:"reading",  label:"READING",   icon:"📖" },
    { key:"mental",   label:"MENTAL",    icon:"🧠" },
    { key:"money",    label:"MONEY",     icon:"◈" },
  ];

  // current time indicator
  const nowMins = hour * 60 + new Date().getMinutes();
  function timeMins(str) {
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* header */}
      <div style={{
        padding: "52px 16px 16px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surf1)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: -20, width: 160, height: 160, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(123,51,126,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <p className="fade-up" style={{ fontSize: 11, color: "var(--text2)", letterSpacing: "0.15em", fontWeight: 600, marginBottom: 4 }}>
          YOUR PROTOCOL
        </p>
        <h2 className="fade-up" style={{ fontFamily: "Bebas Neue", fontSize: 34, letterSpacing: "0.04em", animationDelay: "0.05s", marginBottom: 4 }}>
          FIELD GUIDE
        </h2>
        <p style={{ fontSize: 12, color: "var(--text2)" }}>
          {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dayOfWeek]} · {isMorning ? "Morning" : "Afternoon/Evening"} · Everything you need today
        </p>
      </div>

      {/* section picker */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--surf1)" }}>
        <div style={{ display: "flex", gap: 6, padding: "10px 12px 12px", overflowX: "auto", scrollbarWidth: "none" }}>
          {SECTIONS.map(s => {
            const on = s.key === section;
            return (
              <button key={s.key} className="tap" onClick={() => { setSection(s.key); setOpenIdx(null); }}
                style={{
                  flexShrink: 0, padding: "7px 14px", borderRadius: 999,
                  border: on ? "1px solid rgba(102,103,171,0.4)" : "1px solid var(--border)",
                  background: on ? "rgba(123,51,126,0.15)" : "transparent",
                  cursor: "pointer", transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                <span style={{ fontFamily: "Bebas Neue", fontSize: 11, letterSpacing: "0.1em", color: on ? "#B06BB3" : "var(--text2)" }}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>

        {/* ── TRAINING SECTION ── */}
        {section === "training" && (
          <div className="fade-in">
            <div style={{
              background: `linear-gradient(145deg, ${training.dim}, #1C0E2E)`,
              borderRadius: 20, border: `1px solid ${training.accent}22`,
              padding: 20, marginBottom: 14, position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${training.accent}, transparent)` }} />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 32 }}>{training.icon}</span>
                <div>
                  <p style={{ fontSize: 11, color: training.accent, letterSpacing: "0.12em", fontWeight: 600 }}>
                    {["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"][dayOfWeek]}
                  </p>
                  <p style={{ fontFamily: "Bebas Neue", fontSize: 28, letterSpacing: "0.04em", lineHeight: 1 }}>{training.name}</p>
                </div>
              </div>
              <div style={{
                display: "inline-flex", padding: "3px 10px", borderRadius: 999,
                background: `${training.accent}15`, border: `1px solid ${training.accent}25`,
                fontSize: 10, color: training.accent, letterSpacing: "0.1em", fontWeight: 700, marginBottom: 12,
              }}>{training.tag}</div>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, fontStyle: "italic" }}>
                💡 {training.tip}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {training.exercises.map((ex, i) => (
                <div key={i} className="fade-up" style={{
                  animationDelay: `${i * 0.04}s`,
                  background: "var(--surf1)", borderRadius: 14,
                  border: "1px solid var(--border)",
                  padding: "12px 16px",
                  display: "flex", gap: 14, alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: `${training.accent}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "Bebas Neue", fontSize: 13, color: training.accent,
                  }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{ex.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: training.accent, whiteSpace: "nowrap" }}>{ex.sets}</span>
                    </div>
                    {ex.note && <p style={{ fontSize: 11, color: "var(--text2)", marginTop: 4 }}>{ex.note}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 14, padding: "12px 16px", borderRadius: 14,
              background: "rgba(123,51,126,0.05)", border: "1px solid rgba(123,51,126,0.15)",
            }}>
              <p style={{ fontSize: 11, color: "rgba(176,107,179,0.85)", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 4 }}>PROGRESSIVE OVERLOAD</p>
              <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>
                Every week, add one of: +2 reps per set · or +1 set · or 5 seconds less rest. Small increases compound into transformation.
              </p>
            </div>
          </div>
        )}

        {/* ── SCHEDULE SECTION ── */}
        {section === "schedule" && (
          <div className="fade-in">
            <div style={{ marginBottom: 14, padding: "12px 16px", borderRadius: 14,
              background: "rgba(123,51,126,0.06)", border: "1px solid rgba(123,51,126,0.18)" }}>
              <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>
                ⚡ Current time highlighted in gold. Every day follows this exact blueprint.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SCHEDULE.map((item, i) => {
                const tMins = timeMins(item.time);
                const nextMins = i < SCHEDULE.length - 1 ? timeMins(SCHEDULE[i + 1].time) : tMins + 60;
                const isCurrent = nowMins >= tMins && nowMins < nextMins;
                const isPast = nowMins >= nextMins;
                const statColor = STAT_COLORS[item.stat] || "#B06BB3";

                return (
                  <div key={i} style={{
                    display: "flex", gap: 12, alignItems: "flex-start",
                    opacity: isPast && !isCurrent ? 0.45 : 1,
                    transition: "opacity 0.3s",
                  }}>
                    {/* time + line */}
                    <div style={{ width: 44, flexShrink: 0, paddingTop: 12, textAlign: "right" }}>
                      <span style={{ fontFamily: "Bebas Neue", fontSize: 12, color: isCurrent ? "#B06BB3" : "var(--text3)", letterSpacing: "0.05em" }}>
                        {item.time}
                      </span>
                    </div>
                    {/* dot + line */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <div style={{
                        width: isCurrent ? 12 : 8, height: isCurrent ? 12 : 8,
                        borderRadius: "50%", marginTop: isCurrent ? 10 : 12,
                        background: isCurrent ? "#B06BB3" : (isPast ? "var(--text3)" : statColor + "60"),
                        boxShadow: isCurrent ? "0 0 8px rgba(176,107,179,0.7)" : "none",
                        transition: "all 0.3s",
                        flexShrink: 0,
                      }} />
                      {i < SCHEDULE.length - 1 && (
                        <div style={{ width: 1, flex: 1, minHeight: 14, background: "var(--border)", marginTop: 4 }} />
                      )}
                    </div>
                    {/* content */}
                    <div style={{
                      flex: 1, paddingBottom: 10, paddingTop: 8,
                      paddingLeft: 10, paddingRight: 12,
                      borderRadius: 12,
                      background: isCurrent ? "rgba(123,51,126,0.07)" : (item.highlight ? "rgba(255,255,255,0.02)" : "transparent"),
                      border: isCurrent ? "1px solid rgba(102,103,171,0.25)" : "1px solid transparent",
                      transition: "all 0.3s",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                        <span style={{
                          fontSize: 13, fontWeight: isCurrent ? 700 : 500,
                          color: isCurrent ? "#B06BB3" : "var(--text)",
                        }}>{item.icon} {item.action}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
                          color: statColor, opacity: 0.8 }}>{item.stat}</span>
                      </div>
                      <p style={{ fontSize: 11, color: "var(--text2)", marginTop: 2, lineHeight: 1.5 }}>{item.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── NUTRITION SECTION ── */}
        {section === "nutrition" && (
          <div className="fade-in">
            <div style={{
              background: "linear-gradient(145deg, #1C0E2E, #1C0E2E)",
              borderRadius: 20, border: "1px solid #22D3A022",
              padding: 20, marginBottom: 14, position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: "linear-gradient(90deg, transparent, #22D3A0, transparent)" }} />
              <p style={{ fontFamily: "Bebas Neue", fontSize: 24, letterSpacing: "0.04em", color: "#22D3A0", marginBottom: 8 }}>
                DAILY TARGETS
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[["2,600", "CALORIES"], ["150g+", "PROTEIN"], ["3L", "WATER"]].map(([val, lbl]) => (
                  <div key={lbl} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 8px", textAlign: "center", border: "1px solid rgba(34,211,160,0.12)" }}>
                    <p style={{ fontFamily: "Bebas Neue", fontSize: 22, color: "#22D3A0" }}>{val}</p>
                    <p style={{ fontSize: 9, color: "var(--text2)", letterSpacing: "0.1em" }}>{lbl}</p>
                  </div>
                ))}
              </div>
            </div>

            {MEALS.map((m, i) => (
              <div key={i} className="fade-up" style={{
                animationDelay: `${i * 0.05}s`,
                background: "var(--surf1)", borderRadius: 14,
                border: "1px solid var(--border)", padding: "14px 16px", marginBottom: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontFamily: "Bebas Neue", fontSize: 14, letterSpacing: "0.06em", color: "#22D3A0" }}>{m.time}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.08em" }}>{m.label.toUpperCase()}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text)", marginBottom: 6, lineHeight: 1.5 }}>{m.food}</p>
                <p style={{ fontSize: 11, color: "#22D3A060", fontWeight: 600 }}>{m.macros}</p>
              </div>
            ))}

            <div style={{ marginTop: 6, padding: "14px 16px", borderRadius: 14, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <p style={{ fontSize: 11, color: "rgba(239,68,68,0.7)", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>AVOID COMPLETELY</p>
              {[["Instant noodles daily","Zero nutrition, destroys skin"],["Sugary drinks","Kills abs, spikes insulin, feeds skin yeast"],["Skipping breakfast","Slows metabolism, loses muscle"],["Junk food","Empty calories, wrecks conditioning"]].map(([what, why]) => (
                <div key={what} style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "rgba(239,68,68,0.8)", fontWeight: 600 }}>✕ {what}</span>
                  <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: 6 }}>— {why}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SKINCARE SECTION ── */}
        {section === "skincare" && (
          <div className="fade-in">
            {/* Context card */}
            <div style={{
              background: isMorning ? "linear-gradient(145deg, #2C1050, #1C0E2E)" : "linear-gradient(145deg, #231540, #1C0E2E)",
              borderRadius: 20, border: `1px solid ${isMorning ? "#D946EF22" : "#A78BFA22"}`,
              padding: 20, marginBottom: 14, position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${isMorning ? "#D946EF" : "#A78BFA"}, transparent)` }} />
              <p style={{ fontFamily: "Bebas Neue", fontSize: 24, letterSpacing: "0.04em",
                color: isMorning ? "#D946EF" : "#A78BFA", marginBottom: 4 }}>
                {isMorning ? "MORNING ROUTINE" : "EVENING ROUTINE"}
              </p>
              <p style={{ fontSize: 12, color: "var(--text2)" }}>
                {isMorning ? "3 minutes · Starts your skin protection for the day" : "2 minutes · Repair and treatment time"}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {(isMorning ? SKINCARE_MORNING : SKINCARE_EVENING).map((step, i) => (
                <div key={i} className="fade-up" style={{
                  animationDelay: `${i * 0.06}s`,
                  background: "var(--surf1)", borderRadius: 14, border: "1px solid var(--border)",
                  padding: "12px 16px", display: "flex", gap: 12, alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                    background: isMorning ? "rgba(217,70,239,0.15)" : "rgba(167,139,250,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "Bebas Neue", fontSize: 12,
                    color: isMorning ? "#D946EF" : "#A78BFA",
                  }}>{i + 1}</div>
                  <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, flex: 1 }}>{step}</p>
                </div>
              ))}
            </div>

            {/* Seb derm treatment */}
            <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(123,51,126,0.06)", border: "1px solid rgba(123,51,126,0.18)", marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: "#B06BB3", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 6 }}>SEBORRHEIC DERMATITIS TREATMENT</p>
              <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>
                Ketoconazole shampoo (~$4–8). Apply to eyebrows, moustache, ears <strong style={{ color: "var(--text)" }}>3x per week</strong>. Leave on 3–5 minutes. Reduce to 1x/week once cleared. Results: 6–8 weeks.
              </p>
            </div>

            {/* Weekly extras */}
            <p style={{ fontSize: 11, color: "var(--text2)", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 8 }}>WEEKLY EXTRAS (FREE)</p>
            {SKINCARE_WEEKLY.map((item, i) => (
              <div key={i} style={{
                background: "var(--surf1)", borderRadius: 12, border: "1px solid var(--border)",
                padding: "10px 14px", marginBottom: 6,
                display: "flex", gap: 12, alignItems: "flex-start",
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#D946EF", background: "rgba(217,70,239,0.12)", padding: "3px 8px", borderRadius: 6, flexShrink: 0, whiteSpace: "nowrap" }}>{item.day}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{item.action}</p>
                  <p style={{ fontSize: 11, color: "var(--text2)" }}>{item.note}</p>
                </div>
              </div>
            ))}

            {/* Scent */}
            <p style={{ fontSize: 11, color: "var(--text2)", letterSpacing: "0.12em", fontWeight: 600, marginTop: 16, marginBottom: 8 }}>SCENT ROTATION</p>
            {[
              { occ:"Daily campus / class",       scent:"Polo Blue",     note:"2 sprays" },
              { occ:"Going out / social",          scent:"Dior Sauvage",  note:"2 sprays max" },
              { occ:"After training",              scent:"Rexona Green",  note:"Roll-on only" },
              { occ:"Night out",                   scent:"Dior Sauvage",  note:"2 sprays max" },
            ].map((s, i) => (
              <div key={i} style={{ background: "var(--surf1)", borderRadius: 12, border: "1px solid var(--border)", padding: "10px 14px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text2)" }}>{s.occ}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{s.scent}</p>
                </div>
                <span style={{ fontSize: 11, color: "#D946EF", fontWeight: 700 }}>{s.note}</span>
              </div>
            ))}
            <p style={{ fontSize: 11, color: "var(--text2)", marginTop: 8, padding: "0 4px" }}>
              💡 Moisturise pulse points <strong style={{ color: "var(--text)" }}>before</strong> spraying. Neck, wrists, chest. Never rub wrists together.
            </p>
          </div>
        )}

        {/* ── READING SECTION ── */}
        {section === "reading" && (
          <div className="fade-in">
            {/* Current book card */}
            <div style={{
              background: "linear-gradient(145deg, #2C1A50, #1C0E2E)",
              borderRadius: 20, border: "1px solid rgba(102,103,171,0.25)",
              padding: 20, marginBottom: 14, position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: "linear-gradient(90deg, transparent, #B06BB3, transparent)" }} />
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{
                  width: 56, height: 76, borderRadius: 8, flexShrink: 0,
                  background: "linear-gradient(145deg, #2C1A50, #2C1A50)",
                  border: "1px solid rgba(102,103,171,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24,
                }}>📚</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 10, color: "#B06BB3", letterSpacing: "0.12em", fontWeight: 700, marginBottom: 4 }}>
                    BOOK {currentBook.n} OF 12 · MONTH {currentBook.month}
                  </p>
                  <p style={{ fontFamily: "Bebas Neue", fontSize: 20, letterSpacing: "0.04em", lineHeight: 1.1, color: "var(--text)", marginBottom: 4 }}>
                    {currentBook.title}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text2)", marginBottom: 10 }}>{currentBook.author}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ background: "rgba(123,51,126,0.15)", border: "1px solid rgba(102,103,171,0.3)", borderRadius: 8, padding: "6px 12px", textAlign: "center" }}>
                      <p style={{ fontFamily: "Bebas Neue", fontSize: 20, color: "#B06BB3", lineHeight: 1 }}>pp {suggestedPageStart}–{suggestedPageEnd}</p>
                      <p style={{ fontSize: 9, color: "var(--text2)", letterSpacing: "0.08em" }}>TODAY'S PAGES</p>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 12px", textAlign: "center" }}>
                      <p style={{ fontFamily: "Bebas Neue", fontSize: 20, color: "var(--text2)", lineHeight: 1 }}>{currentBook.pages}</p>
                      <p style={{ fontSize: 9, color: "var(--text3)", letterSpacing: "0.08em" }}>TOTAL PAGES</p>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6, fontStyle: "italic" }}>"{currentBook.why}"</p>
              </div>
            </div>

            {/* Retention system */}
            <p style={{ fontSize: 11, color: "var(--text2)", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 8 }}>4-STEP RETENTION SYSTEM</p>
            {[
              ["Read with intention","Before opening — ask: what do I want to get from this?"],
              ["Mark what stops you","Only underline what genuinely hits. Not everything."],
              ["5-minute review","After reading: one idea that challenged you, one thing to apply tomorrow, one question it raised."],
              ["Teach it within 48hrs","Explain what you read to someone else. Teaching reveals what you truly understood."],
            ].map(([step, detail], i) => (
              <div key={i} style={{ background: "var(--surf1)", borderRadius: 12, border: "1px solid var(--border)", padding: "12px 14px", marginBottom: 8, display: "flex", gap: 12 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: "rgba(123,51,126,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Bebas Neue", fontSize: 13, color: "#B06BB3" }}>{i + 1}</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{step}</p>
                  <p style={{ fontSize: 11, color: "var(--text2)", lineHeight: 1.5 }}>{detail}</p>
                </div>
              </div>
            ))}

            {/* Full reading list */}
            <p style={{ fontSize: 11, color: "var(--text2)", letterSpacing: "0.12em", fontWeight: 600, marginTop: 16, marginBottom: 8 }}>FULL READING LIST</p>
            {BOOKS.map((b, i) => {
              const isCurrent = b.n === currentBook.n;
              const isDone = b.n < currentBook.n;
              return (
                <div key={i} style={{
                  background: isCurrent ? "rgba(123,51,126,0.06)" : "var(--surf1)",
                  borderRadius: 12, marginBottom: 6,
                  border: isCurrent ? "1px solid rgba(102,103,171,0.25)" : `1px solid ${isDone ? "rgba(255,255,255,0.04)" : "var(--border)"}`,
                  padding: "10px 14px",
                  display: "flex", gap: 12, alignItems: "center",
                  opacity: isDone ? 0.5 : 1,
                }}>
                  <span style={{ fontFamily: "Bebas Neue", fontSize: 18, color: isCurrent ? "#B06BB3" : (isDone ? "var(--text3)" : "var(--text2)"), width: 22, flexShrink: 0, textAlign: "center" }}>
                    {isDone ? "✓" : b.n}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? "#B06BB3" : "var(--text)" }}>{b.title}</p>
                    <p style={{ fontSize: 11, color: "var(--text2)" }}>{b.author} · Month {b.month}</p>
                  </div>
                  {isCurrent && <span style={{ fontSize: 10, fontWeight: 700, color: "#B06BB3", background: "rgba(123,51,126,0.18)", padding: "3px 8px", borderRadius: 6 }}>NOW</span>}
                </div>
              );
            })}

            {/* CS platforms */}
            <p style={{ fontSize: 11, color: "var(--text2)", letterSpacing: "0.12em", fontWeight: 600, marginTop: 16, marginBottom: 8 }}>FREE CS PLATFORMS</p>
            {[
              ["CS50 Harvard","edx.org","Best free CS course ever made — start here"],
              ["freeCodeCamp","freecodecamp.org","Full web dev curriculum, free"],
              ["The Odin Project","theodinproject.com","Full stack, project-based"],
              ["LeetCode","leetcode.com","Interview prep — start Year 2"],
              ["GitHub","github.com","Every project goes here — builds portfolio"],
              ["Fireship","YouTube","Fast, practical CS content"],
            ].map(([name, url, why]) => (
              <div key={name} style={{ background: "var(--surf1)", borderRadius: 12, border: "1px solid var(--border)", padding: "10px 14px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{name}</p>
                  <p style={{ fontSize: 10, color: "#FBBF24" }}>{url}</p>
                </div>
                <p style={{ fontSize: 11, color: "var(--text2)", textAlign: "right", maxWidth: 160 }}>{why}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── MENTAL HEALTH SECTION ── */}
        {section === "mental" && (
          <div className="fade-in">
            <div style={{ marginBottom: 14, background: "linear-gradient(145deg, #231540, #1C0E2E)", borderRadius: 20, border: "1px solid rgba(167,139,250,0.2)", padding: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #A78BFA, transparent)" }} />
              <p style={{ fontFamily: "Bebas Neue", fontSize: 22, color: "#A78BFA", letterSpacing: "0.04em", marginBottom: 4 }}>DAILY STACK</p>
              <p style={{ fontSize: 12, color: "var(--text2)" }}>26 minutes total. Every single day.</p>
            </div>

            {[
              { when:"After waking",     duration:"2 mins",  practice:"Morning intention",  how:'Write: "Today I will ___ and will not let ___ stop me"' },
              { when:"After waking",     duration:"3 mins",  practice:"Breathing practice", how:"4 in · hold 4 · out 6 — repeat 8 times" },
              { when:"Within 30 mins",   duration:"10 mins", practice:"Sunlight exposure",  how:"Walk outside. No sunglasses. Triggers serotonin." },
              { when:"Every evening",    duration:"5 mins",  practice:"Brain dump",         how:"Write every thought — no structure, no filter" },
              { when:"Every evening",    duration:"3 mins",  practice:"Gratitude",          how:"3 specific things. Not generic — be exact." },
              { when:"9 PM daily",       duration:"5 mins",  practice:"Worry window",       how:"Official worry time. Examine each worry, then let it go." },
              { when:"Every Sunday",     duration:"15 mins", practice:"Deep check-in",      how:"7 reflection questions — see below" },
            ].map((item, i) => (
              <div key={i} className="fade-up" style={{ animationDelay: `${i * 0.05}s`, background: "var(--surf1)", borderRadius: 14, border: "1px solid var(--border)", padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#A78BFA" }}>{item.practice}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ fontSize: 10, color: "var(--text3)", fontWeight: 600 }}>{item.when}</span>
                    <span style={{ fontSize: 10, color: "#A78BFA", background: "rgba(167,139,250,0.12)", padding: "2px 7px", borderRadius: 6, fontWeight: 700 }}>{item.duration}</span>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>{item.how}</p>
              </div>
            ))}

            {/* Anxiety protocol */}
            <div style={{ marginTop: 6, padding: "16px", borderRadius: 16, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: "rgba(239,68,68,0.8)", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 10 }}>⚡ ANXIETY EMERGENCY PROTOCOL</p>
              {[
                ["1. NAME IT", "Say out loud or write: \"I am feeling anxious right now\""],
                ["2. BREATHE", "4 in · hold 4 · out 6. Repeat 4 times. 90 seconds to calm your nervous system."],
                ["3. GROUND", "Name 5 things you can see · 4 you can touch · 3 you can hear"],
                ["4. ACT", "Do one small thing: open book, 10 push-ups, drink water. Breaks the loop."],
              ].map(([step, detail]) => (
                <div key={step} style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(239,68,68,0.9)" }}>{step} </span>
                  <span style={{ fontSize: 12, color: "var(--text2)" }}>{detail}</span>
                </div>
              ))}
            </div>

            {/* Hard day */}
            <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(129,140,248,0.05)", border: "1px solid rgba(129,140,248,0.15)", marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: "rgba(129,140,248,0.8)", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>HARD DAY PROTOCOL</p>
              {["Do NOT make any major decisions","Do the minimum version of routine — even just water counts","Walk outside 20 minutes — non-negotiable even on worst days","Call or message one person — just to connect","Be extraordinarily kind to yourself","Sleep — tomorrow is always a different day"].map((rule, i) => (
                <p key={i} style={{ fontSize: 12, color: "var(--text2)", marginBottom: 4 }}>· {rule}</p>
              ))}
            </div>

            {/* Sunday review */}
            <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
              <p style={{ fontSize: 11, color: "var(--text2)", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>SUNDAY REVIEW — 7 QUESTIONS</p>
              {["Did I train every scheduled day?","Did I eat clean 80% of the time?","Did I study at least 3 focused hours daily?","What was my strongest moment this week?","What was my weakest moment and why?","What one thing will I do differently next week?","Am I closer to the person I want to become?"].map((q, i) => (
                <p key={i} style={{ fontSize: 12, color: "var(--text2)", marginBottom: 5, paddingLeft: 4 }}>
                  <span style={{ color: "#A78BFA", fontWeight: 700, marginRight: 6 }}>{i + 1}.</span>{q}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* ── MONEY SECTION ── */}
        {section === "money" && (
          <div className="fade-in">
            <div style={{ background: "linear-gradient(145deg, #2A1000, #1C0E2E)", borderRadius: 20, border: "1px solid rgba(251,146,60,0.2)", padding: 20, marginBottom: 14, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #FB923C, transparent)" }} />
              <p style={{ fontFamily: "Bebas Neue", fontSize: 22, color: "#FB923C", letterSpacing: "0.04em", marginBottom: 12 }}>MONTHLY BUDGET — $50</p>
              {[
                ["Food","$30","Rice, eggs, tuna, beans, oats, peanut butter, bananas"],
                ["Toiletries & skincare","$8","Ketoconazole, moisturiser, face wash"],
                ["Emergency fund","$5","Pay yourself first — before anything else"],
                ["Transport","$4","Walk everywhere possible"],
                ["Miscellaneous","$3","Unexpected small needs"],
              ].map(([cat, amt, note]) => (
                <div key={cat} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontFamily: "Bebas Neue", fontSize: 16, color: "#FB923C", width: 34, flexShrink: 0 }}>{amt}</span>
                  <div>
                    <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{cat}</p>
                    <p style={{ fontSize: 11, color: "var(--text2)" }}>{note}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(123,51,126,0.06)", border: "1px solid rgba(123,51,126,0.18)", marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: "#B06BB3", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 6 }}>THE PAY YOURSELF FIRST RULE</p>
              <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>
                The moment ANY money arrives — move 10% to savings <strong style={{ color: "var(--text)" }}>before</strong> anything else. On $50 that's $5. Do it automatically. This habit scales to every income level for the rest of your life.
              </p>
            </div>

            <p style={{ fontSize: 11, color: "var(--text2)", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 8 }}>INCOME ROADMAP</p>
            {[
              { tier:"TIER 1", time:"This month",     method:"Sell items · type documents · basic campus tech help",    earn:"+$10–30/mo" },
              { tier:"TIER 2", time:"Month 2–3",      method:"Tutoring · Fiverr basics · document your transformation", earn:"+$20–75/mo" },
              { tier:"TIER 3", time:"Month 4–6",      method:"App monetisation · freelance web · campus tech services", earn:"+$30–100/mo" },
              { tier:"TIER 4", time:"Year 2+",        method:"Internship · app subscriptions · established freelancing",earn:"+$200–500/mo" },
            ].map((t, i) => (
              <div key={i} style={{ background: "var(--surf1)", borderRadius: 12, border: "1px solid var(--border)", padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#FB923C", letterSpacing: "0.1em" }}>{t.tier} · {t.time}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#22D3A0" }}>{t.earn}</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text2)" }}>{t.method}</p>
              </div>
            ))}

            <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", marginTop: 4 }}>
              <p style={{ fontSize: 11, color: "var(--text2)", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>12-MONTH MILESTONES</p>
              {[["Month 1","Track every dollar — build awareness"],["Month 2","First $5 saved"],["Month 3","Stop borrowing completely"],["Month 4","$15 emergency fund + first side income"],["Month 6","$30 emergency fund + earning outside parents"],["Month 9","Emergency fund full ($50) + consistent income"],["Month 12","Multiple streams · never borrowing · saving consistently"]].map(([mo, goal]) => (
                <div key={mo} style={{ display: "flex", gap: 12, marginBottom: 6, alignItems: "baseline" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#FB923C", width: 56, flexShrink: 0 }}>{mo}</span>
                  <span style={{ fontSize: 12, color: "var(--text2)" }}>{goal}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ─── NAV ─────────────────────────────────────────────────────────────────── */
const TABS = [
  { key:"home",     label:"HOME",     icon:"◈" },
  { key:"missions", label:"MISSIONS", icon:"◉" },
  { key:"guide",    label:"GUIDE",    icon:"📖" },
  { key:"stats",    label:"STATS",    icon:"⬡" },
  { key:"profile",  label:"PROFILE",  icon:"⚔" },
];

function Nav({ active, setActive }) {
  return (
    <div style={{
      position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
      zIndex:100,
    }}>
      <div style={{
        display:"flex", alignItems:"center", gap:2,
        background:"#1C0E2E",
        borderRadius:999,
        border:"1px solid rgba(102,103,171,0.18)",
        borderTop:"1px solid rgba(255,255,255,0.07)",
        padding:"6px 6px",
        boxShadow:"-3px -3px 10px rgba(255,255,255,0.03), 6px 6px 20px rgba(0,0,0,0.7), 0 0 30px rgba(123,51,126,0.12)",
      }}>
        {TABS.map(t => {
          const on = t.key === active;
          return (
            <button key={t.key} className="tap" onClick={() => setActive(t.key)}
              style={{
                display:"flex", flexDirection:"column", alignItems:"center",
                gap:3, padding:"8px 13px",
                borderRadius:999, border:"none", cursor:"pointer",
                background: on ? "linear-gradient(145deg, #2C1A50, #231540)" : "transparent",
                transition:"all 0.25s cubic-bezier(.22,.68,0,1.2)",
                boxShadow: on
                  ? "inset 2px 2px 6px rgba(0,0,0,0.5), inset -1px -1px 4px rgba(255,255,255,0.04), 0 0 14px rgba(123,51,126,0.25)"
                  : "none",
              }}>
              <span style={{ fontSize:16, lineHeight:1, filter: on ? "none" : "opacity(0.35)" }}>{t.icon}</span>
              <span style={{
                fontFamily:"Bebas Neue", fontSize:9, letterSpacing:"0.1em",
                color: on ? "#B06BB3" : "rgba(245,213,224,0.22)",
                transition:"color 0.2s",
              }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── TOAST ───────────────────────────────────────────────────────────────── */
function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="fade-up" style={{
      position:"fixed", top:24, left:"50%", transform:"translateX(-50%)",
      zIndex:999,
      background:"#1C0E2E",
      border:"1px solid rgba(102,103,171,0.3)",
      borderTop:"1px solid rgba(255,255,255,0.08)",
      borderRadius:999,
      padding:"10px 22px",
      display:"flex", alignItems:"center", gap:10,
      boxShadow:"-2px -2px 8px rgba(255,255,255,0.03), 4px 4px 18px rgba(0,0,0,0.6), 0 0 20px rgba(123,51,126,0.25)",
      whiteSpace:"nowrap",
    }}>
      <span style={{ fontSize:16 }}>✦</span>
      <span style={{ fontSize:13, fontWeight:600, color:"#B06BB3", letterSpacing:"0.04em" }}>{msg}</span>
    </div>
  );
}

/* ─── ROOT ────────────────────────────────────────────────────────────────── */
export default function App() {
  const [state, dispatch_raw] = useState(load);
  const [tab, setTab]         = useState("home");
  const [toast, setToast]     = useState(null);
  const prevXP = useRef(state.xp);

  function dispatch(action) {
    dispatch_raw(prev => {
      const next = reducer(prev, action);
      if (action.type === "COMPLETE") {
        const gained = next.xp - prev.xp;
        if (gained > 0) setToast(`+${gained} XP earned`);
      }
      return next;
    });
  }

  const tabContent = {
    home:     <HomeTab     state={state} dispatch={dispatch} />,
    missions: <MissionsTab state={state} dispatch={dispatch} />,
    guide:    <GuideTab    state={state} />,
    stats:    <StatsTab    state={state} />,
    profile:  <ProfileTab  state={state} dispatch={dispatch} />,
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{
        minHeight:"100dvh", maxWidth:430, margin:"0 auto",
        position:"relative", background:"var(--bg)",
        overflowY:"auto", overflowX:"hidden",
      }}>
        <div key={tab} className="fade-in" style={{ animationDuration:"0.2s" }}>
          {tabContent[tab]}
        </div>
        <Nav active={tab} setActive={setTab} />
        {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
      </div>
    </>
  );
}
