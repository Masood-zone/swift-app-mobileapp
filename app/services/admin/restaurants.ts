import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "../firebase"
import type { Restaurant } from "../../types"

export interface CreateRestaurantData {
  name: string
  cuisine: string
  deliveryTime: number
  deliveryFee: number
  rating?: number
  image?: string
}

export const createRestaurant = async (restaurantData: CreateRestaurantData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "restaurants"), {
      ...restaurantData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating restaurant:", error)
    throw new Error("Failed to create restaurant")
  }
}

export const updateRestaurant = async (restaurantId: string, updates: Partial<CreateRestaurantData>): Promise<void> => {
  try {
    const restaurantRef = doc(db, "restaurants", restaurantId)
    await updateDoc(restaurantRef, {
      ...updates,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error updating restaurant:", error)
    throw new Error("Failed to update restaurant")
  }
}

export const deleteRestaurant = async (restaurantId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "restaurants", restaurantId))
  } catch (error) {
    console.error("Error deleting restaurant:", error)
    throw new Error("Failed to delete restaurant")
  }
}

export const fetchAllRestaurantsAdmin = async (): Promise<Restaurant[]> => {
  try {
    const q = query(collection(db, "restaurants"), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    const restaurants = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Restaurant[]
    return restaurants
  } catch (error) {
    console.error("Error fetching restaurants:", error)
    throw new Error("Failed to fetch restaurants")
  }
}

export const uploadRestaurantImage = async (imageUri: string, restaurantId: string): Promise<string> => {
  try {
    const response = await fetch(imageUri)
    const blob = await response.blob()
    const imageRef = ref(storage, `restaurants/${restaurantId}/${Date.now()}`)
    await uploadBytes(imageRef, blob)
    const downloadURL = await getDownloadURL(imageRef)
    return downloadURL
  } catch (error) {
    console.error("Error uploading image:", error)
    throw new Error("Failed to upload image")
  }
}
