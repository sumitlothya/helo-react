import React from "react";

import Live2DCharacter from "./components/Live2DCharacter";
import Chatbot from "./components/Chatbot";

const isPet =
  new URLSearchParams(window.location.search).get("mode") === "pet";

function App() {
  
  if (isPet) {
    return (
      <div className="pet">
        <Live2DCharacter />
      </div>
    );
  }


  return (
    <main className="app">
      <section className="character-section">
        <Live2DCharacter />
      </section>

      <section className="chat-section">
        <Chatbot />
      </section>
    </main>
  );
}

export default App;