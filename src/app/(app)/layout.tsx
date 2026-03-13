"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";

const navItems = [
  {id:"dashboard",path:"/dashboard",icon:I.home,label:"Dashboard"},
  {id:"assessment",path:"/assessment",icon:I.chart,label:"Assessment"},
  {id:"learning",path:"/learning",icon:I.book,label:"Learning"},
  {id:"podcast",path:"/podcast",icon:I.mic,label:"Podcast"},
  {id:"cv-optimiser",path:"/cv-optimiser",icon:I.doc,label:"CV Optimiser"},
  {id:"portfolio",path:"/portfolio",icon:I.target,label:"Portfolio"},
  {id:"interview",path:"/interview",icon:I.interview,label:"Interview"},
  {id:"settings",path:"/settings",icon:I.settings,label:"Settings"},
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sideOpen, setSideOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const userInitial = session?.user?.email?.[0]?.toUpperCase() || "?";

  return <div style={{display:"flex",minHeight:"100vh",background:T.midnight}}>
    {/* Sidebar */}
    <aside style={{width:240,background:T.deep,borderRight:`1px solid ${T.border}`,padding:"20px 12px",display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,bottom:0,zIndex:100,transition:"transform .3s",transform:"translateX(0)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 8px",marginBottom:28}}>
        <div style={{width:32,height:32,background:`linear-gradient(135deg,${T.accent},${T.sky})`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,fontWeight:800,color:T.midnight}}>S</span></div>
        <span style={{fontSize:16,fontWeight:700}}>SkillBridge <span style={{color:T.accent}}>SA</span></span>
      </div>
      <nav style={{flex:1,display:"flex",flexDirection:"column",gap:2}}>
        {navItems.map(n=><button key={n.id} onClick={()=>{router.push(n.path);setSideOpen(false)}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,border:"none",cursor:"pointer",background:isActive(n.path)?T.accentGlow:"transparent",color:isActive(n.path)?T.accent:T.textSec,fontFamily:"'DM Sans'",fontSize:13,fontWeight:isActive(n.path)?600:500,transition:"all .2s",textAlign:"left"}}>
          <span style={{display:"flex"}}>{n.icon}</span>{n.label}
        </button>)}
      </nav>
      <div style={{padding:"12px",borderTop:`1px solid ${T.border}`,marginTop:8}}>
        {session?.user?.email && <p style={{fontSize:11,color:T.textSec,marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{session.user.email}</p>}
        <button onClick={()=>signOut({callbackUrl:"/"})} style={{background:"none",border:"none",cursor:"pointer",color:T.textMut,fontSize:11,fontFamily:"'DM Sans'",padding:0}}>Sign out</button>
        <p style={{fontSize:11,color:T.textMut,marginTop:8}}>SkillBridge SA v2.0</p>
        <p style={{fontSize:11,color:T.textMut}}>POPIA Compliant</p>
      </div>
    </aside>

    {/* Mobile overlay */}
    {sideOpen&&<div onClick={()=>setSideOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:99}}/>}

    {/* Main content */}
    <main style={{flex:1,marginLeft:240,padding:"20px 24px 40px",maxWidth:900,width:"100%"}}>
      {/* Mobile header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <button onClick={()=>setSideOpen(true)} style={{background:"none",border:"none",cursor:"pointer",color:T.textSec,display:"flex",padding:4}}>{I.menu}</button>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:T.surfaceLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700}}>{userInitial}</div>
        </div>
      </div>
      {children}
    </main>
  </div>;
}
