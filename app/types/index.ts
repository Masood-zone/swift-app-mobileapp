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
}
