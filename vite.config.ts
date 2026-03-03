import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    plugins: [react(), tailwindcss()],
    define: {
      "process.env": {
        WATTTIME_USERNAME: JSON.stringify(env.WATTTIME_USERNAME),
        WATTTIME_PASSWORD: JSON.stringify(env.WATTTIME_PASSWORD),
        WATTTIME_EMAIL: JSON.stringify(env.WATTTIME_EMAIL),
        WATTTIME_ORG: JSON.stringify(env.WATTTIME_ORG),
        ELECTRICITYMAPS_TOKEN: JSON.stringify(env.ELECTRICITYMAPS_TOKEN),
      },
    },
    resolve: {
      alias: { "@": path.resolve(__dirname, ".") },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== "true",
      // Proxy is handled by Express middleware in server.ts
    },
  };
});
