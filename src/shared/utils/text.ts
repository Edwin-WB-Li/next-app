/**
 * 根据标题生成 URL slug
 */
export function generateSlug(titleText: string): string {
  return titleText
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 60);
}

/**
 * 计算文章阅读时间（分钟）
 * 中文按字计算，英文按词计算，约 300 字/词每分钟
 */
export function readingTime(content: string): number {
  const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
  const nonChineseWords = content
    .replace(/[\u4e00-\u9fff]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil((chineseChars + nonChineseWords) / 300));
}
