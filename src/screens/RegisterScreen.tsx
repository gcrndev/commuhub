import React from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

export default function RegisterScreen({ navigation }: any) {
  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={globalStyles.blueHeader}>
        <Text style={globalStyles.headerTitle}>Criar Conta</Text>
        <Text style={globalStyles.headerSubtitle}>Junte-se à comunidade hoje</Text>
      </View>

      <View style={globalStyles.mainContent}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 20 }}>
          
          <Text style={globalStyles.sectionTitle}>Dados Pessoais</Text>

          <View style={globalStyles.searchBarContainer}>
            <TextInput style={globalStyles.searchInput} placeholder="Nome" />
          </View>

          <View style={globalStyles.searchBarContainer}>
            <TextInput style={globalStyles.searchInput} placeholder="Palavra-passe" secureTextEntry />
          </View>

          <View style={globalStyles.searchBarContainer}>
            <TextInput style={globalStyles.searchInput} placeholder=" Confirmar Palavra-passe" secureTextEntry />
          </View>

          <TouchableOpacity 
            style={[globalStyles.primaryButton, { height: 52, justifyContent: 'center', borderRadius: 14, marginTop: 10 }]}
            onPress={() => navigation.replace('MainTabs')} // Pus isto enquanto nao funciona
          >
            <Text style={globalStyles.primaryButtonText}>FINALIZAR REGISTO</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={{ marginVertical: 30, alignItems: 'center' }}
          >
            <Text style={globalStyles.cardSubtitle}>Já tem conta? <Text style={{fontWeight: 'bold'}}>Faça Login</Text></Text>
          </TouchableOpacity>
          
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}