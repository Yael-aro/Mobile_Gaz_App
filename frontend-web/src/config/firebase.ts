import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ⚠️ REMPLACE CES VALEURS par celles de ta Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCDfB5PdrAcy8UEM2XZ-SDUSFuqKVu8s4U",
  authDomain: "eluxtan-gas-management-web.firebaseapp.com",
  projectId: "eluxtan-gas-management-web",
  storageBucket: "eluxtan-gas-management-web.firebasestorage.app",
  messagingSenderId: "238652621286",
  appId: "1:238652621286:web:cc13fadd63a803c9c29627",
  measurementId: "G-HWQHDRJ008"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
