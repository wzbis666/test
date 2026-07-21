import { useAppContext } from '../../context/AppContext';
import { formatDisplay, parseDate, today } from '../../utils/date';
import type { ViewType } from '../../types';
import styles from './Header.module.css';

export default function Header() {
  const { state, dispatch } = useAppContext();
  const currentDate = parseDate(state.currentDate);

  const goToday = () => dispatch({ type: 'SET_DATE', payload: today() });
  const goPrev = () =>
    dispatch({ type: 'SET_DATE', payload: currentDate.subtract(1, 'day').format('YYYY-MM-DD') });
  const goNext = () =>
    dispatch({ type: 'SET_DATE', payload: currentDate.add(1, 'day').format('YYYY-MM-DD') });

  const switchView = (view: ViewType) => dispatch({ type: 'SET_VIEW', payload: view });

  const views: ViewType[] = ['day', 'week', 'month'];
  const viewLabels: Record<ViewType, string> = { day: '日', week: '周', month: '月' };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.logo}>DayPlan</h1>
      </div>
      <div className={styles.center}>
        <button className={styles.navBtn} onClick={goPrev} aria-label="前一天">
          ‹
        </button>
        <button className={styles.todayBtn} onClick={goToday}>
          今天
        </button>
        <span className={styles.dateDisplay} onClick={goToday}>
          {formatDisplay(currentDate)}
        </span>
        <button className={styles.navBtn} onClick={goNext} aria-label="后一天">
          ›
        </button>
      </div>
      <div className={styles.right}>
        <div className={styles.viewSwitcher}>
          {views.map((v) => (
            <button
              key={v}
              className={`${styles.viewBtn} ${state.currentView === v ? styles.active : ''}`}
              onClick={() => switchView(v)}
            >
              {viewLabels[v]}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
