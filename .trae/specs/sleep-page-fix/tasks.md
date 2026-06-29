# Tasks

- [x] Task 1: 修复日视图日期显示逻辑
  - [x] SubTask 1.1: 修改 formatDate 函数，根据睡眠记录的实际日期显示（昨天/今天/具体日期）
  - [x] SubTask 1.2: 更新 sleep-total-date 元素的显示逻辑
  - [x] SubTask 1.3: 添加空数据状态卡片，显示"暂无睡眠数据，请佩戴手表入睡"

- [x] Task 2: 修复环形图，添加清醒部分
  - [x] SubTask 2.1: 在环形图SVG中添加清醒(awake)部分，使用灰色(#D1D5DB)
  - [x] SubTask 2.2: 确保各阶段比例计算正确（深睡+浅睡+REM+清醒=100%）

- [x] Task 3: 修复硬编码数据问题
  - [x] SubTask 3.1: 计算实际的血氧平均值（从dataPoints获取）
  - [x] SubTask 3.2: 计算中途醒来次数（统计awake阶段次数）
  - [x] SubTask 3.3: 计算中途醒来总时长
  - [x] SubTask 3.4: 计算深睡连续性分数
  - [x] SubTask 3.5: 移除小睡硬编码数据，或从mockHistory中生成小睡数据

- [x] Task 4: 修复周视图柱状图
  - [x] SubTask 4.1: 根据实际日期计算星期几，而不是使用 idx % 7
  - [x] SubTask 4.2: 在柱子上方显示具体睡眠时长数值
  - [x] SubTask 4.3: 优化柱状图高度计算，基于实际最大值而非硬编码10小时

- [x] Task 5: 修复月视图日历
  - [x] SubTask 5.1: 添加月份切换功能（上一月/下一月按钮）
  - [x] SubTask 5.2: 每个日历格子显示具体日期
  - [x] SubTask 5.3: 确保日期与数据正确对应

- [x] Task 6: 添加无障碍支持
  - [x] SubTask 6.1: 为所有按钮添加 aria-label
  - [x] SubTask 6.2: 为图表添加 role="img" 和 aria-label

- [x] Task 7: CSS优化
  - [x] SubTask 7.1: 移除不必要的 !important
  - [x] SubTask 7.2: 使用更具体的CSS选择器替代 !important
  - [x] SubTask 7.3: 优化小屏幕适配（360px以下）

# Task Dependencies
- Task 3 依赖 Task 1（需要先有数据计算逻辑）
- Task 2 可以独立完成
- Task 4 可以独立完成
- Task 5 可以独立完成
- Task 6 依赖其他任务完成后添加无障碍标签
- Task 7 可以独立进行
