import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { sessionService } from '../lib/sessionService';

interface TabItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}

const tabs: TabItem[] = [
  { id: 'home', title: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { id: 'wallet', title: 'Wallet', icon: 'wallet-outline', activeIcon: 'wallet' },
  { id: 'transactions', title: 'Transactions', icon: 'receipt-outline', activeIcon: 'list' },
  { id: 'profile', title: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('home');
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    if (!sessionService.isLoggedIn()) {
      router.replace('/');
      return;
    }
    
    const session = sessionService.getSession();
    setSession(session);
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await sessionService.clearSession();
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleMenuPress = () => {
    // TODO: Implement menu functionality
    Alert.alert("Menu", "Menu options will be implemented here");
  };

  const handleNotificationPress = () => {
    // TODO: Implement notification functionality
    Alert.alert("Notifications", "Notifications will be implemented here");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.emailText}>{session?.email}</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>$0.00</Text>
                <Text style={styles.statLabel}>Total Balance</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Assets</Text>
              </View>
            </View>
          </View>
        );
      case 'wallet':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Wallet</Text>
            <Text style={styles.comingSoon}>Wallet features coming soon...</Text>
          </View>
        );
      case 'transactions':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Transactions</Text>
            <Text style={styles.comingSoon}>Transaction history coming soon...</Text>
          </View>
        );
      case 'profile':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Profile</Text>
            <View style={styles.profileInfo}>
              <Text style={styles.profileLabel}>Email:</Text>
              <Text style={styles.profileValue}>{session?.email}</Text>
              <Text style={styles.profileLabel}>Last Activity:</Text>
              <Text style={styles.profileValue}>
                {session?.lastActivity ? new Date(session.lastActivity).toLocaleString() : 'N/A'}
              </Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  if (!session) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#000000" />
      
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleMenuPress}>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goji</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleNotificationPress}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Main Content Container */}
      <View style={styles.container}>
        {/* Tab Content */}
        <View style={styles.content}>
          {renderTabContent()}
        </View>
      </View>

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
              color={activeTab === tab.id ? '#fff' : '#999'}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
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
  profileInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomTabs: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingBottom: 20,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
    color: '#999',
    marginTop: 4,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
});
