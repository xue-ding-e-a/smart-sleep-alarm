# 指标卡片横向滑动拖动优化 - Product Requirement Document

## Overview
- **Summary**: 优化睡眠页指标卡片横向滚动容器的拖拽滑动体验，解决卡顿、边界僵硬、惯性失效以及松开鼠标后仍可拖动的 bug。
- **Purpose**: 提升用户拖拽滑动时的流畅度和自然感，达到原生 App 级别的滑动体验。
- **Target Users**: 使用鼠标拖拽横向滚动指标卡片的用户。

## Goals
- 拖拽滑动过程流畅无卡顿，达到 60fps
- 边界处有弹性回弹效果，而非硬截断
- 松开鼠标后惯性滚动自然，减速曲线平滑
- 修复松开鼠标后仍能拖动的 bug
- 拖拽与点击事件正确区分，不互相干扰

## Non-Goals (Out of Scope)
- 不改变指标卡片的视觉样式和数据展示
- 不添加新的功能按钮或交互
- 不涉及移动端触控手势优化（当前仅针对鼠标）
- 不修改其他页面的滚动逻辑

## Background & Context
当前 SleepPage 中的 `metrics-scroll` 容器实现了鼠标拖拽横向滚动功能，但存在以下问题：
1. `handleMouseMove` 未使用 `requestAnimationFrame` 节流，直接操作 `scrollLeft` 导致卡顿
2. 边界处硬截断，拖到首部/尾部时体验僵硬
3. `handleMouseUp` 中惯性滚动条件 `!hasDraggedRef.current` 逻辑写反，导致惯性基本不触发
4. 缺少 `mouseleave` 事件监听，鼠标移出容器后释放会导致状态错乱
5. 瞬时速度计算波动大，惯性效果不稳定

## Functional Requirements
- **FR-1**: 拖拽滑动时使用 requestAnimationFrame 进行帧同步，确保流畅性
- **FR-2**: 拖拽超出边界时提供弹性拉力效果，松开后平滑回弹
- **FR-3**: 松开鼠标后根据拖拽速度产生自然的惯性滚动，减速曲线平滑
- **FR-4**: 正确处理拖拽结束状态，鼠标移出窗口或松开按钮后立即停止拖拽
- **FR-5**: 拖拽位移超过阈值时不触发卡片点击事件

## Non-Functional Requirements
- **NFR-1**: 拖拽过程帧率稳定在 60fps（每帧 <16.67ms）
- **NFR-2**: 惯性滚动持续时间与初始速度成正比，最长不超过 1.5 秒
- **NFR-3**: 边界回弹动画时长 300-400ms，使用 easeOut 缓动函数
- **NFR-4**: 拖拽与点击的区分阈值为 8px，与当前保持一致

## Constraints
- **Technical**: React + TypeScript + Vite，仅修改 SleepPage 组件内的拖拽逻辑
- **Business**: 不改变现有 UI 布局和数据展示
- **Dependencies**: 无新增第三方依赖，使用原生 DOM API + requestAnimationFrame

## Assumptions
- 用户使用鼠标进行拖拽操作（非触屏）
- 浏览器支持 requestAnimationFrame 和 CSS will-change
- 指标卡片数量固定为 5 个，内容宽度超出容器

## Acceptance Criteria

### AC-1: 拖拽流畅无卡顿
- **Given**: 用户在指标卡片区域按下鼠标并拖动
- **When**: 拖动过程中
- **Then**: 滚动跟随鼠标移动流畅，无掉帧卡顿感
- **Verification**: `human-judgment`
- **Notes**: 主观体验评估，对比优化前明显改善

### AC-2: 边界弹性效果
- **Given**: 用户拖拽到滚动起始位置（scrollLeft = 0）并继续向左拖
- **When**: 继续拖动超过边界
- **Then**: 内容有弹性拉力效果（移动距离衰减），松开后平滑回弹到边界
- **Verification**: `human-judgment`

### AC-3: 惯性滚动自然
- **Given**: 用户以一定速度拖拽后松开鼠标
- **When**: 松开鼠标后
- **Then**: 内容按惯性继续滚动并逐渐减速，减速曲线平滑自然
- **Verification**: `human-judgment`

### AC-4: 松开鼠标后拖拽立即停止
- **Given**: 用户按下鼠标拖动中
- **When**: 鼠标在容器外松开或移出窗口
- **Then**: 拖拽状态立即解除，移动鼠标不再触发滚动
- **Verification**: `programmatic`
- **Notes**: 可通过代码审查确认 mouseup/mouseleave 事件处理正确

### AC-5: 拖拽不触发点击
- **Given**: 用户按下鼠标并拖动超过 8px 后松开
- **When**: 在同一张卡片上按下并拖动后松开
- **Then**: 不触发该卡片的点击选中事件
- **Verification**: `programmatic`
- **Notes**: hasDraggedRef 判断逻辑需正确

### AC-6: 点击卡片正常选中
- **Given**: 用户点击（按下后未移动或移动 <8px）一张指标卡片
- **When**: 松开鼠标
- **Then**: 该卡片被选中，样式变为激活状态
- **Verification**: `programmatic`

## Open Questions
- [ ] 弹性拉力的衰减系数需要调优，当前计划使用 0.3 的阻尼比
- [ ] 惯性滚动的摩擦系数需要调优，当前计划使用 0.95 的衰减系数
