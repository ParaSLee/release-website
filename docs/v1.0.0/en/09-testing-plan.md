# 09 - Testing Plan

**Version**: v1.0.0  
**Last Updated**: 2024

---

## 1. Functional Testing

### 1.1 Basic Time Limits
- [ ] Add website
- [ ] Edit website
- [ ] Delete website
- [ ] Set time limits
- [ ] Auto lock when time reached
- [ ] Daily auto reset

### 1.2 Three-State Management
- [ ] Active → Pending transition
- [ ] Pending → Locked transition
- [ ] Pending → Active (emergency use)
- [ ] Locked → Active (restart)
- [ ] State persistence

### 1.3 30-Second Buffer
- [ ] Full-screen overlay display
- [ ] 30-second countdown accurate
- [ ] Dynamic blur intensity
- [ ] Emergency use button
- [ ] Lock immediately button

### 1.4 Restart Feature
- [ ] First dialog display
- [ ] 10-second countdown accurate
- [ ] Emergency restart daily limit
- [ ] Second dialog display
- [ ] 120-word generation
- [ ] Input validation accurate
- [ ] Confetti effect display
- [ ] Time reset after restart
- [ ] Fixed time lock disabled

### 1.5 Fixed Time Lock
- [ ] Add time period
- [ ] Delete time period
- [ ] Cross-midnight period
- [ ] Two restriction modes
- [ ] Period enable/disable

---

## 2. Edge Case Testing

### 2.1 Midnight Transition
- [ ] 23:59 → 00:00 data reset
- [ ] Cross-midnight periods work correctly

### 2.2 Browser Restart
- [ ] Data persistence
- [ ] State recovery
- [ ] Counting continues

### 2.3 Multi-Tab Scenarios
- [ ] Time accumulates correctly
- [ ] State syncs correctly
- [ ] Fast tab switching

---

## 3. Performance Testing

### 3.1 Loading Performance
- Content Script injection < 100ms
- Overlay rendering < 50ms

### 3.2 Memory Usage
- Background < 50MB
- Content Script < 10MB

### 3.3 Animation Smoothness
- All animations 60FPS
- Glassmorphism no lag

---

## 4. Compatibility Testing

### 4.1 Browser Versions
- Chrome 90+
- Edge 90+

### 4.2 Screen Resolutions
- 1280x720
- 1920x1080
- 2560x1440

---

## 5. Acceptance Criteria

- All core features working
- No obvious bugs
- Good performance
- Beautiful UI

---

**Document Version**: v1.0.0  
**Maintainer**: ParaSLee  
**Last Updated**: 2024
