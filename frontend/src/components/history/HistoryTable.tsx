import React from "react";
import { LuArrowDown, LuArrowUp, LuArrowUpDown } from "react-icons/lu";
import type { TrainLogEntry } from "@train-car-logger/shared";
import { assetUrl } from "../../assets";
import { formatTimestamp } from "../../utils/formatting";

interface HistoryTableProps {
  filteredLogs: TrainLogEntry[];
  carSortOrder: "asc" | "desc" | null;
  toggleCarSort: () => void;
  onRowClick: (entry: TrainLogEntry) => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({
  filteredLogs,
  carSortOrder,
  toggleCarSort,
  onRowClick,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="min-w-full table-auto text-left">
        <thead className="bg-slate-100">
          <tr>
            <th className="pl-3 pr-1 py-2 text-base font-semibold text-slate-600">
              Date
            </th>
            <th className="pl-3 pr-1 py-2 text-base font-semibold text-slate-600">
              <button
                onClick={toggleCarSort}
                className="flex items-center gap-2 hover:text-slate-900 transition-colors"
              >
                Car
                {carSortOrder === null && (
                  <LuArrowUpDown className="w-4 h-4 text-slate-400" />
                )}
                {carSortOrder === "asc" && (
                  <LuArrowUp className="w-4 h-4 text-slate-400" />
                )}
                {carSortOrder === "desc" && (
                  <LuArrowDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </th>
            <th className="pl-3 pr-1 py-2 text-base font-semibold text-slate-600">
              Line
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((entry) => {
            const rowClasses = "pl-3 pr-1 py-2 text-sm text-slate-700 font-mono";
            const entryId = `${entry.timestamp}-${entry.car}-${entry.line}`;

            return (
              <tr
                key={entryId}
                className="even:bg-slate-50 transition-colors cursor-pointer active:bg-slate-100"
                onClick={() => onRowClick(entry)}
              >
                <td className={rowClasses}>
                  {formatTimestamp(entry.timestamp)}
                </td>
                <td className={rowClasses}>{entry.car}</td>
                <td className={rowClasses}>
                  <img
                    className="w-8 aspect-square"
                    src={assetUrl(`/img/${entry.line}.svg`)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTable;
