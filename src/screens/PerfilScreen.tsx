import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  SafeAreaView 
} from "react-native";
// Ícones para Native
import { User, Mail, Shield, Bell, LogOut, ChevronRight } from "lucide-react-native";

// Dados Mock (Ajusta o import se necessário)
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
  }
};

export default function PerfilScreen() {
  const [notifications, setNotifications] = useState(mockUser.notifications);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Azul */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
          <Text style={styles.headerSubtitle}>Informações e configurações</Text>
        </View>

        <View style={styles.content}>
          {/* Card de Perfil - Estilo Floating */}
          <View style={styles.profileCard}>
            <View style={styles.profileInfoRow}>
              <View style={styles.avatarCircle}>
                <User size={40} color="#2563eb" />
              </View>
              <View style={styles.profileTextInfo}>
                <Text style={styles.userName}>{mockUser.name}</Text>
                <Text style={styles.userEmail}>{mockUser.email}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{mockUser.role}</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Número de Membro</Text>
                <Text style={styles.statValue}>{mockUser.memberId}</Text>
              </View>
              <View style={[styles.statItem, styles.statBorder]}>
                <Text style={styles.statLabel}>Membro desde</Text>
                <Text style={styles.statValue}>
                  {new Date(mockUser.memberSince).toLocaleDateString("pt-BR")}
                </Text>
              </View>
            </View>
          </View>

          {/* Configurações de Notificações */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Bell size={20} color="#4b5563" />
              <Text style={styles.sectionTitle}>Notificações</Text>
            </View>

            <View style={styles.sectionBody}>
              {/* Opção Email */}
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.optionLabel}>Email</Text>
                  <Text style={styles.optionSubLabel}>Receber notificações por email</Text>
                </View>
                <Switch 
                  value={notifications.email} 
                  onValueChange={() => toggleNotification("email")}
                  trackColor={{ false: "#e5e7eb", true: "#bfdbfe" }}
                  thumbColor={notifications.email ? "#2563eb" : "#f3f4f6"}
                />
              </View>

              {/* Opção Push */}
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.optionLabel}>Push</Text>
                  <Text style={styles.optionSubLabel}>Notificações no dispositivo</Text>
                </View>
                <Switch 
                  value={notifications.push} 
                  onValueChange={() => toggleNotification("push")}
                  trackColor={{ false: "#e5e7eb", true: "#bfdbfe" }}
                  thumbColor={notifications.push ? "#2563eb" : "#f3f4f6"}
                />
              </View>

              <View style={styles.divider} />
              <Text style={styles.groupLabel}>NOTIFICAR SOBRE</Text>

              {["votacoes", "eventos", "documentos"].map((item) => (
                <View key={item} style={styles.switchRowSmall}>
                  <Text style={styles.optionLabelSmall}>
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

          {/* Opções de Conta */}
          <View style={styles.sectionCard}>
            <TouchableOpacity style={[styles.menuItem, styles.borderBottom]}>
              <View style={styles.menuItemLeft}>
                <Shield size={20} color="#4b5563" />
                <Text style={styles.menuItemText}>Privacidade e Segurança</Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Mail size={20} color="#4b5563" />
                <Text style={styles.menuItemText}>Alterar Email</Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Botão Logout */}
          <TouchableOpacity style={styles.logoutButton}>
            <LogOut size={20} color="#dc2626" />
            <Text style={styles.logoutText}>Terminar Sessão</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#2563eb", // Cor igual ao header para o topo do telemóvel
  },
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 48, // Espaço extra para o card "flutuar" por cima
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#dbeafe",
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -30, // Faz o card subir para cima do azul
  },
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    elevation: 4, // Sombra no Android
    shadowColor: "#000", // Sombra no iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  profileInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    backgroundColor: "#eff6ff",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  profileTextInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  userEmail: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 6,
  },
  badge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    color: "#1d4ed8",
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
  },
  statBorder: {
    borderLeftWidth: 1,
    borderLeftColor: "#f3f4f6",
    paddingLeft: 16,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 20,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  sectionBody: {
    padding: 16,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  switchRowSmall: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  optionSubLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  optionLabelSmall: {
    fontSize: 14,
    color: "#374151",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 16,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#6b7280",
    marginBottom: 12,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#fecaca",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
  },
});