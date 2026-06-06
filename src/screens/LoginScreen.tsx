import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/logo.png';
import Feather from '@react-native-vector-icons/feather';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { globalStyles } from '../styles/globalStyles';
import { getSupabaseClient } from '../lib/supabase';
import { setupPushNotifications } from '../services/notificationService';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage('Preenche o nome e a palavra-passe.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase.rpc('login_user', {
        input_username: username,
        input_password: password,
      });

      clearTimeout(timeoutId);

      if (error) throw error;

      const user = data?.[0];

      if (user) {
        login(user);
        setupPushNotifications(user.id).catch(pushError => {
          console.error('Erro ao configurar push notifications no login:', pushError);
        });
        navigation.replace('MainTabs');
      } else {
        setErrorMessage('Credenciais inválidas. Tenta novamente.');
      }
    } catch (error: any) {
      console.error('Erro detalhado no login:', error);

      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        setErrorMessage(
          'O servidor demorou muito a responder. Verifica a tua internet.'
        );
      } else {
        setErrorMessage(
          error.message || 'Erro de comunicação com o servidor.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.loginSafeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* LOGO */}
          <View style={{ alignItems: 'center', marginTop: 90, marginBottom: 5 }}>
        <Image
          source={Logo}
          style={{
            width: 140,
            height: 140,
            resizeMode: 'contain',
          }}
        />
      </View>

      {/* Cabeçalho */}
      <View style={globalStyles.loginHeaderContainer}>
        <Text style={globalStyles.loginTitle}>Bem-vindo de volta!</Text>

        <Text style={globalStyles.loginSubtitle}>
          Entre na sua conta CommuHub para continuar
        </Text>
      </View>

      {/* Caixa/Card do Login */}
      <View style={globalStyles.loginCardContainer}>

        {/* Input de Usuário */}
        <View style={globalStyles.loginInputGroup}>
          <Text style={globalStyles.loginInputLabel}>
            Nome de utilizador
          </Text>

          <View style={globalStyles.loginInputWrapper}>
            <TextInput
              style={globalStyles.loginInput}
              placeholder="username"
              placeholderTextColor="#94A3B8"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Input de Password */}
        <View style={globalStyles.loginInputGroup}>
  <Text style={globalStyles.loginInputLabel}>
    Palavra-passe
  </Text>

  <View
    style={[
      globalStyles.loginInputWrapper,
      {
        flexDirection: 'row',
        alignItems: 'center',
      },
    ]}
  >
    <TextInput
      style={[
        globalStyles.loginInput,
        { flex: 1 }
      ]}
      placeholder="password"
      secureTextEntry={!showPassword}
      placeholderTextColor="#94A3B8"
      value={password}
      onChangeText={setPassword}
      editable={!isLoading}
    />

    <TouchableOpacity
      onPress={() => setShowPassword(!showPassword)}
      style={{ paddingHorizontal: 12 }}
    >
      <Feather
        name={showPassword ? 'eye-off' : 'eye'}
        size={20}
        color="#64748B"
      />
    </TouchableOpacity>
  </View>
</View>

        {/* Mensagem de Erro */}
        {errorMessage ? (
          <Text style={globalStyles.loginErrorText}>
            {errorMessage}
          </Text>
        ) : null}

        {/* Botão */}
        <TouchableOpacity
          style={[
            globalStyles.loginButton,
            isLoading && { opacity: 0.7 },
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={globalStyles.loginButtonText}>
              Entrar
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Registo */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Register')}
        style={globalStyles.loginFooterContainer}
        disabled={isLoading}
      >
        <Text style={globalStyles.loginFooterText}>
          Não tem uma conta?{' '}
          <Text style={globalStyles.loginFooterLink}>
            Cadastre-se
          </Text>
        </Text>
      </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
