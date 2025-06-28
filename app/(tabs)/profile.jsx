import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { auth } from '../../configs/FirebaseConfig';
import { signOut, updateProfile } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {

    const router = useRouter();
    // Стан, щоб UI реагував на зміни
    const [user, setUser] = useState(auth.currentUser);
    const [isNameModalVisible, setIsNameModalVisible] = useState(false);
    const [newName, setNewName] = useState(user?.displayName || '');

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.replace('/'); // replace не дозволить повернутись назад кнопкою "назад"
        } catch (error) {
            console.error("Помилка виходу:", error);
            Alert.alert("Помилка", "Не вдалося вийти з акаунту.");
        }
    };

    // Функція для збереження нового імені
    const handleSaveName = async () => {
        if (!newName.trim()) {
            Alert.alert("Помилка", "Ім'я не може бути порожнім.");
            return;
        }
        try {
            await updateProfile(user, { displayName: newName.trim() });
            setUser({ ...user, displayName: newName.trim() }); // Оновлюємо локальний стан
            setIsNameModalVisible(false);
            Alert.alert("Успіх", "Ім'я оновлено!");
        } catch(e) {
            console.error("Помилка оновлення імені:", e);
            Alert.alert("Помилка", "Не вдалося оновити ім'я.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Основний контент, який займає вільний простір */}
            <View style={styles.mainContent}>
                <View style={styles.avatarContainer}>
                    <Image 
                        source={{ uri: user?.photoURL || 'https://placehold.co/120x120/EFEFEF/AAAAAA?text=User' }} 
                        style={styles.avatar} 
                    />
                </View>

                <View style={styles.userInfo}>
                    <View style={styles.nameContainer}>
                        <Text style={styles.displayName}>{user?.displayName || 'Ім\'я не вказано'}</Text>
                        <TouchableOpacity onPress={() => setIsNameModalVisible(true)}>
                            <Ionicons name="create-outline" size={24} color={Colors.Primary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.email}>{user?.email}</Text>
                </View>
            </View>

            {/* Футер з кнопкою, притиснутий до низу */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                    <Text style={styles.logoutButtonText}>Вийти з акаунту</Text>
                </TouchableOpacity>
            </View>

            {/* Модальне вікно для зміни імені */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isNameModalVisible}
                onRequestClose={() => setIsNameModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Змінити ім'я</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={newName}
                            onChangeText={setNewName}
                            placeholder="Введіть нове ім'я"
                            autoCapitalize="words"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsNameModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Скасувати</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveName}>
                                <Text style={styles.saveButtonText}>Зберегти</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.White,
        paddingHorizontal: 20,
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        paddingVertical: 20,
    },
    avatarContainer: {
        marginBottom: 20,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: Colors.Primary,
    },
    userInfo: {
        alignItems: 'center',
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    displayName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.Primary,
    },
    email: {
        fontSize: 16,
        color: Colors.Gray,
    },
    logoutButton: {
        backgroundColor: Colors.Primary,
        padding: 15,
        borderRadius: 15,
        width: '100%',
    },
    logoutButtonText: {
        color: Colors.White,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: Colors.Shadow,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: Colors.White,
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        elevation: 5,
        shadowColor: Colors.Primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalInput: {
        width: '100%',
        borderWidth: 1,
        borderColor: Colors.Gray,
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: Colors.Gray,
        marginRight: 10,
    },
    saveButton: {
        backgroundColor: Colors.Primary,
    },
    cancelButtonText: {
        fontWeight: 'bold',
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
    }
});