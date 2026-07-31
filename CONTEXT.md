# Next App

个人博客与工具集合站点，包含文章管理、看板、徒步路线记录等模块。

## Language

**Todo**:
个人待办事项，独立的任务清单条目，包含标题、优先级和可选截止日期。
_Avoid_: Task（与看板 Task 混淆）, Item（过于笼统）

**Kanban Task**:
看板中的任务卡片，属于某个状态列，支持拖拽排序。
_Avoid_: Todo（与待办清单混淆）

**Priority**:
待办事项的紧急程度，分为高（high）、中（medium）、低（low）三档。中优先级为默认值。
_Avoid_: Urgency, Level

**Due Date**:
待办事项的预期完成日期，可选字段，以 ISO 日期字符串存储。
_Avoid_: Deadline（过于强硬）, End Date

**Completed**:
待办事项已被标记为完成的状态。切换后记录完成时间，可从列表中折叠隐藏。
_Avoid_: Done, Finished
