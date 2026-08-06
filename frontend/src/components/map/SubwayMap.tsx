import React, { useEffect, useRef } from "react";
import { GeoJSONSource, Map as LibreMap, setWorkerUrl } from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import segmentsData from "../../data/segments.json";
import { segmentPairKey } from "../../utils/travel";

// maplibre resolves its worker with a dynamic URL that the bundler
// cannot see; give it the bundled worker URL instead
setWorkerUrl(maplibreWorkerUrl);

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";
const SOURCE_ID = "subway-segments";

const COUNT_BUCKETS = [
  { min: 4, color: "#15803d", label: "4+ rides" },
  { min: 2, color: "#22c55e", label: "2-3 rides" },
  { min: 1, color: "#86efac", label: "1 ride" },
];

// width ramps keep lines readable across zoom levels
const BASE_WIDTH = ["interpolate", ["linear"], ["zoom"], 9, 1, 13, 2.5, 16, 5];
const TRAVELED_WIDTH = [
  "interpolate",
  ["linear"],
  ["zoom"],
  9,
  2.5,
  13,
  5,
  16,
  10,
];

const buildGeoJSON = (counts: Map<string, number>): GeoJSON.GeoJSON => ({
  type: "FeatureCollection",
  features: segmentsData.segments.map((s) => ({
    type: "Feature",
    properties: { count: counts.get(segmentPairKey(s.from, s.to)) ?? 0 },
    geometry: { type: "LineString", coordinates: s.pts },
  })),
});

// the map lives in a detached div that outlives the React tree, so leaving
// and re-entering the map tab keeps the tiles, camera and GL context
let mapHolder: HTMLDivElement | null = null;
let mapInstance: LibreMap | null = null;
let latestCounts: Map<string, number> = new Map();

const createMap = (): LibreMap => {
  const holder = document.createElement("div");
  holder.style.width = "100%";
  holder.style.height = "100%";
  mapHolder = holder;

  const map = new LibreMap({
    container: holder,
    style: STYLE_URL,
    center: [-73.984016, 40.757342],
    zoom: 11,
    attributionControl: false,
  });
  mapInstance = map;

  map.on("load", () => {
    map.addSource(SOURCE_ID, {
      type: "geojson",
      data: buildGeoJSON(latestCounts),
    });

    // keep the basemap's labels above the subway lines
    const firstSymbolLayer = map
      .getStyle()
      .layers.find((layer) => layer.type === "symbol")?.id;

    map.addLayer(
      {
        id: "subway-base",
        type: "line",
        source: SOURCE_ID,
        paint: {
          "line-color": "#94a3b8",
          "line-width": BASE_WIDTH as never,
        },
        layout: { "line-cap": "round", "line-join": "round" },
      },
      firstSymbolLayer,
    );

    map.addLayer(
      {
        id: "subway-traveled",
        type: "line",
        source: SOURCE_ID,
        filter: [">", ["get", "count"], 0],
        paint: {
          "line-color": [
            "step",
            ["get", "count"],
            COUNT_BUCKETS[2].color,
            2,
            COUNT_BUCKETS[1].color,
            4,
            COUNT_BUCKETS[0].color,
          ] as never,
          "line-width": TRAVELED_WIDTH as never,
        },
        layout: { "line-cap": "round", "line-join": "round" },
      },
      firstSymbolLayer,
    );
  });

  return map;
};

const SubwayMap: React.FC<{ counts: Map<string, number> }> = ({ counts }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  latestCounts = counts;

  useEffect(() => {
    const map = mapInstance ?? createMap();
    containerRef.current!.appendChild(mapHolder!);
    // the holder had no size while detached; re-measure it
    map.resize();

    return () => {
      mapHolder?.remove();
    };
  }, []);

  useEffect(() => {
    // before "load" fires, the load handler picks up counts via latestCounts
    const source = mapInstance?.getSource<GeoJSONSource>(SOURCE_ID);
    source?.setData(buildGeoJSON(counts));
  }, [counts]);

  return <div ref={containerRef} className="h-full w-full" />;
};

export default SubwayMap;
