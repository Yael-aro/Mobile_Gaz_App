import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { Loader2 } from 'lucide-react';

interface User {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'cantinier' | 'client';
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    console.log('🔐 Setting up auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log('🔐 Auth state changed:', firebaseUser?.email || 'No user');
      
      if (firebaseUser) {
        try {
          // Récupérer les infos utilisateur depuis Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const user: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name || firebaseUser.displayName || 'Utilisateur',
              role: userData.role || 'client',
              phone: userData.phone
            };
            console.log('✅ User loaded:', user.email, user.role);
            setUser(user);
          } else {
            console.warn('⚠️ User document not found in Firestore');
            setUser(null);
          }
        } catch (error) {
          console.error('❌ Error loading user data:', error);
          setUser(null);
        }
      } else {
        console.log('👤 No authenticated user');
        setUser(null);
      }
      
      setLoading(false);
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('🔑 Attempting sign in for:', email);
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Sign in successful');
    } catch (error: any) {
      console.error('❌ Sign in error:', error.code, error.message);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('👋 Signing out...');
      await firebaseSignOut(auth);
      setUser(null);
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  };

  // Afficher un loader pendant l'initialisation
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Initialisation...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
