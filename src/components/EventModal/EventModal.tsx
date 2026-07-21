import { useEffect, useRef, useState } from 'react';
import { TAG_CONFIG, RECURRENCE_LABELS, REMINDER_OPTIONS } from '../../types';
import type { TagColor, RecurrenceType, Event } from '../../types';
import styles from './EventModal.module.css';

interface EventModalProps {
  date: string;
  startTime?: string;
  event?: Event | null;
  onSave: (data: {
    id?: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    tag: TagColor;
    note: string;
    isAllDay: boolean;
    endDate: string;
    recurrence: { type: RecurrenceType; interval: number };
    reminderMinutes: number;
  }) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

function addHourToTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + 60;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return String(newH).padStart(2, '0') + ':' + String(newM).padStart(2, '0');
}

export default function EventModal({ date, startTime, event, onSave, onDelete, onClose }: EventModalProps) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [evDate, setEvDate] = useState(event?.date ?? date);
  const [evStart, setEvStart] = useState(event?.startTime ?? startTime ?? '09:00');
  const [evEnd, setEvEnd] = useState(event?.endTime ?? addHourToTime(startTime ?? '09:00'));
  const [tag, setTag] = useState<TagColor>(event?.tag ?? 'gray');
  const [note, setNote] = useState(event?.note ?? '');
  const [isAllDay, setIsAllDay] = useState(event?.isAllDay ?? false);
  const [endDate, setEndDate] = useState(event?.endDate ?? event?.date ?? date);
  const [recurType, setRecurType] = useState<RecurrenceType>(event?.recurrence?.type ?? 'none');
  const [recurInterval, setRecurInterval] = useState(event?.recurrence?.interval ?? 1);
  const [reminder, setReminder] = useState(event?.reminderMinutes ?? 0);

  const titleRef = useRef<HTMLInputElement>(null);
  const isEdit = !!event;

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: event?.id,
      title: title.trim(),
      date: evDate,
      startTime: isAllDay ? '00:00' : evStart,
      endTime: isAllDay ? '23:59' : evEnd,
      tag,
      note: note.trim(),
      isAllDay,
      endDate: endDate,
      recurrence: { type: recurType, interval: recurInterval },
      reminderMinutes: reminder,
    });
  };

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{isEdit ? '编辑日程' : '新建日程'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.body}>
            {/* 标题 */}
            <div className={styles.field}>
              <input
                ref={titleRef}
                className={styles.input}
                type="text"
                placeholder="日程标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* 全天开关 */}
            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
              />
              <span>全天事件</span>
            </label>

            {/* 日期 */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>开始日期</label>
                <input
                  className={styles.input}
                  type="date"
                  value={evDate}
                  onChange={(e) => { setEvDate(e.target.value); setEndDate(e.target.value); }}
                  required
                />
              </div>
              {(isAllDay && endDate !== evDate) || isAllDay ? (
                <div className={styles.field}>
                  <label className={styles.label}>结束日期</label>
                  <input
                    className={styles.input}
                    type="date"
                    value={endDate}
                    min={evDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              ) : null}
            </div>

            {/* 时间（非全天时显示） */}
            {!isAllDay && (
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>开始</label>
                  <input
                    className={styles.input}
                    type="time"
                    value={evStart}
                    onChange={(e) => setEvStart(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>结束</label>
                  <input
                    className={styles.input}
                    type="time"
                    value={evEnd}
                    onChange={(e) => setEvEnd(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* 标签 */}
            <div className={styles.field}>
              <label className={styles.label}>标签</label>
              <div className={styles.tagList}>
                {(Object.entries(TAG_CONFIG) as [TagColor, typeof TAG_CONFIG[TagColor]][]).map(
                  ([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.tag} ${tag === key ? styles.tagActive : ''}`}
                      style={{
                        background: tag === key ? cfg.color : cfg.bg,
                        color: tag === key ? '#fff' : cfg.color,
                      }}
                      onClick={() => setTag(key)}
                    >
                      <span className={styles.tagEmoji}>{cfg.icon}</span>
                      {cfg.label}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 重复 */}
            <div className={styles.field}>
              <label className={styles.label}>重复</label>
              <div className={styles.recurRow}>
                <select
                  className={styles.select}
                  value={recurType}
                  onChange={(e) => setRecurType(e.target.value as RecurrenceType)}
                >
                  {(Object.entries(RECURRENCE_LABELS) as [RecurrenceType, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                {recurType !== 'none' && (
                  <div className={styles.intervalRow}>
                    <span className={styles.intervalLabel}>每</span>
                    <input
                      className={styles.intervalInput}
                      type="number"
                      min={1}
                      max={99}
                      value={recurInterval}
                      onChange={(e) => setRecurInterval(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                    <span className={styles.intervalLabel}>
                      {recurType === 'daily' ? '天' : recurType === 'weekly' ? '周' : '月'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 提醒 */}
            <div className={styles.field}>
              <label className={styles.label}>提醒</label>
              <select
                className={styles.select}
                value={reminder}
                onChange={(e) => setReminder(parseInt(e.target.value))}
              >
                {REMINDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* 备注 */}
            <div className={styles.field}>
              <label className={styles.label}>备注</label>
              <textarea
                className={styles.textarea}
                placeholder="添加备注..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className={styles.footer}>
            {isEdit && onDelete && (
              <button type="button" className={styles.deleteBtn} onClick={() => onDelete(event!.id)}>
                删除
              </button>
            )}
            <div className={styles.spacer} />
            <button type="button" className={styles.cancelBtn} onClick={onClose}>取消</button>
            <button type="submit" className={styles.saveBtn}>{isEdit ? '保存' : '创建'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
