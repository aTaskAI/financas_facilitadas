'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for development if Firebase is not configured
const mockUser: User = {
  uid: 'mock-uid-123',
  email: 'mock.user@example.com',
  displayName: 'Mock User',
  photoURL: 'https://placehold.co/100x100.png',
  // Add other required User properties with mock data
  providerId: 'google.com',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => '',
  getIdTokenResult: async () => ({
    token: '',
    expirationTime: '',
    authTime: '',
    issuedAtTime: '',
    signInProvider: null,
    signInSecondFactor: null,
    claims: {},
  }),
  reload: async () => {},
  toJSON: () => ({}),
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Use mock auth if Firebase is not set up
      console.log("Using mock user for development.");
      setUser(mockUser);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        router.push('/');
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      setUser(mockUser);
      router.push('/');
      return;
    }
    
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the redirect
    } catch (error) {
      console.error('Error during sign in:', error);
      setLoading(false);
    }
  };

  const logout = async () => {
     if (!isFirebaseConfigured) {
      setUser(null);
      router.push('/login');
      return;
    }

    try {
      await signOut(auth);
      // onAuthStateChanged will handle the redirect
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
