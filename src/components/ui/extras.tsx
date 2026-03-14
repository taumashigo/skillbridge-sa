"use client";
import React, { useState, useEffect, useCallback } from "react";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn } from "@/components/ui/base";

// --- Loading Skeleton ---
export function Skeleton({ width = "100%", height = 20, borderRadius = 8, style = {} }: any) {
  return <div className="skel" style={{ width, height, borderRadius, ...style }} />;
}

export function CardSkeleton() {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
      <Skeleton width="40%" height={16} style={{ marginBottom: 12 }} />
      <Skeleton width="100%" height={12} style={{ marginBottom: 8 }} />
      <Skeleton width="80%" height={12} style={{ marginBottom: 8 }} />
      <Skeleton width="60%" height={12} />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div>
      <Skeleton width="200px" height={28} style={{ marginBottom: 8 }} />
      <Skeleton width="300px" height={14} style={{ marginBottom: 28 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

// --- Empty State ---
export function EmptyState({ icon, title, description, actionLabel, onAction }: any) {
  return (
    <div style={{
      textAlign: "center", padding: "48px 24px",
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 14
    }}>
      {icon && <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>}
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
      <p style={{ color: T.textSec, fontSize: 14, lineHeight: 1.6, maxWidth: 400, margin: "0 auto 20px" }}>{description}</p>
      {actionLabel && onAction && <Btn onClick={onAction}>{actionLabel}</Btn>}
    </div>
  );
}

// --- Toast Notification System ---
type ToastType = "success" | "error" | "info";
type Toast = { id: number; message: string; type: ToastType };

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];
let nextId = 0;

export function showToast(message: string, type: ToastType = "info") {
  const id = nextId++;
  toasts = [...toasts, { id, message, type }];
  toastListeners.forEach(fn => fn(toasts));
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    toastListeners.forEach(fn => fn(toasts));
  }, 4000);
}

export function ToastContainer() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.push(setItems);
    return () => { toastListeners = toastListeners.filter(fn => fn !== setItems); };
  }, []);

  if (items.length === 0) return null;

  const colors: any = { success: T.success, error: T.error, info: T.accent };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map(t => (
        <div key={t.id} className="aSI" style={{
          background: T.deep, border: `1px solid ${colors[t.type]}`,
          borderRadius: 12, padding: "12px 20px", minWidth: 280,
          boxShadow: "0 8px 32px rgba(0,0,0,.3)", display: "flex", alignItems: "center", gap: 10
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[t.type], flexShrink: 0 }} />
          <p style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{t.message}</p>
        </div>
      ))}
    </div>
  );
}

// --- Streaming Text (typewriter effect for AI responses) ---
export function StreamingText({ text, speed = 20, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setDone(true);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && <span className="aP" style={{ display: "inline-block", width: 6, height: 14, background: T.accent, marginLeft: 2, borderRadius: 1 }} />}
    </span>
  );
}

// --- Confidence Indicator ---
export function ConfidenceIndicator({ value, label }: { value: number; label?: string }) {
  const color = value >= 80 ? T.success : value >= 50 ? T.warm : T.coral;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: `conic-gradient(${color} ${value * 3.6}deg, ${T.surfaceLight} 0)` }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.surface, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color }}>{value}%</span>
        </div>
      </div>
      {label && <span style={{ fontSize: 12, color: T.textSec }}>{label}</span>}
    </div>
  );
}
