import React, { useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { assetUrl } from "../../assets";

interface LineFilterProps {
  uniqueLines: string[];
  lineFilter: string | null;
  setLineFilter: (line: string | null) => void;
}

const LineFilter: React.FC<LineFilterProps> = ({
  uniqueLines,
  lineFilter,
  setLineFilter,
}) => {
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-200">
      <button
        onClick={() => setFiltersExpanded(!filtersExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-900"
      >
        <span className="flex items-center gap-2">
          Filter by line
          {lineFilter !== null && (
            <span>
              <img
                className="w-4 h-4"
                src={assetUrl(`/img/${lineFilter}.svg`)}
                alt={`Line ${lineFilter}`}
              />
            </span>
          )}
        </span>
        <LuChevronDown
          className={`w-5 h-5 transition-transform duration-200 ${filtersExpanded ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`grid transition-all duration-200 ease-in-out ${
          filtersExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-7 gap-2 px-4 pb-4">
            <button
              onClick={() => setLineFilter(null)}
              className={`px-2 h-full rounded-full text-sm font-medium transition-colors col-span-2 ${
                lineFilter === null
                  ? "text-slate-900 bg-sky-100"
                  : "text-slate-500 hover:bg-slate-200"
              }`}
            >
              All lines
            </button>
            {uniqueLines.map((line) => (
              <button
                key={line}
                onClick={() => setLineFilter(line)}
                className={`rounded-full transition-all ${
                  lineFilter === line
                    ? "text-slate-900 bg-sky-100"
                    : `text-slate-500 hover:bg-slate-200 ${lineFilter !== null ? "opacity-50" : ""}`
                }`}
              >
                <img
                  className="w-full aspect-square"
                  src={assetUrl(`/img/${line}.svg`)}
                  alt={`Line ${line}`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineFilter;
