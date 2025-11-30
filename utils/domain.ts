/**
 * 从 URL 中提取域名
 * @example
 * extractDomain("https://www.youtube.com/watch?v=123") => "youtube.com"
 * extractDomain("https://m.youtube.com/") => "youtube.com"
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // 移除 "www." 或 "m." 前缀
    return hostname.replace(/^(www\.|m\.)/, "");
  } catch (error) {
    console.error("[域名] 无效的URL:", url, error);
    return "";
  }
}

/**
 * 检查 URL 是否匹配域名模式
 * 支持子域名匹配（例如: "youtube.com" 匹配 "www.youtube.com", "m.youtube.com"）
 *
 * @example
 * matchesDomain("https://www.youtube.com/watch?v=123", "youtube.com") => true
 * matchesDomain("https://m.youtube.com/", "youtube.com") => true
 * matchesDomain("https://youtube.com/", "google.com") => false
 */
export function matchesDomain(url: string, domainPattern: string): boolean {
  const urlDomain = extractDomain(url);
  const pattern = domainPattern.toLowerCase();

  // 精确匹配
  if (urlDomain === pattern) {
    return true;
  }

  // 子域名匹配（例如: "m.youtube.com" 匹配 "youtube.com"）
  if (urlDomain.endsWith(`.${pattern}`)) {
    return true;
  }

  return false;
}

/**
 * 获取域名的 favicon URL
 */
export function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

/**
 * 验证域名格式
 * @example
 * isValidDomain("youtube.com") => true
 * isValidDomain("www.youtube.com") => true
 * isValidDomain("invalid domain") => false
 */
export function isValidDomain(domain: string): boolean {
  // 基础域名验证正则表达式
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(domain);
}

/**
 * 规范化域名（移除 www. 并转换为小写）
 */
export function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^www\./, "");
}

/**
 * 检查 URL 是否为 HTTP 或 HTTPS
 */
export function isHttpUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * 从域名获取显示名称
 * @example
 * getDisplayName("youtube.com") => "YouTube"
 * getDisplayName("twitter.com") => "Twitter"
 */
export function getDisplayName(domain: string): string {
  // 移除顶级域名并首字母大写
  const name = domain.split(".")[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}
