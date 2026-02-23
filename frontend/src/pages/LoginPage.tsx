import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../auth";
import Button from "../components/ui/Button";
import FlowContainer from "../components/ui/FlowContainer";

const LoginPage: React.FC = () => {
  const { login, register } = useAuthContext();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        await register(username, password);
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FlowContainer className="max-w-sm mx-auto">


      <div className="w-full flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-slate-800">
          {mode === "login" ? "Sign in" : "Create an account"}
        </h1>
        <Button variant="pill" onClick={() => navigate("/")}>Close</Button>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Register"}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError(null);
        }}
        className="text-sm text-sky-600 hover:underline"
      >
        {mode === "login"
          ? "Need an account? Register"
          : "Already have an account? Sign in"}
      </button>
    </FlowContainer>
  );
};

export default LoginPage;
