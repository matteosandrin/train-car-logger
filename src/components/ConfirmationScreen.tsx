import React from 'react';

interface ConfirmationScreenProps {
  carNumber: string;
  line: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({ carNumber, line, onConfirm, onCancel }) => {
  return (
    <div className="flex w-full max-w-[440px] flex-col items-center gap-6 text-center">
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
          <button
            type="button"
            className="w-full rounded-2xl bg-gradient-to-br from-teal-500 to-sky-500 px-6 py-4 text-lg font-semibold text-slate-900 transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            type="button"
            className="rounded-2xl bg-slate-600/40 px-6 py-4 font-semibold text-slate-100 transition-colors duration-150 hover:bg-slate-600/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationScreen;
