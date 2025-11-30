/**
 * 待锁定状态全屏遮罩 Content Script
 * 显示30秒倒计时和紧急操作按钮
 */

import { useEffect, useState } from "react";
import cssText from "data-text:~styles/global.css";
import type { PlasmoCSConfig } from "plasmo";

import { AlertCircle, Lock, Zap } from "lucide-react";

import { DEFAULTS } from "~types";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false,
};

// 注入样式
export const getStyle = () => {
  const style = document.createElement("style");
  style.textContent = cssText;
  return style;
};

/**
 * 待锁定遮罩组件
 */
const PendingLockOverlay = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(DEFAULTS.PENDING_LOCK_DURATION);
  const [domain, setDomain] = useState("");
  const [reason, setReason] = useState<"time_limit" | "time_lock">("time_limit");

  useEffect(() => {
    // 检查当前页面是否需要显示待锁定遮罩
    checkPendingStatus();

    // 监听来自Background的消息
    const messageListener = (message: any) => {
      if (message.type === "SHOW_PENDING_LOCK") {
        showPendingLock(message.payload);
      } else if (message.type === "HIDE_PENDING_LOCK") {
        hidePendingLock();
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  // 倒计时效果
  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // 倒计时结束，自动锁定
          console.log("[PendingLock] 倒计时结束，自动锁定");
          handleLockImmediately();
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, domain]);

  /**
   * 检查待锁定状态
   */
  const checkPendingStatus = async () => {
    try {
      const currentDomain = extractDomain(window.location.href);
      if (!currentDomain) return;

      // 获取usage data直接从storage
      const result = await chrome.storage.local.get("usageData");
      const usageDataList = result.usageData || [];
      const today = new Date().toISOString().split("T")[0];
      
      const usageData = usageDataList.find(
        (data: any) => data.domain === currentDomain && data.date === today
      );

      if (usageData && usageData.status === "pending" && usageData.pendingStartTime) {
        const elapsed = Math.floor((Date.now() - usageData.pendingStartTime) / 1000);
        
        // 获取全局设置中的pending duration
        const settingsResult = await chrome.storage.local.get("globalSettings");
        const pendingDuration = settingsResult.globalSettings?.pendingLockDuration || DEFAULTS.PENDING_LOCK_DURATION;
        
        const remaining = Math.max(0, pendingDuration - elapsed);
        
        if (remaining > 0) {
          setDomain(currentDomain);
          setCountdown(remaining);
          setIsVisible(true);
        } else {
          // 时间已过，直接锁定
          console.log("[PendingLock] 待锁定时间已过，直接锁定");
          setDomain(currentDomain);
          await lockDomain(currentDomain);
        }
      }
    } catch (error) {
      console.error("[PendingLock] 检查待锁定状态失败:", error);
    }
  };

  /**
   * 锁定域名（独立函数，可直接传domain）
   */
  const lockDomain = async (targetDomain: string) => {
    try {
      console.log("[PendingLock] 发送锁定请求:", targetDomain);
      
      const response = await chrome.runtime.sendMessage({
        type: "LOCK_IMMEDIATELY",
        payload: { domain: targetDomain },
      });

      console.log("[PendingLock] 收到锁定响应:", response);

      if (response && response.success) {
        console.log("[PendingLock] 锁定成功:", targetDomain);
        // 隐藏遮罩，等待跳转
        hidePendingLock();
      } else {
        console.error("[PendingLock] 锁定失败:", response);
        alert("锁定失败，请刷新页面重试");
      }
    } catch (error) {
      console.error("[PendingLock] 锁定异常:", error);
      alert("锁定失败，请刷新页面重试");
    }
  };

  /**
   * 显示待锁定遮罩
   */
  const showPendingLock = (payload: {
    domain: string;
    reason: "time_limit" | "time_lock";
    pendingDuration?: number;
  }) => {
    setDomain(payload.domain);
    setReason(payload.reason);
    setCountdown(payload.pendingDuration || DEFAULTS.PENDING_LOCK_DURATION);
    setIsVisible(true);
    console.log(`[PendingLock] 显示待锁定遮罩: ${payload.domain}`);
  };

  /**
   * 隐藏待锁定遮罩
   */
  const hidePendingLock = () => {
    setIsVisible(false);
    console.log("[PendingLock] 隐藏待锁定遮罩");
  };

  /**
   * 处理紧急使用
   */
  const handleEmergencyUse = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "EMERGENCY_USE",
        payload: { domain },
      });

      if (response.success) {
        console.log(`[PendingLock] 紧急使用成功，增加${response.data.extraTime}秒`);
        hidePendingLock();
        // 刷新页面以恢复正常状态
        window.location.reload();
      }
    } catch (error) {
      console.error("[PendingLock] 紧急使用失败:", error);
    }
  };

  /**
   * 处理立即锁定
   */
  const handleLockImmediately = async () => {
    if (!domain) {
      console.error("[PendingLock] domain为空，无法锁定");
      return;
    }
    
    await lockDomain(domain);
  };

  if (!isVisible) return null;

  // 计算模糊度（从5px到25px，随倒计时递增）
  const totalDuration = DEFAULTS.PENDING_LOCK_DURATION;
  const progress = 1 - countdown / totalDuration;
  const blurAmount = 5 + progress * 20; // 5px -> 25px

  const reasonText =
    reason === "time_limit" ? "今日浏览时间已到达上限" : "当前处于固定锁定时间段";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2147483647,
        backdropFilter: `blur(${blurAmount}px)`,
        WebkitBackdropFilter: `blur(${blurAmount}px)`,
        backgroundColor: `rgba(0, 0, 0, ${0.3 + progress * 0.4})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "backdrop-filter 0.3s ease, background-color 0.3s ease",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "24px",
          padding: "48px",
          maxWidth: "560px",
          width: "90%",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
        className="animate-slide-up"
      >
        {/* 警告图标 */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "pulse 2s ease-in-out infinite",
            }}
          >
            <AlertCircle size={40} color="white" />
          </div>
        </div>

        {/* 标题 */}
        <h2
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#1f2937",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          {reasonText}
        </h2>

        {/* 倒计时显示 */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              fontSize: "72px",
              fontWeight: "800",
              color: countdown <= 10 ? "#ef4444" : "#3b82f6",
              lineHeight: "1",
              marginBottom: "12px",
              fontFamily: "system-ui, -apple-system, sans-serif",
              transition: "color 0.3s ease",
            }}
          >
            {countdown}
          </div>
          <p
            style={{
              fontSize: "18px",
              color: "#6b7280",
              margin: 0,
            }}
          >
            秒后将彻底无法访问
          </p>
        </div>

        {/* 提示文字 */}
        <p
          style={{
            fontSize: "16px",
            color: "#4b5563",
            textAlign: "center",
            lineHeight: "1.6",
            marginBottom: "32px",
          }}
        >
          您可以选择紧急使用额外时间，或立即锁定当前网站。
          <br />
          如无操作，倒计时结束后将自动跳转到阻止页面。
        </p>

        {/* 按钮组 */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
          }}
        >
          {/* 紧急使用按钮 */}
          <button
            onClick={handleEmergencyUse}
            style={{
              flex: "1",
              padding: "16px 24px",
              fontSize: "16px",
              fontWeight: "600",
              color: "white",
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(245, 158, 11, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.3)";
            }}
          >
            <Zap size={20} />
            紧急使用
          </button>

          {/* 立即锁定按钮 */}
          <button
            onClick={handleLockImmediately}
            style={{
              flex: "1",
              padding: "16px 24px",
              fontSize: "16px",
              fontWeight: "600",
              color: "white",
              background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              boxShadow: "0 4px 12px rgba(107, 114, 128, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(107, 114, 128, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(107, 114, 128, 0.3)";
            }}
          >
            <Lock size={20} />
            立即锁定
          </button>
        </div>

        {/* 额外信息 */}
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            background: "rgba(59, 130, 246, 0.1)",
            borderRadius: "12px",
            border: "1px solid rgba(59, 130, 246, 0.2)",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              color: "#3b82f6",
              margin: 0,
              textAlign: "center",
              lineHeight: "1.5",
            }}
          >
            💡 提示：紧急使用将为您增加 10 分钟的额外浏览时间
          </p>
        </div>
      </div>

      {/* 添加动画样式 */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.9;
            }
          }
        `}
      </style>
    </div>
  );
};

/**
 * 从URL提取域名
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^(www\.|m\.)/, "");
  } catch {
    return "";
  }
}

export default PendingLockOverlay;

