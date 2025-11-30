import type { UsageData, WebsiteStatus } from "~types";

import { updateUsageData } from "../hooks/useUsageData";

/**
 * 状态转换规则
 * Active -> Pending: 达到时间限制或进入时间锁定段
 * Pending -> Locked: 30秒倒计时结束或用户点击锁定按钮
 * Pending -> Active: 用户点击紧急使用按钮
 * Locked -> Active: 用户完成重启流程
 */

/**
 * 从 Active 转换到 Pending
 */
export async function transitionToPending(domain: string, reason: "time_limit" | "time_lock"): Promise<void> {
  await updateUsageData(domain, {
    status: "pending",
    pendingStartTime: Date.now(),
  });

  console.log(`[状态管理] ${domain}: Active -> Pending (原因: ${reason === "time_limit" ? "时间限制" : "时间锁定"})`);
}

/**
 * 从 Pending 转换到 Locked
 */
export async function transitionToLocked(domain: string): Promise<void> {
  await updateUsageData(domain, {
    status: "locked",
    pendingStartTime: undefined,
  });

  console.log(`[状态管理] ${domain}: Pending -> Locked`);
}

/**
 * 从 Pending 转换到 Active（紧急使用）
 */
export async function transitionToActiveFromPending(domain: string, extraTime: number): Promise<void> {
  const result = await chrome.storage.local.get("usageData");
  const usageData: UsageData[] = result.usageData || [];
  
  const todayData = usageData.find((data) => data.domain === domain);
  if (!todayData) return;

  // 从已使用时间中减去额外时间（相当于增加时间）
  const newUsedTime = Math.max(0, todayData.usedTime - extraTime);

  await updateUsageData(domain, {
    status: "active",
    pendingStartTime: undefined,
    usedTime: newUsedTime,
    emergencyUsedToday: todayData.emergencyUsedToday + 1,
  });

  console.log(`[状态管理] ${domain}: Pending -> Active (紧急使用, +${extraTime}秒)`);
}

/**
 * 从 Locked 转换到 Active（重启）
 */
export async function transitionToActiveFromLocked(
  domain: string,
  type: "normal" | "emergency"
): Promise<void> {
  await updateUsageData(domain, {
    status: "active",
    usedTime: 0,
    startTime: undefined,
    pendingStartTime: undefined,
    restarted: true,
    restartedAt: Date.now(),
    // 如果在时间锁定期间重启，则禁用该域名的时间锁定
    timeLockDisabled: true,
  });

  console.log(`[状态管理] ${domain}: Locked -> Active (重启类型: ${type === "normal" ? "普通" : "紧急"})`);
}

/**
 * 重置每日数据
 */
export async function resetDailyData(): Promise<void> {
  const result = await chrome.storage.local.get(["usageData", "globalSettings"]);
  const usageData: UsageData[] = result.usageData || [];
  const globalSettings = result.globalSettings || {};

  // 重置所有使用数据
  const resetData = usageData.map((data) => ({
    ...data,
    usedTime: 0,
    status: "active" as WebsiteStatus,
    startTime: undefined,
    activeTabId: undefined,
    pendingStartTime: undefined,
    emergencyUsedToday: 0,
    restarted: false,
    restartedAt: undefined,
    timeLockDisabled: false,
  }));

  // 重置全局紧急重启
  const resetGlobalSettings = {
    ...globalSettings,
    emergencyRestartUsedToday: false,
  };

  await chrome.storage.local.set({
    usageData: resetData,
    globalSettings: resetGlobalSettings,
  });

  console.log("[状态管理] 每日数据重置完成");
}

/**
 * 检查状态转换是否有效
 */
export function isValidTransition(from: WebsiteStatus, to: WebsiteStatus): boolean {
  const validTransitions: Record<WebsiteStatus, WebsiteStatus[]> = {
    active: ["pending"],
    pending: ["locked", "active"],
    locked: ["active"],
  };

  return validTransitions[from]?.includes(to) || false;
}

/**
 * 获取网站的当前状态
 */
export async function getCurrentState(domain: string): Promise<WebsiteStatus> {
  const result = await chrome.storage.local.get("usageData");
  const usageData: UsageData[] = result.usageData || [];
  
  const todayData = usageData.find((data) => data.domain === domain);
  return todayData?.status || "active";
}
