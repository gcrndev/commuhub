import React, { useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/colors';

import Logo from '../assets/logo.png';

export default function SplashScreen({ navigation }: any) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Login');
    }, 2500);
  }, [navigation]);

  return (
    
    <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Image 
        source={Logo} 
        style={styles.logo} 
        resizeMode="contain" 
      />

      
      <ActivityIndicator size="large" color="#0052FF" style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250, 
    height: 250,
  },
});