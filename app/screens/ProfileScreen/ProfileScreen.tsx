"use client";

import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AuthContext } from "../../contexts/auth/AuthContext";

export default function ProfileScreen() {
  const { user } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.profileCard}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{user.name || user.email}</Text>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
          {/* Add more fields as needed */}
        </View>
      ) : (
        <Text style={styles.subtitle}>Not logged in.</Text>
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
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    elevation: 2,
  },
  label: {
    fontWeight: "bold",
    marginTop: 8,
  },
  value: {
    marginBottom: 8,
  },
});
