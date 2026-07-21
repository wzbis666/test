import { useEvents } from '../../hooks/useEvents';
import { getWeekDays, parseDate, isToday, formatDate } from '../../utils/date';
import EventCard from '../EventCard/EventCard';
import { useAppContext } from '../../context/AppContext';
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

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {weekDays.map((day, i) => {
          const dateStr = formatDate(day);
          const events = getEventsByDate(dateStr);
          const todayFlag = isToday(day);

          return (
            <div
              key={dateStr}
              className={`${styles.column} ${todayFlag ? styles.today : ''}`}
            >
              <div className={styles.columnHeader}>
                <span className={styles.dayName}>{dayLabels[i]}</span>
                <span className={`${styles.dayNum} ${todayFlag ? styles.todayNum : ''}`}>
                  {day.date()}
                </span>
              </div>
              <div className={styles.columnBody}>
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={onEditEvent}
                    compact
                  />
                ))}
                <button
                  className={styles.addBtn}
                  onClick={() => onCreateEvent(dateStr)}
                >
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
