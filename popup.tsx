/**
 * Popup 页面
 * 快速概览今日网站使用情况
 */

import { useEffect, useState } from "react";

import { AlertCircle, ArrowRight, Clock, Moon, RefreshCw, Settings, Zap } from "lucide-react";

import { STORAGE_KEYS } from "~types";
import type { GlobalSettings, TimeLockSettings, UsageData, WebsiteConfig } from "~types";

import { formatDuration } from "./utils/time";
import { isInTimeLockPeriod } from "./utils/timeLock";

import "~styles/global.css";

interface WebsiteStatus {
  config: WebsiteConfig;
  usage: UsageData;
  remainingTime: number;
  percentage: number;
  emergencyExtraTime: number; // 紧急使用增加的总时间
  actualTotalTime: number; // 实际拥有的总时间（原始+紧急）
}

function IndexPopup() {
  const [websites, setWebsites] = useState<WebsiteStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTimeLocked, setIsTimeLocked] = useState(false);
  const [emergencyRestartUsed, setEmergencyRestartUsed] = useState(false);
  const [timeLockLabel, setTimeLockLabel] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  /**
   * 加载数据
   */
  const loadData = async () => {
    try {
      setLoading(true);

      const result = await chrome.storage.local.get([
        STORAGE_KEYS.WEBSITES,
        STORAGE_KEYS.USAGE_DATA,
        STORAGE_KEYS.GLOBAL_SETTINGS,
        STORAGE_KEYS.TIME_LOCK_SETTINGS,
      ]);

      const websiteConfigs: WebsiteConfig[] = result[STORAGE_KEYS.WEBSITES] || [];
      const usageDataList: UsageData[] = result[STORAGE_KEYS.USAGE_DATA] || [];
      const globalSettings: GlobalSettings = result[STORAGE_KEYS.GLOBAL_SETTINGS] || {};
      const timeLockSettings: TimeLockSettings = result[STORAGE_KEYS.TIME_LOCK_SETTINGS] || {
        enabled: false,
        mode: "restricted",
        periods: [],
      };

      // 检查是否在时间锁定期
      const isLocked = timeLockSettings.enabled && isInTimeLockPeriod(timeLockSettings.periods);
      setIsTimeLocked(isLocked);

      // 获取时间锁定标签
      if (isLocked && timeLockSettings.periods.length > 0) {
        const activePeriod = timeLockSettings.periods.find((p) =>
          isInTimeLockPeriod([p])
        );
        setTimeLockLabel(activePeriod?.label || "固定时间锁定");
      }

      // 检查紧急重启状态
      setEmergencyRestartUsed(globalSettings.emergencyRestartUsedToday || false);

      // 获取今日日期
      const today = new Date().toISOString().split("T")[0];

      // 获取紧急使用的额外时间
      const emergencyExtraTimePerUse = globalSettings.emergencyExtraTime || 600; // 默认10分钟

      // 合并配置和使用数据
      const statuses: WebsiteStatus[] = websiteConfigs
        .filter((config) => config.enabled)
        .map((config) => {
          const usage = usageDataList.find(
            (data) => data.domain === config.domain && data.date === today
          ) || {
            domain: config.domain,
            date: today,
            usedTime: 0,
            lastUpdate: Date.now(),
            status: "active" as const,
            emergencyUsedToday: 0,
            restarted: false,
            timeLockDisabled: false,
          };

          // 计算紧急使用增加的总时间
          const emergencyExtraTime = (usage.emergencyUsedToday || 0) * emergencyExtraTimePerUse;
          
          // 计算实际拥有的总时间（原始限制 + 紧急使用）
          const actualTotalTime = config.dailyLimit + emergencyExtraTime;
          
          // 计算剩余时间（基于 dailyLimit，与 Background 保持一致）
          // 当 usedTime 为负数时，remainingTime 会包含紧急使用的额外时间
          const remainingTime = config.dailyLimit - usage.usedTime;
          
          // 计算实际已使用时间（actualTotalTime - remainingTime）
          const actualUsedTime = Math.max(0, actualTotalTime - remainingTime);
          
          // 基于实际总时间计算百分比
          const percentage = actualTotalTime > 0 ? (actualUsedTime / actualTotalTime) * 100 : 0;

          return {
            config,
            usage,
            remainingTime: Math.max(0, remainingTime), // 剩余时间不能为负
            percentage: Math.min(100, Math.max(0, percentage)), // 百分比在0-100之间
            emergencyExtraTime,
            actualTotalTime,
          };
        })
        .sort((a, b) => a.percentage - b.percentage); // 按使用率排序

      setWebsites(statuses);
    } catch (error) {
      console.error("[Popup] 加载数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 打开Options页面
   */
  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  if (loading) {
    return (
      <div className="w-[400px] h-[500px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Clock className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[400px] min-h-[500px] max-h-[600px] bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* 头部 */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Website Block</h1>
              <p className="text-xs text-gray-500">今日使用概览</p>
            </div>
          </div>
          <button
            onClick={openOptions}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="打开设置"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 状态提示 */}
        <div className="flex gap-2 mt-3">
          {/* 时间锁定状态 */}
          {isTimeLocked && (
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-purple-100 border border-purple-200 rounded-lg">
              <Moon className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span className="text-xs text-purple-700 font-medium truncate">
                {timeLockLabel}
              </span>
            </div>
          )}

          {/* 紧急重启状态 */}
          {emergencyRestartUsed && (
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-orange-100 border border-orange-200 rounded-lg">
              <Zap className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span className="text-xs text-orange-700 font-medium">已使用紧急重启</span>
            </div>
          )}

          {/* 无状态提示 */}
          {!isTimeLocked && !emergencyRestartUsed && (
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-green-100 border border-green-200 rounded-lg">
              <Clock className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-xs text-green-700 font-medium">正常运行中</span>
            </div>
          )}
        </div>
      </div>

      {/* 网站列表 */}
      <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(600px - 180px)" }}>
        {websites.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">暂无受限网站</p>
            <button
              onClick={openOptions}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              前往添加网站 →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {websites.map((site) => (
              <div
                key={site.config.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:shadow-md transition-shadow"
              >
                {/* 网站名称和图标 */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {site.config.icon ? (
                      <img
                        src={site.config.icon}
                        alt={site.config.displayName}
                        className="w-6 h-6 rounded flex-shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-white font-bold">
                          {site.config.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {site.config.displayName}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{site.config.domain}</p>
                    </div>
                  </div>

                  {/* 标记区域 */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* 紧急使用标记 */}
                    {site.usage.emergencyUsedToday > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 border border-amber-200 rounded-md">
                        <Zap className="w-3 h-3 text-amber-600" />
                        <span className="text-xs text-amber-700 font-medium">
                          紧急使用 ×{site.usage.emergencyUsedToday}
                        </span>
                      </div>
                    )}
                    
                    {/* 重启标记 */}
                    {site.usage.restarted && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 border border-orange-200 rounded-md">
                        <RefreshCw className="w-3 h-3 text-orange-600" />
                        <span className="text-xs text-orange-700 font-medium">已重启</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 时间信息 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      已使用: {formatDuration(Math.max(0, site.actualTotalTime - site.remainingTime))}
                    </span>
                    <span
                      className={`font-semibold ${
                        site.remainingTime < 300
                          ? "text-red-600"
                          : site.remainingTime < 1800
                          ? "text-orange-600"
                          : "text-green-600"
                      }`}
                    >
                      剩余: {formatDuration(site.remainingTime)}
                    </span>
                  </div>

                  {/* 进度条 */}
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${
                        site.percentage >= 90
                          ? "bg-gradient-to-r from-red-500 to-red-600"
                          : site.percentage >= 70
                          ? "bg-gradient-to-r from-orange-500 to-orange-600"
                          : "bg-gradient-to-r from-green-500 to-green-600"
                      }`}
                      style={{ width: `${site.percentage}%` }}
                    />
                  </div>

                  {/* 百分比和总限制 */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {/* 总限制显示 */}
                    {site.emergencyExtraTime > 0 ? (
                      <span>
                        总限制: {formatDuration(site.config.dailyLimit)}
                        {" + "}
                        <span className="text-amber-600 font-medium">
                          {formatDuration(site.emergencyExtraTime)}
                        </span>
                        <span className="text-amber-600"> (紧急使用)</span>
                      </span>
                    ) : (
                      <span>总限制: {formatDuration(site.config.dailyLimit)}</span>
                    )}
                    
                    {/* 百分比 */}
                    <span>{Math.round(site.percentage)}% 已使用</span>
                  </div>
                </div>

                {/* 状态标记 */}
                {site.usage.status !== "active" && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      {site.usage.status === "pending" && (
                        <>
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                          <span className="text-xs text-orange-600 font-medium">
                            待锁定中 (30秒缓冲)
                          </span>
                        </>
                      )}
                      {site.usage.status === "locked" && (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span className="text-xs text-red-600 font-medium">已锁定</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部操作区 */}
      <div className="border-t border-gray-200/50 bg-white/80 backdrop-blur-md p-4">
        <button
          onClick={openOptions}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
        >
          <Settings className="w-5 h-5" />
          <span>前往设置</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* 版本信息 */}
        <p className="text-center text-xs text-gray-500 mt-3">
          Website Block v1.0.0
        </p>
      </div>
    </div>
  );
}

export default IndexPopup;
