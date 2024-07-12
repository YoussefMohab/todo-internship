// LoadingScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const LoadingScreen: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    checkUserAuthentication();
  }, []);

  const checkUserAuthentication = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        // User is authenticated, navigate to HomeScreen
        router.replace('/home');
      } else {
        // No token found, navigate to LoginScreen
        router.replace('/login');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      // Handle error
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4d089a" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: 18,
  },
});

export default LoadingScreen;
