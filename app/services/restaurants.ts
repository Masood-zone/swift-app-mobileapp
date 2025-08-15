import { collection, getDocs } from "firebase/firestore"
import { db } from "./firebase"
import type { Restaurant } from "../types"

export const fetchRestaurants = async (): Promise<Restaurant[]> => {
  try {
    const snapshot = await getDocs(collection(db, "restaurants"))
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

export const fetchRestaurantById = async (restaurantId: string): Promise<Restaurant | null> => {
  try {
    const snapshot = await getDocs(collection(db, "restaurants"))
    const restaurant = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).find((r) => r.id === restaurantId) as
      | Restaurant
      | undefined
    return restaurant || null
  } catch (error) {
    console.error("Error fetching restaurant:", error)
    throw new Error("Failed to fetch restaurant")
  }
}
