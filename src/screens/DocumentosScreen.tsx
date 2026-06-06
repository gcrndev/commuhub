import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Linking, Alert } from 'react-native';
import { getSupabaseClient } from '../lib/supabase';
import { launchImageLibrary } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';

import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';

const CATEGORIAS_OPCOES = [
  'Atas de assembleia',
  'Relatórios financeiros e balancetes',
  'Regulamento interno e convenção',
  'Contratos de fornecedores',
  'Orçamentos',
  'Notas fiscais e recibos',
  'Comunicados e circulares',
  'Laudos e vistorias',
  'Alvarás e certificados (ex: Bombeiros)',
  'Manuais do condomínio',
  'Plantas e projetos',
  'Apólices de seguro'
];

import { Download, FileText, Search } from 'react-native-feather';

import AppHeader from '../components/AppHeader';
import { getDocumentos } from '../services/communityService';

import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

import type { Documento } from '../types/models';

export default function DocumentosScreen() {
  // buscar quem fez login
  const { user } = useAuth();

  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

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
  }, [user?.id]);

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

      const { data } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath);

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

  // --- INÍCIO DAS FUNÇÕES DE UPLOAD ---
  // Abre a galeria
  const handlePickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (!result.didCancel && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0]);
    }
  };

  // Faz o upload para o Supabase
  const handleUploadSubmit = async () => {
    if (!newDocTitle || !newDocCategory || !selectedImage) {
      Alert.alert('Erro', 'Preenche todos os campos e escolhe uma imagem.');
      return;
    }

    setIsUploading(true);
    try {
      const supabase = getSupabaseClient();

      // 1. Preparar o ficheiro
      const timestamp = new Date().getTime();
      const ext = selectedImage.fileName?.split('.').pop() || 'jpg';
      const filePath = `uploads/doc_${timestamp}.${ext}`;

      // Lemos o ficheiro fisicamente do telemóvel
      const fileData = await fetch(selectedImage.uri).then(res =>
        res.arrayBuffer(),
      );

      // 2. Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, fileData, {
          contentType: selectedImage.type || 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 3. Gravar na Base de Dados relacional
      const sizeMB = selectedImage.fileSize
        ? (selectedImage.fileSize / (1024 * 1024)).toFixed(2) + ' MB'
        : 'Desconhecido';

      const { error: dbError } = await supabase.from('documentos').insert({
        id: timestamp.toString(), // enviado o timestamp como texto
        title: newDocTitle,
        category: newDocCategory,
        type: 'IMG',
        date: new Date().toISOString().split('T')[0],
        size: sizeMB,
        file_path: filePath,
        mime_type: selectedImage.type || 'image/jpeg',
      });

      if (dbError) throw dbError;

      // criar o objeto no formato correto do modelo da App
      const novoDocumento: Documento = {
        id: timestamp.toString(),
        title: newDocTitle,
        category: newDocCategory,
        type: 'IMG',
        date: new Date().toISOString().split('T')[0],
        size: sizeMB,
        filePath: filePath,
        mimeType: selectedImage.type || 'image/jpeg',
      };

      // injetar o novo doc no topo da lista
      setDocumentos(prevDocs => [novoDocumento, ...prevDocs]);

      Alert.alert('Sucesso', 'Documento adicionado!');

      // Limpar o Modal
      setModalVisible(false);
      setNewDocTitle('');
      setNewDocCategory('');
      setSelectedImage(null);

      // Opcional: Aqui podíamos chamar a função loadDocumentos() para atualizar a lista automaticamente
    } catch (error: any) {
      console.error('Erro no upload:', error);
      Alert.alert('Erro', 'Falha ao guardar o documento: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };
  // --- FIM DAS FUNÇÕES DE UPLOAD ---

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
        <View
          style={{
            marginBottom: 8,
          }}
        >

          {user?.type === 'admin' && (
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 12,
                borderRadius: 12,
                marginBottom: 8,
                alignItems: 'center',
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 3,
              }}
              onPress={() => setModalVisible(true)}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: 15,
                }}
              >
                + Adicionar Documento
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
                  onPress={() => handleOpenDocument(item.filePath)}
                >
                  <Download stroke="#FFF" width={20} height={20} />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      {/* --- INÍCIO DO MODAL DE UPLOAD (Invisível até clicares no botão) --- */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: 20,
          }}
        >
          <View
            style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}
            >
              Adicionar Novo Documento
            </Text>

            <TextInput
              placeholder="Título (ex: Ata Condomínio)"
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 10,
                marginBottom: 10,
                borderRadius: 5,
                color: '#000',
              }}
              placeholderTextColor="#999"
              value={newDocTitle}
              onChangeText={setNewDocTitle}
            />

            <View
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                marginBottom: 15,
                borderRadius: 5,
                backgroundColor: '#fafafa',
                overflow: 'hidden',
              }}
            >
              <Picker
                selectedValue={newDocCategory}
                onValueChange={(itemValue) => setNewDocCategory(itemValue)}
                style={{ color: '#000', margin: -5 }}
                dropdownIconColor="#000"
                mode="dropdown"
              >
                <Picker.Item
                  label="Selecione uma categoria..."
                  value=""
                  color="#999"
                />
            
                {CATEGORIAS_OPCOES.map((cat, index) => (
                  <Picker.Item
                    key={index}
                    label={cat}
                    value={cat}
                  />
                ))}
              </Picker>
            </View>
            
            <TouchableOpacity
              onPress={handlePickImage}
              style={{
                backgroundColor: '#e0e0e0',
                padding: 10,
                borderRadius: 5,
                marginBottom: 15,
              }}
            >
              <Text style={{ textAlign: 'center', color: '#000' }}>
                {selectedImage
                  ? `Imagem selecionada: ${selectedImage.fileName}`
                  : '📷 Escolher Imagem do Telemóvel'}
              </Text>
            </TouchableOpacity>

            {isUploading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  gap: 12,
                  marginTop: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{ paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' }}
                >
                  <Text style={{ color: '#6B7280', fontWeight: '600', fontSize: 15 }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleUploadSubmit}
                  style={{
                    backgroundColor: colors.primary,
                    paddingVertical: 12,
                    paddingHorizontal: 25,
                    borderRadius: 12,
                    alignItems: 'center',
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
                    Guardar
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
      {/* --- FIM DO MODAL DE UPLOAD --- */}
    </View>
  );
}
