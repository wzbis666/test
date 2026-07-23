import { useEffect, useRef } from 'react';
import styles from './FishSwim.module.css';

/**
 * 复刻珀莱雅官网鱼群效果。
 * 两只鱼分别在左上角和右下角，在原位轻微晃动。
 * 通过 SVG filter 添加水波纹扭曲效果。
 */
const FISH = [
  { src: '/fish-1.png', size: 200, top: '5%',  left: '-3%',  driftX: 20, driftY: -12, driftY2: 8,  duration: 7,  delay: 0,  opacity: .22 },
  { src: '/fish-3.png', size: 170, top: 'auto', bottom: '10%', right: '-4%', left: 'auto', driftX: -18, driftY: -10, driftY2: 6, duration: 8, delay: 2, opacity: .20 },
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
      img.style.left = f.left;
      if (f.bottom) img.style.bottom = f.bottom;
      if (f.right) img.style.right = f.right;
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
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </div>
  );
}
