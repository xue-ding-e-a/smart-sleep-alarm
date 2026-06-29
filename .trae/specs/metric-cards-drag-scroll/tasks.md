# 睡眠页指标卡片拖拽滑动 - Task List

## [x] Task 1: 在 index.tsx 中实现拖拽滑动逻辑
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 为 `.metrics-scroll` 容器添加鼠标事件处理
  - 监听 `onMouseDown`、`onMouseMove`、`onMouseUp`、`onMouseLeave` 事件
  - 实现拖拽状态管理（isDragging、startX、scrollLeft）
  - 拖拽时阻止默认行为，防止选中文本
  - 边界限制：拖拽到左边界或右边界时不再继续滚动
  - 点击识别：区分点击（移动距离小）和拖拽（移动距离大）
- **Acceptance Criteria Addressed**: 电脑端拖拽滑动、拖拽边界限制、点击选择卡片
- **Test Requirements**:
  - TR-1.1: 鼠标按下并拖动，卡片跟随移动
  - TR-1.2: 拖动到左边界时停止
  - TR-1.3: 拖动到右边界时停止
  - TR-1.4: 快速点击卡片不触发拖拽，卡片被选中

## [x] Task 2: 添加拖拽相关 CSS 样式
- **Priority**: medium
- **Depends On**: None
- **Description**: 
  - 添加拖拽时的 `cursor: grab` / `cursor: grabbing` 样式
  - 添加 `user-select: none` 防止拖拽时选中文本
- **Test Requirements**:
  - TR-2.1: 拖拽时鼠标变为抓取样式
  - TR-2.2: 拖拽过程中选中文本被禁用
