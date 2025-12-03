"use client";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { getFirebaseApp } from "..";

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const app = getFirebaseApp();
        if (!app) {
            throw new Error("Firebase not initialized");
        }
        const auth = getAuth(app);
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Error signing in with Google: ", error);
    }
};

export const logout = async () => {
    try {
        const app = getFirebaseApp();
        if (!app) {
            throw new Error("Firebase not initialized");
        }
        const auth = getAuth(app);
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out: ", error);
    }
}
