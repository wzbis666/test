import dayjs from 'dayjs';

export interface ParsedEvent {
  title: string;
  date: string;       // YYYY-MM-DD
  startTime: string;   // HH:mm
  endTime: string;     // HH:mm
}

/**
 * 简易中文自然语言解析器
 *
 * 支持格式：
 *   "明天 9点 开会"           → 明天 09:00-10:00
 *   "下午3点产品评审"          → 今天 15:00-16:00
 *   "周三 14:00 周会"          → 本周三 14:00-15:00
 *   "产品评审 14:00-15:30"    → 今天 14:00-15:30
 *   "后天 10:00 面试"          → 后天 10:00-11:00
 *   "下周一 9点 站会"          → 下周一 09:00-10:00
 *   "今天下午4点半健身"         → 今天 16:30-17:30
 *   "7月25日 全天 团建"        → 7月25日 09:00-18:00
 */

export function parseQuickAdd(input: string): ParsedEvent | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let dateStr = dayjs().format('YYYY-MM-DD');
  let startTime = '09:00';
  let endTime = '10:00';
  let title = trimmed;

  // —— date patterns ——
  const datePatterns: [RegExp, (m: RegExpMatchArray) => dayjs.Dayjs][] = [
    // "明天" → today + 1
    [/明天/, () => dayjs().add(1, 'day')],
    // "后天" → today + 2
    [/后天/, () => dayjs().add(2, 'day')],
    // "今天"
    [/今天/, () => dayjs()],
    // "下周一/二/三/四/五/六/日/天" → next week
    [/下周(一|二|三|四|五|六|[日天])/, (m) => {
      const map: Record<string, number> = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 7, '天': 7 };
      const target = map[m[1]] ?? 1;
      return dayjs().isoWeekday(target + 7);
    }],
    // "周一/二/三/四/五/六/日/天" → this week
    [/周(一|二|三|四|五|六|[日天])/, (m) => {
      const map: Record<string, number> = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 7, '天': 7 };
      const target = map[m[1]] ?? 1;
      const today = dayjs();
      const current = today.isoWeekday();
      if (target > current) return today.isoWeekday(target);
      return today.isoWeekday(target + 7); // already passed this week → next week
    }],
    // "MM月DD日"
    [/(\d{1,2})月(\d{1,2})[日号]/, (m) => {
      const month = parseInt(m[1]!);
      const d = parseInt(m[2]!);
      return dayjs().month(month - 1).date(d);
    }],
  ];

  // Extract date from input
  for (const [pattern, fn] of datePatterns) {
    const match = trimmed.match(pattern);
    if (match) {
      dateStr = fn(match).format('YYYY-MM-DD');
      title = title.replace(match[0], '').trim();
      break;
    }
  }

  // —— time patterns ——
  // "HH:mm-HH:mm" or "HH:mm~HH:mm" or "H:mm-H:mm"
  const timeRangeMatch = title.match(/(\d{1,2}):(\d{2})\s*[-~至到]\s*(\d{1,2}):(\d{2})/);
  if (timeRangeMatch) {
    const pad = (n: string) => n.padStart(2, '0');
    startTime = pad(timeRangeMatch[1]!) + ':' + timeRangeMatch[2]!;
    endTime = pad(timeRangeMatch[3]!) + ':' + timeRangeMatch[4]!;
    title = title.replace(timeRangeMatch[0], '').trim();
    return { title, date: dateStr, startTime, endTime };
  }

  // "下午3点" or "下午3点半" or "下午三点" or "下午3:30" or "3pm" style
  const periodMap: Record<string, number> = {
    '上午': 0, '早上': 0, '早晨': 0,
    '中午': 12, '下午': 12, '傍晚': 16, '晚上': 18,
  };

  // "下午 3 点 半" / "下午3:30" / "下午3点半" / "下午三点半"
  const cnDigits: Record<string, number> = {
    '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5,
    '六': 6, '七': 7, '八': 8, '九': 9, '十': 10, '零': 0,
  };

  // "X点" or "X点半" or "X:30"
  const timeMatch = title.match(/(上午|早上|早晨|中午|下午|傍晚|晚上)?\s*(\d{1,2}|[一二两三四五六七八九十])\s*[点:：]\s*(\d{1,2}|半)?/);
  if (timeMatch) {
    let hour = 0;
    const hourStr = timeMatch[2]!;
    if (cnDigits[hourStr] !== undefined) {
      hour = cnDigits[hourStr]!;
    } else {
      hour = parseInt(hourStr);
    }

    const period = timeMatch[1];
    if (period && periodMap[period] !== undefined) {
      hour += periodMap[period]!;
    }

    // Handle "半"
    const minStr = timeMatch[3];
    let minutes = 0;
    if (minStr === '半') minutes = 30;
    else if (minStr) minutes = parseInt(minStr);

    const pad = (n: number) => String(n).padStart(2, '0');
    startTime = pad(hour) + ':' + pad(minutes);
    const endMinutes = hour * 60 + minutes + 60;
    endTime = pad(Math.floor(endMinutes / 60) % 24) + ':' + pad(endMinutes % 60);

    title = title.replace(timeMatch[0], '').trim();
  }

  // "全天" or "整天"
  if (title.includes('全天') || title.includes('整天')) {
    startTime = '09:00';
    endTime = '18:00';
    title = title.replace(/[全整]天/, '').trim();
  }

  // Clean up remaining separators
  title = title.replace(/^[,，、\s]+|[,，、\s]+$/g, '').replace(/\s+/g, ' ');

  if (!title) title = '未命名日程';

  return { title, date: dateStr, startTime, endTime };
}
