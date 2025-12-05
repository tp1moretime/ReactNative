import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ChangePassword from '../ChangePassword';
import EditProfile from "../EditProfile";
import MyOrders from "../MyOrders";
import OrderDetails from '../OrderDetails';
import ProfileScreen from '../ProfileScreen';
import { HomeStackParamList } from '../types';
import AdminDashboard from './AdminDashboard';
import CategoryManagement from './CategoryManagement';
import OrderManagement from './OrderManagement';
import ProductManagement from './ProductManagement';
import UserManagement from './UserManagement';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const AdminStackScreen = () => {
  return (
    <Stack.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={{ 
        headerShown: false,
        // Cài đặt mặc định cho Dark Mode nếu headers được bật
        contentStyle: { backgroundColor: '#121212' }, 
        headerStyle: { backgroundColor: '#1E1E1E' },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="UserManagement" component={UserManagement} />
      <Stack.Screen name="CategoryManagement" component={CategoryManagement} />
      <Stack.Screen name="ProductManagement" component={ProductManagement} />
      <Stack.Screen name="OrderManagement" component={OrderManagement} />
      <Stack.Screen name="OrderDetails" component={OrderDetails} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="MyOrders" component={MyOrders} />
    </Stack.Navigator>
  );
};

export default AdminStackScreen;