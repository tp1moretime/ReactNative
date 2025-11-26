import React from 'react';
import AppTabs from '../demobuoi13/AppTabs';
import { UserProvider } from '../demobuoi13/UserContext';

const AppNavigator = () => {
  return (
    <UserProvider>
 
        <AppTabs />
    
    </UserProvider>
  );
};

export default AppNavigator;
