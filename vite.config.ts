import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Train Car Logger",
        short_name: "Train Log",
        description: "Track and log train car sightings",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        icons: [
          {
            src: "/img/icon.png",
            purpose: "maskable any",
            type: "image/png",
            sizes: "any"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
      },
    }),
  ],
}));
