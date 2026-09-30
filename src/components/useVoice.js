import { useEffect, useRef, useState } from "react";

export const voiceSupported =
  typeof window !== "undefined" &&
  !!(window.SpeechRecognition || window.webkitSpeechRecognition);

export default function useVoice(onResult) {
  const recRef = useRef(null);
  const callbackRef = useRef(onResult);
  const [listening, setListening] = useState(false);

  // Always call the latest callback without recreating the recognizer
  callbackRef.current = onResult;

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;

    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      callbackRef.current?.(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = (e) => {
      console.log("Voice error:", e.error);
      setListening(false);
    };

    recRef.current = rec;
    return () => rec.abort();
  }, []);

  const start = () => {
    if (!recRef.current || listening) return;
    window.speechSynthesis.cancel(); // stop Haru talking so she doesn't hear herself
    try {
      recRef.current.start();
      setListening(true);
    } catch (err) {
      console.log(err);
    }
  };

  const stop = () => recRef.current?.stop();

  return { listening, start, stop };
}

export function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  // remove markdown symbols so she doesn't read "asterisk asterisk"
  const clean = text.replace(/[*_`#>~]/g, "").replace(/\s+/g, " ").trim();

  const u = new SpeechSynthesisUtterance(clean);
  u.rate = 1;
  u.pitch = 1.2;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}