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
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, isFirebaseConfigured } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => void;
  signInWithEmailPassword?: (email: string, password: string) => Promise<void>;
  signUpWithEmailPassword?: (email: string, password: string, displayName: string) => Promise<void>;
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
  providerId: 'password',
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
    } catch (error) {
      console.error('Error during sign in:', error);
      setLoading(false);
    }
  };

  const signInWithEmailPassword = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      setUser(mockUser);
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        setLoading(false);
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            throw new Error('E-mail ou senha inválidos.');
        }
        throw new Error('Ocorreu um erro desconhecido.');
    }
  };

  const signUpWithEmailPassword = async (email: string, password: string, displayName: string) => {
    if (!isFirebaseConfigured) {
        setUser({...mockUser, displayName, email});
        return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      // Reload user to get the new displayName
      await userCredential.user.reload();
      setUser(auth.currentUser);
    } catch (error: any) {
        setLoading(false);
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('Este e-mail já está em uso.');
        }
        throw new Error('Ocorreu um erro ao criar a conta.');
    }
  };


  const logout = async () => {
     if (!isFirebaseConfigured) {
      setUser(null);
      return;
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  const updateUserProfile = async (displayName: string, photo?: File | null) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Usuário não autenticado.");
    if (!isFirebaseConfigured) {
        const updatedUser = {...user, displayName: displayName} as User;
        if(photo) {
            updatedUser.photoURL = URL.createObjectURL(photo)
        }
        setUser(updatedUser);
        return;
    }

    let photoURL = currentUser.photoURL;
    if (photo) {
      const storage = getStorage();
      const storageRef = ref(storage, `profile-pictures/${currentUser.uid}`);
      await uploadBytes(storageRef, photo);
      photoURL = await getDownloadURL(storageRef);
    }

    await updateProfile(currentUser, { displayName, photoURL });
    
    const updatedUser = Object.assign(Object.create(Object.getPrototypeOf(currentUser)), currentUser);
    updatedUser.displayName = displayName;
    updatedUser.photoURL = photoURL;
    setUser(updatedUser);
  };
  
  const updateUserPassword = async (newPassword: string) => {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Usuário não autenticado.");
      if (!isFirebaseConfigured) {
          console.log("Mock password update.");
          return;
      }
      try {
        await updatePassword(currentUser, newPassword);
      } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
            const provider = new GoogleAuthProvider();
            await reauthenticateWithPopup(currentUser, provider);
            await updatePassword(currentUser, newPassword);
        } else {
           throw error;
        }
      }
  };


  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    logout,
    updateUserProfile,
    updateUserPassword,
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
