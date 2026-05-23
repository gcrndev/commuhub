import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react-native';

import AppHeader from '../components/AppHeader';

import { getEventos } from '../services/communityService';

import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

import type { Evento } from '../types/models';

export default function CalendarioScreen() {
  // <-- CORREÇÃO: Usar a data atual e não uma data fixa
  const [currentDate, setCurrentDate] = useState(new Date());

  // <-- NOVO: Estado para guardar o dia clicado
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [view, setView] = useState('month');

  const [eventos, setEventos] = useState<Evento[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadEventos() {
      try {
        setLoading(true);
        setError(null);

        const data = await getEventos();

        if (isMounted) {
          setEventos(data);
        }
      } catch {
        if (isMounted) {
          setError('Não foi possível carregar os eventos.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
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

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];

    const dateStr = date.toISOString().split('T')[0];

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

  // usar a data atual do telemóvel e não dia 11 de Abril de 2026
  const today = new Date();

  // função que gere o clique nos dias
  const handleDatePress = (date: Date | null) => {
    if (!date) return;

    const eventsOnDate = getEventsForDate(date);

    // se não há eventos, avisa e limpa filtro
    if (eventsOnDate.length === 0) {
      Alert.alert('Sem eventos', 'Não há eventos agendados para esta data.');
      setSelectedDate(null);
      return;
    }

    // Se clicar no dia que já está selecionado, tira o filtro
    if (selectedDate && date.getTime() === selectedDate.getTime()) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };

  // os eventos que vão aparecer na lista em baixo
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

              // verificar se este dia é o que está selecionado
              const isSelected =
                selectedDate && day && day.getTime() === selectedDate.getTime();

              return (
                // trocado para TouchableOpacity para detetar cliques
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
                    }, // destaque ao clicar
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
          ) : displayedEvents.length === 0 ? ( // usa a nova variável filtrada
            <Text style={globalStyles.centeredEmptyText}>
              {selectedDate
                ? 'Não há eventos para a data selecionada.'
                : 'Nenhum evento encontrado.'}
            </Text>
          ) : (
            // usa a nova variável filtrada
            [...displayedEvents]
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime(),
              )
              .map(event => {
                const eventDate = new Date(event.date);
                const isPast = eventDate < today;

                return (
                  <View
                    key={event.id}
                    style={[
                      globalStyles.calendarEventCard,
                      isPast && globalStyles.calendarEventCardPast,
                    ]}
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
                  </View>
                );
              })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
