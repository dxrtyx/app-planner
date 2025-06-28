import { View, Text, TouchableOpacity, StatusBar, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { Colors } from '@/constants/Colors';
import Entypo from '@expo/vector-icons/Entypo';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CreateNewNote from '../../components/home-page/create-new-note';
import { auth, db } from '../../configs/FirebaseConfig'
import { collection, getDocs, query, where } from 'firebase/firestore';
import UserNotesList from '../../components/home-page/user-notes-list';

export default function HomePage() {
  const [userNotes, setUserNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;

  const fetchNotes = useCallback(async () => {
    try {
      if (!user) return;
      
      setRefreshing(true);
      const q = query(collection(db, 'notes'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      const notes = [];
      querySnapshot.forEach((doc) => {
        notes.push({ id: doc.id, ...doc.data() });
      });

      setUserNotes(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Автоматичне оновлення при фокусі на сторінці
  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [fetchNotes])
  );

  // Функція для ручного оновлення (pull-to-refresh)
  const onRefresh = useCallback(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <View style={styles.safeArea}>
      <StatusBar 
        backgroundColor={Colors.White} 
        barStyle="dark-content" 
        translucent 
      />

      {/* Хедер */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Ваші записи</Text>
        
        <TouchableOpacity onPress={() => router.push('/create-notes/notes-editor')}>
          <Entypo 
            name="add-to-list" 
            size={36} 
            color={Colors.Primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Контент */}
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.Primary} />
        ) : userNotes.length === 0 ? (
          <CreateNewNote />
        ) : (
          <UserNotesList 
            userNotes={userNotes} 
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.Primary]}
              />
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.White,
    paddingTop: 25,
  },
  header: {
    paddingHorizontal: 25,
    paddingBottom: 15,
    backgroundColor: Colors.White,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.4,
    borderBottomColor: Colors.Shadows,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '600',
    fontFamily: 'montserrat',
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 5,
    backgroundColor: Colors.White,
  },
});