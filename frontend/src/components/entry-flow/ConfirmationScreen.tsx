import React, { useState } from "react";
import Button from "../ui/Button";
import FlowContainer from "../ui/FlowContainer";
import { assetUrl } from "../../assets";
import { Station } from "../../utils/subway";
import StationField from "./StationField";

interface ConfirmationScreenProps {
  carNumber: string;
  line: string;
  note: string;
  onNoteChange: (note: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  origin: Station | null;
  destination: Station | null;
  onOriginChange: (s: Station | null) => void;
  onDestinationChange: (s: Station | null) => void;
}

type OpenPicker = "origin" | "destination" | null;

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  carNumber,
  line,
  note,
  onNoteChange,
  onConfirm,
  onCancel,
  origin,
  destination,
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
        station={origin}
        isOpen={openPicker === "origin"}
        onOpen={() => setOpenPicker("origin")}
        onClose={() => setOpenPicker(null)}
        onSelect={onOriginChange}
        onClear={() => onOriginChange(null)}
        addLabel="Add origin station"
        line={line}
      />

      <StationField
        station={destination}
        isOpen={openPicker === "destination"}
        onOpen={() => setOpenPicker("destination")}
        onClose={() => setOpenPicker(null)}
        onSelect={onDestinationChange}
        onClear={() => onDestinationChange(null)}
        addLabel="Add destination station"
        line={line}
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
