export type TagColor = 'red' | 'orange' | 'blue' | 'green' | 'purple' | 'gray';

export type ViewType = 'day' | 'week' | 'month';

export interface Event {
  id: string;
  title: string;
  date: string;       // YYYY-MM-DD
  startTime: string;   // HH:mm
  endTime: string;     // HH:mm
  tag: TagColor;
  note: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  events: Event[];
  currentView: ViewType;
  currentDate: string; // YYYY-MM-DD
}

export type AppAction =
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'SET_VIEW'; payload: ViewType }
  | { type: 'SET_DATE'; payload: string };

export const TAG_CONFIG: Record<TagColor, { label: string; icon: string; color: string; bg: string; border: string }> = {
  red:    { label: '工作', icon: '💼', color: '#E5484D', bg: '#FEF0F0', border: '#FDE0E0' },
  orange: { label: '紧急', icon: '🔥', color: '#ED7A26', bg: '#FEF6EE', border: '#FDE8D0' },
  blue:   { label: '会议', icon: '💬', color: '#3B82F6', bg: '#EEF4FF', border: '#DCE8FD' },
  green:  { label: '个人', icon: '🏠', color: '#30A46C', bg: '#EDF8F2', border: '#D4EDDF' },
  purple: { label: '健康', icon: '❤️', color: '#8B5CF6', bg: '#F5F0FE', border: '#EBE0FD' },
  gray:   { label: '其他', icon: '📌', color: '#78746D', bg: '#F3F1EC', border: '#E6E3DD' },
};
