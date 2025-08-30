import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import {
    Alert,
    Animated,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { API_ENDPOINTS } from '../config/api';
import { sessionService } from '../lib/sessionService';

const DOT_SIZE = 20;
const DOT_SPACING = 16;

export default function PasswordSetup() {
  const { email, mode } = useLocalSearchParams<{ email: string; mode?: string }>();
  const isLoginMode = mode === 'login';
  const [password, setPassword] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(["", "", "", "", "", ""]);
  const [currentStep, setCurrentStep] = useState<'input' | 'confirm'>(isLoginMode ? 'input' : 'input');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const inputRefs = useRef<TextInput[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Debug: Log email parameter
  React.useEffect(() => {
    console.log('SecurityCodeSetup: Email received:', email);
  }, [email]);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    // Focus first input after animation
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 600);
  }, []);

  const handlePasswordChange = (text: string, index: number) => {
    const newPassword = [...password];
    newPassword[index] = text;
    setPassword(newPassword);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleConfirmPasswordChange = (text: string, index: number) => {
    const newPassword = [...confirmPassword];
    newPassword[index] = text;
    setConfirmPassword(newPassword);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index: number) => {
    if (currentStep === 'input') {
      const newPassword = [...password];
      if (newPassword[index] === "") {
        // Move to previous input and clear it
        if (index > 0) {
          newPassword[index - 1] = "";
          setPassword(newPassword);
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        // Clear current input
        newPassword[index] = "";
        setPassword(newPassword);
      }
    } else {
      const newPassword = [...confirmPassword];
      if (newPassword[index] === "") {
        // Move to previous input and clear it
        if (index > 0) {
          newPassword[index - 1] = "";
          setConfirmPassword(newPassword);
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        // Clear current input
        newPassword[index] = "";
        setConfirmPassword(newPassword);
      }
    }
  };

  const handleContinue = () => {
    const passwordStr = password.join('');
    if (passwordStr.length !== 6) {
      Alert.alert("Error", "Please enter a 6-digit password");
      return;
    }
    
    setCurrentStep('confirm');
    // Reset confirm inputs
    setConfirmPassword(["", "", "", "", "", ""]);
    // Focus first confirm input
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const handleConfirm = async () => {
    const inputPassword = password.join('');
    const confirmPasswordStr = confirmPassword.join('');
    
    if (isLoginMode) {
      // Login mode - just verify the password
      if (inputPassword.length !== 6) {
        Alert.alert("Error", "Please enter your 6-digit password");
        return;
      }
      
      if (!email) {
        Alert.alert("Error", "Email is required");
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Login with password
        const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email: email.trim(),
            password: inputPassword 
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to login');
        }

        const result = await response.json();
        console.log('Login successful:', result);

        // Create session after successful login
        await sessionService.createSession({
          userId: result.user.id,
          email: email.trim(),
          token: result.token,
          hasPasskey: result.user.hasPasskey,
          hasPassword: result.user.hasPassword,
        });

        // Navigate to home page
        router.replace("/home");
      } catch (error: any) {
        console.error('Error logging in:', error);
        Alert.alert("Error", error.message || "Failed to login. Please try again.");
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    // Setup mode - confirm the password
    if (confirmPasswordStr.length !== 6) {
      Alert.alert("Error", "Please confirm your 6-digit password");
      return;
    }
    
    if (inputPassword !== confirmPasswordStr) {
      Alert.alert("Error", "Passwords don't match. Please try again.");
      setConfirmPassword(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
      return;
    }
    
    if (!email) {
      Alert.alert("Error", "Email is required to set password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Send password to backend
      const response = await fetch(API_ENDPOINTS.AUTH.PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(),
          password: inputPassword 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set security code');
      }

      const result = await response.json();
      console.log('Password set successfully:', result);

      // Create session after successful password setup
      await sessionService.createSession({
        userId: result.user.id,
        email: email.trim(),
        token: result.token,
        hasPasskey: false,
        hasPassword: true,
      });

      // Navigate to home page
      router.push("/home");
    } catch (error: any) {
      console.error('Error setting security code:', error);
      Alert.alert("Error", error.message || "Failed to set password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderDot = (value: string, index: number, isConfirm: boolean = false) => {
    const isFilled = value !== "";
    const isFocused = focusedIndex === index;
    
    return (
      <View key={index} style={styles.dotContainer}>
        <TouchableOpacity
          style={styles.dotTouchable}
          onPress={() => {
            inputRefs.current[index]?.focus();
            setFocusedIndex(index);
          }}
          activeOpacity={0.7}
        >
          <View style={[
            styles.dot, 
            isFilled ? styles.dotFilled : styles.dotEmpty,
            isFocused && styles.dotFocused
          ]}>
            {showPassword && value ? (
              <Text style={styles.dotText}>{value}</Text>
            ) : null}
          </View>
        </TouchableOpacity>
        <TextInput
          ref={(ref) => {
            if (ref) inputRefs.current[index] = ref;
          }}
          style={styles.hiddenInput}
          value={value}
          onChangeText={(text) => {
            if (isConfirm) {
              handleConfirmPasswordChange(text, index);
            } else {
              handlePasswordChange(text, index);
            }
          }}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(-1)}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === 'Backspace') {
              handleBackspace(index);
            }
          }}
          keyboardType="numeric"
          maxLength={1}
          autoFocus={index === 0}
          selectTextOnFocus
          caretHidden={true}
        />
      </View>
    );
  };

  const renderDots = () => {
    const passwordArray = currentStep === 'input' ? password : confirmPassword;
    return (
      <View style={styles.dotsContainer}>
        {passwordArray.map((digit, index) => renderDot(digit, index, currentStep === 'confirm'))}
      </View>
    );
  };

  const isPasswordComplete = () => {
    const passwordArray = currentStep === 'input' ? password : confirmPassword;
    return passwordArray.every(digit => digit !== "");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (currentStep === 'confirm') {
                setCurrentStep('input');
                setConfirmPassword(["", "", "", "", "", ""]);
              } else {
                router.back();
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          
          <Text style={styles.title}>
            {isLoginMode 
              ? 'Enter Password' 
              : (currentStep === 'input' ? 'Set Password' : 'Confirm Password')
            }
          </Text>
          
          <View style={styles.placeholder} />
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            {isLoginMode
              ? 'Enter your 6-digit password to sign in'
              : (currentStep === 'input' 
                ? 'Create a 6-digit password'
                : 'Please confirm your password'
              )
            }
          </Text>
          {email && (
            <Text style={styles.emailText}>
              Setting up for: {email}
            </Text>
          )}
        </View>

        <View style={styles.codeContainer}>
          {renderDots()}
        </View>

        {/* Only show confirmation step for setup mode */}
        {!isLoginMode && (
          <View style={styles.visibilityContainer}>
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={24} 
                color="#666" 
              />
              <Text style={styles.eyeButtonText}>
                {showPassword ? 'Hide' : 'Show'} Password
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !isPasswordComplete() && styles.continueButtonDisabled
            ]}
            onPress={isLoginMode ? handleConfirm : (currentStep === 'input' ? handleContinue : handleConfirm)}
            disabled={!isPasswordComplete() || isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>
              {isLoading 
                ? (isLoginMode ? 'Signing In...' : 'Setting...') 
                : (isLoginMode ? 'Sign In' : (currentStep === 'input' ? 'Continue' : 'Confirm'))
              }
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {isLoginMode
              ? 'Enter your 6-digit password to access your account'
              : (currentStep === 'input' 
                ? 'This password will be used for quick login when passkey is not available'
                : 'Make sure both passwords match exactly'
              )
            }
          </Text>
        </View>
      </Animated.View>
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
  emailText: {
    fontSize: 14,
    color: "#999",
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotContainer: {
    alignItems: 'center',
    marginHorizontal: DOT_SPACING / 2,
  },
  dotTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dotEmpty: {
    borderWidth: 2,
    borderColor: '#e1e1e1',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#007AFF',
    borderWidth: 0,
  },
  dotFocused: {
    borderWidth: 3,
    borderColor: '#007AFF',
    transform: [{ scale: 1.1 }],
  },
  dotText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  hiddenInput: {
    position: 'absolute',
    width: DOT_SIZE + 16, // Add padding for better touch area
    height: DOT_SIZE + 16,
    opacity: 0,
    top: -8,
    left: -8,
  },
  visibilityContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  eyeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
  },
  eyeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: 32,
  },
  continueButton: {
    height: 56,
    backgroundColor: "#000000",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: "#ccc",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: "#999",
    textAlign: 'center',
    lineHeight: 20,
  },
});
