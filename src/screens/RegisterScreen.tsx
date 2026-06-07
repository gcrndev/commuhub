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
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { globalStyles } from '../styles/globalStyles';
import { getSupabaseClient } from '../lib/supabase';

export default function RegisterScreen({ navigation }: any) {
  // Estados para capturar os inputs e controlar a UI
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // estados para alternar a visibilidade das passwords
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //  .insert()
  const handleRegister = async () => {
    if (!username || !password || !confirmPassword) {
      setErrorMessage('Preenche todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As palavras-passe não coincidem.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const supabase = getSupabaseClient();

      // procura se o utilizador já existe na base de dados
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username.trim())
        .maybeSingle(); // devolve o objeto se encontrar ou null se não encontrar

      if (checkError) throw checkError;

      // se encontrou algum registo interrompe o registo e mostra o aviso
      if (existingUser) {
        setErrorMessage('Este nome de utilizador já está a ser utilizado.');
        setIsLoading(false);
        return;
      }

      // se passou no teste anterior avança com a insercao
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          { 
            username: username.trim(), 
            password: password, 
            type: 'condomino' 
          },
        ]);

      if (insertError) throw insertError;

      // avisa o utilizador e manda o para o Login
      Alert.alert('Sucesso!', 'Conta criada com sucesso!', [
        { text: 'Ir para Login', onPress: () => navigation.navigate('Login') }
      ]);

    } catch (error: any) {
      console.error('Erro no registo:', error);
      setErrorMessage(error.message || 'Erro ao comunicar com o servidor.');
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
          contentContainerStyle={{ paddingBottom: 30 }}
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
          <Text style={globalStyles.loginTitle}>Criar Conta</Text>
          <Text style={globalStyles.loginSubtitle}>
            Entre na sua conta CommuHub para continuar
          </Text>
        </View>

        {/* Caixa/Card do Login adaptada para Registo */}
        <View style={[globalStyles.loginCardContainer, { marginTop: 5, paddingBottom: 20 }]}>
          
          {/* Input de Usuário */}
          <View style={[globalStyles.loginInputGroup, { marginBottom: 15 }]}>
            <Text style={globalStyles.loginInputLabel}>Nome de utilizador</Text>
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
          <View style={[globalStyles.loginInputGroup, { marginBottom: 15 }]}>
            <Text style={globalStyles.loginInputLabel}>Palavra-passe</Text>
            <View style={[globalStyles.loginInputWrapper, { flexDirection: 'row', alignItems: 'center' }]}>
              <TextInput
                style={[globalStyles.loginInput, { flex: 1 }]}
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

          {/* Input de Confirmar Password */}
          <View style={[globalStyles.loginInputGroup, { marginBottom: 15 }]}>
            <Text style={globalStyles.loginInputLabel}>Confirmar palavra-passe</Text>
            <View style={[globalStyles.loginInputWrapper, { flexDirection: 'row', alignItems: 'center' }]}>
              <TextInput
                style={[globalStyles.loginInput, { flex: 1 }]}
                placeholder="confirmar password"
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ paddingHorizontal: 12 }}
              >
                <Feather
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Mensagem de Erro Dinâmica */}
          {errorMessage ? (
            <Text style={globalStyles.loginErrorText}>
              {errorMessage}
            </Text>
          ) : null}

          {/* Botão de Finalizar */}
          <TouchableOpacity
            style={[
              globalStyles.loginButton,
              isLoading && { opacity: 0.7 },
              { marginTop: 5 }
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={globalStyles.loginButtonText}>FINALIZAR REGISTO</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Voltar para o Login */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[globalStyles.loginFooterContainer, { marginTop: 20 }]}
          disabled={isLoading}
        >
          <Text style={globalStyles.loginFooterText}>
            Já tem uma conta?{' '}
            <Text style={globalStyles.loginFooterLink}>Inicie sessão</Text>
          </Text>
        </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}