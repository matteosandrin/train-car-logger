import React, { useCallback, useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import FlowContainer from "../ui/FlowContainer";
import { assetUrl } from "../../assets";
import StationPicker, { type Station } from "./StationPicker";

interface ConfirmationScreenProps {
  carNumber: string;
  line: string;
  note: string;
  onNoteChange: (note: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  originStation: Station | null;
  destinationStation: Station | null;
  onOriginChange: (s: Station | null) => void;
  onDestinationChange: (s: Station | null) => void;
}

type OpenPicker = "origin" | "destination" | null;

const labelClass =
  "block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500";

interface StationFieldProps {
  station: Station | null;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (s: Station) => void;
  onClear: () => void;
  addLabel: string;
}

const StationField: React.FC<StationFieldProps> = ({
  station,
  isOpen,
  onOpen,
  onClose,
  onSelect,
  onClear,
  addLabel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen, handleMouseDown]);

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-2 text-left">
      {station && (
        <div className="flex items-center justify-between">
          <Button variant="pillSecondary" onClick={onClear}>
            Clear
          </Button>
        </div>
      )}
      {isOpen ? (
        <StationPicker
          selectedStopId={station?.stop_id ?? null}
          onSelect={(s) => {
            onSelect(s);
            onClose();
          }}
        />
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className={[
            "w-full rounded-2xl px-4 py-3 text-left text-sm transition-colors duration-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400",
            station
              ? "bg-slate-50 ring-1 ring-sky-200 font-medium text-sky-700 md:hover:bg-sky-50 active:bg-sky-100"
              : "bg-white ring-1 ring-slate-200 text-slate-400 md:hover:bg-slate-50 active:bg-slate-100",
          ].join(" ")}
        >
          {station ? station.stop_name : addLabel}
        </button>
      )}
    </div>
  );
};

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  carNumber,
  line,
  note,
  onNoteChange,
  onConfirm,
  onCancel,
  originStation,
  destinationStation,
  onOriginChange,
  onDestinationChange,
}) => {
  const [openPicker, setOpenPicker] = useState<OpenPicker>(null);

  return (
    <FlowContainer>
      <h1 className="text-2xl font-semibold">Confirm Entry</h1>
      <div className="grid w-2/3 grid-cols-2 gap-4 text-center">
        <div>
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Car
          </span>
          <div className="mt-2 h-20 flex justify-center items-center">
            <span className="text-3xl font-bold">{carNumber}</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 w-full text-center">
            Line
          </span>
          <img className="mt-2 w-20 h-20" src={assetUrl(`/img/${line}.svg`)} />
        </div>
      </div>

      <StationField
        station={originStation}
        isOpen={openPicker === "origin"}
        onOpen={() => setOpenPicker("origin")}
        onClose={() => setOpenPicker(null)}
        onSelect={onOriginChange}
        onClear={() => onOriginChange(null)}
        addLabel="Add origin station"
      />

      <StationField
        station={destinationStation}
        isOpen={openPicker === "destination"}
        onOpen={() => setOpenPicker("destination")}
        onClose={() => setOpenPicker(null)}
        onSelect={onDestinationChange}
        onClear={() => onDestinationChange(null)}
        addLabel="Add destination station"
      />

      <textarea
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-md text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-sky-300"
        rows={3}
        placeholder="Add a note..."
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
      />
      <div className="flex w-full flex-col gap-3">
        <Button variant="primary" onClick={onConfirm}>
          Confirm
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </FlowContainer>
  );
};

export default ConfirmationScreen;
