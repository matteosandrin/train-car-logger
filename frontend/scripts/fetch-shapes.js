import fs from "fs";
import path from "path";

// Fetch GTFS track shapes from Transiter, chop them into
// station-to-station segments, and write segments.json.

const ROUTES_PATH = path.join(process.cwd(), "src/data/routes.json");
const STATIONS_PATH = path.join(process.cwd(), "src/data/stations.json");
const OUT_PATH = path.join(process.cwd(), "src/data/segments.json");
const API_BASE =
  "https://realtimerail.nyc/transiter/v0.6/systems/us-ny-subway/shapes";

// max distance from a station to a shape for a valid match
const MAX_SNAP_DIST = 300;
// simplification tolerance in meters
const DP_TOLERANCE = 5;
// hard cap on output size
const MAX_OUT_BYTES = 300 * 1024;

const M_PER_DEG = 111320;

async function fetchAllShapes() {
  const shapes = [];
  let firstId = null;
  for (;;) {
    const url = new URL(API_BASE);
    url.searchParams.set("limit", "100");
    if (firstId) url.searchParams.set("first_id", firstId);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch shapes: ${res.status}`);
    const data = await res.json();
    shapes.push(...(data.shapes ?? []));
    if (!data.nextId) break;
    firstId = data.nextId;
    process.stdout.write(`\rFetched ${shapes.length} shapes...`);
  }
  console.log(`\rFetched ${shapes.length} shapes total`);
  return shapes;
}

// squared distance helpers work in projected meter space
function distSq(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

// nearest point on segment ab to p, returns {d2, t}
function pointSegNearest(p, a, b) {
  const abx = b[0] - a[0];
  const aby = b[1] - a[1];
  const len2 = abx * abx + aby * aby;
  let t = 0;
  if (len2 > 0) {
    t = ((p[0] - a[0]) * abx + (p[1] - a[1]) * aby) / len2;
    t = Math.max(0, Math.min(1, t));
  }
  const q = [a[0] + abx * t, a[1] + aby * t];
  return { d2: distSq(p, q), t, q };
}

// project p onto polyline pts, returns {dist, arc} where arc is
// the cumulative arc length of the nearest point
function projectOntoPolyline(pts, p) {
  let best = { d2: Infinity, arc: 0 };
  let arc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const segLen = Math.sqrt(distSq(pts[i], pts[i + 1]));
    const near = pointSegNearest(p, pts[i], pts[i + 1]);
    if (near.d2 < best.d2) {
      best = { d2: near.d2, arc: arc + segLen * near.t };
    }
    arc += segLen;
  }
  return { dist: Math.sqrt(best.d2), arc: best.arc };
}

// extract the sub-polyline between arc lengths a and b
function slicePolyline(pts, a, b) {
  const reversed = a > b;
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const out = [];
  let arc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const segLen = Math.sqrt(distSq(pts[i], pts[i + 1]));
    const next = arc + segLen;
    if (next > lo && arc < hi) {
      const t0 = Math.max(0, (lo - arc) / segLen);
      const t1 = Math.min(1, (hi - arc) / segLen);
      const lerp = (t) => [
        pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t,
        pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t,
      ];
      if (out.length === 0) out.push(lerp(t0));
      out.push(lerp(t1));
    }
    arc = next;
  }
  if (reversed) out.reverse();
  return out;
}

// perpendicular distance from p to infinite line through a,b
function perpDist(p, a, b) {
  const near = pointSegNearest(p, a, b);
  return Math.sqrt(near.d2);
}

function douglasPeucker(pts, tol) {
  if (pts.length <= 2) return pts;
  let maxD = 0;
  let idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpDist(pts[i], pts[0], pts[pts.length - 1]);
    if (d > maxD) {
      maxD = d;
      idx = i;
    }
  }
  if (maxD <= tol) return [pts[0], pts[pts.length - 1]];
  const left = douglasPeucker(pts.slice(0, idx + 1), tol);
  const right = douglasPeucker(pts.slice(idx), tol);
  return left.slice(0, -1).concat(right);
}

function pairKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

async function main() {
  const routesData = JSON.parse(fs.readFileSync(ROUTES_PATH, "utf-8"));
  const stations = JSON.parse(fs.readFileSync(STATIONS_PATH, "utf-8"));

  // map stop ids (incl. children) to parent stations
  const stationMap = new Map();
  for (const s of stations) {
    stationMap.set(s.stop_id, s);
    for (const c of s.children ?? []) stationMap.set(c, s);
  }

  const rawShapes = await fetchAllShapes();

  // projection: equirectangular, meters relative to the bounding box
  const allPoints = [];
  for (const sh of rawShapes) {
    for (const p of sh.points ?? []) allPoints.push([p.latitude, p.longitude]);
  }
  for (const s of stations) allPoints.push([s.latitude, s.longitude]);
  let latMax = -Infinity;
  let latMin = Infinity;
  let lon0 = Infinity;
  for (const [lat, lon] of allPoints) {
    latMax = Math.max(latMax, lat);
    latMin = Math.min(latMin, lat);
    lon0 = Math.min(lon0, lon);
  }
  const lat0 = (latMax + latMin) / 2;
  const cosLat = Math.cos((lat0 * Math.PI) / 180);
  const project = (lat, lon) => [
    (lon - lon0) * cosLat * M_PER_DEG,
    (latMax - lat) * M_PER_DEG,
  ];
  // meters back to [lon, lat] for GeoJSON output
  const unproject = ([x, y]) => [
    lon0 + x / (cosLat * M_PER_DEG),
    latMax - y / M_PER_DEG,
  ];

  // group projected shapes by route prefix ("1..N03R" -> "1")
  const shapesByRoute = new Map();
  for (const sh of rawShapes) {
    const routeId = sh.id.split(".")[0].toUpperCase();
    const pts = (sh.points ?? []).map((p) => project(p.latitude, p.longitude));
    if (pts.length < 2) continue;
    if (!shapesByRoute.has(routeId)) shapesByRoute.set(routeId, []);
    shapesByRoute.get(routeId).push(pts);
  }

  const stationXY = (s) => project(s.latitude, s.longitude);

  // segments keyed by unordered station pair
  const segments = new Map();
  let fallbacks = 0;

  for (const route of routesData.routes) {
    const routeId = route.id.toUpperCase();
    // express variants without own shapes reuse the base route's
    let shapes = shapesByRoute.get(routeId);
    if (!shapes && routeId.endsWith("X")) {
      shapes = shapesByRoute.get(routeId.slice(0, -1));
    }
    shapes = shapes ?? [];

    for (let i = 0; i < route.stops.length - 1; i++) {
      const sa = stationMap.get(route.stops[i]);
      const sb = stationMap.get(route.stops[i + 1]);
      if (!sa || !sb || sa.stop_id === sb.stop_id) continue;
      const key = pairKey(sa.stop_id, sb.stop_id);
      const existing = segments.get(key);
      if (existing) {
        if (!existing.routes.includes(route.id)) existing.routes.push(route.id);
        continue;
      }

      const pa = stationXY(sa);
      const pb = stationXY(sb);

      // find the shape that passes closest to both stations
      const findBest = (candidates) => {
        let best = null;
        for (const shapePts of candidates) {
          const projA = projectOntoPolyline(shapePts, pa);
          const projB = projectOntoPolyline(shapePts, pb);
          if (projA.dist > MAX_SNAP_DIST || projB.dist > MAX_SNAP_DIST) {
            continue;
          }
          if (Math.abs(projA.arc - projB.arc) < 1) continue;
          const score = projA.dist + projB.dist;
          if (!best || score < best.score) {
            best = { shapePts, a: projA.arc, b: projB.arc, score };
          }
        }
        return best;
      };

      // routes with no own shapes (Z) borrow track from other routes;
      // pairs with no track at all (branch artifacts) are dropped
      let best = findBest(shapes);
      if (!best) {
        best = findBest([...shapesByRoute.values()].flat());
      }
      if (!best) {
        fallbacks++;
        console.warn(
          `  skipped (no track): ${route.id} ${sa.stop_id} (${sa.stop_name}) -> ${sb.stop_id} (${sb.stop_name})`,
        );
        continue;
      }

      let pts = slicePolyline(best.shapePts, best.a, best.b);
      pts = douglasPeucker(pts, DP_TOLERANCE);
      // snap endpoints to exact station coords so segments join
      pts[0] = pa;
      pts[pts.length - 1] = pb;

      segments.set(key, {
        from: sa.stop_id,
        to: sb.stop_id,
        routes: [route.id],
        pts,
      });
    }
  }

  // convert to [lon, lat] rounded to ~1 m precision
  const bbox = [Infinity, Infinity, -Infinity, -Infinity];
  const outSegments = [...segments.values()].map((seg) => {
    const pts = seg.pts.map((p) => {
      const [lon, lat] = unproject(p);
      const rl = Math.round(lon * 1e5) / 1e5;
      const rt = Math.round(lat * 1e5) / 1e5;
      bbox[0] = Math.min(bbox[0], rl);
      bbox[1] = Math.min(bbox[1], rt);
      bbox[2] = Math.max(bbox[2], rl);
      bbox[3] = Math.max(bbox[3], rt);
      return [rl, rt];
    });
    return { from: seg.from, to: seg.to, routes: seg.routes, pts };
  });

  const out = { bbox, segments: outSegments };
  const json = JSON.stringify(out);
  if (json.length > MAX_OUT_BYTES) {
    throw new Error(
      `segments.json is ${json.length} bytes (> ${MAX_OUT_BYTES}); raise DP_TOLERANCE`,
    );
  }
  fs.writeFileSync(OUT_PATH, json + "\n");
  console.log(
    `Done! ${outSegments.length} segments, ${fallbacks} skipped pairs, ` +
      `${(json.length / 1024).toFixed(1)} KB -> ${OUT_PATH}`,
  );
}

main();
