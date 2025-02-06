import { ref, set, get, child } from 'firebase/database';
import { database } from '../lib/firebase';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  lastLogin: string;
  createdAt: string;
  photoURL?: string;
}

export const saveUserData = async (userData: UserData) => {
  try {
    const userRef = ref(database, `users/${userData.uid}`);
    await set(userRef, {
      ...userData,
      lastLogin: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `users/${uid}`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

export const updateUserLastLogin = async (uid: string) => {
  try {
    const userRef = ref(database, `users/${uid}/lastLogin`);
    await set(userRef, new Date().toISOString());
  } catch (error) {
    console.error('Error updating last login:', error);
    throw error;
  }
};
