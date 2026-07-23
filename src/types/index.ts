export type TagColor = 'red' | 'orange' | 'blue' | 'green' | 'purple' | 'gray';

export type ViewType = 'day' | 'week' | 'month';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Recurrence {
  type: RecurrenceType;
  interval: number; // 每 N 天/周/月
}

export interface Event {
  id: string;
  title: string;
  date: string;          // YYYY-MM-DD — 开始日期（单日事件使用此字段）
  startTime: string;      // HH:mm — 开始时间（全天事件忽略）
  endTime: string;        // HH:mm — 结束时间（全天事件忽略）
  tag: TagColor;
  note: string;
  isAllDay: boolean;      // 全天事件
  endDate: string;        // YYYY-MM-DD — 多日事件结束日期，单日事件与 date 相同
  recurrence: Recurrence; // 重复规则
  reminderMinutes: number; // 提前多少分钟提醒，0 = 不提醒
  completed: boolean;      // 是否已完成
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  events: Event[];
  currentView: ViewType;
  currentDate: string; // YYYY-MM-DD
  searchQuery: string;  // 搜索关键词
  filterTag: TagColor | 'all'; // 标签过滤
}

export type AppAction =
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'DELETE_EVENTS'; payload: string[] }
  | { type: 'SET_VIEW'; payload: ViewType }
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_FILTER_TAG'; payload: TagColor | 'all' };

export const TAG_CONFIG: Record<TagColor, { label: string; icon: string; color: string; bg: string; border: string }> = {
  red:    { label: '工作', icon: 'briefcase', color: '#E05060', bg: '#FDE8EC', border: '#FAC8D0' },
  orange: { label: '紧急', icon: 'flame',      color: '#E88550', bg: '#FDF0E5', border: '#FAD8C0' },
  blue:   { label: '会议', icon: 'message-square', color: '#0D8BA0', bg: '#E5F4F7', border: '#C4E4EB' },
  green:  { label: '个人', icon: 'home',       color: '#38A08A', bg: '#E6F5F2', border: '#C0E8DE' },
  purple: { label: '健康', icon: 'heart',      color: '#7B6FDE', bg: '#EFEDFC', border: '#DAD5F8' },
  gray:   { label: '其他', icon: 'pin',        color: '#6B8890', bg: '#EBF2F4', border: '#D4E0E4' },
};

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  none: '不重复',
  daily: '每天',
  weekly: '每周',
  monthly: '每月',
};

export const REMINDER_OPTIONS = [
  { value: 0, label: '不提醒' },
  { value: 5, label: '5 分钟前' },
  { value: 15, label: '15 分钟前' },
  { value: 30, label: '30 分钟前' },
  { value: 60, label: '1 小时前' },
  { value: 1440, label: '1 天前' },
];

/** 创建新事件的默认值 */
export function createDefaultEvent(date: string, startTime?: string): Event {
  const now = Date.now();
  return {
    id: '',
    title: '',
    date,
    startTime: startTime ?? '09:00',
    endTime: startTime ?? '10:00',
    tag: 'gray',
    note: '',
    isAllDay: false,
    endDate: date,
    recurrence: { type: 'none', interval: 1 },
    reminderMinutes: 0,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
}
