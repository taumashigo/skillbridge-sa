"use client";
import React, { useState } from "react";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card, Badge, TabBar } from "@/components/ui/base";

export default function CVOptPage(){
  const[tab,setTab]=useState("analysis");
  const kws=[
    {kw:"Python",status:"found",signal:"Strong match \u2013 in 3 CV sections"},
    {kw:"SQL",status:"found",signal:"Present in experience section"},
    {kw:"Machine Learning",status:"weak",signal:"Mentioned once; add project details"},
    {kw:"AWS",status:"missing",signal:"Not found \u2013 add certification or project"},
    {kw:"Data Visualisation",status:"found",signal:"Tableau mentioned; add dashboard examples"},
    {kw:"Stakeholder Communication",status:"missing",signal:"Add presentation examples"},
    {kw:"Agile",status:"weak",signal:"Brief mention \u2013 expand with sprint examples"},
  ];
  const sc:any={found:T.success,weak:T.warm,missing:T.error};
  const rewrites=[
    {orig:"Worked with data and created reports",improved:"Engineered automated reporting pipeline processing 50K+ records daily using Python and Pandas, reducing manual reporting time by 65% for 12 stakeholders.",method:"STAR: Situation \u2192 Task \u2192 Action \u2192 Result (65% saved)"},
    {orig:"Helped with database management",improved:"Designed PostgreSQL schemas for 3 production apps; optimised queries with indexes and CTEs, achieving 40% faster load times.",method:"CAR: Challenge \u2192 Action \u2192 Result (40% improvement)"},
  ];
  return <div className="aFU">
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>CV &amp; ATS Optimiser</h2>
    <p style={{color:T.textSec,fontSize:14,marginBottom:20}}>Keyword analysis, rewrite suggestions, and exportable optimised versions.</p>
    <TabBar tabs={[{id:"analysis",label:"Keyword Analysis"},{id:"rewrites",label:"Bullet Rewrites"},{id:"export",label:"Export"}]} active={tab} onChange={setTab}/>
    <div style={{marginTop:20}}>
      {tab==="analysis"&&<div>
        <Card style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><h3 style={{fontSize:16,fontWeight:700}}>Keyword Coverage</h3><Badge>{kws.filter(k=>k.status==="found").length}/{kws.length} Found</Badge></div>
          {kws.map((k,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:T.surfaceLight,borderRadius:10,borderLeft:`3px solid ${sc[k.status]}`,marginBottom:8}}>
            <div style={{flex:1}}><p style={{fontSize:14,fontWeight:600}}>{k.kw}</p><p style={{fontSize:12,color:T.textSec,marginTop:2}}>{k.signal}</p></div>
            <Badge color={sc[k.status]}>{k.status}</Badge>
          </div>)}
        </Card>
      </div>}
      {tab==="rewrites"&&<div>
        {rewrites.map((r,i)=><Card key={i} style={{marginBottom:16}}>
          <div style={{marginBottom:12}}>
            <p style={{fontSize:12,fontWeight:600,color:T.textMut,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Original</p>
            <p style={{fontSize:14,color:T.coral,fontStyle:"italic",padding:"10px 14px",background:`${T.coral}10`,borderRadius:8,borderLeft:`3px solid ${T.coral}`}}>{r.orig}</p>
          </div>
          <div style={{marginBottom:12}}>
            <p style={{fontSize:12,fontWeight:600,color:T.textMut,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Improved</p>
            <p style={{fontSize:14,color:T.success,padding:"10px 14px",background:`${T.success}10`,borderRadius:8,borderLeft:`3px solid ${T.success}`,lineHeight:1.5}}>{r.improved}</p>
          </div>
          <p style={{fontSize:12,color:T.textSec,background:T.surfaceLight,padding:10,borderRadius:8}}><strong style={{color:T.accent}}>Method:</strong> {r.method}</p>
        </Card>)}
      </div>}
      {tab==="export"&&<Card style={{textAlign:"center",padding:40}}>
        <div style={{fontSize:48,marginBottom:16}}>&#128196;</div>
        <h3 style={{fontSize:18,fontWeight:700,marginBottom:12}}>Export Your CV</h3>
        <p style={{color:T.textSec,fontSize:14,marginBottom:24}}>Two versions optimised for different audiences.</p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <Btn icon={I.dl}>ATS-Friendly (Plain)</Btn>
          <Btn variant="secondary" icon={I.dl}>Human-Readable (Styled)</Btn>
        </div>
      </Card>}
    </div>
  </div>;
}
