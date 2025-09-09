import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTransactions } from '../../lib/contexts/TransactionContext';
import { useTokenPrice } from '../../lib/hooks/useTokenPrice';
import { getTokenSymbolFromId } from '../../lib/tokenUtils';
import TransactionStatus from './TransactionStatus';
// import { StatusBar } from 'expo-status-bar';

export interface RealTimeTransactionsProps {
  session?: any;
  showHeader?: boolean;
  maxTransactions?: number;
}

export default function RealTimeTransactions({
  session,
  showHeader = true,
  maxTransactions = 10
}: RealTimeTransactionsProps) {
  // Use cached transaction data
  const { transactions, isLoading: isTransactionLoading, error: transactionError, refreshTransactions } = useTransactions();
  const [isRefreshing, setIsRefreshing] = useState(false);


  const cancelTransaction = async (transactionId: string) => {
    // Mock cancel function
    console.log('Cancelling transaction:', transactionId);
  };

  const accelerateTransaction = async (transactionId: string) => {
    // Mock accelerate function
    console.log('Accelerating transaction:', transactionId);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshTransactions();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCancelTransaction = async (transactionId: string) => {
    try {
      await cancelTransaction(transactionId);
    } catch (error) {
      console.error('Error cancelling transaction:', error);
    }
  };

  const handleAccelerateTransaction = async (transactionId: string) => {
    try {
      await accelerateTransaction(transactionId);
    } catch (error) {
      console.error('Error accelerating transaction:', error);
    }
  };

  const handleViewTransactionDetails = (transactionId: string) => {
    // Find the transaction to get walletId
    const transaction = transactions.find(tx => tx.id === transactionId);
    if (transaction) {
      router.push({
        pathname: '/transaction-overview',
        params: {
          transactionId: transactionId,
          walletId: transaction.walletId
        }
      });
    }
  };


  // Format transaction data for display
  const formatTransactionForDisplay = (transaction: any) => {
    // Use enriched token details if available, otherwise fallback to token ID lookup
    const tokenSymbol = transaction.tokenDetails?.symbol || 
                       getTokenSymbolFromId(transaction.tokenId, transaction.blockchain);
    
    return {
      id: transaction.id,
      state: transaction.state,
      amount: transaction.amount,
      destinationAddress: transaction.destinationAddress,
      note: `Transaction on ${transaction.blockchain}`,
      timestamp: transaction.createdAt,
      tokenSymbol,
      tokenDetails: transaction.tokenDetails,
      txHash: transaction.txHash,
      fee: transaction.fee,
      walletId: transaction.walletId,
      blockchain: transaction.blockchain
    };
  };

  // Filter and limit transactions
  const displayTransactions = transactions
    .map(formatTransactionForDisplay)
    .slice(0, maxTransactions);

  // Debug logging
  console.log('RealTimeTransactions: transactions:', transactions.length, 'isLoading:', isTransactionLoading, 'error:', transactionError);
  console.log('RealTimeTransactions: displayTransactions:', displayTransactions.length);

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={handleRefresh} disabled={isTransactionLoading}>
            <Ionicons 
              name="refresh" 
              size={20} 
              color={isTransactionLoading ? "#666" : "#0984e3"} 
            />
          </TouchableOpacity>
        </View>
      )}

      {transactionError && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={20} color="#F44336" />
          <Text style={styles.errorText}>{transactionError}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#0984e3"
            colors={['#0984e3']}
          />
        }
      >
        {displayTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#666" />
            <Text style={styles.emptyTitle}>No Transactions</Text>
            <Text style={styles.emptySubtitle}>
              Your recent transactions will appear here
            </Text>
          </View>
        ) : (
          displayTransactions.map((transaction) => {
            // Get price data for this token
            const { price } = useTokenPrice(transaction.tokenSymbol);
            
            return (
              <TransactionStatus
                key={transaction.id}
                transactionId={transaction.id}
                status={transaction.state}
                amount={transaction.amount}
                tokenSymbol={transaction.tokenSymbol}
                destinationAddress={transaction.destinationAddress}
                note={transaction.note}
                price={price?.price}
                priceChange={price?.changePercent24h}
                onCancel={() => handleCancelTransaction(transaction.id)}
                onAccelerate={() => handleAccelerateTransaction(transaction.id)}
                onViewDetails={() => handleViewTransactionDetails(transaction.id)}
              />
            );
          })
        )}
      </ScrollView>

      {/* Real-time update indicator */}
      {isTransactionLoading && (
        <View style={styles.updateIndicator}>
          <View style={styles.updateDot} />
          <Text style={styles.updateText}>Loading transactions...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginLeft: 8,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
  },
  updateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(9, 132, 227, 0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(9, 132, 227, 0.3)',
  },
  updateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0984e3',
    marginRight: 8,
  },
  updateText: {
    fontSize: 12,
    color: '#0984e3',
    fontWeight: '500',
  },
});
