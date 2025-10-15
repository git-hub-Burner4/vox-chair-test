"use client";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DialogProps } from "@/types/shared/dialog"
import type { Motion } from "@/types/motion";
import { TimePicker } from "@/components/time-picker"

export interface TimeSettingsDialogProps extends DialogProps {
  currentTime: number
  onSave: (minutes: number, seconds: number, updateMotion?: boolean) => void
  activeMotionId?: string
  motions: Motion[]
}

export function TimeSettingsDialog({ 
  open, 
  onOpenChange, 
  currentTime, 
  onSave, 
  activeMotionId, 
  motions 
}: TimeSettingsDialogProps) {
  const [timeInSeconds, setTimeInSeconds] = useState(currentTime);
  const activeMotion = activeMotionId ? motions.find(m => m.id === activeMotionId) : null;

  useEffect(() => {
    if (open) {
      setTimeInSeconds(currentTime);
    }
  }, [open, currentTime]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md dark:bg-neutral-900 border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Set Speaking Time</DialogTitle>
        </DialogHeader>

        <div className="py-6">
          <TimePicker 
            value={timeInSeconds} 
            onChange={setTimeInSeconds}
          />
        </div>

        <DialogFooter className="flex gap-3 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none bg-transparent border border-neutral-700 hover:bg-neutral-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              const mins = Math.floor(timeInSeconds / 60);
              const secs = timeInSeconds % 60;
              onSave(mins, secs, false);
              onOpenChange(false);
            }}
            className="flex-1 sm:flex-none bg-neutral-800 hover:bg-neutral-700 text-white"
          >
            Apply for Current Speaker
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}