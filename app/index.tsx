import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_ENDPOINTS } from '../config/api';
import { sessionService } from '../lib/sessionService';

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasskeyOption, setShowPasskeyOption] = useState(false);
  const [isPasskeySupported, setIsPasskeySupported] = useState(false);
  const [hasExistingSession, setHasExistingSession] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);

  useEffect(() => {
    checkExistingSession();
    checkPasskeySupport();
  }, []);

  const checkExistingSession = async () => {
    const session = sessionService.getSession();
    if (session && sessionService.isLoggedIn()) {
      setHasExistingSession(true);
      if (session.hasPasskey) {
        setShowPasskeyOption(true);
      }
    }
  };

  const checkPasskeySupport = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setIsPasskeySupported(hasHardware && isEnrolled);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getEmailValidationMessage = (email: string) => {
    if (!email.trim()) {
      return "Email is required";
    }
    if (!validateEmail(email)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const handleEmailChange = async (text: string) => {
    setEmail(text);
    const errorMessage = getEmailValidationMessage(text);
    setEmailError(errorMessage || "");
    setIsEmailValid(!errorMessage && text.trim().length > 0);

    if (isEmailValid) {
      try {
        const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email.trim() }),
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.user.hasPasskey) {
            setShowPasskeyOption(true);
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePasskeyLogin = async () => {
    if (!hasExistingSession) {
      Alert.alert("Error", "No existing session found. Please sign in with email first.");
      return;
    }

    if (!isPasskeySupported) {
      Alert.alert("Biometric Not Available", "Your device doesn't support biometric authentication. Please contact support.");
      return;
    }

    setIsLoading(true);

    try {
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with Face ID to sign in',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (authResult.success) {
        router.replace("/home");
      } else {
        Alert.alert("Authentication Failed", "Passkey authentication was cancelled or failed.");
      }
    } catch (error) {
      console.error('Passkey authentication error:', error);
      Alert.alert("Error", "Passkey authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    if (!isEmailValid) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    
    try {
      const sendmail = await fetch(API_ENDPOINTS.EMAIL.SEND_CODE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (sendmail.ok) {
        router.push({
          pathname: "/verify",
          params: { email: email.trim() }
        });
      }
    } catch (error) {
      console.error('Error checking user:', error);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/illustrations/welcome.png")}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Goji</Text>
          <Text style={styles.subtitle}>
            Secure authentication with passkeys
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          {showPasskeyOption && (
            <TouchableOpacity
              style={[styles.passkeyButton, isLoading && styles.buttonDisabled]}
              onPress={handlePasskeyLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Ionicons name="finger-print" size={24} color="#000" />
              <Text style={styles.passkeyButtonText}>
                {isLoading ? "Authenticating..." : "Sign in with Passkey"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.continueButton,
              (!isEmailValid || isLoading) && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={!isEmailValid || isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>
              {isLoading ? 'Checking...' : 'Continue'}
            </Text>
          </TouchableOpacity>

          <Text style={{...styles.header, ...styles.subtitle, fontSize: 16, marginTop: 16}}>
            By continuing, you agree to our <Text style={{color: "#000", fontWeight: "600"}} accessibilityRole="link" onPress={() => Linking.openURL('https://goji.app/terms')}>Terms of Service</Text> and consent to our <Text style={{color: "#000", fontWeight: "600"}} accessibilityRole="link" onPress={() => Linking.openURL('https://goji.app/privacy')}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 50,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 18,
    backgroundColor: "red",
    width: 80,
    height: 80,
    aspectRatio: 1,
    alignSelf: "center",
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: "contain",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1a1a1a",
    backgroundColor: "#fafafa",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginTop: 4,
  },
  continueButton: {
    height: 56,
    backgroundColor: "#000000",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  continueButtonDisabled: {
    backgroundColor: "#ccc",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  passkeyButton: {
    height: 56,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  passkeyButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});
