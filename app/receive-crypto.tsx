import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Blockchain {
  blockchain: string;
  name: string;
  type: string;
  hasWallet: boolean;
  accountType?: string;
  state?: string;
  estimatedTime?: string;
}

export default function ReceiveCrypto() {
  const router = useRouter();
  const [blockchains, setBlockchains] = useState<Blockchain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlockchains();
  }, []);

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
      Alert.alert('Error', 'Failed to load blockchains');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockchainSelect = (blockchain: string) => {
    router.push({
      pathname: '/receive-qr',
      params: { blockchain: blockchain }
    });
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

  const getBlockchainColor = (blockchain: string) => {
    switch (blockchain) {
      case 'ETH-SEPOLIA':
        return '#627EEA';
      case 'ARB-SEPOLIA':
        return '#28A0F0';
      case 'BASE-SEPOLIA':
        return '#0052FF';
      case 'OP-SEPOLIA':
        return '#FF0420';
      case 'MATIC-AMOY':
        return '#8247E5';
      case 'AVAX-FUJI':
        return '#E84142';
      case 'SOL-DEVNET':
        return '#9945FF';
      case 'APTOS-TESTNET':
        return '#00D4AA';
      case 'UNI-SEPOLIA':
        return '#00D4AA';
      default:
        return '#6B7280';
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
        <Text style={styles.loadingText}>Loading blockchains...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor='#000000'/>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Select network</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          {/* Information Box */}
          <View style={styles.infoBox}>
            <View style={styles.infoIcon}>
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>What should I pick?</Text>
              <Text style={styles.infoText}>Select the network you're using to transfer the asset</Text>
            </View>
          </View>

          <View style={styles.blockchainList}>
            {blockchains.map((blockchain) => (
              <TouchableOpacity
                key={blockchain.blockchain}
                style={[
                  styles.blockchainItem,
                  !blockchain.hasWallet && styles.disabledItem
                ]}
                onPress={() => blockchain.hasWallet && handleBlockchainSelect(blockchain.blockchain)}
                disabled={!blockchain.hasWallet}
              >
                <View style={styles.blockchainInfo}>
                  <View style={styles.iconContainer}>
                    <Image
                      source={{ uri: getBlockchainImage(blockchain.blockchain) }}
                      style={styles.blockchainImage}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.blockchainDetails}>
                    <Text style={[
                      styles.blockchainName,
                      !blockchain.hasWallet && styles.disabledText
                    ]}>
                      {blockchain.name}
                    </Text>
                  </View>
                </View>

                <View style={styles.rightSection}>
                  {blockchain.hasWallet ? (
                    <Text style={styles.estimatedTime}>
                      {getEstimatedTime(blockchain.blockchain)}
                    </Text>
                  ) : (
                    <Text style={styles.unavailableText}>No Wallet</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#000',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#0004',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  blockchainList: {
    gap: 2,
  },
  blockchainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 16
  },
  disabledItem: {
    opacity: 0.5,
  },
  blockchainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#000',
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
  disabledText: {
    color: '#666666',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  estimatedTime: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  unavailableText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
});
