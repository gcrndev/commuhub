/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import { displayPushNotification } from './src/services/notificationService';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  await displayPushNotification(remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
