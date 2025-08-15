"use client";

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
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.subtitle}>{error}</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders</Text>
      {orders.length === 0 ? (
        <Text style={styles.subtitle}>No orders found.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <Text style={styles.orderId}>Order #{item.id}</Text>
              <Text>Status: {item.status}</Text>
              <Text>Total: Ghc{item.totalAmount || item.total}</Text>
              <Text>
                Date:{" "}
                {item.createdAt?.toDate?.().toLocaleString?.() ||
                  item.createdAt}
              </Text>
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
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  orderId: {
    fontWeight: "bold",
    marginBottom: 4,
  },
});
