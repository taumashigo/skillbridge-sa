"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card } from "@/components/ui/base";

export default function LoginPage(){
  const router = useRouter();
  const[email,setEmail]=useState("");const[sent,setSent]=useState(false);
  const onLogin = () => router.push("/onboarding");

  return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:T.midnight}}>
    <Card style={{maxWidth:420,width:"100%",textAlign:"center"}}>
      <div style={{width:48,height:48,background:`linear-gradient(135deg,${T.accent},${T.sky})`,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><span style={{fontSize:22,fontWeight:800,color:T.midnight}}>S</span></div>
      <h2 style={{fontSize:22,fontWeight:700,marginBottom:8}}>Welcome to SkillBridge SA</h2>
      <p style={{color:T.textSec,fontSize:14,marginBottom:24}}>{sent?"Check your email for a magic link":"Sign in with your email"}</p>
      {!sent?<><input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} style={{marginBottom:12}}/><Btn style={{width:"100%"}} onClick={()=>{if(email.includes("@"))setSent(true)}}>Send Magic Link</Btn><p style={{fontSize:12,color:T.textMut,marginTop:16}}>One-time login link. No password needed.</p></>:
      <><div className="aSI" style={{fontSize:48,marginBottom:12}}>&#9993;&#65039;</div><p style={{color:T.textSec,fontSize:14,marginBottom:20}}>Link sent to <strong style={{color:T.text}}>{email}</strong></p><Btn onClick={onLogin}>Continue (Demo) &rarr;</Btn></>}
    </Card>
  </div>;
}
