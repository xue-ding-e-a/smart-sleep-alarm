# 字体和间距优化 - Product Requirement Document

## Overview
- **Summary**: 优化应用的字体系统和间距系统，使字体风格更接近 vivo 健康应用，字体大小层级更清晰，间距更舒适。
- **Purpose**: 提升整体视觉质感和可读性，让应用看起来更专业、更接近原生应用体验。
- **Target Users**: 所有应用使用者

## Goals
- 字体栈优化为更接近 vivo 系统字体的无衬线字体
- 字体大小层级更清晰，大数字更粗壮
- 字重层级明确（标题粗、正文常规、辅助文字轻）
- 间距系统更舒适，卡片内边距和模块间距合理
- 行高优化，提升长文本可读性

## Non-Goals (Out of Scope)
- 不改变配色方案
- 不改变页面布局结构
- 不改变功能逻辑
- 不引入外部字体文件（使用系统字体栈）

## Background & Context
- 当前应用使用了通用的字体栈，字体风格与 vivo 健康有差异
- 大数字的字重不够粗，视觉冲击力不足
- 部分间距需要微调以更接近截图效果
- 技术栈：React + TypeScript + Vite + CSS 变量

## Functional Requirements
- **FR-1**: 字体栈优化，优先使用接近 vivo 系统的无衬线中文字体
- **FR-2**: 字体大小层级重新定义（超大数字/大标题/标题/正文/辅助文字）
- **FR-3**: 字重层级明确化（Black/Bold/Medium/Regular/Light）
- **FR-4**: 间距系统优化（卡片内边距、模块间距、行高）
- **FR-5**: 睡眠页面字体和间距精细调整
- **FR-6**: 首页、个人页同步适配

## Non-Functional Requirements
- **NFR-1**: 可读性：所有文字清晰可读，对比度达标
- **NFR-2**: 一致性：所有页面字体和间距风格统一
- **NFR-3**: 响应式：字体大小在不同屏幕尺寸下适配合理

## Constraints
- **技术**: 仅使用系统字体，不引入外部字体文件
- **业务**: 不改变现有功能和布局结构
- **兼容性**: 兼容 iOS 和 Android 系统字体

## Assumptions
- vivo 系统字体接近思源黑体/PingFang SC 风格
- 大数字使用较重字重（700-900）
- 卡片内边距约 20-24px
- 行高约 1.5-1.6 对于正文

## Acceptance Criteria

### AC-1: 字体栈优化
- **Given**: 用户在任意页面查看文字
- **When**: 页面加载完成
- **Then**: 中文字体使用接近 vivo 系统的无衬线字体，优先顺序合理，iOS/Android 均有良好表现
- **Verification**: `human-judgment`
- **Notes**: 字体栈应包含：系统UI字体、PingFang SC、思源黑体、Microsoft YaHei 等

### AC-2: 字体大小层级
- **Given**: 用户浏览睡眠页面
- **When**: 查看不同层级的文字
- **Then**: 大数字（评分、时长）明显大于标题，标题大于正文，正文大于辅助文字，层级清晰
- **Verification**: `human-judgment`

### AC-3: 字重层级
- **Given**: 用户查看睡眠页面
- **When**: 对比不同文字的粗细
- **Then**: 大数字粗重（接近Black），标题中等粗（Semibold/Bold），正文常规（Regular），辅助文字较轻
- **Verification**: `human-judgment`

### AC-4: 间距舒适度
- **Given**: 用户查看任意页面
- **When**: 观察卡片和模块间距
- **Then**: 卡片内边距充足不拥挤，模块之间间距合理，呼吸感好
- **Verification**: `human-judgment`

### AC-5: 睡眠页面精细度
- **Given**: 用户查看睡眠页面日视图
- **When**: 对比参考截图
- **Then**: 字体大小、字重、间距与截图风格相似，评分数字、时长数字、卡片内文字排版接近
- **Verification**: `human-judgment`

### AC-6: 全页面一致性
- **Given**: 用户在各页面间切换
- **When**: 对比首页、睡眠页、个人页
- **Then**: 所有页面的字体和间距风格统一
- **Verification**: `human-judgment`

## Open Questions
- [ ] 是否需要数字使用等宽字体（tabular-nums）？
- [ ] 行高偏好紧凑还是宽松？
