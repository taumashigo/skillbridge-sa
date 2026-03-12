"use client";
import React, { useState } from "react";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";

export function Btn({children,variant="primary",size="md",icon,onClick,disabled,style:s={},...p}: any){
  const base:any={display:"inline-flex",alignItems:"center",gap:8,border:"none",borderRadius:10,cursor:disabled?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,letterSpacing:".01em",transition:"all .2s",opacity:disabled?.5:1,fontSize:size==="sm"?13:size==="lg"?16:14,padding:size==="sm"?"8px 14px":size==="lg"?"14px 28px":"10px 20px"};
  const v:any={primary:{background:T.accent,color:T.midnight},secondary:{background:T.surfaceLight,color:T.text,border:`1px solid ${T.border}`},ghost:{background:"transparent",color:T.textSec},danger:{background:"rgba(239,68,68,.15)",color:T.error},warm:{background:T.warm,color:T.midnight}};
  return <button style={{...base,...v[variant],...s}} onClick={onClick} disabled={disabled} onMouseEnter={(e:any)=>{if(!disabled)e.currentTarget.style.transform="translateY(-1px)"}} onMouseLeave={(e:any)=>{e.currentTarget.style.transform="translateY(0)"}} {...p}>{icon&&<span style={{display:"flex"}}>{icon}</span>}{children}</button>;
}

export function Card({children,style:s={},hover,glow,onClick,className=""}:any){
  const[h,setH]=useState(false);
  return <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} className={className} style={{background:T.surface,border:`1px solid ${h&&hover?T.accent:T.border}`,borderRadius:14,padding:24,transition:"all .25s",transform:h&&hover?"translateY(-2px)":"none",boxShadow:glow&&h?`0 0 30px ${T.accentGlow}`:"0 2px 8px rgba(0,0,0,.15)",cursor:onClick?"pointer":"default",...s}}>{children}</div>;
}

export function Badge({children,color=T.accent,style:s={}}:any){return <span style={{display:"inline-flex",alignItems:"center",fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,background:`${color}18`,color,letterSpacing:".03em",textTransform:"uppercase",...s}}>{children}</span>}

export function PBar({value,max=100,color=T.accent,height=6,style:s={}}:any){const p=Math.min(100,(value/max)*100);return <div style={{width:"100%",height,background:T.surfaceLight,borderRadius:height,overflow:"hidden",...s}}><div style={{width:`${p}%`,height:"100%",background:color,borderRadius:height,transition:"width .8s cubic-bezier(.4,0,.2,1)"}}/></div>}

export function TabBar({tabs,active,onChange}:any){return <div style={{display:"flex",gap:4,background:T.surface,borderRadius:12,padding:4,border:`1px solid ${T.border}`}}>{tabs.map((t:any)=><button key={t.id} onClick={()=>onChange(t.id)} style={{flex:1,padding:"10px 16px",border:"none",borderRadius:10,cursor:"pointer",background:active===t.id?T.accent:"transparent",color:active===t.id?T.midnight:T.textSec,fontFamily:"'DM Sans'",fontSize:13,fontWeight:active===t.id?700:500,transition:"all .2s"}}>{t.label}</button>)}</div>}

export function Modal({open,onClose,title,children,width=560}:any){if(!open)return null;return <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)"}} onClick={onClose}><div className="aSI" onClick={(e:any)=>e.stopPropagation()} style={{background:T.deep,border:`1px solid ${T.border}`,borderRadius:18,padding:28,maxWidth:width,width:"90%",maxHeight:"80vh",overflow:"auto"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h3 style={{fontSize:18,fontWeight:700}}>{title}</h3><button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:T.textMut,display:"flex"}}>{I.close}</button></div>{children}</div></div>}

