import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import AdminStackScreen from './Admin/AdminStackScreen';
import { useAuth } from './AuthContext';
import HomeStackScreen from './HomeStackScreen';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';

export type BottomTabParamList = {
  HomeTab: undefined;
  AdminHomeTab: undefined;
  SignupTab: undefined;
  LoginTab: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const AppTabs = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#BB86FC', // Màu Nhấn Tím
        tabBarInactiveTintColor: '#B3B3B3', // Màu Xám nhạt
        tabBarStyle: {
          backgroundColor: '#121212', // Nền Tối
          borderTopColor: '#333333', // Viền ngăn cách nhẹ
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 0,
          shadowColor: 'transparent',
        },
        headerShown: false
      }}
    >

      {/* Home User */}
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          )
        }}
      />

      {/* Admin Home */}
      {isAdmin && (
        <Tab.Screen
          name="AdminHomeTab"
          component={AdminStackScreen}
          options={{
            title: 'Admin',
            tabBarIcon: ({ color, size }) => (
              <Feather name="settings" size={size} color={color} />
            )
          }}
        />
      )}

      {/* Signup */}
      <Tab.Screen
        name="SignupTab"
        component={SignupScreen}
        options={{
          title: 'Sign Up',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-add-outline" size={size} color={color} />
          )
        }}
      />

      {/* Login */}
      <Tab.Screen
        name="LoginTab"
        component={LoginScreen}
        options={{
          title: 'Login',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="login" size={size} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
};


export default AppTabs;