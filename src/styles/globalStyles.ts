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
  },


  // ================= Index
sectionTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginTop: 20,
  marginBottom: 10,
  color: colors.textMain,
},

infoCard: {
  backgroundColor: '#FFFFFF',
  padding: 15,
  borderRadius: 10,
  marginBottom: 10,
  borderWidth: 1,
  borderColor: '#EEEEEE',
},

cardTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: colors.textMain,
},

cardSubtitle: {
  fontSize: 13,
  color: colors.gray,
  marginTop: 4,
},

cardText: {
  fontSize: 14,
  color: colors.textMain,
},

emptyText: {
  color: '#999999',
  marginBottom: 10,
},

primaryButton: {
  marginTop: 10,
  backgroundColor: colors.primary,
  paddingVertical: 8,
  borderRadius: 6,
  alignItems: 'center',
},

primaryButtonText: {
  color: '#FFFFFF',
  fontWeight: 'bold',
},

loaderSpacing: {
  marginTop: 40,
},


// ============== Votaçao

filterWrapper: {
  height: 60,
  marginTop: 20,
},

centeredEmptyText: {
  color: '#999999',
  marginTop: 40,
  textAlign: 'center',
},

listBottomSpacing: {
  paddingBottom: 20,
},

voteCard: {
  alignItems: 'stretch',
  flexDirection: 'column',
},

voteHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 12,
},

flexOne: {
  flex: 1,
},

voteCardTitle: {
  color: colors.textMain,
  fontSize: 18,
  fontWeight: 'bold',
},

voteDescription: {
  color: colors.gray,
  fontSize: 14,
  marginVertical: 4,
},

voteDeadlineRow: {
  alignItems: 'center',
  flexDirection: 'row',
},

voteDeadlineText: {
  color: colors.gray,
  fontSize: 12,
  marginLeft: 5,
},

voteStatusBadge: {
  borderRadius: 12,
  height: 26,
  paddingHorizontal: 12,
  paddingVertical: 4,
},

voteStatusSuccess: {
  backgroundColor: '#E8F5E9',
},

voteStatusPending: {
  backgroundColor: '#FFF3E0',
},

voteStatusText: {
  fontSize: 12,
  fontWeight: 'bold',
},

voteStatusSuccessText: {
  color: '#2E7D32',
},

voteStatusPendingText: {
  color: '#EF6C00',
},

voteProgressContainer: {
  marginBottom: 15,
},

voteProgressHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 5,
},

voteProgressLabel: {
  color: colors.gray,
  fontSize: 12,
},

voteProgressValue: {
  color: '#2ecc71',
  fontSize: 12,
  fontWeight: 'bold',
},

progressBarBackground: {
  backgroundColor: '#EEEEEE',
  borderRadius: 4,
  height: 8,
},

progressBarFill: {
  backgroundColor: '#2ecc71',
  borderRadius: 4,
  height: 8,
},

voteActionsRow: {
  flexDirection: 'row',
  gap: 10,
  marginTop: 5,
},

voteApproveButton: {
  alignItems: 'center',
  backgroundColor: '#2ecc71',
  borderRadius: 8,
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'center',
  padding: 12,
},

voteRejectButton: {
  alignItems: 'center',
  backgroundColor: '#e74c3c',
  borderRadius: 8,
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'center',
  padding: 12,
},

voteActionText: {
  color: '#FFFFFF',
  fontWeight: 'bold',
  marginLeft: 5,
},

voteDetailsButton: {
  marginTop: 15,
  paddingVertical: 5,
},

voteDetailsText: {
  color: colors.primary,
  fontSize: 14,
  fontWeight: 'bold',
},

voteExpandedSection: {
  borderTopColor: '#F0F0F0',
  borderTopWidth: 1,
  marginTop: 15,
  paddingTop: 15,
},

voteExpandedTitle: {
  color: colors.textMain,
  fontWeight: 'bold',
  marginBottom: 15,
},

voteChartWrapper: {
  alignItems: 'center',
  marginBottom: 25,
},

voteChartContainer: {
  alignItems: 'center',
  height: 140,
  justifyContent: 'center',
  width: 140,
},

voteChartCenter: {
  alignItems: 'center',
  position: 'absolute',
},

voteChartTotal: {
  color: colors.textMain,
  fontSize: 20,
  fontWeight: 'bold',
},

voteChartLabel: {
  color: colors.gray,
  fontSize: 12,
},

voteStatsRow: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  paddingBottom: 10,
},

centerItems: {
  alignItems: 'center',
},

voteStatValue: {
  fontSize: 22,
  fontWeight: 'bold',
},

voteStatLabel: {
  color: colors.gray,
  fontSize: 12,
},


// ============== documentos

documentsCategoriesContainer: {
  height: 70,
  justifyContent: 'center',
},

documentsListContent: {
  paddingBottom: 30,
},

documentInfo: {
  flex: 1,
  marginLeft: 15,
},

documentTitle: {
  color: '#333333',
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
  color: '#666666',
  fontSize: 11,
  paddingHorizontal: 6,
},

documentMeta: {
  color: '#999999',
  fontSize: 12,
  marginLeft: 8,
},

// =============== calendario

calendarScrollContent: {
  paddingBottom: 40,
},

calendarCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  borderColor: '#E5E7EB',
  borderWidth: 1,
  padding: 16,
  marginTop: 20,
  marginBottom: 24,
},

calendarNavHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 16,
},

calendarIconBtn: {
  width: 36,
  height: 36,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 8,
},

calendarMonthTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: colors.textMain,
},

calendarToggleContainer: {
  flexDirection: 'row',
  gap: 8,
  marginBottom: 16,
},

calendarToggleButton: {
  flex: 1,
  paddingVertical: 8,
  borderRadius: 8,
  alignItems: 'center',
},

calendarToggleActive: {
  backgroundColor: colors.primary,
},

calendarToggleInactive: {
  backgroundColor: '#F3F4F6',
},

calendarToggleText: {
  fontSize: 14,
  fontWeight: '500',
},

calendarToggleTextActive: {
  color: '#FFFFFF',
},

calendarToggleTextInactive: {
  color: '#374151',
},

calendarGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
},

calendarDayHeaderCell: {
  width: '14.28%',
  alignItems: 'center',
  paddingVertical: 8,
},

calendarDayHeaderText: {
  fontSize: 12,
  fontWeight: '500',
  color: '#4B5563',
},

calendarDayCell: {
  width: '14.28%',
  height: 58,
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
},

calendarTodayCell: {
  backgroundColor: colors.primary,
  borderRadius: 8,
},

calendarEventCell: {
  backgroundColor: '#EFF6FF',
  borderRadius: 8,
},

calendarDayText: {
  fontSize: 14,
  color: '#374151',
},

calendarTodayText: {
  color: '#FFFFFF',
  fontWeight: '600',
},

calendarEventText: {
  color: '#1E3A8A',
  fontWeight: '500',
},

calendarDotEvent: {
  position: 'absolute',
  bottom: 4,
  width: 4,
  height: 4,
  backgroundColor: colors.primary,
  borderRadius: 2,
},

calendarDotToday: {
  position: 'absolute',
  bottom: 4,
  width: 4,
  height: 4,
  backgroundColor: '#FFFFFF',
  borderRadius: 2,
},

calendarEventsSection: {
  marginTop: 8,
},

calendarEventsTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: colors.textMain,
  marginBottom: 16,
},

calendarEventCard: {
  backgroundColor: '#FFFFFF',
  padding: 16,
  borderRadius: 12,
  borderColor: '#E5E7EB',
  borderWidth: 1,
  marginBottom: 12,
},

calendarEventCardPast: {
  opacity: 0.6,
},

calendarEventRow: {
  flexDirection: 'row',
  gap: 16,
},

calendarDateBadge: {
  width: 56,
  height: 56,
  backgroundColor: '#DBEAFE',
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
},

calendarDateBadgeMonth: {
  fontSize: 12,
  color: colors.primary,
  fontWeight: '500',
},

calendarDateBadgeDay: {
  fontSize: 20,
  fontWeight: 'bold',
  color: colors.primary,
},

calendarEventInfo: {
  flex: 1,
},

calendarEventTitle: {
  fontSize: 16,
  fontWeight: '500',
  color: colors.textMain,
  marginBottom: 8,
},

calendarEventDetailsRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 4,
},

calendarEventDetailsText: {
  fontSize: 14,
  color: '#4B5563',
  marginLeft: 4,
},

calendarPastDivider: {
  marginTop: 12,
  paddingTop: 12,
  borderTopWidth: 1,
  borderTopColor: '#E5E7EB',
},

calendarPastText: {
  fontSize: 12,
  color: '#6B7280',
},



// =========== perfil 

  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  scrollContent: {
    paddingBottom: 40,
  },

  content: {
    paddingHorizontal: 20,
    marginTop: -30,
  },

  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },

  profileInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  avatarCircle: {
    width: 80,
    height: 80,
    backgroundColor: "#eff6ff",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  profileTextInfo: {
    flex: 1,
    marginLeft: 16,
  },

  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },

  userEmail: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 6,
  },

  badge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },

  badgeText: {
    fontSize: 12,
    color: "#1d4ed8",
    fontWeight: "600",
  },

  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 16,
  },

  statItem: {
    flex: 1,
  },

  statBorder: {
    borderLeftWidth: 1,
    borderLeftColor: "#f3f4f6",
    paddingLeft: 16,
  },

  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },

  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },

  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 20,
    overflow: "hidden",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 10,
  },



  sectionBody: {
    padding: 16,
  },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  switchRowSmall: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  optionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  optionSubLabel: {
    fontSize: 12,
    color: "#6b7280",
  },

  optionLabelSmall: {
    fontSize: 14,
    color: "#374151",
  },

  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 16,
  },

  groupLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#6b7280",
    marginBottom: 12,
    letterSpacing: 1,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },

  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  menuItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },

  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#fecaca",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
  },
});




