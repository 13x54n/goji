import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface TransactionStatusProps {
  transactionId: string;
  status: string;
  amount: string;
  tokenSymbol: string;
  destinationAddress: string;
  note?: string;
  price?: number;
  priceChange?: number;
  onCancel?: () => void;
  onAccelerate?: () => void;
  onViewDetails?: () => void;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'INITIATED':
    case 'QUEUED':
      return '#FFA500'; // Orange
    case 'PENDING_RISK_SCREENING':
      return '#FFA500'; // Orange
    case 'SENT':
    case 'CONFIRMED':
      return '#4CAF50'; // Green
    case 'COMPLETE':
      return '#4CAF50'; // Green
    case 'FAILED':
    case 'DENIED':
      return '#F44336'; // Red
    case 'CANCELLED':
      return '#9E9E9E'; // Gray
    default:
      return '#2196F3'; // Blue
  }
};

const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'INITIATED':
    case 'QUEUED':
      return 'time-outline';
    case 'PENDING_RISK_SCREENING':
      return 'shield-checkmark-outline';
    case 'SENT':
    case 'CONFIRMED':
      return 'checkmark-circle-outline';
    case 'COMPLETE':
      return 'checkmark-done-circle-outline';
    case 'FAILED':
    case 'DENIED':
      return 'close-circle-outline';
    case 'CANCELLED':
      return 'stop-circle-outline';
    default:
      return 'information-circle-outline';
  }
};

const getStatusText = (status: string): string => {
  switch (status) {
    case 'INITIATED':
      return 'Transaction Initiated';
    case 'QUEUED':
      return 'Queued for Processing';
    case 'PENDING_RISK_SCREENING':
      return 'Risk Screening';
    case 'SENT':
      return 'Transaction Sent';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'COMPLETE':
      return 'Complete';
    case 'FAILED':
      return 'Transaction Failed';
    case 'DENIED':
      return 'Transaction Denied';
    case 'CANCELLED':
      return 'Transaction Cancelled';
    default:
      return status;
  }
};

export default function TransactionStatus({
  transactionId,
  status,
  amount,
  tokenSymbol,
  destinationAddress,
  note,
  price,
  priceChange,
  onCancel,
  onAccelerate,
  onViewDetails
}: TransactionStatusProps) {
  const statusColor = getStatusColor(status);
  const statusIcon = getStatusIcon(status);
  const statusText = getStatusText(status);

  const canCancel = ['INITIATED', 'QUEUED', 'PENDING_RISK_SCREENING'].includes(status);
  const canAccelerate = ['QUEUED', 'PENDING_RISK_SCREENING'].includes(status);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
            <Ionicons name={statusIcon as any} size={16} color="#FFFFFF" />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusText}>{statusText}</Text>
            <Text style={styles.transactionId}>ID: {transactionId.slice(0, 8)}...</Text>
          </View>
        </View>
        {onViewDetails && (
          <TouchableOpacity style={styles.viewButton} onPress={onViewDetails}>
            <Ionicons name="eye-outline" size={16} color="#0984e3" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount:</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.detailValue}>{amount} {tokenSymbol}</Text>
            {price && (
              <Text style={styles.priceText}>
                ${(parseFloat(amount) * price).toFixed(2)}
              </Text>
            )}
          </View>
        </View>
        
        {price && priceChange !== undefined && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.detailValue}>${price.toFixed(2)}</Text>
              <Text style={[
                styles.priceChange,
                priceChange >= 0 ? styles.positiveChange : styles.negativeChange
              ]}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </Text>
            </View>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>To:</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {destinationAddress.slice(0, 6)}...{destinationAddress.slice(-4)}
          </Text>
        </View>

        {note && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Note:</Text>
            <Text style={styles.detailValue} numberOfLines={2}>{note}</Text>
          </View>
        )}
      </View>

      {(canCancel || canAccelerate) && (
        <View style={styles.actions}>
          {canCancel && onCancel && (
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Ionicons name="close-outline" size={16} color="#F44336" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          
          {canAccelerate && onAccelerate && (
            <TouchableOpacity style={styles.accelerateButton} onPress={onAccelerate}>
              <Ionicons name="flash-outline" size={16} color="#FFA500" />
              <Text style={styles.accelerateButtonText}>Accelerate</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  transactionId: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  viewButton: {
    padding: 8,
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 2,
    textAlign: 'right',
  },
  amountContainer: {
    flex: 2,
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 2,
  },
  priceContainer: {
    flex: 2,
    alignItems: 'flex-end',
  },
  priceChange: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  positiveChange: {
    color: '#10B981',
  },
  negativeChange: {
    color: '#EF4444',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
    marginLeft: 6,
  },
  accelerateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFA500',
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
  },
  accelerateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFA500',
    marginLeft: 6,
  },
});
