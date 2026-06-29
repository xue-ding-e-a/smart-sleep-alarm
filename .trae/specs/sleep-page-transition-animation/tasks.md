# 睡眠页面子页面切换动画 - Implementation Plan

## [x] Task 1: 调整日视图布局结构，将切换按钮移到顶部
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 在 `renderDayView()` 中将 `metrics-scroll-container` 移到 `sleep-main-header` 之后、`sleep-stage-card` 之前
  - 给切换按钮区域添加固定定位样式，使其不随页面滚动
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `human-judgment` TR-1.1: 切换按钮区域位于页面顶部（view-switcher 下方），滑动页面时保持固定
- **Notes**: 需要注意固定定位会改变布局，可能需要调整其他元素的 padding 或 margin

## [x] Task 2: 修改 sleep-stage-card 布局，支持详细分布图和横条图的切换
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 修改 `sleep-stage-card` 的结构，使其根据 `selectedMetric` 决定显示详细分布图还是横条图
  - 当 `selectedMetric === 'duration'` 时显示详细分布图，隐藏横条图
  - 当 `selectedMetric !== 'duration'` 时显示横条图，隐藏详细分布图
- **Acceptance Criteria Addressed**: [AC-2, AC-4]
- **Test Requirements**:
  - `human-judgment` TR-2.1: 睡眠总时长子页面只显示详细分布图，不显示横条图
  - `human-judgment` TR-2.2: 其他子页面只显示横条图，不显示详细分布图
  - `human-judgment` TR-2.3: 其他子页面在横条图下方显示对应信息图（心率曲线等）

## [x] Task 3: 实现分布图压缩/展开动画效果
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 通过 CSS transition 实现从详细分布图到横条图的压缩动画
  - 实现从横条图到详细分布图的展开动画
  - 动画时长约 300-400ms，使用 ease-out 缓动函数
- **Acceptance Criteria Addressed**: [AC-3, AC-5]
- **Test Requirements**:
  - `human-judgment` TR-3.1: 从睡眠总时长切换到其他子页面时，分布图平滑压缩为横条图
  - `human-judgment` TR-3.2: 从其他子页面切换回睡眠总时长时，横条图平滑展开为详细分布图
  - `human-judgment` TR-3.3: 动画流畅，无卡顿或闪烁

## [x] Task 4: 调整样式细节，确保视觉一致性
- **Priority**: medium
- **Depends On**: Task 3
- **Description**: 
  - 调整横条图的样式，使其在压缩状态下显示正确
  - 调整信息图（曲线图表）的布局，确保在横条图下方正确显示
  - 确保所有元素在日间/夜间主题下都能正确显示
- **Acceptance Criteria Addressed**: [AC-4]
- **Test Requirements**:
  - `human-judgment` TR-4.1: 横条图在压缩状态下显示完整，无截断
  - `human-judgment` TR-4.2: 信息图在横条图下方正确显示，间距合理
  - `human-judgment` TR-4.3: 夜间主题下所有元素颜色正确适配

## [x] Task 5: 验证编译和基本功能
- **Priority**: high
- **Depends On**: Task 4
- **Description**: 
  - 运行 TypeScript 编译检查，确保无类型错误
  - 验证页面功能正常，无 JavaScript 运行时错误
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3, AC-4, AC-5]
- **Test Requirements**:
  - `programmatic` TR-5.1: `npx tsc --noEmit` 编译通过，无错误
  - `human-judgment` TR-5.2: 页面加载正常，切换子页面功能正常