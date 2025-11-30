/**
 * 第一层重启对话框
 * 包含：确定重启（10秒倒计时）、紧急重启、取消重启
 */

import { useEffect, useState } from "react";

import { AlertTriangle, RefreshCw, X, Zap } from "lucide-react";

interface RestartDialog1Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRestart: () => void;
  onEmergencyRestart: () => void;
  onCancel: () => void;
  emergencyRestartAvailable: boolean;
  motivationalQuote: string;
}

export const RestartDialog1: React.FC<RestartDialog1Props> = ({
  isOpen,
  onClose,
  onConfirmRestart,
  onEmergencyRestart,
  onCancel,
  emergencyRestartAvailable,
  motivationalQuote,
}) => {
  const [countdown, setCountdown] = useState(10);
  const [canConfirm, setCanConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(10);
      setCanConfirm(false);
      return;
    }

    // 10秒倒计时
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanConfirm(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 animate-slide-up">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">重启确认</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {/* 警告文案 */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium mb-2">⚠️ 请三思而后行</p>
            <p className="text-red-700 text-sm">
              重启会重置该网站的使用时间，这可能会影响你今天的自律计划。请确保这真的是必要的。
            </p>
          </div>

          {/* 励志语句 */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-center italic">"{motivationalQuote}"</p>
          </div>

          {/* 按钮组 */}
          <div className="space-y-3">
            {/* 确定重启按钮 */}
            <button
              onClick={onConfirmRestart}
              disabled={!canConfirm}
              className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${
                canConfirm
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <RefreshCw className="w-5 h-5" />
              {canConfirm ? (
                "确定重启"
              ) : (
                <span>
                  请等待 <span className="font-mono font-bold">{countdown}</span> 秒
                </span>
              )}
            </button>

            {/* 紧急重启按钮 */}
            <button
              onClick={onEmergencyRestart}
              disabled={!emergencyRestartAvailable}
              className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${
                emergencyRestartAvailable
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Zap className="w-5 h-5" />
              {emergencyRestartAvailable ? "紧急重启" : "今日已使用紧急重启"}
            </button>

            {/* 取消重启按钮 */}
            <button
              onClick={onCancel}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              取消重启 (坚持自律)
            </button>
          </div>

          {/* 紧急重启说明 */}
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              💡 提示：紧急重启每天只能使用一次，且全局共享（任意网站使用后，其他网站也无法使用）
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

