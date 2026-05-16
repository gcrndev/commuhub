import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';

// Importa o teu TabNavigator original
import TabNavigator from './src/navigation/TabNavigator';

// Importa as novas telas que criaste
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// Criamos o Stack principal
const Stack = createStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          />

          {/* Substituímos o TabNavigator por este Stack.Navigator */}
          <Stack.Navigator 
            initialRouteName="Splash" 
            screenOptions={{ headerShown: false }}
          >
            {/* 1º: A tela de carregamento */}
            <Stack.Screen name="Splash" component={SplashScreen} />
            
            {/* 2º: As telas de autenticação */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            
            {/* 3º: A aplicação real (que contém as tuas Tabs) */}
            <Stack.Screen name="MainTabs" component={TabNavigator} />
          </Stack.Navigator>

        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;