import { Ionicons } from "@expo/vector-icons";
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { API_ENDPOINTS } from '../config/api';
import { getDeviceInfo } from '../lib/deviceUtils';
import { sessionService } from '../lib/sessionService';
import CustomAlert from './components/CustomAlert';

export default function BiometricSetupScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [isLoading, setIsLoading] = useState(false);
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

  const handleEnablePasskey = async () => {
    if (!email) {
      showCustomAlert("Error", "Email is required", [
        { text: 'OK', onPress: () => {} }
      ]);
      return;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      showCustomAlert(
        "Biometric Not Available",
        "Your device doesn't support biometric authentication or it's not configured. Please contact support.",
        [
          { text: "OK", onPress: () => {} }
        ]
      );
      return;
    }

    setIsLoading(true);

    try {
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with Face ID to create your passkey',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (authResult.success) {
        const credentialId = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          `${email}-${Date.now()}`,
          { encoding: Crypto.CryptoEncoding.HEX }
        );

        // Get device info with persistent device ID
        const deviceInfo = await getDeviceInfo();

        const passkeyData = {
          email: email,
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
            userId: result.user.id,
            email: email,
            token: result.token || '',
            hasPasskey: true,
            credentialId: result.passkey.credentialId,
          });

          // Show success message
          showCustomAlert(
            "Passkey Created",
            "Your passkey has been set up successfully. You can now use biometric authentication to sign in quickly.",
            [{ text: "Continue", onPress: () => router.replace("/home") }]
          );
        } catch (error) {
          console.error('Error creating passkey on server:', error);
          showCustomAlert("Error", "Failed to create passkey on server. Please try again.", [
            { text: 'OK', onPress: () => {} }
          ]);
        }
      } else {
        showCustomAlert("Authentication Failed", "Biometric authentication was cancelled or failed.", [
          { text: 'OK', onPress: () => {} }
        ]);
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      showCustomAlert("Error", "Biometric authentication failed. Please try again.", [
        { text: 'OK', onPress: () => {} }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipPasskey = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      });

      if (!response.ok) {
        throw new Error('Failed to get profile');
      }

      const result = await response.json();

      // Create session for existing user
      await sessionService.createSession({
        userId: result?.user.id,
        email: email,
        hasPasskey: result?.user.hasPasskey,
        token: result.token || '',
      });

      router.replace("/home");
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <View style={styles.illustration}>
            <Ionicons name="finger-print" size={80} color="#ffffff" />
          </View>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Set up a passkey for quick and secure authentication using your Face ID, or fingerprint)
          </Text>
          {email && (
            <Text style={styles.emailText}>
              Setting up for: {email}
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.enableButton, isLoading && styles.enableButtonDisabled]}
            onPress={handleEnablePasskey}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="finger-print" size={24} color="#000000" />
            <Text style={styles.enableButtonText}>
              {isLoading ? 'Setting Up...' : 'Enable Passkey'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipPasskey}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>I'll do this later</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Passkeys are more secure than passwords and work across all your devices
          </Text>
        </View>
      </View>

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
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 50,
    justifyContent: 'center',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  illustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  descriptionContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  description: {
    fontSize: 16,
    color: "#cccccc",
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 8,
  },
  emailText: {
    fontSize: 14,
    color: "#2ecc71",
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginBottom: 32,
  },
  enableButton: {
    height: 56,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  enableButtonDisabled: {
    backgroundColor: "#666666",
  },
  enableButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  skipButtonText: {
    color: "#cccccc",
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: "#999999",
    textAlign: 'center',
    lineHeight: 20,
  },
});
