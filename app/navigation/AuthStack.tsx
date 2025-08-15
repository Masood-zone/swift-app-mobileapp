"use client";

import type React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ForgotPasswordScreen, LoginScreen, RegisterScreen } from "../screens";

const Stack = createStackNavigator();

export const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};
