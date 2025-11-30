/**
 * Website Block Extension - 类型定义
 * 版本: 1.0.0
 */

// ============================================================================
// 核心数据类型
// ============================================================================

/**
 * 网站配置
 */
export interface WebsiteConfig {
  id: string;                  // 唯一标识符 (UUID)
  domain: string;              // 域名 (例如: youtube.com)
  displayName: string;         // 显示名称
  dailyLimit: number;          // 每日限制时间（秒）
  enabled: boolean;            // 是否启用
  icon?: string;               // 网站图标 (URL或base64)
  createdAt: number;           // 创建时间戳
}

/**
 * 网站状态: active/pending/locked
 */
export type WebsiteStatus = 'active' | 'pending' | 'locked';

/**
 * 网站使用数据
 */
export interface UsageData {
  domain: string;              // 域名
  date: string;                // 日期 (YYYY-MM-DD)
  usedTime: number;            // 已使用时间（秒）
  startTime?: number;          // 当前会话开始时间戳
  activeTabId?: number;        // 当前活跃的tab ID
  lastUpdate: number;          // 最后更新时间戳
  status: WebsiteStatus;       // 当前状态
  pendingStartTime?: number;   // 进入待锁定状态的时间戳
  emergencyUsedToday: number;  // 今日紧急使用次数（用于统计）
  restarted: boolean;          // 今日是否被重启过
  restartedAt?: number;        // 最后重启时间戳
  timeLockDisabled: boolean;   // 固定时间锁定是否被禁用（重启后）
}

/**
 * 固定时间锁定段
 */
export interface TimeLockPeriod {
  id: string;                  // 唯一标识符
  startTime: string;           // 开始时间 (HH:mm格式)
  endTime: string;             // 结束时间 (HH:mm格式)
  enabled: boolean;            // 是否启用
  label?: string;              // 标签 (例如: "睡眠时间")
}

/**
 * 固定时间锁定模式
 */
export type TimeLockMode = 'restricted' | 'all';

/**
 * 固定时间锁定设置
 */
export interface TimeLockSettings {
  enabled: boolean;            // 总开关
  mode: TimeLockMode;          // restricted=仅限制清单内, all=所有HTTP/HTTPS
  periods: TimeLockPeriod[];   // 锁定时间段列表
}

/**
 * 全局设置
 */
export interface GlobalSettings {
  resetTime: string;           // 重置时间点 (HH:mm格式, 例如: "06:00")
  floatingPosition: {          // 悬浮窗位置
    x: number;
    y: number;
  };
  isCollapsed: boolean;        // 是否收起
  emergencyExtraTime: number;  // 紧急使用额外时间（秒，默认600=10分钟）
  pendingLockDuration: number; // 待锁定缓冲时间（秒，默认30）
  emergencyRestartUsedToday: boolean;  // 今日紧急重启是否已使用（全局）
  emergencyRestartUsedDate: string;    // 紧急重启使用日期
}

/**
 * 完整存储结构
 */
export interface StorageSchema {
  websites: WebsiteConfig[];
  usageData: UsageData[];
  timeLockSettings: TimeLockSettings;
  globalSettings: GlobalSettings;
}

// ============================================================================
// 消息通信类型
// ============================================================================

/**
 * Background Service 消息类型
 */
export type MessageType =
  | 'GET_WEBSITE_STATUS'
  | 'EMERGENCY_USE'
  | 'LOCK_IMMEDIATELY'
  | 'RESTART_WEBSITE'
  | 'UPDATE_USAGE_DATA'
  | 'CHECK_TIME_LOCK';

/**
 * 基础消息结构
 */
export interface BaseMessage<T = any> {
  type: MessageType;
  payload?: T;
}

/**
 * 获取网站状态请求
 */
export interface GetWebsiteStatusMessage extends BaseMessage {
  type: 'GET_WEBSITE_STATUS';
  payload: {
    domain: string;
  };
}

/**
 * 网站状态响应
 */
export interface WebsiteStatusResponse {
  status: WebsiteStatus;
  remainingTime: number;     // 剩余时间（秒）
  usedTime: number;          // 已使用时间（秒）
  dailyLimit: number;        // 每日限制（秒）
  restarted: boolean;        // 今日是否重启过
  timeLockDisabled: boolean; // 固定时间锁定是否被禁用
}

/**
 * 紧急使用请求
 */
export interface EmergencyUseMessage extends BaseMessage {
  type: 'EMERGENCY_USE';
  payload: {
    domain: string;
  };
}

/**
 * 紧急使用响应
 */
export interface EmergencyUseResponse {
  success: boolean;
  newRemainingTime: number;
}

/**
 * 重启网站请求
 */
export interface RestartWebsiteMessage extends BaseMessage {
  type: 'RESTART_WEBSITE';
  payload: {
    domain: string;
    type: 'normal' | 'emergency';
  };
}

/**
 * 重启网站响应
 */
export interface RestartWebsiteResponse {
  success: boolean;
  message?: string;
  emergencyRestartUsed: boolean;
}

// ============================================================================
// UI 组件 Props 类型
// ============================================================================

/**
 * 倒计时显示组件 Props
 */
export interface TimerDisplayProps {
  remainingTime: number;
  totalTime: number;
  isExpanded: boolean;
  onToggle: () => void;
  domain: string;
}

/**
 * 待锁定遮罩组件 Props
 */
export interface PendingLockOverlayProps {
  countdown: number;
  totalCountdown: number;
  onEmergencyUse: () => void;
  onLockImmediately: () => void;
  domain: string;
}

/**
 * 重启对话框1 Props
 */
export interface RestartDialog1Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRestart: () => void;
  onEmergencyRestart: () => void;
  onCancel: () => void;
  emergencyRestartAvailable: boolean;
}

/**
 * 重启对话框2 Props
 */
export interface RestartDialog2Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  generatedWords: string;
}

/**
 * 礼花效果组件 Props
 */
export interface ConfettiEffectProps {
  show: boolean;
  message: string;
}

// ============================================================================
// 工具类型
// ============================================================================

/**
 * 日期字符串格式 (YYYY-MM-DD)
 */
export type DateString = string;

/**
 * 时间字符串格式 (HH:mm)
 */
export type TimeString = string;

/**
 * 重启类型
 */
export type RestartType = 'normal' | 'emergency';

/**
 * 阻止原因
 */
export type BlockReason = 'time_limit' | 'time_lock';

// ============================================================================
// Hook 返回类型
// ============================================================================

/**
 * useStorage hook 返回类型
 */
export interface UseStorageReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  update: (newData: T) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * useWebsites hook 返回类型
 */
export interface UseWebsitesReturn {
  websites: WebsiteConfig[];
  loading: boolean;
  addWebsite: (config: Omit<WebsiteConfig, 'id' | 'createdAt'>) => Promise<void>;
  updateWebsite: (id: string, updates: Partial<WebsiteConfig>) => Promise<void>;
  deleteWebsite: (id: string) => Promise<void>;
  toggleWebsite: (id: string) => Promise<void>;
  getWebsite: (domain: string) => WebsiteConfig | undefined;
}

/**
 * useUsageData hook 返回类型
 */
export interface UseUsageDataReturn {
  usageData: UsageData[];
  todayUsage: (domain: string) => UsageData | null;
  weeklyStats: (domain: string) => number;
  refreshUsage: () => Promise<void>;
}

/**
 * useTimeLock hook 返回类型
 */
export interface UseTimeLockReturn {
  settings: TimeLockSettings;
  updateSettings: (updates: Partial<TimeLockSettings>) => Promise<void>;
  addPeriod: (period: Omit<TimeLockPeriod, 'id'>) => Promise<void>;
  deletePeriod: (id: string) => Promise<void>;
  isInTimeLockPeriod: (now?: Date) => boolean;
}

// ============================================================================
// 常量
// ============================================================================

/**
 * 存储键名
 */
export const STORAGE_KEYS = {
  WEBSITES: 'websites',
  USAGE_DATA: 'usageData',
  TIME_LOCK_SETTINGS: 'timeLockSettings',
  GLOBAL_SETTINGS: 'globalSettings',
} as const;

/**
 * 默认值
 */
export const DEFAULTS = {
  EMERGENCY_EXTRA_TIME: 600, // 10分钟
  PENDING_LOCK_DURATION: 30, // 30秒
  RESET_TIME: '06:00',
  FLOATING_POSITION: { x: 20, y: 20 },
  IS_COLLAPSED: false,
} as const;

