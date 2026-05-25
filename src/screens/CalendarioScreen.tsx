import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal, // <-- NOVO
  TextInput // <-- NOVO
} from 'react-native';

import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react-native';

import AppHeader from '../components/AppHeader';
import { getEventos } from '../services/communityService';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';
import type { Evento } from '../types/models';

import { useAuth } from '../context/AuthContext'; // <-- NOVO
import { getSupabaseClient } from '../lib/supabase'; // <-- NOVO

export default function CalendarioScreen() {
  const { user } = useAuth(); // <-- Pega o user logado
  const isAdmin = user?.type === 'admin'; // <-- Verifica se é admin

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState('month');
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- ESTADOS DO MODAL DE ADMIN ---
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '', // formato esperado: YYYY-MM-DD
    time: '',
    location: ''
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
    return () => { isMounted = false; };
  }, []);

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const getDaysInMonth = (date: Date | null) => {
    if (!date) return [];
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return eventos.filter(event => event.date === dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentDate);
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

  // --- FUNÇÃO PARA SALVAR O EVENTO NO SUPABASE ---
  const handleSaveEvent = async () => {
    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      Alert.alert('Atenção', 'Por favor, preenche todos os campos.');
      return;
    }

    // Validação simples para ver se a data tem o formato correto (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.date)) {
      Alert.alert('Atenção', 'A data deve estar no formato AAAA-MM-DD (ex: 2026-04-15).');
      return;
    }

    setIsSaving(true);
    try {
      const supabase = getSupabaseClient();
      
      const generatedId = new Date().getTime().toString();

      const { data, error } = await supabase
        .from('eventos')
        .insert([{
          id: generatedId, // <-- ADICIONAMOS O ID AQUI
          title: formData.title,
          date: formData.date,
          time: formData.time,
          location: formData.location
        }])
        .select()

      if (error) throw error;

      // Cria o objeto para a lista do telemóvel
      const novoEvento: Evento = {
        id: data?.[0]?.id || new Date().getTime().toString(),
        title: formData.title,
        date: formData.date,
        time: formData.time,
        location: formData.location
      };

      // Injeta no estado para a app atualizar automaticamente
      setEventos(prev => [...prev, novoEvento]);
      Alert.alert('Sucesso', 'Evento adicionado com sucesso!');
      
      // Limpa os campos e fecha o modal
      setFormData({ title: '', date: '', time: '', location: '' });
      setModalVisible(false);
    } catch (e: any) {
      console.error('Erro ao guardar evento:', e);
      Alert.alert('Erro', 'Falha ao guardar: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const displayedEvents = selectedDate ? getEventsForDate(selectedDate) : eventos;

  return (
    <View style={globalStyles.safeArea}>
      <AppHeader title="Calendário" subtitle="Eventos e atividades da comunidade" />

      <ScrollView style={globalStyles.mainContent} contentContainerStyle={globalStyles.calendarScrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- BOTÃO DE ADMIN AQUI NO TOPO DA TELA --- */}
        {isAdmin && (
          <TouchableOpacity
            style={{ backgroundColor: '#28a745', padding: 12, borderRadius: 8, marginBottom: 15 }}
            onPress={() => setModalVisible(true)}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>+ CRIAR NOVO EVENTO</Text>
          </TouchableOpacity>
        )}

        <View style={globalStyles.calendarCard}>
          <View style={globalStyles.calendarNavHeader}>
            <TouchableOpacity onPress={previousMonth} style={globalStyles.calendarIconBtn}>
              <ChevronLeft size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <Text style={globalStyles.calendarMonthTitle}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>

            <TouchableOpacity onPress={nextMonth} style={globalStyles.calendarIconBtn}>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={globalStyles.calendarToggleContainer}>
            <TouchableOpacity onPress={() => setView('month')} style={[globalStyles.calendarToggleButton, view === 'month' ? globalStyles.calendarToggleActive : globalStyles.calendarToggleInactive]}>
              <Text style={[globalStyles.calendarToggleText, view === 'month' ? globalStyles.calendarToggleTextActive : globalStyles.calendarToggleTextInactive]}>Mês</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setView('week')} style={[globalStyles.calendarToggleButton, view === 'week' ? globalStyles.calendarToggleActive : globalStyles.calendarToggleInactive]}>
              <Text style={[globalStyles.calendarToggleText, view === 'week' ? globalStyles.calendarToggleTextActive : globalStyles.calendarToggleTextInactive]}>Semana</Text>
            </TouchableOpacity>
          </View>

          <View style={globalStyles.calendarGrid}>
            {daysOfWeek.map(day => (
              <View key={day} style={globalStyles.calendarDayHeaderCell}>
                <Text style={globalStyles.calendarDayHeaderText}>{day}</Text>
              </View>
            ))}

            {days.map((day, index) => {
              const hasEvents = day && getEventsForDate(day).length > 0;
              const isToday = day && day.getDate() === today.getDate() && day.getMonth() === today.getMonth() && day.getFullYear() === today.getFullYear();
              const isSelected = selectedDate && day && day.getTime() === selectedDate.getTime();

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleDatePress(day)}
                  style={[
                    globalStyles.calendarDayCell,
                    isToday && globalStyles.calendarTodayCell,
                    hasEvents && !isToday && globalStyles.calendarEventCell,
                    isSelected && { borderColor: colors.primary, borderWidth: 2 },
                  ]}
                >
                  {day && (
                    <>
                      <Text style={[globalStyles.calendarDayText, isToday && globalStyles.calendarTodayText, hasEvents && !isToday && globalStyles.calendarEventText]}>
                        {day.getDate()}
                      </Text>
                      {hasEvents && !isToday && <View style={globalStyles.calendarDotEvent} />}
                      {hasEvents && isToday && <View style={globalStyles.calendarDotToday} />}
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
            <ActivityIndicator color={colors.primary} style={globalStyles.loaderSpacing} />
          ) : error ? (
            <Text style={globalStyles.centeredEmptyText}>{error}</Text>
          ) : displayedEvents.length === 0 ? (
            <Text style={globalStyles.centeredEmptyText}>
              {selectedDate ? 'Não há eventos para a data selecionada.' : 'Nenhum evento encontrado.'}
            </Text>
          ) : (
            [...displayedEvents]
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map(event => {
                const eventDate = new Date(event.date);
                const isPast = eventDate < today;

                return (
                  <View key={event.id} style={[globalStyles.calendarEventCard, isPast && globalStyles.calendarEventCardPast]}>
                    <View style={globalStyles.calendarEventRow}>
                      <View style={globalStyles.calendarDateBadge}>
                        <Text style={globalStyles.calendarDateBadgeMonth}>
                          {eventDate.toLocaleDateString('pt-PT', { month: 'short' }).toUpperCase()}
                        </Text>
                        <Text style={globalStyles.calendarDateBadgeDay}>{eventDate.getDate()}</Text>
                      </View>
                      <View style={globalStyles.calendarEventInfo}>
                        <Text style={globalStyles.calendarEventTitle}>{event.title}</Text>
                        <View style={globalStyles.calendarEventDetailsRow}>
                          <Clock size={14} color={colors.textSecondary} />
                          <Text style={globalStyles.calendarEventDetailsText}>{event.time}</Text>
                        </View>
                        <View style={globalStyles.calendarEventDetailsRow}>
                          <MapPin size={14} color={colors.textSecondary} />
                          <Text style={globalStyles.calendarEventDetailsText}>{event.location}</Text>
                        </View>
                      </View>
                    </View>
                    {isPast && (
                      <View style={globalStyles.calendarPastDivider}>
                        <Text style={globalStyles.calendarPastText}>Evento passado</Text>
                      </View>
                    )}
                  </View>
                );
              })
          )}
        </View>
      </ScrollView>

      {/* --- INÍCIO DO MODAL ADMIN --- */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>
              Criar Novo Evento
            </Text>

            <TextInput
              placeholder="Título (ex: Assembleia Geral)"
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5, color: '#000', backgroundColor: '#fafafa' }}
              placeholderTextColor="#999"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <TextInput
              placeholder="Data (AAAA-MM-DD)"
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5, color: '#000', backgroundColor: '#fafafa' }}
              placeholderTextColor="#999"
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
            />

            <TextInput
              placeholder="Hora (ex: 18:00)"
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5, color: '#000', backgroundColor: '#fafafa' }}
              placeholderTextColor="#999"
              value={formData.time}
              onChangeText={(text) => setFormData({ ...formData, time: text })}
            />

            <TextInput
              placeholder="Localização (ex: Sala Principal)"
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5, color: '#000', backgroundColor: '#fafafa' }}
              placeholderTextColor="#999"
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 12 }}>
                <Text style={{ color: 'red', fontWeight: 'bold' }}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSaveEvent}
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