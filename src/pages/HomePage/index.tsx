import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/MainLayout';
import Card from '../../components/ui/Card';
import Switch from '../../components/ui/Switch';
import { useAlarmSettings } from '../../hooks/useAlarmSettings';
import { useHealthPlatforms } from '../../hooks/useHealthPlatforms';
import './style.css';

const SLEEP_TIPS = [
  '深度睡眠主要发生在夜间前半段，保持规律作息能有效提升深睡质量。',
  '睡前1小时避免使用电子设备，蓝光会抑制褪黑素分泌，影响入睡速度。',
  '理想的睡眠环境温度为18-22°C，稍低的室温有助于进入深度睡眠。',
  '每周进行150分钟中等强度运动，可显著改善睡眠质量和时长。',
  '午睡时间控制在20-30分钟最佳，过长会影响夜间睡眠质量。',
  '睡前可以尝试4-7-8呼吸法：吸气4秒，屏息7秒，呼气8秒，帮助快速放松。',
];

const DURATION_OPTIONS = [25 / 60, 6, 7.5, 8, 9];

const formatDurationLabel = (hours: number) => {
  if (hours < 1) {
    const mins = Math.round(hours * 60);
    return `${mins}min`;
  }
  return `${hours}h`;
};

const renderSleepDurationValue = (hours: number) => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return (
    <>
      <span className="header-value-num">{wholeHours}</span>
      <span className="header-value-unit">小时</span>
      {minutes > 0 && (
        <>
          <span className="header-value-num">{minutes}</span>
          <span className="header-value-unit">分钟</span>
        </>
      )}
    </>
  );
};

const getGreeting = (hour: number): string => {
  if (hour >= 0 && hour < 6) return '夜深了';
  if (hour >= 6 && hour < 12) return '早上好';
  if (hour >= 12 && hour < 18) return '下午好';
  return '晚上好';
};

const formatDate = (date: Date): string => {
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekDay = weekDays[date.getDay()];
  return `${month}月${day}日 ${weekDay}`;
};

const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const HomePage = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, toggleEnabled } = useAlarmSettings();
  const { isAnyAuthorized, primaryPlatformData } = useHealthPlatforms();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % SLEEP_TIPS.length);
    }, 10000);
    return () => clearInterval(tipTimer);
  }, []);

  const greeting = getGreeting(currentTime.getHours());
  const dateStr = formatDate(currentTime);
  const timeStr = formatTime(currentTime);

  const handleEarliestTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ earliestWakeTime: e.target.value });
  };

  const handleLatestTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ latestWakeTime: e.target.value });
  };

  const handleDurationSelect = (duration: number) => {
    updateSettings({ targetSleepDuration: duration });
  };

  const getTargetWakeTime = () => {
    const now = new Date();
    const durationMs = settings.targetSleepDuration * 60 * 60 * 1000;
    const wakeDate = new Date(now.getTime() + durationMs);
    const hours = wakeDate.getHours().toString().padStart(2, '0');
    const minutes = wakeDate.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const renderWakeTimeDisplay = () => {
    if (settings.wakeWindowEnabled) {
      return `${settings.earliestWakeTime} - ${settings.latestWakeTime}`;
    }
    return getTargetWakeTime();
  };

  const customHours = Math.floor(settings.targetSleepDuration);
  const customMinutes = Math.round((settings.targetSleepDuration - customHours) * 60);

  const handleHoursChange = (delta: number) => {
    const newHours = customHours + delta;
    if (newHours >= 3 && newHours <= 12) {
      const newDuration = newHours + customMinutes / 60;
      updateSettings({ targetSleepDuration: newDuration });
    }
  };

  const handleMinutesChange = (delta: number) => {
    let newMinutes = customMinutes + delta;
    let newHours = customHours;
    if (newMinutes < 0) {
      newMinutes = 59;
      newHours -= 1;
    } else if (newMinutes > 59) {
      newMinutes = 0;
      newHours += 1;
    }
    const newDuration = newHours + newMinutes / 60;
    if (newDuration >= 3 && newDuration <= 12) {
      updateSettings({ targetSleepDuration: newDuration });
    }
  };

  const handleHoursInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    let newHours = Math.max(3, Math.min(12, val));
    let newMinutes = customMinutes;
    if (newHours === 12 && customMinutes > 0) {
      newMinutes = 0;
    }
    const newDuration = newHours + newMinutes / 60;
    updateSettings({ targetSleepDuration: newDuration });
  };

  const handleMinutesInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    let newMinutes = Math.max(0, Math.min(59, val));
    let newHours = customHours;
    const newDuration = newHours + newMinutes / 60;
    if (newDuration < 3) {
      newHours = 3;
      newMinutes = 0;
    } else if (newDuration > 12) {
      newHours = 12;
      newMinutes = 0;
    }
    updateSettings({ targetSleepDuration: newHours + newMinutes / 60 });
  };

  const handleViewSleep = () => {
    navigate('/sleep');
  };

  return (
    <MainLayout>
      <div className="home-page">
        <div className="home-greeting">
          <div className="home-greeting-text">
            <h1 className="home-greeting-title">{greeting} 👋</h1>
            <p className="home-greeting-date">
              {dateStr} <span className="home-greeting-time">{timeStr}</span>
            </p>
          </div>
          <div className={`home-connection-status ${isAnyAuthorized ? '' : 'disconnected'}`}>
            <span className={`home-connection-dot ${isAnyAuthorized ? '' : 'disconnected'}`} />
            <span className="home-connection-text">
              {isAnyAuthorized ? `${primaryPlatformData?.icon} ${primaryPlatformData?.name}` : '未授权'}
            </span>
          </div>
        </div>

        <Card className="home-sleep-overview-card" onClick={handleViewSleep}>
          <div className="sleep-overview-header">
            <div className="sleep-overview-icon">🌙</div>
            <div className="sleep-overview-info">
              <div className="sleep-overview-title">今晚睡眠</div>
              <div className="sleep-overview-desc">佩戴手表，自动监测</div>
            </div>
          </div>
          <div className="sleep-overview-status">
            <div className="status-indicator active"></div>
            <span className="status-text">持续监测中</span>
          </div>
          <div className="sleep-overview-hint">
            睡眠数据由 {isAnyAuthorized ? primaryPlatformData?.name : '健康平台'} 自动同步，无需手动操作
          </div>
        </Card>

        <Card className="home-alarm-card">
          <div className="home-alarm-header">
            <div className="home-alarm-info">
              <span className="home-alarm-label">下次唤醒</span>
              <span className="home-alarm-time">
                {renderWakeTimeDisplay()}
              </span>
            </div>
            <Switch checked={settings.enabled} onChange={toggleEnabled} />
          </div>
          <div className="home-alarm-desc">
            {settings.enabled
              ? '智能唤醒 · 将在浅睡眠阶段轻柔唤醒你'
              : '闹钟已关闭，点击开启智能唤醒'}
          </div>

          <div className="home-alarm-details expanded">
            <div className="home-sleep-target-section">
              <div className="home-sleep-target-header">
                <div className="home-section-title home-sleep-target-title">目标睡眠时长</div>
                <div className="home-sleep-target-value">
                  {renderSleepDurationValue(settings.targetSleepDuration)}
                </div>
              </div>

              <div className="home-tip-box home-sleep-tip">
                <span className="home-tip-icon">💡</span>
                <span className="home-tip-text">建议以一个半小时为一个睡眠周期设置目标睡眠时长</span>
              </div>

              <div className="home-duration-options">
                {DURATION_OPTIONS.map((duration) => (
                  <button
                    key={duration}
                    className={`home-duration-option ${settings.targetSleepDuration === duration ? 'active' : ''}`}
                    onClick={() => handleDurationSelect(duration)}
                  >
                    {formatDurationLabel(duration)}
                  </button>
                ))}
              </div>

              <div className="home-custom-duration">
                <div className="home-custom-duration-label">自定义时长</div>
                <div className="home-custom-duration-stepper">
                  <div className="home-stepper-item">
                    <button
                      className="home-stepper-btn"
                      onClick={() => handleHoursChange(-1)}
                      disabled={customHours <= 3 && customMinutes === 0}
                    >
                      −
                    </button>
                    <div className="home-stepper-value">
                      <input
                        type="text"
                        className="home-stepper-input"
                        value={customHours}
                        onChange={handleHoursInput}
                        inputMode="numeric"
                      />
                      <span className="home-stepper-unit">小时</span>
                    </div>
                    <button
                      className="home-stepper-btn"
                      onClick={() => handleHoursChange(1)}
                      disabled={customHours >= 12}
                    >
                      +
                    </button>
                  </div>
                  <div className="home-stepper-item">
                    <button
                      className="home-stepper-btn"
                      onClick={() => handleMinutesChange(-1)}
                      disabled={customHours <= 3 && customMinutes === 0}
                    >
                      −
                    </button>
                    <div className="home-stepper-value">
                      <input
                        type="text"
                        className="home-stepper-input"
                        value={customMinutes.toString().padStart(2, '0')}
                        onChange={handleMinutesInput}
                        inputMode="numeric"
                      />
                      <span className="home-stepper-unit">分钟</span>
                    </div>
                    <button
                      className="home-stepper-btn"
                      onClick={() => handleMinutesChange(1)}
                      disabled={customHours >= 12 && customMinutes >= 59}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="home-wake-window-section">
              <div className="home-wake-window-header">
                <div className="home-section-title home-wake-window-title">唤醒时间窗口</div>
                <Switch 
                  checked={settings.wakeWindowEnabled} 
                  onChange={(checked) => updateSettings({ wakeWindowEnabled: checked })} 
                />
              </div>
              {settings.wakeWindowEnabled && (
                <div className="home-time-picker-row">
                  <div className="home-time-picker-item">
                    <label className="home-time-picker-label">最早唤醒时间</label>
                    <div className="home-time-picker-input">
                      <input
                        type="time"
                        value={settings.earliestWakeTime}
                        onChange={handleEarliestTimeChange}
                      />
                    </div>
                  </div>
                  <div className="home-time-picker-item">
                    <label className="home-time-picker-label">最晚唤醒时间</label>
                    <div className="home-time-picker-input">
                      <input
                        type="time"
                        value={settings.latestWakeTime}
                        onChange={handleLatestTimeChange}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="home-tips-card">
          <div className="home-tips-header">
            <span className="home-tips-icon">📚</span>
            <span className="home-tips-title">睡眠小贴士</span>
          </div>
          <p className="home-tips-content">{SLEEP_TIPS[tipIndex]}</p>
        </Card>

        <Card className="home-data-source-card">
          <div className="data-source-header">
            <span className="data-source-icon">🔗</span>
            <span className="data-source-title">健康数据来源</span>
          </div>
          <p className="data-source-desc">
            通过授权连接原厂健康平台获取睡眠数据，本应用不直接连接手表，
            专注于 AI 智能分析与最佳唤醒时机计算。
          </p>
          {isAnyAuthorized && primaryPlatformData && (
            <div className="data-source-platform">
              <span className="platform-badge">
                {primaryPlatformData.icon} {primaryPlatformData.name}
              </span>
              <span className="platform-status">已授权 · 实时同步</span>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default HomePage;
