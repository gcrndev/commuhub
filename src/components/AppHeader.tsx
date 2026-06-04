import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onNotificationPress?: () => void;
  hasNotifications?: boolean;
}

export default function AppHeader({
  title,
  subtitle,
  onNotificationPress,
  hasNotifications,
}: AppHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {onNotificationPress && (
        <TouchableOpacity
          onPress={onNotificationPress}
          style={styles.iconButton}
        >
          <Bell size={24} color="#111827" />
          {hasNotifications && <View style={styles.badge} />}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50, // Ajusta se a barra de estado sobrepor
    paddingBottom: 20,
    backgroundColor: '#0052FF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#eee8e8',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#cacdd2',
    marginTop: 2,
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 50,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: 6,
    top: 6,
    backgroundColor: '#EF4444',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
});
