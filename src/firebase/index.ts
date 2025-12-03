"use client";

import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { firebaseConfig } from "./config";

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

// Check if firebaseConfig is populated
if (Object.keys(firebaseConfig).length > 0) {
  if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
  } else {
      app = getApp();
  }

  // Lazily initialize auth and firestore
  auth = getAuth(app);
  firestore = getFirestore(app);

} else {
    console.warn("Firebase config is empty. Please update src/firebase/config.ts with your project credentials.");
    // Provide dummy instances if not configured
    app = null as any;
    auth = null as any;
    firestore = null as any;
}


export { app, auth, firestore };
export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
