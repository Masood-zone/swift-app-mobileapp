"use client";

import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  // ActivityIndicator,
} from "react-native";
import { CartContext } from "../../contexts/cart/CartContext";
import { AuthContext } from "../../contexts/auth/AuthContext";
// import { createOrder } from "../../services/orders";

export default function CartScreen({ navigation }: any) {
  const { cart, updateQuantity, removeFromCart, totalPrice } =
    useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [address, setAddress] = useState("");

  const handleProceedToReview = () => {
    if (!user) {
      Alert.alert("Not logged in", "Please log in to place an order.");
      return;
    }
    if (!address.trim()) {
      Alert.alert("Address required", "Please enter a delivery address.");
      return;
    }
    navigation.navigate("OrderReview", { address });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cart</Text>
      {cart.length === 0 ? (
        <Text style={styles.subtitle}>Your cart is empty.</Text>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <View style={styles.cartItemRow}>
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>
                      Ghc{item.price} x {item.quantity}
                    </Text>
                  </View>
                  <View style={styles.quantityRow}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                      style={styles.qtyBtn}
                    >
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      style={styles.qtyBtn}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => removeFromCart(item.id)}
                  style={styles.removeBtn}
                >
                  <Text style={styles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
          <Text style={styles.total}>Total: Ghc{totalPrice.toFixed(2)}</Text>
          <TextInput
            style={styles.input}
            placeholder="Delivery Address"
            value={address}
            onChangeText={setAddress}
          />
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={handleProceedToReview}
          >
            <Text style={styles.checkoutText}>Proceed to Review</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  cartItem: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cartItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartItemInfo: {
    flex: 1,
  },
  itemName: {
    fontWeight: "bold",
    fontSize: 17,
    color: "#222",
    marginBottom: 2,
  },
  itemPrice: {
    color: "#888",
    fontSize: 15,
    marginBottom: 2,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  qtyBtn: {
    backgroundColor: "#eee",
    borderRadius: 4,
    padding: 6,
    marginHorizontal: 4,
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  qtyText: {
    fontSize: 16,
    marginHorizontal: 8,
  },
  removeBtn: {
    marginLeft: 16,
  },
  removeBtnText: {
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 12,
    textAlign: "right",
  },
  input: {
    width: "100%",
    height: 48,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  checkoutBtn: {
    width: "100%",
    height: 48,
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
