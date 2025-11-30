/**
 * Background Service Worker
 * 负责核心时间管理、状态转换、Tab监听和消息通信
 */

import { DEFAULTS, STORAGE_KEYS } from "~types";
import type { GlobalSettings, TimeLockSettings, UsageData, WebsiteConfig } from "~types";

import { extractDomain, matchesDomain } from "../utils/domain";
import { getOrCreateTodayUsage, updateUsageData } from "../hooks/useUsageData";
import {
  getCurrentState,
  resetDailyData,
  transitionToActiveFromLocked,
  transitionToActiveFromPending,
  transitionToLocked,
  transitionToPending,
} from "../utils/stateManager";
import { formatDate, getCurrentTime } from "../utils/time";
import { isInTimeLockPeriod } from "../utils/timeLock";

// ============================================================================
// 全局状态
// ============================================================================

interface ActiveTimer {
  domain: string;
  tabId: number;
  startTime: number;
  intervalId: NodeJS.Timeout;
}

// 当前活跃的计时器
let activeTimers: Map<string, ActiveTimer> = new Map();

// ============================================================================
// 初始化
// ============================================================================

/**
 * 插件安装时的初始化
 */
chrome.runtime.onInstalled.addListener(async () => {
  console.log("[Background] 插件已安装，正在初始化...");

  // 初始化默认设置
  const result = await chrome.storage.local.get([
    STORAGE_KEYS.WEBSITES,
    STORAGE_KEYS.GLOBAL_SETTINGS,
    STORAGE_KEYS.TIME_LOCK_SETTINGS,
  ]);

  // 初始化网站列表（如果为空）
  if (!result[STORAGE_KEYS.WEBSITES]) {
    await chrome.storage.local.set({ [STORAGE_KEYS.WEBSITES]: [] });
  }

  // 初始化全局设置（如果为空）
  if (!result[STORAGE_KEYS.GLOBAL_SETTINGS]) {
    const defaultGlobalSettings: GlobalSettings = {
      resetTime: DEFAULTS.RESET_TIME,
      floatingPosition: DEFAULTS.FLOATING_POSITION,
      isCollapsed: DEFAULTS.IS_COLLAPSED,
      emergencyExtraTime: DEFAULTS.EMERGENCY_EXTRA_TIME,
      pendingLockDuration: DEFAULTS.PENDING_LOCK_DURATION,
      emergencyRestartUsedToday: false,
      emergencyRestartUsedDate: formatDate(new Date()),
    };
    await chrome.storage.local.set({ [STORAGE_KEYS.GLOBAL_SETTINGS]: defaultGlobalSettings });
  }

  // 初始化时间锁定设置（如果为空）
  if (!result[STORAGE_KEYS.TIME_LOCK_SETTINGS]) {
    const defaultTimeLockSettings: TimeLockSettings = {
      enabled: false,
      mode: "restricted",
      periods: [],
    };
    await chrome.storage.local.set({
      [STORAGE_KEYS.TIME_LOCK_SETTINGS]: defaultTimeLockSettings,
    });
  }

  // 设置每日重置alarm
  await setupDailyResetAlarm();

  console.log("[Background] 初始化完成");
});

/**
 * Service Worker启动时恢复状态
 */
chrome.runtime.onStartup.addListener(() => {
  console.log("[Background] Service Worker 已启动");
  setupDailyResetAlarm();
});

// ============================================================================
// Tab 监听
// ============================================================================

/**
 * 监听Tab激活事件
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  console.log(`[Background] Tab激活: ${activeInfo.tabId}`);

  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      await handleTabChange(tab.url, activeInfo.tabId);
    }
  } catch (error) {
    console.error("[Background] 获取Tab信息失败:", error);
  }
});

/**
 * 监听Tab更新事件（URL变化）
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // 只在URL变化时处理
  if (changeInfo.url && tab.active) {
    console.log(`[Background] Tab URL更新: ${tabId} -> ${changeInfo.url}`);
    await handleTabChange(changeInfo.url, tabId);
  }
});

/**
 * 监听Tab关闭事件
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log(`[Background] Tab关闭: ${tabId}`);
  stopTimerForTab(tabId);
});

/**
 * 监听窗口焦点变化
 */
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // 浏览器失去焦点，停止所有计时
    console.log("[Background] 浏览器失去焦点，暂停所有计时");
    stopAllTimers();
  } else {
    // 浏览器获得焦点，恢复活跃Tab的计时
    console.log("[Background] 浏览器获得焦点，恢复计时");
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab && activeTab.url) {
      await handleTabChange(activeTab.url, activeTab.id!);
    }
  }
});

// ============================================================================
// 核心计时逻辑
// ============================================================================

/**
 * 处理Tab变化（切换或URL变化）
 */
async function handleTabChange(url: string, tabId: number): Promise<void> {
  // 停止所有现有计时器
  stopAllTimers();

  // 检查URL是否是HTTP/HTTPS
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return;
  }

  const domain = extractDomain(url);
  if (!domain) return;

  // 获取网站配置
  const websites = await getWebsites();
  const matchedWebsite = websites.find((site) => site.enabled && matchesDomain(url, site.domain));

  if (!matchedWebsite) {
    // 检查是否在"限制所有网站"的时间锁定模式
    const timeLockSettings = await getTimeLockSettings();
    if (timeLockSettings.enabled && timeLockSettings.mode === "all") {
      const isLocked = isInTimeLockPeriod(timeLockSettings.periods);
      if (isLocked) {
        console.log(`[Background] ${domain} 处于"限制所有网站"时间锁定期`);
        // 进入待锁定状态
        await handleTimeLockForAllWebsites(domain, tabId);
        return;
      }
    }
    return;
  }

  console.log(`[Background] 匹配到受限网站: ${matchedWebsite.displayName} (${domain})`);

  // 获取或创建今日使用数据
  const usageData = await getOrCreateTodayUsage(domain);

  // 检查当前状态
  const currentState = usageData.status;

  // 如果已经是locked状态，跳转到阻止页面
  if (currentState === "locked") {
    console.log(`[Background] ${domain} 已被锁定，跳转到阻止页面`);
    await redirectToBlockedPage(tabId, domain);
    return;
  }

  // 如果是pending状态，检查是否还在30秒内
  if (currentState === "pending" && usageData.pendingStartTime) {
    const elapsed = Date.now() - usageData.pendingStartTime;
    const globalSettings = await getGlobalSettings();
    const pendingDuration = globalSettings.pendingLockDuration * 1000;

    if (elapsed < pendingDuration) {
      console.log(`[Background] ${domain} 处于待锁定状态，剩余 ${Math.ceil((pendingDuration - elapsed) / 1000)}秒`);
      // Content Script会显示待锁定UI
      return;
    } else {
      // 超过30秒，转换为locked
      console.log(`[Background] ${domain} 待锁定时间已过，转换为locked状态`);
      await transitionToLocked(domain);
      await redirectToBlockedPage(tabId, domain);
      return;
    }
  }

  // 检查是否需要进入时间锁定
  const timeLockSettings = await getTimeLockSettings();
  if (
    timeLockSettings.enabled &&
    !usageData.timeLockDisabled &&
    isInTimeLockPeriod(timeLockSettings.periods)
  ) {
    console.log(`[Background] ${domain} 进入固定时间锁定期`);
    await transitionToPending(domain, "time_lock");
    // 通知Content Script显示待锁定遮罩
    await notifyPendingLock(tabId, domain, "time_lock");
    return;
  }

  // 检查是否达到每日限制
  const remainingTime = matchedWebsite.dailyLimit - usageData.usedTime;
  if (remainingTime <= 0) {
    console.log(`[Background] ${domain} 今日时间已用尽`);
    await transitionToPending(domain, "time_limit");
    return;
  }

  // 开始计时
  console.log(`[Background] 开始计时: ${domain}, 剩余 ${remainingTime}秒`);
  startTimer(domain, tabId, matchedWebsite.dailyLimit);
}

/**
 * 开始计时
 */
function startTimer(domain: string, tabId: number, dailyLimit: number): void {
  // 如果已存在该域名的计时器，先停止
  stopTimerForDomain(domain);

  const startTime = Date.now();

  // 每秒更新一次
  const intervalId = setInterval(async () => {
    try {
      await updateTimer(domain, tabId, startTime, dailyLimit);
    } catch (error) {
      console.error(`[Background] 更新计时器失败 (${domain}):`, error);
      stopTimerForDomain(domain);
    }
  }, 1000);

  activeTimers.set(domain, {
    domain,
    tabId,
    startTime,
    intervalId,
  });

  console.log(`[Background] 计时器已启动: ${domain}`);
}

/**
 * 更新计时器
 */
async function updateTimer(
  domain: string,
  tabId: number,
  startTime: number,
  dailyLimit: number
): Promise<void> {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);

  // 获取今日使用数据
  const result = await chrome.storage.local.get(STORAGE_KEYS.USAGE_DATA);
  const usageDataList: UsageData[] = result[STORAGE_KEYS.USAGE_DATA] || [];
  const today = formatDate(new Date());
  const todayData = usageDataList.find((data) => data.domain === domain && data.date === today);

  if (!todayData) {
    console.error(`[Background] 未找到 ${domain} 的今日数据`);
    stopTimerForDomain(domain);
    return;
  }

  // 更新已使用时间
  const newUsedTime = todayData.usedTime + 1;
  await updateUsageData(domain, {
    usedTime: newUsedTime,
    activeTabId: tabId,
  });

  // 检查是否达到限制
  const remainingTime = dailyLimit - newUsedTime;

  if (remainingTime <= 0) {
    console.log(`[Background] ${domain} 时间已用尽，进入待锁定状态`);
    stopTimerForDomain(domain);
    await transitionToPending(domain, "time_limit");
    
    // 通知Content Script显示待锁定遮罩
    await notifyPendingLock(tabId, domain, "time_limit");
    return;
  }

  // 检查是否进入时间锁定期
  const timeLockSettings = await getTimeLockSettings();
  if (
    timeLockSettings.enabled &&
    !todayData.timeLockDisabled &&
    isInTimeLockPeriod(timeLockSettings.periods)
  ) {
    console.log(`[Background] ${domain} 进入固定时间锁定期`);
    stopTimerForDomain(domain);
    await transitionToPending(domain, "time_lock");
    
    // 通知Content Script显示待锁定遮罩
    await notifyPendingLock(tabId, domain, "time_lock");
    return;
  }
}

/**
 * 停止特定域名的计时器
 */
function stopTimerForDomain(domain: string): void {
  const timer = activeTimers.get(domain);
  if (timer) {
    clearInterval(timer.intervalId);
    activeTimers.delete(domain);
    console.log(`[Background] 计时器已停止: ${domain}`);
  }
}

/**
 * 停止特定Tab的计时器
 */
function stopTimerForTab(tabId: number): void {
  for (const [domain, timer] of activeTimers.entries()) {
    if (timer.tabId === tabId) {
      stopTimerForDomain(domain);
    }
  }
}

/**
 * 停止所有计时器
 */
function stopAllTimers(): void {
  for (const domain of activeTimers.keys()) {
    stopTimerForDomain(domain);
  }
}

// ============================================================================
// 时间锁定相关
// ============================================================================

/**
 * 处理"限制所有网站"模式的时间锁定
 */
async function handleTimeLockForAllWebsites(domain: string, tabId: number): Promise<void> {
  const usageData = await getOrCreateTodayUsage(domain);

  if (usageData.status === "locked") {
    await redirectToBlockedPage(tabId, domain);
    return;
  }

  if (usageData.status !== "pending") {
    await transitionToPending(domain, "time_lock");
  }
}

// ============================================================================
// 页面跳转
// ============================================================================

/**
 * 跳转到阻止页面
 */
async function redirectToBlockedPage(tabId: number, domain: string): Promise<void> {
  try {
    const blockedUrl = chrome.runtime.getURL(`tabs/blocked.html?domain=${encodeURIComponent(domain)}`);
    await chrome.tabs.update(tabId, { url: blockedUrl });
    console.log(`[Background] 已跳转到阻止页面: ${domain}`);
  } catch (error) {
    console.error(`[Background] 跳转到阻止页面失败:`, error);
  }
}

/**
 * 通知Content Script显示待锁定遮罩
 */
async function notifyPendingLock(
  tabId: number,
  domain: string,
  reason: "time_limit" | "time_lock"
): Promise<void> {
  try {
    const globalSettings = await getGlobalSettings();
    
    await chrome.tabs.sendMessage(tabId, {
      type: "SHOW_PENDING_LOCK",
      payload: {
        domain,
        reason,
        pendingDuration: globalSettings.pendingLockDuration,
      },
    });
    
    console.log(`[Background] 已通知显示待锁定遮罩: ${domain}`);
  } catch (error) {
    console.error(`[Background] 通知待锁定遮罩失败:`, error);
  }
}

// ============================================================================
// 每日重置
// ============================================================================

/**
 * 设置每日重置alarm
 */
async function setupDailyResetAlarm(): Promise<void> {
  const globalSettings = await getGlobalSettings();
  const [hours, minutes] = globalSettings.resetTime.split(":").map(Number);

  // 计算下一次重置时间
  const now = new Date();
  const nextReset = new Date();
  nextReset.setHours(hours, minutes, 0, 0);

  // 如果今天的重置时间已过，设置为明天
  if (nextReset <= now) {
    nextReset.setDate(nextReset.getDate() + 1);
  }

  const delayInMinutes = (nextReset.getTime() - now.getTime()) / (1000 * 60);

  // 创建alarm
  await chrome.alarms.create("dailyReset", {
    delayInMinutes,
    periodInMinutes: 24 * 60, // 每24小时重复
  });

  console.log(`[Background] 每日重置alarm已设置，下次重置时间: ${nextReset.toLocaleString()}`);
}

/**
 * 监听alarm触发
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "dailyReset") {
    console.log("[Background] 触发每日重置");
    await resetDailyData();
    console.log("[Background] 每日重置完成");
  }
});

// ============================================================================
// 消息通信
// ============================================================================

/**
 * 监听来自Content Script和UI页面的消息
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Background] 收到消息:", message.type);

  // 处理消息（异步）
  handleMessage(message, sender)
    .then((response) => {
      sendResponse({ success: true, data: response });
    })
    .catch((error) => {
      console.error("[Background] 处理消息失败:", error);
      sendResponse({ success: false, error: error.message });
    });

  // 返回true表示异步响应
  return true;
});

/**
 * 处理各种类型的消息
 */
async function handleMessage(message: any, sender: chrome.runtime.MessageSender): Promise<any> {
  switch (message.type) {
    case "GET_WEBSITE_STATUS":
      return await handleGetWebsiteStatus(message.payload);

    case "EMERGENCY_USE":
      return await handleEmergencyUse(message.payload);

    case "LOCK_IMMEDIATELY":
      return await handleLockImmediately(message.payload, sender);

    case "RESTART_WEBSITE":
      return await handleRestartWebsite(message.payload);

    case "CHECK_TIME_LOCK":
      return await handleCheckTimeLock();

    default:
      throw new Error(`未知的消息类型: ${message.type}`);
  }
}

/**
 * 处理获取网站状态请求
 */
async function handleGetWebsiteStatus(payload: { domain: string }): Promise<any> {
  const { domain } = payload;
  const usageData = await getOrCreateTodayUsage(domain);
  const websites = await getWebsites();
  const website = websites.find((site) => matchesDomain(`https://${domain}`, site.domain));

  return {
    status: usageData.status,
    remainingTime: website ? website.dailyLimit - usageData.usedTime : 0,
    usedTime: usageData.usedTime,
    dailyLimit: website?.dailyLimit || 0,
    restarted: usageData.restarted,
    timeLockDisabled: usageData.timeLockDisabled,
  };
}

/**
 * 处理紧急使用请求
 */
async function handleEmergencyUse(payload: { domain: string }): Promise<any> {
  const { domain } = payload;
  const globalSettings = await getGlobalSettings();
  const extraTime = globalSettings.emergencyExtraTime;

  await transitionToActiveFromPending(domain, extraTime);

  return {
    success: true,
    extraTime,
  };
}

/**
 * 处理立即锁定请求
 */
async function handleLockImmediately(payload: { domain: string }, sender?: chrome.runtime.MessageSender): Promise<any> {
  const { domain } = payload;
  const tabId = sender?.tab?.id;

  console.log(`[Background] 收到锁定请求: ${domain}, tabId: ${tabId}`);

  if (!tabId) {
    console.error("[Background] 无法获取tab ID，sender:", sender);
    return { success: false, message: "无法获取tab ID" };
  }

  console.log(`[Background] 开始锁定流程: ${domain}`);
  await transitionToLocked(domain);
  console.log(`[Background] 状态已转换为locked: ${domain}`);
  await redirectToBlockedPage(tabId, domain);
  console.log(`[Background] 已触发页面跳转: ${domain}`);

  return { success: true };
}

/**
 * 处理重启网站请求
 */
async function handleRestartWebsite(payload: {
  domain: string;
  type: "normal" | "emergency";
}): Promise<any> {
  const { domain, type } = payload;

  // 检查紧急重启是否可用
  if (type === "emergency") {
    const globalSettings = await getGlobalSettings();
    const today = formatDate(new Date());

    if (
      globalSettings.emergencyRestartUsedToday &&
      globalSettings.emergencyRestartUsedDate === today
    ) {
      return {
        success: false,
        message: "今日紧急重启已使用",
      };
    }

    // 标记紧急重启已使用
    await chrome.storage.local.set({
      [STORAGE_KEYS.GLOBAL_SETTINGS]: {
        ...globalSettings,
        emergencyRestartUsedToday: true,
        emergencyRestartUsedDate: today,
      },
    });
  }

  // 执行重启
  await transitionToActiveFromLocked(domain, type);

  return {
    success: true,
    message: "重启成功",
  };
}

/**
 * 处理检查时间锁定请求
 */
async function handleCheckTimeLock(): Promise<any> {
  const timeLockSettings = await getTimeLockSettings();
  const isLocked = timeLockSettings.enabled && isInTimeLockPeriod(timeLockSettings.periods);

  return {
    isLocked,
    settings: timeLockSettings,
  };
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 获取网站配置列表
 */
async function getWebsites(): Promise<WebsiteConfig[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.WEBSITES);
  return result[STORAGE_KEYS.WEBSITES] || [];
}

/**
 * 获取时间锁定设置
 */
async function getTimeLockSettings(): Promise<TimeLockSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.TIME_LOCK_SETTINGS);
  return (
    result[STORAGE_KEYS.TIME_LOCK_SETTINGS] || {
      enabled: false,
      mode: "restricted",
      periods: [],
    }
  );
}

/**
 * 获取全局设置
 */
async function getGlobalSettings(): Promise<GlobalSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.GLOBAL_SETTINGS);
  return (
    result[STORAGE_KEYS.GLOBAL_SETTINGS] || {
      resetTime: DEFAULTS.RESET_TIME,
      floatingPosition: DEFAULTS.FLOATING_POSITION,
      isCollapsed: DEFAULTS.IS_COLLAPSED,
      emergencyExtraTime: DEFAULTS.EMERGENCY_EXTRA_TIME,
      pendingLockDuration: DEFAULTS.PENDING_LOCK_DURATION,
      emergencyRestartUsedToday: false,
      emergencyRestartUsedDate: formatDate(new Date()),
    }
  );
}

// ============================================================================
// 导出（用于测试）
// ============================================================================

export {
  handleTabChange,
  startTimer,
  stopTimerForDomain,
  stopAllTimers,
  redirectToBlockedPage,
  setupDailyResetAlarm,
};

