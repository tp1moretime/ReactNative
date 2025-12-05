import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StripeProvider } from '@stripe/stripe-react-native';
import AppTabs from './AppTabs';
import { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const AppNavigator = () => {
  return (
    <StripeProvider publishableKey="pk_test_51LxxxxxxYourStripePublicKeyxxxxxx">
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={AppTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </StripeProvider>    
  );
};

export default AppNavigator;