import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { AuthContext } from "../../contexts/auth/AuthContext";
import { fetchUserOrders } from "../../services/orders";

export default function OrdersScreen() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const loadOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchUserOrders(user.uid);
        setOrders(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>{error}</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <Text style={styles.subtitle}>No orders found.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{item.id}</Text>
                <Text
                  style={[
                    styles.status,
                    {
                      color:
                        item.status === "delivered"
                          ? "#27ae60"
                          : item.status === "pending"
                          ? "#f39c12"
                          : "#e74c3c",
                    },
                  ]}
                >
                  {item.status?.toUpperCase()}
                </Text>
              </View>
              <View style={styles.orderDetailsRow}>
                <Text style={styles.orderLabel}>Total:</Text>
                <Text style={styles.orderValue}>
                  Ghc{item.totalAmount || item.total}
                </Text>
              </View>
              <View style={styles.orderDetailsRow}>
                <Text style={styles.orderLabel}>Date:</Text>
                <Text style={styles.orderValue}>
                  {item.createdAt?.toDate?.().toLocaleString?.() ||
                    item.createdAt}
                </Text>
              </View>
            </View>
          )}
        />
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
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#222",
  },
  status: {
    fontWeight: "bold",
    fontSize: 14,
    textTransform: "uppercase",
  },
  orderDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  orderLabel: {
    color: "#888",
    fontWeight: "600",
  },
  orderValue: {
    color: "#222",
    fontWeight: "bold",
  },
});
