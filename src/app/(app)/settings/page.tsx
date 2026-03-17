"use client";
import React, { useState } from "react";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card, Badge, TabBar } from "@/components/ui/base";
import { showToast } from "@/components/ui/extras";

export default function SettingsPage(){
  const[tab,setTab]=useState("sa");
  const[dataMode,setDataMode]=useState("standard");
  const[seta,setSeta]=useState<any>(null);
  const[setaLoading,setSetaLoading]=useState(false);
  const[setaQuery,setSetaQuery]=useState("");
  const[saData,setSaData]=useState<any>(null);
  const[saLoading,setSaLoading]=useState(false);
  const[seeded,setSeeded]=useState(false);

  const searchSeta = async () => {
    if (!setaQuery.trim()) return;
    setSetaLoading(true);
    try {
      const res = await fetch("/api/seta", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle: setaQuery, skills: setaQuery.split(" ") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Search failed");
      setSeta(data.data);
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setSetaLoading(false); }
  };

  const loadSAData = async () => {
    setSaLoading(true);
    try {
      const stored = typeof window !== "undefined" ? sessionStorage.getItem("skillbridge_job") : null;
      const jobId = stored ? JSON.parse(stored).id : null;
      const res = await fetch("/api/salary-data", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to load SA data");
      setSaData(data.data);
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setSaLoading(false); }
  };

  const seedSeta = async () => {
    try {
      const res = await fetch("/api/seta/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) { setSeeded(true); showToast(`Seeded ${data.data.seeded} learnerships`, "success"); }
    } catch { showToast("Failed to seed SETA data", "error"); }
  };

  return <div className="aFU">
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Settings &amp; SA Intelligence</h2>
    <p style={{color:T.textSec,fontSize:14,marginBottom:20}}>South African employment data, SETA learnerships, and POPIA controls.</p>

    <TabBar tabs={[{id:"sa",label:"\ud83c\uddff\ud83c\udde6 SA Intelligence"},{id:"seta",label:"SETA & Learnerships"},{id:"data",label:"Data & Privacy"},{id:"prefs",label:"Preferences"}]} active={tab} onChange={setTab}/>

    <div style={{marginTop:20}}>
      {/* SA INTELLIGENCE */}
      {tab==="sa"&&<div>
        {!saData?<Card style={{textAlign:"center",padding:30}}>
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:12}}>SA Employment Intelligence</h3>
          <p style={{color:T.textSec,fontSize:13,marginBottom:20}}>Get salary benchmarks, BBBEE context, employment law, and industry insights tailored to your target role.</p>
          <Btn onClick={loadSAData} disabled={saLoading}>{saLoading?"Loading SA data...":"Load Intelligence Report"}</Btn>
        </Card>:
        <div>
          {saData.salaryData&&<Card style={{marginBottom:12}}>
            <h4 style={{fontSize:15,fontWeight:700,marginBottom:12}}>Salary Benchmarks {saData.jobTitle ? `\u2014 ${saData.jobTitle}` : ""}</h4>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:12}}>
              {[["Entry",saData.salaryData.entry,T.sky],["Mid-Level",saData.salaryData.mid,T.accent],["Senior",saData.salaryData.senior,T.violet]].map(([label,range,color]:any)=>range&&<div key={label} style={{textAlign:"center",padding:14,background:T.surfaceLight,borderRadius:10,borderTop:`3px solid ${color}`}}>
                <p style={{fontSize:12,color:T.textMut}}>{label}</p>
                <p style={{fontSize:16,fontWeight:700}}>R{(range.min/1000).toFixed(0)}k - R{(range.max/1000).toFixed(0)}k</p>
              </div>)}
            </div>
            {saData.salaryData.note&&<p style={{fontSize:12,color:T.textMut}}>{saData.salaryData.note}</p>}
          </Card>}

          {saData.cityComparison?.length>0&&<Card style={{marginBottom:12}}>
            <h4 style={{fontSize:15,fontWeight:700,marginBottom:10}}>City Comparison</h4>
            {saData.cityComparison.map((c:any,i:number)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${T.border}20`}}>
              <div><p style={{fontSize:14,fontWeight:600}}>{c.city}</p><p style={{fontSize:12,color:T.textMut}}>{c.costOfLiving}</p></div>
              <div style={{textAlign:"right"}}><Badge color={c.demandLevel==="high"?T.success:c.demandLevel==="medium"?T.warm:T.coral}>{c.demandLevel} demand</Badge><p style={{fontSize:12,color:c.adjustmentPercent>=0?T.success:T.coral,marginTop:4}}>{c.adjustmentPercent>=0?"+":""}{c.adjustmentPercent}% vs JHB</p></div>
            </div>)}
          </Card>}

          {saData.bbbeeContext&&<Card style={{marginBottom:12,borderLeft:`3px solid ${T.warm}`}}>
            <h4 style={{fontSize:15,fontWeight:700,marginBottom:10}}>{I.shield} BBBEE &amp; Employment Equity</h4>
            <p style={{fontSize:13,color:T.textSec,lineHeight:1.6,marginBottom:10}}>{saData.bbbeeContext.overview}</p>
            {saData.bbbeeContext.designationAdvantage&&<div style={{background:`${T.success}10`,padding:10,borderRadius:8,marginBottom:8}}><p style={{fontSize:12,fontWeight:600,color:T.success,marginBottom:4}}>Designated Group Advantage</p><p style={{fontSize:13,color:T.textSec}}>{saData.bbbeeContext.designationAdvantage}</p></div>}
            {saData.bbbeeContext.skillsDevelopment&&<p style={{fontSize:12,color:T.textMut,marginTop:8}}>{saData.bbbeeContext.skillsDevelopment}</p>}
          </Card>}

          {saData.employmentLaw&&<Card style={{marginBottom:12}}>
            <h4 style={{fontSize:15,fontWeight:700,marginBottom:10}}>Employment Law Quick Reference</h4>
            {Object.entries(saData.employmentLaw).map(([key,val]:any)=><div key={key} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.border}20`}}>
              <span style={{fontSize:13,color:T.textSec,textTransform:"capitalize"}}>{key.replace(/([A-Z])/g,' $1')}</span>
              <span style={{fontSize:13,fontWeight:600}}>{typeof val==="object"?Object.values(val).join(", "):val}</span>
            </div>)}
          </Card>}

          {saData.industryInsights&&<Card>
            <h4 style={{fontSize:15,fontWeight:700,marginBottom:10}}>Industry Insights</h4>
            {saData.industryInsights.demandTrend&&<p style={{fontSize:13,marginBottom:8}}><strong>Trend:</strong> {saData.industryInsights.demandTrend}</p>}
            {saData.industryInsights.topEmployers?.length>0&&<p style={{fontSize:13,marginBottom:8}}><strong>Top Employers:</strong> {saData.industryInsights.topEmployers.join(", ")}</p>}
            {saData.industryInsights.remoteWorkTrend&&<p style={{fontSize:13,marginBottom:8}}><strong>Remote Work:</strong> {saData.industryInsights.remoteWorkTrend}</p>}
            {saData.industryInsights.loadSheddingImpact&&<div style={{background:`${T.coral}10`,padding:10,borderRadius:8,marginTop:8}}><p style={{fontSize:12,fontWeight:600,color:T.coral,marginBottom:4}}>&#9889; Load Shedding Impact</p><p style={{fontSize:13,color:T.textSec}}>{saData.industryInsights.loadSheddingImpact}</p></div>}
          </Card>}
        </div>}
      </div>}

      {/* SETA SEARCH */}
      {tab==="seta"&&<div>
        <Card style={{marginBottom:16}}>
          <h4 style={{fontSize:15,fontWeight:700,marginBottom:12}}>Find SETA Learnerships</h4>
          <p style={{color:T.textSec,fontSize:13,marginBottom:12}}>Search by job title, skill, or sector to find relevant learnerships and funding.</p>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <input placeholder="e.g. Software Developer, ICT, Accounting..." value={setaQuery} onChange={e=>setSetaQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")searchSeta()}} style={{flex:1}}/>
            <Btn onClick={searchSeta} disabled={setaLoading}>{setaLoading?"Searching...":"Search"}</Btn>
          </div>
          {!seeded&&<Btn variant="ghost" size="sm" onClick={seedSeta}>Seed SETA Database (first time)</Btn>}
        </Card>

        {seta&&<div>
          {seta.source==="database"&&seta.learnerships?.length>0&&<div>
            <p style={{fontSize:13,color:T.textMut,marginBottom:12}}>{seta.count} learnerships found</p>
            {seta.learnerships.map((l:any,i:number)=><Card key={i} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <Badge color={T.accent}>{l.seta_name}</Badge>
                {l.nqf_level&&<Badge>NQF {l.nqf_level}</Badge>}
              </div>
              <h4 style={{fontSize:14,fontWeight:700,marginBottom:4}}>{l.programme}</h4>
              <p style={{fontSize:12,color:T.textMut}}>{l.sector}</p>
              {l.stipend&&<p style={{fontSize:12,color:T.success,marginTop:4}}>Stipend: {l.stipend}</p>}
              {l.duration&&<p style={{fontSize:12,color:T.textMut}}>Duration: {l.duration}</p>}
            </Card>)}
          </div>}

          {seta.source==="ai"&&seta.recommendations?.length>0&&<div>
            <p style={{fontSize:13,color:T.textMut,marginBottom:12}}>AI-recommended SETAs</p>
            {seta.recommendations.map((r:any,i:number)=><Card key={i} style={{marginBottom:10}}>
              <Badge color={T.accent} style={{marginBottom:8}}>{r.seta}</Badge>
              <h4 style={{fontSize:14,fontWeight:700,marginBottom:4}}>{r.programme}</h4>
              <p style={{fontSize:13,color:T.textSec,marginBottom:4}}>{r.relevance}</p>
              {r.applicationTip&&<p style={{fontSize:12,color:T.warm}}>&#128161; {r.applicationTip}</p>}
            </Card>)}
            {seta.bbbeeNote&&<Card style={{border:`1px solid ${T.warm}40`,marginTop:12}}><p style={{fontSize:13,color:T.textSec}}><strong style={{color:T.warm}}>BBBEE Note:</strong> {seta.bbbeeNote}</p></Card>}
            {seta.fundingInfo&&<Card style={{marginTop:8}}><p style={{fontSize:13,color:T.textSec}}><strong style={{color:T.accent}}>Funding:</strong> {seta.fundingInfo}</p></Card>}
          </div>}

          {seta.source==="database"&&seta.count===0&&<Card style={{textAlign:"center",padding:20}}>
            <p style={{color:T.textMut}}>No direct matches found. Try a broader search term.</p>
          </Card>}
        </div>}
      </div>}

      {/* DATA & PRIVACY */}
      {tab==="data"&&<div>
        <Card style={{marginBottom:16}}>
          <h4 style={{fontSize:15,fontWeight:700,marginBottom:12}}>{I.shield} POPIA Compliance</h4>
          <p style={{fontSize:13,color:T.textSec,lineHeight:1.6,marginBottom:16}}>SkillBridge SA is fully POPIA compliant. Your data is encrypted at rest and in transit, never shared with third parties, and deletable at any time.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Btn variant="secondary" icon={I.dl} onClick={async()=>{
              try {
                const res = await fetch("/api/data/export");
                if (res.ok) { showToast("Data export initiated", "success"); }
              } catch { showToast("Export failed", "error"); }
            }}>Export All My Data</Btn>
            <Btn variant="ghost" style={{color:T.coral}} onClick={async()=>{
              if (!confirm("This will permanently delete ALL your data. This cannot be undone. Continue?")) return;
              try {
                const res = await fetch("/api/data/delete", { method: "DELETE" });
                if (res.ok) { showToast("All data deleted", "info"); window.location.href="/"; }
              } catch { showToast("Deletion failed", "error"); }
            }}>Delete All My Data</Btn>
          </div>
        </Card>

        <Card>
          <h4 style={{fontSize:15,fontWeight:700,marginBottom:12}}>Data Stored</h4>
          {["CV text and structured data","Job descriptions you provided","Assessment answers and scores","Chat conversations with coach","Generated learning plans and podcast transcripts"].map((item,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:`1px solid ${T.border}20`}}>
            <span style={{color:T.accent}}>{I.check}</span>
            <span style={{fontSize:13,color:T.textSec}}>{item}</span>
          </div>)}
        </Card>
      </div>}

      {/* PREFERENCES */}
      {tab==="prefs"&&<div>
        <Card style={{marginBottom:16}}>
          <h4 style={{fontSize:15,fontWeight:700,marginBottom:12}}>Data Mode</h4>
          <p style={{fontSize:13,color:T.textSec,marginBottom:16}}>Reduce data usage for mobile/metered connections.</p>
          <div style={{display:"flex",gap:10}}>
            {[["standard","Standard","Full features, more data"],["reduced","Reduced","Smaller payloads, fewer API calls"]].map(([val,label,desc]:any)=>(
              <button key={val} onClick={()=>setDataMode(val)} style={{flex:1,padding:16,borderRadius:12,border:`1.5px solid ${dataMode===val?T.accent:T.border}`,background:dataMode===val?T.accentGlow:"transparent",cursor:"pointer",textAlign:"center"}}>
                <p style={{fontSize:14,fontWeight:600,color:dataMode===val?T.accent:T.text,fontFamily:"'DM Sans'"}}>{label}</p>
                <p style={{fontSize:11,color:T.textMut,marginTop:4,fontFamily:"'DM Sans'"}}>{desc}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h4 style={{fontSize:15,fontWeight:700,marginBottom:12}}>About SkillBridge SA</h4>
          <p style={{fontSize:13,color:T.textSec,lineHeight:1.6}}>SkillBridge SA is an AI-powered career intelligence platform built for South African job seekers. From CV analysis to interview preparation, we help you move from &ldquo;not shortlisted&rdquo; to &ldquo;job-ready&rdquo;.</p>
          <p style={{fontSize:12,color:T.textMut,marginTop:12}}>Version 2.0 &middot; Powered by Anthropic Claude &middot; POPIA Compliant</p>
        </Card>
      </div>}
    </div>
  </div>;
}
