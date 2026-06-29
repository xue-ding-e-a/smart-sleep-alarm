import { useState, useRef, useCallback, useEffect } from 'react';
import type { SleepStage, SleepDataPoint } from '../types/sleep';
import { CYCLE_STAGES } from '../utils/sleepDataGenerator';

const BLOOD_OXYGEN_RANGE: [number, number] = [95, 99];

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

interface UseSleepMonitorOptions {
  speedFactor?: number;
}

interface UseSleepMonitorReturn {
  isMonitoring: boolean;
  currentStage: SleepStage;
  currentHeartRate: number;
  currentMovement: number;
  currentBloodOxygen: number;
  dataPoints: SleepDataPoint[];
  elapsedMinutes: number;
  startTime: number | null;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  resetMonitoring: () => void;
  setSpeedFactor: (factor: number) => void;
}

export function useSleepMonitor(options: UseSleepMonitorOptions = {}): UseSleepMonitorReturn {
  const { speedFactor: initialSpeedFactor = 60 } = options;

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentStage, setCurrentStage] = useState<SleepStage>('awake');
  const [currentHeartRate, setCurrentHeartRate] = useState(72);
  const [currentMovement, setCurrentMovement] = useState(0.5);
  const [currentBloodOxygen, setCurrentBloodOxygen] = useState(97);
  const [dataPoints, setDataPoints] = useState<SleepDataPoint[]>([]);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [speedFactor, setSpeedFactor] = useState(initialSpeedFactor);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cyclePositionRef = useRef(0);
  const stageIndexRef = useRef(0);
  const stageMinuteRef = useRef(0);

  const getCurrentStageConfig = useCallback(() => {
    return CYCLE_STAGES[stageIndexRef.current];
  }, []);

  const advanceStage = useCallback(() => {
    const currentConfig = getCurrentStageConfig();
    stageMinuteRef.current += 1;

    if (stageMinuteRef.current >= currentConfig.durationMinutes) {
      stageMinuteRef.current = 0;
      stageIndexRef.current = (stageIndexRef.current + 1) % CYCLE_STAGES.length;
    }

    cyclePositionRef.current += 1;
  }, [getCurrentStageConfig]);

  const generateDataPoint = useCallback((): SleepDataPoint => {
    const config = getCurrentStageConfig();
    const now = startTime ? startTime + elapsedMinutes * 60 * 1000 : Date.now();

    return {
      timestamp: now,
      heartRate: Math.round(randomInRange(config.heartRateRange[0], config.heartRateRange[1]) * 10) / 10,
      movement: Math.round(randomInRange(config.movementRange[0], config.movementRange[1]) * 100) / 100,
      bloodOxygen: Math.round(randomInRange(BLOOD_OXYGEN_RANGE[0], BLOOD_OXYGEN_RANGE[1]) * 10) / 10,
      stage: config.stage,
    };
  }, [getCurrentStageConfig, startTime, elapsedMinutes]);

  const tick = useCallback(() => {
    const point = generateDataPoint();

    setCurrentStage(point.stage);
    setCurrentHeartRate(point.heartRate);
    setCurrentMovement(point.movement);
    setCurrentBloodOxygen(point.bloodOxygen);
    setDataPoints((prev) => [...prev, point]);
    setElapsedMinutes((prev) => prev + 1);

    advanceStage();
  }, [generateDataPoint, advanceStage]);

  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    setStartTime(Date.now());

    const initialPoint = generateDataPoint();
    setCurrentStage(initialPoint.stage);
    setCurrentHeartRate(initialPoint.heartRate);
    setCurrentMovement(initialPoint.movement);
    setCurrentBloodOxygen(initialPoint.bloodOxygen);
    setDataPoints([initialPoint]);
    setElapsedMinutes(1);
    advanceStage();
  }, [isMonitoring, generateDataPoint, advanceStage]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetMonitoring = useCallback(() => {
    stopMonitoring();
    setDataPoints([]);
    setElapsedMinutes(0);
    setStartTime(null);
    setCurrentStage('awake');
    setCurrentHeartRate(72);
    setCurrentMovement(0.5);
    setCurrentBloodOxygen(97);
    cyclePositionRef.current = 0;
    stageIndexRef.current = 0;
    stageMinuteRef.current = 0;
  }, [stopMonitoring]);

  useEffect(() => {
    if (isMonitoring && speedFactor > 0) {
      const intervalMs = 60000 / speedFactor;
      intervalRef.current = setInterval(tick, intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isMonitoring, speedFactor, tick]);

  return {
    isMonitoring,
    currentStage,
    currentHeartRate,
    currentMovement,
    currentBloodOxygen,
    dataPoints,
    elapsedMinutes,
    startTime,
    startMonitoring,
    stopMonitoring,
    resetMonitoring,
    setSpeedFactor,
  };
}
