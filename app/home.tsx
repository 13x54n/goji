import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    BackHandler,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { sessionService } from '../lib/sessionService';
import AIChat from './components/AIChat';
import MenuDrawer from './components/MenuDrawer';
import Profile from './components/Profile';
import Transactions from './components/Transactions';
import Wallet from './components/Wallet';

interface TabItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}

const tabs: TabItem[] = [
  { id: 'wallet', title: 'Wallet', icon: 'wallet-outline', activeIcon: 'wallet' },
  { id: 'ai', title: 'AI', icon: 'chatbubble-outline', activeIcon: 'chatbubble' },
  { id: 'transactions', title: 'Transactions', icon: 'receipt-outline', activeIcon: 'list' },
  { id: 'profile', title: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('wallet');
  const [session, setSession] = useState<any>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  useEffect(() => {
    // Prevent Android hardware back from leaving Home
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    // Check if user is logged in
    if (!sessionService.isLoggedIn()) {
      router.replace('/');
      return;
    }

    const session = sessionService.getSession();
    setSession(session);
  }, []);

  const handleLogout = () => {
    router.replace('/');
  };

  const handleMenuPress = () => {
    setIsDrawerVisible(true);
  };

  const handleNotificationPress = () => {
    router.push('/notifications');
  };

  const handleSearchPress = () => {
    router.push('/search');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ai':
        return <AIChat />;
      case 'wallet':
        return <Wallet />;
      case 'transactions':
        return <Transactions />;
      case 'profile':
        return <Profile session={session} onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  if (!session) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#ffffff" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleMenuPress}>
          <Ionicons name="menu" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
          <Ionicons name="search" size={20} color="#666" />
          <Text style={styles.searchPlaceholder}>Search...</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerButton} onPress={handleNotificationPress}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Main Content Container */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Tab Content */}
        <View style={styles.content}>
          {renderTabContent()}
        </View>
      </KeyboardAvoidingView>

      {/* Bottom Tabs */}
      <View style={styles.bottomTabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={activeTab === tab.id ? tab.activeIcon : tab.icon}
              size={24}
              color={activeTab === tab.id ? '#000' : '#999'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Menu Drawer */}
      <MenuDrawer
        visible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    elevation: 5,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },

  bottomTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingBottom: 0,
    paddingTop: 8,
    elevation: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tabText: {
    fontSize: 12,
    color: '#000',
    marginTop: 4,
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  walletHeader: {
    flex: 1,
    alignItems: 'center',
  },
  accountSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountInfo: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  walletAddress: {
    fontSize: 12,
    color: '#666',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
  },
  searchPlaceholder: {
    marginLeft: 8,
    color: '#999',
    fontSize: 14,
  },
});
