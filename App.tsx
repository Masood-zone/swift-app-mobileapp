// Migrated App.tsx from sample
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/contexts/auth/AuthProvider";
import { CartProvider } from "./src/contexts/cart/CartProvider";
import "./styles/globals.css";

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
