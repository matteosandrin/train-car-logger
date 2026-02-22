import { useContext } from "react";
import { LogsContext } from "./logs-context";
import type { LogsContextValue } from "./logs-context";

export function useLogsContext(): LogsContextValue {
  const context = useContext(LogsContext);
  if (!context) {
    throw new Error("useLogsContext must be used within a LogsProvider");
  }
  return context;
}
