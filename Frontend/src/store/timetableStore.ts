import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TimetableTask {
  id: string;
  description: string;
  hours: number;
  completed: boolean;
}

interface TimetableData {
  [day: string]: TimetableTask[];
}

interface TimetableState {
  currentTimetable: TimetableData | null;
  setTimetable: (timetable: TimetableData) => void;
  clearTimetable: () => void;
}

export const useTimetableStore = create<TimetableState>()(
  persist(
    (set) => ({
      currentTimetable: null,
      setTimetable: (timetable) => set({ currentTimetable: timetable }),
      clearTimetable: () => set({ currentTimetable: null }),
    }),
    {
      name: 'timetable-storage',
    }
  )
);

