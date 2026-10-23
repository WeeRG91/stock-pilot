export type Product = {
  id: number;
  name: string;
  sku: string;
  active: boolean;
};

export type ProductListResponse = {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ProductResponse = {
  data: Product;
};
