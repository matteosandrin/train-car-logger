import routes from "../data/routes.json";
import stations from "../data/stations.json";

interface Station {
  stop_id: string;
  stop_name: string;
  latitude: number;
  longitude: number;
  routes: string[];
}

enum SubwayLine {
  One = "1",
  Two = "2",
  Three = "3",
  Four = "4",
  Five = "5",
  Six = "6",
  Seven = "7",
  A = "a",
  C = "c",
  E = "e",
  B = "b",
  D = "d",
  F = "f",
  M = "m",
  N = "n",
  Q = "q",
  R = "r",
  W = "w",
  J = "j",
  Z = "z",
  L = "l",
  G = "g",
  S = "s",
}

// same as SubwayLine, but sorted for the picker screen
const PICKER_LINES: SubwayLine[] = [
  SubwayLine.One,
  SubwayLine.Two,
  SubwayLine.Three,
  SubwayLine.Seven,
  SubwayLine.Four,
  SubwayLine.Five,
  SubwayLine.Six,
  SubwayLine.G,
  SubwayLine.A,
  SubwayLine.C,
  SubwayLine.E,
  SubwayLine.L,
  SubwayLine.B,
  SubwayLine.D,
  SubwayLine.F,
  SubwayLine.M,
  SubwayLine.N,
  SubwayLine.Q,
  SubwayLine.R,
  SubwayLine.W,
  SubwayLine.J,
  SubwayLine.Z,
  SubwayLine.S,
];

const stationMap = new Map(stations.map((s) => [s.stop_id, s]));
stations.map((s) => {
  if (s.children) {
    s.children.forEach((c) => {
      stationMap.set(c, s);
    });
  }
});
const routeMap = new Map(routes.routes.map((r) => [r.id.toLowerCase(), r]));

const getStation = (stationId: string): Station | null => {
  const station = stationMap.get(stationId);
  return station ?? null;
};

const getStopsForRoute = (routeId: string): Station[] => {
  const route = routeMap.get(routeId.toLowerCase());
  if (!route) return [];
  return route.stops.map((s) => {
    const station = stationMap.get(s);
    if (!station) return null;
    return {
      stop_id: station.stop_id,
      stop_name: station.stop_name,
      latitude: station.latitude,
      longitude: station.longitude,
      routes: station.routes,
    };
  }).filter((s) => s !== null);
};

const getRouteColor = (routeId: string): string | null => {
  const route = routeMap.get(routeId.toLowerCase());
  if (!route) return null;
  return `#${route.color}`;
};

const getStopsBetween = (
  routeId: string,
  originId: string,
  destinationId: string,
): Station[] => {
  const stops = getStopsForRoute(routeId);
  if (stops.length === 0) return [];

  const originStation = getStation(originId);
  const destStation = getStation(destinationId);
  if (!originStation || !destStation) return [];

  const originIdx = stops.findIndex(
    (s) => s.stop_id === originStation.stop_id,
  );
  const destIdx = stops.findIndex((s) => s.stop_id === destStation.stop_id);
  if (originIdx === -1 || destIdx === -1) return [];

  if (originIdx <= destIdx) {
    return stops.slice(originIdx, destIdx + 1);
  }
  return stops.slice(destIdx, originIdx + 1).reverse();
};

export {
  type Station,
  SubwayLine,
  PICKER_LINES,
  getStation,
  getStopsForRoute,
  getRouteColor,
  getStopsBetween,
};
