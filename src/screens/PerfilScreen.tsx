import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
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
import { useAuth } from "../context/AuthContext";
import { setupPushNotifications } from '../services/notificationService';

// 1. O teu novo import aqui
import { getSupabaseClient } from '../lib/supabase';

// 2. Inicializa o cliente para ser usado no ecrã
const supabase = getSupabaseClient();

export default function PerfilScreen({ navigation }: any) {
  const { user, logout } = useAuth(); 
  const [loading, setLoading] = useState(true);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    votacoes: true,
    eventos: false,
    documentos: true,
  });

  
  useEffect(() => {
    async function loadPreferences() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        //  Tenta ir buscar o perfil do utilizador
        const { data, error } = await supabase
          .from("profiles")
          .select("push_enabled, notify_votacoes, notify_eventos, notify_documentos")
          .eq("id", user.id); 

        if (error) throw error;

        //  Se a linha existir, atualiza o ecrã com os dados reais
        if (data && data.length > 0) {
          const profile = data[0];
          setNotifications((prev) => ({
            ...prev,
            push: profile.push_enabled ?? true,
            votacoes: profile.notify_votacoes ?? true,
            eventos: profile.notify_eventos ?? true,
            documentos: profile.notify_documentos ?? true,
          }));

          if (profile.push_enabled ?? true) {
            setupPushNotifications(user.id);
          }
        } else {
          
          console.log("Perfil não encontrado. A criar um perfil padrão para o ID:", user.id);
          
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([
              { 
                id: user.id, 
                push_enabled: true, 
                notify_votacoes: true, 
                notify_eventos: true, 
                notify_documentos: true 
              }
            ]);

          if (insertError) {
            console.error("Erro ao criar perfil em falta:", insertError);
          } else {
            // td ativo por defeito
            setNotifications({
              email: true,
              push: true,
              votacoes: true,
              eventos: true,
              documentos: true,
            });
            setupPushNotifications(user.id);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar preferências:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [user?.id]);

  
  const toggleNotification = async (key: keyof typeof notifications) => {
    const dbColumns: Record<string, string> = {
      push: "push_enabled",
      votacoes: "notify_votacoes",
      eventos: "notify_eventos",
      documentos: "notify_documentos",
    };

    const newValue = !notifications[key];

    
    setNotifications((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    
    if (key in dbColumns && user?.id) {
      const columnName = dbColumns[key];

      const { error } = await supabase
        .from("profiles")
        .update({ [columnName]: newValue })
        .eq("id", user.id);

      if (error) {
        console.error(`Erro ao atualizar ${columnName}:`, error);
        
        setNotifications((prev) => ({
          ...prev,
          [key]: !newValue,
        }));
        return;
      }

      if (key === "push" && newValue) {
        setupPushNotifications(user.id);
      }
    }
  };

  const handleLogout = async () => {
    if (logout) {
      await logout();
    }
    navigation.replace("Login"); 
  };

  const userName = user?.username || "Utilizador";
  const userRole = user?.type || "condomino";
  const memberSince = (user as any)?.date_added || new Date().toISOString();

  if (loading) {
    return (
      <View style={[globalStyles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary || "#2563eb"} />
      </View>
    );
  }

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
        {/* Card Principal de Perfil */}
        <View style={globalStyles.calendarCard}>
          <View style={globalStyles.profileInfoRow}>
            <View style={globalStyles.avatarCircle}>
              <User size={40} color={colors.primary || "#2563eb"} />
            </View>

            <View style={globalStyles.profileTextInfo}>
              <Text style={globalStyles.userName}>{userName}</Text>
              <View style={globalStyles.badge}>
                <Text style={globalStyles.badgeText}>
                  {userRole.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          <View style={globalStyles.statsRow}>
            <View style={globalStyles.statItem}>
              <Text style={globalStyles.statLabel}>Membro desde</Text>
              <Text style={globalStyles.statValue}>
                {new Date(memberSince).toLocaleDateString("pt-PT")}
              </Text>
            </View>
          </View>
        </View>

        {/* Card de Notificações */}
        <View style={globalStyles.calendarCard}>
          <View style={globalStyles.calendarNavHeader}>
            <Bell size={20} color={colors.textSecondary} />
            <Text style={globalStyles.calendarMonthTitle}>Notificações</Text>
            <View style={{ width: 20 }} />
          </View>

          <View style={{ paddingVertical: 10 }}>
            

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

        {/* Links de Segurança */}
        <View style={globalStyles.calendarCard}>
  <TouchableOpacity style={[globalStyles.menuItem, globalStyles.borderBottom]}>
    <View style={globalStyles.menuItemLeft}>
      <Shield size={20} color={colors.textSecondary} />
      <Text style={globalStyles.menuItemText}>Privacidade e Segurança</Text>
    </View>
    <ChevronRight size={20} color="#9ca3af" />
  </TouchableOpacity>

  {/* AQUI: Adicionado o onPress para navegar e trocado o ícone para Key */}
  <TouchableOpacity 
    style={globalStyles.menuItem}
    onPress={() => navigation.navigate('Password')}
  >
    <View style={globalStyles.menuItemLeft}>
      {/* Importa o ícone Key no topo junto com os outros do 'lucide-react-native' se quiseres usar, senão podes manter o Shield/Mail */}
      <Shield size={20} color={colors.textSecondary} /> 
      <Text style={globalStyles.menuItemText}>Alterar Palavra-passe</Text>
    </View>
    <ChevronRight size={20} color="#9ca3af" />
  </TouchableOpacity>
</View>

        {/* Botão de Terminar Sessão */}
        <TouchableOpacity 
          onPress={handleLogout}
          style={[globalStyles.calendarCard, { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 }]}
        >
          <LogOut size={20} color="#dc2626" />
          <Text style={{ color: '#dc2626', fontWeight: '600', fontSize: 16 }}>
            Terminar Sessão
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
