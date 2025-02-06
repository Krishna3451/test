import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { saveUserData, updateUserLastLogin, getUserData } from '../services/database';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  needsPhoneVerification: boolean;
  userName: string;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  needsPhoneVerification: false,
  userName: ''
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsPhoneVerification, setNeedsPhoneVerification] = useState(false);
  const [userName, setUserName] = useState('');
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Try to get existing user data
          const userData = await getUserData(user.uid);
          
          if (userData) {
            // Update last login for existing user
            await updateUserLastLogin(user.uid);
            setUserName(userData.displayName);
            setNeedsPhoneVerification(!userData.phoneNumber);
          } else {
            // New user - check if they have a verified phone number in their profile
            let phoneNumber = '';
            let displayName = user.displayName || '';
            
            try {
              const profileData = JSON.parse(user.displayName || '{}');
              displayName = profileData.name || user.displayName || user.email?.split('@')[0] || 'User';
              phoneNumber = profileData.verifiedPhone || '';
            } catch {
              displayName = user.displayName || user.email?.split('@')[0] || 'User';
            }

            // Save initial user data
            await saveUserData({
              uid: user.uid,
              email: user.email || '',
              displayName,
              phoneNumber,
              photoURL: user.photoURL || '',
              lastLogin: new Date().toISOString(),
              createdAt: new Date().toISOString()
            });

            setUserName(displayName);
            // New user without phone verification needs to verify
            setNeedsPhoneVerification(!phoneNumber);
          }
        } catch (error) {
          console.error('Error handling user data:', error);
          setUserName(user.displayName || user.email?.split('@')[0] || 'User');
          setNeedsPhoneVerification(true);
        }
        setUser(user);
      } else {
        // User is signed out
        setUser(null);
        setUserName('');
        setNeedsPhoneVerification(false);
      }
      
      setLoading(false);
      setInitialCheckDone(true);
    });

    return unsubscribe;
  }, []);

  // Don't render children until initial check is done
  if (!initialCheckDone) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, loading, needsPhoneVerification, userName }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
