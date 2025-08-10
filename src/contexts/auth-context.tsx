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
  sendPasswordResetEmail
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, isFirebaseConfigured } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => void;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<any>;
  sendPasswordReset: (email: string) => Promise<void>;
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

  const signInWithEmail = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      setUser(mockUser);
      return;
    }
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  }
  
  const signUpWithEmail = async (name: string, email: string, password: string) => {
    if (!isFirebaseConfigured) {
      setUser(mockUser);
      return;
    }
    setLoading(true);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    
    // Create a new user object to force re-render with display name
    const updatedUser: User = { ...userCredential.user, displayName: name, photoURL: null };
    setUser(updatedUser);
    
    return userCredential;
  }
  
  const sendPasswordReset = async (email: string) => {
    if (!isFirebaseConfigured) {
      alert("Password reset email sent to " + email);
      return;
    }
    return sendPasswordResetEmail(auth, email);
  }

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
    if (!auth.currentUser) throw new Error("Usuário não autenticado.");
    if (!isFirebaseConfigured) {
        const updatedUser = {...user, displayName: displayName} as User;
        if(photo) {
            updatedUser.photoURL = URL.createObjectURL(photo)
        }
        setUser(updatedUser);
        return;
    }

    const currentUser = auth.currentUser;
    let photoURL = currentUser.photoURL;
    if (photo) {
      const storage = getStorage();
      const storageRef = ref(storage, `profile-pictures/${currentUser.uid}`);
      await uploadBytes(storageRef, photo);
      photoURL = await getDownloadURL(storageRef);
    }

    await updateProfile(currentUser, { displayName, photoURL });
    
    // Create a new user object to force re-render
    const updatedUser: User = { ...currentUser, displayName, photoURL };
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
          try {
            // Re-authentication depends on the original provider
            if (currentUser.providerData[0]?.providerId === 'google.com') {
              const provider = new GoogleAuthProvider();
              await reauthenticateWithPopup(currentUser, provider);
            }
            // For email/password, we can't easily re-auth without asking for the old password.
            // Let's inform the user to log out and log back in.
            else {
               throw new Error("Por favor, saia e entre novamente para alterar sua senha.");
            }
            // Retry updating password after re-authentication
            await updatePassword(currentUser, newPassword);
          } catch(reauthError: any) {
             throw new Error(reauthError.message || "Sessão expirada. Por favor, faça login novamente para alterar sua senha.");
          }
        } else {
           throw error;
        }
      }
  };


  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
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
