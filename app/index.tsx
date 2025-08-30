import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
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
      // Check if user has passkey for quick login
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

  const handleEmailChange = (text: string) => {
    setEmail(text);
    const errorMessage = getEmailValidationMessage(text);
    setEmailError(errorMessage || "");
    setIsEmailValid(!errorMessage && text.trim().length > 0);
  };

  const handlePasskeyLogin = async () => {
    if (!hasExistingSession) {
      Alert.alert("Error", "No existing session found. Please sign in with email first.");
      return;
    }

    if (!isPasskeySupported) {
      // Automatically redirect to password login if biometric is not available
      handlePasswordLogin();
      return;
    }

    setIsLoading(true);
    
    try {
      // Authenticate with biometrics
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with Face ID to sign in',
        fallbackLabel: 'Use password',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (authResult.success) {
        // Passkey authentication successful, navigate to home
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

  const handlePasswordLogin = () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address first");
      return;
    }
    
    // Navigate to password setup page for login
    router.push({
      pathname: "/password-setup",
      params: { email: email.trim(), mode: 'login' }
    });
  };

  const handleLogin = async () => {
    // Validate email before proceeding
    const errorMessage = getEmailValidationMessage(email);
    if (errorMessage) {
      setEmailError(errorMessage);
      Alert.alert("Invalid Email", errorMessage);
      return;
    }

    setIsLoading(true);

    try {
      // Send verification code to email
      const response = await fetch(API_ENDPOINTS.EMAIL.SEND_CODE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send verification code');
      }

      const result = await response.json();
      console.log('Verification code sent:', result);

      // Navigate to verification screen with email parameter
      router.push({
        pathname: "/verify",
        params: { email: email.trim() }
      });
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      Alert.alert("Error", error.message || "Failed to send verification code. Please try again.");
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
        <Image source={require('../assets/images/illustrations/welcome.png')} style={styles.welcome} />
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Goji 👋</Text>

          <Text style={styles.subtitle}>Your Wallet AI for your crypto.</Text>
        </View>

        <View style={styles.form}>
          {/* Passkey Login Option */}
          {showPasskeyOption && isPasskeySupported && (
            <TouchableOpacity
              style={styles.passkeyButton}
              onPress={handlePasskeyLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Ionicons name="finger-print" size={24} color="#fff" />
              <Text style={styles.passkeyButtonText}>
                {isLoading ? "Authenticating..." : "Sign in with Passkey"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Divider - Only show when there are multiple authentication options */}
          {showPasskeyOption && isPasskeySupported && (
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                emailError ? styles.inputError : null,
                isEmailValid ? styles.inputValid : null
              ]}
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

          <TouchableOpacity
            style={[
              styles.loginButton, 
              (isLoading || !isEmailValid) && styles.loginButtonDisabled
            ]}
            onPress={handleLogin}
            disabled={isLoading || !isEmailValid}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By signing in, you agree to our <Text style={styles.footerLink}>Terms of Service</Text> and <Text style={styles.footerLink}>Privacy Policy</Text>.
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
  welcome: {
    width: "100%",
    height: 225,
    marginBottom: 28,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
    textAlign: "center",
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
    marginBottom: 15,
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
  loginButton: {
    height: 56,
    backgroundColor: "#000000",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: "#ccc",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  footerLink: {
    color: "#000000",
    fontWeight: "600",
  },
  passkeyButton: {
    height: 56,
    backgroundColor: "#000",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    flexDirection: 'row',
    gap: 12,
  },
  passkeyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e1e1',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
  },
  securityCodeButton: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    flexDirection: 'row',
    gap: 8,
  },
  securityCodeButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  inputError: {
    borderColor: "#FF3B30",
    backgroundColor: "#FFF5F5",
  },
  inputValid: {
    borderColor: "#34C759",
    backgroundColor: "#F0FFF4",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },

});
