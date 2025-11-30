import { useCallback } from "react";

import type { TimeLockPeriod, TimeLockSettings, UseTimeLockReturn } from "~types";

import { STORAGE_KEYS } from "../types";
import { generateUUID } from "../utils/helpers";
import { isInTimeLockPeriod as checkTimeLockPeriod } from "../utils/timeLock";
import { useStorage } from "./useStorage";

/**
 * 管理固定时间锁定设置的自定义 Hook
 */
export function useTimeLock(): UseTimeLockReturn {
  const defaultSettings: TimeLockSettings = {
    enabled: false,
    mode: "restricted",
    periods: [],
  };

  const { data: settings, update } = useStorage<TimeLockSettings>(
    STORAGE_KEYS.TIME_LOCK_SETTINGS,
    defaultSettings
  );

  // 更新固定时间锁定设置
  const updateSettings = useCallback(
    async (updates: Partial<TimeLockSettings>) => {
      const updatedSettings = { ...(settings || defaultSettings), ...updates };
      await update(updatedSettings);
    },
    [settings, update, defaultSettings]
  );

  // 添加新的时间锁定段
  const addPeriod = useCallback(
    async (period: Omit<TimeLockPeriod, "id">) => {
      const newPeriod: TimeLockPeriod = {
        ...period,
        id: generateUUID(),
      };

      const currentSettings = settings || defaultSettings;
      const updatedSettings = {
        ...currentSettings,
        periods: [...currentSettings.periods, newPeriod],
      };
      await update(updatedSettings);
    },
    [settings, update, defaultSettings]
  );

  // 删除时间锁定段
  const deletePeriod = useCallback(
    async (id: string) => {
      const currentSettings = settings || defaultSettings;
      const updatedSettings = {
        ...currentSettings,
        periods: currentSettings.periods.filter((period) => period.id !== id),
      };
      await update(updatedSettings);
    },
    [settings, update, defaultSettings]
  );

  // 检查当前时间是否在任何时间锁定段内
  const isInTimeLockPeriod = useCallback(
    (now?: Date): boolean => {
      const currentSettings = settings || defaultSettings;
      if (!currentSettings.enabled) return false;

      return checkTimeLockPeriod(currentSettings.periods, now);
    },
    [settings, defaultSettings]
  );

  return {
    settings: settings || defaultSettings,
    updateSettings,
    addPeriod,
    deletePeriod,
    isInTimeLockPeriod,
  };
}

