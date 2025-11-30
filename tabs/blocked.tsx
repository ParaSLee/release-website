/**
 * 阻止页面
 * 当网站被锁定时显示
 */

import { useEffect, useState } from "react";

import {
  BarChart3,
  Book,
  Clock,
  Coffee,
  Heart,
  Lock,
  Moon,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { ConfettiEffect } from "~components/blocked/ConfettiEffect";
import { RestartDialog1 } from "~components/blocked/RestartDialog1";
import { RestartDialog2 } from "~components/blocked/RestartDialog2";
import type { BlockReason } from "~types";
import { formatDuration, formatTime, getCurrentTime } from "~utils/time";
import { getCongratsMessage, getRandomActivities, getRandomQuote } from "~utils/motivational";
import { getNextUnlockTime } from "~utils/timeLock";
import { generateWords } from "~utils/wordGenerator";

import "~styles/global.css";

interface BlockedPageData {
  domain: string;
  displayName: string;
  usedTime: number;
  dailyLimit: number;
  reason: BlockReason;
  unlockTime?: Date;
  restarted: boolean;
}

function BlockedPage() {
  const [data, setData] = useState<BlockedPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [motivationalQuote, setMotivationalQuote] = useState("");
  const [activities, setActivities] = useState<string[]>([]);
  const [generatedWords, setGeneratedWords] = useState("");
  
  // 对话框状态
  const [showDialog1, setShowDialog1] = useState(false);
  const [showDialog2, setShowDialog2] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [congratsMessage, setCongratsMessage] = useState("");
  const [emergencyRestartAvailable, setEmergencyRestartAvailable] = useState(true);

  useEffect(() => {
    loadData();
    setMotivationalQuote(getRandomQuote("zh"));
    setActivities(getRandomActivities(5, "zh"));
  }, []);

  /**
   * 从URL获取域名参数
   */
  const getDomainFromUrl = (): string => {
    const params = new URLSearchParams(window.location.search);
    return params.get("domain") || "";
  };

  /**
   * 加载数据
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const domain = getDomainFromUrl();

      if (!domain) {
        console.error("[Blocked] 未找到域名参数");
        return;
      }

      // 获取网站状态
      const response = await chrome.runtime.sendMessage({
        type: "GET_WEBSITE_STATUS",
        payload: { domain },
      });

      if (response.success) {
        const statusData = response.data;
        
        // 获取全局设置
        const globalSettings = await chrome.storage.local.get("globalSettings");
        const emergencyUsed = globalSettings.globalSettings?.emergencyRestartUsedToday || false;
        setEmergencyRestartAvailable(!emergencyUsed);

        // 判断阻止原因
        let reason: BlockReason = "time_limit";
        let unlockTime: Date | undefined;

        // 检查是否是时间锁定
        const timeLockResult = await chrome.runtime.sendMessage({
          type: "CHECK_TIME_LOCK",
        });

        if (timeLockResult.success && timeLockResult.data.isLocked) {
          reason = "time_lock";
          const nextUnlock = getNextUnlockTime(timeLockResult.data.settings.periods);
          if (nextUnlock) {
            unlockTime = nextUnlock;
          }
        }

        setData({
          domain,
          displayName: getDisplayName(domain),
          usedTime: statusData.usedTime,
          dailyLimit: statusData.dailyLimit,
          reason,
          unlockTime,
          restarted: statusData.restarted,
        });
      }
    } catch (error) {
      console.error("[Blocked] 加载数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理重启按钮点击
   */
  const handleRestartClick = () => {
    setGeneratedWords(generateWords(120));
    setShowDialog1(true);
  };

  /**
   * 处理确定重启
   */
  const handleConfirmRestart = () => {
    setShowDialog1(false);
    setShowDialog2(true);
  };

  /**
   * 处理紧急重启
   */
  const handleEmergencyRestart = async () => {
    try {
      const domain = getDomainFromUrl();
      const response = await chrome.runtime.sendMessage({
        type: "RESTART_WEBSITE",
        payload: { domain, type: "emergency" },
      });

      if (response.success) {
        console.log("[Blocked] 紧急重启成功");
        // 跳转回原网站
        window.location.href = `https://${domain}`;
      } else {
        alert(response.data?.message || "紧急重启失败");
      }
    } catch (error) {
      console.error("[Blocked] 紧急重启失败:", error);
      alert("紧急重启失败，请重试");
    }
  };

  /**
   * 处理取消重启（显示礼花）
   */
  const handleCancelRestart = () => {
    setShowDialog1(false);
    setShowDialog2(false);
    setCongratsMessage(getCongratsMessage("zh"));
    setShowConfetti(true);
  };

  /**
   * 处理第二层对话框确认
   */
  const handleDialog2Confirm = async () => {
    try {
      const domain = getDomainFromUrl();
      const response = await chrome.runtime.sendMessage({
        type: "RESTART_WEBSITE",
        payload: { domain, type: "normal" },
      });

      if (response.success) {
        console.log("[Blocked] 重启成功");
        // 跳转回原网站
        window.location.href = `https://${domain}`;
      } else {
        alert(response.data?.message || "重启失败");
      }
    } catch (error) {
      console.error("[Blocked] 重启失败:", error);
      alert("重启失败，请重试");
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Clock className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">加载中...</p>
        </div>
      </div>
    );
  }

  const reasonText =
    data.reason === "time_limit" ? "今日使用时间已用尽" : "当前处于固定锁定时间段";
  const reasonIcon = data.reason === "time_limit" ? Clock : Moon;
  const ReasonIcon = reasonIcon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* 主卡片 */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden">
          {/* 头部 */}
          <div className="bg-gradient-to-r from-red-500 to-pink-600 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Lock className="w-10 h-10" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">网站已被锁定</h1>
            <p className="text-center text-white/90">{reasonText}</p>
          </div>

          {/* 内容区 */}
          <div className="p-8 space-y-8">
            {/* 网站信息 */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{data.displayName}</h2>
              <p className="text-gray-600">{data.domain}</p>
            </div>

            {/* 使用统计 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">今日已使用</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {formatDuration(data.usedTime)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-semibold text-gray-700">每日限制</span>
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  {formatDuration(data.dailyLimit)}
                </p>
              </div>
            </div>

            {/* 解锁时间（固定时间锁定） */}
            {data.reason === "time_lock" && data.unlockTime && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Moon className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-700">预计解锁时间</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {formatTime(data.unlockTime)}
                </p>
              </div>
            )}

            {/* 励志语句 */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-semibold text-gray-700">励志语句</span>
              </div>
              <p className="text-lg text-gray-800 italic text-center">"{motivationalQuote}"</p>
            </div>

            {/* 建议的替代活动 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-gray-700">建议的替代活动</span>
              </div>
              <ul className="space-y-2">
                {activities.map((activity, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <span className="text-green-600">•</span>
                    {activity}
                  </li>
                ))}
              </ul>
            </div>

            {/* 重启按钮 */}
            <div className="pt-4">
              <button
                onClick={handleRestartClick}
                className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-red-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="w-6 h-6" />
                重启网站
              </button>
              <p className="text-center text-sm text-gray-500 mt-3">
                点击后需要通过多层验证才能重启
              </p>
            </div>
          </div>
        </div>

        {/* 版权信息 */}
        <p className="text-center text-gray-500 mt-8">
          Website Block v1.0.0 - 帮助您保持专注
        </p>
      </div>

      {/* 对话框 */}
      <RestartDialog1
        isOpen={showDialog1}
        onClose={() => setShowDialog1(false)}
        onConfirmRestart={handleConfirmRestart}
        onEmergencyRestart={handleEmergencyRestart}
        onCancel={handleCancelRestart}
        emergencyRestartAvailable={emergencyRestartAvailable}
        motivationalQuote={motivationalQuote}
      />

      <RestartDialog2
        isOpen={showDialog2}
        onClose={() => setShowDialog2(false)}
        onConfirm={handleDialog2Confirm}
        onCancel={handleCancelRestart}
        generatedWords={generatedWords}
      />

      {/* 礼花效果 */}
      <ConfettiEffect
        show={showConfetti}
        message={congratsMessage}
        onComplete={() => setShowConfetti(false)}
      />
    </div>
  );
}

/**
 * 获取显示名称
 */
function getDisplayName(domain: string): string {
  const name = domain.split(".")[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export default BlockedPage;

