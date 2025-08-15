import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { CartContext } from "../../contexts/cart/CartContext";
import { AuthContext } from "../../contexts/auth/AuthContext";
import { createOrder } from "../../services/orders";

export default function OrderReviewScreen({ navigation, route }: any) {
  const { cart, totalPrice, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { address } = route.params || {};
  const [paymentMethod, setPaymentMethod] = useState<string>("Mobile Money");
  const [loading, setLoading] = useState(false);

  const handleConfirmOrder = async () => {
    if (!user) {
      Alert.alert("Not logged in", "Please log in to place an order.");
      return;
    }
    setLoading(true);
    try {
      await createOrder({
        userId: user.uid,
        items: cart,
        total: totalPrice,
        deliveryAddress: address,
      });
      clearCart();
      navigation.replace("ConfirmOrder", { paymentMethod });
    } catch (error: any) {
      Alert.alert("Order failed", error.message || "Could not place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Review</Text>
      <Text style={styles.sectionTitle}>Delivery Address</Text>
      <Text style={styles.value}>{address}</Text>
      <Text style={styles.sectionTitle}>Payment Method</Text>
      <View style={styles.paymentRow}>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === "Mobile Money" && styles.selectedOption,
          ]}
          onPress={() => setPaymentMethod("Mobile Money")}
        >
          <Text>Mobile Money</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === "Bank Card" && styles.selectedOption,
          ]}
          onPress={() => setPaymentMethod("Bank Card")}
        >
          <Text>Bank Card</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Cart Items</Text>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>
              ${item.price} x {item.quantity}
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      <Text style={styles.total}>Total: Ghc{totalPrice.toFixed(2)}</Text>
      <TouchableOpacity
        style={styles.confirmBtn}
        onPress={handleConfirmOrder}
        disabled={loading}
      >
        <Text style={styles.confirmText}>
          {loading ? "Placing Order..." : "Confirm Order"}
        </Text>
      </TouchableOpacity>
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
  sectionTitle: {
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 4,
  },
  value: {
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  paymentOption: {
    backgroundColor: "#eee",
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
  },
  selectedOption: {
    borderColor: "#FF6B6B",
    borderWidth: 2,
  },
  cartItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
  },
  itemName: {
    fontWeight: "bold",
  },
  itemPrice: {
    color: "#666",
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 12,
    textAlign: "right",
  },
  confirmBtn: {
    width: "100%",
    height: 48,
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
