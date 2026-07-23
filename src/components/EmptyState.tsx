import { motion } from 'framer-motion';

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '64px 24px', textAlign: 'center',
        position: 'relative',
      }}
    >
      {/* Ocean illustration */}
      <svg width="180" height="140" viewBox="0 0 180 140" fill="none" style={{ marginBottom: 24 }}>
        {/* Calendar body */}
        <motion.rect
          x="40" y="20" width="100" height="95" rx="10"
          fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="2"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: .1, type: 'spring', stiffness: 300 }}
        />
        {/* Calendar header bar */}
        <motion.rect
          x="40" y="20" width="100" height="22" rx="10"
          fill="var(--color-primary)"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: .3, type: 'spring', stiffness: 300 }}
          style={{ transformOrigin: '40px 20px' }}
        />
        <rect x="40" y="31" width="100" height="2" fill="var(--color-primary)" opacity=".3" />
        {/* Calendar holes */}
        <circle cx="56" cy="31" r="3" fill="var(--color-bg)" />
        <circle cx="124" cy="31" r="3" fill="var(--color-bg)" />
        {/* Grid lines */}
        {[50, 62, 74, 86, 98].map((y, i) => (
          <motion.line
            key={y} x1="48" y1={y} x2="132" y2={y}
            stroke="var(--color-border)" strokeWidth="1"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ delay: .5 + i * .08, duration: .4 }}
          />
        ))}
        {/* Dots for events */}
        <motion.circle cx="62" cy="68" r="4" fill="var(--accent)"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: .9, type: 'spring' }} />
        <motion.circle cx="78" cy="80" r="4" fill="var(--color-primary)"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.0, type: 'spring' }} />
        <motion.circle cx="100" cy="68" r="4" fill="var(--color-primary)"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1, type: 'spring' }} />
        {/* Ocean waves below calendar */}
        <motion.path
          d="M20,130 C50,120 80,140 110,125 C130,115 150,130 170,122"
          stroke="var(--color-primary)" strokeWidth="2" fill="none" opacity=".3"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.3, duration: .8 }}
        />
        <motion.path
          d="M15,137 C55,128 85,145 115,132 C135,124 155,138 175,130"
          stroke="var(--accent)" strokeWidth="1.5" fill="none" opacity=".2"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.5, duration: .8 }}
        />
      </svg>
      <motion.p
        style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
      >
        今天还没有日程
      </motion.p>
      <motion.p
        style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', maxWidth: 260 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}
      >
        在上方输入框快速创建，或点击右下角 + 添加
      </motion.p>
    </motion.div>
  );
}
