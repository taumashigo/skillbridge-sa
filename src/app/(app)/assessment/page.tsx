"use client";
import React, { useState } from "react";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card, Badge, PBar } from "@/components/ui/base";
import { QUESTIONS } from "@/lib/data/mock";

export default function AssessmentPage(){
  const[started,setStarted]=useState(false);const[cur,setCur]=useState(0);const[ans,setAns]=useState<any>({});const[done,setDone]=useState(false);
  const qs=QUESTIONS;
  const score=()=>{let c=0;qs.filter((q:any)=>q.type==="mcq").forEach((q:any)=>{if(ans[q.id]===q.correct)c++});return Math.round(c/qs.filter((q:any)=>q.type==="mcq").length*100)};

  if(done){const s=score();return <div className="aFU"><h2 style={{fontSize:22,fontWeight:800,marginBottom:20}}>Assessment Results</h2>
    <Card className="aGlow" style={{textAlign:"center",marginBottom:20}}>
      <p style={{fontSize:12,fontWeight:600,color:T.textMut,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Overall Score</p>
      <p style={{fontSize:56,fontWeight:800,color:s>=70?T.success:s>=40?T.warm:T.coral}}>{s}%</p>
      <p style={{color:T.textSec,fontSize:14,marginTop:8}}>{s>=70?"Strong foundation \u2013 focus on advanced topics.":s>=40?"Good start \u2013 targeted study will close gaps.":"Significant gaps \u2013 a structured plan will help."}</p>
    </Card>
    {qs.filter((q:any)=>q.type==="mcq").map((q:any,i:number)=>{const ok=ans[q.id]===q.correct;return <Card key={i} style={{borderLeft:`3px solid ${ok?T.success:T.error}`,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><Badge color={ok?T.success:T.error}>{ok?"Correct":"Incorrect"}</Badge><Badge>{q.comp}</Badge></div>
      <p style={{fontSize:14,fontWeight:600,marginBottom:8}}>{q.q}</p>
      <p style={{fontSize:13,color:T.textSec,lineHeight:1.5,background:T.surfaceLight,padding:12,borderRadius:8}}>{q.explain}</p>
    </Card>})}
  </div>}

  if(!started)return <div className="aFU"><h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Skills Assessment</h2>
    <p style={{color:T.textSec,fontSize:14,marginBottom:24}}>Adaptive questions across competency areas. Results feed your gap analysis.</p>
    <Card style={{textAlign:"center",padding:40}}><div style={{fontSize:48,marginBottom:16}}>&#128269;</div>
      <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>{qs.length} Questions</h3>
      <p style={{color:T.textSec,fontSize:14,marginBottom:24}}>MCQs and scenarios. ~10&ndash;15 minutes.</p>
      <Btn size="lg" onClick={()=>setStarted(true)}>Begin Assessment &rarr;</Btn>
    </Card></div>;

  const q:any=qs[cur];
  return <div className="aFU">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h2 style={{fontSize:18,fontWeight:700}}>Question {cur+1}/{qs.length}</h2><Badge>{q.comp}</Badge></div>
    <PBar value={cur+1} max={qs.length} style={{marginBottom:24}}/>
    <Card>
      <p style={{fontSize:16,fontWeight:600,marginBottom:20,lineHeight:1.5}}>{q.q}</p>
      {q.type==="mcq"?<div style={{display:"flex",flexDirection:"column",gap:10}}>
        {q.opts.map((o:string,i:number)=><button key={i} onClick={()=>setAns({...ans,[q.id]:i})} style={{padding:"14px 16px",borderRadius:10,textAlign:"left",border:`1.5px solid ${ans[q.id]===i?T.accent:T.border}`,background:ans[q.id]===i?T.accentGlow:"transparent",color:ans[q.id]===i?T.accent:T.text,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans'",fontWeight:ans[q.id]===i?600:400,transition:"all .2s"}}>
          <span style={{fontFamily:"'JetBrains Mono'",fontSize:12,marginRight:10,opacity:.6}}>{String.fromCharCode(65+i)}</span>{o}
        </button>)}
      </div>:<textarea rows={4} placeholder="Your answer..." style={{fontSize:14}} onChange={e=>setAns({...ans,[q.id]:e.target.value})}/>}
    </Card>
    <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
      <Btn variant="ghost" onClick={()=>setCur(Math.max(0,cur-1))} disabled={cur===0}>&larr; Previous</Btn>
      {cur<qs.length-1?<Btn onClick={()=>setCur(cur+1)}>Next &rarr;</Btn>:<Btn onClick={()=>setDone(true)}>Submit</Btn>}
    </div>
  </div>;
}
