# 睡眠页面五个子页面信息图重构 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 重构头部布局（左对齐 + 主辅指标结构）
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 将睡眠页面日视图的头部从居中对齐改为左对齐布局
  - 左侧区域：指标名称（小字）+ 数值范围（大号数字+单位）+ "昨天"（底部小字）
  - 右侧区域：辅助指标名称 + 数值（部分指标有，部分没有）
  - 为五个指标分别配置对应的辅助指标数据
  - 更新相关 CSS 样式
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgement` TR-1.1: 头部为左对齐布局，左侧指标名称在上方，数值在中间，"昨天"在底部
  - `human-judgement` TR-1.2: 心率页面右侧显示"睡眠基准心率 57次/分"
  - `human-judgement` TR-1.3: 血氧页面右侧显示"睡眠平均血氧 97%"
  - `human-judgement` TR-1.4: 呼吸率页面右侧无辅助指标
  - `human-judgement` TR-1.5: HRV页面右侧显示"平均睡眠心率变异性 52毫秒"
  - `human-judgement` TR-1.6: 总时长页面右侧无辅助指标
  - `human-judgement` TR-1.7: 字号、颜色、间距与截图风格一致

## [x] Task 2: 重构睡眠总时长子页面（睡眠阶段分布图）
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 确保睡眠阶段分布图与截图5完全一致
  - Y轴标签从上到下：清醒、快速眼动、浅睡、深睡
  - X轴标签：03:58、12:05、14:46
  - 睡眠阶段条使用绝对定位，保持各阶段间距
  - 右侧蓝紫色渐变小睡条
  - 网格线为虚线样式
  - 总时长页面不显示曲线图区域
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgement` TR-2.1: Y轴顺序正确（清醒在顶部，深睡在底部）
  - `human-judgement` TR-2.2: X轴标签位置正确（03:58、12:05、14:46）
  - `human-judgement` TR-2.3: 睡眠阶段条的位置、宽度与截图相似
  - `human-judgement` TR-2.4: 小睡渐变条在最右侧
  - `human-judgement` TR-2.5: 网格线为虚线
  - `human-judgement` TR-2.6: 总时长页面不显示曲线图

## [x] Task 3: 重构曲线图组件（支持多种指标的Y轴刻度）
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 重构曲线图组件，支持配置不同的Y轴范围和刻度
  - Y轴刻度显示在右侧
  - 添加网格线（虚线样式）
  - X轴标签显示在底部（03:58、14:46）
  - 红色折线 + 红色渐变填充（上深下浅）
  - 为每个指标配置对应的数据和Y轴范围
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-5, AC-6
- **Test Requirements**:
  - `human-judgement` TR-3.1: 曲线图Y轴刻度在右侧显示
  - `human-judgement` TR-3.2: 网格线为虚线样式
  - `human-judgement` TR-3.3: X轴底部显示时间标签
  - `human-judgement` TR-3.4: 红色折线和渐变填充效果正确
  - `human-judgement` TR-3.5: 心率Y轴刻度为40、80、120
  - `human-judgement` TR-3.6: 血氧Y轴刻度为90、95、100
  - `human-judgement` TR-3.7: 呼吸率Y轴刻度为10、20、30
  - `human-judgement` TR-3.8: HRV Y轴刻度为0、40、80、120

## [x] Task 4: 为各指标生成匹配截图的模拟曲线数据
- **Priority**: high
- **Depends On**: Task 3
- **Description**: 
  - 为睡眠心率生成与截图4相似的曲线数据
  - 为睡眠血氧生成与截图2相似的曲线数据
  - 为睡眠呼吸率生成与截图3相似的曲线数据
  - 为睡眠HRV生成与截图1相似的曲线数据
  - 数据点数量足够，曲线形状接近截图
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-5, AC-6
- **Test Requirements**:
  - `human-judgement` TR-4.1: 心率曲线形状与截图4相似（波动明显，有几个尖峰）
  - `human-judgement` TR-4.2: 血氧曲线形状与截图2相似（整体平稳，有几个低谷）
  - `human-judgement` TR-4.3: 呼吸率曲线形状与截图3相似（波动频繁，有一个明显低谷）
  - `human-judgement` TR-4.4: HRV曲线形状与截图1相似（先上升后下降再上升）

## [x] Task 5: 重构底部指标滚动卡片（顺序和数值）
- **Priority**: medium
- **Depends On**: None
- **Description**: 
  - 调整底部指标卡片的顺序
  - 确保每个卡片的数值与截图一致
  - 选中状态为浅蓝色背景
  - 确认卡片顺序：睡眠总时长 → 睡眠心率 → 睡眠呼吸率 → 睡眠血氧 → 睡眠心率变异性
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `human-judgement` TR-5.1: 卡片顺序正确
  - `human-judgement` TR-5.2: 每个卡片的数值与截图一致
  - `human-judgement` TR-5.3: 选中卡片为浅蓝色背景
  - `human-judgement` TR-5.4: 点击卡片可切换对应子页面

## [x] Task 6: 确保迷你睡眠阶段条垂直居中并带时间坐标
- **Priority**: medium
- **Depends On**: None
- **Description**: 
  - 确认迷你睡眠阶段条在其模块内垂直居中
  - 确保迷你阶段条带有时间坐标标签
  - 迷你阶段条使用绝对定位保持各阶段间距
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `human-judgement` TR-6.1: 迷你阶段条垂直居中
  - `human-judgement` TR-6.2: 底部显示时间坐标标签（03:58、14:46）
  - `human-judgement` TR-6.3: 各睡眠阶段之间保持正确的间距

## [x] Task 7: 整体调优和视觉细节校验
- **Priority**: medium
- **Depends On**: Task 1, Task 2, Task 3, Task 4, Task 5, Task 6
- **Description**: 
  - 整体检查五个子页面的视觉效果
  - 调整间距、字体大小、颜色等细节
  - 确保切换动画流畅
  - 与截图进行细节对比和微调
- **Acceptance Criteria Addressed**: AC-9, NFR-1, NFR-2
- **Test Requirements**:
  - `human-judgement` TR-7.1: 子页面切换动画流畅自然
  - `human-judgement` TR-7.2: 整体视觉风格与截图一致
  - `human-judgement` TR-7.3: 所有间距、字号、颜色符合设计规范
  - `human-judgement` TR-7.4: 在不同屏幕尺寸下布局正常
