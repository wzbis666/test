import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ParticleBurstProps {
  origin: { x: number; y: number };
  onDone: () => void;
}

const COLORS = ['#0D7B89', '#E8976B', '#4CB8C4', '#F0A878', '#7B6FDE', '#38A08A'];
const COUNT = 8;

export default function ParticleBurst({ origin, onDone }: ParticleBurstProps) {
  const [particles] = useState(() =>
    Array.from({ length: COUNT }, (_, i) => ({
      id: i,
      angle: (i / COUNT) * 360 + Math.random() * 20,
      distance: 30 + Math.random() * 50,
      size: 4 + Math.random() * 6,
      color: COLORS[i % COLORS.length]!,
      duration: .5 + Math.random() * .4,
    }))
  );

  useEffect(() => {
    const timer = setTimeout(onDone, 700);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <AnimatePresence>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: origin.x, y: origin.y, scale: 0, opacity: 1,
          }}
          animate={{
            x: origin.x + Math.cos(p.angle * Math.PI / 180) * p.distance,
            y: origin.y + Math.sin(p.angle * Math.PI / 180) * p.distance,
            scale: 1, opacity: 0,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: p.duration, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            width: p.size, height: p.size,
            borderRadius: '50%',
            background: p.color,
            pointerEvents: 'none',
            zIndex: 999,
          }}
        />
      ))}
    </AnimatePresence>
  );
}
