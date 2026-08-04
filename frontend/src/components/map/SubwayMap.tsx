import React, { useEffect, useRef } from "react";
import { GeoJSONSource, Map as LibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import segmentsData from "../../data/segments.json";
import { segmentPairKey } from "../../utils/travel";

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

const SubwayMap: React.FC<{ counts: Map<string, number> }> = ({ counts }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LibreMap | null>(null);
  const countsRef = useRef(counts);
  countsRef.current = counts;

  useEffect(() => {
    const map = new LibreMap({
      container: containerRef.current!,
      style: STYLE_URL,
      center: [-73.984016, 40.757342],
      zoom: 11,
      attributionControl: false,
    });
    mapRef.current = map;

    map.on("load", () => {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: buildGeoJSON(countsRef.current),
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

    return () => {
      mapRef.current = null;
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource<GeoJSONSource>(SOURCE_ID);
    // before "load" fires, the load handler picks up counts via countsRef
    source?.setData(buildGeoJSON(counts));
  }, [counts]);

  return <div ref={containerRef} className="h-full w-full" />;
};

export default SubwayMap;
