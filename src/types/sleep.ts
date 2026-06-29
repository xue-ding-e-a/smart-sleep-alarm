export type SleepStage = 'awake' | 'rem' | 'light' | 'deep';

export interface SleepDataPoint {
  timestamp: number;
  heartRate: number;
  movement: number;
  bloodOxygen: number;
  stage: SleepStage;
}

export interface SleepStageSummary {
  stage: SleepStage;
  duration: number;
}

export interface SleepRecord {
  id: string;
  startTime: number;
  endTime: number;
  stages: SleepStageSummary[];
  dataPoints: SleepDataPoint[];
  qualityScore: number;
  awakenTime: number;
  awakenReason: string;
}

export type AlarmSound = 'gentle' | 'birds' | 'classic' | 'ocean';

export interface AlarmSettings {
  enabled: boolean;
  earliestWakeTime: string;
  latestWakeTime: string;
  wakeWindowEnabled: boolean;
  targetSleepDuration: number;
  volume: number;
  snoozeDuration: number;
  sound: AlarmSound;
  vibration: boolean;
}

export type HealthPlatformType = 
  | 'apple_health' 
  | 'huawei_health' 
  | 'xiaomi_health' 
  | 'oppo_health' 
  | 'samsung_health';

export interface HealthPlatform {
  id: HealthPlatformType;
  name: string;
  description: string;
  icon: string;
  color: string;
  authorized: boolean;
  lastSyncTime: string | null;
  dataTypes: string[];
}

export interface HealthPlatformState {
  platforms: HealthPlatform[];
  isAnyAuthorized: boolean;
  primaryPlatform: HealthPlatformType | null;
}

export interface SleepGoalSettings {
  targetDuration: number;
  bedtimeReminder: boolean;
  reminderTime: string;
}
