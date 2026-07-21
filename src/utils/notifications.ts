import type { Event } from '../types';

let permission: NotificationPermission = 'default';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (permission === 'granted') return true;
  permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * 为日程安排浏览器通知
 * 返回 timeout ID，可用于取消
 */
export function scheduleNotification(event: Event): number | null {
  if (!('Notification' in window) || event.reminderMinutes <= 0) return null;

  const [h, m] = event.startTime.split(':').map(Number);
  const eventTime = new Date(event.date);
  eventTime.setHours(h, m, 0, 0);

  const notifyAt = eventTime.getTime() - event.reminderMinutes * 60 * 1000;
  const delay = notifyAt - Date.now();

  if (delay <= 0) return null; // already passed

  return window.setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification(`📅 ${event.title}`, {
        body: `${event.date} ${event.startTime}–${event.endTime}${event.note ? '\n' + event.note : ''}`,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📅</text></svg>',
        tag: event.id,
        requireInteraction: false,
      });
    }
  }, delay);
}

/**
 * 取消已安排的提醒
 */
export function cancelNotification(timeoutId: number) {
  clearTimeout(timeoutId);
}
