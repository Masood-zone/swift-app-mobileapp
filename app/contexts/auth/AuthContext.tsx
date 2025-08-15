"use client";

import type React from "react";
import { createContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";

interface AuthUser extends User {
  name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({
            ...firebaseUser,
            ...userDoc.data(),
          } as AuthUser);
        } else {
          setUser({
            ...firebaseUser,
            name: firebaseUser.displayName || "",
          } as AuthUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
