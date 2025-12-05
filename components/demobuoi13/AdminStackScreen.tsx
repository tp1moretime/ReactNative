import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboard from './AdminDashboard';
import UserManagementScreen from './UserManagementScreen';
import CategoryManagementScreen from './CategoryManagementScreen';
import ProductManagementScreen from './ProductManagementScreen';
import OrderManagementScreen from './OrderManagementScreen';
import { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const AdminStackScreen = () => {
  return (
    <Stack.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} />
      <Stack.Screen name="CategoryManagement" component={CategoryManagementScreen} />
      <Stack.Screen name="ProductManagement" component={ProductManagementScreen} />
      <Stack.Screen name="OrderManagement" component={OrderManagementScreen} />
    </Stack.Navigator>
  );
};

export default AdminStackScreen;


