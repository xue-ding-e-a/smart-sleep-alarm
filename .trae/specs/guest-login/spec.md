# 访客登录功能规范

## Why
为方便用户体验应用，提供无需注册账户的访客登录入口，降低使用门槛。

## What Changes
- 在登录页面添加"随便看看"按钮，点击后以访客身份登录
- 访客用户使用预设的访客数据，限制部分功能使用
- 访客登录跳转到首页，与注册用户体验一致

## Impact
- Affected specs: smart-alarm-demo（用户认证）
- Affected code: src/pages/LoginPage/index.tsx, src/pages/LoginPage/style.css

## ADDED Requirements

### Requirement: 访客登录功能
系统应提供访客登录功能，允许用户无需注册即可体验应用。

#### Scenario: 用户点击访客登录
- **WHEN** 用户点击登录页面的"随便看看"按钮
- **THEN** 系统以访客身份登录，跳转到首页

#### Scenario: 访客用户访问限制功能
- **WHEN** 访客用户尝试访问需要账户的功能（如闹钟设置保存）
- **THEN** 系统提示用户需要注册账户才能使用完整功能

## MODIFIED Requirements
无

## REMOVED Requirements
无
