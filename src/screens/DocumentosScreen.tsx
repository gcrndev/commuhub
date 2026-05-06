import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Download, FileText, Search } from 'react-native-feather';

import AppHeader from '../components/AppHeader';
import { getDocumentos } from '../services/communityService';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';
import type { Documento } from '../types/models';

export default function DocumentosScreen() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDocumentos() {
      try {
        setLoading(true);
        setError(null);
        const data = await getDocumentos();

        if (isMounted) {
          setDocumentos(data);
        }
      } catch {
        if (isMounted) {
          setError('Não foi possível carregar os documentos.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDocumentos();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    'Todos',
    ...Array.from(new Set(documentos.map(doc => doc.category))),
  ];

  const filteredDocs = documentos.filter(doc => {
    const matchesCat =
      selectedCategory === 'Todos' || doc.category === selectedCategory;
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <View style={globalStyles.safeArea}>
      <AppHeader
        title="Documentos"
        subtitle="Acesso aos documentos da comunidade"
      />

      <View style={globalStyles.mainContent}>
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

        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  globalStyles.categoryPill,
                  selectedCategory === cat && globalStyles.categoryPillActive,
                ]}
              >
                <Text
                  style={[
                    globalStyles.categoryText,
                    selectedCategory === cat &&
                      globalStyles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.state} />
        ) : error ? (
          <Text style={styles.stateText}>{error}</Text>
        ) : (
          <FlatList
            data={filteredDocs}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={globalStyles.docCard}>
                <View style={globalStyles.iconBox}>
                  <FileText stroke="#0052FF" width={24} height={24} />
                </View>

                <View style={styles.documentInfo}>
                  <Text style={styles.documentTitle}>{item.title}</Text>
                  <View style={styles.documentMetaRow}>
                    <Text style={styles.categoryBadge}>{item.category}</Text>
                    <Text style={styles.documentMeta}>
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
              <Text style={styles.stateText}>Nenhum documento encontrado.</Text>
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  categoriesContainer: {
    height: 70,
    justifyContent: 'center',
  },
  state: {
    marginTop: 40,
  },
  stateText: {
    color: '#999',
    marginTop: 40,
    textAlign: 'center',
  },
  documentInfo: {
    flex: 1,
    marginLeft: 15,
  },
  documentTitle: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
  documentMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 4,
  },
  categoryBadge: {
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    color: '#666',
    fontSize: 11,
    paddingHorizontal: 6,
  },
  documentMeta: {
    color: '#999',
    fontSize: 12,
    marginLeft: 8,
  },
  listContent: {
    paddingBottom: 30,
  },
});
