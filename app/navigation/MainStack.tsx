"use client";

import type React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  CartScreen,
  CheckoutScreen,
  OrderTrackingScreen,
  RestaurantScreen,
  OrderReviewScreen,
  ConfirmOrderScreen,
} from "../screens";
import BottomTabNavigator from "./BottomTabNavigator";

const Stack = createStackNavigator();

export const MainStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerTitle: "Swift App",
      }}
    >
      <Stack.Screen name="Tabs" component={BottomTabNavigator} />
      <Stack.Screen name="Restaurant" component={RestaurantScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="OrderReview" component={OrderReviewScreen} />
      <Stack.Screen name="ConfirmOrder" component={ConfirmOrderScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    </Stack.Navigator>
  );
};
