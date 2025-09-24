import React from 'react';
import Button from './ui/Button';
import FlowContainer from './ui/FlowContainer';

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
    <FlowContainer>
      <div className="flex w-full items-center justify-between gap-3">
        <h1 className="font-bold text-3xl">Train Car Logger</h1>
        <Button variant="pill" onClick={onSeeLog}>
          See log
        </Button>
      </div>

      <p className="text-base text-slate-600">Enter the 4-digit car number.</p>

      <div className="flex justify-center gap-3 md:gap-4 text-3xl tracking-[0.24em]" aria-label="car number">
        {Array.from({ length: MAX_LENGTH }).map((_, index) => (
          <div
            key={index}
            className={`flex h-20 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl font-semibold text-slate-600 shadow-inner transition-colors duration-150 `}
          >
            <div className="mr-[-0.5rem]">{value[index] ?? '•'}</div>
          </div>
        ))}
      </div>

      <div className="grid w-full grid-cols-3 gap-3 md:gap-4">
        {keypadDigits.map((digit) => (
          <Button
            key={digit}
            variant="keypad"
            onClick={() => onDigit(digit)}
            disabled={value.length >= MAX_LENGTH}
          >
            {digit}
          </Button>
        ))}
        <Button variant="keypadSecondary" onClick={onReset}>
          Clear
        </Button>
        <Button
          variant="keypad"
          onClick={() => onDigit('0')}
          disabled={value.length >= MAX_LENGTH}
        >
          0
        </Button>
        <Button variant="keypadSecondary" onClick={onBackspace}>
          ⌫
        </Button>
      </div>

      <Button
        variant="primary"
        onClick={onConfirm}
        disabled={!isFull}
      >
        {isFull ? 'Continue' : 'Enter 4 digits'}
      </Button>
    </FlowContainer>
  );
};

export default CarInputPad;
