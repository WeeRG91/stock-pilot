export type Product = {
  id: number;
  name: string;
  sku: string;
  active: boolean;
};

export type ProductListItem = Product & {
  lowStock: boolean;
}

export type ProductListResponse = {
  data: ProductListItem[];
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
