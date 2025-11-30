# 07 - User Flow

**Version**: v1.0.0  
**Last Updated**: 2024

---

## 1. Three-State Transition

```
Active (Usable)
    ↓ Time limit reached OR
    ↓ Enter fixed time lock
Pending (Awaiting Lock)
    ├─ Wait 30s → Locked
    ├─ Emergency use → Active
    └─ Lock immediately → Locked
Locked (Blocked)
    ↓ Restart (multi-layer verification)
Active
```

---

## 2. Restart Flow

```
Click "Restart" on block page
    ↓
First Dialog
    ├─ Wait 10s → Click "Confirm Restart"
    │   ↓ Second Dialog
    │   ↓ Enter 120 words
    │   └─ Execute restart
    ├─ Click "Emergency Restart"
    │   └─ Check daily limit → Restart
    └─ Click "Cancel"
        └─ Confetti effect
```

---

## 3. Complete Usage Flow

```
1. Install extension
    ↓
2. Open Options Page
    ↓
3. Add restricted websites
    ↓
4. (Optional) Configure fixed time lock
    ↓
5. Visit restricted website
    ↓
6. System starts counting
    ↓
7. Time limit reached
    ↓
8. Enter Pending state
    ↓
9. Locked state
    ↓
10. (Optional) Use restart feature
    ↓
11. Auto reset next day
```

---

**Document Version**: v1.0.0  
**Maintainer**: ParaSLee  
**Last Updated**: 2024
