import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CarInputPad from '../components/CarInputPad';
import LinePicker from '../components/LinePicker';
import ConfirmationScreen from '../components/ConfirmationScreen';
import { useLogsContext } from '../logs-context';

type Step = 'input' | 'line' | 'confirm';

const EntryFlow: React.FC = () => {
  const [step, setStep] = useState<Step>('input');
  const [carNumber, setCarNumber] = useState<string>('');
  const [line, setLine] = useState<string | null>(null);
  const { addLog } = useLogsContext();
  const navigate = useNavigate();

  const resetFlow = useCallback(() => {
    setCarNumber('');
    setLine(null);
    setStep('input');
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
      setStep('line');
    }
  };

  const handleLineSelect = (selectedLine: string) => {
    setLine(selectedLine);
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (!line || carNumber.length !== 4) {
      return;
    }

    addLog(carNumber, line);
    resetFlow();
    navigate('/log');
  };

  const handleCancel = () => {
    resetFlow();
  };

  if (step === 'line') {
    return (
      <LinePicker
        selectedLine={line}
        onSelect={handleLineSelect}
        onBack={() => setStep('input')}
      />
    );
  }

  if (step === 'confirm' && line) {
    return <ConfirmationScreen carNumber={carNumber} line={line} onConfirm={handleConfirm} onCancel={handleCancel} />;
  }

  return (
    <CarInputPad
      value={carNumber}
      onDigit={handleDigit}
      onBackspace={handleBackspace}
      onReset={resetFlow}
      onConfirm={handleConfirmNumber}
      onSeeLog={() => navigate('/log')}
    />
  );
};

export default EntryFlow;
