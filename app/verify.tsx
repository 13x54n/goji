import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_ENDPOINTS } from '../config/api';

export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    
    // Handle paste functionality
    if (text.length > 1) {
      // If more than one character is entered, treat it as a paste
      const pastedText = text.replace(/\D/g, '').slice(0, 6); // Remove non-digits and limit to 6 chars
      
      // Fill the code array with the pasted text
      const updatedCode = [...newCode];
      for (let i = 0; i < 6; i++) {
        updatedCode[i] = pastedText[i] || '';
      }
      setCode(updatedCode);
      
      // Focus the next empty input or the last input if all filled
      const nextEmptyIndex = updatedCode.findIndex(digit => digit === '');
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
      return;
    }
    
    // Normal single character input
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus to next input if character is entered
    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace if current input is empty
    if (e.nativeEvent.key === "Backspace" && code[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join("");
    
    if (verificationCode.length !== 6) {
      Alert.alert("Error", "Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    
    try {
      // Verify the code with the backend
      const response = await fetch(API_ENDPOINTS.EMAIL.VERIFY_CODE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email,
          code: verificationCode 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Verification failed');
      }

      const result = await response.json();
      console.log('Email verified successfully:', result);
      
      // Code verification successful, navigate to biometric setup
      router.push({
        pathname: "/biometric-setup",
        params: { email: email }
      });
    } catch (error: any) {
      console.error('Error verifying code:', error);
      Alert.alert("Error", error.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.EMAIL.RESEND_CODE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resend code');
      }

      const result = await response.json();
      console.log('Code resent successfully:', result);
      Alert.alert("Code Sent", "A new verification code has been sent to your email");
    } catch (error: any) {
      console.error('Error resending code:', error);
      Alert.alert("Error", error.message || "Failed to resend code. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#5a5a5a" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit verification code to your email address
            </Text>
            {email && (
              <View style={styles.emailContainer}>
                <Text style={styles.emailLabel}>Email:</Text>
                <Text style={styles.emailText}>{email}</Text>
              </View>
            )}

          </View>

          <View style={styles.codeContainer}>
            <View style={styles.codeInputs}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (ref) inputRefs.current[index] = ref;
                  }}
                  style={styles.codeInput}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus={index === 0}
                  selectTextOnFocus
                />
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
            onPress={handleVerify}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.verifyButtonText}>
              {isLoading ? "Verifying..." : "Verify Code"}
            </Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={resendCode}>
              <Text style={styles.resendLink}>Resend Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 50,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#5a5a5a",
    fontWeight: "600",
    marginLeft: 4,
  },
  header: {
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22
  },
  emailContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  emailLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  emailText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },

  codeContainer: {
    marginBottom: 32,
  },
  codeInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: "#e1e1e1",
    borderRadius: 12,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    color: "#1a1a1a",
    backgroundColor: "#fafafa",
  },
  verifyButton: {
    height: 56,
    backgroundColor: "#000000",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    backgroundColor: "#ccc",
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    color: "#666",
  },
  resendLink: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
});
