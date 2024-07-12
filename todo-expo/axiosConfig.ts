// axiosConfig.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@env';


const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add a request interceptor to include the token
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
