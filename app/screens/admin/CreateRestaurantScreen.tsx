import { theme } from "@/app/constants";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
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
import {
  createRestaurant,
  updateRestaurant,
} from "../../services/admin/restaurants";
import type { Restaurant } from "../../types";

interface RouteParams {
  restaurant?: Restaurant;
}

export function CreateRestaurantScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { restaurant } = (route.params as RouteParams) || {};
  const isEditing = !!restaurant;

  const [formData, setFormData] = useState({
    name: restaurant?.name || "",
    cuisine: restaurant?.cuisine || "",
    deliveryTime: restaurant?.deliveryTime?.toString() || "",
    deliveryFee: restaurant?.deliveryFee?.toString() || "",
    rating: restaurant?.rating?.toString() || "",
    image: restaurant?.image || "",
  });
  const [loading, setLoading] = useState(false);

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
    if (!formData.name.trim() || !formData.cuisine.trim()) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }

    if (formData.image && !validateImageUrl(formData.image)) {
      Alert.alert("Validation Error", "Please enter a valid image URL.");
      return;
    }

    setLoading(true);
    try {
      const restaurantData = {
        name: formData.name.trim(),
        cuisine: formData.cuisine.trim(),
        deliveryTime: Number.parseInt(formData.deliveryTime) || 30,
        deliveryFee: Number.parseFloat(formData.deliveryFee) || 0,
        rating: formData.rating
          ? Number.parseFloat(formData.rating)
          : undefined,
        image: formData.image.trim() || undefined,
      };

      if (isEditing && restaurant) {
        await updateRestaurant(restaurant.id, restaurantData);
        Alert.alert("Success", "Restaurant updated successfully");
      } else {
        await createRestaurant(restaurantData);
        Alert.alert("Success", "Restaurant created successfully");
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Error",
        `Failed to ${isEditing ? "update" : "create"} restaurant`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.form}>
        <View style={styles.imageSection}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Restaurant Image URL
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
            Restaurant Name *
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
            placeholder="Enter restaurant name"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Cuisine Type *
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
            value={formData.cuisine}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, cuisine: text }))
            }
            placeholder="e.g., Italian, Chinese, Mexican"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Delivery Time (min)
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
              value={formData.deliveryTime}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, deliveryTime: text }))
              }
              placeholder="30"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Delivery Fee (Ghc)
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
              value={formData.deliveryFee}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, deliveryFee: text }))
              }
              placeholder="2.99"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Rating (1-5)
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
            value={formData.rating}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, rating: text }))
            }
            placeholder="4.5"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="decimal-pad"
          />
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
              ? "Update Restaurant"
              : "Create Restaurant"}
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
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
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
    borderRadius: 12,
    padding: theme.spacing.md,
    fontSize: 16,
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
    borderRadius: 12,
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
