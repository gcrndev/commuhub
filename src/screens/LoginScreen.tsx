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
  if (!username || !password) {
    setErrorMessage('Preenche o nome e a palavra-passe.');
    return;
  }

  setIsLoading(true);
  setErrorMessage('');

  // Criar um mecanismo para cancelar se demorar mais de 8 segundos
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const supabase = getSupabaseClient();
    
    // Chamada à RPC com o sinal de cancelamento por timeout
    const { data, error } = await supabase.rpc('login_user', {
      input_username: username,
      input_password: password,
    });

    clearTimeout(timeoutId);

    if (error) throw error;

    const user = data?.[0];

    if (user) {
      login(user);
      navigation.replace('MainTabs');
    } else {
      setErrorMessage('Credenciais inválidas. Tenta novamente.');
    }
  } catch (error: any) {
    console.error('Erro detalhado no login:', error);
    
    // Se o erro foi por causa do tempo limite (Timeout)
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      setErrorMessage('O servidor demorou muito a responder. Verifica a tua internet.');
    } else {
      setErrorMessage(error.message || 'Erro de comunicação com o servidor.');
    }
  } finally {
    // ESTA LINHA É CRUCIAL: Garante que o loading para, não importa o que aconteça!
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
