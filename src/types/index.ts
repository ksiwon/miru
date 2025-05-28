// types/index.ts

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  residence: {
    livingSituation: string;
    environment: string;
  };
}

export interface HikikomoriStatus {
  startDate: string;
  avgOutTimePerDay: string;
  outingsLastMonth: number;
  usualDestinations: string[];
}

export interface MentalState {
  anxietyLevel: number;
  socialDiscomfort: string;
  emotionalIssues: string[];
  selfEfficacy: string;
}

export interface DigitalBehavior {
  dailyScreenTime: string;
  platforms: string[];
  onlineConnections: string;
}

export interface Interests {
  likes: string[];
  goals: string;
  dislikes: string[];
}

export interface Health {
  chronicConditions: string;
  lifestyle: string;
  physicalAbility: string;
  medication: string;
}

export interface PastExperiences {
  triedToGoOut: boolean;
  motivators: string[];
  failReasons: string[];
}

export interface UserData {
  id?: string;
  name: string;
  age: number;
  gender: string;
  residence: {
    livingSituation: string;
    environment: string;
  };
  hikikomoriStatus: HikikomoriStatus;
  mentalState: MentalState;
  digitalBehavior: DigitalBehavior;
  interests: Interests;
  health: Health;
  pastExperiences: PastExperiences;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ChangeStage = 'precontemplation' | 'contemplation' | 'preparation' | 'action' | 'maintenance';

export interface Quest {
  id: string;
  title: string;
  unlock_condition: string;
  completion_condition: string;
  reward: string;
  completed: boolean;
  completedAt?: Date;
}

export interface QuestData {
  id?: string;
  userId: string;
  userName: string;
  stage: ChangeStage;
  quests: Quest[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export interface AssessmentQuestion {
  category: string;
  question: string;
  key: string;
}