import React, { useCallback, useEffect, useRef } from "react";
import Button from "../ui/Button";
import StationPicker from "./StationPicker";
import { Station } from "../../utils/subway";

export interface StationFieldProps {
  station: Station | null;
  isOpen: boolean;
  addLabel: string;
  line?: string;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (s: Station) => void;
  onClear: () => void;
}

const StationField: React.FC<StationFieldProps> = ({
  station,
  isOpen,
  addLabel,
  line,
  onOpen,
  onClose,
  onSelect,
  onClear,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    // scroll the station field to the top of the screen
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    document.addEventListener("mousedown", handleMouseDown);
    // close picker when focus is lost
    const container = containerRef.current;
    const handleFocusOut = (e: FocusEvent) => {
      // On mobile (touch), relatedTarget is null — the mousedown listener handles
      // "tap outside to close". Only close here for keyboard focus changes.
      if (!e.relatedTarget) return;
      if (!container?.contains(e.relatedTarget as Node)) {
        onClose();
      }
    };
    container?.addEventListener("focusout", handleFocusOut);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      container?.removeEventListener("focusout", handleFocusOut);
    };
  }, [isOpen, handleMouseDown, onClose]);

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-2 text-left">
      {isOpen ? (
        <StationPicker
          selectedStopId={station?.stop_id ?? null}
          onSelect={(s) => {
            onSelect(s);
            onClose();
          }}
          line={line}
        />
      ) : station ? (
        <div className="w-full flex items-center rounded-2xl bg-slate-50 border border-slate-200 pl-4 pr-2 py-2 text-md">
          <button
            type="button"
            onClick={onOpen}
            className="flex-1 text-left font-medium focus-visible:outline-none"
          >
            {station.stop_name}
          </button>
          <Button variant="pillSecondary" onClick={onClear} className="shrink-0 !rounded-xl !py-[0.31rem]">
            Clear
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-left text-md text-slate-400 transition-colors duration-100 md:hover:bg-slate-50 active:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
        >
          {addLabel}
        </button>
      )}
    </div>
  );
};

export default StationField;
