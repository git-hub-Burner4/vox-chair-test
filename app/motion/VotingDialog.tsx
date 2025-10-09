"use client"

import { useState } from "react";
import { Motion } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VotingDialogProps {
  motion: Motion;
  isOpen: boolean;
  onClose: () => void;
  onVote: (votesFor: number, votesAgainst: number, abstentions: number) => void;
}

export const VotingDialog = ({ motion, isOpen, onClose, onVote }: VotingDialogProps) => {
  const [votes, setVotes] = useState({
    for: 0,
    against: 0,
    abstain: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVote(votes.for, votes.against, votes.abstain);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vote on Motion</DialogTitle>
          <DialogDescription>Enter the voting results for this motion</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="votes-for">Votes For</Label>
                <Input
                  id="votes-for"
                  type="number"
                  min="0"
                  value={votes.for}
                  onChange={(e) =>
                    setVotes({ ...votes, for: Math.max(0, parseInt(e.target.value) || 0) })
                  }
                  className="formal-input"
                />
              </div>
              <div>
                <Label htmlFor="votes-against">Votes Against</Label>
                <Input
                  id="votes-against"
                  type="number"
                  min="0"
                  value={votes.against}
                  onChange={(e) =>
                    setVotes({ ...votes, against: Math.max(0, parseInt(e.target.value) || 0) })
                  }
                  className="formal-input"
                />
              </div>
              <div>
                <Label htmlFor="abstentions">Abstentions</Label>
                <Input
                  id="abstentions"
                  type="number"
                  min="0"
                  value={votes.abstain}
                  onChange={(e) =>
                    setVotes({ ...votes, abstain: Math.max(0, parseInt(e.target.value) || 0) })
                  }
                  className="formal-input"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="formal-btn">
              Cancel
            </Button>
            <Button type="submit" className="formal-btn">
              Submit Vote
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};