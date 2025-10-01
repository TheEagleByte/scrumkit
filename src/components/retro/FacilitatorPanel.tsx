"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings2, Clock, Workflow, Target } from "lucide-react";
import { Timer, type TimerState } from "./Timer";
import { PhaseManager, type RetroPhase } from "./PhaseManager";
import { FocusMode } from "./FocusMode";
import { isSoundEnabled, setSoundEnabled } from "@/lib/utils/sound-notifications";

export interface FacilitatorSettings {
  timer: TimerState | null;
  phase: RetroPhase;
  focusedColumnId: string | null;
  soundEnabled: boolean;
}

interface FacilitatorPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: FacilitatorSettings;
  onSettingsChange: (settings: Partial<FacilitatorSettings>) => void;
  columns: Array<{ id: string; title: string; color?: string }>;
}

export function FacilitatorPanel({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
  columns,
}: FacilitatorPanelProps) {
  const [localSoundEnabled, setLocalSoundEnabled] = useState(isSoundEnabled());

  const handleTimerChange = (timerState: TimerState) => {
    onSettingsChange({ timer: timerState });
  };

  const handlePhaseChange = (phase: RetroPhase) => {
    onSettingsChange({ phase });
  };

  const handleFocusChange = (focusedColumnId: string | null) => {
    onSettingsChange({ focusedColumnId });
  };

  const handleSoundToggle = (enabled: boolean) => {
    setLocalSoundEnabled(enabled);
    setSoundEnabled(enabled);
    onSettingsChange({ soundEnabled: enabled });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Facilitator Tools
          </DialogTitle>
          <DialogDescription>
            Manage timer, phases, and focus mode to guide your retrospective session.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="timer" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="timer" className="gap-2">
              <Clock className="h-4 w-4" />
              Timer
            </TabsTrigger>
            <TabsTrigger value="phase" className="gap-2">
              <Workflow className="h-4 w-4" />
              Phase
            </TabsTrigger>
            <TabsTrigger value="focus" className="gap-2">
              <Target className="h-4 w-4" />
              Focus
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timer" className="space-y-4 mt-4">
            <Timer
              initialState={settings.timer || undefined}
              onChange={handleTimerChange}
            />
          </TabsContent>

          <TabsContent value="phase" className="space-y-4 mt-4">
            <PhaseManager
              currentPhase={settings.phase}
              onChange={handlePhaseChange}
            />
          </TabsContent>

          <TabsContent value="focus" className="space-y-4 mt-4">
            <FocusMode
              columns={columns}
              focusedColumnId={settings.focusedColumnId}
              onChange={handleFocusChange}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-enabled" className="flex flex-col gap-1">
                    <span className="font-medium">Sound Notifications</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Play sounds for timer completion, phase changes, and focus mode
                    </span>
                  </Label>
                  <Switch
                    id="sound-enabled"
                    checked={localSoundEnabled}
                    onCheckedChange={handleSoundToggle}
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border">
                <div className="space-y-2">
                  <div className="font-medium">About Facilitator Tools</div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      • <strong>Timer:</strong> Set a countdown to keep activities on schedule
                    </p>
                    <p>
                      • <strong>Phase:</strong> Guide the team through retrospective stages
                    </p>
                    <p>
                      • <strong>Focus:</strong> Highlight one column to maintain team attention
                    </p>
                    <p className="mt-2 pt-2 border-t border-border">
                      All facilitator actions are synced in real-time with other participants.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
