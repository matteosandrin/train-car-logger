import type { TrainLogEntry } from "@train-car-logger/shared";
import { getStation, getStopsBetween } from "./subway";

// the logged shuttle value "s" maps to one of these routes
const SHUTTLE_ROUTES = ["FS", "GS", "H"];

// canonical key for an unordered physical station pair
export function segmentPairKey(a: string, b: string): string {
  const pa = getStation(a)?.stop_id ?? a;
  const pb = getStation(b)?.stop_id ?? b;
  return pa < pb ? `${pa}|${pb}` : `${pb}|${pa}`;
}

// find the route whose stop list contains both stations
export function resolveRouteForTrip(
  line: string,
  originId: string,
  destinationId: string,
): string | null {
  const candidates = line.toLowerCase() === "s" ? SHUTTLE_ROUTES : [line];
  for (const route of candidates) {
    if (getStopsBetween(route, originId, destinationId).length > 0) {
      return route;
    }
  }
  return null;
}

// count traversals per physical station pair across all logs
export function getTraveledSegmentCounts(
  logs: TrainLogEntry[],
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const entry of logs) {
    if (!entry.origin || !entry.destination) continue;
    const route = resolveRouteForTrip(
      entry.line,
      entry.origin,
      entry.destination,
    );
    if (!route) continue;
    const stops = getStopsBetween(route, entry.origin, entry.destination);
    for (let i = 0; i < stops.length - 1; i++) {
      const key = segmentPairKey(stops[i].stop_id, stops[i + 1].stop_id);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return counts;
}
