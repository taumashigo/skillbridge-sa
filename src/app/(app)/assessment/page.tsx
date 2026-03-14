"use client";
import React, { useState, useEffect } from "react";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card, Badge, PBar } from "@/components/ui/base";
import { showToast } from "@/components/ui/extras";
import { Skeleton, CardSkeleton } from "@/components/ui/extras";

type Phase = "loading" | "no_job" | "ready" | "started" | "submitting" | "done";

export default function AssessmentPage(){
  const[phase,setPhase]=useState<Phase>("loading");
  const[assessmentId,setAssessmentId]=useState<string|null>(null);
  const[questions,setQuestions]=useState<any[]>([]);
  const[estimatedMinutes,setEstimatedMinutes]=useState(15);
  const[cur,setCur]=useState(0);
  const[ans,setAns]=useState<any>({});
  const[results,setResults]=useState<any>(null);
  const[error,setError]=useState("");

  // Load job data from sessionStorage and generate assessment
  useEffect(()=>{
    const loadAssessment = async () => {
      try {
        const stored = typeof window !== "undefined" ? sessionStorage.getItem("skillbridge_job") : null;
        if (!stored) {
          setPhase("no_job");
          return;
        }
        const jobData = JSON.parse(stored);
        if (!jobData.id) {
          setPhase("no_job");
          return;
        }

        // Generate assessment from AI
        const res = await fetch("/api/assessment/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: jobData.id }),
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error?.message || "Failed to generate assessment");

        setAssessmentId(data.data.id);
        setQuestions(data.data.questions || []);
        setEstimatedMinutes(data.data.estimatedMinutes || 15);
        setPhase("ready");
      } catch (err: any) {
        setError(err.message);
        setPhase("no_job");
      }
    };
    loadAssessment();
  },[]);

  const handleSubmit = async () => {
    if (!assessmentId) return;
    setPhase("submitting");

    try {
      const res = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, answers: ans }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to submit assessment");

      setResults(data.data);
      setPhase("done");
      showToast(`Assessment complete: ${data.data.overallScore}%`, data.data.overallScore >= 70 ? "success" : "info");
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, "error");
      setPhase("started"); // Let them try submitting again
    }
  };

  // Loading state
  if (phase === "loading") return <div className="aFU">
    <Skeleton width="200px" height={28} style={{marginBottom:8}}/>
    <Skeleton width="300px" height={14} style={{marginBottom:28}}/>
    <CardSkeleton />
    <p style={{color:T.textSec,fontSize:13,marginTop:16,textAlign:"center"}}>Generating AI-powered assessment questions...</p>
  </div>;

  // No job analysed yet
  if (phase === "no_job") return <div className="aFU">
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Skills Assessment</h2>
    <p style={{color:T.textSec,fontSize:14,marginBottom:24}}>You need to analyse a job post first before taking an assessment.</p>
    <Card style={{textAlign:"center",padding:40}}>
      <div style={{fontSize:48,marginBottom:16}}>&#128203;</div>
      <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>No Job Analysis Found</h3>
      <p style={{color:T.textSec,fontSize:14,marginBottom:20}}>
        {error || "Go to Job Input, upload your CV and a job description, then come back here."}
      </p>
      <Btn onClick={()=>window.location.href="/job-input"}>Go to Job Input &rarr;</Btn>
    </Card>
  </div>;

  // Results view
  if (phase === "done" && results) {
    const s = results.overallScore;
    return <div className="aFU">
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:20}}>Assessment Results</h2>
      <Card className="aGlow" style={{textAlign:"center",marginBottom:20}}>
        <p style={{fontSize:12,fontWeight:600,color:T.textMut,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Overall Score</p>
        <p style={{fontSize:56,fontWeight:800,color:s>=70?T.success:s>=40?T.warm:T.coral}}>{s}%</p>
        <p style={{color:T.textSec,fontSize:14,marginTop:8}}>
          {s>=70?"Strong foundation \u2013 focus on advanced topics.":s>=40?"Good start \u2013 targeted study will close gaps.":"Significant gaps \u2013 a structured plan will help."}
        </p>
        <p style={{fontSize:13,color:T.textMut,marginTop:8}}>
          {results.earnedPoints}/{results.totalPoints} points earned
        </p>
      </Card>

      {results.results?.filter((r:any) => r.type === "mcq").map((r:any,i:number) => (
        <Card key={i} style={{borderLeft:`3px solid ${r.correct?T.success:T.error}`,marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <Badge color={r.correct?T.success:T.error}>{r.correct?"Correct":"Incorrect"}</Badge>
            <Badge>{r.difficulty || "medium"}</Badge>
          </div>
          <p style={{fontSize:14,fontWeight:600,marginBottom:8}}>{r.question}</p>
          <p style={{fontSize:13,color:T.textSec,lineHeight:1.5,background:T.surfaceLight,padding:12,borderRadius:8,marginBottom:8}}>{r.explanation}</p>
          {!r.correct && r.whatToStudy && (
            <p style={{fontSize:12,color:T.warm,background:`${T.warm}10`,padding:10,borderRadius:8}}>
              <strong>Study:</strong> {r.whatToStudy}
            </p>
          )}
        </Card>
      ))}
    </div>;
  }

  // Ready to start
  if (phase === "ready") return <div className="aFU">
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Skills Assessment</h2>
    <p style={{color:T.textSec,fontSize:14,marginBottom:24}}>AI-generated questions based on your target role&apos;s competency requirements.</p>
    <Card style={{textAlign:"center",padding:40}}>
      <div style={{fontSize:48,marginBottom:16}}>&#128269;</div>
      <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>{questions.length} Questions</h3>
      <p style={{color:T.textSec,fontSize:14,marginBottom:8}}>Mixed question types tailored to your skill gaps.</p>
      <p style={{color:T.textMut,fontSize:13,marginBottom:24}}>~{estimatedMinutes} minutes estimated</p>
      <Btn size="lg" onClick={()=>setPhase("started")}>Begin Assessment &rarr;</Btn>
    </Card>
  </div>;

  // Question view
  const q = questions[cur];
  if (!q) return null;

  return <div className="aFU">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <h2 style={{fontSize:18,fontWeight:700}}>Question {cur+1}/{questions.length}</h2>
      <div style={{display:"flex",gap:6}}>
        <Badge color={q.difficulty==="advanced"?T.coral:q.difficulty==="basic"?T.success:T.warm}>{q.difficulty}</Badge>
        <Badge>{q.type}</Badge>
      </div>
    </div>
    <PBar value={cur+1} max={questions.length} style={{marginBottom:24}}/>

    <Card>
      <p style={{fontSize:16,fontWeight:600,marginBottom:20,lineHeight:1.5}}>{q.question}</p>
      {q.type==="mcq" && q.options ? <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {q.options.map((o:string,i:number)=><button key={i} onClick={()=>setAns({...ans,[q.id]:i})} style={{
          padding:"14px 16px",borderRadius:10,textAlign:"left",
          border:`1.5px solid ${ans[q.id]===i?T.accent:T.border}`,
          background:ans[q.id]===i?T.accentGlow:"transparent",
          color:ans[q.id]===i?T.accent:T.text,fontSize:14,cursor:"pointer",
          fontFamily:"'DM Sans'",fontWeight:ans[q.id]===i?600:400,transition:"all .2s"
        }}>
          <span style={{fontFamily:"'JetBrains Mono'",fontSize:12,marginRight:10,opacity:.6}}>{String.fromCharCode(65+i)}</span>{o}
        </button>)}
      </div> : <textarea rows={4} placeholder="Type your answer..." style={{fontSize:14}}
        value={ans[q.id] || ""} onChange={e=>setAns({...ans,[q.id]:e.target.value})}/>}
    </Card>

    <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
      <Btn variant="ghost" onClick={()=>setCur(Math.max(0,cur-1))} disabled={cur===0}>&larr; Previous</Btn>
      {cur < questions.length - 1 ?
        <Btn onClick={()=>setCur(cur+1)}>Next &rarr;</Btn> :
        <Btn onClick={handleSubmit} disabled={phase==="submitting"}>
          {phase==="submitting" ? "Submitting..." : "Submit Assessment"}
        </Btn>
      }
    </div>
  </div>;
}
