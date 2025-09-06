import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface WalletProps {
  // Add any props you might need in the future
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

export default function Wallet({ }: WalletProps) {
  const router = useRouter();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<'crypto' | 'cash'>('crypto');

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  const handleDeposit = () => {
    Alert.alert('Deposit', 'Deposit functionality will be implemented here');
  };

  const handleReceive = () => {
    router.push({
      pathname: '/receive-qr',
      params: { blockchain: 'ETH-SEPOLIA' }
    });
  };

  const handleSend = () => {
    router.push('/send');
  };

  const handleTransfer = () => {
    Alert.alert('Transfer', 'Transfer functionality will be implemented here');
  };

  const handlePortfolio = () => {
    Alert.alert('Portfolio', 'Portfolio view will be implemented here');
  };

  const cryptoAssets: CryptoAsset[] = [
    {
      id: '1',
      name: 'Ethereum',
      symbol: 'ETH',
      amount: '2.103 ETH',
      value: '$6,875.20',
      change: '+3.26%',
      changePercent: '+3.26%',
      isPositive: true,
      imageUrl: 'https://imgs.search.brave.com/5zdHHoIlKZYAd0DQ3SblHsKOshWYOOQscgeaNi0ZFwU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/d29ybGR2ZWN0b3Js/b2dvLmNvbS9sb2dv/cy9ldGhlcmV1bS1l/dGguc3Zn'
    },
    {
      id: '2',
      name: 'USD Coin',
      symbol: 'USDC',
      amount: '2,421 USDC',
      value: '$2,421.00',
      change: '-0.01%',
      changePercent: '-0.01%',
      isPositive: false,
      imageUrl: 'https://imgs.search.brave.com/8NYhXqk1fx3dnUnHGJsOpkqHbNED7y5Mphrj0q3UQWQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy80/LzRhL0NpcmNsZV9V/U0RDX0xvZ28uc3Zn'
    }
  ];

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
          <TouchableOpacity style={styles.eyeButton} onPress={toggleBalanceVisibility}>
            <Ionicons
              name={isBalanceVisible ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceRow}>
          <Text style={styles.balanceValue}>
            {isBalanceVisible ? '$12,850.76' : '••••••'}
          </Text>
          <View style={styles.balanceChangeContainer}>
            <Text style={styles.balanceChangePositive}>+124.12</Text>
            <Text style={styles.balanceChangePercent}>+0.98% Last 24h</Text>
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
        {(activeTab === 'crypto' ? cryptoAssets : cashAssets).map((item) => (
          <View key={item.id}>
            {renderCryptoItem({ item })}
          </View>
        ))}
      </View>
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
  balanceChangePercent: {
    fontSize: 14,
    color: '#68d391',
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
});
