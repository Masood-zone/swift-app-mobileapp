import { useContext } from "react";
import { AuthContext } from "../contexts/auth/AuthContext";
import type { AdminUser } from "../types";

export function useAdmin() {
  const { user, isAdmin, hasAdminPermission } = useContext(AuthContext);

  const adminUser = isAdmin ? (user as AdminUser) : null;

  return {
    isAdmin,
    adminUser,
    hasAdminPermission,
    canManageRestaurants: hasAdminPermission("canManageRestaurants"),
    canManageMenus: hasAdminPermission("canManageMenus"),
    canManageOrders: hasAdminPermission("canManageOrders"),
    canManageUsers: hasAdminPermission("canManageUsers"),
  };
}
