import React from "react";
import AppNavigator from "./navigation/AppNavigator";
import AuthProvider from "./contexts/auth/AuthContext";
import CartProvider from "./contexts/cart/CartContext";

export default function Index() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppNavigator />
      </CartProvider>
    </AuthProvider>
  );
}
