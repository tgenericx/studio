"use client";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { app } from "../index";

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const auth = getAuth(app);
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Error signing in with Google: ", error);
    }
};

export const logout = async () => {
    try {
        const auth = getAuth(app);
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out: ", error);
    }
}
