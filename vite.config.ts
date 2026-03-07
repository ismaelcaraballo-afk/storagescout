import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== "true",
    // Proxy is handled by Express middleware in server.ts
  },
});
