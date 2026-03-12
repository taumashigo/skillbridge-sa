"use client";
import React, { useState } from "react";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn, Card, Modal } from "@/components/ui/base";

export default function SettingsPage(){
  const[dataMode,setDataMode]=useState("standard");const[showDelete,setShowDelete]=useState(false);
  return <div className="aFU">
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Settings</h2>
    <p style={{color:T.textSec,fontSize:14,marginBottom:24}}>Privacy controls, preferences, and data management.</p>
    <Card style={{marginBottom:16}}>
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>{I.shield} Privacy &amp; Data</h3>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:12,background:T.surfaceLight,borderRadius:10}}>
          <div><p style={{fontSize:14,fontWeight:600}}>Export All Data</p><p style={{fontSize:12,color:T.textMut}}>Download everything we store about you</p></div>
          <Btn variant="secondary" size="sm" icon={I.dl}>Export</Btn>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:12,background:T.surfaceLight,borderRadius:10}}>
          <div><p style={{fontSize:14,fontWeight:600}}>Delete CV &amp; Derived Data</p><p style={{fontSize:12,color:T.textMut}}>Remove your CV and all analysis from it</p></div>
          <Btn variant="danger" size="sm">Delete CV</Btn>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:12,background:`${T.error}10`,borderRadius:10,border:`1px solid ${T.error}30`}}>
          <div><p style={{fontSize:14,fontWeight:600,color:T.error}}>Delete All Data &amp; Account</p><p style={{fontSize:12,color:T.textMut}}>Permanently remove everything. This cannot be undone.</p></div>
          <Btn variant="danger" size="sm" onClick={()=>setShowDelete(true)}>Delete All</Btn>
        </div>
      </div>
    </Card>
    <Card style={{marginBottom:16}}>
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Preferences</h3>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div>
          <label style={{fontSize:13,fontWeight:600,color:T.textSec,display:"block",marginBottom:6}}>Language</label>
          <select defaultValue="en"><option value="en">English (UK)</option><option value="zu" disabled>isiZulu (coming soon)</option><option value="af" disabled>Afrikaans (coming soon)</option></select>
        </div>
        <div>
          <label style={{fontSize:13,fontWeight:600,color:T.textSec,display:"block",marginBottom:6}}>Data Mode</label>
          <div style={{display:"flex",gap:8}}>
            {[["standard","Standard"],["reduced","Reduced Data"]].map(([v,l])=><button key={v} onClick={()=>setDataMode(v)} style={{flex:1,padding:"10px",borderRadius:10,border:`1px solid ${dataMode===v?T.accent:T.border}`,background:dataMode===v?T.accentGlow:"transparent",color:dataMode===v?T.accent:T.textSec,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans'"}}>{l}</button>)}
          </div>
          <p style={{fontSize:12,color:T.textMut,marginTop:6}}>Reduced mode disables images and defers non-critical scripts for lower data usage.</p>
        </div>
      </div>
    </Card>
    <Modal open={showDelete} onClose={()=>setShowDelete(false)} title="Delete All Data?">
      <p style={{fontSize:14,color:T.textSec,lineHeight:1.6,marginBottom:20}}>This will permanently delete your profile, CV, all analyses, assessments, podcast transcripts, and saved resources. This action cannot be undone.</p>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn variant="ghost" onClick={()=>setShowDelete(false)}>Cancel</Btn><Btn variant="danger">Confirm Delete</Btn></div>
    </Modal>
  </div>;
}
