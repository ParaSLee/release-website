import { useCallback } from "react";

import type { UseUsageDataReturn, UsageData } from "~types";

import { STORAGE_KEYS } from "../types";
import { formatDate } from "../utils/time";
import { useStorage } from "./useStorage";

/**
 * 管理使用数据的自定义 Hook
 */
export function useUsageData(): UseUsageDataReturn {
  const { data: usageData, update, refresh } = useStorage<UsageData[]>(
    STORAGE_KEYS.USAGE_DATA,
    []
  );

  // 获取指定域名今日的使用数据
  const todayUsage = useCallback(
    (domain: string): UsageData | null => {
      const today = formatDate(new Date());
      return (
        (usageData || []).find((data) => data.domain === domain && data.date === today) || null
      );
    },
    [usageData]
  );

  // 获取指定域名的每周统计
  const weeklyStats = useCallback(
    (domain: string): number => {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      return (usageData || [])
        .filter((data) => {
          if (data.domain !== domain) return false;
          const dataTime = new Date(data.date).getTime();
          return dataTime >= weekAgo;
        })
        .reduce((total, data) => total + data.usedTime, 0);
    },
    [usageData]
  );

  // 手动刷新使用数据
  const refreshUsage = useCallback(async () => {
    await refresh();
  }, [refresh]);

  return {
    usageData: usageData || [],
    todayUsage,
    weeklyStats,
    refreshUsage,
  };
}

/**
 * 获取或创建今日使用数据的辅助函数
 */
export async function getOrCreateTodayUsage(domain: string): Promise<UsageData> {
  const today = formatDate(new Date());
  const result = await chrome.storage.local.get(STORAGE_KEYS.USAGE_DATA);
  const usageData: UsageData[] = result[STORAGE_KEYS.USAGE_DATA] || [];

  let todayData = usageData.find((data) => data.domain === domain && data.date === today);

  if (!todayData) {
    todayData = {
      domain,
      date: today,
      usedTime: 0,
      lastUpdate: Date.now(),
      status: "active",
      emergencyUsedToday: 0,
      restarted: false,
      timeLockDisabled: false,
    };
    usageData.push(todayData);
    await chrome.storage.local.set({ [STORAGE_KEYS.USAGE_DATA]: usageData });
  }

  return todayData;
}

/**
 * 更新使用数据的辅助函数
 */
export async function updateUsageData(domain: string, updates: Partial<UsageData>): Promise<void> {
  const today = formatDate(new Date());
  const result = await chrome.storage.local.get(STORAGE_KEYS.USAGE_DATA);
  const usageData: UsageData[] = result[STORAGE_KEYS.USAGE_DATA] || [];

  const index = usageData.findIndex((data) => data.domain === domain && data.date === today);

  if (index !== -1) {
    usageData[index] = { ...usageData[index], ...updates, lastUpdate: Date.now() };
  } else {
    // 如果未找到，创建新条目
    const newData: UsageData = {
      domain,
      date: today,
      usedTime: 0,
      lastUpdate: Date.now(),
      status: "active",
      emergencyUsedToday: 0,
      restarted: false,
      timeLockDisabled: false,
      ...updates,
    };
    usageData.push(newData);
  }

  await chrome.storage.local.set({ [STORAGE_KEYS.USAGE_DATA]: usageData });
}

