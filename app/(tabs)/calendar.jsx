import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Colors } from '@/constants/Colors';
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../configs/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';

// Локалі для календаря (назви місяців та днів тижня)
LocaleConfig.locales['ua'] = {
  monthNames: ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'],
  monthNamesShort: ['Січ.','Лют.','Бер.','Квіт.','Трав.','Черв.','Лип.','Серп.','Вер.','Жовт.','Лист.','Груд.'],
  dayNames: ['Неділя','Понеділок','Вівторок','Середа','Четвер','П\'ятниця','Субота'],
  dayNamesShort: ['Нд','Пн','Вт','Ср','Чт','Пт','Сб'],
  today: 'Сьогодні'
};
LocaleConfig.defaultLocale = 'ua';

// Функція для форматування дати в рядок 'YYYY-MM-DD'
const toDateString = (date) => {
    return date.toISOString().split('T')[0];
};

export default function CalendarScreen() {
    const router = useRouter();
    const user = auth.currentUser;
    const [isLoading, setIsLoading] = useState(true);
    const [allNotes, setAllNotes] = useState([]);
    const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));

    // Нотатки зі сповіщеннями при фокусі на екрані
    useFocusEffect(
        useCallback(() => {
            if (!user) {
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            const q = query(collection(db, 'notes'), 
                where('userId', '==', user.uid),
                where('notificationDate', '!=', null) // Нотатки лише з датою сповіщення
            );
            
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllNotes(notes);
                setIsLoading(false);
            }, (error) => {
                console.error("Error fetching notes for calendar:", error);
                setIsLoading(false);
            });

            return () => unsubscribe(); // Відключаємо слухача
        }, [user])
    );

    // useMemo для оптимізації: об'єкти будуть перераховуються тільки коли змінюються allNotes або selectedDate.
    const { markedDates, notesForSelectedDay } = useMemo(() => {
        const marked = {};
        allNotes.forEach(note => {
            const dateStr = toDateString(new Date(note.notificationDate));
            marked[dateStr] = { marked: true, dotColor: Colors.Primary };
        });

        // Виділяємо обрану дату
        if (marked[selectedDate]) {
            marked[selectedDate].selected = true;
            marked[selectedDate].selectedColor = Colors.Green;
        } else {
            marked[selectedDate] = { selected: true, selectedColor: Colors.Green };
        }

        const filteredNotes = allNotes
            .filter(note => toDateString(new Date(note.notificationDate)) === selectedDate)
            .sort((a, b) => new Date(a.notificationDate) - new Date(b.notificationDate));

        return { markedDates: marked, notesForSelectedDay: filteredNotes };
    }, [allNotes, selectedDate]);
    
    const handleDayPress = (day) => {
        setSelectedDate(day.dateString);
    };

    const renderNoteItem = ({ item }) => {
        const notificationTime = new Date(item.notificationDate).toLocaleTimeString('uk-UA', {
            hour: '2-digit', minute: '2-digit'
        });

        return (
            <TouchableOpacity 
                style={styles.noteItem}
                onPress={() => router.push({ pathname: '/create-notes/notes-editor', params: { noteId: item.id }})}
            >
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{notificationTime}</Text>
                </View>
                <View style={styles.detailsContainer}>
                    <Text style={styles.noteTitle} numberOfLines={1}>{item.title || 'Без назви'}</Text>
                    {item.content && <Text style={styles.noteContent} numberOfLines={1}>{item.content}</Text>}
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.Gray} />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Календар</Text>
            <Calendar
                current={selectedDate}
                onDayPress={handleDayPress}
                markedDates={markedDates}
                theme={{
                    backgroundColor: '#ffffff',
                    calendarBackground: '#ffffff',
                    textSectionTitleColor: '#b6c1cd',
                    selectedDayBackgroundColor: Colors.Primary,
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: Colors.Primary,
                    dayTextColor: '#2d4150',
                    textDisabledColor: '#d9e1e8',
                    arrowColor: Colors.Primary,
                    monthTextColor: Colors.Primary,
                    indicatorColor: 'blue',
                    textDayFontWeight: '300',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '300',
                    textDayFontSize: 16,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 14,
                }}
            />
            <View style={styles.listHeader}>
                 <Text style={styles.listHeaderText}>
                    Події на {new Date(selectedDate).toLocaleDateString('uk-UA', {day: 'numeric', month: 'long'})}
                </Text>
            </View>

            {isLoading ? (
                <ActivityIndicator style={{ marginTop: 20 }} size="large" color={Colors.Primary} />
            ) : notesForSelectedDay.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Немає запланованих нотаток</Text>
                </View>
            ) : (
                <FlatList
                    data={notesForSelectedDay}
                    renderItem={renderNoteItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.White,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.Dark,
        padding: 20,
        paddingBottom: 10,
    },
    listHeader: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.LightGray,
        backgroundColor: '#f9f9f9'
    },
    listHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.DarkGray
    },
    listContainer: {
        paddingHorizontal: 20,
    },
    noteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderColor: Colors.Gray,
    },
    timeContainer: {
        width: 60,
    },
    timeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.Primary,
    },
    detailsContainer: {
        flex: 1,
        marginLeft: 10,
    },
    noteTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.Primary,
        marginBottom: 2,
    },
    noteContent: {
        fontSize: 14,
        color: Colors.Gray,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: Colors.Gray,
    }
});