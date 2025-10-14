"use client";

import { useState } from "react";
import type { Motion, MotionStatus, ExtendedMotion } from "@/types/motion";
import type { Speaker } from "@/types/shared/speaker";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Vote } from "lucide-react";
import { VotingDialog } from "@/components/shared/voting-dialog";

interface MotionListProps {
  motions: Motion[];
  onVote: (motionId: string, votesFor: number, votesAgainst: number, abstentions: number) => void;
  onAdjournMotion: (motionId: string) => void;
  onExtendMotion: (originalMotionId: string) => void;
  onEditMotion: (motion: Motion) => void;
  onReorderMotions: (newOrder: Motion[]) => void;
  onStatusChange: (motionId: string, newStatus: "Pending" | "In Progress" | "Completed") => void;
  allMembers: Speaker[];  // All available speakers
  currentSpeaker?: Speaker | null;  // Currently speaking member
}

const statusColors: Record<MotionStatus, string> = {
  "Pending": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/20 transition-colors",
  "In Progress": "bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 transition-colors",
  "Passed": "bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 transition-colors",
  "Failed": "bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20 transition-colors",
};

export const MotionList = ({ 
  motions, 
  onVote, 
  onAdjournMotion, 
  onExtendMotion, 
  onEditMotion,
  onReorderMotions,
  onStatusChange,
  allMembers 
}: MotionListProps) => {
  const [selectedMotion, setSelectedMotion] = useState<Motion | null>(null);
  const [filter, setFilter] = useState<MotionStatus | "All">("All");
  const [draggedMotion, setDraggedMotion] = useState<Motion | null>(null);
  const [dragOverMotionId, setDragOverMotionId] = useState<string | null>(null);
  
  // Sort motions: Passed -> In Progress -> Pending -> Failed
  const statusPriority: Record<MotionStatus, number> = {
    "Passed": 0,
    "In Progress": 1,
    "Pending": 2,
    "Failed": 3
  };

  const sortedMotions = [...motions].sort((a, b) => {
    return statusPriority[a.status] - statusPriority[b.status];
  });

  const filteredMotions =
    filter === "All" ? sortedMotions : sortedMotions.filter((m) => m.status === filter);

    const handleVoteComplete = (voteData: { yes: number; no: number; abstain: number; passed: boolean; adjourned?: boolean }) => {
    if (!selectedMotion) return;
    
    if (voteData.adjourned) {
      // For adjourned motions, just call adjourn
      onAdjournMotion(selectedMotion.id);
    } else {
      // For regular voting
      onVote(selectedMotion.id, voteData.yes, voteData.no, voteData.abstain);
    }
    
    setSelectedMotion(null);
  };

  const handleDragStart = (motion: Motion) => {
    setDraggedMotion(motion);
  };

  const handleDragEnd = () => {
    setDraggedMotion(null);
    setDragOverMotionId(null);
  };

  const handleDragOver = (e: React.DragEvent, motionId: string) => {
    e.preventDefault();
    if (draggedMotion?.id !== motionId) {
      setDragOverMotionId(motionId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetMotionId: string) => {
    e.preventDefault();
    if (!draggedMotion || draggedMotion.id === targetMotionId) return;

    // Only allow reordering within the same status group
    const targetMotion = motions.find(m => m.id === targetMotionId);
    if (!targetMotion || draggedMotion.status !== targetMotion.status) return;

    const draggedIdx = motions.findIndex(m => m.id === draggedMotion.id);
    const targetIdx = motions.findIndex(m => m.id === targetMotionId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    // Create new array with reordered motions
    const updatedMotions = [...motions];
    const [draggedItem] = updatedMotions.splice(draggedIdx, 1);
    updatedMotions.splice(targetIdx, 0, draggedItem);

    // Update parent component with new order
    onReorderMotions(updatedMotions);
    setDraggedMotion(null);
    setDragOverMotionId(null);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="All" className="w-full space-y-4 pb-4" onValueChange={(value) => setFilter(value as MotionStatus | "All")}>
        <TabsList className="w-full">
          <TabsTrigger value="All">All</TabsTrigger>
          <TabsTrigger value="Pending">Pending</TabsTrigger>
          <TabsTrigger value="In Progress">In Progress</TabsTrigger>
          <TabsTrigger value="Passed">Passed</TabsTrigger>
          <TabsTrigger value="Failed">Failed</TabsTrigger>
        </TabsList>
        <div className="space-y-3">
          {filteredMotions.length === 0 ? (
            <p className="text-muted-foreground text-center p-8">No motions found</p>
          ) : (
            filteredMotions.map((motion) => (
              <Card 
                key={motion.id} 
                className={`p-5 mx-4 hover:shadow-md transition-shadow cursor-move max-w-[95%]
                  ${dragOverMotionId === motion.id ? 'border-t-2 border-primary' : ''}
                  ${motion.type === "Extension" ? 'ml-8 border-l-4 border-l-primary' : ''}`}
                draggable
                onDragStart={() => handleDragStart(motion)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, motion.id)}
                onDrop={(e) => handleDrop(e, motion.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{motion.name}</h4>
                      <Badge className={`${statusColors[motion.status]} font-medium shadow-sm px-3`}>{motion.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        <span className="font-medium">Type:</span> {motion.type}
                        {motion.type === "Extension" && motion.parentMotionId && (
                          <span className="ml-2 text-muted-foreground">
                            (Extends Motion #{motion.parentMotionId.slice(0, 4)})
                          </span>
                        )}
                      </p>
                      <p>
                        <span className="font-medium">Proposed by:</span> {motion.proposingCountry}
                      </p>
                      {motion.duration !== undefined && (
                        <p>
                          <span className="font-medium">Duration:</span> {motion.duration} minutes
                          {motion.speakingTime !== undefined && (
                            <span className="ml-2">
                              ({Math.floor(motion.speakingTime / 60)}:{(motion.speakingTime % 60).toString().padStart(2, '0')} per speaker)
                            </span>
                          )}
                        </p>
                      )}
                      {motion.totalSpeakers !== undefined && (
                        <p>
                          <span className="font-medium">Speakers:</span> {motion.totalSpeakers}
                          {motion.status === "In Progress" && "speakers" in motion && (
                            <span className="ml-2">
                              ({(motion as ExtendedMotion).speakers.length} registered)
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {motion.status === "In Progress" && (
                      <>
                        {motion.type !== "Adjournment" && motion.type !== "Extension" && (
                          <Button
                            size="sm"
                            onClick={() => onExtendMotion(motion.id)}
                            className="formal-btn"
                          >
                            Extend
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAdjournMotion(motion.id)}
                        >
                          Adjourn
                        </Button>
                      </>
                    )}
                    {motion.status === "Pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => setSelectedMotion(motion)}
                          className={`${motion.type === "Extension" ? "formal-btn" : ""}`}
                        >
                          <Vote className="mr-2 h-4 w-4" />
                          Vote
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditMotion(motion)}
                        >
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Tabs>

      <Dialog open={!!selectedMotion} onOpenChange={(open) => !open && setSelectedMotion(null)}>
        <DialogContent className="sm:max-w-[400px]">
          {selectedMotion && (
            <VotingDialog
              motion={selectedMotion}
              isOpen={true}
              onClose={() => setSelectedMotion(null)}
              onVote={handleVoteComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};