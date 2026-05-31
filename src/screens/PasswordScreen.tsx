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
} from 'react-native';

import { globalStyles } from '../styles/globalStyles';
import { getSupabaseClient } from '../lib/supabase';

export default function ChangePasswordScreen({ navigation }: any) {
  const { user } = useAuth(); // Assume que o teu AuthContext guarda os dados do utilizador logado (ex: user.id ou user.username)

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Estados para controlar a visibilidade dos campos de texto
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setErrorMessage('Preenche todos os campos.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('As novas palavras-passe não coincidem.');
      return;
    }

    // Opcional: Impedir que a nova password seja igual à antiga se o teu backend não validar isso
    if (currentPassword === newPassword) {
      setErrorMessage('A nova palavra-passe não pode ser igual à atual.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const supabase = getSupabaseClient();

      // Atualiza a password diretamente na tabela 'users' para o utilizador atual
      const { error } = await supabase
        .from('users')
        .update({ password: newPassword })
        .eq('id', user?.id) // Ajusta para a chave primária que usas (ex: 'id', 'username', etc.)
        .eq('password', currentPassword); // Garante que ele sabe a password antiga para poder mudar

      if (error) throw error;

      Alert.alert('Sucesso!', 'A tua palavra-passe foi alterada!', [
        { text: 'Ok', onPress: () => navigation.goBack() }
      ]);

    } catch (error: any) {
      console.error('Erro ao alterar password:', error);
      setErrorMessage(error.message || 'Erro ao comunicar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.loginSafeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView showsVerticalScrollIndicator={false}>
        
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
          <Text style={globalStyles.loginTitle}>Alterar Palavra-passe</Text>
          <Text style={globalStyles.loginSubtitle}>
            Escolha uma combinação segura para proteger a sua conta
          </Text>
        </View>

        {/* Card de Inputs (Estilos de Login Reutilizados) */}
        <View style={[globalStyles.loginCardContainer, { marginTop: 5, paddingBottom: 20 }]}>
          
          {/* Input Password Atual */}
          <View style={[globalStyles.loginInputGroup, { marginBottom: 15 }]}>
            <Text style={globalStyles.loginInputLabel}>Palavra-passe atual</Text>
            <View style={[globalStyles.loginInputWrapper, { flexDirection: 'row', alignItems: 'center' }]}>
              <TextInput
                style={[globalStyles.loginInput, { flex: 1 }]}
                placeholder="Insira a password atual"
                secureTextEntry={!showCurrentPass}
                placeholderTextColor="#94A3B8"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowCurrentPass(!showCurrentPass)} style={{ paddingHorizontal: 12 }}>
                <Feather name={showCurrentPass ? 'eye-off' : 'eye'} size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Input Nova Password */}
          <View style={[globalStyles.loginInputGroup, { marginBottom: 15 }]}>
            <Text style={globalStyles.loginInputLabel}>Nova palavra-passe</Text>
            <View style={[globalStyles.loginInputWrapper, { flexDirection: 'row', alignItems: 'center' }]}>
              <TextInput
                style={[globalStyles.loginInput, { flex: 1 }]}
                placeholder="Crie uma nova password"
                secureTextEntry={!showNewPass}
                placeholderTextColor="#94A3B8"
                value={newPassword}
                onChangeText={setNewPassword}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowNewPass(!showNewPass)} style={{ paddingHorizontal: 12 }}>
                <Feather name={showNewPass ? 'eye-off' : 'eye'} size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Input Confirmar Nova Password */}
          <View style={[globalStyles.loginInputGroup, { marginBottom: 15 }]}>
            <Text style={globalStyles.loginInputLabel}>Confirmar nova palavra-passe</Text>
            <View style={[globalStyles.loginInputWrapper, { flexDirection: 'row', alignItems: 'center' }]}>
              <TextInput
                style={[globalStyles.loginInput, { flex: 1 }]}
                placeholder="Repita a nova password"
                secureTextEntry={!showConfirmPass}
                placeholderTextColor="#94A3B8"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)} style={{ paddingHorizontal: 12 }}>
                <Feather name={showConfirmPass ? 'eye-off' : 'eye'} size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Erro Dinâmico */}
          {errorMessage ? (
            <Text style={globalStyles.loginErrorText}>{errorMessage}</Text>
          ) : null}

          {/* Botão de Gravar */}
          <TouchableOpacity
            style={[globalStyles.loginButton, isLoading && { opacity: 0.7 }, { marginTop: 10 }]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={globalStyles.loginButtonText}>GUARDAR ALTERAÇÕES</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Botão Cancelar / Voltar */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[globalStyles.loginFooterContainer, { marginTop: 20 }]}
          disabled={isLoading}
        >
          <Text style={[globalStyles.loginFooterLink, { color: '#64748B' }]}>
            Cancelar e Voltar
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}