"use client";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, Auth } from "firebase/auth";

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async (auth: Auth) => {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Error signing in with Google: ", error);
    }
};

export const logout = async (auth: Auth) => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out: ", error);
    }
}
