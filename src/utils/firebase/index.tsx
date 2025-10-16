"use client";
// Import the functions you need from the SDKs you need
import { type FirebaseOptions, initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only when required envs are present
let firebaseapp: ReturnType<typeof initializeApp> | null = null;
try {
  if (firebaseConfig.projectId && firebaseConfig.apiKey && firebaseConfig.appId) {
    firebaseapp = initializeApp(firebaseConfig);
  }
} catch {}

export const messaging = () => {
  if (!firebaseapp) return null as any;
  return getMessaging(firebaseapp);
};

export default firebaseapp;
