import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  Alert,
  Switch,
} from 'react-native';

import { useRoute } from '@react-navigation/native';
import { getSupabaseClient } from '../lib/supabase';
import {
  CheckCircle,
  Clock,
  XCircle,
  Edit2,
  HelpCircle,
  Lock,
  Eye,
  Trash2,
} from 'react-native-feather';
import Svg, { Circle, G } from 'react-native-svg';

import AppHeader from '../components/AppHeader';
import {
  getVotacoes,
  deleteVotacao,
  votarEmVotacao,
} from '../services/communityService';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';
import { useAuth } from '../context/AuthContext';

import type { Votacao } from '../types/models';

export default function VotacaoScreen() {
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';

  const [votacoes, setVotacoes] = useState<Votacao[]>([]);
  const [filter, setFilter] = useState('active');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [editingVotacao, setEditingVotacao] = useState<Votacao | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    is_private: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const route = useRoute();
  const highlightVoteId = (route.params as any)?.highlightVoteId;

  useEffect(() => {
    let isMounted = true;

    async function loadVotacoes() {
      try {
        setLoading(true);
        setError(null);

        const data = await getVotacoes(user?.id);

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

  const handleVote = async (
    votacaoId: string,
    opcao: 'sim' | 'nao' | 'abs',
  ) => {
    if (!user) {
      Alert.alert('Erro', 'Precisas de estar autenticado para votar.');
      return;
    }

    try {
      const result = await votarEmVotacao(user.id, votacaoId, opcao);

      if (!result.success) {
        Alert.alert(
          'Aviso',
          result.error || 'Não foi possível registar o voto.',
        );
        return;
      }

      const chaveEstado = opcao === 'abs' ? 'abstencao' : opcao;

      setVotacoes(prevVotacoes =>
        prevVotacoes.map(v =>
          v.id === votacaoId
            ? {
                ...v,
                userVoted: true,
                userVote: opcao,
                totalVoters: v.totalVoters + 1,
                votes: { ...v.votes, [chaveEstado]: v.votes[chaveEstado] + 1 },
              }
            : v,
        ),
      );

      Alert.alert('Sucesso', 'O teu voto foi contabilizado!');
    } catch (err: any) {
      console.error('Erro ao votar:', err);
      Alert.alert('Erro', 'Não foi possível registar o voto: ' + err.message);
    }
  };

  const handleOpenAdd = () => {
    setEditingVotacao(null);
    setFormData({
      title: '',
      description: '',
      deadline: '',
      is_private: false,
    });
    setModalVisible(true);
  };

  const handleOpenEdit = (votacao: Votacao) => {
    setEditingVotacao(votacao);
    setFormData({
      title: votacao.title,
      description: votacao.description,
      deadline: votacao.deadline,
      is_private: votacao.is_private || false,
    });
    setModalVisible(true);
  };

  const handleDeleteVotacao = (votacao: Votacao) => {
    Alert.alert(
      'Eliminar Votação',
      `Tens a certeza que queres eliminar "${votacao.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVotacao(votacao.id);
              setVotacoes(prev => prev.filter(v => v.id !== votacao.id));
              Alert.alert('Sucesso', 'Votação eliminada.');
            } catch (e: any) {
              Alert.alert('Erro', 'Falha ao eliminar: ' + e.message);
            }
          },
        },
      ],
    );
  };

  const handleSaveVotacao = async () => {
    if (!formData.title || !formData.description || !formData.deadline) {
      Alert.alert('Atenção', 'Preencha todos os campos antes de guardar.');
      return;
    }

    // Validação estrita do formato ISO AAAA-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.deadline)) {
      Alert.alert(
        'Erro',
        'O prazo tem de estar rigorosamente no formato AAAA-MM-DD (ex: 2026-12-31).',
      );
      return;
    }

    // Validação lógica do tempo
    const inputDate = new Date(formData.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zerar horas para comparar apenas os dias

    if (isNaN(inputDate.getTime())) {
      Alert.alert('Erro', 'Data inválida. Verifica os valores.');
      return;
    }

    if (inputDate < today) {
      Alert.alert(
        'Erro Lógico',
        'Não podes criar nem editar uma votação para uma data passada.',
      );
      return;
    }

    setIsSaving(true);
    try {
      const supabase = getSupabaseClient();
      if (editingVotacao) {
        const { error } = await supabase
          .from('votacoes')
          .update({
            title: formData.title,
            description: formData.description,
            deadline: formData.deadline,
            is_private: formData.is_private,
          })
          .eq('id', editingVotacao.id);

        if (error) throw error;

        setVotacoes(prevVotacoes =>
          prevVotacoes.map(v =>
            v.id === editingVotacao.id
              ? {
                  ...v,
                  title: formData.title,
                  description: formData.description,
                  deadline: formData.deadline,
                  is_private: formData.is_private,
                }
              : v,
          ),
        );

        Alert.alert('Sucesso', 'Votação atualizada!');
      } else {
        const newVotacaoId = new Date().getTime().toString();

        const { data, error } = await supabase
          .from('votacoes')
          .insert([
            {
              id: newVotacaoId,
              title: formData.title,
              description: formData.description,
              deadline: formData.deadline,
              status: 'active',
              votes_sim: 0,
              votes_nao: 0,
              votes_abstencao: 0,
              total_voters: 0,
              is_private: formData.is_private,
            },
          ])
          .select();

        if (error) throw error;

        const novaVotacao: Votacao = {
          id: data?.[0]?.id || new Date().getTime().toString(),
          title: formData.title,
          description: formData.description,
          deadline: formData.deadline,
          status: 'active',
          userVoted: false,
          votes: { sim: 0, nao: 0, abstencao: 0 },
          totalVoters: 0,
          is_private: formData.is_private,
        };

        setVotacoes([novaVotacao, ...votacoes]);
        Alert.alert('Sucesso', 'Nova votação criada!');
      }

      setModalVisible(false);
    } catch (err: any) {
      console.error('Erro ao guardar votação:', err);
      Alert.alert('Erro', 'Falha ao guardar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Processar datas para auto-encerrar votações caducadas
  const processedVotacoes = votacoes.map(v => {
    const deadlineDate = new Date(v.deadline);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Se a data já passou e a string era válida, força o estado 'closed' visualmente
    const isExpired = !isNaN(deadlineDate.getTime()) && deadlineDate < now;

    return {
      ...v,
      status: isExpired ? 'closed' : v.status,
    };
  });

  const filteredVotacoes = processedVotacoes.filter(v => {
    if (filter === 'all') return true;
    if (filter === 'voted') return v.userVoted;
    // Só mostra no "Por votar" se estiver ativa
    if (filter === 'notvoted') return !v.userVoted && v.status === 'active';
    return v.status === filter;
  });

  useEffect(() => {
    if (highlightVoteId && filteredVotacoes.length > 0) {
      const item = filteredVotacoes.find(v => v.id === highlightVoteId);
      if (item) {
        setTimeout(() => {
          flatListRef.current?.scrollToItem({
            item,
            animated: true,
            viewPosition: 0,
          });
        }, 500);
      }
    }
  }, [highlightVoteId, filteredVotacoes]);

  return (
    <View style={globalStyles.safeArea}>
      <AppHeader
        title="Votações"
        subtitle="Participe das decisões comunitárias"
      />

      <View style={globalStyles.mainContent}>
        <View style={globalStyles.filterWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['active', 'notvoted', 'voted', 'closed', 'all'].map(f => (
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
                    : f === 'voted'
                    ? 'Votadas'
                    : f === 'notvoted'
                    ? 'Por votar'
                    : 'Todas'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {isAdmin && (
          <TouchableOpacity
            style={globalStyles.votacaoCreateButton}
            onPress={handleOpenAdd}
          >
            <Text style={globalStyles.votacaoCreateButtonText}>
              + Criar Nova Votação
            </Text>
          </TouchableOpacity>
        )}

        {loading ? (
          <ActivityIndicator
            color={colors.primary}
            style={globalStyles.loaderSpacing}
          />
        ) : error ? (
          <Text style={globalStyles.centeredEmptyText}>{error}</Text>
        ) : (
          <FlatList
            ref={flatListRef}
            data={filteredVotacoes}
            keyExtractor={item => item.id}
            contentContainerStyle={globalStyles.listBottomSpacing}
            ListEmptyComponent={
              <Text style={globalStyles.centeredEmptyText}>
                Nenhuma votação encontrada.
              </Text>
            }
            renderItem={({ item }) => {
              const total =
                item.votes.sim + item.votes.nao + item.votes.abstencao;
              const simPerc =
                total > 0 ? ((item.votes.sim / total) * 100).toFixed(0) : '0';

              const circumference = 251.2;
              const greenStroke =
                total > 0 ? (item.votes.sim / total) * circumference : 0;
              const redStroke =
                total > 0 ? (item.votes.nao / total) * circumference : 0;
              const grayStroke =
                total > 0 ? (item.votes.abstencao / total) * circumference : 0;

              return (
                <View style={[globalStyles.docCard, globalStyles.voteCard]}>
                  <View style={globalStyles.voteHeader}>
                    <View style={globalStyles.flexOne}>
                      <View style={globalStyles.votacaoTitleRow}>
                        <Text style={[globalStyles.voteCardTitle, globalStyles.votacaoTitleText]}>
                          {item.title}
                        </Text>

                        <View style={globalStyles.votacaoPrivacyBadgeRow}>
                          {item.is_private ? (
                            <View style={globalStyles.votacaoPrivateBadge}>
                              <Lock stroke="#ea4335" width={14} height={14} />
                              <Text style={globalStyles.votacaoPrivateBadgeText}>
                                Privada
                              </Text>
                            </View>
                          ) : (
                            <View style={globalStyles.votacaoPublicBadge}>
                              <Eye stroke="#137333" width={14} height={14} />
                              <Text style={globalStyles.votacaoPublicBadgeText}>
                                Pública
                              </Text>
                            </View>
                          )}
                        </View>

                        {isAdmin && (
                          <View style={globalStyles.votacaoAdminRow}>
                            <TouchableOpacity
                              onPress={() => handleOpenEdit(item)}
                              style={globalStyles.votacaoEditButton}
                            >
                              <Edit2
                                stroke={colors.primary}
                                width={16}
                                height={16}
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleDeleteVotacao(item)}
                              style={globalStyles.votacaoDeleteButton}
                            >
                              <Trash2 stroke="#dc2626" width={16} height={16} />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>

                      <Text style={globalStyles.voteDescription}>
                        {item.description}
                      </Text>

                      <View style={globalStyles.voteDeadlineRow}>
                        <Clock stroke={colors.gray} width={14} height={14} />
                        <Text style={globalStyles.voteDeadlineText}>
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
                        item.status === 'closed' && globalStyles.voteStatusClosed,
                      ]}
                    >
                      <Text
                        style={[
                          globalStyles.voteStatusText,
                          item.userVoted
                            ? globalStyles.voteStatusSuccessText
                            : globalStyles.voteStatusPendingText,
                          item.status === 'closed' && globalStyles.voteStatusClosedText,
                        ]}
                      >
                        {item.status === 'closed'
                          ? 'Fechada'
                          : item.userVoted
                          ? 'Votou'
                          : 'Votar'}
                      </Text>
                    </View>
                  </View>

                  {!item.is_private || isAdmin ? (
                    <View style={globalStyles.voteProgressContainer}>
                      <View style={globalStyles.voteProgressHeader}>
                        <Text style={globalStyles.voteProgressLabel}>
                          Aprovação
                        </Text>
                        <Text style={globalStyles.voteProgressValue}>
                          {simPerc}%
                        </Text>
                      </View>

                      <View style={globalStyles.progressBarBackground}>
                        <View
                          style={[
                            globalStyles.progressBarFill,
                            { width: `${simPerc}%` as any },
                          ]}
                        />
                      </View>
                    </View>
                  ) : (
                    <View style={globalStyles.votacaoPartialsHiddenContainer}>
                      <Text style={globalStyles.votacaoPartialsHiddenText}>
                        Parciais ocultas (Votação Privada)
                      </Text>
                    </View>
                  )}

                  {/* Esconde os botões se o utilizador já votou OU se a votação estiver fechada */}
                  {!item.userVoted && item.status === 'active' && (
                    <View style={globalStyles.voteActionsRow}>
                      <TouchableOpacity
                        style={globalStyles.voteApproveButton}
                        onPress={() => handleVote(item.id, 'sim')}
                      >
                        <CheckCircle stroke="#FFF" width={16} height={16} />
                        <Text style={globalStyles.voteActionText}>A Favor</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={globalStyles.voteAbstention}
                        onPress={() => handleVote(item.id, 'abs')}
                      >
                        <HelpCircle stroke="#FFF" width={16} height={16} />
                        <Text style={globalStyles.voteActionText}>
                          Abster-se
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={globalStyles.voteRejectButton}
                        onPress={() => handleVote(item.id, 'nao')}
                      >
                        <XCircle stroke="#FFF" width={16} height={16} />
                        <Text style={globalStyles.voteActionText}>Contra</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {!item.is_private || isAdmin ? (
                    <TouchableOpacity
                      onPress={() =>
                        setExpandedId(expandedId === item.id ? null : item.id)
                      }
                      style={globalStyles.voteDetailsButton}
                    >
                      <Text style={globalStyles.voteDetailsText}>
                        {expandedId === item.id
                          ? 'Ocultar detalhes'
                          : 'Ver detalhes'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={[
                        globalStyles.voteDetailsButton,
                        globalStyles.votacaoLockedDetailsContainer,
                      ]}
                    >
                      <Lock
                        stroke="#999"
                        width={12}
                        height={12}
                        style={{ marginRight: 5 }}
                      />
                      <Text style={globalStyles.votacaoLockedDetailsText}>
                        Detalhes privados apenas para a gerência
                      </Text>
                    </View>
                  )}

                  {expandedId === item.id && (!item.is_private || isAdmin) && (
                    <View style={globalStyles.voteExpandedSection}>
                      <Text style={globalStyles.voteExpandedTitle}>
                        Distribuição de Votos
                      </Text>

                      <View style={globalStyles.voteChartWrapper}>
                        <View style={globalStyles.voteChartContainer}>
                          <Svg width="140" height="140" viewBox="0 0 100 100">
                            <G rotation="-90" origin="50, 50">
                              <Circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="#f3f4f6"
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
                                strokeDashoffset={0}
                              />
                              <Circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="#9ca3af"
                                strokeWidth="10"
                                fill="none"
                                strokeDasharray={`${grayStroke} ${circumference}`}
                                strokeDashoffset={-redStroke}
                              />
                              <Circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="#2ecc71"
                                strokeWidth="10"
                                fill="none"
                                strokeDasharray={`${greenStroke} ${circumference}`}
                                strokeDashoffset={-(redStroke + grayStroke)}
                              />
                            </G>
                          </Svg>

                          <View style={globalStyles.voteChartCenter}>
                            <Text style={globalStyles.voteChartTotal}>
                              {total}
                            </Text>
                            <Text style={globalStyles.voteChartLabel}>
                              Votos
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={globalStyles.voteStatsRow}>
                        <StatItem
                          label="A Favor"
                          value={item.votes.sim}
                          color="#2ecc71"
                        />
                        <StatItem
                          label="Contra"
                          value={item.votes.nao}
                          color="#ef4444"
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

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={globalStyles.votacaoModalOverlay}>
          <View style={globalStyles.votacaoModalCard}>
            <Text style={globalStyles.votacaoModalTitle}>
              {editingVotacao ? 'Editar Votação' : 'Criar Nova Votação'}
            </Text>

            <TextInput
              placeholder="Título (ex: Pintura do Prédio)"
              style={globalStyles.votacaoInput}
              placeholderTextColor="#999"
              value={formData.title}
              onChangeText={text => setFormData({ ...formData, title: text })}
            />

            <TextInput
              placeholder="Descrição completa..."
              multiline
              numberOfLines={3}
              style={[globalStyles.votacaoInput, globalStyles.votacaoInputMultiline]}
              placeholderTextColor="#999"
              value={formData.description}
              onChangeText={text =>
                setFormData({ ...formData, description: text })
              }
            />

            <TextInput
              placeholder="Prazo (AAAA-MM-DD)"
              style={[globalStyles.votacaoInput, { marginBottom: 15 }]}
              placeholderTextColor="#999"
              value={formData.deadline}
              onChangeText={text =>
                setFormData({ ...formData, deadline: text })
              }
              keyboardType="numeric"
            />

            <View style={globalStyles.votacaoSwitchRow}>
              <View>
                <Text style={globalStyles.votacaoSwitchLabel}>
                  Votação Privada?
                </Text>
                <Text style={globalStyles.votacaoSwitchSublabel}>
                  Condóminos votam mas não veem parciais.
                </Text>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#ea4335' }}
                thumbColor={formData.is_private ? '#fff' : '#f4f3f4'}
                value={formData.is_private}
                onValueChange={value =>
                  setFormData({ ...formData, is_private: value })
                }
              />
            </View>

            <View style={globalStyles.votacaoModalActionsRow}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={globalStyles.votacaoCancelButton}
              >
                <Text style={globalStyles.votacaoCancelButtonText}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveVotacao}
                disabled={isSaving}
                style={[
                  globalStyles.votacaoSaveButton,
                  { backgroundColor: isSaving ? '#9CA3AF' : colors.primary },
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={globalStyles.votacaoSaveButtonText}>
                    Salvar
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

type StatItemProps = {
  label: string;
  value: number;
  color: string;
};

const StatItem = ({ label, value, color }: StatItemProps) => (
  <View style={globalStyles.centerItems}>
    <Text style={[globalStyles.voteStatValue, { color }]}>{value}</Text>
    <Text style={globalStyles.voteStatLabel}>{label}</Text>
  </View>
);
