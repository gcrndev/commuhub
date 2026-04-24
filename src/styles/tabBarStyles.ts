import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const tabBarStyles = StyleSheet.create({
  tabBar: {
    height: 65,
    paddingBottom: 8,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },

  label: {
    fontSize: 12,
  },
});