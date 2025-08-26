import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "../firebase"
import type { MenuItem } from "../../types"

export interface CreateMenuItemData {
  name: string
  description: string
  price: number
  category?: string
  restaurantId: string
  image?: string
}

export const createMenuItem = async (menuItemData: CreateMenuItemData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "menuItems"), {
      ...menuItemData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating menu item:", error)
    throw new Error("Failed to create menu item")
  }
}

export const updateMenuItem = async (menuItemId: string, updates: Partial<CreateMenuItemData>): Promise<void> => {
  try {
    const menuItemRef = doc(db, "menuItems", menuItemId)
    await updateDoc(menuItemRef, {
      ...updates,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error updating menu item:", error)
    throw new Error("Failed to update menu item")
  }
}

export const deleteMenuItem = async (menuItemId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "menuItems", menuItemId))
  } catch (error) {
    console.error("Error deleting menu item:", error)
    throw new Error("Failed to delete menu item")
  }
}

export const fetchAllMenuItemsAdmin = async (): Promise<MenuItem[]> => {
  try {
    const q = query(collection(db, "menuItems"), orderBy("createdAt", "desc"))
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

export const fetchMenuItemsByRestaurant = async (restaurantId: string): Promise<MenuItem[]> => {
  try {
    const q = query(
      collection(db, "menuItems"),
      where("restaurantId", "==", restaurantId),
      orderBy("category"),
      orderBy("name"),
    )
    const snapshot = await getDocs(q)
    const menuItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MenuItem[]
    return menuItems
  } catch (error) {
    console.error("Error fetching menu items by restaurant:", error)
    throw new Error("Failed to fetch menu items")
  }
}

export const uploadMenuItemImage = async (imageUri: string, menuItemId: string): Promise<string> => {
  try {
    const response = await fetch(imageUri)
    const blob = await response.blob()
    const imageRef = ref(storage, `menuItems/${menuItemId}/${Date.now()}`)
    await uploadBytes(imageRef, blob)
    const downloadURL = await getDownloadURL(imageRef)
    return downloadURL
  } catch (error) {
    console.error("Error uploading image:", error)
    throw new Error("Failed to upload image")
  }
}
