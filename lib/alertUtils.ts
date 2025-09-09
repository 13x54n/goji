import { useState } from 'react';

// Alert configuration type
export interface AlertConfig {
  title: string;
  message: string;
  buttons: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

// Custom hook for managing alerts
export const useAlert = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    title: '',
    message: '',
    buttons: []
  });

  const showCustomAlert = (
    title: string, 
    message: string, 
    buttons: Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  ) => {
    setAlertConfig({ title, message, buttons });
    setShowAlert(true);
  };

  const hideAlert = () => {
    setShowAlert(false);
  };

  return {
    showAlert,
    alertConfig,
    showCustomAlert,
    hideAlert
  };
};
