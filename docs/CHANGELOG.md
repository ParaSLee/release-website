# 更新日志 / Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### In Development - v1.0.0
正在开发v1.0.0初始版本，包含所有核心功能。

---

## [1.0.0] - TBD

### Added - 新增功能

#### 控制后台系统
- Popup页面显示今日使用情况概览
- Popup页面显示重启标记和紧急重启状态
- Options Page包含4个Tab：使用限制、固定时间限制、重置配置、数据管理
- 网址清单管理（增删改查）
- 固定时间锁定配置（支持多个时间段）
- 每日重置时间点自定义设置
- 数据导入/导出功能

#### 内容注入系统
- 右下角倒计时悬浮窗（macOS毛玻璃效果）
- 悬浮窗展开/收起两种状态
- 支持拖拽并保存位置
- 在待锁定/已锁定状态时自动隐藏

#### 时间管理与锁定系统
- 三状态管理系统（Active/Pending/Locked）
- 30秒待锁定缓冲机制
- 全屏毛玻璃遮罩（动态模糊度变化）
- 紧急使用功能（+10分钟，无次数限制）
- 立即锁定按钮
- Tab激活状态监听（只对活跃tab计时）
- 跨tab时间和状态同步
- 每日自动重置机制
- 固定时间限制检测（支持跨午夜）
- 重启状态管理

#### 阻止页面与重启系统
- 激励性阻止页面（显示原因、时长、励志语句、替代活动）
- 今日/本周使用统计图表
- **多层验证重启机制**：
  - 第一层：重启按钮
  - 第二层：10秒冷静倒计时 + 三个选项（确定重启/紧急重启/取消）
  - 第三层：120个随机单词输入验证
- 紧急重启功能（每日一次全局限制）
- 礼花效果（取消重启时的激励动画）
- 重启执行逻辑（时间重置、状态切换）
- 重启后固定时间锁定禁用（网址级别）
- 网址隔离（不同网址独立管理）
- 重启标记显示（Popup和Options中）

#### 数据与工具
- 完整的TypeScript类型系统
- Chrome Storage API封装（useStorage hooks）
- 域名匹配工具（支持子域名）
- 时间工具函数（格式化、计算）
- 固定时间锁定检测工具（支持跨午夜）
- 三状态管理工具
- 随机单词生成器（1000+单词词库）
- 重启管理工具
- 励志内容库

#### UI/UX
- macOS风格毛玻璃效果（backdrop-filter）
- 平滑的动画过渡效果
- 响应式设计
- Tailwind CSS样式系统

### Technical Details - 技术细节

#### 技术栈
- Plasmo Framework 0.90.5
- React 18.2.0
- TypeScript 5.3.3
- Tailwind CSS
- Day.js（时间处理）
- canvas-confetti（礼花效果）
- Recharts（统计图表）
- Lucide React（图标库）
- Headless UI（对话框组件）

#### 架构
- Background Service Worker（核心时间管理）
- Content Script（页面注入）
- Popup Page（快速概览）
- Options Page（完整设置）
- Block Page（阻止页面）

#### 权限
- `storage`：存储配置和使用数据
- `tabs`：监听tab切换
- `alarms`：定时重置功能
- `webNavigation`：监听页面导航
- `scripting`：动态注入content script
- `host_permissions: ["<all_urls>"]`：注入content script

### Known Issues - 已知问题
- 隐身模式下的数据不会同步到正常模式
- 时间精度可能有1-2秒的误差
- 固定时间限制"所有HTTP/HTTPS"模式无法拦截chrome://等系统页面
- 毛玻璃效果在某些网站可能与页面样式冲突

### Known Limitations - 已知限制
- 120单词验证可以通过复制粘贴绕过（但需用户主动操作）
- 紧急重启的每日一次限制可以通过修改系统时间绕过（但需重启浏览器）
- 重启功能虽有多层验证，但用户真的想绕过时仍可完成

---

## Version History - 版本历史

### v1.0.0 (Initial Release)
- **Release Date**: TBD
- **Branch**: master
- **Tag**: v1.0.0
- **Status**: 🚧 In Development
- **Total Features**: 50+
- **Estimated Effort**: 42-52 hours
- **Documentation**: Complete (Chinese & English)

---

## Future Versions - 未来版本

### v1.1.0 (Planned for Q2 2024)
**主题**: 增强功能
- 密码保护功能
- 提醒系统
- 统计报告
- 重启历史记录
- 白名单模式
- 分组管理
- 自定义选项

### v1.2.0 (Planned for Q3 2024)
**主题**: 高级功能
- 专注模式
- 目标设定系统
- Pomodoro番茄钟
- 数学题验证
- 自定义励志语句库

### v2.0.0 (Planned for Q4 2024)
**主题**: 生态系统
- 云端同步
- 移动端伴侣应用
- AI分析与建议
- 社交功能
- 多设备协同
- 家长控制模式

---

## Changelog Format - 更新日志格式

### Added - 新增
新功能。

### Changed - 变更
已有功能的变更。

### Deprecated - 弃用
即将删除的功能。

### Removed - 移除
已删除的功能。

### Fixed - 修复
任何bug修复。

### Security - 安全
有关安全性的变更。

---

**维护者 / Maintainer**: ParaSLee

**仓库 / Repository**: [github.com/ParaSLee/release-website](https://github.com/ParaSLee/release-website)

**最后更新 / Last Updated**: 2024
