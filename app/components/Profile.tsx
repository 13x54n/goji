import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { sessionService } from '../../lib/sessionService';
import CustomAlert from './CustomAlert';
interface ProfileProps {
  session: any;
  onLogout: () => void;
}

export default function Profile({ session, onLogout }: ProfileProps) {
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    buttons: [] as Array<{text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive'}>
  });

  const showCustomAlert = (title: string, message: string, buttons: Array<{text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive'}>) => {
    setAlertConfig({ title, message, buttons });
    setShowAlert(true);
  };

  const handleLogout = async () => {
    showCustomAlert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await sessionService.clearSession();
            onLogout();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Profile</Text>
      <View style={styles.profileInfo}>
        <Text style={styles.profileLabel}>Email:</Text>
        <Text style={styles.profileValue}>{session?.email}</Text>
        <Text style={styles.profileLabel}>Last Activity:</Text>
        <Text style={styles.profileValue}>
          {session?.lastActivity ? new Date(session.lastActivity).toLocaleString() : 'N/A'}
        </Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setShowAlert(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  profileInfo: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#333333',
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
