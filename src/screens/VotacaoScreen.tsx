import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CheckCircle, Clock, XCircle } from 'react-native-feather';
import Svg, { Circle, G } from 'react-native-svg';

import AppHeader from '../components/AppHeader';
import { getVotacoes } from '../services/communityService';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';
import type { Votacao } from '../types/models';

export default function VotacaoScreen() {
  const [votacoes, setVotacoes] = useState<Votacao[]>([]);
  const [filter, setFilter] = useState('active');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadVotacoes() {
      try {
        setLoading(true);
        setError(null);
        const data = await getVotacoes();

        if (isMounted) {
          setVotacoes(data);
        }
      } catch {
        if (isMounted) {
          setError('Não foi possível carregar as votações.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadVotacoes();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredVotacoes = votacoes.filter(
    v => filter === 'all' || v.status === filter,
  );

  return (
    <View style={globalStyles.safeArea}>
      <AppHeader
        title="Votações"
        subtitle="Participe das decisões comunitárias"
      />

      <View style={globalStyles.mainContent}>
        <View style={{ height: 60, marginTop: 20 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['active', 'closed', 'all'].map(f => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                style={[
                  globalStyles.categoryPill,
                  filter === f && globalStyles.categoryPillActive,
                ]}
              >
                <Text
                  style={[
                    globalStyles.categoryText,
                    filter === f && globalStyles.categoryTextActive,
                  ]}
                >
                  {f === 'active'
                    ? 'Ativas'
                    : f === 'closed'
                      ? 'Encerradas'
                      : 'Todas'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : error ? (
          <Text style={{ color: '#999', marginTop: 40, textAlign: 'center' }}>
            {error}
          </Text>
        ) : (
          <FlatList
            data={filteredVotacoes}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const total =
                item.votes.sim + item.votes.nao + item.votes.abstencao;
              const simPerc =
                total > 0 ? ((item.votes.sim / total) * 100).toFixed(0) : '0';

              const circumference = 251.2;
              const greenStroke =
                total > 0 ? (item.votes.sim / total) * circumference : 0;
              const redStroke =
                total > 0
                  ? ((item.votes.sim + item.votes.nao) / total) *
                    circumference
                  : 0;

              return (
                <View
                  style={[
                    globalStyles.docCard,
                    { alignItems: 'stretch', flexDirection: 'column' },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: colors.textMain,
                          fontSize: 18,
                          fontWeight: 'bold',
                        }}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={{
                          color: colors.gray,
                          fontSize: 14,
                          marginVertical: 4,
                        }}
                      >
                        {item.description}
                      </Text>
                      <View
                        style={{ alignItems: 'center', flexDirection: 'row' }}
                      >
                        <Clock stroke={colors.gray} width={14} height={14} />
                        <Text
                          style={{
                            color: colors.gray,
                            fontSize: 12,
                            marginLeft: 5,
                          }}
                        >
                          Termina em {item.deadline}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        backgroundColor: item.userVoted
                          ? '#E8F5E9'
                          : '#FFF3E0',
                        borderRadius: 12,
                        height: 26,
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: item.userVoted ? '#2E7D32' : '#EF6C00',
                          fontSize: 12,
                          fontWeight: 'bold',
                        }}
                      >
                        {item.userVoted ? 'Votou' : 'Votar'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ marginBottom: 15 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 5,
                      }}
                    >
                      <Text style={{ color: colors.gray, fontSize: 12 }}>
                        Aprovação
                      </Text>
                      <Text
                        style={{
                          color: '#2ecc71',
                          fontSize: 12,
                          fontWeight: 'bold',
                        }}
                      >
                        {simPerc}%
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: '#EEE',
                        borderRadius: 4,
                        height: 8,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: '#2ecc71',
                          borderRadius: 4,
                          height: 8,
                          width: `${simPerc}%` as any,
                        }}
                      />
                    </View>
                  </View>

                  {!item.userVoted && (
                    <View
                      style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}
                    >
                      <TouchableOpacity
                        style={{
                          alignItems: 'center',
                          backgroundColor: '#2ecc71',
                          borderRadius: 8,
                          flex: 1,
                          flexDirection: 'row',
                          justifyContent: 'center',
                          padding: 12,
                        }}
                      >
                        <CheckCircle stroke="#FFF" width={16} height={16} />
                        <Text
                          style={{
                            color: '#FFF',
                            fontWeight: 'bold',
                            marginLeft: 5,
                          }}
                        >
                          A Favor
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          alignItems: 'center',
                          backgroundColor: '#e74c3c',
                          borderRadius: 8,
                          flex: 1,
                          flexDirection: 'row',
                          justifyContent: 'center',
                          padding: 12,
                        }}
                      >
                        <XCircle stroke="#FFF" width={16} height={16} />
                        <Text
                          style={{
                            color: '#FFF',
                            fontWeight: 'bold',
                            marginLeft: 5,
                          }}
                        >
                          Contra
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() =>
                      setExpandedId(expandedId === item.id ? null : item.id)
                    }
                    style={{ marginTop: 15, paddingVertical: 5 }}
                  >
                    <Text
                      style={{
                        color: colors.primary,
                        fontSize: 14,
                        fontWeight: 'bold',
                      }}
                    >
                      {expandedId === item.id
                        ? 'Ocultar detalhes'
                        : 'Ver detalhes'}
                    </Text>
                  </TouchableOpacity>

                  {expandedId === item.id && (
                    <View
                      style={{
                        borderTopColor: '#F0F0F0',
                        borderTopWidth: 1,
                        marginTop: 15,
                        paddingTop: 15,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.textMain,
                          fontWeight: 'bold',
                          marginBottom: 15,
                        }}
                      >
                        Distribuição de Votos
                      </Text>

                      <View style={{ alignItems: 'center', marginBottom: 25 }}>
                        <View
                          style={{
                            alignItems: 'center',
                            height: 140,
                            justifyContent: 'center',
                            width: 140,
                          }}
                        >
                          <Svg width="140" height="140" viewBox="0 0 100 100">
                            <G rotation="-90" origin="50, 50">
                              <Circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="#9ca3af"
                                strokeWidth="10"
                                fill="none"
                              />
                              <Circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="#ef4444"
                                strokeWidth="10"
                                fill="none"
                                strokeDasharray={`${redStroke} ${circumference}`}
                              />
                              <Circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="#2ecc71"
                                strokeWidth="10"
                                fill="none"
                                strokeDasharray={`${greenStroke} ${circumference}`}
                              />
                            </G>
                          </Svg>
                          <View
                            style={{
                              alignItems: 'center',
                              position: 'absolute',
                            }}
                          >
                            <Text
                              style={{
                                color: colors.textMain,
                                fontSize: 20,
                                fontWeight: 'bold',
                              }}
                            >
                              {total}
                            </Text>
                            <Text style={{ color: colors.gray, fontSize: 12 }}>
                              Votos
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-around',
                          paddingBottom: 10,
                        }}
                      >
                        <StatItem
                          label="A Favor"
                          value={item.votes.sim}
                          color="#2ecc71"
                        />
                        <StatItem
                          label="Contra"
                          value={item.votes.nao}
                          color="#e74c3c"
                        />
                        <StatItem
                          label="Abstenção"
                          value={item.votes.abstencao}
                          color="#9ca3af"
                        />
                      </View>
                    </View>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={{ color: '#999', marginTop: 40, textAlign: 'center' }}>
                Nenhuma votação encontrada.
              </Text>
            }
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </View>
  );
}

type StatItemProps = {
  label: string;
  value: number;
  color: string;
};

const StatItem = ({ label, value, color }: StatItemProps) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ color, fontSize: 22, fontWeight: 'bold' }}>{value}</Text>
    <Text style={{ color: colors.gray, fontSize: 12 }}>{label}</Text>
  </View>
);
