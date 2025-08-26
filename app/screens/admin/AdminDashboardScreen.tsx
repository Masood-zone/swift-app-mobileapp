import { theme } from "@/app/constants";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAdmin } from "../../hooks/useAdmin";

export function AdminDashboardScreen() {
  const navigation = useNavigation();
  const { adminUser, isAdmin } = useAdmin();

  const dashboardItems = [
    {
      title: "Manage Restaurants",
      description: "Create, edit, and delete restaurants",
      icon: "restaurant" as const,
      onPress: () => navigation.navigate("RestaurantManagement" as never),
    },
    {
      title: "Manage Menu Items",
      description: "Add and edit menu items for restaurants",
      icon: "fast-food" as const,
      onPress: () => navigation.navigate("MenuManagement" as never),
    },
    {
      title: "Track Orders",
      description: "Monitor and update order statuses",
      icon: "receipt" as const,
      onPress: () => navigation.navigate("OrderTracking" as never),
    },
    {
      title: "Manage Users",
      description: "View and manage user accounts",
      icon: "people" as const,
      onPress: () => navigation.navigate("UserManagement" as never),
    },
  ];

  const handleItemPress = (item: (typeof dashboardItems)[0]) => {
    item.onPress();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {adminUser?.name || "Admin"}
        </Text>
        <Text style={styles.subtitleText}>Admin Dashboard</Text>
      </View>

      <View style={styles.grid}>
        {dashboardItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dashboardItem}
            onPress={() => handleItemPress(item)}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={item.icon}
                size={32}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
  },
  welcomeText: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.surface,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.surface,
    opacity: 0.8,
  },
  grid: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  dashboardItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
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
  iconContainer: {
    marginBottom: theme.spacing.sm,
  },
  itemTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
});
