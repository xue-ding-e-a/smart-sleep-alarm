import { useState, useEffect, useCallback } from 'react';
import type { SleepGoalSettings } from '../types/sleep';

const STORAGE_KEY = 'smart-alarm-sleep-goal';

const DEFAULT_SETTINGS: SleepGoalSettings = {
  targetDuration: 8,
  bedtimeReminder: true,
  reminderTime: '22:30',
};

function loadSettings(): SleepGoalSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load sleep goal settings:', e);
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: SleepGoalSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save sleep goal settings:', e);
  }
}

interface UseSleepGoalReturn {
  sleepGoal: SleepGoalSettings;
  updateSleepGoal: (updates: Partial<SleepGoalSettings>) => void;
  resetSleepGoal: () => void;
}

export function useSleepGoal(): UseSleepGoalReturn {
  const [sleepGoal, setSleepGoal] = useState<SleepGoalSettings>(() => loadSettings());

  useEffect(() => {
    saveSettings(sleepGoal);
  }, [sleepGoal]);

  const updateSleepGoal = useCallback((updates: Partial<SleepGoalSettings>) => {
    setSleepGoal((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetSleepGoal = useCallback(() => {
    setSleepGoal(DEFAULT_SETTINGS);
  }, []);

  return {
    sleepGoal,
    updateSleepGoal,
    resetSleepGoal,
  };
}
