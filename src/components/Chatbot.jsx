import React, { useState } from "react";
import useVoice, { speak, stopSpeaking, voiceSupported } from "./useVoice";

const MODEL = "openai/gpt-oss-120b";

const WELCOME = {
  role: "assistant",
  content: "Hello! I'm Haru's AI assistant. Ask me anything!",
};

// remove markdown symbols so text looks clean in chat, bubble and voice
function cleanText(text) {
  return text
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    .replace(/^#+\s*/gm, "")
    .trim();
}

// onBubble({ text, mood }) shows Haru's reply above her head (see SpeechBubble)
function Chatbot({ onBubble }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([WELCOME]);
  const [loading, setLoading] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true); // Haru speaks her answers

  // Pass text directly (from voice) or fall back to the input box
  async function sendMessage(text) {
    const userMessage = (typeof text === "string" ? text : message).trim();

    if (!userMessage) return;
    if (loading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", content: userMessage },
    ]);

    setMessage("");
    setLoading(true);
    onBubble?.({ text: "Haru is thinking...", mood: "THINKING" });

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
                  "You are Haru, a friendly anime-style AI assistant. Give helpful, clear and concise answers. Reply in plain text only. Never use markdown, asterisks, or bullet symbols. Keep answers short and conversational.",
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

      const raw = data?.choices?.[0]?.message?.content;

      if (!raw) {
        throw new Error("Groq returned an empty answer.");
      }

      const answer = cleanText(raw);

      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: answer },
      ]);

      onBubble?.({ text: answer, mood: "HAPPY" });
      if (voiceOn) speak(answer);
    } catch (error) {
      console.error("Groq error:", error);

      const errorText = `Error connecting to Groq: ${error.message}`;

      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: errorText },
      ]);

      onBubble?.({ text: errorText, mood: "SAD" });
    } finally {
      setLoading(false);
    }
  }

  // Handles voice commands first, otherwise sends to the AI
  function handleVoice(text) {
    const t = text.toLowerCase();

    if (t.includes("open youtube")) {
      window.open("https://youtube.com", "_blank");
      reply("Opening YouTube!");
    } else if (t.includes("open google")) {
      window.open("https://google.com", "_blank");
      reply("Opening Google!");
    } else if (t.includes("clear chat")) {
      setMessages([WELCOME]);
      onBubble?.({ text: "", mood: "HAPPY" });
      stopSpeaking();
    } else if (t.includes("stop talking") || t.includes("be quiet")) {
      stopSpeaking();
    } else {
      sendMessage(text);
    }
  }

  function reply(text) {
    setMessages((previous) => [
      ...previous,
      { role: "assistant", content: text },
    ]);
    onBubble?.({ text, mood: "HAPPY" });
    if (voiceOn) speak(text);
  }

  const { listening, start, stop } = useVoice(handleVoice);

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
          placeholder={listening ? "Listening..." : "Talk to Haru..."}
          disabled={loading}
        />

        {voiceSupported && (
          <button
            type="button"
            onClick={listening ? stop : start}
            disabled={loading}
            title="Voice input"
          >
            {listening ? "🔴" : "🎤"}
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (voiceOn) stopSpeaking();
            setVoiceOn(!voiceOn);
          }}
          title="Toggle Haru's voice"
        >
          {voiceOn ? "🔊" : "🔇"}
        </button>

        <button type="button" onClick={() => sendMessage()} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default Chatbot;