import { useAuthContext } from "../../auth/use-auth-context";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getQueueSize } from "../../storage/sync-service";

export const UserHeader = ({ title }: { title: string }) => {
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [queueSize, setQueueSize] = useState(getQueueSize);

  useEffect(() => {
    const interval = setInterval(() => setQueueSize(getQueueSize()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      {isAuthenticated ? (
        <Button variant="pillSecondary" onClick={() => navigate("/account")}>
          <span className="flex items-center gap-1.5">
            Account
            {queueSize > 0 && <span className="inline-block w-2 h-2 rounded-full bg-orange-400" />}
          </span>
        </Button>
      ) : (
        <Button variant="pill" onClick={() => navigate("/login")}>
          Sign in
        </Button>
      )}
    </div>
  );
};
