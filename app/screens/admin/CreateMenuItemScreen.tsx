"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Image } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Picker } from "@react-native-picker/picker"
import * as ImagePicker from "expo-image-picker"
import { Ionicons } from "@expo/vector-icons"
import { createMenuItem, updateMenuItem, uploadMenuItemImage } from "../../services/admin/menu"
import { fetchAllRestaurantsAdmin } from "../../services/admin/restaurants"
import type { MenuItem, Restaurant } from "../../types"

interface RouteParams {
  menuItem?: MenuItem
}

const CATEGORIES = ["Appetizers", "Main Course", "Desserts", "Beverages", "Salads", "Soups", "Sides", "Specials"]

export function CreateMenuItemScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { menuItem } = (route.params as RouteParams) || {}
  const isEditing = !!menuItem

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [formData, setFormData] = useState({
    name: menuItem?.name || "",
    description: menuItem?.description || "",
    price: menuItem?.price?.toString() || "",
    category: menuItem?.category || "",
    restaurantId: menuItem?.restaurantId || "",
    image: menuItem?.image || "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadRestaurants()
  }, [])

  const loadRestaurants = async () => {
    try {
      const data = await fetchAllRestaurantsAdmin()
      setRestaurants(data)
      // Set first restaurant as default if creating new item
      if (!isEditing && data.length > 0 && !formData.restaurantId) {
        setFormData((prev) => ({ ...prev, restaurantId: data[0].id }))
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load restaurants")
    }
  }

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant camera roll permissions to upload images.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setFormData((prev) => ({ ...prev, image: result.assets[0].uri }))
    }
  }

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.description.trim() || !formData.price.trim() || !formData.restaurantId) {
      Alert.alert("Validation Error", "Please fill in all required fields.")
      return
    }

    const price = Number.parseFloat(formData.price)
    if (Number.isNaN(price) || price <= 0) {
      Alert.alert("Validation Error", "Please enter a valid price.")
      return
    }

    setLoading(true)
    try {
      const menuItemData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price,
        category: formData.category || undefined,
        restaurantId: formData.restaurantId,
        image: formData.image,
      }

      if (isEditing && menuItem) {
        // Upload new image if changed
        if (formData.image && formData.image !== menuItem.image) {
          const imageUrl = await uploadMenuItemImage(formData.image, menuItem.id)
          menuItemData.image = imageUrl
        }
        await updateMenuItem(menuItem.id, menuItemData)
        Alert.alert("Success", "Menu item updated successfully")
      } else {
        const menuItemId = await createMenuItem(menuItemData)
        // Upload image if provided
        if (formData.image) {
          const imageUrl = await uploadMenuItemImage(formData.image, menuItemId)
          await updateMenuItem(menuItemId, { image: imageUrl })
        }
        Alert.alert("Success", "Menu item created successfully")
      }

      navigation.goBack()
    } catch (error) {
      Alert.alert("Error", `Failed to ${isEditing ? "update" : "create"} menu item`)
    } finally {
      setLoading(false)
    }
  }

  const getRestaurantName = (restaurantId: string) => {
    const restaurant = restaurants.find((r) => r.id === restaurantId)
    return restaurant?.name || "Select Restaurant"
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.imageSection}>
          <Text style={styles.label}>Menu Item Image</Text>
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
          <Text style={styles.label}>Restaurant *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.restaurantId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, restaurantId: value }))}
              style={styles.picker}
            >
              <Picker.Item label="Select Restaurant" value="" />
              {restaurants.map((restaurant) => (
                <Picker.Item key={restaurant.id} label={restaurant.name} value={restaurant.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Item Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
            placeholder="Enter menu item name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
            placeholder="Describe the menu item"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Price ($) *</Text>
            <TextInput
              style={styles.input}
              value={formData.price}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, price: text }))}
              placeholder="9.99"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                style={styles.picker}
              >
                <Picker.Item label="Select Category" value="" />
                {CATEGORIES.map((category) => (
                  <Picker.Item key={category} label={category} value={category} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Saving..." : isEditing ? "Update Menu Item" : "Create Menu Item"}
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
    width: 200,
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
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
  },
  picker: {
    height: 50,
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
