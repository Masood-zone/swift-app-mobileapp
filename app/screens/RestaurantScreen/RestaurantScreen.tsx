"use client";

import type React from "react";
import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CartContext } from "../../contexts/cart";
import { fetchMenuItems } from "../../services/menu";
import type { Restaurant, MenuItem } from "../../types";
import FoodItem from "@/app/components/FoodItem/FoodItem";

type RootStackParamList = {
  Restaurant: { restaurant: Restaurant };
  Cart: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Restaurant">;

export default function RestaurantScreen({ route, navigation }: Props) {
  const { restaurant } = route.params;
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { cart } = useContext(CartContext);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const data = await fetchMenuItems(restaurant.id);
        setMenu(data);
      } catch (error) {
        console.error("Error loading menu:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [restaurant.id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <View style={styles.container}>
      <Image source={{ uri: restaurant.image }} style={styles.headerImage} />
      <View style={styles.header}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <Text style={styles.info}>
          {restaurant.cuisine} • {restaurant.deliveryTime} min • Ghc
          {restaurant.deliveryFee}
        </Text>
      </View>

      <FlatList
        data={menu}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FoodItem item={item} />}
        contentContainerStyle={styles.menuList}
      />

      {cartItemCount > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate("Cart")}
        >
          <Text style={styles.cartButtonText}>View Cart ({cartItemCount})</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  headerImage: {
    width: "100%",
    height: 200,
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
  },
  info: {
    fontSize: 16,
    color: "gray",
    marginTop: 5,
  },
  menuList: {
    paddingBottom: 70,
  },
  cartButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#FF6B6B",
    borderRadius: 25,
    padding: 15,
    alignItems: "center",
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cartButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
