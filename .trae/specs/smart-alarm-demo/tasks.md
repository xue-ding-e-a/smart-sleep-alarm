# 智能睡眠唤醒闹钟 - 实施计划 (Decomposed and Prioritized Task List)

## [x] Task 1: 项目初始化与基础架构搭建
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 使用 Vite + React + TypeScript 初始化项目
  - 配置项目目录结构（components, pages, hooks, utils, types, store, assets）
  - 配置移动端视口与基础样式重置
  - 配置路由（React Router）
  - 配置全局主题变量（深色主题配色方案）
- **Acceptance Criteria Addressed**: [AC-9, AC-10]
- **Test Requirements**:
  - `programmatic` TR-1.1: 项目可成功启动，无构建错误
  - `programmatic` TR-1.2: 路由可正常切换，至少3个空白页面可访问
  - `human-judgement` TR-1.3: 移动端视口设置正确，在手机尺寸下显示正常
- **Notes**: 使用 CSS Variables 管理主题色，便于后续统一调整

## [x] Task 2: 用户认证系统（登录/注册）
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 实现登录页面（用户名/邮箱 + 密码）
  - 实现注册页面
  - 实现用户状态管理（Context + localStorage持久化）
  - 实现路由守卫（未登录跳转登录页）
  - 实现退出登录功能
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `programmatic` TR-2.1: 新用户注册成功后数据保存在localStorage
  - `programmatic` TR-2.2: 已注册用户可正常登录，登录状态持久化
  - `programmatic` TR-2.3: 未登录访问受保护页面自动跳转登录页
  - `human-judgement` TR-2.4: 登录/注册界面简约美观，表单交互流畅
- **Notes**: Demo阶段无需后端，所有数据存储在localStorage；密码做简单哈希即可

## [x] Task 3: 底部导航与主框架
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 实现底部Tab导航栏（首页/睡眠/报告/我的）
  - 实现页面切换过渡动效
  - 实现顶部状态栏区域适配（安全区域）
  - 实现全局组件：按钮、卡片、开关等基础UI组件
- **Acceptance Criteria Addressed**: [AC-9, AC-10]
- **Test Requirements**:
  - `programmatic` TR-3.1: 底部导航4个Tab可正常切换
  - `human-judgement` TR-3.2: 导航栏设计简约高级，与整体风格统一
  - `human-judgement` TR-3.3: 页面切换动效流畅自然
- **Notes**: 导航图标使用SVG，确保清晰度

## [x] Task 4: Mock睡眠数据生成器
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 设计睡眠数据结构（心率、体动、血氧、睡眠阶段、时间戳）
  - 实现睡眠周期模拟算法（约90分钟一个周期：浅睡→深睡→REM→浅睡）
  - 实现实时数据生成器（可调节速度的模拟数据流）
  - 生成历史睡眠记录Mock数据（7天历史数据）
- **Acceptance Criteria Addressed**: [AC-2, AC-3, AC-5]
- **Test Requirements**:
  - `programmatic` TR-4.1: 数据生成器可持续输出符合睡眠科学规律的模拟数据
  - `programmatic` TR-4.2: 睡眠阶段按周期规律变化（浅睡-深睡-REM循环）
  - `programmatic` TR-4.3: 心率数值与睡眠阶段相关联（深睡时心率更低）
- **Notes**: 支持加速模式（1秒=1分钟），便于Demo演示

## [x] Task 5: 首页 - 闹钟设置与概览
- **Priority**: high
- **Depends On**: Task 3, Task 4
- **Description**: 
  - 展示当前时间与日期
  - 展示下次智能唤醒时间窗口
  - 智能闹钟开关
  - 唤醒时间窗口设置（最早/最晚时间选择器）
  - 快速开始睡眠监测按钮
  - 手表连接状态指示器
- **Acceptance Criteria Addressed**: [AC-4, AC-9]
- **Test Requirements**:
  - `programmatic` TR-5.1: 唤醒时间窗口设置成功保存在localStorage
  - `programmatic` TR-5.2: 首页正确显示下次唤醒时间
  - `human-judgement` TR-5.3: 时间选择器交互流畅直观
  - `human-judgement` TR-5.4: 首页布局清晰，信息层次分明
- **Notes**: 使用原生time input或自定义时间滚轮选择器

## [x] Task 6: 睡眠监测页面 - 实时数据展示
- **Priority**: high
- **Depends On**: Task 3, Task 4
- **Description**: 
  - 实时心率数值显示与波动曲线
  - 当前睡眠阶段标识（深睡/浅睡/REM/清醒）
  - 体动强度指示
  - 睡眠进度条（已睡时长/目标时长）
  - 手表连接状态与数据传输动画
  - 开始/停止睡眠监测控制
- **Acceptance Criteria Addressed**: [AC-2, AC-3]
- **Test Requirements**:
  - `programmatic` TR-6.1: 心率数据每秒（模拟时间）更新并绘制曲线
  - `programmatic` TR-6.2: 睡眠阶段随模拟时间正确切换
  - `human-judgement` TR-6.3: 数据可视化清晰美观，动态效果流畅
  - `human-judgement` TR-6.4: 深色背景下数据展示舒适不刺眼
- **Notes**: 使用Canvas或SVG绘制心率曲线，保持60fps流畅度

## [x] Task 7: AI智能唤醒算法
- **Priority**: high
- **Depends On**: Task 4, Task 5
- **Description**: 
  - 实现睡眠阶段识别逻辑
  - 实现最佳唤醒时机判定算法（在唤醒窗口内寻找浅睡期）
  - 实现唤醒窗口边界处理（窗口结束强制唤醒）
  - 实现睡眠恢复程度评分计算
  - 与闹钟触发机制集成
- **Acceptance Criteria Addressed**: [AC-5]
- **Test Requirements**:
  - `programmatic` TR-7.1: 当处于唤醒窗口且睡眠阶段为浅睡时，触发唤醒
  - `programmatic` TR-7.2: 唤醒窗口结束时，无论睡眠阶段如何均触发唤醒
  - `programmatic` TR-7.3: 睡眠质量评分与各阶段时长占比正相关
  - `human-judgement` TR-7.4: 算法逻辑符合睡眠科学常识
- **Notes**: 算法核心逻辑独立封装，便于后续优化替换

## [x] Task 8: 闹钟唤醒界面
- **Priority**: high
- **Depends On**: Task 7
- **Description**: 
  - 全屏唤醒界面（渐变背景+大时钟）
  - 闹铃音效（Web Audio API实现，音量渐强）
  - 振动反馈提示（navigator.vibrate）
  - "停止"按钮（停止闹钟并进入睡眠报告）
  - "贪睡"按钮（延后5分钟再响）
  - 唤醒时间与睡眠阶段显示
- **Acceptance Criteria Addressed**: [AC-6]
- **Test Requirements**:
  - `programmatic` TR-8.1: 闹钟触发时播放音效且音量逐渐增大
  - `programmatic` TR-8.2: 点击停止按钮停止音效并跳转报告页
  - `programmatic` TR-8.3: 点击贪睡按钮延后5分钟再次触发
  - `human-judgement` TR-8.4: 唤醒界面视觉舒适，按钮易于操作
- **Notes**: 音效使用振荡器生成简单旋律，无需外部音频文件

## [x] Task 9: 睡眠报告页面
- **Priority**: medium
- **Depends On**: Task 3, Task 8
- **Description**: 
  - 睡眠总时长与入睡/醒来时间
  - 睡眠阶段分布饼图/柱状图
  - 睡眠质量评分（0-100分）
  - 心率变化趋势图
  - 最佳唤醒时机说明（为什么选择这个时间唤醒）
  - 个性化小建议
- **Acceptance Criteria Addressed**: [AC-7]
- **Test Requirements**:
  - `programmatic` TR-9.1: 报告数据与实际睡眠记录一致
  - `programmatic` TR-9.2: 睡眠质量评分计算正确
  - `human-judgement` TR-9.3: 数据可视化清晰易懂
  - `human-judgement` TR-9.4: 报告内容有价值，解释了智能唤醒的好处
- **Notes**: 使用SVG绘制图表，保持轻量

## [x] Task 10: 历史记录与个性化页面
- **Priority**: medium
- **Depends On**: Task 3, Task 9
- **Description**: 
  - 历史睡眠记录列表（近7天/30天）
  - 每周睡眠趋势概览
  - 个性化睡眠规律总结（平均入睡时间、平均睡眠时长等）
  - "千人千面"策略展示（基于历史数据的唤醒偏好）
  - 用户个人信息展示与设置
- **Acceptance Criteria Addressed**: [AC-8]
- **Test Requirements**:
  - `programmatic` TR-10.1: 历史记录列表正确展示所有已保存的睡眠记录
  - `programmatic` TR-10.2: 个性化统计数据计算正确
  - `human-judgement` TR-10.3: 历史数据可视化直观
  - `human-judgement` TR-10.4: 个性化建议具有说服力
- **Notes**: 首次使用时生成Mock历史数据

## [x] Task 11: "我的"页面与全局设置
- **Priority**: medium
- **Depends On**: Task 3, Task 2
- **Description**: 
  - 用户头像与基本信息展示
  - 设备管理（手表连接状态、模拟连接/断开）
  - 闹钟设置（音量、贪睡时长、音效选择）
  - 睡眠目标设置
  - 退出登录按钮
  - 关于/版本信息
- **Acceptance Criteria Addressed**: [AC-1, AC-2]
- **Test Requirements**:
  - `programmatic` TR-11.1: 设置项修改后正确保存
  - `programmatic` TR-11.2: 退出登录后清除登录状态
  - `human-judgement` TR-11.3: 设置页布局清晰，分类合理
- **Notes**: 设置项使用开关、选择器等原生交互组件

## [x] Task 12: 整体UI优化与动效完善
- **Priority**: medium
- **Depends On**: Task 5, Task 6, Task 8, Task 9, Task 10
- **Description**: 
  - 统一视觉风格与设计语言
  - 添加页面切换过渡动画
  - 添加按钮交互动效
  - 添加数据加载/更新动效
  - 优化深色模式下的对比度与可读性
  - 不同尺寸屏幕适配调优
- **Acceptance Criteria Addressed**: [AC-9, AC-10]
- **Test Requirements**:
  - `programmatic` TR-12.1: 在360px、390px、430px宽度下布局正常
  - `human-judgement` TR-12.2: 整体视觉风格简约高级
  - `human-judgement` TR-12.3: 动效流畅自然，不卡顿
  - `human-judgement` TR-12.4: 深色主题舒适，夜间使用不刺眼
- **Notes**: 此任务为整体打磨，建议各页面完成后统一进行

## [x] Task 13: Demo演示模式（可选增强）
- **Priority**: low
- **Depends On**: Task 12
- **Description**: 
  - 一键演示模式：自动演示完整睡眠周期
  - 加速睡眠流程（从睡前设置到智能唤醒到报告生成）
  - 演示过程有引导提示
- **Acceptance Criteria Addressed**: [AC-7, AC-8]
- **Test Requirements**:
  - `human-judgement` TR-13.1: 演示流程完整流畅，能清晰展示产品核心价值
  - `programmatic` TR-13.2: 演示模式可随时启动和退出
- **Notes**: 可选任务，视时间和效果决定是否实现
