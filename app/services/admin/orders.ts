import { collection, getDocs, updateDoc, doc, query, orderBy, where, Timestamp } from "firebase/firestore"
import { db } from "../firebase"
import type { CartItem } from "../../contexts/cart"

export interface AdminOrder {
  id: string
  userId: string
  items: CartItem[]
  total: number
  deliveryAddress: string
  status: "pending" | "confirmed" | "preparing" | "on-the-way" | "delivered" | "cancelled"
  createdAt: Timestamp
  updatedAt?: Timestamp
  userEmail?: string
  userName?: string
  restaurantId?: string
  restaurantName?: string
  estimatedDeliveryTime?: Timestamp
}

export const fetchAllOrdersAdmin = async (): Promise<AdminOrder[]> => {
  try {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AdminOrder[]

    // Fetch user details for each order
    const ordersWithUserDetails = await Promise.all(
      orders.map(async (order) => {
        try {
          const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", order.userId)))
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data()
            return {
              ...order,
              userEmail: userData.email,
              userName: userData.name,
            }
          }
        } catch (error) {
          console.error("Error fetching user details:", error)
        }
        return order
      }),
    )

    return ordersWithUserDetails
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw new Error("Failed to fetch orders")
  }
}

export const updateOrderStatus = async (
  orderId: string,
  status: AdminOrder["status"],
  estimatedDeliveryTime?: Date,
): Promise<void> => {
  try {
    const orderRef = doc(db, "orders", orderId)
    const updateData: any = {
      status,
      updatedAt: Timestamp.now(),
    }

    if (estimatedDeliveryTime) {
      updateData.estimatedDeliveryTime = Timestamp.fromDate(estimatedDeliveryTime)
    }

    await updateDoc(orderRef, updateData)
  } catch (error) {
    console.error("Error updating order status:", error)
    throw new Error("Failed to update order status")
  }
}

export const updateOrderDeliveryAddress = async (orderId: string, deliveryAddress: string): Promise<void> => {
  try {
    const orderRef = doc(db, "orders", orderId)
    await updateDoc(orderRef, {
      deliveryAddress,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error("Error updating delivery address:", error)
    throw new Error("Failed to update delivery address")
  }
}

export const fetchOrdersByStatus = async (status: AdminOrder["status"]): Promise<AdminOrder[]> => {
  try {
    const q = query(collection(db, "orders"), where("status", "==", status), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AdminOrder[]
    return orders
  } catch (error) {
    console.error("Error fetching orders by status:", error)
    throw new Error("Failed to fetch orders")
  }
}

export const getOrderStats = async () => {
  try {
    const allOrders = await fetchAllOrdersAdmin()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTimestamp = Timestamp.fromDate(today)

    const stats = {
      total: allOrders.length,
      pending: allOrders.filter((order) => order.status === "pending").length,
      confirmed: allOrders.filter((order) => order.status === "confirmed").length,
      preparing: allOrders.filter((order) => order.status === "preparing").length,
      onTheWay: allOrders.filter((order) => order.status === "on-the-way").length,
      delivered: allOrders.filter((order) => order.status === "delivered").length,
      cancelled: allOrders.filter((order) => order.status === "cancelled").length,
      todayOrders: allOrders.filter((order) => order.createdAt.seconds >= todayTimestamp.seconds).length,
      totalRevenue: allOrders
        .filter((order) => order.status === "delivered")
        .reduce((sum, order) => sum + order.total, 0),
    }

    return stats
  } catch (error) {
    console.error("Error getting order stats:", error)
    throw new Error("Failed to get order statistics")
  }
}
