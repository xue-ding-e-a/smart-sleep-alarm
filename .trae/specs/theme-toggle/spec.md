# 日夜主题切换功能 Spec

## Why
用户需要能够切换应用的整体视觉主题，白天使用明亮的暖白色系，夜晚使用深色系，以提升不同时段的使用体验。

## What Changes
- 移除页面顶部的返回箭头图标 (back-arrow span)
- 移除页面顶部的设置图标 (settings-icon span)
- 将设置图标移至"我的"页面
- 设置图标点击后可切换日间/夜间两套主题色

## Impact
- Affected specs: 主题系统
- Affected code: 导航栏组件、主题样式文件、ProfilePage

## ADDED Requirements

### Requirement: 日夜主题切换
系统 SHALL 提供日间和夜间两套主题，并在用户点击设置图标时切换。

#### Scenario: 切换到夜间主题
- **WHEN** 用户点击"我的"页面的设置图标
- **THEN** 整体应用切换为夜间深色主题

#### Scenario: 切换到日间主题
- **WHEN** 用户再次点击设置图标
- **THEN** 整体应用切换回日间暖白色主题

## MODIFIED Requirements

### Requirement: 导航栏清理
移除首页顶部的 back-arrow 和 settings-icon 两个图标。

### Requirement: 设置图标迁移
将 settings-icon 从顶部导航移至"我的"页面，点击触发主题切换。

## REMOVED Requirements

### Requirement: 顶部设置图标
**Reason**: 功能迁移至"我的"页面
**Migration**: 使用"我的"页面的设置图标
