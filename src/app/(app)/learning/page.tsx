"use client";
import React, { useState } from "react";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card, Badge, TabBar } from "@/components/ui/base";
import { RESOURCES, INSTS } from "@/lib/data/mock";

export default function LearningPage(){
  const[tab,setTab]=useState("resources");const[saved,setSaved]=useState<string[]>([]);
  return <div className="aFU">
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Learning Library</h2>
    <p style={{color:T.textSec,fontSize:14,marginBottom:20}}>Resources and institutions matched to your skill gaps.</p>
    <TabBar tabs={[{id:"resources",label:"Resources"},{id:"institutions",label:"Institutions & Certs"},{id:"saved",label:`Saved (${saved.length})`}]} active={tab} onChange={setTab}/>
    <div style={{marginTop:20}}>
      {tab==="resources"&&RESOURCES.map((r:any,i:number)=><Card key={i} hover style={{marginBottom:12}} className="aSR">
        <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}><Badge color={T.sky}>{r.type}</Badge><Badge color={T.violet}>{r.diff}</Badge><Badge>{r.comp}</Badge></div>
        <h4 style={{fontSize:15,fontWeight:700,marginBottom:4}}>{r.title}</h4>
        <p style={{fontSize:13,color:T.textMut,marginBottom:6}}>{r.provider} &middot; ~{r.hours}h</p>
        <p style={{fontSize:13,color:T.textSec,lineHeight:1.5,background:T.surfaceLight,padding:"8px 12px",borderRadius:8,marginBottom:10}}><strong style={{color:T.accent}}>Why:</strong> {r.why}</p>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="ghost" size="sm" icon={I.bmark} onClick={()=>setSaved(s=>s.includes(r.id)?s.filter((x:string)=>x!==r.id):[...s,r.id])} style={{color:saved.includes(r.id)?T.warm:T.textMut}}>{saved.includes(r.id)?"Saved":"Save"}</Btn>
          <Btn variant="secondary" size="sm" icon={I.ext}>Open</Btn>
        </div>
      </Card>)}
      {tab==="institutions"&&INSTS.map((inst:any,i:number)=><Card key={i} hover style={{marginBottom:12}} className="aSR">
        <div style={{display:"flex",gap:6,marginBottom:8}}><Badge color={T.warm}>{inst.cat}</Badge>{inst.cat==="Local Bootcamp"&&<Badge color={T.success}>{"\ud83c\uddff\ud83c\udde6"} SA-Based</Badge>}</div>
        <h4 style={{fontSize:15,fontWeight:700,marginBottom:4}}>{inst.name}</h4>
        <p style={{fontSize:13,color:T.textSec,lineHeight:1.5,marginBottom:10}}>{inst.desc}</p>
        <p style={{fontSize:13,marginBottom:8}}><strong style={{color:T.textMut}}>Best for:</strong> {inst.bestFor}</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{inst.offerings.map((o:string,j:number)=><span key={j} style={{fontSize:11,padding:"3px 8px",background:T.surfaceLight,borderRadius:6,color:T.textSec}}>{o}</span>)}</div>
        <p style={{fontSize:12,color:T.textMut,fontStyle:"italic",marginBottom:10}}>{I.sparkle} {inst.recog}</p>
        <Btn variant="secondary" size="sm" icon={I.ext}>Visit Website</Btn>
      </Card>)}
      {tab==="saved"&&(saved.length===0?<Card style={{textAlign:"center",padding:40}}><p style={{color:T.textMut}}>No saved resources yet.</p></Card>:
        RESOURCES.filter((r:any)=>saved.includes(r.id)).map((r:any,i:number)=><Card key={i} style={{marginBottom:10}}><h4 style={{fontSize:14,fontWeight:700}}>{r.title}</h4><p style={{fontSize:12,color:T.textMut}}>{r.provider} &middot; {r.comp}</p></Card>))}
    </div>
  </div>;
}
