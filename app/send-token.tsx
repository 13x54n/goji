import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface Token {
  id: string;
  symbol: string;
  name: string;
  balance: string;
  balanceUSD: string;
  icon: string;
  address: string;
  price: number;
}

const MOCK_TOKENS: Token[] = [
  { 
    id: '1', 
    symbol: 'ETH', 
    name: 'Ethereum', 
    balance: '2.5', 
    balanceUSD: '6,250.00',
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    address: '0x0000000000000000000000000000000000000000',
    price: 2500
  },
  { 
    id: '2', 
    symbol: 'USDC', 
    name: 'USD Coin', 
    balance: '1,000.00', 
    balanceUSD: '1,000.00',
    icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    address: '0xA0b86a33E6441b8C4C8C0C4C8C0C4C8C0C4C8C0C',
    price: 1
  },
  { 
    id: '3', 
    symbol: 'USDT', 
    name: 'Tether', 
    balance: '500.00', 
    balanceUSD: '500.00',
    icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    price: 1
  },
  { 
    id: '4', 
    symbol: 'BTC', 
    name: 'Bitcoin', 
    balance: '0.15', 
    balanceUSD: '9,750.00',
    icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    price: 65000
  },
];

export default function SendToken() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState('');
  const [amountUSD, setAmountUSD] = useState('0.00');
  const [showTokenModal, setShowTokenModal] = useState(false);

  const contactName = params.contactName as string;
  const contactAddress = params.contactAddress as string;

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    setShowTokenModal(false);
    // Recalculate USD amount with new token price
    if (amount) {
      const numericAmount = parseFloat(amount) || 0;
      const usdAmount = numericAmount * token.price;
      setAmountUSD(usdAmount.toFixed(2));
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (selectedToken) {
      const numericAmount = parseFloat(value) || 0;
      const usdAmount = numericAmount * selectedToken.price;
      setAmountUSD(usdAmount.toFixed(2));
    }
  };

  const handleMaxAmount = () => {
    if (selectedToken) {
      const maxAmount = selectedToken.balance.replace(/,/g, '');
      setAmount(maxAmount);
      const numericAmount = parseFloat(maxAmount) || 0;
      const usdAmount = numericAmount * selectedToken.price;
      setAmountUSD(usdAmount.toFixed(2));
    }
  };

  const handleNext = () => {
    if (!selectedToken) {
      Alert.alert('Error', 'Please select a token');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (parseFloat(amount) > parseFloat(selectedToken.balance.replace(/,/g, ''))) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    // Navigate to review page with all data
    router.push({
      pathname: '/send-review',
      params: {
        contactName,
        contactAddress,
        tokenId: selectedToken.id,
        tokenSymbol: selectedToken.symbol,
        tokenName: selectedToken.name,
        tokenIcon: selectedToken.icon,
        amount,
        amountUSD,
      }
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <StatusBar style="light" backgroundColor="#000000" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Choose Token & Amount</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.recipientCard}>
            <Text style={styles.recipientLabel}>Sending to</Text>
            <View style={styles.recipientInfo}>
              <View style={styles.contactAvatar}>
                <Text style={styles.contactInitial}>
                  {contactName?.charAt(0)}
                </Text>
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactName}>{contactName}</Text>
                <Text style={styles.contactAddress}>{contactAddress}</Text>
              </View>
            </View>
          </View>

          <View style={styles.tokenSection}>
            <Text style={styles.sectionTitle}>Select Token</Text>
            <TouchableOpacity 
              style={styles.tokenButton}
              onPress={() => setShowTokenModal(true)}
            >
              {selectedToken ? (
                <View style={styles.selectedToken}>
                  <Image source={{ uri: selectedToken.icon }} style={styles.tokenIcon} />
                  <View style={styles.tokenInfo}>
                    <Text style={styles.tokenSymbol}>{selectedToken.symbol}</Text>
                    <Text style={styles.tokenName}>{selectedToken.name}</Text>
                  </View>
                  <Text style={styles.tokenBalance}>
                    Balance: {selectedToken.balance}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </View>
              ) : (
                <View style={styles.placeholderToken}>
                  <Ionicons name="wallet" size={24} color="#666" />
                  <Text style={styles.placeholderText}>Select a token</Text>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.amountSection}>
            <Text style={styles.sectionTitle}>Amount</Text>
            <View style={styles.amountContainer}>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
              <Text style={styles.amountUSD}>
                ≈ ${amountUSD}
              </Text>
            </View>
            {selectedToken && (
              <View style={styles.amountActions}>
                <TouchableOpacity style={styles.maxButton} onPress={handleMaxAmount}>
                  <Text style={styles.maxButtonText}>MAX</Text>
                </TouchableOpacity>
                <Text style={styles.balanceText}>
                  Available: {selectedToken.balance} {selectedToken.symbol}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Continue</Text>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Token Selection Modal */}
        <Modal
          visible={showTokenModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowTokenModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Token</Text>
              <TouchableOpacity onPress={() => setShowTokenModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {MOCK_TOKENS.map(token => (
                <TouchableOpacity
                  key={token.id}
                  style={styles.tokenItem}
                  onPress={() => handleTokenSelect(token)}
                >
                  <Image source={{ uri: token.icon }} style={styles.tokenIcon} />
                  <View style={styles.tokenInfo}>
                    <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                    <Text style={styles.tokenName}>{token.name}</Text>
                  </View>
                  <View style={styles.tokenBalance}>
                    <Text style={styles.balanceText}>{token.balance}</Text>
                    <Text style={styles.balanceUSD}>${token.balanceUSD}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#000',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  recipientCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333333',
  },
  recipientLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
    marginBottom: 12,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  contactAddress: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  tokenSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tokenButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  selectedToken: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderToken: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tokenIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  tokenName: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  tokenBalance: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginRight: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666666',
    flex: 1,
    marginLeft: 12,
  },
  amountSection: {
    marginBottom: 24,
  },
  amountContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 12,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  amountUSD: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  amountActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  maxButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  maxButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  balanceText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 8,
  },
  tokenBalance: {
    alignItems: 'flex-end',
  },
  balanceUSD: {
    fontSize: 14,
    color: '#CCCCCC',
  },
});
