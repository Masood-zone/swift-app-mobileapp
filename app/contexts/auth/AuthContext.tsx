import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { createContext, useEffect, useState, type ReactNode } from "react";
import { auth, db } from "../../services/firebase";
import type { AdminUser } from "../../types";

interface AuthUser extends User {
  name?: string;
  role?: "user" | "admin";
  isAdmin?: boolean;
  adminPermissions?: {
    canManageRestaurants: boolean;
    canManageMenus: boolean;
    canManageOrders: boolean;
    canManageUsers: boolean;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  hasAdminPermission: (
    permission: keyof AdminUser["adminPermissions"]
  ) => boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  hasAdminPermission: () => false,
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
          const userData = userDoc.data();
          setUser({
            ...firebaseUser,
            ...userData,
            isAdmin: userData.role === "admin",
          } as AuthUser);
        } else {
          setUser({
            ...firebaseUser,
            name: firebaseUser.displayName || "",
            role: "user",
            isAdmin: false,
          } as AuthUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const isAdmin = user?.isAdmin || false;

  const hasAdminPermission = (
    permission: keyof AdminUser["adminPermissions"]
  ): boolean => {
    if (!user?.isAdmin || !user?.adminPermissions) return false;
    return user.adminPermissions[permission];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        hasAdminPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
