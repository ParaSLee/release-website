# 05 - Data Structure Design

**Version**: v1.0.0  
**Last Updated**: 2024

---

## 1. Core Data Structures

### 1.1 WebsiteConfig

```typescript
interface WebsiteConfig {
  id: string;                  // Unique ID (UUID)
  domain: string;              // Domain (e.g., youtube.com)
  displayName: string;         // Display name
  dailyLimit: number;          // Daily limit (seconds)
  enabled: boolean;            // Enabled status
  icon?: string;               // Website icon
  createdAt: number;           // Creation timestamp
}
```

### 1.2 UsageData

```typescript
interface UsageData {
  domain: string;              // Domain
  date: string;                // Date (YYYY-MM-DD)
  usedTime: number;            // Used time (seconds)
  startTime?: number;          // Session start timestamp
  activeTabId?: number;        // Active tab ID
  lastUpdate: number;          // Last update timestamp
  status: 'active' | 'pending' | 'locked';  // Status
  pendingStartTime?: number;   // Pending state start time
  emergencyUsedToday: number;  // Emergency uses today
  restarted: boolean;          // Restarted today
  restartedAt?: number;        // Last restart time
  timeLockDisabled: boolean;   // Time lock disabled
}
```

### 1.3 TimeLockPeriod

```typescript
interface TimeLockPeriod {
  id: string;                  // Unique ID
  startTime: string;           // Start time (HH:mm)
  endTime: string;             // End time (HH:mm)
  enabled: boolean;            // Enabled status
  label?: string;              // Label (e.g., "Sleep Time")
}
```

### 1.4 TimeLockSettings

```typescript
interface TimeLockSettings {
  enabled: boolean;            // Master switch
  mode: 'restricted' | 'all';  // restricted or all HTTP/HTTPS
  periods: TimeLockPeriod[];   // Time lock periods
}
```

### 1.5 GlobalSettings

```typescript
interface GlobalSettings {
  resetTime: string;           // Reset time (HH:mm)
  floatingPosition: { x: number; y: number };
  isCollapsed: boolean;
  emergencyExtraTime: number;  // Emergency extra time (seconds)
  pendingLockDuration: number; // Pending duration (seconds)
  emergencyRestartUsedToday: boolean;
  emergencyRestartUsedDate: string;
}
```

---

## 2. Storage Schema

### 2.1 Chrome Storage Structure

```typescript
interface StorageSchema {
  websites: WebsiteConfig[];
  usageData: UsageData[];
  timeLockSettings: TimeLockSettings;
  globalSettings: GlobalSettings;
}
```

---

**Document Version**: v1.0.0  
**Maintainer**: ParaSLee  
**Last Updated**: 2024
