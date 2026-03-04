import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import NumberPadScreen from "../components/entry-flow/NumberPadScreen";
import LinePickerScreen from "../components/entry-flow/LinePickerScreen";
import ConfirmationScreen from "../components/entry-flow/ConfirmationScreen";
import type { Station } from "../components/entry-flow/StationPicker";
import { useLogsContext } from "../storage";

type Step = "input" | "line" | "confirm";

const EntryFlow: React.FC = () => {
  const [step, setStep] = useState<Step>("input");
  const [carNumber, setCarNumber] = useState<string>("");
  const [line, setLine] = useState<string | null>(null);
  const [note, setNote] = useState<string>("");
  const [origin, setOrigin] = useState<Station | null>(null);
  const [destination, setDestination] = useState<Station | null>(null);
  const { addLog, getCarCount } = useLogsContext();
  const navigate = useNavigate();

  const resetFlow = useCallback(() => {
    setCarNumber("");
    setLine(null);
    setNote("");
    setOrigin(null);
    setDestination(null);
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

  const handleConfirmNumber = () => {
    if (carNumber.length === 4) {
      setStep("line");
    }
  };

  const handleLineSelect = (selectedLine: string) => {
    setLine(selectedLine);
    setStep("confirm");
  };

  const handleConfirm = () => {
    if (!line || carNumber.length !== 4) {
      return;
    }

    addLog(carNumber, line, undefined, note || undefined, origin?.stop_id ?? undefined, destination?.stop_id ?? undefined);
    const repeat = getCarCount(carNumber);
    resetFlow();
    navigate("/history", { state: { fromNewEntry: true, repeat } });
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
        note={note}
        onNoteChange={setNote}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        origin={origin}
        destination={destination}
        onOriginChange={setOrigin}
        onDestinationChange={setDestination}
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
