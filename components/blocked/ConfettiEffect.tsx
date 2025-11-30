/**
 * 礼花效果组件
 * 用于取消重启时的祝贺动画
 */

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiEffectProps {
  show: boolean;
  message: string;
  onComplete?: () => void;
}

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ show, message, onComplete }) => {
  useEffect(() => {
    if (!show) return;

    // 触发礼花效果
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        if (onComplete) {
          setTimeout(onComplete, 500);
        }
        return;
      }

      const particleCount = 50;

      // 从左侧发射
      confetti({
        particleCount,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"],
      });

      // 从右侧发射
      confetti({
        particleCount,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"],
      });

      // 从中间向上发射
      confetti({
        particleCount: particleCount / 2,
        angle: 90,
        spread: 45,
        origin: { x: 0.5, y: 0.8 },
        colors: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"],
        startVelocity: 45,
      });
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md animate-slide-up pointer-events-auto">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
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
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 {message}</h2>
          <p className="text-gray-600">继续保持你的专注和自律！</p>
        </div>
      </div>
    </div>
  );
};

