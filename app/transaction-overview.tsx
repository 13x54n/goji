import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getExplorerUrl } from '../lib/blockchainUtils';
import { useTransactions } from '../lib/contexts/TransactionContext';
import { formatDate } from '../lib/dateUtils';

interface TransactionDetails {
  id: string;
  state: string;
  txHash: string;
  amount: string;
  destinationAddress: string;
  tokenId: string;
  walletId: string;
  fee: {
    type: string;
    config: {
      feeLevel: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  blockchain: string;
  walletAddress: string;
  accountType: string;
  tokenDetails?: {
    id: string;
    name: string;
    symbol: string;
    decimals: number;
    standard: string;
    isNative: boolean;
    contractAddress?: string;
    imageUrl?: string;
    blockchain?: string;
  } | null;
}

export default function TransactionOverviewScreen() {
  const params = useLocalSearchParams();
  const { transactionId, walletId } = params;
  
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Use cached transaction data
  const { transactions, isLoading, error, refreshTransactions, getTransactionById } = useTransactions();

  useEffect(() => {
    if (transactions.length > 0 && transactionId) {
      const foundTransaction = getTransactionById(String(transactionId));
      if (foundTransaction) {
        setTransaction(foundTransaction);
      }
    }
  }, [transactions, transactionId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshTransactions();
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'COMPLETE':
        return '#10B981';
      case 'PENDING':
        return '#F59E0B';
      case 'FAILED':
        return '#EF4444';
      default:
        return '#CCCCCC';
    }
  };

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'COMPLETE':
        return 'checkmark-circle';
      case 'PENDING':
        return 'time';
      case 'FAILED':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };


  const copyToClipboard = (text: string) => {
    // In a real app, you'd use Clipboard from expo-clipboard
    console.log('Copy to clipboard:', text);
  };

  const openExplorer = (txHash: string, blockchain: string) => {
    const explorerUrl = getExplorerUrl(txHash, blockchain);
    // In a real app, you'd use Linking.openURL
    console.log('Open explorer:', explorerUrl);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0984e3" />
        <Text style={styles.loadingText}>Loading transaction details...</Text>
      </View>
    );
  }

  if (error || !transaction) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.errorContent}>
          <Ionicons name="warning-outline" size={48} color="#F44336" />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error || 'Transaction not found'}</Text>
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
        <Text style={styles.headerTitle}>Transaction Details</Text>
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
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name={getStatusIcon(transaction.state)} 
              size={32} 
              color={getStatusColor(transaction.state)} 
            />
            <Text style={[
              styles.statusText,
              { color: getStatusColor(transaction.state) }
            ]}>
              {transaction.state}
            </Text>
          </View>
          <Text style={styles.amountText}>
            {transaction.amount} {transaction.tokenDetails?.symbol || 'TOKEN'}
          </Text>
          <Text style={styles.dateText}>{formatDate(transaction.createdAt)}</Text>
        </View>

        {/* Transaction Hash */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Hash</Text>
          <View style={styles.hashContainer}>
            <Text style={styles.hashText} numberOfLines={1} ellipsizeMode="middle">
              {transaction.txHash}
            </Text>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={() => copyToClipboard(transaction.txHash)}
            >
              <Ionicons name="copy" size={16} color="#0984e3" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.explorerButton}
              onPress={() => openExplorer(transaction.txHash, transaction.blockchain)}
            >
              <Ionicons name="open-outline" size={16} color="#0984e3" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>{transaction.amount}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Destination Address</Text>
            <View style={styles.addressContainer}>
              <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                {transaction.destinationAddress}
              </Text>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={() => copyToClipboard(transaction.destinationAddress)}
              >
                <Ionicons name="copy" size={16} color="#0984e3" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fee Level</Text>
            <Text style={styles.detailValue}>{transaction.fee.config.feeLevel}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Blockchain</Text>
            <Text style={styles.detailValue}>{transaction.blockchain}</Text>
          </View>
        </View>

        {/* Wallet Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet Information</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Wallet Address</Text>
            <View style={styles.addressContainer}>
              <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                {transaction.walletAddress}
              </Text>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={() => copyToClipboard(transaction.walletAddress)}
              >
                <Ionicons name="copy" size={16} color="#0984e3" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account Type</Text>
            <Text style={styles.detailValue}>{transaction.accountType}</Text>
          </View>
        </View>

        {/* Timestamps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timestamps</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created At</Text>
            <Text style={styles.detailValue}>{formatDate(transaction.createdAt)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Updated At</Text>
            <Text style={styles.detailValue}>{formatDate(transaction.updatedAt)}</Text>
          </View>
        </View>

        {/* Token Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Token Information</Text>
          
          {transaction.tokenDetails ? (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Token Name</Text>
                <Text style={styles.detailValue}>{transaction.tokenDetails.name}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Symbol</Text>
                <Text style={styles.detailValue}>{transaction.tokenDetails.symbol}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Standard</Text>
                <Text style={styles.detailValue}>{transaction.tokenDetails.standard}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Decimals</Text>
                <Text style={styles.detailValue}>{transaction.tokenDetails.decimals}</Text>
              </View>
              
              {transaction.tokenDetails.contractAddress && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Contract Address</Text>
                  <View style={styles.addressContainer}>
                    <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                      {transaction.tokenDetails.contractAddress}
                    </Text>
                    <TouchableOpacity 
                      style={styles.copyButton}
                      onPress={() => copyToClipboard(transaction.tokenDetails?.contractAddress || '')}
                    >
                      <Ionicons name="copy" size={16} color="#0984e3" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          ) : (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Token ID</Text>
              <View style={styles.addressContainer}>
                <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                  {transaction.tokenId}
                </Text>
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(transaction.tokenId)}
                >
                  <Ionicons name="copy" size={16} color="#0984e3" />
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  statusCard: {
    backgroundColor: '#1a1a1a',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
  amountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  section: {
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#ffffff',
    flex: 2,
    textAlign: 'right',
  },
  hashContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  hashText: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
    fontFamily: 'monospace',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
  },
  addressText: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 4,
    marginLeft: 8,
  },
  explorerButton: {
    padding: 4,
    marginLeft: 4,
  },
});
