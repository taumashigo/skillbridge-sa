"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card, Badge, PBar } from "@/components/ui/base";
import { Radar } from "@/components/charts/Radar";
import { COMPS } from "@/lib/data/mock";

export default function DashboardPage(){
  const router = useRouter();
  const match=62;
  const gaps=[
    {skill:"Machine Learning",gap:3,pri:"High",color:T.coral},
    {skill:"Cloud Infrastructure",gap:3,pri:"High",color:T.coral},
    {skill:"AWS Certification",gap:4,pri:"High",color:T.coral},
    {skill:"SQL Depth",gap:2,pri:"Medium",color:T.warm},
    {skill:"Data Visualisation",gap:2,pri:"Medium",color:T.warm},
  ];
  const rd=COMPS.slice(0,7).map(c=>({label:c.name.split(" ")[0],value:c.score}));
  return <div>
    <div className="aFU" style={{marginBottom:28}}>
      <h1 style={{fontSize:24,fontWeight:800,marginBottom:4}}>Your Skills Bridge</h1>
      <p style={{color:T.textSec,fontSize:14}}>Data Analyst &middot; Intermediate &middot; 1-month plan</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:20}}>
      <Card className="aGlow">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div>
            <p style={{fontSize:12,fontWeight:600,color:T.textMut,textTransform:"uppercase",letterSpacing:".08em"}}>CV &harr; Job Match</p>
            <p style={{fontSize:42,fontWeight:800,color:T.accent,lineHeight:1}}>{match}%</p>
          </div>
          <div style={{width:72,height:72,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:`conic-gradient(${T.accent} ${match*3.6}deg,${T.surfaceLight} 0)`}}>
            <div style={{width:56,height:56,borderRadius:"50%",background:T.surface,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14,fontWeight:700}}>{match}%</span></div>
          </div>
        </div>
        <PBar value={match}/>
        <p style={{fontSize:12,color:T.textSec,marginTop:10,lineHeight:1.5}}>Your CV covers 62% of required competencies. Focus on gaps below to improve.</p>
      </Card>
      <Card style={{display:"flex",justifyContent:"center",alignItems:"center"}}><Radar data={rd} size={240}/></Card>
    </div>
    <Card style={{marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h3 style={{fontSize:16,fontWeight:700}}>Priority Gaps</h3>
        <Badge color={T.coral}>{gaps.filter(g=>g.pri==="High").length} High Priority</Badge>
      </div>
      {gaps.map((g,i)=><div key={i} className="aSR" style={{animationDelay:`${i*.06}s`,display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:T.surfaceLight,borderRadius:10,borderLeft:`3px solid ${g.color}`,marginBottom:8}}>
        <div style={{flex:1}}><p style={{fontSize:14,fontWeight:600,marginBottom:4}}>{g.skill}</p><PBar value={5-g.gap} max={5} color={g.color} height={4}/></div>
        <Badge color={g.color}>{g.pri}</Badge>
      </div>)}
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
      {[
        {icon:I.chart,t:"Take Assessment",d:"Test your skills",pg:"/assessment",c:T.accent},
        {icon:I.book,t:"Learning Library",d:"Curated resources",pg:"/learning",c:T.sky},
        {icon:I.mic,t:"Panel Podcast",d:"Expert discussion",pg:"/podcast",c:T.violet},
        {icon:I.doc,t:"Optimise CV",d:"ATS-ready format",pg:"/cv-optimiser",c:T.warm},
        {icon:I.target,t:"Portfolio Projects",d:"Proof of skill",pg:"/portfolio",c:T.coral},
        {icon:I.interview,t:"Interview Prep",d:"Practice answers",pg:"/interview",c:T.success},
      ].map((a,i)=><Card key={i} hover glow onClick={()=>router.push(a.pg)} style={{cursor:"pointer"}}>
        <div style={{color:a.c,marginBottom:10}}>{a.icon}</div>
        <h4 style={{fontSize:14,fontWeight:700,marginBottom:4}}>{a.t}</h4>
        <p style={{fontSize:12,color:T.textSec}}>{a.d}</p>
      </Card>)}
    </div>
  </div>;
}
