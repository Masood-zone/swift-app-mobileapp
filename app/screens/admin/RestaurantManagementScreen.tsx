import { theme } from "@/app/constants";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  deleteRestaurant,
  fetchAllRestaurantsAdmin,
} from "../../services/admin/restaurants";
import type { Restaurant } from "../../types";

export function RestaurantManagementScreen() {
  const navigation = useNavigation();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRestaurants = async () => {
    try {
      const data = await fetchAllRestaurantsAdmin();
      setRestaurants(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load restaurants");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRestaurants();
  };

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
              await deleteRestaurant(restaurant.id);
              setRestaurants((prev) =>
                prev.filter((r) => r.id !== restaurant.id)
              );
              Alert.alert("Success", "Restaurant deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete restaurant");
            }
          },
        },
      ]
    );
  };

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
          onPress={() =>
            navigation.navigate(
              "CreateRestaurant" as never,
              { restaurant: item } as never
            )
          }
        >
          <Ionicons name="pencil" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteRestaurant(item)}
        >
          <Ionicons name="trash" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CreateRestaurant" as never)}
        >
          <Ionicons name="add" size={24} color={theme.colors.surface} />
          <Text style={styles.addButtonText}>Add Restaurant</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={restaurants}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="restaurant"
              size={64}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.emptyText}>No restaurants found</Text>
            <Text style={styles.emptySubtext}>
              Add your first restaurant to get started
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.sm,
    borderRadius: 8,
    gap: theme.spacing.xs,
  },
  addButtonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  list: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  restaurantCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
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
    marginRight: theme.spacing.sm,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  restaurantDetails: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  detailText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  editButton: {
    padding: theme.spacing.xs,
    borderRadius: 6,
    backgroundColor: theme.colors.background,
  },
  deleteButton: {
    padding: theme.spacing.xs,
    borderRadius: 6,
    backgroundColor: "#fef2f2",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
});
