import axios from 'axios';
import { Product } from '../types/Product';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface ProductsResponse {
  itens: Product[];
  paginacao: {
    limit: number;
    offset: number;
    total: number;
  };
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
    const response = await axios.get<ProductsResponse>('/.netlify/functions/tiny-products', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        limit: 100,
        situacao: 'A',  // Apenas produtos ativos
        ...params
      }
    });
    
    return response.data.itens.filter(product => product.situacao === 'A');
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export default {
  getAuthTokens,
  refreshAccessToken,
  fetchProducts
};