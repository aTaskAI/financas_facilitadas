'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from 'react';
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface UserData {
  nome: string;
  nomeConjuge?: string;
  renda: number;
  rendaConjuge?: number;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  logout: () => void;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  login?: (email?: string, password?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useMockAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      // If there is a mock user in local storage, use it.
      const mockUser = localStorage.getItem('mockUser');
      if (mockUser) {
        setUser(JSON.parse(mockUser));
        const mockUserData = localStorage.getItem('mockUserData');
        if (mockUserData) {
          setUserData(JSON.parse(mockUserData));
        }
      }
      setLoading(false);
    }, []);

    const login = (email?: string, password?: string) => {
      const mockUser = {
          uid: 'mock-user-id',
          email: email || 'mock@example.com',
          displayName: 'Mock User',
          photoURL: 'https://placehold.co/100x100.png',
      } as User;
      setUser(mockUser);
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      // Check if user data exists, if not, redirect to welcome
      const mockUserData = localStorage.getItem('mockUserData');
      if (!mockUserData) {
        router.push('/welcome');
      } else {
        setUserData(JSON.parse(mockUserData));
        router.push('/');
      }
    };

    const logout = async () => {
        setUser(null);
        setUserData(null);
        localStorage.removeItem('mockUser');
        localStorage.removeItem('mockUserData');
        router.push('/login');
    };

    const updateUserData = async (data: Partial<UserData>) => {
        const newUserData = {...userData, ...data} as UserData
        setUserData(newUserData);
        localStorage.setItem('mockUserData', JSON.stringify(newUserData));
    };

    return { user, userData, loading, logout, updateUserData, login };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const mockAuth = useMockAuth();

  const updateUserData = useCallback(async (data: Partial<UserData>) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, data, { merge: true });
      setUserData((prev) => (prev ? { ...prev, ...data } : null));
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  }, [user]);

  useEffect(() => {
    if (!isFirebaseConfigured) {
        setLoading(false);
        return;
    };
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data() as UserData);
        } else {
          // New user, redirect to setup
          router.push('/welcome');
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const logout = async () => {
    try {
        if (isFirebaseConfigured) {
            await firebaseSignOut(auth);
        } else {
            mockAuth.logout();
        }
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = isFirebaseConfigured ? { user, userData, loading, logout, updateUserData } : mockAuth;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
