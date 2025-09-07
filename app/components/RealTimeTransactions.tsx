import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRealTimeWallet } from '../../lib/useRealTimeWallet';
import TransactionStatus from './TransactionStatus';

export interface RealTimeTransactionsProps {
  walletId?: string;
  showHeader?: boolean;
  maxTransactions?: number;
}

export default function RealTimeTransactions({
  walletId,
  showHeader = true,
  maxTransactions = 10
}: RealTimeTransactionsProps) {
  const {
    transactions,
    transactionUpdate,
    isTransactionLoading,
    transactionError,
    refreshTransactions,
    cancelTransaction,
    accelerateTransaction
  } = useRealTimeWallet({
    walletId: walletId || 'demo-wallet-id',
    autoRefresh: true,
    refreshInterval: 30000
  });

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshTransactions();
    } finally {
      setRefreshing(false);
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
    // TODO: Navigate to transaction details page
    console.log('View transaction details:', transactionId);
  };

  // Filter and limit transactions
  const displayTransactions = transactions.slice(0, maxTransactions);

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
            refreshing={refreshing}
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
          displayTransactions.map((transaction) => (
            <TransactionStatus
              key={transaction.id}
              transactionId={transaction.id}
              status={transaction.state}
              amount={transaction.amount}
              tokenSymbol="ETH" // This should come from token data
              destinationAddress={transaction.destinationAddress}
              note={transaction.note}
              onCancel={() => handleCancelTransaction(transaction.id)}
              onAccelerate={() => handleAccelerateTransaction(transaction.id)}
              onViewDetails={() => handleViewTransactionDetails(transaction.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Real-time update indicator */}
      {transactionUpdate && (
        <View style={styles.updateIndicator}>
          <View style={styles.updateDot} />
          <Text style={styles.updateText}>Live updates active</Text>
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
