# 04 - Technical Architecture

**Version**: v1.0.0  
**Last Updated**: 2024

---

## 1. Technology Stack

### 1.1 Core Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| Plasmo Framework | 0.90.5 | Chrome extension framework |
| React | 18.2.0 | UI library |
| TypeScript | 5.3.3 | Type system |
| Tailwind CSS | 3.x | Styling |

### 1.2 Auxiliary Libraries

| Library | Purpose |
|---------|---------|
| Day.js | Time handling |
| canvas-confetti | Confetti effects |
| Recharts | Charts |
| Lucide React | Icons |
| Headless UI | Dialogs |

---

## 2. System Architecture

### 2.1 Architecture Diagram

```
Chrome Browser
├── Background Service Worker
│   ├─ Time management core
│   ├─ State management
│   ├─ Tab monitoring
│   └─ Scheduled tasks
├── Content Scripts
│   ├─ timer-overlay.tsx
│   └─ pending-lock-overlay.tsx
├── UI Pages
│   ├─ popup.tsx
│   ├─ options.tsx
│   └─ blocked.tsx
└── chrome.storage.local
    ├─ WebsiteConfig[]
    ├─ UsageData[]
    └─ GlobalSettings
```

### 2.2 Module Responsibilities

#### Background Service Worker
- Monitor Tab activation/switching
- Manage three states
- Time calculation and sync
- Scheduled tasks (daily reset)
- Message communication center

#### Content Script
- Inject timer overlay
- Inject pending lock overlay
- Receive Background messages
- DOM operations

#### UI Pages
- Popup: Quick overview
- Options: Complete configuration
- Blocked: Block page

---

## 3. Data Flow

### 3.1 Time Counting Flow

```
Tab activated
    ↓
Background detects event
    ↓
Check if domain is restricted
    ↓
If restricted → Start counting
    ↓
Update usedTime every second
    ↓
Save to chrome.storage.local
    ↓
Notify Content Script to update UI
```

---

## 4. Key Technical Implementations

### 4.1 Three-State Management

```typescript
type Status = 'active' | 'pending' | 'locked';

interface UsageData {
  status: Status;
  // ...
}
```

### 4.2 Glassmorphism Effect

```css
.glassmorphism {
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

---

**Document Version**: v1.0.0  
**Maintainer**: ParaSLee  
**Last Updated**: 2024
