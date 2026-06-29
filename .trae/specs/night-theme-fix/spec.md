# 夜间主题颜色完善 - Product Requirement Document

## Overview
- **Summary**: 完善夜间主题的颜色系统，将所有页面和组件中的硬编码颜色替换为 CSS 变量，确保切换到夜间主题后所有元素的颜色正确适配深色背景。
- **Purpose**: 解决当前夜间主题下存在的问题：睡眠页面模块底色仍为亮色、首页和我的页面模块字体仍为黑色、白色字体未适配夜间主题等，提升夜间使用体验。
- **Target Users**: 在夜间或低光环境下使用应用的用户

## Goals
- 睡眠页面的所有模块卡片在夜间主题下显示为深色背景
- 我的页面的所有模块卡片在夜间主题下显示为深色背景
- 所有主文本（原黑色 #1A1A1A）在夜间主题下变为浅色
- 次文本（灰色 #8C8C8C）在夜间主题下保持为对应的浅灰色
- 所有边框、分割线在夜间主题下变为深色边框
- 首页、睡眠页、我的页三个页面夜间主题显示一致

## Non-Goals (Out of Scope)
- 不改变日间主题的任何颜色
- 不新增主题色，只完善现有夜间主题
- 不调整布局和间距
- 不修改登录/注册页

## Background & Context
- 当前已定义夜间主题 CSS 变量（--card-bg, --text-primary, --text-secondary 等），但各页面大量使用硬编码颜色值，导致主题切换无效
- 涉及页面：HomePage, SleepPage, ProfilePage
- 涉及组件：Card, BottomNav, Switch, Button 等

## Functional Requirements
- **FR-1**: 睡眠页面所有硬编码颜色替换为 CSS 变量
- **FR-2**: 我的页面所有硬编码颜色替换为 CSS 变量
- **FR-3**: 首页所有硬编码颜色替换为 CSS 变量
- **FR-4**: 夜间主题下新增必要的颜色变量（如卡片背景、滑块轨道色、分割线色等）
- **FR-5**: 确保夜间主题下阴影效果适配深色背景

## Non-Functional Requirements
- **NFR-1**: 主题切换过渡平滑，无明显闪烁
- **NFR-2**: 夜间主题对比度符合 WCAG AA 标准（文本与背景对比度 ≥ 4.5:1）
- **NFR-3**: 日间主题视觉效果保持不变

## Constraints
- **Technical**: React + CSS 变量方案，保持现有架构
- **Dependencies**: 基于现有的 ThemeContext 和 CSS 变量系统

## Assumptions
- 用户期望的夜间主题是深蓝紫色调背景 + 浅色文字
- 灰色次级文字在夜间主题下也需要调整为更浅的灰色以保证可读性

## Acceptance Criteria

### AC-1: 睡眠页面夜间主题适配
- **Given**: 用户已切换到夜间主题
- **When**: 用户进入睡眠页面
- **Then**: 所有卡片背景为深色，所有主文本为浅色，次文本为浅灰色，边框为深色
- **Verification**: `human-judgment`

### AC-2: 我的页面夜间主题适配
- **Given**: 用户已切换到夜间主题
- **When**: 用户进入我的页面
- **Then**: 所有卡片背景为深色，所有主文本为浅色，次文本为浅灰色，边框为深色
- **Verification**: `human-judgment`

### AC-3: 首页夜间主题适配
- **Given**: 用户已切换到夜间主题
- **When**: 用户进入首页
- **Then**: 所有卡片背景为深色，所有主文本为浅色，次文本为浅灰色，边框为深色
- **Verification**: `human-judgment`

### AC-4: 日间主题保持不变
- **Given**: 用户处于日间主题
- **When**: 浏览所有页面
- **Then**: 所有颜色与修改前完全一致
- **Verification**: `human-judgment`

### AC-5: 主题切换一致性
- **Given**: 用户在任意页面
- **When**: 点击设置图标切换主题
- **Then**: 所有页面的颜色立即切换，无遗漏元素
- **Verification**: `human-judgment`

## Open Questions
- 夜间主题下主色调（紫色）是否需要调整亮度？
- 夜间主题下成功色、警告色、错误色是否需要调整？
