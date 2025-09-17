import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const mockWallets = [
  {
    id: '1',
    name: 'Bitcoin',
    symbol: 'BTC',
    balance: '0.0024',
    value: '$156.78',
    change: '+2.4%',
    isPositive: true,
    icon: 'bitcoinsign.circle.fill',
  },
  {
    id: '2',
    name: 'Ethereum',
    symbol: 'ETH',
    balance: '0.15',
    value: '$342.50',
    change: '-1.2%',
    isPositive: false,
    icon: 'circle.grid.cross.fill',
  },
  {
    id: '3',
    name: 'USD Coin',
    symbol: 'USDC',
    balance: '1250.00',
    value: '$1,250.00',
    change: '0.0%',
    isPositive: true,
    icon: 'dollarsign.circle.fill',
  },
  {
    id: '4',
    name: 'Tether',
    symbol: 'USDT',
    balance: '500.00',
    value: '$500.00',
    change: '0.0%',
    isPositive: true,
    icon: 'dollarsign.circle.fill',
  },
];

export default function WalletScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const totalValue = mockWallets.reduce((sum, wallet) => {
    const value = parseFloat(wallet.value.replace(/[$,]/g, ''));
    return sum + value;
  }, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Wallet</Text>
          <TouchableOpacity style={[styles.settingsButton, { backgroundColor: colors.card }]}>
            <IconSymbol name="gearshape.fill" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Total Balance */}
        <View style={[styles.totalBalanceCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.totalLabel, { color: colors.icon }]}>Total Portfolio Value</Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={[styles.totalChange, { color: colors.positive }]}>+5.2% (24h)</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]}>
            <IconSymbol name="arrow.up.circle.fill" size={32} color={colors.positive} />
            <Text style={[styles.actionText, { color: colors.text }]}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]}>
            <IconSymbol name="arrow.down.circle.fill" size={32} color={colors.accent} />
            <Text style={[styles.actionText, { color: colors.text }]}>Receive</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]}>
            <IconSymbol name="arrow.triangle.2.circlepath" size={32} color={colors.icon} />
            <Text style={[styles.actionText, { color: colors.text }]}>Swap</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]}>
            <IconSymbol name="chart.line.uptrend.xyaxis" size={32} color={colors.accent} />
            <Text style={[styles.actionText, { color: colors.text }]}>Trade</Text>
          </TouchableOpacity>
        </View>

        {/* Assets List */}
        <View style={styles.assetsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Assets</Text>
          {mockWallets.map((wallet) => (
            <TouchableOpacity
              key={wallet.id}
              style={[styles.walletItem, { backgroundColor: colors.card }]}
            >
              <View style={styles.walletLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.secondary }]}>
                  <IconSymbol name={wallet.icon} size={24} color={colors.accent} />
                </View>
                <View style={styles.walletInfo}>
                  <Text style={[styles.walletName, { color: colors.text }]}>{wallet.name}</Text>
                  <Text style={[styles.walletSymbol, { color: colors.icon }]}>{wallet.symbol}</Text>
                </View>
              </View>
              <View style={styles.walletRight}>
                <Text style={[styles.walletValue, { color: colors.text }]}>{wallet.value}</Text>
                <Text style={[styles.walletBalance, { color: colors.icon }]}>
                  {wallet.balance} {wallet.symbol}
                </Text>
                <Text
                  style={[
                    styles.walletChange,
                    { color: wallet.isPositive ? colors.positive : colors.negative },
                  ]}
                >
                  {wallet.change}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Asset Button */}
        <TouchableOpacity style={[styles.addAssetButton, { backgroundColor: colors.card }]}>
          <IconSymbol name="plus.circle.fill" size={24} color={colors.accent} />
          <Text style={[styles.addAssetText, { color: colors.text }]}>Add New Asset</Text>
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
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalBalanceCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  totalChange: {
    fontSize: 16,
    fontWeight: '600',
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
  assetsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  walletItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  walletSymbol: {
    fontSize: 14,
  },
  walletRight: {
    alignItems: 'flex-end',
  },
  walletValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  walletBalance: {
    fontSize: 14,
    marginBottom: 2,
  },
  walletChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  addAssetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  addAssetText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
