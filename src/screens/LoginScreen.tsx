import React from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/colors';

export default function LoginScreen({ navigation }: any) {
 
  const handleBypassLogin = () => {
    
    navigation.replace('MainTabs'); 
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <StatusBar barStyle="light-content" />
      
      <View style={globalStyles.blueHeader}>
        <Text style={globalStyles.headerTitle}>Bem-vindo</Text>
        <Text style={globalStyles.headerSubtitle}>Aceda à sua conta CommuHub</Text>
      </View>

      <View style={globalStyles.mainContent}>
        <View style={{ marginTop: 30 }}>
          <Text style={globalStyles.sectionTitle}>Login</Text>
          
          <View style={globalStyles.searchBarContainer}>
            <TextInput 
              style={globalStyles.searchInput} 
              placeholder="Nome" 
              placeholderTextColor="#999"
            />
          </View>

          <View style={globalStyles.searchBarContainer}>
            <TextInput 
              style={globalStyles.searchInput} 
              placeholder="Palavra-passe" 
              secureTextEntry 
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity 
            style={[globalStyles.primaryButton, { height: 52, justifyContent: 'center', borderRadius: 14 }]}
            onPress={handleBypassLogin} // Chama a função que entra direto
          >
            <Text style={globalStyles.primaryButtonText}>ENTRAR</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Register')}
            style={{ marginTop: 20, alignItems: 'center' }}
          >
            <Text style={globalStyles.cardSubtitle}>
              Ainda não tem conta? <Text style={{ color: '#0052FF', fontWeight: 'bold' }}>Registe-se aqui</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}