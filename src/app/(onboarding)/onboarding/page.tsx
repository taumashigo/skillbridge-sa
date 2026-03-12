"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card, Badge } from "@/components/ui/base";

export default function OnboardingPage(){
  const router = useRouter();
  const onComplete = () => router.push("/job-input");
  const[step,setStep]=useState(0);
  const[p,setP]=useState({name:"",edu:"",years:"",industries:[] as string[],roles:"",hrs:10,device:"mobile",bw:"medium",avoid:""});
  const steps=["About You","Experience","Learning Style","Ready!"];
  const indOpts=["Technology","Finance","Healthcare","Retail","Manufacturing","Education","Government","Consulting"];
  const StepDots=()=><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:32,justifyContent:"center"}}>
    {steps.map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:i<=step?T.accent:T.surfaceLight,color:i<=step?T.midnight:T.textMut,fontSize:13,fontWeight:700,transition:"all .3s"}}>{i<step?<span style={{display:"flex"}}>{I.check}</span>:i+1}</div>
      {i<steps.length-1&&<div style={{width:40,height:2,background:i<step?T.accent:T.surfaceLight,transition:"background .3s"}}/>}
    </div>)}
  </div>;
  const Lbl=({children}:any)=><label style={{fontSize:13,fontWeight:600,color:T.textSec,display:"block",marginBottom:6}}>{children}</label>;
  const Chip=({selected,children,onClick}:any)=><button onClick={onClick} style={{padding:"8px 14px",borderRadius:20,border:`1px solid ${selected?T.accent:T.border}`,background:selected?T.accentGlow:"transparent",color:selected?T.accent:T.textSec,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"'DM Sans'"}}>{children}</button>;

  return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:T.midnight}}>
    <div style={{maxWidth:560,width:"100%"}}><StepDots/>
      <Card className="aFU" key={step}>
        <h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>{steps[step]}</h2>
        <p style={{color:T.textSec,fontSize:14,marginBottom:24}}>{["Let's get to know you","Your professional background","How you prefer to learn","Let's build your bridge"][step]}</p>
        {step===0&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div><Lbl>Full Name</Lbl><input placeholder="e.g. Thabo Mokoena" value={p.name} onChange={e=>setP({...p,name:e.target.value})}/></div>
          <div><Lbl>Highest Education</Lbl><select value={p.edu} onChange={e=>setP({...p,edu:e.target.value})}><option value="">Select...</option>{["Matric / NSC","TVET Certificate","Diploma","Bachelor's Degree","Honours / Postgrad","Master's Degree","Doctorate"].map(o=><option key={o}>{o}</option>)}</select></div>
          <div><Lbl>Years of Experience</Lbl><select value={p.years} onChange={e=>setP({...p,years:e.target.value})}><option value="">Select...</option>{["0 \u2013 Graduate","1\u20132 years","3\u20135 years","6\u201310 years","10+ years"].map(o=><option key={o}>{o}</option>)}</select></div>
        </div>}
        {step===1&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div><Lbl>Industries</Lbl><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{indOpts.map(ind=><Chip key={ind} selected={p.industries.includes(ind)} onClick={()=>setP({...p,industries:p.industries.includes(ind)?p.industries.filter((x:string)=>x!==ind):[...p.industries,ind]})}>{ind}</Chip>)}</div></div>
          <div><Lbl>Recent Roles</Lbl><input placeholder="e.g. Junior Developer, Data Intern" value={p.roles} onChange={e=>setP({...p,roles:e.target.value})}/></div>
        </div>}
        {step===2&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div><Lbl>Hours per week: <strong style={{color:T.accent}}>{p.hrs}h</strong></Lbl><input type="range" min={2} max={40} value={p.hrs} onChange={e=>setP({...p,hrs:+e.target.value})} style={{width:"100%",accentColor:T.accent,padding:0,border:"none",background:"transparent"}}/></div>
          <div><Lbl>Primary Device</Lbl><div style={{display:"flex",gap:8}}>{["mobile","laptop","tablet"].map(d=><Chip key={d} selected={p.device===d} onClick={()=>setP({...p,device:d})}>{d}</Chip>)}</div></div>
          <div><Lbl>Connection</Lbl><div style={{display:"flex",gap:8}}>{[["low","\ud83d\udcf6 Low/2G"],["medium","\ud83d\udcf6 Medium/3G"],["high","\ud83d\udcf6 High/WiFi"]].map(([v,l])=><Chip key={v} selected={p.bw===v} onClick={()=>setP({...p,bw:v})}>{l}</Chip>)}</div></div>
          <div><Lbl>Avoid in learning</Lbl><input placeholder='"no long videos", "no paid"' value={p.avoid} onChange={e=>setP({...p,avoid:e.target.value})}/></div>
        </div>}
        {step===3&&<div className="aSI" style={{textAlign:"center",padding:"20px 0"}}>
          <div style={{fontSize:56,marginBottom:16}}>&#128640;</div>
          <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>You&apos;re all set{p.name?`, ${p.name}`:""}!</h3>
          <p style={{color:T.textSec,fontSize:14,lineHeight:1.6}}>Next, submit a job posting and upload your CV.</p>
        </div>}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:28}}>
          {step>0?<Btn variant="ghost" icon={I.arrowL} onClick={()=>setStep(step-1)}>Back</Btn>:<div/>}
          {step<3?<Btn onClick={()=>setStep(step+1)}>Continue {I.arrow}</Btn>:<Btn onClick={onComplete}>Go to Dashboard &rarr;</Btn>}
        </div>
      </Card>
    </div>
  </div>;
}
