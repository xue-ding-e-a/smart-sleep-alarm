import type { SleepStage, SleepDataPoint, AlarmSettings } from '../types/sleep';

const STAGE_WEIGHTS: Record<SleepStage, number> = {
  awake: 85,
  rem: 60,
  light: 95,
  deep: 15,
};

interface RecentTrend {
  heartRateTrend: 'rising' | 'stable' | 'falling';
  movementTrend: 'increasing' | 'stable' | 'decreasing';
  previousStage: SleepStage | null;
  timeInCurrentStage: number;
}

function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function getTimeOfDayMinutes(timestamp: number): number {
  const date = new Date(timestamp);
  return date.getHours() * 60 + date.getMinutes();
}

export function isWithinWakeWindow(currentTime: number, settings: AlarmSettings): boolean {
  const currentMinutes = getTimeOfDayMinutes(currentTime);
  const earliest = parseTimeToMinutes(settings.earliestWakeTime);
  const latest = parseTimeToMinutes(settings.latestWakeTime);

  if (earliest <= latest) {
    return currentMinutes >= earliest && currentMinutes <= latest;
  } else {
    return currentMinutes >= earliest || currentMinutes <= latest;
  }
}

export function getTimeInWindow(currentTime: number, settings: AlarmSettings): {
  position: 'before' | 'inside' | 'after';
  elapsedMinutes: number;
  remainingMinutes: number;
  totalWindowMinutes: number;
} {
  const currentMinutes = getTimeOfDayMinutes(currentTime);
  const earliest = parseTimeToMinutes(settings.earliestWakeTime);
  const latest = parseTimeToMinutes(settings.latestWakeTime);

  let totalWindowMinutes: number;
  let elapsedMinutes = 0;
  let remainingMinutes = 0;
  let position: 'before' | 'inside' | 'after';

  if (earliest <= latest) {
    totalWindowMinutes = latest - earliest;
    if (currentMinutes < earliest) {
      position = 'before';
      remainingMinutes = earliest - currentMinutes;
    } else if (currentMinutes > latest) {
      position = 'after';
      elapsedMinutes = totalWindowMinutes;
    } else {
      position = 'inside';
      elapsedMinutes = currentMinutes - earliest;
      remainingMinutes = latest - currentMinutes;
    }
  } else {
    totalWindowMinutes = (24 * 60 - earliest) + latest;
    if (currentMinutes >= earliest) {
      position = 'inside';
      elapsedMinutes = currentMinutes - earliest;
      remainingMinutes = totalWindowMinutes - elapsedMinutes;
    } else if (currentMinutes <= latest) {
      position = 'inside';
      elapsedMinutes = (24 * 60 - earliest) + currentMinutes;
      remainingMinutes = latest - currentMinutes;
    } else if (currentMinutes < earliest && currentMinutes > latest) {
      position = 'before';
      remainingMinutes = earliest - currentMinutes;
    } else {
      position = 'before';
      remainingMinutes = earliest - currentMinutes;
    }
  }

  return { position, elapsedMinutes, remainingMinutes, totalWindowMinutes };
}

export function analyzeRecentTrend(recentDataPoints: SleepDataPoint[]): RecentTrend {
  if (recentDataPoints.length < 2) {
    return {
      heartRateTrend: 'stable',
      movementTrend: 'stable',
      previousStage: null,
      timeInCurrentStage: 0,
    };
  }

  const half = Math.floor(recentDataPoints.length / 2);
  const firstHalf = recentDataPoints.slice(0, half);
  const secondHalf = recentDataPoints.slice(half);

  const avgHRFirst = firstHalf.reduce((sum, p) => sum + p.heartRate, 0) / firstHalf.length;
  const avgHRSecond = secondHalf.reduce((sum, p) => sum + p.heartRate, 0) / secondHalf.length;
  const hrDiff = avgHRSecond - avgHRFirst;

  const avgMoveFirst = firstHalf.reduce((sum, p) => sum + p.movement, 0) / firstHalf.length;
  const avgMoveSecond = secondHalf.reduce((sum, p) => sum + p.movement, 0) / secondHalf.length;
  const moveDiff = avgMoveSecond - avgMoveFirst;

  const currentStage = recentDataPoints[recentDataPoints.length - 1].stage;
  let timeInCurrentStage = 0;
  let previousStage: SleepStage | null = null;

  for (let i = recentDataPoints.length - 1; i >= 0; i--) {
    if (recentDataPoints[i].stage === currentStage) {
      timeInCurrentStage++;
    } else {
      previousStage = recentDataPoints[i].stage;
      break;
    }
  }

  return {
    heartRateTrend: hrDiff > 1.5 ? 'rising' : hrDiff < -1.5 ? 'falling' : 'stable',
    movementTrend: moveDiff > 0.08 ? 'increasing' : moveDiff < -0.08 ? 'decreasing' : 'stable',
    previousStage,
    timeInCurrentStage,
  };
}

export function getWakeReadinessScore(
  currentStage: SleepStage,
  recentTrend: RecentTrend
): number {
  let score = STAGE_WEIGHTS[currentStage];

  if (recentTrend.heartRateTrend === 'rising') {
    score += 10;
  } else if (recentTrend.heartRateTrend === 'falling') {
    score -= 5;
  }

  if (recentTrend.movementTrend === 'increasing') {
    score += 8;
  } else if (recentTrend.movementTrend === 'decreasing') {
    score -= 3;
  }

  if (currentStage === 'light' && recentTrend.previousStage === 'deep') {
    score += 12;
  }

  if (currentStage === 'rem' && recentTrend.timeInCurrentStage > 10) {
    score += 8;
  }

  if (currentStage === 'light' && recentTrend.timeInCurrentStage > 5) {
    score += 5;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function shouldWakeNow(
  currentTime: number,
  currentStage: SleepStage,
  settings: AlarmSettings,
  recentDataPoints: SleepDataPoint[]
): { shouldWake: boolean; reason: string; readinessScore: number } {
  const windowInfo = getTimeInWindow(currentTime, settings);
  const recentTrend = analyzeRecentTrend(recentDataPoints);
  const readinessScore = getWakeReadinessScore(currentStage, recentTrend);

  if (windowInfo.position === 'after') {
    return {
      shouldWake: true,
      reason: 'latest_wake_time',
      readinessScore,
    };
  }

  if (windowInfo.position === 'before') {
    return {
      shouldWake: false,
      reason: 'before_window',
      readinessScore,
    };
  }

  if (currentStage === 'light') {
    return {
      shouldWake: true,
      reason: 'light_sleep',
      readinessScore,
    };
  }

  if (currentStage === 'awake') {
    return {
      shouldWake: true,
      reason: 'already_awake',
      readinessScore,
    };
  }

  if (currentStage === 'rem') {
    if (recentTrend.timeInCurrentStage > 8) {
      return {
        shouldWake: true,
        reason: 'rem_late_phase',
        readinessScore,
      };
    }
  }

  if (windowInfo.remainingMinutes <= 5 && recentTrend.previousStage === 'deep') {
    if (currentStage !== 'deep') {
      return {
        shouldWake: true,
        reason: 'window_ending_just_entered_light',
        readinessScore,
      };
    }
  }

  if (readinessScore >= 85 && windowInfo.elapsedMinutes > windowInfo.totalWindowMinutes * 0.3) {
    return {
      shouldWake: true,
      reason: 'high_readiness',
      readinessScore,
    };
  }

  return {
    shouldWake: false,
    reason: 'deep_sleep_waiting',
    readinessScore,
  };
}

export function calculateOptimalWakeTime(
  dataPoints: SleepDataPoint[],
  windowStart: number,
  windowEnd: number
): number {
  if (dataPoints.length === 0) {
    return windowStart + Math.floor((windowEnd - windowStart) / 2);
  }

  const cycleStages: SleepStage[] = ['light', 'deep', 'light', 'rem', 'awake'];
  const stageDurations = new Map<SleepStage, number[]>();

  let currentStage = dataPoints[0].stage;
  let currentDuration = 1;

  for (let i = 1; i < dataPoints.length; i++) {
    if (dataPoints[i].stage === currentStage) {
      currentDuration++;
    } else {
      if (!stageDurations.has(currentStage)) {
        stageDurations.set(currentStage, []);
      }
      stageDurations.get(currentStage)!.push(currentDuration);
      currentStage = dataPoints[i].stage;
      currentDuration = 1;
    }
  }
  if (!stageDurations.has(currentStage)) {
    stageDurations.set(currentStage, []);
  }
  stageDurations.get(currentStage)!.push(currentDuration);

  const avgCycleDuration = 90;
  const lastStage = dataPoints[dataPoints.length - 1].stage;
  const lastStageDuration = stageDurations.get(lastStage)?.slice(-1)[0] || 15;

  let foundCurrent = false;
  let remainingInCycle = 0;

  for (let i = 0; i < cycleStages.length; i++) {
    if (cycleStages[i] === lastStage) {
      foundCurrent = true;
      const avgThisStage = stageDurations.get(cycleStages[i])?.length
        ? stageDurations.get(cycleStages[i])!.reduce((a, b) => a + b, 0) /
          stageDurations.get(cycleStages[i])!.length
        : 15;
      remainingInCycle = Math.max(0, avgThisStage - lastStageDuration);
      continue;
    }
    if (foundCurrent) {
      const avgThisStage = stageDurations.get(cycleStages[i])?.length
        ? stageDurations.get(cycleStages[i])!.reduce((a, b) => a + b, 0) /
          stageDurations.get(cycleStages[i])!.length
        : 15;
      if (cycleStages[i] === 'light') {
        remainingInCycle += avgThisStage / 2;
        break;
      }
      remainingInCycle += avgThisStage;
    }
  }

  if (!foundCurrent || remainingInCycle === 0) {
    remainingInCycle = 30;
  }

  let predictedLightTime =
    dataPoints[dataPoints.length - 1].timestamp + remainingInCycle * 60 * 1000;

  if (predictedLightTime < windowStart) {
    const cyclesToAdd = Math.ceil((windowStart - predictedLightTime) / (avgCycleDuration * 60 * 1000));
    predictedLightTime += cyclesToAdd * avgCycleDuration * 60 * 1000;
  }

  if (predictedLightTime > windowEnd) {
    return windowEnd;
  }

  return predictedLightTime;
}

export function generateWakeReason(
  stage: SleepStage,
  timeInWindow: number,
  reason: string
): string {
  const stageNames: Record<SleepStage, string> = {
    awake: '清醒',
    rem: 'REM睡眠',
    light: '浅睡',
    deep: '深睡',
  };

  const reasonMap: Record<string, string> = {
    light_sleep: `在浅睡期唤醒（进入唤醒窗口约${timeInWindow}分钟），减少睡眠惰性，让你神清气爽地开始新的一天`,
    rem_late_phase: `在REM睡眠后期唤醒（进入唤醒窗口约${timeInWindow}分钟），此时大脑已接近清醒状态，起床更轻松`,
    latest_wake_time: '唤醒窗口已结束，为避免错过日程安排，闹钟已触发',
    already_awake: '检测到你已经清醒，闹钟将按计划响起',
    window_ending_just_entered_light: `即将到达最晚唤醒时间，恰好刚从深睡进入浅睡（已等待${timeInWindow}分钟），抓住最佳时机`,
    high_readiness: `身体信号显示你已为起床做好准备（进入唤醒窗口约${timeInWindow}分钟），选择此刻唤醒`,
    deep_sleep_waiting: '正处于深睡期，继续等待更合适的唤醒时机',
    before_window: '尚未到达最早唤醒时间，继续享受睡眠',
    manual_trigger: '手动触发唤醒',
  };

  return reasonMap[reason] || `在${stageNames[stage] || stage}阶段唤醒`;
}

/*
 * ========== 测试用例 ==========
 *
 * 测试1: shouldWakeNow - 唤醒窗口内浅睡期应唤醒
 *   输入: currentTime=窗口中间, currentStage='light', settings={earliest:'07:00', latest:'07:30'}, recentDataPoints=[...]
 *   预期: shouldWake=true, reason='light_sleep'
 *
 * 测试2: shouldWakeNow - 唤醒窗口内深睡期不唤醒
 *   输入: currentTime=窗口中间, currentStage='deep', settings={...}, recentDataPoints=[...]
 *   预期: shouldWake=false, reason='deep_sleep_waiting'
 *
 * 测试3: shouldWakeNow - 超过最晚唤醒时间强制唤醒
 *   输入: currentTime>latestWakeTime, currentStage='deep', settings={...}, recentDataPoints=[...]
 *   预期: shouldWake=true, reason='latest_wake_time'
 *
 * 测试4: shouldWakeNow - 早于最早唤醒时间不唤醒
 *   输入: currentTime<earliestWakeTime, currentStage='light', settings={...}, recentDataPoints=[...]
 *   预期: shouldWake=false, reason='before_window'
 *
 * 测试5: getWakeReadinessScore - 浅睡期得分最高
 *   输入: currentStage='light', recentTrend={heartRateTrend:'stable', ...}
 *   预期: score > 85
 *
 * 测试6: getWakeReadinessScore - 深睡期得分最低
 *   输入: currentStage='deep', recentTrend={heartRateTrend:'stable', ...}
 *   预期: score < 30
 *
 * 测试7: getWakeReadinessScore - 心率上升加分
 *   输入: currentStage='light', recentTrend={heartRateTrend:'rising', ...}
 *   预期: 分数高于心率稳定时
 *
 * 测试8: analyzeRecentTrend - 正确识别阶段转换
 *   输入: recentDataPoints 前半段深睡后半段浅睡
 *   预期: previousStage='deep', timeInCurrentStage≈后半段长度
 *
 * 测试9: calculateOptimalWakeTime - 在窗口内预测
 *   输入: dataPoints=完整睡眠周期, windowStart, windowEnd
 *   预期: 返回值在 windowStart 和 windowEnd 之间
 *
 * 测试10: generateWakeReason - 所有reason都有对应描述
 *   输入: 各种 reason 值
 *   预期: 返回非空字符串描述
 *
 * 测试11: 边界 - 空数据点数组
 *   输入: recentDataPoints=[]
 *   预期: analyzeRecentTrend 返回默认值，不报错
 *
 * 测试12: 跨午夜的唤醒窗口
 *   输入: earliest='23:00', latest='01:00', currentTime='00:30'
 *   预期: isWithinWakeWindow 返回 true
 */
