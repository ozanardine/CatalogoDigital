import React, { useEffect, useState, useCallback } from 'react';
import { useInfiniteQuery } from 'react-query';
import { ProductGrid } from './components/ProductGrid';
import { ConfigForm } from './components/ConfigForm';
import { Search, Settings } from 'lucide-react';
import { fetchProducts, getAuthTokens, refreshAccessToken } from './services/api';
import type { Product } from './types/Product';

interface TinyConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

function App() {
  const [tokens, setTokens] = useState(() => {
    const saved = localStorage.getItem('tiny_tokens');
    return saved ? JSON.parse(saved) : null;
  });

  const [config, setConfig] = useState<TinyConfig | null>(() => {
    const saved = localStorage.getItem('tiny_config');
    return saved ? JSON.parse(saved) : null;
  });

  const [isConfiguring, setIsConfiguring] = useState(!tokens || !config);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !tokens && config) {
      getAuthTokens(code, config)
        .then(newTokens => {
          setTokens(newTokens);
          localStorage.setItem('tiny_tokens', JSON.stringify(newTokens));
          setIsConfiguring(false);
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch(error => {
          console.error('Error getting tokens:', error);
          setIsConfiguring(true);
        });
    }
  }, [tokens, config]);

  useEffect(() => {
    if (tokens && config) {
      const timeUntilExpiry = (tokens.expires_in - 300) * 1000;
      const refreshTimer = setTimeout(async () => {
        try {
          const newTokens = await refreshAccessToken(tokens.refresh_token, config);
          setTokens(newTokens);
          localStorage.setItem('tiny_tokens', JSON.stringify(newTokens));
        } catch (error) {
          console.error('Error refreshing token:', error);
          setIsConfiguring(true);
        }
      }, timeUntilExpiry);

      return () => clearTimeout(refreshTimer);
    }
  }, [tokens, config]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error
  } = useInfiniteQuery(
    ['products', tokens?.access_token],
    async ({ pageParam = 0 }) => {
      if (!tokens?.access_token) throw new Error('No access token');
      return fetchProducts(tokens.access_token, pageParam);
    },
    {
      enabled: !!tokens?.access_token,
      getNextPageParam: (lastPage, pages) => {
        const { pagination } = lastPage;
        const nextOffset = pagination.offset + pagination.limit;
        return nextOffset < pagination.total ? nextOffset : undefined;
      },
      staleTime: 1000 * 60 * 5, // 5 minutos
    }
  );

  const handleConfigSave = (newConfig: TinyConfig) => {
    localStorage.setItem('tiny_config', JSON.stringify(newConfig));
    setConfig(newConfig);
    
    const authUrl = `https://accounts.tiny.com.br/realms/tiny/protocol/openid-connect/auth?client_id=${newConfig.clientId}&redirect_uri=${newConfig.redirectUri}&scope=openid&response_type=code`;
    window.location.href = authUrl;
  };

  const handleReset = () => {
    localStorage.removeItem('tiny_tokens');
    localStorage.removeItem('tiny_config');
    setTokens(null);
    setConfig(null);
    setIsConfiguring(true);
  };

  const allProducts = data?.pages.flatMap(page => page.products) ?? [];

  if (isConfiguring) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ConfigForm
          onSave={handleConfigSave}
          defaultValues={config ? {
            clientId: config.clientId,
            redirectUri: config.redirectUri
          } : undefined}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Catálogo de Produtos</h1>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleReset}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Trocar Conta
              </button>
              <button
                onClick={() => setIsConfiguring(true)}
                className="text-gray-600 hover:text-gray-900"
                title="Configurações"
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="mt-4 relative">
            <input
              type="text"
              placeholder="Buscar produtos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductGrid
          products={allProducts}
          isLoading={isLoading || isFetchingNextPage}
          error={error as Error}
          hasMore={!!hasNextPage}
          onLoadMore={() => fetchNextPage()}
        />
      </main>
    </div>
  );
}

export default App