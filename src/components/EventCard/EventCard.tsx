import { TAG_CONFIG } from '../../types';
import type { Event } from '../../types';
import { timeToMinutes } from '../../utils/date';
import Icon from '../Icon';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
  style?: React.CSSProperties;
  compact?: boolean;
  onDragStart?: (e: React.DragEvent, event: Event) => void;
}

export default function EventCard({ event, onClick, style, compact = false, onDragStart }: EventCardProps) {
  const tag = TAG_CONFIG[event.tag];
  const duration = timeToMinutes(event.endTime) - timeToMinutes(event.startTime);

  return (
    <div
      className={`${styles.card} ${compact ? styles.compact : ''} ${duration <= 30 ? styles.short : ''}`}
      style={{
        '--tag-color': tag.color,
        '--tag-bg': tag.bg,
        '--tag-border': tag.border,
        ...style,
      } as React.CSSProperties}
      onClick={() => onClick(event)}
      draggable
      onDragStart={(e) => onDragStart?.(e, event)}
    >
      <div className={styles.time}>
        {event.startTime} – {event.endTime}
      </div>
      <div className={styles.title}>{event.title}</div>
      {!compact && event.note && <div className={styles.note}>{event.note}</div>}
      <span className={styles.tagIcon}><Icon name={tag.icon} size={12} /></span>
    </div>
  );
}
