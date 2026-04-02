import type { TrainLogEntry, StationPair } from "@train-car-logger/shared";

export interface LeaderboardEntry {
  car: string;
  entries: string[];
  latestTimestamp: number;
}

export interface TrainStats {
  loggedCarsCount: number;
  repeatCars: string[];
  leaderboard: LeaderboardEntry[];
}

/**
 * Calculate statistics from train log entries
 * @param logs - Array of train log entries
 * @returns Statistics including total logged cars, repeat cars, and leaderboard
 */
export function calculateTrainStats(logs: TrainLogEntry[]): TrainStats {
  const carToLogEntries = new Map<string, Array<string>>();
  const latestTimestamps = new Map<string, number>();

  for (const entry of logs) {
    if (!carToLogEntries.has(entry.car)) {
      carToLogEntries.set(entry.car, []);
    }
    carToLogEntries.get(entry.car)?.push(entry.line);
    const currentLatest = latestTimestamps.get(entry.car) ?? 0;
    if (entry.timestamp > currentLatest) {
      latestTimestamps.set(entry.car, entry.timestamp);
    }
  }

  let repeatCars: string[] = [];
  const leaderboardData: LeaderboardEntry[] = [];

  carToLogEntries.forEach((entries: Array<string>, car: string) => {
    if (entries.length > 1) {
      repeatCars.push(car);
      leaderboardData.push({
        car,
        // reverse chronological order
        entries: [...entries].reverse(),
        latestTimestamp: latestTimestamps.get(car) ?? 0,
      });
    }
  });

  leaderboardData.sort((a, b) => {
    if (b.entries.length !== a.entries.length) {
      return b.entries.length - a.entries.length;
    }
    return b.latestTimestamp - a.latestTimestamp;
  });

  return {
    loggedCarsCount: logs.length,
    repeatCars,
    leaderboard: leaderboardData,
  };
}

export function getFrequentStationPairs(
  logs: TrainLogEntry[],
  line: string,
  limit?: number,
  minCount?: number,
): StationPair[] {
  const counts = new Map<string, number>();

  for (const entry of logs) {
    if (entry.line !== line || !entry.origin || !entry.destination) continue;
    const key = `${entry.origin}\0${entry.destination}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const pairs: StationPair[] = [];
  for (const [key, count] of counts) {
    if (minCount != null && count < minCount) continue;
    const [origin, destination] = key.split("\0");
    pairs.push({ origin, destination, count });
  }

  pairs.sort((a, b) => b.count - a.count);

  return limit ? pairs.slice(0, limit) : pairs;
}
