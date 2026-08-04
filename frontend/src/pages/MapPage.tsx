import React, { useMemo } from "react";
import { useLogsContext } from "../storage";
import { UserHeader } from "../components/ui/UserHeader";
import SubwayMap, { COUNT_BUCKETS } from "../components/map/SubwayMap";
import { getTraveledSegmentCounts } from "../utils/travel";

const MapPage: React.FC = () => {
  const { logs } = useLogsContext();

  const counts = useMemo(() => getTraveledSegmentCounts(logs), [logs]);

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      <div className="mx-auto w-full max-w-[440px] px-6 pb-2 pt-6">
        <UserHeader title="Map" />
      </div>

      <div className="relative min-h-0 flex-1">
        <SubwayMap counts={counts} />

        {counts.size === 0 && (
          <p className="pointer-events-none absolute inset-x-0 top-4 mx-auto max-w-[300px] text-center text-slate-600">
            No trips with stations yet. Log a ride with an origin and
            destination to see it here!
          </p>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-28 flex justify-center">
          <div className="flex items-center gap-4 rounded-full border border-slate-200 bg-white/80 px-4 py-2 backdrop-blur-sm">
            {[...COUNT_BUCKETS].reverse().map((bucket) => (
              <div
                key={bucket.label}
                className="flex items-center gap-1.5 text-xs text-slate-600"
              >
                <span
                  className="inline-block h-1.5 w-4 rounded-full"
                  style={{ backgroundColor: bucket.color }}
                />
                {bucket.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
