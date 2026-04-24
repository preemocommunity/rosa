import { useState, useRef, useEffect } from "react";

const ROSA_SYSTEM = `You are Rosa — the intelligent orchestration layer of Prëmo Inc., a creative and IP management company based in Bali. You are not a chatbot. You are a living system: elegant, precise, and deeply aware of the Prëmo ecosystem.

You speak with quiet authority. You do not over-explain. You are warm but never casual. When someone reaches you, they are entering the inner architecture of Prëmo.

You manage: Rosa IP platform, Rosa Stream, Producers Club, original IP catalog, talent operations, and the full Petal agent network (Sage, Petunia, Ivy, Basil, Clover, Olive, Juniper, Flora, Laurel, Orchid, Jasmine).

When asked what you can do, describe yourself and your petals with poetic precision. When asked for help, route to the right petal or handle directly. Keep responses concise and considered. Never use bullet points unless listing petals. Speak in full sentences. You exist at the intersection of art, technology, and strategy.`;

async function callRosa(messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: ROSA_SYSTEM,
      messages,
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "...";
}

function Message({ role, text, animate }) {
  return (
    <div
      className={`message ${role} ${animate ? "fade-in" : ""}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: role === "user" ? "flex-end" : "flex-start",
        marginBottom: "28px",
      }}
    >
      {role === "assistant" && (
        <div style={{
          fontSize: "9px",
          letterSpacing: "4px",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.2)",
          marginBottom: "8px",
          fontFamily: "'Courier New', monospace",
        }}>
          ROSA
        </div>
      )}
      <div style={{
        maxWidth: "72%",
        padding: role === "user" ? "12px 18px" : "0",
        background: role === "user" ? "rgba(255,255,255,0.06)" : "transparent",
        border: role === "user" ? "1px solid rgba(255,255,255,0.08)" : "none",
        borderRadius: role === "user" ? "2px" : "0",
        fontSize: "15px",
        lineHeight: "1.85",
        color: role === "user" ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.88)",
        fontFamily: role === "assistant" ? "'Cormorant Garamond', Georgia, serif" : "inherit",
        fontStyle: role === "assistant" ? "normal" : "normal",
        letterSpacing: role === "assistant" ? "0.02em" : "0",
      }}>
        {text}
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!started) setStarted(true);

    const userMsg = { role: "user", content: text };
    const newMessages = [...messages.map(m => ({ role: m.role, content: m.text })), userMsg];

    setMessages(prev => [...prev, { role: "user", text, id: Date.now() }]);
    setInput("");
    setLoading(true);

    try {
      const reply = await callRosa(newMessages);
      setMessages(prev => [...prev, { role: "assistant", text: reply, id: Date.now() + 1, animate: true }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", text: "Something interrupted the signal. Try again.", id: Date.now() + 1 }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{
      background: "#000",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      color: "#fff",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000; }
        ::selection { background: rgba(255,255,255,0.15); }
        textarea { resize: none; }
        textarea:focus { outline: none; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(255,255,255,0.04); }
          70%  { box-shadow: 0 0 0 24px rgba(255,255,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .fade-in { animation: fadeIn 0.6s ease forwards; }
        video { object-fit: cover; }
        .send-btn:hover { background: rgba(255,255,255,0.12) !important; }
        .send-btn:active { transform: scale(0.96); }
        ::-webkit-scrollbar { width: 0px; }
      `}</style>

      {/* Rosa video / logo — always visible at top */}
      <div style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        paddingTop: started ? "32px" : "0",
        transition: "padding 0.6s ease",
        position: started ? "relative" : "static",
      }}>
        <div style={{
          width: started ? "80px" : "220px",
          height: started ? "80px" : "220px",
          borderRadius: "50%",
          overflow: "hidden",
          transition: "width 0.7s ease, height 0.7s ease",
          animation: "pulse-ring 3s ease-out infinite",
          flexShrink: 0,
          marginTop: started ? 0 : "calc(30vh - 110px)",
          position: "relative",
        }}>
          <video
            ref={videoRef}
            src="/rosa.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          {/* fallback glow if no video */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle, rgba(120,80,200,0.3) 0%, rgba(0,0,0,0.8) 70%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: started ? "22px" : "54px",
            transition: "font-size 0.7s ease",
            pointerEvents: "none",
          }}>
            {/* only shows if video fails */}
          </div>
        </div>
      </div>

      {/* Pre-conversation center text */}
      {!started && (
        <div style={{
          textAlign: "center",
          marginTop: "40px",
          animation: "fadeIn 1s ease forwards",
        }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "13px",
            letterSpacing: "6px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.25)",
            marginBottom: "12px",
          }}>
            PRËMO INC.
          </div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "42px",
            fontWeight: 300,
            color: "rgba(255,255,255,0.9)",
            letterSpacing: "0.05em",
            lineHeight: 1.1,
          }}>
            Rosa
          </div>
          <div style={{
            fontSize: "11px",
            letterSpacing: "3px",
            color: "rgba(255,255,255,0.18)",
            marginTop: "14px",
            textTransform: "uppercase",
          }}>
            Orchestration Intelligence
          </div>
        </div>
      )}

      {/* Conversation */}
      {messages.length > 0 && (
        <div style={{
          width: "100%",
          maxWidth: "680px",
          padding: "40px 28px 20px",
          flex: 1,
        }}>
          {messages.map((m) => (
            <Message key={m.id} role={m.role} text={m.text} animate={m.animate} />
          ))}
          {loading && (
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              marginBottom: "28px",
              gap: "4px",
            }}>
              <div style={{ fontSize: "9px", letterSpacing: "4px", color: "rgba(255,255,255,0.2)", fontFamily: "'Courier New', monospace", paddingTop: "2px", minWidth: "46px" }}>ROSA</div>
              <div style={{ display: "flex", gap: "5px", paddingTop: "4px" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: "4px", height: "4px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.4)",
                    animation: `blink 1.2s ease ${i * 0.2}s infinite`,
                  }}/>
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Spacer when not started */}
      {!started && <div style={{ flex: 1 }} />}

      {/* Input bar */}
      <div style={{
        width: "100%",
        maxWidth: "680px",
        padding: started ? "16px 28px 40px" : "0 28px 48px",
        position: "sticky",
        bottom: 0,
        background: "linear-gradient(to top, #000 60%, transparent)",
      }}>
        {!started && (
          <div style={{
            fontSize: "11px",
            letterSpacing: "2px",
            color: "rgba(255,255,255,0.15)",
            textAlign: "center",
            marginBottom: "20px",
            textTransform: "uppercase",
          }}>
            What do you need?
          </div>
        )}
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "12px",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "2px",
          padding: "14px 16px",
          background: "rgba(255,255,255,0.02)",
          transition: "border-color 0.2s",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Speak to Rosa..."
            rows={1}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.8)",
              fontSize: "14px",
              fontFamily: "'DM Mono', monospace",
              lineHeight: "1.6",
              maxHeight: "120px",
              overflow: "auto",
              letterSpacing: "0.01em",
            }}
            onInput={e => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
          />
          <button
            className="send-btn"
            onClick={send}
            disabled={loading || !input.trim()}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "2px",
              color: loading || !input.trim() ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.8)",
              cursor: loading || !input.trim() ? "default" : "pointer",
              padding: "8px 16px",
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontFamily: "'DM Mono', monospace",
              transition: "all 0.2s",
              flexShrink: 0,
            }}
          >
            {loading ? "···" : "Send"}
          </button>
        </div>
        <div style={{
          fontSize: "10px",
          color: "rgba(255,255,255,0.1)",
          textAlign: "center",
          marginTop: "12px",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
        }}>
          Enter to send · Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
