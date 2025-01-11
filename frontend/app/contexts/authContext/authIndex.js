'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext({ user: null });

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
