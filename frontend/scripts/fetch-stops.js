import fs from "fs";
import path from "path";

const ROUTES_PATH = path.join(process.cwd(), "src/data/routes.json");
const API_BASE =
  "https://realtimerail.nyc/transiter/v0.6/systems/us-ny-subway/routes";

async function fetchStops(routeId) {
  const res = await fetch(`${API_BASE}/${routeId}`);
  if (!res.ok) {
    console.error(`Failed to fetch route ${routeId}: ${res.status}`);
    return [];
  }
  const data = await res.json();
  const allTimes = data.serviceMaps?.find((m) => m.configId === "alltimes");
  if (!allTimes) return [];
  return allTimes.stops.map((s) => s.id);
}

async function main() {
  const routesData = JSON.parse(fs.readFileSync(ROUTES_PATH, "utf-8"));

  for (const route of routesData.routes) {
    console.log(`Fetching stops for ${route.shortName} (${route.id})...`);
    route.stops = await fetchStops(route.id);
    console.log(`  -> ${route.stops.length} stops`);
  }

  fs.writeFileSync(ROUTES_PATH, JSON.stringify(routesData, null, 2) + "\n");
  console.log("Done! Updated routes.json");
}

main();
