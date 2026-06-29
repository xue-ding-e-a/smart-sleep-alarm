import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { AlarmSound } from '../../utils/alarmSound';
import type { SleepStage } from '../../types/sleep';
import './style.css';

const STAGE_LABELS: Record<SleepStage, string> = {
  awake: '清醒',
  rem: 'REM 睡眠',
  light: '浅睡期',
  deep: '深睡期',
};

interface WakePageProps {
  currentStage?: SleepStage;
  wakeReasonDetail?: string;
  readinessScore?: number;
  isSnoozing?: boolean;
  snoozeEndTime?: number | null;
  onDismiss?: () => void;
  onSnooze?: () => void;
  volume?: number;
}

const WakePage: React.FC<WakePageProps> = ({
  currentStage = 'light',
  wakeReasonDetail = 'AI 检测到你正处于浅睡期，此时醒来会更加清醒',
  readinessScore = 85,
  isSnoozing = false,
  snoozeEndTime = null,
  onDismiss,
  onSnooze,
  volume = 70,
}) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const alarmSoundRef = useRef<AlarmSound | null>(null);
  const vibrateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [snoozeRemaining, setSnoozeRemaining] = useState<number>(0);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date): string => {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDay = weekDays[date.getDay()];
    return `${month}月${day}日 ${weekDay}`;
  };

  const startVibration = useCallback(() => {
    if (!navigator.vibrate) return;

    const pattern = [200, 100, 200, 100, 500];
    navigator.vibrate(pattern);

    vibrateIntervalRef.current = setInterval(() => {
      if (navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    }, 2000);
  }, []);

  const stopVibration = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(0);
    }
    if (vibrateIntervalRef.current) {
      clearInterval(vibrateIntervalRef.current);
      vibrateIntervalRef.current = null;
    }
  }, []);

  const startAlarm = useCallback(async () => {
    if (!alarmSoundRef.current) {
      alarmSoundRef.current = new AlarmSound();
    }
    alarmSoundRef.current.setVolume(volume / 100);
    await alarmSoundRef.current.start(30);
    startVibration();
  }, [volume, startVibration]);

  const stopAlarm = useCallback(() => {
    if (alarmSoundRef.current) {
      alarmSoundRef.current.stop();
    }
    stopVibration();
  }, [stopVibration]);

  const handleDismiss = useCallback(() => {
    stopAlarm();
    if (onDismiss) {
      onDismiss();
    }
    navigate('/sleep');
  }, [stopAlarm, onDismiss, navigate]);

  const handleSnooze = useCallback(() => {
    stopAlarm();
    if (onSnooze) {
      onSnooze();
    }
  }, [stopAlarm, onSnooze]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isSnoozing) {
      startAlarm();
    }

    return () => {
      stopAlarm();
    };
  }, [isSnoozing, startAlarm, stopAlarm]);

  useEffect(() => {
    if (isSnoozing && snoozeEndTime) {
      const updateRemaining = () => {
        const remaining = Math.max(0, snoozeEndTime - Date.now());
        setSnoozeRemaining(Math.ceil(remaining / 60000));
      };

      updateRemaining();
      const timer = setInterval(updateRemaining, 1000);
      return () => clearInterval(timer);
    }
  }, [isSnoozing, snoozeEndTime]);

  const circumference = 2 * Math.PI * 56;
  const progress = (readinessScore / 100) * circumference;
  const strokeDashoffset = circumference - progress;

  return (
    <div className={`wake-page ${isSnoozing ? 'snoozing' : ''}`}>
      <div className="wake-bg-breathing" />

      <div className="wake-content">
        <div className="clock-section">
          <div className="clock-time">{formatTime(currentTime)}</div>
          <div className="clock-date">{formatDate(currentTime)}</div>
        </div>

        {isSnoozing ? (
          <div className="snooze-info">
            <div className="snooze-icon">💤</div>
            <div className="snooze-title">贪睡中</div>
            <div className="snooze-countdown">还有 {snoozeRemaining} 分钟...</div>
            <div className="snooze-tip">轻轻闭上眼睛，再休息一会儿</div>
          </div>
        ) : (
          <>
            <div className="wake-greeting">
              <span className="greeting-emoji">🌅</span>
              <span className="greeting-text">早上好，是时候醒来了</span>
            </div>

            <div className="wake-info-card">
              <div className="info-row">
                <span className="info-label">当前状态</span>
                <span className="info-value stage-value">{STAGE_LABELS[currentStage]}</span>
              </div>
              <div className="info-divider" />
              <div className="info-row info-reason">
                <span className="info-label">唤醒原因</span>
                <span className="info-value">{wakeReasonDetail}</span>
              </div>
            </div>

            <div className="readiness-section">
              <div className="readiness-label">唤醒适宜度</div>
              <div className="readiness-ring-container">
                <svg className="readiness-ring" viewBox="0 0 120 120">
                  <circle
                    className="ring-bg"
                    cx="60"
                    cy="60"
                    r="56"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    className="ring-progress"
                    cx="60"
                    cy="60"
                    r="56"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="readiness-score">
                  <span className="score-value">{readinessScore}</span>
                  <span className="score-unit">分</span>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <Button
                size="lg"
                fullWidth
                onClick={handleDismiss}
                className="wake-stop-btn"
              >
                <span className="btn-icon">☀️</span>
                停止
              </Button>
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={handleSnooze}
                className="wake-snooze-btn"
              >
                <span className="btn-icon">💤</span>
                贪睡 9 分钟
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WakePage;
