import axios from 'axios';

const API_URL = 'http://10.0.2.2:8080'; // Emulador Android

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
