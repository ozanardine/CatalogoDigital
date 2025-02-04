import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { ProductGrid } from './components/ProductGrid';
import { Search, Settings } from 'lucide-react';
import { fetchProducts, getAuthTokens, refreshAccessToken } from './services/api';

function App() {
  const [tokens, setTokens] = useState(() => {
    const saved = localStorage.getItem('tiny_tokens');
    return saved ? JSON.parse(saved) : null;
  });
  const [isConfiguring, setIsConfiguring] = useState(!tokens);

  useEffect(() => {
    // Verificar código de autorização na URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !tokens) {
      getAuthTokens(code)
        .then(newTokens => {
          setTokens(newTokens);
          localStorage.setItem('tiny_tokens', JSON.stringify(newTokens));
          setIsConfiguring(false);
          // Limpar a URL
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch(error => {
          console.error('Error getting tokens:', error);
          setIsConfiguring(true);
        });
    }
  }, [tokens]);

  useEffect(() => {
    if (tokens) {
      // Configurar refresh token automático
      const timeUntilExpiry = (tokens.expires_in - 300) * 1000; // 5 minutos antes de expirar
      const refreshTimer = setTimeout(async () => {
        try {
          const newTokens = await refreshAccessToken(tokens.refresh_token);
          setTokens(newTokens);
          localStorage.setItem('tiny_tokens', JSON.stringify(newTokens));
        } catch (error) {
          console.error('Error refreshing token:', error);
          setIsConfiguring(true);
        }
      }, timeUntilExpiry);

      return () => clearTimeout(refreshTimer);
    }
  }, [tokens]);

  const { data: products, isLoading, error } = useQuery(
    ['products', tokens?.access_token],
    () => fetchProducts(tokens?.access_token),
    {
      enabled: !!tokens?.access_token,
      staleTime: 1000 * 60 * 5, // 5 minutos
    }
  );

  const handleLogin = () => {
    const clientId = import.meta.env.VITE_TINY_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_REDIRECT_URI;
    
    if (!clientId || !redirectUri) {
      console.error('Missing environment variables:', { clientId, redirectUri });
      return;
    }
    
    const authUrl = `https://accounts.tiny.com.br/realms/tiny/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid&response_type=code`;
    window.location.href = authUrl;
  };

  if (isConfiguring) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Configuração Inicial</h1>
          </div>
          
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Conectar com Tiny ERP
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Catálogo de Produtos</h1>
            
            <button
              onClick={() => setIsConfiguring(true)}
              className="text-gray-600 hover:text-gray-900"
              title="Configurações"
            >
              <Settings className="w-6 h-6" />
            </button>
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
          products={products || []}
          isLoading={isLoading}
          error={error as Error}
        />
      </main>
    </div>
  );
}

export default App;