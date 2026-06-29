# 睡眠页面子页面切换动画 - Product Requirement Document

## Overview
- **Summary**: 实现睡眠页面子页面（睡眠总时长、睡眠心率、睡眠血氧等）之间的切换动画效果。从睡眠总时长切换到其他子页面时，详细睡眠分布图会压缩成横条图，同时在横条图下方显示对应子页面的信息图；切换按钮固定位置不变。
- **Purpose**: 模仿 vivo 健康 App 的睡眠页面交互体验，提升用户体验和视觉效果。
- **Target Users**: 使用 AI 睡眠最优唤醒闹钟应用的用户

## Goals
- [ ] 睡眠总时长子页面展示详细的纵向睡眠分布图
- [ ] 切换到其他子页面时有压缩动画，详细分布图压缩为横条图
- [ ] 其他子页面在横条图下方显示对应信息图
- [ ] 切换按钮（睡眠总时长、睡眠心率等）位置固定不变

## Non-Goals (Out of Scope)
- [ ] 周/月视图的子页面切换动画（本次仅修改日视图）
- [ ] 新增睡眠指标或数据源
- [ ] 修改现有数据展示内容（仅修改布局和动画）

## Background & Context
- 当前睡眠页面日视图中，`sleep-stage-card` 同时渲染详细分布图和横条图
- 切换按钮（`metrics-scroll-container`）位于页面中间偏下位置
- 需要模仿参考截图中的交互：切换按钮在顶部固定，分布图有压缩动画

## Functional Requirements
- **FR-1**: 将切换按钮区域移到页面顶部（view-switcher 下方），保持固定位置
- **FR-2**: 睡眠总时长子页面展示详细纵向睡眠分布图（stage-chart-area），不显示横条图
- **FR-3**: 切换到其他子页面时，详细分布图有压缩动画过渡到横条图
- **FR-4**: 其他子页面在横条图下方显示对应信息图（如心率曲线）

## Non-Functional Requirements
- **NFR-1**: 动画过渡流畅，时长约 300-400ms
- **NFR-2**: 布局变化不影响其他页面功能（首页、个人中心）
- **NFR-3**: 响应式适配，在不同屏幕尺寸下正常显示

## Constraints
- **Technical**: React + TypeScript + CSS，无额外动画库依赖
- **Dependencies**: 现有页面结构和数据模型

## Assumptions
- [ ] 用户已熟悉当前睡眠页面的基本布局
- [ ] 动画效果通过 CSS transition 实现

## Acceptance Criteria

### AC-1: 切换按钮位置固定
- **Given**: 用户在睡眠页面日视图
- **When**: 上下滑动页面
- **Then**: 切换按钮区域（睡眠总时长、睡眠心率等）保持在顶部固定位置，不随页面滚动
- **Verification**: `human-judgment`

### AC-2: 睡眠总时长子页面显示详细分布图
- **Given**: 用户选择"睡眠总时长"子页面
- **When**: 页面加载完成
- **Then**: 显示详细的纵向睡眠分布图（包含清醒、快速眼动、浅睡、深睡四个层级）
- **Verification**: `human-judgment`

### AC-3: 切换到其他子页面有压缩动画
- **Given**: 用户在睡眠总时长子页面
- **When**: 点击睡眠心率或其他子页面按钮
- **Then**: 详细分布图平滑压缩为横条图，动画时长约 300-400ms
- **Verification**: `human-judgment`

### AC-4: 其他子页面显示对应信息图
- **Given**: 用户切换到睡眠心率子页面
- **When**: 动画完成后
- **Then**: 横条图下方显示心率曲线图
- **Verification**: `human-judgment`

### AC-5: 切换回睡眠总时长有展开动画
- **Given**: 用户在睡眠心率子页面
- **When**: 点击睡眠总时长按钮
- **Then**: 横条图平滑展开为详细分布图
- **Verification**: `human-judgment`

## Open Questions
- [ ] 动画具体时长是否需要调整（当前计划 300-400ms）
- [ ] 是否需要添加进度指示器或其他视觉反馈