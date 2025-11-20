export interface Question {
  id: string;
  text: string;
}

export interface Domain {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface AssessmentOption {
  value: string;
  label: string;
  colorClass: string;
  score: number;
}

export type Answers = Record<string, string>;

export interface CalculationResult {
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  answeredCount: number;
  totalQuestions: number;
  maturityLevel: string;
  recommendation: string;
  domainScores: {
    subject: string;
    score: number;
    fullMark: number;
  }[];
}

export interface FirebaseConfig {
  appId: string;
  config: Record<string, unknown>;
  initialToken: string | null;
}