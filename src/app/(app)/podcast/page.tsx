"use client";
import React, { useState, useEffect, useRef } from "react";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card, Badge, Modal } from "@/components/ui/base";
import { Skeleton, showToast } from "@/components/ui/extras";

export default function PodcastPage(){
  const[phase,setPhase]=useState<"loading"|"no_job"|"generating"|"ready"|"error">("loading");
  const[episodeId,setEpisodeId]=useState<string|null>(null);
  const[title,setTitle]=useState("");
  const[turns,setTurns]=useState<any[]>([]);
  const[curT,setCurT]=useState(0);
  const[playing,setPlaying]=useState(false);
  const[showRedir,setShowRedir]=useState(false);
  const[rText,setRText]=useState("");
  const[redirLoading,setRedirLoading]=useState(false);
  const[bmarks,setBmarks]=useState<number[]>([]);
  const tRef=useRef<HTMLDivElement>(null);

  const sCol:any={Moderator:T.accent,"Hiring Manager":T.warm,"Domain Expert":T.violet,"User Avatar":T.sky};
  const sEmoji:any={Moderator:"\ud83c\udfa9","Hiring Manager":"\ud83d\udcbc","Domain Expert":"\ud83c\udf93","User Avatar":"\ud83d\udc64"};

  useEffect(()=>{
    const stored = typeof window !== "undefined" ? sessionStorage.getItem("skillbridge_job") : null;
    if (!stored) { setPhase("no_job"); return; }
    const jobData = JSON.parse(stored);
    if (!jobData.id) { setPhase("no_job"); return; }
    generatePodcast(jobData.id);
  },[]);

  const generatePodcast = async (jobId: string) => {
    setPhase("generating");
    try {
      const res = await fetch("/api/podcast/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to create podcast");
      setEpisodeId(data.data.id);
      setTitle(data.data.title);
      setTurns(data.data.turns || []);
      setPhase("ready");
    } catch (err: any) { showToast(err.message, "error"); setPhase("error"); }
  };

  useEffect(()=>{
    if(playing&&curT<turns.length-1){
      const t=setTimeout(()=>setCurT(c=>c+1),3000);
      return()=>clearTimeout(t);
    }
    if(curT>=turns.length-1) setPlaying(false);
  },[playing,curT,turns.length]);

  useEffect(()=>{if(tRef.current)tRef.current.scrollTop=tRef.current.scrollHeight},[curT]);

  const doRedir = async () => {
    if(!rText.trim()||!episodeId) return;
    setRedirLoading(true);
    try {
      const res = await fetch("/api/podcast/redirect", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodeId, redirectText: rText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to redirect");
      setTurns(t=>[...t,...(data.data.newTurns||[])]);
      setCurT(turns.length);
      setRText("");
      setShowRedir(false);
      setPlaying(true);
      showToast("Panel redirected!", "success");
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setRedirLoading(false); }
  };

  if (phase==="loading"||phase==="generating") return <div className="aFU">
    <Skeleton width="200px" height={28} style={{marginBottom:8}}/>
    <Skeleton width="300px" height={14} style={{marginBottom:28}}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
      {[1,2,3,4].map(i=><Skeleton key={i} height={80} borderRadius={12}/>)}
    </div>
    <Skeleton height={300} borderRadius={14}/>
    <p style={{color:T.textSec,fontSize:13,marginTop:16,textAlign:"center"}}>Generating AI panel discussion...</p>
  </div>;

  if (phase==="no_job") return <div className="aFU"><h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Panel Podcast</h2><Card style={{textAlign:"center",padding:40}}><div style={{fontSize:48,marginBottom:16}}>&#127897;</div><h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>No Job Analysis Found</h3><p style={{color:T.textSec,fontSize:14,marginBottom:20}}>Analyse a job post first.</p><Btn onClick={()=>window.location.href="/job-input"}>Go to Job Input &rarr;</Btn></Card></div>;

  if (phase==="error") return <div className="aFU"><h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Panel Podcast</h2><Card style={{border:`1px solid ${T.error}`,padding:30,textAlign:"center"}}><p style={{color:T.error}}>Failed to generate podcast.</p><Btn variant="ghost" onClick={()=>window.location.reload()}>Try Again</Btn></Card></div>;

  return <div className="aFU">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
      <div><h2 style={{fontSize:22,fontWeight:800,marginBottom:4}}>{title||"Panel Podcast"}</h2><p style={{color:T.textSec,fontSize:14}}>{turns.length} turns &middot; AI-generated panel</p></div>
      <Btn variant="secondary" size="sm" icon={I.dl} onClick={()=>{
        const text = turns.map(t=>`${t.name}: ${t.content}`).join("\n\n");
        navigator.clipboard.writeText(text);
        showToast("Transcript copied","success");
      }}>Copy Transcript</Btn>
    </div>

    {/* Speaker cards */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:20}}>
      {Object.keys(sCol).map(role=>{const active=turns[curT]?.speaker===role;return <div key={role} style={{padding:"14px 12px",borderRadius:12,textAlign:"center",background:active?`${sCol[role]}15`:T.surface,border:`1.5px solid ${active?sCol[role]:T.border}`,transition:"all .3s"}}>
        <div style={{fontSize:24,marginBottom:6}}>{sEmoji[role]}</div>
        <p style={{fontSize:12,fontWeight:700,color:active?sCol[role]:T.text}}>{turns[curT]?.speaker===role?turns[curT]?.name:role==="Moderator"?"Thandiwe":role==="Hiring Manager"?"Sipho":role==="Domain Expert"?"Dr Aisha":"You"}</p>
        <p style={{fontSize:10,color:T.textMut}}>{role}</p>
        {active&&<div style={{width:8,height:8,borderRadius:"50%",background:sCol[role],margin:"6px auto 0"}} className="aP"/>}
      </div>})}
    </div>

    {/* Transcript */}
    <Card style={{marginBottom:16}}>
      <div ref={tRef} style={{maxHeight:400,overflowY:"auto",paddingRight:8}}>
        {turns.slice(0,curT+1).map((t:any,i:number)=><div key={i} className={i===curT?"aFU":""} style={{padding:"14px 0",borderBottom:i<curT?`1px solid ${T.border}20`:"none"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>{sEmoji[t.speaker]||"\ud83d\udc64"}</span>
              <span style={{fontSize:13,fontWeight:700,color:sCol[t.speaker]||T.text}}>{t.name}</span>
              {t.isRedirect&&<Badge color={T.coral} style={{fontSize:9}}>Redirect</Badge>}
            </div>
            <button onClick={()=>setBmarks(b=>[...b,i])} style={{background:"none",border:"none",cursor:"pointer",color:bmarks.includes(i)?T.warm:T.textMut,display:"flex"}}>{I.bmark}</button>
          </div>
          <p style={{fontSize:14,lineHeight:1.7,paddingLeft:28}}>{t.content}</p>
          {t.chapter&&t.chapter!==(turns as any)[i-1]?.chapter&&<span style={{fontSize:10,color:T.textMut,paddingLeft:28,fontWeight:600,textTransform:"uppercase",letterSpacing:".08em"}}>Ch: {t.chapter}</span>}
        </div>)}
      </div>
    </Card>

    {/* Controls */}
    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
      <Btn onClick={()=>setPlaying(!playing)} icon={playing?I.pause:I.play}>{playing?"Pause":"Play"}</Btn>
      <Btn variant="warm" icon={I.redirect} onClick={()=>setShowRedir(true)}>Redirect Discussion</Btn>
    </div>

    <Modal open={showRedir} onClose={()=>setShowRedir(false)} title="Redirect the Discussion">
      <p style={{fontSize:14,color:T.textSec,marginBottom:16,lineHeight:1.5}}>Tell the panel what to focus on. They&apos;ll adapt.</p>
      <textarea rows={3} placeholder='e.g. "Give examples of SQL window functions"' value={rText} onChange={e=>setRText(e.target.value)} style={{marginBottom:12}}/>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {["Slow down & simplify","Give real examples","Focus on interview tips","Explain for beginners"].map(s=><button key={s} onClick={()=>setRText(s)} style={{padding:"6px 12px",borderRadius:8,background:T.surfaceLight,border:`1px solid ${T.border}`,color:T.textSec,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans'"}}>{s}</button>)}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end"}}><Btn onClick={doRedir} disabled={!rText.trim()||redirLoading}>{redirLoading?"Redirecting...":"Send \u2192"}</Btn></div>
    </Modal>
  </div>;
}
