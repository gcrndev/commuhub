import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { getSupabaseClient } from '../lib/supabase'; // Assumindo que o teu cliente Supabase está aqui exportado

export default function LoginScreen({ navigation }: any) {

  // puxar funcao de login global
  const { login } = useAuth();

  // 1. Estados para capturar os inputs e controlar a UI
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 2. A função real de Login
  const handleLogin = async () => {
    // Validação básica
    if (!username || !password) {
      setErrorMessage('Preenche o nome e a palavra-passe.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const supabase = getSupabaseClient();

      // 3. Chamada ao backend
      const { data, error } = await supabase.rpc('login_user', {
        input_username: username,
        input_password: password,
      });

      if (error) throw error;

      const user = data?.[0];

      if (user) {
        // Login com sucesso
        // TODO: Guardar os dados do utilizador globalmente (Context/AsyncStorage) || feito database - function - login_user
        login(user);
        navigation.replace('MainTabs');
      } else {
        // Retornou vazio = credenciais erradas
        setErrorMessage('Credenciais inválidas. Tenta novamente.');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      setErrorMessage('Erro de comunicação com o servidor.');
      setErrorMessage(error.message || 'Erro desconhecido. Vê a consola.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={globalStyles.blueHeader}>
        <Text style={globalStyles.headerTitle}>Bem-vindo</Text>
        <Text style={globalStyles.headerSubtitle}>
          Aceda à sua conta CommuHub
        </Text>
      </View>

      <View style={globalStyles.mainContent}>
        <View style={{ marginTop: 30 }}>
          <Text style={globalStyles.sectionTitle}>Login</Text>

          <View style={globalStyles.searchBarContainer}>
            <TextInput
              style={globalStyles.searchInput}
              placeholder="Nome"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={globalStyles.searchBarContainer}>
            <TextInput
              style={globalStyles.searchInput}
              placeholder="Palavra-passe"
              secureTextEntry
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
          </View>

          {/* Feedback visual de erro */}
          {errorMessage ? (
            <Text
              style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}
            >
              {errorMessage}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[
              globalStyles.primaryButton,
              { height: 52, justifyContent: 'center', borderRadius: 14 },
              isLoading && { opacity: 0.7 }, // Feedback visual do botão desativado
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={globalStyles.primaryButtonText}>ENTRAR</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={{ marginTop: 20, alignItems: 'center' }}
            disabled={isLoading}
          >
            <Text style={globalStyles.cardSubtitle}>
              Ainda não tem conta?{' '}
              <Text style={{ color: '#0052FF', fontWeight: 'bold' }}>
                Registe-se aqui
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
