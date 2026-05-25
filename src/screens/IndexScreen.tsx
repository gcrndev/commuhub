import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native'; /////// Botão votar

import AppHeader from '../components/AppHeader';
import { getEventos, getVotacoes } from '../services/communityService';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';
import type { Evento, Votacao } from '../types/models';

export default function IndexScreen() {
  const navigation = useNavigation(); //  ADDED bot votar

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [votacoes, setVotacoes] = useState<Votacao[]>([]);
  const [loading, setLoading] = useState(true);

  const notificacoes = [
    { id: '1', text: 'Nova votação disponível!' },
    { id: '2', text: 'Evento amanhã às 18h' },
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
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
    .slice(0, 3);

  const votacoesAtivas = votacoes.filter(
    v => v.status === 'active',
  );

  return (
    <View style={globalStyles.safeArea}>
      <AppHeader
        title="Início"
        subtitle="Resumo da comunidade"
      />

      <ScrollView style={globalStyles.mainContent}>
        {loading ? (
          <ActivityIndicator
            color={colors.primary}
            style={globalStyles.loaderSpacing}
          />
        ) : (
          <>
            {/* Notificações */}
            <Text style={globalStyles.sectionTitle}>
              Notificações
            </Text>

            {notificacoes.map(n => (
              <View key={n.id} style={globalStyles.infoCard}>
                <Text style={globalStyles.cardTitle}>
                  {n.text}
                </Text>
              </View>
            ))}

            {/* Eventos */}
            <Text style={globalStyles.sectionTitle}>
              Próximos Eventos
            </Text>

            {proximosEventos.length === 0 ? (
              <Text style={globalStyles.emptyText}>
                Sem eventos próximos.
              </Text>
            ) : (
              proximosEventos.map(event => (
                <View
                  key={event.id}
                  style={globalStyles.infoCard}
                >
                  <Text style={globalStyles.cardTitle}>
                    {event.title}
                  </Text>

                  <Text style={globalStyles.cardSubtitle}>
                    {event.date} • {event.time}
                  </Text>
                </View>
              ))
            )}

            {/* Votações */}
            <Text style={globalStyles.sectionTitle}>
              Votações em Curso
            </Text>

            {votacoesAtivas.length === 0 ? (
              <Text style={globalStyles.emptyText}>
                Sem votações ativas.
              </Text>
            ) : (
              votacoesAtivas.map(v => (
                <View
                  key={v.id}
                  style={globalStyles.infoCard}
                >
                  <Text style={globalStyles.cardTitle}>
                    {v.title}
                  </Text>

                  <Text style={globalStyles.cardSubtitle}>
                    Termina em {v.deadline}
                  </Text>

                  {!v.userVoted && (
                    <TouchableOpacity
                      style={globalStyles.primaryButton}
                      onPress={() => navigation.navigate('Votacao' as never)} // ADDED bot votar
                    >
                      <Text
                        style={globalStyles.primaryButtonText}
                      >
                        Votar agora
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}