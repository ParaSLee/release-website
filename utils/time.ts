import dayjs from "dayjs";

import { padZero } from "./helpers";

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return dayjs(date).format("YYYY-MM-DD");
}

/**
 * 格式化时间为 HH:mm
 */
export function formatTime(date: Date): string {
  return dayjs(date).format("HH:mm");
}

/**
 * 将秒数格式化为人类可读的字符串
 * @example
 * formatDuration(65) => "1分5秒"
 * formatDuration(3665) => "1小时1分5秒"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}小时`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}分`);
  }
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}秒`);
  }

  return parts.join("");
}

/**
 * 将秒数格式化为 HH:MM:SS
 */
export function formatDurationToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
  }
  return `${padZero(minutes)}:${padZero(secs)}`;
}

/**
 * 将秒数格式化为 MM:SS
 */
export function formatDurationShort(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${padZero(minutes)}:${padZero(secs)}`;
}

/**
 * 解析时间字符串 (HH:mm) 为对象
 */
export function parseTime(timeString: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeString.split(":").map(Number);
  return { hours, minutes };
}

/**
 * 比较两个时间字符串 (HH:mm)
 * 返回: -1 如果 time1 < time2, 0 如果相等, 1 如果 time1 > time2
 */
export function compareTime(time1: string, time2: string): number {
  const t1 = parseTime(time1);
  const t2 = parseTime(time2);

  const minutes1 = t1.hours * 60 + t1.minutes;
  const minutes2 = t2.hours * 60 + t2.minutes;

  if (minutes1 < minutes2) return -1;
  if (minutes1 > minutes2) return 1;
  return 0;
}

/**
 * 检查时间是否在开始和结束时间之间（支持跨午夜）
 * @example
 * isTimeBetween("23:00", "01:00", "00:30") => true (跨午夜)
 * isTimeBetween("09:00", "17:00", "12:00") => true (正常)
 */
export function isTimeBetween(startTime: string, endTime: string, checkTime: string): boolean {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  const check = parseTime(checkTime);

  const startMinutes = start.hours * 60 + start.minutes;
  const endMinutes = end.hours * 60 + end.minutes;
  const checkMinutes = check.hours * 60 + check.minutes;

  // 处理跨午夜的情况（例如: 22:00 - 06:00）
  if (startMinutes > endMinutes) {
    return checkMinutes >= startMinutes || checkMinutes <= endMinutes;
  }

  // 正常情况（例如: 09:00 - 17:00）
  return checkMinutes >= startMinutes && checkMinutes <= endMinutes;
}

/**
 * 获取当前时间为 HH:mm 字符串
 */
export function getCurrentTime(): string {
  return formatTime(new Date());
}

/**
 * 获取今天的日期为 YYYY-MM-DD 字符串
 */
export function getToday(): string {
  return formatDate(new Date());
}

/**
 * 检查日期是否是今天
 */
export function isToday(dateString: string): boolean {
  return dateString === getToday();
}

/**
 * 获取一天开始的时间戳
 */
export function getStartOfDay(date: Date = new Date()): number {
  return dayjs(date).startOf("day").valueOf();
}

/**
 * 获取一天结束的时间戳
 */
export function getEndOfDay(date: Date = new Date()): number {
  return dayjs(date).endOf("day").valueOf();
}

/**
 * 计算距离今天特定时间的剩余时间
 * 返回秒数，如果时间已过则返回 null
 */
export function getRemainingTimeUntil(targetTime: string): number | null {
  const now = new Date();
  const target = parseTime(targetTime);

  const targetDate = new Date(now);
  targetDate.setHours(target.hours, target.minutes, 0, 0);

  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) return null;

  return Math.floor(diff / 1000);
}

/**
 * 给日期增加秒数
 */
export function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}

/**
 * 获取两个日期之间的天数
 */
export function getDaysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
