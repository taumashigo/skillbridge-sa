"use client";
import React, { useState, useEffect } from "react";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card, Badge, TabBar } from "@/components/ui/base";
import { Skeleton, CardSkeleton, showToast } from "@/components/ui/extras";

type Phase = "loading" | "no_job" | "ready" | "error";

export default function LearningPage(){
  const[phase,setPhase]=useState<Phase>("loading");
  const[tab,setTab]=useState("plan");
  const[saved,setSaved]=useState<string[]>([]);
  const[plan,setPlan]=useState<any>(null);
  const[resources,setResources]=useState<any[]>([]);
  const[institutions,setInstitutions]=useState<any[]>([]);
  const[jobTitle,setJobTitle]=useState("");
  const[error,setError]=useState("");

  useEffect(()=>{
    const loadLearning = async () => {
      try {
        const stored = typeof window !== "undefined" ? sessionStorage.getItem("skillbridge_job") : null;
        if (!stored) { setPhase("no_job"); return; }
        const jobData = JSON.parse(stored);
        if (!jobData.id) { setPhase("no_job"); return; }

        const res = await fetch("/api/learning/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: jobData.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Failed to generate learning plan");

        setPlan(data.data.learningPlan);
        setResources(data.data.resources || []);
        setInstitutions(data.data.institutions || []);
        setJobTitle(data.data.jobTitle || "");
        setPhase("ready");
      } catch (err: any) {
        setError(err.message);
        setPhase("error");
      }
    };
    loadLearning();
  },[]);

  // Loading
  if (phase === "loading") return <div className="aFU">
    <Skeleton width="200px" height={28} style={{marginBottom:8}}/>
    <Skeleton width="350px" height={14} style={{marginBottom:28}}/>
    <CardSkeleton/>
    <p style={{color:T.textSec,fontSize:13,marginTop:16,textAlign:"center"}}>Generating your personalised learning plan...</p>
  </div>;

  // No job
  if (phase === "no_job") return <div className="aFU">
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Learning Library</h2>
    <Card style={{textAlign:"center",padding:40}}>
      <div style={{fontSize:48,marginBottom:16}}>&#128218;</div>
      <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>No Job Analysis Found</h3>
      <p style={{color:T.textSec,fontSize:14,marginBottom:20}}>Analyse a job post first so we can create a personalised learning plan.</p>
      <Btn onClick={()=>window.location.href="/job-input"}>Go to Job Input &rarr;</Btn>
    </Card>
  </div>;

  // Error
  if (phase === "error") return <div className="aFU">
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Learning Library</h2>
    <Card style={{textAlign:"center",padding:40,border:`1px solid ${T.error}`}}>
      <p style={{color:T.error,fontSize:14,marginBottom:12}}>{error}</p>
      <Btn variant="ghost" onClick={()=>window.location.reload()}>Try Again</Btn>
    </Card>
  </div>;

  return <div className="aFU">
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:4}}>Learning Library</h2>
    <p style={{color:T.textSec,fontSize:14,marginBottom:20}}>Personalised plan for: <strong style={{color:T.accent}}>{jobTitle}</strong></p>

    <TabBar tabs={[
      {id:"plan",label:"Weekly Plan"},
      {id:"resources",label:`Resources (${resources.length})`},
      {id:"institutions",label:`Institutions (${institutions.length})`},
      {id:"saved",label:`Saved (${saved.length})`},
    ]} active={tab} onChange={setTab}/>

    <div style={{marginTop:20}}>
      {/* Weekly Plan */}
      {tab==="plan"&&plan&&<div>
        {plan.summary && <Card style={{marginBottom:16,border:`1px solid ${T.accent}40`}}>
          <p style={{fontSize:14,lineHeight:1.6,color:T.textSec}}>{plan.summary}</p>
        </Card>}
        {plan.weeklySchedule?.map((week:any,i:number)=>(
          <Card key={i} style={{marginBottom:12}} className="aSR">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <Badge color={T.accent}>Week {week.week}</Badge>
              <span style={{fontSize:12,color:T.textMut}}>~{week.hoursEstimate}h</span>
            </div>
            <h4 style={{fontSize:15,fontWeight:700,marginBottom:8}}>{week.focus}</h4>
            <div style={{marginBottom:10}}>
              {week.tasks?.map((task:string,j:number)=>(
                <div key={j} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}>
                  <span style={{color:T.accent,flexShrink:0,marginTop:2}}>{I.check}</span>
                  <span style={{fontSize:13,color:T.textSec}}>{task}</span>
                </div>
              ))}
            </div>
            <div style={{background:T.surfaceLight,padding:10,borderRadius:8}}>
              <p style={{fontSize:12,color:T.textMut}}>
                <strong style={{color:T.warm}}>Milestone:</strong> {week.milestone}
              </p>
            </div>
          </Card>
        ))}
        {(!plan.weeklySchedule || plan.weeklySchedule.length === 0) && (
          <Card style={{textAlign:"center",padding:30}}>
            <p style={{color:T.textMut}}>No weekly schedule generated. Try analysing a different job post.</p>
          </Card>
        )}
      </div>}

      {/* Resources */}
      {tab==="resources"&&<div>
        {resources.length === 0 ? (
          <Card style={{textAlign:"center",padding:30}}><p style={{color:T.textMut}}>No resources generated yet.</p></Card>
        ) : resources.map((r:any,i:number)=>(
          <Card key={i} hover style={{marginBottom:12}} className="aSR">
            <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
              <Badge color={T.sky}>{r.type}</Badge>
              <Badge color={T.violet}>{r.difficulty}</Badge>
              <Badge>{r.competency}</Badge>
              {r.cost === "free" && <Badge color={T.success}>Free</Badge>}
            </div>
            <h4 style={{fontSize:15,fontWeight:700,marginBottom:4}}>{r.title}</h4>
            <p style={{fontSize:13,color:T.textMut,marginBottom:6}}>{r.provider} &middot; ~{r.estimatedHours}h{r.cost && r.cost !== "free" ? ` \u00b7 ${r.cost}` : ""}</p>
            <p style={{fontSize:13,color:T.textSec,lineHeight:1.5,background:T.surfaceLight,padding:"8px 12px",borderRadius:8,marginBottom:8}}>
              <strong style={{color:T.accent}}>Why:</strong> {r.whyRecommended}
            </p>
            {r.qualityNote && <p style={{fontSize:12,color:T.textMut,fontStyle:"italic",marginBottom:8}}>{r.qualityNote}</p>}
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <Btn variant="ghost" size="sm" icon={I.bmark}
                onClick={()=>setSaved(s=>s.includes(r.title)?s.filter((x:string)=>x!==r.title):[...s,r.title])}
                style={{color:saved.includes(r.title)?T.warm:T.textMut}}>
                {saved.includes(r.title)?"Saved":"Save"}
              </Btn>
              {r.url && r.url !== "#" && !r.url.startsWith("search:") && (
                <Btn variant="secondary" size="sm" icon={I.ext} onClick={()=>window.open(r.url,"_blank")}>Open</Btn>
              )}
              {r.offlineFriendly && <Badge color={T.success} style={{fontSize:10}}>Offline OK</Badge>}
            </div>
          </Card>
        ))}
      </div>}

      {/* Institutions */}
      {tab==="institutions"&&<div>
        {institutions.length === 0 ? (
          <Card style={{textAlign:"center",padding:30}}><p style={{color:T.textMut}}>No institutions recommended yet.</p></Card>
        ) : institutions.map((inst:any,i:number)=>(
          <Card key={i} hover style={{marginBottom:12}} className="aSR">
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              <Badge color={T.warm}>{inst.category}</Badge>
              {inst.region === "south_africa" && <Badge color={T.success}>{"\ud83c\uddff\ud83c\udde6"} SA-Based</Badge>}
            </div>
            <h4 style={{fontSize:15,fontWeight:700,marginBottom:4}}>{inst.name}</h4>
            <p style={{fontSize:13,color:T.textSec,lineHeight:1.5,marginBottom:8}}>{inst.description}</p>
            <p style={{fontSize:13,marginBottom:6}}><strong style={{color:T.textMut}}>Best for:</strong> {inst.bestFor}</p>
            {inst.typicalOfferings && <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
              {inst.typicalOfferings.map((o:string,j:number)=>(
                <span key={j} style={{fontSize:11,padding:"3px 8px",background:T.surfaceLight,borderRadius:6,color:T.textSec}}>{o}</span>
              ))}
            </div>}
            {inst.recognition && <p style={{fontSize:12,color:T.textMut,fontStyle:"italic",marginBottom:8}}>{I.sparkle} {inst.recognition}</p>}
            {inst.costRange && <p style={{fontSize:12,color:T.textMut,marginBottom:8}}>Cost: {inst.costRange}</p>}
            {inst.relevanceNote && <p style={{fontSize:12,color:T.accent,background:T.accentGlow2,padding:8,borderRadius:6,marginBottom:8}}>{inst.relevanceNote}</p>}
            {inst.url && <Btn variant="secondary" size="sm" icon={I.ext} onClick={()=>window.open(inst.url,"_blank")}>Visit Website</Btn>}
          </Card>
        ))}
      </div>}

      {/* Saved */}
      {tab==="saved"&&(saved.length===0?
        <Card style={{textAlign:"center",padding:40}}><p style={{color:T.textMut}}>No saved resources yet. Browse Resources and click Save.</p></Card>:
        <div>
          {resources.filter((r:any)=>saved.includes(r.title)).map((r:any,i:number)=>(
            <Card key={i} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <h4 style={{fontSize:14,fontWeight:700}}>{r.title}</h4>
                  <p style={{fontSize:12,color:T.textMut}}>{r.provider} &middot; {r.competency} &middot; ~{r.estimatedHours}h</p>
                </div>
                <Btn variant="ghost" size="sm" onClick={()=>setSaved(s=>s.filter(x=>x!==r.title))} style={{color:T.coral}}>Remove</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  </div>;
}
