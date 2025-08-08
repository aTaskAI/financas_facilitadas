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
  updateProfile,
  updatePassword,
  reauthenticateWithPopup,
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, isFirebaseConfigured } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => void;
  logout: () => void;
  updateUserProfile?: (displayName: string, photo?: File | null) => Promise<void>;
  updateUserPassword?: (newPassword: string) => Promise<void>;
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
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      setUser(mockUser);
      return;
    }
    
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the user state
    } catch (error) {
      console.error('Error during sign in:', error);
      setLoading(false);
    }
  };

  const logout = async () => {
     if (!isFirebaseConfigured) {
      setUser(null);
      return;
    }

    try {
      await signOut(auth);
      // onAuthStateChanged will handle the user state
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  const updateUserProfile = async (displayName: string, photo?: File | null) => {
    if (!auth.currentUser) throw new Error("Usuário não autenticado.");
    if (!isFirebaseConfigured) {
        const updatedUser = {...mockUser, displayName: displayName};
        if(photo) {
            updatedUser.photoURL = URL.createObjectURL(photo)
        }
        setUser(updatedUser);
        return;
    }

    let photoURL = auth.currentUser.photoURL;
    if (photo) {
      const storage = getStorage();
      const storageRef = ref(storage, `profile-pictures/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, photo);
      photoURL = await getDownloadURL(storageRef);
    }

    await updateProfile(auth.currentUser, { displayName, photoURL });
    setUser(auth.currentUser); // Force state update
  };
  
  const updateUserPassword = async (newPassword: string) => {
      if (!auth.currentUser) throw new Error("Usuário não autenticado.");
      if (!isFirebaseConfigured) {
          console.log("Mock password update.");
          return;
      }
      try {
        await updatePassword(auth.currentUser, newPassword);
      } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
            // Re-authenticate the user
            const provider = new GoogleAuthProvider();
            await reauthenticateWithPopup(auth.currentUser, provider);
            // Retry updating the password
            await updatePassword(auth.currentUser, newPassword);
        } else {
           throw error;
        }
      }
  };


  const value = {
    user,
    loading,
    signInWithGoogle,
    logout,
    updateUserProfile: isFirebaseConfigured ? updateUserProfile : undefined,
    updateUserPassword: isFirebaseConfigured ? updateUserPassword : undefined,
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
