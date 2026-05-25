import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  Alert, // <-- ADICIONA ESTE AQUI
} from 'react-native';

import { getSupabaseClient } from '../lib/supabase'; // <-- ADICIONA O IMPORT DO SUPABASE

import {
  CheckCircle,
  Clock,
  XCircle,
  Edit2, // <-- ADICIONADO PARA O ÍCONE DE EDITAR
} from 'react-native-feather';

import Svg, { Circle, G } from 'react-native-svg';

import AppHeader from '../components/AppHeader';
import { getVotacoes } from '../services/communityService';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';
import { useAuth } from '../context/AuthContext'; // <-- ADICIONADO O CONTEXTO

import type { Votacao } from '../types/models';

export default function VotacaoScreen() {
  const { user } = useAuth(); // <-- BUSCAMOS O UTILIZADOR LOGADO
  const isAdmin = user?.type === 'admin'; // <-- VERIFICAÇÃO DE ADMIN

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
  });

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

  // --- FUNÇÕES DE ADMIN ---
  const handleOpenAdd = () => {
    setEditingVotacao(null); // Limpa para garantir que é uma criação
    setFormData({ title: '', description: '', deadline: '' });
    setModalVisible(true);
  };

  const handleOpenEdit = (votacao: Votacao) => {
    setEditingVotacao(votacao); // Define qual estamos a editar
    setFormData({
      title: votacao.title,
      description: votacao.description,
      deadline: votacao.deadline,
    });
    setModalVisible(true);
  };

const [isSaving, setIsSaving] = useState(false); // Estado para o loading do botão de salvar

const handleSaveVotacao = async () => {
  // 1. Validação simples
  if (!formData.title || !formData.description || !formData.deadline) {
    Alert.alert('Atenção', 'Preencha todos os campos antes de guardar.');
    return;
  }  
  setIsSaving(true);
  try {
    const supabase = getSupabaseClient();  
    if (editingVotacao) {
      // ---- MODO EDIÇÃO ----
      const { error } = await supabase
        .from('votacoes')
        .update({
          title: formData.title,
          description: formData.description,
          deadline: formData.deadline,
        })
        .eq('id', editingVotacao.id);  
      if (error) throw error;  
      // Atualizar o estado local para aparecer logo no ecrã sem ter que recarregar a app
      setVotacoes(prevVotacoes =>
        prevVotacoes.map(v =>
          v.id === editingVotacao.id
            ? { ...v, title: formData.title, description: formData.description, deadline:  formData.deadline }
            : v
        )
      ); 
      Alert.alert('Sucesso', 'Votação atualizada!'); 
    } else {
// ---- MODO CRIAÇÃO ----
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
            total_voters: 0
          }])
          .select(); 

        if (error) throw error;

        // Criar o objeto para injetar na lista da tela (este mantém o formato do modelo Votacao)
        const novaVotacao: Votacao = {
          id: data?.[0]?.id || newVotacaoId,
          title: formData.title,
          description: formData.description,
          deadline: formData.deadline,
          status: 'active',
          userVoted: false,
          votes: { sim: 0, nao: 0, abstencao: 0 },
          totalVoters: 0
        };

        // Injetar a nova votação no topo da lista
        setVotacoes([novaVotacao, ...votacoes]);
        
        Alert.alert('Sucesso', 'Nova votação criada!');
    }  
    setModalVisible(false); // Fecha o modal
  } catch (error: any) {
    console.error('Erro ao guardar votação:', error);
    Alert.alert('Erro', 'Falha ao guardar: ' + error.message);
  } finally {
    setIsSaving(false);
  }
};
  // ------------------------

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
                  {f === 'active' ? 'Ativas' : f === 'closed' ? 'Encerradas' : 'Todas'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* --- BOTÃO GLOBAL SÓ PARA ADMINS --- */}
        {isAdmin && (
          <TouchableOpacity
            style={{
              backgroundColor: '#28a745',
              padding: 12,
              borderRadius: 8,
              marginBottom: 15,
            }}
            onPress={handleOpenAdd}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              + CRIAR NOVA VOTAÇÃO
            </Text>
          </TouchableOpacity>
        )}

        {loading ? (
          <ActivityIndicator color={colors.primary} style={globalStyles.loaderSpacing} />
        ) : error ? (
          <Text style={globalStyles.centeredEmptyText}>{error}</Text>
        ) : (
          <FlatList
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
              const redStroke = total > 0 ? ((item.votes.sim + item.votes.nao) / total) * circumference : 0;

              return (
                <View style={[globalStyles.docCard, globalStyles.voteCard]}>
                  <View style={globalStyles.voteHeader}>
                    <View style={globalStyles.flexOne}>
                      
                      {/* TÍTULO E BOTÃO DE EDITAR */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 10 }}>
                        <Text style={[globalStyles.voteCardTitle, { flex: 1 }]}>
                          {item.title}
                        </Text>
                        
                        {/* BOTÃO EDITAR SÓ PARA ADMINS */}
                        {isAdmin && (
                          <TouchableOpacity 
                            onPress={() => handleOpenEdit(item)}
                            style={{ padding: 5, backgroundColor: '#f0f0f0', borderRadius: 5, marginLeft: 10 }}
                          >
                            <Edit2 stroke="#0052FF" width={18} height={18} />
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

                  {!item.userVoted && (
                    <View style={globalStyles.voteActionsRow}>
                      <TouchableOpacity style={globalStyles.voteApproveButton}>
                        <CheckCircle stroke="#FFF" width={16} height={16} />
                        <Text style={globalStyles.voteActionText}>A Favor</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={globalStyles.voteRejectButton}>
                        <XCircle stroke="#FFF" width={16} height={16} />
                        <Text style={globalStyles.voteActionText}>Contra</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    style={globalStyles.voteDetailsButton}
                  >
                    <Text style={globalStyles.voteDetailsText}>
                      {expandedId === item.id ? 'Ocultar detalhes' : 'Ver detalhes'}
                    </Text>
                  </TouchableOpacity>

                  {expandedId === item.id && (
                    <View style={globalStyles.voteExpandedSection}>
                      <Text style={globalStyles.voteExpandedTitle}>Distribuição de Votos</Text>
                      <View style={globalStyles.voteChartWrapper}>
                        <View style={globalStyles.voteChartContainer}>
                          <Svg width="140" height="140" viewBox="0 0 100 100">
                            <G rotation="-90" origin="50, 50">
                              <Circle cx="50" cy="50" r="40" stroke="#9ca3af" strokeWidth="10" fill="none" />
                              <Circle cx="50" cy="50" r="40" stroke="#ef4444" strokeWidth="10" fill="none" strokeDasharray={`${redStroke} ${circumference}`} />
                              <Circle cx="50" cy="50" r="40" stroke="#2ecc71" strokeWidth="10" fill="none" strokeDasharray={`${greenStroke} ${circumference}`} />
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
                        <StatItem label="Contra" value={item.votes.nao} color="#e74c3c" />
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

      {/* --- INÍCIO DO MODAL ADMIN (CRIAR E EDITAR) --- */}
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

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 12 }}>
                <Text style={{ color: 'red', fontWeight: 'bold' }}>Cancelar</Text>
              </TouchableOpacity>
              
            <TouchableOpacity
              onPress={handleSaveVotacao}
              disabled={isSaving}
              style={{ 
                backgroundColor: isSaving ? '#999' : '#0052FF', 
                padding: 12, 
                borderRadius: 8, 
                paddingHorizontal: 25,
                minWidth: 100,
                alignItems: 'center'
              }}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Salvar</Text>
              )}
            </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
      {/* --- FIM DO MODAL ADMIN --- */}

    </View>
  );
}

// --- Componente auxiliar lá de baixo ---
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
