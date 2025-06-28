import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const FooterToolbar = ({
  onAddCheckbox,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  insets,
  keyboardHeight,
  onOpenMenu,
}) => {
  return (
    <View style={[styles.bottomContainer, { 
      paddingBottom: Math.max(insets.bottom, 12),
      bottom: keyboardHeight > 0 ? keyboardHeight : 0
    }]}>
      <View style={styles.bottomContent}>
        <TouchableOpacity style={styles.bottomButton} onPress={onAddCheckbox}>
          <Ionicons name="add-circle-outline" size={26} color={Colors.Primary} />
        </TouchableOpacity>
        
        <View style={styles.undoRedoContainer}>
          <TouchableOpacity style={styles.bottomButton} onPress={onUndo} disabled={!canUndo}>
            <AntDesign name="back" size={24} color={!canUndo ? Colors.Gray : Colors.Primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomButton} onPress={onRedo} disabled={!canRedo}>
            <AntDesign name="back" size={24} color={!canRedo ? Colors.Gray : Colors.Primary} style={styles.rotatedRedoIcon} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.bottomButton} onPress={onOpenMenu}>
          <MaterialCommunityIcons name="dots-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: Colors.White,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#dcdcdc',
    elevation: 8,
    shadowColor: Colors.Primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  bottomContent: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Цей стиль добре працює для 4 кнопок
    alignItems: 'center',
    paddingVertical: 0,
  },
  undoRedoContainer: {
    flexDirection: 'row', 
    alignItems: 'center'
  },
  bottomButton: {
    padding: 12,
  },
  rotatedRedoIcon: {
    transform: [{ rotate: '180deg' }]
  },
});

export default FooterToolbar;