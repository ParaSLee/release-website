/**
 * 重置配置Tab
 */

import { useState, useEffect } from "react";

import { Clock, RefreshCw } from "lucide-react";

import { STORAGE_KEYS } from "~types";
import type { GlobalSettings } from "~types";
import { formatDuration } from "~utils/time";

export const ResetTab: React.FC = () => {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [resetTime, setResetTime] = useState("06:00");
  const [emergencyExtraTime, setEmergencyExtraTime] = useState(600);
  const [pendingLockDuration, setPendingLockDuration] = useState(30);

  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * 加载设置
   */
  const loadSettings = async () => {
    const result = await chrome.storage.local.get(STORAGE_KEYS.GLOBAL_SETTINGS);
    const globalSettings = result[STORAGE_KEYS.GLOBAL_SETTINGS] || {
      resetTime: "06:00",
      emergencyExtraTime: 600,
      pendingLockDuration: 30,
    };

    setSettings(globalSettings);
    setResetTime(globalSettings.resetTime);
    setEmergencyExtraTime(globalSettings.emergencyExtraTime);
    setPendingLockDuration(globalSettings.pendingLockDuration);
  };

  /**
   * 保存设置
   */
  const handleSave = async () => {
    try {
      const updatedSettings = {
        ...settings,
        resetTime,
        emergencyExtraTime,
        pendingLockDuration,
      };

      await chrome.storage.local.set({
        [STORAGE_KEYS.GLOBAL_SETTINGS]: updatedSettings,
      });

      setSettings(updatedSettings);
      alert("设置已保存！");
    } catch (error) {
      console.error("[ResetTab] 保存失败:", error);
      alert("保存失败，请重试");
    }
  };

  /**
   * 立即重置
   */
  const handleResetNow = async () => {
    if (!confirm("确定要立即重置所有网站的使用数据吗？此操作不可撤销！")) {
      return;
    }

    try {
      // 调用Background Service的重置功能
      await chrome.runtime.sendMessage({
        type: "RESET_ALL_DATA",
      });

      alert("重置成功！所有网站的使用时间已清零。");
    } catch (error) {
      console.error("[ResetTab] 重置失败:", error);
      alert("重置失败，请重试");
    }
  };

  /**
   * 计算下次重置时间
   */
  const getNextResetTime = (): string => {
    const now = new Date();
    const [hours, minutes] = resetTime.split(":").map(Number);

    const nextReset = new Date(now);
    nextReset.setHours(hours, minutes, 0, 0);

    // 如果今天的重置时间已过，设置为明天
    if (nextReset <= now) {
      nextReset.setDate(nextReset.getDate() + 1);
    }

    return nextReset.toLocaleString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!settings) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3 animate-spin" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* 头部 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">重置配置</h2>
          <p className="text-gray-600 mt-1">配置每日重置时间和其他参数</p>
        </div>

        {/* 每日重置时间 */}
        <div className="mb-6 p-6 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">每日重置时间</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                重置时间点
              </label>
              <input
                type="time"
                value={resetTime}
                onChange={(e) => setResetTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-600 mt-2">
                每天到达此时间点时，所有网站的使用时间将自动重置
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>下次重置时间：</strong>
                <div className="mt-1 text-blue-600 font-semibold">{getNextResetTime()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 紧急使用额外时间 */}
        <div className="mb-6 p-6 bg-white border border-gray-200 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">紧急使用额外时间</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                额外时间（秒）
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={emergencyExtraTime}
                  onChange={(e) => setEmergencyExtraTime(parseInt(e.target.value) || 0)}
                  min="60"
                  step="60"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 min-w-[120px] text-center">
                  {formatDuration(emergencyExtraTime)}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                在待锁定状态点击"紧急使用"时，增加的额外浏览时间
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEmergencyExtraTime(300)}
                className="text-sm px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                5分钟
              </button>
              <button
                type="button"
                onClick={() => setEmergencyExtraTime(600)}
                className="text-sm px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                10分钟
              </button>
              <button
                type="button"
                onClick={() => setEmergencyExtraTime(900)}
                className="text-sm px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                15分钟
              </button>
            </div>
          </div>
        </div>

        {/* 待锁定缓冲时间 */}
        <div className="mb-6 p-6 bg-white border border-gray-200 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">待锁定缓冲时间</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                缓冲时间（秒）
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={pendingLockDuration}
                  onChange={(e) => setPendingLockDuration(parseInt(e.target.value) || 0)}
                  min="10"
                  max="120"
                  step="5"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 min-w-[80px] text-center">
                  {pendingLockDuration}秒
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                时间用尽或进入锁定期后，等待多少秒才跳转到阻止页面
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPendingLockDuration(15)}
                className="text-sm px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                15秒
              </button>
              <button
                type="button"
                onClick={() => setPendingLockDuration(30)}
                className="text-sm px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                30秒
              </button>
              <button
                type="button"
                onClick={() => setPendingLockDuration(60)}
                className="text-sm px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                60秒
              </button>
            </div>
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <Clock className="w-5 h-5" />
            保存设置
          </button>
        </div>

        {/* 立即重置 */}
        <div className="mt-6 p-6 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3 mb-4">
            <RefreshCw className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">立即重置所有数据</h3>
              <p className="text-sm text-gray-600 mb-4">
                这将清空所有网站的今日使用时间、重启标记和紧急重启状态。此操作不可撤销！
              </p>
              <button
                onClick={handleResetNow}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                立即重置
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

