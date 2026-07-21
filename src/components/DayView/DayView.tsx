import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useEvents } from '../../hooks/useEvents';
import { parseQuickAdd } from '../../utils/parser';
import { parseDate, today } from '../../utils/date';
import { TAG_CONFIG } from '../../types';
import type { Event } from '../../types';
import styles from './DayView.module.css';

interface DayViewProps {
  onEditEvent: (event: Event) => void;
  onCreateEvent: (date: string, startTime?: string) => void;
}

export default function DayView({ onEditEvent, onCreateEvent }: DayViewProps) {
  const { state } = useAppContext();
  const { getEventsByDate, deleteEvent, createEvent } = useEvents();
  const dayEvents = getEventsByDate(state.currentDate);
  const [quickText, setQuickText] = useState('');
  const [parsing, setParsing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isToday = state.currentDate === today();
  const dateLabel = isToday
    ? '今天'
    : parseDate(state.currentDate).format('M月D日 ddd');

  // Focus quick-add input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [state.currentDate]);

  const handleQuickAdd = () => {
    const text = quickText.trim();
    if (!text) return;

    const parsed = parseQuickAdd(text);
    if (parsed) {
      setParsing(true);
      createEvent({ ...parsed, tag: 'gray', note: '' });
      setQuickText('');
      setTimeout(() => setParsing(false), 300);
    }
  };

  const handleQuickKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuickAdd();
    }
  };

  const handleDetailAdd = () => {
    onCreateEvent(state.currentDate);
  };

  // Group events: morning (before 12:00), afternoon (12:00-18:00), evening (18:00+)
  const morning = dayEvents.filter(e => e.startTime < '12:00');
  const afternoon = dayEvents.filter(e => e.startTime >= '12:00' && e.startTime < '18:00');
  const evening = dayEvents.filter(e => e.startTime >= '18:00');

  const sections = [
    { label: '上午', icon: '☀️', events: morning },
    { label: '下午', icon: '🌤', events: afternoon },
    { label: '晚上', icon: '🌙', events: evening },
  ].filter(s => s.events.length > 0);

  return (
    <div className={styles.container}>
      {/* Quick-add bar — Todoist style */}
      <div className={styles.quickAdd}>
        <span className={styles.quickAddIcon}>+</span>
        <input
          ref={inputRef}
          className={styles.quickAddInput}
          type="text"
          placeholder="添加日程，如「明天下午3点产品评审」"
          value={quickText}
          onChange={(e) => setQuickText(e.target.value)}
          onKeyDown={handleQuickKey}
        />
        {quickText && (
          <button className={styles.quickAddBtn} onClick={handleQuickAdd}>
            {parsing ? '...' : '添加'}
          </button>
        )}
      </div>

      {/* Date header */}
      <div className={styles.dateHeader}>
        <span className={styles.dateEmoji}>📅</span>
        <span className={styles.dateLabel}>{dateLabel}</span>
        <span className={styles.eventCount}>
          {dayEvents.length === 0 ? '暂无日程' : `${dayEvents.length} 项日程`}
        </span>
      </div>

      {/* Event list */}
      <div className={styles.list}>
        {dayEvents.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>✨</div>
            <p className={styles.emptyTitle}>今天还没有日程</p>
            <p className={styles.emptyHint}>在上方输入框快速创建，或点击右下角 + 添加</p>
          </div>
        ) : (
          <>
            {sections.map(section => (
              <div key={section.label} className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span>{section.icon}</span>
                  <span>{section.label}</span>
                </div>
                {section.events.map(event => (
                  <div
                    key={event.id}
                    className={`${styles.eventItem} ${parsing ? styles.fresh : ''}`}
                    onClick={() => onEditEvent(event)}
                  >
                    <div className={styles.eventTime}>
                      <span className={styles.timeStart}>{event.startTime}</span>
                      <span className={styles.timeEnd}>{event.endTime}</span>
                    </div>
                    <span className={styles.tagIcon}>
                      {TAG_CONFIG[event.tag].icon}
                    </span>
                    <div className={styles.eventBody}>
                      <span className={styles.eventTitle}>{event.title}</span>
                      {event.note && <span className={styles.eventNote}>{event.note}</span>}
                    </div>
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEvent(event.id);
                      }}
                      title="删除"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>

      {/* FAB — detail add */}
      <button className={styles.fab} onClick={handleDetailAdd} title="详细添加">
        +
      </button>
    </div>
  );
}
