import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated, ToastAndroid, ActivityIndicator } from 'react-native';
import PagerView from 'react-native-pager-view';
import { Colors } from '@/constants/Colors';
import { useRouter, Redirect } from 'expo-router';
import React, { useRef, useEffect, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FirstImage from '../assets/images/first.svg';
import SecondImage from '../assets/images/second.svg';
import ThirdImage from '../assets/images/third.svg';

//Firebase та Google Sign-In імпорти
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { onAuthStateChanged, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../configs/FirebaseConfig';

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pagerRef = useRef(null);
  const dotWidths = [...Array(3)].map((_, i) => new Animated.Value(i === 0 ? 16 : 8));
  const images = [FirstImage, SecondImage, ThirdImage];

  //Стани для користувача та завантаження
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Починаємо зі стану завантаження

  //onAuthStateChanged --- правильної перевірки
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      //Функція спрацьовує пілся визначення Firebase стану користувача
      setUser(currentUser);
      //Кінець стану завантаження
      setLoading(false);
    });

    //Від'єднуємося від слухача при виході з компонента
    return () => unsubscribe();
  }, []);

  //Конфігурація Google Sign-In та IOS(заглушка)
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '847579515677-mgub8t5c5lhtv9omo0vbqlpl1psn18g1.apps.googleusercontent.com',
      iosClientId: '847579515677-hk90m4u5im9h3jm15a62qh9ctn1ffsmq.apps.googleusercontent.com',
    });
  }, []);
  
  const onGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.idToken) {
        const googleCredential = GoogleAuthProvider.credential(userInfo.idToken);
        await signInWithCredential(auth, googleCredential);
        //`onAuthStateChanged` автоматичний редерікт
      } else {
        throw new Error('Не вдалося отримати idToken від Google.');
      }
    } catch (error) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        console.error("Помилка входу через Google: ", error);
        ToastAndroid.show('Сталася помилка під час входу.', ToastAndroid.SHORT);
      }
    }
  };

  const handlePageChange = (position) => {
    dotWidths.forEach((dot, index) => {
      Animated.spring(dot, {
        toValue: index === position ? 16 : 8,
        useNativeDriver: false,
      }).start();
    });
  };

  useEffect(() => {
    dotWidths[0].setValue(16);
  }, []);

  // Екран завантаження під час перевірки
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.White }}>
        <ActivityIndicator size="large" color={Colors.Primary} />
      </View>
    );
  }

  //Перехід за успішно виконаної перевірки "авторизації"
  if (user) {
    return <Redirect href={'/(tabs)/home-page'} />;
  }

  //Не успішна перевірка "авторизації"
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.White} barStyle="dark-content" translucent />
      
      <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
        <View style={styles.header}>
            <View style={styles.headerContent}>
                <Ionicons name="logo-electron" size={36} color="black" />
                <Text style={styles.programName}>U-Plan</Text>
            </View>
        </View>

          <PagerView
            ref={pagerRef}
            style={styles.pagerView}
            initialPage={0}
            onPageSelected={(e) => handlePageChange(e.nativeEvent.position)}
          >
            {[FirstImage, SecondImage, ThirdImage].map((ImageComponent, i) => (
              <View key={i} style={styles.page}>
                <ImageComponent width={250} height={250} />
              </View>
            ))}
          </PagerView>

        <View style={styles.indicatorContainer}>
          {dotWidths.map((width, index) => (
            <Animated.View
              key={index}
              style={[
                styles.indicatorDot,
                {
                  width,
                  backgroundColor: width.interpolate({
                    inputRange: [8, 16],
                    outputRange: [Colors.Gray, Colors.Primary],
                  }),
                }
              ]}
            />
          ))}
        </View>

        <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={[styles.button, styles.googleButton]}
              onPress={onGoogleSignIn}
            >
              <AntDesign name="google" size={20} color={Colors.Primary} />
              <Text style={[styles.buttonText, styles.googleButtonText]}>Sign In With Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('entr/sign-in')}
            >
              <Text style={styles.buttonText}>Sign In With Email</Text>
            </TouchableOpacity>

          <Text style={styles.footerText}>
            Створений за для полегшення повсякдення та з думкою про тебе :)
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.White,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.White,
  },
  header: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  programName: {
    fontSize: 24,
    marginLeft: 10,
    fontFamily: 'montserrat',
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  indicatorDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: Colors.White,
  },
  button: {
    marginTop: 20,
    padding: 15,
    backgroundColor: Colors.Primary,
    borderRadius: 99,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleButton: {
    backgroundColor: Colors.White,
    borderWidth: 1,
    borderColor: Colors.Gray,
  },
  googleButtonText: {
    color: Colors.Primary,
  },
  buttonText: {
    fontSize: 17,
    textAlign: 'center',
    color: Colors.White,
    fontFamily: 'manrope',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    color: Colors.Gray,
    marginTop: 50,
    fontFamily: 'roboto',
  },
});
