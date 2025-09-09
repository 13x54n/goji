import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAlert } from '../../lib/alertUtils';
import { useWallet } from '../../lib/contexts/WalletContext';
import { cleanTokenName, cleanTokenSymbol, getBlockchainInfo, getTokenImageUrl } from '../../lib/tokenUtils';
import { PriceUpdate, websocketService } from '../../lib/websocketService';
import AnimatedBalance from './AnimatedBalance';
import CustomAlert from './CustomAlert';
interface WalletProps {
  session: any;
  isActive?: boolean;
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
  blockchain: string;
}

export default function Wallet({ session, isActive = true }: WalletProps) {
  const router = useRouter();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<'crypto' | 'cash'>('crypto');
  const { showAlert, alertConfig, showCustomAlert, hideAlert } = useAlert();
  
  // Use cached wallet data
  const { wallets, isLoading, error, refreshWalletData } = useWallet();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [tokenBalances, setTokenBalances] = useState<any[]>([]);

  // Calculate real-time total balance from API data
  const [totalBalance, setTotalBalance] = useState('$0.00');
  const [totalBalanceChange, setTotalBalanceChange] = useState('+0.00');
  const [totalBalancePercent, setTotalBalancePercent] = useState('+0.00%');

  // Load balance visibility state from storage on mount
  useEffect(() => {
    const loadBalanceVisibility = async () => {
      try {
        const stored = await AsyncStorage.getItem('balance_visibility');
        if (stored !== null) {
          setIsBalanceVisible(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading balance visibility:', error);
      }
    };

    loadBalanceVisibility();
  }, []);

  // Save balance visibility state to storage when it changes
  useEffect(() => {
    const saveBalanceVisibility = async () => {
      try {
        await AsyncStorage.setItem('balance_visibility', JSON.stringify(isBalanceVisible));
      } catch (error) {
        console.error('Error saving balance visibility:', error);
      }
    };

    saveBalanceVisibility();
  }, [isBalanceVisible]);

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(prev => !prev);
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
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([]);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  // Real-time price data
  const [priceData, setPriceData] = useState<Map<string, any>>(new Map());
  const [isPriceLoading, setIsPriceLoading] = useState(false);

  // Fetch real-time prices using our price service
  const fetchTokenPrices = async (tokens: string[]) => {
    try {
      setIsPriceLoading(true);
      const pricePromises = tokens.map(async (token) => {
        try {
          const response = await fetch(`https://api.coinbase.com/v2/prices/${token}-USD/spot`);
          if (!response.ok) {
            console.warn(`Failed to fetch price for ${token}: ${response.status}`);
            return { token, price: null };
          }
          const data = await response.json();
          return { 
            token, 
            price: parseFloat(data.data.amount),
            currency: data.data.currency,
            base: data.data.base
          };
        } catch (error) {
          console.warn(`Error fetching price for ${token}:`, error);
          return { token, price: null };
        }
      });

      const results = await Promise.all(pricePromises);
      
      // Convert to the expected format
      const priceData: { [key: string]: { last: number; percentage: number } } = {};
      results.forEach(({ token, price }) => {
        if (price !== null) {
          priceData[`${token}/USD`] = {
            last: price,
            percentage: 0 // Coinbase spot API doesn't provide 24h change
          };
        }
      });
      return priceData;
    } catch (error) {
      console.error('Error fetching token prices:', error);
      return null;
    } finally {
      setIsPriceLoading(false);
    }
  };

  // Process token balances to crypto assets
  const processTokenBalances = async (balances: any[]) => {
    try {
      // Extract unique token symbols for price fetching, excluding stablecoins
      const uniqueTokens = [...new Set(balances.map(balance => cleanTokenSymbol(balance.token.symbol)))];
      
      // Include all tokens for price fetching, including stablecoins
      const supportedTokens = ['BTC', 'ETH', 'SOL', 'AVAX', 'MATIC', 'ADA', 'DOT', 'LINK', 'UNI', 'ATOM', 'USDC', 'USDT', 'DAI', 'BUSD', 'TUSD'];
      const tokensToFetch = uniqueTokens.filter(token => 
        supportedTokens.includes(token)
      );
      
      // Fetch real-time prices for all supported tokens including stablecoins
      const realPriceData = tokensToFetch.length > 0 ? await fetchTokenPrices(tokensToFetch) : null;
      
      const processedAssets = await Promise.all(
        balances.map(async (balance, index) => {
          const token = balance.token;
          const amount = parseFloat(balance.amount);
          const cleanSymbol = cleanTokenSymbol(token.symbol);
          
          // Get real-time price data from WebSocket updates or API response
          let pricePerToken = 1;
          let changePercent = '+0.00%';
          let isPositive = true;
          
          // Check if it's a stablecoin
          const isStablecoin = ['USDC', 'USDT', 'EURC', 'DAI', 'BUSD', 'TUSD'].includes(cleanSymbol);
          
          // First check WebSocket price data
          const wsPriceData = priceData.get(cleanSymbol);
          if (wsPriceData) {
            pricePerToken = wsPriceData.price || 1;
            const percentage = wsPriceData.changePercent24h || 0;
            changePercent = `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
            isPositive = percentage >= 0;
          } else if (realPriceData && realPriceData[`${cleanSymbol}/USD`]) {
            // Fallback to API price data
            const priceInfo = realPriceData[`${cleanSymbol}/USD`];
            pricePerToken = priceInfo.last || 1;
            const percentage = priceInfo.percentage || 0;
            changePercent = `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
            isPositive = percentage >= 0;
          } else {
            // Fallback prices for tokens without real-time data
            if (isStablecoin) {
              // Stablecoin fallbacks
              if (cleanSymbol === 'EURC') {
                pricePerToken = 1.1; // Approximate EUR to USD rate
              } else {
                pricePerToken = 1; // USD stablecoins
              }
              changePercent = '+0.00%';
              isPositive = true;
            } else {
              // Regular token fallbacks
              if (cleanSymbol === 'ETH') pricePerToken = 2500;
              else if (cleanSymbol === 'POL') pricePerToken = 0.5;
              else if (cleanSymbol === 'SOL') pricePerToken = 100;
              else if (cleanSymbol === 'AVAX') pricePerToken = 30;
              else pricePerToken = 1; // Default fallback
            }
          }
          
          const usdValue = amount * pricePerToken;

          // Generate reliable image URL
          const imageUrl = getTokenImageUrl(token.symbol);
          
          return {
            id: token.id || index.toString(),
            name: cleanTokenName(token.name),
            amount: `${balance.amount} ${cleanSymbol}`,
            value: `$${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            change: changePercent,
            changePercent: changePercent,
            isPositive: isPositive,
            symbol: cleanSymbol,
            imageUrl: imageUrl,
            blockchain: balance.blockchain
          };
        })
      );
      
      setCryptoAssets(processedAssets);
    } catch (error) {
      console.error('Error processing token balances:', error);
      setCryptoAssets([]);
    }
  };

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
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/320px-Flag_of_the_United_States.svg.png',
      blockchain: 'FIAT'
    }
  ];

  const renderCryptoItem = ({ item }: { item: CryptoAsset }) => {
    const hasImageError = imageErrors.has(item.id);
    const blockchainInfo = getBlockchainInfo(item.blockchain);
    
    const handleTokenPress = () => {
      // Find the token in the tokenBalances to get the tokenId and walletId
      const tokenBalance = tokenBalances.find(tb => 
        cleanTokenSymbol(tb.token.symbol) === item.symbol && tb.blockchain === item.blockchain
      );
      
      if (tokenBalance) {
        router.push({
          pathname: '/token-info',
          params: {
            tokenId: tokenBalance.token.id,
            walletId: tokenBalance.walletId
          }
        });
      }
    };
    
    return (
      <TouchableOpacity style={styles.cryptoItem} onPress={handleTokenPress}>
        <View style={styles.cryptoIconContainer}>
          <View style={styles.cryptoIcon}>
            {hasImageError ? (
              <View style={styles.cryptoImageFallback}>
                <Text style={styles.cryptoImageFallbackText}>
                  {item.symbol.charAt(0)}
                </Text>
              </View>
            ) : (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.cryptoImage}
                resizeMode="contain"
                onError={() => {
                  setImageErrors(prev => new Set([...prev, item.id]));
                }}
              />
            )}
          </View>
          <View style={styles.blockchainIcon}>
            <Image source={{ uri: blockchainInfo.icon }} style={styles.blockchainIconImage} />
          </View>
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
  };

  // Process wallet data when it changes
  useEffect(() => {
    console.log('Wallet component: wallets changed:', wallets.length, 'wallets');
    console.log('Wallet component: isLoading:', isLoading, 'error:', error);
    
    if (wallets.length > 0) {
      console.log('Wallet component: Processing wallet data');
      // Select first wallet by default
      setSelectedWallet(wallets[0]);
      
      // Flatten all token balances from all wallets
      const allTokens = wallets.flatMap((wallet: any) => 
        wallet.tokenBalances.map((tokenBalance: any) => ({
          ...tokenBalance,
          walletId: wallet.walletId,
          walletAddress: wallet.walletAddress,
          blockchain: wallet.blockchain,
          accountType: wallet.accountType
        }))
      );
      
      console.log('Wallet component: Processed tokens:', allTokens.length, 'tokens');
      setTokenBalances(allTokens);
      
      // Process token balances to crypto assets
      processTokenBalances(allTokens);
    } else {
      console.log('Wallet component: No wallets available');
    }
  }, [wallets, isLoading, error]);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshWalletData();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate total balance when cryptoAssets change
  useEffect(() => {
    if (cryptoAssets.length > 0) {
      const totalValue = cryptoAssets.reduce((sum, asset) => {
        const value = parseFloat(asset.value.replace('$', '').replace(',', ''));
        return sum + value;
      }, 0);
      
      // Calculate weighted average change percentage
      let totalChange = 0;
      let totalWeight = 0;
      
      cryptoAssets.forEach(asset => {
        const value = parseFloat(asset.value.replace('$', '').replace(',', ''));
        const changePercent = parseFloat(asset.changePercent.replace('%', '').replace('+', ''));
        if (!isNaN(changePercent)) {
          totalChange += changePercent * value;
          totalWeight += value;
        }
      });
      
      const avgChangePercent = totalWeight > 0 ? totalChange / totalWeight : 0;
      const changeAmount = (totalValue * avgChangePercent) / 100;
      
      setTotalBalance(`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      setTotalBalanceChange(`${changeAmount >= 0 ? '+' : ''}$${changeAmount.toFixed(2)}`);
      setTotalBalancePercent(`${avgChangePercent >= 0 ? '+' : ''}${avgChangePercent.toFixed(2)}%`);
    }
  }, [cryptoAssets]);

  // Listen for real-time price updates
  useEffect(() => {
    const handlePriceUpdate = (priceUpdate: PriceUpdate) => {
      setPriceData(prev => {
        const newPriceData = new Map(prev);
        newPriceData.set(priceUpdate.symbol, priceUpdate);
        return newPriceData;
      });
    };

    websocketService.on('price-updated', handlePriceUpdate);

    return () => {
      websocketService.off('price-updated', handlePriceUpdate);
    };
  }, []);

  // Listen for token changes
  useEffect(() => {
    const handleTokenChange = (tokenChange: any) => {
        // Refresh wallet data when new tokens are detected
        if (tokenChange.newTokens && tokenChange.newTokens.length > 0) {
          refreshWalletData();
        }
    };

    websocketService.on('tokens-changed', handleTokenChange);

    return () => {
      websocketService.off('tokens-changed', handleTokenChange);
    };
  }, []);

  // Listen for real-time price updates
  useEffect(() => {
    const handlePriceUpdate = (priceUpdate: PriceUpdate) => {
      console.log('Wallet: Received price update:', priceUpdate);
      setPriceData(prev => {
        const newPriceData = new Map(prev);
        newPriceData.set(priceUpdate.symbol, priceUpdate);
        return newPriceData;
      });
    };

    websocketService.on('price-updated', handlePriceUpdate);

    return () => {
      websocketService.off('price-updated', handlePriceUpdate);
    };
  }, []);

  // Reprocess crypto assets when price data changes
  useEffect(() => {
    if (tokenBalances.length > 0 && priceData.size > 0) {
      processTokenBalances(tokenBalances);
    }
  }, [priceData]);

  // Update total balance when crypto assets change (due to price updates)
  useEffect(() => {
    if (cryptoAssets.length > 0) {
      const total = cryptoAssets.reduce((sum, asset) => {
        const value = parseFloat(asset.value.replace('$', '').replace(',', ''));
        return sum + value;
      }, 0);
      
      setTotalBalance(`$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      
      // Calculate change (simplified - could be enhanced with historical data)
      const change = total * 0.02; // Mock 2% change
      setTotalBalanceChange(`$${change.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      setTotalBalancePercent('+2.00%');
    }
  }, [cryptoAssets]);


  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor="#FFFFFF"
          title="Pull to refresh"
          titleColor="#FFFFFF"
        />
      }
    >
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
              value={isBalanceVisible ? isLoading ? '••••••' : totalBalance : '••••••'}
              style={styles.balanceValue}
              animationDuration={300}
            />
            {isBalanceVisible && (
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
              </View>
            )}
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
                  refreshWalletData();
                }
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (activeTab === 'crypto' ? cryptoAssets : cashAssets).length > 0 ? (
          isBalanceVisible ? (
            (() => {
              return (activeTab === 'crypto' ? cryptoAssets : cashAssets).map((item, i) => (
                <View key={i+Date.now()}>
                  {renderCryptoItem({ item })}
                </View>
              ));
            })()
          ) : (
            <View style={styles.hiddenContainer}>
              <Ionicons name="eye-off-outline" size={48} color="#666" />
              <Text style={styles.hiddenText}>Balance hidden</Text>
              <Text style={styles.hiddenSubtext}>Tap the eye icon to reveal your tokens</Text>
            </View>
          )
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
        onClose={hideAlert}
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
  cryptoIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  cryptoIcon: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockchainIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockchainIconImage: {
    width: 16,
    height: 16,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockchainIconText: {
    fontSize: 8,
  },
  cryptoImage: {
    width: 30,
    height: 30,
  },
  cryptoImageFallback: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cryptoImageFallbackText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
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
  hiddenContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  hiddenText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  hiddenSubtext: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
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
