import React from 'react';
import { useInView } from 'react-intersection-observer';
import { ProductCard } from './ProductCard';
import { Product } from '../types/Product';
import { PackageSearch } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function ProductGrid({ products, isLoading, error, hasMore, onLoadMore }: ProductGridProps) {
  const { ref, inView } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView && hasMore && !isLoading) {
        onLoadMore();
      }
    },
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-600">
        <PackageSearch className="w-16 h-16 mb-4" />
        <p className="text-xl font-semibold">Erro ao carregar produtos</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  if (!isLoading && !products.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-600">
        <PackageSearch className="w-16 h-16 mb-4" />
        <p className="text-xl font-semibold">Nenhum produto encontrado</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}
      
      {/* Intersection observer target */}
      {hasMore && <div ref={ref} className="h-10" />}
    </>
  );
}