import { StyleSheet, Platform } from 'react-native';
import { colors } from './colors';

export const globalStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background || '#F8F9FA',
  },
  // Header Azul Superior
  blueHeader: {
    backgroundColor: '#0052FF',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#D1E3FF',
    marginTop: 4,
  },
  // Arredondamento branco que sobrepõe o azul
  mainContent: {
    flex: 1,
    marginTop: -20,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
  },
  // Barra de Pesquisa
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginTop: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 52,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
  },
  // -tags
  categoryPill: {
    paddingHorizontal: 16,     
    height: 36,                
    borderRadius: 18,          
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    justifyContent: 'center',  
    alignItems: 'center',      
  },
  categoryPillActive: {
    backgroundColor: '#0052FF',
    borderColor: '#0052FF',
  },
  categoryText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 13,              
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  // --- FIM DOS FILTROS ---
  docCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#EBF2FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadBtn: {
    width: 42,
    height: 42,
    backgroundColor: '#0052FF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  }
});