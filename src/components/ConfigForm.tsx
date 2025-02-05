import React, { useState } from 'react';
import { Settings, HelpCircle } from 'lucide-react';

interface ConfigFormProps {
  onSave: (config: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  }) => void;
  defaultValues?: {
    clientId: string;
    redirectUri: string;
  };
}

export function ConfigForm({ onSave, defaultValues }: ConfigFormProps) {
  const [clientId, setClientId] = useState(defaultValues?.clientId || '');
  const [clientSecret, setClientSecret] = useState('');
  const [redirectUri, setRedirectUri] = useState(defaultValues?.redirectUri || window.location.origin);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ clientId, clientSecret, redirectUri });
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Configuração do Tiny ERP</h1>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold mb-2">Como obter suas credenciais:</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>Acesse o <a href="https://painel.tiny.com.br/developer" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">Painel do Desenvolvedor Tiny</a></li>
              <li>Clique em "Criar Nova Aplicação"</li>
              <li>Preencha os dados da aplicação</li>
              <li>Use a URL de redirecionamento: <code className="bg-blue-100 px-1 rounded">{window.location.origin}</code></li>
              <li>Copie o Client ID e Client Secret gerados</li>
            </ol>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
            Client ID
          </label>
          <input
            type="text"
            id="clientId"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="clientSecret" className="block text-sm font-medium text-gray-700 mb-1">
            Client Secret
          </label>
          <input
            type="password"
            id="clientSecret"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="redirectUri" className="block text-sm font-medium text-gray-700 mb-1">
            URL de Redirecionamento
          </label>
          <input
            type="url"
            id="redirectUri"
            value={redirectUri}
            onChange={(e) => setRedirectUri(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Salvar e Conectar
        </button>
      </form>
    </div>
  );
}