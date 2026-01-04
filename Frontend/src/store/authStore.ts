import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { authenticatedFetch, API_BASE_URL } from '../lib/api';

interface User {
  uid: string;
  email: string;
  displayName: string;
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
  isAuthInitialized: boolean; // New state to track Firebase Auth initialization
  login: (email: string, password: string) => Promise<void>;
  register: (displayName: string, email: string, password: string, additionalInfo?: Partial<User>) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      // Subscribe to Firebase Auth state changes
      auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          set({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
            },
            isAuthenticated: true,
            isAuthInitialized: true,
          });
        } else {
          set({ user: null, isAuthenticated: false, isAuthInitialized: true });
        }
      });

      return {
        user: null,
        isAuthenticated: false,
        isAuthInitialized: false, // Initial state
        
        login: async (email: string, password: string) => {
          try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
  
            // Fetch full user profile from your backend after successful Firebase login
            const backendUser = await authenticatedFetch(`/users/profile/${firebaseUser.uid}`);
            
            set({
              user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || backendUser.displayName || "",
                ...backendUser, // Merge other profile data from backend
              },
              isAuthenticated: true
            });
          } catch (error) {
            console.error("Login failed:", error);
            throw error; // Re-throw to be handled by the component
          }
        },
        
        register: async (displayName: string, email: string, password: string, additionalInfo?: Partial<User>) => {
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
  
            // Update display name in Firebase Auth
            if (displayName) {
              await updateProfile(firebaseUser, { displayName });
            }
  
            // Create user profile in your backend Firestore
            const backendUser = await authenticatedFetch(`/users/register`, {
              method: 'POST',
              body: JSON.stringify({ 
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                password: password, // <-- Add password here
                displayName: displayName || firebaseUser.displayName, 
                ...additionalInfo 
              }),
              token: await firebaseUser.getIdToken() // Pass token explicitly for registration
            });
  
            set({ 
              user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: displayName || firebaseUser.displayName || "",
                ...backendUser, // Merge other profile data from backend
              },
              isAuthenticated: true 
            });
          } catch (error) {
            console.error("Registration failed:", error);
            throw error; // Re-throw to be handled by the component
          }
        },
  
        logout: () => {
          signOut(auth);
          set({ user: null, isAuthenticated: false });
        },
        
        updateUser: (userData: Partial<User>) => {
          set((state) => ({
            user: state.user ? { ...state.user, ...userData } : null,
          }));
        },
      };
    },
    {
      name: 'auth-storage',
    }
  )
);
