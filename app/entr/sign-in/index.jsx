import { View, Text, TextInput, StyleSheet, TouchableOpacity, ToastAndroid, StatusBar } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/configs/FirebaseConfig';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignIn() {
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  const OnSignIn = () => {
    if (!email || !password) {
      ToastAndroid.show('Заповніть всі поля!', ToastAndroid.BOTTOM);
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        router.replace('/(tabs)/home-page');
      })
      .catch((error) => {
        const errorCode = error.code;
        if (errorCode == 'auth/invalid-credential') {
          ToastAndroid.show('Невірна пошта або пароль!', ToastAndroid.BOTTOM);
        }
        if (errorCode == 'auth/invalid-email') {
          ToastAndroid.show('Невірний формат пошти!', ToastAndroid.BOTTOM);
        }
      });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.White }}>
      <StatusBar backgroundColor={Colors.White} barStyle="dark-content" translucent />
      
      {/* Header with back button */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={router.back}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Let's Sign You In</Text>
        <Text style={styles.subtitle}>З поверненням!</Text>
        
        <View style={styles.content}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              onChangeText={setEmail}
              value={email}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              onChangeText={setPassword}
              value={password}
              placeholder="Password"
              secureTextEntry
            />
          </View>

          {/* Sign In Button */}
          <TouchableOpacity 
            onPress={OnSignIn}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          {/* Registration Link */}
          <TouchableOpacity 
            onPress={() => router.replace('entr/sign-up')}
            style={styles.registerLink}
          >
            <Text style={styles.registerText}>
              Немаєш аккаунту? Реєстрація
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 25,
    paddingBottom: 15,
  },
  container: {
    flex: 1,
    padding: 25,
    paddingTop: 0,
  },
  title: {
    fontSize: 30,
    marginTop: 15,
    fontFamily: 'montserrat',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.Gray,
    marginTop: 10,
    marginBottom: 30,
    fontFamily: 'roboto',
  },
  content: {
    marginTop: 25,
    gap: 20,
  },
  inputContainer: {
  },
  label: {
    marginBottom: 8,
    fontFamily: 'roboto',
  },
  input: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: Colors.Gray,
    fontFamily: 'roboto',
  },
  button: {
    padding: 15,
    backgroundColor: Colors.Primary,
    borderRadius: 15,
    marginTop: 30,
  },
  buttonText: {
    color: Colors.White,
    textAlign: 'center',
    fontSize: 15,
    fontFamily: 'manrope',
  },
  registerLink: {
    marginTop: 20,
  },
  registerText: {
    textAlign: 'center',
    color: Colors.Gray,
    fontSize: 15,
    textDecorationLine: 'underline',
    fontFamily: 'roboto',
  },
});