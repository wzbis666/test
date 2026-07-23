import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';

interface Props {
  showLottie: boolean; // falls back to SVG if Lottie file not loaded
}

export default function LottieEmptyState({ showLottie }: Props) {
  const [animData, setAnimData] = useState<any>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!showLottie) return;
    fetch('/ocean-wave.json')
      .then((r) => { if (!r.ok) throw new Error('not found'); return r.json(); })
      .then((data) => setAnimData(data))
      .catch(() => setLoadFailed(true));
  }, [showLottie]);

  // If Lottie failed to load or not showing, render nothing — parent handles fallback
  if (!showLottie || loadFailed || !animData) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', zIndex: 0,
      }}
    >
      <Lottie
        animationData={animData}
        loop
        style={{ width: 300, height: 200, opacity: .6 }}
      />
    </motion.div>
  );
}
