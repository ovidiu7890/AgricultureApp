import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase';
import { createUserProfile, getUserProfile } from '../services/forumService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password
  const signup = async (email, password, username) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in backend to store username
      try {
        await createUserProfile({
          user_uid: userCredential.user.uid,
          username: username,
          email: email
        });
      } catch (dbError) {
        console.error("Failed to create user profile in DB:", dbError);
        // We don't throw here to allow the signup to complete even if DB sync fails, 
        // though in production you might want to handle this differently.
      }

      return userCredential.user;
    } catch (error) {
      console.error('Signup error:', error);
      setLoading(false);
      throw error;
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const email = firebaseUser.email;
        let username = firebaseUser.displayName || email.split('@')[0];
        
        // Check if user exists in backend, if not create them (backfill for existing users)
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile && profile.username) {
            username = profile.username;
          }
        } catch (error) {
          // If profile fetch fails (e.g. 404), create it
          console.log("User profile missing in DB, creating backfill...", error);
          try {
            await createUserProfile({
              user_uid: firebaseUser.uid,
              username: username,
              email: email
            });
            console.log("Backfill complete for user:", username);
          } catch (createError) {
            console.error("Failed to backfill user profile:", createError);
          }
        }

        setUser({
          uid: firebaseUser.uid,
          email: email,
          username: username,
          isAuthenticated: true,
        });
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    isAuthenticated: user !== null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
