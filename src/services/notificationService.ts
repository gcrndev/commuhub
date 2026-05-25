import messaging from '@react-native-firebase/messaging';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import { getSupabaseClient } from '../lib/supabase';

export async function displayPushNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
) {
  const title =
    remoteMessage.data?.title ||
    remoteMessage.notification?.title ||
    'Nova mensagem';
  const body =
    remoteMessage.data?.body ||
    remoteMessage.notification?.body ||
    '';

  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Canal Geral',
  });

  await notifee.displayNotification({
    title: String(title),
    body: String(body),
    android: {
      channelId,
      smallIcon: 'ic_launcher',
      pressAction: {
        id: 'default',
      },
    },
  });
}

export async function setupPushNotifications(userId: string) {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permissao de notificacao negada pelo utilizador.');
        return;
      }
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('Permissao de Firebase Messaging rejeitada.');
      return;
    }

    const token = await messaging().getToken();
    console.log('--- FCM TOKEN ENCONTRADO ---');
    console.log(token);
    console.log('----------------------------');

    if (!token) return;

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

    messaging().onMessage(async remoteMessage => {
      console.log('Notificacao recebida com a app aberta:', remoteMessage);
      await displayPushNotification(remoteMessage);
    });
  } catch (error) {
    console.error('Erro fatal no setup do Push Notifications:', error);
  }
}
