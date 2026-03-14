"use client";
import React, { useState, useRef, useEffect } from "react";
import { T } from "@/lib/theme/tokens";
import { I } from "@/lib/theme/icons";
import { Btn } from "@/components/ui/base";

export function CoachDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: "assistant", content: "Hi! I'm your SkillBridge Career Coach. I know your CV, your target role, and your skill gaps. Ask me anything — should you apply for a role? How to explain a career gap? What salary to aim for? I'm here to help." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, conversationId }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error?.message || "Failed to get response");

      setMessages(prev => [...prev, { role: "assistant", content: data.data.response }]);
      if (data.data.conversationId) setConversationId(data.data.conversationId);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `Sorry, I encountered an error: ${err.message}. Please try again.` }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(420px, 100vw)", zIndex: 1000, display: "flex", flexDirection: "column", background: T.deep, borderLeft: `1px solid ${T.border}`, boxShadow: "-8px 0 32px rgba(0,0,0,.4)" }} className="aSR">
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, ${T.sky})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: T.midnight }}>AI</span>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700 }}>Career Coach</p>
            <p style={{ fontSize: 11, color: T.textMut }}>Knows your CV &amp; goals</p>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMut, display: "flex", padding: 4 }}>{I.close}</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%",
              padding: "12px 16px",
              borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: m.role === "user" ? T.accent : T.surface,
              color: m.role === "user" ? T.midnight : T.text,
              fontSize: 14,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{ padding: "12px 16px", borderRadius: "14px 14px 14px 4px", background: T.surface }}>
              <div style={{ display: "flex", gap: 6 }}>
                <span className="aP" style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, animationDelay: "0s" }} />
                <span className="aP" style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, animationDelay: "0.2s" }} />
                <span className="aP" style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length <= 2 && (
        <div style={{ padding: "0 20px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["Should I apply for this role?", "How do I explain my career gap?", "What salary should I aim for?", "Help me prepare for interviews"].map(s => (
            <button key={s} onClick={() => { setInput(s); }} style={{
              padding: "6px 12px", borderRadius: 8, background: T.surface,
              border: `1px solid ${T.border}`, color: T.textSec, fontSize: 12,
              cursor: "pointer", fontFamily: "'DM Sans'",
            }}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "12px 20px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask your career coach..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
          disabled={loading}
          style={{ flex: 1, borderRadius: 10 }}
        />
        <Btn onClick={sendMessage} disabled={!input.trim() || loading} style={{ padding: "10px 16px" }}>
          {I.arrow}
        </Btn>
      </div>
    </div>
  );
}

// Floating button to open the coach
export function CoachButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 999,
      width: 56, height: 56, borderRadius: "50%",
      background: `linear-gradient(135deg, ${T.accent}, ${T.sky})`,
      border: "none", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 4px 20px ${T.accentGlow}`,
      transition: "transform .2s, box-shadow .2s",
    }}
      onMouseEnter={e => { (e.target as any).style.transform = "scale(1.1)"; }}
      onMouseLeave={e => { (e.target as any).style.transform = "scale(1)"; }}
    >
      {I.interview}
    </button>
  );
}
