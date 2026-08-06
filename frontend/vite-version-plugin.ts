import { execFileSync } from "node:child_process";
import type { Plugin } from "vite";

// Identifies one build. The commit is stable across rebuilds of the same code,
// so a redeploy of unchanged code does not look like an update.
export function resolveBuildId(): string {
  const sha =
    process.env.GITHUB_SHA ??
    (() => {
      try {
        return execFileSync("git", ["rev-parse", "HEAD"], {
          stdio: ["ignore", "pipe", "ignore"],
        })
          .toString()
          .trim();
      } catch {
        return "";
      }
    })();
  return sha ? sha.slice(0, 7) : `dev-${Date.now()}`;
}

// Writes version.json next to index.html. The workbox globPatterns do not
// match .json, so the file is never precached and always comes from network.
export function versionManifest(version: string, buildId: string): Plugin {
  return {
    name: "version-manifest",
    apply: "build",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: JSON.stringify({ version, buildId }),
      });
    },
  };
}
