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
  const response = await axios.post('https://accounts.tiny.com.br/realms/tiny/protocol/openid-connect/token', 
    new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: import.meta.env.VITE_TINY_CLIENT_ID,
      client_secret: import.meta.env.VITE_TINY_CLIENT_SECRET,
      redirect_uri: import.meta.env.VITE_REDIRECT_URI,
      code
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  return response.data;
};

export const refreshAccessToken = async (refreshToken: string): Promise<AuthTokens> => {
  const response = await axios.post('https://accounts.tiny.com.br/realms/tiny/protocol/openid-connect/token',
    new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: import.meta.env.VITE_TINY_CLIENT_ID,
      client_secret: import.meta.env.VITE_TINY_CLIENT_SECRET,
      refresh_token: refreshToken
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
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