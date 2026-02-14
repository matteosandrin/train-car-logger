"use client";

import React, { useCallback, useState } from "react";

import { useRouter } from "next/navigation";
import NumberPadScreen from "./NumberPadScreen";
import LinePickerScreen from "./LinePickerScreen";
import ConfirmationScreen from "./ConfirmationScreen";
import { useLogsContext } from "@/providers/LogsProvider";

type Step = "input" | "line" | "confirm";

const EntryFlow: React.FC = () => {
  const [step, setStep] = useState<Step>("input");
  const [carNumber, setCarNumber] = useState<string>("");
  const [line, setLine] = useState<string | null>(null);
  const { addLog, getCarCount } = useLogsContext();
  const router = useRouter();

  const resetFlow = useCallback(() => {
    setCarNumber("");
    setLine(null);
    setStep("input");
  }, []);

  const handleDigit = (digit: string) => {
    setCarNumber((prev) => {
      if (prev.length >= 4) {
        return prev;
      }
      return prev + digit;
    });
  };

  const handleBackspace = () => {
    setCarNumber((prev) => prev.slice(0, -1));
  };

  const handleConfirmNumber = useCallback(() => {
    if (carNumber.length === 4) {
      setStep("line");
    }
  }, [carNumber.length]);

  const handleLineSelect = (selectedLine: string) => {
    setLine(selectedLine);
    setStep("confirm");
  };

  const handleConfirm = () => {
    if (!line || carNumber.length !== 4) {
      return;
    }

    addLog(carNumber, line);
    const repeat = getCarCount(carNumber);
    router.push(`/history?fromNewEntry=true&repeat=${repeat}`);
  };

  const handleCancel = () => {
    resetFlow();
  };

  if (step === "line") {
    return <LinePickerScreen onSelect={handleLineSelect} onBack={resetFlow} />;
  }

  if (step === "confirm" && line) {
    return (
      <ConfirmationScreen
        carNumber={carNumber}
        line={line}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <NumberPadScreen
      value={carNumber}
      onDigit={handleDigit}
      onBackspace={handleBackspace}
      onReset={resetFlow}
      onConfirm={handleConfirmNumber}
    />
  );
};

export default EntryFlow;
