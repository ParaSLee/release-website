/**
 * 重启验证的单词生成器
 * 从预定义词库中生成120个随机单词
 */

/**
 * 常用英文单词词库（1000+单词）
 * 这些都是简单、常用的英文单词
 */
const WORD_BANK = [
  // 基础名词（100个）
  "apple", "orange", "banana", "grape", "lemon", "melon", "peach", "berry", "cherry", "plum",
  "book", "desk", "chair", "table", "lamp", "window", "door", "wall", "floor", "ceiling",
  "computer", "keyboard", "mouse", "screen", "phone", "camera", "watch", "clock", "radio", "television",
  "car", "bike", "bus", "train", "plane", "boat", "ship", "truck", "taxi", "subway",
  "house", "building", "street", "road", "bridge", "park", "garden", "tree", "flower", "grass",
  "dog", "cat", "bird", "fish", "horse", "cow", "pig", "sheep", "chicken", "duck",
  "sun", "moon", "star", "cloud", "rain", "snow", "wind", "storm", "thunder", "lightning",
  "water", "fire", "earth", "air", "stone", "rock", "mountain", "hill", "valley", "river",
  "ocean", "sea", "lake", "pond", "beach", "island", "forest", "desert", "field", "farm",
  "city", "town", "village", "country", "state", "nation", "world", "planet", "space", "universe",
  
  // 常用动词（100个）
  "run", "walk", "jump", "fly", "swim", "climb", "crawl", "dance", "sing", "play",
  "eat", "drink", "cook", "bake", "boil", "fry", "cut", "chop", "slice", "peel",
  "read", "write", "draw", "paint", "color", "sketch", "design", "create", "make", "build",
  "speak", "talk", "say", "tell", "ask", "answer", "call", "shout", "whisper", "listen",
  "see", "look", "watch", "view", "observe", "notice", "find", "search", "seek", "discover",
  "think", "know", "learn", "study", "teach", "practice", "train", "work", "help", "serve",
  "give", "take", "bring", "carry", "hold", "grab", "catch", "throw", "toss", "drop",
  "open", "close", "push", "pull", "lift", "lower", "raise", "move", "turn", "spin",
  "start", "begin", "finish", "end", "continue", "stop", "pause", "wait", "rest", "sleep",
  "love", "like", "enjoy", "prefer", "want", "need", "wish", "hope", "dream", "believe",
  
  // 常用形容词（100个）
  "big", "small", "large", "little", "huge", "tiny", "giant", "mini", "wide", "narrow",
  "long", "short", "tall", "high", "low", "deep", "shallow", "thick", "thin", "fat",
  "hot", "cold", "warm", "cool", "freezing", "boiling", "mild", "moderate", "extreme", "intense",
  "fast", "slow", "quick", "rapid", "swift", "speedy", "lazy", "active", "busy", "idle",
  "good", "bad", "great", "poor", "excellent", "terrible", "wonderful", "awful", "nice", "mean",
  "happy", "sad", "glad", "sorry", "joyful", "angry", "mad", "calm", "excited", "bored",
  "easy", "hard", "simple", "difficult", "complex", "tough", "soft", "gentle", "rough", "smooth",
  "new", "old", "young", "ancient", "modern", "fresh", "stale", "current", "past", "future",
  "clean", "dirty", "pure", "messy", "neat", "tidy", "clear", "cloudy", "bright", "dark",
  "strong", "weak", "powerful", "gentle", "heavy", "light", "solid", "liquid", "hard", "soft",
  
  // 常用副词（50个）
  "always", "never", "often", "sometimes", "rarely", "usually", "frequently", "seldom", "hardly", "barely",
  "quickly", "slowly", "rapidly", "gradually", "suddenly", "immediately", "instantly", "eventually", "finally", "lately",
  "here", "there", "everywhere", "nowhere", "somewhere", "anywhere", "inside", "outside", "above", "below",
  "very", "quite", "rather", "pretty", "really", "truly", "actually", "certainly", "definitely", "probably",
  "well", "badly", "carefully", "carelessly", "easily", "hardly", "nearly", "almost", "barely", "scarcely",
  
  // 常用介词和连词（50个）
  "in", "on", "at", "by", "for", "with", "from", "to", "of", "about",
  "into", "onto", "over", "under", "above", "below", "between", "among", "through", "across",
  "and", "but", "or", "nor", "for", "yet", "so", "because", "since", "until",
  "if", "when", "where", "while", "before", "after", "during", "within", "without", "despite",
  "however", "therefore", "moreover", "furthermore", "nevertheless", "otherwise", "besides", "instead", "meanwhile", "then",
  
  // 数字和时间（50个）
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "first", "second", "third", "last", "next", "previous", "following", "prior", "final", "initial",
  "today", "tomorrow", "yesterday", "now", "then", "soon", "late", "early", "morning", "evening",
  "night", "day", "week", "month", "year", "hour", "minute", "second", "moment", "time",
  "spring", "summer", "autumn", "winter", "season", "monday", "tuesday", "wednesday", "thursday", "friday",
  
  // 其他常用词（250个）
  "thing", "place", "way", "time", "person", "people", "man", "woman", "child", "family",
  "friend", "team", "group", "company", "business", "office", "shop", "store", "market", "mall",
  "school", "class", "student", "teacher", "lesson", "subject", "course", "exam", "test", "homework",
  "food", "meal", "breakfast", "lunch", "dinner", "snack", "dish", "soup", "salad", "bread",
  "meat", "chicken", "beef", "pork", "fish", "egg", "milk", "cheese", "butter", "cream",
  "rice", "pasta", "noodle", "potato", "tomato", "onion", "carrot", "pepper", "cucumber", "cabbage",
  "game", "sport", "ball", "team", "player", "match", "score", "win", "lose", "draw",
  "music", "song", "band", "singer", "guitar", "piano", "drum", "violin", "concert", "album",
  "movie", "film", "show", "actor", "scene", "screen", "theater", "cinema", "video", "photo",
  "color", "red", "blue", "green", "yellow", "orange", "purple", "pink", "brown", "black",
  "white", "gray", "silver", "gold", "bright", "pale", "dark", "light", "shade", "tone",
  "number", "letter", "word", "sentence", "paragraph", "page", "chapter", "story", "title", "text",
  "question", "answer", "problem", "solution", "idea", "thought", "mind", "brain", "memory", "dream",
  "feeling", "emotion", "sense", "sight", "sound", "smell", "taste", "touch", "pain", "pleasure",
  "health", "sick", "well", "ill", "hurt", "heal", "cure", "medicine", "doctor", "hospital",
  "money", "dollar", "cent", "price", "cost", "pay", "buy", "sell", "save", "spend",
  "work", "job", "career", "profession", "skill", "talent", "ability", "power", "strength", "force",
  "life", "death", "birth", "age", "youth", "adult", "baby", "parent", "mother", "father",
  "brother", "sister", "son", "daughter", "uncle", "aunt", "cousin", "grandfather", "grandmother", "family",
  "home", "room", "kitchen", "bedroom", "bathroom", "living", "dining", "garage", "basement", "attic",
  "clothes", "shirt", "pants", "dress", "skirt", "coat", "jacket", "shoes", "socks", "hat",
  "body", "head", "face", "eye", "ear", "nose", "mouth", "hand", "foot", "leg",
  "arm", "finger", "toe", "neck", "shoulder", "chest", "back", "stomach", "heart", "lung",
  "hair", "skin", "bone", "blood", "muscle", "nerve", "brain", "tooth", "tongue", "lip",
  "right", "left", "middle", "center", "side", "front", "back", "top", "bottom", "edge",
];

/**
 * 生成用于验证的随机单词
 */
export function generateWords(count: number = 120): string {
  const words: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * WORD_BANK.length);
    words.push(WORD_BANK[randomIndex]);
  }
  
  return words.join(" ");
}

/**
 * 格式化单词用于显示（每行10个单词）
 */
export function formatWordsForDisplay(words: string): string {
  const wordArray = words.split(" ");
  const lines: string[] = [];
  
  for (let i = 0; i < wordArray.length; i += 10) {
    const line = wordArray.slice(i, i + 10).join(" ");
    lines.push(line);
  }
  
  return lines.join("\n");
}

/**
 * 验证用户输入是否与生成的单词匹配
 * 必须完全匹配（区分大小写、空格、标点）
 */
export function validateWordInput(generated: string, userInput: string): boolean {
  return generated.trim() === userInput.trim();
}

/**
 * 获取匹配百分比，用于用户反馈
 */
export function getMatchPercentage(generated: string, userInput: string): number {
  const generatedWords = generated.trim().split(/\s+/);
  const userWords = userInput.trim().split(/\s+/);
  
  let matches = 0;
  const maxLength = Math.max(generatedWords.length, userWords.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (generatedWords[i] === userWords[i]) {
      matches++;
    }
  }
  
  if (maxLength === 0) return 0;
  
  return Math.round((matches / generatedWords.length) * 100);
}

/**
 * 获取单词数量
 */
export function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}
