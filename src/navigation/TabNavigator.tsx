import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feather from '@react-native-vector-icons/feather';

// screens
import IndexScreen from '../screens/IndexScreen';
import VotacaoScreen from '../screens/VotacaoScreen';
import DocumentosScreen from '../screens/DocumentosScreen';
import CalendarioScreen from '../screens/CalendarioScreen';
import PerfilScreen from '../screens/PerfilScreen';

// estilos
import { colors } from '../styles/colors';
import { tabBarStyles } from '../styles/tabBarStyles';

export type RootTabParamList = {
  Inicio: undefined;
  Votacoes: { highlightVoteId?: string } | undefined;
  Docs: undefined;
  Agenda: { highlightEventId?: string } | undefined;
  Perfil: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();


type FeatherIconName =
  | 'home'
  | 'check-square'
  | 'file-text'
  | 'calendar'
  | 'user'
  | 'circle';

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        // cores
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,

        // estilos
        tabBarStyle: tabBarStyles.tabBar,
        tabBarLabelStyle: tabBarStyles.label,

        // icones
        tabBarIcon: ({ color }) => {
          let iconName: FeatherIconName;

          switch (route.name) {
            case 'Inicio':
              iconName = 'home';
              break;

            case 'Votacoes':
              iconName = 'check-square';
              break;

            case 'Docs':
              iconName = 'file-text';
              break;

            case 'Agenda':
              iconName = 'calendar';
              break;

            case 'Perfil':
              iconName = 'user';
              break;

            default:
              iconName = 'circle';
          }

          return (
            <Feather
              name={iconName}
              size={22}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={IndexScreen}
        options={{ tabBarLabel: 'Início' }}
      />

      <Tab.Screen
        name="Votacoes"
        component={VotacaoScreen}
        options={{ tabBarLabel: 'Votações' }}
      />

      <Tab.Screen
        name="Docs"
        component={DocumentosScreen}
        options={{ tabBarLabel: 'Docs' }}
      />

      <Tab.Screen
        name="Agenda"
        component={CalendarioScreen}
        options={{ tabBarLabel: 'Agenda' }}
      />

      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}