import { useEffect, useRef } from 'react';
import styles from './FishSwim.module.css';

/**
 * 复刻珀莱雅官网鱼群效果。
 * 两只鱼分别在左上角和右下角，在原位轻微晃动。
 * 通过 SVG filter 添加水波纹扭曲效果。
 */
const FISH = [
  { src: '/fish-2.png', size: 340, top: 'auto', bottom: '2%', left: '-4%', right: 'auto', driftX: 30, driftY: -18, driftY2: 14, duration: 7, delay: 0, opacity: .35 },
  { src: '/fish-1.png', size: 360, top: '3%', left: 'auto', bottom: 'auto', right: '-4%', driftX: -28, driftY: -16, driftY2: 12, duration: 8, delay: 2, opacity: .32 },
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
      if (f.top !== 'auto') img.style.top = f.top;
      if (f.left !== 'auto') img.style.left = f.left;
      if (f.bottom) img.style.bottom = f.bottom;
      if (f.right) img.style.right = f.right;
      if (f.top === 'auto') img.style.top = 'auto';
      if (f.left === 'auto') img.style.left = 'auto';
      img.style.opacity = String(f.opacity);
      img.style.setProperty('--duration', f.duration + 's');
      img.style.setProperty('--delay', f.delay + 's');
      img.style.setProperty('--drift-x', f.driftX + 'px');
      img.style.setProperty('--drift-y', f.driftY + 'px');
      img.style.setProperty('--drift-y2', f.driftY2 + 'px');
      container.appendChild(img);
      fishEls.push(img);
    });

    return () => { fishEls.forEach((el) => el.remove()); };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      {/* SVG water ripple filter — simulates underwater refraction */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="water-ripple" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </div>
  );
}
