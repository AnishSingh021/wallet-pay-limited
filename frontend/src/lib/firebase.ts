import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBA5dfDUwwDsJtBRx2-b8ucXy3qPIS7-Fw",
  authDomain: "wallet-pay-12867.firebaseapp.com",
  projectId: "wallet-pay-12867",
  storageBucket: "wallet-pay-12867.firebasestorage.app",
  messagingSenderId: "615152838967",
  appId: "1:615152838967:web:3cbaa30773adec3da252b2",
  measurementId: "G-EVMDQ574ZN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics if we are in the browser
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics };
