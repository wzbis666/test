import { useEffect, useRef } from 'react';
import styles from './FishSwim.module.css';

/**
 * 复刻珀莱雅官网鱼群效果。
 * JS 定时微调 left/top，CSS transition 平滑过渡。
 */
const FISH = [
  { src: '/fish-2.png', size: 340, baseLeft: -4, baseBottom: 2,  range: 20, opacity: .35 },
  { src: '/fish-1.png', size: 360, baseRight: -4, baseTop: 3,   range: 20, opacity: .32 },
];

export default function FishSwim() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const fishData: { img: HTMLImageElement; baseLeft?: number; baseBottom?: number; baseRight?: number; baseTop?: number; range: number }[] = [];

    FISH.forEach((f) => {
      const img = document.createElement('img');
      img.src = f.src;
      img.className = styles.fish;
      img.style.width = f.size + 'px';
      img.style.opacity = String(f.opacity);
      if (f.baseLeft !== undefined) {
        img.style.left = f.baseLeft + '%';
        img.style.bottom = f.baseBottom + '%';
      } else {
        img.style.right = f.baseRight + '%';
        img.style.top = f.baseTop + '%';
      }
      container.appendChild(img);
      fishData.push({ img, baseLeft: f.baseLeft, baseBottom: f.baseBottom, baseRight: f.baseRight, baseTop: f.baseTop, range: f.range });
    });

    // Drift loop: every 2-3s, nudge position within range
    const intervals: ReturnType<typeof setInterval>[] = [];
    fishData.forEach(({ img, baseLeft, baseBottom, baseRight, baseTop, range }) => {
      const drift = () => {
        const dx = (Math.random() - 0.5) * range * 2;
        const dy = (Math.random() - 0.5) * range * 2;
        if (baseLeft !== undefined) {
          img.style.left = (baseLeft + dx / 10) + '%';
          img.style.bottom = (baseBottom! + dy / 10) + '%';
        } else {
          img.style.right = (baseRight! + dx / 10) + '%';
          img.style.top = (baseTop! + dy / 10) + '%';
        }
      };
      drift();
      const id = setInterval(drift, 2000 + Math.random() * 2000);
      intervals.push(id);
    });

    return () => {
      fishData.forEach(({ img }) => img.remove());
      intervals.forEach(clearInterval);
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="water-ripple" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </div>
  );
}
