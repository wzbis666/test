import { useEffect, useRef } from 'react';
import styles from './Bubbles.module.css';

/** Floating ocean bubble particles — decorative only */
export default function Bubbles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const bubbles: HTMLDivElement[] = [];
    const count = 8;

    for (let i = 0; i < count; i++) {
      const bubble = document.createElement('div');
      bubble.className = styles.bubble;
      const size = 4 + Math.random() * 12;
      bubble.style.width = size + 'px';
      bubble.style.height = size + 'px';
      bubble.style.left = Math.random() * 100 + '%';
      bubble.style.setProperty('--duration', (8 + Math.random() * 12) + 's');
      bubble.style.setProperty('--delay', Math.random() * 10 + 's');
      bubble.style.setProperty('--drift', (Math.random() - 0.5) * 60 + 'px');
      container.appendChild(bubble);
      bubbles.push(bubble);
    }

    return () => {
      bubbles.forEach((b) => b.remove());
    };
  }, []);

  return <div ref={containerRef} className={styles.container} />;
}
