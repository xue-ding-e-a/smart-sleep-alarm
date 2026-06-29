import type { SleepStage, SleepDataPoint, SleepStageSummary } from '../types/sleep';

interface StageConfig {
  stage: SleepStage;
  durationMinutes: number;
  heartRateRange: [number, number];
  movementRange: [number, number];
}

const CYCLE_STAGES: StageConfig[] = [
  { stage: 'light', durationMinutes: 15, heartRateRange: [55, 68], movementRange: [0.1, 0.4] },
  { stage: 'deep', durationMinutes: 30, heartRateRange: [48, 58], movementRange: [0, 0.1] },
  { stage: 'light', durationMinutes: 20, heartRateRange: [55, 68], movementRange: [0.1, 0.4] },
  { stage: 'rem', durationMinutes: 20, heartRateRange: [60, 75], movementRange: [0.3, 0.7] },
  { stage: 'awake', durationMinutes: 5, heartRateRange: [70, 85], movementRange: [0.5, 1] },
];

const BLOOD_OXYGEN_RANGE: [number, number] = [95, 99];

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateDataPoint(
  timestamp: number,
  stage: SleepStage,
  heartRateRange: [number, number],
  movementRange: [number, number]
): SleepDataPoint {
  return {
    timestamp,
    heartRate: Math.round(randomInRange(heartRateRange[0], heartRateRange[1]) * 10) / 10,
    movement: Math.round(randomInRange(movementRange[0], movementRange[1]) * 100) / 100,
    bloodOxygen: Math.round(randomInRange(BLOOD_OXYGEN_RANGE[0], BLOOD_OXYGEN_RANGE[1]) * 10) / 10,
    stage,
  };
}

export function generateSleepCycle(
  durationMinutes: number = 90,
  startTime: number = Date.now()
): SleepDataPoint[] {
  const dataPoints: SleepDataPoint[] = [];
  const totalCycleDuration = CYCLE_STAGES.reduce((sum, s) => sum + s.durationMinutes, 0);
  const scale = durationMinutes / totalCycleDuration;

  let currentTime = startTime;

  for (const stageConfig of CYCLE_STAGES) {
    const stageDuration = Math.round(stageConfig.durationMinutes * scale);
    for (let i = 0; i < stageDuration; i++) {
      dataPoints.push(
        generateDataPoint(
          currentTime,
          stageConfig.stage,
          stageConfig.heartRateRange,
          stageConfig.movementRange
        )
      );
      currentTime += 60 * 1000;
    }
  }

  return dataPoints;
}

export function generateSleepData(
  totalDurationMinutes: number,
  startTime: number = Date.now()
): SleepDataPoint[] {
  const dataPoints: SleepDataPoint[] = [];
  let remainingMinutes = totalDurationMinutes;
  let currentTime = startTime;

  while (remainingMinutes > 0) {
    const cycleDuration = Math.min(90, remainingMinutes);
    const cycleData = generateSleepCycle(cycleDuration, currentTime);
    dataPoints.push(...cycleData);
    currentTime += cycleDuration * 60 * 1000;
    remainingMinutes -= cycleDuration;
  }

  return dataPoints;
}

export function calculateStageSummaries(dataPoints: SleepDataPoint[]): SleepStageSummary[] {
  const stageMap = new Map<SleepStage, number>();

  for (const point of dataPoints) {
    const current = stageMap.get(point.stage) || 0;
    stageMap.set(point.stage, current + 1);
  }

  const stages: SleepStage[] = ['awake', 'rem', 'light', 'deep'];
  return stages.map((stage) => ({
    stage,
    duration: (stageMap.get(stage) || 0) * 60 * 1000,
  }));
}

export interface SleepQualityDetail {
  totalScore: number;
  stageScore: number;
  efficiencyScore: number;
  latencyScore: number;
  cycleScore: number;
  sleepEfficiency: number;
  sleepLatencyMinutes: number;
  cycleCount: number;
}

export function calculateSleepEfficiency(dataPoints: SleepDataPoint[]): number {
  if (dataPoints.length === 0) return 0;

  const totalMinutes = dataPoints.length;
  const awakeMinutes = dataPoints.filter((p) => p.stage === 'awake').length;
  const sleepMinutes = totalMinutes - awakeMinutes;

  return sleepMinutes / totalMinutes;
}

export function calculateSleepLatency(dataPoints: SleepDataPoint[]): number {
  if (dataPoints.length === 0) return 0;

  for (let i = 0; i < dataPoints.length; i++) {
    if (dataPoints[i].stage === 'light' || dataPoints[i].stage === 'deep' || dataPoints[i].stage === 'rem') {
      return i;
    }
  }

  return dataPoints.length;
}

export function countSleepCycles(dataPoints: SleepDataPoint[]): number {
  if (dataPoints.length < 10) return 0;

  let cycleCount = 0;
  let inDeepOrRem = false;
  let hadDeep = false;

  for (let i = 0; i < dataPoints.length; i++) {
    const stage = dataPoints[i].stage;

    if (stage === 'deep') {
      hadDeep = true;
      inDeepOrRem = true;
    } else if (stage === 'rem' && hadDeep) {
      inDeepOrRem = true;
    } else if (stage === 'awake' && inDeepOrRem && hadDeep) {
      cycleCount++;
      inDeepOrRem = false;
      hadDeep = false;
    } else if (stage === 'light' && inDeepOrRem && hadDeep) {
      let nextIsAwakeOrNewCycle = false;
      for (let j = i + 1; j < Math.min(i + 10, dataPoints.length); j++) {
        if (dataPoints[j].stage === 'deep' || dataPoints[j].stage === 'awake') {
          nextIsAwakeOrNewCycle = true;
          break;
        }
      }
      if (nextIsAwakeOrNewCycle) {
        cycleCount++;
        inDeepOrRem = false;
        hadDeep = false;
      }
    }
  }

  if (inDeepOrRem && hadDeep) {
    cycleCount++;
  }

  return cycleCount;
}

export function calculateCycleRegularity(dataPoints: SleepDataPoint[]): number {
  if (dataPoints.length < 90) return 0.5;

  const cycleStarts: number[] = [];
  let inCycle = false;

  for (let i = 0; i < dataPoints.length; i++) {
    if (dataPoints[i].stage === 'light' && !inCycle) {
      let hasDeepFollowing = false;
      for (let j = i + 1; j < Math.min(i + 50, dataPoints.length); j++) {
        if (dataPoints[j].stage === 'deep') {
          hasDeepFollowing = true;
          break;
        }
      }
      if (hasDeepFollowing) {
        cycleStarts.push(i);
        inCycle = true;
      }
    }
    if (dataPoints[i].stage === 'rem' && inCycle) {
      inCycle = false;
    }
  }

  if (cycleStarts.length < 2) return 0.5;

  const cycleLengths: number[] = [];
  for (let i = 1; i < cycleStarts.length; i++) {
    cycleLengths.push(cycleStarts[i] - cycleStarts[i - 1]);
  }

  const avgLength = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
  const variance = cycleLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / cycleLengths.length;
  const stdDev = Math.sqrt(variance);

  const targetLength = 90;
  const lengthScore = Math.max(0, 1 - Math.abs(avgLength - targetLength) / targetLength);
  const regularityScore = Math.max(0, 1 - stdDev / avgLength);

  return (lengthScore * 0.5 + regularityScore * 0.5);
}

export function calculateQualityScore(dataPoints: SleepDataPoint[]): number {
  const detail = calculateQualityDetail(dataPoints);
  return detail.totalScore;
}

export function calculateQualityDetail(dataPoints: SleepDataPoint[]): SleepQualityDetail {
  const summaries = calculateStageSummaries(dataPoints);
  const totalMinutes = dataPoints.length;
  const totalMs = totalMinutes * 60 * 1000;

  const deepSleep = summaries.find((s) => s.stage === 'deep')?.duration || 0;
  const remSleep = summaries.find((s) => s.stage === 'rem')?.duration || 0;
  const lightSleep = summaries.find((s) => s.stage === 'light')?.duration || 0;
  const awakeTime = summaries.find((s) => s.stage === 'awake')?.duration || 0;

  const deepRatio = deepSleep / totalMs;
  const remRatio = remSleep / totalMs;
  const lightRatio = lightSleep / totalMs;
  const awakeRatio = awakeTime / totalMs;

  let stageScore = 50;
  const idealDeepRatio = 0.15;
  const idealRemRatio = 0.25;
  const idealLightRatio = 0.50;
  const idealAwakeRatio = 0.10;

  stageScore += (1 - Math.abs(deepRatio - idealDeepRatio) / idealDeepRatio) * 20;
  stageScore += (1 - Math.abs(remRatio - idealRemRatio) / idealRemRatio) * 15;
  stageScore += (1 - Math.abs(lightRatio - idealLightRatio) / idealLightRatio) * 10;
  stageScore -= Math.max(0, (awakeRatio - idealAwakeRatio) / idealAwakeRatio) * 25;

  stageScore = Math.max(0, Math.min(100, stageScore));

  const efficiency = calculateSleepEfficiency(dataPoints);
  const efficiencyScore = Math.min(100, efficiency * 100 + 10);

  const latencyMinutes = calculateSleepLatency(dataPoints);
  let latencyScore: number;
  if (latencyMinutes <= 5) {
    latencyScore = 95;
  } else if (latencyMinutes <= 15) {
    latencyScore = 100;
  } else if (latencyMinutes <= 30) {
    latencyScore = 80 - (latencyMinutes - 15) * 1.5;
  } else {
    latencyScore = Math.max(30, 57.5 - (latencyMinutes - 30) * 1.5);
  }
  latencyScore = Math.max(0, Math.min(100, latencyScore));

  const cycleRegularity = calculateCycleRegularity(dataPoints);
  const cycleCount = countSleepCycles(dataPoints);
  const expectedCycles = Math.max(3, Math.floor(totalMinutes / 90));
  const cycleCountScore = Math.min(100, (cycleCount / expectedCycles) * 100);
  const cycleScore = cycleRegularity * 60 + cycleCountScore * 0.4;

  const totalScore = stageScore * 0.4 + efficiencyScore * 0.25 + latencyScore * 0.15 + cycleScore * 0.2;

  return {
    totalScore: Math.max(40, Math.min(100, Math.round(totalScore))),
    stageScore: Math.round(stageScore),
    efficiencyScore: Math.round(efficiencyScore),
    latencyScore: Math.round(latencyScore),
    cycleScore: Math.round(cycleScore),
    sleepEfficiency: Math.round(efficiency * 1000) / 10,
    sleepLatencyMinutes: latencyMinutes,
    cycleCount,
  };
}

export function getCurrentStageConfig(stage: SleepStage): {
  heartRateRange: [number, number];
  movementRange: [number, number];
} {
  const config = CYCLE_STAGES.find((s) => s.stage === stage) || CYCLE_STAGES[0];
  return {
    heartRateRange: config.heartRateRange,
    movementRange: config.movementRange,
  };
}

export { CYCLE_STAGES };
