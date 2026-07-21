import dayjs from 'dayjs';
import type { Event } from '../types';

/**
 * 展开重复日程，生成指定日期范围内的虚拟实例。
 * 每个虚拟实例带有一个 `instanceDate` 标记（存在 title 之外的一个临时字段）。
 * 返回的实例不包含原始事件（原始事件由调用方通过 date 自行匹配）。
 */
export interface ExpandedEvent extends Event {
  _instanceDate: string;  // 该实例对应的日期 YYYY-MM-DD
  _isVirtual: boolean;     // 是否为虚拟展开的实例
}

/**
 * 判断某一天是否匹配重复规则
 */
export function matchesRecurrence(
  event: Event,
  targetDate: string,
): boolean {
  const { recurrence, date: eventDate } = event;
  if (recurrence.type === 'none') return false;

  const start = dayjs(eventDate);
  const target = dayjs(targetDate);

  // 不展开开始日期之前的
  if (target.isBefore(start, 'day')) return false;

  const diffDays = target.diff(start, 'day');

  switch (recurrence.type) {
    case 'daily':
      return diffDays % recurrence.interval === 0;
    case 'weekly':
      return diffDays >= 0 && diffDays % (recurrence.interval * 7) === 0;
    case 'monthly': {
      // 按月重复：同一天号
      const sameDayOfMonth = start.date() === target.date();
      if (!sameDayOfMonth) return false;
      const monthDiff =
        (target.year() - start.year()) * 12 +
        (target.month() - start.month());
      return monthDiff >= 0 && monthDiff % recurrence.interval === 0;
    }
    default:
      return false;
  }
}

/**
 * 获取某一天所有应出现的重复日程实例（不含非重复日程）
 */
export function getRecurringInstances(
  events: Event[],
  targetDate: string,
): ExpandedEvent[] {
  return events
    .filter((e) => e.recurrence.type !== 'none' && dayjs(targetDate).isAfter(dayjs(e.date).subtract(1, 'day')))
    .filter((e) => matchesRecurrence(e, targetDate))
    .map((e) => ({
      ...e,
      _instanceDate: targetDate,
      _isVirtual: e.date !== targetDate,
    }));
}
