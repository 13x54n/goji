import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface WalletInfo {
  id: string;
  address: string;
  blockchain: string;
  accountType: string;
  state: string;
}

export default function ReceiveQR() {
  const router = useRouter();
  const { blockchain } = useLocalSearchParams();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (blockchain) {
      fetchWalletAddress(blockchain as string);
    }
  }, [blockchain]);

  const fetchWalletAddress = async (blockchainParam: string) => {
    try {
      const response = await fetch(`http://10.0.0.82:4000/api/wallets/address/${blockchainParam}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wallet address');
      }

      const data = await response.json();
      setWalletInfo(data.wallet);
    } catch (error) {
      console.error('Error fetching wallet address:', error);
      Alert.alert('Error', 'Failed to load wallet address');
    } finally {
      setLoading(false);
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
          message: `My ${getBlockchainName(blockchain as string)} address: ${walletInfo.address}`,
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

  const getBlockchainColor = (blockchain: string) => {
    const colors: { [key: string]: string } = {
      'ETH-SEPOLIA': '#627EEA',
      'ARB-SEPOLIA': '#28A0F0',
      'BASE-SEPOLIA': '#0052FF',
      'OP-SEPOLIA': '#FF0420',
      'MATIC-AMOY': '#8247E5',
      'AVAX-FUJI': '#E84142',
      'SOL-DEVNET': '#9945FF',
      'APTOS-TESTNET': '#00D4AA',
    };
    return colors[blockchain] || '#6B7280';
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Receive Crypto</Text>
        <TouchableOpacity onPress={handleShareAddress} style={styles.shareButton}>
          <Ionicons name="share" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.blockchainInfo}>
          <View style={[
            styles.blockchainIcon,
            { backgroundColor: getBlockchainColor(blockchain as string) }
          ]}>
            <Ionicons name="wallet" size={32} color="white" />
          </View>
          <Text style={styles.blockchainName}>
            {getBlockchainName(blockchain as string)}
          </Text>
          <Text style={styles.accountType}>
            {walletInfo.accountType} • {walletInfo.state}
          </Text>
        </View>

        <View style={styles.qrContainer}>
          <View style={styles.qrWrapper}>
            <QRCode
              value={walletInfo.address}
              size={250}
              color="#000000"
              backgroundColor="#FFFFFF"
            />
          </View>
          <Text style={styles.qrLabel}>Scan QR code to send crypto</Text>
        </View>

        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>Wallet Address</Text>
          <View style={styles.addressWrapper}>
            <Text style={styles.addressText} numberOfLines={2}>
              {walletInfo.address}
            </Text>
            <TouchableOpacity onPress={handleCopyAddress} style={styles.copyButton}>
              <Ionicons name="copy" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={20} color="#F59E0B" />
          <Text style={styles.warningText}>
            Only send {getBlockchainName(blockchain as string)} assets to this address. 
            Sending other assets may result in permanent loss.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
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
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
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
    alignItems: 'center',
    marginBottom: 32,
  },
  blockchainIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  blockchainName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    color: '#6B7280',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrWrapper: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrLabel: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  addressContainer: {
    marginBottom: 24,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  addressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 8,
    marginLeft: 12,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    marginLeft: 12,
    lineHeight: 20,
  },
});
