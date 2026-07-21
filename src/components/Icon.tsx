import {
  Briefcase, Flame, MessageSquare, Home, Heart, Pin,
  Sun, CloudSun, Moon, CalendarDays, Sparkles,
  Download, Upload, Search, Plus, Circle, CircleCheck,
  ChevronLeft, ChevronRight, GripVertical, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const map: Record<string, LucideIcon> = {
  'briefcase': Briefcase, 'flame': Flame, 'message-square': MessageSquare,
  'home': Home, 'heart': Heart, 'pin': Pin,
  'sun': Sun, 'cloud-sun': CloudSun, 'moon': Moon,
  'calendar-days': CalendarDays, 'sparkles': Sparkles,
  'download': Download, 'upload': Upload, 'search': Search,
  'plus': Plus, 'circle': Circle, 'circle-check': CircleCheck,
  'chevron-left': ChevronLeft, 'chevron-right': ChevronRight,
  'grip-vertical': GripVertical, 'x': X,
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function Icon({ name, size = 16, className, style }: IconProps) {
  const Comp = map[name];
  if (!Comp) return <span className={className}>?</span>;
  return <Comp size={size} className={className} style={style} strokeWidth={2} />;
}
