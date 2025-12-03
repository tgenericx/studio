"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { FirebaseApp } from "firebase/app";
import { Auth } from "firebase/auth";
import { Firestore } from "firebase/firestore";
import { getFirebaseApp, getFirebaseAuth, getFirebaseFirestore } from "./index";

interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  firestore: null,
});

export const useFirebase = () => useContext(FirebaseContext);
export const useFirebaseApp = () => useContext(FirebaseContext).app;
export const useAuth = () => {
    const context = useContext(FirebaseContext);
    if (!context) {
        throw new Error("useAuth must be used within a FirebaseProvider");
    }
    return context.auth;
};
export const useFirestore = () => {
    const context = useContext(FirebaseContext);
    if (!context) {
        throw new Error("useFirestore must be used within a FirebaseProvider");
    }
    return context.firestore;
};

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use the getter functions to ensure Firebase is initialized
  const app = getFirebaseApp();
  const auth = getFirebaseAuth();
  const firestore = getFirebaseFirestore();

  return (
    <FirebaseContext.Provider value={{ app, auth, firestore }}>
      {children}
    </FirebaseContext.Provider>
  );
};
