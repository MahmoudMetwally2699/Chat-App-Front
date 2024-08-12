import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = axios.create({
  baseURL: 'http://192.168.1.14:5000/api', // Update with your local IP address
  timeout: 10000, // 10 seconds timeout
});

// Add a request interceptor to include the token in the headers
API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const handleApiError = (error) => {
  if (error.response) {
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    console.error('Response headers:', error.response.headers);
  } else if (error.request) {
    console.error('Request data:', error.request);
  } else {
    console.error('Error message:', error.message);
  }
  throw error;
};

export const uploadImage = async (imageUri) => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: 'profile.jpg',
    type: 'image/jpeg',
  });
  formData.append('upload_preset', 'chating'); // Replace with your Cloudinary upload preset

  try {
    const response = await axios.post('https://api.cloudinary.com/v1_1/dawasspsy/image/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Cloudinary response:', response.data);
    return response.data.secure_url;
  } catch (error) {
    handleApiError(error);
  }
};

export const registerUser = async (name, email, password, profileImageUrl) => {
  try {
    const response = await API.post('/users/register', { name, email, password, profileImageUrl });
    const { token, user } = response.data;
    if (!token) {
      throw new Error('Token is undefined');
    }
    if (!user) {
      throw new Error('User data is undefined');
    }
    console.log('Token received:', token);
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await API.post('/users/login', { email, password });
    const { token, user } = response.data;
    if (!token) {
      throw new Error('Token is undefined');
    }
    if (!user) {
      throw new Error('User data is undefined');
    }
    console.log('Token received:', token);
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};
