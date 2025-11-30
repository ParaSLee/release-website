import type { TimeLockPeriod } from "~types";

import { getCurrentTime, isTimeBetween } from "./time";

/**
 * 检查当前时间是否在任何时间锁定段内
 */
export function isInTimeLockPeriod(periods: TimeLockPeriod[], now?: Date): boolean {
  const currentTime = now ? now.toTimeString().slice(0, 5) : getCurrentTime();

  return periods.some((period) => {
    if (!period.enabled) return false;
    return isTimeBetween(period.startTime, period.endTime, currentTime);
  });
}

/**
 * 获取当前生效的时间锁定段
 */
export function getActiveTimeLockPeriod(periods: TimeLockPeriod[], now?: Date): TimeLockPeriod | null {
  const currentTime = now ? now.toTimeString().slice(0, 5) : getCurrentTime();

  return (
    periods.find((period) => {
      if (!period.enabled) return false;
      return isTimeBetween(period.startTime, period.endTime, currentTime);
    }) || null
  );
}

/**
 * 检查时间段是否跨午夜（例如: 22:00 - 06:00）
 */
export function isCrossMidnight(startTime: string, endTime: string): boolean {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  return startMinutes > endMinutes;
}

/**
 * 验证时间锁定段
 */
export function validateTimeLockPeriod(startTime: string, endTime: string): boolean {
  // 检查格式
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return false;
  }

  // 开始时间和结束时间可以相同或不同
  // 允许跨午夜
  return true;
}

/**
 * 获取时间锁定段的下一个解锁时间
 * 如果当前未被锁定则返回 null
 */
export function getNextUnlockTime(periods: TimeLockPeriod[], now?: Date): Date | null {
  const activePeriod = getActiveTimeLockPeriod(periods, now);
  if (!activePeriod) return null;

  const currentDate = now || new Date();
  const [endHour, endMinute] = activePeriod.endTime.split(":").map(Number);

  const unlockDate = new Date(currentDate);
  unlockDate.setHours(endHour, endMinute, 0, 0);

  // 如果结束时间早于当前时间，说明跨午夜
  // 所以解锁时间是明天
  if (unlockDate <= currentDate) {
    unlockDate.setDate(unlockDate.getDate() + 1);
  }

  return unlockDate;
}

/**
 * 格式化时间锁定段用于显示
 * @example
 * formatTimeLockPeriod({ startTime: "22:00", endTime: "06:00", ... })
 * => "22:00 - 06:00 (跨午夜)"
 */
export function formatTimeLockPeriod(period: TimeLockPeriod): string {
  const crossMidnight = isCrossMidnight(period.startTime, period.endTime);
  const base = `${period.startTime} - ${period.endTime}`;

  if (crossMidnight) {
    return `${base} (跨午夜)`;
  }

  return base;
}
