import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.14:5000/api/chats';

const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

export const getMessages = async (chatId) => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/${chatId}/messages`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch messages');
  }

  return await response.json();
};

export const sendMessage = async (chatId, content) => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/${chatId}/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to send message');
  }

  return await response.json();
};

export const getOrCreateChat = async (recipientId) => {
  const token = await getToken();
  console.log('getOrCreateChat recipientId:', recipientId); // Log recipientId

  const response = await fetch(`${API_URL}/create-or-get`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ recipientId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.log('Error data:', errorData); // Log error data
    throw new Error(errorData.message || 'Failed to get or create chat');
  }

  const data = await response.json();
  console.log('getOrCreateChat response data:', data); // Log response data

  if (!data._id) {
    throw new Error('Invalid chat data received');
  }

  return data;
};
