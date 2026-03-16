"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card, Badge, PBar } from "@/components/ui/base";
import { Radar } from "@/components/charts/Radar";
import { Skeleton, CardSkeleton } from "@/components/ui/extras";

export default function DashboardPage(){
  const router = useRouter();
  const[loading,setLoading]=useState(true);
  const[jobData,setJobData]=useState<any>(null);

  useEffect(()=>{
    const stored = typeof window !== "undefined" ? sessionStorage.getItem("skillbridge_job") : null;
    if (stored) {
      try { setJobData(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  },[]);

  // Calculate Job Readiness Score
  const matchScore = jobData?.matchScore || 0;
  const compCount = jobData?.competencyCount || 0;
  const hasCV = !!jobData?.id;
  const readinessScore = hasCV ? Math.min(Math.round(matchScore * 0.4 + compCount * 3 + 20), 100) : 0;

  // Badges
  const badges = [];
  if (hasCV) badges.push({ icon: "\ud83d\udcc4", label: "First Analysis", color: T.accent });
  if (matchScore >= 50) badges.push({ icon: "\ud83c\udfaf", label: "50%+ Match", color: T.success });
  if (matchScore >= 70) badges.push({ icon: "\u2b50", label: "Strong Match", color: T.warm });
  if (compCount >= 8) badges.push({ icon: "\ud83d\udcca", label: "Deep Analysis", color: T.violet });

  // Build radar data from competencies
  const radarData = (jobData?.competencies?.slice(0, 7) || []).map((c: any) => ({
    label: c.name?.split(" ")[0] || "Skill",
    value: Math.min(5, Math.round((c.estimatedWeight || 5) / 2)),
  }));

  // Gaps from match
  const gaps = (jobData?.gaps?.slice(0, 5) || []).map((g: any) => ({
    skill: g.competency || g.skill || "Unknown",
    severity: g.severity || g.priorityLabel || "Medium",
    color: (g.severity === "critical" || g.priorityLabel === "High") ? T.coral : T.warm,
  }));

  if (loading) return <div><Skeleton width="200px" height={28} style={{marginBottom:8}}/><Skeleton width="300px" height={14} style={{marginBottom:28}}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}><CardSkeleton/><CardSkeleton/></div></div>;

  // No job analysed yet
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

    {/* Top row: Match Score + Readiness Score */}
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
           matchScore >= 40 ? "Good foundation. Address the priority gaps below to improve." :
           "Significant gaps identified. Follow the learning plan to build your bridge."}
        </p>
      </Card>

      {radarData.length > 0 ? (
        <Card style={{display:"flex",justifyContent:"center",alignItems:"center"}}><Radar data={radarData} size={240}/></Card>
      ) : (
        <Card>
          <p style={{fontSize:12,fontWeight:600,color:T.textMut,textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>Job Readiness Score</p>
          <p style={{fontSize:42,fontWeight:800,color:readinessScore>=70?T.success:readinessScore>=40?T.warm:T.coral,lineHeight:1,marginBottom:8}}>{readinessScore}/100</p>
          <PBar value={readinessScore} color={readinessScore>=70?T.success:readinessScore>=40?T.warm:T.coral}/>
          <p style={{fontSize:12,color:T.textSec,marginTop:10}}>Complete more activities to raise your score.</p>
        </Card>
      )}
    </div>

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
