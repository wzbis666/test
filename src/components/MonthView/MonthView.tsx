import { useMemo } from 'react';
import { useEvents } from '../../hooks/useEvents';
import { useAppContext } from '../../context/AppContext';
import { getMonthGrid, parseDate, isToday, formatDate } from '../../utils/date';
import { getRecurringInstances } from '../../utils/recurrence';
import { TAG_CONFIG } from '../../types';
import styles from './MonthView.module.css';

export default function MonthView() {
  const { state, dispatch } = useAppContext();
  const { getEventsByDate } = useEvents();
  const currentMonth = parseDate(state.currentDate);
  const grid = getMonthGrid(currentMonth);
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const getDayEvents = useMemo(() => (dateStr: string) => {
    const direct = getEventsByDate(dateStr);
    const recurring = getRecurringInstances(state.events, dateStr);
    const multiDay = state.events.filter(e =>
      !e.isAllDay && e.endDate !== e.date && dateStr >= e.date && dateStr <= e.endDate
    );
    let all = [...direct, ...recurring, ...multiDay];

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

  const handleDayClick = (dateStr: string) => {
    dispatch({ type: 'SET_DATE', payload: dateStr });
    dispatch({ type: 'SET_VIEW', payload: 'day' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.weekRow}>
        {weekDays.map((d) => (
          <div key={d} className={styles.weekHeader}>{d}</div>
        ))}
      </div>
      <div className={styles.grid}>
        {grid.map((day) => {
          const dateStr = formatDate(day);
          const events = getDayEvents(dateStr);
          const isCurrentMonth = day.month() === currentMonth.month();
          const todayFlag = isToday(day);
          const maxDots = 3;

          return (
            <div
              key={dateStr}
              className={`${styles.cell} ${!isCurrentMonth ? styles.otherMonth : ''} ${todayFlag ? styles.today : ''}`}
              onClick={() => handleDayClick(dateStr)}
            >
              <span className={`${styles.dayNum} ${todayFlag ? styles.todayNum : ''}`}>
                {day.date()}
              </span>
              <div className={styles.dots}>
                {events.slice(0, maxDots).map((ev) => (
                  <span
                    key={ev.id + (('_instanceDate' in ev) ? (ev as any)._instanceDate : dateStr)}
                    className={styles.dot}
                    style={{ background: TAG_CONFIG[ev.tag].color }}
                  />
                ))}
                {events.length > maxDots && (
                  <span className={styles.more}>+{events.length - maxDots}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
