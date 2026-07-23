import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';
import { useEvents } from '../../hooks/useEvents';
import { parseQuickAdd } from '../../utils/parser';
import { parseDate, today } from '../../utils/date';
import { getRecurringInstances, formatRecurrence } from '../../utils/recurrence';
import { TAG_CONFIG } from '../../types';
import type { Event } from '../../types';
import Icon from '../Icon';
import EmptyState from '../EmptyState';
import styles from './DayView.module.css';

interface DayViewProps {
  onEditEvent: (event: Event) => void;
  onCreateEvent: (date: string, startTime?: string) => void;
}

export default function DayView({ onEditEvent, onCreateEvent }: DayViewProps) {
  const { state } = useAppContext();
  const { getEventsByDate, deleteEvent, createEvent, updateEvent } = useEvents();
  const [quickText, setQuickText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [fabVisible, setFabVisible] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastScrollY = useRef(0);

  const currentDayjs = parseDate(state.currentDate);
  const isToday = state.currentDate === today();
  const dateLabel = isToday ? '今天' : currentDayjs.format('M月D日 ddd');
  const breadcrumb = `${currentDayjs.format('YYYY年M月')} · 第${currentDayjs.isoWeek()}周`;

  const quickPreview = useMemo(() => {
    if (!quickText.trim()) return null;
    const parsed = parseQuickAdd(quickText.trim());
    if (!parsed || parsed.title === quickText.trim()) return null;
    const d = parseDate(parsed.date);
    const displayDate = d.isSame(currentDayjs, 'day') ? '今天' :
      d.isSame(currentDayjs.add(1, 'day'), 'day') ? '明天' :
      d.isSame(currentDayjs.subtract(1, 'day'), 'day') ? '昨天' :
      d.format('M月D日 ddd');
    return `→ ${displayDate} ${parsed.startTime}–${parsed.endTime}  ${parsed.title}`;
  }, [quickText, currentDayjs]);

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

  const conflictIds = useMemo(() => {
    const ids = new Set<string>();
    const timed = filteredTimed.filter(e => !e.isAllDay);
    for (let i = 0; i < timed.length; i++) {
      for (let j = i + 1; j < timed.length; j++) {
        const a = timed[i]!, b = timed[j]!;
        if (a.startTime < b.endTime && b.startTime < a.endTime) { ids.add(a.id); ids.add(b.id); }
      }
    }
    return ids;
  }, [filteredTimed]);

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
    setTimeout(() => { deleteEvent(id); setDeletingId(null); }, 250);
  }, [deleteEvent]);

  const handleToggleComplete = useCallback((e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    updateEvent({ ...event, completed: !event.completed });
  }, [updateEvent]);

  const handleDetailAdd = () => onCreateEvent(state.currentDate);

  const isHappeningNow = (event: Event) => {
    if (event.isAllDay) return false;
    const now = new Date();
    if (event.date !== now.toISOString().slice(0, 10)) return false;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = event.startTime.split(':').map(Number);
    const [eh, em] = event.endTime.split(':').map(Number);
    return nowMin >= (sh! * 60 + sm!) && nowMin < (eh! * 60 + em!);
  };

  const morning = filteredTimed.filter(e => e.startTime < '12:00');
  const afternoon = filteredTimed.filter(e => e.startTime >= '12:00' && e.startTime < '18:00');
  const evening = filteredTimed.filter(e => e.startTime >= '18:00');

  const sections = [
    ...(filteredAllDay.length > 0 ? [{ label: '全天', icon: 'calendar-days', events: filteredAllDay }] : []),
    { label: '上午', icon: 'sun', events: morning },
    { label: '下午', icon: 'cloud-sun', events: afternoon },
    { label: '晚上', icon: 'moon', events: evening },
  ].filter(s => s.events.length > 0);

  return (
    <div className={styles.container} data-scroll>
      <div className={styles.quickAdd}>
        <Icon name="plus" size={18} className={styles.quickAddIcon} />
        <input ref={inputRef} className={styles.quickAddInput} type="text"
          placeholder="添加日程，如「明天下午3点产品评审」"
          value={quickText} onChange={(e) => setQuickText(e.target.value)} onKeyDown={handleQuickKey} />
        <AnimatePresence>
          {quickText && (
            <motion.button
              initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .9 }}
              className={styles.quickAddBtn} onClick={handleQuickAdd}>{parsing ? '...' : '添加'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {quickPreview && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className={styles.preview}>{quickPreview}</motion.div>
        )}
      </AnimatePresence>

      <div className={styles.breadcrumb}>
        <Icon name="calendar-days" size={12} style={{ display: 'inline', marginRight: 4, opacity: .5 }} />
        {breadcrumb}
      </div>
      <div className={styles.dateHeader}>
        <span className={styles.dateLabel}>{dateLabel}</span>
        <span className={styles.eventCount}>{totalCount === 0 ? '暂无日程' : `${totalCount} 项日程`}</span>
      </div>

      <div className={styles.list}>
        {totalCount === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence>
            {sections.map(section => (
              <div key={section.label} className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Icon name={section.icon} size={14} />
                  <span>{section.label}</span>
                </div>
                {section.events.map((event, i) => {
                  const isVirtual = '_isVirtual' in event && (event as any)._isVirtual;
                  const isDeleting = deletingId === event.id;
                  const hasConflict = conflictIds.has(event.id);
                  const recurLabel = formatRecurrence(event);
                  return (
                    <motion.div
                      key={event.id + (isVirtual ? (event as any)._instanceDate : '')}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, overflow: 'hidden' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 45, mass: 1, delay: i * 0.02 }}
                      className={`${styles.eventItem} ${event.completed ? styles.completed : ''} ${hasConflict ? styles.conflict : ''} ${isDeleting ? styles.slideOut : ''}`}
                      onClick={() => onEditEvent(event)}
                    >
                      <span className={styles.dragHandle}><Icon name="grip-vertical" size={12} /></span>
                      <button className={styles.checkbox} onClick={(e) => handleToggleComplete(e, event)}>
                        <Icon name={event.completed ? 'circle-check' : 'circle'} size={18} />
                      </button>
                      <div className={styles.eventTime}>
                        {event.isAllDay ? <span className={styles.timeStart}>全天</span> : (
                          <>
                            <span className={styles.timeStart}>{event.startTime}</span>
                            <span className={styles.timeEnd}>{event.endTime}</span>
                          </>
                        )}
                      </div>
                      {isHappeningNow(event) && <span className={styles.nowIndicator} />}
                      <span className={styles.tagIcon}>
                        <Icon name={TAG_CONFIG[event.tag].icon} size={14} />
                      </span>
                      <div className={styles.eventBody}>
                        <span className={styles.eventTitle}>{event.title}</span>
                        <div className={styles.eventMeta}>
                          {event.note && <span className={styles.eventNote}>{event.note}</span>}
                          {recurLabel && <span className={styles.recurLabel}>🔄 {recurLabel}</span>}
                          {hasConflict && <span className={styles.conflictBadge}>⚠ 冲突</span>}
                        </div>
                      </div>
                      <button className={styles.deleteBtn}
                        onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }} title="删除">
                        <Icon name="x" size={14} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <motion.button
        className={styles.fab}
        animate={{ scale: fabVisible ? 1 : 0.5, opacity: fabVisible ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={handleDetailAdd} title="详细添加"
      >
        <Icon name="plus" size={24} className={styles.fabIcon} />
        <span className={styles.ripple} />
      </motion.button>
    </div>
  );
}
