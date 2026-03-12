"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card, Badge, TabBar } from "@/components/ui/base";

export default function JobInputPage(){
  const router = useRouter();
  const onSubmit = () => { setLoading(true); setTimeout(()=>{ setLoading(false); router.push("/dashboard"); },1800); };
  const[mode,setMode]=useState("manual");
  const[jt,setJt]=useState("");const[jd,setJd]=useState("");const[ju,setJu]=useState("");
  const[prof,setProf]=useState("intermediate");const[tl,setTl]=useState("1_month");
  const[cv,setCv]=useState<File|null>(null);const[consent,setConsent]=useState(false);const[loading,setLoading]=useState(false);

  return <div style={{minHeight:"100vh",padding:24,maxWidth:700,margin:"0 auto",background:T.midnight}}>
    <div className="aFU" style={{marginBottom:32,paddingTop:40}}>
      <h1 style={{fontSize:26,fontWeight:800,marginBottom:8}}>Add a Job &amp; Your CV</h1>
      <p style={{color:T.textSec,fontSize:15}}>We&apos;ll analyse both to build your personalised skills bridge.</p>
    </div>
    <Card style={{marginBottom:20}}>
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>{I.brief} Job Details</h3>
      <TabBar tabs={[{id:"manual",label:"Manual Entry"},{id:"url",label:"Paste URL"}]} active={mode} onChange={setMode}/>
      <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:14}}>
        {mode==="manual"?<><input placeholder="Job Title, e.g. Data Analyst" value={jt} onChange={e=>setJt(e.target.value)}/><textarea rows={5} placeholder="Paste job description..." value={jd} onChange={e=>setJd(e.target.value)}/></>:
        <input placeholder="https://careers24.com/jobs/..." value={ju} onChange={e=>setJu(e.target.value)}/>}
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:180}}><label style={{fontSize:12,fontWeight:600,color:T.textMut,display:"block",marginBottom:4}}>Your Level</label><select value={prof} onChange={e=>setProf(e.target.value)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
          <div style={{flex:1,minWidth:180}}><label style={{fontSize:12,fontWeight:600,color:T.textMut,display:"block",marginBottom:4}}>Timeline</label><select value={tl} onChange={e=>setTl(e.target.value)}><option value="2_weeks">2 Weeks</option><option value="1_month">1 Month</option><option value="3_months">3 Months</option></select></div>
        </div>
      </div>
    </Card>
    <Card style={{marginBottom:20}}>
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>{I.upload} Upload Your CV</h3>
      <div onClick={()=>document.getElementById("cv-up")?.click()} style={{border:`2px dashed ${cv?T.accent:T.border}`,borderRadius:14,padding:32,textAlign:"center",cursor:"pointer",background:cv?T.accentGlow2:"transparent",transition:"all .3s"}}>
        <input id="cv-up" type="file" accept=".pdf,.docx" hidden onChange={e=>setCv(e.target.files?.[0]||null)}/>
        {cv?<div className="aSI"><div style={{color:T.accent,marginBottom:8}}>{I.check}</div><p style={{fontWeight:600}}>{cv.name}</p><p style={{fontSize:12,color:T.textMut,marginTop:4}}>{(cv.size/1024).toFixed(0)} KB</p></div>:
        <><div style={{color:T.textMut,marginBottom:8}}>{I.upload}</div><p style={{fontWeight:600}}>Drop your CV or click to browse</p><p style={{fontSize:12,color:T.textMut,marginTop:4}}>PDF or DOCX, max 10 MB</p></>}
      </div>
    </Card>
    <Card style={{marginBottom:20,background:T.accentGlow2,border:`1px solid ${T.accentDim}40`}}>
      <label style={{display:"flex",gap:12,cursor:"pointer",alignItems:"flex-start"}}>
        <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} style={{width:20,height:20,accentColor:T.accent,marginTop:2,flexShrink:0}}/>
        <div><p style={{fontSize:14,fontWeight:600,marginBottom:4}}>{I.shield} POPIA Consent</p><p style={{fontSize:12,color:T.textSec,lineHeight:1.5}}>I consent to SkillBridge SA processing my CV and profile data. Data encrypted, never shared, deletable from Settings.</p></div>
      </label>
    </Card>
    <Btn size="lg" style={{width:"100%"}} disabled={!consent||loading} onClick={onSubmit}>
      {loading?<span style={{display:"flex",alignItems:"center",gap:8}}><span className="aSpin" style={{display:"inline-block",width:18,height:18,border:`2px solid ${T.midnight}`,borderTopColor:"transparent",borderRadius:"50%"}}/>Analysing...</span>:"Analyse & Build My Bridge \u2192"}
    </Btn>
  </div>;
}
