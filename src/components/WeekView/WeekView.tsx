import { useMemo } from 'react';
import { useEvents } from '../../hooks/useEvents';
import { useAppContext } from '../../context/AppContext';
import { getWeekDays, parseDate, isToday, formatDate } from '../../utils/date';
import { getRecurringInstances } from '../../utils/recurrence';
import EventCard from '../EventCard/EventCard';
import type { Event } from '../../types';
import styles from './WeekView.module.css';

interface WeekViewProps {
  onEditEvent: (event: Event) => void;
  onCreateEvent: (date: string) => void;
}

export default function WeekView({ onEditEvent, onCreateEvent }: WeekViewProps) {
  const { state } = useAppContext();
  const { getEventsByDate } = useEvents();
  const weekDays = getWeekDays(parseDate(state.currentDate));
  const dayLabels = ['一', '二', '三', '四', '五', '六', '日'];

  const getDayEvents = useMemo(() => (dateStr: string) => {
    const direct = getEventsByDate(dateStr);
    const recurring = getRecurringInstances(state.events, dateStr);
    const multiDay = state.events.filter(e =>
      !e.isAllDay && e.endDate !== e.date &&
      dateStr >= e.date && dateStr <= e.endDate
    );
    let all = [...direct, ...recurring, ...multiDay]
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Filter
    if (state.searchQuery) {
      all = all.filter(e =>
        e.title.includes(state.searchQuery) || e.note.includes(state.searchQuery)
      );
    }
    if (state.filterTag !== 'all') {
      all = all.filter(e => e.tag === state.filterTag);
    }
    return all;
  }, [state.events, state.searchQuery, state.filterTag, getEventsByDate]);

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {weekDays.map((day, i) => {
          const dateStr = formatDate(day);
          const dayEvents = getDayEvents(dateStr);
          const todayFlag = isToday(day);

          return (
            <div key={dateStr} className={`${styles.column} ${todayFlag ? styles.today : ''}`}>
              <div className={styles.columnHeader}>
                <span className={styles.dayName}>{dayLabels[i]}</span>
                <span className={`${styles.dayNum} ${todayFlag ? styles.todayNum : ''}`}>
                  {day.date()}
                </span>
              </div>
              <div className={styles.columnBody}>
                {dayEvents.map((event) => (
                  <EventCard
                    key={event.id + (('_instanceDate' in event) ? (event as any)._instanceDate : '')}
                    event={event}
                    onClick={onEditEvent}
                    compact
                  />
                ))}
                <button className={styles.addBtn} onClick={() => onCreateEvent(dateStr)}>
                  + 新建
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
