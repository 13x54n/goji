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

const mockEarnOpportunities = [
  {
    id: '1',
    title: 'Bitcoin Staking',
    description: 'Earn up to 6% APY on your BTC',
    apy: '6.2%',
    minAmount: '$100',
    risk: 'Low',
    icon: 'bitcoinsign.circle.fill',
    color: '#f7931a',
  },
  {
    id: '2',
    title: 'Ethereum 2.0 Staking',
    description: 'Stake ETH and earn rewards',
    apy: '4.8%',
    minAmount: '$1,000',
    risk: 'Medium',
    icon: 'circle.grid.cross.fill',
    color: '#627eea',
  },
  {
    id: '3',
    title: 'USDC Savings',
    description: 'High-yield savings with USDC',
    apy: '8.5%',
    minAmount: '$50',
    risk: 'Low',
    icon: 'dollarsign.circle.fill',
    color: '#2775ca',
  },
  {
    id: '4',
    title: 'DeFi Liquidity Pool',
    description: 'Provide liquidity and earn fees',
    apy: '12.3%',
    minAmount: '$500',
    risk: 'High',
    icon: 'drop.fill',
    color: '#ff6b35',
  },
  {
    id: '5',
    title: 'Lending Protocol',
    description: 'Lend your crypto and earn interest',
    apy: '9.1%',
    minAmount: '$200',
    risk: 'Medium',
    icon: 'banknote.fill',
    color: '#00d4aa',
  },
];

const mockActivePositions = [
  {
    id: '1',
    asset: 'Bitcoin',
    symbol: 'BTC',
    amount: '0.0024',
    value: '$156.78',
    apy: '6.2%',
    earned: '$2.34',
    icon: 'bitcoinsign.circle.fill',
  },
  {
    id: '2',
    asset: 'USD Coin',
    symbol: 'USDC',
    amount: '500.00',
    value: '$500.00',
    apy: '8.5%',
    earned: '$8.45',
    icon: 'dollarsign.circle.fill',
  },
];

export default function EarnScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const totalEarned = mockActivePositions.reduce((sum, position) => {
    const earned = parseFloat(position.earned.replace('$', ''));
    return sum + earned;
  }, 0);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return colors.positive;
      case 'Medium':
        return colors.accent;
      case 'High':
        return colors.negative;
      default:
        return colors.icon;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Earn</Text>
          <TouchableOpacity style={[styles.historyButton, { backgroundColor: colors.card }]}>
            <IconSymbol name="clock.fill" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Total Earned */}
        <View style={[styles.totalEarnedCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.totalLabel, { color: colors.icon }]}>Total Earned (All Time)</Text>
          <Text style={[styles.totalValue, { color: colors.positive }]}>
            +${totalEarned.toFixed(2)}
          </Text>
          <Text style={[styles.totalSubtext, { color: colors.icon }]}>
            From {mockActivePositions.length} active positions
          </Text>
        </View>

        {/* Active Positions */}
        <View style={styles.activePositionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Positions</Text>
          {mockActivePositions.map((position) => (
            <TouchableOpacity
              key={position.id}
              style={[styles.positionItem, { backgroundColor: colors.card }]}
            >
              <View style={styles.positionLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.secondary }]}>
                  <IconSymbol name={position.icon} size={24} color={colors.accent} />
                </View>
                <View style={styles.positionInfo}>
                  <Text style={[styles.positionAsset, { color: colors.text }]}>
                    {position.asset}
                  </Text>
                  <Text style={[styles.positionAmount, { color: colors.icon }]}>
                    {position.amount} {position.symbol}
                  </Text>
                </View>
              </View>
              <View style={styles.positionRight}>
                <Text style={[styles.positionValue, { color: colors.text }]}>
                  {position.value}
                </Text>
                <Text style={[styles.positionApy, { color: colors.positive }]}>
                  {position.apy} APY
                </Text>
                <Text style={[styles.positionEarned, { color: colors.positive }]}>
                  +{position.earned}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Earn Opportunities */}
        <View style={styles.opportunitiesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Earn Opportunities</Text>
          {mockEarnOpportunities.map((opportunity) => (
            <TouchableOpacity
              key={opportunity.id}
              style={[styles.opportunityItem, { backgroundColor: colors.card }]}
            >
              <View style={styles.opportunityLeft}>
                <View
                  style={[
                    styles.opportunityIcon,
                    { backgroundColor: colors.secondary },
                  ]}
                >
                  <IconSymbol name={opportunity.icon} size={24} color={opportunity.color} />
                </View>
                <View style={styles.opportunityInfo}>
                  <Text style={[styles.opportunityTitle, { color: colors.text }]}>
                    {opportunity.title}
                  </Text>
                  <Text style={[styles.opportunityDescription, { color: colors.icon }]}>
                    {opportunity.description}
                  </Text>
                  <View style={styles.opportunityMeta}>
                    <Text style={[styles.minAmount, { color: colors.icon }]}>
                      Min: {opportunity.minAmount}
                    </Text>
                    <View style={styles.riskContainer}>
                      <Text style={[styles.riskLabel, { color: colors.icon }]}>Risk:</Text>
                      <Text
                        style={[
                          styles.riskValue,
                          { color: getRiskColor(opportunity.risk) },
                        ]}
                      >
                        {opportunity.risk}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.opportunityRight}>
                <Text style={[styles.apyValue, { color: colors.positive }]}>
                  {opportunity.apy}
                </Text>
                <Text style={[styles.apyLabel, { color: colors.icon }]}>APY</Text>
                <TouchableOpacity
                  style={[styles.startButton, { backgroundColor: colors.accent }]}
                >
                  <Text style={styles.startButtonText}>Start</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Learn More Section */}
        <View style={[styles.learnMoreCard, { backgroundColor: colors.card }]}>
          <IconSymbol name="lightbulb.fill" size={32} color={colors.accent} />
          <Text style={[styles.learnMoreTitle, { color: colors.text }]}>
            Learn About DeFi
          </Text>
          <Text style={[styles.learnMoreText, { color: colors.icon }]}>
            Discover how decentralized finance can help you earn more from your crypto holdings.
          </Text>
          <TouchableOpacity style={[styles.learnButton, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.learnButtonText, { color: colors.text }]}>Learn More</Text>
          </TouchableOpacity>
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
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  historyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalEarnedCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
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
  totalSubtext: {
    fontSize: 14,
  },
  activePositionsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  positionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  positionLeft: {
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
  positionInfo: {
    flex: 1,
  },
  positionAsset: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  positionAmount: {
    fontSize: 14,
  },
  positionRight: {
    alignItems: 'flex-end',
  },
  positionValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  positionApy: {
    fontSize: 14,
    marginBottom: 2,
  },
  positionEarned: {
    fontSize: 14,
    fontWeight: '600',
  },
  opportunitiesSection: {
    marginBottom: 32,
  },
  opportunityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  opportunityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  opportunityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  opportunityInfo: {
    flex: 1,
  },
  opportunityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  opportunityDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  opportunityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  minAmount: {
    fontSize: 12,
  },
  riskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskLabel: {
    fontSize: 12,
    marginRight: 4,
  },
  riskValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  opportunityRight: {
    alignItems: 'center',
  },
  apyValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  apyLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  startButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  startButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  learnMoreCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 32,
  },
  learnMoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  learnMoreText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  learnButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  learnButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
