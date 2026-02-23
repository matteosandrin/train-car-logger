import { useAuthContext } from "../../auth/use-auth-context";
import Button from "./Button";

export const UserHeader = () => {
  const { isAuthenticated, user, logout } = useAuthContext();
  return (
    <>
      {isAuthenticated && (
        <div className="flex justify-between items-center">
          <div>
            Hello, <span className="font-semibold">{user?.username}</span>!
          </div>
          <Button variant="pill" onClick={logout}>
            Sign out
          </Button>
        </div>
      )}
    </>
  );
};
