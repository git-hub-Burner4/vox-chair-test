import { useState } from "react";
import { Motion } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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

  const totalVotes = votes.for + votes.against + votes.abstain;
  const requiredToPass = Math.floor(totalVotes / 2) + 1;
  const willPass = votes.for >= requiredToPass;

  const handleSubmit = () => {
    if (totalVotes === 0) {
      toast.error("Please enter at least one vote");
      return;
    }

    onVote(votes.for, votes.against, votes.abstain);
    toast.success(willPass ? "Motion passed!" : "Motion failed");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vote on Motion</DialogTitle>
          <DialogDescription>{motion.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="votes-for">Votes For</Label>
            <Input
              id="votes-for"
              type="number"
              min="0"
              value={votes.for}
              onChange={(e) => setVotes({ ...votes, for: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label htmlFor="votes-against">Votes Against</Label>
            <Input
              id="votes-against"
              type="number"
              min="0"
              value={votes.against}
              onChange={(e) => setVotes({ ...votes, against: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label htmlFor="abstentions">Abstentions</Label>
            <Input
              id="abstentions"
              type="number"
              min="0"
              value={votes.abstain}
              onChange={(e) => setVotes({ ...votes, abstain: parseInt(e.target.value) || 0 })}
            />
          </div>

          {totalVotes > 0 && (
            <div className="pt-4 border-t">
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">
                  Total votes: {totalVotes}
                </p>
                <p className="text-muted-foreground">
                  Required to pass: {requiredToPass}
                </p>
                <p className={`font-semibold ${willPass ? 'text-success' : 'text-destructive'}`}>
                  Result: {willPass ? 'PASSES' : 'FAILS'}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="formal-btn">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="formal-btn">
            Record Vote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
