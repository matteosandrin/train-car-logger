import React, { useMemo } from "react";
import segmentsData from "../../data/segments.json";
import { segmentPairKey } from "../../utils/travel";
import { usePanZoom } from "./usePanZoom";

export const COUNT_BUCKETS = [
  { min: 4, color: "#15803d", label: "4+ rides" },
  { min: 2, color: "#22c55e", label: "2-3 rides" },
  { min: 1, color: "#86efac", label: "1 ride" },
];

const bucketColor = (count: number): string => {
  for (const bucket of COUNT_BUCKETS) {
    if (count >= bucket.min) return bucket.color;
  }
  return COUNT_BUCKETS[COUNT_BUCKETS.length - 1].color;
};

const toPathD = (pts: number[][]): string =>
  `M${pts.map((p) => p.join(" ")).join(" L")}`;

const SubwayMap: React.FC<{ counts: Map<string, number> }> = ({ counts }) => {
  const { bounds, segments } = segmentsData;
  const { svgRef, groupRef } = usePanZoom(bounds.width, bounds.height);

  // the whole grey network as one merged path
  const basePath = useMemo(
    () => segments.map((s) => toPathD(s.pts)).join(""),
    [segments],
  );

  // traveled segments merged into one path per color bucket
  const traveledPaths = useMemo(() => {
    const byColor = new Map<string, string[]>();
    for (const s of segments) {
      const count = counts.get(segmentPairKey(s.from, s.to));
      if (!count) continue;
      const color = bucketColor(count);
      if (!byColor.has(color)) byColor.set(color, []);
      byColor.get(color)!.push(toPathD(s.pts));
    }
    return [...byColor.entries()].map(([color, ds]) => ({
      color,
      d: ds.join(""),
    }));
  }, [segments, counts]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${bounds.width} ${bounds.height}`}
      className="h-full w-full touch-none select-none"
      role="img"
      aria-label="NYC subway map with traveled segments highlighted"
    >
      <g ref={groupRef}>
        <path
          d={basePath}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {traveledPaths.map(({ color, d }) => (
          <path
            key={color}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </svg>
  );
};

export default SubwayMap;
