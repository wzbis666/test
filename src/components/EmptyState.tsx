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
        {/* Water surface shimmer */}
        <motion.rect x="0" y="0" width="200" height="160" rx="16" fill="var(--color-surface)" opacity=".5" />
        {/* Seabed */}
        <motion.path
          d="M0,142 C30,135 60,148 90,140 C120,132 150,145 180,138 L200,140 L200,160 L0,160Z"
          fill="var(--color-surface)" opacity=".8"
          animate={{ d: [
            "M0,142 C30,135 60,148 90,140 C120,132 150,145 180,138 L200,140 L200,160 L0,160Z",
            "M0,140 C30,147 60,133 90,142 C120,150 150,136 180,144 L200,140 L200,160 L0,160Z",
            "M0,142 C30,135 60,148 90,140 C120,132 150,145 180,138 L200,140 L200,160 L0,160Z",
          ] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        />
        {/* Shells on seabed */}
        <circle cx="50" cy="148" r="4" fill="var(--accent)" opacity=".5" />
        <circle cx="150" cy="145" r="3" fill="var(--color-primary)" opacity=".4" />
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
