import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBA5dfDUwwDsJtBRx2-b8ucXy3qPIS7-Fw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "wallet-pay-12867.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "wallet-pay-12867",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "wallet-pay-12867.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "615152838967",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:615152838967:web:3cbaa30773adec3da252b2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-EVMDQ574ZN",
};

// Prevent Firebase from initializing more than once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firebase Authentication
const auth = getAuth(app);

// Firebase Analytics
let analytics = null;

if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics unavailable; authentication can still work.
    });
}

export { app, auth, analytics };