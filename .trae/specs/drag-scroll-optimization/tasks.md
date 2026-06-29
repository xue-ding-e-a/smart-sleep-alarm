# 指标卡片横向滑动拖动优化 - The Implementation Plan (Decomposed and Prioritized Task List)

## [ ] Task 1: 重构拖拽状态管理与事件监听
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修复 `handleMouseUp` 中惯性滚动条件 `!hasDraggedRef.current` 逻辑写反的 bug
  - 添加 `mouseleave` / `mouseout` 事件监听，确保鼠标移出窗口或容器时正确结束拖拽
  - 添加 `dragstart` 事件阻止原生拖拽行为
  - 统一事件绑定和清理逻辑，避免状态泄漏
- **Acceptance Criteria Addressed**: [AC-4, AC-5, AC-6]
- **Test Requirements**:
  - `programmatic` TR-1.1: 鼠标在容器外松开时，isDraggingRef 立即置为 false
  - `programmatic` TR-1.2: 鼠标移出窗口（mouseleave on document）时，拖拽状态正确清理
  - `programmatic` TR-1.3: 拖拽位移 > 8px 时，hasDraggedRef 为 true，点击事件被阻止
  - `programmatic` TR-1.4: 点击位移 < 8px 时，卡片正常选中
  - `human-judgement` TR-1.5: 快速拖动后松开，不会出现鼠标不按也能拖动的情况
- **Notes**: 事件监听应统一在 useEffect 中绑定和清理

## [ ] Task 2: 使用 requestAnimationFrame 优化拖拽性能
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 在 `handleMouseMove` 中使用 requestAnimationFrame 进行帧同步
  - 使用位置插值而非每帧直接设置 scrollLeft
  - 添加 `will-change: transform` 或 `will-change: scroll-position` 优化
  - 避免在 mousemove 中触发强制同步布局
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `human-judgement` TR-2.1: 拖拽过程流畅，无明显卡顿掉帧
  - `human-judgement` TR-2.2: 拖动时滚动位置跟手，延迟 < 1 帧
  - `programmatic` TR-2.3: 鼠标移动事件与滚动更新通过 rAF 解耦
- **Notes**: 可考虑使用 transform: translateX 替代 scrollLeft 以获得更好的性能，但需要权衡原生滚动行为的丢失

## [ ] Task 3: 实现边界弹性拖拽与回弹效果
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 拖拽超出左边界（scrollLeft < 0）或右边界（scrollLeft > maxScroll）时，应用阻尼衰减
  - 使用阻尼系数（如 0.3）计算超出部分的实际位移
  - 松开鼠标后，如果处于越界状态，平滑回弹到边界位置
  - 回弹动画使用 easeOut 缓动函数，时长 300-400ms
- **Acceptance Criteria Addressed**: [AC-2]
- **Test Requirements**:
  - `human-judgement` TR-3.1: 拖到左/右边界继续拖时，有弹性阻力感
  - `human-judgement` TR-3.2: 越界后松开，平滑回弹到边界，不突兀
  - `programmatic` TR-3.3: 回弹动画结束后 scrollLeft 在 [0, maxScrollLeft] 范围内
- **Notes**: 越界位移使用 transform 实现以获得最佳性能，回弹时切换回 scrollLeft

## [ ] Task 4: 优化惯性滚动算法
- **Priority**: high
- **Depends On**: Task 3
- **Description**: 
  - 使用滑动窗口平均速度替代瞬时速度，减少波动
  - 优化摩擦系数和最小速度阈值，使减速更自然
  - 惯性滚动遇到边界时触发弹性回弹而非硬停止
  - 惯性滚动期间按下鼠标应立即停止惯性
- **Acceptance Criteria Addressed**: [AC-3]
- **Test Requirements**:
  - `human-judgement` TR-4.1: 快速拖动后松开，惯性滚动自然减速
  - `human-judgement` TR-4.2: 慢速拖动后松开，几乎没有惯性
  - `human-judgement` TR-4.3: 惯性滚动到边界时，有弹性回弹效果
  - `programmatic` TR-4.4: 惯性滚动期间按下鼠标，动量立即停止
- **Notes**: 速度采样窗口建议 3-5 帧，摩擦系数约 0.92-0.96
