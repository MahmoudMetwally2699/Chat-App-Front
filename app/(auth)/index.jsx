import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { loginUser } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from '../../components/Themed';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    checkStoredCredentials();
  }, []);

  const checkStoredCredentials = async () => {
    const storedEmail = await AsyncStorage.getItem('storedEmail');
    const storedPassword = await AsyncStorage.getItem('storedPassword');
    if (storedEmail && storedPassword) {
      setEmail(storedEmail);
      setPassword(storedPassword);
      handleLogin(storedEmail, storedPassword, true); // Automatically login with stored credentials
    }
  };

  const handleLogin = async (emailToUse, passwordToUse, autoLogin = false) => {
    try {
      await loginUser(emailToUse, passwordToUse);
      
      if (rememberMe || autoLogin) {
        await AsyncStorage.setItem('storedEmail', emailToUse);
        await AsyncStorage.setItem('storedPassword', passwordToUse);
      } else {
        await AsyncStorage.removeItem('storedEmail');
        await AsyncStorage.removeItem('storedPassword');
      }

      navigation.navigate('(tabs)');
    } catch (err) {
      console.error('Login failed', err);
      setError(err.message);
    }
  };

  const handleLoginPress = () => {
    handleLogin(email, password);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <View style={styles.rememberMeContainer}>
        <Text>Remember Me</Text>
        <Switch
          value={rememberMe}
          onValueChange={(value) => setRememberMe(value)}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Login" onPress={handleLoginPress} />
      <Button title="Go to Register" onPress={() => navigation.navigate('(auth)/RegisterScreen')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});
