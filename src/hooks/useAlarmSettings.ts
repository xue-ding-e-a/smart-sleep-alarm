import { useState, useEffect, useCallback } from 'react';
import type { AlarmSettings } from '../types/sleep';

const STORAGE_KEY = 'smart-alarm-settings';

const DEFAULT_SETTINGS: AlarmSettings = {
  enabled: true,
  earliestWakeTime: '07:00',
  latestWakeTime: '07:30',
  wakeWindowEnabled: false,
  targetSleepDuration: 8,
  volume: 70,
  snoozeDuration: 9,
  sound: 'gentle',
  vibration: true,
};

function loadSettings(): AlarmSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load alarm settings:', e);
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: AlarmSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save alarm settings:', e);
  }
}

interface UseAlarmSettingsReturn {
  settings: AlarmSettings;
  updateSettings: (updates: Partial<AlarmSettings>) => void;
  resetSettings: () => void;
  toggleEnabled: () => void;
}

export function useAlarmSettings(): UseAlarmSettingsReturn {
  const [settings, setSettings] = useState<AlarmSettings>(() => loadSettings());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AlarmSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const toggleEnabled = useCallback(() => {
    setSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    toggleEnabled,
  };
}
