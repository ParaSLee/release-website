# 08 - Restart Mechanism

**Version**: v1.0.0  
**Last Updated**: 2024

---

## 1. Restart Mechanism Overview

The restart mechanism is a core innovative feature that balances "flexibility" and "firmness" through multi-layer verification.

### 1.1 Design Philosophy

**Why need restart feature?**
- Emergency situations require access to blocked websites
- Complete prohibition leads to user uninstalling
- Need "regret medicine" but with increased difficulty

**How to balance flexibility and firmness?**
- **Flexibility**: Provide restart option
- **Firmness**: Increase restart difficulty through multi-layer verification
- **Motivation**: Positive feedback for canceling restart

---

## 2. Three-Layer Verification Design

### 2.1 Layer 1: Restart Button

**Location**: Block page  
**Purpose**: Entry point

### 2.2 Layer 2: Warning & Choice

**First Dialog Content**:
1. **Warning Title**: "Warning: Stay Disciplined"
2. **Motivational Quote**: Randomly displayed
3. **Three Buttons**:
   - Confirm Restart (10-second countdown)
   - Emergency Restart (once per day)
   - Cancel Restart

**Design Points**:
- **10-second countdown**: Cooling-off period
- **Emergency Restart**: Fast track with global limit
- **Cancel Button**: Confetti effect for positive feedback

### 2.3 Layer 3: Word Verification

**Second Dialog Content**:
1. **120 Random Words**: From preset dictionary
2. **Input Box**: Must match exactly
3. **Real-time Verification**: Shows match percentage
4. **Two Buttons**:
   - Confirm (enabled only when matched)
   - Cancel (confetti effect)

**Design Points**:
- **120 Words**: Sufficient difficulty (3-5 minutes)
- **Exact Match**: Case, spaces, punctuation must match
- **Reflection During Process**: Input process prompts rethinking

---

## 3. Emergency Restart Mechanism

### 3.1 Emergency Restart Characteristics

**Limit**:
- Once per day only
- **Globally Shared**: Used on any website, unavailable for others

**Implementation**:
```typescript
interface GlobalSettings {
  emergencyRestartUsedToday: boolean;
  emergencyRestartUsedDate: string;
}

function canUseEmergencyRestart(): boolean {
  const today = formatDate(new Date());
  return !settings.emergencyRestartUsedToday || 
         settings.emergencyRestartUsedDate !== today;
}
```

---

## 4. Confirm Restart Mechanism

### 4.1 Word Generator

**Dictionary**:
- 1000+ common English words
- Simple and easy to spell
- Avoid uncommon words

**Generation Logic**:
```typescript
function generateWords(count: number = 120): string {
  const words: string[] = [];
  const wordBank = COMMON_WORDS;
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * wordBank.length);
    words.push(wordBank[randomIndex]);
  }
  
  return words.join(' ');
}
```

---

## 5. Restart Execution Logic

### 5.1 Restart Operation

```typescript
async function restartWebsite(domain: string) {
  const usageData = await getTodayUsage(domain);
  
  // Reset time
  usageData.usedTime = 0;
  usageData.status = 'active';
  usageData.restarted = true;
  usageData.restartedAt = Date.now();
  
  // If restarting during fixed time lock
  if (isInTimeLockPeriod(domain)) {
    usageData.timeLockDisabled = true;
  }
  
  await saveUsageData(usageData);
  chrome.tabs.update({ url: `https://${domain}` });
}
```

---

## 6. Confetti Effect

### 6.1 Trigger Timing

**Two Occasions**:
1. First dialog click "Cancel Restart"
2. Second dialog click "Cancel"

### 6.2 Implementation

```typescript
import confetti from 'canvas-confetti';

function showConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
  
  showMessage('Congratulations on your persistence!');
}
```

---

**Document Version**: v1.0.0  
**Maintainer**: ParaSLee  
**Last Updated**: 2024
