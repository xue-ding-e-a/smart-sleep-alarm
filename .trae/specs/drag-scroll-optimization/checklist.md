# 指标卡片横向滑动拖动优化 - Verification Checklist

## 状态管理与事件处理
- [x] Checkpoint 1: 鼠标在容器外松开时，拖拽状态立即解除
- [x] Checkpoint 2: 鼠标移出文档窗口时，拖拽状态正确清理
- [x] Checkpoint 3: 拖拽位移超过 8px 后，不触发卡片点击事件
- [x] Checkpoint 4: 点击位移小于 8px 时，卡片正常选中切换
- [x] Checkpoint 5: 修复松开鼠标后仍能拖动的 bug（鼠标未按下时移动不触发滚动）

## 性能与流畅度
- [x] Checkpoint 6: 拖拽过程流畅无明显卡顿，跟随鼠标跟手
- [x] Checkpoint 7: 使用 requestAnimationFrame 进行帧同步更新
- [x] Checkpoint 8: 快速来回拖动不出现抖动或跳变

## 边界弹性效果
- [x] Checkpoint 9: 拖动到左边界继续向左拖时，有弹性阻力感（位移衰减）
- [x] Checkpoint 10: 拖动到右边界继续向右拖时，有弹性阻力感（位移衰减）
- [x] Checkpoint 11: 越界后松开鼠标，平滑回弹到边界位置
- [x] Checkpoint 12: 回弹动画自然，无突兀跳变

## 惯性滚动
- [x] Checkpoint 13: 快速拖动后松开，内容按惯性继续滚动并逐渐减速
- [x] Checkpoint 14: 慢速拖动后松开，几乎没有惯性滚动
- [x] Checkpoint 15: 惯性滚动期间按下鼠标，惯性立即停止
- [x] Checkpoint 16: 惯性滚动到边界时，有弹性回弹效果而非硬停止
- [x] Checkpoint 17: 惯性减速曲线平滑自然，不突兀
