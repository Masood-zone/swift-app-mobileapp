"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { fetchAllRestaurantsAdmin, deleteRestaurant } from "../../services/admin/restaurants"
import type { Restaurant } from "../../types"

export function RestaurantManagementScreen() {
  const navigation = useNavigation()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadRestaurants = async () => {
    try {
      const data = await fetchAllRestaurantsAdmin()
      setRestaurants(data)
    } catch (error) {
      Alert.alert("Error", "Failed to load restaurants")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadRestaurants()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    loadRestaurants()
  }

  const handleDeleteRestaurant = (restaurant: Restaurant) => {
    Alert.alert(
      "Delete Restaurant",
      `Are you sure you want to delete "${restaurant.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRestaurant(restaurant.id)
              setRestaurants((prev) => prev.filter((r) => r.id !== restaurant.id))
              Alert.alert("Success", "Restaurant deleted successfully")
            } catch (error) {
              Alert.alert("Error", "Failed to delete restaurant")
            }
          },
        },
      ],
    )
  }

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <View style={styles.restaurantCard}>
      <Image source={{ uri: item.image }} style={styles.restaurantImage} />
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.restaurantCuisine}>{item.cuisine}</Text>
        <View style={styles.restaurantDetails}>
          <Text style={styles.detailText}>⭐ {item.rating || "N/A"}</Text>
          <Text style={styles.detailText}>🚚 {item.deliveryTime} min</Text>
          <Text style={styles.detailText}>💰 ${item.deliveryFee}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("CreateRestaurant" as never, { restaurant: item } as never)}
        >
          <Ionicons name="pencil" size={20} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteRestaurant(item)}>
          <Ionicons name="trash" size={20} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("CreateRestaurant" as never)}>
          <Ionicons name="add" size={24} color="#ffffff" />
          <Text style={styles.addButtonText}>Add Restaurant</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={restaurants}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="restaurant" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No restaurants found</Text>
            <Text style={styles.emptySubtext}>Add your first restaurant to get started</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  addButton: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  list: {
    padding: 16,
    gap: 12,
  },
  restaurantCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  restaurantDetails: {
    flexDirection: "row",
    gap: 12,
  },
  detailText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#eff6ff",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#fef2f2",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
})
