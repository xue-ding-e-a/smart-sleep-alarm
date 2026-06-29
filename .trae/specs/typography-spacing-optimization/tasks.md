# 字体和间距优化 - The Implementation Plan

## [x] Task 1: 字体栈和字体系统优化
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 更新 theme.css 中的字体栈，优先使用接近 vivo 系统的无衬线字体
  - 字体栈建议：-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Source Han Sans CN", "Noto Sans CJK SC", Roboto, sans-serif
  - 重新定义字体大小变量：增加超大号（用于大数字）、调整各级别大小
  - 增加字重变量：--font-weight-black: 900, --font-weight-bold: 700, --font-weight-semibold: 600, --font-weight-medium: 500, --font-weight-regular: 400
  - 数字默认使用 tabular-nums（等宽数字）
  - 全局 body 字体更新
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3]
- **Test Requirements**:
  - `human-judgement` TR-1.1: 中文字体看起来是无衬线的现代风格，接近 vivo 健康
  - `human-judgement` TR-1.2: 大数字（评分、时长）字重够粗，有视觉冲击力
  - `human-judgement` TR-1.3: 字体层级清晰，不同级别大小区分明显
- **Notes**: 修改 src/styles/theme.css 和 src/styles/global.css

## [x] Task 2: 间距系统优化
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 更新 theme.css 中的间距变量，微调各级别间距
  - 卡片内边距增加到更舒适的程度（约 20-24px）
  - 模块间距（卡片之间的距离）调整
  - 行高优化：正文行高 1.5-1.6，大数字行高 1.1-1.2
  - 更新 global.css 中的通用间距类
- **Acceptance Criteria Addressed**: [AC-4]
- **Test Requirements**:
  - `human-judgement` TR-2.1: 卡片内文字不拥挤，四周留白充足
  - `human-judgement` TR-2.2: 模块之间间距合理，呼吸感好
  - `human-judgement` TR-2.3: 长文本行高舒适，阅读不累
- **Notes**: 修改 src/styles/theme.css

## [x] Task 3: 睡眠页面字体和间距精细调整
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 睡眠页面的大数字（评分、时长）使用更粗字重（800-900）和更大字号
  - 卡片内标题、数值、辅助文字的字体层级精细化
  - 环形图旁边的文字排版调整
  - 指标卡片内文字大小和间距优化
  - "更多分析"按钮的字体和间距
  - 展开后统计卡片的字体层级
  - 周视图和月视图的标题、数值字体调整
  - 迷你图表下方的日期标签字体调整
- **Acceptance Criteria Addressed**: [AC-5]
- **Test Requirements**:
  - `human-judgement` TR-3.1: 睡眠页面评分数字（87分）又大又粗，视觉焦点明确
  - `human-judgement` TR-3.2: 睡眠时长数字粗体醒目
  - `human-judgement` TR-3.3: 卡片内文字层级清晰，标题/数值/辅助文字区分明确
  - `human-judgement` TR-3.4: 整体排版与参考截图风格相似
- **Notes**: 修改 src/pages/SleepPage/index.tsx 和 style.css，重点是字体大小和字重的精细调整

## [x] Task 4: 首页和个人页同步调整
- **Priority**: medium
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 首页的标题、数值、按钮文字同步优化
  - 首页卡片内间距调整
  - 个人页的头像、用户名、设置项文字优化
  - 个人页卡片间距和内边距调整
- **Acceptance Criteria Addressed**: [AC-6]
- **Test Requirements**:
  - `human-judgement` TR-4.1: 首页字体风格与睡眠页一致
  - `human-judgement` TR-4.2: 个人页字体风格与睡眠页一致
  - `human-judgement` TR-4.3: 所有页面间距系统统一
- **Notes**: 修改 HomePage 和 ProfilePage 的样式文件

## [ ] Task 5: 整体验证和微调
- **Priority**: medium
- **Depends On**: Task 3, Task 4
- **Description**: 
  - 逐页检查字体和间距效果
  - 对比参考截图，微调不一致的地方
  - 确保响应式下表现良好
  - 修复发现的问题
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3, AC-4, AC-5, AC-6]
- **Test Requirements**:
  - `human-judgement` TR-5.1: 整体字体风格与参考截图相似
  - `human-judgement` TR-5.2: 间距系统舒适统一
  - `human-judgement` TR-5.3: 所有页面风格一致
