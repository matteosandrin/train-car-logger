import React, { useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import {
  getStation,
  getStopsBetween,
  getRouteColor,
} from "../../utils/subway";

interface RouteDiagramProps {
  line: string;
  origin: string;
  destination: string;
}

const Segment = ({ color }: { color: string }) => (
  <div className="flex">
    <div className="w-3 flex justify-center shrink-0">
      <div className="w-0.5 h-2" style={{ backgroundColor: color }} />
    </div>
  </div>
);

const RouteDiagram: React.FC<RouteDiagramProps> = ({
  line,
  origin,
  destination,
}) => {
  const [expanded, setExpanded] = useState(false);

  const originStation = getStation(origin);
  const destStation = getStation(destination);
  const color = getRouteColor(line) ?? "#94a3b8";
  const stops = getStopsBetween(line, origin, destination);
  const intermediateStops =
    stops.length >= 2 ? stops.slice(1, stops.length - 1) : [];
  const hasRoute = stops.length >= 2;

  return (
    <div className="flex flex-col">
      {/* Origin */}
      <div className="flex items-center gap-3">
        <div className="w-3 self-stretch shrink-0 relative flex items-center justify-center">
          <div
            className="absolute top-1/2 bottom-0 left-1/2 -translate-x-1/2 w-0.5"
            style={{ backgroundColor: color }}
          />
          <div
            className="w-3 h-3 rounded-full relative"
            style={{ backgroundColor: color }}
          />
        </div>
        <span className="text-sm font-medium text-slate-700 pb-1.5">
          {originStation?.stop_name ?? origin}
        </span>
      </div>

      {/* Middle section */}
      {hasRoute && intermediateStops.length > 0 ? (
        expanded ? (
          <div
            className="flex flex-col cursor-pointer"
            onClick={() => setExpanded(false)}
          >
            {intermediateStops.map((stop) => (
              <React.Fragment key={stop.stop_id}>
                <div className="flex items-center gap-3">
                  <div className="w-3 self-stretch shrink-0 relative flex items-center justify-center">
                    <div
                      className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5"
                      style={{ backgroundColor: color }}
                    />
                    <div
                      className="w-3 h-3 rounded-full relative"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  <span className="text-sm font-medium py-1.5">
                    {stop.stop_name}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        ) : (
          <button
            className="flex items-center gap-3"
            onClick={() => setExpanded(true)}
          >
            <div className="w-3 flex justify-center self-stretch shrink-0">
              <div
                className="w-0.5"
                style={{ backgroundColor: color }}
              />
            </div>
            <span className="text-xs flex items-center gap-0.5 py-1">
              {intermediateStops.length}{" "}
              {intermediateStops.length === 1 ? "stop" : "stops"}
              <LuChevronDown className="w-4 h-4" />
            </span>
          </button>
        )
      ) : (
        <Segment color={color} />
      )}

      {/* Destination */}
      <div className="flex items-center gap-3">
        <div className="w-3 self-stretch shrink-0 relative flex items-center justify-center">
          <div
            className="absolute top-0 bottom-1/2 left-1/2 -translate-x-1/2 w-0.5"
            style={{ backgroundColor: color }}
          />
          <div
            className="w-3 h-3 rounded-full relative"
            style={{ backgroundColor: color }}
          />
        </div>
        <span className="text-sm font-medium text-slate-700 pt-1.5">
          {destStation?.stop_name ?? destination}
        </span>
      </div>
    </div>
  );
};

export default RouteDiagram;
