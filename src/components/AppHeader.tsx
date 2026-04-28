import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <View style={globalStyles.blueHeader}>
      <Text style={globalStyles.headerTitle}>{title}</Text>
      {subtitle && (
        <Text style={globalStyles.headerSubtitle}>{subtitle}</Text>
      )}
    </View>
  );
}