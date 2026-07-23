import React, { createContext, useContext, useReducer } from 'react';
import type { AppState, AppAction, Event } from '../types';
import { today } from '../utils/date';

const initialState: AppState = {
  events: [],
  currentView: 'day',
  currentDate: today(),
  searchQuery: '',
  filterTag: 'all',
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter((e) => e.id !== action.payload),
      };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_DATE':
      return { ...state, currentDate: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_FILTER_TAG':
      return { ...state, filterTag: action.payload };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  children,
  initialEvents = [],
}: {
  children: React.ReactNode;
  initialEvents?: Event[];
}) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    events: initialEvents,
  });

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
