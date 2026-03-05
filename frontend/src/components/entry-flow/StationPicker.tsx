import React, { useEffect, useRef, useState } from "react";
import { assetUrl } from "../../assets";
import { Station, getStopsForRoute } from "../../utils/subway";

interface StationPickerProps {
  selectedStopId: string | null;
  onSelect: (station: Station) => void;
  line?: string;
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const StationPicker: React.FC<StationPickerProps> = ({
  selectedStopId,
  onSelect,
  line,
}) => {
  const stations = line ? getStopsForRoute(line) : [];
  const [query, setQuery] = useState("");
  const [closestStopId, setClosestStopId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    searchRef.current?.focus();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const closest = stations.reduce(
          (best, s) => {
            const d = haversineKm(latitude, longitude, s.latitude, s.longitude);
            return d < best.dist ? { station: s, dist: d } : best;
          },
          { station: stations[0], dist: Infinity },
        );
        setClosestStopId(closest.station.stop_id);
      },
      () => {},
      { timeout: 5000 },
    );
  }, []);

  // when the closest stop is selected, scroll to it
  useEffect(() => {
    if (!closestStopId) return;
    const el = rowRefs.current.get(closestStopId);
    const list = listRef.current;
    if (el && list) {
      list.scrollTop = list.scrollTop + el.getBoundingClientRect().top - list.getBoundingClientRect().top;
    }
  }, [closestStopId]);

  const filtered = query.trim()
    ? stations.filter((s) =>
        s.stop_name.toLowerCase().includes(query.toLowerCase()),
      )
    : stations;

  return (
    <div className="w-full flex flex-col gap-2">
      <input
        ref={searchRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search stations..."
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-md text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
      />
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
      <div ref={listRef} className="max-h-[10rem] overflow-y-auto bg-white divide-y divide-slate-100 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
        {filtered.length === 0 ? (
          <p className="px-4 py-3 text-sm text-slate-400">No stations found</p>
        ) : (
          filtered.map((station) => {
            const isSelected = station.stop_id === selectedStopId;
            return (
              <button
                key={station.stop_id}
                type="button"
                ref={(el) => {
                  if (el) rowRefs.current.set(station.stop_id, el);
                  else rowRefs.current.delete(station.stop_id);
                }}
                onClick={() => onSelect(station)}
                className={[
                  "w-full flex items-center justify-between gap-2 px-4 py-3 text-left transition-colors duration-100",
                  isSelected
                    ? "bg-sky-50"
                    : "md:hover:bg-slate-50 active:bg-slate-100",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span
                  className={[
                    "text-sm font-medium",
                    isSelected ? "text-sky-700" : "text-slate-700",
                  ].join(" ")}
                >
                  {station.stop_name}
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  {station.routes.map((route) => (
                    <img
                      key={route}
                      src={assetUrl(`/img/${route.toLowerCase()}.svg`)}
                      alt={route}
                      className="w-4 h-4"
                    />
                  ))}
                </span>
              </button>
            );
          })
        )}
      </div>
      </div>
    </div>
  );
};

export default StationPicker;
