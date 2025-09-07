import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import CustomAlert from './components/CustomAlert';

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

export default function SendToken() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState('');
  const [amountUSD, setAmountUSD] = useState('0.00');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    buttons: [] as Array<{text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive'}>
  });
  const contactName = params.contactName as string;
  const contactAddress = params.contactAddress as string;

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    setShowTokenModal(false);
    
    // Navigate to enter amount page with selected token
    router.push({
      pathname: '/enter-amount',
      params: {
        contactName,
        contactAddress,
        tokenId: token.id,
        tokenSymbol: token.symbol,
        tokenName: token.name,
        tokenIcon: token.icon,
        tokenPrice: token.price.toString(),
        tokenBalance: token.balance,
        tokenBalanceUSD: token.balanceUSD,
      }
    });
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

  const showCustomAlert = (title: string, message: string, buttons: Array<{text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive'}>) => {
    setAlertConfig({ title, message, buttons });
    setShowAlert(true);
  };

  const handleNext = () => {
    if (!selectedToken) {
      showCustomAlert('Error', 'Please select a token', [
        { text: 'OK', onPress: () => {} }
      ]);
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      showCustomAlert('Error', 'Please enter a valid amount', [
        { text: 'OK', onPress: () => {} }
      ]);
      return;
    }
    if (parseFloat(amount) > parseFloat(selectedToken.balance.replace(/,/g, ''))) {
      showCustomAlert('Error', 'Insufficient balance', [
        { text: 'OK', onPress: () => {} }
      ]);
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
      <StatusBar style="dark" backgroundColor="#000000" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Select asset to send</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
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

          <View style={styles.tokenSection}>
            {MOCK_TOKENS.map((token) => (
              <TouchableOpacity key={token.id} style={styles.tokenButton} onPress={() => handleTokenSelect(token)}>
                <View style={styles.selectedToken}>
                  <Image source={{ uri: token.icon }} style={styles.tokenIcon} />
                  <View>
                    <Text style={styles.tokenName}>{token.name}</Text>
                    <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                  </View>
                </View>
                <View style={styles.tokenBalance}>
                  <Text style={styles.balanceUSD}>${token.balanceUSD}</Text>
                  <Text style={styles.balanceText}>{token.balance} {token.symbol}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <CustomAlert
          visible={showAlert}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={() => setShowAlert(false)}
        />
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
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tokenButton: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 14,
    color: '#ccc',
    marginBottom: 2,
  },
  tokenName: {
    fontWeight: '600',
    fontSize: 16,
    color: '#fff',
  },
  tokenBalance: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginRight: 8,
    alignItems: 'flex-end',
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
    color: '#fff',
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
    backgroundColor: '#fff',
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
  tokenBalanceUSD: {
    alignItems: 'flex-end',
  },
  balanceUSD: {
    fontSize: 16,
    color: '#fff',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingLeft: 16,
  },
});
