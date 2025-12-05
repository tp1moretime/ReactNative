import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AdminDashboard from './Admin/AdminDashboard';
import CategoryManagement from './Admin/CategoryManagement';
import ProductManagement from './Admin/ProductManagement';
import UserManagement from './Admin/UserManagement';
import CartScreen from './CartScreen';
import CategoriesScreen from './CategoriesScreen';
import ChangePassword from './ChangePassword';
import DetailsScreen from './DetailsScreen';
import EditProfile from "./EditProfile";
import HomeScreen from './HomeScreen';
import MyOrders from "./MyOrders";
import OrderHistory from './OrderHistory';
import ProductsByCategoryScreen from './ProductByCategoryScreen';
import ProfileScreen from './ProfileScreen';
import { HomeStackParamList } from './types';

// export type HomeStackParamList = {
//   Home: undefined;
//   Details: { product: { id: string; name: string; price: string; image: any } };
// };

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackScreen = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
      <Stack.Screen name="ProductsByCategory" component={ProductsByCategoryScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="UserManagement" component={UserManagement} />
      <Stack.Screen name="CategoryManagement" component={CategoryManagement} />
      <Stack.Screen name="ProductManagement" component={ProductManagement} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistory} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="MyOrders" component={MyOrders} />
    </Stack.Navigator>
  );
};

export default HomeStackScreen;