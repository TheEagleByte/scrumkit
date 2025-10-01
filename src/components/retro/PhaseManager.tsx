"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Boxes, Vote, MessageCircle } from "lucide-react";
import { playPhaseChange } from "@/lib/utils/sound-notifications";

export type RetroPhase = "brainstorm" | "group" | "vote" | "discuss";

export interface PhaseInfo {
  id: RetroPhase;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export const PHASES: PhaseInfo[] = [
  {
    id: "brainstorm",
    label: "Brainstorm",
    description: "Individual thinking and idea generation",
    icon: <Brain className="h-4 w-4" />,
    color: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300",
  },
  {
    id: "group",
    label: "Group",
    description: "Group similar items together",
    icon: <Boxes className="h-4 w-4" />,
    color: "bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300",
  },
  {
    id: "vote",
    label: "Vote",
    description: "Team votes on items",
    icon: <Vote className="h-4 w-4" />,
    color: "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300",
  },
  {
    id: "discuss",
    label: "Discuss",
    description: "Review and discuss items",
    icon: <MessageCircle className="h-4 w-4" />,
    color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  },
];

interface PhaseManagerProps {
  currentPhase: RetroPhase;
  onChange?: (phase: RetroPhase) => void;
  compact?: boolean; // Compact mode for header display
}

export function PhaseManager({ currentPhase, onChange, compact = false }: PhaseManagerProps) {
  const currentPhaseInfo = PHASES.find((p) => p.id === currentPhase) || PHASES[0];

  const handlePhaseChange = (phase: RetroPhase) => {
    if (phase !== currentPhase) {
      playPhaseChange();
      onChange?.(phase);
    }
  };

  if (compact) {
    return (
      <Badge variant="outline" className={`gap-2 px-3 py-1.5 ${currentPhaseInfo.color}`}>
        {currentPhaseInfo.icon}
        <span className="font-medium">{currentPhaseInfo.label}</span>
      </Badge>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Phase Display */}
      <div className={`p-4 rounded-lg border ${currentPhaseInfo.color}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-md bg-background/50">
            {currentPhaseInfo.icon}
          </div>
          <div>
            <div className="font-semibold text-lg">{currentPhaseInfo.label}</div>
            <div className="text-sm opacity-80">{currentPhaseInfo.description}</div>
          </div>
        </div>
      </div>

      {/* Phase Selection */}
      <div className="grid grid-cols-2 gap-3">
        {PHASES.map((phase) => {
          const isActive = phase.id === currentPhase;
          return (
            <Button
              key={phase.id}
              variant={isActive ? "default" : "outline"}
              className={`h-auto py-3 px-4 justify-start ${!isActive ? phase.color : ''}`}
              onClick={() => handlePhaseChange(phase.id)}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="mt-0.5">{phase.icon}</div>
                <div className="text-left flex-1">
                  <div className="font-medium">{phase.label}</div>
                  <div className="text-xs opacity-70 font-normal mt-0.5">
                    {phase.description}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Phase Flow Indicator */}
      <div className="flex items-center justify-between px-2">
        {PHASES.map((phase, index) => {
          const isActive = phase.id === currentPhase;
          const currentIndex = PHASES.findIndex((p) => p.id === currentPhase);
          const isPast = index < currentIndex;

          return (
            <div key={phase.id} className="flex items-center">
              <div
                className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : isPast
                      ? "border-primary/50 bg-primary/20"
                      : "border-muted-foreground/30 bg-muted/50"
                }`}
              >
                {phase.icon}
              </div>
              {index < PHASES.length - 1 && (
                <div
                  className={`h-0.5 w-12 mx-1 transition-colors ${
                    isPast ? "bg-primary/50" : "bg-muted-foreground/20"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
