import { db, auth } from '@/configs/FirebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';
import { Alert } from 'react-native';

export const deleteNoteFromFirestore = async (noteId) => {
    if (!noteId) {
        Alert.alert('Помилка', 'Неможливо видалити нотатку без ID.');
        return false;
    }
    try {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Помилка', 'Користувач не авторизований');
            return false;
        }
        await deleteDoc(doc(db, 'notes', noteId));
        return true;
    } catch (error) {
        console.error('Помилка видалення:', error);
        Alert.alert('Помилка', 'Не вдалося видалити нотатку.');
        return false;
    }
};
