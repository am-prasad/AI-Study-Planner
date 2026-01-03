import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Subject {
  id: string;
  name: string;
  difficulty: number; // 1-5
  totalHours: number;
  completedHours: number;
  availableHoursPerWeek: number;
  syllabusUrl?: string;
  color: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  name: string;
  completed: boolean;
  progress: number; // 0-100
}

interface SubjectsState {
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id' | 'completedHours'>) => void;
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
      
      updateSubject: (id, updates) => {
        set((state) => ({
          subjects: state.subjects.map((subject) =>
            subject.id === id ? { ...subject, ...updates } : subject
          ),
        }));
      },
      
      deleteSubject: (id) => {
        set((state) => ({
          subjects: state.subjects.filter((subject) => subject.id !== id),
        }));
      },
      
      updateChapter: (subjectId, chapterId, updates) => {
        set((state) => ({
          subjects: state.subjects.map((subject) =>
            subject.id === subjectId
              ? {
                  ...subject,
                  chapters: subject.chapters.map((chapter) =>
                    chapter.id === chapterId ? { ...chapter, ...updates } : chapter
                  ),
                }
              : subject
          ),
        }));
      },
      
      uploadSyllabus: async (subjectId, file) => {
        // TODO: Implement with Lovable Cloud storage
        // For now, create a local object URL
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
      name: 'subjects-storage',
    }
  )
);
