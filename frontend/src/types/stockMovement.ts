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
