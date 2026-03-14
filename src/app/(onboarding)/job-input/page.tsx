"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card, Badge, TabBar } from "@/components/ui/base";
import { showToast } from "@/components/ui/extras";

type ParseStatus = "idle" | "uploading" | "parsing" | "done" | "error";

export default function JobInputPage(){
  const router = useRouter();
  const[mode,setMode]=useState("manual");
  const[jt,setJt]=useState("");const[jd,setJd]=useState("");const[ju,setJu]=useState("");
  const[prof,setProf]=useState("intermediate");const[tl,setTl]=useState("1_month");
  const[cv,setCv]=useState<File|null>(null);
  const[consent,setConsent]=useState(false);
  const[status,setStatus]=useState<ParseStatus>("idle");
  const[progress,setProgress]=useState("");
  const[error,setError]=useState("");

  const handleSubmit = async () => {
    if (!consent) return;
    setError("");

    try {
      // Step 1: Upload CV if provided
      let cvId: string | null = null;
      if (cv) {
        setStatus("uploading");
        setProgress("Uploading your CV...");

        const formData = new FormData();
        formData.append("file", cv);

        const uploadRes = await fetch("/api/cv/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(uploadData.error?.message || "Failed to upload CV");
        }
        cvId = uploadData.data?.id;
        showToast("CV uploaded successfully", "success");

        // Step 2: Parse CV with AI
        if (cvId) {
          setStatus("parsing");
          setProgress("AI is analysing your CV... This may take 15-30 seconds.");

          const parseRes = await fetch("/api/cv/parse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cvId }),
          });
          const parseData = await parseRes.json();

          if (!parseRes.ok) {
            throw new Error(parseData.error?.message || "Failed to parse CV");
          }
          showToast(`Found ${parseData.data?.skillsFound || 0} skills in your CV`, "success");
        }
      }

      // Step 3: Store job details (for now, in sessionStorage for dashboard)
      const jobData = {
        title: jt || "Job Analysis",
        description: jd,
        url: ju,
        level: prof,
        timeline: tl,
        cvId,
      };
      if (typeof window !== "undefined") {
        sessionStorage.setItem("skillbridge_job", JSON.stringify(jobData));
      }

      setStatus("done");
      setProgress("Analysis complete! Redirecting to dashboard...");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Something went wrong");
      setProgress("");
      showToast(err.message || "Something went wrong", "error");
    }
  };

  const isProcessing = status === "uploading" || status === "parsing";

  return <div style={{minHeight:"100vh",padding:24,maxWidth:700,margin:"0 auto",background:T.midnight}}>
    <div className="aFU" style={{marginBottom:32,paddingTop:40}}>
      <h1 style={{fontSize:26,fontWeight:800,marginBottom:8}}>Add a Job &amp; Your CV</h1>
      <p style={{color:T.textSec,fontSize:15}}>We&apos;ll analyse both to build your personalised skills bridge.</p>
    </div>

    {/* Job Details */}
    <Card style={{marginBottom:20}}>
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>{I.brief} Job Details</h3>
      <TabBar tabs={[{id:"manual",label:"Manual Entry"},{id:"url",label:"Paste URL"}]} active={mode} onChange={setMode}/>
      <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:14}}>
        {mode==="manual"?<>
          <input placeholder="Job Title, e.g. Data Analyst" value={jt} onChange={e=>setJt(e.target.value)} disabled={isProcessing}/>
          <textarea rows={5} placeholder="Paste job description..." value={jd} onChange={e=>setJd(e.target.value)} disabled={isProcessing}/>
        </>:
        <input placeholder="https://careers24.com/jobs/..." value={ju} onChange={e=>setJu(e.target.value)} disabled={isProcessing}/>}
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:180}}>
            <label style={{fontSize:12,fontWeight:600,color:T.textMut,display:"block",marginBottom:4}}>Your Level</label>
            <select value={prof} onChange={e=>setProf(e.target.value)} disabled={isProcessing}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div style={{flex:1,minWidth:180}}>
            <label style={{fontSize:12,fontWeight:600,color:T.textMut,display:"block",marginBottom:4}}>Timeline</label>
            <select value={tl} onChange={e=>setTl(e.target.value)} disabled={isProcessing}>
              <option value="2_weeks">2 Weeks</option>
              <option value="1_month">1 Month</option>
              <option value="3_months">3 Months</option>
            </select>
          </div>
        </div>
      </div>
    </Card>

    {/* CV Upload */}
    <Card style={{marginBottom:20}}>
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>{I.upload} Upload Your CV</h3>
      <div
        onClick={()=>!isProcessing && document.getElementById("cv-up")?.click()}
        style={{
          border:`2px dashed ${cv?T.accent:T.border}`,
          borderRadius:14,padding:32,textAlign:"center",
          cursor:isProcessing?"not-allowed":"pointer",
          background:cv?T.accentGlow2:"transparent",
          transition:"all .3s",
          opacity:isProcessing?0.6:1,
        }}
      >
        <input id="cv-up" type="file" accept=".pdf,.docx" hidden onChange={e=>setCv(e.target.files?.[0]||null)} disabled={isProcessing}/>
        {cv?<div className="aSI">
          <div style={{color:T.accent,marginBottom:8}}>{I.check}</div>
          <p style={{fontWeight:600}}>{cv.name}</p>
          <p style={{fontSize:12,color:T.textMut,marginTop:4}}>{(cv.size/1024).toFixed(0)} KB</p>
        </div>:<>
          <div style={{color:T.textMut,marginBottom:8}}>{I.upload}</div>
          <p style={{fontWeight:600}}>Drop your CV or click to browse</p>
          <p style={{fontSize:12,color:T.textMut,marginTop:4}}>PDF or DOCX, max 10 MB</p>
        </>}
      </div>
    </Card>

    {/* POPIA Consent */}
    <Card style={{marginBottom:20,background:T.accentGlow2,border:`1px solid ${T.accentDim}40`}}>
      <label style={{display:"flex",gap:12,cursor:"pointer",alignItems:"flex-start"}}>
        <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} disabled={isProcessing}
          style={{width:20,height:20,accentColor:T.accent,marginTop:2,flexShrink:0}}/>
        <div>
          <p style={{fontSize:14,fontWeight:600,marginBottom:4}}>{I.shield} POPIA Consent</p>
          <p style={{fontSize:12,color:T.textSec,lineHeight:1.5}}>
            I consent to SkillBridge SA processing my CV and profile data. Data encrypted, never shared, deletable from Settings.
          </p>
        </div>
      </label>
    </Card>

    {/* Progress Display */}
    {isProcessing && (
      <Card style={{marginBottom:20,border:`1px solid ${T.accent}40`}} className="aFU">
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span className="aSpin" style={{display:"inline-block",width:20,height:20,border:`2px solid ${T.accent}`,borderTopColor:"transparent",borderRadius:"50%",flexShrink:0}}/>
          <div>
            <p style={{fontSize:14,fontWeight:600,color:T.accent}}>{status === "uploading" ? "Uploading..." : "AI Analysing..."}</p>
            <p style={{fontSize:13,color:T.textSec}}>{progress}</p>
          </div>
        </div>
      </Card>
    )}

    {/* Error Display */}
    {error && (
      <Card style={{marginBottom:20,border:`1px solid ${T.error}`,background:`${T.error}10`}}>
        <p style={{fontSize:14,color:T.error,fontWeight:600,marginBottom:4}}>Error</p>
        <p style={{fontSize:13,color:T.textSec}}>{error}</p>
        <Btn variant="ghost" size="sm" onClick={()=>{setError("");setStatus("idle")}} style={{marginTop:8}}>Try Again</Btn>
      </Card>
    )}

    {/* Success Display */}
    {status === "done" && (
      <Card style={{marginBottom:20,border:`1px solid ${T.success}`,background:`${T.success}10`}} className="aSI">
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{color:T.success}}>{I.check}</div>
          <div>
            <p style={{fontSize:14,fontWeight:600,color:T.success}}>Analysis Complete!</p>
            <p style={{fontSize:13,color:T.textSec}}>Redirecting to your dashboard...</p>
          </div>
        </div>
      </Card>
    )}

    {/* Submit Button */}
    <Btn size="lg" style={{width:"100%"}} disabled={!consent||isProcessing||status==="done"} onClick={handleSubmit}>
      {isProcessing ? (
        <span style={{display:"flex",alignItems:"center",gap:8}}>
          <span className="aSpin" style={{display:"inline-block",width:18,height:18,border:`2px solid ${T.midnight}`,borderTopColor:"transparent",borderRadius:"50%"}}/>
          {progress}
        </span>
      ) : status === "done" ? "Redirecting..." : "Analyse & Build My Bridge \u2192"}
    </Btn>
  </div>;
}
