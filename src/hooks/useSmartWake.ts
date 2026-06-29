import { useState, useEffect, useCallback, useRef } from 'react';
import type { SleepStage, SleepDataPoint, AlarmSettings } from '../types/sleep';
import {
  shouldWakeNow,
  getWakeReadinessScore,
  analyzeRecentTrend,
  getTimeInWindow,
  generateWakeReason,
  calculateOptimalWakeTime,
} from '../utils/smartWakeAI';

interface UseSmartWakeOptions {
  onWakeTrigger?: () => void;
  recentWindowMinutes?: number;
  checkIntervalMs?: number;
}

interface UseSmartWakeReturn {
  isWakeTime: boolean;
  wakeReason: string;
  wakeReasonDetail: string;
  readinessScore: number;
  isSnoozing: boolean;
  snoozeCount: number;
  snoozeEndTime: number | null;
  optimalWakeTime: number | null;
  windowPosition: 'before' | 'inside' | 'after';
  triggerWake: () => void;
  snooze: () => void;
  dismissWake: () => void;
  resetWakeState: () => void;
}

export function useSmartWake(
  isMonitoring: boolean,
  currentStage: SleepStage,
  currentTime: number,
  dataPoints: SleepDataPoint[],
  settings: AlarmSettings,
  options: UseSmartWakeOptions = {}
): UseSmartWakeReturn {
  const {
    onWakeTrigger,
    recentWindowMinutes = 15,
    checkIntervalMs = 1000,
  } = options;

  const [isWakeTime, setIsWakeTime] = useState(false);
  const [wakeReason, setWakeReason] = useState('');
  const [wakeReasonDetail, setWakeReasonDetail] = useState('');
  const [readinessScore, setReadinessScore] = useState(0);
  const [isSnoozing, setIsSnoozing] = useState(false);
  const [snoozeCount, setSnoozeCount] = useState(0);
  const [snoozeEndTime, setSnoozeEndTime] = useState<number | null>(null);
  const [optimalWakeTime, setOptimalWakeTime] = useState<number | null>(null);
  const [windowPosition, setWindowPosition] = useState<'before' | 'inside' | 'after'>('before');

  const hasTriggeredRef = useRef(false);
  const snoozeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getRecentDataPoints = useCallback((): SleepDataPoint[] => {
    if (dataPoints.length === 0) return [];
    const count = Math.min(recentWindowMinutes, dataPoints.length);
    return dataPoints.slice(-count);
  }, [dataPoints, recentWindowMinutes]);

  const updateWindowInfo = useCallback(() => {
    const windowInfo = getTimeInWindow(currentTime, settings);
    setWindowPosition(windowInfo.position);
  }, [currentTime, settings]);

  const updateOptimalWakeTime = useCallback(() => {
    if (dataPoints.length < 30) {
      setOptimalWakeTime(null);
      return;
    }

    const windowInfo = getTimeInWindow(currentTime, settings);
    if (windowInfo.position === 'after') {
      setOptimalWakeTime(null);
      return;
    }

    const earliestMinutes = parseInt(settings.earliestWakeTime.split(':')[0]) * 60 +
      parseInt(settings.earliestWakeTime.split(':')[1]);
    const latestMinutes = parseInt(settings.latestWakeTime.split(':')[0]) * 60 +
      parseInt(settings.latestWakeTime.split(':')[1]);

    const now = new Date(currentTime);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    let windowStart = todayStart + earliestMinutes * 60 * 1000;
    let windowEnd = todayStart + latestMinutes * 60 * 1000;

    if (earliestMinutes > latestMinutes) {
      if (now.getHours() * 60 + now.getMinutes() > earliestMinutes) {
        windowEnd += 24 * 60 * 60 * 1000;
      } else {
        windowStart -= 24 * 60 * 60 * 1000;
      }
    }

    const optimal = calculateOptimalWakeTime(dataPoints, windowStart, windowEnd);
    setOptimalWakeTime(optimal);
  }, [dataPoints, currentTime, settings]);

  const checkWakeCondition = useCallback(() => {
    if (!isMonitoring || !settings.enabled) {
      return;
    }

    if (hasTriggeredRef.current && !isSnoozing) {
      return;
    }

    if (isSnoozing && snoozeEndTime && Date.now() < snoozeEndTime) {
      return;
    }

    const recentPoints = getRecentDataPoints();
    const result = shouldWakeNow(currentTime, currentStage, settings, recentPoints);

    setReadinessScore(result.readinessScore);
    updateWindowInfo();

    if (result.shouldWake) {
      if (isSnoozing && snoozeEndTime && Date.now() >= snoozeEndTime) {
        setIsSnoozing(false);
        setSnoozeEndTime(null);
      }

      if (!hasTriggeredRef.current || isSnoozing) {
        hasTriggeredRef.current = true;
        setIsWakeTime(true);
        setWakeReason(result.reason);

        const windowInfo = getTimeInWindow(currentTime, settings);
        const detail = generateWakeReason(currentStage, windowInfo.elapsedMinutes, result.reason);
        setWakeReasonDetail(detail);

        if (onWakeTrigger) {
          onWakeTrigger();
        }
      }
    }
  }, [
    isMonitoring,
    settings,
    isSnoozing,
    snoozeEndTime,
    currentTime,
    currentStage,
    getRecentDataPoints,
    updateWindowInfo,
    onWakeTrigger,
  ]);

  const triggerWake = useCallback(() => {
    const recentPoints = getRecentDataPoints();
    const recentTrend = analyzeRecentTrend(recentPoints);
    const score = getWakeReadinessScore(currentStage, recentTrend);

    hasTriggeredRef.current = true;
    setIsWakeTime(true);
    setWakeReason('manual_trigger');
    setWakeReasonDetail('手动触发唤醒');
    setReadinessScore(score);

    if (onWakeTrigger) {
      onWakeTrigger();
    }
  }, [currentStage, getRecentDataPoints, onWakeTrigger]);

  const snooze = useCallback(() => {
    if (!isWakeTime) return;

    const snoozeMs = settings.snoozeDuration * 60 * 1000;
    const endTime = Date.now() + snoozeMs;

    setIsSnoozing(true);
    setSnoozeCount((prev) => prev + 1);
    setSnoozeEndTime(endTime);
    setIsWakeTime(false);

    if (snoozeTimerRef.current) {
      clearTimeout(snoozeTimerRef.current);
    }
  }, [isWakeTime, settings.snoozeDuration]);

  const dismissWake = useCallback(() => {
    hasTriggeredRef.current = true;
    setIsWakeTime(false);
    setIsSnoozing(false);
    setSnoozeEndTime(null);

    if (snoozeTimerRef.current) {
      clearTimeout(snoozeTimerRef.current);
      snoozeTimerRef.current = null;
    }
  }, []);

  const resetWakeState = useCallback(() => {
    hasTriggeredRef.current = false;
    setIsWakeTime(false);
    setWakeReason('');
    setWakeReasonDetail('');
    setReadinessScore(0);
    setIsSnoozing(false);
    setSnoozeCount(0);
    setSnoozeEndTime(null);
    setOptimalWakeTime(null);
    setWindowPosition('before');

    if (snoozeTimerRef.current) {
      clearTimeout(snoozeTimerRef.current);
      snoozeTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isMonitoring && settings.enabled) {
      checkWakeCondition();
      updateOptimalWakeTime();

      checkIntervalRef.current = setInterval(() => {
        checkWakeCondition();
      }, checkIntervalMs);
    } else {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [isMonitoring, settings.enabled, checkWakeCondition, updateOptimalWakeTime, checkIntervalMs]);

  useEffect(() => {
    if (!isMonitoring) {
      resetWakeState();
    }
  }, [isMonitoring, resetWakeState]);

  return {
    isWakeTime,
    wakeReason,
    wakeReasonDetail,
    readinessScore,
    isSnoozing,
    snoozeCount,
    snoozeEndTime,
    optimalWakeTime,
    windowPosition,
    triggerWake,
    snooze,
    dismissWake,
    resetWakeState,
  };
}

/*
 * ========== 测试用例 ==========
 *
 * 测试1: 基础唤醒触发
 *   场景: isMonitoring=true, currentStage='light', 当前时间在唤醒窗口内
 *   预期: isWakeTime 变为 true, wakeReason='light_sleep'
 *
 * 测试2: 深睡期不唤醒
 *   场景: isMonitoring=true, currentStage='deep', 在唤醒窗口内
 *   预期: isWakeTime 保持 false
 *
 * 测试3: 最晚唤醒时间强制唤醒
 *   场景: 当前时间超过 latestWakeTime
 *   预期: isWakeTime=true, wakeReason='latest_wake_time'
 *
 * 测试4: 贪睡功能
 *   场景: 唤醒后调用 snooze()
 *   预期: isWakeTime=false, isSnoozing=true, snoozeCount=1
 *
 * 测试5: 贪睡结束后再次唤醒
 *   场景: 贪睡时间结束且仍在监测中
 *   预期: isWakeTime 再次变为 true
 *
 * 测试6: 手动触发唤醒
 *   场景: 调用 triggerWake()
 *   预期: isWakeTime=true, wakeReason='manual_trigger'
 *
 * 测试7: 关闭闹钟不触发
 *   场景: settings.enabled=false
 *   预期: isWakeTime 保持 false
 *
 * 测试8: 停止监测重置状态
 *   场景: isMonitoring 从 true 变 false
 *   预期: 所有唤醒状态重置
 *
 * 测试9: dismissWake 停止唤醒
 *   场景: 唤醒后调用 dismissWake()
 *   预期: isWakeTime=false，不再触发
 *
 * 测试10: readinessScore 实时更新
 *   场景: currentStage 在 light 和 deep 间切换
 *   预期: readinessScore 相应变化，浅睡 > REM > 深睡
 */
