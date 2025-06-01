// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDq1ZnAmJLGIeypazz4fDnnQ6vK6QWRtyw",
  authDomain: "moodmapper-2025.firebaseapp.com",
  projectId: "moodmapper-2025",
  storageBucket: "moodmapper-2025.appspot.com",
  messagingSenderId: "456122907646",
  appId: "1:456122907646:web:5a4fa8c05794bd413d5eaf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence with better error handling
const enablePersistence = async () => {
  try {
    await enableIndexedDbPersistence(db, {
      synchronizeTabs: true
    });
    console.log('Firestore persistence enabled');
  } catch (err) {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence not supported by browser');
    } else {
      console.error('Error enabling persistence:', err);
    }
  }
};

// Enable persistence
enablePersistence();

export default app;