import { useEffect, useRef } from 'react';
import styles from './FishSwim.module.css';

/**
 * 复刻珀莱雅官网鱼群游动效果。
 * 三只鱼 PNG 在页面不同深度层缓慢漂移，营造海洋氛围。
 */
const FISH = [
  { src: '/fish-1.png', size: 120, top: '8%',  duration: 28, delay: 0,  opacity: .12 },
  { src: '/fish-2.png', size: 100, top: '75%', duration: 35, delay: 8,  opacity: .10 },
  { src: '/fish-3.png', size: 90,  top: '45%', duration: 22, delay: 15, opacity: .08 },
];

export default function FishSwim() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const fishEls: HTMLImageElement[] = [];

    FISH.forEach((f) => {
      const img = document.createElement('img');
      img.src = f.src;
      img.className = styles.fish;
      img.style.width = f.size + 'px';
      img.style.top = f.top;
      img.style.opacity = String(f.opacity);
      img.style.setProperty('--duration', f.duration + 's');
      img.style.setProperty('--delay', f.delay + 's');
      container.appendChild(img);
      fishEls.push(img);
    });

    return () => { fishEls.forEach((el) => el.remove()); };
  }, []);

  return <div ref={containerRef} className={styles.container} />;
}
