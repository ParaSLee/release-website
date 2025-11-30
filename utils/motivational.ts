/**
 * Motivational Quotes Library
 * Used in block page and restart dialogs
 */

/**
 * Chinese motivational quotes
 */
export const MOTIVATIONAL_QUOTES_ZH = [
  "自律是通往成功的桥梁",
  "今天的努力，是明天的收获",
  "专注当下，成就未来",
  "每一次坚持，都是在为梦想积累力量",
  "自律者得自由，勤奋者获成功",
  "时间是最宝贵的资源，请珍惜每一分钟",
  "成功没有捷径，只有日复一日的坚持",
  "控制时间，就是控制人生",
  "今天的自律，铸就明天的自由",
  "专注力是现代社会最稀缺的资源",
  "每一个决定，都在塑造你的未来",
  "克服诱惑，是通往目标的必经之路",
  "坚持不懈，水滴石穿",
  "自律的人生才是真正的自由",
  "时间管理就是人生管理",
  "今天多一点努力，明天少一点遗憾",
  "专注是一种能力，更是一种选择",
  "成功始于自律，止于放纵",
  "每一次拒绝诱惑，都是在投资未来",
  "坚持比天赋更重要",
  "时间不会等待任何人，珍惜当下",
  "自律让生活更美好",
  "专注是成功的第一步",
  "今天的选择，决定明天的你",
  "克己复礼，自律自强",
  "时间是最公平的资源，关键在于如何使用",
  "每一次坚持，都是在超越昨天的自己",
  "自律的背后，是强大的内心",
  "专注当下，活在此刻",
  "成功属于那些懂得管理时间的人",
];

/**
 * English motivational quotes
 */
export const MOTIVATIONAL_QUOTES_EN = [
  "Self-discipline is the bridge to success",
  "Today's effort is tomorrow's harvest",
  "Focus on the present, achieve the future",
  "Every persistence accumulates power for your dreams",
  "The disciplined gain freedom, the diligent achieve success",
  "Time is the most precious resource, cherish every minute",
  "There are no shortcuts to success, only day-by-day persistence",
  "Control time, control life",
  "Today's discipline builds tomorrow's freedom",
  "Focus is the scarcest resource in modern society",
  "Every decision shapes your future",
  "Overcoming temptation is the path to your goals",
  "Persistence can overcome anything",
  "A disciplined life is true freedom",
  "Time management is life management",
  "A little more effort today, a little less regret tomorrow",
  "Focus is both an ability and a choice",
  "Success begins with discipline, ends with indulgence",
  "Every refusal of temptation is an investment in the future",
  "Persistence is more important than talent",
  "Time waits for no one, cherish the present",
  "Discipline makes life better",
  "Focus is the first step to success",
  "Today's choices determine tomorrow's you",
  "Self-discipline makes you stronger",
  "Time is the fairest resource, it's all about how you use it",
  "Every persistence is surpassing yesterday's self",
  "Behind discipline is a strong heart",
  "Focus on now, live in the moment",
  "Success belongs to those who manage their time",
];

/**
 * Get a random motivational quote
 */
export function getRandomQuote(language: "zh" | "en" = "zh"): string {
  const quotes = language === "zh" ? MOTIVATIONAL_QUOTES_ZH : MOTIVATIONAL_QUOTES_EN;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}

/**
 * Alternative activities suggestions (Chinese)
 */
export const ALTERNATIVE_ACTIVITIES_ZH = [
  "📚 阅读一本好书",
  "🏃 户外运动30分钟",
  "🎨 学习一项新技能",
  "🧘 冥想放松身心",
  "✍️ 写作或记录想法",
  "🎵 听听音乐放松",
  "👥 和家人朋友聊天",
  "🌳 出门散步接近自然",
  "🧩 玩益智游戏",
  "🍳 尝试烹饪新菜式",
  "📝 整理待办事项",
  "💪 做一组健身操",
  "🎯 专注工作/学习任务",
  "🌟 规划未来目标",
  "☕ 泡杯茶享受片刻宁静",
];

/**
 * Alternative activities suggestions (English)
 */
export const ALTERNATIVE_ACTIVITIES_EN = [
  "📚 Read a good book",
  "🏃 Exercise outdoors for 30 minutes",
  "🎨 Learn a new skill",
  "🧘 Meditate and relax",
  "✍️ Write or journal your thoughts",
  "🎵 Listen to music and relax",
  "👥 Chat with family and friends",
  "🌳 Go for a walk in nature",
  "🧩 Play puzzle games",
  "🍳 Try cooking a new dish",
  "📝 Organize your to-do list",
  "💪 Do a workout routine",
  "🎯 Focus on work/study tasks",
  "🌟 Plan your future goals",
  "☕ Make tea and enjoy a moment of peace",
];

/**
 * Get alternative activities
 */
export function getAlternativeActivities(language: "zh" | "en" = "zh"): string[] {
  return language === "zh" ? ALTERNATIVE_ACTIVITIES_ZH : ALTERNATIVE_ACTIVITIES_EN;
}

/**
 * Get random alternative activities (3-5 items)
 */
export function getRandomActivities(count: number = 5, language: "zh" | "en" = "zh"): string[] {
  const activities = getAlternativeActivities(language);
  const shuffled = [...activities].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Congratulation messages for canceling restart
 */
export const CONGRATS_MESSAGES_ZH = [
  "恭喜你的坚持！",
  "做得好！继续保持！",
  "你很棒！坚持就是胜利！",
  "为你的自律点赞！",
  "继续加油！你可以的！",
  "太好了！你战胜了诱惑！",
  "坚持下去，未来可期！",
  "你的自律让人钦佩！",
];

export const CONGRATS_MESSAGES_EN = [
  "Congratulations on your persistence!",
  "Well done! Keep it up!",
  "You're awesome! Persistence is victory!",
  "Kudos for your self-discipline!",
  "Keep going! You can do it!",
  "Great! You overcame the temptation!",
  "Keep persisting, the future is bright!",
  "Your self-discipline is admirable!",
];

/**
 * Get a random congratulation message
 */
export function getCongratsMessage(language: "zh" | "en" = "zh"): string {
  const messages = language === "zh" ? CONGRATS_MESSAGES_ZH : CONGRATS_MESSAGES_EN;
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

