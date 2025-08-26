import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useAdmin } from "../../hooks/useAdmin"
import { Ionicons } from "@expo/vector-icons"

export function AdminDashboardScreen() {
  const navigation = useNavigation()
  const { adminUser, canManageRestaurants, canManageMenus, canManageOrders, canManageUsers } = useAdmin()

  const dashboardItems = [
    {
      title: "Manage Restaurants",
      description: "Create, edit, and delete restaurants",
      icon: "restaurant" as const,
      onPress: () => navigation.navigate("RestaurantManagement" as never),
      enabled: canManageRestaurants,
    },
    {
      title: "Manage Menu Items",
      description: "Add and edit menu items for restaurants",
      icon: "fast-food" as const,
      onPress: () => navigation.navigate("MenuManagement" as never),
      enabled: canManageMenus,
    },
    {
      title: "Track Orders",
      description: "Monitor and update order statuses",
      icon: "receipt" as const,
      onPress: () => navigation.navigate("OrderTracking" as never),
      enabled: canManageOrders,
    },
    {
      title: "Manage Users",
      description: "View and manage user accounts",
      icon: "people" as const,
      onPress: () => navigation.navigate("UserManagement" as never),
      enabled: canManageUsers,
    },
  ]

  const handleItemPress = (item: (typeof dashboardItems)[0]) => {
    if (!item.enabled) {
      Alert.alert("Access Denied", "You don't have permission to access this feature.")
      return
    }
    item.onPress()
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {adminUser?.name || "Admin"}</Text>
        <Text style={styles.subtitleText}>Admin Dashboard</Text>
      </View>

      <View style={styles.grid}>
        {dashboardItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.dashboardItem, !item.enabled && styles.disabledItem]}
            onPress={() => handleItemPress(item)}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={item.icon} size={32} color={item.enabled ? "#2563eb" : "#9ca3af"} />
            </View>
            <Text style={[styles.itemTitle, !item.enabled && styles.disabledText]}>{item.title}</Text>
            <Text style={[styles.itemDescription, !item.enabled && styles.disabledText]}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    padding: 20,
    backgroundColor: "#2563eb",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: "#e2e8f0",
  },
  grid: {
    padding: 16,
    gap: 16,
  },
  dashboardItem: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledItem: {
    opacity: 0.6,
  },
  iconContainer: {
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  disabledText: {
    color: "#9ca3af",
  },
})
