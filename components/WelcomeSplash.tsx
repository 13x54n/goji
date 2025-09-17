import { useAuth } from '@/contexts/AuthContext';
import { ResizeMode, Video } from 'expo-av';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const WelcomeSplash: React.FC = () => {
  const { signInWithGoogle, signInWithApple, setFirstTimeCompleted, isLoading } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      await setFirstTimeCompleted();
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
      await setFirstTimeCompleted();
    } catch (error) {
      console.error('Apple sign-in failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.content}>
        {/* Logo/Icon Area */}
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>Goji</Text>
          <Text style={styles.tagline}>Stocks. Crypto. AI.</Text>
        </View>

        {/* Video/Animation Section */}
        <View style={styles.videoContainer}>
          <Video
            style={styles.video}
            source={{
              uri: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0',
              },
            }}
            shouldPlay
            isLooping
            resizeMode={ResizeMode.COVER}
            isMuted
          />
        </View>

        {/* Sign In Buttons */}
        <View style={styles.authContainer}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.buttonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.appleButton}
            onPress={handleAppleSignIn}
            disabled={isLoading}
          >
            <Text style={styles.appleIcon}>🍎</Text>
            <Text style={styles.buttonText}>Continue with Apple</Text>
          </TouchableOpacity>
        </View>


        {/* Terms */}
        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#9BA1A6',
    textAlign: 'center',
  },
  videoContainer: {
    width: '100%',
    height: '45%',
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 20,
    shadowColor: '#ff6b35',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  featuresContainer: {
    marginVertical: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 30,
  },
  featureText: {
    fontSize: 18,
    color: '#ECEDEE',
    fontWeight: '500',
  },
  authContainer: {

  },
  googleButton: {
    backgroundColor: '#4285f4',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4285f4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  appleButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 12,
  },
  appleIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  demoNote: {
    fontSize: 12,
    color: '#ff6b35',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  termsText: {
    fontSize: 12,
    color: '#9BA1A6',
    textAlign: 'center',
    lineHeight: 16,
  },
});
