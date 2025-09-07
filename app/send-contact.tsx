import { Ionicons } from '@expo/vector-icons';
// import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
    Clipboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import CustomAlert from './components/CustomAlert';


export default function SendContact() {
  const router = useRouter();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    buttons: [] as Array<{text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive'}>
  });
  
  // TODO: Replace with actual recent transfers data
  const recentTransfers: any[] = []; // Empty for now, will be populated with actual data

  // Validation functions
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidWalletAddress = (address: string) => {
    // Basic wallet address validation - adjust based on your supported networks
    // This checks for common wallet address patterns (Ethereum, Bitcoin, etc.)
    const walletRegex = /^(0x[a-fA-F0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{25,34}|[a-zA-Z0-9]{32,44})$/;
    return walletRegex.test(address);
  };

  const isRecipientValid = recipientAddress.trim() && 
    (isValidEmail(recipientAddress.trim()) || isValidWalletAddress(recipientAddress.trim()));

  const handleContinue = () => {
    if (isRecipientValid) {
      router.push({
        pathname: '/send-token',
        params: {
          contactName: 'Unknown Contact', // You can extract this from the address or add a name field
          contactAddress: recipientAddress.trim(),
        }
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  const showCustomAlert = (title: string, message: string, buttons: Array<{text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive'}>) => {
    setAlertConfig({ title, message, buttons });
    setShowAlert(true);
  };

  const handlePaste = useCallback(async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      if (clipboardContent.trim()) {
        setRecipientAddress(clipboardContent.trim());
      } else {
        showCustomAlert('Clipboard Empty', 'No content found in clipboard', [
          { text: 'OK', onPress: () => {} }
        ]);
      }
    } catch (error) {
      console.error('Error reading clipboard:', error);
      showCustomAlert('Error', 'Failed to read clipboard content', [
        { text: 'OK', onPress: () => {} }
      ]);
    }
  }, []);

  const handleScanQR = useCallback(async () => {
    showCustomAlert('Camera Not Available', 'Camera functionality is temporarily disabled. Please enter the address manually.', [
      { text: 'OK', onPress: () => {} }
    ]);
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
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#fff" />
            <TextInput
              style={{
                flex: 1,
                padding: 16,
                color: '#fff',
              }}
              placeholder="Email, Wallet Address"
              placeholderTextColor="#666"
              value={recipientAddress}
              onChangeText={setRecipientAddress}
            />
          </View>

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
            <Text style={styles.sectionTitle}>Recents</Text>
            <Text style={styles.viewMore}>View More</Text>
          </View>

          {recentTransfers.length > 0 ? (
            <View style={styles.recentTransfersContainer}>
              {recentTransfers.map((transfer, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.recentTransferItem}
                  onPress={() => setRecipientAddress(transfer.address)}
                >
                  <View style={styles.transferInfo}>
                    <Text style={styles.transferName}>{transfer.name || 'Unknown Contact'}</Text>
                    <Text style={styles.transferAddress}>{transfer.address}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noRecentsContainer}>
              <Ionicons name="time-outline" size={48} color="#666" />
              <Text style={styles.noRecentsText}>No recent recipients</Text>
              <Text style={styles.noRecentsSubtext}>Your recent addresses will appear here</Text>
            </View>
          )}

        </ScrollView>
          <TouchableOpacity 
            style={[
              styles.button, 
              !isRecipientValid && styles.buttonDisabled
            ]} 
            onPress={handleContinue}
            disabled={!isRecipientValid}
          >
            <Text style={[
              styles.buttonText,
              !isRecipientValid && styles.buttonTextDisabled
            ]}>
              Continue
            </Text>
          </TouchableOpacity>

        <CustomAlert
          visible={showAlert}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={() => setShowAlert(false)}
        />
      </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingLeft: 16,
    marginBottom: 20,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  viewMore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0984e3',
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
  button: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    marginHorizontal: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  buttonDisabled: {
    backgroundColor: '#fff9',
    opacity: 0.6,
  },
  buttonTextDisabled: {
    color: '#000',
  },
  noRecentsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  noRecentsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  noRecentsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  recentTransfersContainer: {
    marginBottom: 20,
  },
  recentTransferItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  transferInfo: {
    flex: 1,
  },
  transferName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  transferAddress: {
    fontSize: 14,
    color: '#666',
  },
});
