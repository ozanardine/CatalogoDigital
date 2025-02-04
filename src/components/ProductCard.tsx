import React from 'react';
import { Product } from '../types/Product';
import { Tag, Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.descricao}</h3>
        
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">SKU: {product.sku}</span>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="text-2xl font-bold text-green-600">
              R$ {product.precos.preco.toFixed(2)}
            </p>
            {product.precos.precoPromocional > 0 && (
              <p className="text-sm text-gray-500 line-through">
                R$ {product.precos.precoPromocional.toFixed(2)}
              </p>
            )}
          </div>
          
          <div className="text-right">
            <p className="text-xs text-gray-500">
              {product.unidade}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}