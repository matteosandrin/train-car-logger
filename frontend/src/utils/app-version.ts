// Compares the build baked into this bundle against version.json on the server.
// version.json is not precached by the service worker, so it reflects the
// deployed build even when the shell is served from cache.

export const APP_VERSION = __APP_VERSION__;
export const BUILD_ID = __BUILD_ID__;

export type VersionStatus =
  | "idle"
  | "checking"
  | "latest"
  | "outdated"
  | "unavailable";

export interface DeployedVersion {
  version: string;
  buildId: string;
}

const VERSION_URL = `${import.meta.env.BASE_URL}version.json`;

// Returns null if the check is not possible: offline, or a dev server that
// answers unknown paths with the SPA fallback instead of JSON.
export async function fetchDeployedVersion(): Promise<DeployedVersion | null> {
  try {
    const res = await fetch(VERSION_URL, { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as Partial<DeployedVersion>;
    if (typeof body.buildId !== "string" || typeof body.version !== "string") {
      return null;
    }
    return { version: body.version, buildId: body.buildId };
  } catch {
    return null;
  }
}

// Installs the waiting service worker, then reloads onto the new build.
export async function applyUpdate(): Promise<void> {
  const registration = await navigator.serviceWorker?.getRegistration();
  if (registration) {
    try {
      await registration.update();
    } catch {
      // Fall through to the reload. A stale worker is better than a dead end.
    }
    // The autoUpdate worker calls skipWaiting, so it takes control shortly
    // after install. Wait for that, but do not hang if it never happens.
    await Promise.race([
      new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => resolve(),
          {
            once: true,
          },
        );
      }),
      new Promise<void>((resolve) => setTimeout(resolve, 3000)),
    ]);
  }
  window.location.reload();
}
