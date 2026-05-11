// PerfilScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
} from "react-native";

import {
  User,
  Mail,
  Shield,
  Bell,
  LogOut,
  ChevronRight,
} from "lucide-react-native";

import AppHeader from "../components/AppHeader";
import { globalStyles } from "../styles/globalStyles";
import { colors } from "../styles/colors";

// Dados Mock
const mockUser = {
  name: "João Silva",
  email: "joao.silva@exemplo.com",
  role: "Membro Premium",
  memberId: "12345",
  memberSince: "2023-01-15",
  notifications: {
    email: true,
    push: true,
    votacoes: true,
    eventos: false,
    documentos: true,
  },
};

export default function PerfilScreen() {
  const [notifications, setNotifications] = useState(
    mockUser.notifications
  );

  const toggleNotification = (
    key: keyof typeof notifications
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
  <View style={globalStyles.safeArea}>
    <AppHeader 
      title="Perfil" 
      subtitle="Gerir conta e preferências" 
    />

    <ScrollView
      style={globalStyles.mainContent}
      contentContainerStyle={globalStyles.calendarScrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Card Perfil principal (seguindo o estilo do calendarCard) */}
      <View style={globalStyles.calendarCard}>
        <View style={globalStyles.profileInfoRow}>
          <View style={globalStyles.avatarCircle}>
            <User size={40} color={colors.primary || "#2563eb"} />
          </View>

          <View style={globalStyles.profileTextInfo}>
            <Text style={globalStyles.userName}>
              {mockUser.name}
            </Text>
            <Text style={globalStyles.userEmail}>
              {mockUser.email}
            </Text>
            <View style={globalStyles.badge}>
              <Text style={globalStyles.badgeText}>
                {mockUser.role}
              </Text>
            </View>
          </View>
        </View>

        <View style={globalStyles.statsRow}>
          <View style={globalStyles.statItem}>
            <Text style={globalStyles.statLabel}>Número de Membro</Text>
            <Text style={globalStyles.statValue}>{mockUser.memberId}</Text>
          </View>
          <View style={[globalStyles.statItem, globalStyles.statBorder]}>
            <Text style={globalStyles.statLabel}>Membro desde</Text>
            <Text style={globalStyles.statValue}>
              {new Date(mockUser.memberSince).toLocaleDateString("pt-PT")}
            </Text>
          </View>
        </View>
      </View>

      {/* Notificações */}
      <View style={globalStyles.calendarCard}>
        <View style={globalStyles.calendarNavHeader}>
          <Bell size={20} color={colors.textSecondary} />
          <Text style={globalStyles.calendarMonthTitle}>
            Notificações
          </Text>
          <View style={{ width: 20 }} /> {/* Espaçador para manter o título ao centro */}
        </View>

        <View style={{ paddingVertical: 10 }}>
          <View style={globalStyles.switchRow}>
            <View>
              <Text style={globalStyles.optionLabel}>Email</Text>
              <Text style={globalStyles.optionSubLabel}>Receber notificações por email</Text>
            </View>
            <Switch
              value={notifications.email}
              onValueChange={() => toggleNotification("email")}
              trackColor={{ false: "#e5e7eb", true: "#bfdbfe" }}
              thumbColor={notifications.email ? "#2563eb" : "#f3f4f6"}
            />
          </View>

          <View style={globalStyles.switchRow}>
            <View>
              <Text style={globalStyles.optionLabel}>Push</Text>
              <Text style={globalStyles.optionSubLabel}>Notificações no dispositivo</Text>
            </View>
            <Switch
              value={notifications.push}
              onValueChange={() => toggleNotification("push")}
              trackColor={{ false: "#e5e7eb", true: "#bfdbfe" }}
              thumbColor={notifications.push ? "#2563eb" : "#f3f4f6"}
            />
          </View>

          <View style={globalStyles.divider} />

          <Text style={globalStyles.groupLabel}>NOTIFICAR SOBRE</Text>

          {["votacoes", "eventos", "documentos"].map((item) => (
            <View key={item} style={globalStyles.switchRowSmall}>
              <Text style={globalStyles.optionLabelSmall}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
              <Switch
                value={notifications[item as keyof typeof notifications]}
                onValueChange={() => toggleNotification(item as keyof typeof notifications)}
                trackColor={{ false: "#e5e7eb", true: "#bfdbfe" }}
                thumbColor={notifications[item as keyof typeof notifications] ? "#2563eb" : "#f3f4f6"}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Conta e Segurança */}
      <View style={globalStyles.calendarCard}>
        <TouchableOpacity style={[globalStyles.menuItem, globalStyles.borderBottom]}>
          <View style={globalStyles.menuItemLeft}>
            <Shield size={20} color={colors.textSecondary} />
            <Text style={globalStyles.menuItemText}>Privacidade e Segurança</Text>
          </View>
          <ChevronRight size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.menuItem}>
          <View style={globalStyles.menuItemLeft}>
            <Mail size={20} color={colors.textSecondary} />
            <Text style={globalStyles.menuItemText}>Alterar Email</Text>
          </View>
          <ChevronRight size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Botão de Logout */}
      <TouchableOpacity style={[globalStyles.calendarCard, { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 }]}>
        <LogOut size={20} color="#dc2626" />
        <Text style={[globalStyles.logoutText, { color: '#dc2626', fontWeight: '600' }]}>
          Terminar Sessão
        </Text>
      </TouchableOpacity>
    </ScrollView>
  </View>
);}