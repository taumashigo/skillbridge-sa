"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card, Badge } from "@/components/ui/base";

export default function LandingPage(){
  const router = useRouter();
  const onStart = () => router.push("/login");

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
          Upload a job post and your CV. Get a competency map, skills assessment, personalised learning plan, interview practice, and an ATS-optimised CV &mdash; all in one platform.
        </p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <Btn size="lg" onClick={onStart}>Start Your Bridge &rarr;</Btn>
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
