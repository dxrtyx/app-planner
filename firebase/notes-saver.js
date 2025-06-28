import { db, auth } from '@/configs/FirebaseConfig';
import { doc, setDoc, collection } from 'firebase/firestore'; //'collection' для генерації ID
import { Alert } from 'react-native';

/**
 * Зберігає або оновлює нотатку в Firestore
 * @param {object} noteData - Об'єкт з даними нотатки (title, content, isPinned, etc.)
 * @param {string|null} existingNoteId - ID існуючої нотатки для оновлення
 * @returns {boolean} - true у разі успіху, false - у разі помилки
 */
export const saveNoteToFirestore = async (noteData, existingNoteId = null) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Помилка', 'Користувач не авторизований');
      return false;
    }

    //Генерація унікального ID від Firestore, якщо нотатка нова
    const noteId = existingNoteId || doc(collection(db, 'notes')).id;

    //Додаємо/оновлюємо id та userId.
    const noteToSave = {
      ...noteData,
      id: noteId,
      userId: user.uid,
    };

    // Використовуємо setDoc з опцією merge: true, для оновлення полів
    await setDoc(doc(db, 'notes', noteId), noteToSave, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Помилка збереження нотатки:', error);
    Alert.alert('Помилка', 'Не вдалося зберегти нотатку. Будь ласка, спробуйте ще раз.');
    return false;
  }
};

const NotesReview = () => null;
export default NotesReview;