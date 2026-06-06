import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Vote, Clock, X, MapPin, Calendar, FileText } from 'lucide-react-native';

import AppHeader from '../components/AppHeader';
import { getEventos, getDocumentos, getVotacoes, getNotifications, markNotificationsRead } from '../services/communityService';
import { globalStyles } from '../styles/globalStyles';
import { useAuth } from '../context/AuthContext';
import type { Evento, Votacao, Documento, Notification } from '../types/models';
import type { RootTabParamList } from '../navigation/TabNavigator';

type NavProp = BottomTabNavigationProp<RootTabParamList>;

// Cor principal da tua app (substitui pelo teu HEX se for diferente)
const PRIMARY_COLOR = '#2563EB'; 

export default function IndexScreen() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [votacoes, setVotacoes] = useState<Votacao[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [eventosData, votacoesData, documentosData] = await Promise.all([
          getEventos(),
          getVotacoes(),
          getDocumentos(),
        ]);
        setEventos(eventosData);
        setVotacoes(votacoesData);
        setDocumentos(documentosData);

        if (user) {
          const notifs = await getNotifications(user.id);
          setNotificacoes(notifs);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const proximosEventos = [...eventos]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const votacoesAtivas = votacoes
    .filter(v => v.status === 'active')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const pendentes = votacoesAtivas.filter(v => !v.userVoted);

  const now = new Date();
  const mesAtual = now.getMonth();
  const anoAtual = now.getFullYear();

  const stats = {
    eventos: eventos.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    }).length,
    documentos: documentos.filter(d => {
      const date = new Date(d.date);
      return date.getMonth() === mesAtual && date.getFullYear() === anoAtual;
    }).length,
    votacoes: votacoesAtivas.length,
  };

  const formatDeadline = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

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
    <View style={globalStyles.indexContainer}>
      <AppHeader
        title="Início"
        subtitle="Resumo da tua comunidade"
        onNotificationPress={() => {
          setShowNotifications(true);
          if (user) {
            markNotificationsRead(user.id).catch(() => {});
          }
          setNotificacoes(prev => prev.map(n => ({ ...n, read: true })));
        }}
        hasNotifications={notificacoes.some(n => !n.read)}
      />

      <ScrollView 
        style={globalStyles.indexScrollArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
      >
        {loading ? (
          <ActivityIndicator color={PRIMARY_COLOR} style={{ marginTop: 60 }} size="large" />
        ) : (
          <>
            <View style={globalStyles.indexStatsBar}>
              <View style={globalStyles.indexStatsItem}>
                <Calendar size={18} color={PRIMARY_COLOR} />
                <Text style={globalStyles.indexStatsValue}>{stats.eventos}</Text>
                <Text style={globalStyles.indexStatsLabel}>Eventos</Text>
              </View>
              <View style={globalStyles.indexStatsDivider} />
              <View style={globalStyles.indexStatsItem}>
                <FileText size={18} color={PRIMARY_COLOR} />
                <Text style={globalStyles.indexStatsValue}>{stats.documentos}</Text>
                <Text style={globalStyles.indexStatsLabel}>Documentos</Text>
              </View>
              <View style={globalStyles.indexStatsDivider} />
              <View style={globalStyles.indexStatsItem}>
                <Vote size={18} color={PRIMARY_COLOR} />
                <Text style={globalStyles.indexStatsValue}>{stats.votacoes}</Text>
                <Text style={globalStyles.indexStatsLabel}>Votações</Text>
              </View>
            </View>

            <Text style={globalStyles.indexSectionTitle}>Próximos Eventos</Text>
            {proximosEventos.length === 0 ? (
              <Text style={globalStyles.indexEmptyText}>Sem eventos próximos.</Text>
            ) : (
              proximosEventos.map(event => {
                const { day, month } = getDayAndMonth(event.date);
                return (
                  <View key={event.id} style={globalStyles.indexCard}>
                    <View style={globalStyles.indexDateBlock}>
                      <Text style={globalStyles.indexDateDay}>{day}</Text>
                      <Text style={globalStyles.indexDateMonth}>{month}</Text>
                    </View>
                    
                    <View style={globalStyles.indexCardContent}>
                      <Text style={globalStyles.indexCardTitle} numberOfLines={1}>{event.title}</Text>
                      <View style={globalStyles.indexRowInfo}>
                        <Clock size={14} color="#6B7280" style={{ marginRight: 6 }} />
                        <Text style={globalStyles.indexCardSubtitle}>{event.time}</Text>
                      </View>
                      {event.location && (
                        <View style={globalStyles.indexRowInfo}>
                          <MapPin size={14} color="#6B7280" style={{ marginRight: 6 }} />
                          <Text style={globalStyles.indexCardSubtitle} numberOfLines={1}>{event.location}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}

            <View style={globalStyles.indexSectionHeaderRow}>
              <Text style={globalStyles.indexSectionTitle}>Votações</Text>
              {pendentes.length > 0 && (
                <View style={globalStyles.indexVoteCountBadge}>
                  <Text style={globalStyles.indexVoteCountText}>{pendentes.length} por votar</Text>
                </View>
              )}
            </View>

            {votacoesAtivas.length === 0 ? (
              <Text style={globalStyles.indexEmptyText}>Sem votações ativas de momento.</Text>
            ) : pendentes.length > 0 ? (
              <>
                {pendentes.slice(0, 3).map(v => {
                  return (
                    <View key={v.id} style={[globalStyles.indexCard, globalStyles.indexVoteCardStyle]}>
                      <View style={globalStyles.indexVoteRow}>
                        <View style={globalStyles.indexIconCircle}>
                          <Vote size={20} color={PRIMARY_COLOR} />
                        </View>
                        <View style={globalStyles.indexCardContent}>
                          <Text style={globalStyles.indexCardTitle} numberOfLines={1}>{v.title}</Text>
                          <Text style={globalStyles.indexVoteDeadline}>Termina em {formatDeadline(v.deadline)}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={globalStyles.indexPrimaryButton}
                        onPress={() => navigation.navigate('Votacoes', { highlightVoteId: v.id })}
                      >
                        <Text style={globalStyles.indexPrimaryButtonText}>Votar agora</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
                {pendentes.length > 3 && (
                  <TouchableOpacity
                    style={globalStyles.indexSeeMoreButton}
                    onPress={() => navigation.navigate('Votacoes')}
                  >
                    <Text style={globalStyles.indexSeeMoreText}>
                      Ver mais {pendentes.length - 3} votações
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : null}
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
        <View style={globalStyles.indexModalOverlay}>
          <View style={globalStyles.indexModalContent}>
            <View style={globalStyles.indexModalHeader}>
              <Text style={globalStyles.indexModalTitle}>Notificações</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)} style={globalStyles.indexCloseButton}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {notificacoes.length === 0 ? (
                <Text style={globalStyles.indexEmptyText}>Tens tudo em dia.</Text>
              ) : (
                notificacoes.map(n => (
                  <View key={n.id} style={[globalStyles.indexNotificationItem, !n.read && { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}>
                    <View style={[globalStyles.indexNotificationDot, !n.read && { backgroundColor: '#2563EB' }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[globalStyles.indexNotificationText, { fontWeight: n.read ? '400' : '600' }]}>{n.title}</Text>
                      <Text style={[globalStyles.indexNotificationText, { color: '#6B7280', fontSize: 13, marginTop: 2 }]}>{n.body}</Text>
                    </View>
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

