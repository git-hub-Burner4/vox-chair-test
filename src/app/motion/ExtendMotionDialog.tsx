"use client";

import { useState, useEffect } from "react";
import { Motion, MotionType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface ExtendMotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalMotion: Motion;
  onSubmit: (motionId: string, additionalDuration: number, newSpeakingTime: number, proposingCountry: string) => void;
  countries: Array<{ name: string; code: string }>;
}

export const ExtendMotionDialog = ({ open, onOpenChange, originalMotion, onSubmit, countries }: ExtendMotionDialogProps) => {
  const initialSpeakingTime = originalMotion?.speakingTime 
    ? {
        minutes: Math.floor(originalMotion.speakingTime / 60),
        seconds: originalMotion.speakingTime % 60
      }
    : { minutes: 1, seconds: 0 };

  const [formData, setFormData] = useState({
    duration: {
      minutes: 15,
      seconds: 0
    },
    speakingTime: initialSpeakingTime,
    useSameTimings: !!originalMotion?.speakingTime,
    proposingCountry: countries[0]?.name || ''
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      const origSpeakingTime = originalMotion?.speakingTime 
        ? {
            minutes: Math.floor(originalMotion.speakingTime / 60),
            seconds: originalMotion.speakingTime % 60
          }
        : { minutes: 1, seconds: 0 };

      setFormData({
        duration: {
          minutes: 15,
          seconds: 0
        },
        speakingTime: origSpeakingTime,
        useSameTimings: originalMotion?.speakingTime ? true : false,
        proposingCountry: countries[0]?.name || ''
      });
    }
  }, [open, originalMotion?.speakingTime, countries]);

  // Update speaking time when originalMotion changes
  useEffect(() => {
    const speakingTimeMins = originalMotion?.speakingTime 
      ? Math.floor(originalMotion.speakingTime / 60)
      : 1;
    const speakingTimeSecs = originalMotion?.speakingTime 
      ? originalMotion.speakingTime % 60
      : 0;
      
    setFormData(prev => ({
      duration: {
        minutes: 15,
        seconds: 0
      },
      speakingTime: {
        minutes: speakingTimeMins,
        seconds: speakingTimeSecs
      },
      useSameTimings: originalMotion?.speakingTime ? true : false,
      proposingCountry: countries[0]?.name || ''
    }));
  }, [originalMotion, countries]);

  // Calculate division of time for moderated caucus
  const calculateTimeDivision = () => {
    const totalTimeInSeconds = (formData.duration.minutes * 60) + formData.duration.seconds;
    const speakingTimeInSeconds = formData.useSameTimings 
      ? (originalMotion.speakingTime || 0)
      : (formData.speakingTime.minutes * 60) + formData.speakingTime.seconds;
    
    if (speakingTimeInSeconds <= 0) return { canDivide: false, totalSpeakers: 0 };
    
    const possibleSpeakers = Math.floor(totalTimeInSeconds / speakingTimeInSeconds);
    return {
      canDivide: totalTimeInSeconds % speakingTimeInSeconds === 0,
      totalSpeakers: possibleSpeakers
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const additionalDurationInMinutes = formData.duration.minutes + (formData.duration.seconds / 60);
    const newSpeakingTimeInSeconds = formData.useSameTimings
      ? originalMotion.speakingTime || 0
      : (formData.speakingTime.minutes * 60) + formData.speakingTime.seconds;

    onSubmit(originalMotion.id, additionalDurationInMinutes, newSpeakingTimeInSeconds);
    onOpenChange(false);
    toast.success("Motion extended successfully");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Extend {originalMotion?.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-start">
            {(originalMotion?.type === "Moderated Caucus" || originalMotion?.type === "GSL") && (
              <span className={`px-2 py-1 rounded text-sm ${calculateTimeDivision().canDivide ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'}`}>
                {calculateTimeDivision().canDivide ? '✓ Evenly divisible' : '⚠️ Not divisible'}
                <div className="mt-1">
                  Total Speakers: {calculateTimeDivision().totalSpeakers}
                </div>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="same-timings"
              checked={formData.useSameTimings}
              onCheckedChange={(checked) => {
                setFormData(prev => {
                  if (checked) {
                    // When checked, use original motion's speaking time if available
                    const speakingTime = originalMotion.speakingTime 
                      ? {
                          minutes: Math.floor(originalMotion.speakingTime / 60),
                          seconds: originalMotion.speakingTime % 60
                        }
                      : prev.speakingTime;

                    return {
                      ...prev,
                      useSameTimings: true,
                      speakingTime
                    };
                  } else {
                    // When unchecked, maintain current values but enable editing
                    return {
                      ...prev,
                      useSameTimings: false
                    };
                  }
                });
              }}
            />
            <Label htmlFor="same-timings" className="text-sm font-medium leading-none">
              Use same speaking time as original motion
            </Label>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration-min">Additional Duration (minutes)</Label>
                <Input
                  id="duration-min"
                  type="number"
                  min="0"
                  value={formData.duration.minutes}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    duration: {
                      ...formData.duration,
                      minutes: parseInt(e.target.value) || 0
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration-sec">Seconds</Label>
                <Input
                  id="duration-sec"
                  type="number"
                  min="0"
                  max="59"
                  value={formData.duration.seconds}
                  onChange={(e) => setFormData({
                    ...formData,
                    duration: {
                      ...formData.duration,
                      seconds: parseInt(e.target.value) || 0
                    }
                  })}
                />
              </div>
            </div>

            {(!formData.useSameTimings || originalMotion?.type === "Moderated Caucus" || originalMotion?.type === "GSL") && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="speaking-time-min">Speaking Time (minutes)</Label>
                    <Input
                      id="speaking-time-min"
                      type="number"
                      min="0"
                      disabled={formData.useSameTimings}
                      value={formData.speakingTime.minutes}
                      onChange={(e) => !formData.useSameTimings && setFormData(prev => ({
                        ...prev,
                        speakingTime: {
                          ...prev.speakingTime,
                          minutes: parseInt(e.target.value) || 0
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="speaking-time-sec">Seconds</Label>
                    <Input
                      id="speaking-time-sec"
                      type="number"
                      min="0"
                      max="59"
                      disabled={formData.useSameTimings}
                      value={formData.speakingTime.seconds}
                      onChange={(e) => !formData.useSameTimings && setFormData(prev => ({
                        ...prev,
                        speakingTime: {
                          ...prev.speakingTime,
                          seconds: parseInt(e.target.value) || 0
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">
              Extend Motion
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};