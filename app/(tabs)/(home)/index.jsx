import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { getFriends } from '../../services/userService';
import { getOrCreateChat } from '../../services/chatService';
import { Stack } from 'expo-router';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [friends, setFriends] = useState([]);
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await getFriends();
      setFriends(response);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const navigateToChat = async (friend) => {
    try {
      console.log('Navigating to chat with friend:', friend);
      const chat = await getOrCreateChat(friend._id);

      if (chat && chat._id) {
        navigation.navigate('ChatScreen', { chatId: chat._id, friendName: friend.name, friendImage: friend.profileImage, friendId: friend._id });
      } else {
        throw new Error('Invalid chat data received');
      }
    } catch (error) {
      console.error('Error navigating to chat:', error);
      Alert.alert('Error', 'Failed to navigate to chat. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Talk',
          headerStyle: { backgroundColor: 'green' },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
        }}
      />
      <FlatList
        data={friends}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigateToChat(item)} style={styles.userContainer}>
            <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.friendName}>{item.name}</Text>
              <Text style={styles.onlineStatus}>{item.isOnline ? 'Online' : 'Offline'}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  userContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  friendName: {
    fontSize: 16,
  },
  onlineStatus: {
    fontSize: 14,
    color: 'green',
  },
});
