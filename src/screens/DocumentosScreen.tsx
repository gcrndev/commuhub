import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ScrollView 
} from 'react-native';
import { Search, Download, FileText } from 'react-native-feather';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/colors';


import AppHeader from '../components/AppHeader'; 

const mockDocumentos = [
  { id: '1', title: 'Ata da Reunião - Março 2026', category: 'Atas', type: 'PDF', date: '28/03/2026', size: '245 KB' },
  { id: '2', title: 'Regulamento Interno', category: 'Regulamentos', type: 'PDF', date: '15/01/2026', size: '1.2 MB' },
  { id: '3', title: 'Relatório Financeiro Q1 2026', category: 'Financeiro', type: 'PDF', date: '01/04/2026', size: '890 KB' },
];

export default function DocumentosScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['Todos', 'Atas', 'Regulamentos', 'Financeiro'];

  const filteredDocs = mockDocumentos.filter(doc => {
    const matchesCat = selectedCategory === 'Todos' || doc.category === selectedCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <View style={globalStyles.safeArea}>
      
      {/* 2. REFERENCIAR O HEADER AQUI */}
      <AppHeader 
        title="Documentos" 
        subtitle="Acesso aos documentos da comunidade" 
      />

      <View style={globalStyles.mainContent}>
        {/* Pesquisa */}
        <View style={globalStyles.searchBarContainer}>
          <Search stroke="#999" width={20} height={20} />
          <TextInput
            style={globalStyles.searchInput}
            placeholder="Pesquisar documentos..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categorias e o resto do teu código... */}
        <View style={{ height: 70, justifyContent: 'center' }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  globalStyles.categoryPill,
                  selectedCategory === cat && globalStyles.categoryPillActive
                ]}
              >
                <Text style={[
                  globalStyles.categoryText,
                  selectedCategory === cat && globalStyles.categoryTextActive
                ]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={filteredDocs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={globalStyles.docCard}>
              <View style={globalStyles.iconBox}>
                <FileText stroke="#0052FF" width={24} height={24} />
              </View>
              
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#333' }}>
                  {item.title}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Text style={{ fontSize: 11, color: '#666', backgroundColor: '#F0F0F0', paddingHorizontal: 6, borderRadius: 4 }}>
                    {item.category}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>
                    {item.date} • {item.size}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={globalStyles.downloadBtn}>
                <Download stroke="#FFF" width={20} height={20} />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 40, color: '#999' }}>
              Nenhum documento encontrado.
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      </View>
    </View>
  );
}