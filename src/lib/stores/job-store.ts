import { create } from "zustand";

interface JobState {
  currentJobId: string | null;
  jobTitle: string;
  matchScore: number;
  competencies: any[];
  gaps: any[];
  cvData: any | null;
  setCurrentJob: (id: string, title: string) => void;
  setMatchScore: (score: number) => void;
  setCompetencies: (comps: any[]) => void;
  setGaps: (gaps: any[]) => void;
  setCvData: (data: any) => void;
  reset: () => void;
}

export const useJobStore = create<JobState>((set) => ({
  currentJobId: null,
  jobTitle: "",
  matchScore: 0,
  competencies: [],
  gaps: [],
  cvData: null,
  setCurrentJob: (id, title) => set({ currentJobId: id, jobTitle: title }),
  setMatchScore: (score) => set({ matchScore: score }),
  setCompetencies: (comps) => set({ competencies: comps }),
  setGaps: (gaps) => set({ gaps: gaps }),
  setCvData: (data) => set({ cvData: data }),
  reset: () => set({ currentJobId: null, jobTitle: "", matchScore: 0, competencies: [], gaps: [], cvData: null }),
}));
