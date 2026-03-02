import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../auth/use-auth-context";
import Button from "../components/ui/Button";
import { getLastSyncTime } from "../storage/local-storage";
import { getQueueSize } from "../storage/sync-service";

function formatLastSync(ts: number | null): string {
  if (ts === null) return "Never";
  return new Date(ts).toLocaleString();
}

const AccountPage: React.FC = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueSize, setQueueSize] = useState(getQueueSize);
  const [lastSync, setLastSync] = useState<number | null>(() => getLastSyncTime());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setQueueSize(getQueueSize());
      setLastSync(getLastSyncTime());
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6">
      <div className="flex w-full items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Account</h1>
        <Button variant="pill" onClick={() => navigate(-1)}>
          Close
        </Button>
      </div>

      <div className="rounded-2xl bg-white ring-1 ring-gray-200 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
          Signed in as
        </p>
        <p className="text-lg font-semibold text-gray-900">{user?.username}</p>
      </div>

      <div className="rounded-2xl bg-white ring-1 ring-gray-200 px-5 py-4 flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Sync status
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Connection</span>
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <span
              className={`inline-block w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-400"}`}
            />
            {isOnline ? "Connected" : "Offline"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Pending items</span>
          <span className="text-sm font-medium text-gray-900">{queueSize}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Last sync</span>
          <span className="text-sm font-medium text-gray-900 font-mono">{formatLastSync(lastSync)}</span>
        </div>
      </div>

      <Button variant="secondary" onClick={handleSignOut}>
        Sign out
      </Button>
    </div>
  );
};

export default AccountPage;
