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
      <Stack.Screen
        name="Restaurant"
        component={RestaurantScreen}
        options={{
          headerShown: true,
          headerTitle: "Restaurant",
        }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{
          headerShown: true,
          headerTitle: "Cart",
        }}
      />
      <Stack.Screen
        name="OrderReview"
        component={OrderReviewScreen}
        options={{
          headerShown: true,
          headerTitle: "Order Review",
        }}
      />
      <Stack.Screen
        name="ConfirmOrder"
        component={ConfirmOrderScreen}
        options={{
          headerShown: true,
          headerTitle: "Confirm Order",
        }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          headerShown: true,
          headerTitle: "Checkout",
        }}
      />
      <Stack.Screen
        name="OrderTracking"
        component={OrderTrackingScreen}
        options={{
          headerShown: true,
          headerTitle: "Order Tracking",
        }}
      />
    </Stack.Navigator>
  );
};
