import { collection, getDocs, updateDoc, doc, query, orderBy, where, deleteDoc } from "firebase/firestore"
import { db } from "../firebase"

export interface AdminUserProfile {
  uid: string
  email: string
  name: string
  phone?: string
  address?: string
  role?: "user" | "admin"
  isAdmin?: boolean
  status?: "active" | "suspended" | "banned"
  createdAt: any
  lastLoginAt?: any
  totalOrders?: number
  totalSpent?: number
  adminPermissions?: {
    canManageRestaurants: boolean
    canManageMenus: boolean
    canManageOrders: boolean
    canManageUsers: boolean
  }
}

export const fetchAllUsersAdmin = async (): Promise<AdminUserProfile[]> => {
  try {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    const users = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    })) as AdminUserProfile[]

    // Fetch order statistics for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        try {
          const ordersQuery = query(collection(db, "orders"), where("userId", "==", user.uid))
          const ordersSnapshot = await getDocs(ordersQuery)
          const orders = ordersSnapshot.docs.map((doc) => doc.data())

          const totalOrders = orders.length
          const totalSpent = orders
            .filter((order) => order.status === "delivered")
            .reduce((sum, order) => sum + (order.total || 0), 0)

          return {
            ...user,
            totalOrders,
            totalSpent,
          }
        } catch (error) {
          console.error("Error fetching user stats:", error)
          return {
            ...user,
            totalOrders: 0,
            totalSpent: 0,
          }
        }
      }),
    )

    return usersWithStats
  } catch (error) {
    console.error("Error fetching users:", error)
    throw new Error("Failed to fetch users")
  }
}

export const updateUserRole = async (
  uid: string,
  role: "user" | "admin",
  adminPermissions?: AdminUserProfile["adminPermissions"],
): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid)
    const updateData: any = {
      role,
      isAdmin: role === "admin",
      updatedAt: new Date(),
    }

    if (role === "admin" && adminPermissions) {
      updateData.adminPermissions = adminPermissions
    }

    await updateDoc(userRef, updateData)
  } catch (error) {
    console.error("Error updating user role:", error)
    throw new Error("Failed to update user role")
  }
}

export const updateUserStatus = async (uid: string, status: "active" | "suspended" | "banned"): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid)
    await updateDoc(userRef, {
      status,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error updating user status:", error)
    throw new Error("Failed to update user status")
  }
}

export const updateUserProfile = async (
  uid: string,
  updates: Partial<Pick<AdminUserProfile, "name" | "phone" | "address">>,
): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid)
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw new Error("Failed to update user profile")
  }
}

export const deleteUser = async (uid: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "users", uid))
  } catch (error) {
    console.error("Error deleting user:", error)
    throw new Error("Failed to delete user")
  }
}

export const getUserStats = async () => {
  try {
    const users = await fetchAllUsersAdmin()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.status !== "banned" && user.status !== "suspended").length,
      adminUsers: users.filter((user) => user.role === "admin").length,
      suspendedUsers: users.filter((user) => user.status === "suspended").length,
      bannedUsers: users.filter((user) => user.status === "banned").length,
      newUsersToday: users.filter((user) => {
        const createdDate = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt)
        return createdDate >= today
      }).length,
      totalRevenue: users.reduce((sum, user) => sum + (user.totalSpent || 0), 0),
    }

    return stats
  } catch (error) {
    console.error("Error getting user stats:", error)
    throw new Error("Failed to get user statistics")
  }
}
