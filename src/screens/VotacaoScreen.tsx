import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Clock, CheckCircle, XCircle, MinusCircle } from 'react-native-feather';
import Svg, { G, Circle } from 'react-native-svg';
import AppHeader from '../components/AppHeader';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/colors';

const mockVotacoes = [
  {
    id: '1',
    title: 'Aprovação do Orçamento 2026',
    description: 'Votação para aprovação do orçamento anual da comunidade',
    deadline: '20/04/2026',
    status: 'active',
    userVoted: false,
    votes: { sim: 145, nao: 38, abstencao: 12 },
    totalVoters: 250
  },
  {
    id: '2',
    title: 'Reforma do Regulamento Interno',
    description: 'Alterações propostas aos artigos 5º, 12º e 18º',
    deadline: '25/04/2026',
    status: 'active',
    userVoted: true,
    userVote: 'A Favor',
    votes: { sim: 180, nao: 10, abstencao: 5 },
    totalVoters: 250
  }
];

export default function VotacaoScreen() {
  const [filter, setFilter] = useState('active');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <View style={globalStyles.safeArea}>
      <AppHeader title="Votações" subtitle="Participe das decisões comunitárias" />

      <View style={globalStyles.mainContent}>
        {/* Filtros */}
        <View style={{ height: 60, marginTop: 20 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['active', 'closed', 'all'].map((f) => (
              <TouchableOpacity 
                key={f} 
                onPress={() => setFilter(f)}
                style={[
                  globalStyles.categoryPill, 
                  filter === f && globalStyles.categoryPillActive
                ]}
              >
                <Text style={[
                  globalStyles.categoryText, 
                  filter === f && globalStyles.categoryTextActive
                ]}>
                  {f === 'active' ? 'Ativas' : f === 'closed' ? 'Encerradas' : 'Todas'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={mockVotacoes.filter(v => filter === 'all' || v.status === filter)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const total = item.votes.sim + item.votes.nao + item.votes.abstencao;
            const simPerc = ((item.votes.sim / total) * 100).toFixed(0);
            
            const circumference = 251.2;
            const greenStroke = (item.votes.sim / total) * circumference;
            const redStroke = ((item.votes.sim + item.votes.nao) / total) * circumference;

            return (
              <View style={[globalStyles.docCard, { flexDirection: 'column', alignItems: 'stretch' }]}>
                {/* Header do Card */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textMain }}>{item.title}</Text>
                    <Text style={{ fontSize: 14, color: colors.gray, marginVertical: 4 }}>{item.description}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Clock stroke={colors.gray} width={14} height={14} />
                      <Text style={{ fontSize: 12, color: colors.gray, marginLeft: 5 }}>Termina em {item.deadline}</Text>
                    </View>
                  </View>
                  
                  <View style={{ 
                    backgroundColor: item.userVoted ? '#E8F5E9' : '#FFF3E0', 
                    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, height: 26 
                  }}>
                    <Text style={{ color: item.userVoted ? '#2E7D32' : '#EF6C00', fontSize: 12, fontWeight: 'bold' }}>
                      {item.userVoted ? 'Votou' : 'Votar'}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={{ marginBottom: 15 }}>
                   <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                      <Text style={{ fontSize: 12, color: colors.gray }}>Aprovação</Text>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2ecc71' }}>{simPerc}%</Text>
                   </View>
                  <View style={{ height: 8, backgroundColor: '#EEE', borderRadius: 4 }}>
                    <View 
                      style={{ 
                        width: `${simPerc}%` as any, 
                        height: 8, 
                        backgroundColor: '#2ecc71', 
                        borderRadius: 4 
                      }} 
                    />
                  </View>
                </View>

                {/* Botões de Ação */}
                {!item.userVoted && (
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
                    <TouchableOpacity style={{ flex: 1, backgroundColor: '#2ecc71', padding: 12, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                      <CheckCircle stroke="#FFF" width={16} height={16} />
                      <Text style={{ color: '#FFF', fontWeight: 'bold', marginLeft: 5 }}>A Favor</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1, backgroundColor: '#e74c3c', padding: 12, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                      <XCircle stroke="#FFF" width={16} height={16} />
                      <Text style={{ color: '#FFF', fontWeight: 'bold', marginLeft: 5 }}>Contra</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Ver Detalhes */}
                <TouchableOpacity 
                  onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  style={{ marginTop: 15, paddingVertical: 5 }}
                >
                  <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 14 }}>
                    {expandedId === item.id ? 'Ocultar detalhes' : 'Ver detalhes'}
                  </Text>
                </TouchableOpacity>

                {/* Detalhes Expandidos */}
                {expandedId === item.id && (
                  <View style={{ marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F0F0F0' }}>
                    <Text style={{ fontWeight: 'bold', color: colors.textMain, marginBottom: 15 }}>Distribuição de Votos</Text>
                    
                    <View style={{ alignItems: 'center', marginBottom: 25 }}>
                      <View style={{ width: 140, height: 140, justifyContent: 'center', alignItems: 'center' }}>
                        <Svg width="140" height="140" viewBox="0 0 100 100">
                          <G rotation="-90" origin="50, 50">
                            <Circle cx="50" cy="50" r="40" stroke="#9ca3af" strokeWidth="10" fill="none" />
                            <Circle 
                              cx="50" cy="50" r="40" stroke="#ef4444" strokeWidth="10" fill="none"
                              strokeDasharray={`${redStroke} ${circumference}`}
                            />
                            <Circle 
                              cx="50" cy="50" r="40" stroke="#2ecc71" strokeWidth="10" fill="none"
                              strokeDasharray={`${greenStroke} ${circumference}`}
                            />
                          </G>
                        </Svg>
                        <View style={{ position: 'absolute', alignItems: 'center' }}>
                          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textMain }}>{total}</Text>
                          <Text style={{ fontSize: 12, color: colors.gray }}>Votos</Text>
                        </View>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 10 }}>
                      <StatItem label="A Favor" value={item.votes.sim} color="#2ecc71" />
                      <StatItem label="Contra" value={item.votes.nao} color="#e74c3c" />
                      <StatItem label="Abstenção" value={item.votes.abstencao} color="#9ca3af" />
                    </View>
                  </View>
                )}
              </View>
            );
          }}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </View>
  );
}

const StatItem = ({ label, value, color }: any) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 22, fontWeight: 'bold', color }}>{value}</Text>
    <Text style={{ fontSize: 12, color: colors.gray }}>{label}</Text>
  </View>
);