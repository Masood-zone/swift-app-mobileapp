"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Picker } from "@react-native-picker/picker"
import { Ionicons } from "@expo/vector-icons"
import { fetchAllMenuItemsAdmin, deleteMenuItem } from "../../services/admin/menu"
import { fetchAllRestaurantsAdmin } from "../../services/admin/restaurants"
import type { MenuItem, Restaurant } from "../../types"

export function MenuManagementScreen() {
  const navigation = useNavigation()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      const [menuData, restaurantData] = await Promise.all([fetchAllMenuItemsAdmin(), fetchAllRestaurantsAdmin()])
      setMenuItems(menuData)
      setRestaurants(restaurantData)
      setFilteredItems(menuData)
    } catch (error) {
      Alert.alert("Error", "Failed to load menu items")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedRestaurant === "all") {
      setFilteredItems(menuItems)
    } else {
      setFilteredItems(menuItems.filter((item) => item.restaurantId === selectedRestaurant))
    }
  }, [selectedRestaurant, menuItems])

  const handleRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const handleDeleteMenuItem = (menuItem: MenuItem) => {
    Alert.alert(
      "Delete Menu Item",
      `Are you sure you want to delete "${menuItem.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMenuItem(menuItem.id)
              setMenuItems((prev) => prev.filter((item) => item.id !== menuItem.id))
              Alert.alert("Success", "Menu item deleted successfully")
            } catch (error) {
              Alert.alert("Error", "Failed to delete menu item")
            }
          },
        },
      ],
    )
  }

  const getRestaurantName = (restaurantId: string) => {
    const restaurant = restaurants.find((r) => r.id === restaurantId)
    return restaurant?.name || "Unknown Restaurant"
  }

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuItemCard}>
      <Image source={{ uri: item.image || "/generic-food-item.png" }} style={styles.menuItemImage} />
      <View style={styles.menuItemInfo}>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <Text style={styles.restaurantName}>{getRestaurantName(item.restaurantId)}</Text>
        <Text style={styles.menuItemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.menuItemDetails}>
          <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
          {item.category && <Text style={styles.categoryText}>{item.category}</Text>}
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("CreateMenuItem" as never, { menuItem: item } as never)}
        >
          <Ionicons name="pencil" size={20} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteMenuItem(item)}>
          <Ionicons name="trash" size={20} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by Restaurant:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedRestaurant}
              onValueChange={(value) => setSelectedRestaurant(value)}
              style={styles.picker}
            >
              <Picker.Item label="All Restaurants" value="all" />
              {restaurants.map((restaurant) => (
                <Picker.Item key={restaurant.id} label={restaurant.name} value={restaurant.id} />
              ))}
            </Picker>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("CreateMenuItem" as never)}>
          <Ionicons name="add" size={24} color="#ffffff" />
          <Text style={styles.addButtonText}>Add Menu Item</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="fast-food" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No menu items found</Text>
            <Text style={styles.emptySubtext}>Add your first menu item to get started</Text>
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
    gap: 12,
  },
  filterContainer: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  pickerContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  picker: {
    height: 40,
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
  menuItemCard: {
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
  menuItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  restaurantName: {
    fontSize: 12,
    color: "#2563eb",
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  menuItemDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#059669",
  },
  categoryText: {
    fontSize: 12,
    color: "#9ca3af",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
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
