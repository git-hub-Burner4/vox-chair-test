import { useState } from "react";
import { Motion, MotionStatus } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vote } from "lucide-react";
import { VotingDialog } from "./VotingDialog";

interface MotionListProps {
  motions: Motion[];
  onVote: (motionId: string, votesFor: number, votesAgainst: number, abstentions: number) => void;
}

const statusColors: Record<MotionStatus, string> = {
  "Pending": "bg-warning text-warning-foreground",
  "In Progress": "bg-primary text-primary-foreground",
  "Passed": "bg-success text-success-foreground",
  "Failed": "bg-destructive text-destructive-foreground",
};

export const MotionList = ({ motions, onVote }: MotionListProps) => {
  const [selectedMotion, setSelectedMotion] = useState<Motion | null>(null);
  const [filter, setFilter] = useState<MotionStatus | "All">("All");

  const filteredMotions =
    filter === "All" ? motions : motions.filter((m) => m.status === filter);

  const handleVoteComplete = (votesFor: number, votesAgainst: number, abstentions: number) => {
    if (selectedMotion) {
      onVote(selectedMotion.id, votesFor, votesAgainst, abstentions);
      setSelectedMotion(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as MotionStatus | "All")}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="All">All</TabsTrigger>
            <TabsTrigger value="Pending">Pending</TabsTrigger>
            <TabsTrigger value="In Progress">In Progress</TabsTrigger>
            <TabsTrigger value="Passed">Passed</TabsTrigger>
            <TabsTrigger value="Failed">Failed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          {filteredMotions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No motions found</p>
            </Card>
          ) : (
            filteredMotions.map((motion) => (
              <Card key={motion.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{motion.name}</h4>
                      <Badge className={statusColors[motion.status]}>{motion.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        <span className="font-medium">Type:</span> {motion.type}
                      </p>
                      <p>
                        <span className="font-medium">Proposed by:</span> {motion.proposingCountry}
                      </p>
                      {motion.duration && (
                        <p>
                          <span className="font-medium">Duration:</span> {motion.duration} minutes
                        </p>
                      )}
                      {motion.speakersCount && (
                        <p>
                          <span className="font-medium">Speakers:</span> {motion.speakersCount} ({motion.speakingTime}s each)
                        </p>
                      )}
                      {motion.status !== "Pending" && (
                        <p className="pt-1">
                          <span className="font-medium">Votes:</span> For: {motion.votesFor || 0}, Against: {motion.votesAgainst || 0}, Abstain: {motion.abstentions || 0}
                        </p>
                      )}
                    </div>
                  </div>
                  {motion.status === "Pending" && (
                    <Button
                      size="sm"
                      onClick={() => setSelectedMotion(motion)}
                      className="formal-btn"
                    >
                      <Vote className="h-4 w-4 mr-2" />
                      Vote
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {selectedMotion && (
        <VotingDialog
          motion={selectedMotion}
          isOpen={!!selectedMotion}
          onClose={() => setSelectedMotion(null)}
          onVote={handleVoteComplete}
        />
      )}
    </>
  );
};
