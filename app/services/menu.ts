import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "./firebase"
import type { MenuItem } from "../types"

export const fetchMenuItems = async (restaurantId: string): Promise<MenuItem[]> => {
  try {
    const q = query(collection(db, "menuItems"), where("restaurantId", "==", restaurantId))
    const snapshot = await getDocs(q)
    const menuItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MenuItem[]
    return menuItems
  } catch (error) {
    console.error("Error fetching menu items:", error)
    throw new Error("Failed to fetch menu items")
  }
}

export const fetchMenuItemById = async (itemId: string): Promise<MenuItem | null> => {
  try {
    const snapshot = await getDocs(collection(db, "menuItems"))
    const menuItem = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).find((item) => item.id === itemId) as
      | MenuItem
      | undefined
    return menuItem || null
  } catch (error) {
    console.error("Error fetching menu item:", error)
    throw new Error("Failed to fetch menu item")
  }
}
