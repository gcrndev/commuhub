import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react-native";

import { getEventos } from "../services/communityService";
import type { Evento } from "../types/models";

export default function CalendarioScreen() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 11));
  const [view, setView] = useState("month");
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
          setError("Não foi possível carregar os eventos.");
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

  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
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
    const dateStr = date.toISOString().split("T")[0];
    return eventos.filter((event) => event.date === dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date(2026, 3, 11);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendário</Text>
        <Text style={styles.headerSubtitle}>Eventos e atividades da comunidade</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.navHeader}>
            <TouchableOpacity onPress={previousMonth} style={styles.iconButton}>
              <ChevronLeft size={20} color="#4b5563" />
            </TouchableOpacity>

            <Text style={styles.monthTitle}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>

            <TouchableOpacity onPress={nextMonth} style={styles.iconButton}>
              <ChevronRight size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              onPress={() => setView("month")}
              style={[styles.toggleButton, view === "month" ? styles.toggleActive : styles.toggleInactive]}
            >
              <Text style={[styles.toggleText, view === "month" ? styles.toggleTextActive : styles.toggleTextInactive]}>
                Mês
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setView("week")}
              style={[styles.toggleButton, view === "week" ? styles.toggleActive : styles.toggleInactive]}
            >
              <Text style={[styles.toggleText, view === "week" ? styles.toggleTextActive : styles.toggleTextInactive]}>
                Semana
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {daysOfWeek.map((day) => (
              <View key={day} style={styles.dayHeaderCell}>
                <Text style={styles.dayHeaderText}>{day}</Text>
              </View>
            ))}

            {days.map((day, index) => {
              const hasEvents = day && getEventsForDate(day).length > 0;
              const isToday =
                day &&
                day.getDate() === today.getDate() &&
                day.getMonth() === today.getMonth() &&
                day.getFullYear() === today.getFullYear();

              return (
                <View
                  key={index}
                  style={[
                    styles.dayCell,
                    isToday && styles.todayCell,
                    hasEvents && !isToday && styles.eventCell,
                  ]}
                >
                  {day && (
                    <>
                      <Text
                        style={[
                          styles.dayText,
                          isToday && styles.todayText,
                          hasEvents && !isToday && styles.eventText,
                        ]}
                      >
                        {day.getDate()}
                      </Text>
                      {hasEvents && !isToday && <View style={styles.dotEvent} />}
                      {hasEvents && isToday && <View style={styles.dotToday} />}
                    </>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.eventsSection}>
          <Text style={styles.eventsTitle}>Próximos Eventos</Text>

          {loading ? (
            <ActivityIndicator color="#2563eb" style={styles.state} />
          ) : error ? (
            <Text style={styles.stateText}>{error}</Text>
          ) : eventos.length === 0 ? (
            <Text style={styles.stateText}>Nenhum evento encontrado.</Text>
          ) : (
            [...eventos]
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((event) => {
                const eventDate = new Date(event.date);
                const isPast = eventDate < today;

                return (
                  <View key={event.id} style={[styles.eventCard, isPast && styles.eventCardPast]}>
                    <View style={styles.eventRow}>
                      <View style={styles.dateBadge}>
                        <Text style={styles.dateBadgeMonth}>
                          {eventDate.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase()}
                        </Text>
                        <Text style={styles.dateBadgeDay}>{eventDate.getDate()}</Text>
                      </View>

                      <View style={styles.eventInfo}>
                        <Text style={styles.eventTitle}>{event.title}</Text>

                        <View style={styles.eventDetailsRow}>
                          <Clock size={14} color="#4b5563" />
                          <Text style={styles.eventDetailsText}>{event.time}</Text>
                        </View>

                        <View style={styles.eventDetailsRow}>
                          <MapPin size={14} color="#4b5563" />
                          <Text style={styles.eventDetailsText}>{event.location}</Text>
                        </View>
                      </View>
                    </View>

                    {isPast && (
                      <View style={styles.pastEventDivider}>
                        <Text style={styles.pastEventText}>Evento passado</Text>
                      </View>
                    )}
                  </View>
                );
              })
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#dbeafe",
  },
  content: {
    padding: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderColor: "#e5e7eb",
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  toggleContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: "#2563eb",
  },
  toggleInactive: {
    backgroundColor: "#f3f4f6",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "500",
  },
  toggleTextActive: {
    color: "#ffffff",
  },
  toggleTextInactive: {
    color: "#374151",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayHeaderCell: {
    width: "14.28%",
    alignItems: "center",
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4b5563",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  todayCell: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
  },
  eventCell: {
    backgroundColor: "#eff6ff",
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    color: "#374151",
  },
  todayText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  eventText: {
    color: "#1e3a8a",
    fontWeight: "500",
  },
  dotEvent: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    backgroundColor: "#2563eb",
    borderRadius: 2,
  },
  dotToday: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    backgroundColor: "#ffffff",
    borderRadius: 2,
  },
  eventsSection: {
    marginTop: 8,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  state: {
    marginTop: 24,
  },
  stateText: {
    color: "#6b7280",
    marginTop: 24,
    textAlign: "center",
  },
  eventCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderColor: "#e5e7eb",
    borderWidth: 1,
    marginBottom: 12,
  },
  eventCardPast: {
    opacity: 0.6,
  },
  eventRow: {
    flexDirection: "row",
    gap: 16,
  },
  dateBadge: {
    width: 56,
    height: 56,
    backgroundColor: "#dbeafe",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dateBadgeMonth: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "500",
  },
  dateBadgeDay: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2563eb",
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 8,
  },
  eventDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  eventDetailsText: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 4,
  },
  pastEventDivider: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  pastEventText: {
    fontSize: 12,
    color: "#6b7280",
  },
});
