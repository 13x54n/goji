import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { API_ENDPOINTS } from '../config/api';
import { getDeviceInfo } from '../lib/deviceUtils';
import { sessionService } from '../lib/sessionService';

export default function SettingsScreen() {
  const [session, setSession] = useState<any>(null);
  const [hasPasskey, setHasPasskey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const currentSession = sessionService.getSession();
    setSession(currentSession);
    setHasPasskey(currentSession?.hasPasskey || false);
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      // Enable biometric authentication
      await enablePasskey();
    } else {
      // Disable biometric authentication
      await disablePasskey();
    }
  };

  const enablePasskey = async () => {
    if (!session?.email) {
      Alert.alert("Error", "Email is required");
      return;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      Alert.alert(
        "Biometric Not Available",
        "Your device doesn't support biometric authentication or it's not configured. Please set up Face ID or Touch ID in your device settings.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    setIsLoading(true);

    try {
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with Face ID to enable passkey',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (authResult.success) {
        const credentialId = await require('expo-crypto').digestStringAsync(
          require('expo-crypto').CryptoDigestAlgorithm.SHA256,
          `${session.email}-${Date.now()}`,
          { encoding: require('expo-crypto').CryptoEncoding.HEX }
        );

        const deviceInfo = await getDeviceInfo();

        const passkeyData = {
          email: session.email,
          credentialId: credentialId,
          createdAt: new Date().toISOString(),
          deviceInfo: deviceInfo
        };

        try {
          const response = await fetch(API_ENDPOINTS.PASSKEYS.CREATE, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(passkeyData),
          });

          if (!response.ok) {
            throw new Error('Failed to create passkey on server');
          }

          const result = await response.json();

          await sessionService.createSession({
            ...session,
            hasPasskey: true,
            credentialId: result.passkey.credentialId,
          });

          setHasPasskey(true);
          Alert.alert("Success", "Passkey has been enabled successfully!");
        } catch (error) {
          console.error('Error creating passkey on server:', error);
          Alert.alert("Error", "Failed to enable passkey. Please try again.");
        }
      } else {
        Alert.alert("Authentication Failed", "Biometric authentication was cancelled or failed.");
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert("Error", "Biometric authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const disablePasskey = async () => {
    Alert.alert(
      "Disable Passkey",
      "Are you sure you want to disable passkey authentication? You'll need to use email verification for future logins.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disable",
          style: "destructive",
          onPress: async () => {
            try {
              // Update session to remove passkey
              await sessionService.createSession({
                ...session,
                hasPasskey: false,
                credentialId: undefined,
              });
              
              setHasPasskey(false);
              Alert.alert("Success", "Passkey has been disabled.");
            } catch (error) {
              console.error('Error disabling passkey:', error);
              Alert.alert("Error", "Failed to disable passkey. Please try again.");
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            sessionService.logout();
            router.replace('/');
          }
        }
      ]
    );
  };

  const settingsItems = [
    {
      id: 'biometric',
      title: 'Biometric Authentication',
      subtitle: 'Use Face ID or Touch ID to sign in',
      icon: 'finger-print',
      type: 'toggle',
      value: hasPasskey,
      onToggle: handleBiometricToggle,
      disabled: isLoading,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      icon: 'notifications',
      type: 'navigate',
      onPress: () => router.push('/notifications'),
    },
    {
      id: 'security',
      title: 'Security',
      subtitle: 'Password, 2FA, and security settings',
      icon: 'shield-checkmark',
      type: 'navigate',
      onPress: () => Alert.alert("Coming Soon", "Security settings will be available soon."),
    },
    {
      id: 'privacy',
      title: 'Privacy',
      subtitle: 'Data and privacy controls',
      icon: 'lock-closed',
      type: 'navigate',
      onPress: () => Alert.alert("Coming Soon", "Privacy settings will be available soon."),
    },
  ];

  const renderSettingItem = (item: any) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress}
        disabled={item.disabled}
      >
        <View style={styles.settingContent}>
          <View style={styles.settingIcon}>
            <Ionicons name={item.icon as any} size={24} color="#ffffff" />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          </View>
          {item.type === 'toggle' ? (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              disabled={item.disabled}
              trackColor={{ false: '#333333', true: '#2ecc71' }}
              thumbColor={item.value ? '#ffffff' : '#cccccc'}
            />
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#cccccc" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Settings Content */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            {session?.email ? (
              <Text style={styles.avatarText}>
                {session.email.split('@')[0][0].toUpperCase()}
              </Text>
            ) : (
              <Ionicons name="person" size={32} color="#ffffff" />
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {session?.email ? session.email.split('@')[0] : 'User'}
            </Text>
            <Text style={styles.userEmail}>{session?.email}</Text>
          </View>
        </View>

        {/* Settings Items */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account & Security</Text>
          {settingsItems.map(renderSettingItem)}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2ecc71',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#cccccc',
  },
  settingsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  settingItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#cccccc',
  },
  logoutSection: {
    marginTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ef4444',
    marginLeft: 8,
  },
});
