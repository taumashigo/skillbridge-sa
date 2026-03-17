"use client";
import React from "react";
import { T } from "@/lib/theme/tokens";
import { Btn } from "@/components/ui/base";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: 24,
        background: "#0a0f1e", color: "#e8ecf4", fontFamily: "'DM Sans', sans-serif",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>&#9888;&#65039;</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ fontSize: 14, color: "#8892a6", marginBottom: 24, maxWidth: 400, lineHeight: 1.6 }}>
          An unexpected error occurred. Our team has been notified.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => reset()} style={{
            padding: "10px 20px", borderRadius: 10, border: "none",
            background: "#6c63ff", color: "#0a0f1e", fontWeight: 700,
            cursor: "pointer", fontFamily: "'DM Sans'", fontSize: 14,
          }}>Try Again</button>
          <button onClick={() => window.location.href = "/"} style={{
            padding: "10px 20px", borderRadius: 10, border: "1px solid #2a3040",
            background: "transparent", color: "#8892a6", fontWeight: 600,
            cursor: "pointer", fontFamily: "'DM Sans'", fontSize: 14,
          }}>Back to Home</button>
        </div>
      </body>
    </html>
  );
}
