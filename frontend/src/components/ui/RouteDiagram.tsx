import React, { useState } from "react";
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
    <div className="flex gap-3">
      {/* Left column: dots and line */}
      <div className="flex flex-col items-center pt-[2px]">
        {/* Origin dot */}
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        {/* Connecting line */}
        <div className="w-0.5 flex-1" style={{ backgroundColor: color }} />
        {/* Destination dot */}
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Right column: labels */}
      <div className="flex flex-col gap-0 min-w-0 flex-1">
        {/* Origin */}
        <span className="text-sm font-medium text-slate-700 leading-tight">
          {originStation?.stop_name ?? origin}
        </span>

        {/* Middle section */}
        {hasRoute && intermediateStops.length > 0 && (
          <div className="flex flex-col">
            {!expanded ? (
              <button
                className="flex items-center gap-1 py-1.5 text-xs self-start"
                onClick={() => setExpanded(true)}
              >
                <span>
                  {intermediateStops.length}{" "}
                  {intermediateStops.length === 1 ? "stop" : "stops"}
                </span>
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            ) : (
              <button
                className="flex flex-col gap-1 py-1.5 self-start"
                onClick={() => setExpanded(false)}
              >
                {intermediateStops.map((stop) => (
                  <div
                    key={stop.stop_id}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span>{stop.stop_name}</span>
                  </div>
                ))}
              </button>
            )}
          </div>
        )}

        {/* Spacer when no intermediate stops */}
        {(!hasRoute || intermediateStops.length === 0) && (
          <div className="py-1" />
        )}

        {/* Destination */}
        <span className="text-sm font-medium text-slate-700 leading-tight">
          {destStation?.stop_name ?? destination}
        </span>
      </div>
    </div>
  );
};

export default RouteDiagram;
