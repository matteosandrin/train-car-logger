import React, { useCallback, useState } from "react";
import { LuArrowDown, LuArrowUp, LuArrowUpDown } from "react-icons/lu";
import { TrainLogEntry } from "../../storage";
import { assetUrl } from "../../assets";
import { formatTimestamp } from "../../utils/formatting";

type SwipeState = {
  startX: number;
  currentX: number;
  isDragging: boolean;
};

interface HistoryTableProps {
  filteredLogs: TrainLogEntry[];
  carSortOrder: "asc" | "desc" | null;
  toggleCarSort: () => void;
  onDeleteEntry: (entry: TrainLogEntry) => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({
  filteredLogs,
  carSortOrder,
  toggleCarSort,
  onDeleteEntry,
}) => {
  const [swipeStates, setSwipeStates] = useState<Map<string, SwipeState>>(
    new Map(),
  );

  const handleSwipeStart = useCallback(
    (event: React.TouchEvent | React.MouseEvent, entryId: string) => {
      const clientX =
        "touches" in event ? event.touches[0].clientX : event.clientX;
      setSwipeStates(
        (prev) =>
          new Map(
            prev.set(entryId, {
              startX: clientX,
              currentX: clientX,
              isDragging: true,
            }),
          ),
      );
    },
    [],
  );

  const handleSwipeMove = useCallback(
    (event: React.TouchEvent | React.MouseEvent, entryId: string) => {
      const swipeState = swipeStates.get(entryId);
      if (!swipeState?.isDragging) return;

      event.preventDefault();
      const clientX =
        "touches" in event ? event.touches[0].clientX : event.clientX;
      setSwipeStates(
        (prev) =>
          new Map(
            prev.set(entryId, {
              ...swipeState,
              currentX: clientX,
            }),
          ),
      );
    },
    [swipeStates],
  );

  const handleSwipeEnd = useCallback(
    (entry: TrainLogEntry, entryId: string) => {
      const swipeState = swipeStates.get(entryId);
      if (!swipeState?.isDragging) return;

      const swipeDistance = swipeState.startX - swipeState.currentX;
      const deleteThreshold = 150;

      if (swipeDistance > deleteThreshold) {
        onDeleteEntry(entry);
      }

      setSwipeStates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(entryId);
        return newMap;
      });
    },
    [swipeStates, onDeleteEntry],
  );

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
            const rowClasses =
              "pl-3 pr-1 py-2 text-sm text-slate-700 font-mono";
            const entryId = `${entry.timestamp}-${entry.car}-${entry.line}`;
            const swipeState = swipeStates.get(entryId);
            const swipeOffset = swipeState
              ? Math.min(0, swipeState.currentX - swipeState.startX)
              : 0;

            return (
              <tr
                key={entryId}
                className={`even:bg-slate-50 transition-colors relative overflow-hidden`}
                style={{
                  transform: `translateX(${swipeOffset}px)`,
                  transition: swipeState?.isDragging
                    ? "none"
                    : "transform 0.3s ease-out",
                }}
                onTouchStart={(event) => handleSwipeStart(event, entryId)}
                onTouchMove={(event) => handleSwipeMove(event, entryId)}
                onTouchEnd={() => handleSwipeEnd(entry, entryId)}
                onMouseDown={(event) => handleSwipeStart(event, entryId)}
                onMouseMove={(event) => handleSwipeMove(event, entryId)}
                onMouseUp={() => handleSwipeEnd(entry, entryId)}
                onMouseLeave={() => handleSwipeEnd(entry, entryId)}
              >
                <td className={rowClasses}>{formatTimestamp(entry.timestamp)}</td>
                <td className={rowClasses}>{entry.car}</td>
                <td className={rowClasses + " relative"}>
                  <img
                    className="w-8 aspect-square"
                    src={assetUrl(`/img/${entry.line}.svg`)}
                  />
                  {/* add a red background when doing swipe to delete */}
                  {swipeOffset < 0 && (
                    <div
                      className="absolute inset-y-0 bg-red-500 -z-10 flex items-center"
                      style={{
                        left: "100%",
                        width: "200vw",
                      }}
                    >
                      <div className="text-xl font-semibold text-white ml-3 font-sans">
                        ⌫
                      </div>
                    </div>
                  )}
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
