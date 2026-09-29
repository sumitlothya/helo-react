import React, { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { Live2DModel } from "pixi-live2d-display/cubism4";

window.PIXI = PIXI;


const IS_PET =
  new URLSearchParams(window.location.search).get("mode") === "pet";


const LOCAL_MODEL = "/live2d/Haru/Haru.model3.json";


const FALLBACK_MODEL =
  "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json";


const CANVAS_W = IS_PET ? 400 : 800;
const CANVAS_H = IS_PET ? 650 : 900;

async function pickModelUrl() {
  try {
    const res = await fetch(LOCAL_MODEL);
    if (res.ok) return LOCAL_MODEL;
  } catch {
    
  }
  return FALLBACK_MODEL;
}

function Live2DCharacter() {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Loading Haru...");

  useEffect(() => {
    let cancelled = false;
    let app = null;
    let model = null;

    async function start() {
      try {
        if (!window.Live2DCubismCore) {
          throw new Error(
            "Cubism core not loaded. Check the <script> tag in index.html."
          );
        }

        app = new PIXI.Application({
          view: canvasRef.current,
          width: CANVAS_W,
          height: CANVAS_H,
          transparent: true,
          backgroundAlpha: 0,
          autoStart: true,
          antialias: true,
        });

        const url = await pickModelUrl();
        model = await Live2DModel.from(url);

        if (cancelled) {
          model.destroy();
          return;
        }

        // Scale her to fit the canvas, feet at the bottom
        const scale = Math.min(
          (CANVAS_W * 0.9) / model.width,
          (CANVAS_H * 0.95) / model.height
        );
        model.scale.set(scale);
        model.anchor.set(0.5, 1);
        model.x = CANVAS_W / 2;
        model.y = CANVAS_H;

        app.stage.addChild(model);

        setStatus(
          url === LOCAL_MODEL
            ? "Haru is ready"
            : "Haru is ready (using test model)"
        );
      } catch (error) {
        console.error("Haru Live2D error:", error);
        if (!cancelled) setStatus(`Haru error: ${error.message}`);
      }
    }

    start();

    return () => {
      cancelled = true;
      if (app) app.destroy(false, { children: true });
    };
  }, []);

  return (
    <div className="live2d-container">
      <canvas
        ref={canvasRef}
        className="live2d-canvas"
        width={CANVAS_W}
        height={CANVAS_H}
      />
      {!IS_PET && <div className="live2d-status">{status}</div>}
    </div>
  );
}

export default Live2DCharacter;