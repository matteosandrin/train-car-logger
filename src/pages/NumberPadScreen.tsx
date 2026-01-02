import React, { useMemo, useState } from "react";
import Button from "../components/ui/Button";
import FlowContainer from "../components/ui/FlowContainer";
import { calculateTrainStats } from "../utils/stats";
import { useLogsContext } from "../logs-context";
import StatsDisplay from "../components/ui/StatsDisplay";

interface NumberPadScreenProps {
  value: string;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onReset: () => void;
  onConfirm: () => void;
}

const MAX_LENGTH = 4;

const keypadDigits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

const CLEAR_COUNT_THRESHOLD = 3;

const NumberPadScreen: React.FC<NumberPadScreenProps> = ({
  value,
  onDigit,
  onBackspace,
  onReset,
  onConfirm,
}) => {
  const { logs } = useLogsContext();
  let clearCount = 0;

  if (value.length === MAX_LENGTH) {
    onConfirm();
  }

  const { loggedCarsCount, repeatCars } = useMemo(
    () => calculateTrainStats(logs),
    [logs],
  );

  return (
    <FlowContainer className="flex flex-col">
      <div className="flex-grow flex flex-col gap-6 w-full">
        <StatsDisplay
          loggedCarsCount={loggedCarsCount}
          repeatCarsCount={repeatCars.length}
        />
        <div className="w-full self-center rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <p className="text-base text-slate-600">
            Enter the 4-digit car number.
          </p>
          <div
            className="flex justify-center gap-3 mt-4 text-3xl tracking-[0.24em]"
            aria-label="car number"
          >
            {Array.from({ length: MAX_LENGTH }).map((_, index) => (
              <div
                key={index}
                className={`flex h-20 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl font-semibold text-slate-600 shadow-inner transition-colors duration-150 `}
              >
                <div className="mr-[-0.5rem]">{value[index] ?? "•"}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid w-full grid-cols-3 gap-3">
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
          <Button
            variant="keypadSecondary"
            onClick={() => {
              clearCount++;
              if (clearCount >= CLEAR_COUNT_THRESHOLD) {
                clearCount = 0;
                // secret shortcut to reload page
                window.location.reload();
                return;
              }
              setTimeout(() => {
                clearCount = 0;
              }, 2000);
              onReset();
            }}
          >
            Clear
          </Button>
          <Button
            variant="keypad"
            onClick={() => onDigit("0")}
            disabled={value.length >= MAX_LENGTH}
          >
            0
          </Button>
          <Button variant="keypadSecondary" onClick={onBackspace}>
            ⌫
          </Button>
        </div>
      </div>
    </FlowContainer>
  );
};

export default NumberPadScreen;
