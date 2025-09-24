import React from 'react';

interface CarInputPadProps {
  value: string;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onReset: () => void;
  onConfirm: () => void;
  onSeeLog: () => void;
}

const MAX_LENGTH = 4;

const keypadDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

const CarInputPad: React.FC<CarInputPadProps> = ({
  value,
  onDigit,
  onBackspace,
  onReset,
  onConfirm,
  onSeeLog,
}) => {
  const isFull = value.length === MAX_LENGTH;

  return (
    <div className="flex w-full max-w-[440px] flex-col items-center gap-6 text-center">
      <div className="flex w-full items-center justify-between gap-3">
        <h1>Log Train Car</h1>
        <button
          type="button"
          className="rounded-full bg-blue-900/25 px-4 py-2 text-sm font-semibold text-blue-200 transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          onClick={onSeeLog}
        >
          See log
        </button>
      </div>

      <p className="text-base text-slate-300">Tap the keypad to enter the 4-digit car number.</p>

      <div className="flex justify-center gap-4 text-3xl tracking-[0.24em]" aria-label="car number">
        {Array.from({ length: MAX_LENGTH }).map((_, index) => (
          <span
            key={index}
            className={`flex h-20 w-16 items-center justify-center rounded-2xl bg-slate-400/15 text-3xl font-semibold text-slate-400 transition-colors duration-150 ${
              index < value.length ? 'bg-sky-400/20 text-slate-50' : ''
            }`}
          >
            {value[index] ?? '•'}
          </span>
        ))}
      </div>

      <div className="grid w-full grid-cols-3 gap-4">
        {keypadDigits.map((digit) => (
          <button
            key={digit}
            type="button"
            className="rounded-2xl bg-blue-900/25 py-5 text-2xl font-semibold text-sky-100 transition-colors duration-150 hover:bg-blue-900/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => onDigit(digit)}
            disabled={value.length >= MAX_LENGTH}
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          className="rounded-2xl bg-slate-600/40 py-5 text-2xl font-semibold text-slate-100 transition-colors duration-150 hover:bg-slate-600/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          onClick={onReset}
        >
          Clear
        </button>
        <button
          type="button"
          className="rounded-2xl bg-blue-900/25 py-5 text-2xl font-semibold text-sky-100 transition-colors duration-150 hover:bg-blue-900/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => onDigit('0')}
          disabled={value.length >= MAX_LENGTH}
        >
          0
        </button>
        <button
          type="button"
          className="rounded-2xl bg-slate-600/40 py-5 text-2xl font-semibold text-slate-100 transition-colors duration-150 hover:bg-slate-600/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          onClick={onBackspace}
        >
          ⌫
        </button>
      </div>

      <button
        type="button"
        className="w-full rounded-2xl bg-gradient-to-br from-teal-500 to-sky-500 px-6 py-4 text-lg font-semibold text-slate-900 transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 md:w-4/5 md:self-center"
        onClick={onConfirm}
        disabled={!isFull}
      >
        {isFull ? 'Continue' : 'Enter 4 digits'}
      </button>
    </div>
  );
};

export default CarInputPad;
