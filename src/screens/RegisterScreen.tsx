import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Se precisares de logar o gajo direto após criar conta, senão podes apagar esta linha

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
} from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { getSupabaseClient } from '../lib/supabase'; // Import idêntico ao do teu colega

export default function RegisterScreen({ navigation }: any) {
  // 1. Estados para capturar os inputs e controlar a UI (seguindo o padrão do login)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 2. A função real de Registo
  const handleRegister = async () => {
    // Validação básica de campos vazios
    if (!username || !password || !confirmPassword) {
      setErrorMessage('Preenche todos os campos.');
      return;
    }

    // Validação de palavra-passe idêntica
    if (password !== confirmPassword) {
      setErrorMessage('As palavras-passe não coincidem.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const supabase = getSupabaseClient();

      // 3. Chamada ao backend (inserindo na tabela pública 'users')
      const { error } = await supabase
        .from('users')
        .insert([
          { 
            username: username, 
            password: password, 
            type: 'condomino' // Define o tipo padrão como condómino
          },
        ]);

      if (error) throw error;

      // Se correu bem, avisa o utilizador e manda-o para o Login
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
    <SafeAreaView style={globalStyles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={globalStyles.blueHeader}>
        <Text style={globalStyles.headerTitle}>Criar Conta</Text>
        <Text style={globalStyles.headerSubtitle}>
          Junte-se à comunidade hoje
        </Text>
      </View>

      <View style={globalStyles.mainContent}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 20 }}>
          
          <Text style={globalStyles.sectionTitle}>Dados Pessoais</Text>

          {/* Input Nome */}
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

          {/* Input Palavra-passe */}
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

          {/* Input Confirmar Palavra-passe */}
          <View style={globalStyles.searchBarContainer}>
            <TextInput 
              style={globalStyles.searchInput} 
              placeholder="Confirmar Palavra-passe" 
              secureTextEntry 
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!isLoading}
            />
          </View>

          {/* Feedback visual de erro dinâmico idêntico ao login */}
          {errorMessage ? (
            <Text style={{ color: 'red', marginVertical: 10, textAlign: 'center' }}>
              {errorMessage}
            </Text>
          ) : null}

          {/* Botão de Finalizar */}
          <TouchableOpacity 
            style={[
              globalStyles.primaryButton, 
              { height: 52, justifyContent: 'center', borderRadius: 14, marginTop: 10 },
              isLoading && { opacity: 0.7 }
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={globalStyles.primaryButtonText}>FINALIZAR REGISTO</Text>
            )}
          </TouchableOpacity>

          {/* Voltar para o Login */}
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={{ marginVertical: 30, alignItems: 'center' }}
            disabled={isLoading}
          >
            <Text style={globalStyles.cardSubtitle}>
              Já tem conta? <Text style={{fontWeight: 'bold', color: '#0052FF'}}>Faça Login</Text>
            </Text>
          </TouchableOpacity>
          
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}