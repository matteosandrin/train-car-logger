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
      <h1 className="text-2xl font-semibold">Confirm Entry</h1>
      <div className="grid w-full grid-cols-2 gap-4 text-center">
        <div>
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Car</span>
          <div className="mt-2 h-20 flex justify-center items-center">
            <span className="text-3xl font-bold">{carNumber}</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 w-full text-center">Line</span>
          <img className="mt-2 w-20 h-20" src={`/assets/${line}.svg`}/>
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
    </FlowContainer>
  );
};

export default ConfirmationScreen;
