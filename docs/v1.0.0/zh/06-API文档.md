# 06 - API文档

**版本**: v1.0.0  
**最后更新**: 2024

---

## 1. Background Service API

### 1.1 消息通信协议

#### 获取网站状态
```typescript
// Content Script → Background
chrome.runtime.sendMessage({
  type: 'GET_WEBSITE_STATUS',
  payload: {
    domain: 'youtube.com'
  }
});

// Background → Content Script
{
  status: 'active' | 'pending' | 'locked',
  remainingTime: 1800, // 秒
  usedTime: 1200,
  dailyLimit: 3600
}
```

#### 紧急使用
```typescript
// Content Script → Background
chrome.runtime.sendMessage({
  type: 'EMERGENCY_USE',
  payload: {
    domain: 'youtube.com'
  }
});

// Response
{
  success: true,
  newRemainingTime: 2400 // +600秒（10分钟）
}
```

#### 重启网站
```typescript
// Block Page → Background
chrome.runtime.sendMessage({
  type: 'RESTART_WEBSITE',
  payload: {
    domain: 'youtube.com',
    type: 'normal' | 'emergency'
  }
});

// Response
{
  success: true,
  emergencyRestartUsed: false
}
```

---

## 2. Storage API

### 2.1 数据读取

```typescript
// 获取所有网站配置
chrome.storage.local.get('websites', (result) => {
  const websites: WebsiteConfig[] = result.websites || [];
});

// 获取使用数据
chrome.storage.local.get('usageData', (result) => {
  const usageData: UsageData[] = result.usageData || [];
});
```

### 2.2 数据写入

```typescript
// 保存网站配置
chrome.storage.local.set({ websites: newWebsites });

// 保存使用数据
chrome.storage.local.set({ usageData: newUsageData });
```

### 2.3 监听变化

```typescript
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.usageData) {
    const oldValue = changes.usageData.oldValue;
    const newValue = changes.usageData.newValue;
    // 处理数据变化
  }
});
```

---

## 3. Hooks API

### 3.1 useStorage

```typescript
const [websites, setWebsites] = useStorage<WebsiteConfig[]>('websites');

// 更新数据
setWebsites([...websites, newWebsite]);
```

### 3.2 useWebsites

```typescript
const {
  websites,
  addWebsite,
  updateWebsite,
  deleteWebsite,
  toggleWebsite
} = useWebsites();

// 添加网站
await addWebsite({
  domain: 'youtube.com',
  displayName: 'YouTube',
  dailyLimit: 3600,
  enabled: true
});
```

### 3.3 useUsageData

```typescript
const {
  todayUsage,
  weeklyStats,
  refreshUsage
} = useUsageData('youtube.com');
```

---

**文档版本**: v1.0.0  
**维护者**: ParaSLee  
**最后更新**: 2024
