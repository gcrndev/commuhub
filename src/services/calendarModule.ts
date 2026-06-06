import { Alert } from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';

export async function openCalendarWithEvent(evento: {
  title: string;
  date: string;
  time: string;
  location: string;
  description?: string;
}) {
  try {
    const permissions = await RNCalendarEvents.requestPermissions(false);
    if (permissions !== 'authorized') {
      Alert.alert(
        'Permissão necessária',
        'Precisas de permitir o acesso ao calendário nas definições.',
      );
      return;
    }

    const [year, month, day] = evento.date.split('-').map(Number);
    const [hour, minute] = evento.time.split(':').map(Number);

    const startDate = new Date(year, month - 1, day, hour, minute);
    const endDate = new Date(year, month - 1, day, hour + 1, minute);

    await RNCalendarEvents.saveEvent(
      evento.title,
      {
        calendarId: '2',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location: evento.location,
        notes: evento.description || '',
      },
      { sync: true } as any,
    );

    Alert.alert('Sucesso', 'Evento adicionado ao calendário do telemóvel!');
  } catch (e: any) {
    Alert.alert('Erro', 'Falha ao adicionar ao calendário: ' + e.message);
  }
}
