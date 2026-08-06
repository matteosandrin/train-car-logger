import { useCallback, useEffect, useRef, useState } from "react";
import {
  APP_VERSION,
  BUILD_ID,
  applyUpdate,
  fetchDeployedVersion,
  type DeployedVersion,
  type VersionStatus,
} from "./app-version";

export interface AppVersionState {
  version: string;
  buildId: string;
  status: VersionStatus;
  deployed: DeployedVersion | null;
  check: () => void;
  update: () => void;
}

// Checks once on mount and on demand.
export function useAppVersion(): AppVersionState {
  const [status, setStatus] = useState<VersionStatus>("idle");
  const [deployed, setDeployed] = useState<DeployedVersion | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const check = useCallback(() => {
    setStatus("checking");
    void fetchDeployedVersion().then((result) => {
      if (!mounted.current) return;
      setDeployed(result);
      if (result === null) {
        setStatus("unavailable");
      } else {
        setStatus(result.buildId === BUILD_ID ? "latest" : "outdated");
      }
    });
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const update = useCallback(() => {
    void applyUpdate();
  }, []);

  return {
    version: APP_VERSION,
    buildId: BUILD_ID,
    status,
    deployed,
    check,
    update,
  };
}
