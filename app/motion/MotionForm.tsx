"use client";

import { useState } from "react";
import { Motion, MotionType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface MotionFormProps {
  committeeId: string;
  onSubmit: (motion: Omit<Motion, "id" | "createdAt">) => void;
  onCancel: () => void;
}

const motionTypes: MotionType[] = [
  "Moderated Caucus",
  "Unmoderated Caucus",
  "GSL",
  "Close Debate",
  "Table Debate",
  "Introduce Draft Resolution",
  "Custom",
];

export const MotionForm = ({ committeeId, onSubmit, onCancel }: MotionFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "Moderated Caucus" as MotionType,
    proposingCountry: "",
    duration: {
      minutes: 15,
      seconds: 0
    },
    speakingTime: {
      minutes: 1,
      seconds: 0
    }
  });

  // Calculate division of time for moderated caucus
  const calculateTimeDivision = () => {
    const totalTimeInSeconds = (formData.duration.minutes * 60) + formData.duration.seconds;
    const speakingTimeInSeconds = (formData.speakingTime.minutes * 60) + formData.speakingTime.seconds;
    
    if (speakingTimeInSeconds <= 0) return { canDivide: false, totalSpeakers: 0 };
    
    const possibleSpeakers = Math.floor(totalTimeInSeconds / speakingTimeInSeconds);
    return {
      canDivide: totalTimeInSeconds % speakingTimeInSeconds === 0,
      totalSpeakers: possibleSpeakers
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.proposingCountry.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const motionName = formData.name.trim() || formData.type;

    const totalDurationInMinutes = formData.duration.minutes + (formData.duration.seconds / 60);
    const speakingTimeInSeconds = (formData.speakingTime.minutes * 60) + formData.speakingTime.seconds;

    const { totalSpeakers } = calculateTimeDivision();

    const motion: Omit<Motion, "id" | "createdAt"> = {
      committeeId,
      name: motionName,
      type: formData.type,
      proposingCountry: formData.proposingCountry.trim(),
      status: "Pending",
      ...(formData.type === "Moderated Caucus" 
        ? { 
            duration: totalDurationInMinutes,
            totalSpeakers,
            speakingTime: speakingTimeInSeconds,
          }
        : formData.type === "Unmoderated Caucus"
        ? { duration: totalDurationInMinutes }
        : formData.type === "GSL"
        ? { 
            totalSpeakers,
            speakingTime: speakingTimeInSeconds 
          }
        : {}),
    };

    onSubmit(motion);
    toast.success("Motion created successfully");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-start">
        {(formData.type === "Moderated Caucus" || formData.type === "GSL") && (
          <span className={`px-2 py-1 rounded text-sm ${calculateTimeDivision().canDivide ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'}`}>
            {calculateTimeDivision().canDivide ? '✓ Evenly divisible' : '⚠️ Not divisible'}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="motion-name">Motion Name</Label>
        <Input
          id="motion-name"
          placeholder="Enter custom motion name (optional)"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="motion-type">Motion Type *</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value as MotionType })}
          name="motion-type"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a motion type" />
          </SelectTrigger>
          <SelectContent>
            {motionTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="proposing-country">Proposing Country *</Label>
        <Input
          id="proposing-country"
          placeholder="e.g., United States"
          value={formData.proposingCountry}
          onChange={(e) => setFormData({ ...formData, proposingCountry: e.target.value })}
          required
        />
      </div>

      {(formData.type === "Moderated Caucus" || formData.type === "Unmoderated Caucus") && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration-min">Duration (minutes)</Label>
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

          {formData.type === "Moderated Caucus" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="speaking-time-min">Speaking Time (minutes)</Label>
                  <Input
                    id="speaking-time-min"
                    type="number"
                    min="0"
                    value={formData.speakingTime.minutes}
                    onChange={(e) => setFormData({
                      ...formData,
                      speakingTime: {
                        ...formData.speakingTime,
                        minutes: parseInt(e.target.value) || 0
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="speaking-time-sec">Seconds</Label>
                  <Input
                    id="speaking-time-sec"
                    type="number"
                    min="0"
                    max="59"
                    value={formData.speakingTime.seconds}
                    onChange={(e) => setFormData({
                      ...formData,
                      speakingTime: {
                        ...formData.speakingTime,
                        seconds: parseInt(e.target.value) || 0
                      }
                    })}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Number of speakers: {calculateTimeDivision().totalSpeakers}
              </div>
            </div>
          )}
        </div>
      )}

      {formData.type === "GSL" && (
        <div className="space-y-2">
          <Label htmlFor="speaking-time">Speaking Time (sec)</Label>
          <Input
            id="speaking-time"
            type="number"
            min="10"
            value={formData.speakingTime.minutes * 60 + formData.speakingTime.seconds}
            onChange={(e) => {
              const totalSeconds = parseInt(e.target.value) || 60;
              setFormData({
                ...formData,
                speakingTime: {
                  minutes: Math.floor(totalSeconds / 60),
                  seconds: totalSeconds % 60
                }
              });
            }}
          />
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">
          Create Motion
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};