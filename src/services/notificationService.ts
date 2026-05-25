import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import { getSupabaseClient } from '../lib/supabase';

export async function setupPushNotifications(userId: string) {
  try {
    // 1. Pedir permissão explícita ao Android (OBRIGATÓRIO para SDK 33+)
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permissão de notificação negada pelo utilizador.');
        return;
      }
    }

    // Garantir permissão também ao nível do Firebase
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('Permissão de Firebase Messaging rejeitada.');
      return;
    }

    // 2. Obter o Token FCM único deste dispositivo
    const token = await messaging().getToken();
    console.log('--- FCM TOKEN ENCONTRADO ---');
    console.log(token);
    console.log('----------------------------');

    if (!token) return;

    // 3. Guardar o token no Supabase (Exatamente a query do teu README)
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      fcm_token: token,
      fcm_token_updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Erro ao registar token no Supabase:', error);
      return;
    }

    console.log(
      'Token FCM sincronizado com o perfil do utilizador com sucesso!',
    );

    // 4. Lógica extra para mostrar notificações enquanto a App está ABERTA (Foreground)
    messaging().onMessage(async remoteMessage => {
      const title =
        remoteMessage.data?.title ||
        remoteMessage.notification?.title ||
        'Nova mensagem';
      const body =
        remoteMessage.data?.body ||
        remoteMessage.notification?.body ||
        '';
      console.log('Notificação recebida com a app aberta:', remoteMessage);

      // Criar um canal de notificação (Exigência do Android)
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Canal Geral',
      });

      // Mostrar o balão da notificação no ecrã usando Notifee
      await notifee.displayNotification({
        title: String(title),
        body: String(body),
        android: {
          channelId,
          smallIcon: 'ic_launcher', // Ícone padrão do Android
          pressAction: {
            id: 'default',
          },
        },
      });
    });
  } catch (error) {
    console.error('Erro fatal no setup do Push Notifications:', error);
  }
}
