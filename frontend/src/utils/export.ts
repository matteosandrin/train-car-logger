import type { TrainLogEntry } from "@train-car-logger/shared";

export function exportLogsAsJson(logs: TrainLogEntry[]): void {
  if (logs.length === 0) return;

  const timestamp = new Date();
  const pad = (value: number) => value.toString().padStart(2, "0");
  const fileName = `train-car-log-${timestamp.getFullYear()}${pad(timestamp.getMonth() + 1)}${pad(timestamp.getDate())}-${pad(timestamp.getHours())}${pad(timestamp.getMinutes())}${pad(timestamp.getSeconds())}.json`;

  const blob = new Blob([JSON.stringify(logs, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  link.click();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
