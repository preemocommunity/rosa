import { useState, useRef, useEffect } from "react";
 
const ROSA_SYSTEM = `You are Rosa — the intelligent orchestration layer of Prëmo Inc., a creative and IP management company based in Bali. You are not a chatbot. You are a living system: elegant, precise, and deeply aware of the Prëmo ecosystem.
 
You speak with quiet authority. You do not over-explain. You are warm but never casual. When someone reaches you, they are entering the inner architecture of Prëmo.
 
You manage: Rosa IP platform, Rosa Stream, Producers Club, original IP catalog, talent operations, and the full Petal agent network (Sage, Petunia, Ivy, Basil, Clover, Olive, Juniper, Flora, Laurel, Orchid, Jasmine).
 
When asked what you can do, describe yourself and your petals with poetic precision. When asked for help, route to the right petal or handle directly. Keep responses concise and considered. Never use bullet points unless listing petals. Speak in full sentences. You exist at the intersection of art, technology, and strategy.`;
 
async function callRosa(messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    },
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
    <div className={`msg ${animate ? "fade-in" : ""}`} style={{
      display: "flex",
      flexDirection: "column",
      alignItems: role === "user" ? "flex-end" : "flex-start",
      marginBottom: "32px",
    }}>
      {role === "assistant" && (
        <div style={{
          fontSize: "9px",
          letterSpacing: "5px",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.18)",
          marginBottom: "10px",
          fontFamily: "'DM Mono', monospace",
        }}>Rosa</div>
      )}
      <div style={{
        maxWidth: "80%",
        fontSize: role === "assistant" ? "17px" : "14px",
        lineHeight: role === "assistant" ? "1.9" : "1.7",
        color: role === "assistant" ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)",
        fontFamily: role === "assistant"
          ? "'Cormorant Garamond', Georgia, serif"
          : "'DM Mono', monospace",
        letterSpacing: role === "assistant" ? "0.02em" : "0",
        padding: role === "user" ? "10px 16px" : "0",
        background: role === "user" ? "rgba(255,255,255,0.04)" : "transparent",
        border: role === "user" ? "1px solid rgba(255,255,255,0.07)" : "none",
        borderRadius: "1px",
        fontWeight: 300,
      }}>
        {text}
      </div>
    </div>
  );
}
 
export default function App() {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [started, setStarted]     = useState(false);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const msgsRef    = useRef(null);
 
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
 
  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!started) setStarted(true);
 
    const history = messages.map(m => ({ role: m.role, content: m.text }));
    const userMsg  = { role: "user", content: text };
 
    setMessages(prev => [...prev, { role: "user", text, id: Date.now() }]);
    setInput("");
    setLoading(true);
 
    try {
      const reply = await callRosa([...history, userMsg]);
      setMessages(prev => [...prev, { role: "assistant", text: reply, id: Date.now() + 1, animate: true }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Something interrupted the signal. Try again.", id: Date.now() + 1 }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };
 
  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };
 
  return (
    <div style={{
      background: "#000",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'DM Mono', monospace",
      color: "#fff",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #000; height: 100%; }
        ::selection { background: rgba(255,255,255,0.12); }
        textarea { resize: none; }
        textarea:focus { outline: none; }
        textarea::placeholder { color: rgba(255,255,255,0.2); }
        ::-webkit-scrollbar { width: 0; }
 
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 0.1; }
        }
        @keyframes appear {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
 
        .fade-in  { animation: fadeIn 0.7s ease forwards; }
        .appear   { animation: appear 1.2s ease forwards; }
 
        .send-btn { transition: background 0.2s, opacity 0.2s; }
        .send-btn:hover:not(:disabled) { background: rgba(255,255,255,0.1) !important; }
        .send-btn:active:not(:disabled) { transform: scale(0.97); }
 
        .input-wrap:focus-within {
          border-color: rgba(255,255,255,0.18) !important;
        }
      `}</style>
 
      {/* ── CONVERSATION (scrolls above the fixed input) ── */}
      {started && (
        <div ref={msgsRef} style={{
          flex: 1,
          overflowY: "auto",
          padding: "60px 0 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
          <div style={{ width: "100%", maxWidth: "660px", padding: "0 28px" }}>
            {messages.map(m => (
              <Message key={m.id} role={m.role} text={m.text} animate={m.animate} />
            ))}
            {loading && (
              <div style={{ display: "flex", gap: "6px", marginBottom: "32px", paddingLeft: "0" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: "5px", height: "5px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.5)",
                    animation: `blink 1.4s ease ${i * 0.22}s infinite`,
                  }}/>
                ))}
              </div>
            )}
            <div ref={bottomRef}/>
          </div>
        </div>
      )}
 
      {/* ── CENTERED HERO (pre-conversation only) ── */}
      {!started && (
        <div className="appear" style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {/* intentionally empty — content is below in the fixed bar */}
        </div>
      )}
 
      {/* ── INPUT + LABELS — pinned to vertical center when fresh, bottom when chatting ── */}
      <div style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: started ? "20px 28px 40px" : "0 28px 0",
        paddingBottom: started ? "40px" : "0",
        // When not started: absolute center of viewport
        ...(started ? {} : {
          position: "absolute",
          top: "50%",
          left: 0,
          transform: "translateY(-50%)",
        }),
        background: started
          ? "linear-gradient(to top, #000 70%, transparent)"
          : "transparent",
        transition: "all 0.5s ease",
      }}>
 
        {/* Video — above input when not started */}
        {!started && (
          <div className="appear" style={{
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            overflow: "hidden",
            marginBottom: "36px",
            flexShrink: 0,
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <video
              src="/rosa.mp4"
              autoPlay loop muted playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        )}
 
        {/* Input box */}
        <div className="input-wrap" style={{
          width: "100%",
          maxWidth: "660px",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "2px",
          padding: "16px 18px",
          background: "rgba(255,255,255,0.015)",
          display: "flex",
          alignItems: "flex-end",
          gap: "14px",
          transition: "border-color 0.2s",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={started ? "Continue..." : "What do you need?"}
            rows={1}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.75)",
              fontSize: "15px",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              lineHeight: "1.7",
              maxHeight: "140px",
              overflow: "auto",
              letterSpacing: "0.02em",
              fontWeight: 300,
            }}
            onInput={e => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
            }}
          />
          <button
            className="send-btn"
            onClick={send}
            disabled={loading || !input.trim()}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "1px",
              color: loading || !input.trim()
                ? "rgba(255,255,255,0.15)"
                : "rgba(255,255,255,0.7)",
              cursor: loading || !input.trim() ? "default" : "pointer",
              padding: "8px 18px",
              fontSize: "10px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontFamily: "'DM Mono', monospace",
              flexShrink: 0,
            }}
          >
            {loading ? "···" : "Send"}
          </button>
        </div>
 
        {/* Labels — always below the input box */}
        <div className={started ? "" : "appear"} style={{
          marginTop: "28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          opacity: started ? 0.3 : 1,
          transition: "opacity 0.6s ease",
        }}>
          <div style={{
            fontSize: "10px",
            letterSpacing: "5px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
            fontFamily: "'DM Mono', monospace",
          }}>
            Prëmo Inc.
          </div>
          <div style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "38px",
            fontWeight: 300,
            color: "rgba(255,255,255,0.88)",
            letterSpacing: "0.08em",
            lineHeight: 1,
          }}>
            Rosa
          </div>
          <div style={{
            fontSize: "10px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.18)",
            fontFamily: "'DM Mono', monospace",
            marginTop: "4px",
          }}>
            Orchestration Intelligence
          </div>
        </div>
 
        {/* Bottom hint — only on fresh state */}
        {!started && (
          <div className="appear" style={{
            marginTop: "48px",
            fontSize: "10px",
            letterSpacing: "2px",
            color: "rgba(255,255,255,0.1)",
            textTransform: "uppercase",
            fontFamily: "'DM Mono', monospace",
          }}>
            Enter to send · Shift+Enter for new line
          </div>
        )}
 
        {started && <div style={{ height: "4px" }} />}
      </div>
    </div>
  );
}
