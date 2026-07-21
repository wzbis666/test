import { useAppContext } from '../../context/AppContext';
import { formatDisplay, parseDate, today } from '../../utils/date';
import { TAG_CONFIG } from '../../types';
import type { ViewType, TagColor } from '../../types';
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

  const hasFilter = state.searchQuery || state.filterTag !== 'all';

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.logo}>DayPlan</h1>
      </div>

      <div className={styles.center}>
        <button className={styles.navBtn} onClick={goPrev} aria-label="前一天">‹</button>
        <button className={styles.todayBtn} onClick={goToday}>今天</button>
        <span className={styles.dateDisplay} onClick={goToday}>
          {formatDisplay(currentDate)}
        </span>
        <button className={styles.navBtn} onClick={goNext} aria-label="后一天">›</button>
      </div>

      <div className={styles.right}>
        {/* Search */}
        <div className={`${styles.searchWrap} ${hasFilter ? styles.searchActive : ''}`}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            data-search
            className={styles.searchInput}
            type="text"
            placeholder="搜索..."
            value={state.searchQuery}
            onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
          />
          {state.searchQuery && (
            <button
              className={styles.clearSearch}
              onClick={() => dispatch({ type: 'SET_SEARCH', payload: '' })}
            >
              ×
            </button>
          )}
        </div>

        {/* Tag filter */}
        <select
          className={`${styles.filterSelect} ${state.filterTag !== 'all' ? styles.filterActive : ''}`}
          value={state.filterTag}
          onChange={(e) => dispatch({ type: 'SET_FILTER_TAG', payload: e.target.value as TagColor | 'all' })}
        >
          <option value="all">全部</option>
          {(Object.entries(TAG_CONFIG) as [TagColor, typeof TAG_CONFIG[TagColor]][]).map(([k, cfg]) => (
            <option key={k} value={k}>{cfg.icon} {cfg.label}</option>
          ))}
        </select>

        {/* View switcher */}
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
