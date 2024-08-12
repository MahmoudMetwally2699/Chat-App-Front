import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.14:5000/api/users';

const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

export const getFriends = async () => {
  const token = await getToken();

  // Fetch friends
  const response = await fetch(`${API_URL}/friends`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch friends');
  }

  const friends = await response.json();

  // Fetch online users
  const onlineResponse = await fetch(`${API_URL}/online-users`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  let onlineUsers = [];
  if (onlineResponse.ok) {
    onlineUsers = await onlineResponse.json();
  }

  // Ensure onlineUsers is an array
  if (!Array.isArray(onlineUsers)) {
    onlineUsers = [];
  }

  // Merge the data, adding an `isOnline` property to each friend
  return friends.map(friend => ({
    ...friend,
    isOnline: onlineUsers.includes(friend._id),
  }));
};
export const sendInvite = async (email) => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to send invite');
  }

  return await response.json();
};

export const getOrCreateChat = async (recipientId) => {
  const token = await getToken();
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
    throw new Error(errorData.message || 'Failed to get or create chat');
  }

  return await response.json();
};
