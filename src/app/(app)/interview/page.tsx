"use client";
import React, { useState } from "react";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card, Badge, PBar } from "@/components/ui/base";

export default function InterviewPage(){
  const[started,setStarted]=useState(false);const[qi,setQi]=useState(0);const[answer,setAnswer]=useState("");const[feedback,setFeedback]=useState<any>(null);
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
      <div style={{fontSize:48,marginBottom:16}}>&#127908;</div>
      <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>{qs.length} Practice Questions</h3>
      <p style={{color:T.textSec,fontSize:14,marginBottom:24}}>Mixed technical and behavioural. Get feedback on structure, clarity, and depth.</p>
      <Btn size="lg" onClick={()=>setStarted(true)}>Start Practice &rarr;</Btn>
    </Card></div>;

  const q=qs[qi];
  return <div className="aFU">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <h2 style={{fontSize:18,fontWeight:700}}>Question {qi+1}/{qs.length}</h2>
      <Badge color={q.type==="Technical"?T.sky:q.type==="Behavioural"?T.violet:T.warm}>{q.type}</Badge>
    </div>
    <PBar value={qi+1} max={qs.length} style={{marginBottom:24}}/>
    <Card style={{marginBottom:16}}>
      <p style={{fontSize:16,fontWeight:600,lineHeight:1.5,marginBottom:12}}>{q.q}</p>
      <p style={{fontSize:12,color:T.textMut,background:T.surfaceLight,padding:10,borderRadius:8}}>&#128161; Tip: {q.tip}</p>
    </Card>
    <Card style={{marginBottom:16}}>
      <textarea rows={6} placeholder="Type your answer..." value={answer} onChange={e=>setAnswer(e.target.value)} style={{fontSize:14,marginBottom:12}}/>
      <Btn onClick={showFB} disabled={!answer.trim()}>Get Feedback</Btn>
    </Card>
    {feedback&&<Card className="aSI" style={{borderLeft:`3px solid ${T.accent}`}}>
      <h4 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Feedback</h4>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:10,marginBottom:16}}>
        {[["Structure",feedback.structure],["Clarity",feedback.clarity],["Relevance",feedback.relevance],["Depth",feedback.depth]].map(([l,v]:any)=><div key={l} style={{textAlign:"center"}}>
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
      <Btn variant="ghost" onClick={()=>{setQi(Math.max(0,qi-1));setAnswer("");setFeedback(null)}} disabled={qi===0}>&larr; Previous</Btn>
      <Btn onClick={()=>{setQi(Math.min(qs.length-1,qi+1));setAnswer("");setFeedback(null)}} disabled={qi>=qs.length-1}>Next &rarr;</Btn>
    </div>
  </div>;
}
