import React from 'react';
import {
    StyleSheet,
    Text,
    View
} from 'react-native';

interface TransactionsProps {
  // Add any props you might need in the future
}

export default function Transactions({}: TransactionsProps) {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Transactions</Text>
      <Text style={styles.comingSoon}>Transaction history coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  comingSoon: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
