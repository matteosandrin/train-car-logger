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
            sizes: "any",
          },
        ],
      },
      workbox: {
        // Precache only the app shell so the SW activates within ~1s and takes
        // control immediately. Previously we precached all 30+ line SVGs, which
        // delayed activation by ~10s and left relaunches falling back to GitHub
        // Pages' 10-min HTTP cache (re-downloading the shell each launch on iOS).
        globPatterns: ["**/*.{js,css,html,webmanifest}", "img/icon.png"],
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
        // Line icons are fetched by URL at runtime; cache-first keeps them local
        // after first use without blocking install.
        runtimeCaching: [
          {
            urlPattern: /\/img\/.*\.svg$/,
            handler: "CacheFirst",
            options: {
              cacheName: "line-icons",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 90,
              },
            },
          },
        ],
      },
    }),
  ],
}));
