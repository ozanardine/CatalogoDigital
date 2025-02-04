import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.tiny.com.br/public-api/v3'
});

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export const getAuthTokens = async (code: string): Promise<AuthTokens> => {
  const response = await axios.post('/.netlify/functions/tiny-auth', {
    grant_type: 'authorization_code',
    code
  });
  return response.data;
};

export const refreshAccessToken = async (refreshToken: string): Promise<AuthTokens> => {
  const response = await axios.post('/.netlify/functions/tiny-auth', {
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });
  return response.data;
};

export const fetchProducts = async (accessToken: string, params = {}) => {
  try {
    const response = await api.get('/produtos', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        limit: 100,
        ...params
      }
    });
    return response.data.items;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export default api;