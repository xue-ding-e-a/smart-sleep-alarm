# 多屏幕尺寸适配规范

## Why
当前应用需要在不同尺寸的手机屏幕上良好展示，包括小屏手机（如 iPhone SE）、标准屏（如 iPhone 14/15）和大屏手机（如 iPhone Pro Max）。

## What Changes
- 定义响应式断点和适配策略
- 优化主题变量中的间距、圆角等随屏幕缩放
- 确保各页面在不同屏幕尺寸下布局合理
- 添加视口元数据优化

## Impact
- Affected specs: 全局样式
- Affected code: src/styles/theme.css, 各页面样式文件, index.html

## ADDED Requirements

### Requirement: 响应式断点策略
系统应使用统一的响应式断点策略，确保在不同屏幕尺寸下的良好体验。

#### Scenario: 小屏手机（< 375px）
- **WHEN** 屏幕宽度小于 375px
- **THEN** 间距缩小 15%，卡片内边距调整为 12px

#### Scenario: 标准屏手机（375px - 414px）
- **WHEN** 屏幕宽度在 375px 到 414px 之间
- **THEN** 使用标准间距和布局

#### Scenario: 大屏手机（> 414px）
- **WHEN** 屏幕宽度大于 414px
- **THEN** 内容区域最大宽度限制为 480px，居中显示

### Requirement: 布局适配
内容区域最大宽度限制为 480px，在大屏手机上居中显示，两侧留白。

#### Scenario: 内容溢出处理
- **WHEN** 屏幕宽度小于内容最小宽度
- **THEN** 内容区域允许横向滚动或缩放

## MODIFIED Requirements
无

## REMOVED Requirements
无
