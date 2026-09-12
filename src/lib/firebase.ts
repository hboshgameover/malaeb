import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA7q79KfcMhcS2pCZ-UBHx3iDwqKSePlyo",
  authDomain: "la3batna-c6480.firebaseapp.com",
  projectId: "la3batna-c6480",
  storageBucket: "la3batna-c6480.firebasestorage.app",
  messagingSenderId: "448877407537",
  appId: "1:448877407537:web:f225728542a48ebc0b9410",
  measurementId: "G-2MYDSZP245"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
