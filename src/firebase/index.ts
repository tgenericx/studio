"use client";

import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { firebaseConfig } from "./config";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

function initialize() {
    if (Object.keys(firebaseConfig).length > 0) {
        if (getApps().length === 0) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApp();
        }
        auth = getAuth(app);
        firestore = getFirestore(app);
    } else {
        console.warn("Firebase config is empty. Please update src/firebase/config.ts with your project credentials.");
    }
}

// Getter functions to be used by other modules
export const getFirebaseApp = () => {
    if (!app) {
        initialize();
    }
    return app;
}
export const getFirebaseAuth = () => {
    if (!auth) {
        initialize();
    }
    return auth;
}
export const getFirebaseFirestore = () => {
    if (!firestore) {
        initialize();
    }
    return firestore;
}

// For use in the provider
const getInitializedInstances = () => {
    if (!app) {
        initialize();
    }
    return { app, auth, firestore };
}

const { app: initializedApp, auth: initializedAuth, firestore: initializedFirestore } = getInitializedInstances();

export { initializedApp as app, initializedAuth as auth, initializedFirestore as firestore };

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
