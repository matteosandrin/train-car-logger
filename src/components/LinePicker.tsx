import React from 'react';
import Button from './ui/Button';
import FlowContainer from './ui/FlowContainer';

const LINES = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  'A',
  'C',
  'E',
  'B',
  'D',
  'F',
  'M',
  'G',
  'J',
  'Z',
  'L',
  'N',
  'Q',
  'R',
  'W',
  'S'
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

      <p className="text-base text-slate-300">Pick the line you rode on.</p>

      <div className="grid w-full grid-cols-[repeat(auto-fit,_minmax(72px,_1fr))] gap-4">
        {LINES.map((line) => (
          <button
            key={line}
            type="button"
            className={`flex aspect-square w-full items-center justify-center rounded-full bg-blue-900/35 text-2xl font-bold text-slate-50 transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
              selectedLine === line ? 'bg-gradient-to-br from-amber-300 to-orange-500 text-slate-900' : ''
            }`}
            onClick={() => onSelect(line)}
          >
            {line}
          </button>
        ))}
      </div>
    </FlowContainer>
  );
};

export default LinePicker;
