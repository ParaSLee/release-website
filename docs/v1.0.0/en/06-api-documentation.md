# 06 - API Documentation

**Version**: v1.0.0  
**Last Updated**: 2024

---

## 1. Background Service API

### 1.1 Message Communication Protocol

#### Get Website Status
```typescript
// Content Script → Background
chrome.runtime.sendMessage({
  type: 'GET_WEBSITE_STATUS',
  payload: { domain: 'youtube.com' }
});

// Response
{
  status: 'active' | 'pending' | 'locked',
  remainingTime: 1800,
  usedTime: 1200,
  dailyLimit: 3600
}
```

#### Emergency Use
```typescript
// Content Script → Background
chrome.runtime.sendMessage({
  type: 'EMERGENCY_USE',
  payload: { domain: 'youtube.com' }
});

// Response
{
  success: true,
  newRemainingTime: 2400
}
```

#### Restart Website
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

### 2.1 Data Reading

```typescript
chrome.storage.local.get('websites', (result) => {
  const websites: WebsiteConfig[] = result.websites || [];
});
```

### 2.2 Data Writing

```typescript
chrome.storage.local.set({ websites: newWebsites });
```

---

## 3. Hooks API

### 3.1 useStorage

```typescript
const [websites, setWebsites] = useStorage<WebsiteConfig[]>('websites');
```

### 3.2 useWebsites

```typescript
const {
  websites,
  addWebsite,
  updateWebsite,
  deleteWebsite
} = useWebsites();
```

---

**Document Version**: v1.0.0  
**Maintainer**: ParaSLee  
**Last Updated**: 2024
