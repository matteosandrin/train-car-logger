import React, { useState } from "react";
import { createPortal } from "react-dom";
import type { TrainLogEntry } from "@train-car-logger/shared";
import { assetUrl } from "../../assets";
import { formatTimestamp } from "../../utils/formatting";
import Button from "./Button";
import { useLogsContext } from "../../storage";

interface EntryDetailModalProps {
  entry: TrainLogEntry;
  onClose: () => void;
  onDelete: (entry: TrainLogEntry) => void;
}

const EntryDetailModal: React.FC<EntryDetailModalProps> = ({ entry, onClose, onDelete }) => {
  const { updateNote } = useLogsContext();
  const [note, setNote] = useState(entry.notes ?? "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (typeof document === "undefined") {
    return null;
  }

  const handleDone = async () => {
    if (note !== (entry.notes ?? "")) {
      await updateNote(entry, note);
    }
    onClose();
  };

  const handleDelete = () => {
    onDelete(entry);
    onClose();
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-50">
        <div
          className="fade-in-backdrop absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        <div className="slide-up-sheet absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 flex flex-col gap-4">
          <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />
          <div className="flex items-center gap-4 h-16">
            <img
              className="w-16 h-16"
              src={assetUrl(`/img/${entry.line}.svg`)}
              alt={entry.line}
            />
            <div>
              <span className="block text-xs font-semibold uppercase tracking-widest text-slate-500">
                Car
              </span>
              <div className="text-4xl font-bold font-mono">{entry.car}</div>
            </div>
          </div>
          <div className="flex justify-between items-center gap-4">
            <p className="text-sm text-slate-500 font-mono">{formatTimestamp(entry.timestamp)}</p>
            <Button variant="pillSecondary" onClick={() => setConfirmingDelete(true)}>
              Delete entry
            </Button>
          </div>
          <textarea
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-md text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-sky-300"
            rows={3}
            placeholder="Add a note…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button variant="primary" onClick={handleDone}>
            Done
          </Button>
        </div>
      </div>

      {confirmingDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <div
            className="fade-in-backdrop absolute inset-0 bg-black/40"
            onClick={() => setConfirmingDelete(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm flex flex-col gap-3 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800">Delete entry?</h2>
            <p className="text-sm text-slate-500">
              Car <span className="font-mono">{entry.car}</span> logged on {formatTimestamp(entry.timestamp)} will be permanently removed.
            </p>
            <div className="flex flex-col gap-2 mt-1">
              <button
                className="w-full rounded-2xl bg-red-600 px-6 py-4 text-lg font-semibold text-white shadow-md transition-colors duration-150 md:hover:bg-red-700 active:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </button>
              <Button variant="secondary" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body,
  );
};

export default EntryDetailModal;
