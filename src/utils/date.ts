import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import weekday from 'dayjs/plugin/weekday';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.locale('zh-cn');
dayjs.extend(weekday);
dayjs.extend(isoWeek);

/** 格式化日期为 YYYY-MM-DD */
export function formatDate(date: dayjs.Dayjs): string {
  return date.format('YYYY-MM-DD');
}

/** 今天的日期字符串 */
export function today(): string {
  return dayjs().format('YYYY-MM-DD');
}

/** 解析日期字符串 */
export function parseDate(str: string): dayjs.Dayjs {
  return dayjs(str);
}

/** 格式化显示：07月21日 周三 */
export function formatDisplay(date: dayjs.Dayjs): string {
  return date.format('MM月DD日 ddd');
}

/** 获取本周一 */
export function weekStart(date: dayjs.Dayjs): dayjs.Dayjs {
  return date.isoWeekday(1);
}

/** 获取本周日 */
export function weekEnd(date: dayjs.Dayjs): dayjs.Dayjs {
  return date.isoWeekday(7);
}

/** 获取当月第一天 */
export function monthStart(date: dayjs.Dayjs): dayjs.Dayjs {
  return date.startOf('month');
}

/** 获取当月最后一天 */
export function monthEnd(date: dayjs.Dayjs): dayjs.Dayjs {
  return date.endOf('month');
}

/** 生成本周 7 天的日期数组 */
export function getWeekDays(date: dayjs.Dayjs): dayjs.Dayjs[] {
  const start = weekStart(date);
  return Array.from({ length: 7 }, (_, i) => start.add(i, 'day'));
}

/**
 * 生成月视图网格需要的日期数组（含前后月填充）
 * 返回 6 行 × 7 列 = 42 天的网格
 */
export function getMonthGrid(date: dayjs.Dayjs): dayjs.Dayjs[] {
  const start = monthStart(date);
  const firstDayOfWeek = start.day(); // 0=Sun
  const gridStart = start.subtract(firstDayOfWeek, 'day');
  return Array.from({ length: 42 }, (_, i) => gridStart.add(i, 'day'));
}

/** 判断两个日期是否是同一天 */
export function isSameDay(a: dayjs.Dayjs, b: dayjs.Dayjs): boolean {
  return a.isSame(b, 'day');
}

/** 判断日期是否是今天 */
export function isToday(date: dayjs.Dayjs): boolean {
  return date.isSame(dayjs(), 'day');
}

/** 生成时间槽 07:00 - 22:00（仅白天的 15 小时，适合单页展示） */
export function getTimeSlots(): string[] {
  return Array.from({ length: 16 }, (_, i) =>
    String(i + 7).padStart(2, '0') + ':00'
  );
}

/** 整体日视图的时间范围（分钟） */
export const DAY_START_MINUTES = 7 * 60;   // 07:00
export const DAY_END_MINUTES = 22 * 60;     // 22:00
export const DAY_SPAN_MINUTES = DAY_END_MINUTES - DAY_START_MINUTES; // 900 min = 15h

/** 时间字符串转为分钟数 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
