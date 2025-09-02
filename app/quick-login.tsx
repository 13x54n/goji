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
  const [isLoading, setIsLoading] = useState(false);

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

    try {
      // For now, we'll just check if the user exists and has a passkey
      // In a real implementation, this would trigger the passkey authentication flow
      const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('User not found or not authenticated');
      }

      // Navigate to biometric setup if user exists
      router.push({
        pathname: "/biometric-setup",
        params: { email: email.trim() }
      });

    } catch (error: any) {
      console.error('Error with passkey login:', error);
      Alert.alert("Error", "Please set up your passkey first or contact support.");
    } finally {
      setIsLoading(false);
    }
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          
          <Text style={styles.title}>Quick Login</Text>
          
          <View style={styles.placeholder} />
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Sign in with your passkey for quick access
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.passkeyButton,
              !email.trim() && styles.passkeyButtonDisabled
            ]}
            onPress={handlePasskeyLogin}
            disabled={!email.trim() || isLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="finger-print" size={24} color="#fff" />
            <Text style={styles.passkeyButtonText}>
              {isLoading ? 'Signing In...' : 'Sign In with Passkey'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={handleNewAccount}>
            <Text style={styles.footerLink}>Create one</Text>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  descriptionContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 2,
    borderColor: "#e1e1e1",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    marginBottom: 32,
  },
  passkeyButton: {
    height: 56,
    backgroundColor: "#000000",
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  passkeyButtonDisabled: {
    backgroundColor: "#ccc",
  },
  passkeyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 16,
    color: "#666",
  },
  footerLink: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
});
