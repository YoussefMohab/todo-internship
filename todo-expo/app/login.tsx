import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Link, useRouter } from 'expo-router';
import axiosInstance from '../axiosConfig';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await axiosInstance.post('/login', { email, password });
      const { token } = response.data;
      await SecureStore.setItemAsync('userToken', token);
      // Navigate to HomeScreen after token is stored
      navigateToHome();
    } catch (error) {
      console.error(error);
    }
  };

  const navigateToHome = async () => {
    try {
      // Wait for SecureStore operation to complete
      const storedToken = await SecureStore.getItemAsync('userToken');
      while (true) {
      if (storedToken) {
        // Navigate to HomeScreen after token is confirmed to be stored
        router.replace('/home');
        return;
      } else {
        console.error('Token not stored.');
      }
    }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} />
      <Text>Password</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Register" onPress={() => {router.replace('/register')}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default LoginScreen;
