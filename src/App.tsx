import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useAppContext } from './context/AppContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useEvents } from './hooks/useEvents';
import { useTheme } from './hooks/useTheme';
import { useTimeOfDay } from './hooks/useTimeOfDay';
import { today as todayStr } from './utils/date';
import { scheduleNotification, cancelNotification, requestNotificationPermission } from './utils/notifications';
import Header from './components/Header/Header';
import DayView from './components/DayView/DayView';
import WeekView from './components/WeekView/WeekView';
import MonthView from './components/MonthView/MonthView';
import EventModal from './components/EventModal/EventModal';
import MiniCalendar from './components/MiniCalendar/MiniCalendar';
import Bubbles from './components/Bubbles/Bubbles';
import ToastContainer, { showToast } from './components/Toast/Toast';
import type { Event, TagColor, ViewType, RecurrenceType } from './types';

interface ModalState {
  open: boolean;
  date: string;
  startTime?: string;
  event: Event | null;
}

function AppInner() {
  const { state, dispatch } = useAppContext();
  const { createEvent, updateEvent, deleteEvent, events } = useEvents();
  const { theme, toggle: toggleTheme } = useTheme();
  const timeOfDay = useTimeOfDay();
  const [modal, setModal] = useState<ModalState>({
    open: false,
    date: todayStr(),
    startTime: undefined,
    event: null,
  });
  const notificationTimers = useRef<Map<string, number>>(new Map());

  // Hide splash screen after first render (not timer-based)
  useEffect(() => {
    const splash = document.getElementById('splash');
    if (splash) {
      requestAnimationFrame(() => {
        splash.classList.add('hide');
        setTimeout(() => splash.remove(), 400);
      });
    }
  }, []);

  // Detect ocean background image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      document.querySelector('.app-shell')?.classList.add('has-ocean-bg');
    };
    img.src = '/ocean-bg.webp';
  }, []);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    notificationTimers.current.forEach((id) => cancelNotification(id));
    notificationTimers.current.clear();
    events.forEach((event) => {
      if (event.reminderMinutes > 0) {
        const timerId = scheduleNotification(event);
        if (timerId !== null) notificationTimers.current.set(event.id, timerId);
      }
    });
    return () => {
      notificationTimers.current.forEach((id) => cancelNotification(id));
    };
  }, [events]);

  // --- Export ---
  const handleExport = useCallback(() => {
    const data = JSON.stringify(events, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dayplan-export-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [events]);

  // --- Import ---
  const handleImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (!Array.isArray(imported)) throw new Error('格式错误');
        // Merge: add imported events with new IDs to avoid conflicts
        const merged = imported.map((ev: any) => ({
          ...ev,
          id: ev.id || crypto.randomUUID(),
          createdAt: ev.createdAt || Date.now(),
          updatedAt: Date.now(),
          isAllDay: ev.isAllDay ?? false,
          endDate: ev.endDate || ev.date,
          recurrence: ev.recurrence || { type: 'none', interval: 1 },
          reminderMinutes: ev.reminderMinutes ?? 0,
        }));
        merged.forEach((ev: Event) => dispatch({ type: 'ADD_EVENT', payload: ev }));
        showToast(`已导入 ${merged.length} 条日程`);
      } catch {
        showToast('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file);
  }, [dispatch]);

  // --- modal ---
  const openCreate = useCallback((date: string, startTime?: string) => {
    setModal({ open: true, date, startTime, event: null });
  }, []);

  const openEdit = useCallback((event: Event) => {
    setModal({ open: true, date: event.date, startTime: event.startTime, event });
  }, []);

  const closeModal = useCallback(() => {
    setModal((prev) => ({ ...prev, open: false }));
  }, []);

  const handleSave = useCallback(
    (data: { id?: string; title: string; date: string; startTime: string; endTime: string;
      tag: TagColor; note: string; isAllDay: boolean; endDate: string;
      recurrence: { type: RecurrenceType; interval: number }; reminderMinutes: number }) => {
      if (data.id) {
        updateEvent(data as Parameters<typeof updateEvent>[0]);
      } else {
        createEvent(data);
      }
      closeModal();
    },
    [createEvent, updateEvent, closeModal]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const deletedEvent = events.find((e) => e.id === id);
      deleteEvent(id);
      closeModal();
      if (deletedEvent) {
        showToast('日程已删除', {
          label: '撤销',
          onClick: () => {
            createEvent({
              title: deletedEvent.title,
              date: deletedEvent.date,
              startTime: deletedEvent.startTime,
              endTime: deletedEvent.endTime,
              tag: deletedEvent.tag,
              note: deletedEvent.note,
              isAllDay: deletedEvent.isAllDay,
              endDate: deletedEvent.endDate,
              recurrence: deletedEvent.recurrence,
              reminderMinutes: deletedEvent.reminderMinutes,
            });
          },
        });
      }
    },
    [deleteEvent, closeModal, events, createEvent]
  );

  // --- keyboard ---
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (modal.open) return;
      const el = e.target as HTMLElement;
      if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') &&
          !el.closest('[class*="quickAdd"]') && !el.hasAttribute('data-search')) return;

      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); openCreate(state.currentDate); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); dispatch({ type: 'SET_DATE', payload: getPrevDate(state.currentDate, state.currentView) }); }
      if (e.key === 'ArrowRight') { e.preventDefault(); dispatch({ type: 'SET_DATE', payload: getNextDate(state.currentDate, state.currentView) }); }
      if ((e.key === 'f' || e.key === 'F') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('[data-search]')?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [modal.open, state.currentDate, state.currentView, openCreate, dispatch]);

  // Water ripple on click
  const handleRipple = (e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest('.ripple-target') as HTMLElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--ripple-x', (e.clientX - rect.left) + 'px');
    target.style.setProperty('--ripple-y', (e.clientY - rect.top) + 'px');
    target.classList.add('rippling');
    setTimeout(() => target.classList.remove('rippling'), 600);
  };

  const renderView = () => {
    switch (state.currentView) {
      case 'day': return <DayView onEditEvent={openEdit} onCreateEvent={openCreate} />;
      case 'week': return <WeekView onEditEvent={openEdit} onCreateEvent={openCreate} />;
      case 'month': return <MonthView />;
    }
  };

  return (
    <div className={`app-shell period-${timeOfDay}`} onClick={handleRipple}>
      <Bubbles />
      <Header theme={theme} onToggleTheme={toggleTheme} onExport={handleExport} onImport={handleImport} />
      <div className="main-layout">
        <MiniCalendar />
        <main className="view-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: .18, ease: 'easeOut' }}
              style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {modal.open && (
        <EventModal
          date={modal.date}
          startTime={modal.startTime}
          event={modal.event}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeModal}
        />
      )}
      <ToastContainer />
    </div>
  );
}

function getPrevDate(current: string, view: ViewType): string {
  const d = new Date(current);
  switch (view) { case 'day': d.setDate(d.getDate() - 1); break; case 'week': d.setDate(d.getDate() - 7); break; case 'month': d.setMonth(d.getMonth() - 1); break; }
  return d.toISOString().slice(0, 10);
}

function getNextDate(current: string, view: ViewType): string {
  const d = new Date(current);
  switch (view) { case 'day': d.setDate(d.getDate() + 1); break; case 'week': d.setDate(d.getDate() + 7); break; case 'month': d.setMonth(d.getMonth() + 1); break; }
  return d.toISOString().slice(0, 10);
}

export default function App() {
  const [events] = useLocalStorage<Event[]>('dayplan-events', []);
  return (
    <AppProvider initialEvents={events}>
      <SyncEvents />
      <AppInner />
    </AppProvider>
  );
}

function SyncEvents() {
  const { state } = useAppContext();
  const [, setEvents] = useLocalStorage<Event[]>('dayplan-events', []);
  useEffect(() => { setEvents(state.events); }, [state.events, setEvents]);
  return null;
}
