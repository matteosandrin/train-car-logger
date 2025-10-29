import React from "react";

interface StatsDisplayProps {
  loggedCarsCount: number;
  repeatCarsCount: number;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({
  loggedCarsCount,
  repeatCarsCount,
}) => {
  return (
    <div className="grid gap-4 grid-cols-2 text-center">
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <p className="text-xs font-medium text-slate-500">LOGGED CARS</p>
        <p className="text-3xl font-semibold text-slate-900">
          {loggedCarsCount}
        </p>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <p className="text-xs font-medium text-slate-500">REPEAT CARS</p>
        <p className="text-3xl font-semibold text-slate-900">
          {repeatCarsCount}
        </p>
      </div>
    </div>
  );
};

export default StatsDisplay;
