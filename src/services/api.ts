import axios from 'axios';
import { Product } from '../types/Product';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface ProductsResponse {
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

export const fetchProducts = async (accessToken: string, offset = 0, limit = 20) => {
  try {
    const response = await axios.get<ProductsResponse>('/.netlify/functions/tiny-products', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        limit,
        offset,
        situacao: 'A'
      }
    });
    
    // Busca os detalhes dos produtos em lotes de 5 para evitar muitas requisições simultâneas
    const productsWithDetails = [];
    for (let i = 0; i < response.data.itens.length; i += 5) {
      const batch = response.data.itens.slice(i, i + 5);
      const detailsBatch = await Promise.all(
        batch.map(async (product) => {
          const details = await axios.get(`/.netlify/functions/tiny-product-details`, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            params: {
              id: product.id
            }
          });
          return details.data;
        })
      );
      productsWithDetails.push(...detailsBatch);
      
      // Pequeno delay entre os lotes para evitar sobrecarga
      if (i + 5 < response.data.itens.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return {
      products: productsWithDetails.filter(product => product.situacao === 'A'),
      pagination: response.data.paginacao
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};