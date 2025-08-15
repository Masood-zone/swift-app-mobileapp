"use client";

import type React from "react";
import { useContext } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { CartContext } from "../../contexts/cart";
import type { MenuItem } from "../../types";

interface FoodItemProps {
  item: MenuItem;
}

export default function FoodItem({ item }: FoodItemProps) {
  const { addToCart } = useContext(CartContext);

  const handleAddToCart = () => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      description: item.description,
    });
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    margin: 5,
    padding: 10,
    alignItems: "center",
    elevation: 2,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  info: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
  },
  description: {
    color: "gray",
    fontSize: 12,
    marginTop: 2,
  },
  price: {
    fontWeight: "bold",
    color: "#FF6B6B",
    marginTop: 5,
  },
  addButton: {
    backgroundColor: "#FF6B6B",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
