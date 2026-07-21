import { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { parseDate, formatDate, getMonthGrid, isToday, isSameDay } from '../../utils/date';
import Icon from '../Icon';
import styles from './MiniCalendar.module.css';

export default function MiniCalendar() {
  const { state, dispatch } = useAppContext();
  const currentDate = parseDate(state.currentDate);
  const grid = getMonthGrid(currentDate);
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const dayEventCounts = useMemo(() => {
    const map = new Map<string, number>();
    state.events.forEach((e) => {
      map.set(e.date, (map.get(e.date) || 0) + 1);
      if (e.endDate !== e.date) {
        let d = parseDate(e.date);
        const end = parseDate(e.endDate);
        while (d.isBefore(end) || d.isSame(end, 'day')) {
          const ds = formatDate(d);
          map.set(ds, (map.get(ds) || 0) + 1);
          d = d.add(1, 'day');
        }
      }
    });
    return map;
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
        <button className={styles.monthNav} onClick={goPrevMonth}><Icon name="chevron-left" size={14} /></button>
        <span className={styles.monthLabel}>{currentDate.format('YYYY年M月')}</span>
        <button className={styles.monthNav} onClick={goNextMonth}><Icon name="chevron-right" size={14} /></button>
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
          const count = dayEventCounts.get(dateStr) || 0;

          return (
            <button
              key={dateStr}
              className={`${styles.day} ${!isCurrentMonth ? styles.otherMonth : ''} ${isTodayFlag ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleDayClick(dateStr)}
            >
              <span className={styles.dayNum}>{day.date()}</span>
              {count > 0 && <span className={`${styles.badge} ${isSelected ? styles.badgeSelected : ''}`}>{count}</span>}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
