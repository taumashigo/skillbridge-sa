"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card } from "@/components/ui/base";

export default function LoginPage(){
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVerify = searchParams.get("verify") === "true";
  const isError = searchParams.get("error") === "true";
  const[email,setEmail]=useState("");
  const[sending,setSending]=useState(false);
  const[sent,setSent]=useState(isVerify);

  const handleSend = async () => {
    if (!email.includes("@")) return;
    setSending(true);
    try {
      await signIn("email", { email, redirect: false, callbackUrl: "/dashboard" });
      setSent(true);
    } catch (err) {
      console.error("Sign in error:", err);
    } finally {
      setSending(false);
    }
  };

  return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:T.midnight}}>
    <Card style={{maxWidth:420,width:"100%",textAlign:"center"}}>
      <div style={{width:48,height:48,background:`linear-gradient(135deg,${T.accent},${T.sky})`,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><span style={{fontSize:22,fontWeight:800,color:T.midnight}}>S</span></div>
      <h2 style={{fontSize:22,fontWeight:700,marginBottom:8}}>Welcome to SkillBridge SA</h2>

      {isError && <p style={{color:T.error,fontSize:14,marginBottom:16,padding:"8px 12px",background:`${T.error}15`,borderRadius:8}}>Something went wrong. Please try again.</p>}

      <p style={{color:T.textSec,fontSize:14,marginBottom:24}}>
        {sent ? "Check your email for a magic link" : "Sign in with your email"}
      </p>

      {!sent ? <>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter") handleSend() }}
          style={{marginBottom:12}}
        />
        <Btn style={{width:"100%"}} onClick={handleSend} disabled={sending || !email.includes("@")}>
          {sending ? "Sending..." : "Send Magic Link"}
        </Btn>
        <p style={{fontSize:12,color:T.textMut,marginTop:16}}>One-time login link. No password needed.</p>
      </> : <>
        <div className="aSI" style={{fontSize:48,marginBottom:12}}>&#9993;&#65039;</div>
        <p style={{color:T.textSec,fontSize:14,marginBottom:8}}>
          Magic link sent to <strong style={{color:T.text}}>{email || "your email"}</strong>
        </p>
        <p style={{color:T.textMut,fontSize:12,marginBottom:20}}>Click the link in your email to sign in. Check spam if you don&apos;t see it.</p>
        <Btn variant="ghost" onClick={()=>setSent(false)}>Try a different email</Btn>
      </>}
    </Card>
  </div>;
}
