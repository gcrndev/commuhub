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
} from 'react-native-feather';

import Svg, { Circle, G } from 'react-native-svg';

import AppHeader from '../components/AppHeader';
import { getVotacoes } from '../services/communityService';
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

  // --- ESTADOS DO MODAL DE ADMIN (CRIAR / EDITAR) ---
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

  // --- FUNÇÃO PARA COMPUTAR O VOTO NO SUPABASE E NA UI ---
  const handleVote = async (votacaoId: string, opcao: 'sim' | 'nao' | 'abs') => {
    try {
      const supabase = getSupabaseClient();
      
      let colunaSupabase = 'votes_sim';
      if (opcao === 'nao') colunaSupabase = 'votes_nao';
      if (opcao === 'abs') colunaSupabase = 'votes_abstencao';

      const chaveEstado = opcao === 'abs' ? 'abstencao' : opcao;

      const votacaoAtual = votacoes.find(v => v.id === votacaoId);
      if (!votacaoAtual) return;

      const novoValorVoto = (votacaoAtual.votes[chaveEstado] || 0) + 1;
      const novoTotalVoters = (votacaoAtual.totalVoters || 0) + 1;

      const { error } = await supabase
        .from('votacoes')
        .update({ 
          [colunaSupabase]: novoValorVoto,
          total_voters: novoTotalVoters
        })
        .eq('id', votacaoId);

      if (error) throw error;

      setVotacoes(prevVotacoes =>
        prevVotacoes.map(v => {
          if (v.id === votacaoId) {
            return {
              ...v,
              userVoted: true,
              totalVoters: novoTotalVoters,
              votes: {
                ...v.votes,
                [chaveEstado]: novoValorVoto
              }
            };
          }
          return v;
        })
      );

      Alert.alert('Sucesso', 'O teu voto foi contabilizado!');
    } catch (err: any) {
      console.error('Erro ao votar:', err);
      Alert.alert('Erro', 'Não foi possível registar o voto: ' + err.message);
    }
  };

  // --- FUNÇÕES DE ADMIN ---
  const handleOpenAdd = () => {
    setEditingVotacao(null);
    setFormData({ title: '', description: '', deadline: '', is_private: false });
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

  const handleSaveVotacao = async () => {
    if (!formData.title || !formData.description || !formData.deadline) {
      Alert.alert('Atenção', 'Preencha todos os campos antes de guardar.');
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
                  is_private: formData.is_private 
                }
              : v
          )
        ); 

        Alert.alert('Sucesso', 'Votação atualizada!'); 
      } else {
        const newVotacaoId = new Date().getTime().toString();

        const { data, error } = await supabase
          .from('votacoes')
          .insert([{
            id: newVotacaoId,
            title: formData.title,
            description: formData.description,
            deadline: formData.deadline,
            status: 'active',
            user_voted: false,
            votes_sim: 0,
            votes_nao: 0,
            votes_abstencao: 0,
            total_voters: 0,
            is_private: formData.is_private
          }])
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
          is_private: formData.is_private
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

  // Filtra as votações APENAS pelo estado da Tab ('active', 'closed', 'voted', 'notvoted', 'all').
  // Todos os utilizadores conseguem ver a listagem.
  const filteredVotacoes = votacoes.filter(v => {
    if (filter === 'all') return true;
    if (filter === 'voted') return v.userVoted;
    if (filter === 'notvoted') return !v.userVoted;
    return v.status === filter;
  });

  useEffect(() => {
    if (highlightVoteId && filteredVotacoes.length > 0) {
      const item = filteredVotacoes.find(v => v.id === highlightVoteId);
      if (item) {
        setTimeout(() => {
          flatListRef.current?.scrollToItem({ item, animated: true, viewPosition: 0 });
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
                  {f === 'active' ? 'Ativas' : f === 'closed' ? 'Encerradas' : f === 'voted' ? 'Votadas' : f === 'notvoted' ? 'Por votar' : 'Todas'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {isAdmin && (
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 14,
              borderRadius: 12,
              marginBottom: 20,
              alignItems: 'center',
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 3,
            }}
            onPress={handleOpenAdd}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
              + Criar Nova Votação
            </Text>
          </TouchableOpacity>
        )}

        {loading ? (
          <ActivityIndicator color={colors.primary} style={globalStyles.loaderSpacing} />
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
              const total = item.votes.sim + item.votes.nao + item.votes.abstencao;
              const simPerc = total > 0 ? ((item.votes.sim / total) * 100).toFixed(0) : '0';

              const circumference = 251.2;
              const greenStroke = total > 0 ? (item.votes.sim / total) * circumference : 0;
              const redStroke = total > 0 ? (item.votes.nao / total) * circumference : 0;
              const grayStroke = total > 0 ? (item.votes.abstencao / total) * circumference : 0;

              return (
                <View style={[globalStyles.docCard, globalStyles.voteCard]}>
                  <View style={globalStyles.voteHeader}>
                    <View style={globalStyles.flexOne}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 10 }}>
                        <Text style={[globalStyles.voteCardTitle, { flex: 1 }]}>
                          {item.title}
                        </Text>
                        
                        {/* Todos os utilizadores veem se o selo é privado, mas o admin ganha o botão de editar */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 5 }}>
                          {item.is_private ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffebe9', padding: 4, borderRadius: 5 }}>
                              <Lock stroke="#ea4335" width={14} height={14} />
                              <Text style={{ color: '#ea4335', fontSize: 10, marginLeft: 3, fontWeight: 'bold' }}>Privada</Text>
                            </View>
                          ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6f4ea', padding: 4, borderRadius: 5 }}>
                              <Eye stroke="#137333" width={14} height={14} />
                              <Text style={{ color: '#137333', fontSize: 10, marginLeft: 3, fontWeight: 'bold' }}>Pública</Text>
                            </View>
                          )}
                        </View>

                        {isAdmin && (
                          <TouchableOpacity 
                            onPress={() => handleOpenEdit(item)}
                            style={{ padding: 6, backgroundColor: '#EEF2FF', borderRadius: 8, marginLeft: 8 }}
                          >
                            <Edit2 stroke={colors.primary} width={16} height={16} />
                          </TouchableOpacity>
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
                        item.userVoted ? globalStyles.voteStatusSuccess : globalStyles.voteStatusPending,
                      ]}
                    >
                      <Text
                        style={[
                          globalStyles.voteStatusText,
                          item.userVoted ? globalStyles.voteStatusSuccessText : globalStyles.voteStatusPendingText,
                        ]}
                      >
                        {item.userVoted ? 'Votou' : 'Votar'}
                      </Text>
                    </View>
                  </View>

                  {/* Barra de Aprovação Geral: Se for privada e o user não for Admin, ocultamos a percentagem */}
                  {(!item.is_private || isAdmin) ? (
                    <View style={globalStyles.voteProgressContainer}>
                      <View style={globalStyles.voteProgressHeader}>
                        <Text style={globalStyles.voteProgressLabel}>Aprovação</Text>
                        <Text style={globalStyles.voteProgressValue}>{simPerc}%</Text>
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
                    <View style={{ paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0', marginTop: 10 }}>
                      <Text style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>Parciais ocultas (Votação Privada)</Text>
                    </View>
                  )}

                  {!item.userVoted && (
                    <View style={globalStyles.voteActionsRow}>
                      <TouchableOpacity style={globalStyles.voteApproveButton} onPress={() => handleVote(item.id, 'sim')}>
                        <CheckCircle stroke="#FFF" width={16} height={16} />
                        <Text style={globalStyles.voteActionText}>A Favor</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={globalStyles.voteAbstention} onPress={() => handleVote(item.id, 'abs')}>
                        <HelpCircle stroke="#FFF" width={16} height={16} />
                        <Text style={globalStyles.voteActionText}>Abster-se</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={globalStyles.voteRejectButton} onPress={() => handleVote(item.id, 'nao')}>
                        <XCircle stroke="#FFF" width={16} height={16} />
                        <Text style={globalStyles.voteActionText}>Contra</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* --- VERIFICAÇÃO DE DETALHES --- */}
                  {/* Se for pública OU se o utilizador for admin, renderiza o botão normalmente */}
                  {(!item.is_private || isAdmin) ? (
                    <TouchableOpacity
                      onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      style={globalStyles.voteDetailsButton}
                    >
                      <Text style={globalStyles.voteDetailsText}>
                        {expandedId === item.id ? 'Ocultar detalhes' : 'Ver detalhes'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    // Se for privada e for condómino, mostra uma mensagem a avisar que os detalhes não estão disponíveis
                    <View style={[globalStyles.voteDetailsButton, { backgroundColor: '#f9f9f9', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}>
                      <Lock stroke="#999" width={12} height={12} style={{ marginRight: 5 }} />
                      <Text style={{ color: '#999', fontSize: 13, fontWeight: '500' }}>
                        Detalhes privados apenas para a gerência
                      </Text>
                    </View>
                  )}

                  {/* Expandido (Gráfico): Só abre se passar na validação de cima */}
                  {expandedId === item.id && (!item.is_private || isAdmin) && (
                    <View style={globalStyles.voteExpandedSection}>
                      <Text style={globalStyles.voteExpandedTitle}>Distribuição de Votos</Text>

                      <View style={globalStyles.voteChartWrapper}>
                        <View style={globalStyles.voteChartContainer}>
                          <Svg width="140" height="140" viewBox="0 0 100 100">
                            <G rotation="-90" origin="50, 50">
                              <Circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="10" fill="none" />
                              <Circle cx="50" cy="50" r="40" stroke="#ef4444" strokeWidth="10" fill="none" strokeDasharray={`${redStroke} ${circumference}`} strokeDashoffset={0} />
                              <Circle cx="50" cy="50" r="40" stroke="#9ca3af" strokeWidth="10" fill="none" strokeDasharray={`${grayStroke} ${circumference}`} strokeDashoffset={-redStroke} />
                              <Circle cx="50" cy="50" r="40" stroke="#2ecc71" strokeWidth="10" fill="none" strokeDasharray={`${greenStroke} ${circumference}`} strokeDashoffset={-(redStroke + grayStroke)} />
                            </G>
                          </Svg>

                          <View style={globalStyles.voteChartCenter}>
                            <Text style={globalStyles.voteChartTotal}>{total}</Text>
                            <Text style={globalStyles.voteChartLabel}>Votos</Text>
                          </View>
                        </View>
                      </View>

                      <View style={globalStyles.voteStatsRow}>
                        <StatItem label="A Favor" value={item.votes.sim} color="#2ecc71" />
                        <StatItem label="Contra" value={item.votes.nao} color="#ef4444" />
                        <StatItem label="Abstenção" value={item.votes.abstencao} color="#9ca3af" />
                      </View>
                    </View>
                  )}
                </View>
              );
            }}
          />
        )}
      </View>

      {/* --- MODAL ADMIN (CRIAR E EDITAR) --- */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>
              {editingVotacao ? 'Editar Votação' : 'Criar Nova Votação'}
            </Text>

            <TextInput
              placeholder="Título (ex: Pintura do Prédio)"
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5, color: '#000', backgroundColor: '#fafafa' }}
              placeholderTextColor="#999"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <TextInput
              placeholder="Descrição completa..."
              multiline
              numberOfLines={3}
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5, color: '#000', backgroundColor: '#fafafa', textAlignVertical: 'top' }}
              placeholderTextColor="#999"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />

            <TextInput
              placeholder="Prazo (ex: 30 de Nov)"
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5, color: '#000', backgroundColor: '#fafafa' }}
              placeholderTextColor="#999"
              value={formData.deadline}
              onChangeText={(text) => setFormData({ ...formData, deadline: text })}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, marginBottom: 15, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee' }}>
              <View>
                <Text style={{ fontWeight: 'bold', color: '#333' }}>Votação Privada?</Text>
                <Text style={{ fontSize: 12, color: '#777' }}>Condóminos votam mas não veem parciais/gráficos.</Text>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#ea4335' }}
                thumbColor={formData.is_private ? '#fff' : '#f4f3f4'}
                value={formData.is_private}
                onValueChange={(value) => setFormData({ ...formData, is_private: value })}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' }}>
                <Text style={{ color: '#6B7280', fontWeight: '600', fontSize: 15 }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveVotacao}
                disabled={isSaving}
                style={{ backgroundColor: isSaving ? '#9CA3AF' : colors.primary, paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12, minWidth: 100, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 }}
              >
                {isSaving ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>Salvar</Text>}
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