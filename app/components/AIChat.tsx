import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface AIChatProps {
  // Add any props you might need in the future
}

export default function AIChat({}: AIChatProps) {
  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // TODO: Implement AI chat functionality
      setChatMessage('');
    }
  };

  return (
    <View style={styles.chatContainer}>
      {/* Chat Messages */}
      <View style={styles.messagesContainer}>
        {/* AI Welcome Message */}
        <View style={styles.messageRow}>
          <View style={styles.aiMessage}>
            <Text style={styles.messageText}>
              👋 Hello! I'm Goji AI, your personal crypto wallet assistant. How can I help you today?
            </Text>
            <Text style={styles.messageTime}>Just now</Text>
          </View>
        </View>

        {/* User Message Example */}
        <View style={styles.messageRow}>
          <View style={styles.userMessage}>
            <Text style={styles.userMessageText}>
              Can you help me understand my portfolio?
            </Text>
            <Text style={styles.messageTime}>Just now</Text>
          </View>
        </View>

        {/* AI Response */}
        <View style={styles.messageRow}>
          <View style={styles.aiMessage}>
            <Text style={styles.messageText}>
              Of course! I can help you analyze your portfolio, track performance, and provide insights. What specific information would you like to know?
            </Text>
            <Text style={styles.messageTime}>Just now</Text>
          </View>
        </View>
      </View>

      {/* Chat Input */}
      <View style={styles.chatInputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.chatInput}
            placeholder="Ask me anything about your crypto..."
            placeholderTextColor="#999"
            multiline
            value={chatMessage}
            onChangeText={setChatMessage}
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
            blurOnSubmit={false}
            enablesReturnKeyAutomatically
          />
          <TouchableOpacity 
            style={[styles.sendButton, !chatMessage.trim() && styles.sendButtonDisabled]} 
            onPress={handleSendMessage}
            disabled={!chatMessage.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'space-between',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 8,
  },
  messageRow: {
    marginBottom: 16,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    maxWidth: '80%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessage: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  userMessageText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  chatInputContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chatInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});
