# 03 - Product Design

**Version**: v1.0.0  
**Last Updated**: 2024

---

## 1. Four Core Modules

### 1.1 Module 1: Control Panel System

#### Popup Page
**Function**: Quick overview of today's usage

**Layout**:
- Website list with usage status
- Restart indicators
- Emergency restart status
- Link to Options Page

#### Options Page
**Function**: Complete configuration interface

**Structure**:
- Sidebar navigation (4 Tabs)
- Usage Limits Tab
- Fixed Time Lock Tab
- Reset Configuration Tab
- Data Management Tab

### 1.2 Module 2: Content Injection System

#### Timer Overlay Design

**Expanded State**:
- macOS glassmorphism effect
- Remaining time display
- Progress bar
- Draggable

**Collapsed State**:
- Circular progress indicator
- Time percentage
- Minimal footprint

### 1.3 Module 3: Time Management System

#### Three-State Flow

```
Active → Pending → Locked
  ↑                   │
  └───────────────────┘
      (Restart)
```

#### Pending State UI
- Full-screen glassmorphism overlay
- 30-second countdown
- Dynamic blur intensity
- Emergency use button
- Lock immediately button

### 1.4 Module 4: Block Page & Restart System

#### Block Page Design
- Block reason
- Usage statistics
- Motivational quotes
- Alternative activity suggestions
- Restart button

#### Restart Flow
1. **First Dialog**: Warning + 10-second countdown
2. **Second Dialog**: 120-word input verification
3. **Confetti Effect**: Positive reinforcement

---

## 2. UI/UX Design Principles

### 2.1 Design Principles

#### Gentle Yet Firm
- Not cold "prohibition"
- Warm "reminder"
- Respect user choices

#### Positive Motivation
- Confetti effects
- Motivational quotes
- Usage statistics visualization

---

**Document Version**: v1.0.0  
**Maintainer**: ParaSLee  
**Last Updated**: 2024
