import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Download,
  FileText,
  Search,
} from 'react-native-feather';

import AppHeader from '../components/AppHeader';
import { getDocumentos } from '../services/communityService';

import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

import type { Documento } from '../types/models';

export default function DocumentosScreen() {
  const [documentos, setDocumentos] = useState<
    Documento[]
  >([]);

  const [selectedCategory, setSelectedCategory] =
    useState('Todos');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null,
  );

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
          setError(
            'Não foi possível carregar os documentos.',
          );
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
    ...Array.from(
      new Set(documentos.map(doc => doc.category)),
    ),
  ];

  const filteredDocs = documentos.filter(doc => {
    const matchesCat =
      selectedCategory === 'Todos' ||
      doc.category === selectedCategory;

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
          <Search
            stroke="#999"
            width={20}
            height={20}
          />

          <TextInput
            style={globalStyles.searchInput}
            placeholder="Pesquisar documentos..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View
          style={
            globalStyles.documentsCategoriesContainer
          }
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() =>
                  setSelectedCategory(cat)
                }
                style={[
                  globalStyles.categoryPill,
                  selectedCategory === cat &&
                    globalStyles.categoryPillActive,
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
          <ActivityIndicator
            color={colors.primary}
            style={globalStyles.loaderSpacing}
          />
        ) : error ? (
          <Text
            style={globalStyles.centeredEmptyText}
          >
            {error}
          </Text>
        ) : (
          <FlatList
            data={filteredDocs}
            keyExtractor={item => item.id}
            contentContainerStyle={
              globalStyles.documentsListContent
            }
            ListEmptyComponent={
              <Text
                style={
                  globalStyles.centeredEmptyText
                }
              >
                Nenhum documento encontrado.
              </Text>
            }
            renderItem={({ item }) => (
              <View style={globalStyles.docCard}>
                <View style={globalStyles.iconBox}>
                  <FileText
                    stroke="#0052FF"
                    width={24}
                    height={24}
                  />
                </View>

                <View
                  style={
                    globalStyles.documentInfo
                  }
                >
                  <Text
                    style={
                      globalStyles.documentTitle
                    }
                  >
                    {item.title}
                  </Text>

                  <View
                    style={
                      globalStyles.documentMetaRow
                    }
                  >
                    <Text
                      style={
                        globalStyles.categoryBadge
                      }
                    >
                      {item.category}
                    </Text>

                    <Text
                      style={
                        globalStyles.documentMeta
                      }
                    >
                      {item.date} • {item.size}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={globalStyles.downloadBtn}
                >
                  <Download
                    stroke="#FFF"
                    width={20}
                    height={20}
                  />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}