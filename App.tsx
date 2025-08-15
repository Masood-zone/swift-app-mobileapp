import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import "./styles/globals.css";
import AuthProvider from "./app/contexts/auth/AuthContext";
import CartProvider from "./app/contexts/cart/CartContext";
import { AppNavigator } from "./app/navigation";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}
