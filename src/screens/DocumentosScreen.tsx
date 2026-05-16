import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Linking, Alert } from 'react-native';
import { getSupabaseClient } from '../lib/supabase';

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

  // buscar quem fez login
  const { user } = useAuth();

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

const handleOpenDocument = async (filePath?: string) => {
  if (!filePath) {
    Alert.alert(
      'Erro',
      'Este documento não tem um ficheiro físico associado no servidor.',
    );
    return;
  }

  try {
    const supabase = getSupabaseClient();

    const { data } = supabase.storage.from('documentos').getPublicUrl(filePath);

    if (!data.publicUrl) {
      throw new Error('Não foi possível gerar a URL pública.');
    }
    // O bloco catch apanha o erro se o telemóvel se telemovel for lento e nao tiver browser.
    await Linking.openURL(data.publicUrl);
  } catch (error) {
    console.error('Erro ao abrir documento:', error);
    Alert.alert(
      'Erro',
      'Não tens nenhuma aplicação instalada para abrir este ficheiro.',
    );
  }
};

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

        {/* --- INÍCIO DO BLOCO DE TESTE DE PERMISSÕES --- */}
        {/* {//TODO: se alguem depois puder colocar isto no ficheiros do estilos para ficar organizado tks}} */}

        <View
          style={{
            marginVertical: 10,
            padding: 10,
            backgroundColor: '#f0f0f0',
            borderRadius: 8,
          }}
        >
          <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>
            Estás logado como: {user?.username} ({user?.type})
          </Text>

          {user?.type === 'admin' && (
            <TouchableOpacity
              style={{
                backgroundColor: '#28a745',
                padding: 12,
                marginTop: 10,
                borderRadius: 8,
              }}
              onPress={() => console.log('Abrir modal de upload')}
            >
              <Text
                style={{
                  color: 'white',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                + ADICIONAR DOCUMENTO (Só para Admins)
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {/* --- FIM DO BLOCO DE TESTE DE PERMISSÕES --- */}

        <View style={globalStyles.documentsCategoriesContainer}>
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
                    selectedCategory === cat && globalStyles.categoryTextActive,
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
          <Text style={globalStyles.centeredEmptyText}>{error}</Text>
        ) : (
          <FlatList
            data={filteredDocs}
            keyExtractor={item => item.id}
            contentContainerStyle={globalStyles.documentsListContent}
            ListEmptyComponent={
              <Text style={globalStyles.centeredEmptyText}>
                Nenhum documento encontrado.
              </Text>
            }
            renderItem={({ item }) => (
              <View style={globalStyles.docCard}>
                <View style={globalStyles.iconBox}>
                  <FileText stroke="#0052FF" width={24} height={24} />
                </View>

                <View style={globalStyles.documentInfo}>
                  <Text style={globalStyles.documentTitle}>{item.title}</Text>

                  <View style={globalStyles.documentMetaRow}>
                    <Text style={globalStyles.categoryBadge}>
                      {item.category}
                    </Text>

                    <Text style={globalStyles.documentMeta}>
                      {item.date} • {item.size}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={globalStyles.downloadBtn}
                  // TODO: Ligar ao ficheiro real
                  onPress={() => handleOpenDocument(item.filePath)}
                >
                  <Download stroke="#FFF" width={20} height={20} />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}