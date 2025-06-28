import { Stack, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from "react-native";
import { EventSubscription } from 'expo-modules-core';

//Обробник сповіщень
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: true
  }),
});

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('Не вдалося отримати дозвіл на сповіщення');
    return;
  }
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'roboto': require('../assets/fonts/RobotoMono-Regular.ttf'),
    'montserrat': require('../assets/fonts/Montserrat-Medium.ttf'),
    'manrope': require('../assets/fonts/Manrope-Bold.ttf'),
  });

  const router = useRouter();
  const responseListener = useRef<EventSubscription | null>(null); // Виправлено тут

  useEffect(() => {
    registerForPushNotificationsAsync();

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const noteId = response.notification.request.content.data?.noteId;
      
      if (noteId) {
        const noteIdAsString = String(noteId);
        console.log('Переходимо до нотатки з ID:', noteIdAsString);
        
        router.push({
          pathname: '/create-notes/notes-editor',
          params: { noteId: noteIdAsString }
        });
      }
    });

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}