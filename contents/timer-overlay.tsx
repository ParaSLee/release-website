/**
 * 倒计时悬浮窗 Content Script
 * 显示在页面右下角，展示剩余可用时间
 */

import { useEffect, useState } from "react";
import cssText from "data-text:~styles/global.css";
import type { PlasmoCSConfig } from "plasmo";

import { ChevronDown, ChevronUp, Clock } from "lucide-react";

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
 * 倒计时悬浮窗组件
 */
const TimerOverlay = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [domain, setDomain] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false); // 追踪是否发生了实际拖动
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 }); // 拖动开始的位置

  useEffect(() => {
    // 初始化：检查当前页面状态
    checkTimerStatus();

    // 定期更新（每秒）
    const interval = setInterval(checkTimerStatus, 1000);

    // 监听来自Background的消息
    const messageListener = (message: any) => {
      if (message.type === "UPDATE_TIMER") {
        updateTimer(message.payload);
      } else if (message.type === "HIDE_TIMER") {
        setIsVisible(false);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // 加载保存的位置和状态
    loadSettings();

    return () => {
      clearInterval(interval);
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  /**
   * 检查计时器状态
   */
  const checkTimerStatus = async () => {
    try {
      const currentDomain = extractDomain(window.location.href);
      if (!currentDomain) return;

      const response = await chrome.runtime.sendMessage({
        type: "GET_WEBSITE_STATUS",
        payload: { domain: currentDomain },
      });

      if (response.success) {
        const data = response.data;
        
        // 只在active状态显示计时器
        if (data.status === "active" && data.dailyLimit > 0) {
          setDomain(currentDomain);
          setDisplayName(getDisplayName(currentDomain));
          setRemainingTime(data.remainingTime);
          setTotalTime(data.dailyLimit);
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    } catch (error) {
      console.error("[Timer] 检查计时器状态失败:", error);
    }
  };

  /**
   * 更新计时器
   */
  const updateTimer = (payload: {
    domain: string;
    remainingTime: number;
    totalTime: number;
  }) => {
    setDomain(payload.domain);
    setDisplayName(getDisplayName(payload.domain));
    setRemainingTime(payload.remainingTime);
    setTotalTime(payload.totalTime);
    setIsVisible(true);
  };

  /**
   * 加载设置
   */
  const loadSettings = async () => {
    try {
      const result = await chrome.storage.local.get("globalSettings");
      if (result.globalSettings) {
        const { floatingPosition, isCollapsed } = result.globalSettings;
        if (floatingPosition) {
          setPosition(floatingPosition);
        }
        setIsExpanded(!isCollapsed);
      }
    } catch (error) {
      console.error("[Timer] 加载设置失败:", error);
    }
  };

  /**
   * 保存设置
   */
  const saveSettings = async (newPosition?: { x: number; y: number }, newCollapsed?: boolean) => {
    try {
      const result = await chrome.storage.local.get("globalSettings");
      const globalSettings = result.globalSettings || {};

      await chrome.storage.local.set({
        globalSettings: {
          ...globalSettings,
          floatingPosition: newPosition || position,
          isCollapsed: newCollapsed !== undefined ? newCollapsed : !isExpanded,
        },
      });
    } catch (error) {
      console.error("[Timer] 保存设置失败:", error);
    }
  };

  /**
   * 切换展开/收起
   */
  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    saveSettings(undefined, !newExpanded);
  };

  /**
   * 处理拖拽开始
   */
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setHasDragged(false); // 重置拖动标记
    setDragStartPos({ x: e.clientX, y: e.clientY }); // 记录起始位置
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  /**
   * 处理拖拽
   */
  const handleDrag = (e: MouseEvent) => {
    if (!isDragging) return;

    // 检查是否移动了足够的距离（超过5px视为拖动）
    const deltaX = Math.abs(e.clientX - dragStartPos.x);
    const deltaY = Math.abs(e.clientY - dragStartPos.y);
    if (!hasDragged && (deltaX > 5 || deltaY > 5)) {
      setHasDragged(true);
    }

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // 限制在视口内
    const maxX = window.innerWidth - (isExpanded ? 320 : 80);
    const maxY = window.innerHeight - (isExpanded ? 160 : 80);

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  /**
   * 处理拖拽结束
   */
  const handleDragEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      if (hasDragged) {
        // 只有真正拖动了才保存位置
        saveSettings(position);
      }
    }
  };

  // 监听鼠标移动和释放
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleDrag);
      document.addEventListener("mouseup", handleDragEnd);

      return () => {
        document.removeEventListener("mousemove", handleDrag);
        document.removeEventListener("mouseup", handleDragEnd);
      };
    }
  }, [isDragging]);

  if (!isVisible) return null;

  // 计算百分比
  const percentage = totalTime > 0 ? (remainingTime / totalTime) * 100 : 0;

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${minutes}:${String(secs).padStart(2, "0")}`;
  };

  // 收起状态：圆形进度条
  if (!isExpanded) {
    // 计算圆周长：2 * π * r，其中 r = 26
    const radius = 26;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    // 根据剩余时间决定颜色
    const progressColor = remainingTime < 300 ? "#ef4444" : "#3b82f6";
    const bgColor = remainingTime < 300 ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.15)";

    return (
      <div
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: "72px",
          height: "72px",
          zIndex: 2147483646,
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        onMouseDown={handleDragStart}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            // macOS毛玻璃效果：半透明背景 + 强模糊 + 饱和度增强
            background: "rgba(255, 255, 255, 0.25)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            // macOS风格边框和阴影
            border: "0.5px solid rgba(255, 255, 255, 0.3)",
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.12),
              0 2px 8px rgba(0, 0, 0, 0.08),
              inset 0 0 0 1px rgba(255, 255, 255, 0.5),
              inset 0 -1px 1px 0 rgba(0, 0, 0, 0.05)
            `,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onClick={(e) => {
            e.stopPropagation();
            // 只有在没有发生拖动的情况下才切换展开状态
            if (!hasDragged) {
              toggleExpanded();
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05) translateY(-2px)";
            e.currentTarget.style.boxShadow = `
              0 12px 48px rgba(0, 0, 0, 0.15),
              0 4px 12px rgba(0, 0, 0, 0.1),
              inset 0 0 0 1px rgba(255, 255, 255, 0.6),
              inset 0 -1px 1px 0 rgba(0, 0, 0, 0.05)
            `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1) translateY(0)";
            e.currentTarget.style.boxShadow = `
              0 8px 32px rgba(0, 0, 0, 0.12),
              0 2px 8px rgba(0, 0, 0, 0.08),
              inset 0 0 0 1px rgba(255, 255, 255, 0.5),
              inset 0 -1px 1px 0 rgba(0, 0, 0, 0.05)
            `;
          }}
        >
          {/* 背景圆环 */}
          <svg
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              transform: "rotate(-90deg)",
            }}
          >
            {/* 背景圆 */}
            <circle
              cx="36"
              cy="36"
              r={radius}
              fill="none"
              stroke={bgColor}
              strokeWidth="4"
            />
            {/* 进度圆 */}
            <circle
              cx="36"
              cy="36"
              r={radius}
              fill="none"
              stroke={progressColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease",
              }}
            />
          </svg>

          {/* 中心内容 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <Clock size={18} color={progressColor} strokeWidth={2.5} style={{ marginBottom: "3px" }} />
            <span
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: progressColor,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 展开状态：完整信息卡片
  return (
    <div
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: "320px",
        zIndex: 2147483646,
        cursor: isDragging ? "grabbing" : "default",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <div
        style={{
          // macOS毛玻璃效果：半透明背景 + 强模糊 + 饱和度增强
          background: "rgba(255, 255, 255, 0.3)",
          backdropFilter: "blur(30px) saturate(180%)",
          WebkitBackdropFilter: "blur(30px) saturate(180%)",
          borderRadius: "20px",
          padding: "24px",
          // macOS风格边框和阴影
          border: "0.5px solid rgba(255, 255, 255, 0.3)",
          boxShadow: `
            0 10px 40px rgba(0, 0, 0, 0.15),
            0 3px 12px rgba(0, 0, 0, 0.1),
            inset 0 0 0 1px rgba(255, 255, 255, 0.4),
            inset 0 -2px 2px 0 rgba(0, 0, 0, 0.05)
          `,
        }}
      >
        {/* 头部：拖拽区域 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            cursor: "grab",
          }}
          onMouseDown={handleDragStart}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(59, 130, 246, 0.1)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={18} color="#3b82f6" strokeWidth={2.5} />
            </div>
            <span
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "rgba(0, 0, 0, 0.85)",
                letterSpacing: "-0.01em",
              }}
            >
              {displayName}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
            style={{
              background: "rgba(0, 0, 0, 0.04)",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.12)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0, 0, 0, 0.04)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <ChevronDown size={18} color="rgba(0, 0, 0, 0.6)" strokeWidth={2.5} />
          </button>
        </div>

        {/* 剩余时间显示 */}
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              fontSize: "40px",
              fontWeight: "600",
              color: remainingTime < 300 ? "#ef4444" : "#3b82f6",
              lineHeight: "1.1",
              marginBottom: "6px",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
              letterSpacing: "-0.02em",
              transition: "color 0.3s ease",
            }}
          >
            {formatTime(remainingTime)}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "rgba(0, 0, 0, 0.5)",
              fontWeight: "500",
              letterSpacing: "-0.01em",
            }}
          >
            剩余可用时间
          </div>
        </div>

        {/* 进度条 */}
        <div
          style={{
            width: "100%",
            height: "6px",
            background: "rgba(0, 0, 0, 0.08)",
            borderRadius: "10px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${percentage}%`,
              height: "100%",
              background:
                remainingTime < 300
                  ? "linear-gradient(90deg, #ef4444 0%, #f87171 100%)"
                  : "linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)",
              transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease",
              borderRadius: "10px",
              boxShadow: "0 0 8px rgba(59, 130, 246, 0.3)",
            }}
          />
        </div>

        {/* 统计信息 */}
        <div
          style={{
            marginTop: "14px",
            fontSize: "11px",
            color: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "500",
            letterSpacing: "0.01em",
          }}
        >
          <span>已使用 {formatTime(totalTime - remainingTime)}</span>
          <span>总计 {formatTime(totalTime)}</span>
        </div>
      </div>
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

/**
 * 获取显示名称
 */
function getDisplayName(domain: string): string {
  const name = domain.split(".")[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export default TimerOverlay;

