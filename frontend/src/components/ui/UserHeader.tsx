import { useAuthContext } from "../../auth/use-auth-context";
import Button from "./Button";
import { useNavigate } from "react-router-dom";

export const UserHeader = ({ title }: { title: string }) => {
  const { isAuthenticated, logout } = useAuthContext();
  const navigate = useNavigate();
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      {isAuthenticated ? (
        <Button variant="pillSecondary" onClick={logout}>
          Sign out
        </Button>
      ) : (
        <Button variant="pill" onClick={() => navigate("/login")}>
          Sign in
        </Button>
      )}
    </div>
  );
};
