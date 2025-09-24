import React from 'react';
import Button from './ui/Button';
import FlowContainer from './ui/FlowContainer';

interface ConfirmationScreenProps {
  carNumber: string;
  line: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({ carNumber, line, onConfirm, onCancel }) => {
  return (
    <FlowContainer>
      <div className="flex w-full max-w-[420px] flex-col items-center gap-6 rounded-3xl bg-slate-900/85 p-8 text-center shadow-glow-card">
        <h1 className="text-2xl font-semibold">Confirm Entry</h1>
        <p className="text-base text-slate-300">Make sure everything looks right before saving.</p>
        <div className="grid w-full grid-cols-2 gap-4 text-center">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Car</span>
            <span className="text-3xl font-bold">{carNumber}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Line</span>
            <span className="text-3xl font-bold">{line}</span>
          </div>
        </div>
        <div className="flex w-full flex-col gap-3">
          <Button variant="primary" onClick={onConfirm}>
            Confirm
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </FlowContainer>
  );
};

export default ConfirmationScreen;
