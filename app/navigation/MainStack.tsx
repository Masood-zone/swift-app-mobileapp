"use client";

import type React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { BottomTabNavigator } from "./BottomTabNavigator";
import {
  CartScreen,
  CheckoutScreen,
  OrderTrackingScreen,
  RestaurantScreen,
} from "../screens";

const Stack = createStackNavigator();

export const MainStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Tabs" component={BottomTabNavigator} />
      <Stack.Screen name="Restaurant" component={RestaurantScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    </Stack.Navigator>
  );
};
