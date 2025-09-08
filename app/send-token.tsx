import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { API_BASE_URL } from '../config/api';
import CustomAlert from './components/CustomAlert';

interface Token {
  id: string;
  symbol: string;
  name: string;
  balance: string;
  balanceUSD: string;
  icon: string;
  address: string;
  price: number;
  blockchain: string;
  walletId: string;
  walletAddress: string;
}


export default function SendToken() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState('');
  const [amountUSD, setAmountUSD] = useState('0.00');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    buttons: [] as Array<{text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive'}>
  });
  const contactName = params.contactName as string;
  const contactAddress = params.contactAddress as string;

  // Real token data from API
  const [availableTokens, setAvailableTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get session from params or use a default for now
  const session = { userId: '68b8b67390daa0d92d410679' }; // This should come from session management

  // Fetch real token data from API
  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/api/wallets/wallets/${session.userId}/balance`);
        const data = await response.json();
        
        if (data.success && data.walletData) {
          console.log('Token data received for send-token:', data.walletData);
          
          // Flatten all token balances from all wallets and convert to Token format
          const allTokens = data.walletData.flatMap((wallet: any) => 
            wallet.tokenBalances.map((tokenBalance: any) => {
              const token = tokenBalance.token;
              const amount = parseFloat(tokenBalance.amount);
              
              // Mock price calculation based on token symbol
              let pricePerToken = 1;
              if (token.symbol.includes('ETH')) pricePerToken = 2500;
              else if (token.symbol === 'USDC') pricePerToken = 1;
              else if (token.symbol === 'POL') pricePerToken = 0.5;
              else if (token.symbol === 'SOL') pricePerToken = 100;
              else if (token.symbol === 'EURC') pricePerToken = 1.1;
              
              const usdValue = amount * pricePerToken;
              
              return {
                id: token.id,
                symbol: token.symbol,
                name: token.name,
                balance: tokenBalance.amount,
                balanceUSD: usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                icon: `https://cryptologos.cc/logos/${token.symbol.toLowerCase().replace('-', '-')}-${token.symbol.toLowerCase().replace('-', '-')}-logo.png`,
                address: token.tokenAddress || '0x0000000000000000000000000000000000000000',
                price: pricePerToken,
                blockchain: wallet.blockchain,
                walletId: wallet.walletId,
                walletAddress: wallet.walletAddress
              };
            })
          );
          
          setAvailableTokens(allTokens);
          console.log('Available tokens for sending:', allTokens);
        } else {
          setError('Failed to fetch token data');
        }
      } catch (err) {
        console.error('Error fetching token data:', err);
        setError('Network error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.userId) {
      fetchTokenData();
    }
  }, [session?.userId]);

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    setShowTokenModal(false);
    
    // Navigate to enter amount page with selected token
    router.push({
      pathname: '/enter-amount',
      params: {
        contactName,
        contactAddress,
        tokenId: token.id,
        tokenSymbol: token.symbol,
        tokenName: token.name,
        tokenIcon: token.icon,
        tokenPrice: token.price.toString(),
        tokenBalance: token.balance,
        tokenBalanceUSD: token.balanceUSD,
        blockchain: token.blockchain,
        walletId: token.walletId,
        walletAddress: token.walletAddress,
        tokenAddress: token.address,
      }
    });
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (selectedToken) {
      const numericAmount = parseFloat(value) || 0;
      const usdAmount = numericAmount * selectedToken.price;
      setAmountUSD(usdAmount.toFixed(2));
    }
  };

  const handleMaxAmount = () => {
    if (selectedToken) {
      const maxAmount = selectedToken.balance.replace(/,/g, '');
      setAmount(maxAmount);
      const numericAmount = parseFloat(maxAmount) || 0;
      const usdAmount = numericAmount * selectedToken.price;
      setAmountUSD(usdAmount.toFixed(2));
    }
  };

  const showCustomAlert = (title: string, message: string, buttons: Array<{text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive'}>) => {
    setAlertConfig({ title, message, buttons });
    setShowAlert(true);
  };

  const handleNext = () => {
    if (!selectedToken) {
      showCustomAlert('Error', 'Please select a token', [
        { text: 'OK', onPress: () => {} }
      ]);
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      showCustomAlert('Error', 'Please enter a valid amount', [
        { text: 'OK', onPress: () => {} }
      ]);
      return;
    }
    if (parseFloat(amount) > parseFloat(selectedToken.balance.replace(/,/g, ''))) {
      showCustomAlert('Error', 'Insufficient balance', [
        { text: 'OK', onPress: () => {} }
      ]);
      return;
    }

    // Navigate to review page with all data
    router.push({
      pathname: '/send-review',
      params: {
        contactName,
        contactAddress,
        tokenId: selectedToken.id,
        tokenSymbol: selectedToken.symbol,
        tokenName: selectedToken.name,
        tokenIcon: selectedToken.icon,
        amount,
        amountUSD,
      }
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor="#000000" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Select asset to send</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#fff" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.tokenSection}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading your tokens...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => {
                    if (session?.userId) {
                      // Retry fetch
                      const fetchTokenData = async () => {
                        try {
                          setIsLoading(true);
                          setError(null);
                          
                          const response = await fetch(`${API_BASE_URL}/api/wallets/wallets/${session.userId}/balance`);
                          const data = await response.json();
                          
                          if (data.success && data.walletData) {
                            const allTokens = data.walletData.flatMap((wallet: any) => 
                              wallet.tokenBalances.map((tokenBalance: any) => {
                                const token = tokenBalance.token;
                                const amount = parseFloat(tokenBalance.amount);
                                
                                let pricePerToken = 1;
                                if (token.symbol.includes('ETH')) pricePerToken = 2500;
                                else if (token.symbol === 'USDC') pricePerToken = 1;
                                else if (token.symbol === 'POL') pricePerToken = 0.5;
                                else if (token.symbol === 'SOL') pricePerToken = 100;
                                else if (token.symbol === 'EURC') pricePerToken = 1.1;
                                
                                const usdValue = amount * pricePerToken;
                                
                                return {
                                  id: token.id,
                                  symbol: token.symbol,
                                  name: token.name,
                                  balance: tokenBalance.amount,
                                  balanceUSD: usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                                  icon: `https://cryptologos.cc/logos/${token.symbol.toLowerCase().replace('-', '-')}-${token.symbol.toLowerCase().replace('-', '-')}-logo.png`,
                                  address: token.tokenAddress || '0x0000000000000000000000000000000000000000',
                                  price: pricePerToken,
                                  blockchain: wallet.blockchain,
                                  walletId: wallet.walletId,
                                  walletAddress: wallet.walletAddress
                                };
                              })
                            );
                            
                            setAvailableTokens(allTokens);
                          } else {
                            setError('Failed to fetch token data');
                          }
                        } catch (err) {
                          console.error('Error fetching token data:', err);
                          setError('Network error occurred');
                        } finally {
                          setIsLoading(false);
                        }
                      };
                      fetchTokenData();
                    }
                  }}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : availableTokens.length > 0 ? (
              availableTokens.map((token) => (
                <TouchableOpacity key={token.id} style={styles.tokenButton} onPress={() => handleTokenSelect(token)}>
                  <View style={styles.selectedToken}>
                    <Image source={{ uri: token.icon }} style={styles.tokenIcon} />
                    <View>
                      <Text style={styles.tokenName}>{token.name}</Text>
                      <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                    </View>
                  </View>
                  <View style={styles.tokenBalance}>
                    <Text style={styles.balanceUSD}>${token.balanceUSD}</Text>
                    <Text style={styles.balanceText}>{token.balance} {token.symbol}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tokens available</Text>
                <Text style={styles.emptySubtext}>You need to have tokens in your wallet to send</Text>
              </View>
            )}
          </View>
        </ScrollView>

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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  recipientCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333333',
  },
  recipientLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
    marginBottom: 12,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  contactAddress: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  tokenSection: {
    marginBottom: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tokenButton: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedToken: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderToken: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tokenIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenSymbol: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 2,
  },
  tokenName: {
    fontWeight: '600',
    fontSize: 16,
    color: '#fff',
  },
  tokenBalance: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginRight: 8,
    alignItems: 'flex-end',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666666',
    flex: 1,
    marginLeft: 12,
  },
  amountSection: {
    marginBottom: 24,
  },
  amountContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 12,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  amountUSD: {
    fontSize: 16,
    color: '#fff',
  },
  amountActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  maxButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  maxButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  balanceText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
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
    paddingTop: 60,
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
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 8,
  },
  tokenBalanceUSD: {
    alignItems: 'flex-end',
  },
  balanceUSD: {
    fontSize: 16,
    color: '#fff',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingLeft: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
  },
});
