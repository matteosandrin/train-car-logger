import React, { useMemo } from "react";
import { useLogsContext } from "../storage";
import { UserHeader } from "../components/ui/UserHeader";
import SubwayMap, { COUNT_BUCKETS } from "../components/map/SubwayMap";
import { getTraveledSegmentCounts } from "../utils/travel";

const MapPage: React.FC = () => {
  const { logs } = useLogsContext();

  const counts = useMemo(() => getTraveledSegmentCounts(logs), [logs]);

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6">
      <UserHeader title="Map" />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-glow-card">
        <div className="aspect-[3/4]">
          <SubwayMap counts={counts} />
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        {[...COUNT_BUCKETS].reverse().map((bucket) => (
          <div
            key={bucket.label}
            className="flex items-center gap-1.5 text-sm text-slate-600"
          >
            <span
              className="inline-block h-1.5 w-5 rounded-full"
              style={{ backgroundColor: bucket.color }}
            />
            {bucket.label}
          </div>
        ))}
      </div>

      {counts.size === 0 && (
        <p className="text-center text-slate-600">
          No trips with stations yet. Log a ride with an origin and destination
          to see it here!
        </p>
      )}
    </div>
  );
};

export default MapPage;
