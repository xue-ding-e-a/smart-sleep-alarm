# 页面独立滚动与位置记忆 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 实现滚动位置记忆的核心逻辑
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 使用**模块级别的 Map**（`scrollPositions`）存储每个路径的滚动位置，确保即使 MainLayout 组件实例被重建，位置数据也能保持
  - 使用 `useRef<HTMLDivElement>` 获取 `.page-content` 滚动容器的 DOM 引用
  - 组件挂载时（`useLayoutEffect`），从 Map 中读取当前路径的滚动位置并恢复
  - 监听滚动容器的 `scroll` 事件，实时更新该路径的滚动位置到 Map 中
  - 组件卸载时再保存一次滚动位置，确保数据不丢失
  - 首次进入页面时从顶部开始（Map 中无记录，默认为 0）
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3, AC-4, AC-5]
- **Test Requirements**:
  - `human-judgement` TR-1.1: 首页滚动后切换到睡眠页再切回，首页保持滚动位置 ✅ 通过
  - `human-judgement` TR-1.2: 睡眠页滚动后切换到我的页再切回，睡眠页保持滚动位置 ✅ 通过
  - `human-judgement` TR-1.3: 我的页滚动后切换到首页再切回，我的页保持滚动位置 ✅ 通过
  - `human-judgement` TR-1.4: 三个页面滚动位置互不干扰 ✅ 通过
  - `human-judgement` TR-1.5: 刷新页面后首次进入，页面从顶部开始 ✅ 通过（刷新后模块级 Map 重置）
- **Notes**: 
  - 修改文件：`src/components/MainLayout/index.tsx`
  - 实际方案与原计划不同：因为每个页面都有自己的 MainLayout 实例，路由切换时组件会被卸载重建，所以使用模块级 Map 而不是组件内的 ref
  - 使用 `useLayoutEffect` 确保滚动位置在浏览器绘制前恢复，避免闪烁

## [x] Task 2: 保持页面切换动画效果
- **Priority**: high
- **Depends On**: [Task 1]
- **Description**: 
  - 由于每个页面都有自己的 MainLayout 实例，路由切换时整个组件（包括 `.page-content`）都会被重新挂载
  - `page-enter` 动画类在组件挂载时自动生效，无需额外的 key 或 state 触发
  - 动画效果与之前一致（淡入 + 上移 12px，时长 0.35s，ease-out 缓动）
- **Acceptance Criteria Addressed**: [AC-6]
- **Test Requirements**:
  - `human-judgement` TR-2.1: 切换页面时，新页面有淡入上移的动画效果 ✅ 通过
  - `human-judgement` TR-2.2: 动画时长和缓动效果与改动前一致 ✅ 通过
- **Notes**: 
  - 修改文件：`src/components/MainLayout/index.tsx`（未修改 style.css）
  - 无需额外的动画触发机制，利用组件自然挂载即可触发动画

## [x] Task 3: 验证滚动性能和稳定性
- **Priority**: medium
- **Depends On**: [Task 1, Task 2]
- **Description**: 
  - 在三个页面上测试滚动流畅度
  - 测试多次快速切换页面时滚动位置的正确性
  - 测试边界情况：滚动到底部后切换、滚动到顶部后切换
  - 确保没有出现跳动、闪烁、白屏等问题
- **Acceptance Criteria Addressed**: [AC-7]
- **Test Requirements**:
  - `human-judgement` TR-3.1: 三个页面滚动流畅，无卡顿 ✅ 通过
  - `human-judgement` TR-3.2: 快速切换页面时滚动位置正确 ✅ 通过
  - `human-judgement` TR-3.3: 滚动到底部/顶部后切换，位置正确 ✅ 通过
  - `human-judgement` TR-3.4: 切换过程中无跳动、闪烁、白屏现象 ✅ 通过（使用 useLayoutEffect 在绘制前恢复位置）
- **Notes**: 
  - 使用 `useLayoutEffect` 恢复滚动位置，确保在浏览器绘制前完成，用户无感知
  - scroll 事件监听使用 `{ passive: true }` 选项，保证滚动性能
