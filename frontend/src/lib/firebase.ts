import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBA5dfDUwwDsJtBRx2-b8ucXy3qPIS7-Fw",
  authDomain: "wallet-pay-12867.firebaseapp.com",
  projectId: "wallet-pay-12867",
  storageBucket: "wallet-pay-12867.firebasestorage.app",
  messagingSenderId: "615152838967",
  appId: "1:615152838967:web:3cbaa30773adec3da252b2",
  measurementId: "G-EVMDQ574ZN",
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