"use client";
import React, { useState, useEffect } from "react";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card, Badge, PBar, TabBar } from "@/components/ui/base";
import { Skeleton, CardSkeleton, showToast } from "@/components/ui/extras";

type Phase = "loading" | "no_job" | "ready" | "started" | "done";

export default function InterviewPage(){
  const[mainTab,setMainTab]=useState("interview");
  const[phase,setPhase]=useState<Phase>("loading");
  const[sessionId,setSessionId]=useState<string|null>(null);
  const[questions,setQuestions]=useState<any[]>([]);
  const[tips,setTips]=useState<string[]>([]);
  const[qi,setQi]=useState(0);
  const[answer,setAnswer]=useState("");
  const[feedback,setFeedback]=useState<any>(null);
  const[feedbackLoading,setFeedbackLoading]=useState(false);
  const[salary,setSalary]=useState<any>(null);
  const[salaryLoading,setSalaryLoading]=useState(false);
  const[plan,setPlan]=useState<any>(null);
  const[planLoading,setPlanLoading]=useState(false);
  const[jobId,setJobId]=useState<string|null>(null);
  const[error,setError]=useState("");

  useEffect(()=>{
    const stored = typeof window !== "undefined" ? sessionStorage.getItem("skillbridge_job") : null;
    if (!stored) { setPhase("no_job"); return; }
    const jobData = JSON.parse(stored);
    if (!jobData.id) { setPhase("no_job"); return; }
    setJobId(jobData.id);
    setPhase("ready");
  },[]);

  const startInterview = async () => {
    if (!jobId) return;
    setPhase("loading");
    try {
      const res = await fetch("/api/interview/start", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to generate questions");
      setSessionId(data.data.sessionId);
      setQuestions(data.data.questions || []);
      setTips(data.data.generalTips || []);
      setPhase("started");
    } catch (err: any) { setError(err.message); setPhase("ready"); showToast(err.message, "error"); }
  };

  const getFeedback = async () => {
    if (!sessionId || !questions[qi] || !answer.trim()) return;
    setFeedbackLoading(true);
    try {
      const res = await fetch("/api/interview/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, questionId: questions[qi].id, answer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to get feedback");
      setFeedback(data.data);
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setFeedbackLoading(false); }
  };

  const loadSalary = async (scenario: string) => {
    if (!jobId) return;
    setSalaryLoading(true);
    try {
      const res = await fetch("/api/salary-coach", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, scenario }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to load salary data");
      setSalary(data.data);
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setSalaryLoading(false); }
  };

  const loadPlan = async () => {
    if (!jobId) return;
    setPlanLoading(true);
    try {
      const res = await fetch("/api/ninety-day-plan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to generate plan");
      setPlan(data.data);
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setPlanLoading(false); }
  };

  if (phase === "no_job") return <div className="aFU"><h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Interview Prep</h2><Card style={{textAlign:"center",padding:40}}><div style={{fontSize:48,marginBottom:16}}>&#127908;</div><h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>No Job Analysis Found</h3><p style={{color:T.textSec,fontSize:14,marginBottom:20}}>Analyse a job post first.</p><Btn onClick={()=>window.location.href="/job-input"}>Go to Job Input &rarr;</Btn></Card></div>;

  return <div className="aFU">
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Interview Preparation</h2>
    <p style={{color:T.textSec,fontSize:14,marginBottom:20}}>Practice interviews, negotiate salary, and plan your first 90 days.</p>

    <TabBar tabs={[{id:"interview",label:"Mock Interview"},{id:"salary",label:"Salary Coach"},{id:"plan",label:"90-Day Plan"}]} active={mainTab} onChange={setMainTab}/>

    <div style={{marginTop:20}}>
      {/* MOCK INTERVIEW */}
      {mainTab==="interview"&&<div>
        {phase==="loading"&&<div><CardSkeleton/><p style={{color:T.textSec,fontSize:13,marginTop:16,textAlign:"center"}}>Generating interview questions...</p></div>}

        {phase==="ready"&&<Card style={{textAlign:"center",padding:40}}>
          <div style={{fontSize:48,marginBottom:16}}>&#127908;</div>
          <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>AI Mock Interview</h3>
          <p style={{color:T.textSec,fontSize:14,marginBottom:24}}>Role-specific questions with real-time AI feedback on your answers.</p>
          <Btn size="lg" onClick={startInterview}>Start Interview &rarr;</Btn>
        </Card>}

        {phase==="started"&&questions.length>0&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h3 style={{fontSize:16,fontWeight:700}}>Question {qi+1}/{questions.length}</h3>
            <Badge color={questions[qi].type==="technical"?T.sky:questions[qi].type==="behavioural"?T.violet:T.warm}>{questions[qi].type}</Badge>
          </div>
          <PBar value={qi+1} max={questions.length} style={{marginBottom:20}}/>

          <Card style={{marginBottom:16}}>
            <p style={{fontSize:16,fontWeight:600,lineHeight:1.5,marginBottom:12}}>{questions[qi].question}</p>
            {questions[qi].tip&&<p style={{fontSize:12,color:T.textMut,background:T.surfaceLight,padding:10,borderRadius:8}}>&#128161; {questions[qi].tip}</p>}
          </Card>

          <Card style={{marginBottom:16}}>
            <textarea rows={6} placeholder="Type your answer..." value={answer} onChange={e=>setAnswer(e.target.value)} style={{fontSize:14,marginBottom:12}}/>
            <Btn onClick={getFeedback} disabled={!answer.trim()||feedbackLoading}>{feedbackLoading?"Analysing...":"Get Feedback"}</Btn>
          </Card>

          {feedback&&<Card className="aSI" style={{borderLeft:`3px solid ${T.accent}`,marginBottom:16}}>
            <h4 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Feedback</h4>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:10,marginBottom:16}}>
              {Object.entries(feedback.scores||{}).map(([key,val]:any)=><div key={key} style={{textAlign:"center"}}>
                <p style={{fontSize:24,fontWeight:800,color:val.score>=7?T.success:val.score>=5?T.warm:T.coral}}>{val.score}/10</p>
                <p style={{fontSize:11,color:T.textMut,fontWeight:600,textTransform:"capitalize"}}>{key}</p>
              </div>)}
            </div>
            {feedback.strengths?.length>0&&<div style={{marginBottom:12}}><p style={{fontSize:13,fontWeight:600,color:T.success,marginBottom:6}}>Strengths</p>{feedback.strengths.map((s:string,i:number)=><p key={i} style={{fontSize:13,color:T.textSec,marginBottom:4}}>+ {s}</p>)}</div>}
            {feedback.improvements?.length>0&&<div style={{marginBottom:12}}><p style={{fontSize:13,fontWeight:600,color:T.warm,marginBottom:6}}>Improvements</p>{feedback.improvements.map((s:string,i:number)=><p key={i} style={{fontSize:13,color:T.textSec,marginBottom:4}}>- {s}</p>)}</div>}
            {feedback.hiringManagerPerspective&&<div style={{background:`${T.sky}10`,padding:12,borderRadius:8,borderLeft:`3px solid ${T.sky}`,marginBottom:12}}><p style={{fontSize:12,fontWeight:600,color:T.sky,marginBottom:4}}>Hiring Manager Perspective</p><p style={{fontSize:13,color:T.textSec,lineHeight:1.6}}>{feedback.hiringManagerPerspective}</p></div>}
            {feedback.improvedDraft&&<div style={{background:`${T.success}10`,padding:12,borderRadius:8,borderLeft:`3px solid ${T.success}`}}><p style={{fontSize:12,fontWeight:600,color:T.success,marginBottom:6}}>Improved Answer</p><p style={{fontSize:13,color:T.textSec,lineHeight:1.6}}>{feedback.improvedDraft}</p></div>}
          </Card>}

          <div style={{display:"flex",justifyContent:"space-between"}}>
            <Btn variant="ghost" onClick={()=>{setQi(Math.max(0,qi-1));setAnswer("");setFeedback(null)}} disabled={qi===0}>&larr; Previous</Btn>
            <Btn onClick={()=>{setQi(Math.min(questions.length-1,qi+1));setAnswer("");setFeedback(null)}} disabled={qi>=questions.length-1}>Next &rarr;</Btn>
          </div>
        </div>}
      </div>}

      {/* SALARY COACH */}
      {mainTab==="salary"&&<div>
        {!salary?<Card style={{textAlign:"center",padding:30}}>
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Salary Negotiation Coach</h3>
          <p style={{color:T.textSec,fontSize:13,marginBottom:20}}>Get SA-specific salary data and negotiation scripts.</p>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            {[["expectations","Salary Expectations"],["initial_offer","Initial Offer"],["counter_offer","Counter Offer"],["benefits","Benefits"]].map(([s,l])=>(
              <Btn key={s} variant="secondary" onClick={()=>loadSalary(s)} disabled={salaryLoading}>{salaryLoading?"Loading...":l}</Btn>
            ))}
          </div>
        </Card>:
        <div>
          {salary.salaryRange&&<Card style={{marginBottom:12}}>
            <h4 style={{fontSize:15,fontWeight:700,marginBottom:12}}>Salary Range for {salary.jobTitle}</h4>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:12}}>
              <div style={{textAlign:"center",padding:12,background:T.surfaceLight,borderRadius:10}}><p style={{fontSize:12,color:T.textMut}}>Minimum</p><p style={{fontSize:18,fontWeight:700,color:T.coral}}>{salary.salaryRange.minimum}</p></div>
              <div style={{textAlign:"center",padding:12,background:T.surfaceLight,borderRadius:10}}><p style={{fontSize:12,color:T.textMut}}>Midpoint</p><p style={{fontSize:18,fontWeight:700,color:T.accent}}>{salary.salaryRange.midpoint}</p></div>
              <div style={{textAlign:"center",padding:12,background:T.surfaceLight,borderRadius:10}}><p style={{fontSize:12,color:T.textMut}}>Maximum</p><p style={{fontSize:18,fontWeight:700,color:T.success}}>{salary.salaryRange.maximum}</p></div>
            </div>
            <p style={{fontSize:12,color:T.textMut}}>{salary.salaryRange.note}</p>
          </Card>}
          {salary.cityRanges&&<Card style={{marginBottom:12}}>
            <h4 style={{fontSize:15,fontWeight:700,marginBottom:10}}>By City</h4>
            {Object.entries(salary.cityRanges).map(([city,range]:any)=><div key={city} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.border}20`}}>
              <span style={{fontSize:13,color:T.textSec,textTransform:"capitalize"}}>{city.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span style={{fontSize:13,fontWeight:600}}>{range}</span>
            </div>)}
          </Card>}
          {salary.negotiationScript?.length>0&&<Card style={{marginBottom:12}}>
            <h4 style={{fontSize:15,fontWeight:700,marginBottom:10}}>Negotiation Script</h4>
            {salary.negotiationScript.map((step:string,i:number)=><div key={i} style={{display:"flex",gap:10,marginBottom:8}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:T.accent,color:T.midnight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{i+1}</div>
              <p style={{fontSize:13,color:T.textSec,lineHeight:1.5}}>{step}</p>
            </div>)}
          </Card>}
          {salary.commonPushbacks?.length>0&&<Card style={{marginBottom:12}}>
            <h4 style={{fontSize:15,fontWeight:700,marginBottom:10}}>Common Pushbacks</h4>
            {salary.commonPushbacks.map((p:any,i:number)=><div key={i} style={{marginBottom:12,padding:12,background:T.surfaceLight,borderRadius:8}}>
              <p style={{fontSize:13,fontWeight:600,color:T.coral,marginBottom:4}}>&ldquo;{p.pushback}&rdquo;</p>
              <p style={{fontSize:13,color:T.success}}>&#8594; {p.response}</p>
            </div>)}
          </Card>}
          <Btn variant="ghost" onClick={()=>setSalary(null)}>Try Different Scenario</Btn>
        </div>}
      </div>}

      {/* 90-DAY PLAN */}
      {mainTab==="plan"&&<div>
        {!plan?<Card style={{textAlign:"center",padding:30}}>
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:12}}>30-60-90 Day Plan</h3>
          <p style={{color:T.textSec,fontSize:13,marginBottom:20}}>Generate a structured first-90-days plan to present at your first meeting.</p>
          <Btn onClick={loadPlan} disabled={planLoading}>{planLoading?"Generating...":"Generate Plan"}</Btn>
        </Card>:
        <div>
          {plan.overview&&<Card style={{marginBottom:12,border:`1px solid ${T.accent}40`}}><p style={{fontSize:14,lineHeight:1.6,color:T.textSec}}>{plan.overview}</p></Card>}
          {[["days30","First 30 Days",T.accent],["days60","Days 31-60",T.sky],["days90","Days 61-90",T.violet]].map(([key,title,color]:any)=>{
            const d = plan[key];
            if (!d) return null;
            return <Card key={key} style={{marginBottom:12,borderLeft:`3px solid ${color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><h4 style={{fontSize:15,fontWeight:700}}>{title}</h4><Badge color={color}>{d.theme}</Badge></div>
              {d.goals?.length>0&&<div style={{marginBottom:10}}><p style={{fontSize:12,fontWeight:600,color:T.textMut,marginBottom:6}}>Goals</p>{d.goals.map((g:string,i:number)=><p key={i} style={{fontSize:13,color:T.textSec,marginBottom:4}}>&#8226; {g}</p>)}</div>}
              {d.quickWins?.length>0&&<div style={{marginBottom:10}}><p style={{fontSize:12,fontWeight:600,color:T.success,marginBottom:6}}>Quick Wins</p>{d.quickWins.map((w:string,i:number)=><p key={i} style={{fontSize:13,color:T.textSec,marginBottom:4}}>&#9889; {w}</p>)}</div>}
              {d.projects?.length>0&&<div style={{marginBottom:10}}><p style={{fontSize:12,fontWeight:600,color:T.sky,marginBottom:6}}>Projects</p>{d.projects.map((p:string,i:number)=><p key={i} style={{fontSize:13,color:T.textSec,marginBottom:4}}>&#8226; {p}</p>)}</div>}
              {d.initiatives?.length>0&&<div style={{marginBottom:10}}><p style={{fontSize:12,fontWeight:600,color:T.violet,marginBottom:6}}>Initiatives</p>{d.initiatives.map((ini:string,i:number)=><p key={i} style={{fontSize:13,color:T.textSec,marginBottom:4}}>&#8226; {ini}</p>)}</div>}
              {d.metrics?.length>0&&<div><p style={{fontSize:12,fontWeight:600,color:T.warm,marginBottom:6}}>Metrics</p>{d.metrics.map((m:string,i:number)=><p key={i} style={{fontSize:13,color:T.textSec,marginBottom:4}}>&#128200; {m}</p>)}</div>}
            </Card>;
          })}
          {plan.presentationTips?.length>0&&<Card><h4 style={{fontSize:15,fontWeight:700,marginBottom:10}}>Presentation Tips</h4>{plan.presentationTips.map((t:string,i:number)=><p key={i} style={{fontSize:13,color:T.textSec,marginBottom:6}}>&#128161; {t}</p>)}</Card>}
        </div>}
      </div>}
    </div>
  </div>;
}
