import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { getMessages, sendMessage } from '../../services/chatService';
import { connectSocket, getSocket, disconnectSocket } from '../../services/socket';
import uuid from 'react-native-uuid';

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { chatId, friendName, friendImage, friendId } = route.params;
  const user = useSelector((state) => state.user.user);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const [isFriendOnline, setIsFriendOnline] = useState(friendId && friendId.isOnline);
  const flatListRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    // Set the navigation title to the friend's name and image
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.header}>
          <Image source={{ uri: friendImage }} style={styles.headerImage} />
          <View>
            <Text style={styles.headerTitle}>{friendName}</Text>
            <Text style={styles.onlineStatus}>{isFriendOnline ? 'Online' : 'Offline'}</Text>
            {isFriendTyping && <Text style={styles.typingIndicator}>Typing...</Text>}
          </View>
        </View>
      ),
    });
  }, [navigation, friendName, friendImage, isFriendOnline, isFriendTyping]);

  useEffect(() => {
    if (!chatId) {
      Alert.alert("Error", "Chat ID is undefined");
      navigation.goBack();
      return;
    }

    if (!user) {
      Alert.alert("Error", "User data is not available");
      navigation.goBack();
      return;
    }

    connectSocket();
    const socket = getSocket();

    // Emit login event to mark the user as online
    socket.emit('login', user._id);

    // Join the room
    socket.emit('joinRoom', { room: chatId, userId: user._id });

    // Handle incoming messages
    const handleMessage = (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, { ...newMessage, key: uuid.v4() }]);
      flatListRef.current.scrollToEnd({ animated: true });
    };

    // Handle typing indicators
    const handleTyping = (userId) => {
      if (userId === friendId) {
        setIsFriendTyping(true);
      }
    };

    const handleStopTyping = (userId) => {
      if (userId === friendId) {
        setIsFriendTyping(false);
      }
    };

    // Handle online/offline status
    const handleOnlineStatus = (userId) => {
      if (userId === friendId) {
        setIsFriendOnline(true);
      }
    };

    const handleOfflineStatus = (userId) => {
      if (userId === friendId) {
        setIsFriendOnline(false);
      }
    };

    // Socket event listeners
    socket.on('message', handleMessage);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);
    socket.on('online', handleOnlineStatus);
    socket.on('offline', handleOfflineStatus);

    return () => {
      // Emit user offline event when leaving the chat
      socket.emit('userOffline', { chatId, userId: user._id });
      socket.off('message', handleMessage);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
      socket.off('online', handleOnlineStatus);
      socket.off('offline', handleOfflineStatus);
      disconnectSocket();
    };
  }, [chatId, user, friendId]);

  useEffect(() => {
    if (chatId) {
      fetchMessages();
    }
  }, [chatId]);

  const fetchMessages = async () => {
    try {
      const response = await getMessages(chatId);
      setMessages(response.map(msg => ({ ...msg, key: uuid.v4() })));
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (isSending) return;

    setIsSending(true);
    try {
      const newMessage = await sendMessage(chatId, message);
      setMessage('');
      const socket = getSocket();
      if (socket) {
        const messageWithKey = { ...newMessage, key: uuid.v4() };
        socket.emit('sendMessage', { ...messageWithKey, chatId });
        socket.emit('stopTyping', { chatId, userId: user._id });
      } else {
        console.error('Socket is not initialized');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('typing', { chatId, userId: user._id });
    }

    // Clear any existing typing timeout
    clearTimeout(typingTimeout.current);

    // Set a new typing timeout
    typingTimeout.current = setTimeout(() => {
      if (socket) {
        socket.emit('stopTyping', { chatId, userId: user._id });
      }
    }, 3000);
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === user._id ? styles.sender : styles.receiver,
      ]}
    >
      <View
        style={[
          styles.messageContent,
          item.sender === user._id ? styles.senderMessage : styles.receiverMessage,
        ]}
      >
        <Text style={item.sender === user._id ? styles.senderText : styles.receiverText}>
          {item.content}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 60, paddingHorizontal: 10 }}
        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={message}
          onChangeText={(text) => {
            setMessage(text);
            handleTyping();
          }}
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  onlineStatus: {
    fontSize: 14,
    color: 'green',
  },
  typingIndicator: {
    fontSize: 12,
    color: 'gray',
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    alignItems: 'flex-end',
  },
  sender: {
    justifyContent: 'flex-end',
  },
  receiver: {
    justifyContent: 'flex-start',
  },
  messageContent: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 10,
  },
  senderMessage: {
    backgroundColor: '#0084ff',
    alignSelf: 'flex-end',
  },
  receiverMessage: {
    backgroundColor: '#e5e5ea',
    alignSelf: 'flex-start',
  },
  senderText: {
    color: '#fff',
  },
  receiverText: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 10,
  },
});
