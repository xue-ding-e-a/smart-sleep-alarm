# 睡眠页面仿 vivo 健康风格重设计 - The Implementation Plan

## [x] Task 1: 主题配色系统改造
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 更新 theme.css 中的 CSS 变量，主色调改为蓝紫色系（#5B5CFF 为主色）
  - 背景色改为浅灰白 (#F5F5F5 / #FAFAFA)
  - 卡片背景为白色，带浅灰色边框 (#E5E5E5)
  - 文字颜色：主文字 #1A1A1A，次文字 #8C8C8C
  - 更新 global.css 中的全局装饰元素
- **Acceptance Criteria Addressed**: [AC-1, AC-10]
- **Test Requirements**:
  - `human-judgement` TR-1.1: 打开应用，整体色调与参考截图一致，蓝紫色为主色调
  - `human-judgement` TR-1.2: 卡片样式统一，圆角、边框、阴影风格一致
- **Notes**: 先改主题，后续页面改造依赖主题变量

## [x] Task 2: UI 基础组件适配（底部导航、按钮、开关、图标）
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - BottomNav: 白色背景 + 浅灰边框顶部，激活态蓝紫色
  - Button: 主按钮蓝紫色背景白字，次按钮白底灰边
  - Switch: 开启态蓝紫色
  - Icon: SVG 渐变色改为蓝紫色系
- **Acceptance Criteria Addressed**: [AC-10]
- **Test Requirements**:
  - `human-judgement` TR-2.1: 底部导航激活项为蓝紫色，风格简洁
  - `human-judgement` TR-2.2: 按钮、开关组件风格与参考截图一致
- **Notes**: 保持组件功能不变，仅修改样式

## [x] Task 3: 睡眠页面日视图重设计
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 顶部日/周/月切换器，激活态蓝紫底色白字，未激活浅灰底灰字
  - 睡眠阶段柱状图：Y轴为睡眠阶段（清醒/快速眼动/浅睡/深睡），X轴为时间，用堆叠矩形表示
  - 横向滚动指标选择器：睡眠总时长、睡眠心率、睡眠血氧、睡眠呼吸率、睡眠心率变异性，选中项浅蓝底色
  - 睡眠评分卡片：87分 + "睡眠良好"绿色标签 + "与上次相同" + 建议文字
  - 第1段睡眠：时长 + 时间范围 + 环形图 + 各阶段时长列表
  - "更多分析"展开/收起按钮
  - 展开后：深睡比例16%偏低、浅睡比例66%偏高、快速眼动比例18%正常、中途醒来次数0次、中途醒来时长0分钟、深睡连续性100分、平均睡眠血氧96%
  - 第2段睡眠（小睡）：1小时11分(13:35-14:46) + 手表图标
  - 底部说明文字
- **Acceptance Criteria Addressed**: [AC-2, AC-3]
- **Test Requirements**:
  - `human-judgement` TR-3.1: 日视图布局与截图一致，从上到下顺序正确
  - `human-judgement` TR-3.2: 睡眠阶段柱状图样式正确，颜色区分深睡/浅睡/REM/清醒
  - `human-judgement` TR-3.3: 所有数值与截图完全一致
  - `human-judgement` TR-3.4: "更多分析"展开/收起功能正常
  - `human-judgement` TR-3.5: 环形图颜色分配正确（深睡/浅睡/快速眼动）
- **Notes**: 数据硬编码为截图中的值，确保完全一致

## [x] Task 4: 睡眠页面周视图重设计
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 顶部平均睡眠时长：7小时47分钟，日期范围 2026年6月20日至26日
  - 周睡眠柱状图：周六~周五共7天，每天睡眠时长用圆角矩形表示
  - 8个指标卡片（2列网格）：
    1. 平均睡眠分数 83分 + 折线迷你图（6月20日-6月26日）
    2. 平均卧床时长 7小时38分钟 + 柱状迷你图
    3. 平均深睡时长 1小时15分钟 + 柱状迷你图
    4. 睡眠心率 45-109次/分 + 圆点迷你图
    5. 平均睡眠血氧 97% + 折线迷你图
    6. 平均入睡时长 无数据 + 空图表
    7. 平均打鼾时长 无数据 + 空图表
    8. 平均不规律打鼾时长 无数据 + 空图表
- **Acceptance Criteria Addressed**: [AC-4, AC-5]
- **Test Requirements**:
  - `human-judgement` TR-4.1: 周视图布局与截图一致
  - `human-judgement` TR-4.2: 周柱状图样式正确，圆角矩形表示每天睡眠
  - `human-judgement` TR-4.3: 8个指标卡片数值与截图一致
  - `human-judgement` TR-4.4: 每个卡片的迷你图表样式正确
- **Notes**: "无数据"的卡片图表区域显示空的占位

## [x] Task 5: 睡眠页面月视图重设计
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 顶部平均睡眠时长：7小时41分钟，日期范围 2026年5月27日至6月26日
  - 月睡眠柱状图：约30天的睡眠时长条，X轴日期标签（125日/6月1日/6月8日/6月15日/6月22日），Y轴时间
  - 下方8个指标卡片（与周视图相同布局）：
    1. 平均睡眠分数 82分
    2. 平均卧床时长 7小时30分钟
    3. 平均深睡时长 1小时17分钟
    4. 睡眠心率 45-114次/分
    5. 平均睡眠血氧 97%
    6. 平均入睡时长 无数据
    7. 平均打鼾时长 无数据
    8. 平均不规律打鼾时长 无数据
- **Acceptance Criteria Addressed**: [AC-6, AC-7]
- **Test Requirements**:
  - `human-judgement` TR-5.1: 月视图布局与截图一致
  - `human-judgement` TR-5.2: 月柱状图样式正确，X轴Y轴标签正确
  - `human-judgement` TR-5.3: 8个指标卡片数值与截图一致
- **Notes**: 月视图的指标卡片可以复用周视图的卡片组件

## [x] Task 6: 首页风格适配
- **Priority**: medium
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 首页卡片、按钮、图标使用新的蓝紫色主题
  - 保持现有功能和布局结构，仅更新视觉风格
  - 卡片改为白底浅灰边框样式
- **Acceptance Criteria Addressed**: [AC-8]
- **Test Requirements**:
  - `human-judgement` TR-6.1: 首页整体风格与睡眠页一致
  - `human-judgement` TR-6.2: 所有组件使用新主题色

## [x] Task 7: 个人页风格适配
- **Priority**: medium
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 个人页所有卡片、开关、按钮使用新主题
  - 头像改为蓝紫色系
  - 保持现有布局和功能
- **Acceptance Criteria Addressed**: [AC-9]
- **Test Requirements**:
  - `human-judgement` TR-7.1: 个人页整体风格与睡眠页一致
  - `human-judgement` TR-7.2: 开关、按钮等组件样式正确

## [x] Task 8: 整体视觉验证
- **Priority**: medium
- **Depends On**: Task 3, Task 4, Task 5, Task 6, Task 7
- **Description**: 
  - 逐页对比参考截图，检查视觉一致性
  - 检查日/周/月视图切换流畅
  - 检查展开/收起等交互正常
  - 修复发现的样式问题
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10]
- **Test Requirements**:
  - `human-judgement` TR-8.1: 所有页面视觉风格统一，与参考截图相似
  - `human-judgement` TR-8.2: 睡眠页面数据与截图完全一致
  - `human-judgement` TR-8.3: 所有交互功能正常
