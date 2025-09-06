import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Clipboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';


export default function SendContact() {
  const router = useRouter();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handleBack = () => {
    router.back();
  };

  const handlePaste = useCallback(async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      if (clipboardContent.trim()) {
        setRecipientAddress(clipboardContent.trim());
      } else {
        Alert.alert('Clipboard Empty', 'No content found in clipboard');
      }
    } catch (error) {
      console.error('Error reading clipboard:', error);
      Alert.alert('Error', 'Failed to read clipboard content');
    }
  }, []);

  const handleScanQR = useCallback(async () => {
    try {
      if (!permission) {
        Alert.alert('Camera Error', 'Camera permissions are still loading. Please try again.');
        return;
      }

      if (!permission.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          Alert.alert(
            'Camera Permission Required', 
            'Camera permission is required to scan QR codes. Please enable it in your device settings.'
          );
          return;
        }
      }

      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      Alert.alert('Camera Error', 'Failed to access camera. Please try again.');
    }
  }, [permission, requestPermission]);

  const handleBarcodeScanned = useCallback(({ type, data }: { type: string; data: string }) => {
    setShowCamera(false);
    
    // Extract address from QR code data
    // QR codes might contain just the address or a full URI like "ethereum:0x..."
    let extractedAddress = data;
    
    // Handle different QR code formats
    if (data.includes(':')) {
      // Extract address from URI format (e.g., "ethereum:0x123...")
      const parts = data.split(':');
      if (parts.length > 1) {
        extractedAddress = parts[1];
      }
    }
    
    // Basic validation - check if it looks like a crypto address
    if (extractedAddress && (extractedAddress.startsWith('0x') || extractedAddress.length > 20)) {
      setRecipientAddress(extractedAddress);
      Alert.alert('Success', 'QR code scanned successfully!');
    } else {
      Alert.alert('Invalid QR Code', 'The scanned QR code does not contain a valid wallet address');
    }
  }, []);

  const closeCamera = useCallback(() => {
    setShowCamera(false);
  }, []);

  return (
    <>
      <StatusBar style="dark" backgroundColor="#000000" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Send Crypto to</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <Text style={styles.sectionTitle}>Receipient Address</Text>
          <TextInput
            style={{
              backgroundColor: '#1a1a1a',
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: '#333333',
              color: '#fff',
              marginBottom: 20,
            }}
            placeholder="Email, Wallet Address"
            placeholderTextColor="#666"
            value={recipientAddress}
            onChangeText={setRecipientAddress}
          />
          
          {/* paste or scan QR code */}
          <View style={styles.pasteButtonContainer}>
            <TouchableOpacity style={styles.pasteButton} onPress={handlePaste}>
              <Ionicons name="clipboard-outline" size={20} color="#000" />
              <Text style={styles.pasteButtonText}>Paste</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.scanButton} onPress={handleScanQR}>
              <Ionicons name="scan-outline" size={20} color="#fff" />
              <Text style={styles.scanButtonText}>Scan QR Code</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent</Text>
            
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Contacts</Text>
            
          </View>
        </ScrollView>
      </View>

      {/* Camera Modal */}
      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.cameraContainer}>
          <StatusBar style="light" />
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity onPress={closeCamera} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.cameraTitle}>Scan QR Code</Text>
              <View style={styles.placeholder} />
            </View>
            <View style={styles.scanArea}>
              <View style={styles.scanFrame} />
            </View>
            <View style={styles.cameraFooter}>
              <Text style={styles.scanInstructions}>
                Position the QR code within the frame
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#000',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  pasteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 80,
  },
  pasteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  pasteButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 8,
  },
  scanButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    minWidth: 120,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    padding: 8,
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  cameraFooter: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanInstructions: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
