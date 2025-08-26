export interface Restaurant {
  id: string
  name: string
  cuisine: string
  image: string
  deliveryTime: number
  deliveryFee: number
  rating?: number
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image?: string
  category?: string
  restaurantId: string
}

export interface User {
  uid: string
  email: string
  name?: string
  displayName?: string
  role?: "user" | "admin"
  isAdmin?: boolean
}

export interface Order {
  id: string
  userId: string
  restaurantId: string
  items: OrderItem[]
  totalAmount: number
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
  deliveryAddress: {
    street: string
    city: string
    zipCode: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  createdAt: Date
  updatedAt: Date
  estimatedDeliveryTime?: Date
}

export interface OrderItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  specialInstructions?: string
}

export interface AdminUser extends User {
  role: "admin"
  isAdmin: true
  adminPermissions: {
    canManageRestaurants: boolean
    canManageMenus: boolean
    canManageOrders: boolean
    canManageUsers: boolean
  }
}
