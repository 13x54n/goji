import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { sessionService } from '../../lib/sessionService';

interface MenuDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function MenuDrawer({ visible, onClose }: MenuDrawerProps) {
  const slideAnim = React.useRef(new Animated.Value(-screenWidth)).current;
  const [userName, setUserName] = React.useState<string>('');
  const [userEmail, setUserEmail] = React.useState<string>('');

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  React.useEffect(() => {
    const session = sessionService.getSession();
    setUserEmail(session?.email || '');
    // If you later store name in session, prefer that; for now, derive from email local-part
    if (session?.email) {
      const local = session.email.split('@')[0];
      const pretty = local.replace(/[-_.]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      setUserName(pretty);
    } else {
      setUserName('');
    }
  }, [visible]);

  const handleMenuPress = (screen: string) => {
    onClose();
    setTimeout(() => {
      router.push(`/${screen}` as any);
    }, 300);
  };

  const handleLogout = () => {
    onClose();
  };

  const menuItems = [
    { id: 'profile', title: 'Profile', icon: 'person-outline', screen: 'profile' },
    { id: 'settings', title: 'Settings', icon: 'settings-outline', screen: 'settings' },
    { id: 'security', title: 'Security', icon: 'shield-checkmark-outline', screen: 'security' },
    { id: 'help', title: 'Help & Support', icon: 'help-circle-outline', screen: 'help' },
    { id: 'about', title: 'About', icon: 'information-circle-outline', screen: 'about' },
  ];

  const initials = React.useMemo(() => {
    if (userName) {
      const parts = userName.trim().split(' ');
      const first = parts[0]?.[0] || '';
      const second = parts[1]?.[0] || '';
      return (first + second).toUpperCase();
    }
    if (userEmail) {
      return userEmail[0]?.toUpperCase() || 'U';
    }
    return 'U';
  }, [userName, userEmail]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Drawer Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.userInfo}>
              <View style={styles.avatar}>
                {userName || userEmail ? (
                  <Text style={{ color: '#fff', fontWeight: '700' }}>{initials}</Text>
                ) : (
                  <Ionicons name="person" size={32} color="#fff" />
                )}
              </View>
              <View style={styles.userDetails}>
                {!!userEmail && <Text style={styles.userEmail}>{userEmail.split('@')[0]}</Text>}
                <Text style={styles.userName}>Account & settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.menuItems}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleMenuPress(item.screen)}
              >
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemIcon}>
                    <Ionicons name={item.icon as any} size={24} color="#333" />
                  </View>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    width: screenWidth * 0.8,
    height: '100%',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userEmail: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  menuItems: {
    flex: 1,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});
