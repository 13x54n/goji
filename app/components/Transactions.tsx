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
    backgroundColor: '#000000',
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  comingSoon: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
});
