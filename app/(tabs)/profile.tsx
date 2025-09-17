import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const profileOptions = [
  {
    id: 'security',
    title: 'Security',
    subtitle: 'Password, 2FA, Biometric',
    icon: 'lock.shield.fill',
    color: '#ff6b35',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    subtitle: 'Push, Email, SMS alerts',
    icon: 'bell.fill',
    color: '#3742fa',
  },
  {
    id: 'preferences',
    title: 'Preferences',
    subtitle: 'Theme, Language, Currency',
    icon: 'gearshape.fill',
    color: '#9c88ff',
  },
  {
    id: 'support',
    title: 'Help & Support',
    subtitle: 'FAQ, Contact, Live Chat',
    icon: 'questionmark.circle.fill',
    color: '#00d4aa',
  },
  {
    id: 'about',
    title: 'About',
    subtitle: 'Version, Terms, Privacy',
    icon: 'info.circle.fill',
    color: '#ffa726',
  },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const handleOptionPress = (optionId: string) => {
    // Handle different profile options
    switch (optionId) {
      case 'security':
        Alert.alert('Security', 'Security settings coming soon!');
        break;
      case 'notifications':
        Alert.alert('Notifications', 'Notification settings coming soon!');
        break;
      case 'preferences':
        Alert.alert('Preferences', 'App preferences coming soon!');
        break;
      case 'support':
        Alert.alert('Support', 'Help & Support coming soon!');
        break;
      case 'about':
        Alert.alert('About', 'Goji v1.0.0\nCrypto Trading App\nBuilt with React Native & Expo');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
          <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.card }]}>
            <IconSymbol name="pencil" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* User Info Card */}
        <View style={[styles.userCard, { backgroundColor: colors.card }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.secondary }]}>
            <IconSymbol name="person.fill" size={40} color={colors.accent} />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.name || 'Demo User'}
            </Text>
            <Text style={[styles.userEmail, { color: colors.icon }]}>
              {user?.email || 'demo@example.com'}
            </Text>
            <View style={styles.userStatus}>
              <View style={[styles.statusDot, { backgroundColor: colors.positive }]} />
              <Text style={[styles.statusText, { color: colors.positive }]}>
                Verified
              </Text>
            </View>
          </View>
        </View>

        {/* Portfolio Summary */}
        <View style={[styles.portfolioCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.portfolioTitle, { color: colors.text }]}>Portfolio Summary</Text>
          <View style={styles.portfolioStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>$2,249.28</Text>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Total Value</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.positive }]}>+5.2%</Text>
              <Text style={[styles.statLabel, { color: colors.icon }]}>24h Change</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>4</Text>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Assets</Text>
            </View>
          </View>
        </View>

        {/* Profile Options */}
        <View style={styles.optionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
          {profileOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionItem, { backgroundColor: colors.card }]}
              onPress={() => handleOptionPress(option.id)}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: colors.secondary }]}>
                  <IconSymbol name={option.icon} size={24} color={option.color} />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>
                    {option.title}
                  </Text>
                  <Text style={[styles.optionSubtitle, { color: colors.icon }]}>
                    {option.subtitle}
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.icon} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.negative }]}
          onPress={handleLogout}
        >
          <IconSymbol name="arrow.right.square.fill" size={20} color="#fff" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.icon }]}>
            Goji v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 8,
  },
  userStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  portfolioCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  portfolioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#2d2d2d',
    marginHorizontal: 16,
  },
  optionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  versionText: {
    fontSize: 12,
  },
});
