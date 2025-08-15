import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function ConfirmOrderScreen({ navigation, route }: any) {
  const { paymentMethod } = route.params || {};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Confirmed!</Text>
      <Text style={styles.subtitle}>Thank you for your order.</Text>
      <Text style={styles.info}>Payment Method: {paymentMethod}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.popToTop()}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
