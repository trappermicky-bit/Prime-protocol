import { useState, useEffect, useCallback, useRef } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "prime_protocol_v2";

const STATS_CONFIG = [
  { key:"power",        label:"Power",        sub:"Training & Fitness",     icon:"⚡", color:"#38bdf8", grad:"linear-gradient(135deg,#0ea5e9,#38bdf8)" },
  { key:"presence",     label:"Presence",     sub:"Skincare & Grooming",    icon:"💎", color:"#e879f9", grad:"linear-gradient(135deg,#a855f7,#e879f9)" },
  { key:"fuel",         label:"Fuel",         sub:"Nutrition & Diet",       icon:"🔋", color:"#34d399", grad:"linear-gradient(135deg,#10b981,#34d399)" },
  { key:"recharge",     label:"Recharge",     sub:"Sleep & Recovery",       icon:"🌙", color:"#818cf8", grad:"linear-gradient(135deg,#6366f1,#818cf8)" },
  { key:"intelligence", label:"Intel",         sub:"CS Study & Learning",    icon:"⬡",  color:"#fbbf24", grad:"linear-gradient(135deg,#f59e0b,#fbbf24)" },
  { key:"wealth",       label:"Wealth",       sub:"Finance & Money",        icon:"◈",  color:"#fb923c", grad:"linear-gradient(135deg,#f97316,#fb923c)" },
  { key:"aura",         label:"Aura",         sub:"Social & Relationships", icon:"◉",  color:"#f472b6", grad:"linear-gradient(135deg,#ec4899,#f472b6)" },
  { key:"clarity",      label:"Clarity",      sub:"Mindset & Journaling",   icon:"✦",  color:"#a78bfa", grad:"linear-gradient(135deg,#8b5cf6,#a78bfa)" },
];

const MISSIONS_CONFIG = {
  power:        [ {id:"p1",label:"Full workout completed",    type:"check",xp:80}, {id:"p2",label:"Push-ups",              type:"number",unit:"reps",  xpPer:0.8}, {id:"p3",label:"Sprint intervals",        type:"number",unit:"rounds",xpPer:10}, {id:"p4",label:"Jump training",          type:"check",xp:60}, {id:"p5",label:"Stretching & mobility",  type:"check",xp:30} ],
  presence:     [ {id:"g1",label:"Morning skincare",          type:"check",xp:40}, {id:"g2",label:"Evening skincare",      type:"check",xp:40},         {id:"g3",label:"Water intake",            type:"number",unit:"litres",xpPer:25},{id:"g4",label:"Grooming check",         type:"check",xp:30} ],
  fuel:         [ {id:"f1",label:"Protein intake",            type:"number",unit:"grams",xpPer:0.4},{id:"f2",label:"No junk food",        type:"check",xp:60},{id:"f3",label:"Meal prepped",           type:"check",xp:50},{id:"f4",label:"No sugary drinks",       type:"check",xp:40} ],
  recharge:     [ {id:"r1",label:"Hours slept",               type:"number",unit:"hrs",  xpPer:12}, {id:"r2",label:"No screen before bed", type:"check",xp:50},{id:"r3",label:"Cold shower",            type:"check",xp:40},{id:"r4",label:"Stretching before sleep",type:"check",xp:30} ],
  intelligence: [ {id:"i1",label:"CS study hours",            type:"number",unit:"hrs",  xpPer:35}, {id:"i2",label:"Coding practice",      type:"check",xp:60},{id:"i3",label:"Game film watched",      type:"check",xp:40},{id:"i4",label:"Read new concept",       type:"check",xp:50} ],
  wealth:       [ {id:"w1",label:"Tracked expenses",          type:"check",xp:50},  {id:"w2",label:"Saved money today",    type:"check",xp:60},{id:"w3",label:"Learned finance concept",type:"check",xp:40},{id:"w4",label:"No impulse purchase",    type:"check",xp:40} ],
  aura:         [ {id:"a1",label:"Meaningful conversation",   type:"check",xp:50},  {id:"a2",label:"Helped someone",       type:"check",xp:60},{id:"a3",label:"Eye contact practice",   type:"check",xp:30},{id:"a4",label:"Confident posture",      type:"check",xp:30} ],
  clarity:      [ {id:"c1",label:"Journaled today",           type:"check",xp:60},  {id:"c2",label:"Meditation",           type:"check",xp:50},{id:"c3",label:"Gratitude written",       type:"check",xp:40},{id:"c4",label:"Morning intention set", type:"check",xp:30} ],
};

const LEVELS = [
  {min:0,  title:"Initiate",       color:"#94a3b8"},
  {min:5,  title:"Operator",       color:"#38bdf8"},
  {min:15, title:"Enforcer",       color:"#34d399"},
  {min:30, title:"Apex",           color:"#fbbf24"},
  {min:50, title:"Ascendant",      color:"#e879f9"},
  {min:75, title:"Prime Protocol", color:"#f472b6"},
];

const XP_PER_LEVEL = 600;

function getLevelInfo(level) {
  let info = LEVELS[0];
  for (const l of LEVELS) { if (level >= l.min) info = l; }
  return info;
}
function getTodayKey() { return new Date().toISOString().split("T")[0]; }
function calcLevel(xp) { return Math.min(Math.floor(xp / XP_PER_LEVEL), 100); }
function defaultState() {
  return { profile:{name:""}, stats:{power:0,presence:0,fuel:0,recharge:0,intelligence:0,wealth:0,aura:0,clarity:0}, totalXP:0, streak:0, longestStreak:0, lastActiveDate:null, missedDays:0, degraded:false, dailyLogs:{}, history:[] };
}
function loadState() {
  try { const r = localStorage.getItem(STORAGE_KEY); if(r) return {...defaultState(),...JSON.parse(r)}; } catch {}
  return defaultState();
}
function saveState(s) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {} }

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;overflow:hidden;}
body{font-family:'Inter',sans-serif;background:#060612;color:#fff;-webkit-font-smoothing:antialiased;}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px;}
input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
button{font-family:'Inter',sans-serif;}

@keyframes fadeUp    {from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn    {from{opacity:0}to{opacity:1}}
@keyframes scaleIn   {from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
@keyframes slideUp   {from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
@keyframes floatUp   {0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-100px) scale(1.6)}}
@keyframes orb1      {0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(60px,-40px) scale(1.1)}}
@keyframes orb2      {0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-50px,60px) scale(0.9)}}
@keyframes orb3      {0%,100%{transform:translate(0,0)}33%{transform:translate(40px,30px)}66%{transform:translate(-30px,-20px)}}
@keyframes spin      {to{transform:rotate(360deg)}}
@keyframes spinRev   {to{transform:rotate(-360deg)}}
@keyframes breathe   {0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
@keyframes pulse     {0%,100%{opacity:1}50%{opacity:0.5}}
@keyframes glitch    {0%,100%{transform:translateX(0) skewX(0)}20%{transform:translateX(-5px) skewX(-3deg)}40%{transform:translateX(5px) skewX(3deg)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}}
@keyframes popIn     {0%{transform:scale(0.4);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
@keyframes slideInR  {from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
@keyframes tabSlide  {from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmerBg {0%{background-position:-200% center}100%{background-position:200% center}}
`;

// ─── AMBIENT BACKGROUND ───────────────────────────────────────────────────────

function AmbientBg({ tab }) {
  const palettes = {
    dashboard: ["#0ea5e924","#8b5cf620"],
    missions:  ["#f59e0b20","#ec489920"],
    stats:     ["#10b98120","#6366f120"],
    profile:   ["#a855f720","#38bdf820"],
  };
  const [c1,c2] = palettes[tab] || palettes.dashboard;
  return (
    <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%,#0f0f2a,#060612 70%)"}}/>
      <div style={{position:"absolute",width:700,height:700,borderRadius:"50%",background:`radial-gradient(circle,${c1},transparent 70%)`,top:"-20%",left:"-10%",animation:"orb1 18s ease-in-out infinite"}}/>
      <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:`radial-gradient(circle,${c2},transparent 70%)`,bottom:"-20%",right:"-10%",animation:"orb2 22s ease-in-out infinite"}}/>
      <div style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,#1e1b4b44,transparent 70%)",top:"40%",left:"40%",animation:"orb3 28s ease-in-out infinite"}}/>
      <div style={{position:"absolute",inset:0,opacity:0.025,backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,backgroundSize:"200px"}}/>
    </div>
  );
}

// ─── GLASS CARD ───────────────────────────────────────────────────────────────

function Glass({ children, style={}, onClick, hover=true }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: hovered ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
        backdropFilter:"blur(20px)",
        WebkitBackdropFilter:"blur(20px)",
        border: hovered ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(255,255,255,0.08)",
        borderRadius:20,
        transition:"all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        cursor: onClick ? "pointer" : "default",
        transform: hovered && onClick ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 20px 60px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.2)",
        ...style,
      }}>
      {children}
    </div>
  );
}

// ─── PARTICLES ────────────────────────────────────────────────────────────────

let pid = 0;
function Particles({items, onRemove}) {
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999}}>
      {items.map(p => (
        <div key={p.id} onAnimationEnd={() => onRemove(p.id)} style={{
          position:"absolute",left:p.x,top:p.y,transform:"translateX(-50%)",
          fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:p.big?"1.3rem":"0.9rem",
          color:p.color,textShadow:`0 0 20px ${p.color}`,
          animation:"floatUp 1.1s cubic-bezier(0.22,1,0.36,1) forwards",
          whiteSpace:"nowrap",
        }}>{p.text}</div>
      ))}
    </div>
  );
}

// ─── TOASTS ───────────────────────────────────────────────────────────────────

function Toasts({items}) {
  return (
    <div style={{position:"fixed",top:90,right:20,zIndex:8000,display:"flex",flexDirection:"column",gap:10,pointerEvents:"none"}}>
      {items.map(t => (
        <div key={t.id} style={{
          background:"rgba(10,10,24,0.88)",backdropFilter:"blur(20px)",
          border:`1px solid ${t.color}33`,borderLeft:`3px solid ${t.color}`,
          borderRadius:14,padding:"12px 18px",minWidth:260,
          boxShadow:`0 8px 32px rgba(0,0,0,0.4),0 0 24px ${t.color}11`,
          animation:"slideInR 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          <div style={{color:t.color,fontWeight:600,fontSize:"0.8rem"}}>{t.title}</div>
          {t.body && <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.72rem",marginTop:3}}>{t.body}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────

function Modal({children, onClose}) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:4000,background:"rgba(4,4,16,0.7)",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,animation:"fadeIn 0.25s ease"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{animation:"scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",width:"100%",maxWidth:480}}>
        {children}
      </div>
    </div>
  );
}

// ─── CHARACTER ────────────────────────────────────────────────────────────────

function Character({level, streak, degraded}) {
  const li = getLevelInfo(level);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",position:"relative"}}>
      {[220,178,144].map((s,i) => (
        <div key={i} style={{position:"absolute",top:"50%",left:"50%",width:s,height:s,marginTop:-s/2-30,marginLeft:-s/2,borderRadius:"50%",border:`1px solid ${degraded?"rgba(239,68,68,"+(0.14-i*0.04)+")":"rgba(255,255,255,"+(0.055-i*0.014)+")"}`,animation:`${i%2?"spinRev":"spin"} ${20+i*8}s linear infinite`}}/>
      ))}
      <div style={{position:"absolute",top:"50%",left:"50%",width:140,height:140,marginTop:-100,marginLeft:-70,borderRadius:"50%",background:degraded?"radial-gradient(circle,rgba(239,68,68,0.18),transparent 70%)":`radial-gradient(circle,${li.color}22,transparent 70%)`,filter:"blur(20px)",animation:"breathe 4s ease-in-out infinite"}}/>
      <div style={{width:128,height:128,borderRadius:"50%",background:degraded?"radial-gradient(circle at 38% 32%,#1f0808,#0d0404)":"radial-gradient(circle at 38% 32%,#1a1a3e,#0a0a1e)",border:`1.5px solid ${degraded?"rgba(239,68,68,0.4)":li.color+"44"}`,boxShadow:degraded?"0 0 40px rgba(239,68,68,0.2),inset 0 0 20px rgba(239,68,68,0.05)":`0 0 50px ${li.color}1e,inset 0 0 30px ${li.color}08`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",animation:degraded?"glitch 0.35s infinite":"breathe 5s ease-in-out infinite"}}>
        <div style={{fontSize:"3.6rem",lineHeight:1,filter:degraded?"grayscale(1) brightness(0.3)":`drop-shadow(0 0 10px ${li.color})`,userSelect:"none"}}>🧍</div>
        <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 4px,rgba(255,255,255,0.01) 4px,rgba(255,255,255,0.01) 5px)",pointerEvents:"none"}}/>
      </div>
      <div style={{textAlign:"center",marginTop:20}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"2.6rem",lineHeight:1,background:degraded?"linear-gradient(135deg,#ef4444,#dc2626)":`linear-gradient(135deg,#fff,${li.color})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{String(level).padStart(2,"0")}</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.62rem",letterSpacing:3,color:degraded?"#ef4444":li.color,marginTop:5,textTransform:"uppercase"}}>{degraded?"⚠ Corrupted":li.title}</div>
        <div style={{color:"rgba(255,255,255,0.28)",fontSize:"0.62rem",marginTop:6,letterSpacing:1}}>{streak>0?`🔥 ${streak} day streak`:"Start your streak"}</div>
      </div>
    </div>
  );
}

// ─── STAT BAR ─────────────────────────────────────────────────────────────────

function StatBar({stat, value, onClick, flash}) {
  const pct = Math.min((value/2000)*100,100);
  const [h,setH] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{padding:"11px 14px",borderRadius:14,cursor:"pointer",marginBottom:6,background:flash?`${stat.color}12`:h?"rgba(255,255,255,0.055)":"rgba(255,255,255,0.03)",border:`1px solid ${flash?stat.color+"44":h?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.07)"}`,transition:"all 0.3s ease",transform:h?"translateX(3px)":"none"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <span style={{fontSize:"1rem"}}>{stat.icon}</span>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,color:"rgba(255,255,255,0.9)",fontSize:"0.82rem"}}>{stat.label}</div>
            <div style={{color:"rgba(255,255,255,0.28)",fontSize:"0.6rem",marginTop:1}}>{stat.sub}</div>
          </div>
        </div>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.8rem",color:stat.color}}>{value}<span style={{color:"rgba(255,255,255,0.22)",fontSize:"0.58rem",fontWeight:400}}> xp</span></div>
      </div>
      <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,borderRadius:2,background:stat.grad,boxShadow:`0 0 8px ${stat.color}88`,transition:"width 0.9s cubic-bezier(0.34,1.56,0.64,1)"}}/>
      </div>
    </div>
  );
}

// ─── MISSION PANEL ────────────────────────────────────────────────────────────

function MissionPanel({statKey, todayLog, onClose, onComplete}) {
  const stat = STATS_CONFIG.find(s=>s.key===statKey);
  const missions = MISSIONS_CONFIG[statKey]||[];
  const [logged, setLogged] = useState(new Set(todayLog||[]));
  const [nums, setNums] = useState({});
  const done = missions.filter(m=>logged.has(m.id)).length;

  const handleCheck = m => {
    if(logged.has(m.id)) return;
    setLogged(p=>new Set([...p,m.id]));
    onComplete(statKey,m.xp||50,m.id,m.label);
  };
  const handleNum = (m,v) => setNums(p=>({...p,[m.id]:Math.max(0,parseInt(v)||0)}));
  const submitNum = m => {
    const n=nums[m.id]||0;
    if(!n||logged.has(m.id)) return;
    setLogged(p=>new Set([...p,m.id]));
    onComplete(statKey,Math.round(n*(m.xpPer||1)),m.id,`${m.label}: ${n} ${m.unit}`);
  };

  return (
    <Modal onClose={onClose}>
      <div style={{background:"rgba(8,8,20,0.94)",backdropFilter:"blur(30px)",border:`1px solid ${stat.color}28`,borderRadius:24,overflow:"hidden",boxShadow:`0 40px 80px rgba(0,0,0,0.6),0 0 0 1px ${stat.color}12`}}>
        <div style={{padding:"24px 24px 20px",background:`linear-gradient(135deg,${stat.color}14,transparent)`,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1.3rem",color:"#fff"}}>{stat.icon} {stat.label}</div>
              <div style={{color:"rgba(255,255,255,0.35)",fontSize:"0.7rem",marginTop:3}}>{stat.sub}</div>
            </div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.45)",borderRadius:10,padding:"7px 13px",cursor:"pointer",fontSize:"0.8rem",transition:"all 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.11)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";}}>✕</button>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.65rem",color:"rgba(255,255,255,0.3)",marginBottom:7}}><span>Progress</span><span style={{color:stat.color,fontWeight:600}}>{done}/{missions.length}</span></div>
          <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${(done/missions.length)*100}%`,background:stat.grad,borderRadius:3,boxShadow:`0 0 10px ${stat.color}`,transition:"width 0.6s ease"}}/>
          </div>
        </div>
        <div style={{padding:"16px 24px 24px",maxHeight:"50vh",overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
          {missions.map(m => {
            const isDone = logged.has(m.id);
            return (
              <div key={m.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",borderRadius:12,background:isDone?`${stat.color}0a`:"rgba(255,255,255,0.025)",border:`1px solid ${isDone?stat.color+"22":"rgba(255,255,255,0.05)"}`,transition:"all 0.3s ease",opacity:isDone?0.6:1}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,color:isDone?stat.color:"rgba(255,255,255,0.85)",fontSize:"0.87rem",fontWeight:500}}>{isDone&&<span style={{fontSize:"0.8rem"}}>✓</span>}{m.label}</div>
                  <div style={{color:"rgba(255,255,255,0.22)",fontSize:"0.63rem",marginTop:2}}>{m.type==="check"?`+${m.xp} XP`:`+${m.xpPer} XP per ${m.unit}`}</div>
                </div>
                {m.type==="check"?(
                  <button onClick={()=>handleCheck(m)} disabled={isDone} style={{width:34,height:34,borderRadius:10,border:`1.5px solid ${isDone?stat.color:"rgba(255,255,255,0.14)"}`,background:isDone?`${stat.color}1e`:"transparent",color:isDone?stat.color:"rgba(255,255,255,0.28)",cursor:isDone?"default":"pointer",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.25s ease",flexShrink:0,boxShadow:isDone?`0 0 12px ${stat.color}44`:"none"}}>{isDone?"✓":"○"}</button>
                ):(
                  <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                    <input type="number" min="0" value={nums[m.id]||""} placeholder="0" onChange={e=>handleNum(m,e.target.value)} disabled={isDone} style={{width:60,background:"rgba(255,255,255,0.06)",border:`1px solid ${stat.color}33`,borderRadius:8,padding:"6px 8px",color:stat.color,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.78rem",outline:"none",textAlign:"center"}}/>
                    <span style={{color:"rgba(255,255,255,0.22)",fontSize:"0.62rem",width:32}}>{m.unit}</span>
                    <button onClick={()=>submitNum(m)} disabled={isDone||!nums[m.id]} style={{background:isDone||!nums[m.id]?"rgba(255,255,255,0.03)":`${stat.color}1e`,border:`1px solid ${isDone||!nums[m.id]?"rgba(255,255,255,0.07)":stat.color+"4a"}`,color:isDone||!nums[m.id]?"rgba(255,255,255,0.18)":stat.color,borderRadius:8,padding:"6px 12px",cursor:isDone||!nums[m.id]?"default":"pointer",fontSize:"0.72rem",fontWeight:600,transition:"all 0.2s"}}>Log</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

// ─── PUNISHMENT ───────────────────────────────────────────────────────────────

function PunishmentScreen({level, xpLost, onDismiss}) {
  const cfg = [
    {title:"Warning Issued",    body:"You missed a day. The protocol remembers.",       emoji:"⚠",color:"#fbbf24"},
    {title:"XP Penalty",        body:`${xpLost} XP drained. Streak reset to zero.`,     emoji:"💀",color:"#ef4444"},
    {title:"System Corruption", body:"Three days of failure. Your character degrades.", emoji:"☠",color:"#dc2626"},
  ];
  const c = cfg[Math.min(level-1,2)];
  return (
    <div style={{position:"fixed",inset:0,zIndex:9000,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn 0.3s ease"}}>
      <div style={{background:"rgba(8,4,4,0.96)",border:`1px solid ${c.color}44`,borderRadius:28,padding:"48px 36px",maxWidth:400,width:"100%",textAlign:"center",boxShadow:`0 0 100px ${c.color}22,0 40px 80px rgba(0,0,0,0.6)`,animation:"popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)"}}>
        <div style={{fontSize:"3.5rem",marginBottom:20}}>{c.emoji}</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1.4rem",color:"#fff",marginBottom:10}}>{c.title}</div>
        <div style={{color:"rgba(255,255,255,0.45)",fontSize:"0.88rem",lineHeight:1.6,marginBottom:36}}>{c.body}</div>
        <button onClick={onDismiss} style={{background:`linear-gradient(135deg,${c.color}2a,${c.color}18)`,border:`1px solid ${c.color}55`,color:c.color,borderRadius:14,padding:"14px 40px",cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.85rem",transition:"all 0.25s ease"}} onMouseEnter={e=>{e.currentTarget.style.background=`linear-gradient(135deg,${c.color}44,${c.color}2a)`;}} onMouseLeave={e=>{e.currentTarget.style.background=`linear-gradient(135deg,${c.color}2a,${c.color}18)`;}}>Acknowledge</button>
      </div>
    </div>
  );
}

// ─── AI COACH ─────────────────────────────────────────────────────────────────

function AICoach({stats, streak, level, onClose}) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [init, setInit] = useState(false);
  const bottomRef = useRef(null);

  const statsCtx = STATS_CONFIG.map(s=>`${s.label}: ${stats[s.key]} XP`).join(", ");
  const sys = `You are PRIME COACH — a sharp, caring AI performance coach inside a self-improvement RPG. Direct, warm, never sycophantic. Short punchy responses under 120 words. The user is a 20-year-old CS student and basketball player building their best self. Stats: ${statsCtx}. Level: ${level}. Streak: ${streak} days.`;

  const send = async msg => {
    if(!msg.trim()) return;
    const updated = [...msgs,{role:"user",content:msg}];
    setMsgs(updated); setInput(""); setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:sys,messages:updated})});
      const data = await res.json();
      setMsgs(p=>[...p,{role:"assistant",content:data.content?.find(b=>b.type==="text")?.text||"Signal lost."}]);
    } catch { setMsgs(p=>[...p,{role:"assistant",content:"Connection error. Retry."}]); }
    setLoading(false);
  };

  useEffect(()=>{ if(!init){setInit(true);send("Quick status check — what should I focus on today?");} },[]);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,loading]);

  const weak = STATS_CONFIG.reduce((a,b)=>stats[a.key]<stats[b.key]?a:b);
  const quickQ = [`Improve my ${weak.label.toLowerCase()}?`,"Today's priority?","Motivate me","How close to pro?"];

  return (
    <div style={{position:"fixed",inset:0,zIndex:5000,background:"rgba(4,4,16,0.75)",backdropFilter:"blur(20px)",display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"fadeIn 0.25s ease"}}>
      <div style={{width:"100%",maxWidth:540,height:"82vh",background:"rgba(8,8,22,0.96)",backdropFilter:"blur(30px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"28px 28px 0 0",display:"flex",flexDirection:"column",boxShadow:"0 -20px 80px rgba(0,0,0,0.5)",animation:"slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"14px 0 0"}}><div style={{width:40,height:4,borderRadius:2,background:"rgba(255,255,255,0.14)"}}/></div>
        <div style={{padding:"16px 24px 14px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1rem",color:"#fff"}}>Prime Coach</div>
            <div style={{color:"rgba(255,255,255,0.28)",fontSize:"0.66rem",marginTop:2}}>AI Performance System · Online</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.45)",borderRadius:10,padding:"7px 13px",cursor:"pointer",fontSize:"0.8rem",transition:"all 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";}}>✕</button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"20px 20px 10px",display:"flex",flexDirection:"column",gap:14}}>
          {msgs.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"82%",padding:"12px 16px",borderRadius:m.role==="user"?"18px 18px 4px 18px":"4px 18px 18px 18px",background:m.role==="user"?"linear-gradient(135deg,rgba(56,189,248,0.18),rgba(129,140,248,0.18))":"rgba(255,255,255,0.055)",border:m.role==="user"?"1px solid rgba(56,189,248,0.22)":"1px solid rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.88)",fontSize:"0.87rem",lineHeight:1.6}}>{m.content}</div>
            </div>
          ))}
          {loading&&(
            <div style={{display:"flex",justifyContent:"flex-start"}}>
              <div style={{padding:"12px 18px",borderRadius:"4px 18px 18px 18px",background:"rgba(255,255,255,0.055)",border:"1px solid rgba(255,255,255,0.07)",display:"flex",gap:5,alignItems:"center"}}>
                {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"rgba(255,255,255,0.28)",animation:`pulse 1.2s ease-in-out ${i*0.18}s infinite`}}/>)}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>
        <div style={{padding:"8px 20px",display:"flex",gap:7,flexWrap:"wrap"}}>
          {quickQ.map((q,i)=>(
            <button key={i} onClick={()=>send(q)} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"rgba(255,255,255,0.45)",borderRadius:20,padding:"5px 13px",cursor:"pointer",fontSize:"0.7rem",transition:"all 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(56,189,248,0.1)";e.currentTarget.style.color="#38bdf8";e.currentTarget.style.borderColor="rgba(56,189,248,0.28)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.color="rgba(255,255,255,0.45)";e.currentTarget.style.borderColor="rgba(255,255,255,0.09)";}}>{q}</button>
          ))}
        </div>
        <div style={{padding:"10px 20px 24px",display:"flex",gap:10}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(input)} placeholder="Ask anything..." style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:14,padding:"12px 16px",color:"#fff",fontSize:"0.88rem",outline:"none",transition:"border-color 0.2s"}} onFocus={e=>{e.target.style.borderColor="rgba(56,189,248,0.38)";}} onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,0.09)";}}/>
          <button onClick={()=>send(input)} disabled={loading||!input.trim()} style={{background:input.trim()?"linear-gradient(135deg,#38bdf8,#818cf8,#e879f9)":"rgba(255,255,255,0.05)",border:"none",color:input.trim()?"#000":"rgba(255,255,255,0.2)",borderRadius:14,padding:"12px 20px",cursor:input.trim()?"pointer":"default",fontWeight:800,fontSize:"1rem",transition:"all 0.25s",boxShadow:input.trim()?"0 4px 20px rgba(56,189,248,0.3)":"none"}}>↑</button>
        </div>
      </div>
    </div>
  );
}

// ─── HISTORY SHEET ────────────────────────────────────────────────────────────

function HistorySheet({history, onClose}) {
  const grouped = {};
  [...history].reverse().forEach(h=>{ if(!grouped[h.date]) grouped[h.date]=[]; grouped[h.date].push(h); });
  return (
    <div style={{position:"fixed",inset:0,zIndex:5000,background:"rgba(4,4,16,0.75)",backdropFilter:"blur(20px)",display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"fadeIn 0.25s ease"}}>
      <div style={{width:"100%",maxWidth:540,height:"78vh",background:"rgba(8,8,22,0.96)",backdropFilter:"blur(30px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"28px 28px 0 0",display:"flex",flexDirection:"column",boxShadow:"0 -20px 80px rgba(0,0,0,0.5)",animation:"slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"14px 0 0"}}><div style={{width:40,height:4,borderRadius:2,background:"rgba(255,255,255,0.14)"}}/></div>
        <div style={{padding:"16px 24px 14px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1rem"}}>Mission Log</div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.45)",borderRadius:10,padding:"7px 13px",cursor:"pointer",fontSize:"0.8rem"}}>✕</button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"20px"}}>
          {Object.keys(grouped).length===0?(
            <div style={{color:"rgba(255,255,255,0.2)",textAlign:"center",marginTop:60,fontSize:"0.85rem"}}>No missions logged yet</div>
          ):Object.entries(grouped).map(([date,items])=>(
            <div key={date} style={{marginBottom:24}}>
              <div style={{color:"rgba(255,255,255,0.22)",fontSize:"0.63rem",letterSpacing:2,marginBottom:10,textTransform:"uppercase"}}>{date}</div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {items.map((item,i)=>{
                  const stat=STATS_CONFIG.find(s=>s.key===item.statKey);
                  return (
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.05)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span>{stat?.icon||"✦"}</span>
                        <div>
                          <div style={{fontSize:"0.84rem",color:"rgba(255,255,255,0.78)"}}>{item.label}</div>
                          <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.22)",marginTop:1}}>{stat?.label}</div>
                        </div>
                      </div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.78rem",color:stat?.color||"#38bdf8"}}>+{item.xp} XP</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE SETUP ────────────────────────────────────────────────────────────

function ProfileSetup({onSave}) {
  const [name,setName] = useState("");
  const ready = name.trim().length>0;
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden"}}>
      <AmbientBg tab="dashboard"/>
      <div style={{position:"relative",zIndex:1,textAlign:"center",maxWidth:380,width:"100%",animation:"fadeUp 0.7s ease"}}>
        <div style={{marginBottom:48}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"3.8rem",letterSpacing:"-2px",lineHeight:1,background:"linear-gradient(135deg,#fff 30%,#38bdf8 65%,#818cf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Prime</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"3.8rem",letterSpacing:"-2px",lineHeight:1,background:"linear-gradient(135deg,#818cf8,#e879f9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Protocol</div>
          <div style={{color:"rgba(255,255,255,0.28)",fontSize:"0.78rem",marginTop:16,letterSpacing:3,textTransform:"uppercase"}}>Your life. Gamified.</div>
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:24,padding:"32px 28px"}}>
          <div style={{color:"rgba(255,255,255,0.35)",fontSize:"0.72rem",letterSpacing:2,marginBottom:20,textTransform:"uppercase"}}>Initialize your profile</div>
          <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ready&&onSave(name.trim())} placeholder="Your name" autoFocus
            style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${ready?"rgba(56,189,248,0.38)":"rgba(255,255,255,0.1)"}`,borderRadius:14,padding:"14px 18px",color:"#fff",fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:"1rem",outline:"none",textAlign:"center",marginBottom:16,transition:"border-color 0.3s"}}/>
          <button onClick={()=>ready&&onSave(name.trim())} style={{width:"100%",background:ready?"linear-gradient(135deg,#38bdf8,#818cf8,#e879f9)":"rgba(255,255,255,0.05)",border:"none",color:ready?"#000":"rgba(255,255,255,0.2)",borderRadius:14,padding:"15px",cursor:ready?"pointer":"default",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"0.9rem",transition:"all 0.3s ease",letterSpacing:"0.5px",boxShadow:ready?"0 8px 32px rgba(56,189,248,0.28)":"none"}}>Begin Protocol →</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function PrimeProtocol() {
  const [state,setState] = useState(()=>loadState());
  const [tab,setTab] = useState("dashboard");
  const [activeMission,setActiveMission] = useState(null);
  const [showCoach,setShowCoach] = useState(false);
  const [showHistory,setShowHistory] = useState(false);
  const [showReset,setShowReset] = useState(false);
  const [particles,setParticles] = useState([]);
  const [toasts,setToasts] = useState([]);
  const [punishment,setPunishment] = useState(null);
  const [flashing,setFlashing] = useState({});

  useEffect(()=>{ saveState(state); },[state]);

  useEffect(()=>{
    const today=getTodayKey();
    if(!state.lastActiveDate||state.lastActiveDate===today) return;
    const diff=Math.floor((new Date(today)-new Date(state.lastActiveDate))/86400000);
    if(diff>=1){
      const lvl=Math.min(diff,3);
      let xpLost=0;
      if(lvl>=2) xpLost=Math.round(state.totalXP*0.15);
      if(lvl>=3) xpLost=Math.round(state.totalXP*0.30);
      setState(p=>({...p,streak:lvl>=2?0:p.streak,totalXP:Math.max(0,p.totalXP-xpLost),degraded:lvl>=3,missedDays:diff}));
      setPunishment({level:lvl,xpLost});
    }
  },[]);

  const addToast = useCallback((title,body,color)=>{
    const id=Date.now()+Math.random();
    setToasts(p=>[...p,{id,title,body,color}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3500);
  },[]);

  const addParticle = useCallback((text,color,big=false)=>{
    const id=++pid;
    const x=window.innerWidth*0.5+(Math.random()-0.5)*180;
    const y=window.innerHeight*0.38+(Math.random()-0.5)*80;
    setParticles(p=>[...p,{id,text,color,x,y,big}]);
  },[]);

  const handleComplete = useCallback((statKey,xp,missionId,label)=>{
    const stat=STATS_CONFIG.find(s=>s.key===statKey);
    const today=getTodayKey();
    const mult=1+(state.streak*0.03);
    const earned=Math.round(xp*mult);
    setState(prev=>{
      const prevLog=prev.dailyLogs[today]||[];
      if(prevLog.includes(missionId)) return prev;
      const newStreak=prev.lastActiveDate===today?prev.streak:prev.streak+1;
      return {...prev,stats:{...prev.stats,[statKey]:prev.stats[statKey]+earned},totalXP:prev.totalXP+earned,streak:newStreak,longestStreak:Math.max(prev.longestStreak||0,newStreak),lastActiveDate:today,degraded:false,dailyLogs:{...prev.dailyLogs,[today]:[...prevLog,missionId]},history:[...prev.history,{date:today,statKey,label:label||missionId,xp:earned}]};
    });
    setFlashing(p=>({...p,[statKey]:true}));
    setTimeout(()=>setFlashing(p=>({...p,[statKey]:false})),900);
    addParticle(`+${earned} xp`,stat.color,earned>80);
    addToast(`${stat.icon} ${stat.label}`,`+${earned} XP · ${label||"Mission complete"}`,stat.color);
    const newTotal=state.totalXP+earned;
    if(calcLevel(newTotal)>calcLevel(state.totalXP)){
      setTimeout(()=>addToast("Level Up ⬆",`Level ${calcLevel(newTotal)} — ${getLevelInfo(calcLevel(newTotal)).title}`,"#fbbf24"),600);
      addParticle("LEVEL UP!","#fbbf24",true);
    }
  },[state,addParticle,addToast]);

  const resetAll=()=>{ const f=defaultState(); setState(f); saveState(f); setShowReset(false); };

  if(!state.profile.name) return (<><style>{CSS}</style><ProfileSetup onSave={n=>setState(p=>({...p,profile:{name:n,created:Date.now()}}))} /></>);

  const level=calcLevel(state.totalXP);
  const li=getLevelInfo(level);
  const xpInLevel=state.totalXP%XP_PER_LEVEL;
  const xpPct=(xpInLevel/XP_PER_LEVEL)*100;
  const today=getTodayKey();
  const todayLogs=state.dailyLogs[today]||[];
  const totalM=Object.values(MISSIONS_CONFIG).flat().length;
  const doneToday=todayLogs.length;
  const weak=STATS_CONFIG.reduce((a,b)=>state.stats[a.key]<state.stats[b.key]?a:b);
  const strong=STATS_CONFIG.reduce((a,b)=>state.stats[a.key]>state.stats[b.key]?a:b);

  const TABS=[{key:"dashboard",icon:"⬡",label:"Home"},{key:"missions",icon:"◎",label:"Missions"},{key:"stats",icon:"◈",label:"Stats"},{key:"profile",icon:"◉",label:"Profile"}];

  return (
    <>
      <style>{CSS}</style>
      <AmbientBg tab={tab}/>
      <Particles items={particles} onRemove={id=>setParticles(p=>p.filter(x=>x.id!==id))}/>
      <Toasts items={toasts}/>
      {punishment&&<PunishmentScreen level={punishment.level} xpLost={punishment.xpLost} onDismiss={()=>setPunishment(null)}/>}
      {activeMission&&<MissionPanel statKey={activeMission} todayLog={todayLogs} onClose={()=>setActiveMission(null)} onComplete={handleComplete}/>}
      {showCoach&&<AICoach stats={state.stats} streak={state.streak} level={level} onClose={()=>setShowCoach(false)}/>}
      {showHistory&&<HistorySheet history={state.history} onClose={()=>setShowHistory(false)}/>}

      <div style={{position:"relative",zIndex:1,height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* HEADER */}
        <div style={{padding:"16px 20px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"rgba(6,6,18,0.6)",backdropFilter:"blur(20px)",flexShrink:0}}>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1.2rem",background:"linear-gradient(135deg,#fff,#38bdf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"-0.5px"}}>Prime Protocol</div>
            <div style={{color:"rgba(255,255,255,0.22)",fontSize:"0.6rem",letterSpacing:2,textTransform:"uppercase",marginTop:1}}>Self-Improvement RPG</div>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <button onClick={()=>setShowCoach(true)} style={{background:"rgba(56,189,248,0.09)",border:"1px solid rgba(56,189,248,0.22)",color:"#38bdf8",borderRadius:12,padding:"7px 14px",cursor:"pointer",fontSize:"0.72rem",fontWeight:600,transition:"all 0.25s ease"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(56,189,248,0.16)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(56,189,248,0.09)";}}>AI Coach</button>
            <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"6px 12px"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"0.88rem",color:li.color,lineHeight:1}}>{String(level).padStart(2,"0")}</div>
                <div style={{fontSize:"0.5rem",color:"rgba(255,255,255,0.22)",letterSpacing:1}}>LVL</div>
              </div>
              <div style={{width:1,height:20,background:"rgba(255,255,255,0.08)"}}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"0.88rem",color:"#fbbf24",lineHeight:1}}>🔥{state.streak}</div>
                <div style={{fontSize:"0.5rem",color:"rgba(255,255,255,0.22)",letterSpacing:1}}>STREAK</div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{flex:1,overflowY:"auto",padding:"20px 16px 100px"}}>

          {/* DASHBOARD */}
          {tab==="dashboard"&&(
            <div style={{animation:"tabSlide 0.35s ease",maxWidth:800,margin:"0 auto"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1.6fr",gap:16}}>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <Glass style={{padding:"28px 20px",textAlign:"center"}}>
                    <Character totalXP={state.totalXP} streak={state.streak} degraded={state.degraded} level={level}/>
                  </Glass>
                  <Glass style={{padding:"16px 18px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
                      <span style={{color:"rgba(255,255,255,0.35)",fontSize:"0.66rem",letterSpacing:1,textTransform:"uppercase"}}>Total XP</span>
                      <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"0.9rem"}}>{state.totalXP.toLocaleString()}</span>
                    </div>
                    <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden",marginBottom:7}}>
                      <div style={{height:"100%",width:`${xpPct}%`,background:"linear-gradient(90deg,#38bdf8,#818cf8,#e879f9)",borderRadius:3,boxShadow:"0 0 12px rgba(56,189,248,0.45)",transition:"width 0.9s ease"}}/>
                    </div>
                    <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.18)",textAlign:"right"}}>{XP_PER_LEVEL-xpInLevel} xp to level {level+1}</div>
                  </Glass>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {[{label:"Today",value:`${doneToday}/${totalM}`,color:"#38bdf8"},{label:"Best streak",value:`${state.longestStreak||0}d`,color:"#fbbf24"},{label:"Strongest",value:strong.label,color:strong.color},{label:"Needs work",value:weak.label,color:weak.color}].map(c=>(
                      <Glass key={c.label} style={{padding:"11px 13px"}}>
                        <div style={{color:"rgba(255,255,255,0.26)",fontSize:"0.57rem",letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>{c.label}</div>
                        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.78rem",color:c.color}}>{c.value}</div>
                      </Glass>
                    ))}
                  </div>
                  <button onClick={()=>setShowHistory(true)} style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.35)",borderRadius:14,padding:"11px",cursor:"pointer",fontSize:"0.73rem",fontWeight:500,transition:"all 0.25s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.color="rgba(255,255,255,0.65)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.025)";e.currentTarget.style.color="rgba(255,255,255,0.35)";}}>View mission log →</button>
                </div>
                <div>
                  <div style={{color:"rgba(255,255,255,0.18)",fontSize:"0.6rem",letterSpacing:2,textTransform:"uppercase",marginBottom:13}}>Stat Matrix · tap to log</div>
                  {STATS_CONFIG.map(s=>(<StatBar key={s.key} stat={s} value={state.stats[s.key]} onClick={()=>setActiveMission(s.key)} flash={!!flashing[s.key]}/>))}
                </div>
              </div>
            </div>
          )}

          {/* MISSIONS */}
          {tab==="missions"&&(
            <div style={{animation:"tabSlide 0.35s ease",maxWidth:800,margin:"0 auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{color:"rgba(255,255,255,0.3)",fontSize:"0.65rem",letterSpacing:2,textTransform:"uppercase"}}>Today's categories</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,color:"rgba(255,255,255,0.45)",fontSize:"0.8rem"}}>{doneToday}<span style={{color:"rgba(255,255,255,0.18)"}}>/{totalM}</span></div>
              </div>
              <div style={{height:3,background:"rgba(255,255,255,0.05)",borderRadius:2,overflow:"hidden",marginBottom:20}}>
                <div style={{height:"100%",width:`${(doneToday/totalM)*100}%`,background:"linear-gradient(90deg,#38bdf8,#818cf8,#e879f9)",transition:"width 0.8s ease",borderRadius:2}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(168px,1fr))",gap:12}}>
                {STATS_CONFIG.map(s=>{
                  const ms=MISSIONS_CONFIG[s.key]||[];
                  const done=ms.filter(m=>todayLogs.includes(m.id)).length;
                  const complete=done===ms.length;
                  return (
                    <Glass key={s.key} onClick={()=>setActiveMission(s.key)} style={{padding:"20px 16px",background:complete?`${s.color}0f`:"rgba(255,255,255,0.025)",border:complete?`1px solid ${s.color}2a`:"1px solid rgba(255,255,255,0.07)",boxShadow:complete?`0 0 24px ${s.color}14`:"none"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                        <span style={{fontSize:"1.7rem"}}>{s.icon}</span>
                        {complete&&<span style={{color:s.color,fontSize:"0.85rem",animation:"popIn 0.3s ease"}}>✓</span>}
                      </div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.85rem",color:"rgba(255,255,255,0.88)",marginBottom:3}}>{s.label}</div>
                      <div style={{color:"rgba(255,255,255,0.28)",fontSize:"0.63rem",marginBottom:12}}>{s.sub}</div>
                      <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden",marginBottom:7}}>
                        <div style={{height:"100%",width:`${(done/ms.length)*100}%`,background:s.grad,borderRadius:2,transition:"width 0.6s ease"}}/>
                      </div>
                      <div style={{color:"rgba(255,255,255,0.22)",fontSize:"0.63rem"}}>{done}/{ms.length} done</div>
                    </Glass>
                  );
                })}
              </div>
            </div>
          )}

          {/* STATS */}
          {tab==="stats"&&(
            <div style={{animation:"tabSlide 0.35s ease",maxWidth:800,margin:"0 auto"}}>
              <div style={{color:"rgba(255,255,255,0.18)",fontSize:"0.6rem",letterSpacing:2,textTransform:"uppercase",marginBottom:18}}>Performance Analytics</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(195px,1fr))",gap:12,marginBottom:18}}>
                {STATS_CONFIG.map(s=>{
                  const pct=Math.min((state.stats[s.key]/2000)*100,100);
                  return (
                    <Glass key={s.key} onClick={()=>setActiveMission(s.key)} style={{padding:18}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:"1rem"}}>{s.icon}</span>
                          <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.82rem",color:"rgba(255,255,255,0.85)"}}>{s.label}</span>
                        </div>
                        <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.78rem",color:s.color}}>{state.stats[s.key]}</span>
                      </div>
                      <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden",marginBottom:8}}>
                        <div style={{height:"100%",width:`${pct}%`,background:s.grad,borderRadius:3,boxShadow:`0 0 8px ${s.color}55`}}/>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.6rem",color:"rgba(255,255,255,0.22)"}}>
                        <span>{Math.round(pct)}% mastery</span><span>{s.sub}</span>
                      </div>
                    </Glass>
                  );
                })}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {[{label:"Total XP",value:state.totalXP.toLocaleString(),color:"#38bdf8"},{label:"Level",value:`Lv ${level}`,color:li.color},{label:"Best streak",value:`${state.longestStreak||0}d`,color:"#fbbf24"},{label:"Missions done",value:state.history.length,color:"#34d399"},{label:"Strongest",value:strong.label,color:strong.color},{label:"Weakest",value:weak.label,color:weak.color}].map(c=>(
                  <Glass key={c.label} style={{padding:"13px 15px",textAlign:"center"}}>
                    <div style={{color:"rgba(255,255,255,0.22)",fontSize:"0.57rem",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>{c.label}</div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"0.88rem",color:c.color}}>{c.value}</div>
                  </Glass>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE */}
          {tab==="profile"&&(
            <div style={{animation:"tabSlide 0.35s ease",maxWidth:480,margin:"0 auto"}}>
              <Glass style={{padding:"32px 24px",marginBottom:14,textAlign:"center",background:`linear-gradient(135deg,${li.color}0e,rgba(255,255,255,0.025))`}}>
                <div style={{width:72,height:72,borderRadius:"50%",background:`linear-gradient(135deg,${li.color}2a,${li.color}0e)`,border:`2px solid ${li.color}3a`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",margin:"0 auto 16px",boxShadow:`0 0 30px ${li.color}1e`}}>👤</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1.5rem",color:"#fff",marginBottom:4}}>{state.profile.name}</div>
                <div style={{color:li.color,fontSize:"0.7rem",letterSpacing:2,textTransform:"uppercase",marginBottom:20}}>{li.title}</div>
                <div style={{display:"flex",justifyContent:"center",gap:10}}>
                  {[{l:"Level",v:level,c:li.color},{l:"Streak",v:`${state.streak}d`,c:"#fbbf24"},{l:"Total XP",v:state.totalXP,c:"#38bdf8"}].map(b=>(
                    <div key={b.l} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"10px 18px"}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1rem",color:b.c}}>{b.v}</div>
                      <div style={{color:"rgba(255,255,255,0.22)",fontSize:"0.6rem",marginTop:2}}>{b.l}</div>
                    </div>
                  ))}
                </div>
              </Glass>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[{label:"Mission Log",icon:"◎",action:()=>setShowHistory(true),color:"rgba(255,255,255,0.55)"},{label:"AI Coach",icon:"⬡",action:()=>setShowCoach(true),color:"#38bdf8"}].map(b=>(
                  <button key={b.label} onClick={b.action} style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.07)",color:b.color,borderRadius:16,padding:"16px 20px",cursor:"pointer",fontWeight:600,fontSize:"0.87rem",textAlign:"left",transition:"all 0.25s",display:"flex",alignItems:"center",gap:12}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.065)";e.currentTarget.style.transform="translateX(4px)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.025)";e.currentTarget.style.transform="none";}}><span style={{fontSize:"1rem"}}>{b.icon}</span>{b.label}</button>
                ))}
                {!showReset?(
                  <button onClick={()=>setShowReset(true)} style={{background:"rgba(239,68,68,0.04)",border:"1px solid rgba(239,68,68,0.14)",color:"rgba(239,68,68,0.55)",borderRadius:16,padding:"16px 20px",cursor:"pointer",fontWeight:600,fontSize:"0.87rem",textAlign:"left",transition:"all 0.25s",display:"flex",alignItems:"center",gap:12}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.09)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(239,68,68,0.04)";}}>⚠ Reset all data</button>
                ):(
                  <Glass style={{padding:20,background:"rgba(239,68,68,0.05)",border:"1px solid rgba(239,68,68,0.18)"}}>
                    <div style={{color:"rgba(255,255,255,0.55)",fontSize:"0.84rem",marginBottom:14}}>This permanently deletes all progress. Are you sure?</div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={resetAll} style={{flex:1,background:"rgba(239,68,68,0.18)",border:"1px solid rgba(239,68,68,0.38)",color:"#ef4444",borderRadius:12,padding:"11px",cursor:"pointer",fontWeight:700,fontSize:"0.8rem",transition:"all 0.2s"}}>Confirm Reset</button>
                      <button onClick={()=>setShowReset(false)} style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"rgba(255,255,255,0.38)",borderRadius:12,padding:"11px",cursor:"pointer",fontSize:"0.8rem",transition:"all 0.2s"}}>Cancel</button>
                    </div>
                  </Glass>
                )}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM NAV */}
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(6,6,18,0.88)",backdropFilter:"blur(24px)",borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",padding:"10px 0 max(10px,env(safe-area-inset-bottom))",zIndex:600}}>
          {TABS.map(t=>{
            const active=tab===t.key;
            return (
              <button key={t.key} onClick={()=>setTab(t.key)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"4px 0",transition:"all 0.25s ease"}}>
                <div style={{fontSize:"1.1rem",lineHeight:1,filter:active?"none":"grayscale(1) opacity(0.35)",transform:active?"scale(1.18) translateY(-1px)":"scale(1)",transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)"}}>{t.icon}</div>
                <div style={{fontSize:"0.6rem",fontWeight:active?700:400,color:active?"#fff":"rgba(255,255,255,0.28)",letterSpacing:"0.3px",transition:"all 0.2s"}}>{t.label}</div>
                {active&&<div style={{width:18,height:2,borderRadius:1,background:"linear-gradient(90deg,#38bdf8,#818cf8,#e879f9)",marginTop:-2,animation:"popIn 0.3s ease"}}/>}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
