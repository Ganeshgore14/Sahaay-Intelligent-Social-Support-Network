import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

// ─── FONTS ─────────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap";
document.head.appendChild(fontLink);

// ─── MOCK DATA ──────────────────────────────────────────────────────────────
const CAMPAIGNS = [
  { id:1, ngo:"Green Earth Foundation", ngoId:"ngo1", title:"Clean Water for Rural Villages", category:"Water", raised:82000, goal:100000, donors:234, urgency:92, days:4, img:"💧", location:"Rajasthan, IN", verified:true, fraudScore:2, tags:["water","rural","health"], description:"Providing clean drinking water to 12 villages in drought-hit Rajasthan.", proof:["proof1.jpg"] },
  { id:2, ngo:"Akshara Education Trust", ngoId:"ngo2", title:"Books & Tablets for 500 Children", category:"Education", raised:34000, goal:75000, donors:98, urgency:61, days:18, img:"📚", location:"Bihar, IN", verified:true, fraudScore:5, tags:["education","children","digital"], description:"Equipping underprivileged students with learning resources.", proof:[] },
  { id:3, ngo:"HungerFree India", ngoId:"ngo3", title:"Mid-Day Meals for Tribal Schools", category:"Food", raised:58000, goal:60000, donors:310, urgency:97, days:2, img:"🍱", location:"Odisha, IN", verified:true, fraudScore:1, tags:["food","meals","tribal"], description:"Ensuring nutritious daily meals for 800 children in tribal belt.", proof:["proof1.jpg","proof2.jpg"] },
  { id:4, ngo:"Rebuild Lives NGO", ngoId:"ngo4", title:"Flood Relief — Assam 2025", category:"Disaster", raised:120000, goal:200000, donors:512, urgency:88, days:7, img:"🌊", location:"Assam, IN", verified:false, fraudScore:41, tags:["disaster","flood","relief"], description:"Emergency relief kits and temporary shelters for flood-affected families.", proof:[] },
  { id:5, ngo:"SheLeads Foundation", ngoId:"ngo5", title:"Skill Training for 200 Women", category:"Women", raised:27000, goal:50000, donors:67, urgency:44, days:30, img:"👩‍💼", location:"UP, IN", verified:true, fraudScore:3, tags:["women","skills","livelihood"], description:"Vocational training and micro-finance support for rural women.", proof:["proof1.jpg"] },
  { id:6, ngo:"Animal Rescue India", ngoId:"ngo6", title:"Veterinary Camp — Street Animals", category:"Animals", raised:9000, goal:20000, donors:45, urgency:33, days:45, img:"🐕", location:"Mumbai, IN", verified:true, fraudScore:8, tags:["animals","health","rescue"], description:"Free vaccinations and sterilisation for 1000+ street animals.", proof:[] },
];

const DONORS = [
  { id:"d1", name:"Priya Sharma", points:4200, badge:"🌟 Champion", donations:18, impact:{ lives:42, meals:384, trees:12 }, rank:1, avatar:"PS" },
  { id:"d2", name:"Rahul Verma", points:3800, badge:"💎 Patron", donations:15, impact:{ lives:35, meals:310, trees:8 }, rank:2, avatar:"RV" },
  { id:"d3", name:"Aisha Khan", points:3100, badge:"🔥 Hero", donations:12, impact:{ lives:28, meals:256, trees:6 }, rank:3, avatar:"AK" },
  { id:"d4", name:"You", points:1250, badge:"⭐ Supporter", donations:5, impact:{ lives:11, meals:104, trees:3 }, rank:7, avatar:"ME" },
];

const ACHIEVEMENTS = [
  { id:"first", icon:"🎯", title:"First Donation", desc:"Made your first contribution", unlocked:true },
  { id:"streak3", icon:"🔥", title:"3-Day Streak", desc:"Donated 3 days in a row", unlocked:true },
  { id:"share", icon:"📣", title:"Advocate", desc:"Shared a campaign", unlocked:true },
  { id:"100k", icon:"💰", title:"Centurion", desc:"Total donations ₹1L+", unlocked:false },
  { id:"5camp", icon:"🌐", title:"Versatile", desc:"Donated to 5 categories", unlocked:false },
  { id:"top10", icon:"🏆", title:"Top 10", desc:"Reached leaderboard top 10", unlocked:false },
];

const IMPACT_HISTORY = [
  { month:"Sep", amount:500 }, { month:"Oct", amount:1200 }, { month:"Nov", amount:800 },
  { month:"Dec", amount:2000 }, { month:"Jan", amount:1500 }, { month:"Feb", amount:3500 },
];

const CATEGORY_DATA = [
  { name:"Water", value:35, color:"#22d3ee" }, { name:"Food", value:28, color:"#f97316" },
  { name:"Education", value:20, color:"#a78bfa" }, { name:"Disaster", value:12, color:"#f43f5e" },
  { name:"Others", value:5, color:"#86efac" },
];

const FRAUD_ALERTS = [
  { campaign:"Flood Relief — Assam 2025", score:41, reason:"No proof uploads, rapid donation spikes, unverified NGO", severity:"high" },
  { campaign:"Animal Rescue India", score:8, reason:"Minor: low proof count", severity:"low" },
];

const NGO_QUEUE = [
  { id:"ngo4", name:"Rebuild Lives NGO", reg:"NGO-2024-8812", docs:["pan.pdf","reg.pdf"], status:"pending", submitted:"2025-02-10", location:"Guwahati, Assam" },
  { id:"ngo7", name:"Digital Bharat Foundation", reg:"NGO-2024-9901", docs:["pan.pdf"], status:"pending", submitted:"2025-02-18", location:"Bengaluru, KA" },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────
const pct = (r,g) => Math.round((r/g)*100);
const fmt = n => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n}`;
const urgencyColor = u => u >= 80 ? "#f43f5e" : u >= 50 ? "#f97316" : "#22c55e";
const urgencyLabel = u => u >= 80 ? "🔴 CRITICAL" : u >= 50 ? "🟠 HIGH" : "🟢 MODERATE";

function useCounter(target, duration=1500) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start=0; const step = target/60;
    const t = setInterval(() => { start+=step; if(start>=target){setVal(target);clearInterval(t);}else setVal(Math.floor(start)); }, duration/60);
    return ()=>clearInterval(t);
  }, [target]);
  return val;
}

// ─── STYLES ─────────────────────────────────────────────────────────────────
const S = {
  app: { fontFamily:"'DM Sans', sans-serif", background:"#f0fdf4", minHeight:"100vh", color:"#1c1917" },
  card: { background:"#fff", borderRadius:16, boxShadow:"0 2px 16px rgba(0,0,0,0.07)", padding:20 },
  btn: (c="#16a34a") => ({ background:c, color:"#fff", border:"none", borderRadius:10, padding:"10px 22px", fontWeight:600, cursor:"pointer", fontSize:14, transition:"all 0.2s", fontFamily:"'DM Sans', sans-serif" }),
  btnOutline: { background:"transparent", border:"2px solid #16a34a", color:"#16a34a", borderRadius:10, padding:"8px 20px", fontWeight:600, cursor:"pointer", fontSize:14, fontFamily:"'DM Sans', sans-serif" },
  badge: (c) => ({ background:c+"22", color:c, borderRadius:20, padding:"3px 10px", fontSize:12, fontWeight:600 }),
  input: { width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid #d1fae5", fontSize:14, outline:"none", fontFamily:"'DM Sans', sans-serif", boxSizing:"border-box" },
  header: { background:"linear-gradient(135deg,#14532d,#166534)", color:"#fff", padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  progress: (p) => ({ height:8, borderRadius:8, background:"#dcfce7", overflow:"hidden" }),
  progressBar: (p,c="#16a34a") => ({ width:`${Math.min(p,100)}%`, height:"100%", background:c, borderRadius:8, transition:"width 0.8s ease" }),
  tab: (a) => ({ padding:"8px 18px", borderRadius:8, fontWeight:600, cursor:"pointer", fontSize:14, border:"none", fontFamily:"'DM Sans', sans-serif", background:a?"#16a34a":"transparent", color:a?"#fff":"#166534" }),
  sidebar: { width:220, background:"linear-gradient(180deg,#14532d,#052e16)", minHeight:"100vh", padding:"20px 0", color:"#fff" },
  sideItem: (a) => ({ display:"flex", alignItems:"center", gap:10, padding:"12px 22px", cursor:"pointer", background:a?"rgba(255,255,255,0.15)":"transparent", borderLeft:a?"3px solid #86efac":"3px solid transparent", fontSize:14, fontWeight:a?600:400, transition:"all 0.2s" }),
};

// ─── COMPONENTS ─────────────────────────────────────────────────────────────
function ProgressBar({pct:p, color="#16a34a"}) {
  return <div style={S.progress(p)}><div style={S.progressBar(p,color)}/></div>;
}

function StatCard({icon,label,value,sub,color="#16a34a"}) {
  return (
    <div style={{...S.card, textAlign:"center", padding:20}}>
      <div style={{fontSize:28}}>{icon}</div>
      <div style={{fontSize:26, fontWeight:700, color, margin:"4px 0"}}>{value}</div>
      <div style={{fontWeight:600, fontSize:13, color:"#374151"}}>{label}</div>
      {sub && <div style={{fontSize:11, color:"#9ca3af", marginTop:2}}>{sub}</div>}
    </div>
  );
}

function CampaignCard({c, onDonate, aiPick}) {
  const p = pct(c.raised, c.goal);
  return (
    <div style={{...S.card, position:"relative", overflow:"hidden", transition:"transform 0.2s", cursor:"default"}}
      onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"}
      onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
      {aiPick && <div style={{position:"absolute",top:10,right:10,background:"linear-gradient(135deg,#7c3aed,#2563eb)",color:"#fff",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>🤖 AI Pick</div>}
      {c.fraudScore > 30 && <div style={{position:"absolute",top:10,left:10,background:"#fef2f2",color:"#dc2626",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>⚠️ Under Review</div>}
      <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:12}}>
        <div style={{fontSize:40,lineHeight:1}}>{c.img}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:700,lineHeight:1.3,marginBottom:4}}>{c.title}</div>
          <div style={{fontSize:12,color:"#6b7280"}}>{c.ngo} · {c.location}</div>
          <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
            <span style={S.badge("#16a34a")}>{c.category}</span>
            <span style={S.badge(urgencyColor(c.urgency))}>{urgencyLabel(c.urgency)}</span>
            {c.verified && <span style={S.badge("#0ea5e9")}>✓ Verified</span>}
          </div>
        </div>
      </div>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:10,lineHeight:1.5}}>{c.description}</div>
      <div style={{marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
          <span style={{fontWeight:700,color:"#16a34a"}}>{fmt(c.raised)}</span>
          <span style={{color:"#6b7280",fontSize:12}}>{p}% of {fmt(c.goal)}</span>
        </div>
        <ProgressBar pct={p} color={p>=90?"#f97316":"#16a34a"} />
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}>
        <div style={{fontSize:12,color:"#6b7280"}}>{c.donors} donors · ⏰ {c.days}d left</div>
        <button style={S.btn(c.fraudScore>30?"#9ca3af":"#16a34a")} onClick={()=>c.fraudScore<=30&&onDonate(c)}
          disabled={c.fraudScore>30}>{c.fraudScore>30?"Suspended":"Donate Now"}</button>
      </div>
    </div>
  );
}

// ─── DONATION MODAL ─────────────────────────────────────────────────────────
function DonationModal({campaign, onClose, onSuccess}) {
  const [step, setStep] = useState(1); // 1=amount 2=payment 3=success
  const [amount, setAmount] = useState(500);
  const [method, setMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [processing, setProcessing] = useState(false);
  const presets = [100,250,500,1000,2500,5000];
  const pts = Math.floor(amount/10);
  const meals = Math.floor(amount/15);
  const lives = Math.floor(amount/1000) || 0;

  const pay = () => {
    setProcessing(true);
    setTimeout(()=>{ setProcessing(false); setStep(3); }, 2000);
  };

  const overlay = { position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16 };
  const box = { background:"#fff",borderRadius:20,width:"100%",maxWidth:460,maxHeight:"90vh",overflowY:"auto",padding:28,position:"relative" };

  return (
    <div style={overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={box}>
        <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"#f3f4f6",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16}}>✕</button>
        {step===1 && <>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:22,fontWeight:700,marginBottom:4}}>Donate to</div>
            <div style={{fontSize:16,color:"#16a34a",fontWeight:600}}>{campaign.title}</div>
            <div style={{fontSize:13,color:"#6b7280"}}>{campaign.ngo}</div>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{fontWeight:600,fontSize:13,display:"block",marginBottom:8}}>Quick Select Amount</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {presets.map(p=><button key={p} onClick={()=>setAmount(p)}
                style={{...S.btn(amount===p?"#16a34a":"#f0fdf4"),color:amount===p?"#fff":"#16a34a",border:"1.5px solid #16a34a",padding:"8px 0"}}>₹{p}</button>)}
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{fontWeight:600,fontSize:13,display:"block",marginBottom:6}}>Or Enter Amount</label>
            <input style={S.input} type="number" value={amount} onChange={e=>setAmount(+e.target.value)} min={1} />
          </div>
          <div style={{background:"#f0fdf4",borderRadius:12,padding:14,marginBottom:20}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:8,color:"#166534"}}>Your Impact Preview</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,textAlign:"center"}}>
              <div><div style={{fontSize:22,fontWeight:700,color:"#16a34a"}}>+{pts}</div><div style={{fontSize:11,color:"#6b7280"}}>Points</div></div>
              <div><div style={{fontSize:22,fontWeight:700,color:"#f97316"}}>~{meals}</div><div style={{fontSize:11,color:"#6b7280"}}>Meals</div></div>
              <div><div style={{fontSize:22,fontWeight:700,color:"#0ea5e9"}}>{lives>0?lives:"<1"}</div><div style={{fontSize:11,color:"#6b7280"}}>Lives</div></div>
            </div>
          </div>
          <button style={{...S.btn(),width:"100%",padding:14,fontSize:16}} onClick={()=>setStep(2)}>Continue to Payment →</button>
        </>}
        {step===2 && <>
          <div style={{fontSize:20,fontWeight:700,marginBottom:20}}>Choose Payment Method</div>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {["upi","card","netbanking"].map(m=>(
              <button key={m} onClick={()=>setMethod(m)} style={{...S.btn(method===m?"#16a34a":"#f3f4f6"),color:method===m?"#fff":"#374151",flex:1,textTransform:"capitalize"}}>{m==="upi"?"UPI":m==="card"?"Card":"NetBanking"}</button>
            ))}
          </div>
          {method==="upi" && <div style={{marginBottom:16}}>
            <label style={{fontWeight:600,fontSize:13,display:"block",marginBottom:6}}>UPI ID</label>
            <input style={S.input} placeholder="yourname@upi" value={upiId} onChange={e=>setUpiId(e.target.value)}/>
            <div style={{display:"flex",gap:8,marginTop:8}}>
              {["GPay","PhonePe","Paytm"].map(app=>(
                <button key={app} style={{...S.btn("#fff"),color:"#374151",border:"1.5px solid #d1d5db",flex:1,fontSize:12}}>{app}</button>
              ))}
            </div>
          </div>}
          {method==="card" && <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
            <input style={S.input} placeholder="Card Number"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <input style={S.input} placeholder="MM/YY"/>
              <input style={S.input} placeholder="CVV"/>
            </div>
            <input style={S.input} placeholder="Cardholder Name"/>
          </div>}
          {method==="netbanking" && <select style={{...S.input,marginBottom:16}}>
            <option>Select Bank</option><option>SBI</option><option>HDFC</option><option>ICICI</option><option>Axis</option>
          </select>}
          <div style={{background:"#f9fafb",borderRadius:10,padding:12,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"#6b7280"}}>Donation</span><span style={{fontWeight:600}}>{fmt(amount)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"#6b7280"}}>Platform fee (0%)</span><span style={{color:"#16a34a",fontWeight:600}}>FREE</span></div>
            <div style={{borderTop:"1px dashed #e5e7eb",paddingTop:8,display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:700}}>Total</span><span style={{fontWeight:700,fontSize:16,color:"#16a34a"}}>{fmt(amount)}</span></div>
          </div>
          <div style={{marginBottom:12,fontSize:12,color:"#6b7280",textAlign:"center"}}>🔒 Powered by Razorpay · 256-bit SSL Secured</div>
          <button style={{...S.btn(),width:"100%",padding:14,fontSize:16,opacity:processing?0.7:1}} onClick={pay} disabled={processing}>
            {processing ? "⏳ Processing Payment..." : `Pay ${fmt(amount)} Securely`}
          </button>
        </>}
        {step===3 && <div style={{textAlign:"center",padding:"20px 0"}}>
          <div style={{fontSize:64,marginBottom:16,animation:"bounce 0.5s"}}>🎉</div>
          <div style={{fontSize:24,fontWeight:800,color:"#16a34a",marginBottom:8}}>Donation Successful!</div>
          <div style={{color:"#6b7280",marginBottom:20}}>You donated <strong>{fmt(amount)}</strong> to {campaign.title}</div>
          <div style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",borderRadius:14,padding:20,marginBottom:20}}>
            <div style={{fontWeight:700,marginBottom:12}}>🌟 You earned rewards!</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              <div style={{textAlign:"center"}}><div style={{fontSize:24,fontWeight:700,color:"#16a34a"}}>+{pts}</div><div style={{fontSize:12}}>Points</div></div>
              <div style={{textAlign:"center"}}><div style={{fontSize:24,fontWeight:700,color:"#f97316"}}>~{meals}</div><div style={{fontSize:12}}>Meals</div></div>
              <div style={{textAlign:"center"}}><div style={{fontSize:24,fontWeight:700,color:"#7c3aed"}}>📧</div><div style={{fontSize:12}}>Receipt Sent</div></div>
            </div>
          </div>
          <button style={{...S.btn(),width:"100%",padding:12}} onClick={()=>{onSuccess(amount,pts);onClose();}}>Done ✓</button>
        </div>}
      </div>
    </div>
  );
}

// ─── DONOR DASHBOARD ────────────────────────────────────────────────────────
function DonorDashboard({user, onLogout}) {
  const [tab, setTab] = useState("campaigns");
  const [donating, setDonating] = useState(null);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [totalPts, setTotalPts] = useState(1250);
  const [totalDon, setTotalDon] = useState(9500);
  const [notify, setNotify] = useState(null);
  const livesCount = useCounter(11);
  const mealsCount = useCounter(104);
  const categories = ["All","Water","Food","Education","Disaster","Women","Animals"];
  const filtered = CAMPAIGNS.filter(c=>(cat==="All"||c.category===cat)&&(c.title+c.ngo+c.location).toLowerCase().includes(search.toLowerCase()));
  const aiRecs = [CAMPAIGNS[0].id, CAMPAIGNS[2].id];

  const handleSuccess = (amt, pts) => {
    setTotalPts(p=>p+pts); setTotalDon(d=>d+amt);
    setNotify(`+${pts} points earned! 🎉`);
    setTimeout(()=>setNotify(null),4000);
  };

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#f0fdf4"}}>
      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={{padding:"0 22px 24px",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{fontSize:22,fontWeight:800,fontFamily:"'Sora',sans-serif"}}>Give<span style={{color:"#86efac"}}>Forward</span></div>
          <div style={{fontSize:11,color:"#86efac",marginTop:2}}>Donor Portal</div>
        </div>
        <div style={{marginTop:20}}>
          {[["campaigns","🌍","Campaigns"],["impact","📊","My Impact"],["rewards","🏆","Rewards"],["leaderboard","👑","Leaderboard"]].map(([id,ic,label])=>(
            <div key={id} style={S.sideItem(tab===id)} onClick={()=>setTab(id)}>
              <span style={{fontSize:18}}>{ic}</span><span>{label}</span>
            </div>
          ))}
        </div>
        <div style={{position:"absolute",bottom:20,left:0,right:0,padding:"0 22px"}}>
          <div style={{background:"rgba(255,255,255,0.1)",borderRadius:12,padding:12,marginBottom:12}}>
            <div style={{fontSize:12,color:"#86efac"}}>Your Points</div>
            <div style={{fontSize:22,fontWeight:700}}>{totalPts.toLocaleString()}</div>
            <div style={{fontSize:11,color:"#a3e635"}}>⭐ Supporter Level</div>
          </div>
          <button onClick={onLogout} style={{...S.btn("rgba(255,255,255,0.15)"),width:"100%",color:"#fff",border:"1px solid rgba(255,255,255,0.2)"}}>← Logout</button>
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,overflowY:"auto"}}>
        {/* Header */}
        <div style={{background:"#fff",padding:"16px 28px",borderBottom:"1px solid #dcfce7",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18}}>
            {tab==="campaigns"&&"Browse Campaigns"}{tab==="impact"&&"My Impact"}{tab==="rewards"&&"Rewards & Achievements"}{tab==="leaderboard"&&"Donor Leaderboard"}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{background:"#f0fdf4",borderRadius:20,padding:"6px 14px",fontSize:13,fontWeight:600,color:"#16a34a"}}>🌟 {totalPts.toLocaleString()} pts</div>
            <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#16a34a,#0d9488)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:13}}>PS</div>
          </div>
        </div>

        <div style={{padding:24}}>
          {notify && <div style={{background:"#16a34a",color:"#fff",borderRadius:12,padding:"12px 20px",marginBottom:16,fontWeight:600,display:"flex",alignItems:"center",gap:8}}>{notify}</div>}

          {/* CAMPAIGNS */}
          {tab==="campaigns" && <>
            {/* AI Banner */}
            <div style={{background:"linear-gradient(135deg,#1e1b4b,#312e81)",color:"#fff",borderRadius:16,padding:20,marginBottom:20}}>
              <div style={{fontSize:12,color:"#a5b4fc",marginBottom:4,fontWeight:600}}>🤖 AI RECOMMENDATION ENGINE</div>
              <div style={{fontSize:18,fontWeight:700,marginBottom:8}}>Personalized picks based on your giving history</div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                {CAMPAIGNS.filter(c=>aiRecs.includes(c.id)).map(c=>(
                  <div key={c.id} style={{background:"rgba(255,255,255,0.15)",borderRadius:10,padding:"8px 14px",display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setDonating(c)}>
                    <span style={{fontSize:20}}>{c.img}</span>
                    <div><div style={{fontSize:13,fontWeight:600}}>{c.title}</div><div style={{fontSize:11,color:"#c7d2fe"}}>{fmt(c.goal-c.raised)} still needed</div></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search & Filter */}
            <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
              <input style={{...S.input,flex:1,minWidth:200}} placeholder="🔍  Search campaigns, NGOs, locations..." value={search} onChange={e=>setSearch(e.target.value)}/>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {categories.map(c=><button key={c} style={S.tab(cat===c)} onClick={()=>setCat(c)}>{c}</button>)}
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:16}}>
              {filtered.map(c=><CampaignCard key={c.id} c={c} onDonate={setDonating} aiPick={aiRecs.includes(c.id)}/>)}
            </div>
          </>}

          {/* IMPACT */}
          {tab==="impact" && <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
              <StatCard icon="💰" label="Total Donated" value={fmt(totalDon)} color="#16a34a"/>
              <StatCard icon="❤️" label="Lives Impacted" value={livesCount+"+"} color="#f43f5e"/>
              <StatCard icon="🍽️" label="Meals Provided" value={mealsCount+"+"} color="#f97316"/>
              <StatCard icon="🌱" label="Campaigns Supported" value="5" color="#0ea5e9"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:24}}>
              <div style={S.card}>
                <div style={{fontWeight:700,marginBottom:16,fontSize:15}}>📈 Donation History</div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={IMPACT_HISTORY}>
                    <defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/><stop offset="95%" stopColor="#16a34a" stopOpacity={0}/></linearGradient></defs>
                    <XAxis dataKey="month" fontSize={12}/><YAxis fontSize={12}/>
                    <Tooltip formatter={v=>[`₹${v}`,"Amount"]}/>
                    <Area dataKey="amount" stroke="#16a34a" fill="url(#dg)" strokeWidth={2}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={S.card}>
                <div style={{fontWeight:700,marginBottom:16,fontSize:15}}>🎯 By Category</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart><Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value">
                    {CATEGORY_DATA.map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Pie><Tooltip/></PieChart>
                </ResponsiveContainer>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
                  {CATEGORY_DATA.map(d=><span key={d.name} style={{fontSize:11,display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,background:d.color,borderRadius:"50%",display:"inline-block"}}></span>{d.name}</span>)}
                </div>
              </div>
            </div>
            <div style={S.card}>
              <div style={{fontWeight:700,marginBottom:16,fontSize:15}}>🌍 Your Impact Score</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
                {[["🍽️","Meals Provided","~104 meals","Equivalent to feeding 3 families/month","#f97316"],["📚","Education Support","5 children","Access to learning materials for 1 month","#7c3aed"],["💧","Clean Water","~2,080L","Drinking water secured for 10 people","#0ea5e9"]].map(([ic,t,v,d,c])=>(
                  <div key={t} style={{background:"#f9fafb",borderRadius:12,padding:16}}>
                    <div style={{fontSize:28}}>{ic}</div>
                    <div style={{fontWeight:700,marginTop:8,fontSize:14}}>{t}</div>
                    <div style={{fontSize:22,fontWeight:800,color:c,margin:"4px 0"}}>{v}</div>
                    <div style={{fontSize:12,color:"#6b7280"}}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
          </>}

          {/* REWARDS */}
          {tab==="rewards" && <>
            <div style={{...S.card,background:"linear-gradient(135deg,#14532d,#166534)",color:"#fff",marginBottom:20,padding:28}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:13,color:"#86efac",marginBottom:4}}>YOUR REWARD STATUS</div>
                  <div style={{fontSize:32,fontWeight:800,fontFamily:"'Sora',sans-serif"}}>{totalPts.toLocaleString()} Points</div>
                  <div style={{color:"#86efac",marginTop:4}}>⭐ Supporter · {5000-totalPts} pts to Hero level</div>
                </div>
                <div style={{fontSize:64}}>🌟</div>
              </div>
              <div style={{marginTop:16}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#86efac",marginBottom:6}}>
                  <span>Supporter</span><span>Hero (5,000 pts)</span>
                </div>
                <div style={{height:10,background:"rgba(255,255,255,0.2)",borderRadius:10}}>
                  <div style={{width:`${Math.min((totalPts/5000)*100,100)}%`,height:"100%",background:"#86efac",borderRadius:10,transition:"width 1s"}}/>
                </div>
              </div>
            </div>
            <div style={{fontWeight:700,fontSize:16,marginBottom:12}}>🏅 Achievements</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:24}}>
              {ACHIEVEMENTS.map(a=>(
                <div key={a.id} style={{...S.card,opacity:a.unlocked?1:0.5,borderLeft:a.unlocked?`4px solid #16a34a`:`4px solid #d1d5db`}}>
                  <div style={{fontSize:32,marginBottom:8}}>{a.icon}</div>
                  <div style={{fontWeight:700,fontSize:14}}>{a.title}</div>
                  <div style={{fontSize:12,color:"#6b7280",marginTop:4}}>{a.desc}</div>
                  {a.unlocked ? <div style={{marginTop:8,...S.badge("#16a34a")}}>✓ Unlocked</div> : <div style={{marginTop:8,...S.badge("#9ca3af")}}>Locked</div>}
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>🎁 Redeem Rewards</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                {[["Tax Certificate","500 pts","📄"],["NGO Thank-you Kit","1000 pts","💝"],["Featured Donor Badge","2000 pts","🏅"]].map(([r,p,ic])=>(
                  <div key={r} style={{background:"#f9fafb",borderRadius:12,padding:14,textAlign:"center"}}>
                    <div style={{fontSize:32,marginBottom:8}}>{ic}</div>
                    <div style={{fontWeight:600,fontSize:13,marginBottom:4}}>{r}</div>
                    <div style={{color:"#16a34a",fontWeight:700,marginBottom:8}}>{p}</div>
                    <button style={{...S.btn(),padding:"6px 14px",fontSize:12}}>Redeem</button>
                  </div>
                ))}
              </div>
            </div>
          </>}

          {/* LEADERBOARD */}
          {tab==="leaderboard" && <>
            <div style={{...S.card,marginBottom:20,background:"linear-gradient(135deg,#fefce8,#fef3c7)"}}>
              <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>👑 Top Donors This Month</div>
              {DONORS.map((d,i)=>(
                <div key={d.id} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderBottom:i<DONORS.length-1?"1px solid #fde68a":""}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:i===0?"linear-gradient(135deg,#f59e0b,#d97706)":i===1?"linear-gradient(135deg,#9ca3af,#6b7280)":i===2?"linear-gradient(135deg,#b45309,#92400e)":"linear-gradient(135deg,#16a34a,#14532d)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:14}}>#{d.rank}</div>
                  <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#16a34a,#0d9488)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:13}}>{d.avatar}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14}}>{d.name} {d.id==="d4"&&"(You)"}</div>
                    <div style={{fontSize:12,color:"#6b7280"}}>{d.badge} · {d.donations} donations</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:700,color:"#d97706"}}>{d.points.toLocaleString()} pts</div>
                    <div style={{fontSize:11,color:"#6b7280"}}>{d.impact.lives} lives · {d.impact.meals} meals</div>
                  </div>
                </div>
              ))}
            </div>
          </>}
        </div>
      </div>
      {donating && <DonationModal campaign={donating} onClose={()=>setDonating(null)} onSuccess={handleSuccess}/>}
    </div>
  );
}

// ─── NGO DASHBOARD ──────────────────────────────────────────────────────────
function NgoDashboard({onLogout}) {
  const [tab, setTab] = useState("campaigns");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({title:"",category:"Water",goal:"",location:"",desc:""});
  const [myC] = useState(CAMPAIGNS.filter(c=>c.ngoId==="ngo1"||c.ngoId==="ngo3"));
  const [submitted, setSubmitted] = useState(false);

  const submit = () => { setSubmitted(true); setTimeout(()=>{setSubmitted(false);setShowCreate(false);setForm({title:"",category:"Water",goal:"",location:"",desc:""});},2000); };

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#f0fdf4"}}>
      <div style={S.sidebar}>
        <div style={{padding:"0 22px 24px",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{fontSize:22,fontWeight:800,fontFamily:"'Sora',sans-serif"}}>Give<span style={{color:"#86efac"}}>Forward</span></div>
          <div style={{fontSize:11,color:"#86efac",marginTop:2}}>NGO Portal</div>
        </div>
        <div style={{marginTop:20}}>
          {[["campaigns","📋","My Campaigns"],["create","➕","Create Campaign"],["proof","📸","Upload Proof"],["analytics","📊","Analytics"]].map(([id,ic,label])=>(
            <div key={id} style={S.sideItem(tab===id)} onClick={()=>setTab(id)}>
              <span style={{fontSize:18}}>{ic}</span><span>{label}</span>
            </div>
          ))}
        </div>
        <div style={{position:"absolute",bottom:20,left:22,right:22}}>
          <button onClick={onLogout} style={{...S.btn("rgba(255,255,255,0.15)"),width:"100%",color:"#fff",border:"1px solid rgba(255,255,255,0.2)"}}>← Logout</button>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto"}}>
        <div style={{background:"#fff",padding:"16px 28px",borderBottom:"1px solid #dcfce7",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18}}>
            {tab==="campaigns"&&"My Campaigns"}{tab==="create"&&"Create Campaign"}{tab==="proof"&&"Upload Proof"}{tab==="analytics"&&"Analytics"}
          </div>
          <span style={S.badge("#16a34a")}>✓ Verified NGO</span>
        </div>

        <div style={{padding:24}}>
          {tab==="campaigns" && <div style={{display:"grid",gap:12}}>
            {myC.map(c=>(
              <div key={c.id} style={{...S.card,display:"flex",gap:16,alignItems:"center"}}>
                <div style={{fontSize:40}}>{c.img}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15}}>{c.title}</div>
                  <div style={{fontSize:12,color:"#6b7280",marginBottom:8}}>{c.location}</div>
                  <ProgressBar pct={pct(c.raised,c.goal)}/>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:13}}>
                    <span style={{color:"#16a34a",fontWeight:600}}>{fmt(c.raised)}</span>
                    <span style={{color:"#6b7280"}}>{pct(c.raised,c.goal)}% · {c.donors} donors · {c.days}d left</span>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <span style={S.badge(urgencyColor(c.urgency))}>{urgencyLabel(c.urgency)}</span>
                  <button style={{...S.btnOutline,fontSize:12,padding:"6px 12px"}}>Manage</button>
                </div>
              </div>
            ))}
          </div>}

          {tab==="create" && <div style={{...S.card,maxWidth:560}}>
            <div style={{fontWeight:700,fontSize:16,marginBottom:20}}>📋 New Campaign</div>
            {submitted && <div style={{background:"#16a34a",color:"#fff",borderRadius:10,padding:12,marginBottom:16,fontWeight:600}}>✅ Campaign submitted for review!</div>}
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><label style={{fontWeight:600,fontSize:13,display:"block",marginBottom:6}}>Campaign Title</label><input style={S.input} placeholder="e.g. Clean Water for 500 Families" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label style={{fontWeight:600,fontSize:13,display:"block",marginBottom:6}}>Category</label>
                  <select style={S.input} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                    {["Water","Food","Education","Disaster","Women","Health","Animals"].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={{fontWeight:600,fontSize:13,display:"block",marginBottom:6}}>Funding Goal (₹)</label><input style={S.input} type="number" placeholder="100000" value={form.goal} onChange={e=>setForm({...form,goal:e.target.value})}/></div>
              </div>
              <div><label style={{fontWeight:600,fontSize:13,display:"block",marginBottom:6}}>📍 Location</label><input style={S.input} placeholder="District, State" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></div>
              <div><label style={{fontWeight:600,fontSize:13,display:"block",marginBottom:6}}>Description</label><textarea style={{...S.input,resize:"vertical",minHeight:100}} placeholder="Describe the cause and how funds will be used..." value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})}/></div>
              <div>
                <label style={{fontWeight:600,fontSize:13,display:"block",marginBottom:6}}>📎 Supporting Documents</label>
                <div style={{border:"2px dashed #d1fae5",borderRadius:12,padding:24,textAlign:"center",cursor:"pointer",background:"#f0fdf4"}}>
                  <div style={{fontSize:32,marginBottom:8}}>📁</div>
                  <div style={{fontSize:13,color:"#6b7280"}}>Click to upload or drag & drop<br/><span style={{fontSize:11}}>PDF, JPG, PNG up to 10MB</span></div>
                </div>
              </div>
              <button style={{...S.btn(),padding:14,fontSize:15}} onClick={submit}>Submit Campaign for Review</button>
            </div>
          </div>}

          {tab==="proof" && <div style={{display:"grid",gap:16}}>
            {myC.map(c=>(
              <div key={c.id} style={S.card}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{fontWeight:700}}>{c.img} {c.title}</div>
                  <span style={S.badge(c.proof.length>0?"#16a34a":"#f97316")}>{c.proof.length} uploads</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
                  {c.proof.map((p,i)=><div key={i} style={{background:"#f3f4f6",borderRadius:8,padding:20,textAlign:"center",fontSize:11,color:"#6b7280"}}>📸 Proof {i+1}</div>)}
                  <div style={{border:"2px dashed #d1fae5",borderRadius:8,padding:20,textAlign:"center",fontSize:11,color:"#16a34a",cursor:"pointer"}}>+ Upload</div>
                </div>
                <div style={{background:"#fefce8",borderRadius:8,padding:10,fontSize:12,color:"#92400e"}}>⚠️ Upload geo-tagged photos/videos to increase donor trust and impact verification score.</div>
              </div>
            ))}
          </div>}

          {tab==="analytics" && <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
              <StatCard icon="💰" label="Total Raised" value="₹1.4L" color="#16a34a"/>
              <StatCard icon="👥" label="Total Donors" value="544" color="#7c3aed"/>
              <StatCard icon="📋" label="Active Campaigns" value="2" color="#f97316"/>
              <StatCard icon="⭐" label="Trust Score" value="94/100" color="#0ea5e9"/>
            </div>
            <div style={S.card}>
              <div style={{fontWeight:700,marginBottom:16}}>Monthly Donations Received</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={IMPACT_HISTORY}>
                  <XAxis dataKey="month" fontSize={12}/><YAxis fontSize={12}/>
                  <Tooltip formatter={v=>[`₹${v}`,"Amount"]}/>
                  <Bar dataKey="amount" fill="#16a34a" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ────────────────────────────────────────────────────────
function AdminDashboard({onLogout}) {
  const [tab, setTab] = useState("overview");
  const [ngoStatus, setNgoStatus] = useState({ngo4:"pending",ngo7:"pending"});

  const verify = (id,action) => setNgoStatus(s=>({...s,[id]:action}));

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#f0fdf4"}}>
      <div style={S.sidebar}>
        <div style={{padding:"0 22px 24px",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{fontSize:22,fontWeight:800,fontFamily:"'Sora',sans-serif"}}>Give<span style={{color:"#86efac"}}>Forward</span></div>
          <div style={{fontSize:11,color:"#f87171",marginTop:2}}>Admin Control Panel</div>
        </div>
        <div style={{marginTop:20}}>
          {[["overview","📊","Overview"],["ngos","🏢","Verify NGOs"],["campaigns","📋","Monitor Campaigns"],["fraud","🛡️","Fraud Alerts"],["map","🗺️","Needs Map"]].map(([id,ic,label])=>(
            <div key={id} style={S.sideItem(tab===id)} onClick={()=>setTab(id)}>
              <span style={{fontSize:18}}>{ic}</span><span>{label}</span>
              {id==="fraud"&&<span style={{background:"#f43f5e",color:"#fff",borderRadius:20,padding:"1px 7px",fontSize:11,marginLeft:"auto"}}>2</span>}
              {id==="ngos"&&<span style={{background:"#f97316",color:"#fff",borderRadius:20,padding:"1px 7px",fontSize:11,marginLeft:"auto"}}>2</span>}
            </div>
          ))}
        </div>
        <div style={{position:"absolute",bottom:20,left:22,right:22}}>
          <button onClick={onLogout} style={{...S.btn("rgba(255,255,255,0.15)"),width:"100%",color:"#fff",border:"1px solid rgba(255,255,255,0.2)"}}>← Logout</button>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto"}}>
        <div style={{background:"#fff",padding:"16px 28px",borderBottom:"1px solid #dcfce7",position:"sticky",top:0,zIndex:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18}}>
            {tab==="overview"&&"Platform Overview"}{tab==="ngos"&&"NGO Verification Queue"}{tab==="campaigns"&&"Campaign Monitor"}{tab==="fraud"&&"Fraud Detection"}{tab==="map"&&"Nearby Needs Map"}
          </div>
          <span style={S.badge("#7c3aed")}>🔐 Admin</span>
        </div>

        <div style={{padding:24}}>
          {/* OVERVIEW */}
          {tab==="overview" && <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
              <StatCard icon="💰" label="Total Raised" value="₹3.3L" sub="This month" color="#16a34a"/>
              <StatCard icon="🏢" label="Active NGOs" value="24" sub="2 pending" color="#7c3aed"/>
              <StatCard icon="📋" label="Live Campaigns" value="6" sub="1 suspended" color="#f97316"/>
              <StatCard icon="🛡️" label="Fraud Alerts" value="2" sub="Action needed" color="#f43f5e"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:24}}>
              <div style={S.card}>
                <div style={{fontWeight:700,marginBottom:16}}>Platform Growth</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={IMPACT_HISTORY}>
                    <XAxis dataKey="month" fontSize={12}/><YAxis fontSize={12}/>
                    <Tooltip/><Line type="monotone" dataKey="amount" stroke="#16a34a" strokeWidth={2} dot={{fill:"#16a34a"}}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={S.card}>
                <div style={{fontWeight:700,marginBottom:12}}>Fund Distribution</div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart><Pie data={CATEGORY_DATA} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {CATEGORY_DATA.map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Pie></PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{...S.card,background:"linear-gradient(135deg,#f0fdf4,#dcfce7)"}}>
              <div style={{fontWeight:700,marginBottom:12}}>🌍 Lives Impact Counter</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
                {[["❤️","1,204","Lives Helped"],["🍽️","11,832","Meals Provided"],["📚","428","Children Educated"]].map(([ic,v,l])=>(
                  <div key={l} style={{textAlign:"center"}}><div style={{fontSize:36}}>{ic}</div><div style={{fontSize:32,fontWeight:800,color:"#16a34a"}}>{v}</div><div style={{color:"#6b7280"}}>{l}</div></div>
                ))}
              </div>
            </div>
          </>}

          {/* NGO VERIFICATION */}
          {tab==="ngos" && <div style={{display:"grid",gap:16}}>
            {NGO_QUEUE.map(ngo=>(
              <div key={ngo.id} style={S.card}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:16}}>{ngo.name}</div>
                    <div style={{fontSize:13,color:"#6b7280"}}>{ngo.location} · Reg: {ngo.reg}</div>
                    <div style={{fontSize:12,color:"#9ca3af"}}>Submitted: {ngo.submitted}</div>
                  </div>
                  <span style={S.badge(ngoStatus[ngo.id]==="approved"?"#16a34a":ngoStatus[ngo.id]==="rejected"?"#f43f5e":"#f97316")}>
                    {ngoStatus[ngo.id]==="approved"?"✓ Approved":ngoStatus[ngo.id]==="rejected"?"✗ Rejected":"⏳ Pending"}
                  </span>
                </div>
                <div style={{display:"flex",gap:8,marginBottom:16}}>
                  {ngo.docs.map((d,i)=><div key={i} style={{background:"#f3f4f6",borderRadius:8,padding:"8px 14px",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>📄 {d}</div>)}
                </div>
                {ngoStatus[ngo.id]==="pending" && <div style={{display:"flex",gap:10}}>
                  <button style={{...S.btn("#16a34a"),flex:1}} onClick={()=>verify(ngo.id,"approved")}>✓ Approve NGO</button>
                  <button style={{...S.btn("#f43f5e"),flex:1}} onClick={()=>verify(ngo.id,"rejected")}>✗ Reject</button>
                  <button style={{...S.btnOutline,flex:1}}>Request More Docs</button>
                </div>}
              </div>
            ))}
          </div>}

          {/* CAMPAIGN MONITOR */}
          {tab==="campaigns" && <div style={{display:"grid",gap:12}}>
            {CAMPAIGNS.map(c=>(
              <div key={c.id} style={{...S.card,borderLeft:`4px solid ${c.fraudScore>30?"#f43f5e":c.verified?"#16a34a":"#f97316"}`}}>
                <div style={{display:"flex",gap:14,alignItems:"center"}}>
                  <div style={{fontSize:32}}>{c.img}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700}}>{c.title} <span style={{fontSize:12,color:"#6b7280"}}>by {c.ngo}</span></div>
                    <div style={{fontSize:12,color:"#6b7280",marginBottom:6}}>{c.location} · {c.donors} donors · {c.days}d left</div>
                    <ProgressBar pct={pct(c.raised,c.goal)} color={c.fraudScore>30?"#f43f5e":"#16a34a"}/>
                    <div style={{fontSize:12,marginTop:4}}>{fmt(c.raised)} / {fmt(c.goal)}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                    <span style={S.badge(c.verified?"#16a34a":"#9ca3af")}>{c.verified?"✓ Verified":"Unverified"}</span>
                    <span style={S.badge(c.fraudScore>30?"#f43f5e":c.fraudScore>15?"#f97316":"#16a34a")}>🛡️ Risk: {c.fraudScore>30?"HIGH":c.fraudScore>15?"MED":"LOW"}</span>
                    {c.fraudScore>30 && <button style={{...S.btn("#f43f5e"),padding:"4px 10px",fontSize:11}}>Suspend</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>}

          {/* FRAUD DETECTION */}
          {tab==="fraud" && <>
            <div style={{...S.card,background:"linear-gradient(135deg,#fff5f5,#fee2e2)",marginBottom:20,border:"1px solid #fecaca"}}>
              <div style={{fontWeight:700,color:"#991b1b",marginBottom:4,fontSize:15}}>🤖 AI Fraud Detection Engine</div>
              <div style={{fontSize:13,color:"#7f1d1d"}}>Analyzing donation patterns, NGO behavior, and proof submissions in real-time using anomaly detection algorithms.</div>
            </div>
            {FRAUD_ALERTS.map((a,i)=>(
              <div key={i} style={{...S.card,marginBottom:12,borderLeft:`4px solid ${a.severity==="high"?"#f43f5e":"#f97316"}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{fontWeight:700,fontSize:15}}>{a.campaign}</div>
                  <span style={S.badge(a.severity==="high"?"#f43f5e":"#f97316")}>Risk Score: {CAMPAIGNS.find(c=>c.title===a.campaign)?.fraudScore}/100</span>
                </div>
                <div style={{fontSize:13,color:"#6b7280",marginBottom:12}}>⚠️ {a.reason}</div>
                <div style={{display:"flex",gap:8}}>
                  <button style={{...S.btn("#f43f5e"),flex:1}}>Suspend Campaign</button>
                  <button style={{...S.btnOutline,flex:1}}>Request Investigation</button>
                  <button style={{...S.btn("#6b7280"),flex:1}}>Dismiss Alert</button>
                </div>
              </div>
            ))}
          </>}

          {/* MAP */}
          {tab==="map" && <div style={S.card}>
            <div style={{fontWeight:700,marginBottom:16,fontSize:15}}>🗺️ Geo-tagged Needs Map — India</div>
            <div style={{background:"linear-gradient(135deg,#e0f2fe,#dbeafe)",borderRadius:16,padding:20,position:"relative",overflow:"hidden",minHeight:380}}>
              <svg viewBox="0 0 400 420" style={{width:"100%",maxHeight:360,display:"block"}}>
                {/* Simplified India outline */}
                <path d="M160,30 L200,20 L250,35 L280,60 L300,100 L310,140 L305,180 L290,220 L270,260 L250,290 L230,310 L210,340 L200,370 L195,380 L190,370 L175,340 L155,310 L130,280 L110,250 L95,210 L90,170 L95,130 L110,90 L135,55 Z" fill="#bfdbfe" stroke="#60a5fa" strokeWidth={2}/>
                {/* Campaign pins */}
                <circle cx="140" cy="180" r="10" fill="#f43f5e" opacity={0.9}/>
                <text x="140" y="184" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">💧</text>
                <text x="140" y="200" textAnchor="middle" fill="#1e40af" fontSize="9">Rajasthan</text>

                <circle cx="200" cy="150" r="9" fill="#f97316" opacity={0.9}/>
                <text x="200" y="154" textAnchor="middle" fill="#fff" fontSize="9">📚</text>
                <text x="200" y="170" textAnchor="middle" fill="#1e40af" fontSize="9">Bihar</text>

                <circle cx="210" cy="230" r="12" fill="#16a34a" opacity={0.9}/>
                <text x="210" y="235" textAnchor="middle" fill="#fff" fontSize="11">🍱</text>
                <text x="210" y="252" textAnchor="middle" fill="#1e40af" fontSize="9">Odisha</text>

                <circle cx="250" cy="130" r="11" fill="#7c3aed" opacity={0.9}/>
                <text x="250" y="135" textAnchor="middle" fill="#fff" fontSize="10">🌊</text>
                <text x="250" y="152" textAnchor="middle" fill="#1e40af" fontSize="9">Assam</text>

                <circle cx="165" cy="160" r="8" fill="#0ea5e9" opacity={0.9}/>
                <text x="165" y="164" textAnchor="middle" fill="#fff" fontSize="8">👩</text>
              </svg>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:16}}>
              {[["💧 Water","Rajasthan","Critical"],["🍱 Food","Odisha","Critical"],["📚 Education","Bihar","High"]].map(([t,l,u])=>(
                <div key={t} style={{background:"#f0fdf4",borderRadius:10,padding:12}}>
                  <div style={{fontWeight:600,fontSize:13}}>{t}</div>
                  <div style={{fontSize:12,color:"#6b7280"}}>{l}</div>
                  <span style={S.badge(u==="Critical"?"#f43f5e":"#f97316")}>{u}</span>
                </div>
              ))}
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN ──────────────────────────────────────────────────────────────────
function Login({onLogin}) {
  const [selected, setSelected] = useState(null);
  const roles = [
    { id:"donor", label:"Donor", icon:"❤️", desc:"Browse campaigns, donate, track impact & earn rewards", color:"#16a34a", creds:"donor@demo.com" },
    { id:"ngo", label:"NGO", icon:"🏢", desc:"Create campaigns, upload proof & manage fundraising", color:"#7c3aed", creds:"ngo@demo.com" },
    { id:"admin", label:"Admin", icon:"🔐", desc:"Verify NGOs, monitor campaigns & detect fraud", color:"#f43f5e", creds:"admin@demo.com" },
  ];
  const [email, setEmail] = useState(""); const [pass, setPass] = useState("");

  const role = roles.find(r=>r.id===selected);

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#052e16,#14532d,#166534)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{width:"100%",maxWidth:520}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:48,marginBottom:8}}>🌱</div>
          <div style={{fontSize:36,fontWeight:800,color:"#fff",fontFamily:"'Sora',sans-serif"}}>Give<span style={{color:"#86efac"}}>Forward</span></div>
          <div style={{color:"#86efac",fontSize:15}}>AI-Powered Social Impact Platform</div>
        </div>

        <div style={{background:"#fff",borderRadius:24,padding:32,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
          <div style={{fontWeight:700,fontSize:17,marginBottom:4}}>Select your role</div>
          <div style={{color:"#6b7280",fontSize:13,marginBottom:20}}>Hackathon Demo — click a role to auto-fill credentials</div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:24}}>
            {roles.map(r=>(
              <div key={r.id} onClick={()=>{setSelected(r.id);setEmail(r.creds);setPass("demo123");}}
                style={{border:`2.5px solid ${selected===r.id?r.color:"#e5e7eb"}`,borderRadius:14,padding:"16px 10px",textAlign:"center",cursor:"pointer",background:selected===r.id?r.color+"11":"#fff",transition:"all 0.2s"}}>
                <div style={{fontSize:28,marginBottom:6}}>{r.icon}</div>
                <div style={{fontWeight:700,fontSize:14,color:selected===r.id?r.color:"#374151"}}>{r.label}</div>
                <div style={{fontSize:11,color:"#6b7280",marginTop:4,lineHeight:1.4}}>{r.desc}</div>
              </div>
            ))}
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
            <input style={S.input} placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
            <input style={S.input} type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)}/>
          </div>

          <button style={{...S.btn(role?.color||"#16a34a"),width:"100%",padding:14,fontSize:16,opacity:selected?1:0.5}}
            disabled={!selected} onClick={()=>onLogin(selected)}>
            {selected ? `Login as ${role.label} →` : "Select a role to continue"}
          </button>

          <div style={{marginTop:16,display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}}>
            {["🤖 AI Recommendations","🛡️ Fraud Detection","🏆 Gamification","🗺️ Geo-mapping","📊 Impact Analytics"].map(f=>(
              <span key={f} style={{background:"#f0fdf4",color:"#166534",borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:500}}>{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  if (!user) return <Login onLogin={r=>setUser(r)}/>;
  if (user==="donor") return <DonorDashboard user={user} onLogout={()=>setUser(null)}/>;
  if (user==="ngo") return <NgoDashboard onLogout={()=>setUser(null)}/>;
  return <AdminDashboard onLogout={()=>setUser(null)}/>;
}
