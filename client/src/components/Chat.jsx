import { useState } from "react";
import api from "../api";

const quickPrompts = [
  "Why is my cash flow low?",
  "Where can I cut costs?",
  "What is my break even point?",
  "Forecast next quarter revenue",
];

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text:
        "Hi! I'm your FinSight AI. I've analyzed your March data. Your profit margin is 39.6%, but software costs need attention.",
      time: "Just now",
    },
  ]);

  const [input, setInput] = useState("");

  const send = async (text) => {
    const value = (text ?? input).trim();
    if (!value) return;

    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      { role: "user", text: value, time: now },
      { role: "ai", text: "Thinking...", time: now },
    ]);
    setInput("");

    try {
      const res = await api.post("/api/ai/chat", { query: value });
      const reply = res?.data?.reply || "I couldn't generate a response.";
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "ai", text: reply, time: now },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "ai",
          text: "AI service error. Please try again.",
          time: now,
        },
      ]);
    }
  };

  return (
    <div className="ai-panel">
      <div className="ai-header">
        <div className="ai-avatar">✦</div>
        <div style={{ flex: 1 }}>
          <div className="ai-name">FinSight AI</div>
          <div className="ai-status">
            <div className="status-dot"></div> Ready to help
          </div>
        </div>
      </div>

      <div className="ai-messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <div className="msg-bubble">{m.text}</div>
            <div className="msg-time">{m.time}</div>
          </div>
        ))}
      </div>

      <div className="quick-prompts">
        {quickPrompts.map((p) => (
          <span className="qp" key={p} onClick={() => send(p)}>
            {p}
          </span>
        ))}
      </div>

      <div className="ai-input-row">
        <input
          className="ai-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your finances..."
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />
        <button className="ai-send" onClick={() => send()}>
          ↑
        </button>
      </div>
    </div>
  );
}
