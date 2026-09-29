import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx"],

    alias: {
      "@framework": path.resolve(
        __dirname,
        "Framework/src"
      ),

      "@live2d": path.resolve(
        __dirname,
        "src/live2d"
      ),
    },
  },

  server: {
    port: 5173,
  },
});