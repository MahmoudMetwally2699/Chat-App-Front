import React from 'react';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import store from './store';




export default function Layout() {

  return (
    <Provider store={store}>
      <Stack initialRouteName="(auth)/index">
        <Stack.Screen name="(auth)/index"  options={{ headerTitle: 'login' }} />
        <Stack.Screen name="(auth)/RegisterScreen"  options={{ headerTitle: 'Register' }} />
        <Stack.Screen name="(tabs)"  options={{ headerShown: false }}/>
      </Stack>
    </Provider>
  );
}
