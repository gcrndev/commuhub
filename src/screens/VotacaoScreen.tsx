import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  CheckCircle,
  Clock,
  XCircle,
} from 'react-native-feather';

import Svg, { Circle, G } from 'react-native-svg';

import AppHeader from '../components/AppHeader';
import { getVotacoes } from '../services/communityService';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

import type { Votacao } from '../types/models';

export default function VotacaoScreen() {
  const [votacoes, setVotacoes] = useState<Votacao[]>([]);
  const [filter, setFilter] = useState('active');
  const [expandedId, setExpandedId] =
    useState<string | null>(null);

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
          setError(
            'Não foi possível carregar as votações.',
          );
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
        <View style={globalStyles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {['active', 'closed', 'all'].map(f => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                style={[
                  globalStyles.categoryPill,
                  filter === f &&
                    globalStyles.categoryPillActive,
                ]}
              >
                <Text
                  style={[
                    globalStyles.categoryText,
                    filter === f &&
                      globalStyles.categoryTextActive,
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
          <ActivityIndicator
            color={colors.primary}
            style={globalStyles.loaderSpacing}
          />
        ) : error ? (
          <Text style={globalStyles.centeredEmptyText}>
            {error}
          </Text>
        ) : (
          <FlatList
            data={filteredVotacoes}
            keyExtractor={item => item.id}
            contentContainerStyle={
              globalStyles.listBottomSpacing
            }
            ListEmptyComponent={
              <Text style={globalStyles.centeredEmptyText}>
                Nenhuma votação encontrada.
              </Text>
            }
            renderItem={({ item }) => {
              const total =
                item.votes.sim +
                item.votes.nao +
                item.votes.abstencao;

              const simPerc =
                total > 0
                  ? (
                      (item.votes.sim / total) *
                      100
                    ).toFixed(0)
                  : '0';

              const circumference = 251.2;

              const greenStroke =
                total > 0
                  ? (item.votes.sim / total) *
                    circumference
                  : 0;

              const redStroke =
                total > 0
                  ? ((item.votes.sim +
                      item.votes.nao) /
                      total) *
                    circumference
                  : 0;

              return (
                <View
                  style={[
                    globalStyles.docCard,
                    globalStyles.voteCard,
                  ]}
                >
                  <View style={globalStyles.voteHeader}>
                    <View style={globalStyles.flexOne}>
                      <Text
                        style={
                          globalStyles.voteCardTitle
                        }
                      >
                        {item.title}
                      </Text>

                      <Text
                        style={
                          globalStyles.voteDescription
                        }
                      >
                        {item.description}
                      </Text>

                      <View
                        style={
                          globalStyles.voteDeadlineRow
                        }
                      >
                        <Clock
                          stroke={colors.gray}
                          width={14}
                          height={14}
                        />

                        <Text
                          style={
                            globalStyles.voteDeadlineText
                          }
                        >
                          Termina em {item.deadline}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        globalStyles.voteStatusBadge,
                        item.userVoted
                          ? globalStyles.voteStatusSuccess
                          : globalStyles.voteStatusPending,
                      ]}
                    >
                      <Text
                        style={[
                          globalStyles.voteStatusText,
                          item.userVoted
                            ? globalStyles.voteStatusSuccessText
                            : globalStyles.voteStatusPendingText,
                        ]}
                      >
                        {item.userVoted
                          ? 'Votou'
                          : 'Votar'}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={
                      globalStyles.voteProgressContainer
                    }
                  >
                    <View
                      style={
                        globalStyles.voteProgressHeader
                      }
                    >
                      <Text
                        style={
                          globalStyles.voteProgressLabel
                        }
                      >
                        Aprovação
                      </Text>

                      <Text
                        style={
                          globalStyles.voteProgressValue
                        }
                      >
                        {simPerc}%
                      </Text>
                    </View>

                    <View
                      style={
                        globalStyles.progressBarBackground
                      }
                    >
                      <View
                        style={[
                          globalStyles.progressBarFill,
                          {
                            width: `${simPerc}%` as any,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {!item.userVoted && (
                    <View
                      style={
                        globalStyles.voteActionsRow
                      }
                    >
                      <TouchableOpacity
                        style={
                          globalStyles.voteApproveButton
                        }
                      >
                        <CheckCircle
                          stroke="#FFF"
                          width={16}
                          height={16}
                        />

                        <Text
                          style={
                            globalStyles.voteActionText
                          }
                        >
                          A Favor
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={
                          globalStyles.voteRejectButton
                        }
                      >
                        <XCircle
                          stroke="#FFF"
                          width={16}
                          height={16}
                        />

                        <Text
                          style={
                            globalStyles.voteActionText
                          }
                        >
                          Contra
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() =>
                      setExpandedId(
                        expandedId === item.id
                          ? null
                          : item.id,
                      )
                    }
                    style={
                      globalStyles.voteDetailsButton
                    }
                  >
                    <Text
                      style={
                        globalStyles.voteDetailsText
                      }
                    >
                      {expandedId === item.id
                        ? 'Ocultar detalhes'
                        : 'Ver detalhes'}
                    </Text>
                  </TouchableOpacity>

                  {expandedId === item.id && (
                    <View
                      style={
                        globalStyles.voteExpandedSection
                      }
                    >
                      <Text
                        style={
                          globalStyles.voteExpandedTitle
                        }
                      >
                        Distribuição de Votos
                      </Text>

                      <View
                        style={
                          globalStyles.voteChartWrapper
                        }
                      >
                        <View
                          style={
                            globalStyles.voteChartContainer
                          }
                        >
                          <Svg
                            width="140"
                            height="140"
                            viewBox="0 0 100 100"
                          >
                            <G
                              rotation="-90"
                              origin="50, 50"
                            >
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
                            style={
                              globalStyles.voteChartCenter
                            }
                          >
                            <Text
                              style={
                                globalStyles.voteChartTotal
                              }
                            >
                              {total}
                            </Text>

                            <Text
                              style={
                                globalStyles.voteChartLabel
                              }
                            >
                              Votos
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View
                        style={
                          globalStyles.voteStatsRow
                        }
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

const StatItem = ({
  label,
  value,
  color,
}: StatItemProps) => (
  <View style={globalStyles.centerItems}>
    <Text
      style={[
        globalStyles.voteStatValue,
        { color },
      ]}
    >
      {value}
    </Text>

    <Text style={globalStyles.voteStatLabel}>
      {label}
    </Text>
  </View>
);