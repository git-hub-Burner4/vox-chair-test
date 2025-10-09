import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { VotingData } from "@/types/templates";
import { XCircle, Check, X } from "lucide-react";

interface VotingSystemProps {
  onVotingComplete: (data: VotingData) => void;
  onCancel: () => void;
  topic: string;
  motionName: string;
  countries: Array<{ name: string; present: boolean }>;
  motion: {
    type: string;
    proposingCountry: string;
    duration?: number;
    speakersCount?: number;
    speakingTime?: number;
  };
}

export function VotingSystem({ onVotingComplete, onCancel, topic, motionName, countries, motion }: VotingSystemProps) {
  const [countryVotes, setCountryVotes] = useState<Record<string, "yes" | "no" | "abstain" | null>>(
    Object.fromEntries(countries.filter(c => c.present).map(c => [c.name, null]))
  );

  const counts = Object.values(countryVotes).reduce(
    (acc, vote) => {
      if (vote) acc[vote]++;
      return acc;
    },
    { yes: 0, no: 0, abstain: 0 }
  );

  const handleVote = (country: string, vote: "yes" | "no" | "abstain") => {
    setCountryVotes(prev => ({
      ...prev,
      [country]: prev[country] === vote ? null : vote
    }));
  };

  const handleSubmit = () => {
    const result = {
      ...counts,
      passed: counts.yes > counts.no
    };
    onVotingComplete(result);
  };

  return (
    <Card className="p-6 border-2 border-primary/20">
      <div className="space-y-6">
        <div className="pb-4 border-b space-y-3">
          <div>
            <h2 className="text-2xl font-bold">{motionName}</h2>
            <p className="text-sm text-muted-foreground mt-1">Motion Type: {topic}</p>
          </div>
          {topic === "Moderated Caucus" && motion?.duration && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium text-primary">Total Duration</p>
                <p className="text-lg font-semibold">{motion.duration} minutes</p>
              </div>
              {motion.speakingTime && (
                <div className="p-2 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-primary">Speaker Time</p>
                  <p className="text-lg font-semibold">{motion.speakingTime} seconds</p>
                </div>
              )}
            </div>
          )}
          {topic === "Unmoderated Caucus" && motion?.duration && (
            <div className="p-2 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium text-primary">Duration</p>
              <p className="text-lg font-semibold">{motion.duration} minutes</p>
            </div>
          )}
          {topic === "GSL" && motion?.speakersCount && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium text-primary">Speakers</p>
                <p className="text-lg font-semibold">{motion.speakersCount} countries</p>
              </div>
              {motion.speakingTime && (
                <div className="p-2 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-primary">Speaking Time</p>
                  <p className="text-lg font-semibold">{motion.speakingTime} seconds</p>
                </div>
              )}
            </div>
          )}
          {motion?.proposingCountry && (
            <div className="p-2 bg-accent/10 rounded-lg">
              <p className="text-sm font-medium text-accent-foreground">Proposed by</p>
              <p className="text-lg font-semibold">{motion.proposingCountry}</p>
            </div>
          )}
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {countries.filter(c => c.present).map(country => (
              <div key={country.name} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <span className="font-medium">{country.name}</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={countryVotes[country.name] === "yes" ? "default" : "outline"}
                    onClick={() => handleVote(country.name, "yes")}
                    className="min-w-[60px]"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Yes
                  </Button>
                  <Button
                    size="sm"
                    variant={countryVotes[country.name] === "no" ? "default" : "outline"}
                    onClick={() => handleVote(country.name, "no")}
                    className="min-w-[60px]"
                  >
                    <X className="h-4 w-4 mr-1" />
                    No
                  </Button>
                  <Button
                    size="sm"
                    variant={countryVotes[country.name] === "abstain" ? "default" : "outline"}
                    onClick={() => handleVote(country.name, "abstain")}
                  >
                    Abstain
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">{counts.yes}</div>
              <div className="text-sm text-muted-foreground">YES</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-red-600">{counts.no}</div>
              <div className="text-sm text-muted-foreground">NO</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-muted-foreground">{counts.abstain}</div>
              <div className="text-sm text-muted-foreground">ABSTAIN</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={handleSubmit} className="w-full bg-primary">
                Submit Vote
              </Button>
              <Button variant="outline" onClick={onCancel} className="w-full">
                Cancel Vote
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => onVotingComplete({ yes: 0, no: 0, abstain: 0, passed: false, adjourned: true })}
                className="w-full text-yellow-600 border-yellow-600 hover:bg-yellow-50"
              >
                Adjourn Motion
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (window.confirm('Are you sure you want to remove this motion? This action cannot be undone.')) {
                    onCancel();
                    // We'll handle the removal in the parent component
                    onVotingComplete({ yes: 0, no: 0, abstain: 0, passed: false, removed: true });
                  }
                }}
                className="w-full text-red-600 border-red-600 hover:bg-red-50"
              >
                Remove Motion
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}