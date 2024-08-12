import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TextInput, Alert } from 'react-native';
import { sendInvite, getPendingInvites, acceptInvite, refuseInvite } from '../../services/inviteService';
import { Stack } from 'expo-router';

const invite = () => {
  const [chats, setChats] = useState([]);
  const [invites, setInvites] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    // Fetch chats from your backend or any other source
    // setChats(response.data);

    // Fetch pending invites
    fetchPendingInvites();
  }, []);

  const fetchPendingInvites = async () => {
    try {
      const invites = await getPendingInvites();
      setInvites(invites);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch invites');
      console.error('Error fetching invites:', error);
    }
  };

  const handleInvite = async () => {
    try {
      await sendInvite(inviteEmail);
      Alert.alert('Invite sent', `An invite has been sent to ${inviteEmail}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to send invite');
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    try {
      await acceptInvite(inviteId);
      fetchPendingInvites();
      Alert.alert('Success', 'Invite accepted');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept invite');
    }
  };

  const handleRefuseInvite = async (inviteId) => {
    try {
      await refuseInvite(inviteId);
      fetchPendingInvites();
      Alert.alert('Success', 'Invite refused');
    } catch (error) {
      Alert.alert('Error', 'Failed to refuse invite');
    }
  };

  return (
    <View style={styles.container}>
       <Stack.Screen
        options={{
          title: 'Invite',
          headerStyle: { backgroundColor: 'green' },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
        }}
      />
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Text>{item.name}</Text>}
        />
      <TextInput
        placeholder="Invite user by email"
        value={inviteEmail}
        onChangeText={setInviteEmail}
        style={styles.input}
      />
      <Button title="Send Invite" onPress={handleInvite}  color="green"/>
      <Text style={styles.heading}>Pending Invites</Text>
      {invites.length === 0 ? (
        <Text>No pending invites</Text>
      ) : (
        <FlatList
          data={invites}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.inviteContainer}>
              <Text>{item.name}</Text>
              <Button title="Accept" onPress={() => handleAcceptInvite(item._id)} />
              <Button title="Refuse" onPress={() => handleRefuseInvite(item._id)} />
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  inviteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flex:1
  },
});

export default invite;
