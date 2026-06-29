import { useState } from 'react';
import MainLayout from '../../components/MainLayout';
import Card from '../../components/ui/Card';
import Switch from '../../components/ui/Switch';
import Button from '../../components/ui/Button';
import { useAuth } from '../../store/AuthContext';
import { useTheme } from '../../store/ThemeContext';
import { useAlarmSettings } from '../../hooks/useAlarmSettings';
import { useSleepGoal } from '../../hooks/useSleepGoal';
import type { AlarmSound } from '../../types/sleep';
import './style.css';

const SNOOZE_OPTIONS = [5, 9, 15];
const SOUND_OPTIONS: { value: AlarmSound; label: string; icon: string }[] = [
  { value: 'gentle', label: '轻柔唤醒', icon: '🎵' },
  { value: 'birds', label: '晨曦鸟鸣', icon: '🐦' },
  { value: 'classic', label: '经典闹钟', icon: '⏰' },
  { value: 'ocean', label: '海浪声', icon: '🌊' },
];

const getInitial = (name: string): string => {
  return name ? name.charAt(0).toUpperCase() : '?';
};

const formatDaysSince = (dateStr: string): number => {
  const created = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
};

const formatJoinDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${date.getFullYear()}年${month}月${day}日`;
};

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { toggleTheme } = useTheme();
  const { settings: alarmSettings, updateSettings: updateAlarmSettings } = useAlarmSettings();
  const { sleepGoal, updateSleepGoal } = useSleepGoal();
  const [editingProfile, setEditingProfile] = useState(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAlarmSettings({ volume: parseInt(e.target.value, 10) });
  };

  const handleSnoozeSelect = (duration: number) => {
    updateAlarmSettings({ snoozeDuration: duration });
  };

  const handleSoundSelect = (sound: AlarmSound) => {
    updateAlarmSettings({ sound });
  };

  const handleVibrationToggle = (checked: boolean) => {
    updateAlarmSettings({ vibration: checked });
  };

  const handleBedtimeReminderToggle = (checked: boolean) => {
    updateSleepGoal({ bedtimeReminder: checked });
  };

  const handleReminderTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSleepGoal({ reminderTime: e.target.value });
  };

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      logout();
    }
  };

  const menuItems = [
    { icon: '🔒', label: '数据与隐私', desc: '管理您的数据和隐私设置' },
    { icon: '🔔', label: '通知设置', desc: '管理各类通知提醒' },
    { icon: '💬', label: '帮助与反馈', desc: '获取帮助或提交反馈' },
    { icon: 'ℹ️', label: '关于我们', desc: '版本信息和关于产品' },
  ];

  return (
    <MainLayout>
      <div className="profile-page">
        <div className="profile-header">
          <div className="profile-header-row">
            <h1 className="profile-title">我的</h1>
            <button className="top-bar-btn" aria-label="设置" onClick={toggleTheme}>
              <span className="settings-icon">⚙</span>
            </button>
          </div>
          <p className="profile-subtitle">管理您的设置和数据授权</p>
        </div>

        <Card className="profile-user-card">
          <div className="profile-user-info">
            <div className="profile-avatar">
              {getInitial(user?.username || '睡眠达人')}
            </div>
            <div className="profile-user-details">
              <div className="profile-username">{user?.username || '睡眠达人'}</div>
              <div className="profile-email">{user?.email || '未绑定邮箱'}</div>
              <div className="profile-join-date">
                加入于 {user?.createdAt ? formatJoinDate(user.createdAt) : '2024年1月1日'}
                <span className="profile-days">
                  · 使用 {user?.createdAt ? formatDaysSince(user.createdAt) : 15} 天
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="profile-edit-btn"
            onClick={() => setEditingProfile(!editingProfile)}
          >
            编辑资料
          </Button>
        </Card>

        <div className="profile-section">
          <h2 className="profile-section-title">健康数据来源</h2>
          <Card className="profile-health-intro-card">
            <div className="health-intro-icon">🔗</div>
            <div className="health-intro-content">
              <div className="health-intro-title">关于数据来源</div>
              <div className="health-intro-desc">
                本应用通过授权连接原厂健康平台获取您的睡眠数据，不直接连接智能手表。
                您需要在对应品牌的健康 App 中已连接手表并开启睡眠监测。
              </div>
            </div>
          </Card>
        </div>

        <div className="profile-section">
          <h2 className="profile-section-title">闹钟设置</h2>
          <Card className="profile-settings-card" style={{ padding: 0 }}>
            <div className="profile-setting-item">
              <div className="profile-setting-info">
                <div className="profile-setting-label">闹钟音量</div>
                <div className="profile-setting-desc">调节闹钟响铃时的音量大小</div>
              </div>
              <div className="profile-volume-control">
                <span className="profile-volume-value">{alarmSettings.volume}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={alarmSettings.volume}
                  onChange={handleVolumeChange}
                  className="profile-volume-slider"
                />
              </div>
            </div>

            <div className="profile-setting-divider" />

            <div className="profile-setting-item">
              <div className="profile-setting-info">
                <div className="profile-setting-label">贪睡时长</div>
                <div className="profile-setting-desc">选择贪睡间隔时间</div>
              </div>
            </div>
            <div className="profile-snooze-options">
              {SNOOZE_OPTIONS.map((duration) => (
                <button
                  key={duration}
                  className={`profile-snooze-option ${alarmSettings.snoozeDuration === duration ? 'active' : ''}`}
                  onClick={() => handleSnoozeSelect(duration)}
                >
                  {duration}分钟
                </button>
              ))}
            </div>

            <div className="profile-setting-divider" />

            <div className="profile-setting-item">
              <div className="profile-setting-info">
                <div className="profile-setting-label">闹铃音效</div>
                <div className="profile-setting-desc">选择您喜欢的唤醒铃声</div>
              </div>
            </div>
            <div className="profile-sound-options">
              {SOUND_OPTIONS.map((sound) => (
                <button
                  key={sound.value}
                  className={`profile-sound-option ${alarmSettings.sound === sound.value ? 'active' : ''}`}
                  onClick={() => handleSoundSelect(sound.value)}
                >
                  <span className="profile-sound-icon">{sound.icon}</span>
                  <span className="profile-sound-label">{sound.label}</span>
                </button>
              ))}
            </div>

            <div className="profile-setting-divider" />

            <div className="profile-setting-item">
              <div className="profile-setting-info">
                <div className="profile-setting-label">振动提醒</div>
                <div className="profile-setting-desc">闹钟响铃时同时振动</div>
              </div>
              <Switch
                checked={alarmSettings.vibration}
                onChange={handleVibrationToggle}
              />
            </div>
          </Card>
        </div>

        <div className="profile-section">
          <h2 className="profile-section-title">就寝提醒</h2>
          <Card className="profile-settings-card" style={{ padding: 0 }}>
            <div className="profile-setting-item">
              <div className="profile-setting-info">
                <div className="profile-setting-label">就寝提醒</div>
                <div className="profile-setting-desc">在设定的就寝时间前提醒您</div>
              </div>
              <Switch
                checked={sleepGoal.bedtimeReminder}
                onChange={handleBedtimeReminderToggle}
              />
            </div>

            {sleepGoal.bedtimeReminder && (
              <>
                <div className="profile-setting-divider" />
                <div className="profile-setting-item">
                  <div className="profile-setting-info">
                    <div className="profile-setting-label">提醒时间</div>
                    <div className="profile-setting-desc">设置就寝提醒的时间</div>
                  </div>
                  <div className="profile-time-input-wrapper">
                    <input
                      type="time"
                      value={sleepGoal.reminderTime}
                      onChange={handleReminderTimeChange}
                      className="profile-time-input"
                    />
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>

        <div className="profile-section">
          <h2 className="profile-section-title">更多</h2>
          <Card className="profile-menu-card" style={{ padding: 0 }}>
            {menuItems.map((item, index) => (
              <div
                key={item.label}
                className="profile-menu-item"
                style={{ borderBottom: index < menuItems.length - 1 ? '1px solid var(--card-border)' : 'none' }}
              >
                <span className="profile-menu-icon">{item.icon}</span>
                <div className="profile-menu-content">
                  <div className="profile-menu-label">{item.label}</div>
                  <div className="profile-menu-desc">{item.desc}</div>
                </div>
                <span className="profile-menu-arrow">›</span>
              </div>
            ))}
          </Card>
        </div>

        <div className="profile-section">
          <Card className="profile-logout-card" style={{ padding: 0 }}>
            <button className="profile-logout-btn" onClick={handleLogout}>
              <span className="profile-logout-icon">🚪</span>
              <span className="profile-logout-text">退出登录</span>
            </button>
          </Card>
        </div>

        <div className="profile-footer">
          <span className="profile-version">版本 v1.0.0</span>
        </div>

        <div className="profile-bottom-spacer" />
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
