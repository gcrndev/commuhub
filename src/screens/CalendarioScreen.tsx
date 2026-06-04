import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal, // <-- NOVO
  TextInput, // <-- NOVO
  Image,
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

  const [selectedEventInfo, setSelectedEventInfo] = useState<Evento | null>(
    null,
  );

  // --- ESTADOS DO MODAL DE ADMIN ---
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '', // formato esperado: YYYY-MM-DD
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

    // Pegar no ano, mês e dia no fuso horário local do telemóvel
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Adiciona o zero à esquerda (ex: 04)
    const day = String(date.getDate()).padStart(2, '0'); // Adiciona o zero à esquerda (ex: 09)

    // Montar a string YYYY-MM-DD
    const dateStr = `${year}-${month}-${day}`;

    return eventos.filter(event => event.date === dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
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
    if (
      !formData.title ||
      !formData.date ||
      !formData.time ||
      !formData.location
    ) {
      Alert.alert('Atenção', 'Por favor, preenche todos os campos.');
      return;
    }

    // Validação simples para ver se a data tem o formato correto (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.date)) {
      Alert.alert(
        'Atenção',
        'A data deve estar no formato AAAA-MM-DD (ex: 2026-04-15).',
      );
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
            id: generatedId, // <-- ADICIONAMOS O ID AQUI
            title: formData.title,
            date: formData.date,
            time: formData.time,
            location: formData.location,
            description: formData.description,
          },
        ])
        .select();

      if (error) throw error;

      // Cria o objeto para a lista do telemóvel
      const novoEvento: Evento = {
        id: data?.[0]?.id || new Date().getTime().toString(),
        title: formData.title,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        description: formData.description,
      };

      // Injeta no estado para a app atualizar automaticamente
      setEventos(prev => [...prev, novoEvento]);
      Alert.alert('Sucesso', 'Evento adicionado com sucesso!');

      // Limpa os campos e fecha o modal
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
        {/* --- BOTÃO DE ADMIN AQUI NO TOPO DA TELA --- */}
        {isAdmin && (
          <TouchableOpacity
            style={{
              backgroundColor: '#28a745',
              padding: 12,
              borderRadius: 8,
              marginBottom: 15,
              marginTop: 20,
            }}
            onPress={() => setModalVisible(true)}
          >
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bold',
              }}
            >
              + CRIAR NOVO EVENTO
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
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
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
              const hasEvents = day && getEventsForDate(day).length > 0;
              const isToday =
                day &&
                day.getDate() === today.getDate() &&
                day.getMonth() === today.getMonth() &&
                day.getFullYear() === today.getFullYear();
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
                // Nova lógica para evitar o bug de fuso horário
                const [year, month, day] = event.date.split('-');
                // O mês no JS começa em 0 (Janeiro é 0), então subtraímos 1 do mês
                const eventDate = new Date(
                  Number(year),
                  Number(month) - 1,
                  Number(day),
                );

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
                    onPress={() => setSelectedEventInfo(event)} // <-- A MAGIA ACONTECE AQUI
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

      
{/* --- INÍCIO DO MODAL DE DETALHES DO EVENTO --- */}
      <Modal 
        visible={!!selectedEventInfo}
        transparent={true} 
        animationType="fade"
        onRequestClose={() => setSelectedEventInfo(null)}
      >
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 25 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 15, overflow: 'hidden', elevation: 10 }}>
            
            {/* Bloco da Imagem Ilustrativa */}
            <View style={{ width: '100%', height: 160, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#64748b', fontWeight: 'bold' }}>[ Imagem do Evento ]</Text>
            </View>

            {/* Conteúdo de Texto */}
            <View style={{ padding: 20 }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 }}>
                {selectedEventInfo?.title}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Clock size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 16, color: '#334155' }}>{selectedEventInfo?.date} às {selectedEventInfo?.time}</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <MapPin size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 16, color: '#334155' }}>{selectedEventInfo?.location}</Text>
              </View>

              <Text style={{ fontSize: 15, color: '#475569', lineHeight: 22, marginBottom: 25 }}>
                {selectedEventInfo?.description || "Nenhuma descrição fornecida para este evento."}
              </Text>

              <TouchableOpacity 
                onPress={() => setSelectedEventInfo(null)}
                style={{ backgroundColor: '#0052FF', padding: 14, borderRadius: 10, alignItems: 'center' }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Fechar Detalhes</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
      {/* --- FIM DO MODAL DE DETALHES --- */}
      
    </View>
  );
}
