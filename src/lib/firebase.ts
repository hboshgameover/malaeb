import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA7q79KfcmHcS2pCZ-UBNx3iDwqKSePIyo",
  authDomain: "la3batna-c6480.firebaseapp.com",
  projectId: "la3batna-c6480",
  storageBucket: "la3batna-c6480.firebasestorage.app",
  messagingSenderId: "448877407537",
  appId: "1:448877407537:web:f225728542a48ebc0b9410"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');
export const db = getFirestore(app);
export default app;
