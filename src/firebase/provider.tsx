"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { FirebaseApp } from "firebase/app";
import { Auth } from "firebase/auth";
import { Firestore } from "firebase/firestore";

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

export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (!context) {
        throw new Error("useFirebase must be used within a FirebaseProvider");
    }
    return context;
};

export const useFirebaseApp = () => {
    const context = useFirebase();
    return context.app;
};

export const useAuth = () => {
    const context = useFirebase();
    if (!context.auth) {
        throw new Error("useAuth must be used within a FirebaseProvider with an auth instance");
    }
    return context.auth;
};
export const useFirestore = () => {
    const context = useFirebase();
    if (!context.firestore) {
        throw new Error("useFirestore must be used within a FirebaseProvider with a firestore instance");
    }
    return context.firestore;
};

interface FirebaseProviderProps {
  children: ReactNode;
  value: FirebaseContextType;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children, value }) => {
  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
