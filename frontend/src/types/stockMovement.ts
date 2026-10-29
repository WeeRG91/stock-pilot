export type StockInMovement = {
  id: number;
  productId: number;
  type: "in";
  quantity: number;
  createdAt: string;
};

export type StockInResponse = {
  data: StockInMovement;
};

export type StockMovement = Omit<StockInMovement, "type"> & {
  type: "in" | "out";
};

export type MovementHistoryResponse = {
  data: StockMovement[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type StockOutMovement = Omit<StockMovement, "type"> & {
  type: "out";
};

export type StockOutResponse = {
  data: StockOutMovement;
};
