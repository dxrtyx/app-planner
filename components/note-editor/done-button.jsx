import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const DoneButton = ({ 
  onPress, 
  keyboardHeight, 
  insets,
  isVisible 
}) => {
  if (!isVisible) return null;

  return (
    <TouchableOpacity 
      style={[
        styles.doneButton, 
        { 
          bottom: keyboardHeight > 0 
            ? keyboardHeight + 106 
            : Math.max(insets.bottom, 96) + 12
        }
      ]} 
      onPress={onPress}
    >
      <Ionicons name="checkmark-circle" size={32} color={Colors.Primary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  doneButton: {
    position: 'absolute',
    right: 24,
    backgroundColor: Colors.White,
    borderRadius: 50,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

export default DoneButton;