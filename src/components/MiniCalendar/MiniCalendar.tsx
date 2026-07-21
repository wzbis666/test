import { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { parseDate, formatDate, getMonthGrid, isToday, isSameDay } from '../../utils/date';
import styles from './MiniCalendar.module.css';

export default function MiniCalendar() {
  const { state, dispatch } = useAppContext();
  const currentDate = parseDate(state.currentDate);
  const grid = getMonthGrid(currentDate);
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const daysWithEvents = useMemo(() => {
    const set = new Set<string>();
    state.events.forEach((e) => {
      set.add(e.date);
      if (e.endDate !== e.date) {
        let d = parseDate(e.date);
        const end = parseDate(e.endDate);
        while (d.isBefore(end) || d.isSame(end, 'day')) {
          set.add(formatDate(d));
          d = d.add(1, 'day');
        }
      }
    });
    return set;
  }, [state.events]);

  const goPrevMonth = () => {
    dispatch({ type: 'SET_DATE', payload: currentDate.subtract(1, 'month').format('YYYY-MM-DD') });
  };

  const goNextMonth = () => {
    dispatch({ type: 'SET_DATE', payload: currentDate.add(1, 'month').format('YYYY-MM-DD') });
  };

  const handleDayClick = (dateStr: string) => {
    dispatch({ type: 'SET_DATE', payload: dateStr });
    dispatch({ type: 'SET_VIEW', payload: 'day' });
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.monthHeader}>
        <button className={styles.monthNav} onClick={goPrevMonth}>‹</button>
        <span className={styles.monthLabel}>{currentDate.format('YYYY年M月')}</span>
        <button className={styles.monthNav} onClick={goNextMonth}>›</button>
      </div>
      <div className={styles.weekRow}>
        {weekDays.map((d) => (
          <span key={d} className={styles.weekDay}>{d}</span>
        ))}
      </div>
      <div className={styles.grid}>
        {grid.map((day) => {
          const dateStr = formatDate(day);
          const isCurrentMonth = day.month() === currentDate.month();
          const isTodayFlag = isToday(day);
          const isSelected = isSameDay(day, currentDate);
          const hasEvents = daysWithEvents.has(dateStr);

          return (
            <button
              key={dateStr}
              className={`${styles.day} ${!isCurrentMonth ? styles.otherMonth : ''} ${isTodayFlag ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleDayClick(dateStr)}
            >
              <span className={styles.dayNum}>{day.date()}</span>
              {hasEvents && <span className={styles.dot} />}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
