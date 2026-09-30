import React, { useEffect, useState } from "react";
import "./SpeechBubble.css";

// Shows Haru's reply above her head, then fades out after a while.
// Thinking bubbles stay until the real reply replaces them.
export default function SpeechBubble({ text, mood = "HAPPY" }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!text) {
      setVisible(false);
      return;
    }
    setVisible(true);

    if (mood === "THINKING") return; // don't auto-hide while waiting

    // longer replies stay longer (min 5s, max 30s)
    const ms = Math.min(30000, Math.max(5000, text.length * 60));
    const timer = setTimeout(() => setVisible(false), ms);
    return () => clearTimeout(timer);
  }, [text, mood]);

  // strip markdown symbols so it looks clean
  const clean = (text || "").replace(/[*_`#>~]/g, "").trim();

  return (
    <div className={`haru-wrap ${visible ? "show" : ""}`}>
      <div className="haru-bubble">{clean}</div>
      <div className="haru-mood">
        <span className="haru-dot" /> {mood}
      </div>
    </div>
  );
}