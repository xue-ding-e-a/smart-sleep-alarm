# 目标睡眠时长重构 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 调整闹钟设置卡片布局顺序
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 将目标睡眠时长区域移到唤醒时间窗口区域之前
  - 提升目标睡眠时长的视觉层级（标题更醒目、数值更大）
  - 降低唤醒时间窗口的视觉层级（标题字号减小、弱化边框等）
  - 调整卡片内各区域的间距和顺序
- **Acceptance Criteria Addressed**: AC-1, AC-5
- **Test Requirements**:
  - `human-judgement` TR-1.1: 目标睡眠时长区域在唤醒时间窗口之前
  - `human-judgement` TR-1.2: 目标睡眠时长视觉上比唤醒时间窗口更突出
  - `human-judgement` TR-1.3: 唤醒时间窗口仍然完整可用，只是层级降低
- **Notes**: 修改 src/pages/HomePage/index.tsx 和 style.css

## [x] Task 2: 更新推荐梯度选项为睡眠周期倍数
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - DURATION_OPTIONS 从 [6, 7, 8, 9] 改为 [4.5, 6, 7.5, 8, 9]
  - 选项显示格式支持小数（如 4.5h、7.5h）
  - 默认选中值保持 8h
  - 选项布局从 4 列改为 5 列
- **Acceptance Criteria Addressed**: AC-2, AC-4, AC-7
- **Test Requirements**:
  - `programmatic` TR-2.1: 渲染 5 个选项，值分别为 4.5, 6, 7.5, 8, 9
  - `programmatic` TR-2.2: 点击选项后 settings.targetSleepDuration 更新为对应值
  - `programmatic` TR-2.3: 默认选中 8h
  - `human-judgement` TR-2.4: 选项布局美观，5列排列不拥挤
- **Notes**: targetSleepDuration 数据类型保持 number（支持小数）

## [x] Task 3: 添加自定义目标睡眠时长功能
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 添加自定义时长输入控件（小时 + 分钟步进器）
  - 最小粒度为 30 分钟（0.5 小时）
  - 自定义值与推荐选项联动：选择推荐选项时自定义显示对应值
  - 输入自定义值时，如果匹配推荐选项则高亮对应选项
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-7
- **Test Requirements**:
  - `human-judgement` TR-3.1: 可以通过步进器调整小时和分钟
  - `human-judgement` TR-3.2: 最小调整粒度为 30 分钟
  - `programmatic` TR-3.3: 修改自定义时长后 settings.targetSleepDuration 同步更新
  - `human-judgement` TR-3.4: 自定义值与推荐选项联动正确
- **Notes**: 交互形式采用步进器（+/-按钮），符合移动端使用习惯

## [x] Task 4: 更新建议文案和相关样式
- **Priority**: medium
- **Depends On**: Task 1
- **Description**: 
  - 将提示文案改为"建议以一个半小时为一个睡眠周期设置目标睡眠时长"
  - 提示框移到目标睡眠时长区域内
  - 唤醒时间窗口区域可以保留或移除其提示框
  - 优化目标睡眠时长区域的视觉样式
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-4.1: 提示文案内容正确
  - `human-judgement` TR-4.2: 提示框位置合理，与目标睡眠时长相关联
  - `human-judgement` TR-4.3: 整体视觉风格统一
- **Notes**: 修改 src/pages/HomePage/index.tsx 和 style.css

## [x] Task 5: 整体验证和优化
- **Priority**: medium
- **Depends On**: Task 1, 2, 3, 4
- **Description**: 
  - 验证所有功能正常工作
  - 检查视觉效果和排版质量
  - 确保数据持久化正常
  - 构建测试通过
- **Acceptance Criteria Addressed**: AC-1 ~ AC-7
- **Test Requirements**:
  - `programmatic` TR-5.1: npm run build 构建通过
  - `human-judgement` TR-5.2: 整体布局美观，层级清晰
  - `human-judgement` TR-5.3: 交互流畅无卡顿
  - `programmatic` TR-5.4: 设置刷新后保持不变
- **Notes**: 最终验收
