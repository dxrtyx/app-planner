import { useState, useEffect, useRef, useCallback } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Keyboard, Platform, StatusBar, Alert, ActivityIndicator, ToastAndroid, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import FooterToolbar from '../../components/note-editor/footer-toolbar';
import DoneButton from '../../components/note-editor/done-button';
import { useNoteEditor } from '../../components/note-editor/history-note-editor';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../configs/FirebaseConfig';
import OptionsMenu from '../../components/note-editor/options-menu';
import { saveNoteToFirestore } from '../../firebase/notes-saver';
import { deleteNoteFromFirestore } from '../../firebase/notes-deleter';

const checkboxStyles = {
    container: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    checkbox: { marginRight: 8 },
    input: { flex: 1, fontSize: 16, color: 'black', paddingVertical: 4, textDecorationLine: 'none' },
    checkedText: { color: Colors.Gray, textDecorationLine: 'line-through' },
    removeButton: { padding: 8, marginLeft: 4 }
};

export default function NotesEditor() {
    const navigation = useNavigation();
    const { noteId } = useLocalSearchParams();
    const user = auth.currentUser;
    const insets = useSafeAreaInsets();
    const [isFocused, setIsFocused] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isLoading, setIsLoading] = useState(!!noteId);
    const [isMenuVisible, setMenuVisible] = useState(false);

    //Стан зберігає дату та час для пікера
    const [pickerDate, setPickerDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [showPicker, setShowPicker] = useState(false);

    const {
        name, setName,
        text, setText,
        isPinned, setIsPinned,
        isImportant, setIsImportant,
        isFavorite, setIsFavorite,
        notificationId, setNotificationId,
        currentState,
        canUndo, canRedo,
        updateHistory,
        handleUndo, handleRedo,
        initializeNote
    } = useNoteEditor();

    const nameInputRef = useRef(null);
    const textInputRef = useRef(null);
    const checkboxInputRefs = useRef({});

    useEffect(() => {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowBanner: true,
                shouldShowList: true,
                shouldPlaySound: true,
                shouldSetBadge: false
            }),
        });
    }, []);

    useEffect(() => {
        if (noteId) {
            const fetchNoteData = async () => {
                try {
                    const docRef = doc(db, 'notes', noteId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        initializeNote(docSnap.data());
                    } else {
                        Alert.alert("Помилка", "Нотатку не знайдено.", [{ text: "OK", onPress: () => navigation.goBack() }]);
                    }
                } catch (error) {
                    console.error("Error fetching note for editing:", error);
                    Alert.alert("Помилка", "Не вдалося завантажити нотатку.", [{ text: "OK", onPress: () => navigation.goBack() }]);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchNoteData();
        } else {
            initializeNote({});
            setIsLoading(false);
        }
    }, [noteId, initializeNote, navigation]);

    useEffect(() => {
        StatusBar.setBarStyle('dark-content');
        if (Platform.OS === 'android') {
            StatusBar.setTranslucent(true);
            StatusBar.setBackgroundColor('transparent');
        }
        const showSub = Keyboard.addListener('keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
        const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const scheduleNotification = async (finalDate) => {
        const timeDiff = finalDate.getTime() - Date.now();
        if (timeDiff <= 0) {
            Alert.alert("Помилка", "Будь ласка, виберіть час у майбутньому.");
            return;
        }
        const secondsUntilNotification = Math.round(timeDiff / 1000);
        if (secondsUntilNotification < 5) {
            Alert.alert("Помилка", "Мінімальний інтервал для нагадування - 5 секунд.");
            return;
        }

        try {
            const newNotificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: name.trim() || "Нагадування",
                    body: text.trim().substring(0, 100) + (text.trim().length > 100 ? '...' : ''),
                    data: { noteId: noteId },
                    sound: true,
                },
                trigger: {
                    seconds: secondsUntilNotification,
                    channelId: 'default',
                },
            });

            const docRef = doc(db, 'notes', noteId);
            await updateDoc(docRef, {
                notificationId: newNotificationId,
                notificationDate: finalDate.toISOString()
            });

            setNotificationId(newNotificationId);
            ToastAndroid.show(`Нагадування встановлено на ${finalDate.toLocaleString()}`, ToastAndroid.LONG);
        } catch (error) {
            console.error("Помилка при створенні нагадування:", error);
        }
    };

    const onPickerChange = (event, selectedValue) => {
        setShowPicker(false); // Ховаємо пікер після дії
        if (event.type === 'dismissed' || !selectedValue) return;

        const newPickerDate = new Date(pickerDate);

        if (mode === 'date') {
            newPickerDate.setFullYear(selectedValue.getFullYear());
            newPickerDate.setMonth(selectedValue.getMonth());
            newPickerDate.setDate(selectedValue.getDate());

            setPickerDate(newPickerDate);
            showMode('time');
        } else if (mode === 'time') {
            newPickerDate.setHours(selectedValue.getHours());
            newPickerDate.setMinutes(selectedValue.getMinutes());
            newPickerDate.setSeconds(0);

            setPickerDate(newPickerDate);

            if (newPickerDate > new Date()) {
                scheduleNotification(newPickerDate);
            } else {
                Alert.alert("Помилка", "Обраний час вже минув.");
            }
        }
    };

    const showMode = (currentMode) => {
        setMode(currentMode);
        setShowPicker(true);
    };

    const handleSetNotification = async () => {
        if (!noteId) {
            Alert.alert("Збережіть нотатку", "Спочатку потрібно зберегти нотатку.");
            return;
        }

        if (notificationId) {
            try {
                await Notifications.cancelScheduledNotificationAsync(notificationId);
                const docRef = doc(db, 'notes', noteId);
                await updateDoc(docRef, { notificationId: null, notificationDate: null });
                setNotificationId(null);
                ToastAndroid.show("Нагадування скасовано", ToastAndroid.SHORT);
            } catch (e) {
                console.error("Помилка скасування: ", e);
            }
        } else {
            setPickerDate(new Date(Date.now() + 5 * 60 * 1000));
            showMode('date');
        }
    };

    const focusOnElement = useCallback((field, id = null) => {
        setTimeout(() => {
            switch (field) {
                case 'name': nameInputRef.current?.focus(); break;
                case 'text': textInputRef.current?.focus(); break;
                case 'checkbox': if (id && checkboxInputRefs.current[id]) checkboxInputRefs.current[id].focus(); break;
                default: break;
            }
        }, 50);
    }, []);

    const handleTogglePin = useCallback(() => {
        const newValue = !isPinned;
        setIsPinned(newValue);
        updateHistory({ ...currentState, isPinned: newValue }, 'isPinned');
    }, [isPinned, setIsPinned, currentState, updateHistory]);

    const handleToggleImportant = useCallback(() => {
        const newValue = !isImportant;
        setIsImportant(newValue);
        updateHistory({ ...currentState, isImportant: newValue }, 'isImportant');
    }, [isImportant, setIsImportant, currentState, updateHistory]);

    const handleToggleFavorite = useCallback(() => {
        const newValue = !isFavorite;
        setIsFavorite(newValue);
        updateHistory({ ...currentState, isFavorite: newValue }, 'isFavorite');
    }, [isFavorite, setIsFavorite, currentState, updateHistory]);

    const handleDelete = async () => {
        setMenuVisible(false);
        Alert.alert(
            "Видалити нотатку?", "Цю дію неможливо буде скасувати.",
            [
                { text: "Скасувати", style: "cancel" },
                {
                    text: "Видалити",
                    onPress: async () => {
                        if (notificationId) {
                            await Notifications.cancelScheduledNotificationAsync(notificationId);
                        }
                        const success = await deleteNoteFromFirestore(noteId);
                        if (success) {
                            ToastAndroid.show('Нотатку видалено', ToastAndroid.SHORT);
                            navigation.goBack();
                        }
                    },
                    style: "destructive"
                },
            ]
        );
    };

    const handleSubmit = async () => {
        if (!name.trim() && !text.trim() && (!currentState.checkboxes || currentState.checkboxes.length === 0)) {
            Alert.alert('Пуста нотатка', 'Додайте вміст перед збереженням'); return;
        }
        try {
            const noteData = {
                title: name.trim(), content: text.trim(), checkboxes: currentState.checkboxes || [],
                isPinned: isPinned,
                isImportant: isImportant,
                isFavorite: isFavorite,
                updatedAt: new Date().toISOString()
            };

            let currentNoteId = noteId;
            if (currentNoteId) {
                await saveNoteToFirestore(noteData, currentNoteId);
            } else {
                noteData.createdAt = new Date().toISOString();
                noteData.userId = user.uid;
                await saveNoteToFirestore(noteData);
            }

            if (Keyboard) Keyboard.dismiss();
            navigation.goBack();
        } catch (error) {
            console.error('Помилка збереження:', error);
        }
    };

    const handleAddCheckbox = useCallback(() => {
        const checkboxText = text.trim();
        const newCheckbox = { id: Date.now(), text: checkboxText, checked: false };
        const newState = {
            ...currentState,
            checkboxes: [...(currentState.checkboxes || []), newCheckbox],
            text: checkboxText ? '' : text
        };
        setName(newState.name); setText(newState.text);
        updateHistory(newState, 'checkbox', newCheckbox.id);
        focusOnElement('checkbox', newCheckbox.id);
    }, [currentState, text, updateHistory, setName, setText, focusOnElement]);

    const updateSingleCheckboxProperty = useCallback((id, newProps) => {
        const newCheckboxes = currentState.checkboxes.map(cb => cb.id === id ? { ...cb, ...newProps } : cb);
        const newState = { ...currentState, checkboxes: newCheckboxes };
        setName(newState.name); setText(newState.text);
        updateHistory(newState, 'checkbox', id);
    }, [currentState, updateHistory, setName, setText]);

    const handleCheckboxChange = useCallback((id, checked) => {
        updateSingleCheckboxProperty(id, { checked });
    }, [updateSingleCheckboxProperty]);

    const handleCheckboxTextChange = useCallback((id, newText) => {
        updateSingleCheckboxProperty(id, { text: newText });
    }, [updateSingleCheckboxProperty]);

    const handleRemoveCheckbox = useCallback((id) => {
        const deletedIndex = currentState.checkboxes.findIndex(cb => cb.id === id);
        const newCheckboxes = currentState.checkboxes.filter(cb => cb.id !== id);
        const newState = { ...currentState, checkboxes: newCheckboxes };
        setName(newState.name); setText(newState.text);
        updateHistory(newState);
        if (newCheckboxes.length > 0) {
            const focusIndex = Math.min(deletedIndex, newCheckboxes.length - 1);
            focusOnElement('checkbox', newCheckboxes[focusIndex].id);
        } else {
            focusOnElement('text');
        }
    }, [currentState, updateHistory, setName, setText, focusOnElement]);

    const handleUndoWithFocus = useCallback(() => {
        const prevState = handleUndo();
        if (prevState) focusOnElement(prevState.lastFocusedField, prevState.lastFocusedId);
    }, [handleUndo, focusOnElement]);

    const handleRedoWithFocus = useCallback(() => {
        const nextState = handleRedo();
        if (nextState) focusOnElement(nextState.lastFocusedField, nextState.lastFocusedId);
    }, [handleRedo, focusOnElement]);

    const showMainTextInput = !currentState.checkboxes || currentState.checkboxes.length === 0;

    if (isLoading) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={Colors.Primary} /></View>;
    }

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={[styles.header, { paddingTop: insets.top }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={24} color="black" />
                    </TouchableOpacity>
                    <View style={styles.headerMenu}>
                        <TouchableOpacity onPress={handleTogglePin}>
                            <Ionicons name={isPinned ? "pin" : "pin-outline"} size={24} color={isPinned ? Colors.Primary : "black"} style={styles.rotatedIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSetNotification}>
                            <Ionicons name={notificationId ? "alarm" : "alarm-outline"} size={24} color={notificationId ? Colors.Green : "black"} />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView style={styles.contentContainer} contentContainerStyle={styles.contentPadding} keyboardShouldPersistTaps="handled">
                <TextInput
                    ref={nameInputRef} style={styles.nameInput}
                    onChangeText={(value) => {
                        const newState = { ...currentState, name: value };
                        setName(value); updateHistory(newState, 'name');
                    }}
                    value={name} placeholder="Назва нотатки" placeholderTextColor={Colors.Gray}
                    multiline returnKeyType="next" blurOnSubmit={false} onFocus={() => setIsFocused(true)}
                />

                {currentState.checkboxes && currentState.checkboxes.map((checkbox) => (
                    <View key={checkbox.id} style={checkboxStyles.container}>
                        <TouchableOpacity style={checkboxStyles.checkbox} onPress={() => handleCheckboxChange(checkbox.id, !checkbox.checked)}>
                            <Ionicons name={checkbox.checked ? "checkbox" : "square-outline"} size={24} color={Colors.Primary} />
                        </TouchableOpacity>
                        <TextInput
                            ref={(ref) => (checkboxInputRefs.current[checkbox.id] = ref)}
                            style={[checkboxStyles.input, checkbox.checked && checkboxStyles.checkedText]}
                            value={checkbox.text} onChangeText={(text) => handleCheckboxTextChange(checkbox.id, text)}
                            placeholder="Пункт списку" placeholderTextColor={Colors.Gray} multiline onFocus={() => setIsFocused(true)}
                        />
                        <TouchableOpacity style={checkboxStyles.removeButton} onPress={() => handleRemoveCheckbox(checkbox.id)}>
                            <Ionicons name="close" size={16} color={Colors.Gray} />
                        </TouchableOpacity>
                    </View>
                ))}

                {showMainTextInput && (
                    <TextInput
                        ref={textInputRef} style={styles.input} value={text}
                        onChangeText={(value) => {
                            const newState = { ...currentState, text: value };
                            setText(value); updateHistory(newState, 'text');
                        }}
                        placeholder="Текст нотатки" placeholderTextColor={Colors.Gray}
                        multiline textAlignVertical="top" onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
                    />
                )}
            </ScrollView>

            <FooterToolbar
                onAddCheckbox={handleAddCheckbox} onUndo={handleUndoWithFocus} onRedo={handleRedoWithFocus}
                canUndo={canUndo} canRedo={canRedo} insets={insets}
                keyboardHeight={keyboardHeight} onOpenMenu={() => setMenuVisible(true)}
            />

            <OptionsMenu
                isVisible={isMenuVisible} onClose={() => setMenuVisible(false)}
                onToggleImportant={handleToggleImportant}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete} isImportant={isImportant} isFavorite={isFavorite}
            />

            {isFocused && (
                <DoneButton onPress={handleSubmit} keyboardHeight={keyboardHeight} insets={insets} isVisible={isFocused} />
            )}

            {showPicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={pickerDate}
                    mode={mode}
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onPickerChange}
                    minimumDate={new Date(Date.now() + 10000)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.White,
    },
    safeArea: {
        backgroundColor: Colors.White,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        paddingHorizontal: 16,
        backgroundColor: Colors.White,
        justifyContent: 'space-between',
    },
    headerMenu: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    rotatedIcon: {
        transform: [{ rotate: '45deg' }]
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 25,
    },
    contentPadding: {
        paddingBottom: 80,
    },
    nameInput: {
        fontSize: 20,
        color: Colors.Primary,
        fontWeight: '500',
        marginBottom: 16,
        paddingTop: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.Primary,
        minHeight: 200,
        lineHeight: 24,
    },
});