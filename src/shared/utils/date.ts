/**
 * 格式化日期为中文格式：2024年1月15日
 */
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateStr));
}

/**
 * 计算截止日期的相对描述（今天/明天/昨天/N天后/N天前截止）
 */
export function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(d.getTime());
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "今天";
  if (diffDays === 1) return "明天";
  if (diffDays === -1) return "昨天";
  if (diffDays < 0) return `${Math.abs(diffDays)}天前截止`;
  return `${diffDays}天后`;
}
