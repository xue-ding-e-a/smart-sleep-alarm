# 夜间主题颜色完善 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 扩充夜间主题 CSS 变量
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 在 theme.css 的 body.night-theme 中补充缺失的颜色变量
  - 添加 slider 轨道色、按钮背景色、分割线色、图表背景色等变量
  - 确保所有在页面中使用的颜色都有对应的 CSS 变量
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-1.1: 检查 theme.css 中夜间主题变量完整覆盖所有用到的颜色
  - `human-judgement` TR-1.2: 确认夜间主题色板与日间主题语义对应
- **Notes**: 需要先梳理所有硬编码颜色，确定对应的语义变量

## [x] Task 2: 睡眠页面硬编码颜色替换为 CSS 变量
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 将 SleepPage/style.css 中所有硬编码的 #FFFFFF 替换为 var(--card-bg)
  - 将所有硬编码的 #1A1A1A 替换为 var(--text-primary)
  - 将所有硬编码的 #8C8C8C 替换为 var(--text-secondary)
  - 将所有硬编码的 #E8E8E8 替换为 var(--card-border)
  - 将所有硬编码的 #F2F2F2 替换为对应的变量（如 --slider-track-bg）
  - 将所有硬编码的 #B8B8B8 替换为 var(--text-tertiary)
- **Acceptance Criteria Addressed**: AC-1, AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-2.1: SleepPage/style.css 中不再有硬编码的颜色值（除图表/特殊颜色外）
  - `human-judgement` TR-2.2: 日间主题下睡眠页面显示与修改前一致
  - `human-judgement` TR-2.3: 夜间主题下睡眠页面所有颜色正确适配

## [x] Task 3: 我的页面硬编码颜色替换为 CSS 变量
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 将 ProfilePage/style.css 中所有硬编码颜色替换为对应 CSS 变量
  - 包括卡片背景、文本颜色、边框颜色、按钮背景等
- **Acceptance Criteria Addressed**: AC-2, AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-3.1: ProfilePage/style.css 中不再有硬编码的颜色值
  - `human-judgement` TR-3.2: 日间主题下我的页面显示与修改前一致
  - `human-judgement` TR-3.3: 夜间主题下我的页面所有颜色正确适配

## [x] Task 4: 首页硬编码颜色替换为 CSS 变量
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 将 HomePage/style.css 中所有硬编码颜色替换为对应 CSS 变量
  - 包括卡片背景、文本颜色、边框颜色等
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-4.1: HomePage/style.css 中不再有硬编码的颜色值
  - `human-judgement` TR-4.2: 日间主题下首页显示与修改前一致
  - `human-judgement` TR-4.3: 夜间主题下首页所有颜色正确适配

## [x] Task 5: 全局组件夜间主题适配
- **Priority**: medium
- **Depends On**: Task 1
- **Description**:
  - 检查 BottomNav, Card, Switch, Button 等组件的样式
  - 确保组件使用 CSS 变量而非硬编码颜色
  - 检查 global.css 中的工具类颜色
- **Acceptance Criteria Addressed**: AC-4, AC-5
- **Test Requirements**:
  - `human-judgement` TR-5.1: 底部导航栏在夜间主题下正确显示
  - `human-judgement` TR-5.2: 卡片组件在夜间主题下正确显示
  - `human-judgement` TR-5.3: 开关和按钮组件在夜间主题下正确显示

## [x] Task 6: 整体夜间主题回归测试
- **Priority**: high
- **Depends On**: Task 2, Task 3, Task 4, Task 5
- **Description**:
  - 完整测试三个页面在日/夜主题下的显示效果
  - 确保所有元素颜色正确，无遗漏
  - 确保主题切换流畅
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5
- **Test Requirements**:
  - `human-judgement` TR-6.1: 首页日/夜主题切换完整正确
  - `human-judgement` TR-6.2: 睡眠页日/夜主题切换完整正确
  - `human-judgement` TR-6.3: 我的页日/夜主题切换完整正确
  - `human-judgement` TR-6.4: 日间主题无视觉回归

# Task Dependencies
- Task 2, 3, 4, 5 并行依赖 Task 1
- Task 6 依赖 Task 2, 3, 4, 5
