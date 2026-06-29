import type { SleepRecord, SleepDataPoint } from '../types/sleep';
import { generateSleepData, calculateStageSummaries } from './sleepDataGenerator';

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function setTimeForDate(date: Date, hour: number, minute: number): Date {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function generateMockHistory(days: number): SleepRecord[] {
  const records: SleepRecord[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);

    const sleepHour = Math.floor(randomInRange(22, 25));
    const sleepMinute = Math.floor(randomInRange(0, 60));
    const actualSleepHour = sleepHour >= 24 ? sleepHour - 24 : sleepHour;

    let sleepDate = new Date(day);
    if (sleepHour >= 24) {
      sleepDate.setDate(sleepDate.getDate() + 1);
    }
    const startTime = setTimeForDate(sleepDate, actualSleepHour, sleepMinute).getTime();

    const durationMinutes = Math.floor(randomInRange(7 * 60, 8.5 * 60));
    const endTime = startTime + durationMinutes * 60 * 1000;

    const dataPoints: SleepDataPoint[] = generateSleepData(durationMinutes, startTime);

    const stages = calculateStageSummaries(dataPoints);
    const qualityScore = Math.floor(randomInRange(70, 96));

    const awakenMinutesBeforeEnd = Math.floor(randomInRange(0, 15));
    const awakenTime = endTime - awakenMinutesBeforeEnd * 60 * 1000;

    const reasons = ['自然醒来', '闹钟唤醒', '身体动了一下', '去洗手间', '做了个梦'];
    const awakenReason = reasons[Math.floor(Math.random() * reasons.length)];

    records.push({
      id: generateId(),
      startTime,
      endTime,
      stages,
      dataPoints,
      qualityScore,
      awakenTime,
      awakenReason,
    });
  }

  return records.sort((a, b) => b.startTime - a.startTime);
}

export function getWeeklySummary(records: SleepRecord[]) {
  if (records.length === 0) {
    return {
      avgQualityScore: 0,
      avgDuration: 0,
      avgDeepSleep: 0,
      avgRemSleep: 0,
      totalNights: 0,
    };
  }

  const totalQuality = records.reduce((sum, r) => sum + r.qualityScore, 0);
  const totalDuration = records.reduce((sum, r) => sum + (r.endTime - r.startTime), 0);

  let totalDeepSleep = 0;
  let totalRemSleep = 0;
  for (const record of records) {
    const deep = record.stages.find((s) => s.stage === 'deep');
    const rem = record.stages.find((s) => s.stage === 'rem');
    if (deep) totalDeepSleep += deep.duration;
    if (rem) totalRemSleep += rem.duration;
  }

  return {
    avgQualityScore: Math.round(totalQuality / records.length),
    avgDuration: Math.round(totalDuration / records.length),
    avgDeepSleep: Math.round(totalDeepSleep / records.length),
    avgRemSleep: Math.round(totalRemSleep / records.length),
    totalNights: records.length,
  };
}

export interface PersonalizedStats {
  avgBedtime: string;
  avgWakeTime: string;
  avgDuration: number;
  mostCommonWakeStage: string;
  avgDeepSleepOffsetHours: number;
  totalRecords: number;
}

export function getPersonalizedStats(records: SleepRecord[]): PersonalizedStats {
  if (records.length === 0) {
    return {
      avgBedtime: '00:00',
      avgWakeTime: '00:00',
      avgDuration: 0,
      mostCommonWakeStage: 'light',
      avgDeepSleepOffsetHours: 1.5,
      totalRecords: 0,
    };
  }

  let totalBedtimeMinutes = 0;
  let totalWakeTimeMinutes = 0;
  let totalDuration = 0;

  const wakeStageCounts: Record<string, number> = {};
  let totalDeepSleepOffsetMinutes = 0;
  let deepSleepOffsetCount = 0;

  for (const record of records) {
    const startDate = new Date(record.startTime);
    let bedtimeMin = startDate.getHours() * 60 + startDate.getMinutes();
    if (bedtimeMin < 12 * 60) {
      bedtimeMin += 24 * 60;
    }
    totalBedtimeMinutes += bedtimeMin;

    const endDate = new Date(record.endTime);
    const wakeTimeMin = endDate.getHours() * 60 + endDate.getMinutes();
    totalWakeTimeMinutes += wakeTimeMin;

    totalDuration += record.endTime - record.startTime;

    const lastStage = record.dataPoints[record.dataPoints.length - 1]?.stage || 'light';
    wakeStageCounts[lastStage] = (wakeStageCounts[lastStage] || 0) + 1;

    let firstDeepSleepIdx = -1;
    for (let i = 0; i < record.dataPoints.length; i++) {
      if (record.dataPoints[i].stage === 'deep') {
        firstDeepSleepIdx = i;
        break;
      }
    }
    if (firstDeepSleepIdx >= 0) {
      totalDeepSleepOffsetMinutes += firstDeepSleepIdx;
      deepSleepOffsetCount++;
    }
  }

  const avgBedtimeMin = Math.round(totalBedtimeMinutes / records.length);
  const avgBedtimeHour = Math.floor(avgBedtimeMin / 60) % 24;
  const avgBedtimeMinOfHour = avgBedtimeMin % 60;
  const avgBedtime = `${avgBedtimeHour.toString().padStart(2, '0')}:${avgBedtimeMinOfHour.toString().padStart(2, '0')}`;

  const avgWakeTimeMin = Math.round(totalWakeTimeMinutes / records.length);
  const avgWakeHour = Math.floor(avgWakeTimeMin / 60);
  const avgWakeMinOfHour = avgWakeTimeMin % 60;
  const avgWakeTime = `${avgWakeHour.toString().padStart(2, '0')}:${avgWakeMinOfHour.toString().padStart(2, '0')}`;

  let mostCommonWakeStage = 'light';
  let maxCount = 0;
  for (const [stage, count] of Object.entries(wakeStageCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonWakeStage = stage;
    }
  }

  const avgDeepSleepOffsetHours = deepSleepOffsetCount > 0
    ? Math.round((totalDeepSleepOffsetMinutes / deepSleepOffsetCount) / 60 * 10) / 10
    : 1.5;

  return {
    avgBedtime,
    avgWakeTime,
    avgDuration: Math.round(totalDuration / records.length),
    mostCommonWakeStage,
    avgDeepSleepOffsetHours,
    totalRecords: records.length,
  };
}
