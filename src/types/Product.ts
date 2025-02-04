export interface ProductPrices {
  preco: number;
  precoPromocional: number;
  precoCusto: number;
  precoCustoMedio: number;
}

export interface ProductAttachment {
  url: string;
  externo: boolean;
}

export interface Product {
  id: number;
  sku: string;
  descricao: string;
  tipo: string;
  situacao: string;
  unidade: string;
  gtin?: string;
  precos: ProductPrices;
  anexos: ProductAttachment[];
}