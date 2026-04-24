import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';


import TabNavigator from './src/navigation/TabNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        />

        <TabNavigator />

      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;