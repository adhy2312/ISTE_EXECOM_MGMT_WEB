import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDZ5LY7J9dbhL7y3KPHI5hBOBW7ovLM3sU",
  authDomain: "iste-528bd.firebaseapp.com",
  projectId: "iste-528bd",
  storageBucket: "iste-528bd.firebasestorage.app",
  messagingSenderId: "100194839456",
  appId: "1:100194839456:web:de2028c1182acc4ef292c5",
};

// Prevent duplicate initialization in Next.js dev
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
