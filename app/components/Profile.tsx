import React from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { sessionService } from '../../lib/sessionService';

interface ProfileProps {
  session: any;
  onLogout: () => void;
}

export default function Profile({ session, onLogout }: ProfileProps) {
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
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
    </View>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  profileInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: '#000000',
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
