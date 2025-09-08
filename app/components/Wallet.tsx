import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { API_BASE_URL } from '../../config/api';
import AnimatedBalance from './AnimatedBalance';
import CustomAlert from './CustomAlert';
interface WalletProps {
  session: any;
}
interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  amount: string;
  value: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  imageUrl: string;
}

export default function Wallet({ session }: WalletProps) {
  const router = useRouter();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<'crypto' | 'cash'>('crypto');
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    buttons: [] as Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  });

  // Real wallet data from API
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [tokenBalances, setTokenBalances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate real-time total balance from API data
  const [totalBalance, setTotalBalance] = useState('$0.00');
  const [totalBalanceChange, setTotalBalanceChange] = useState('+0.00');
  const [totalBalancePercent, setTotalBalancePercent] = useState('+0.00%');

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  const showCustomAlert = (title: string, message: string, buttons: Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>) => {
    setAlertConfig({ title, message, buttons });
    setShowAlert(true);
  };

  const handleReceive = () => {
    router.push({
      pathname: '/receive-qr',
      params: { blockchain: 'ETH-SEPOLIA' }
    });
  };

  const handleSend = () => {
    router.push('/send-contact'); // says unmatached route
  };

  const handleTransfer = () => {
    showCustomAlert('Transfer', 'Transfer functionality will be implemented here', [
      { text: 'OK', onPress: () => { } }
    ]);
  };

  const handlePortfolio = () => {
    showCustomAlert('Portfolio', 'Portfolio view will be implemented here', [
      { text: 'OK', onPress: () => { } }
    ]);
  };

  // Convert real token balances to crypto assets format
  const cryptoAssets: CryptoAsset[] = tokenBalances.map((balance, index) => {
    const token = balance.token;
    const amount = parseFloat(balance.amount);
    
    // Mock price calculation based on token symbol
    let pricePerToken = 1;
    if (token.symbol.includes('ETH')) pricePerToken = 2500;
    else if (token.symbol === 'USDC') pricePerToken = 1;
    else if (token.symbol === 'POL') pricePerToken = 0.5;
    else if (token.symbol === 'SOL') pricePerToken = 100;
    else if (token.symbol === 'EURC') pricePerToken = 1.1;
    
    const usdValue = amount * pricePerToken;
    const change = '+2.5%'; // Mock change for now
    const isPositive = true;

    return {
      id: token.id || index.toString(),
      name: token.name,
      symbol: token.symbol,
      amount: `${balance.amount} ${token.symbol}`,
      value: `$${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: change,
      changePercent: change,
      isPositive: isPositive,
      imageUrl: `https://cryptologos.cc/logos/${token.symbol.toLowerCase().replace('-', '-')}-${token.symbol.toLowerCase().replace('-', '-')}-logo.png`
    };
  });

  const cashAssets: CryptoAsset[] = [
    {
      id: '3',
      name: 'US Dollar',
      symbol: 'USD',
      amount: '$1,500.00',
      value: '$1,500.00',
      change: '+0.00%',
      changePercent: '+0.00%',
      isPositive: true,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/320px-Flag_of_the_United_States.svg.png'
    }
  ];

  const renderCryptoItem = ({ item }: { item: CryptoAsset }) => (
    <TouchableOpacity style={styles.cryptoItem}>
      <View style={styles.cryptoIcon}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.cryptoImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.cryptoInfo}>
        <Text style={styles.cryptoName}>{item.name}</Text>
        <Text style={styles.cryptoAmount}>{item.amount}</Text>
      </View>
      <View style={styles.cryptoValue}>
        <Text style={styles.cryptoValueText}>{item.value}</Text>
        <Text style={[
          styles.cryptoChange,
          item.isPositive ? styles.positiveChange : styles.negativeChange
        ]}>
          {item.change}
        </Text>
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/api/wallets/wallets/${session.userId}/balance`);
        const data = await response.json();
        
        if (data.success && data.walletData) {
          console.log('Wallet data received:', data.walletData);
          
          // Set wallets data
          setWallets(data.walletData);
          
          // Select first wallet by default
          if (data.walletData.length > 0) {
            setSelectedWallet(data.walletData[0]);
            
            // Flatten all token balances from all wallets
            const allTokens = data.walletData.flatMap((wallet: any) => 
              wallet.tokenBalances.map((tokenBalance: any) => ({
                ...tokenBalance,
                walletId: wallet.walletId,
                walletAddress: wallet.walletAddress,
                blockchain: wallet.blockchain,
                accountType: wallet.accountType
              }))
            );
            
            setTokenBalances(allTokens);
            console.log('All tokens:', allTokens);
          }
        } else {
          setError('Failed to fetch wallet data');
        }
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        setError('Network error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.userId) {
      fetchWalletData();
    }
  }, [session?.userId]);

  // Calculate total balance when tokenBalances change
  useEffect(() => {
    if (tokenBalances.length > 0) {
      const totalValue = cryptoAssets.reduce((sum, asset) => {
        const value = parseFloat(asset.value.replace('$', '').replace(',', ''));
        return sum + value;
      }, 0);
      
      setTotalBalance(`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      setTotalBalanceChange('+125.50'); // Mock change for now
      setTotalBalancePercent('+1.76%'); // Mock change for now
    }
  }, [tokenBalances]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Main Balance Card */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1635776062360-af423602aff3?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
        style={styles.balanceCard}
        imageStyle={styles.backgroundImage}
      >
        {/* Dark overlay */}
        <View style={styles.overlay}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total value</Text>
            <View style={styles.balanceHeaderRight}>
              <TouchableOpacity style={styles.eyeButton} onPress={toggleBalanceVisibility}>
                <Ionicons
                  name={isBalanceVisible ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.balanceRow}>
            <AnimatedBalance
              value={isBalanceVisible ? totalBalance : '••••••'}
              style={styles.balanceValue}
              animationDuration={300}
            />
            <View style={styles.balanceChangeContainer}>
              <Text style={[
                styles.balanceChangePositive,
                totalBalanceChange.startsWith('-') && styles.balanceChangeNegative
              ]}>
                {totalBalanceChange}
              </Text>
              <Text style={[
                styles.balanceChangePercent,
                totalBalancePercent.startsWith('-') && styles.balanceChangePercentNegative
              ]}>
                {totalBalancePercent} Last 24h
              </Text>
              {selectedWallet && (
                <Text style={styles.lastUpdate}>
                  Updated {new Date().toLocaleTimeString()}
                </Text>
              )}
            </View>
          </View>


          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleSend}>
              <View style={styles.actionButtonIcon}>
                <Ionicons name="arrow-up" size={20} color="#fff" />
              </View>
              <Text style={styles.actionButtonText}>Send</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleReceive}>
              <View style={styles.actionButtonIcon}>
                <Ionicons name="arrow-down" size={20} color="#fff" />
              </View>
              <Text style={styles.actionButtonText}>Receive</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleTransfer}>
              <View style={styles.actionButtonIcon}>
                <Ionicons name="git-compare-outline" size={20} color="#fff" />
              </View>
              <Text style={styles.actionButtonText}>Swap</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handlePortfolio}>
              <View style={styles.actionButtonIcon}>
                <Ionicons name="card-outline" size={20} color="#fff" />
              </View>
              <Text style={styles.actionButtonText}>Buy</Text>
            </TouchableOpacity>
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="warning" size={16} color="#FF3B30" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => { }}>
                <Ionicons name="refresh" size={16} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <Ionicons name="refresh" size={16} color="#FFFFFF" />
              <Text style={styles.loadingText}>Loading wallet data...</Text>
            </View>
          )}
        </View>
      </ImageBackground>

      {/* Crypto/Cash Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'crypto' && styles.activeTab]}
          onPress={() => setActiveTab('crypto')}
        >
          <Text style={[styles.tabText, activeTab === 'crypto' && styles.activeTabText]}>
            Crypto
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'cash' && styles.activeTab]}
          onPress={() => setActiveTab('cash')}
        >
          <Text style={[styles.tabText, activeTab === 'cash' && styles.activeTabText]}>
            Cash
          </Text>
        </TouchableOpacity>
      </View>

      {/* Assets List */}
      <View style={styles.assetsContainer}>
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
                  const fetchWalletData = async () => {
                    try {
                      setIsLoading(true);
                      setError(null);
                      
                      const response = await fetch(`${API_BASE_URL}/api/wallets/wallets/${session.userId}/balance`);
                      const data = await response.json();
                      
                      if (data.success && data.walletData) {
                        setWallets(data.walletData);
                        
                        if (data.walletData.length > 0) {
                          setSelectedWallet(data.walletData[0]);
                          
                          const allTokens = data.walletData.flatMap((wallet: any) => 
                            wallet.tokenBalances.map((tokenBalance: any) => ({
                              ...tokenBalance,
                              walletId: wallet.walletId,
                              walletAddress: wallet.walletAddress,
                              blockchain: wallet.blockchain,
                              accountType: wallet.accountType
                            }))
                          );
                          
                          setTokenBalances(allTokens);
                        }
                      } else {
                        setError('Failed to fetch wallet data');
                      }
                    } catch (err) {
                      console.error('Error fetching wallet data:', err);
                      setError('Network error occurred');
                    } finally {
                      setIsLoading(false);
                    }
                  };
                  fetchWalletData();
                }
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (activeTab === 'crypto' ? cryptoAssets : cashAssets).length > 0 ? (
          (activeTab === 'crypto' ? cryptoAssets : cashAssets).map((item) => (
            <View key={item.id}>
              {renderCryptoItem({ item })}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'crypto' ? 'No crypto tokens found' : 'No cash assets found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'crypto' ? 'Deposit your first crypto to get started' : 'Add cash assets to your portfolio'}
            </Text>
          </View>
        )}
      </View>

      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setShowAlert(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 16,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  backgroundImage: {
    borderRadius: 16
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    padding: 20,
    margin: -20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  eyeButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  balanceChangeContainer: {
    alignItems: 'flex-end',
  },
  balanceChangePositive: {
    fontSize: 16,
    color: '#68d391',
    fontWeight: '600',
  },
  balanceChangeNegative: {
    color: '#F44336',
  },
  balanceChangePercent: {
    fontSize: 14,
    color: '#68d391',
  },
  balanceChangePercentNegative: {
    color: '#F44336',
  },
  lastUpdate: {
    fontSize: 10,
    color: '#888888',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#CCCCCC',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  assetsContainer: {
    paddingBottom: 20,
  },
  cryptoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 12,
    marginBottom: 10,
  },
  cryptoIcon: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cryptoImage: {
    width: 30,
    height: 30,
  },
  cryptoInfo: {
    flex: 1,
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cryptoAmount: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  cryptoValue: {
    alignItems: 'flex-end',
  },
  cryptoValueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cryptoChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  positiveChange: {
    color: '#10B981',
  },
  negativeChange: {
    color: '#EF4444',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    flex: 1,
    marginLeft: 8,
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
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
