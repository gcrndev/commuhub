import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';

// Importa o teu TabNavigator original
import TabNavigator from './src/navigation/TabNavigator';

// Importa as telas
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// 1. IMPORTA A NOVA TELA DE ALTERAR PASSWORD AQUI (Ajusta o caminho se for diferente)
import Password from './src/screens/PasswordScreen';

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

            {/* 4º: REGISTA A TELA DE ALTERAR PASSWORD AQUI */}
            <Stack.Screen name="Password" component={Password} />
            
          </Stack.Navigator>

        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;