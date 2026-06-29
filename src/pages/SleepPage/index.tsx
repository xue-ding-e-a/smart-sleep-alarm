import React, { useState, useRef, useEffect } from 'react';
import MainLayout from '../../components/MainLayout';
import './style.css';

type ViewMode = 'day' | 'week' | 'month';
type MetricType = 'duration' | 'heartRate' | 'bloodOxygen' | 'respiration' | 'hrv';

const renderValueWithUnits = (value: string) => {
  const parts: { text: string; isNumber: boolean }[] = [];
  let current = '';
  let isNum = false;

  const isNumberChar = (ch: string) => /[0-9.]/.test(ch);
  const isRangeHyphen = (ch: string, i: number, str: string) => {
    if (ch !== '-') return false;
    if (i === 0 || i === str.length - 1) return false;
    const prevChar = str[i - 1];
    const nextChar = str[i + 1];
    return isNumberChar(prevChar) && isNumberChar(nextChar);
  };

  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    const charIsNum = isNumberChar(ch) || isRangeHyphen(ch, i, value);
    if (i === 0) {
      current = ch;
      isNum = charIsNum;
    } else if (charIsNum === isNum) {
      current += ch;
    } else {
      parts.push({ text: current, isNumber: isNum });
      current = ch;
      isNum = charIsNum;
    }
  }
  if (current) {
    parts.push({ text: current, isNumber: isNum });
  }

  return (
    <>
      {parts.map((part, idx) =>
        part.isNumber ? (
          <span key={idx} className="header-value-num">{part.text}</span>
        ) : (
          <span key={idx} className="header-value-unit">{part.text}</span>
        )
      )}
    </>
  );
};

const SleepPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('duration');
  const [showMoreAnalysis, setShowMoreAnalysis] = useState(false);

  // 拖拽滑动状态
  const metricsScrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const currentXRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityHistoryRef = useRef<number[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const momentumRef = useRef(false);
  const overshootRef = useRef(0);
  const isAnimatingRef = useRef(false);

  const MOVE_THRESHOLD = 8;
  const DAMPING = 0.3;
  const FRICTION = 0.94;
  const MIN_VELOCITY = 0.1;
  const BOUNCE_DURATION = 300;

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  const getMaxScrollLeft = () => {
    if (!metricsScrollRef.current) return 0;
    return metricsScrollRef.current.scrollWidth - metricsScrollRef.current.clientWidth;
  };

  const clearAllAnimations = () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    momentumRef.current = false;
    isAnimatingRef.current = false;
  };

  const applyTransform = (offset: number) => {
    if (!metricsScrollRef.current) return;
    metricsScrollRef.current.style.transform = `translateX(${offset}px)`;
  };

  const clearTransform = () => {
    if (!metricsScrollRef.current) return;
    metricsScrollRef.current.style.transform = '';
  };

  const addVelocitySample = (v: number) => {
    velocityHistoryRef.current.push(v);
    if (velocityHistoryRef.current.length > 5) {
      velocityHistoryRef.current.shift();
    }
  };

  const getAverageVelocity = () => {
    const history = velocityHistoryRef.current;
    if (history.length === 0) return 0;
    const sum = history.reduce((acc, v) => acc + v, 0);
    return sum / history.length;
  };

  const startBounce = () => {
    if (!metricsScrollRef.current) return;
    const overshoot = overshootRef.current;
    if (overshoot === 0) return;

    isAnimatingRef.current = true;
    const startTime = performance.now();
    const startOvershoot = overshoot;
    const maxScrollLeft = getMaxScrollLeft();
    const targetScrollLeft = overshoot > 0 ? 0 : maxScrollLeft;

    const animate = (now: number) => {
      if (!metricsScrollRef.current || !isAnimatingRef.current) return;

      const elapsed = now - startTime;
      const progress = Math.min(elapsed / BOUNCE_DURATION, 1);
      const eased = easeOutCubic(progress);
      const currentOvershoot = startOvershoot * (1 - eased);

      overshootRef.current = currentOvershoot;
      applyTransform(currentOvershoot);

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(animate);
      } else {
        overshootRef.current = 0;
        clearTransform();
        metricsScrollRef.current.scrollLeft = targetScrollLeft;
        isAnimatingRef.current = false;
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(animate);
  };

  const startMomentum = (initialVelocity: number) => {
    if (!metricsScrollRef.current) return;

    momentumRef.current = true;
    let velocity = initialVelocity;

    const animate = () => {
      if (!metricsScrollRef.current || !momentumRef.current) return;

      velocity *= FRICTION;

      if (Math.abs(velocity) < MIN_VELOCITY) {
        momentumRef.current = false;
        return;
      }

      const currentScrollLeft = metricsScrollRef.current.scrollLeft;
      const newScrollLeft = currentScrollLeft - velocity;
      const maxScrollLeft = getMaxScrollLeft();

      if (newScrollLeft < 0) {
        const overshoot = -newScrollLeft;
        metricsScrollRef.current.scrollLeft = 0;
        overshootRef.current = overshoot;
        applyTransform(overshoot);
        momentumRef.current = false;
        startBounce();
        return;
      }

      if (newScrollLeft > maxScrollLeft) {
        const overshoot = -(newScrollLeft - maxScrollLeft);
        metricsScrollRef.current.scrollLeft = maxScrollLeft;
        overshootRef.current = overshoot;
        applyTransform(overshoot);
        momentumRef.current = false;
        startBounce();
        return;
      }

      metricsScrollRef.current.scrollLeft = newScrollLeft;
      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!metricsScrollRef.current) return;

    clearAllAnimations();

    if (overshootRef.current !== 0) {
      const maxScrollLeft = getMaxScrollLeft();
      if (overshootRef.current > 0) {
        metricsScrollRef.current.scrollLeft = 0;
      } else {
        metricsScrollRef.current.scrollLeft = maxScrollLeft;
      }
      overshootRef.current = 0;
      clearTransform();
    }

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX;
    currentXRef.current = e.pageX;
    lastXRef.current = e.pageX;
    lastTimeRef.current = performance.now();
    velocityHistoryRef.current = [];
    startScrollLeftRef.current = metricsScrollRef.current.scrollLeft;
    metricsScrollRef.current.style.cursor = 'pointer';
    metricsScrollRef.current.style.userSelect = 'none';
    metricsScrollRef.current.style.scrollBehavior = 'auto';
  };

  const endDrag = () => {
    if (!metricsScrollRef.current) return;
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    metricsScrollRef.current.style.cursor = 'default';
    metricsScrollRef.current.style.userSelect = '';

    const avgVelocity = getAverageVelocity();

    if (overshootRef.current !== 0) {
      startBounce();
    } else if (Math.abs(avgVelocity) > 0.5 && hasDraggedRef.current) {
      startMomentum(avgVelocity);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current || !metricsScrollRef.current) return;
    e.preventDefault();

    const currentTime = performance.now();
    const deltaTime = currentTime - lastTimeRef.current;
    const deltaX = e.pageX - lastXRef.current;

    if (deltaTime > 0) {
      const velocity = deltaX / deltaTime * 10;
      addVelocitySample(velocity);
    }

    lastXRef.current = e.pageX;
    lastTimeRef.current = currentTime;
    currentXRef.current = e.pageX;

    const walk = e.pageX - startXRef.current;
    if (Math.abs(walk) > MOVE_THRESHOLD) {
      hasDraggedRef.current = true;
    }

    const maxScrollLeft = getMaxScrollLeft();
    let newScrollLeft = startScrollLeftRef.current - walk;

    if (newScrollLeft < 0) {
      const overshoot = -newScrollLeft * DAMPING;
      overshootRef.current = overshoot;
      applyTransform(overshoot);
      metricsScrollRef.current.scrollLeft = 0;
    } else if (newScrollLeft > maxScrollLeft) {
      const overshoot = -(newScrollLeft - maxScrollLeft) * DAMPING;
      overshootRef.current = overshoot;
      applyTransform(overshoot);
      metricsScrollRef.current.scrollLeft = maxScrollLeft;
    } else {
      overshootRef.current = 0;
      clearTransform();
      metricsScrollRef.current.scrollLeft = newScrollLeft;
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const onMouseUp = () => endDrag();
    const onMouseLeave = () => endDrag();

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      clearAllAnimations();
    };
  }, []);

  const handleCardClick = (metricKey: MetricType) => {
    if (hasDraggedRef.current) return;
    setSelectedMetric(metricKey);
  };

  const dayMetrics: { key: MetricType; label: string; value: string; subLabel?: string; subValue?: string }[] = [
    { key: 'duration', label: '睡眠总时长', value: '9小时18分钟' },
    { key: 'heartRate', label: '睡眠心率', value: '49-93次/分', subLabel: '睡眠基准心率', subValue: '57次/分' },
    { key: 'respiration', label: '睡眠呼吸率', value: '10-23.5次/分' },
    { key: 'bloodOxygen', label: '睡眠血氧', value: '93-99%', subLabel: '睡眠平均血氧', subValue: '97%' },
    { key: 'hrv', label: '睡眠心率变异性', value: '21-87毫秒', subLabel: '平均睡眠心率变异性', subValue: '52毫秒' },
  ];

  const stageColors = {
    deep: '#4A4AE0',
    light: '#7B7CFF',
    rem: '#51B0FF',
    awake: '#B8B8B8',
  };

  const dayStages = [
    { stage: 'light', start: 0, end: 45 },
    { stage: 'deep', start: 45, end: 90 },
    { stage: 'light', start: 90, end: 140 },
    { stage: 'rem', start: 140, end: 170 },
    { stage: 'light', start: 170, end: 220 },
    { stage: 'deep', start: 220, end: 260 },
    { stage: 'light', start: 260, end: 320 },
    { stage: 'rem', start: 320, end: 360 },
    { stage: 'light', start: 360, end: 410 },
    { stage: 'deep', start: 410, end: 439 },
    { stage: 'light', start: 439, end: 487 },
  ];

  const heartRateData = [
    62, 58, 55, 60, 52, 56, 50, 54, 49, 53, 51, 57, 54, 59, 57, 62, 60, 65, 75, 88,
    93, 82, 87, 78, 85, 72, 77, 65, 70, 58, 63, 52, 57, 49, 54, 51, 56, 53, 58, 55
  ];

  const bloodOxygenData = [
    98, 98, 97, 98, 97, 96, 95, 94, 93, 92, 91, 90, 93, 95, 97, 98, 98, 97, 96, 95,
    94, 93, 92, 94, 95, 96, 97, 98, 98, 97, 97, 96, 97, 98, 98, 97, 96, 97, 98, 98
  ];

  const respirationData = [
    16, 14, 15, 13, 14, 12, 13, 11, 12, 10, 11, 12, 14, 16, 18, 17, 19, 16, 14, 12,
    13, 15, 17, 19, 21, 23, 22, 20, 18, 16, 14, 13, 12, 14, 15, 17, 18, 16, 14, 13
  ];

  const hrvData = [
    25, 30, 35, 40, 48, 55, 62, 70, 78, 84, 87, 85, 80, 72, 65, 58, 50, 45, 40, 35,
    32, 30, 28, 30, 35, 42, 50, 58, 65, 72, 78, 80, 76, 70, 62, 55, 48, 42, 38, 35
  ];

  const yAxisConfig: Record<MetricType, { ticks: number[]; min: number; max: number }> = {
    duration: { ticks: [], min: 0, max: 100 },
    heartRate: { ticks: [40, 80, 120], min: 35, max: 125 },
    bloodOxygen: { ticks: [90, 95, 100], min: 88, max: 102 },
    respiration: { ticks: [10, 20, 30], min: 8, max: 32 },
    hrv: { ticks: [0, 40, 80, 120], min: 0, max: 125 },
  };

  const getCurveData = (metric: MetricType) => {
    switch (metric) {
      case 'heartRate': return heartRateData;
      case 'bloodOxygen': return bloodOxygenData;
      case 'respiration': return respirationData;
      case 'hrv': return hrvData;
      default: return [];
    }
  };

  const renderSleepStageBars = () => {
    const totalMinutes = 648;
    const stageOrder = ['awake', 'rem', 'light', 'deep'];
    const firstSleepEnd = 487;
    const napStart = 577;
    const napEnd = 648;
    const firstSleepEndPercent = (firstSleepEnd / totalMinutes) * 100;
    
    return (
      <>
        <div className="stage-y-labels">
          <span>清醒</span>
          <span>快速眼动</span>
          <span>浅睡</span>
          <span>深睡</span>
        </div>
        <div className="stage-bars-container">
          {dayStages.map((segment, idx) => {
            const left = (segment.start / totalMinutes) * 100;
            const width = ((segment.end - segment.start) / totalMinutes) * 100;
            const stageIdx = stageOrder.indexOf(segment.stage);
            const top = stageIdx * 25 + 2;
            const height = 21;
            return (
              <div
                key={idx}
                className="stage-bar-segment"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  top: `${top}%`,
                  height: `${height}%`,
                  background: stageColors[segment.stage as keyof typeof stageColors],
                }}
              />
            );
          })}
          <div
            className="nap-gradient-bar"
            style={{
              left: `${(napStart / totalMinutes) * 100}%`,
              width: `${((napEnd - napStart) / totalMinutes) * 100}%`,
            }}
          />
          <div
            className="sleep-end-line"
            style={{ left: `${firstSleepEndPercent}%` }}
          />
        </div>
        <div className="stage-grid-lines">
          <div className="grid-line" />
          <div className="grid-line" />
          <div className="grid-line" />
          <div className="grid-line" />
        </div>
        <div className="stage-x-labels">
          <span>03:58</span>
          <span>12:05</span>
          <span>14:46</span>
        </div>
      </>
    );
  };

  const renderMiniStageBar = () => {
    const totalMinutes = 648;
    const napStart = 577;
    const napEnd = 648;
    
    return (
      <div className="mini-stage-bar">
        <div className="mini-stage-grid">
          <div className="mini-grid-line" />
          <div className="mini-grid-line" />
          <div className="mini-grid-line" />
        </div>
        <div className="mini-stage-bars">
          {dayStages.map((segment, idx) => {
            const left = (segment.start / totalMinutes) * 100;
            const width = ((segment.end - segment.start) / totalMinutes) * 100;
            return (
              <div
                key={idx}
                className="mini-stage-segment"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  background: stageColors[segment.stage as keyof typeof stageColors],
                }}
              />
            );
          })}
          <div
            className="mini-stage-segment mini-nap-segment"
            style={{
              left: `${(napStart / totalMinutes) * 100}%`,
              width: `${((napEnd - napStart) / totalMinutes) * 100}%`,
            }}
          />
        </div>
        <div className="mini-stage-x-labels">
          <span>03:58</span>
          <span>14:46</span>
        </div>
      </div>
    );
  };

  const renderCurveChart = (metric: MetricType) => {
    const width = 320;
    const height = 160;
    const config = yAxisConfig[metric];
    const data = getCurveData(metric);
    
    if (data.length === 0) return null;

    const { min: minVal, max: maxVal, ticks } = config;
    const range = maxVal - minVal;
    const stepX = width / (data.length - 1);

    const points = data.map((val, i) => {
      const x = i * stepX;
      const y = height - ((val - minVal) / range) * (height - 20) - 10;
      return `${x},${y}`;
    }).join(' ');

    const areaPoints = `0,${height} ${points} ${width},${height}`;

    return (
      <div className="curve-chart-wrapper">
        <div className="curve-y-labels">
          {[...ticks].reverse().map((tick, idx) => (
            <span key={idx} className="curve-y-label">{tick}</span>
          ))}
        </div>
        <div className="curve-chart-area">
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#FF6B6B" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {ticks.map((tick, idx) => {
              const y = height - ((tick - minVal) / range) * (height - 20) - 10;
              return (
                <line
                  key={idx}
                  x1="0"
                  y1={y}
                  x2={width}
                  y2={y}
                  stroke="var(--chart-grid-color)"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              );
            })}
            <polygon points={areaPoints} fill="url(#curveGradient)" />
            <polyline
              points={points}
              fill="none"
              stroke="#FF6B6B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="curve-x-labels">
            <span>03:58</span>
            <span>14:46</span>
          </div>
        </div>
      </div>
    );
  };

  const renderRingChart = () => {
    const deepMin = 79;
    const lightMin = 320;
    const remMin = 88;
    const total = deepMin + lightMin + remMin;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    const deepRatio = deepMin / total;
    const lightRatio = lightMin / total;
    const remRatio = remMin / total;

    return (
      <svg viewBox="0 0 100 100" width="120" height="120">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#F0F0F0" strokeWidth="12" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={stageColors.deep}
          strokeWidth="12"
          strokeDasharray={`${deepRatio * circumference} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="butt"
          transform="rotate(-90 50 50)"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={stageColors.light}
          strokeWidth="12"
          strokeDasharray={`${lightRatio * circumference} ${circumference}`}
          strokeDashoffset={-deepRatio * circumference}
          strokeLinecap="butt"
          transform="rotate(-90 50 50)"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={stageColors.rem}
          strokeWidth="12"
          strokeDasharray={`${remRatio * circumference} ${circumference}`}
          strokeDashoffset={-(deepRatio + lightRatio) * circumference}
          strokeLinecap="butt"
          transform="rotate(-90 50 50)"
        />
      </svg>
    );
  };

  const weekData = [
    { day: '周六', bed: '23:45', wake: '07:20', duration: 455 },
    { day: '周日', bed: '00:15', wake: '08:10', duration: 475 },
    { day: '周一', bed: '23:30', wake: '06:45', duration: 435 },
    { day: '周二', bed: '00:05', wake: '07:30', duration: 445 },
    { day: '周三', bed: '23:50', wake: '07:15', duration: 445 },
    { day: '周四', bed: '00:30', wake: '08:00', duration: 450 },
    { day: '周五', bed: '03:58', wake: '12:05', duration: 487 },
  ];

  const weekScoreData = [78, 85, 80, 82, 86, 84, 87];
  const weekBedData = [440, 470, 420, 435, 445, 455, 487];
  const weekDeepData = [65, 80, 70, 72, 78, 75, 79];
  const weekHeartData = [52, 55, 54, 53, 56, 55, 57];
  const weekOxygenData = [96, 97, 96, 97, 98, 97, 97];

  const renderMiniLineChart = (data: number[], color: string) => {
    const width = 100;
    const height = 40;
    const minVal = Math.min(...data) - 5;
    const maxVal = Math.max(...data) + 5;
    const range = maxVal - minVal;
    const stepX = width / (data.length - 1);

    const points = data.map((val, i) => {
      const x = i * stepX;
      const y = height - ((val - minVal) / range) * (height - 8) - 4;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const renderMiniBarChart = (data: number[], color: string) => {
    const width = 100;
    const height = 40;
    const maxVal = Math.max(...data);
    const barWidth = (width / data.length) - 2;

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {data.map((val, i) => {
          const barHeight = (val / maxVal) * (height - 8);
          const x = i * (barWidth + 2) + 1;
          const y = height - barHeight - 4;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              rx="2"
            />
          );
        })}
      </svg>
    );
  };

  const renderMiniDotChart = (data: number[], color: string) => {
    const width = 100;
    const height = 40;
    const minVal = Math.min(...data) - 5;
    const maxVal = Math.max(...data) + 5;
    const range = maxVal - minVal;
    const stepX = width / (data.length - 1);

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {data.map((val, i) => {
          const x = i * stepX;
          const y = height - ((val - minVal) / range) * (height - 8) - 4;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2"
              fill={color}
            />
          );
        })}
      </svg>
    );
  };

  const monthData = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const bedHour = 22 + Math.floor(Math.random() * 3);
    const bedMin = Math.floor(Math.random() * 60);
    const wakeHour = 6 + Math.floor(Math.random() * 2);
    const wakeMin = Math.floor(Math.random() * 60);
    const duration = (24 - bedHour + wakeHour) * 60 + (wakeMin - bedMin);
    return { day, bedHour, bedMin, wakeHour, wakeMin, duration: Math.max(360, Math.min(540, duration)) };
  });

  const renderWeekBars = () => {
    const maxDuration = 540;
    return (
      <div className="week-bars-container">
        {weekData.map((item, idx) => {
          const heightPercent = (item.duration / maxDuration) * 100;
          return (
            <div key={idx} className="week-bar-col">
              <div className="week-bar-track">
                <div
                  className="week-bar-fill"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <div className="week-bar-label">{item.day}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthBars = () => {
    const maxDuration = 540;
    return (
      <div className="month-bars-container">
        {monthData.map((item, idx) => {
          const heightPercent = (item.duration / maxDuration) * 100;
          return (
            <div key={idx} className="month-bar-col">
              <div className="month-bar-track">
                <div
                  className="month-bar-fill"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getCurrentMetric = () => {
    return dayMetrics.find(m => m.key === selectedMetric) || dayMetrics[0];
  };

  const renderDayView = () => {
    const metric = getCurrentMetric();

    return (
      <div className="sleep-day-view">
        <div className="sleep-main-header">
          <div className="header-left">
            <div className="header-label-top">{metric.label}</div>
            <div className="header-value-row">{renderValueWithUnits(metric.value)}</div>
            <div className="header-date-bottom">昨天</div>
          </div>
          {metric.subLabel && metric.subValue && (
            <div className="header-right">
              <div className="header-sub-label">{metric.subLabel}</div>
              <div className="header-sub-value">{metric.subValue}</div>
            </div>
          )}
        </div>

        <div className="sleep-chart-section">
          <div className="sleep-stage-card">
            <div className={`stage-chart-area ${selectedMetric !== 'duration' ? 'collapsed' : ''}`}>
              {renderSleepStageBars()}
            </div>
            <div className={`mini-stage-bar-wrapper ${selectedMetric === 'duration' ? 'hidden' : ''}`}>
              {renderMiniStageBar()}
            </div>
          </div>

          <div className={`curve-chart-card ${selectedMetric === 'duration' ? 'hidden' : ''}`}>
            {renderCurveChart(selectedMetric)}
          </div>
        </div>

        <div className="metrics-scroll-container">
          <div
            className="metrics-scroll"
            ref={metricsScrollRef}
            onMouseDown={handleMouseDown}
            onDragStart={handleDragStart}
          >
            {dayMetrics.map((m) => (
              <div
                key={m.key}
                className={`metric-scroll-card ${selectedMetric === m.key ? 'active' : ''}`}
                onClick={() => handleCardClick(m.key)}
              >
                <div className="metric-scroll-label">{m.label}</div>
                <div className="metric-scroll-value">{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="sleep-score-card">
          <div className="score-header">
            <div className="score-number">
              87<span className="score-unit">分</span>
            </div>
            <div className="score-tags">
              <span className="score-tag score-tag-good">睡眠良好</span>
              <span className="score-tag score-tag-normal">与上次相同</span>
            </div>
          </div>
          <p className="score-desc">
            您昨晚的睡眠质量不错。对于大部分健康成年人来说，整夜的睡眠过程中通常有4到5个睡眠周期，每个周期为90到110分钟。深睡主要出现在前半夜的睡眠周期中，建议您在晚上9-11点就寝，提高深睡时长。
          </p>
        </div>

        <div className="section-title">
          <span className="section-icon">🛏️</span>
          第1段睡眠
        </div>

        <div className="segment-card">
          <div className="segment-header">
            <div className="segment-duration-wrap">
              <div className="segment-duration">{renderValueWithUnits('8小时7分钟')}</div>
              <div className="segment-time">03:58-12:05</div>
            </div>
            <div className="segment-device">⌚</div>
          </div>

          <div className="segment-body">
            <div className="segment-ring">
              {renderRingChart()}
            </div>
            <div className="segment-legend">
              <div className="legend-row">
                <span className="legend-dot" style={{ background: stageColors.deep }} />
                <span className="legend-text">深睡</span>
                <span className="legend-value">1小时19分钟</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot" style={{ background: stageColors.light }} />
                <span className="legend-text">浅睡</span>
                <span className="legend-value">5小时20分钟</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot" style={{ background: stageColors.rem }} />
                <span className="legend-text">快速眼动</span>
                <span className="legend-value">1小时28分钟</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="more-analysis-btn"
          onClick={() => setShowMoreAnalysis(!showMoreAnalysis)}
        >
          <span>更多分析</span>
          <span className={`arrow-icon ${showMoreAnalysis ? 'up' : 'down'}`}>▼</span>
        </div>

        {showMoreAnalysis && (
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">深睡比例</div>
              <div className="stat-value">16%</div>
              <span className="stat-tag stat-tag-warning">偏低</span>
            </div>
            <div className="stat-item">
              <div className="stat-label">浅睡比例</div>
              <div className="stat-value">66%</div>
              <span className="stat-tag stat-tag-warning">偏高</span>
            </div>
            <div className="stat-item">
              <div className="stat-label">快速眼动比例</div>
              <div className="stat-value">18%</div>
              <span className="stat-tag stat-tag-success">正常</span>
            </div>
            <div className="stat-item">
              <div className="stat-label">中途醒来次数</div>
              <div className="stat-value">0次</div>
              <span className="stat-tag stat-tag-success">正常</span>
            </div>
            <div className="stat-item">
              <div className="stat-label">中途醒来时长</div>
              <div className="stat-value">0分钟</div>
              <span className="stat-tag stat-tag-success">正常</span>
            </div>
            <div className="stat-item">
              <div className="stat-label">深睡连续性</div>
              <div className="stat-value">100分</div>
              <span className="stat-tag stat-tag-success">正常</span>
            </div>
            <div className="stat-item stat-item-full">
              <div className="stat-label">平均睡眠血氧</div>
              <div className="stat-value">96%</div>
            </div>
          </div>
        )}

        <div className="section-title">
          <span className="section-icon">🛏️</span>
          第2段睡眠（小睡）
        </div>

        <div className="segment-card nap-card">
          <div className="segment-header">
            <div className="segment-duration-wrap">
              <div className="segment-duration nap-duration">{renderValueWithUnits('1小时11分钟')}</div>
              <div className="segment-time">13:35-14:46</div>
            </div>
            <div className="segment-device">⌚</div>
          </div>
        </div>

        <p className="nap-note">
          说明：未超过3小时的睡眠，手机/手表无法进行科学计算，均统计为小睡。
        </p>

        <div className="page-bottom-space" />
      </div>
    );
  };

  const renderWeekView = () => {
    return (
      <div className="sleep-week-view">
        <div className="sleep-main-header">
          <div className="header-left">
            <div className="header-label-top">平均睡眠时长</div>
            <div className="header-value-row">{renderValueWithUnits('7小时47分钟')}</div>
            <div className="header-date-bottom">2026年6月20日至26日</div>
          </div>
        </div>

        <div className="week-chart-card">
          {renderWeekBars()}
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">平均睡眠分数</div>
            <div className="stat-value">83分</div>
            <div className="mini-chart-wrapper">
              {renderMiniLineChart(weekScoreData, '#5B5CFF')}
            </div>
            <div className="stat-date-range">6月20日-6月26日</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">平均卧床时长</div>
            <div className="stat-value">7小时38分钟</div>
            <div className="mini-chart-wrapper">
              {renderMiniBarChart(weekBedData, '#7B7CFF')}
            </div>
            <div className="stat-date-range">6月20日-6月26日</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">平均深睡时长</div>
            <div className="stat-value">1小时15分钟</div>
            <div className="mini-chart-wrapper">
              {renderMiniBarChart(weekDeepData, '#4A4AE0')}
            </div>
            <div className="stat-date-range">6月20日-6月26日</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">睡眠心率</div>
            <div className="stat-value">45-109<span className="stat-unit">次/分</span></div>
            <div className="mini-chart-wrapper">
              {renderMiniDotChart(weekHeartData, '#FF6B6B')}
            </div>
            <div className="stat-date-range">6月20日-6月26日</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">平均睡眠血氧</div>
            <div className="stat-value">97%</div>
            <div className="mini-chart-wrapper">
              {renderMiniLineChart(weekOxygenData, '#34D399')}
            </div>
            <div className="stat-date-range">6月20日-6月26日</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">平均入睡时长</div>
            <div className="stat-value stat-value-empty">无数据</div>
            <div className="mini-chart-empty" />
            <div className="stat-date-range">6月20日-6月26日</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">平均打鼾时长</div>
            <div className="stat-value stat-value-empty">无数据</div>
            <div className="mini-chart-empty" />
            <div className="stat-date-range">6月20日-6月26日</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">平均不规律打鼾时长</div>
            <div className="stat-value stat-value-empty">无数据</div>
            <div className="mini-chart-empty" />
            <div className="stat-date-range">6月20日-6月26日</div>
          </div>
        </div>

        <div className="page-bottom-space" />
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <div className="sleep-month-view">
        <div className="sleep-main-header">
          <div className="header-left">
            <div className="header-label-top">平均睡眠时长</div>
            <div className="header-value-row">{renderValueWithUnits('7小时41分钟')}</div>
            <div className="header-date-bottom">2026年5月27日至6月26日</div>
          </div>
        </div>

        <div className="month-chart-card">
          {renderMonthBars()}
          <div className="month-x-labels">
            <span>5月25日</span>
            <span>6月1日</span>
            <span>6月8日</span>
            <span>6月15日</span>
            <span>6月22日</span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">平均睡眠分数</div>
            <div className="stat-value">82分</div>
            <div className="mini-chart-wrapper">
              {renderMiniLineChart(weekScoreData, '#5B5CFF')}
            </div>
            <div className="stat-date-range">5月27日-6月26日</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">平均卧床时长</div>
            <div className="stat-value">7小时30分钟</div>
            <div className="mini-chart-wrapper">
              {renderMiniBarChart(weekBedData, '#7B7CFF')}
            </div>
            <div className="stat-date-range">5月27日-6月26日</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">平均深睡时长</div>
            <div className="stat-value">1小时17分钟</div>
            <div className="mini-chart-wrapper">
              {renderMiniBarChart(weekDeepData, '#4A4AE0')}
            </div>
            <div className="stat-date-range">5月27日-6月26日</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">睡眠心率</div>
            <div className="stat-value">45-114<span className="stat-unit">次/分</span></div>
            <div className="mini-chart-wrapper">
              {renderMiniDotChart(weekHeartData, '#FF6B6B')}
            </div>
            <div className="stat-date-range">5月27日-6月26日</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">平均睡眠血氧</div>
            <div className="stat-value">97%</div>
            <div className="mini-chart-wrapper">
              {renderMiniLineChart(weekOxygenData, '#34D399')}
            </div>
            <div className="stat-date-range">5月27日-6月26日</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">平均入睡时长</div>
            <div className="stat-value stat-value-empty">无数据</div>
            <div className="mini-chart-empty" />
            <div className="stat-date-range">5月27日-6月26日</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">平均打鼾时长</div>
            <div className="stat-value stat-value-empty">无数据</div>
            <div className="mini-chart-empty" />
            <div className="stat-date-range">5月27日-6月26日</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">平均不规律打鼾时长</div>
            <div className="stat-value stat-value-empty">无数据</div>
            <div className="mini-chart-empty" />
            <div className="stat-date-range">5月27日-6月26日</div>
          </div>
        </div>

        <div className="page-bottom-space" />
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="sleep-page">
        <div className="view-switcher">
          <button
            className={`view-btn ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => setViewMode('day')}
          >
            日
          </button>
          <button
            className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            周
          </button>
          <button
            className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            月
          </button>
        </div>

        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
      </div>
    </MainLayout>
  );
};

export default SleepPage;
