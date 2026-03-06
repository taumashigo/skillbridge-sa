"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ============================================================
// SKILLBRIDGE SA — Complete Application
// ============================================================

const T = {
  midnight: "#0B1121", deep: "#111827", surface: "#1A2332", surfaceLight: "#243044",
  border: "#2D3F56", borderLight: "#3A5068",
  accent: "#22D3A7", accentDim: "#1A9E7E", accentGlow: "rgba(34,211,167,0.15)", accentGlow2: "rgba(34,211,167,0.08)",
  warm: "#F59E0B", coral: "#FB7185", sky: "#38BDF8", violet: "#A78BFA",
  text: "#F1F5F9", textSec: "#94A3B8", textMut: "#64748B",
  success: "#22C55E", error: "#EF4444",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:wght@400;500&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html{font-size:16px;-webkit-font-smoothing:antialiased}
body{font-family:'DM Sans',sans-serif;background:${T.midnight};color:${T.text}}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideR{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes glow{0%,100%{box-shadow:0 0 20px rgba(34,211,167,.1)}50%{box-shadow:0 0 40px rgba(34,211,167,.2)}}
@keyframes speakPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
.aFU{animation:fadeUp .5s ease-out forwards}
.aFI{animation:fadeIn .4s ease-out forwards}
.aSR{animation:slideR .4s ease-out forwards}
.aSI{animation:scaleIn .3s ease-out forwards}
.aP{animation:pulse 2s ease-in-out infinite}
.aSpin{animation:spin 1s linear infinite}
.aGlow{animation:glow 3s ease-in-out infinite}
.skel{background:linear-gradient(90deg,${T.surface} 25%,${T.surfaceLight} 50%,${T.surface} 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px}
input,textarea,select{font-family:'DM Sans',sans-serif;background:${T.surface};border:1px solid ${T.border};color:${T.text};border-radius:10px;padding:10px 14px;font-size:14px;outline:none;transition:border-color .2s,box-shadow .2s;width:100%}
input:focus,textarea:focus,select:focus{border-color:${T.accent};box-shadow:0 0 0 3px ${T.accentGlow}}
input::placeholder,textarea::placeholder{color:${T.textMut}}
select{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394A3B8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px}
`;

// Icons
const I = {
  home:<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"/></svg>,
  brief:<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
  chart:<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 19V6l-6 6m12 7V9l6 6"/></svg>,
  book:<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>,
  mic:<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M19 10v1a7 7 0 01-14 0v-1m7 8v3m-4 0h8M12 2a3 3 0 00-3 3v5a3 3 0 006 0V5a3 3 0 00-3-3z"/></svg>,
  doc:<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  settings:<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>,
  upload:<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>,
  check:<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>,
  arrow:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>,
  arrowL:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>,
  play:<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>,
  pause:<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>,
  redirect:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>,
  bmark:<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>,
  shield:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
  target:<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  ext:<svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3"/></svg>,
  close:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>,
  menu:<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>,
  dl:<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>,
  interview:<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>,
  sparkle:<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
};

// --- Base Components ---
function Btn({children,variant="primary",size="md",icon,onClick,disabled,style:s={},...p}){
  const base={display:"inline-flex",alignItems:"center",gap:8,border:"none",borderRadius:10,cursor:disabled?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,letterSpacing:".01em",transition:"all .2s",opacity:disabled?.5:1,fontSize:size==="sm"?13:size==="lg"?16:14,padding:size==="sm"?"8px 14px":size==="lg"?"14px 28px":"10px 20px"};
  const v={primary:{background:T.accent,color:T.midnight},secondary:{background:T.surfaceLight,color:T.text,border:`1px solid ${T.border}`},ghost:{background:"transparent",color:T.textSec},danger:{background:"rgba(239,68,68,.15)",color:T.error},warm:{background:T.warm,color:T.midnight}};
  return <button style={{...base,...v[variant],...s}} onClick={onClick} disabled={disabled} onMouseEnter={e=>{if(!disabled)e.target.style.transform="translateY(-1px)"}} onMouseLeave={e=>{e.target.style.transform="translateY(0)"}} {...p}>{icon&&<span style={{display:"flex"}}>{icon}</span>}{children}</button>;
}
function Card({children,style:s={},hover,glow,onClick,className=""}){
  const[h,setH]=useState(false);
  return <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} className={className} style={{background:T.surface,border:`1px solid ${h&&hover?T.accent:T.border}`,borderRadius:14,padding:24,transition:"all .25s",transform:h&&hover?"translateY(-2px)":"none",boxShadow:glow&&h?`0 0 30px ${T.accentGlow}`:"0 2px 8px rgba(0,0,0,.15)",cursor:onClick?"pointer":"default",...s}}>{children}</div>;
}
function Badge({children,color=T.accent,style:s={}}){return <span style={{display:"inline-flex",alignItems:"center",fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,background:`${color}18`,color,letterSpacing:".03em",textTransform:"uppercase",...s}}>{children}</span>}
function PBar({value,max=100,color=T.accent,height=6,style:s={}}){const p=Math.min(100,(value/max)*100);return <div style={{width:"100%",height,background:T.surfaceLight,borderRadius:height,overflow:"hidden",...s}}><div style={{width:`${p}%`,height:"100%",background:color,borderRadius:height,transition:"width .8s cubic-bezier(.4,0,.2,1)"}}/></div>}
function TabBar({tabs,active,onChange}){return <div style={{display:"flex",gap:4,background:T.surface,borderRadius:12,padding:4,border:`1px solid ${T.border}`}}>{tabs.map(t=><button key={t.id} onClick={()=>onChange(t.id)} style={{flex:1,padding:"10px 16px",border:"none",borderRadius:10,cursor:"pointer",background:active===t.id?T.accent:"transparent",color:active===t.id?T.midnight:T.textSec,fontFamily:"'DM Sans'",fontSize:13,fontWeight:active===t.id?700:500,transition:"all .2s"}}>{t.label}</button>)}</div>}
function Modal({open,onClose,title,children,width=560}){if(!open)return null;return <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)"}} onClick={onClose}><div className="aSI" onClick={e=>e.stopPropagation()} style={{background:T.deep,border:`1px solid ${T.border}`,borderRadius:18,padding:28,maxWidth:width,width:"90%",maxHeight:"80vh",overflow:"auto"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h3 style={{fontSize:18,fontWeight:700}}>{title}</h3><button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:T.textMut,display:"flex"}}>{I.close}</button></div>{children}</div></div>}

// Radar Chart
function Radar({data,size=240}){
  const cx=size/2,cy=size/2,r=size*.38,n=data.length;
  const ang=data.map((_,i)=>(Math.PI*2*i)/n-Math.PI/2);
  const pts=data.map((d,i)=>({x:cx+r*(d.value/5)*Math.cos(ang[i]),y:cy+r*(d.value/5)*Math.sin(ang[i])}));
  return <svg width={size} height={size} style={{overflow:"visible"}}>
    {[.25,.5,.75,1].map((ring,i)=><polygon key={i} fill="none" stroke={T.border} strokeWidth=".5" points={ang.map(a=>`${cx+r*ring*Math.cos(a)},${cy+r*ring*Math.sin(a)}`).join(" ")}/>)}
    {ang.map((a,i)=><line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke={T.border} strokeWidth=".5"/>)}
    <polygon fill={T.accentGlow} stroke={T.accent} strokeWidth="2" points={pts.map(p=>`${p.x},${p.y}`).join(" ")}><animate attributeName="opacity" from="0" to="1" dur=".8s" fill="freeze"/></polygon>
    {data.map((d,i)=>{const lx=cx+(r+22)*Math.cos(ang[i]),ly=cy+(r+22)*Math.sin(ang[i]);return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill={T.textSec} fontSize="10" fontFamily="'DM Sans'" fontWeight="500">{d.label}</text>})}
  </svg>;
}

// ============================================================
// MOCK DATA
// ============================================================
const COMPS=[
  {name:"Python Programming",cat:"Technical",score:4,max:5,def:"Proficiency in Python for data processing, scripting, and application development.",why:"Core language for the role; used in 85% of day-to-day tasks.",synonyms:["Python 3","Scripting"],evidence:["GitHub repos","Code samples"]},
  {name:"SQL & Database Design",cat:"Technical",score:3,max:5,def:"Complex queries, schema design, and optimisation.",why:"Data retrieval and reporting is a daily function.",synonyms:["PostgreSQL","T-SQL"],evidence:["Query portfolio"]},
  {name:"Machine Learning",cat:"Technical",score:2,max:5,def:"ML algorithms, model training, evaluation, and deployment.",why:"Role involves building and maintaining ML pipelines.",synonyms:["ML","Deep Learning","Scikit-learn"],evidence:["Kaggle projects"]},
  {name:"Cloud Infrastructure",cat:"Technical",score:2,max:5,def:"Working knowledge of cloud platforms.",why:"All services run on AWS.",synonyms:["AWS","GCP","Azure"],evidence:["Certifications"]},
  {name:"Data Visualisation",cat:"Domain",score:3,max:5,def:"Clear, insightful visualisations for stakeholders.",why:"Presenting findings weekly.",synonyms:["Tableau","Power BI"],evidence:["Dashboard portfolio"]},
  {name:"Communication",cat:"Soft Skill",score:4,max:5,def:"Clear written and verbal communication.",why:"Cross-functional collaboration.",synonyms:["Presentation","Documentation"],evidence:["Writing samples"]},
  {name:"Problem Solving",cat:"Soft Skill",score:4,max:5,def:"Analytical thinking and structured approach.",why:"Debugging complex data pipeline issues.",synonyms:["Critical thinking"],evidence:["Case study responses"]},
  {name:"AWS Certified",cat:"Certification",score:1,max:5,def:"Cloud certification preferred.",why:"Signals cloud competency to hiring teams.",synonyms:["AWS SAA"],evidence:["Certificate"]},
];

const RESOURCES=[
  {id:"r1",title:"Python for Data Science Handbook",type:"doc",provider:"O'Reilly",diff:"Intermediate",hours:12,comp:"Python Programming",why:"Fills gap in data-oriented Python patterns",url:"#"},
  {id:"r2",title:"Complete SQL Bootcamp",type:"course",provider:"Udemy",diff:"Beginner",hours:20,comp:"SQL & Database Design",why:"Comprehensive coverage of query patterns needed for the role",url:"#"},
  {id:"r3",title:"Machine Learning Specialisation",type:"course",provider:"Coursera (Stanford)",diff:"Intermediate",hours:60,comp:"Machine Learning",why:"Top-rated ML course; covers algorithms in job description",url:"#"},
  {id:"r4",title:"AWS Solutions Architect — Associate Prep",type:"course",provider:"A Cloud Guru",diff:"Intermediate",hours:40,comp:"Cloud Infrastructure",why:"Direct preparation for preferred certification",url:"#"},
  {id:"r5",title:"Storytelling with Data",type:"doc",provider:"Wiley",diff:"Beginner",hours:6,comp:"Data Visualisation",why:"Practical framework for presenting insights",url:"#"},
  {id:"r6",title:"Scikit-learn Official Docs",type:"doc",provider:"scikit-learn.org",diff:"Intermediate",hours:8,comp:"Machine Learning",why:"Essential reference for ML implementation",url:"#"},
];

const INSTS=[
  {name:"University of Cape Town — Online Short Courses",url:"https://www.getsmarter.com/universities/uct",desc:"UCT offers accredited short courses through GetSmarter, covering data science, ML, and business analytics.",bestFor:"Accredited short courses with university recognition",offerings:["Data Science","Machine Learning","FinTech"],recog:"Internationally recognised; NQF-aligned",cat:"University"},
  {name:"AWS Training & Certification",url:"https://aws.amazon.com/training/",desc:"Amazon's official certification programme for cloud practitioners and architects.",bestFor:"Cloud certification directly from the vendor",offerings:["Cloud Practitioner","Solutions Architect","Data Analytics"],recog:"Industry gold standard for AWS roles",cat:"Vendor Cert"},
  {name:"Coursera (Stanford, Google)",url:"https://coursera.org",desc:"Global online learning with university-partnered specialisations. Quality varies — focus on top university specialisations.",bestFor:"Structured learning paths with certificates",offerings:["ML Specialisation","Google Data Analytics","Python for Everybody"],recog:"Widely recognised; financial aid available",cat:"Online Platform"},
  {name:"Explore Data Science Academy",url:"https://explore-datascience.net",desc:"South African data science academy with strong industry partnerships.",bestFor:"Intensive SA-based data science training",offerings:["Data Science bootcamp","Data Engineering","ML Engineering"],recog:"Well-regarded in SA tech; employer partnerships",cat:"Local Bootcamp"},
  {name:"CompTIA",url:"https://comptia.org",desc:"Vendor-neutral IT certification body for foundational infrastructure knowledge.",bestFor:"Vendor-neutral IT fundamentals",offerings:["Data+","Cloud+","Security+"],recog:"Globally recognised baseline certifications",cat:"Vendor Cert"},
  {name:"Microsoft Learn",url:"https://learn.microsoft.com",desc:"Free learning platform with hands-on labs for Azure, Power BI, and Microsoft technologies.",bestFor:"Free structured learning with sandbox environments",offerings:["Azure Fundamentals","Power BI Analyst","Azure Data Engineer"],recog:"Industry-standard Microsoft certifications",cat:"Vendor Cert"},
];

const QUESTIONS=[
  {id:"q1",comp:"Python",type:"mcq",q:"What is the output of `[x**2 for x in range(5)]`?",opts:["[0, 1, 4, 9, 16]","[1, 4, 9, 16, 25]","[0, 1, 2, 3, 4]","Error"],correct:0,explain:"List comprehension iterates 0–4; squaring gives [0, 1, 4, 9, 16]."},
  {id:"q2",comp:"Python",type:"mcq",q:"Which library is primarily used for numerical computing with arrays?",opts:["Pandas","NumPy","Matplotlib","Requests"],correct:1,explain:"NumPy is foundational for numerical computing."},
  {id:"q3",comp:"SQL",type:"mcq",q:"What does a LEFT JOIN return?",opts:["Only matching rows","All from left + matching from right","All from both tables","Only non-matching"],correct:1,explain:"LEFT JOIN preserves all left table rows."},
  {id:"q4",comp:"ML",type:"mcq",q:"Best metric for imbalanced binary classification?",opts:["Accuracy","F1 Score","MSE","R² Score"],correct:1,explain:"F1 balances precision and recall for skewed distributions."},
  {id:"q5",comp:"Cloud",type:"mcq",q:"Which AWS service is serverless compute?",opts:["EC2","Lambda","RDS","S3"],correct:1,explain:"Lambda runs code without server provisioning."},
  {id:"q6",comp:"Visualisation",type:"scenario",q:"A non-technical stakeholder wants quarterly revenue trends. Describe your visualisation approach.",sample:"Simple line chart, clear labels, annotations at inflection points, narrative summary."},
];

const PODCAST_TURNS=[
  {speaker:"Moderator",name:"Thandiwe",content:"Welcome to SkillBridge Insights! Today we break down what it takes to land a Data Analyst role in SA's tech sector. What do hiring teams actually look for?",ch:"Introduction"},
  {speaker:"Hiring Manager",name:"Sipho",content:"When I review CVs, I look for evidence of problem-solving first — not just a tool list. Can you take messy data and extract insight? That said, Python and SQL are table stakes now.",ch:"What Hiring Teams Want"},
  {speaker:"Domain Expert",name:"Dr Aisha",content:"The landscape has shifted. Five years ago, Excel was enough. Now you need Python, SQL, and a visualisation tool minimum. But statistical foundations matter — many candidates run models without understanding why.",ch:"What Hiring Teams Want"},
  {speaker:"User Avatar",name:"You",content:"I've learnt Python for six months and I'm comfortable with Pandas. Where should I focus next for this role?",ch:"Skill Prioritisation"},
  {speaker:"Domain Expert",name:"Dr Aisha",content:"Given your foundation, prioritise SQL depth — window functions, CTEs, query optimisation. The job description mentions 'complex reporting queries'. Simultaneously, start a small ML project.",ch:"Skill Prioritisation"},
  {speaker:"Hiring Manager",name:"Sipho",content:"I'd second SQL. I often give interview candidates a data problem and ask them to write a query. Also — practise explaining your work to non-technical people. That skill separates good from great analysts.",ch:"Skill Prioritisation"},
];

const PORTFOLIO=[
  {title:"Customer Churn Prediction Pipeline",desc:"Build an end-to-end ML pipeline that predicts churn for a telecoms company: data cleaning, feature engineering, model training, evaluation, and a Streamlit dashboard.",reqs:["Clean and explore a public telecoms dataset","Engineer at least 5 features","Train and compare 3 models","Deploy a Streamlit dashboard","Write a clear README"],stack:{beginner:"Python, Pandas, Scikit-learn, Streamlit",advanced:"Python, PySpark, XGBoost, FastAPI, Docker"},rubric:["Data quality handling","Feature engineering creativity","Model evaluation rigour","Communication clarity","Code quality"],tip:"Walk through feature engineering decisions. Hiring managers love the 'why' behind choices."},
  {title:"Automated Reporting Dashboard",desc:"Create an automated weekly dashboard pulling from a public API, processing data, and generating visual summaries.",reqs:["Fetch data from a public API","Automate processing with scheduled scripts","Build interactive dashboard with filters","4+ chart types","Written summary with key insights"],stack:{beginner:"Python, Pandas, Plotly/Dash",advanced:"Python, Airflow, dbt, Metabase"},rubric:["Automation reliability","Visualisation quality","Insight depth","UX design","Documentation"],tip:"Emphasise automation — hiring teams value analysts who reduce manual work."},
];

// ============================================================
// PAGES
// ============================================================

function Landing({onStart}){
  const feats=[
    {icon:I.target,t:"Competency Mapping",d:"AI-powered skills extraction from any job posting"},
    {icon:I.chart,t:"Gap Analysis",d:"Adaptive assessments that pinpoint what to learn next"},
    {icon:I.book,t:"Learning Library",d:"Curated resources matched to your gaps"},
    {icon:I.mic,t:"Panel Podcast",d:"Interactive expert discussions you can steer"},
    {icon:I.doc,t:"ATS-Ready CV",d:"Optimised CVs that pass automated screening"},
    {icon:I.interview,t:"Interview Prep",d:"Practice with structure and depth feedback"},
  ];
  return <div style={{minHeight:"100vh",background:T.midnight}}>
    <div style={{padding:"0 24px",maxWidth:1100,margin:"0 auto"}}>
      <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"24px 0"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,background:`linear-gradient(135deg,${T.accent},${T.sky})`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:18,fontWeight:800,color:T.midnight}}>S</span></div>
          <span style={{fontSize:18,fontWeight:700,letterSpacing:"-.02em"}}>SkillBridge <span style={{color:T.accent}}>SA</span></span>
        </div>
        <Btn onClick={onStart}>Get Started</Btn>
      </nav>
      <div className="aFU" style={{textAlign:"center",padding:"80px 0 40px",maxWidth:720,margin:"0 auto"}}>
        <Badge color={T.warm} style={{marginBottom:20}}>Built for South African Job Seekers</Badge>
        <h1 style={{fontSize:"clamp(32px,5vw,56px)",fontWeight:800,lineHeight:1.1,letterSpacing:"-.03em",marginBottom:20}}>
          From <span style={{color:T.textMut,textDecoration:"line-through"}}>not shortlisted</span> to{" "}
          <span style={{background:`linear-gradient(135deg,${T.accent},${T.sky})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>job-ready</span>
        </h1>
        <p style={{fontSize:18,color:T.textSec,lineHeight:1.65,maxWidth:560,margin:"0 auto 36px"}}>
          Upload a job post and your CV. Get a competency map, skills assessment, personalised learning plan, interview practice, and an ATS-optimised CV — all in one platform.
        </p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <Btn size="lg" onClick={onStart}>Start Your Bridge →</Btn>
          <Btn variant="secondary" size="lg" onClick={onStart}>See a Demo</Btn>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,padding:"40px 0 80px"}}>
        {feats.map((f,i)=><Card key={i} hover><div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}><div style={{color:T.accent}}>{f.icon}</div><h3 style={{fontSize:15,fontWeight:700}}>{f.t}</h3></div><p style={{fontSize:13,color:T.textSec,lineHeight:1.6}}>{f.d}</p></Card>)}
      </div>
      <div style={{textAlign:"center",padding:"30px 0 60px",borderTop:`1px solid ${T.border}`}}>
        <div style={{display:"flex",justifyContent:"center",gap:32,flexWrap:"wrap"}}>
          {["POPIA Compliant","Data Encrypted","You Own Your Data"].map(s=><span key={s} style={{display:"flex",alignItems:"center",gap:6,color:T.textMut,fontSize:13}}>{I.shield} {s}</span>)}
        </div>
      </div>
    </div>
  </div>;
}

function Auth({onLogin}){
  const[email,setEmail]=useState("");const[sent,setSent]=useState(false);
  return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
    <Card style={{maxWidth:420,width:"100%",textAlign:"center"}}>
      <div style={{width:48,height:48,background:`linear-gradient(135deg,${T.accent},${T.sky})`,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><span style={{fontSize:22,fontWeight:800,color:T.midnight}}>S</span></div>
      <h2 style={{fontSize:22,fontWeight:700,marginBottom:8}}>Welcome to SkillBridge SA</h2>
      <p style={{color:T.textSec,fontSize:14,marginBottom:24}}>{sent?"Check your email for a magic link":"Sign in with your email"}</p>
      {!sent?<><input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} style={{marginBottom:12}}/><Btn style={{width:"100%"}} onClick={()=>{if(email.includes("@"))setSent(true)}}>Send Magic Link</Btn><p style={{fontSize:12,color:T.textMut,marginTop:16}}>One-time login link. No password needed.</p></>:
      <><div className="aSI" style={{fontSize:48,marginBottom:12}}>✉️</div><p style={{color:T.textSec,fontSize:14,marginBottom:20}}>Link sent to <strong style={{color:T.text}}>{email}</strong></p><Btn onClick={()=>onLogin(email)}>Continue (Demo) →</Btn></>}
    </Card>
  </div>;
}

function Onboarding({onComplete}){
  const[step,setStep]=useState(0);
  const[p,setP]=useState({name:"",edu:"",years:"",industries:[],roles:"",hrs:10,device:"mobile",bw:"medium",avoid:""});
  const steps=["About You","Experience","Learning Style","Ready!"];
  const indOpts=["Technology","Finance","Healthcare","Retail","Manufacturing","Education","Government","Consulting"];
  const StepDots=()=><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:32,justifyContent:"center"}}>
    {steps.map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:i<=step?T.accent:T.surfaceLight,color:i<=step?T.midnight:T.textMut,fontSize:13,fontWeight:700,transition:"all .3s"}}>{i<step?I.check:i+1}</div>
      {i<steps.length-1&&<div style={{width:40,height:2,background:i<step?T.accent:T.surfaceLight,transition:"background .3s"}}/>}
    </div>)}
  </div>;
  const Lbl=({children})=><label style={{fontSize:13,fontWeight:600,color:T.textSec,display:"block",marginBottom:6}}>{children}</label>;
  const Chip=({selected,children,onClick})=><button onClick={onClick} style={{padding:"8px 14px",borderRadius:20,border:`1px solid ${selected?T.accent:T.border}`,background:selected?T.accentGlow:"transparent",color:selected?T.accent:T.textSec,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"'DM Sans'"}}>{children}</button>;

  return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
    <div style={{maxWidth:560,width:"100%"}}><StepDots/>
      <Card className="aFU" key={step}>
        <h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>{steps[step]}</h2>
        <p style={{color:T.textSec,fontSize:14,marginBottom:24}}>{["Let's get to know you","Your professional background","How you prefer to learn","Let's build your bridge"][step]}</p>
        {step===0&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div><Lbl>Full Name</Lbl><input placeholder="e.g. Thabo Mokoena" value={p.name} onChange={e=>setP({...p,name:e.target.value})}/></div>
          <div><Lbl>Highest Education</Lbl><select value={p.edu} onChange={e=>setP({...p,edu:e.target.value})}><option value="">Select...</option>{["Matric / NSC","TVET Certificate","Diploma","Bachelor's Degree","Honours / Postgrad","Master's Degree","Doctorate"].map(o=><option key={o}>{o}</option>)}</select></div>
          <div><Lbl>Years of Experience</Lbl><select value={p.years} onChange={e=>setP({...p,years:e.target.value})}><option value="">Select...</option>{["0 — Graduate","1–2 years","3–5 years","6–10 years","10+ years"].map(o=><option key={o}>{o}</option>)}</select></div>
        </div>}
        {step===1&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div><Lbl>Industries</Lbl><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{indOpts.map(ind=><Chip key={ind} selected={p.industries.includes(ind)} onClick={()=>setP({...p,industries:p.industries.includes(ind)?p.industries.filter(x=>x!==ind):[...p.industries,ind]})}>{ind}</Chip>)}</div></div>
          <div><Lbl>Recent Roles</Lbl><input placeholder="e.g. Junior Developer, Data Intern" value={p.roles} onChange={e=>setP({...p,roles:e.target.value})}/></div>
        </div>}
        {step===2&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div><Lbl>Hours per week: <strong style={{color:T.accent}}>{p.hrs}h</strong></Lbl><input type="range" min={2} max={40} value={p.hrs} onChange={e=>setP({...p,hrs:+e.target.value})} style={{width:"100%",accentColor:T.accent,padding:0,border:"none",background:"transparent"}}/></div>
          <div><Lbl>Primary Device</Lbl><div style={{display:"flex",gap:8}}>{["mobile","laptop","tablet"].map(d=><Chip key={d} selected={p.device===d} onClick={()=>setP({...p,device:d})}>{d}</Chip>)}</div></div>
          <div><Lbl>Connection</Lbl><div style={{display:"flex",gap:8}}>{[["low","📶 Low/2G"],["medium","📶 Medium/3G"],["high","📶 High/WiFi"]].map(([v,l])=><Chip key={v} selected={p.bw===v} onClick={()=>setP({...p,bw:v})}>{l}</Chip>)}</div></div>
          <div><Lbl>Avoid in learning</Lbl><input placeholder='"no long videos", "no paid"' value={p.avoid} onChange={e=>setP({...p,avoid:e.target.value})}/></div>
        </div>}
        {step===3&&<div className="aSI" style={{textAlign:"center",padding:"20px 0"}}>
          <div style={{fontSize:56,marginBottom:16}}>🚀</div>
          <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>You're all set{p.name?`, ${p.name}`:""}!</h3>
          <p style={{color:T.textSec,fontSize:14,lineHeight:1.6}}>Next, submit a job posting and upload your CV.</p>
        </div>}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:28}}>
          {step>0?<Btn variant="ghost" icon={I.arrowL} onClick={()=>setStep(step-1)}>Back</Btn>:<div/>}
          {step<3?<Btn onClick={()=>setStep(step+1)}>Continue {I.arrow}</Btn>:<Btn onClick={onComplete}>Go to Dashboard →</Btn>}
        </div>
      </Card>
    </div>
  </div>;
}

function JobInput({onSubmit}){
  const[mode,setMode]=useState("manual");
  const[jt,setJt]=useState("");const[jd,setJd]=useState("");const[ju,setJu]=useState("");
  const[prof,setProf]=useState("intermediate");const[tl,setTl]=useState("1_month");
  const[cv,setCv]=useState(null);const[consent,setConsent]=useState(false);const[loading,setLoading]=useState(false);
  const go=()=>{setLoading(true);setTimeout(()=>{setLoading(false);onSubmit()},1800)};
  return <div style={{minHeight:"100vh",padding:24,maxWidth:700,margin:"0 auto"}}>
    <div className="aFU" style={{marginBottom:32,paddingTop:40}}>
      <h1 style={{fontSize:26,fontWeight:800,marginBottom:8}}>Add a Job & Your CV</h1>
      <p style={{color:T.textSec,fontSize:15}}>We'll analyse both to build your personalised skills bridge.</p>
    </div>
    <Card style={{marginBottom:20}}>
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>{I.brief} Job Details</h3>
      <TabBar tabs={[{id:"manual",label:"Manual Entry"},{id:"url",label:"Paste URL"}]} active={mode} onChange={setMode}/>
      <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:14}}>
        {mode==="manual"?<><input placeholder="Job Title, e.g. Data Analyst" value={jt} onChange={e=>setJt(e.target.value)}/><textarea rows={5} placeholder="Paste job description..." value={jd} onChange={e=>setJd(e.target.value)}/></>:
        <input placeholder="https://careers24.com/jobs/..." value={ju} onChange={e=>setJu(e.target.value)}/>}
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:180}}><label style={{fontSize:12,fontWeight:600,color:T.textMut,display:"block",marginBottom:4}}>Your Level</label><select value={prof} onChange={e=>setProf(e.target.value)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
          <div style={{flex:1,minWidth:180}}><label style={{fontSize:12,fontWeight:600,color:T.textMut,display:"block",marginBottom:4}}>Timeline</label><select value={tl} onChange={e=>setTl(e.target.value)}><option value="2_weeks">2 Weeks</option><option value="1_month">1 Month</option><option value="3_months">3 Months</option></select></div>
        </div>
      </div>
    </Card>
    <Card style={{marginBottom:20}}>
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>{I.upload} Upload Your CV</h3>
      <div onClick={()=>document.getElementById("cv-up")?.click()} style={{border:`2px dashed ${cv?T.accent:T.border}`,borderRadius:14,padding:32,textAlign:"center",cursor:"pointer",background:cv?T.accentGlow2:"transparent",transition:"all .3s"}}>
        <input id="cv-up" type="file" accept=".pdf,.docx" hidden onChange={e=>setCv(e.target.files[0])}/>
        {cv?<div className="aSI"><div style={{color:T.accent,marginBottom:8}}>{I.check}</div><p style={{fontWeight:600}}>{cv.name}</p><p style={{fontSize:12,color:T.textMut,marginTop:4}}>{(cv.size/1024).toFixed(0)} KB</p></div>:
        <><div style={{color:T.textMut,marginBottom:8}}>{I.upload}</div><p style={{fontWeight:600}}>Drop your CV or click to browse</p><p style={{fontSize:12,color:T.textMut,marginTop:4}}>PDF or DOCX, max 10 MB</p></>}
      </div>
    </Card>
    <Card style={{marginBottom:20,background:T.accentGlow2,border:`1px solid ${T.accentDim}40`}}>
      <label style={{display:"flex",gap:12,cursor:"pointer",alignItems:"flex-start"}}>
        <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} style={{width:20,height:20,accentColor:T.accent,marginTop:2,flexShrink:0}}/>
        <div><p style={{fontSize:14,fontWeight:600,marginBottom:4}}>{I.shield} POPIA Consent</p><p style={{fontSize:12,color:T.textSec,lineHeight:1.5}}>I consent to SkillBridge SA processing my CV and profile data. Data encrypted, never shared, deletable from Settings.</p></div>
      </label>
    </Card>
    <Btn size="lg" style={{width:"100%"}} disabled={!consent||loading} onClick={go}>
      {loading?<span style={{display:"flex",alignItems:"center",gap:8}}><span className="aSpin" style={{display:"inline-block",width:18,height:18,border:`2px solid ${T.midnight}`,borderTopColor:"transparent",borderRadius:"50%"}}/>Analysing...</span>:"Analyse & Build My Bridge →"}
    </Btn>
  </div>;
}

// --- Dashboard ---
function Dashboard({setPage}){
  const match=62;
  const gaps=[
    {skill:"Machine Learning",gap:3,pri:"High",color:T.coral},
    {skill:"Cloud Infrastructure",gap:3,pri:"High",color:T.coral},
    {skill:"AWS Certification",gap:4,pri:"High",color:T.coral},
    {skill:"SQL Depth",gap:2,pri:"Medium",color:T.warm},
    {skill:"Data Visualisation",gap:2,pri:"Medium",color:T.warm},
  ];
  const rd=COMPS.slice(0,7).map(c=>({label:c.name.split(" ")[0],value:c.score}));
  return <div>
    <div className="aFU" style={{marginBottom:28}}>
      <h1 style={{fontSize:24,fontWeight:800,marginBottom:4}}>Your Skills Bridge</h1>
      <p style={{color:T.textSec,fontSize:14}}>Data Analyst · Intermediate · 1-month plan</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:20}}>
      <Card className="aGlow">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div>
            <p style={{fontSize:12,fontWeight:600,color:T.textMut,textTransform:"uppercase",letterSpacing:".08em"}}>CV ↔ Job Match</p>
            <p style={{fontSize:42,fontWeight:800,color:T.accent,lineHeight:1}}>{match}%</p>
          </div>
          <div style={{width:72,height:72,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:`conic-gradient(${T.accent} ${match*3.6}deg,${T.surfaceLight} 0)`}}>
            <div style={{width:56,height:56,borderRadius:"50%",background:T.surface,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14,fontWeight:700}}>{match}%</span></div>
          </div>
        </div>
        <PBar value={match}/>
        <p style={{fontSize:12,color:T.textSec,marginTop:10,lineHeight:1.5}}>Your CV covers 62% of required competencies. Focus on gaps below to improve.</p>
      </Card>
      <Card style={{display:"flex",justifyContent:"center",alignItems:"center"}}><Radar data={rd} size={240}/></Card>
    </div>
    <Card style={{marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h3 style={{fontSize:16,fontWeight:700}}>Priority Gaps</h3>
        <Badge color={T.coral}>{gaps.filter(g=>g.pri==="High").length} High Priority</Badge>
      </div>
      {gaps.map((g,i)=><div key={i} className="aSR" style={{animationDelay:`${i*.06}s`,display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:T.surfaceLight,borderRadius:10,borderLeft:`3px solid ${g.color}`,marginBottom:8}}>
        <div style={{flex:1}}><p style={{fontSize:14,fontWeight:600,marginBottom:4}}>{g.skill}</p><PBar value={5-g.gap} max={5} color={g.color} height={4}/></div>
        <Badge color={g.color}>{g.pri}</Badge>
      </div>)}
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
      {[
        {icon:I.chart,t:"Take Assessment",d:"Test your skills",pg:"assessment",c:T.accent},
        {icon:I.book,t:"Learning Library",d:"Curated resources",pg:"learning",c:T.sky},
        {icon:I.mic,t:"Panel Podcast",d:"Expert discussion",pg:"podcast",c:T.violet},
        {icon:I.doc,t:"Optimise CV",d:"ATS-ready format",pg:"cvopt",c:T.warm},
        {icon:I.target,t:"Portfolio Projects",d:"Proof of skill",pg:"portfolio",c:T.coral},
        {icon:I.interview,t:"Interview Prep",d:"Practice answers",pg:"interview",c:T.success},
      ].map((a,i)=><Card key={i} hover glow onClick={()=>setPage(a.pg)} style={{cursor:"pointer"}}>
        <div style={{color:a.c,marginBottom:10}}>{a.icon}</div>
        <h4 style={{fontSize:14,fontWeight:700,marginBottom:4}}>{a.t}</h4>
        <p style={{fontSize:12,color:T.textSec}}>{a.d}</p>
      </Card>)}
    </div>
  </div>;
}

// --- Assessment ---
function Assessment(){
  const[started,setStarted]=useState(false);const[cur,setCur]=useState(0);const[ans,setAns]=useState({});const[done,setDone]=useState(false);
  const qs=QUESTIONS;
  const score=()=>{let c=0;qs.filter(q=>q.type==="mcq").forEach(q=>{if(ans[q.id]===q.correct)c++});return Math.round(c/qs.filter(q=>q.type==="mcq").length*100)};
  if(done){const s=score();return <div className="aFU"><h2 style={{fontSize:22,fontWeight:800,marginBottom:20}}>Assessment Results</h2>
    <Card className="aGlow" style={{textAlign:"center",marginBottom:20}}>
      <p style={{fontSize:12,fontWeight:600,color:T.textMut,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Overall Score</p>
      <p style={{fontSize:56,fontWeight:800,color:s>=70?T.success:s>=40?T.warm:T.coral}}>{s}%</p>
      <p style={{color:T.textSec,fontSize:14,marginTop:8}}>{s>=70?"Strong foundation — focus on advanced topics.":s>=40?"Good start — targeted study will close gaps.":"Significant gaps — a structured plan will help."}</p>
    </Card>
    {qs.filter(q=>q.type==="mcq").map((q,i)=>{const ok=ans[q.id]===q.correct;return <Card key={i} style={{borderLeft:`3px solid ${ok?T.success:T.error}`,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><Badge color={ok?T.success:T.error}>{ok?"Correct":"Incorrect"}</Badge><Badge>{q.comp}</Badge></div>
      <p style={{fontSize:14,fontWeight:600,marginBottom:8}}>{q.q}</p>
      <p style={{fontSize:13,color:T.textSec,lineHeight:1.5,background:T.surfaceLight,padding:12,borderRadius:8}}>{q.explain}</p>
    </Card>})}
  </div>}
  if(!started)return <div className="aFU"><h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Skills Assessment</h2>
    <p style={{color:T.textSec,fontSize:14,marginBottom:24}}>Adaptive questions across competency areas. Results feed your gap analysis.</p>
    <Card style={{textAlign:"center",padding:40}}><div style={{fontSize:48,marginBottom:16}}>📝</div>
      <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>{qs.length} Questions</h3>
      <p style={{color:T.textSec,fontSize:14,marginBottom:24}}>MCQs and scenarios. ~10–15 minutes.</p>
      <Btn size="lg" onClick={()=>setStarted(true)}>Begin Assessment →</Btn>
    </Card></div>;
  const q=qs[cur];
  return <div className="aFU">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h2 style={{fontSize:18,fontWeight:700}}>Question {cur+1}/{qs.length}</h2><Badge>{q.comp}</Badge></div>
    <PBar value={cur+1} max={qs.length} style={{marginBottom:24}}/>
    <Card>
      <p style={{fontSize:16,fontWeight:600,marginBottom:20,lineHeight:1.5}}>{q.q}</p>
      {q.type==="mcq"?<div style={{display:"flex",flexDirection:"column",gap:10}}>
        {q.opts.map((o,i)=><button key={i} onClick={()=>setAns({...ans,[q.id]:i})} style={{padding:"14px 16px",borderRadius:10,textAlign:"left",border:`1.5px solid ${ans[q.id]===i?T.accent:T.border}`,background:ans[q.id]===i?T.accentGlow:"transparent",color:ans[q.id]===i?T.accent:T.text,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans'",fontWeight:ans[q.id]===i?600:400,transition:"all .2s"}}>
          <span style={{fontFamily:"'JetBrains Mono'",fontSize:12,marginRight:10,opacity:.6}}>{String.fromCharCode(65+i)}</span>{o}
        </button>)}
      </div>:<textarea rows={4} placeholder="Your answer..." style={{fontSize:14}} onChange={e=>setAns({...ans,[q.id]:e.target.value})}/>}
    </Card>
    <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
      <Btn variant="ghost" onClick={()=>setCur(Math.max(0,cur-1))} disabled={cur===0}>← Previous</Btn>
      {cur<qs.length-1?<Btn onClick={()=>setCur(cur+1)}>Next →</Btn>:<Btn onClick={()=>setDone(true)}>Submit</Btn>}
    </div>
  </div>;
}

// --- Learning Library ---
function Learning(){
  const[tab,setTab]=useState("resources");const[saved,setSaved]=useState([]);
  return <div className="aFU">
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Learning Library</h2>
    <p style={{color:T.textSec,fontSize:14,marginBottom:20}}>Resources and institutions matched to your skill gaps.</p>
    <TabBar tabs={[{id:"resources",label:"Resources"},{id:"institutions",label:"Institutions & Certs"},{id:"saved",label:`Saved (${saved.length})`}]} active={tab} onChange={setTab}/>
    <div style={{marginTop:20}}>
      {tab==="resources"&&RESOURCES.map((r,i)=><Card key={i} hover style={{marginBottom:12}} className="aSR">
        <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}><Badge color={T.sky}>{r.type}</Badge><Badge color={T.violet}>{r.diff}</Badge><Badge>{r.comp}</Badge></div>
        <h4 style={{fontSize:15,fontWeight:700,marginBottom:4}}>{r.title}</h4>
        <p style={{fontSize:13,color:T.textMut,marginBottom:6}}>{r.provider} · ~{r.hours}h</p>
        <p style={{fontSize:13,color:T.textSec,lineHeight:1.5,background:T.surfaceLight,padding:"8px 12px",borderRadius:8,marginBottom:10}}><strong style={{color:T.accent}}>Why:</strong> {r.why}</p>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="ghost" size="sm" icon={I.bmark} onClick={()=>setSaved(s=>s.includes(r.id)?s.filter(x=>x!==r.id):[...s,r.id])} style={{color:saved.includes(r.id)?T.warm:T.textMut}}>{saved.includes(r.id)?"Saved":"Save"}</Btn>
          <Btn variant="secondary" size="sm" icon={I.ext}>Open</Btn>
        </div>
      </Card>)}
      {tab==="institutions"&&INSTS.map((inst,i)=><Card key={i} hover style={{marginBottom:12}} className="aSR">
        <div style={{display:"flex",gap:6,marginBottom:8}}><Badge color={T.warm}>{inst.cat}</Badge>{inst.cat==="Local Bootcamp"&&<Badge color={T.success}>🇿🇦 SA-Based</Badge>}</div>
        <h4 style={{fontSize:15,fontWeight:700,marginBottom:4}}>{inst.name}</h4>
        <p style={{fontSize:13,color:T.textSec,lineHeight:1.5,marginBottom:10}}>{inst.desc}</p>
        <p style={{fontSize:13,marginBottom:8}}><strong style={{color:T.textMut}}>Best for:</strong> {inst.bestFor}</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{inst.offerings.map((o,j)=><span key={j} style={{fontSize:11,padding:"3px 8px",background:T.surfaceLight,borderRadius:6,color:T.textSec}}>{o}</span>)}</div>
        <p style={{fontSize:12,color:T.textMut,fontStyle:"italic",marginBottom:10}}>{I.sparkle} {inst.recog}</p>
        <Btn variant="secondary" size="sm" icon={I.ext}>Visit Website</Btn>
      </Card>)}
      {tab==="saved"&&(saved.length===0?<Card style={{textAlign:"center",padding:40}}><p style={{color:T.textMut}}>No saved resources yet.</p></Card>:
        RESOURCES.filter(r=>saved.includes(r.id)).map((r,i)=><Card key={i} style={{marginBottom:10}}><h4 style={{fontSize:14,fontWeight:700}}>{r.title}</h4><p style={{fontSize:12,color:T.textMut}}>{r.provider} · {r.comp}</p></Card>))}
    </div>
  </div>;
}

// --- Podcast Studio ---
function Podcast(){
  const[playing,setPlaying]=useState(false);const[curT,setCurT]=useState(0);const[showRedir,setShowRedir]=useState(false);const[rText,setRText]=useState("");
  const[turns,setTurns]=useState(PODCAST_TURNS);const[bmarks,setBmarks]=useState([]);
  const tRef=useRef(null);
  const sCol={Moderator:T.accent,"Hiring Manager":T.warm,"Domain Expert":T.violet,"User Avatar":T.sky};
  const sEmoji={Moderator:"🎙️","Hiring Manager":"💼","Domain Expert":"🎓","User Avatar":"👤"};
  const sName={Moderator:"Thandiwe","Hiring Manager":"Sipho","Domain Expert":"Dr Aisha","User Avatar":"You"};

  useEffect(()=>{if(playing&&curT<turns.length-1){const t=setTimeout(()=>setCurT(c=>c+1),3000);return()=>clearTimeout(t)}if(curT>=turns.length-1)setPlaying(false)},[playing,curT,turns.length]);
  useEffect(()=>{if(tRef.current)tRef.current.scrollTop=tRef.current.scrollHeight},[curT]);

  const doRedir=()=>{if(!rText.trim())return;
    setTurns(t=>[...t,
      {speaker:"User Avatar",name:"You",content:rText,ch:"Your Question",isRedir:true},
      {speaker:"Domain Expert",name:"Dr Aisha",content:`Great question about "${rText.slice(0,50)}". Let me break this down with a practical example for the Data Analyst role...`,ch:"Expert Response"},
      {speaker:"Hiring Manager",name:"Sipho",content:`From a hiring perspective, this shows great curiosity. Candidates who ask about "${rText.slice(0,30)}" typically stand out.`,ch:"Hiring Insight"},
    ]);setCurT(turns.length);setRText("");setShowRedir(false);setPlaying(true)};

  return <div className="aFU">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
      <div><h2 style={{fontSize:22,fontWeight:800,marginBottom:4}}>Panel Podcast</h2><p style={{color:T.textSec,fontSize:14}}>Data Analyst — Skills Deep Dive</p></div>
      <Btn variant="secondary" size="sm" icon={I.dl}>Export Notes</Btn>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:20}}>
      {Object.keys(sCol).map(role=>{const active=turns[curT]?.speaker===role;return <div key={role} style={{padding:"14px 12px",borderRadius:12,textAlign:"center",background:active?`${sCol[role]}15`:T.surface,border:`1.5px solid ${active?sCol[role]:T.border}`,transition:"all .3s",animation:active?"speakPulse 1.5s ease-in-out infinite":"none"}}>
        <div style={{fontSize:24,marginBottom:6}}>{sEmoji[role]}</div>
        <p style={{fontSize:12,fontWeight:700,color:active?sCol[role]:T.text}}>{sName[role]}</p>
        <p style={{fontSize:10,color:T.textMut}}>{role}</p>
        {active&&<div style={{width:8,height:8,borderRadius:"50%",background:sCol[role],margin:"6px auto 0"}} className="aP"/>}
      </div>})}
    </div>
    <Card style={{marginBottom:16}}>
      <div ref={tRef} style={{maxHeight:400,overflowY:"auto",paddingRight:8}}>
        {turns.slice(0,curT+1).map((t,i)=><div key={i} className={i===curT?"aFU":""} style={{padding:"14px 0",borderBottom:i<curT?`1px solid ${T.border}20`:"none"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>{sEmoji[t.speaker]}</span>
              <span style={{fontSize:13,fontWeight:700,color:sCol[t.speaker]}}>{t.name}</span>
              {t.isRedir&&<Badge color={T.coral} style={{fontSize:9}}>Redirect</Badge>}
            </div>
            <button onClick={()=>setBmarks(b=>[...b,i])} style={{background:"none",border:"none",cursor:"pointer",color:bmarks.includes(i)?T.warm:T.textMut,display:"flex"}}>{I.bmark}</button>
          </div>
          <p style={{fontSize:14,lineHeight:1.7,paddingLeft:28}}>{t.content}</p>
          {t.ch!==turns[i-1]?.ch&&<span style={{fontSize:10,color:T.textMut,paddingLeft:28,fontWeight:600,textTransform:"uppercase",letterSpacing:".08em"}}>Ch: {t.ch}</span>}
        </div>)}
      </div>
    </Card>
    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
      <Btn onClick={()=>setPlaying(!playing)} icon={playing?I.pause:I.play}>{playing?"Pause":"Play"}</Btn>
      <Btn variant="warm" icon={I.redirect} onClick={()=>setShowRedir(true)}>Redirect Discussion</Btn>
    </div>
    <Modal open={showRedir} onClose={()=>setShowRedir(false)} title="Redirect the Discussion">
      <p style={{fontSize:14,color:T.textSec,marginBottom:16,lineHeight:1.5}}>Tell the panel what to focus on. They'll adapt the next turns.</p>
      <textarea rows={3} placeholder='e.g. "Give examples of SQL window functions"' value={rText} onChange={e=>setRText(e.target.value)} style={{marginBottom:12}}/>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {["Slow down & simplify","Give real examples","Focus on interview tips","Explain ML basics"].map(s=><button key={s} onClick={()=>setRText(s)} style={{padding:"6px 12px",borderRadius:8,background:T.surfaceLight,border:`1px solid ${T.border}`,color:T.textSec,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans'"}}>{s}</button>)}
      </div>
      <div style={{marginTop:16,display:"flex",justifyContent:"flex-end"}}><Btn onClick={doRedir} disabled={!rText.trim()}>Send →</Btn></div>
    </Modal>
  </div>;
}

// --- CV Optimiser ---
function CVOpt(){
  const[tab,setTab]=useState("analysis");
  const kws=[
    {kw:"Python",status:"found",signal:"Strong match — in 3 CV sections"},
    {kw:"SQL",status:"found",signal:"Present in experience section"},
    {kw:"Machine Learning",status:"weak",signal:"Mentioned once; add project details"},
    {kw:"AWS",status:"missing",signal:"Not found — add certification or project"},
    {kw:"Data Visualisation",status:"found",signal:"Tableau mentioned; add dashboard examples"},
    {kw:"Stakeholder Communication",status:"missing",signal:"Add presentation examples"},
    {kw:"Agile",status:"weak",signal:"Brief mention — expand with sprint examples"},
  ];
  const sc={found:T.success,weak:T.warm,missing:T.error};
  const rewrites=[
    {orig:"Worked with data and created reports",improved:"Engineered automated reporting pipeline processing 50K+ records daily using Python and Pandas, reducing manual reporting time by 65% for 12 stakeholders.",method:"STAR: Situation → Task → Action → Result (65% saved)"},
    {orig:"Helped with database management",improved:"Designed PostgreSQL schemas for 3 production apps; optimised queries with indexes and CTEs, achieving 40% faster load times.",method:"CAR: Challenge → Action → Result (40% improvement)"},
  ];
  return <div className="aFU">
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>CV & ATS Optimiser</h2>
    <p style={{color:T.textSec,fontSize:14,marginBottom:20}}>Keyword analysis, rewrite suggestions, and exportable optimised versions.</p>
    <TabBar tabs={[{id:"analysis",label:"Keyword Analysis"},{id:"rewrites",label:"Bullet Rewrites"},{id:"export",label:"Export"}]} active={tab} onChange={setTab}/>
    <div style={{marginTop:20}}>
      {tab==="analysis"&&<div>
        <Card style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><h3 style={{fontSize:16,fontWeight:700}}>Keyword Coverage</h3><Badge>{kws.filter(k=>k.status==="found").length}/{kws.length} Found</Badge></div>
          {kws.map((k,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:T.surfaceLight,borderRadius:10,borderLeft:`3px solid ${sc[k.status]}`,marginBottom:8}}>
            <div style={{flex:1}}><p style={{fontSize:14,fontWeight:600}}>{k.kw}</p><p style={{fontSize:12,color:T.textSec,marginTop:2}}>{k.signal}</p></div>
            <Badge color={sc[k.status]}>{k.status}</Badge>
          </div>)}
        </Card>
      </div>}
      {tab==="rewrites"&&<div>
        {rewrites.map((r,i)=><Card key={i} style={{marginBottom:16}}>
          <div style={{marginBottom:12}}>
            <p style={{fontSize:12,fontWeight:600,color:T.textMut,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Original</p>
            <p style={{fontSize:14,color:T.coral,fontStyle:"italic",padding:"10px 14px",background:`${T.coral}10`,borderRadius:8,borderLeft:`3px solid ${T.coral}`}}>{r.orig}</p>
          </div>
          <div style={{marginBottom:12}}>
            <p style={{fontSize:12,fontWeight:600,color:T.textMut,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Improved</p>
            <p style={{fontSize:14,color:T.success,padding:"10px 14px",background:`${T.success}10`,borderRadius:8,borderLeft:`3px solid ${T.success}`,lineHeight:1.5}}>{r.improved}</p>
          </div>
          <p style={{fontSize:12,color:T.textSec,background:T.surfaceLight,padding:10,borderRadius:8}}><strong style={{color:T.accent}}>Method:</strong> {r.method}</p>
        </Card>)}
      </div>}
      {tab==="export"&&<Card style={{textAlign:"center",padding:40}}>
        <div style={{fontSize:48,marginBottom:16}}>📄</div>
        <h3 style={{fontSize:18,fontWeight:700,marginBottom:12}}>Export Your CV</h3>
        <p style={{color:T.textSec,fontSize:14,marginBottom:24}}>Two versions optimised for different audiences.</p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <Btn icon={I.dl}>ATS-Friendly (Plain)</Btn>
          <Btn variant="secondary" icon={I.dl}>Human-Readable (Styled)</Btn>
        </div>
      </Card>}
    </div>
  </div>;
}

// --- Portfolio Projects ---
function PortfolioPage(){
  return <div className="aFU">
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Portfolio Project Briefs</h2>
    <p style={{color:T.textSec,fontSize:14,marginBottom:20}}>Proof-of-skill projects aligned to the Data Analyst role.</p>
    {PORTFOLIO.map((p,i)=><Card key={i} style={{marginBottom:16}}>
      <Badge color={T.coral} style={{marginBottom:12}}>Project {i+1}</Badge>
      <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>{p.title}</h3>
      <p style={{fontSize:14,color:T.textSec,lineHeight:1.6,marginBottom:16}}>{p.desc}</p>
      <div style={{marginBottom:16}}>
        <p style={{fontSize:13,fontWeight:700,marginBottom:8}}>Requirements</p>
        {p.reqs.map((r,j)=><div key={j} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}>
          <span style={{color:T.accent,flexShrink:0,marginTop:2}}>{I.check}</span>
          <span style={{fontSize:13,color:T.textSec}}>{r}</span>
        </div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <div style={{background:T.surfaceLight,padding:12,borderRadius:10}}>
          <p style={{fontSize:11,fontWeight:600,color:T.textMut,textTransform:"uppercase",marginBottom:4}}>Beginner Stack</p>
          <p style={{fontSize:13,color:T.text}}>{p.stack.beginner}</p>
        </div>
        <div style={{background:T.surfaceLight,padding:12,borderRadius:10}}>
          <p style={{fontSize:11,fontWeight:600,color:T.textMut,textTransform:"uppercase",marginBottom:4}}>Advanced Stack</p>
          <p style={{fontSize:13,color:T.text}}>{p.stack.advanced}</p>
        </div>
      </div>
      <div style={{background:`${T.warm}10`,padding:14,borderRadius:10,borderLeft:`3px solid ${T.warm}`}}>
        <p style={{fontSize:12,fontWeight:600,color:T.warm,marginBottom:4}}>💡 Interview Tip</p>
        <p style={{fontSize:13,color:T.textSec,lineHeight:1.5}}>{p.tip}</p>
      </div>
    </Card>)}
  </div>;
}

// --- Interview Simulator ---
function Interview(){
  const[started,setStarted]=useState(false);const[qi,setQi]=useState(0);const[answer,setAnswer]=useState("");const[feedback,setFeedback]=useState(null);
  const qs=[
    {type:"Behavioural",q:"Tell me about a time you had to explain a complex analysis to a non-technical audience.",tip:"Use STAR method. Focus on how you adapted your communication."},
    {type:"Technical",q:"How would you approach cleaning a dataset with 30% missing values?",tip:"Discuss strategies (imputation, deletion, analysis of missingness patterns) and trade-offs."},
    {type:"Scenario",q:"Your manager asks for a report by Friday, but you discover data quality issues. What do you do?",tip:"Show communication skills, prioritisation, and proactive problem-solving."},
    {type:"Technical",q:"Explain the difference between supervised and unsupervised learning with examples.",tip:"Give concrete examples relevant to the role. Show breadth without losing depth."},
  ];
  const showFB=()=>setFeedback({structure:7,clarity:8,relevance:6,depth:5,improved:"When I joined [Company], our quarterly reports took 3 days to compile manually (Situation). I was tasked with reducing this to same-day delivery (Task). I built an automated Python pipeline using Pandas for data cleaning and Plotly for visualisation, with Slack notifications for stakeholders (Action). This reduced report generation from 3 days to 2 hours and eliminated manual errors, saving the team approximately 10 hours per week (Result)."});

  if(!started)return <div className="aFU">
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Interview Simulator</h2>
    <p style={{color:T.textSec,fontSize:14,marginBottom:24}}>Practice technical and behavioural questions with structured feedback.</p>
    <Card style={{textAlign:"center",padding:40}}>
      <div style={{fontSize:48,marginBottom:16}}>🎤</div>
      <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>{qs.length} Practice Questions</h3>
      <p style={{color:T.textSec,fontSize:14,marginBottom:24}}>Mixed technical and behavioural. Get feedback on structure, clarity, and depth.</p>
      <Btn size="lg" onClick={()=>setStarted(true)}>Start Practice →</Btn>
    </Card>
  </div>;

  const q=qs[qi];
  return <div className="aFU">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <h2 style={{fontSize:18,fontWeight:700}}>Question {qi+1}/{qs.length}</h2>
      <Badge color={q.type==="Technical"?T.sky:q.type==="Behavioural"?T.violet:T.warm}>{q.type}</Badge>
    </div>
    <PBar value={qi+1} max={qs.length} style={{marginBottom:24}}/>
    <Card style={{marginBottom:16}}>
      <p style={{fontSize:16,fontWeight:600,lineHeight:1.5,marginBottom:12}}>{q.q}</p>
      <p style={{fontSize:12,color:T.textMut,background:T.surfaceLight,padding:10,borderRadius:8}}>💡 Tip: {q.tip}</p>
    </Card>
    <Card style={{marginBottom:16}}>
      <textarea rows={6} placeholder="Type your answer..." value={answer} onChange={e=>setAnswer(e.target.value)} style={{fontSize:14,marginBottom:12}}/>
      <Btn onClick={showFB} disabled={!answer.trim()}>Get Feedback</Btn>
    </Card>
    {feedback&&<Card className="aSI" style={{borderLeft:`3px solid ${T.accent}`}}>
      <h4 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Feedback</h4>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:10,marginBottom:16}}>
        {[["Structure",feedback.structure],["Clarity",feedback.clarity],["Relevance",feedback.relevance],["Depth",feedback.depth]].map(([l,v])=><div key={l} style={{textAlign:"center"}}>
          <p style={{fontSize:24,fontWeight:800,color:v>=7?T.success:v>=5?T.warm:T.coral}}>{v}/10</p>
          <p style={{fontSize:11,color:T.textMut,fontWeight:600}}>{l}</p>
        </div>)}
      </div>
      <div style={{background:`${T.success}10`,padding:14,borderRadius:10,borderLeft:`3px solid ${T.success}`}}>
        <p style={{fontSize:12,fontWeight:600,color:T.success,marginBottom:6}}>Improved Answer Draft</p>
        <p style={{fontSize:13,color:T.textSec,lineHeight:1.6}}>{feedback.improved}</p>
      </div>
    </Card>}
    <div style={{display:"flex",justifyContent:"space-between",marginTop:16}}>
      <Btn variant="ghost" onClick={()=>{setQi(Math.max(0,qi-1));setAnswer("");setFeedback(null)}} disabled={qi===0}>← Previous</Btn>
      <Btn onClick={()=>{setQi(Math.min(qs.length-1,qi+1));setAnswer("");setFeedback(null)}} disabled={qi>=qs.length-1}>Next →</Btn>
    </div>
  </div>;
}

// --- Settings ---
function Settings(){
  const[dataMode,setDataMode]=useState("standard");const[showDelete,setShowDelete]=useState(false);
  return <div className="aFU">
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Settings</h2>
    <p style={{color:T.textSec,fontSize:14,marginBottom:24}}>Privacy controls, preferences, and data management.</p>
    <Card style={{marginBottom:16}}>
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>{I.shield} Privacy & Data</h3>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:12,background:T.surfaceLight,borderRadius:10}}>
          <div><p style={{fontSize:14,fontWeight:600}}>Export All Data</p><p style={{fontSize:12,color:T.textMut}}>Download everything we store about you</p></div>
          <Btn variant="secondary" size="sm" icon={I.dl}>Export</Btn>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:12,background:T.surfaceLight,borderRadius:10}}>
          <div><p style={{fontSize:14,fontWeight:600}}>Delete CV & Derived Data</p><p style={{fontSize:12,color:T.textMut}}>Remove your CV and all analysis from it</p></div>
          <Btn variant="danger" size="sm">Delete CV</Btn>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:12,background:`${T.error}10`,borderRadius:10,border:`1px solid ${T.error}30`}}>
          <div><p style={{fontSize:14,fontWeight:600,color:T.error}}>Delete All Data & Account</p><p style={{fontSize:12,color:T.textMut}}>Permanently remove everything. This cannot be undone.</p></div>
          <Btn variant="danger" size="sm" onClick={()=>setShowDelete(true)}>Delete All</Btn>
        </div>
      </div>
    </Card>
    <Card style={{marginBottom:16}}>
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Preferences</h3>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div>
          <label style={{fontSize:13,fontWeight:600,color:T.textSec,display:"block",marginBottom:6}}>Language</label>
          <select defaultValue="en"><option value="en">English (UK)</option><option value="zu" disabled>isiZulu (coming soon)</option><option value="af" disabled>Afrikaans (coming soon)</option></select>
        </div>
        <div>
          <label style={{fontSize:13,fontWeight:600,color:T.textSec,display:"block",marginBottom:6}}>Data Mode</label>
          <div style={{display:"flex",gap:8}}>
            {[["standard","Standard"],["reduced","Reduced Data"]].map(([v,l])=><button key={v} onClick={()=>setDataMode(v)} style={{flex:1,padding:"10px",borderRadius:10,border:`1px solid ${dataMode===v?T.accent:T.border}`,background:dataMode===v?T.accentGlow:"transparent",color:dataMode===v?T.accent:T.textSec,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans'"}}>{l}</button>)}
          </div>
          <p style={{fontSize:12,color:T.textMut,marginTop:6}}>Reduced mode disables images and defers non-critical scripts for lower data usage.</p>
        </div>
      </div>
    </Card>
    <Modal open={showDelete} onClose={()=>setShowDelete(false)} title="Delete All Data?">
      <p style={{fontSize:14,color:T.textSec,lineHeight:1.6,marginBottom:20}}>This will permanently delete your profile, CV, all analyses, assessments, podcast transcripts, and saved resources. This action cannot be undone.</p>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn variant="ghost" onClick={()=>setShowDelete(false)}>Cancel</Btn><Btn variant="danger">Confirm Delete</Btn></div>
    </Modal>
  </div>;
}

// ============================================================
// MAIN APP (Navigation Shell)
// ============================================================
export default function App(){
  const[view,setView]=useState("landing"); // landing|auth|onboarding|jobinput|app
  const[page,setPage]=useState("dashboard");
  const[sideOpen,setSideOpen]=useState(false);

  const navItems=[
    {id:"dashboard",icon:I.home,label:"Dashboard"},
    {id:"assessment",icon:I.chart,label:"Assessment"},
    {id:"learning",icon:I.book,label:"Learning"},
    {id:"podcast",icon:I.mic,label:"Podcast"},
    {id:"cvopt",icon:I.doc,label:"CV Optimiser"},
    {id:"portfolio",icon:I.target,label:"Portfolio"},
    {id:"interview",icon:I.interview,label:"Interview"},
    {id:"settings",icon:I.settings,label:"Settings"},
  ];

  // Pre-app views
  if(view==="landing")return <><style>{css}</style><Landing onStart={()=>setView("auth")}/></>;
  if(view==="auth")return <><style>{css}</style><Auth onLogin={()=>setView("onboarding")}/></>;
  if(view==="onboarding")return <><style>{css}</style><Onboarding onComplete={()=>setView("jobinput")}/></>;
  if(view==="jobinput")return <><style>{css}</style><JobInput onSubmit={()=>setView("app")}/></>;

  const PageContent=()=>{
    switch(page){
      case "dashboard": return <Dashboard setPage={setPage}/>;
      case "assessment": return <Assessment/>;
      case "learning": return <Learning/>;
      case "podcast": return <Podcast/>;
      case "cvopt": return <CVOpt/>;
      case "portfolio": return <PortfolioPage/>;
      case "interview": return <Interview/>;
      case "settings": return <Settings/>;
      default: return <Dashboard setPage={setPage}/>;
    }
  };

  return <>
    <style>{css}</style>
    <div style={{display:"flex",minHeight:"100vh",background:T.midnight}}>
      {/* Sidebar — desktop */}
      <aside style={{width:240,background:T.deep,borderRight:`1px solid ${T.border}`,padding:"20px 12px",display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,bottom:0,zIndex:100,transition:"transform .3s",transform:typeof window!=="undefined"&&window.innerWidth<768&&!sideOpen?"translateX(-100%)":"translateX(0)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 8px",marginBottom:28}}>
          <div style={{width:32,height:32,background:`linear-gradient(135deg,${T.accent},${T.sky})`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,fontWeight:800,color:T.midnight}}>S</span></div>
          <span style={{fontSize:16,fontWeight:700}}>SkillBridge <span style={{color:T.accent}}>SA</span></span>
        </div>
        <nav style={{flex:1,display:"flex",flexDirection:"column",gap:2}}>
          {navItems.map(n=><button key={n.id} onClick={()=>{setPage(n.id);setSideOpen(false)}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,border:"none",cursor:"pointer",background:page===n.id?T.accentGlow:"transparent",color:page===n.id?T.accent:T.textSec,fontFamily:"'DM Sans'",fontSize:13,fontWeight:page===n.id?600:500,transition:"all .2s",textAlign:"left"}}>
            <span style={{display:"flex"}}>{n.icon}</span>{n.label}
          </button>)}
        </nav>
        <div style={{padding:"12px",borderTop:`1px solid ${T.border}`,marginTop:8}}>
          <p style={{fontSize:11,color:T.textMut}}>SkillBridge SA v1.0</p>
          <p style={{fontSize:11,color:T.textMut}}>POPIA Compliant</p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sideOpen&&<div onClick={()=>setSideOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:99}}/>}

      {/* Main */}
      <main style={{flex:1,marginLeft:typeof window!=="undefined"&&window.innerWidth>=768?240:0,padding:"20px 24px 40px",maxWidth:900,width:"100%"}}>
        {/* Mobile header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <button onClick={()=>setSideOpen(true)} style={{background:"none",border:"none",cursor:"pointer",color:T.textSec,display:"flex",padding:4}}>{I.menu}</button>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:T.surfaceLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700}}>T</div>
          </div>
        </div>
        <PageContent/>
      </main>
    </div>
  </>;
}
