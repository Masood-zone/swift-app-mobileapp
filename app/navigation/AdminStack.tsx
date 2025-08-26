import { createStackNavigator } from "@react-navigation/stack"
import { AdminDashboardScreen } from "../screens/admin/AdminDashboardScreen"
import { RestaurantManagementScreen } from "../screens/admin/RestaurantManagementScreen"
import { MenuManagementScreen } from "../screens/admin/MenuManagementScreen"
import { OrderTrackingScreen } from "../screens/admin/OrderTrackingScreen"
import { UserManagementScreen } from "../screens/admin/UserManagementScreen"
import { CreateRestaurantScreen } from "../screens/admin/CreateRestaurantScreen"
import { CreateMenuItemScreen } from "../screens/admin/CreateMenuItemScreen"

const Stack = createStackNavigator()

export function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#2563eb",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: "Admin Dashboard" }} />
      <Stack.Screen
        name="RestaurantManagement"
        component={RestaurantManagementScreen}
        options={{ title: "Manage Restaurants" }}
      />
      <Stack.Screen
        name="CreateRestaurant"
        component={CreateRestaurantScreen}
        options={{ title: "Create Restaurant" }}
      />
      <Stack.Screen name="MenuManagement" component={MenuManagementScreen} options={{ title: "Manage Menu Items" }} />
      <Stack.Screen name="CreateMenuItem" component={CreateMenuItemScreen} options={{ title: "Create Menu Item" }} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ title: "Track Orders" }} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} options={{ title: "Manage Users" }} />
    </Stack.Navigator>
  )
}
