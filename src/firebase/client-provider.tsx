"use client";

import React, { useMemo } from 'react';
import { initializeFirebase, FirebaseProvider } from '@/firebase';

export const FirebaseClientProvider = ({ children }: { children: React.ReactNode }) => {
  const firebaseInstances = useMemo(() => {
    try {
      return initializeFirebase();
    } catch (e) {
      console.error(e);
      return { app: null, auth: null, firestore: null };
    }
  }, []);

  return (
    <FirebaseProvider value={firebaseInstances}>
      {children}
    </FirebaseProvider>
  );
};
