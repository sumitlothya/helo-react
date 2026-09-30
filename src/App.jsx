import React, { useEffect, useState } from "react";

import Live2DCharacter from "./components/Live2DCharacter";
import Chatbot from "./components/Chatbot";
import SpeechBubble from "./components/SpeechBubble";

const isPet =
  new URLSearchParams(window.location.search).get("mode") === "pet";

// Lets the chat window talk to the desktop pet window (same origin, same app)
const channel = new BroadcastChannel("haru-bubble");

function App() {
  const [bubble, setBubble] = useState({ text: "", mood: "HAPPY" });

  // The pet window listens for replies sent from the chat window
  useEffect(() => {
    if (!isPet) return;
    const onMessage = (event) => setBubble(event.data);
    channel.addEventListener("message", onMessage);
    return () => channel.removeEventListener("message", onMessage);
  }, []);

  // Chat window: send the reply to the desktop pet only
  function handleBubble(data) {
    channel.postMessage(data);
  }

  // Desktop pet window: Haru + speech bubble
  if (isPet) {
    return (
      <div className="pet">
        <div style={{ position: "relative", width: 400, height: 650 }}>
          <SpeechBubble text={bubble.text} mood={bubble.mood} />
          <Live2DCharacter />
        </div>
      </div>
    );
  }

  // Chat window: no bubble here
  return (
    <main className="app">
      <section className="character-section">
        <Live2DCharacter />
      </section>

      <section className="chat-section">
        <Chatbot onBubble={handleBubble} />
      </section>
    </main>
  );
}

export default App;