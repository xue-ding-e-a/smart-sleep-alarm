# 睡眠页指标卡片拖拽滑动 - Product Requirement Document

## Overview
- **Summary**: 实现睡眠页底部指标卡片（睡眠总时长、睡眠心率、睡眠呼吸率）的鼠标拖拽滑动功能，让用户可以在电脑上通过鼠标拖动卡片实现右滑效果。
- **Purpose**: 提升电脑端用户交互体验，解决纯 `overflow-x: auto` 无法通过拖拽滑动的问题。
- **Target Users**: 使用电脑浏览器访问本应用的用户。

## Why
当前睡眠页底部的指标卡片使用 `overflow-x: auto` 实现横向滚动，在电脑上无法通过鼠标拖拽滑动，只能依赖滚动条或触摸滑动。这不符合电脑端用户的交互习惯。

## What Changes
- 为 `.metrics-scroll` 容器添加鼠标拖拽滑动功能
- 支持鼠标按下拖动、拖动过程中实时更新滚动位置、松开停止
- 拖拽时卡片跟随鼠标移动，松开后保持当前位置
- 不影响原有的触摸滑动和点击选择功能

## Impact
- Affected specs: 睡眠页
- Affected code: `src/pages/SleepPage/style.css`（添加拖拽样式）、`src/pages/SleepPage/index.tsx`（添加拖拽逻辑）

## ADDED Requirements
### Requirement: 指标卡片拖拽滑动
系统 SHALL 支持通过鼠标拖拽实现指标卡片的横向滑动。

#### Scenario: 电脑端拖拽滑动
- **WHEN** 用户在指标卡片区域按下鼠标左键并向右拖动
- **THEN** 卡片列表应跟随鼠标向右移动，滚动位置相应增加
- **AND** 用户松开鼠标后，卡片保持当前位置

#### Scenario: 电脑端拖拽滑动（向左）
- **WHEN** 用户在指标卡片区域按下鼠标左键并向左拖动
- **THEN** 卡片列表应跟随鼠标向左移动，滚动位置相应减少
- **AND** 用户松开鼠标后，卡片保持当前位置

#### Scenario: 拖拽边界限制
- **WHEN** 用户拖动到滚动边界（左边界或右边界）
- **THEN** 卡片列表不应继续超出边界

#### Scenario: 点击选择卡片
- **WHEN** 用户点击卡片（不拖动）
- **THEN** 卡片应被选中（高亮效果）
- **AND** 不触发拖拽滑动

#### Scenario: 触摸滑动保持不变
- **WHEN** 用户在移动设备上触摸滑动
- **THEN** 原有触摸滑动功能保持正常
