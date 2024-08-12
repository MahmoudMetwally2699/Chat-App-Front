import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.14:5000/api/users'; // Replace with your backend URL

const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

export const sendInvite = async (email) => {
  const token = await getToken();
  try {
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
  } catch (error) {
    console.error('Error inviting user:', error);
    throw error;
  }
};

export const getPendingInvites = async () => {
  const token = await getToken();
  try {
    const response = await fetch(`${API_URL}/pending-invites`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch invites');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching invites:', error);
    throw error;
  }
};

export const acceptInvite = async (inviteId) => {
  const token = await getToken();
  try {
    const response = await fetch(`${API_URL}/accept-invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ inviteId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to accept invite');
    }

    return await response.json();
  } catch (error) {
    console.error('Error accepting invite:', error);
    throw error;
  }
};

export const refuseInvite = async (inviteId) => {
  const token = await getToken();
  try {
    const response = await fetch(`${API_URL}/refuse-invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ inviteId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to refuse invite');
    }

    return await response.json();
  } catch (error) {
    console.error('Error refusing invite:', error);
    throw error;
  }
};
