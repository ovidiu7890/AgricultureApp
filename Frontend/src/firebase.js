// Firebase configuration for web app
// TODO: Replace these values with your actual Firebase project config
// Get these from: Firebase Console > Project Settings > General > Your apps > Web app

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC_niFYoNMe-_Bb_nzGxpzG0CtvKSp0khw",
  authDomain: "agriculturedb.firebaseapp.com",
  projectId: "agriculturedb",
  storageBucket: "agriculturedb.firebasestorage.app",
  messagingSenderId: "603395906408",
  appId: "1:603395906408:web:4bb79670b91d15e38154dd",
  measurementId: "G-RKQZSX9Q6F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;
