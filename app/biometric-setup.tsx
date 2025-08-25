import { Ionicons } from "@expo/vector-icons";
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_ENDPOINTS } from '../config/api';
import { sessionService } from '../lib/sessionService';

export default function BiometricSetupScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricSupported(hasHardware && isEnrolled);
  };

  const handleEnablePasskey = async () => {
    setIsLoading(true);
    
    try {
      // First, authenticate with biometrics
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to create your passkey',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (authResult.success) {
        // Generate a unique credential ID for the passkey
        const credentialId = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          `${email}-${Date.now()}`,
          { encoding: Crypto.CryptoEncoding.HEX }
        );

        // Store passkey data (in a real app, this would be sent to your backend)
        const passkeyData = {
          email: email,
          credentialId: credentialId,
          createdAt: new Date().toISOString(),
          deviceInfo: {
            platform: Platform.OS,
            // Add more device-specific info as needed
          }
        };

        // Send passkey data to your Node.js backend
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
          console.log('Passkey created on server:', result);

          // Create session after successful passkey creation
          await sessionService.createSession({
            userId: result.passkey.id,
            email: email,
            token: "passkey-token", // In a real app, you'd get this from the backend
            hasPasskey: true,
            hasSecurityCode: false,
          });
        } catch (error) {
          console.error('Error creating passkey on server:', error);
          Alert.alert("Server Error", "Passkey was created locally but failed to sync with server. Please try again.");
          return;
        }
        
        router.replace("/home");
      } else {
        Alert.alert("Authentication Failed", "Passkey creation was cancelled.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create passkey. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipPasskey = () => {
    // Navigate to security code setup page with email parameter
    router.push({
      pathname: "/security-code-setup",
      params: { email: email }
    });
  };

  const promptForSecurityCode = () => {
    Alert.prompt(
      "Enter 6-Digit Code",
      "Please enter a 6-digit security code:",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Set Code",
          onPress: async (code) => {
            if (code && code.length === 6 && /^\d{6}$/.test(code)) {
              // Send security code to backend
              try {
                const response = await fetch(API_ENDPOINTS.AUTH.SECURITY_CODE, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    email: email,
                    securityCode: code,
                  }),
                });

                if (!response.ok) {
                  throw new Error('Failed to set security code on server');
                }

                const result = await response.json();
                console.log('Security code set on server:', result);
              } catch (error) {
                console.error('Error setting security code on server:', error);
                Alert.alert("Server Error", "Failed to set security code. Please try again.");
                return;
              }
              // Create session after successful security code setup
              await sessionService.createSession({
                userId: "user-" + Date.now(), // Generate a temporary user ID
                email: email,
                token: "security-code-token", // In a real app, you'd get this from the backend
                hasPasskey: false,
                hasSecurityCode: true,
              });

              Alert.alert(
                "Security Code Set",
                "Your 6-digit security code has been set successfully.",
                [
                  {
                    text: "Continue",
                    onPress: () => {
                      router.replace("/home");
                    }
                  }
                ]
              );
            } else {
              Alert.alert(
                "Invalid Code",
                "Please enter exactly 6 digits.",
                [
                  {
                    text: "Try Again",
                    onPress: () => promptForSecurityCode()
                  }
                ]
              );
            }
          }
        }
      ],
      "plain-text",
      "",
      "numeric"
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="key" size={80} color="#000000" />
          <Text style={styles.title}>Create Your Passkey</Text>
          <Text style={styles.subtitle}>
            Use your fingerprint or face ID as a secure passkey for passwordless login
          </Text>
        </View>

        <View style={styles.options}>
          {isBiometricSupported ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleEnablePasskey}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Ionicons name="key" size={24} color="#fff" />
                <Text style={styles.primaryButtonText}>
                  {isLoading ? "Creating passkey..." : "Create Passkey"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleSkipPasskey}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Skip for now</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.notSupported}>
              <Ionicons name="warning" size={48} color="#FF9500" />
              <Text style={styles.notSupportedTitle}>Passkey Not Available</Text>
              <Text style={styles.notSupportedText}>
                Your device doesn't support biometric authentication or it's not set up for passkey creation.
              </Text>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleSkipPasskey}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  options: {
    width: "100%",
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    flexDirection: "row",
  },
  primaryButton: {
    backgroundColor: "#000000",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  notSupported: {
    alignItems: "center",
    paddingVertical: 20,
  },
  notSupportedTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  notSupportedText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
});
