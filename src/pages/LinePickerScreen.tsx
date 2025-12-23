import React from "react";
import Button from "../components/ui/Button";
import FlowContainer from "../components/ui/FlowContainer";
import { assetUrl } from "../assets";
import { PICKER_LINES } from "../utils/subway";

interface LinePickerScreenProps {
  onSelect: (line: string) => void;
  onBack: () => void;
}

const LinePickerScreen: React.FC<LinePickerScreenProps> = ({
  onSelect,
  onBack,
}) => {
  return (
    <FlowContainer>
      <div className="flex w-full items-center justify-between gap-3">
        <Button variant="pill" onClick={onBack}>
          ← Back
        </Button>
        <h1 className="text-2xl font-semibold">Choose Line</h1>
        <span aria-hidden="true" className="invisible w-20">
          ← Back
        </span>
      </div>

      <p className="text-base text-slate-600">Pick the line you rode on.</p>

      <div className="grid w-full grid-cols-4 gap-4">
        {PICKER_LINES.map((line) => (
          <button
            key={line}
            type="button"
            className="flex aspect-square w-full items-center justify-center"
            onClick={() => onSelect(line)}
          >
            <img src={assetUrl(`/img/${line}.svg`)} />
          </button>
        ))}
      </div>
    </FlowContainer>
  );
};

export default LinePickerScreen;
