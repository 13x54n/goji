import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
interface WalletInfo {
  id: string;
  address: string;
  blockchain: string;
  accountType: string;
  state: string;
  qrCodeUrl?: string;
}

interface Blockchain {
  blockchain: string;
  name: string;
  type: string;
  hasWallet: boolean;
  accountType?: string;
  state?: string;
  estimatedTime?: string;
}

export default function ReceiveQR() {
  const router = useRouter();
  const { blockchain } = useLocalSearchParams();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [blockchains, setBlockchains] = useState<Blockchain[]>([]);
  const [showBlockchainModal, setShowBlockchainModal] = useState(false);
  const [currentBlockchain, setCurrentBlockchain] = useState<string>('');
  const [qrCodeError, setQrCodeError] = useState(false);
  const [showOtherNetworks, setShowOtherNetworks] = useState(false);

  useEffect(() => {
    const blockchainParam = blockchain as string || 'ETH-SEPOLIA';
    setCurrentBlockchain(blockchainParam);
    fetchWalletAddress(blockchainParam);
    fetchBlockchains();
  }, [blockchain]);

  const fetchWalletAddress = async (blockchainParam: string) => {
    try {
      setCurrentBlockchain(blockchainParam);
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/wallets/address/${blockchainParam}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wallet address');
      }

      const data = await response.json();
      setWalletInfo(data.wallet);
      setQrCodeError(false); // Reset QR code error when new wallet is loaded
    } catch (error) {
      console.error('Error fetching wallet address:', error);
      Alert.alert('Error', 'Failed to load wallet address');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockchains = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/wallets/blockchains`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch blockchains');
      }

      const data = await response.json();
      setBlockchains(data.blockchains);
    } catch (error) {
      console.error('Error fetching blockchains:', error);
    }
  };

  const handleCopyAddress = async () => {
    if (walletInfo?.address) {
      // In a real app, you would use Clipboard.setString(walletInfo.address)
      Alert.alert('Copied!', 'Address copied to clipboard');
    }
  };

  const handleShareAddress = async () => {
    if (walletInfo?.address) {
      try {
        await Share.share({
          message: `${walletInfo.address}`,
          title: 'Wallet Address',
        });
      } catch (error) {
        console.error('Error sharing address:', error);
      }
    }
  };

  const getBlockchainName = (blockchain: string) => {
    const names: { [key: string]: string } = {
      'ARB-SEPOLIA': 'Arbitrum Sepolia',
      'AVAX-FUJI': 'Avalanche Fuji',
      'BASE-SEPOLIA': 'Base Sepolia',
      'ETH-SEPOLIA': 'Ethereum Sepolia',
      'OP-SEPOLIA': 'Optimism Sepolia',
      'UNI-SEPOLIA': 'Uniswap Sepolia',
      'MATIC-AMOY': 'Polygon Amoy',
      'SOL-DEVNET': 'Solana Devnet',
      'APTOS-TESTNET': 'Aptos Testnet',
    };
    return names[blockchain] || blockchain;
  };

  const handleNetworkChange = (network: string) => {
    setShowBlockchainModal(true);
  };

  const handleBlockchainSelect = (selectedBlockchain: string) => {
    setShowBlockchainModal(false);
    setLoading(true);
    setCurrentBlockchain(selectedBlockchain);
    fetchWalletAddress(selectedBlockchain);
  };

  const getBlockchainImage = (blockchain: string) => {
    switch (blockchain) {
      case 'ETH-SEPOLIA':
        return 'https://imgs.search.brave.com/P7nI2n8RDw7TIZIMsXmLirNDUm8zzdKeVGlDk3PIeSU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9yZXZv/a2UuY2FzaC9hc3Nl/dHMvaW1hZ2VzL3Zl/bmRvci9jaGFpbnMv/ZXRoZXJldW0uc3Zn';
      case 'ARB-SEPOLIA':
        return 'https://imgs.search.brave.com/VtsjglKy8mLXG_Z7qaeZJ5HPGnlWCs01PMuuFmtYodw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hc3Nl/dHMuYml0Mm1lLmNv/bS9jcnlwdG8taWNv/bnMvdjgvc3ZnL2Fy/Yi1jaXJjbGUtc29s/aWQtZGVmYXVsdC5z/dmc';
      case 'BASE-SEPOLIA':
        return 'https://imgs.search.brave.com/O3QD1bG2JV-wLaVdLXsUYC5iUfMNlTadDbnjNKGHQLI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hbHRj/b2luc2JveC5jb20v/d3AtY29udGVudC91/cGxvYWRzLzIwMjMv/MDIvYmFzZS1sb2dv/LWluLWJsdWUtMzAw/eDMwMC53ZWJw';
      case 'OP-SEPOLIA':
        return 'https://imgs.search.brave.com/UoyAAorpv0SmxRNVbyd2JXWgrW6cFd18M_4ZSwmXgPA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9vcGNo/YWlubGlzdC5jb20v/aW1hZ2VzL29wLmpw/Zw';
      case 'MATIC-AMOY':
        return 'https://imgs.search.brave.com/vBB6wAjC7VjNI-TJFHNxpGkYBXh05atbdNLTtXOwBpw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucHJpc21pYy5p/by9kYXRhLWNoYWlu/LWxpbmsvMTA2MGZj/NGUtMDg2ZS00OTM1/LWI3MWUtZjI4MmVi/M2Y4YmI0X01BVElD/LWljb24ucG5nP2F1/dG89Y29tcHJlc3Ms/Zm9ybWF0';
      case 'AVAX-FUJI':
        return 'https://imgs.search.brave.com/uHci5h2p-D6LBDxCat_XNknWPb6yMkjTvl8HMx0gcg0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jb2lu/LWltYWdlcy5jb2lu/Z2Vja28uY29tL2Nv/aW5zL2ltYWdlcy8x/MjU1OS9sYXJnZS9B/dmFsYW5jaGVfQ2ly/Y2xlX1JlZFdoaXRl/X1RyYW5zLnBuZz8x/Njk2NTEyMzY5';
      case 'SOL-DEVNET':
        return 'https://imgs.search.brave.com/pTUpEezOc2HbVCLDA6zumBUz9YcUDpYVkjvRRL99LAs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZWRlbGl2ZXJ5Lm5l/dC80LTVKQzFyM1ZI/QVhwbnJ3V0hCSFJR/LzQyODM4YWEwLWU5/YjgtNGVjNy1mZjAy/LTQ0YmQ5NGQzMjIw/MC9jb2luMTI4';
      case 'APTOS-TESTNET':
        return 'https://imgs.search.brave.com/p2gXudkt2oCWqGhsJwmwdJPPaUpBDAh8z02z5TjQrN4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wbGF0/Zm9ybS5jaGFpbmJh/c2UuY29tL2Fzc2V0/cy9ycGNTZXJ2aWNl/L211bHRpQ2hhaW4v/QXB0b3MucG5n';
      case 'UNI-SEPOLIA':
        return 'https://imgs.search.brave.com/1oN3qXDLdHbNjHuHpBp1dNXYdAcCqdAsn_nrX8hpMws/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS12ZWN0/b3IvdW5pc3dhcC1j/b2luXzQ4MjAzLTI4/Ny5qcGc_c2VtdD1h/aXNfaHlicmlkJnc9/NzQw';
      default:
        return 'https://cryptologos.cc/logos/ethereum-eth-logo.png';
    }
  };

  const getEstimatedTime = (blockchain: string) => {
    switch (blockchain) {
      case 'ETH-SEPOLIA':
        return '~3 minutes';
      case 'ARB-SEPOLIA':
        return '~4 minutes';
      case 'BASE-SEPOLIA':
        return '~24 sec';
      case 'OP-SEPOLIA':
        return '~2 minutes';
      case 'MATIC-AMOY':
        return '~30 sec';
      case 'AVAX-FUJI':
        return '~26 sec';
      case 'SOL-DEVNET':
        return '~13 sec';
      case 'APTOS-TESTNET':
        return '~26 sec';
      case 'UNI-SEPOLIA':
        return '~26 sec';
      default:
        return '~1 minute';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading wallet address...</Text>
      </View>
    );
  }

  if (!walletInfo) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Wallet Not Found</Text>
        <Text style={styles.errorText}>
          No wallet found for {getBlockchainName(blockchain as string)}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor='#000000' />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Receive Crypto</Text>
          <TouchableOpacity onPress={handleShareAddress} style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.qrContainer}>
            <View style={styles.qrWrapper}>
              <View style={styles.qrPlaceholder}>
                {
                  walletInfo?.qrCodeUrl && !qrCodeError ? (
                    <Image
                      source={{ uri: walletInfo.qrCodeUrl }}
                      style={{ height: 200, width: 200 }}
                      resizeMode="contain"
                      onError={() => {
                        setQrCodeError(true);
                      }}
                    />
                  ) : qrCodeError ? (
                    <Text style={styles.qrPlaceholderText}>QR code failed to load</Text>
                  ) : walletInfo?.address ? (
                    <Text style={styles.qrPlaceholderText}>Generating QR code...</Text>
                  ) : (
                    <Text style={styles.qrPlaceholderText}>No address available</Text>
                  )
                }
              </View>
            </View>
          </View>

          <View style={{ ...styles.addressContainer, marginTop: 10 }}>
            <View style={styles.addressWrapper}>
              <View style={{ flex: 1, flexDirection: 'column', gap: 4 }}>
                <Text style={styles.addressLabel}>Your {getBlockchainName(currentBlockchain)} Address</Text>
                <Text style={styles.addressText}>
                  {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-6)}
                </Text>
              </View>
              <TouchableOpacity onPress={handleCopyAddress} style={styles.copyButton}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Copy</Text>
                <Ionicons name="copy-outline" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.warningContainer}>
            <Ionicons name="water" size={20} color="#fff6" />
            <Text style={styles.warningText}>
              Same address across <Text onPress={() => handleNetworkChange('supported')}>
                <Text style={{ color: '#2ecc71', fontWeight: '600' }}>Supported Networks</Text>
              </Text> — except <Text style={{ color: '#fff', fontWeight: '600' }}>Solana & Aptos</Text>. 
            </Text>
          </View>

          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={styles.toggleButton}
              onPress={() => setShowOtherNetworks(!showOtherNetworks)}
            >
              <Text style={styles.toggleButtonText}>
                {showOtherNetworks ? 'Hide' : 'Show'} Other Networks
              </Text>
              <Ionicons 
                name={showOtherNetworks ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>

          {showOtherNetworks && (
            <View style={styles.networkContainer}>
              <View style={{ ...styles.networkWrapper, gap: 12, marginTop: 12 }}>
              <TouchableOpacity
                style={{ backgroundColor: '#fff1', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 6 }}
                onPress={() => {
                  setLoading(true);
                  setCurrentBlockchain('ETH-SEPOLIA');
                  fetchWalletAddress('ETH-SEPOLIA');
                }}
              >
                <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={styles.blockchainName}>Default</Text>
                  <Text style={styles.estimatedTime}>~26 sec</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: '#fff1', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 6 }}
                onPress={() => {
                  setLoading(true);
                  setCurrentBlockchain('SOL-DEVNET');
                  fetchWalletAddress('SOL-DEVNET');
                }}
              >
                <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={styles.blockchainName}>Solana</Text>
                  <Text style={styles.estimatedTime}>~13 sec</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: '#fff1', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 6 }}
                onPress={() => {
                  setLoading(true);
                  setCurrentBlockchain('APTOS-TESTNET');
                  fetchWalletAddress('APTOS-TESTNET');
                }}
              >
                <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={styles.blockchainName}>Aptos</Text>
                  <Text style={styles.estimatedTime}>~26 sec</Text>
                </View>
              </TouchableOpacity>
            </View>
            </View>
          )}
        </View>

        {/* Blockchain Selection Modal */}
        <Modal
          visible={showBlockchainModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowBlockchainModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Network</Text>
              <TouchableOpacity onPress={() => setShowBlockchainModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {blockchains.map((blockchainItem) => (
                <TouchableOpacity
                  key={blockchainItem.blockchain}
                  style={[
                    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 16 },
                    !blockchainItem.hasWallet && styles.disabledItem,
                    currentBlockchain === blockchainItem.blockchain && styles.activeBlockchainItem
                  ]}
                  onPress={() => blockchainItem.hasWallet && handleBlockchainSelect(blockchainItem.blockchain)}
                  disabled={!blockchainItem.hasWallet}
                >
                  <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={styles.iconContainer}>
                      <Image
                        source={{ uri: getBlockchainImage(blockchainItem.blockchain) }}
                        style={styles.blockchainImage}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={[
                      styles.blockchainName,
                      !blockchainItem.hasWallet && styles.disabledText
                    ]}>
                      {blockchainItem.name}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'space-between' }}>
                    {blockchainItem.hasWallet ? (
                      <Text style={styles.estimatedTime}>
                        {getEstimatedTime(blockchainItem.blockchain)}
                      </Text>
                    ) : (
                      <Text style={styles.unavailableText}>No Wallet</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#CCCCCC',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  blockchainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
  },
  blockchainIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  blockchainImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  blockchainDetails: {
    flex: 1,
  },
  blockchainName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  accountType: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 22,
  },
  qrWrapper: {
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  qrLabel: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    fontWeight: '600',
  },
  addressContainer: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderColor: '#fff3',
    paddingBottom: 16,
    paddingHorizontal: 12,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 16,
    color: '#FFF6',
  },
  copyButton: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#fff6',
    marginLeft: 12,
    lineHeight: 20,
  },
  toggleContainer: {
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff1',
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  qrPlaceholderText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  debugText: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  networkContainer: {
    marginBottom: 24,
    paddingBottom: 16,
    paddingHorizontal: 12,
    marginTop: 0,
  },
  networkLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  networkWrapper: {
    gap: 8,
    flexDirection: 'column'
  },
  blockchainItem: {
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  estimatedTime: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBlockchainItem: {
    
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  disabledItem: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#666666',
  },
  unavailableText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
});
