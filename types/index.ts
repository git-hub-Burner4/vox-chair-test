export type MotionType = 
  | "Moderated Caucus"
  | "Unmoderated Caucus"
  | "GSL"
  | "Close Debate"
  | "Table Debate"
  | "Introduce Draft Resolution"
  | "Custom";

export type MotionStatus = "Pending" | "In Progress" | "Passed" | "Failed";

export type Motion = {
  id: string;
  committeeId: string;
  name: string;
  type: MotionType;
  proposingCountry: string;
  status: MotionStatus;
  duration?: number;
  speakersCount?: number;
  speakingTime?: number;
  votesFor?: number;
  votesAgainst?: number;
  abstentions?: number;
  createdAt: string;
}

export type VotingData = {
  yes: number;
  no: number;
  abstain: number;
  passed: boolean;
  adjourned?: boolean;
  removed?: boolean;
}