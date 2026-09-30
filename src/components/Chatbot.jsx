import React, { useState } from "react";

const MODEL = "openai/gpt-oss-120b";

function Chatbot() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm Haru's AI assistant. Ask me anything!",
    },
  ]);

  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!message.trim()) return;
    if (loading) return;

    const userMessage = message.trim();

    setMessages((previous) => [
      ...previous,
      { role: "user", content: userMessage },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;

      if (!apiKey) {
        throw new Error("VITE_GROQ_API_KEY is missing.");
      }

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [
              {
                role: "system",
                content:
                  "You are Haru, a friendly anime-style AI assistant. Give helpful, clear and concise answers.",
              },
              ...messages.map((item) => ({
                role: item.role,
                content: item.content,
              })),
              { role: "user", content: userMessage },
            ],
            temperature: 1,
            max_completion_tokens: 2048,
            top_p: 1,
            reasoning_effort: "medium",
          }),
        }
      );

      const data = await response.json();

      console.log("Groq response:", data);

      if (!response.ok) {
        throw new Error(
          data?.error?.message || `Groq HTTP ${response.status}`
        );
      }

      const answer = data?.choices?.[0]?.message?.content;

      if (!answer) {
        throw new Error("Groq returned an empty answer.");
      }

      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: answer },
      ]);
    } catch (error) {
      console.error("Groq error:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: `Error connecting to Groq: ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  }

  return (
  <div className="chatbot">
    <div className="chat-header">
      <div className="chat-title">EXO ASSISTANCE</div>
      <div className="chat-subtitle">Live2D Assistant</div>
    </div>

      <div className="chat-messages">
        {messages.map((item, index) => (
          <div
            key={index}
            className={
              item.role === "user"
                ? "message user-message"
                : "message assistant-message"
            }
          >
            {item.content}
          </div>
        ))}

        {loading && (
          <div className="message assistant-message">Haru is thinking...</div>
        )}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Talk to Haru..."
          disabled={loading}
        />

        <button type="button" onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default Chatbot;