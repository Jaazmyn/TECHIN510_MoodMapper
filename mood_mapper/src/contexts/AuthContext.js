import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc, enableNetwork, disableNetwork } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Register new user
  async function register(email, password, username) {
    try {
      setError('');
      // Enable network before registration
      await enableNetwork(db);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore with username
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email,
        username: username,
        createdAt: new Date().toISOString()
      });

      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  // Login user
  async function login(email, password) {
    try {
      setError('');
      // Enable network before login
      await enableNetwork(db);
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  // Logout user
  async function logout() {
    try {
      setError('');
      await signOut(auth);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Enable network before fetching user data
          await enableNetwork(db);
          
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setCurrentUser({
              ...user,
              ...userDoc.data()
            });
          } else {
            setCurrentUser(user);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // If offline, still set the basic user info
        if (user) {
          setCurrentUser(user);
        }
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    register,
    login,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 