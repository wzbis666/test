import { useEffect, useState } from 'react';

type DayPeriod = 'dawn' | 'noon' | 'dusk' | 'night';

function getPeriod(): DayPeriod {
  const h = new Date().getHours();
  if (h >= 6 && h < 10) return 'dawn';
  if (h >= 10 && h < 16) return 'noon';
  if (h >= 16 && h < 20) return 'dusk';
  return 'night';
}

export function useTimeOfDay() {
  const [period, setPeriod] = useState<DayPeriod>(getPeriod);

  useEffect(() => {
    const check = () => setPeriod(getPeriod());
    // Check every 30 minutes
    const interval = setInterval(check, 30 * 60 * 1000);
    check();
    return () => clearInterval(interval);
  }, []);

  return period;
}
