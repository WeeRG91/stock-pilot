export type LowStockThresholdResponse = {
  data: {
    productId: number;
    threshold: number;
  };
};

export type LowStockThresholdFormState = {
  values: {
    threshold: string;
  };
  fieldErrors: {
    threshold?: string;
  };
  message: string;
};
