"use client";
import React from "react";
import { T } from "@/lib/theme/tokens";

export function PageLoading() {
  return (
    <div style={{
      minHeight: "50vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 16,
    }}>
      <div className="aSpin" style={{
        width: 40, height: 40, border: `3px solid ${T.accent}`,
        borderTopColor: "transparent", borderRadius: "50%",
      }} />
      <p style={{ fontSize: 14, color: T.textSec }}>Loading...</p>
    </div>
  );
}

export function InlineLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0" }}>
      <div className="aSpin" style={{
        width: 16, height: 16, border: `2px solid ${T.accent}`,
        borderTopColor: "transparent", borderRadius: "50%",
      }} />
      <span style={{ fontSize: 13, color: T.textSec }}>{text}</span>
    </div>
  );
}
