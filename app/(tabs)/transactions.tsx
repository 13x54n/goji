import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const mockTransactions = [
  {
    id: '1',
    type: 'buy',
    asset: 'Bitcoin',
    symbol: 'BTC',
    amount: '0.0024',
    value: '$156.78',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'completed',
  },
  {
    id: '2',
    type: 'sell',
    asset: 'Ethereum',
    symbol: 'ETH',
    amount: '0.05',
    value: '$114.25',
    timestamp: '2024-01-14T15:45:00Z',
    status: 'completed',
  },
  {
    id: '3',
    type: 'receive',
    asset: 'USD Coin',
    symbol: 'USDC',
    amount: '500.00',
    value: '$500.00',
    timestamp: '2024-01-14T09:20:00Z',
    status: 'completed',
  },
  {
    id: '4',
    type: 'send',
    asset: 'Tether',
    symbol: 'USDT',
    amount: '100.00',
    value: '$100.00',
    timestamp: '2024-01-13T14:15:00Z',
    status: 'pending',
  },
  {
    id: '5',
    type: 'swap',
    asset: 'Bitcoin',
    symbol: 'BTC',
    amount: '0.001',
    value: '$65.32',
    timestamp: '2024-01-12T11:30:00Z',
    status: 'completed',
  },
];

const transactionTypes = ['All', 'Buy', 'Sell', 'Send', 'Receive', 'Swap'];

export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedFilter, setSelectedFilter] = useState('All');

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return { name: 'arrow.down.circle.fill', color: colors.positive };
      case 'sell':
        return { name: 'arrow.up.circle.fill', color: colors.negative };
      case 'receive':
        return { name: 'arrow.down.circle.fill', color: colors.positive };
      case 'send':
        return { name: 'arrow.up.circle.fill', color: colors.accent };
      case 'swap':
        return { name: 'arrow.triangle.2.circlepath', color: colors.icon };
      default:
        return { name: 'circle.fill', color: colors.icon };
    }
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'buy':
        return 'Bought';
      case 'sell':
        return 'Sold';
      case 'receive':
        return 'Received';
      case 'send':
        return 'Sent';
      case 'swap':
        return 'Swapped';
      default:
        return type;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredTransactions = selectedFilter === 'All' 
    ? mockTransactions 
    : mockTransactions.filter(tx => 
        getTransactionTypeText(tx.type).toLowerCase() === selectedFilter.toLowerCase()
      );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Transactions</Text>
          <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.card }]}>
            <IconSymbol name="slider.horizontal.3" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {transactionTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterTab,
                {
                  backgroundColor: selectedFilter === type ? colors.accent : colors.card,
                },
              ]}
              onPress={() => setSelectedFilter(type)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: selectedFilter === type ? '#fff' : colors.text,
                  },
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Transactions List */}
        <View style={styles.transactionsList}>
          {filteredTransactions.map((transaction) => {
            const icon = getTransactionIcon(transaction.type);
            const typeText = getTransactionTypeText(transaction.type);
            
            return (
              <TouchableOpacity
                key={transaction.id}
                style={[styles.transactionItem, { backgroundColor: colors.card }]}
              >
                <View style={styles.transactionLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.secondary }]}>
                    <IconSymbol name={icon.name} size={20} color={icon.color} />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionType, { color: colors.text }]}>
                      {typeText} {transaction.asset}
                    </Text>
                    <Text style={[styles.transactionTime, { color: colors.icon }]}>
                      {formatTimestamp(transaction.timestamp)}
                    </Text>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[styles.transactionValue, { color: colors.text }]}>
                    {transaction.value}
                  </Text>
                  <Text style={[styles.transactionAmount, { color: colors.icon }]}>
                    {transaction.amount} {transaction.symbol}
                  </Text>
                  <View style={styles.statusContainer}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            transaction.status === 'completed' ? colors.positive : colors.accent,
                        },
                      ]}
                    />
                    <Text style={[styles.statusText, { color: colors.icon }]}>
                      {transaction.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Load More Button */}
        <TouchableOpacity style={[styles.loadMoreButton, { backgroundColor: colors.card }]}>
          <Text style={[styles.loadMoreText, { color: colors.text }]}>Load More</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    marginBottom: 24,
  },
  filterContent: {
    paddingHorizontal: 4,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionsList: {
    marginBottom: 24,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  transactionLeft: {
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
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 14,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionAmount: {
    fontSize: 14,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  loadMoreButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
