"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface TutorialProps {
  onComplete: () => void;
}

const tutorialSteps = [
  {
    title: "Welcome to Hide & Hue!",
    description: "Help the chameleon blend into its surroundings to avoid predators.",
    image: "/assets/characters/chameleon_idle.webp",
  },
  {
    title: "Step 1: Look at the Environment",
    description: "Observe the colors and patterns of the hiding spot.",
    image: "/assets/ui/tutorial_observe.webp",
  },
  {
    title: "Step 2: Adjust Colors",
    description: "Use the sliders to match the chameleon's colors to the environment.",
    image: "/assets/ui/tutorial_adjust.webp",
  },
  {
    title: "Step 3: Hide!",
    description: "When you're ready, tap the HIDE NOW button to lock your camouflage.",
    image: "/assets/ui/tutorial_hide.webp",
  },
  {
    title: "Step 4: Survive!",
    description: "Watch as the predator searches. If your camouflage is good enough, you'll be safe!",
    image: "/assets/ui/tutorial_survive.webp",
  },
];

export function Tutorial({ onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <Card className="w-full max-w-sm mx-4 text-center">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep
                  ? "bg-leaf"
                  : index < currentStep
                  ? "bg-leaf/50"
                  : "bg-forest/20"
              }`}
            />
          ))}
        </div>

        {/* Image */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <Image
            src={step.image}
            alt={step.title}
            fill
            sizes="128px"
            style={{
              objectFit: "contain",
            }}
            priority
          />
        </div>

        {/* Content */}
        <h2 className="text-xl font-bold text-forest mb-2">{step.title}</h2>
        <p className="text-leaf mb-6">{step.description}</p>

        {/* Navigation */}
        <div className="flex flex-col gap-3">
          <Button onClick={handleNext} className="w-full">
            {currentStep < tutorialSteps.length - 1 ? "Next" : "Start Playing!"}
          </Button>
          <button
            onClick={handleSkip}
            className="text-sm text-leaf hover:text-forest transition-colors"
          >
            Skip Tutorial
          </button>
        </div>
      </Card>
    </div>
  );
}
