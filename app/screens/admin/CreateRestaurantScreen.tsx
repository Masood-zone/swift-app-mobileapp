"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Image } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import * as ImagePicker from "expo-image-picker"
import { Ionicons } from "@expo/vector-icons"
import { createRestaurant, updateRestaurant, uploadRestaurantImage } from "../../services/admin/restaurants"
import type { Restaurant } from "../../types"

interface RouteParams {
  restaurant?: Restaurant
}

export function CreateRestaurantScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { restaurant } = (route.params as RouteParams) || {}
  const isEditing = !!restaurant

  const [formData, setFormData] = useState({
    name: restaurant?.name || "",
    cuisine: restaurant?.cuisine || "",
    deliveryTime: restaurant?.deliveryTime?.toString() || "",
    deliveryFee: restaurant?.deliveryFee?.toString() || "",
    rating: restaurant?.rating?.toString() || "",
    image: restaurant?.image || "",
  })
  const [loading, setLoading] = useState(false)

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant camera roll permissions to upload images.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    })

    if (!result.canceled) {
      setFormData((prev) => ({ ...prev, image: result.assets[0].uri }))
    }
  }

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.cuisine.trim()) {
      Alert.alert("Validation Error", "Please fill in all required fields.")
      return
    }

    setLoading(true)
    try {
      const restaurantData = {
        name: formData.name.trim(),
        cuisine: formData.cuisine.trim(),
        deliveryTime: Number.parseInt(formData.deliveryTime) || 30,
        deliveryFee: Number.parseFloat(formData.deliveryFee) || 0,
        rating: formData.rating ? Number.parseFloat(formData.rating) : undefined,
        image: formData.image,
      }

      if (isEditing && restaurant) {
        // Upload new image if changed
        if (formData.image && formData.image !== restaurant.image) {
          const imageUrl = await uploadRestaurantImage(formData.image, restaurant.id)
          restaurantData.image = imageUrl
        }
        await updateRestaurant(restaurant.id, restaurantData)
        Alert.alert("Success", "Restaurant updated successfully")
      } else {
        const restaurantId = await createRestaurant(restaurantData)
        // Upload image if provided
        if (formData.image) {
          const imageUrl = await uploadRestaurantImage(formData.image, restaurantId)
          await updateRestaurant(restaurantId, { image: imageUrl })
        }
        Alert.alert("Success", "Restaurant created successfully")
      }

      navigation.goBack()
    } catch (error) {
      Alert.alert("Error", `Failed to ${isEditing ? "update" : "create"} restaurant`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.imageSection}>
          <Text style={styles.label}>Restaurant Image</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={handleImagePicker}>
            {formData.image ? (
              <Image source={{ uri: formData.image }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={32} color="#9ca3af" />
                <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Restaurant Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
            placeholder="Enter restaurant name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cuisine Type *</Text>
          <TextInput
            style={styles.input}
            value={formData.cuisine}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, cuisine: text }))}
            placeholder="e.g., Italian, Chinese, Mexican"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Delivery Time (min)</Text>
            <TextInput
              style={styles.input}
              value={formData.deliveryTime}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, deliveryTime: text }))}
              placeholder="30"
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Delivery Fee ($)</Text>
            <TextInput
              style={styles.input}
              value={formData.deliveryFee}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, deliveryFee: text }))}
              placeholder="2.99"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Rating (1-5)</Text>
          <TextInput
            style={styles.input}
            value={formData.rating}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, rating: text }))}
            placeholder="4.5"
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Saving..." : isEditing ? "Update Restaurant" : "Create Restaurant"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  form: {
    padding: 16,
    gap: 20,
  },
  imageSection: {
    alignItems: "center",
  },
  imagePicker: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: "#9ca3af",
    fontSize: 14,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
})
