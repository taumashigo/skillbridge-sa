"use client";
import React from "react";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Card, Badge } from "@/components/ui/base";
import { PORTFOLIO } from "@/lib/data/mock";

export default function PortfolioPage(){
  return <div className="aFU">
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Portfolio Project Briefs</h2>
    <p style={{color:T.textSec,fontSize:14,marginBottom:20}}>Proof-of-skill projects aligned to the Data Analyst role.</p>
    {PORTFOLIO.map((p:any,i:number)=><Card key={i} style={{marginBottom:16}}>
      <Badge color={T.coral} style={{marginBottom:12}}>Project {i+1}</Badge>
      <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>{p.title}</h3>
      <p style={{fontSize:14,color:T.textSec,lineHeight:1.6,marginBottom:16}}>{p.desc}</p>
      <div style={{marginBottom:16}}>
        <p style={{fontSize:13,fontWeight:700,marginBottom:8}}>Requirements</p>
        {p.reqs.map((r:string,j:number)=><div key={j} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}>
          <span style={{color:T.accent,flexShrink:0,marginTop:2}}>{I.check}</span>
          <span style={{fontSize:13,color:T.textSec}}>{r}</span>
        </div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <div style={{background:T.surfaceLight,padding:12,borderRadius:10}}>
          <p style={{fontSize:11,fontWeight:600,color:T.textMut,textTransform:"uppercase",marginBottom:4}}>Beginner Stack</p>
          <p style={{fontSize:13,color:T.text}}>{p.stack.beginner}</p>
        </div>
        <div style={{background:T.surfaceLight,padding:12,borderRadius:10}}>
          <p style={{fontSize:11,fontWeight:600,color:T.textMut,textTransform:"uppercase",marginBottom:4}}>Advanced Stack</p>
          <p style={{fontSize:13,color:T.text}}>{p.stack.advanced}</p>
        </div>
      </div>
      <div style={{background:`${T.warm}10`,padding:14,borderRadius:10,borderLeft:`3px solid ${T.warm}`}}>
        <p style={{fontSize:12,fontWeight:600,color:T.warm,marginBottom:4}}>&#128161; Interview Tip</p>
        <p style={{fontSize:13,color:T.textSec,lineHeight:1.5}}>{p.tip}</p>
      </div>
    </Card>)}
  </div>;
}
