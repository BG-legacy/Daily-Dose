import React, { useContext, useEffect, useState } from "react";
import { onAuthStateChanged, Auth } from "firebase-admin/auth";
import {auth} from "../firebase";

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

// this function is used to track whether a user is logged in or not

export function AuthContext({ children }) {
    // setting current user information
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoggedIn, setuserLoggedIn ] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
    }, [])


    async function initializeUser(user) {
        if(user) {
            setCurrentUser({ ...user });
            setuserLoggedIn(true);
        } else {
            setCurrentUser(null);
            setuserLoggedIn(false);
        }
        setLoading(false);
    }

    const value = {
        currentUser,
        userLoggedIn,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )

}