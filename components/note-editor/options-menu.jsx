import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';

const OptionsMenu = ({ 
    isVisible, 
    onClose, 
    onToggleImportant, 
    onToggleFavorite, 
    onDelete,
    isImportant,
    isFavorite
}) => {
  if (!isVisible) return null;

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} onPress={onClose}>
        <View style={styles.menuContainer}>

          <TouchableOpacity style={styles.menuItem} onPress={onToggleImportant}>
            <MaterialIcons 
              name={isImportant ? "label-important" : "label-important-outline"} 
              size={24} 
              color={isImportant ? Colors.Primary : Colors.DarkGray} 
            />
            <Text style={styles.menuText}>Важливе</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={onToggleFavorite}>
            <AntDesign 
              name={isFavorite ? "star" : "staro"} 
              size={22} 
              color={isFavorite ? Colors.Primary : Colors.DarkGray} 
            />
            <Text style={styles.menuText}>Обране</Text>
          </TouchableOpacity>

          <View style={styles.divider} />
          <TouchableOpacity style={[styles.menuItem]} onPress={onDelete}>
            <Ionicons name="trash-outline" size={22} color={Colors.Red} />
            <Text style={[styles.menuText, { color: Colors.Red }]}>Видалити</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.Shadow,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  menuContainer: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    backgroundColor: Colors.White,
    borderRadius: 15,
    paddingVertical: 10,
    width: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: Colors.Dark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.Gray,
    marginVertical: 5,
  },
});


export default OptionsMenu;