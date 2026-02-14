import React, { useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { assetUrl } from "../../lib/assets";

interface LeaderboardTableProps {
  leaderboard: Array<{ car: string; entries: string[] }>;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ leaderboard }) => {
  const [leaderboardExpanded, setLeaderboardExpanded] = useState(false);

  if (leaderboard.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Repeat Cars</h2>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full table-auto text-left">
          <thead className="bg-slate-100">
            <tr>
              {["Car", "Repeats"].map((header) => (
                <th
                  key={header}
                  className="px-3 py-2 text-base font-semibold text-slate-600"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(leaderboardExpanded
              ? leaderboard
              : leaderboard.slice(0, 3)
            ).map((item) => {
              const rowClasses = "px-3 py-2 text-xl text-slate-700 font-mono";
              return (
                <tr key={item.car} className="even:bg-slate-50">
                  <td className={rowClasses + " w-1/2"}>{item.car}</td>
                  <td className={rowClasses}>
                    <div className="grid grid-cols-3 gap-1 w-fit">
                      {item.entries.map((line, index) => {
                        return (
                          <img
                            className="w-12 aspect-square"
                            src={assetUrl(`/img/${line}.svg`)}
                            key={index}
                          />
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {leaderboard.length > 3 && (
          <button
            onClick={() => setLeaderboardExpanded(!leaderboardExpanded)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors border-t border-slate-200"
          >
            {leaderboardExpanded ? (
              <>
                Show less
                <LuChevronDown className="w-4 h-4 rotate-180" />
              </>
            ) : (
              <>
                Show {leaderboard.length - 3} more
                <LuChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default LeaderboardTable;
