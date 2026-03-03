import React, { useEffect, useRef, useState } from "react";
import stationsData from "../../utils/stations.json";
import { assetUrl } from "../../assets";

export interface Station {
  stop_id: string;
  stop_name: string;
  latitude: number;
  longitude: number;
  routes: string[];
}

interface StationPickerProps {
  selectedStopId: string | null;
  onSelect: (station: Station) => void;
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

const allStations = stationsData as Station[];

const StationPicker: React.FC<StationPickerProps> = ({
  selectedStopId,
  onSelect,
}) => {
  const [query, setQuery] = useState("");
  const [stations, setStations] = useState<Station[]>(allStations);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setStations(
          [...allStations].sort(
            (a, b) =>
              haversineKm(latitude, longitude, a.latitude, a.longitude) -
              haversineKm(latitude, longitude, b.latitude, b.longitude),
          ),
        );
      },
      () => {
        // permission denied or unavailable — keep JSON order
      },
      { timeout: 5000 },
    );
  }, []);

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
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
      />
      <div className="max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <p className="px-4 py-3 text-sm text-slate-400">No stations found</p>
        ) : (
          filtered.map((station) => {
            const isSelected = station.stop_id === selectedStopId;
            return (
              <button
                key={station.stop_id}
                type="button"
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
  );
};

export default StationPicker;
