import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
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
    icon: 'https://imgs.search.brave.com/5zdHHoIlKZYAd0DQ3SblHsKOshWYOOQscgeaNi0ZFwU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/d29ybGR2ZWN0b3Js/b2dvLmNvbS9sb2dv/cy9ldGhlcmV1bS1l/dGguc3Zn',
    address: '0x0000000000000000000000000000000000000000',
    price: 2500
  },
  {
    id: '2',
    symbol: 'USDC',
    name: 'USD Coin',
    balance: '1,000.00',
    balanceUSD: '1,000.00',
    icon: 'https://imgs.search.brave.com/8NYhXqk1fx3dnUnHGJsOpkqHbNED7y5Mphrj0q3UQWQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy80/LzRhL0NpcmNsZV9V/U0RDX0xvZ28uc3Zn',
    address: '0xA0b86a33E6441b8C4C8C0C4C8C0C4C8C0C4C8C0C',
    price: 1
  },
  {
    id: '3',
    symbol: 'USDT',
    name: 'Tether',
    balance: '500.00',
    balanceUSD: '500.00',
    icon: 'https://imgs.search.brave.com/Vs-coi7cKHUnncyJJL0HSrhE-9MYuyI1iDKKGjncbQw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/ZnJlZWxvZ292ZWN0/b3JzLm5ldC93cC1j/b250ZW50L3VwbG9h/ZHMvMjAyMS8xMC91/c2R0LXRldGhlci1s/b2dvLWZyZWVsb2dv/dmVjdG9ycy5uZXRf/LTQwMHg0MDAucG5n',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    price: 1
  },
  {
    id: '4',
    symbol: 'BTC',
    name: 'Bitcoin',
    balance: '0.15',
    balanceUSD: '9,750.00',
    icon: 'https://imgs.search.brave.com/GiMlVMw-Wa4DzuCVjYrYjLGFEvcpZJmMEP49yN6jaNE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wbmdp/bWcuY29tL3VwbG9h/ZHMvYml0Y29pbi9z/bWFsbC9iaXRjb2lu/X1BORzM4LnBuZw',
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    price: 65000
  },
];

export default function EnterAmount() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedToken, setSelectedToken] = useState<Token | null>(() => {
    // Initialize with token data from params if available
    if (params.tokenId) {
      return {
        id: params.tokenId as string,
        symbol: params.tokenSymbol as string,
        name: params.tokenName as string,
        icon: params.tokenIcon as string,
        address: '',
        price: parseFloat(params.tokenPrice as string) || 0,
        balance: params.tokenBalance as string,
        balanceUSD: params.tokenBalanceUSD as string,
      };
    }
    return null;
  });
  const [amount, setAmount] = useState('0');
  const [amountUSD, setAmountUSD] = useState('0.00');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUSDInput, setIsUSDInput] = useState(false);
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
    if (isUSDInput) {
      setAmountUSD(value);
      if (selectedToken) {
        const numericUSD = parseFloat(value) || 0;
        const tokenAmount = numericUSD / selectedToken.price;
        setAmount(tokenAmount.toFixed(6).replace(/\.?0+$/, ''));
      }
    } else {
      setAmount(value);
      if (selectedToken) {
        const numericAmount = parseFloat(value) || 0;
        const usdAmount = numericAmount * selectedToken.price;
        setAmountUSD(usdAmount.toFixed(2));
      }
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

  const handleToggleInputMode = () => {
    if (selectedToken) {
      setIsUSDInput(!isUSDInput);
    }
  };

  const handleKeyPress = (key: string) => {
    const currentValue = isUSDInput ? amountUSD : amount;
    
    if (key === 'backspace') {
      if (currentValue.length > 0) {
        const newValue = currentValue.slice(0, -1);
        handleAmountChange(newValue || '0');
      }
    } else if (key === '.') {
      if (!currentValue.includes('.')) {
        handleAmountChange(currentValue + '.');
      }
    } else if (key >= '0' && key <= '9') {
      if (currentValue === '0') {
        handleAmountChange(key);
      } else {
        handleAmountChange(currentValue + key);
      }
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

  const renderNumericKeyboard = () => {
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['.', '0', 'backspace']
    ];

    return (
      <View style={styles.keyboard}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyboardRow}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.keyButton,
                  key === 'backspace' && styles.backspaceButton
                ]}
                onPress={() => handleKeyPress(key)}
              >
                {key === 'backspace' ? (
                  <Ionicons name="backspace-outline" size={24} color="#fff" />
                ) : (
                  <Text style={styles.keyText}>{key}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor="#000000" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Enter amount</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Amount Display */}
          <View style={styles.amountContainer}>
            <View style={styles.amountRow}>
              <View style={styles.amountTextContainer}>
                <Text
                  style={[
                    styles.amountText,
                    { fontSize: Math.max(24, Math.min(48, 48 - ((isUSDInput ? amountUSD + 'USD' : amount + (selectedToken?.symbol || 'CAD')).length - 6) * 3)) }
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {isUSDInput ? amountUSD + 'USD' : amount + (selectedToken?.symbol || 'CAD')}
                </Text>
              </View>
              <TouchableOpacity style={styles.maxButton} onPress={handleMaxAmount}>
                <Text style={styles.maxButtonText}>Max</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.conversionRow} onPress={handleToggleInputMode}>
              <Ionicons name="swap-vertical" size={16} color="#0984e3" />
              <Text style={styles.conversionText}>
                {isUSDInput ? `${amount} ${selectedToken?.symbol || ''}` : `${amountUSD} USD`}
              </Text>
            </TouchableOpacity>
          </View>

        </View>

        <View style={{marginHorizontal: 20}}>
          {/* Asset Selection */}
          <TouchableOpacity
            style={styles.assetContainer}
            onPress={() => setShowTokenModal(true)}
          >
            <View style={styles.assetInfo}>
              {selectedToken ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image source={{ uri: selectedToken.icon }} style={styles.assetIcon} />
                  <View>
                    <Text style={styles.assetName}>{selectedToken.name}</Text>
                    <Text style={styles.assetBalance}>CA${selectedToken.balanceUSD} available</Text>
                  </View>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.placeholderIcon} />
                  <View>
                    <Text style={styles.assetName}>Select Asset</Text>
                    <Text style={styles.assetBalance}>Choose a token to send</Text>
                  </View>
                </View>
              )}
              <Ionicons name="information-circle-outline" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.addNoteButton}>
              <Text style={styles.addNoteText}>Add note</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.previewButton,
                (!selectedToken || parseFloat(amount) <= 0) && styles.previewButtonDisabled
              ]}
              onPress={handleNext}
              disabled={!selectedToken || parseFloat(amount) <= 0}
            >
              <Text style={styles.previewText}>Preview</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Custom Numeric Keyboard */}
        {renderNumericKeyboard()}

        {/* Token Selection Modal */}
        <Modal
          visible={showTokenModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowTokenModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Asset</Text>
              <View style={styles.placeholder} />
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color="#fff" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView style={styles.modalContent}>
              {MOCK_TOKENS.map((token) => (
                <TouchableOpacity
                  key={token.id}
                  style={styles.tokenItem}
                  onPress={() => handleTokenSelect(token)}
                >
                  <Image source={{ uri: token.icon }} style={styles.tokenIcon} />
                  <View style={styles.tokenInfo}>
                    <Text style={styles.tokenName}>{token.name}</Text>
                    <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                  </View>
                  <View style={styles.tokenBalance}>
                    <Text style={styles.balanceUSD}>${token.balanceUSD}</Text>
                    <Text style={styles.balanceText}>{token.balance} {token.symbol}</Text>
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
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  amountContainer: {
    marginBottom: 30,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  amountText: {
    fontWeight: '600',
    color: '#FFFFFF',
    minWidth: 0,
  },
  maxButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  maxButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  conversionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  conversionText: {
    fontSize: 16,
    color: '#0984e3',
    marginLeft: 4,
  },
  assetContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  assetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  assetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  placeholderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    marginRight: 12,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  assetBalance: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  addNoteButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  addNoteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  previewButton: {
    flex: 1,
    backgroundColor: '#0984e3',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  previewButtonDisabled: {
    backgroundColor: '#000',
    opacity: 0.6,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  keyboard: {
    backgroundColor: '#000',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  keyButton: {
    width: 80,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingLeft: 16,
    margin: 20,
  },
  searchInput: {
    flex: 1,
    padding: 16,
    color: '#fff',
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
    borderRadius: 8,
    marginBottom: 8,
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
  tokenName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  tokenSymbol: {
    fontSize: 14,
    color: '#ccc',
  },
  tokenBalance: {
    alignItems: 'flex-end',
  },
  balanceUSD: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  balanceText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
});
