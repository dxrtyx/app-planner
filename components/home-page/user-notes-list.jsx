import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import MarkdownDisplay from 'react-native-markdown-display';

const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
};


export default function UserNotesList({ userNotes, refreshControl }) {
    const router = useRouter();

    const getNotePriority = (note) => {
        if (note.isPinned) return 4;
        if (note.isImportant) return 3;
        if (note.isFavorite) return 2;
        return 1;
    };

    const sortedNotes = [...userNotes].sort((a, b) => {
        const priorityA = getNotePriority(a);
        const priorityB = getNotePriority(b);
        if (priorityA !== priorityB) {
            return priorityB - priorityA;
        }
        // Сорутування за датою нотаток без міток
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });

    const handleNotePress = (note) => {
        router.push({
            pathname: '/create-notes/notes-editor',
            params: { noteId: note.id }
        });
    };

    const truncateText = (text, maxLength = 100) => {
        if (!text) return '';
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text;
    };

    const customMarkdownRules = {
        ins: (node, children) => (
            <Text key={node.key} style={{ textDecorationLine: 'underline' }}>
                {children}
            </Text>
        ),
    };


    const renderNoteItem = ({ item }) => {
        const maxVisibleCheckboxes = 3;
        const hasCheckboxes = item.checkboxes && item.checkboxes.length > 0;
        const visibleCheckboxes = hasCheckboxes ? item.checkboxes.slice(0, maxVisibleCheckboxes) : [];
        const hiddenCheckboxesCount = hasCheckboxes ? item.checkboxes.length - visibleCheckboxes.length : 0;
        
        const displayDate = formatDate(item.updatedAt || item.createdAt);

        return (
            <TouchableOpacity 
                style={styles.cardContent}
                onPress={() => handleNotePress(item)}
            >
                <View style={styles.noteHeader}>
                    {/* Іконки-ярлики */}
                    {item.isPinned && <Ionicons name="pin" size={16} color={Colors.Primary} style={styles.pinIcon} />}
                    
                    {/* Іконка-сповіщення */}
                    {item.notificationId && <Ionicons name="alarm" size={16} color={Colors.Green} style={styles.tagIcon} />}

                    {item.isImportant && <MaterialIcons name="label-important" size={18} color={'#FFC300'} style={styles.tagIcon} />}
                    {item.isFavorite && <AntDesign name="star" size={16} color={Colors.Red} style={styles.tagIcon} />}
                    
                    <Text style={styles.noteTitle} numberOfLines={1}>{item.title || 'Без назви'}</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.Gray} />
                </View>
                
                <View style={styles.noteBody}>
                    {hasCheckboxes ? (
                        <View style={styles.checkboxesContainer}>
                            {visibleCheckboxes.map(checkbox => (
                                <View key={checkbox.id} style={styles.checkboxItem}>
                                    <Ionicons 
                                        name={checkbox.checked ? "checkbox" : "square-outline"} 
                                        size={16} 
                                        color={Colors.Gray} 
                                    />
                                    <Text style={[styles.checkboxText, checkbox.checked && styles.completedText]}>
                                        {checkbox.text}
                                    </Text>
                                </View>
                            ))}
                            {hiddenCheckboxesCount > 0 && (
                                <Text style={styles.moreItemsText}>
                                    +{hiddenCheckboxesCount} more items
                                </Text>
                            )}
                        </View>
                    ) : (
                        item.content && (
                            <MarkdownDisplay
                                rules={customMarkdownRules}
                                style={{
                                    body: styles.noteContent,
                                    strong: { fontWeight: 'bold' },
                                    em: { fontStyle: 'italic' },
                                    strikethrough: { textDecorationLine: 'line-through' },
                                }}
                            >
                                {truncateText(item.content)}
                            </MarkdownDisplay>
                        )
                    )}
                </View>

                <View style={styles.noteFooter}>
                    <Text style={styles.noteDate}>{displayDate}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.listContent}>
            <FlatList
                data={sortedNotes}
                renderItem={renderNoteItem}
                refreshControl={refreshControl}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    listContent: {
        flex: 1,
        backgroundColor: Colors.White,
    },
    listContainer: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    cardContent: {
        borderWidth: 1,
        borderColor: Colors.LightGray,
        borderRadius: 15,
        padding: 20,
        marginTop: 15,
        backgroundColor: Colors.White,
        elevation: 2,
        shadowColor: Colors.Primary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    pinIcon: {
        marginRight: 8,
        transform: [{ rotate: '35deg' }]
    },
    tagIcon: {
        marginRight: 8,
    },
    noteTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.Dark,
        flex: 1,
    },
    noteBody: {
        minHeight: 20,
    },
    noteContent: {
        fontSize: 14,
        color: Colors.DarkGray,
        lineHeight: 20,
    },
    checkboxesContainer: {
        marginVertical: 4,
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    checkboxText: {
        fontSize: 14,
        color: Colors.DarkGray,
        marginLeft: 8,
        flex: 1,
    },
    completedText: {
        color: Colors.Gray,
        textDecorationLine: 'line-through',
    },
    moreItemsText: {
        fontSize: 12,
        color: Colors.Gray,
        marginTop: 5,
        fontStyle: 'italic',
    },
    noteFooter: {
        marginTop: 15,
    },
    noteDate: {
        fontSize: 12,
        color: Colors.Gray,
    },
});
