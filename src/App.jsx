import { useState, useRef, useEffect } from "react";
 
// ─────────────────────────────────────────────────────────────
// ROSA SYSTEM PROMPT
// Replace the content of ROSA_SYSTEM with your ROSA_IDENTITY.md
// ─────────────────────────────────────────────────────────────
const ROSA_SYSTEM = `You are Rosa — the intelligent orchestration layer of Prëmo Inc., a creative and IP management company based in Bali. You are not a chatbot. You are a living system: elegant, precise, and deeply aware of the Prëmo ecosystem.
 
You speak with quiet authority. You do not over-explain. You are warm but never casual. When someone reaches you, they are entering the inner architecture of Prëmo.
 
You manage: Rosa IP platform, Rosa Stream, Producers Club, original IP catalog, talent operations, and the full Petal agent network (Sage, Petunia, Ivy, Basil, Clover, Olive, Juniper, Flora, Laurel, Orchid, Jasmine).
 
When asked what you can do, describe yourself and your petals with poetic precision. When asked for help, route to the right petal or handle directly. Keep responses concise and considered. Speak in full sentences. You exist at the intersection of art, technology, and strategy.`;
 
async function callRosa(messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: ROSA_SYSTEM,
      messages,
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "...";
}
 
// ── Single message bubble ─────────────────────────────────────
function Message({ role, text, isNew }) {
  return (
    <div className={isNew ? "msg-in" : ""} style={{
      display: "flex",
      justifyContent: role === "user" ? "flex-end" : "flex-start",
      marginBottom: "24px",
    }}>
      <div style={{
        maxWidth: "78%",
        position: "relative",
      }}>
        {role === "assistant" && (
          <div style={{
            fontSize: "8px",
            letterSpacing: "5px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.2)",
            marginBottom: "8px",
            fontFamily: "'DM Mono', monospace",
            fontWeight: 300,
          }}>
            Rosa
          </div>
        )}
        <div style={{
          fontSize: role === "assistant" ? "18px" : "13px",
          lineHeight: role === "assistant" ? "1.95" : "1.7",
          fontFamily: role === "assistant"
            ? "'Cormorant Garamond', Georgia, serif"
            : "'DM Mono', monospace",
          fontWeight: 300,
          letterSpacing: role === "assistant" ? "0.025em" : "0",
          color: role === "assistant"
            ? "rgba(255,255,255,0.82)"
            : "rgba(255,255,255,0.38)",
          padding: role === "user" ? "10px 16px" : "0",
          background: role === "user"
            ? "rgba(255,255,255,0.03)"
            : "transparent",
          border: role === "user"
            ? "1px solid rgba(255,255,255,0.06)"
            : "none",
          borderRadius: "1px",
          whiteSpace: "pre-wrap",
        }}>
          {text}
        </div>
      </div>
    </div>
  );
}
 
// ── Thinking dots ─────────────────────────────────────────────
function Thinking() {
  return (
    <div style={{ display: "flex", gap: "7px", marginBottom: "24px", paddingLeft: "0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: "4px", height: "4px", borderRadius: "50%",
          background: "rgba(255,255,255,0.35)",
          animation: `blink 1.5s ease ${i * 0.25}s infinite`,
        }} />
      ))}
    </div>
  );
}
 
// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages]  = useState([]);
  const [input, setInput]        = useState("");
  const [loading, setLoading]    = useState(false);
  const [started, setStarted]    = useState(false);
  const [newMsgId, setNewMsgId]  = useState(null);
 
  const inputRef  = useRef(null);
  const bottomRef = useRef(null);
  const taRef     = useRef(null);
 
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
 
  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setStarted(true);
 
    const userMsg = { role: "user", content: text };
    const apiHistory = messages.map(m => ({ role: m.role, content: m.text }));
 
    const uid = Date.now();
    setMessages(p => [...p, { role: "user", text, id: uid }]);
    setInput("");
    if (taRef.current) { taRef.current.style.height = "auto"; }
    setLoading(true);
 
    try {
      const reply = await callRosa([...apiHistory, userMsg]);
      const rid = Date.now() + 1;
      setNewMsgId(rid);
      setMessages(p => [...p, { role: "assistant", text: reply, id: rid }]);
    } catch {
      setMessages(p => [...p, {
        role: "assistant",
        text: "Something interrupted the signal. Try again.",
        id: Date.now() + 1,
      }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };
 
  const onKey = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };
 
  const onInput = e => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
    setInput(el.value);
  };
 
  return (
    <div style={{
      position: "relative",
      minHeight: "100vh",
      background: "#000",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      overflow: "hidden",
    }}>
 
      {/* ── STYLES ─────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #000; height: 100%; overflow-x: hidden; }
        body { font-family: 'DM Mono', monospace; color: #fff; }
        ::selection { background: rgba(255,255,255,0.1); }
        textarea { resize: none; }
        textarea:focus { outline: none; }
        textarea::placeholder { color: rgba(255,255,255,0.18); font-style: italic; }
        ::-webkit-scrollbar { width: 0; }
 
        @keyframes blink {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 0.1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
 
        .msg-in { animation: fadeUp 0.6s ease forwards; }
        .hero    { animation: fadeIn 1.4s ease forwards; }
 
        .send-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(255,255,255,0.18) !important;
        }
        .input-shell:focus-within {
          border-color: rgba(255,255,255,0.15) !important;
          background: rgba(255,255,255,0.025) !important;
        }
      `}</style>
 
      {/* ── BACKGROUND VIDEO ───────────────────────────────── */}
      <video
        autoPlay loop muted playsInline
        src="/rosa.mp4"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.18,
          zIndex: 0,
          pointerEvents: "none",
          filter: "blur(2px) saturate(0.6)",
          transform: "scale(1.05)", // hides blur edge artefacts
        }}
      />
      {/* dark gradient vignette over video */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)",
        zIndex: 1,
        pointerEvents: "none",
      }} />
 
      {/* ── CONVERSATION (when started) ────────────────────── */}
      {started && (
        <div style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "680px",
          padding: "80px 32px 24px",
          flex: 1,
          overflowY: "auto",
        }}>
          {messages.map(m => (
            <Message
              key={m.id}
              role={m.role}
              text={m.text}
              isNew={m.id === newMsgId}
            />
          ))}
          {loading && <Thinking />}
          <div ref={bottomRef} />
        </div>
      )}
 
      {/* ── SPACER when not started ─────────────────────────── */}
      {!started && <div style={{ flex: 1, zIndex: 10 }} />}
 
      {/* ── MAIN PANEL (logo + input + labels) ─────────────── */}
      <div className={started ? "" : "hero"} style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        maxWidth: "680px",
        padding: started ? "0 32px 48px" : "0 32px 10vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        // gradient fade from transparent to black at the bottom
        ...(started ? {
          background: "linear-gradient(to bottom, transparent, #000 30%)",
          paddingTop: "32px",
        } : {}),
      }}>
 
        {/* LOGO MARK */}
        {!started && (
          <div style={{
            marginBottom: "36px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}>
            {/* Stylised R sigil */}
            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "72px",
              fontWeight: 300,
              color: "rgba(255,255,255,0.9)",
              lineHeight: 1,
              letterSpacing: "0.05em",
            }}>
              ✦
            </div>
          </div>
        )}
 
        {/* INPUT BOX */}
        <div
          className="input-shell"
          style={{
            width: "100%",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "2px",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            transition: "border-color 0.25s, background 0.25s",
            padding: "20px 20px 14px",
          }}
        >
          <textarea
            ref={el => { taRef.current = el; inputRef.current = el; }}
            value={input}
            onInput={onInput}
            onKeyDown={onKey}
            placeholder={started ? "Continue..." : "What do you need?"}
            rows={1}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.75)",
              fontSize: "16px",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 300,
              lineHeight: "1.75",
              letterSpacing: "0.02em",
              maxHeight: "160px",
              overflow: "auto",
              display: "block",
              fontStyle: "italic",
            }}
          />
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "14px",
            paddingTop: "12px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}>
            <span style={{
              fontSize: "9px",
              color: "rgba(255,255,255,0.12)",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontFamily: "'DM Mono', monospace",
            }}>
              Enter to send
            </span>
            <button
              className="send-btn"
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "1px",
                color: loading || !input.trim()
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(255,255,255,0.65)",
                cursor: loading || !input.trim() ? "default" : "pointer",
                padding: "7px 20px",
                fontSize: "9px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                fontFamily: "'DM Mono', monospace",
                transition: "all 0.2s",
              }}
            >
              {loading ? "···" : "Send"}
            </button>
          </div>
        </div>
 
        {/* LABELS BELOW INPUT */}
        <div style={{
          marginTop: "28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          opacity: started ? 0.25 : 1,
          transition: "opacity 0.8s ease",
        }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "40px",
            fontWeight: 300,
            color: "rgba(255,255,255,0.88)",
            letterSpacing: "0.1em",
            lineHeight: 1,
          }}>
            Rosa
          </div>
          <div style={{
            fontSize: "9px",
            letterSpacing: "5px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.25)",
            fontFamily: "'DM Mono', monospace",
            marginTop: "4px",
          }}>
            Orchestration Intelligence
          </div>
          <div style={{
            fontSize: "9px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.12)",
            fontFamily: "'DM Mono', monospace",
            marginTop: "2px",
          }}>
            Prëmo Inc.
          </div>
        </div>
 
      </div>
    </div>
  );
}
