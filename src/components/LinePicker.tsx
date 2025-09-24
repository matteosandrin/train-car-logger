import React from 'react';
import Button from './ui/Button';
import FlowContainer from './ui/FlowContainer';
import { assetUrl } from '../lib/assets';

const LINES = [
  '1',
  '2',
  '3',
  '7',
  '4',
  '5',
  '6',
  'g',
  'a',
  'c',
  'e',
  'l',
  'b',
  'd',
  'f',
  'm',
  'n',
  'q',
  'r',
  'w',
  'j',
  'z',
  's',
];

interface LinePickerProps {
  onSelect: (line: string) => void;
  onBack: () => void;
  selectedLine?: string | null;
}

const LinePicker: React.FC<LinePickerProps> = ({ onSelect, onBack, selectedLine }) => {
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

      <div className="grid w-full grid-cols-[repeat(auto-fit,_minmax(72px,_1fr))] gap-4">
        {LINES.map((line) => (
          <button
            key={line}
            type="button"
            className="flex aspect-square w-full items-center justify-center"
            onClick={() => onSelect(line)}
          >
            <img src={assetUrl(`assets/${line}.svg`)} />
          </button>
        ))}
      </div>
    </FlowContainer>
  );
};

export default LinePicker;
