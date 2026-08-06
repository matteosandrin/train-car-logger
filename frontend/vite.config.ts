import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import pkg from "./package.json";
import { resolveBuildId, versionManifest } from "./vite-version-plugin";

export default defineConfig(({ command }) => {
  const buildId = resolveBuildId();

  return {
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      __BUILD_ID__: JSON.stringify(buildId),
    },
    optimizeDeps: {
      // pre-bundling breaks the maplibre-gl web worker in dev
      exclude: ["maplibre-gl"],
    },
    plugins: [
      react(),
      versionManifest(pkg.version, buildId),
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
          // Precache only the shell so the SW activates in <1s
          globPatterns: ["**/*.{js,css,html,webmanifest}", "img/icon.png"],
          navigateFallback: "index.html",
          cleanupOutdatedCaches: true,
          // Line icons runtime cached on first use instead of blocking install.
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
  };
});
