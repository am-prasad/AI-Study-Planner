// am-prasad/ai-study-planner/Frontend/src/store/subjectsStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Represents an individual study chapter within a subject.
 * These are generated based on PDF headings and difficulty.
 */
export interface Chapter {
  id: string;
  name: string;
  completed: boolean;
  progress: number; // 0-100
  estimatedHours: number; // Hours allotted by AI based on difficulty
  scheduledDate: string;  // The specific date assigned to this chapter
}

/**
 * Represents a study subject, containing its metadata and generated chapters.
 */
export interface Subject {
  id: string;
  name: string;
  difficulty: number; // 1-5 scale
  totalHours: number;
  completedHours: number;
  availableHoursPerWeek: number;
  syllabusUrl?: string;
  color: string;
  chapters: Chapter[];
  startDate: string; // The baseline date for the study plan
}

interface SubjectsState {
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id' | 'completedHours' | 'color'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  updateChapter: (subjectId: string, chapterId: string, updates: Partial<Chapter>) => void;
  uploadSyllabus: (subjectId: string, file: File) => Promise<string>;
}

const COLORS = [
  'hsl(240 64% 60%)', // primary
  'hsl(270 60% 65%)', // secondary
  'hsl(175 70% 50%)', // accent
  'hsl(14 80% 65%)',  // warm
  'hsl(340 75% 68%)', // pink
  'hsl(195 75% 55%)', // cyan
];

export const useSubjectsStore = create<SubjectsState>()(
  persist(
    (set) => ({
      subjects: [],
      
      /**
       * Adds a new subject to the store with a random color.
       * Used after the AI generates the chapter breakdown and dates.
       */
      addSubject: (subject) => {
        const newSubject: Subject = {
          ...subject,
          id: Date.now().toString(),
          completedHours: 0,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        };
        
        set((state) => ({
          subjects: [...state.subjects, newSubject],
        }));
      },
      
      /**
       * Updates subject-level metadata (e.g., changing the name or total hours).
       */
      updateSubject: (id, updates) => {
        set((state) => ({
          subjects: state.subjects.map((subject) =>
            subject.id === id ? { ...subject, ...updates } : subject
          ),
        }));
      },
      
      /**
       * Removes a subject and its associated study plan from the store.
       */
      deleteSubject: (id) => {
        set((state) => ({
          subjects: state.subjects.filter((subject) => subject.id !== id),
        }));
      },
      
      /**
       * Updates specific chapter properties (e.g., marking as completed).
       * Recalculates subject-level completed hours based on chapter status.
       */
      updateChapter: (subjectId, chapterId, updates) => {
        set((state) => ({
          subjects: state.subjects.map((subject) => {
            if (subject.id !== subjectId) return subject;

            const updatedChapters = subject.chapters.map((chapter) =>
              chapter.id === chapterId ? { ...chapter, ...updates } : chapter
            );

            // Calculate new completed hours based on estimatedHours of completed chapters
            const newCompletedHours = updatedChapters
              .filter(ch => ch.completed)
              .reduce((sum, ch) => sum + ch.estimatedHours, 0);

            return {
              ...subject,
              chapters: updatedChapters,
              completedHours: newCompletedHours,
            };
          }),
        }));
      },
      
      /**
       * Handles local syllabus storage using Object URLs.
       */
      uploadSyllabus: async (subjectId, file) => {
        const url = URL.createObjectURL(file);
        set((state) => ({
          subjects: state.subjects.map((subject) =>
            subject.id === subjectId ? { ...subject, syllabusUrl: url } : subject
          ),
        }));
        return url;
      },
    }),
    {
      name: 'subjects-storage', // Key used for LocalStorage persistence
    }
  )
);