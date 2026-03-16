"use client";
import React, { useState, useEffect } from "react";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card, Badge, TabBar } from "@/components/ui/base";
import { Skeleton, CardSkeleton, showToast } from "@/components/ui/extras";

type Phase = "loading" | "no_job" | "ready" | "error";

export default function CVOptPage(){
  const[phase,setPhase]=useState<Phase>("loading");
  const[tab,setTab]=useState("keywords");
  const[keywords,setKeywords]=useState<any>(null);
  const[rewrites,setRewrites]=useState<any[]>([]);
  const[missing,setMissing]=useState<any[]>([]);
  const[coverLetter,setCoverLetter]=useState<any>(null);
  const[coverTone,setCoverTone]=useState("formal");
  const[coverLoading,setCoverLoading]=useState(false);
  const[linkedin,setLinkedin]=useState<any>(null);
  const[linkedinLoading,setLinkedinLoading]=useState(false);
  const[error,setError]=useState("");
  const[jobId,setJobId]=useState<string|null>(null);

  useEffect(()=>{
    const load = async () => {
      try {
        const stored = typeof window !== "undefined" ? sessionStorage.getItem("skillbridge_job") : null;
        if (!stored) { setPhase("no_job"); return; }
        const jobData = JSON.parse(stored);
        if (!jobData.id) { setPhase("no_job"); return; }
        setJobId(jobData.id);

        const res = await fetch("/api/cv-optimise", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: jobData.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Failed to optimise CV");

        setKeywords(data.data.keywordReport);
        setRewrites(data.data.bulletRewrites || []);
        setMissing(data.data.missingSections || []);
        setPhase("ready");
      } catch (err: any) { setError(err.message); setPhase("error"); }
    };
    load();
  },[]);

  const loadCoverLetter = async (tone: string) => {
    if (!jobId) return;
    setCoverLoading(true);
    setCoverTone(tone);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to generate cover letter");
      setCoverLetter(data.data);
      showToast("Cover letter generated", "success");
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setCoverLoading(false); }
  };

  const loadLinkedin = async () => {
    if (!jobId) return;
    setLinkedinLoading(true);
    try {
      const res = await fetch("/api/linkedin-optimise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to optimise LinkedIn");
      setLinkedin(data.data);
      showToast("LinkedIn profile optimised", "success");
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setLinkedinLoading(false); }
  };

  const sc: any = { found: T.success, weak: T.warm, missing: T.error };

  if (phase === "loading") return <div className="aFU"><Skeleton width="200px" height={28} style={{marginBottom:8}}/><Skeleton width="350px" height={14} style={{marginBottom:28}}/><CardSkeleton/><p style={{color:T.textSec,fontSize:13,marginTop:16,textAlign:"center"}}>Analysing your CV against the job requirements...</p></div>;
  if (phase === "no_job") return <div className="aFU"><h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>CV &amp; ATS Optimiser</h2><Card style={{textAlign:"center",padding:40}}><div style={{fontSize:48,marginBottom:16}}>&#128196;</div><h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>No Job Analysis Found</h3><p style={{color:T.textSec,fontSize:14,marginBottom:20}}>Analyse a job post first.</p><Btn onClick={()=>window.location.href="/job-input"}>Go to Job Input &rarr;</Btn></Card></div>;
  if (phase === "error") return <div className="aFU"><h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>CV &amp; ATS Optimiser</h2><Card style={{border:`1px solid ${T.error}`,padding:30,textAlign:"center"}}><p style={{color:T.error}}>{error}</p><Btn variant="ghost" onClick={()=>window.location.reload()}>Try Again</Btn></Card></div>;

  return <div className="aFU">
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>CV &amp; ATS Optimiser</h2>
    <p style={{color:T.textSec,fontSize:14,marginBottom:20}}>AI-powered keyword analysis, bullet rewrites, cover letters, and LinkedIn optimisation.</p>
    <TabBar tabs={[{id:"keywords",label:"Keywords"},{id:"rewrites",label:"Rewrites"},{id:"cover",label:"Cover Letter"},{id:"linkedin",label:"LinkedIn"}]} active={tab} onChange={setTab}/>

    <div style={{marginTop:20}}>
      {/* Keywords */}
      {tab==="keywords"&&keywords&&<Card>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><h3 style={{fontSize:16,fontWeight:700}}>Keyword Coverage</h3><Badge>{keywords.coveragePercent || 0}%</Badge></div>
        {[...(keywords.found||[]).map((k:any)=>({...k,status:"found"})),...(keywords.weak||[]).map((k:any)=>({...k,status:"weak"})),...(keywords.missing||[]).map((k:any)=>({...k,status:"missing"}))].map((k:any,i:number)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:T.surfaceLight,borderRadius:10,borderLeft:`3px solid ${sc[k.status]}`,marginBottom:8}}>
            <div style={{flex:1}}><p style={{fontSize:14,fontWeight:600}}>{k.keyword}</p><p style={{fontSize:12,color:T.textSec,marginTop:2}}>{k.signal}</p></div>
            <Badge color={sc[k.status]}>{k.status}</Badge>
          </div>
        ))}
      </Card>}

      {/* Rewrites */}
      {tab==="rewrites"&&<div>
        {rewrites.length===0?<Card style={{textAlign:"center",padding:30}}><p style={{color:T.textMut}}>No bullet rewrites generated.</p></Card>:
        rewrites.map((r:any,i:number)=><Card key={i} style={{marginBottom:16}}>
          <p style={{fontSize:12,fontWeight:600,color:T.textMut,textTransform:"uppercase",marginBottom:6}}>Original</p>
          <p style={{fontSize:14,color:T.coral,fontStyle:"italic",padding:"10px 14px",background:`${T.coral}10`,borderRadius:8,borderLeft:`3px solid ${T.coral}`,marginBottom:12}}>{r.original}</p>
          <p style={{fontSize:12,fontWeight:600,color:T.textMut,textTransform:"uppercase",marginBottom:6}}>Improved</p>
          <p style={{fontSize:14,color:T.success,padding:"10px 14px",background:`${T.success}10`,borderRadius:8,borderLeft:`3px solid ${T.success}`,lineHeight:1.5,marginBottom:12}}>{r.improved}</p>
          <p style={{fontSize:12,color:T.textSec,background:T.surfaceLight,padding:10,borderRadius:8}}><strong style={{color:T.accent}}>Method:</strong> {r.method}</p>
          {r.keywordsAdded?.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:8}}>{r.keywordsAdded.map((k:string,j:number)=><Badge key={j} color={T.sky}>{k}</Badge>)}</div>}
        </Card>)}
        {missing.length>0&&<Card style={{marginTop:16}}><h4 style={{fontSize:15,fontWeight:700,marginBottom:12}}>Missing Sections</h4>
          {missing.map((m:any,i:number)=><div key={i} style={{padding:10,background:T.surfaceLight,borderRadius:8,borderLeft:`3px solid ${T.warm}`,marginBottom:8}}>
            <p style={{fontSize:14,fontWeight:600}}>{m.section}</p>
            <p style={{fontSize:12,color:T.textSec,marginTop:4}}>{m.whyItMatters}</p>
            <p style={{fontSize:12,color:T.warm,marginTop:4}}>{m.suggestion}</p>
          </div>)}
        </Card>}
      </div>}

      {/* Cover Letter */}
      {tab==="cover"&&<div>
        {!coverLetter?<Card style={{textAlign:"center",padding:30}}>
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Generate a Cover Letter</h3>
          <p style={{color:T.textSec,fontSize:13,marginBottom:20}}>Choose a tone for your cover letter:</p>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            {[["formal","Formal (Corporate)"],["conversational","Conversational (Startup)"],["bold","Bold (Creative)"]].map(([t,l])=>(
              <Btn key={t} variant={coverTone===t?"primary":"secondary"} onClick={()=>loadCoverLetter(t)} disabled={coverLoading}>
                {coverLoading&&coverTone===t?"Generating...":l}
              </Btn>
            ))}
          </div>
        </Card>:
        <div>
          <Card style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
              <Badge color={T.accent}>{coverLetter.tone} tone</Badge>
              <Btn variant="ghost" size="sm" onClick={()=>setCoverLetter(null)}>Generate New</Btn>
            </div>
            {coverLetter.subject&&<p style={{fontSize:13,color:T.textMut,marginBottom:12}}>Subject: <strong style={{color:T.text}}>{coverLetter.subject}</strong></p>}
            <div style={{fontSize:14,lineHeight:1.8,whiteSpace:"pre-wrap",color:T.textSec}}>{coverLetter.coverLetter}</div>
          </Card>
          <Btn size="sm" icon={I.dl} onClick={()=>{navigator.clipboard.writeText(coverLetter.coverLetter);showToast("Copied to clipboard","success")}}>Copy to Clipboard</Btn>
        </div>}
      </div>}

      {/* LinkedIn */}
      {tab==="linkedin"&&<div>
        {!linkedin?<Card style={{textAlign:"center",padding:30}}>
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:12}}>LinkedIn Profile Optimiser</h3>
          <p style={{color:T.textSec,fontSize:13,marginBottom:20}}>AI will analyse your CV and generate optimised LinkedIn content.</p>
          <Btn onClick={loadLinkedin} disabled={linkedinLoading}>{linkedinLoading?"Analysing...":"Optimise My Profile"}</Btn>
        </Card>:
        <div>
          {linkedin.headline&&<Card style={{marginBottom:12}}>
            <h4 style={{fontSize:15,fontWeight:700,marginBottom:10}}>Headline</h4>
            {linkedin.headline.current&&<div style={{marginBottom:8}}><p style={{fontSize:12,color:T.textMut,marginBottom:4}}>Current (estimated)</p><p style={{fontSize:14,color:T.coral,padding:"8px 12px",background:`${T.coral}10`,borderRadius:8}}>{linkedin.headline.current}</p></div>}
            <p style={{fontSize:12,color:T.textMut,marginBottom:4}}>Optimised</p>
            <p style={{fontSize:14,color:T.success,padding:"8px 12px",background:`${T.success}10`,borderRadius:8}}>{linkedin.headline.optimised}</p>
          </Card>}
          {linkedin.summary&&<Card style={{marginBottom:12}}>
            <h4 style={{fontSize:15,fontWeight:700,marginBottom:10}}>About Section</h4>
            <p style={{fontSize:14,lineHeight:1.7,color:T.textSec,whiteSpace:"pre-wrap"}}>{linkedin.summary.optimised}</p>
            <Btn size="sm" variant="ghost" icon={I.dl} style={{marginTop:8}} onClick={()=>{navigator.clipboard.writeText(linkedin.summary.optimised);showToast("Copied","success")}}>Copy</Btn>
          </Card>}
          {linkedin.profileStrength&&<Card style={{marginBottom:12}}>
            <h4 style={{fontSize:15,fontWeight:700,marginBottom:10}}>Profile Strength</h4>
            <p style={{fontSize:36,fontWeight:800,color:linkedin.profileStrength.score>=70?T.success:T.warm}}>{linkedin.profileStrength.score}/100</p>
            {linkedin.profileStrength.improvements?.map((imp:string,i:number)=><p key={i} style={{fontSize:13,color:T.textSec,marginTop:6}}>• {imp}</p>)}
          </Card>}
          {linkedin.contentPlan?.length>0&&<Card>
            <h4 style={{fontSize:15,fontWeight:700,marginBottom:10}}>30-Day Content Plan</h4>
            {linkedin.contentPlan.map((p:any,i:number)=><div key={i} style={{padding:10,background:T.surfaceLight,borderRadius:8,marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><Badge>Week {p.week}</Badge></div>
              <p style={{fontSize:13,fontWeight:600,marginBottom:4}}>{p.postTopic}</p>
              <p style={{fontSize:12,color:T.textSec,lineHeight:1.5}}>{p.postTemplate}</p>
            </div>)}
          </Card>}
        </div>}
      </div>}
    </div>
  </div>;
}
