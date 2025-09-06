import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function SendReview() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isSending, setIsSending] = useState(false);

  const contactName = params.contactName as string;
  const contactAddress = params.contactAddress as string;
  const tokenSymbol = params.tokenSymbol as string;
  const tokenName = params.tokenName as string;
  const tokenIcon = params.tokenIcon as string;
  const amount = params.amount as string;
  const amountUSD = params.amountUSD as string;

  const gasFee = '0.001';
  const totalAmount = (parseFloat(amount) + parseFloat(gasFee)).toFixed(6);

  const handleSend = async () => {
    setIsSending(true);
    // Simulate sending transaction
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsSending(false);
    
    Alert.alert(
      'Transaction Sent!', 
      `Successfully sent ${amount} ${tokenSymbol} to ${contactName}`,
      [
        { 
          text: 'View Transaction', 
          onPress: () => {
            // Navigate to transaction details
            // TODO: Implement transaction details navigation
          }
        },
        { 
          text: 'Done', 
          onPress: () => router.push('/home')
        }
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    // Go back to token selection with current data
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
          <Text style={styles.title}>Review & Send</Text>
          <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
            <Ionicons name="create" size={20} color="#0984e3" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <View style={styles.previewCard}>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>To</Text>
              <View style={styles.recipientInfo}>
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactInitial}>
                    {contactName?.charAt(0)}
                  </Text>
                </View>
                <View style={styles.contactDetails}>
                  <Text style={styles.contactName} numberOfLines={1}>{contactName}</Text>
                  <Text style={styles.contactAddress} numberOfLines={1}>{contactAddress}</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Amount</Text>
              <View style={styles.amountInfo}>
                <View style={styles.amountRow}>
                  <Image source={{ uri: tokenIcon }} style={styles.tokenIcon} />
                  <View style={styles.amountDetails}>
                    <Text style={styles.amountText} numberOfLines={1}>
                      {amount} {tokenSymbol}
                    </Text>
                    <Text style={styles.tokenName} numberOfLines={1}>{tokenName}</Text>
                  </View>
                </View>
                <Text style={styles.amountUSD} numberOfLines={1}>≈ ${amountUSD}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Network Fee</Text>
              <View style={styles.feeInfo}>
                <Text style={styles.feeAmount} numberOfLines={1}>{gasFee} ETH</Text>
                <Text style={styles.feeUSD} numberOfLines={1}>≈ $2.50</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Total</Text>
              <View style={styles.totalInfo}>
                <Text style={styles.totalAmount} numberOfLines={1}>
                  {totalAmount} {tokenSymbol}
                </Text>
                <Text style={styles.totalUSD} numberOfLines={1}>
                  ≈ ${(parseFloat(amountUSD) + 2.50).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.warningCard}>
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <Text style={styles.warningText}>
              Please review all details carefully. This transaction cannot be undone.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estimated Time</Text>
              <Text style={styles.infoValue}>2-5 minutes</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Network</Text>
              <Text style={styles.infoValue}>Ethereum Sepolia</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.sendButton, isSending && styles.sendButtonDisabled]} 
            onPress={handleSend}
            disabled={isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <Text style={styles.sendButtonText}>Send Transaction</Text>
                <Ionicons name="send" size={20} color="#000" />
              </>
            )}
          </TouchableOpacity>
        </View>
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
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  previewCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactDetails: {
    flex: 1,
    minWidth: 0,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  contactAddress: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  divider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 16,
  },
  amountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  tokenIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  amountDetails: {
    flex: 1,
    minWidth: 0,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tokenName: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  amountUSD: {
    fontSize: 16,
    color: '#CCCCCC',
    flexShrink: 0,
    marginLeft: 8,
  },
  feeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeAmount: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
    minWidth: 0,
  },
  feeUSD: {
    fontSize: 14,
    color: '#CCCCCC',
    flexShrink: 0,
    marginLeft: 8,
  },
  totalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0984e3',
    flex: 1,
    minWidth: 0,
  },
  totalUSD: {
    fontSize: 16,
    color: '#CCCCCC',
    flexShrink: 0,
    marginLeft: 8,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#F59E0B',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  sendButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginHorizontal: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
    opacity: 0.6,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});
