import { motion } from 'framer-motion';
import LottieEmptyState from './LottieEmptyState';

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '48px 24px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Lottie ocean layer (if file exists) */}
      <LottieEmptyState showLottie />
      {/* Ocean scene */}
      <svg width="200" height="160" viewBox="0 0 200 160" fill="none" style={{ marginBottom: 20 }}>
        {/* Floating calendar */}
        <motion.g
          animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          <rect x="55" y="20" width="90" height="80" rx="8" fill="var(--color-bg)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <rect x="55" y="20" width="90" height="18" rx="8" fill="var(--color-primary)" />
          <circle cx="68" cy="29" r="2.5" fill="var(--color-bg)" />
          <circle cx="132" cy="29" r="2.5" fill="var(--color-bg)" />
          <line x1="62" y1="48" x2="138" y2="48" stroke="var(--color-border)" />
          <line x1="62" y1="62" x2="138" y2="62" stroke="var(--color-border)" />
          <line x1="62" y1="76" x2="120" y2="76" stroke="var(--color-border)" />
          <circle cx="80" cy="55" r="3" fill="var(--accent)" />
          <circle cx="95" cy="69" r="3" fill="var(--color-primary)" />
        </motion.g>
        {/* Bubbles rising */}
        {[1, 2, 3].map((i) => (
          <motion.circle
            key={i} cx={70 + i * 25} cy={100} r={2 + i}
            fill="none" stroke="var(--color-primary)" opacity=".2"
            animate={{ y: [-20, -60], opacity: [.3, 0] }}
            transition={{ repeat: Infinity, duration: 2 + i, delay: i * .7, ease: 'easeOut' }}
          />
        ))}
      </svg>
      <motion.p
        style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3 }}
      >
        今天还没有日程
      </motion.p>
      <motion.p
        style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', maxWidth: 260 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .5 }}
      >
        在上方输入框快速创建，或点击右下角 + 添加
      </motion.p>
    </motion.div>
  );
}
