import { useState, useCallback, useEffect, useRef } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useEvents } from './hooks/useEvents';
import { today as todayStr } from './utils/date';
import { scheduleNotification, cancelNotification, requestNotificationPermission } from './utils/notifications';
import Header from './components/Header/Header';
import DayView from './components/DayView/DayView';
import WeekView from './components/WeekView/WeekView';
import MonthView from './components/MonthView/MonthView';
import EventModal from './components/EventModal/EventModal';
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
  const { createEvent, updateEvent, deleteEvent } = useEvents();
  const [modal, setModal] = useState<ModalState>({
    open: false,
    date: todayStr(),
    startTime: undefined,
    event: null,
  });
  const notificationTimers = useRef<Map<string, number>>(new Map());

  // Request notification permission on first load
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Schedule notifications for all events with reminders
  useEffect(() => {
    // Clear old timers
    notificationTimers.current.forEach((id) => cancelNotification(id));
    notificationTimers.current.clear();

    state.events.forEach((event) => {
      if (event.reminderMinutes > 0) {
        const timerId = scheduleNotification(event);
        if (timerId !== null) {
          notificationTimers.current.set(event.id, timerId);
        }
      }
    });

    return () => {
      notificationTimers.current.forEach((id) => cancelNotification(id));
    };
  }, [state.events]);

  // --- modal handlers ---
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
    (data: {
      id?: string;
      title: string;
      date: string;
      startTime: string;
      endTime: string;
      tag: TagColor;
      note: string;
      isAllDay: boolean;
      endDate: string;
      recurrence: { type: RecurrenceType; interval: number };
      reminderMinutes: number;
    }) => {
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
      const deletedEvent = state.events.find((e) => e.id === id);
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
    [deleteEvent, closeModal, state.events, createEvent]
  );

  // --- keyboard shortcuts ---
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (modal.open) return;
      const el = e.target as HTMLElement;
      if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') &&
          !el.closest('[class*="quickAdd"]') && !el.hasAttribute('data-search')) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        openCreate(state.currentDate);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        dispatch({ type: 'SET_DATE', payload: getPrevDate(state.currentDate, state.currentView) });
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        dispatch({ type: 'SET_DATE', payload: getNextDate(state.currentDate, state.currentView) });
      }
      if ((e.key === 'f' || e.key === 'F') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        // Focus search input
        const searchInput = document.querySelector<HTMLInputElement>('[data-search]');
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [modal.open, state.currentDate, state.currentView, openCreate, dispatch]);

  // --- render ---
  const renderView = () => {
    switch (state.currentView) {
      case 'day':
        return <DayView onEditEvent={openEdit} onCreateEvent={openCreate} />;
      case 'week':
        return <WeekView onEditEvent={openEdit} onCreateEvent={openCreate} />;
      case 'month':
        return <MonthView />;
    }
  };

  return (
    <div className="app-shell">
      <Header />
      <main className="view-container">
        {renderView()}
      </main>
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

// --- date nav helpers ---
function getPrevDate(current: string, view: ViewType): string {
  const d = new Date(current);
  switch (view) {
    case 'day': d.setDate(d.getDate() - 1); break;
    case 'week': d.setDate(d.getDate() - 7); break;
    case 'month': d.setMonth(d.getMonth() - 1); break;
  }
  return d.toISOString().slice(0, 10);
}

function getNextDate(current: string, view: ViewType): string {
  const d = new Date(current);
  switch (view) {
    case 'day': d.setDate(d.getDate() + 1); break;
    case 'week': d.setDate(d.getDate() + 7); break;
    case 'month': d.setMonth(d.getMonth() + 1); break;
  }
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

  useEffect(() => {
    setEvents(state.events);
  }, [state.events, setEvents]);

  return null;
}
