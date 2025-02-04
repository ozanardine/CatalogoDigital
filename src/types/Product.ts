export interface ProductPrices {
  preco: number;
  precoPromocional: number;
  precoCusto: number;
  precoCustoMedio: number;
}

export interface Product {
  id: number;
  sku: string;
  descricao: string;
  tipo: string;
  situacao: string;
  dataCriacao: string;
  dataAlteracao: string;
  unidade: string;
  gtin?: string;
  precos: ProductPrices;
}