import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import storage from '../../utils/storage';
import { generateMockHistory, getWeeklySummary, getPersonalizedStats } from '../../utils/mockHistory';
import {
  calculateQualityDetail,
  calculateStageSummaries,
  type SleepQualityDetail,
} from '../../utils/sleepDataGenerator';
import type { SleepRecord, SleepStage } from '../../types/sleep';
import './style.css';

const STORAGE_KEY_CURRENT = 'currentSleepRecord';
const STORAGE_KEY_HISTORY = 'sleepHistory';

const STAGE_COLORS: Record<SleepStage, string> = {
  deep: 'var(--sleep-deep)',
  light: 'var(--sleep-light)',
  rem: 'var(--sleep-rem)',
  awake: 'var(--sleep-awake)',
};

const STAGE_NAMES: Record<SleepStage, string> = {
  deep: '深睡',
  light: '浅睡',
  rem: 'REM',
  awake: '清醒',
};

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}小时${minutes}分钟`;
}

function formatDurationShort(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h${minutes}m`;
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function getScoreLevel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: '优秀', color: 'var(--success-color)' };
  if (score >= 80) return { label: '良好', color: 'var(--info-color)' };
  if (score >= 70) return { label: '中等', color: 'var(--warning-color)' };
  return { label: '较差', color: 'var(--error-color)' };
}

function generateAdvice(
  detail: SleepQualityDetail,
  record: SleepRecord
): { icon: string; text: string }[] {
  const advice: { icon: string; text: string }[] = [];
  const totalMs = record.endTime - record.startTime;
  const deepMs = record.stages.find((s) => s.stage === 'deep')?.duration || 0;
  const remMs = record.stages.find((s) => s.stage === 'rem')?.duration || 0;
  const deepRatio = deepMs / totalMs;
  const remRatio = remMs / totalMs;

  if (deepRatio >= 0.15) {
    advice.push({ icon: '👍', text: '深睡时间充足，身体恢复良好，继续保持' });
  } else {
    advice.push({ icon: '💡', text: '深睡时间偏少，建议睡前避免剧烈运动，保持卧室凉爽' });
  }

  if (remRatio >= 0.22) {
    advice.push({ icon: '🧠', text: 'REM睡眠充足，有助于记忆巩固和情绪调节' });
  } else {
    advice.push({ icon: '💡', text: 'REM睡眠略少，建议减少睡前压力，保持规律作息' });
  }

  if (detail.sleepEfficiency >= 90) {
    advice.push({ icon: '⭐', text: '睡眠效率优秀，入睡后质量很高' });
  } else if (detail.sleepLatencyMinutes > 30) {
    advice.push({ icon: '🌙', text: `入睡需要${detail.sleepLatencyMinutes}分钟，建议提前15分钟上床准备` });
  } else {
    advice.push({ icon: '🌙', text: '建议保持规律作息，每天同一时间入睡和起床' });
  }

  return advice.slice(0, 3);
}

type TabType = 'lastNight' | 'history';
type FilterType = '7days' | '30days';

const ReportPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('lastNight');
  const [filter, setFilter] = useState<FilterType>('7days');
  const [sleepRecord, setSleepRecord] = useState<SleepRecord | null>(null);
  const [qualityDetail, setQualityDetail] = useState<SleepQualityDetail | null>(null);
  const [historyRecords, setHistoryRecords] = useState<SleepRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [animated, setAnimated] = useState(false);
  const tabIndicatorRef = useRef<HTMLDivElement>(null);
  const lastNightTabRef = useRef<HTMLButtonElement>(null);
  const historyTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let currentRecord = storage.get<SleepRecord>(STORAGE_KEY_CURRENT);
    let history = storage.get<SleepRecord[]>(STORAGE_KEY_HISTORY);

    if (!history || history.length === 0) {
      history = generateMockHistory(7);
      storage.set(STORAGE_KEY_HISTORY, history);
    }

    setHistoryRecords(history);

    if (!currentRecord) {
      currentRecord = history[0] || null;
    }

    if (currentRecord) {
      setSleepRecord(currentRecord);
      const detail = calculateQualityDetail(currentRecord.dataPoints);
      setQualityDetail(detail);
    }
  }, []);

  const filteredRecords = useMemo(() => {
    const now = Date.now();
    const days = filter === '7days' ? 7 : 30;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return historyRecords.filter((r) => r.startTime >= cutoff);
  }, [historyRecords, filter]);

  const weeklySummary = useMemo(() => {
    const now = Date.now();
    const cutoff = now - 7 * 24 * 60 * 60 * 1000;
    const weekRecords = historyRecords.filter((r) => r.startTime >= cutoff);
    return getWeeklySummary(weekRecords);
  }, [historyRecords]);

  const personalizedStats = useMemo(() => {
    return getPersonalizedStats(historyRecords);
  }, [historyRecords]);

  const weekChartData = useMemo(() => {
    const days: { date: Date; duration: number; label: string }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const dayStart = day.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      const dayRecord = historyRecords.find(
        (r) => r.startTime >= dayStart && r.startTime < dayEnd
      );

      const weekdayLabels = ['日', '一', '二', '三', '四', '五', '六'];
      days.push({
        date: day,
        duration: dayRecord ? dayRecord.endTime - dayRecord.startTime : 0,
        label: weekdayLabels[day.getDay()],
      });
    }
    return days;
  }, [historyRecords]);

  const stageSummaries = useMemo(() => {
    if (!sleepRecord) return [];
    return calculateStageSummaries(sleepRecord.dataPoints);
  }, [sleepRecord]);

  const totalDuration = useMemo(() => {
    if (!sleepRecord) return 0;
    return sleepRecord.endTime - sleepRecord.startTime;
  }, [sleepRecord]);

  const heartRateStats = useMemo(() => {
    if (!sleepRecord || sleepRecord.dataPoints.length === 0) {
      return { min: 0, avg: 0, max: 0 };
    }
    const rates = sleepRecord.dataPoints.map((p) => p.heartRate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
    return { min: Math.round(min), avg: Math.round(avg), max: Math.round(max) };
  }, [sleepRecord]);

  const scoreLevel = useMemo(() => {
    if (!qualityDetail) return { label: '', color: '' };
    return getScoreLevel(qualityDetail.totalScore);
  }, [qualityDetail]);

  const advice = useMemo(() => {
    if (!qualityDetail || !sleepRecord) return [];
    return generateAdvice(qualityDetail, sleepRecord);
  }, [qualityDetail, sleepRecord]);

  const bestWakeIndex = useMemo(() => {
    if (!sleepRecord || sleepRecord.dataPoints.length === 0) return 0;
    const last15 = Math.min(900, sleepRecord.dataPoints.length);
    const startIdx = sleepRecord.dataPoints.length - last15;
    let bestIdx = startIdx;
    let bestScore = -Infinity;

    for (let i = startIdx; i < sleepRecord.dataPoints.length; i++) {
      const point = sleepRecord.dataPoints[i];
      let score = 0;
      if (point.stage === 'light') score += 3;
      else if (point.stage === 'rem') score += 2;
      else if (point.stage === 'awake') score += 1;
      score += point.movement * 2;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    return bestIdx;
  }, [sleepRecord]);

  const awakeCount = useMemo(() => {
    if (!sleepRecord) return 0;
    let count = 0;
    let wasAwake = false;
    for (const p of sleepRecord.dataPoints) {
      if (p.stage === 'awake') {
        if (!wasAwake) {
          count++;
          wasAwake = true;
        }
      } else {
        wasAwake = false;
      }
    }
    return count;
  }, [sleepRecord]);

  const modelProgress = useMemo(() => {
    const total = historyRecords.length;
    const target = 30;
    return Math.min(100, Math.round((total / target) * 100));
  }, [historyRecords]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setAnimated(false);
    setTimeout(() => setAnimated(true), 50);
  };

  const renderLastNightReport = () => {
    if (!sleepRecord || !qualityDetail) {
      return <div className="loading">加载中...</div>;
    }

    const ringSize = 180;
    const strokeWidth = 14;
    const radius = (ringSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (qualityDetail.totalScore / 100) * circumference;

    const pieSize = 160;
    const pieRadius = pieSize / 2;
    const totalMs = stageSummaries.reduce((sum, s) => sum + s.duration, 0);
    let cumulativeAngle = 0;
    const pieSlices = stageSummaries.map((s) => {
      const angle = (s.duration / totalMs) * 360;
      const startAngle = cumulativeAngle;
      cumulativeAngle += angle;
      const endAngle = cumulativeAngle;
      return { ...s, startAngle, endAngle };
    });

    function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
      const angleRad = ((angleDeg - 90) * Math.PI) / 180;
      return {
        x: cx + r * Math.cos(angleRad),
        y: cy + r * Math.sin(angleRad),
      };
    }

    function describeArc(x: number, y: number, r: number, startAngle: number, endAngle: number) {
      const start = polarToCartesian(x, y, r, endAngle);
      const end = polarToCartesian(x, y, r, startAngle);
      const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
      return [
        'M', start.x, start.y,
        'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
        'L', x, y,
        'Z',
      ].join(' ');
    }

    const timelinePoints = sleepRecord.dataPoints;
    const bestWakeTime = timelinePoints[bestWakeIndex]?.timestamp || sleepRecord.endTime;

    const hrWidth = 340;
    const hrHeight = 120;
    const hrPadding = 16;
    const hrData = sleepRecord.dataPoints;
    const hrMin = Math.min(...hrData.map((p) => p.heartRate)) - 5;
    const hrMax = Math.max(...hrData.map((p) => p.heartRate)) + 5;
    const hrStepX = (hrWidth - hrPadding * 2) / (hrData.length - 1 || 1);
    const hrPath = hrData
      .map((p, i) => {
        const x = hrPadding + i * hrStepX;
        const y = hrHeight - hrPadding - ((p.heartRate - hrMin) / (hrMax - hrMin)) * (hrHeight - hrPadding * 2);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
    const hrAreaPath = `${hrPath} L ${hrWidth - hrPadding} ${hrHeight - hrPadding} L ${hrPadding} ${hrHeight - hrPadding} Z`;

    const minHRIdx = hrData.findIndex((p) => p.heartRate === heartRateStats.min);
    const minHRX = hrPadding + minHRIdx * hrStepX;
    const minHRY = hrHeight - hrPadding - ((heartRateStats.min - hrMin) / (hrMax - hrMin)) * (hrHeight - hrPadding * 2);

    return (
      <div className="tab-content">
        <Card className={`overview-card ${animated ? 'animate-in' : ''}`}>
          <div className="overview-content">
            <div className="score-ring-container">
              <svg width={ringSize} height={ringSize} className="score-ring">
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c6ef2" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (animated ? progress : 0)}
                  transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                  style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                />
              </svg>
              <div className="score-inner">
                <div className="score-value">{qualityDetail.totalScore}</div>
                <div className="score-label" style={{ color: scoreLevel.color }}>
                  {scoreLevel.label}
                </div>
              </div>
            </div>

            <div className="overview-info">
              <div className="overview-main">
                <div className="overview-duration">{formatDuration(totalDuration)}</div>
                <div className="overview-label">总睡眠时长</div>
              </div>
              <div className="overview-times">
                <div className="time-item">
                  <span className="time-label">入睡</span>
                  <span className="time-value">{formatTime(sleepRecord.startTime)}</span>
                </div>
                <div className="time-divider" />
                <div className="time-item">
                  <span className="time-label">醒来</span>
                  <span className="time-value">{formatTime(sleepRecord.endTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className={`section-card ${animated ? 'animate-in delay-1' : ''}`}>
          <h3 className="section-title">睡眠阶段分布</h3>
          <div className="pie-chart-section">
            <svg width={pieSize} height={pieSize} className="pie-chart">
              {pieSlices.map((slice, index) => (
                <path
                  key={slice.stage}
                  d={describeArc(pieRadius, pieRadius, pieRadius - 4, slice.startAngle, slice.endAngle)}
                  fill={STAGE_COLORS[slice.stage as SleepStage]}
                  style={{
                    opacity: animated ? 1 : 0,
                    transformOrigin: `${pieRadius}px ${pieRadius}px`,
                    transform: animated ? 'scale(1)' : 'scale(0.8)',
                    transition: `all 0.6s ease-out ${index * 0.1 + 0.2}s`,
                  }}
                />
              ))}
              <circle cx={pieRadius} cy={pieRadius} r={pieRadius * 0.55} fill="rgba(15, 12, 41, 0.9)" />
            </svg>
            <div className="pie-legend">
              {stageSummaries.map((s) => (
                <div key={s.stage} className="legend-item">
                  <span
                    className="legend-dot"
                    style={{ backgroundColor: STAGE_COLORS[s.stage as SleepStage] }}
                  />
                  <span className="legend-name">{STAGE_NAMES[s.stage as SleepStage]}</span>
                  <span className="legend-value">
                    {Math.round((s.duration / totalMs) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="stage-duration-grid">
            {stageSummaries.map((s) => (
              <div key={s.stage} className="stage-duration-item">
                <span
                  className="stage-dot"
                  style={{ backgroundColor: STAGE_COLORS[s.stage as SleepStage] }}
                />
                <div>
                  <div className="stage-duration-time">{formatDuration(s.duration)}</div>
                  <div className="stage-duration-label">{STAGE_NAMES[s.stage as SleepStage]}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className={`section-card ${animated ? 'animate-in delay-2' : ''}`}>
          <h3 className="section-title">睡眠阶段时间线</h3>
          <div className="timeline-container">
            <div className="timeline-bar">
              {timelinePoints.map((point, i) => {
                const pct = (i / timelinePoints.length) * 100;
                return (
                  <div
                    key={i}
                    className="timeline-segment"
                    style={{
                      left: `${pct}%`,
                      backgroundColor: STAGE_COLORS[point.stage],
                      width: `${100 / timelinePoints.length + 0.5}%`,
                      opacity: animated ? 1 : 0,
                      transition: `opacity 0.3s ease-out ${Math.min(i * 0.002, 0.8)}s`,
                    }}
                  />
                );
              })}
              <div
                className="best-wake-marker"
                style={{
                  left: `${(bestWakeIndex / timelinePoints.length) * 100}%`,
                  opacity: animated ? 1 : 0,
                  transition: 'opacity 0.5s ease 1s',
                }}
              >
                <div className="best-wake-dot" />
                <div className="best-wake-label">最佳唤醒</div>
              </div>
            </div>
            <div className="timeline-axis">
              <span>{formatTime(sleepRecord.startTime)}</span>
              <span>
                {formatTime(sleepRecord.startTime + totalDuration / 2)}
              </span>
              <span>{formatTime(sleepRecord.endTime)}</span>
            </div>
          </div>
        </Card>

        <Card className={`section-card ${animated ? 'animate-in delay-3' : ''}`}>
          <h3 className="section-title">心率趋势</h3>
          <div className="heart-rate-chart">
            <svg width={hrWidth} height={hrHeight} viewBox={`0 0 ${hrWidth} ${hrHeight}`}>
              <defs>
                <linearGradient id="hrGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(124, 110, 242, 0.4)" />
                  <stop offset="100%" stopColor="rgba(124, 110, 242, 0)" />
                </linearGradient>
              </defs>
              <path
                d={hrAreaPath}
                fill="url(#hrGradient)"
                style={{
                  opacity: animated ? 1 : 0,
                  transition: 'opacity 1s ease-out 0.3s',
                }}
              />
              <path
                d={hrPath}
                fill="none"
                stroke="var(--primary-color-light)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: animated ? '0 9999' : '9999 9999',
                  transition: 'stroke-dasharray 1.5s ease-out',
                }}
              />
              <circle
                cx={minHRX}
                cy={minHRY}
                r="5"
                fill="var(--success-color)"
                style={{
                  opacity: animated ? 1 : 0,
                  transition: 'opacity 0.5s ease 1.2s',
                }}
              />
            </svg>
            <div className="hr-stats">
              <div className="hr-stat-item">
                <div className="hr-stat-value">{heartRateStats.min}</div>
                <div className="hr-stat-label">最低心率</div>
              </div>
              <div className="hr-stat-item">
                <div className="hr-stat-value">{heartRateStats.avg}</div>
                <div className="hr-stat-label">平均心率</div>
              </div>
              <div className="hr-stat-item">
                <div className="hr-stat-value">{heartRateStats.max}</div>
                <div className="hr-stat-label">最高心率</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className={`section-card ${animated ? 'animate-in delay-4' : ''}`}>
          <h3 className="section-title">详细数据</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                ⚡
              </div>
              <div className="detail-value">{qualityDetail.sleepEfficiency}%</div>
              <div className="detail-label">睡眠效率</div>
            </div>
            <div className="detail-item">
              <div className="detail-icon" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                ⏱️
              </div>
              <div className="detail-value">{qualityDetail.sleepLatencyMinutes}分钟</div>
              <div className="detail-label">入睡潜伏期</div>
            </div>
            <div className="detail-item">
              <div className="detail-icon" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                🔄
              </div>
              <div className="detail-value">{qualityDetail.cycleCount}次</div>
              <div className="detail-label">睡眠周期</div>
            </div>
            <div className="detail-item">
              <div className="detail-icon" style={{ background: 'rgba(30, 58, 138, 0.3)' }}>
                🌙
              </div>
              <div className="detail-value">
                {formatDuration(stageSummaries.find((s) => s.stage === 'deep')?.duration || 0)}
              </div>
              <div className="detail-label">深睡时长</div>
            </div>
            <div className="detail-item">
              <div className="detail-icon" style={{ background: 'rgba(139, 92, 246, 0.3)' }}>
                💭
              </div>
              <div className="detail-value">
                {formatDuration(stageSummaries.find((s) => s.stage === 'rem')?.duration || 0)}
              </div>
              <div className="detail-label">REM时长</div>
            </div>
            <div className="detail-item">
              <div className="detail-icon" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                👁️
              </div>
              <div className="detail-value">{awakeCount}次</div>
              <div className="detail-label">夜间觉醒</div>
            </div>
          </div>
        </Card>

        <Card className={`section-card ${animated ? 'animate-in delay-5' : ''}`}>
          <h3 className="section-title">🤖 为什么在这个时间唤醒你？</h3>
          <div className="wake-explanation">
            <p className="wake-text">
              智能唤醒功能通过监测你的睡眠阶段，在你设定的唤醒窗口内选择<span className="highlight">浅睡阶段</span>将你轻轻唤醒。
            </p>
            <div className="wake-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">✨</span>
                <span>醒来后感觉更清醒，没有昏沉感</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">💪</span>
                <span>减少起床后的疲劳感和烦躁情绪</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🧠</span>
                <span>提高白天的注意力和工作效率</span>
              </div>
            </div>
            <div className="wake-reason">
              <div className="wake-reason-title">本次唤醒原因</div>
              <div className="wake-reason-text">
                {sleepRecord.awakenReason || '在浅睡阶段智能唤醒'}
                · {formatTime(bestWakeTime)}
              </div>
            </div>
          </div>
        </Card>

        <Card className={`section-card ${animated ? 'animate-in delay-6' : ''}`}>
          <h3 className="section-title">💡 AI 睡眠建议</h3>
          <div className="advice-list">
            {advice.map((item, index) => (
              <div key={index} className="advice-item">
                <span className="advice-icon">{item.icon}</span>
                <span className="advice-text">{item.text}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className={`action-buttons ${animated ? 'animate-in delay-7' : ''}`}>
          <Button variant="secondary" size="lg" fullWidth onClick={() => navigate('/home')}>
            返回首页
          </Button>
        </div>
      </div>
    );
  };

  const renderWeeklyChart = () => {
    const chartWidth = 340;
    const chartHeight = 150;
    const chartPadding = { top: 20, right: 8, bottom: 28, left: 8 };
    const innerWidth = chartWidth - chartPadding.left - chartPadding.right;
    const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom;

    const maxDuration = Math.max(...weekChartData.map((d) => d.duration), 8 * 60 * 60 * 1000);
    const barWidth = innerWidth / weekChartData.length * 0.6;
    const barGap = innerWidth / weekChartData.length * 0.4;

    return (
      <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="weekly-chart">
        <defs>
          <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#7c6ef2" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((ratio, i) => {
          const y = chartPadding.top + innerHeight * (1 - ratio);
          return (
            <line
              key={i}
              x1={chartPadding.left}
              y1={y}
              x2={chartWidth - chartPadding.right}
              y2={y}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="4 4"
            />
          );
        })}
        {weekChartData.map((day, index) => {
          const barHeight = maxDuration > 0 ? (day.duration / maxDuration) * innerHeight : 0;
          const x = chartPadding.left + index * (barWidth + barGap) + barGap / 2;
          const y = chartPadding.top + innerHeight - barHeight;
          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="6"
                fill="url(#barGradient)"
                style={{
                  opacity: animated ? 1 : 0,
                  transform: animated ? 'scaleY(1)' : 'scaleY(0)',
                  transformOrigin: `${x + barWidth / 2}px ${chartPadding.top + innerHeight}px`,
                  transition: `all 0.5s ease-out ${index * 0.08 + 0.2}s`,
                }}
              />
              {day.duration > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--text-secondary)"
                  style={{
                    opacity: animated ? 1 : 0,
                    transition: `opacity 0.3s ease-out ${index * 0.08 + 0.5}s`,
                  }}
                >
                  {formatDurationShort(day.duration)}
                </text>
              )}
              <text
                x={x + barWidth / 2}
                y={chartHeight - 8}
                textAnchor="middle"
                fontSize="11"
                fill="var(--text-tertiary)"
                style={{
                  opacity: animated ? 1 : 0,
                  transition: `opacity 0.3s ease-out ${index * 0.05 + 0.1}s`,
                }}
              >
                {day.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderHistoryList = () => {
    if (filteredRecords.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-text">暂无睡眠记录</div>
        </div>
      );
    }

    return (
      <div className="history-list">
        {filteredRecords.map((record, index) => {
          const duration = record.endTime - record.startTime;
          const scoreInfo = getScoreLevel(record.qualityScore);
          const isExpanded = expandedId === record.id;
          const recordStages = record.stages;
          const totalStageDuration = recordStages.reduce((sum, s) => sum + s.duration, 0);

          const date = new Date(record.startTime);
          const dateStr = date.toLocaleDateString('zh-CN', {
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          });

          return (
            <Card
              key={record.id}
              className={`history-card ${isExpanded ? 'expanded' : ''} ${animated ? 'animate-in' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => setExpandedId(isExpanded ? null : record.id)}
            >
              <div className="history-card-header">
                <div className="history-date">
                  <div className="history-date-text">{dateStr}</div>
                  <div className="history-time-range">
                    {formatTime(record.startTime)} - {formatTime(record.endTime)}
                  </div>
                </div>
                <div className="history-score">
                  <div className="history-score-value" style={{ color: scoreInfo.color }}>
                    {record.qualityScore}
                  </div>
                  <div className="history-score-label" style={{ color: scoreInfo.color }}>
                    {scoreInfo.label}
                  </div>
                </div>
              </div>

              <div className="history-stage-bar">
                {recordStages.map((stage) => {
                  const width = (stage.duration / totalStageDuration) * 100;
                  return (
                    <div
                      key={stage.stage}
                      className="history-stage-segment"
                      style={{
                        width: `${width}%`,
                        backgroundColor: STAGE_COLORS[stage.stage as SleepStage],
                      }}
                    />
                  );
                })}
              </div>

              <div className="history-card-footer">
                <div className="history-duration">
                  <span className="history-duration-icon">⏱️</span>
                  <span>{formatDuration(duration)}</span>
                </div>
                <div className="history-expand-indicator">
                  {isExpanded ? '收起 ▲' : '详情 ▼'}
                </div>
              </div>

              {isExpanded && (
                <div className="history-detail">
                  <div className="history-detail-grid">
                    {recordStages.map((stage) => (
                      <div key={stage.stage} className="history-detail-item">
                        <span
                          className="history-detail-dot"
                          style={{ backgroundColor: STAGE_COLORS[stage.stage as SleepStage] }}
                        />
                        <span className="history-detail-name">
                          {STAGE_NAMES[stage.stage as SleepStage]}
                        </span>
                        <span className="history-detail-value">
                          {formatDuration(stage.duration)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="history-detail-awaken">
                    <span className="history-awaken-label">唤醒原因：</span>
                    <span className="history-awaken-value">{record.awakenReason}</span>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  const renderHistoryTab = () => {
    return (
      <div className="tab-content">
        <Card className={`weekly-summary-card ${animated ? 'animate-in' : ''}`}>
          <h3 className="section-title">本周趋势</h3>
          <div className="weekly-stats">
            <div className="weekly-stat-item">
              <div className="weekly-stat-value">
                {formatDurationShort(weeklySummary.avgDuration)}
              </div>
              <div className="weekly-stat-label">平均睡眠时长</div>
            </div>
            <div className="weekly-stat-divider" />
            <div className="weekly-stat-item">
              <div className="weekly-stat-value">{weeklySummary.avgQualityScore}分</div>
              <div className="weekly-stat-label">平均睡眠质量</div>
            </div>
          </div>
          {renderWeeklyChart()}
        </Card>

        <Card className={`filter-card ${animated ? 'animate-in delay-1' : ''}`}>
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === '7days' ? 'active' : ''}`}
              onClick={() => setFilter('7days')}
            >
              近7天
            </button>
            <button
              className={`filter-tab ${filter === '30days' ? 'active' : ''}`}
              onClick={() => setFilter('30days')}
            >
              近30天
            </button>
            <div
              className="filter-tab-indicator"
              style={{
                transform: filter === '7days' ? 'translateX(0)' : 'translateX(100%)',
              }}
            />
          </div>
        </Card>

        <div className={`history-section ${animated ? 'animate-in delay-2' : ''}`}>
          <h3 className="section-title history-section-title">历史记录</h3>
          {renderHistoryList()}
        </div>

        <Card className={`personalized-card ${animated ? 'animate-in delay-3' : ''}`}>
          <h3 className="section-title">你的睡眠规律</h3>
          <div className="personalized-grid">
            <div className="personalized-item">
              <div className="personalized-icon">🌙</div>
              <div className="personalized-info">
                <div className="personalized-value">{personalizedStats.avgBedtime}</div>
                <div className="personalized-label">平均入睡时间</div>
              </div>
            </div>
            <div className="personalized-item">
              <div className="personalized-icon">☀️</div>
              <div className="personalized-info">
                <div className="personalized-value">{personalizedStats.avgWakeTime}</div>
                <div className="personalized-label">平均起床时间</div>
              </div>
            </div>
            <div className="personalized-item">
              <div className="personalized-icon">⏱️</div>
              <div className="personalized-info">
                <div className="personalized-value">
                  {formatDurationShort(personalizedStats.avgDuration)}
                </div>
                <div className="personalized-label">平均睡眠时长</div>
              </div>
            </div>
            <div className="personalized-item">
              <div className="personalized-icon">🎯</div>
              <div className="personalized-info">
                <div className="personalized-value">
                  {STAGE_NAMES[personalizedStats.mostCommonWakeStage as SleepStage] || '浅睡'}
                </div>
                <div className="personalized-label">常见唤醒阶段</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className={`ai-model-card ${animated ? 'animate-in delay-4' : ''}`}>
          <div className="ai-model-header">
            <div className="ai-model-icon">🤖</div>
            <div className="ai-model-title-section">
              <h3 className="section-title ai-model-title">你的专属唤醒模型</h3>
              <p className="ai-model-subtitle">
                基于健康平台的睡眠数据，结合 AI 算法进行二次分析，持续优化唤醒时机，为你提供千人千面的智能唤醒体验。
              </p>
            </div>
          </div>

          <div className="ai-model-features">
            <div className="ai-feature-item">
              <div className="ai-feature-icon">📊</div>
              <div className="ai-feature-content">
                <div className="ai-feature-title">个性化深睡时段</div>
                <div className="ai-feature-desc">
                  你的深睡期通常在入睡后 <span className="ai-feature-highlight">{personalizedStats.avgDeepSleepOffsetHours}小时</span> 左右
                </div>
              </div>
            </div>
            <div className="ai-feature-item">
              <div className="ai-feature-icon">🧠</div>
              <div className="ai-feature-content">
                <div className="ai-feature-title">智能学习进度</div>
                <div className="ai-feature-desc">
                  已学习 <span className="ai-feature-highlight">{personalizedStats.totalRecords}次</span> 睡眠数据
                </div>
              </div>
            </div>
          </div>

          <div className="ai-model-progress-section">
            <div className="ai-progress-header">
              <span className="ai-progress-label">模型训练进度</span>
              <span className="ai-progress-value">{modelProgress}%</span>
            </div>
            <div className="ai-progress-bar">
              <div
                className="ai-progress-fill"
                style={{
                  width: animated ? `${modelProgress}%` : '0%',
                  transition: 'width 1.5s ease-out 0.5s',
                }}
              />
            </div>
            <div className="ai-progress-tip">
              {modelProgress < 100
                ? `再记录 ${30 - personalizedStats.totalRecords} 次睡眠，模型将更加精准`
                : '模型已充分学习你的睡眠规律，唤醒体验最佳'}
            </div>
          </div>

          <div className="ai-model-benefits">
            <div className="ai-benefit-item">
              <span className="ai-benefit-check">✓</span>
              <span>更精准的浅睡阶段检测</span>
            </div>
            <div className="ai-benefit-item">
              <span className="ai-benefit-check">✓</span>
              <span>适配你的睡眠周期规律</span>
            </div>
            <div className="ai-benefit-item">
              <span className="ai-benefit-check">✓</span>
              <span>持续优化唤醒时机选择</span>
            </div>
          </div>
        </Card>

        <div className={`action-buttons ${animated ? 'animate-in delay-5' : ''}`}>
          <Button variant="secondary" size="lg" fullWidth onClick={() => navigate('/home')}>
            返回首页
          </Button>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="report-page">
        <div className="report-header">
          <h1 className="report-title">睡眠报告</h1>
          <p className="report-subtitle">记录每一晚的睡眠质量</p>
        </div>

        <div className="tabs-container">
          <div className="tabs">
            <button
              ref={lastNightTabRef}
              className={`tab ${activeTab === 'lastNight' ? 'active' : ''}`}
              onClick={() => handleTabChange('lastNight')}
            >
              昨晚
            </button>
            <button
              ref={historyTabRef}
              className={`tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => handleTabChange('history')}
            >
              历史
            </button>
            <div
              ref={tabIndicatorRef}
              className="tab-indicator"
              style={{
                transform: activeTab === 'lastNight' ? 'translateX(0)' : 'translateX(100%)',
              }}
            />
          </div>
        </div>

        <div className={`tab-panel ${activeTab === 'lastNight' ? 'active' : ''}`}>
          {renderLastNightReport()}
        </div>
        <div className={`tab-panel ${activeTab === 'history' ? 'active' : ''}`}>
          {renderHistoryTab()}
        </div>
      </div>
    </MainLayout>
  );
};

export default ReportPage;
