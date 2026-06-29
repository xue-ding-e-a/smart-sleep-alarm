# 页面独立滚动与位置记忆 - Product Requirement Document

## Overview
- **Summary**: 实现首页、睡眠页、我的页三个 Tab 页面的独立滚动与滚动位置记忆功能。用户在某个页面滚动后切换到其他页面，再切回来时，页面应保持在之前滚动到的位置，三个页面的滚动状态互不干扰。
- **Purpose**: 提升用户体验，让用户在多页面切换时无需重新滚动查找之前浏览的内容，符合移动端 App 的常见交互模式。
- **Target Users**: 所有使用本应用的用户，尤其是需要在不同页面间频繁切换的用户。

## Goals
- 首页（/home）、睡眠页（/sleep）、我的页（/profile）三个页面各自拥有独立的滚动位置
- 从页面 A 滚动到某位置后切换到页面 B，再切回页面 A 时，页面 A 保持在之前滚动的位置
- 页面切换动画效果保持不变（淡入上移动画）
- 不影响页面的其他功能和交互

## Non-Goals (Out of Scope)
- 不修改页面的内容和布局
- 不修改底部导航栏的交互逻辑
- 不实现页面横向滚动的记忆（仅有纵向滚动）
- 不涉及登录页、注册页、唤醒页等非 Tab 页面
- 不持久化存储滚动位置到本地（刷新页面后滚动位置重置为顶部）

## Background & Context
- 当前项目使用 React Router 进行路由管理，每个 Tab 页面对应一个路由（/home, /sleep, /profile）
- 每个页面都包裹在 `MainLayout` 组件中，`.page-content` 是统一的滚动容器
- 由于 `key={location.pathname}` 的存在，每次路由切换时滚动容器 DOM 会被卸载并重新创建，导致滚动位置重置为 0
- 目前切换页面时，所有页面都会从顶部开始，用户体验不佳

## Functional Requirements
- **FR-1**: 三个 Tab 页面（首页、睡眠页、我的）的滚动位置相互独立，互不影响
- **FR-2**: 切换离开某页面时，自动保存该页面的当前滚动位置
- **FR-3**: 切换进入某页面时，自动恢复该页面之前保存的滚动位置
- **FR-4**: 首次进入某页面时，滚动位置默认为顶部（scrollTop = 0）
- **FR-5**: 页面切换动画（淡入上移）效果保持不变

## Non-Functional Requirements
- **NFR-1**: 滚动位置恢复应无感知，切换页面时不应出现跳动或闪烁
- **NFR-2**: 不影响页面的滚动性能（60fps）
- **NFR-3**: 代码改动应尽量集中，降低对现有功能的影响

## Constraints
- **Technical**: 基于现有 React + React Router 架构，不引入新的状态管理库
- **Business**: 必须保持现有的页面切换动画效果
- **Dependencies**: 仅依赖现有项目中的 React 和 react-router-dom

## Assumptions
- 滚动位置只需在单次会话内保持，页面刷新后重置为顶部是可接受的
- 仅需要记忆三个 Tab 页面的滚动位置，其他页面（如登录页、唤醒页）不需要
- 滚动容器是 MainLayout 中的 `.page-content` 元素

## Acceptance Criteria

### AC-1: 首页滚动位置独立记忆
- **Given**: 用户在首页向下滚动了一段距离
- **When**: 用户点击底部导航切换到睡眠页，再切回首页
- **Then**: 首页应保持在之前滚动到的位置，而不是回到顶部
- **Verification**: `human-judgment`

### AC-2: 睡眠页滚动位置独立记忆
- **Given**: 用户在睡眠页向下滚动了一段距离
- **When**: 用户点击底部导航切换到我的页，再切回睡眠页
- **Then**: 睡眠页应保持在之前滚动到的位置，而不是回到顶部
- **Verification**: `human-judgment`

### AC-3: 我的页滚动位置独立记忆
- **Given**: 用户在我的页向下滚动了一段距离
- **When**: 用户点击底部导航切换到首页，再切回我的页
- **Then**: 我的页应保持在之前滚动到的位置，而不是回到顶部
- **Verification**: `human-judgment`

### AC-4: 三个页面滚动位置互不影响
- **Given**: 用户在首页滚动到位置 A，在睡眠页滚动到位置 B，在我的页滚动到位置 C
- **When**: 用户依次在三个页面间切换
- **Then**: 每个页面都保持各自的滚动位置，互不干扰
- **Verification**: `human-judgment`

### AC-5: 首次进入页面从顶部开始
- **Given**: 用户首次打开应用或刷新页面
- **When**: 用户进入任意一个 Tab 页面
- **Then**: 页面从顶部开始显示（scrollTop = 0）
- **Verification**: `human-judgment`

### AC-6: 页面切换动画保持不变
- **Given**: 用户点击底部导航切换页面
- **When**: 页面切换过程中
- **Then**: 页面切换的淡入上移动画效果与改动前一致
- **Verification**: `human-judgment`

### AC-7: 滚动性能不受影响
- **Given**: 用户在任意页面上下滚动
- **When**: 页面滚动过程中
- **Then**: 滚动流畅，无卡顿感，保持 60fps
- **Verification**: `human-judgment`

## Open Questions
- 无
