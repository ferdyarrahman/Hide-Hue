"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAudio } from "@/hooks/useAudio";

interface SettingsScreenProps {
  onBack: () => void;
  onResetProgress: () => void;
}

export function SettingsScreen({ onBack, onResetProgress }: SettingsScreenProps) {
  const [confirmingReset, setConfirmingReset] = useState(false);
  const { audio } = useAudio();

  const handleBack = () => {
    audio.playClick();
    onBack();
  };

  const handleResetClick = () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      return;
    }
    audio.playClick();
    onResetProgress();
    setConfirmingReset(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-leaf/10 to-cream">
      <Card className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-forest mb-6">Settings</h1>

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleResetClick}
            variant={confirmingReset ? "primary" : "secondary"}
            size="lg"
            className="w-full"
          >
            {confirmingReset ? "Tap again to confirm" : "Reset Progress"}
          </Button>
          {confirmingReset && (
            <button
              onClick={() => setConfirmingReset(false)}
              className="text-xs text-leaf underline"
            >
              Cancel
            </button>
          )}
        </div>

        <Button onClick={handleBack} variant="ghost" size="lg" className="w-full mt-8">
          Back
        </Button>
      </Card>
    </div>
  );
}
