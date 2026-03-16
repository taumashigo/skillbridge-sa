"use client";
import React, { useState, useEffect } from "react";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card, Badge } from "@/components/ui/base";
import { Skeleton, CardSkeleton, showToast } from "@/components/ui/extras";

type Phase = "loading" | "no_job" | "ready" | "error";

export default function PortfolioPage(){
  const[phase,setPhase]=useState<Phase>("loading");
  const[projects,setProjects]=useState<any[]>([]);
  const[jobTitle,setJobTitle]=useState("");
  const[error,setError]=useState("");

  useEffect(()=>{
    const load = async () => {
      try {
        const stored = typeof window !== "undefined" ? sessionStorage.getItem("skillbridge_job") : null;
        if (!stored) { setPhase("no_job"); return; }
        const jobData = JSON.parse(stored);
        if (!jobData.id) { setPhase("no_job"); return; }

        const res = await fetch("/api/portfolio-generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: jobData.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Failed to generate portfolio briefs");

        setProjects(data.data.projects || []);
        setJobTitle(data.data.jobTitle || "");
        setPhase("ready");
      } catch (err: any) { setError(err.message); setPhase("error"); }
    };
    load();
  },[]);

  if (phase === "loading") return <div className="aFU"><Skeleton width="200px" height={28} style={{marginBottom:8}}/><Skeleton width="300px" height={14} style={{marginBottom:28}}/><CardSkeleton/><p style={{color:T.textSec,fontSize:13,marginTop:16,textAlign:"center"}}>Generating portfolio project briefs...</p></div>;
  if (phase === "no_job") return <div className="aFU"><h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Portfolio Projects</h2><Card style={{textAlign:"center",padding:40}}><div style={{fontSize:48,marginBottom:16}}>&#128188;</div><h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>No Job Analysis Found</h3><p style={{color:T.textSec,fontSize:14,marginBottom:20}}>Analyse a job post first.</p><Btn onClick={()=>window.location.href="/job-input"}>Go to Job Input &rarr;</Btn></Card></div>;
  if (phase === "error") return <div className="aFU"><h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Portfolio Projects</h2><Card style={{border:`1px solid ${T.error}`,padding:30,textAlign:"center"}}><p style={{color:T.error}}>{error}</p><Btn variant="ghost" onClick={()=>window.location.reload()}>Try Again</Btn></Card></div>;

  return <div className="aFU">
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:4}}>Portfolio Project Briefs</h2>
    <p style={{color:T.textSec,fontSize:14,marginBottom:20}}>AI-generated proof-of-skill projects for: <strong style={{color:T.accent}}>{jobTitle}</strong></p>

    {projects.map((p:any,i:number)=><Card key={i} style={{marginBottom:16}}>
      <Badge color={T.coral} style={{marginBottom:12}}>Project {i+1}</Badge>
      <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>{p.title}</h3>
      <p style={{fontSize:14,color:T.textSec,lineHeight:1.6,marginBottom:16}}>{p.description}</p>

      {p.competenciesCovered?.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
        {p.competenciesCovered.map((c:string,j:number)=><Badge key={j} color={T.sky}>{c}</Badge>)}
      </div>}

      <div style={{marginBottom:16}}>
        <p style={{fontSize:13,fontWeight:700,marginBottom:8}}>Requirements</p>
        {(p.requirements||p.acceptanceCriteria||[]).map((r:string,j:number)=><div key={j} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}>
          <span style={{color:T.accent,flexShrink:0,marginTop:2}}>{I.check}</span>
          <span style={{fontSize:13,color:T.textSec}}>{r}</span>
        </div>)}
      </div>

      {p.stackOptions&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <div style={{background:T.surfaceLight,padding:12,borderRadius:10}}>
          <p style={{fontSize:11,fontWeight:600,color:T.textMut,textTransform:"uppercase",marginBottom:4}}>Beginner Stack</p>
          <p style={{fontSize:13,color:T.text}}>{p.stackOptions.beginner}</p>
        </div>
        <div style={{background:T.surfaceLight,padding:12,borderRadius:10}}>
          <p style={{fontSize:11,fontWeight:600,color:T.textMut,textTransform:"uppercase",marginBottom:4}}>Advanced Stack</p>
          <p style={{fontSize:13,color:T.text}}>{p.stackOptions.advanced}</p>
        </div>
      </div>}

      {p.estimatedHours&&<p style={{fontSize:12,color:T.textMut,marginBottom:12}}>Estimated: ~{p.estimatedHours} hours</p>}

      {p.interviewTalkingPoints?.length>0&&<div style={{background:`${T.warm}10`,padding:14,borderRadius:10,borderLeft:`3px solid ${T.warm}`}}>
        <p style={{fontSize:12,fontWeight:600,color:T.warm,marginBottom:6}}>&#128161; Interview Talking Points</p>
        {p.interviewTalkingPoints.map((tip:string,j:number)=><p key={j} style={{fontSize:13,color:T.textSec,lineHeight:1.5,marginBottom:4}}>• {tip}</p>)}
      </div>}
    </Card>)}
  </div>;
}
