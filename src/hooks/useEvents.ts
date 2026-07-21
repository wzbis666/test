import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateId } from '../utils/id';
import type { Event, TagColor } from '../types';

interface CreateEventInput {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  tag: TagColor;
  note: string;
}

export function useEvents() {
  const { state, dispatch } = useAppContext();

  const createEvent = useCallback(
    (input: CreateEventInput) => {
      const now = Date.now();
      const event: Event = {
        id: generateId(),
        ...input,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD_EVENT', payload: event });
      return event;
    },
    [dispatch]
  );

  const updateEvent = useCallback(
    (input: CreateEventInput & { id: string }) => {
      const existing = state.events.find((e) => e.id === input.id);
      const event: Event = {
        id: input.id,
        title: input.title,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        tag: input.tag,
        note: input.note,
        createdAt: existing?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      };
      dispatch({ type: 'UPDATE_EVENT', payload: event });
      return event;
    },
    [dispatch, state.events]
  );

  const deleteEvent = useCallback(
    (id: string) => {
      dispatch({ type: 'DELETE_EVENT', payload: id });
    },
    [dispatch]
  );

  const getEventsByDate = useCallback(
    (date: string) => {
      return state.events
        .filter((e) => e.date === date)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    },
    [state.events]
  );

  return { events: state.events, createEvent, updateEvent, deleteEvent, getEventsByDate };
}
