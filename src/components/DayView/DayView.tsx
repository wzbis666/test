import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useEvents } from '../../hooks/useEvents';
import { parseQuickAdd } from '../../utils/parser';
import { parseDate, today } from '../../utils/date';
import { getRecurringInstances } from '../../utils/recurrence';
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
  const [quickText, setQuickText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [fabVisible, setFabVisible] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastScrollY = useRef(0);

  const isToday = state.currentDate === today();
  const dateLabel = isToday ? '今天' : parseDate(state.currentDate).format('M月D日 ddd');

  // FAB hide on scroll
  useEffect(() => {
    const container = document.querySelector('[data-scroll]');
    if (!container) return;
    const handleScroll = () => {
      const currentY = container.scrollTop;
      if (currentY > lastScrollY.current + 20) setFabVisible(false);
      else if (currentY < lastScrollY.current - 10) setFabVisible(true);
      lastScrollY.current = currentY;
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const allDayEvents = useMemo(() => {
    const direct = getEventsByDate(state.currentDate).filter(e => e.isAllDay);
    const recurring = getRecurringInstances(state.events, state.currentDate).filter(e => e.isAllDay);
    const multiDay = state.events.filter(e => !e.isAllDay && e.endDate !== e.date && state.currentDate >= e.date && state.currentDate <= e.endDate);
    return [...direct, ...recurring, ...multiDay].sort((a, b) => a.title.localeCompare(b.title));
  }, [state.events, state.currentDate, getEventsByDate]);

  const timedEvents = useMemo(() => {
    const direct = getEventsByDate(state.currentDate).filter(e => !e.isAllDay && e.endDate === e.date);
    const recurring = getRecurringInstances(state.events, state.currentDate).filter(e => !e.isAllDay);
    const multiDay = state.events.filter(e => !e.isAllDay && e.endDate !== e.date && state.currentDate >= e.date && state.currentDate <= e.endDate);
    return [...direct, ...recurring, ...multiDay].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [state.events, state.currentDate, getEventsByDate]);

  const filterEvents = (events: Event[]) => events.filter(e => {
    const matchSearch = !state.searchQuery || e.title.includes(state.searchQuery) || e.note.includes(state.searchQuery);
    const matchTag = state.filterTag === 'all' || e.tag === state.filterTag;
    return matchSearch && matchTag;
  });

  const filteredAllDay = filterEvents(allDayEvents);
  const filteredTimed = filterEvents(timedEvents);
  const totalCount = filteredAllDay.length + filteredTimed.length;

  useEffect(() => { inputRef.current?.focus(); }, [state.currentDate]);

  const handleQuickAdd = () => {
    const text = quickText.trim();
    if (!text) return;
    const parsed = parseQuickAdd(text);
    if (parsed) {
      setParsing(true);
      createEvent({ ...parsed, tag: 'gray', note: '' });
      setQuickText('');
      setTimeout(() => setParsing(false), 600);
    }
  };

  const handleQuickKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleQuickAdd(); }
  };

  const handleDelete = useCallback((id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      deleteEvent(id);
      setDeletingId(null);
    }, 250);
  }, [deleteEvent]);

  const isHappeningNow = (event: Event) => {
    if (event.isAllDay) return false;
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    if (event.date !== todayStr) return false;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = event.startTime.split(':').map(Number);
    const [eh, em] = event.endTime.split(':').map(Number);
    const startMin = sh! * 60 + sm!;
    const endMin = eh! * 60 + em!;
    return nowMin >= startMin && nowMin < endMin;
  };

  const handleDetailAdd = () => onCreateEvent(state.currentDate);

  const morning = filteredTimed.filter(e => e.startTime < '12:00');
  const afternoon = filteredTimed.filter(e => e.startTime >= '12:00' && e.startTime < '18:00');
  const evening = filteredTimed.filter(e => e.startTime >= '18:00');

  const sections = [
    ...(filteredAllDay.length > 0 ? [{ label: '全天', icon: '📆', events: filteredAllDay }] : []),
    { label: '上午', icon: '☀️', events: morning },
    { label: '下午', icon: '🌤', events: afternoon },
    { label: '晚上', icon: '🌙', events: evening },
  ].filter(s => s.events.length > 0);

  return (
    <div className={styles.container} data-scroll>
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

      <div className={styles.dateHeader}>
        <span className={styles.dateEmoji}>📅</span>
        <span className={styles.dateLabel}>{dateLabel}</span>
        <span className={styles.eventCount}>{totalCount === 0 ? '暂无日程' : `${totalCount} 项日程`}</span>
      </div>

      <div className={styles.list}>
        {totalCount === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>✨</div>
            <p className={styles.emptyTitle}>今天还没有日程</p>
            <p className={styles.emptyHint}>在上方输入框快速创建，或点击右下角 + 添加</p>
          </div>
        ) : (
          sections.map(section => (
            <div key={section.label} className={styles.section}>
              <div className={styles.sectionHeader}>
                <span>{section.icon}</span>
                <span>{section.label}</span>
              </div>
              {section.events.map((event, i) => {
                const isVirtual = '_isVirtual' in event && (event as any)._isVirtual;
                const isNew = parsing && event.id === state.events[state.events.length - 1]?.id;
                const isDeleting = deletingId === event.id;
                return (
                  <div
                    key={event.id + (isVirtual ? (event as any)._instanceDate : '')}
                    className={`${styles.eventItem} ${isNew ? styles.flyIn : ''} ${isDeleting ? styles.slideOut : ''}`}
                    style={{ animationDelay: isNew ? '0s' : `${i * 0.03}s` }}
                    onClick={() => onEditEvent(event)}
                  >
                    <div className={styles.eventTime}>
                      {event.isAllDay ? (
                        <span className={styles.timeStart}>全天</span>
                      ) : (
                        <>
                          <span className={styles.timeStart}>{event.startTime}</span>
                          <span className={styles.timeEnd}>{event.endTime}</span>
                        </>
                      )}
                    </div>
                    {isHappeningNow(event) && <span className={styles.nowIndicator} />}
                    <span className={styles.tagIcon}>{TAG_CONFIG[event.tag].icon}</span>
                    <div className={styles.eventBody}>
                      <span className={styles.eventTitle}>
                        {event.title}
                        {isVirtual && <span className={styles.recurBadge}>🔄</span>}
                      </span>
                      {event.note && <span className={styles.eventNote}>{event.note}</span>}
                    </div>
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
                      title="删除"
                    >×</button>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      <button className={`${styles.fab} ${fabVisible ? '' : styles.fabHidden}`} onClick={handleDetailAdd} title="详细添加">
        <span className={styles.fabIcon}>+</span>
        <span className={styles.ripple} />
      </button>
    </div>
  );
}
