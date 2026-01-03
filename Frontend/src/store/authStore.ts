import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  username?: string;
  phone?: string;
  institution?: string;
  studyGoal?: string;
  grade?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, additionalInfo?: Partial<User>) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock successful login
        const mockUser: User = {
          id: '1',
          name: 'Student',
          email: email,
        };
        
        set({ user: mockUser, isAuthenticated: true });
      },
      
      register: async (name: string, email: string, password: string, additionalInfo?: Partial<User>) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock successful registration
        const mockUser: User = {
          id: '1',
          name: name,
          email: email,
          ...additionalInfo,
        };
        
        set({ user: mockUser, isAuthenticated: true });
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
