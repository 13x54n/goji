import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
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
import CustomAlert from './components/CustomAlert';

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasskeyOption, setShowPasskeyOption] = useState(false);
  const [isPasskeySupported, setIsPasskeySupported] = useState(false);
  const [hasExistingSession, setHasExistingSession] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isCheckingPasskey, setIsCheckingPasskey] = useState(false);
  const [passkeyCheckComplete, setPasskeyCheckComplete] = useState(false);
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

  useEffect(() => {
    checkExistingSession();
    checkPasskeySupport();
  }, []);

  const checkExistingSession = async () => {
    const session = sessionService.getSession();
    if (session && sessionService.isLoggedIn()) {
      setHasExistingSession(true);
      if (session.hasPasskey) {
        // Auto-fill email from session for passkey users
        setEmail(session.email);
        setIsEmailValid(true);
        // Check passkey status for existing session
        await checkUserPasskeyStatus(session.email);
      } else {
        // No passkey, mark check as complete
        setPasskeyCheckComplete(true);
      }
    } else {
      // No session, mark check as complete
      setPasskeyCheckComplete(true);
    }
  };

  const checkPasskeySupport = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setIsPasskeySupported(hasHardware && isEnrolled);
  };

  const fetchAndStorePasskeyData = async (email: string) => {
    try {
      // Get device info to find the correct passkey
      const { getDeviceInfo } = await import('../lib/deviceUtils');
      const deviceInfo = await getDeviceInfo();

      // Fetch passkeys for this user
      const response = await fetch(API_ENDPOINTS.PASSKEYS.GET_USER(email), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });


      if (response.ok) {
        const data = await response.json();
        const passkeys = data.passkeys || [];

        // Find the active passkey for this device

        const devicePasskey = passkeys.find((passkey: any) => {
          const platformMatch = passkey.deviceInfo?.platform === deviceInfo.platform;
          const deviceIdMatch = passkey.deviceInfo?.deviceId === deviceInfo.deviceId;
          return platformMatch && deviceIdMatch;
        });

        // If no exact match found, try to find any passkey for this platform (fallback)
        let fallbackPasskey = null;
        if (!devicePasskey && passkeys.length > 0) {
          fallbackPasskey = passkeys.find((passkey: any) =>
            passkey.deviceInfo?.platform === deviceInfo.platform
          );
        }

        const selectedPasskey = devicePasskey || fallbackPasskey;

        if (selectedPasskey) {
          // Update session with fresh passkey data
          const currentSession = sessionService.getSession();
          if (currentSession) {
            await sessionService.createSession({
              ...currentSession,
              credentialId: selectedPasskey.credentialId,
              hasPasskey: true,
            });
          } else {
            // Create a new session if none exists
            await sessionService.createSession({
              userId: selectedPasskey.id,
              email: email,
              token: `passkey_${selectedPasskey.id}_${Date.now()}`,
              hasPasskey: true,
              credentialId: selectedPasskey.credentialId,
            });
          }
        } else {
        }
      }
    } catch (error) {
      console.error('Error fetching passkey data:', error);
    }
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
    setPasskeyCheckComplete(false); // Reset passkey check when email changes

    // Check if this is a different email than what's in the current session
    const currentSession = sessionService.getSession();
    if (currentSession && currentSession.email !== text.trim()) {
      // Clear the session if user is trying to use a different email
      await sessionService.clearSession();
      setShowPasskeyOption(false);
      setHasExistingSession(false);
    }

    if (!errorMessage && text.trim().length > 0) {
      // Always check for passkey when email is valid
      await checkUserPasskeyStatus(text.trim());
    }
  };

  const checkUserPasskeyStatus = async (emailAddress: string) => {
    setIsCheckingPasskey(true);
    setShowPasskeyOption(false);
    
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailAddress }),
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.user.hasPasskey) {
          // User has passkey, fetch passkey data from backend
          await fetchAndStorePasskeyData(emailAddress);
          setShowPasskeyOption(true);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsCheckingPasskey(false);
      setPasskeyCheckComplete(true);
    }
  };

  const handlePasskeyLogin = async () => {
    if (!isPasskeySupported) {
      showCustomAlert("Biometric Not Available", "Your device doesn't support biometric authentication. Please contact support.", [
        { text: 'OK', onPress: () => {} }
      ]);
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
        // Get the stored credential ID from session
        const session = sessionService.getSession();

        if (!session || !session.credentialId) {
          // Try to fetch passkey data if no session exists
          if (email && isEmailValid) {
            await fetchAndStorePasskeyData(email);
            const newSession = sessionService.getSession();
            if (!newSession || !newSession.credentialId) {
              showCustomAlert("Error", "No passkey found for this device. Please set up a passkey first.", [
                { text: 'OK', onPress: () => {} }
              ]);
              return;
            }
          } else {
            showCustomAlert("Error", "No passkey found. Please set up a passkey first.", [
              { text: 'OK', onPress: () => {} }
            ]);
            return;
          }
        }

        const currentSession = sessionService.getSession();
        const credentialId = currentSession?.credentialId;

        try {
          const response = await fetch(API_ENDPOINTS.PASSKEYS.VERIFY, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ credentialId }),
          });

          if (response.ok) {
            const result = await response.json();

            // Update session with new token and user data
            await sessionService.createSession({
              userId: result.user.id,
              email: result.user.email,
              token: result.token,
              hasPasskey: result.user.hasPasskey,
            });

            router.replace("/home");
          } else {
            const errorData = await response.json();
            showCustomAlert("Authentication Failed", errorData.error || "Passkey verification failed.", [
              { text: 'OK', onPress: () => {} }
            ]);
          }
        } catch (error) {
          console.error('Error verifying passkey:', error);
          showCustomAlert("Error", "Failed to verify passkey with server. Please try again.", [
            { text: 'OK', onPress: () => {} }
          ]);
        }
      } else {
        showCustomAlert("Authentication Failed", "Passkey authentication was cancelled or failed.", [
          { text: 'OK', onPress: () => {} }
        ]);
      }
    } catch (error) {
      console.error('Passkey authentication error:', error);
      showCustomAlert("Error", "Passkey authentication failed. Please try again.", [
        { text: 'OK', onPress: () => {} }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!email.trim()) {
      showCustomAlert("Error", "Please enter your email address", [
        { text: 'OK', onPress: () => {} }
      ]);
      return;
    }

    if (!isEmailValid) {
      showCustomAlert("Error", "Please enter a valid email address", [
        { text: 'OK', onPress: () => {} }
      ]);
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
            Fast. Friendly. Crypto.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {showPasskeyOption ? "Welcome back!" : "Email Address"}
            </Text>
            <TextInput
              style={[
                styles.input,
                emailError ? styles.inputError : null
              ]}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={true}
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          {/* Show loading state while checking passkey */}
          {isCheckingPasskey && isEmailValid && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Checking for passkey...</Text>
            </View>
          )}

          {/* Show passkey option if available */}
          {showPasskeyOption && !isLoading && isEmailValid && passkeyCheckComplete && (
            <TouchableOpacity
              style={[styles.passkeyButton, isLoading && styles.buttonDisabled]}
              onPress={handlePasskeyLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Ionicons name="finger-print" size={24} color="#ffffff" />
              <Text style={styles.passkeyButtonText}>
                {isLoading ? "Authenticating..." : "Sign in with Passkey"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Show continue button only after passkey check is complete */}
          {isEmailValid && passkeyCheckComplete && !isLoading && (
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
          )}

          <Text style={{ ...styles.header, ...styles.subtitle, fontSize: 16, marginTop: 16 }}>
            By continuing, you agree to our <Text style={{ color: "#27ae60", fontWeight: "600" }} accessibilityRole="link" onPress={() => Linking.openURL('https://goji.app/terms')}>Terms of Service</Text> and consent to our <Text style={{ color: "#27ae60", fontWeight: "600" }} accessibilityRole="link" onPress={() => Linking.openURL('https://goji.app/privacy')}>Privacy Policy</Text>.
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
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
    backgroundColor: "#1a1a1a",
    width: 80,
    height: 80,
    aspectRatio: 1,
    alignSelf: "center",
    borderRadius: 20,
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
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#CCCCCC",
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
    color: "#FFFFFF",
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#FFFFFF",
    backgroundColor: "#1a1a1a",
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
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  continueButtonDisabled: {
    backgroundColor: "#fff9",
  },
  continueButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  passkeyButton: {
    height: 56,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: "#333333",
  },
  passkeyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    height: 56,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingText: {
    color: "#CCCCCC",
    fontSize: 16,
    fontWeight: "500",
  },
});
