import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useWallet } from '../lib/contexts/WalletContext';
import { useTokenPrice } from '../lib/hooks/useTokenPrice';
import { getTokenImageUrl } from '../lib/tokenUtils';

interface TokenInfo {
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
  walletId: string;
  walletAddress: string;
  price?: number;
  change24h?: number;
  changePercent24h?: number;
}

export default function TokenInfoScreen() {
  const params = useLocalSearchParams();
  const { tokenId, walletId } = params;

  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Use cached wallet data
  const { wallets, isLoading, error, refreshWalletData, getTokenByWalletAndTokenId } = useWallet();
  
  // Get real-time price data
  const { price: tokenPrice, isLoading: isPriceLoading, error: priceError, refreshPrice } = useTokenPrice(tokenInfo?.symbol || '');

  useEffect(() => {
    if (wallets.length > 0 && tokenId && walletId) {
      const token = getTokenByWalletAndTokenId(String(walletId), String(tokenId));
      if (token) {
        const wallet = wallets.find(w => w.walletId === walletId || w.walletId === walletId);
        if (wallet) {
          setTokenInfo({
            id: token.token.id,
            name: token.token.name,
            symbol: token.token.symbol,
            amount: token.amount,
            value: '0', // Will be calculated
            change: '+0.00%',
            changePercent: '+0.00%',
            isPositive: true,
            imageUrl: getTokenImageUrl(token.token.symbol),
            blockchain: wallet.blockchain,
            walletId: wallet.walletId,
            walletAddress: wallet.walletAddress,
            price: tokenPrice?.price || 0,
            change24h: tokenPrice?.change24h || 0,
            changePercent24h: tokenPrice?.changePercent24h || 0
          });
        }
      }
    }
  }, [wallets, tokenId, walletId]);

  // Update token info when price data changes
  useEffect(() => {
    if (tokenInfo && tokenPrice) {
      setTokenInfo(prev => prev ? {
        ...prev,
        price: tokenPrice.price,
        change24h: tokenPrice.change24h,
        changePercent24h: tokenPrice.changePercent24h,
        value: (parseFloat(prev.amount) * tokenPrice.price).toFixed(2),
        change: tokenPrice.change24h >= 0 ? `+$${tokenPrice.change24h.toFixed(2)}` : `-$${Math.abs(tokenPrice.change24h).toFixed(2)}`,
        changePercent: tokenPrice.changePercent24h >= 0 ? `+${tokenPrice.changePercent24h.toFixed(2)}%` : `${tokenPrice.changePercent24h.toFixed(2)}%`,
        isPositive: tokenPrice.changePercent24h >= 0
      } : null);
    }
  }, [tokenPrice]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshWalletData();
      refreshPrice(); // Also refresh price data
    } finally {
      setRefreshing(false);
    }
  };

  const handleSend = () => {
    router.push({
      pathname: '/send-token',
      params: {
        tokenId: tokenId,
        walletId: walletId,
        tokenSymbol: tokenInfo?.symbol
      }
    });
  };

  const handleReceive = () => {
    router.push({
      pathname: '/receive-qr',
      params: {
        blockchain: tokenInfo?.blockchain,
        tokenSymbol: tokenInfo?.symbol
      }
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0984e3" />
        <Text style={styles.loadingText}>Loading token information...</Text>
      </View>
    );
  }

  if (error || !tokenInfo) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Token Info</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.errorContent}>
          <Ionicons name="warning-outline" size={48} color="#F44336" />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error || 'Token not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.tokenHeader}>
          <View style={styles.tokenIconContainer}>
            <Image source={{ uri: tokenInfo.imageUrl }} style={styles.tokenIcon} />
          </View>
          <View style={styles.tokenInfo}>
            <Text style={styles.tokenSymbol}>{tokenInfo.symbol}</Text>
            <Text style={styles.tokenBlockchain}>{tokenInfo.blockchain}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#0984e3"
          />
        }
      >
        {/* Token Header */}


        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your Balance</Text>
          <Text style={styles.balanceAmount}>{tokenInfo.amount} {tokenInfo.symbol}</Text>
          <Text style={styles.balanceValue}>
            {isPriceLoading ? 'Loading...' : `$${tokenInfo.value}`}
          </Text>
          <View style={styles.balanceChange}>
            {isPriceLoading ? (
              <ActivityIndicator size="small" color="#0984e3" />
            ) : (
              <Text style={[
                styles.changeText,
                tokenInfo.isPositive ? styles.positiveChange : styles.negativeChange
              ]}>
                {tokenInfo.changePercent} (24h)
              </Text>
            )}
          </View>
          {tokenPrice && (
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>Current Price</Text>
              <Text style={styles.priceValue}>${tokenPrice.price.toFixed(2)}</Text>
              <Text style={[
                styles.priceChange,
                tokenPrice.changePercent24h >= 0 ? styles.positiveChange : styles.negativeChange
              ]}>
                {tokenPrice.change24h >= 0 ? '+' : ''}${tokenPrice.change24h.toFixed(2)} ({tokenPrice.changePercent24h >= 0 ? '+' : ''}{tokenPrice.changePercent24h.toFixed(2)}%)
              </Text>
            </View>
          )}
          {priceError && (
            <Text style={styles.errorText}>Price data unavailable</Text>
          )}
        </View>

        {/* Wallet Info */}
        <View style={styles.walletInfo}>
          <Text style={styles.sectionTitle}>Wallet Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Wallet Address</Text>
            <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
              {tokenInfo.walletAddress}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Blockchain</Text>
            <Text style={styles.infoValue}>{tokenInfo.blockchain}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSend}>
            <Ionicons name="arrow-up" size={24} color="#ffffff" />
            <Text style={styles.actionButtonText}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleReceive}>
            <Ionicons name="arrow-down" size={24} color="#ffffff" />
            <Text style={styles.actionButtonText}>Receive</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerRight: {
    width: 24,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#0984e3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenIconContainer: {
    marginRight: 16,
  },
  tokenIcon: {
    width: 30,
    height: 30,
    borderRadius: 32,
  },
  tokenInfo: {
    // flex: 1,
  },
  tokenName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  tokenSymbol: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  tokenBlockchain: {
    fontSize: 12,
    color: '#666666',
  },
  balanceCard: {
    backgroundColor: '#1a1a1a',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 18,
    color: '#CCCCCC',
    marginBottom: 12,
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  positiveChange: {
    color: '#10B981',
  },
  negativeChange: {
    color: '#EF4444',
  },
  priceInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  priceChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  walletInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#ffffff',
    flex: 2,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#0984e3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  additionalInfo: {
    padding: 16,
  },
});
