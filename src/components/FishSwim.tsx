import { useEffect, useRef } from 'react';
import styles from './FishSwim.module.css';

const FISH = [
  // 左下角鱼群
  { src: '/fish-2.png', size: 220, left: -3, bottom: 8,  transit: 2.0, opacity: .28 },
  { src: '/fish-3.png', size: 180, left: -1, bottom: 18, transit: 2.8, opacity: .22 },
  { src: '/fish-1.png', size: 300, left: -6, bottom: 5,  transit: 3.2, opacity: .30 },
  // 右上角鱼群
  { src: '/fish-1.png', size: 250, right: -3, top: 8,   transit: 2.4, opacity: .28 },
  { src: '/fish-2.png', size: 200, right: -1, top: 18,  transit: 3.0, opacity: .22 },
  { src: '/fish-3.png', size: 320, right: -5, top: 4,   transit: 2.6, opacity: .30 },
];

export default function FishSwim() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const fishData: { img: HTMLImageElement; left?: number; right?: number; top?: number; bottom?: number }[] = [];

    FISH.forEach((f) => {
      const img = document.createElement('img');
      img.src = f.src;
      img.className = styles.fish;
      img.style.width = f.size + 'px';
      img.style.opacity = String(f.opacity);
      img.style.transitionDuration = f.transit + 's';
      if (f.left !== undefined) {
        img.style.left = f.left + '%';
        img.style.bottom = f.bottom + '%';
      } else {
        img.style.right = f.right + '%';
        img.style.top = f.top + '%';
      }
      container.appendChild(img);
      fishData.push({ img, left: f.left, right: f.right, top: f.top, bottom: f.bottom });
    });

    const intervals: ReturnType<typeof setInterval>[] = [];
    fishData.forEach(({ img, left, right, top, bottom }) => {
      const baseLeft = left;
      const baseRight = right;
      const baseTop = top;
      const baseBottom = bottom;
      const range = 2.5; // percent drift range

      const drift = () => {
        const dx = (Math.random() - 0.5) * range;
        const dy = (Math.random() - 0.5) * range;
        if (baseLeft !== undefined) {
          img.style.left = (baseLeft + dx) + '%';
          img.style.bottom = (baseBottom! + dy) + '%';
        } else {
          img.style.right = (baseRight! + dx) + '%';
          img.style.top = (baseTop! + dy) + '%';
        }
      };
      drift();
      const id = setInterval(drift, 1500 + Math.random() * 2500);
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
