"use client";
import React from "react";
import { T } from "@/lib/theme/tokens";
import { Btn } from "@/components/ui/base";

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 24,
      background: T.midnight, textAlign: "center",
    }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>&#128517;</div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>404</h1>
      <p style={{ fontSize: 16, color: T.textSec, marginBottom: 24, maxWidth: 400, lineHeight: 1.6 }}>
        This page doesn&apos;t exist. Maybe the URL is wrong, or maybe the page moved.
      </p>
      <Btn onClick={() => window.location.href = "/"}>Back to Home &rarr;</Btn>
    </div>
  );
}
