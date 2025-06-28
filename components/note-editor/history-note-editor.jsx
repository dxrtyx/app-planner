import { useState, useCallback } from 'react';

export const useNoteEditor = () => {
    const [name, setName] = useState('');
    const [text, setText] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const [isImportant, setIsImportant] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [notificationId, setNotificationId] = useState(null); 
    //Cтан для дати сповіщення
    const [notificationDate, setNotificationDate] = useState(null); 

    const [contentHistory, setContentHistory] = useState([{
        name: '', text: '', checkboxes: [],
        isPinned: false, isImportant: false, isFavorite: false,
        notificationId: null, notificationDate: null, // Додавання в історію
        lastFocusedField: null, lastFocusedId: null
    }]);
    const [historyIndex, setHistoryIndex] = useState(0);
    
    const currentState = {
        name, text, isPinned, isImportant, isFavorite,
        notificationId, notificationDate, // Додавання до поточного стану
        checkboxes: contentHistory[historyIndex]?.checkboxes || []
    };
    
    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < contentHistory.length - 1;

    const initializeNote = useCallback((noteData = {}) => {
        const initialName = noteData.title || '';
        const initialText = noteData.content || '';
        const initialCheckboxes = noteData.checkboxes || [];
        const initialIsPinned = noteData.isPinned || false;
        const initialIsImportant = noteData.isImportant || false;
        const initialIsFavorite = noteData.isFavorite || false;
        const initialNotificationId = noteData.notificationId || null;
        const initialNotificationDate = noteData.notificationDate || null; //Ініцілізація дати

        setName(initialName);
        setText(initialText);
        setIsPinned(initialIsPinned);
        setIsImportant(initialIsImportant);
        setIsFavorite(initialIsFavorite);
        setNotificationId(initialNotificationId);
        setNotificationDate(initialNotificationDate); //Встановлення дати

        const initialState = {
            name: initialName, text: initialText, checkboxes: initialCheckboxes,
            isPinned: initialIsPinned, isImportant: initialIsImportant, isFavorite: initialIsFavorite,
            notificationId: initialNotificationId, notificationDate: initialNotificationDate, //Зберігання в історію
            lastFocusedField: 'name', lastFocusedId: null
        };
        
        setContentHistory([initialState]);
        setHistoryIndex(0);
    }, []);

    const updateHistory = useCallback((newState, focusedField = null, focusedId = null) => {
        const newHistory = contentHistory.slice(0, historyIndex + 1);
        setContentHistory([
            ...newHistory, 
            { ...newState, lastFocusedField: focusedField, lastFocusedId: focusedId }
        ]);
        setHistoryIndex(newHistory.length);
    }, [contentHistory, historyIndex]);

    const handleUndo = useCallback(() => {
        if (!canUndo) return null;
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const prevState = contentHistory[newIndex];
        
        setName(prevState.name);
        setText(prevState.text);
        setIsPinned(prevState.isPinned);
        setIsImportant(prevState.isImportant);
        setIsFavorite(prevState.isFavorite); 
        setNotificationId(prevState.notificationId);
        setNotificationDate(prevState.notificationDate); //Відновлення дати
        
        return prevState;
    }, [canUndo, contentHistory, historyIndex]);

    const handleRedo = useCallback(() => {
        if (!canRedo) return null;
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        const nextState = contentHistory[newIndex];
        
        setName(nextState.name);
        setText(nextState.text);
        setIsPinned(nextState.isPinned);
        setIsImportant(nextState.isImportant);
        setIsFavorite(nextState.isFavorite);
        setNotificationId(nextState.notificationId);
        setNotificationDate(nextState.notificationDate); //Відновлення дати
        
        return nextState;
    }, [canRedo, contentHistory, historyIndex]);

   return {
        name, setName, text, setText, currentState,
        isPinned, setIsPinned, isImportant, setIsImportant, isFavorite, setIsFavorite,
        notificationId, setNotificationId,
        notificationDate, setNotificationDate, 
        canUndo, canRedo, updateHistory, handleUndo, handleRedo, initializeNote // Експорт
   };
};