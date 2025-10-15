export type AttendanceStatus = 'present' | 'present-voting' | 'absent';

export type Speaker = {
  id?: string;
  name: string;
  flagQuery: string;
  attendance?: AttendanceStatus;
  yieldedTime?: number;
  isYielded?: boolean;
  code?: string;
};

export type Country = {
  name: string;
  code: string;
  attendance: AttendanceStatus;
};

export interface CommitteeSessionData {
  id: string;
  name: string;
  abbrev: string;
  agenda?: string;
  countries?: Country[];
  currentSpeaker?: Speaker;
  speakerQueue?: Speaker[];
  speakingTime: number;
  warningTime?: number;
  settings?: {
    enableMotions: boolean;
    enableVoting: boolean;
  };
}
