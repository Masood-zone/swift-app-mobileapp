import { theme } from "@/app/constants";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createMenuItem, updateMenuItem } from "../../services/admin/menu";
import { fetchAllRestaurantsAdmin } from "../../services/admin/restaurants";
import type { MenuItem, Restaurant } from "../../types";

interface RouteParams {
  menuItem?: MenuItem;
}

const CATEGORIES = [
  "Appetizers",
  "Main Course",
  "Desserts",
  "Beverages",
  "Salads",
  "Soups",
  "Sides",
  "Specials",
];

export function CreateMenuItemScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { menuItem } = (route.params as RouteParams) || {};
  const isEditing = !!menuItem;

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [formData, setFormData] = useState({
    name: menuItem?.name || "",
    description: menuItem?.description || "",
    price: menuItem?.price?.toString() || "",
    category: menuItem?.category || "",
    restaurantId: menuItem?.restaurantId || "",
    image: menuItem?.image || "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const data = await fetchAllRestaurantsAdmin();
      setRestaurants(data);
      // Set first restaurant as default if creating new item
      if (!isEditing && data.length > 0 && !formData.restaurantId) {
        setFormData((prev) => ({ ...prev, restaurantId: data[0].id }));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load restaurants");
    }
  };

  const validateImageUrl = (url: string) => {
    if (!url) return true; // Empty URL is allowed
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.price.trim() ||
      !formData.restaurantId
    ) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }

    const price = Number.parseFloat(formData.price);
    if (Number.isNaN(price) || price <= 0) {
      Alert.alert("Validation Error", "Please enter a valid price.");
      return;
    }

    if (formData.image && !validateImageUrl(formData.image)) {
      Alert.alert("Validation Error", "Please enter a valid image URL.");
      return;
    }

    setLoading(true);
    try {
      const menuItemData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price,
        category: formData.category || undefined,
        restaurantId: formData.restaurantId,
        image: formData.image.trim() || undefined,
      };

      if (isEditing && menuItem) {
        await updateMenuItem(menuItem.id, menuItemData);
        Alert.alert("Success", "Menu item updated successfully");
      } else {
        await createMenuItem(menuItemData);
        Alert.alert("Success", "Menu item created successfully");
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Error",
        `Failed to ${isEditing ? "update" : "create"} menu item`
      );
    } finally {
      setLoading(false);
    }
  };

  const getRestaurantName = (restaurantId: string) => {
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    return restaurant?.name || "Select Restaurant";
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.form}>
        <View style={styles.imageSection}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Menu Item Image URL
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={formData.image}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, image: text }))
            }
            placeholder="Enter image URL (optional)"
            placeholderTextColor={theme.colors.textSecondary}
          />
          {formData.image && validateImageUrl(formData.image) && (
            <View style={styles.imagePreview}>
              <Image
                source={{ uri: formData.image }}
                style={styles.previewImage}
              />
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Restaurant *
          </Text>
          <View
            style={[
              styles.pickerContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Picker
              selectedValue={formData.restaurantId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, restaurantId: value }))
              }
              style={styles.picker}
            >
              <Picker.Item label="Select Restaurant" value="" />
              {restaurants.map((restaurant) => (
                <Picker.Item
                  key={restaurant.id}
                  label={restaurant.name}
                  value={restaurant.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Item Name *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={formData.name}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, name: text }))
            }
            placeholder="Enter menu item name"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Description *
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={formData.description}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, description: text }))
            }
            placeholder="Describe the menu item"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Price (Ghc) *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              value={formData.price}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, price: text }))
              }
              placeholder="9.99"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Category
            </Text>
            <View
              style={[
                styles.pickerContainer,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Picker
                selectedValue={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
                style={styles.picker}
              >
                <Picker.Item label="Select Category" value="" />
                {CATEGORIES.map((category) => (
                  <Picker.Item
                    key={category}
                    label={category}
                    value={category}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: theme.colors.primary },
            loading && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading
              ? "Saving..."
              : isEditing
              ? "Update Menu Item"
              : "Create Menu Item"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  imageSection: {
    gap: theme.spacing.sm,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    alignSelf: "center",
    marginTop: theme.spacing.sm,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  inputGroup: {
    gap: theme.spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: theme.spacing.md,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  submitButton: {
    padding: theme.spacing.lg,
    borderRadius: 8,
    alignItems: "center",
    marginTop: theme.spacing.lg,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
