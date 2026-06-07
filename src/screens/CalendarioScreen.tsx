import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
} from 'react-native';
import { openCalendarWithEvent } from '../services/calendarModule';

import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react-native';

import AppHeader from '../components/AppHeader';
import { getEventos, deleteEvento } from '../services/communityService';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';
import type { Evento } from '../types/models';

import { useAuth } from '../context/AuthContext';
import { getSupabaseClient } from '../lib/supabase';

import { useRoute } from '@react-navigation/native';

export default function CalendarioScreen() {
  
  const { user } = useAuth();
  //verifica se e admin
  const isAdmin = user?.type === 'admin';

  
  const route = useRoute();
  const highlightEventId = (route.params as any)?.highlightEventId;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState('month');
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //evento selecionado para ver detalhes
  const [selectedEventInfo, setSelectedEventInfo] = useState<Evento | null>(
    null,
  );

  const [isModalVisible, setModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  //dados do formulario
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
  });

  useEffect(() => {
    let isMounted = true;

    async function loadEventos() {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getEventos();
        if (isMounted) setEventos(data);
      } catch {
        if (isMounted) setError('Não foi possível carregar os eventos.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadEventos();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (highlightEventId && eventos.length > 0) {
      //evento encontrado pelo id
      const event = eventos.find(e => e.id === highlightEventId);
      if (event) {
        //divide a data em ano mes dia
        const [year, month, day] = event.date.split('-');
        //cria objeto date do evento
        const eventDate = new Date(Number(year), Number(month) - 1, Number(day));
        setSelectedDate(eventDate);
        setSelectedEventInfo(event);
      }
    }
  }, [highlightEventId, eventos]);

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  
  const getDaysInMonth = (date: Date | null) => {
    if (!date) return [];
    const year = date.getFullYear();
    const month = date.getMonth();
    //primeiro e ultimo dia do mes
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  
  const getDaysInWeek = (date: Date | null) => {
    if (!date) return [];
    
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  //eventos de uma data especifica
  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    //formata a data para aaaa-mm-dd
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    //string da data no formato da base de dados
    const dateStr = `${year}-${month}-${day}`;
    return eventos.filter(event => event.date === dateStr);
  };

  //vai para o mes/semana anterior
  const previousMonth = () => {
    if (view === 'week') {
      //volta 7 dias
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
      );
    }
  };

  //vai para o mes/semana seguinte
  const nextMonth = () => {
    if (view === 'week') {
      //avanca 7 dias
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
      );
    }
  };

  
  const days =
    view === 'week' ? getDaysInWeek(currentDate) : getDaysInMonth(currentDate);
  const today = new Date();


  const handleDatePress = (date: Date | null) => {
    if (!date) return;
    
    const eventsOnDate = getEventsForDate(date);
    if (eventsOnDate.length === 0) {
      Alert.alert('Sem eventos', 'Não há eventos agendados para esta data.');
      setSelectedDate(null);
      return;
    }
    if (selectedDate && date.getTime() === selectedDate.getTime()) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };

  //guarda um evento novo
  const handleSaveEvent = async () => {
    if (
      !formData.title ||
      !formData.date ||
      !formData.time ||
      !formData.location
    ) {
      Alert.alert('Atenção', 'Por favor, preenche todos os campos.');
      return;
    }

    //regex para validar formato aaaa-mm-dd
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.date)) {
      Alert.alert(
        'Atenção',
        'A data deve estar no formato AAAA-MM-DD (ex: 2026-04-15).',
      );
      return;
    }

    //impede data passada
    const [yearStr, monthStr, dayStr] = formData.date.split('-');
    //data alvo para comparar
    const targetDate = new Date(
      Number(yearStr),
      Number(monthStr) - 1,
      Number(dayStr),
    );
    
    const todayCompare = new Date();
    todayCompare.setHours(0, 0, 0, 0);

    if (targetDate < todayCompare) {
      Alert.alert('Erro Lógico', 'Não podes criar eventos em datas passadas.');
      return;
    }

    setIsSaving(true);
    try {
      
      const supabase = getSupabaseClient();
      
      const generatedId = new Date().getTime().toString();

      
      const { data, error } = await supabase
        .from('eventos')
        .insert([
          {
            id: generatedId,
            title: formData.title,
            date: formData.date,
            time: formData.time,
            location: formData.location,
            description: formData.description,
          },
        ])
        .select();

      if (error) throw error;

      
      const novoEvento: Evento = {
        id: data?.[0]?.id || generatedId,
        title: formData.title,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        description: formData.description,
      };

      setEventos(prev => [...prev, novoEvento]);
      Alert.alert('Sucesso', 'Evento adicionado com sucesso!');

      setFormData({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
      });
      setModalVisible(false);
    } catch (e: any) {
      console.error('Erro ao guardar evento:', e);
      Alert.alert('Erro', 'Falha ao guardar: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  //adiciona ao calendario nativo
  const addToNativeCalendar = (evento: Evento) => {
    openCalendarWithEvent(evento);
  };

  //elimina um evento
  const handleDeleteEvento = (evento: Evento) => {
    Alert.alert(
      'Eliminar Evento',
      `Tens a certeza que queres eliminar "${evento.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvento(evento.id);
              setEventos(prev => prev.filter(e => e.id !== evento.id));
              setSelectedEventInfo(null);
              Alert.alert('Sucesso', 'Evento eliminado.');
            } catch (e: any) {
              Alert.alert('Erro', 'Falha ao eliminar: ' + e.message);
            }
          },
        },
      ],
    );
  };

  //eventos a mostrar na lista
  const displayedEvents = selectedDate
    ? getEventsForDate(selectedDate)
    : eventos;

  return (
    <View style={globalStyles.safeArea}>
      <AppHeader
        title="Calendário"
        subtitle="Eventos e atividades da comunidade"
      />

      <ScrollView
        style={globalStyles.mainContent}
        contentContainerStyle={globalStyles.calendarScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isAdmin && (
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 14,
              borderRadius: 12,
              marginBottom: 20,
              marginTop: 20,
              alignItems: 'center',
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 3,
            }}
            onPress={() => setModalVisible(true)}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
              + Criar Novo Evento
            </Text>
          </TouchableOpacity>
        )}

        <View style={globalStyles.calendarCard}>
          <View style={globalStyles.calendarNavHeader}>
            <TouchableOpacity
              onPress={previousMonth}
              style={globalStyles.calendarIconBtn}
            >
              <ChevronLeft size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <Text style={globalStyles.calendarMonthTitle}>
              {view === 'week' && days.length === 7
                ? `${days[0]!.getDate()} ${
                    monthNames[days[0]!.getMonth()]
                  } - ${days[6]!.getDate()} ${
                    monthNames[days[6]!.getMonth()]
                  } ${days[6]!.getFullYear()}`
                : `${
                    monthNames[currentDate.getMonth()]
                  } ${currentDate.getFullYear()}`}
            </Text>

            <TouchableOpacity
              onPress={nextMonth}
              style={globalStyles.calendarIconBtn}
            >
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={globalStyles.calendarToggleContainer}>
            <TouchableOpacity
              onPress={() => setView('month')}
              style={[
                globalStyles.calendarToggleButton,
                view === 'month'
                  ? globalStyles.calendarToggleActive
                  : globalStyles.calendarToggleInactive,
              ]}
            >
              <Text
                style={[
                  globalStyles.calendarToggleText,
                  view === 'month'
                    ? globalStyles.calendarToggleTextActive
                    : globalStyles.calendarToggleTextInactive,
                ]}
              >
                Mês
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setView('week')}
              style={[
                globalStyles.calendarToggleButton,
                view === 'week'
                  ? globalStyles.calendarToggleActive
                  : globalStyles.calendarToggleInactive,
              ]}
            >
              <Text
                style={[
                  globalStyles.calendarToggleText,
                  view === 'week'
                    ? globalStyles.calendarToggleTextActive
                    : globalStyles.calendarToggleTextInactive,
                ]}
              >
                Semana
              </Text>
            </TouchableOpacity>
          </View>

          <View style={globalStyles.calendarGrid}>
            {daysOfWeek.map(day => (
              <View key={day} style={globalStyles.calendarDayHeaderCell}>
                <Text style={globalStyles.calendarDayHeaderText}>{day}</Text>
              </View>
            ))}

            {days.map((day, index) => {
              //se tem eventos nesse dia
              const hasEvents = day && getEventsForDate(day).length > 0;
              //se e o dia de hoje
              const isToday =
                day &&
                day.getDate() === today.getDate() &&
                day.getMonth() === today.getMonth() &&
                day.getFullYear() === today.getFullYear();
              //se esta selecionado
              const isSelected =
                selectedDate && day && day.getTime() === selectedDate.getTime();

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleDatePress(day)}
                  style={[
                    globalStyles.calendarDayCell,
                    isToday && globalStyles.calendarTodayCell,
                    hasEvents && !isToday && globalStyles.calendarEventCell,
                    isSelected && {
                      borderColor: colors.primary,
                      borderWidth: 2,
                    },
                  ]}
                >
                  {day && (
                    <>
                      <Text
                        style={[
                          globalStyles.calendarDayText,
                          isToday && globalStyles.calendarTodayText,
                          hasEvents &&
                            !isToday &&
                            globalStyles.calendarEventText,
                        ]}
                      >
                        {day.getDate()}
                      </Text>
                      {hasEvents && !isToday && (
                        <View style={globalStyles.calendarDotEvent} />
                      )}
                      {hasEvents && isToday && (
                        <View style={globalStyles.calendarDotToday} />
                      )}
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={globalStyles.calendarEventsSection}>
          <Text style={globalStyles.calendarEventsTitle}>Próximos Eventos</Text>

          {loading ? (
            <ActivityIndicator
              color={colors.primary}
              style={globalStyles.loaderSpacing}
            />
          ) : error ? (
            <Text style={globalStyles.centeredEmptyText}>{error}</Text>
          ) : displayedEvents.length === 0 ? (
            <Text style={globalStyles.centeredEmptyText}>
              {selectedDate
                ? 'Não há eventos para a data selecionada.'
                : 'Nenhum evento encontrado.'}
            </Text>
          ) : (
            [...displayedEvents]
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime(),
              )
              .map(event => {
                //divide a data do evento
                const [year, month, day] = event.date.split('-');
                //cria objeto date do evento
                const eventDate = new Date(
                  Number(year),
                  Number(month) - 1,
                  Number(day),
                );

                //verifica se o evento ja passou
                const isPast =
                  eventDate <
                  new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate(),
                  );

                return (
                  <TouchableOpacity
                    key={event.id}
                    style={[
                      globalStyles.calendarEventCard,
                      isPast && globalStyles.calendarEventCardPast,
                    ]}
                    onPress={() => setSelectedEventInfo(event)}
                    activeOpacity={0.7}
                  >
                    <View style={globalStyles.calendarEventRow}>
                      <View style={globalStyles.calendarDateBadge}>
                        <Text style={globalStyles.calendarDateBadgeMonth}>
                          {eventDate
                            .toLocaleDateString('pt-PT', { month: 'short' })
                            .toUpperCase()}
                        </Text>
                        <Text style={globalStyles.calendarDateBadgeDay}>
                          {eventDate.getDate()}
                        </Text>
                      </View>
                      <View style={globalStyles.calendarEventInfo}>
                        <Text style={globalStyles.calendarEventTitle}>
                          {event.title}
                        </Text>
                        <View style={globalStyles.calendarEventDetailsRow}>
                          <Clock size={14} color={colors.textSecondary} />
                          <Text style={globalStyles.calendarEventDetailsText}>
                            {event.time}
                          </Text>
                        </View>
                        <View style={globalStyles.calendarEventDetailsRow}>
                          <MapPin size={14} color={colors.textSecondary} />
                          <Text style={globalStyles.calendarEventDetailsText}>
                            {event.location}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {isPast && (
                      <View style={globalStyles.calendarPastDivider}>
                        <Text style={globalStyles.calendarPastText}>
                          Evento passado
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
          )}
        </View>
      </ScrollView>

      {/* MODAL ADMIN */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: 25,
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 15,
              padding: 20,
              elevation: 10,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#1e293b',
                marginBottom: 20,
              }}
            >
              Criar Novo Evento
            </Text>
            <TextInput
              placeholder="Título do evento"
              placeholderTextColor="#94a3b8"
              value={formData.title}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, title: text }))
              }
              style={{
                borderWidth: 1,
                borderColor: '#e2e8f0',
                borderRadius: 10,
                padding: 12,
                fontSize: 15,
                color: '#1e293b',
                marginBottom: 12,
                backgroundColor: '#f8fafc',
              }}
            />
            <TextInput
              placeholder="Data (AAAA-MM-DD)"
              placeholderTextColor="#94a3b8"
              value={formData.date}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, date: text }))
              }
              style={{
                borderWidth: 1,
                borderColor: '#e2e8f0',
                borderRadius: 10,
                padding: 12,
                fontSize: 15,
                color: '#1e293b',
                marginBottom: 12,
                backgroundColor: '#f8fafc',
              }}
            />
            <TextInput
              placeholder="Hora (ex: 14:30)"
              placeholderTextColor="#94a3b8"
              value={formData.time}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, time: text }))
              }
              style={{
                borderWidth: 1,
                borderColor: '#e2e8f0',
                borderRadius: 10,
                padding: 12,
                fontSize: 15,
                color: '#1e293b',
                marginBottom: 12,
                backgroundColor: '#f8fafc',
              }}
            />
            <TextInput
              placeholder="Local"
              placeholderTextColor="#94a3b8"
              value={formData.location}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, location: text }))
              }
              style={{
                borderWidth: 1,
                borderColor: '#e2e8f0',
                borderRadius: 10,
                padding: 12,
                fontSize: 15,
                color: '#1e293b',
                marginBottom: 12,
                backgroundColor: '#f8fafc',
              }}
            />
            <TextInput
              placeholder="Descrição (opcional)"
              placeholderTextColor="#94a3b8"
              value={formData.description}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, description: text }))
              }
              multiline
              numberOfLines={3}
              style={{
                borderWidth: 1,
                borderColor: '#e2e8f0',
                borderRadius: 10,
                padding: 12,
                fontSize: 15,
                color: '#1e293b',
                marginBottom: 20,
                backgroundColor: '#f8fafc',
                minHeight: 80,
                textAlignVertical: 'top',
              }}
            />
            <TouchableOpacity
              onPress={handleSaveEvent}
              disabled={isSaving}
              style={{
                backgroundColor: colors.primary,
                padding: 14,
                borderRadius: 10,
                alignItems: 'center',
                marginBottom: 10,
                opacity: isSaving ? 0.6 : 1,
              }}
            >
              <Text
                style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}
              >
                {isSaving ? 'A guardar...' : 'Guardar Evento'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              disabled={isSaving}
              style={{ padding: 14, borderRadius: 10, alignItems: 'center' }}
            >
              <Text
                style={{ color: '#64748b', fontWeight: '600', fontSize: 16 }}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL DETALHES */}
      <Modal
        visible={!!selectedEventInfo}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedEventInfo(null)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: 25,
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 15,
              overflow: 'hidden',
              elevation: 10,
            }}
          >
            <View
              style={{
                width: '100%',
                height: 160,
                backgroundColor: '#e2e8f0',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#64748b', fontWeight: 'bold' }}>
                [ Imagem do Evento ]
              </Text>
            </View>
            <View style={{ padding: 20 }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  color: '#1e293b',
                  marginBottom: 15,
                }}
              >
                {selectedEventInfo?.title}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Clock
                  size={16}
                  color={colors.textSecondary}
                  style={{ marginRight: 8 }}
                />
                <Text style={{ fontSize: 16, color: '#334155' }}>
                  {selectedEventInfo?.date} às {selectedEventInfo?.time}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <MapPin
                  size={16}
                  color={colors.textSecondary}
                  style={{ marginRight: 8 }}
                />
                <Text style={{ fontSize: 16, color: '#334155' }}>
                  {selectedEventInfo?.location}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 15,
                  color: '#475569',
                  lineHeight: 22,
                  marginBottom: 25,
                }}
              >
                {selectedEventInfo?.description ||
                  'Nenhuma descrição fornecida para este evento.'}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  selectedEventInfo && addToNativeCalendar(selectedEventInfo)
                }
                style={{
                  backgroundColor: '#ffffff',
                  padding: 14,
                  borderRadius: 10,
                  alignItems: 'center',
                  borderColor: '#0052FF',
                  borderWidth: 2,
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{ color: '#0052FF', fontWeight: 'bold', fontSize: 16 }}
                >
                  + Adicionar ao Calendário
                </Text>
              </TouchableOpacity>
              {isAdmin && selectedEventInfo && (
                <TouchableOpacity
                  onPress={() => handleDeleteEvento(selectedEventInfo)}
                  style={{
                    backgroundColor: '#dc2626',
                    padding: 14,
                    borderRadius: 10,
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}
                  >
                    Eliminar Evento
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setSelectedEventInfo(null)}
                style={{
                  backgroundColor: '#0052FF',
                  padding: 14,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}
                >
                  Fechar Detalhes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
