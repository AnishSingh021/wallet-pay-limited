import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBfXMEfOJYbCh2GIWFPolYTxDjUsyGqHG4",
  authDomain: "wallet-pay-5b643.firebaseapp.com",
  projectId: "wallet-pay-5b643",
  storageBucket: "wallet-pay-5b643.firebasestorage.app",
  messagingSenderId: "1045298541296",
  appId: "1:1045298541296:web:d9ccb16b6dd389a75e8835",
  measurementId: "G-Q7RMENPHCS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics if we are in the browser
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics };
