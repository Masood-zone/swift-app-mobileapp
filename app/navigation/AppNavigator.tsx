import type React from "react";
import { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthContext } from "../contexts/auth";
import { AuthStack } from "./AuthStack";
import { MainStack } from "./MainStack";
import { LoadingScreen } from "../screens";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </>
  );
}
