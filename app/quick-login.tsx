import { Ionicons } from "@expo/vector-icons";
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

export default function QuickLoginScreen() {
  const [email, setEmail] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'passkey' | 'security-code' | null>(null);
  const [showSecurityCodeInput, setShowSecurityCodeInput] = useState(false);

  useEffect(() => {
    // Check if user has existing session
    if (sessionService.isLoggedIn()) {
      router.replace("/home");
      return;
    }
  }, []);

  const handlePasskeyLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setIsLoading(true);
    setLoginMethod('passkey');

    try {
      // For passkey login, we would typically use WebAuthn API
      // For now, we'll simulate the passkey verification
      Alert.alert(
        "Passkey Login",
        "Passkey authentication would be triggered here. For demo purposes, we'll simulate success.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              setIsLoading(false);
              setLoginMethod(null);
            }
          },
          {
            text: "Simulate Success",
            onPress: async () => {
              // Simulate successful passkey login
              await handleSuccessfulLogin({
                userId: "user123",
                email: email.trim(),
                token: "simulated-passkey-token",
                hasPasskey: true,
                hasSecurityCode: false,
              });
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error with passkey login:', error);
      Alert.alert("Error", "Passkey login failed. Please try again.");
    } finally {
      setIsLoading(false);
      setLoginMethod(null);
    }
  };

  const handleSecurityCodeLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    if (!securityCode.trim()) {
      Alert.alert("Error", "Please enter your 6-digit security code");
      return;
    }

    if (securityCode.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit security code");
      return;
    }

    setIsLoading(true);
    setLoginMethod('security-code');

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN_SECURITY_CODE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          securityCode: securityCode.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const result = await response.json();
      console.log('Security code login successful:', result);

      await handleSuccessfulLogin({
        userId: result.user.id,
        email: result.user.email,
        token: result.token,
        hasPasskey: result.user.hasPasskey,
        hasSecurityCode: result.user.hasSecurityCode,
      });
    } catch (error: any) {
      console.error('Error with security code login:', error);
      Alert.alert("Error", error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
      setLoginMethod(null);
    }
  };

  const handleSuccessfulLogin = async (userData: {
    userId: string;
    email: string;
    token: string;
    hasPasskey: boolean;
    hasSecurityCode: boolean;
  }) => {
    await sessionService.createSession(userData);
    router.replace("/home");
  };

  const handleNewAccount = () => {
    router.replace("/");
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Choose your login method</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
          </View>

          {showSecurityCodeInput && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Security Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                placeholderTextColor="#999"
                value={securityCode}
                onChangeText={setSecurityCode}
                keyboardType="number-pad"
                maxLength={6}
                secureTextEntry={false}
              />
            </View>
          )}

          <View style={styles.loginOptions}>
            <TouchableOpacity
              style={[styles.loginButton, styles.passkeyButton, isLoading && styles.buttonDisabled]}
              onPress={handlePasskeyLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Ionicons name="key" size={24} color="#fff" />
              <Text style={styles.loginButtonText}>
                {isLoading && loginMethod === 'passkey' ? "Authenticating..." : "Login with Passkey"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, styles.securityCodeButton, isLoading && styles.buttonDisabled]}
              onPress={() => setShowSecurityCodeInput(!showSecurityCodeInput)}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Ionicons name="lock-closed" size={24} color="#fff" />
              <Text style={styles.loginButtonText}>
                {showSecurityCodeInput ? "Hide Security Code" : "Login with Security Code"}
              </Text>
            </TouchableOpacity>

            {showSecurityCodeInput && (
              <TouchableOpacity
                style={[styles.loginButton, styles.verifyButton, isLoading && styles.buttonDisabled]}
                onPress={handleSecurityCodeLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading && loginMethod === 'security-code' ? "Verifying..." : "Verify Code"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.newAccountButton}
            onPress={handleNewAccount}
            activeOpacity={0.8}
          >
            <Text style={styles.newAccountButtonText}>Login with Different Account</Text>
          </TouchableOpacity>
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
  loginOptions: {
    gap: 16,
    marginBottom: 24,
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  passkeyButton: {
    backgroundColor: "#007AFF",
  },
  securityCodeButton: {
    backgroundColor: "#34C759",
  },
  verifyButton: {
    backgroundColor: "#FF9500",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e1e1e1",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#666",
  },
  newAccountButton: {
    height: 56,
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  newAccountButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
});
