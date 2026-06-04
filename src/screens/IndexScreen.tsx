import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { Vote, Clock, X, MapPin } from 'lucide-react-native';

import AppHeader from '../components/AppHeader';
import { getEventos, getVotacoes } from '../services/communityService';
import type { Evento, Votacao } from '../types/models';

// Cor principal da tua app (substitui pelo teu HEX se for diferente)
const PRIMARY_COLOR = '#2563EB'; 

export default function IndexScreen() {
  const navigation = useNavigation();

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [votacoes, setVotacoes] = useState<Votacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // TODO: colocar as verdadeiras notificações a vir para aqui
  const notificacoes = [
    { id: '1', text: 'Nova votação disponível: Orçamento 2026' },
    { id: '2', text: 'Lembrete: Reunião de Condomínio amanhã às 18h' },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [eventosData, votacoesData] = await Promise.all([
          getEventos(),
          getVotacoes(),
        ]);
        setEventos(eventosData);
        setVotacoes(votacoesData);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const proximosEventos = [...eventos]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const votacoesAtivas = votacoes.filter(v => v.status === 'active');

  const getDayAndMonth = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { day: '--', month: '---' };
      return {
        day: d.getDate().toString().padStart(2, '0'),
        month: d.toLocaleDateString('pt-PT', { month: 'short' }).toUpperCase().replace('.', '')
      };
    } catch {
      return { day: '--', month: '---' };
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Início"
        subtitle="Resumo da tua comunidade"
        onNotificationPress={() => setShowNotifications(true)}
        hasNotifications={notificacoes.length > 0}
      />

      <ScrollView 
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
      >
        {loading ? (
          <ActivityIndicator color={PRIMARY_COLOR} style={{ marginTop: 60 }} size="large" />
        ) : (
          <>
            <Text style={styles.sectionTitle}>Próximos Eventos</Text>
            {proximosEventos.length === 0 ? (
              <Text style={styles.emptyText}>Sem eventos próximos.</Text>
            ) : (
              proximosEventos.map(event => {
                const { day, month } = getDayAndMonth(event.date);
                return (
                  <View key={event.id} style={styles.card}>
                    <View style={styles.dateBlock}>
                      <Text style={styles.dateDay}>{day}</Text>
                      <Text style={styles.dateMonth}>{month}</Text>
                    </View>
                    
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{event.title}</Text>
                      <View style={styles.rowInfo}>
                        <Clock size={14} color="#6B7280" style={{ marginRight: 6 }} />
                        <Text style={styles.cardSubtitle}>{event.time}</Text>
                      </View>
                      {event.location && (
                        <View style={styles.rowInfo}>
                          <MapPin size={14} color="#6B7280" style={{ marginRight: 6 }} />
                          <Text style={styles.cardSubtitle} numberOfLines={1}>{event.location}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}

            <Text style={styles.sectionTitle}>Votações em Curso</Text>
            {votacoesAtivas.length === 0 ? (
              <Text style={styles.emptyText}>Sem votações ativas de momento.</Text>
            ) : (
              votacoesAtivas.map(v => (
                <View key={v.id} style={[styles.card, { flexDirection: 'column', alignItems: 'stretch' }]}>
                  <View style={styles.voteHeader}>
                    <View style={styles.iconCircle}>
                      <Vote size={20} color={PRIMARY_COLOR} />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle} numberOfLines={2}>{v.title}</Text>
                      <Text style={styles.cardSubtitle}>Termina em: {v.deadline}</Text>
                    </View>
                  </View>

                  {!v.userVoted && (
                    <TouchableOpacity
                      style={styles.primaryButton}
                      onPress={() => navigation.navigate('Votacoes' as never)}
                    >
                      <Text style={styles.primaryButtonText}>Votar agora</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* MODAL DE NOTIFICAÇÕES (Centralizado e Elegante) */}
      <Modal
        visible={showNotifications}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notificações</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)} style={styles.closeButton}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {notificacoes.length === 0 ? (
                <Text style={styles.emptyText}>Tens tudo em dia.</Text>
              ) : (
                notificacoes.map(n => (
                  <View key={n.id} style={styles.notificationItem}>
                    <View style={styles.notificationDot} />
                    <Text style={styles.notificationText}>{n.text}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Fundo cinza ultra-claro (Moderno)
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 24,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  card: {
    backgroundColor: '#FFFFFF', // Cartão branco puro
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    // Sombra premium
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3, 
    borderWidth: 1,
    borderColor: '#F3F4F6', // Borda super subtil
  },
  dateBlock: {
    backgroundColor: '#EEF2FF', // Azul muito claro
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  dateDay: {
    fontSize: 22,
    fontWeight: '800',
    color: PRIMARY_COLOR,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    marginTop: -2,
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  rowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 30,
  },
  voteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    backgroundColor: '#EEF2FF',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Fundo escurecido
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 50,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY_COLOR,
    marginTop: 6,
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});