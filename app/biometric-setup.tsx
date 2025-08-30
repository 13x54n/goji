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
  const [biometricType, setBiometricType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      console.log('Biometric support check:', {
        hasHardware,
        isEnrolled,
        supportedTypes
      });
      
      // Check if device supports Face ID or Touch ID
      const hasBiometricSupport = hasHardware && isEnrolled;
      setIsBiometricSupported(hasBiometricSupport);
      
      if (hasBiometricSupport) {
        // Show what type of biometric authentication is available
        const type = supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT) 
          ? 'Touch ID' 
          : 'Face ID';
        setBiometricType(type);
        console.log(`Device supports ${type}`);
      }
    } catch (error) {
      console.error('Error checking biometric support:', error);
      setIsBiometricSupported(false);
    }
  };

  const handleEnablePasskey = async () => {
    if (!isBiometricSupported) {
      Alert.alert(
        "Biometric Not Available", 
        "Your device doesn't support biometric authentication or it's not configured. Please set up a password instead.",
        [
                      { text: "Set Password", onPress: handleSkipPasskey },
          { text: "Cancel", style: "cancel" }
        ]
      );
      return;
    }

    setIsLoading(true);
    
    try {
      // First, authenticate with biometrics
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with Face ID to create your passkey',
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
    // Navigate to password setup page with email parameter
    router.push({
      pathname: "/password-setup",
      params: { email: email }
    });
  };

  const promptForSecurityCode = () => {
    Alert.prompt(
      "Enter 6-Digit Code",
              "Please enter a 6-digit password:",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Set Code",
          onPress: async (code) => {
            if (code && code.length === 6 && /^\d{6}$/.test(code)) {
              // Send password to backend
              try {
                const response = await fetch(API_ENDPOINTS.AUTH.PASSWORD, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    email: email,
                    password: code,
                  }),
                });

                if (!response.ok) {
                  throw new Error('Failed to set password on server');
                }

                const result = await response.json();
                console.log('Password set on server:', result);
              } catch (error) {
                console.error('Error setting password on server:', error);
                Alert.alert("Server Error", "Failed to set password. Please try again.");
                return;
              }
              // Create session after successful password setup
              await sessionService.createSession({
                userId: "user-" + Date.now(), // Generate a temporary user ID
                email: email,
                token: "password-token", // In a real app, you'd get this from the backend
                hasPasskey: false,
                hasPassword: true,
              });

              Alert.alert(
                "Password Set",
                "Your 6-digit password has been set successfully.",
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
          <Text style={styles.title}>
            {isBiometricSupported ? 'Create Your Passkey' : 'Set Up Authentication'}
          </Text>
          <Text style={styles.subtitle}>
            {isBiometricSupported 
              ? `Use ${biometricType} as a secure passkey for passwordless login`
              : 'Set up a password for quick and secure access to your wallet'
            }
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
                  {isLoading ? "Creating passkey..." : `Create ${biometricType} Passkey`}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleSkipPasskey}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Use Password Instead</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleSkipPasskey}
              activeOpacity={0.8}
            >
              <Ionicons name="keypad" size={24} color="#fff" />
                              <Text style={styles.primaryButtonText}>Set Up Password</Text>
            </TouchableOpacity>
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
});
