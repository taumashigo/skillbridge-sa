"use client";
import React, { useState, useEffect, useRef } from "react";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card, Badge, Modal } from "@/components/ui/base";
import { PODCAST_TURNS } from "@/lib/data/mock";

export default function PodcastPage(){
  const[playing,setPlaying]=useState(false);const[curT,setCurT]=useState(0);const[showRedir,setShowRedir]=useState(false);const[rText,setRText]=useState("");
  const[turns,setTurns]=useState(PODCAST_TURNS);const[bmarks,setBmarks]=useState<number[]>([]);
  const tRef=useRef<HTMLDivElement>(null);
  const sCol:any={Moderator:T.accent,"Hiring Manager":T.warm,"Domain Expert":T.violet,"User Avatar":T.sky};
  const sEmoji:any={Moderator:"\ud83c\udfa9","Hiring Manager":"\ud83d\udcbc","Domain Expert":"\ud83c\udf93","User Avatar":"\ud83d\udc64"};
  const sName:any={Moderator:"Thandiwe","Hiring Manager":"Sipho","Domain Expert":"Dr Aisha","User Avatar":"You"};

  useEffect(()=>{if(playing&&curT<turns.length-1){const t=setTimeout(()=>setCurT(c=>c+1),3000);return()=>clearTimeout(t)}if(curT>=turns.length-1)setPlaying(false)},[playing,curT,turns.length]);
  useEffect(()=>{if(tRef.current)tRef.current.scrollTop=tRef.current.scrollHeight},[curT]);

  const doRedir=()=>{if(!rText.trim())return;
    setTurns((t:any)=>[...t,
      {speaker:"User Avatar",name:"You",content:rText,ch:"Your Question",isRedir:true},
      {speaker:"Domain Expert",name:"Dr Aisha",content:`Great question about "${rText.slice(0,50)}". Let me break this down with a practical example for the Data Analyst role...`,ch:"Expert Response"},
      {speaker:"Hiring Manager",name:"Sipho",content:`From a hiring perspective, this shows great curiosity. Candidates who ask about "${rText.slice(0,30)}" typically stand out.`,ch:"Hiring Insight"},
    ]);setCurT(turns.length);setRText("");setShowRedir(false);setPlaying(true)};

  return <div className="aFU">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
      <div><h2 style={{fontSize:22,fontWeight:800,marginBottom:4}}>Panel Podcast</h2><p style={{color:T.textSec,fontSize:14}}>Data Analyst &mdash; Skills Deep Dive</p></div>
      <Btn variant="secondary" size="sm" icon={I.dl}>Export Notes</Btn>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:20}}>
      {Object.keys(sCol).map(role=>{const active=turns[curT]?.speaker===role;return <div key={role} style={{padding:"14px 12px",borderRadius:12,textAlign:"center",background:active?`${sCol[role]}15`:T.surface,border:`1.5px solid ${active?sCol[role]:T.border}`,transition:"all .3s",animation:active?"speakPulse 1.5s ease-in-out infinite":"none"}}>
        <div style={{fontSize:24,marginBottom:6}}>{sEmoji[role]}</div>
        <p style={{fontSize:12,fontWeight:700,color:active?sCol[role]:T.text}}>{sName[role]}</p>
        <p style={{fontSize:10,color:T.textMut}}>{role}</p>
        {active&&<div style={{width:8,height:8,borderRadius:"50%",background:sCol[role],margin:"6px auto 0"}} className="aP"/>}
      </div>})}
    </div>
    <Card style={{marginBottom:16}}>
      <div ref={tRef} style={{maxHeight:400,overflowY:"auto",paddingRight:8}}>
        {turns.slice(0,curT+1).map((t:any,i:number)=><div key={i} className={i===curT?"aFU":""} style={{padding:"14px 0",borderBottom:i<curT?`1px solid ${T.border}20`:"none"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>{sEmoji[t.speaker]}</span>
              <span style={{fontSize:13,fontWeight:700,color:sCol[t.speaker]}}>{t.name}</span>
              {t.isRedir&&<Badge color={T.coral} style={{fontSize:9}}>Redirect</Badge>}
            </div>
            <button onClick={()=>setBmarks(b=>[...b,i])} style={{background:"none",border:"none",cursor:"pointer",color:bmarks.includes(i)?T.warm:T.textMut,display:"flex"}}>{I.bmark}</button>
          </div>
          <p style={{fontSize:14,lineHeight:1.7,paddingLeft:28}}>{t.content}</p>
          {t.ch!==(turns as any)[i-1]?.ch&&<span style={{fontSize:10,color:T.textMut,paddingLeft:28,fontWeight:600,textTransform:"uppercase",letterSpacing:".08em"}}>Ch: {t.ch}</span>}
        </div>)}
      </div>
    </Card>
    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
      <Btn onClick={()=>setPlaying(!playing)} icon={playing?I.pause:I.play}>{playing?"Pause":"Play"}</Btn>
      <Btn variant="warm" icon={I.redirect} onClick={()=>setShowRedir(true)}>Redirect Discussion</Btn>
    </div>
    <Modal open={showRedir} onClose={()=>setShowRedir(false)} title="Redirect the Discussion">
      <p style={{fontSize:14,color:T.textSec,marginBottom:16,lineHeight:1.5}}>Tell the panel what to focus on. They&apos;ll adapt the next turns.</p>
      <textarea rows={3} placeholder='e.g. "Give examples of SQL window functions"' value={rText} onChange={e=>setRText(e.target.value)} style={{marginBottom:12}}/>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {["Slow down & simplify","Give real examples","Focus on interview tips","Explain ML basics"].map(s=><button key={s} onClick={()=>setRText(s)} style={{padding:"6px 12px",borderRadius:8,background:T.surfaceLight,border:`1px solid ${T.border}`,color:T.textSec,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans'"}}>{s}</button>)}
      </div>
      <div style={{marginTop:16,display:"flex",justifyContent:"flex-end"}}><Btn onClick={doRedir} disabled={!rText.trim()}>Send &rarr;</Btn></div>
    </Modal>
  </div>;
}
