import { createStackNavigator } from "@react-navigation/stack";
import type React from "react";
import { useContext } from "react";
import { AuthContext } from "../contexts/auth";
import { LoadingScreen } from "../screens";
import { AdminStack } from "./AdminStack";
import { AuthStack } from "./AuthStack";
import { MainStack } from "./MainStack";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, loading, isAdmin } = useContext(AuthContext);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          isAdmin ? (
            <Stack.Screen name="Admin" component={AdminStack} />
          ) : (
            <Stack.Screen name="Main" component={MainStack} />
          )
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </>
  );
}
