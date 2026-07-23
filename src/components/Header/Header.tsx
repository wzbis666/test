import { useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { formatDisplay, parseDate, today } from '../../utils/date';
import { TAG_CONFIG } from '../../types';
import type { ViewType, TagColor } from '../../types';
import Icon from '../Icon';
import styles from './Header.module.css';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export default function Header({ theme, onToggleTheme, onExport, onImport }: HeaderProps) {
  const { state, dispatch } = useAppContext();
  const currentDate = parseDate(state.currentDate);
  const fileRef = useRef<HTMLInputElement>(null);

  const goToday = () => dispatch({ type: 'SET_DATE', payload: today() });
  const goPrev = () =>
    dispatch({ type: 'SET_DATE', payload: currentDate.subtract(1, 'day').format('YYYY-MM-DD') });
  const goNext = () =>
    dispatch({ type: 'SET_DATE', payload: currentDate.add(1, 'day').format('YYYY-MM-DD') });

  const switchView = (view: ViewType) => dispatch({ type: 'SET_VIEW', payload: view });

  const views: ViewType[] = ['day', 'week', 'month'];
  const viewLabels: Record<ViewType, string> = { day: '日', week: '周', month: '月' };
  const hasFilter = state.searchQuery || state.filterTag !== 'all';

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImport(file);
    e.target.value = '';
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.logo}>
          <img src="/proya-logo.png" alt="珀莱雅" className={styles.logoImg} />
          <span className={styles.logoDivider}>|</span>
          <span className={styles.logoText}>日程管理</span>
        </h1>
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={onToggleTheme} title={theme === 'light' ? '暗黑模式' : '浅色模式'}>
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={16} />
          </button>
          <button className={styles.iconBtn} onClick={onExport} title="导出数据">
            <Icon name="download" size={16} />
          </button>
          <button className={styles.iconBtn} onClick={() => fileRef.current?.click()} title="导入数据">
            <Icon name="upload" size={16} />
          </button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        </div>
      </div>

      <div className={styles.center}>
        <button className={styles.navBtn} onClick={goPrev} aria-label="前一天">
          <Icon name="chevron-left" size={18} />
        </button>
        <button className={styles.todayBtn} onClick={goToday}>今天</button>
        <span className={styles.dateDisplay} onClick={goToday}>
          {formatDisplay(currentDate)}
        </span>
        <button className={styles.navBtn} onClick={goNext} aria-label="后一天">
          <Icon name="chevron-right" size={18} />
        </button>
      </div>

      <div className={styles.right}>
        <div className={`${styles.searchWrap} ${hasFilter ? styles.searchActive : ''}`}>
          <Icon name="search" size={13} className={styles.searchIcon} />
          <input
            data-search
            className={styles.searchInput}
            type="text"
            placeholder="搜索..."
            value={state.searchQuery}
            onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
          />
          {state.searchQuery && (
            <button className={styles.clearSearch} onClick={() => dispatch({ type: 'SET_SEARCH', payload: '' })}>
              <Icon name="x" size={12} />
            </button>
          )}
        </div>
        <select
          className={`${styles.filterSelect} ${state.filterTag !== 'all' ? styles.filterActive : ''}`}
          value={state.filterTag}
          onChange={(e) => dispatch({ type: 'SET_FILTER_TAG', payload: e.target.value as TagColor | 'all' })}
        >
          <option value="all">全部</option>
          {(Object.entries(TAG_CONFIG) as [TagColor, typeof TAG_CONFIG[TagColor]][]).map(([k, cfg]) => (
            <option key={k} value={k}>{cfg.label}</option>
          ))}
        </select>
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
