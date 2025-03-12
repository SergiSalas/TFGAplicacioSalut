import Config from 'react-native-config';
import axios from 'axios';

API_URL = "http://10.0.2.2:8080";

export const registerUser = async (name, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error('Registration failed');
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Login failed');
  }
};

export const verifyToken = async (token) => {
    try {
      const response = await axios.post(`${API_URL}/auth/verifyToken`, null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  };
