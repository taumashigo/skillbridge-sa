"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card, Badge, PBar } from "@/components/ui/base";
import { Radar } from "@/components/charts/Radar";
import { Skeleton, CardSkeleton, showToast } from "@/components/ui/extras";

export default function DashboardPage(){
  const router = useRouter();
  const[loading,setLoading]=useState(true);
  const[jobData,setJobData]=useState<any>(null);
  const[market,setMarket]=useState<any>(null);
  const[marketLoading,setMarketLoading]=useState(false);
  const[marketExpanded,setMarketExpanded]=useState(false);

  useEffect(()=>{
    const stored = typeof window !== "undefined" ? sessionStorage.getItem("skillbridge_job") : null;
    if (stored) {
      try { setJobData(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  },[]);

  // Auto-load market data when job data is available
  useEffect(()=>{
    if (jobData?.id && !market && !marketLoading) loadMarket();
  },[jobData]);

  const loadMarket = async () => {
    if (!jobData?.id) return;
    setMarketLoading(true);
    try {
      const res = await fetch("/api/market-demand", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: jobData.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to load market data");
      setMarket(data.data);
    } catch (err: any) { console.error("Market data error:", err); }
    finally { setMarketLoading(false); }
  };

  const matchScore = jobData?.matchScore || 0;
  const compCount = jobData?.competencyCount || 0;
  const hasCV = !!jobData?.id;
  const readinessScore = hasCV ? Math.min(Math.round(matchScore * 0.4 + compCount * 3 + 20), 100) : 0;

  const badges = [];
  if (hasCV) badges.push({ icon: "\ud83d\udcc4", label: "First Analysis", color: T.accent });
  if (matchScore >= 50) badges.push({ icon: "\ud83c\udfaf", label: "50%+ Match", color: T.success });
  if (matchScore >= 70) badges.push({ icon: "\u2b50", label: "Strong Match", color: T.warm });
  if (compCount >= 8) badges.push({ icon: "\ud83d\udcca", label: "Deep Analysis", color: T.violet });

  const radarData = (jobData?.competencies?.slice(0, 7) || []).map((c: any) => ({
    label: c.name?.split(" ")[0] || "Skill",
    value: Math.min(5, Math.round((c.estimatedWeight || 5) / 2)),
  }));

  const gaps = (jobData?.gaps?.slice(0, 5) || []).map((g: any) => ({
    skill: g.competency || g.skill || "Unknown",
    severity: g.severity || g.priorityLabel || "Medium",
    color: (g.severity === "critical" || g.priorityLabel === "High") ? T.coral : T.warm,
  }));

  const demandColors: any = { hot: T.coral, high: T.warm, moderate: T.accent, low: T.textMut, declining: T.textMut };
  const demandEmoji: any = { hot: "\ud83d\udd25", high: "\ud83d\udcc8", moderate: "\u2796", low: "\ud83d\udcc9", declining: "\u26a0\ufe0f" };

  if (loading) return <div><Skeleton width="200px" height={28} style={{marginBottom:8}}/><Skeleton width="300px" height={14} style={{marginBottom:28}}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}><CardSkeleton/><CardSkeleton/></div></div>;

  if (!hasCV) return <div className="aFU">
    <h1 style={{fontSize:24,fontWeight:800,marginBottom:8}}>Welcome to SkillBridge SA</h1>
    <p style={{color:T.textSec,fontSize:14,marginBottom:28}}>Get started by analysing a job post and uploading your CV.</p>
    <Card style={{textAlign:"center",padding:40}} hover glow onClick={()=>router.push("/job-input")}>
      <div style={{fontSize:48,marginBottom:16}}>&#128640;</div>
      <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Start Your First Analysis</h3>
      <p style={{color:T.textSec,fontSize:14,marginBottom:20}}>Upload your CV and a job description to get your personalised skills bridge.</p>
      <Btn size="lg">Get Started &rarr;</Btn>
    </Card>
  </div>;

  return <div>
    <div className="aFU" style={{marginBottom:28}}>
      <h1 style={{fontSize:24,fontWeight:800,marginBottom:4}}>Your Skills Bridge</h1>
      <p style={{color:T.textSec,fontSize:14}}>{jobData?.title || "Job Analysis"} &middot; {compCount} competencies mapped</p>
    </div>

    {/* Match + Radar */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:20}}>
      <Card className="aGlow">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div>
            <p style={{fontSize:12,fontWeight:600,color:T.textMut,textTransform:"uppercase",letterSpacing:".08em"}}>CV &harr; Job Match</p>
            <p style={{fontSize:42,fontWeight:800,color:T.accent,lineHeight:1}}>{matchScore}%</p>
          </div>
          <div style={{width:72,height:72,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:`conic-gradient(${T.accent} ${matchScore*3.6}deg,${T.surfaceLight} 0)`}}>
            <div style={{width:56,height:56,borderRadius:"50%",background:T.surface,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14,fontWeight:700}}>{matchScore}%</span></div>
          </div>
        </div>
        <PBar value={matchScore}/>
        <p style={{fontSize:12,color:T.textSec,marginTop:10,lineHeight:1.5}}>
          {matchScore >= 70 ? "Strong match! Focus on polishing your application materials." :
           matchScore >= 40 ? "Good foundation. Address the priority gaps below." :
           "Significant gaps identified. Follow the learning plan."}
        </p>
      </Card>
      {radarData.length > 0 ? (
        <Card style={{display:"flex",justifyContent:"center",alignItems:"center"}}><Radar data={radarData} size={240}/></Card>
      ) : (
        <Card>
          <p style={{fontSize:12,fontWeight:600,color:T.textMut,textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>Job Readiness Score</p>
          <p style={{fontSize:42,fontWeight:800,color:readinessScore>=70?T.success:readinessScore>=40?T.warm:T.coral,lineHeight:1,marginBottom:8}}>{readinessScore}/100</p>
          <PBar value={readinessScore} color={readinessScore>=70?T.success:readinessScore>=40?T.warm:T.coral}/>
        </Card>
      )}
    </div>

    {/* MARKET DEMAND INTELLIGENCE */}
    <Card style={{marginBottom:20,border:`1px solid ${T.accent}30`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <h3 style={{fontSize:16,fontWeight:700,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:20}}>{"\ud83d\udcca"}</span> Live Market Demand
          </h3>
          {market && <p style={{fontSize:12,color:T.textMut,marginTop:4}}>{market.sector} &middot; {market.dataDate} &middot; Sources: {market.dataSources?.join(", ")}</p>}
        </div>
        {market && <Btn variant="ghost" size="sm" onClick={()=>setMarketExpanded(!marketExpanded)}>{marketExpanded?"Collapse":"Expand"}</Btn>}
      </div>

      {marketLoading && <div style={{display:"flex",alignItems:"center",gap:10,padding:20,justifyContent:"center"}}>
        <span className="aSpin" style={{display:"inline-block",width:20,height:20,border:`2px solid ${T.accent}`,borderTopColor:"transparent",borderRadius:"50%"}}/>
        <span style={{fontSize:13,color:T.textSec}}>Scanning SA job boards for live market data...</span>
      </div>}

      {market && <>
        {market.sectorDescription && <p style={{fontSize:13,color:T.textSec,lineHeight:1.6,marginBottom:16,background:T.surfaceLight,padding:12,borderRadius:8}}>{market.sectorDescription}</p>}

        {/* Top roles ranking */}
        <div>
          {(marketExpanded ? market.demandRanking : market.demandRanking?.slice(0, 8))?.map((r: any, i: number) => (
            <div key={i} className={i < 3 ? "aSR" : ""} style={{
              display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
              background:r.isTargetRole ? `${T.accent}15` : i % 2 === 0 ? T.surfaceLight : "transparent",
              borderRadius:10,marginBottom:4,
              border:r.isTargetRole ? `1.5px solid ${T.accent}` : "1px solid transparent",
              transition:"all .2s",
            }}>
              {/* Rank */}
              <div style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                background:i < 3 ? `${T.coral}20` : T.surface,
                color:i < 3 ? T.coral : T.textMut,fontSize:14,fontWeight:800,flexShrink:0
              }}>{r.rank || i + 1}</div>

              {/* Role info */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  <p style={{fontSize:14,fontWeight:r.isTargetRole ? 700 : 600,color:r.isTargetRole ? T.accent : T.text}}>
                    {r.role}
                  </p>
                  {r.isTargetRole && <Badge color={T.accent} style={{fontSize:10}}>YOUR TARGET</Badge>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4,flexWrap:"wrap"}}>
                  <span style={{fontSize:12,color:T.textMut}}>{r.estimatedAdverts}</span>
                  {r.averageSalary && <span style={{fontSize:12,color:T.success}}>{r.averageSalary}</span>}
                </div>
                {marketExpanded && r.trend && <p style={{fontSize:11,color:T.textSec,marginTop:4,fontStyle:"italic"}}>{r.trend}</p>}
              </div>

              {/* Demand badge */}
              <div style={{textAlign:"right",flexShrink:0}}>
                <span style={{fontSize:16}}>{demandEmoji[r.demandLevel] || "\u2796"}</span>
                <p style={{fontSize:11,fontWeight:600,color:demandColors[r.demandLevel] || T.textMut,textTransform:"uppercase"}}>{r.demandLevel}</p>
              </div>
            </div>
          ))}
        </div>

        {!marketExpanded && market.demandRanking?.length > 8 && (
          <Btn variant="ghost" size="sm" onClick={()=>setMarketExpanded(true)} style={{marginTop:8,width:"100%"}}>
            Show all {market.demandRanking.length} roles &darr;
          </Btn>
        )}

        {/* Market insights (expanded view) */}
        {marketExpanded && market.marketInsights && (
          <div style={{marginTop:16,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:12}}>
            {market.marketInsights.hottestSkills?.length > 0 && (
              <div style={{background:T.surfaceLight,padding:14,borderRadius:10}}>
                <p style={{fontSize:12,fontWeight:600,color:T.coral,marginBottom:8}}>{"\ud83d\udd25"} Hottest Skills</p>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {market.marketInsights.hottestSkills.map((s: string, i: number) => (
                    <span key={i} style={{fontSize:11,padding:"3px 8px",background:`${T.coral}15`,borderRadius:6,color:T.coral}}>{s}</span>
                  ))}
                </div>
              </div>
            )}
            {market.marketInsights.emergingRoles?.length > 0 && (
              <div style={{background:T.surfaceLight,padding:14,borderRadius:10}}>
                <p style={{fontSize:12,fontWeight:600,color:T.success,marginBottom:8}}>{"\ud83c\udf31"} Emerging Roles</p>
                {market.marketInsights.emergingRoles.map((r: string, i: number) => (
                  <p key={i} style={{fontSize:12,color:T.textSec,marginBottom:4}}>&#8226; {r}</p>
                ))}
              </div>
            )}
            {market.marketInsights.topHiringCities?.length > 0 && (
              <div style={{background:T.surfaceLight,padding:14,borderRadius:10}}>
                <p style={{fontSize:12,fontWeight:600,color:T.sky,marginBottom:8}}>{"\ud83d\udccd"} Top Hiring Cities</p>
                {market.marketInsights.topHiringCities.map((c: string, i: number) => (
                  <p key={i} style={{fontSize:12,color:T.textSec,marginBottom:4}}>{i + 1}. {c}</p>
                ))}
              </div>
            )}
            {market.marketInsights.remoteVsOnsite && (
              <div style={{background:T.surfaceLight,padding:14,borderRadius:10}}>
                <p style={{fontSize:12,fontWeight:600,color:T.violet,marginBottom:8}}>{"\ud83c\udfe0"} Remote Work</p>
                <p style={{fontSize:12,color:T.textSec}}>{market.marketInsights.remoteVsOnsite}</p>
              </div>
            )}
            {market.marketInsights.entryLevelAvailability && (
              <div style={{background:T.surfaceLight,padding:14,borderRadius:10}}>
                <p style={{fontSize:12,fontWeight:600,color:T.warm,marginBottom:8}}>{"\ud83c\udf93"} Entry Level</p>
                <p style={{fontSize:12,color:T.textSec}}>{market.marketInsights.entryLevelAvailability}</p>
              </div>
            )}
          </div>
        )}

        {/* Advice */}
        {market.adviceForUser && (
          <div style={{marginTop:16,background:`${T.accent}10`,padding:14,borderRadius:10,borderLeft:`3px solid ${T.accent}`}}>
            <p style={{fontSize:12,fontWeight:600,color:T.accent,marginBottom:4}}>{"\ud83d\udca1"} Market-Informed Advice</p>
            <p style={{fontSize:13,color:T.textSec,lineHeight:1.6}}>{market.adviceForUser}</p>
          </div>
        )}
      </>}

      {!market && !marketLoading && (
        <Btn variant="secondary" onClick={loadMarket}>Load Market Intelligence</Btn>
      )}
    </Card>

    {/* Badges */}
    {badges.length > 0 && <Card style={{marginBottom:20}}>
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:12}}>Achievements</h3>
      <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
        {badges.map((b,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",background:T.surfaceLight,borderRadius:10,border:`1px solid ${b.color}40`}}>
          <span style={{fontSize:20}}>{b.icon}</span>
          <span style={{fontSize:13,fontWeight:600,color:b.color}}>{b.label}</span>
        </div>)}
      </div>
    </Card>}

    {/* Priority Gaps */}
    {gaps.length > 0 && <Card style={{marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h3 style={{fontSize:16,fontWeight:700}}>Priority Gaps</h3>
        <Badge color={T.coral}>{gaps.filter(g=>g.severity==="critical"||g.severity==="High").length} Critical</Badge>
      </div>
      {gaps.map((g:any,i:number)=><div key={i} className="aSR" style={{animationDelay:`${i*.06}s`,display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:T.surfaceLight,borderRadius:10,borderLeft:`3px solid ${g.color}`,marginBottom:8}}>
        <div style={{flex:1}}><p style={{fontSize:14,fontWeight:600}}>{g.skill}</p></div>
        <Badge color={g.color}>{g.severity}</Badge>
      </div>)}
    </Card>}

    {/* Quick Actions */}
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
