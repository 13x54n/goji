import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface AlertButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export default function CustomAlert({
  visible,
  title,
  message,
  buttons,
  onClose,
}: CustomAlertProps) {
  const handleButtonPress = (button: AlertButton) => {
    button.onPress();
    onClose();
  };

  const getButtonStyle = (style?: string) => {
    switch (style) {
      case 'destructive':
        return styles.destructiveButton;
      case 'cancel':
        return styles.cancelButton;
      default:
        return styles.defaultButton;
    }
  };

  const getButtonTextStyle = (style?: string) => {
    switch (style) {
      case 'destructive':
        return styles.destructiveButtonText;
      case 'cancel':
        return styles.cancelButtonText;
      default:
        return styles.defaultButtonText;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <View style={styles.alertContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="information-circle" size={32} color="#fff" />
            </View>
            
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            
            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    getButtonStyle(button.style),
                  
                    {paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6}
                  ]}
                  onPress={() => handleButtonPress(button)}
                >
                  <Text style={[
                    styles.buttonText,
                    getButtonTextStyle(button.style)
                  ]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    width: width * 0.85,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  alertContent: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'column',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultButton: {
    backgroundColor: '#fff',
  },
  cancelButton: {
    backgroundColor: '#333333',
    borderWidth: 1,
    borderColor: '#555555',
  },
  destructiveButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  defaultButtonText: {
    color: '#000',
  },
  cancelButtonText: {
    color: '#FFFFFF',
  },
  destructiveButtonText: {
    color: '#FFFFFF',
  },
});
