import { useState, useEffect, useCallback, useMemo } from 'react';
import type { HealthPlatform, HealthPlatformType, HealthPlatformState } from '../types/sleep';

const STORAGE_KEY = 'smart-alarm-health-platforms';

const DEFAULT_PLATFORMS: HealthPlatform[] = [
  {
    id: 'apple_health',
    name: '苹果健康',
    description: 'Apple Health',
    icon: '🍎',
    color: '#000000',
    authorized: true,
    lastSyncTime: new Date().toISOString(),
    dataTypes: ['心率', '睡眠分析', '血氧', '体动记录', '呼吸速率'],
  },
  {
    id: 'huawei_health',
    name: '华为运动健康',
    description: 'Huawei Health',
    icon: '💎',
    color: '#cf0a2c',
    authorized: false,
    lastSyncTime: null,
    dataTypes: ['心率', '睡眠监测', '血氧饱和度', '压力', '体温'],
  },
  {
    id: 'xiaomi_health',
    name: '小米运动健康',
    description: 'Mi Fitness',
    icon: '🧡',
    color: '#ff6700',
    authorized: false,
    lastSyncTime: null,
    dataTypes: ['心率', '睡眠', '血氧', '压力', '能量消耗'],
  },
  {
    id: 'oppo_health',
    name: 'OPPO健康',
    description: 'OPPO Health',
    icon: '💚',
    color: '#1db954',
    authorized: false,
    lastSyncTime: null,
    dataTypes: ['心率', '睡眠', '血氧', '体脂', '运动数据'],
  },
  {
    id: 'samsung_health',
    name: '三星健康',
    description: 'Samsung Health',
    icon: '💜',
    color: '#1428a0',
    authorized: false,
    lastSyncTime: null,
    dataTypes: ['心率', '睡眠', '血氧', '压力', '身体成分'],
  },
];

function loadPlatforms(): HealthPlatform[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return DEFAULT_PLATFORMS.map((p) => {
        const saved = parsed.find((s: HealthPlatform) => s.id === p.id);
        return saved ? { ...p, ...saved } : p;
      });
    }
  } catch (e) {
    console.error('Failed to load health platforms:', e);
  }
  return DEFAULT_PLATFORMS;
}

function savePlatforms(platforms: HealthPlatform[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(platforms));
  } catch (e) {
    console.error('Failed to save health platforms:', e);
  }
}

interface UseHealthPlatformsReturn extends HealthPlatformState {
  platforms: HealthPlatform[];
  authorizePlatform: (platformId: HealthPlatformType) => void;
  revokePlatform: (platformId: HealthPlatformType) => void;
  syncPlatform: (platformId: HealthPlatformType) => void;
  getPlatformById: (id: HealthPlatformType) => HealthPlatform | undefined;
  primaryPlatformData: HealthPlatform | null;
}

export function useHealthPlatforms(): UseHealthPlatformsReturn {
  const [platforms, setPlatforms] = useState<HealthPlatform[]>(() => loadPlatforms());

  useEffect(() => {
    savePlatforms(platforms);
  }, [platforms]);

  const isAnyAuthorized = useMemo(
    () => platforms.some((p) => p.authorized),
    [platforms]
  );

  const primaryPlatform = useMemo<HealthPlatformType | null>(() => {
    const authorized = platforms.filter((p) => p.authorized);
    if (authorized.length === 0) return null;
    authorized.sort((a, b) => {
      if (!a.lastSyncTime) return 1;
      if (!b.lastSyncTime) return -1;
      return new Date(b.lastSyncTime).getTime() - new Date(a.lastSyncTime).getTime();
    });
    return authorized[0].id;
  }, [platforms]);

  const primaryPlatformData = useMemo(() => {
    if (!primaryPlatform) return null;
    return platforms.find((p) => p.id === primaryPlatform) || null;
  }, [platforms, primaryPlatform]);

  const authorizePlatform = useCallback((platformId: HealthPlatformType) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === platformId
          ? {
              ...p,
              authorized: true,
              lastSyncTime: new Date().toISOString(),
            }
          : p
      )
    );
  }, []);

  const revokePlatform = useCallback((platformId: HealthPlatformType) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === platformId
          ? {
              ...p,
              authorized: false,
              lastSyncTime: null,
            }
          : p
      )
    );
  }, []);

  const syncPlatform = useCallback((platformId: HealthPlatformType) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === platformId && p.authorized
          ? {
              ...p,
              lastSyncTime: new Date().toISOString(),
            }
          : p
      )
    );
  }, []);

  const getPlatformById = useCallback(
    (id: HealthPlatformType) => platforms.find((p) => p.id === id),
    [platforms]
  );

  return {
    platforms,
    isAnyAuthorized,
    primaryPlatform,
    primaryPlatformData,
    authorizePlatform,
    revokePlatform,
    syncPlatform,
    getPlatformById,
  };
}
