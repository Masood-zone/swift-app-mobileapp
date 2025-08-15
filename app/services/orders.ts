import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore"
import { db } from "./firebase"
import type { CartItem } from "../contexts/cart"

export interface Order {
  id?: string
  userId: string
  items: CartItem[]
  total: number
  deliveryAddress: string
  status: "pending" | "confirmed" | "preparing" | "on-the-way" | "delivered" | "cancelled"
  createdAt: Timestamp
}

export const createOrder = async (orderData: Omit<Order, "id" | "createdAt" | "status">): Promise<string> => {
  try {
    const order: Omit<Order, "id"> = {
      ...orderData,
      status: "pending",
      createdAt: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, "orders"), order)
    return docRef.id
  } catch (error) {
    console.error("Error creating order:", error)
    throw new Error("Failed to create order")
  }
}

export const fetchUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const q = query(collection(db, "orders"), where("userId", "==", userId), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[]
    return orders
  } catch (error) {
    console.error("Error fetching user orders:", error)
    throw new Error("Failed to fetch orders")
  }
}
