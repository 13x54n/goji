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

const mockMarketData = [
  {
    id: '1',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: '$65,432.10',
    change: '+2.45%',
    changeValue: '+$1,567',
    isPositive: true,
    icon: 'bitcoinsign.circle.fill',
    color: '#f7931a',
  },
  {
    id: '2',
    name: 'Ethereum',
    symbol: 'ETH',
    price: '$3,245.67',
    change: '-1.23%',
    changeValue: '-$40.45',
    isPositive: false,
    icon: 'circle.grid.cross.fill',
    color: '#627eea',
  },
  {
    id: '3',
    name: 'Solana',
    symbol: 'SOL',
    price: '$145.89',
    change: '+5.67%',
    changeValue: '+$7.83',
    isPositive: true,
    icon: 'sun.max.fill',
    color: '#9945ff',
  },
  {
    id: '4',
    name: 'USD Coin',
    symbol: 'USDC',
    price: '$1.00',
    change: '0.00%',
    changeValue: '$0.00',
    isPositive: true,
    icon: 'dollarsign.circle.fill',
    color: '#2775ca',
  },
];

const mockQuickActions = [
  { title: 'Buy', icon: 'arrow.up.circle.fill', color: '#00d4aa' },
  { title: 'Sell', icon: 'arrow.down.circle.fill', color: '#ff4757' },
  { title: 'Swap', icon: 'arrow.triangle.2.circlepath', color: '#ff6b35' },
  { title: 'Send', icon: 'paperplane.fill', color: '#3742fa' },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedTab, setSelectedTab] = useState('Market');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.icon }]}>Good morning</Text>
            <Text style={[styles.userName, { color: colors.text }]}>Welcome back!</Text>
          </View>
          <TouchableOpacity style={[styles.profileButton, { backgroundColor: colors.card }]}>
            <IconSymbol name="person.circle.fill" size={32} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Portfolio Summary */}
        <View style={[styles.portfolioCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.portfolioLabel, { color: colors.icon }]}>Total Portfolio</Text>
          <Text style={[styles.portfolioValue, { color: colors.text }]}>$2,249.28</Text>
          <View style={styles.portfolioChange}>
            <Text style={[styles.changeText, { color: colors.positive }]}>+$45.67 (+2.07%)</Text>
            <Text style={[styles.changeTime, { color: colors.icon }]}>24h</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {mockQuickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionButton, { backgroundColor: colors.card }]}
            >
              <IconSymbol name={action.icon} size={32} color={action.color} />
              <Text style={[styles.actionText, { color: colors.text }]}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Market Tabs */}
        <View style={styles.marketTabs}>
          {['Market', 'Watchlist', 'Trending'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.marketTab,
                {
                  backgroundColor: selectedTab === tab ? colors.accent : colors.card,
                },
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text
                style={[
                  styles.marketTabText,
                  {
                    color: selectedTab === tab ? '#fff' : colors.text,
                  },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Market Data */}
        <View style={styles.marketData}>
          {mockMarketData.map((crypto) => (
            <TouchableOpacity
              key={crypto.id}
              style={[styles.cryptoItem, { backgroundColor: colors.card }]}
            >
              <View style={styles.cryptoLeft}>
                <View style={[styles.cryptoIcon, { backgroundColor: colors.secondary }]}>
                  <IconSymbol name={crypto.icon} size={24} color={crypto.color} />
                </View>
                <View style={styles.cryptoInfo}>
                  <Text style={[styles.cryptoName, { color: colors.text }]}>
                    {crypto.name}
                  </Text>
                  <Text style={[styles.cryptoSymbol, { color: colors.icon }]}>
                    {crypto.symbol}
                  </Text>
                </View>
              </View>
              <View style={styles.cryptoRight}>
                <Text style={[styles.cryptoPrice, { color: colors.text }]}>
                  {crypto.price}
                </Text>
                <Text
                  style={[
                    styles.cryptoChange,
                    {
                      color: crypto.isPositive ? colors.positive : colors.negative,
                    },
                  ]}
                >
                  {crypto.change}
                </Text>
                <Text
                  style={[
                    styles.cryptoChangeValue,
                    {
                      color: crypto.isPositive ? colors.positive : colors.negative,
                    },
                  ]}
                >
                  {crypto.changeValue}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* News Section */}
        <View style={styles.newsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Market News</Text>
          <View style={[styles.newsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.newsTitle, { color: colors.text }]}>
              Bitcoin Reaches New All-Time High
            </Text>
            <Text style={[styles.newsExcerpt, { color: colors.icon }]}>
              Bitcoin has surged past $65,000 as institutional adoption continues to grow...
            </Text>
            <Text style={[styles.newsTime, { color: colors.icon }]}>2 hours ago</Text>
          </View>
        </View>
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
  greeting: {
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  portfolioCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  portfolioLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  portfolioValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  portfolioChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  changeTime: {
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  marketTabs: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
  },
  marketTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  marketTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  marketData: {
    marginBottom: 32,
  },
  cryptoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cryptoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cryptoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cryptoInfo: {
    flex: 1,
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  cryptoSymbol: {
    fontSize: 14,
  },
  cryptoRight: {
    alignItems: 'flex-end',
  },
  cryptoPrice: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  cryptoChange: {
    fontSize: 14,
    marginBottom: 2,
  },
  cryptoChangeValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  newsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  newsCard: {
    borderRadius: 12,
    padding: 16,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  newsExcerpt: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  newsTime: {
    fontSize: 12,
  },
});