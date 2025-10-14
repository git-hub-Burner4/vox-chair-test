"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { Motion } from "@/types/motion";
import type { Speaker } from "@/types/shared/speaker";

interface MotionDialogProps {
  motion: Motion;
  isOpen: boolean;
  onClose: () => void;
  onVote: (votes: { yes: number; no: number; abstain: number; passed: boolean }) => void;
  allMembers: Speaker[];
}

export function MotionDialog({
  motion,
  isOpen,
  onClose,
  onVote,
  allMembers
}: MotionDialogProps) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const presentMembers = allMembers.filter(member => member.present);

  const handleVoteComplete = (voteType: 'yes' | 'no' | 'abstain') => {
    const votes = {
      yes: voteType === 'yes' ? presentMembers.length : 0,
      no: voteType === 'no' ? presentMembers.length : 0,
      abstain: voteType === 'abstain' ? presentMembers.length : 0,
      passed: voteType === 'yes'
    };
    onVote(votes);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{motion.type}</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <h3 className="font-medium">{motion.name || "Untitled Motion"}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Proposed by: {motion.proposedBy}
          </p>
          {motion.duration && (
            <p className="text-sm text-muted-foreground">
              Duration: {motion.duration} minutes
            </p>
          )}
          {motion.speakingTime && (
            <p className="text-sm text-muted-foreground">
              Speaking Time: {motion.speakingTime} seconds
            </p>
          )}
        </div>

        <ScrollArea className="h-[300px] px-4">
          <div className="space-y-4 py-4">
            <div className="font-medium mb-2">Present Members ({presentMembers.length})</div>
            {presentMembers.map((member) => (
              <div
                key={member.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedMember === member.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedMember(member.id)}
              >
                {member.name}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex flex-col gap-2 mt-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleVoteComplete('yes')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Pass
            </Button>
            <Button
              onClick={() => handleVoteComplete('no')}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Fail
            </Button>
          </div>
          <Button
            onClick={() => handleVoteComplete('abstain')}
            variant="outline"
            className="w-full"
          >
            Abstain
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
