import React, { useMemo } from "react";
import { useLogsContext } from "../storage";
import { UserHeader } from "../components/ui/UserHeader";
import SubwayMap from "../components/map/SubwayMap";
import { getTraveledSegmentCounts } from "../utils/travel";

const MapPage: React.FC = () => {
  const { logs } = useLogsContext();

  const counts = useMemo(() => getTraveledSegmentCounts(logs), [logs]);

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      <div className="mx-auto w-full max-w-[440px] px-6 pt-6 pb-4">
        <UserHeader title="Map" />
      </div>

      <div className="relative min-h-0 flex-1">
        <SubwayMap counts={counts} />

        {counts.size === 0 && (
          <p className="pointer-events-none absolute inset-x-0 top-16 mx-auto max-w-[300px] text-center text-slate-600">
            No trips with stations yet. Log a ride with an origin and
            destination to see it here!
          </p>
        )}
      </div>
    </div>
  );
};

export default MapPage;
