export interface Product {
  id: string;
  codigo: string;
  descricao: string;
  preco: string;
  estoque_atual: string;
  dataCriacao: string;
  dataAlteracao: string;
  gtin?: string;
  situacao?: string;
}