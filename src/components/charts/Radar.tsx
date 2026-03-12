"use client";
import React from "react";
import { T } from "@/lib/theme/tokens";

export function Radar({data,size=240}:any){
  const cx=size/2,cy=size/2,r=size*.38,n=data.length;
  const ang=data.map((_:any,i:number)=>(Math.PI*2*i)/n-Math.PI/2);
  const pts=data.map((d:any,i:number)=>({x:cx+r*(d.value/5)*Math.cos(ang[i]),y:cy+r*(d.value/5)*Math.sin(ang[i])}));
  return <svg width={size} height={size} style={{overflow:"visible"}}>
    {[.25,.5,.75,1].map((ring,i)=><polygon key={i} fill="none" stroke={T.border} strokeWidth=".5" points={ang.map((a:number)=>`${cx+r*ring*Math.cos(a)},${cy+r*ring*Math.sin(a)}`).join(" ")}/>)}
    {ang.map((a:number,i:number)=><line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke={T.border} strokeWidth=".5"/>)}
    <polygon fill={T.accentGlow} stroke={T.accent} strokeWidth="2" points={pts.map((p:any)=>`${p.x},${p.y}`).join(" ")}><animate attributeName="opacity" from="0" to="1" dur=".8s" fill="freeze"/></polygon>
    {data.map((d:any,i:number)=>{const lx=cx+(r+22)*Math.cos(ang[i]),ly=cy+(r+22)*Math.sin(ang[i]);return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill={T.textSec} fontSize="10" fontFamily="'DM Sans'" fontWeight="500">{d.label}</text>})}
  </svg>;
}
