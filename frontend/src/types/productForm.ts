export type ProductFormValues = {
  name: string;
  sku: string;
};

export type ProductFormState = {
  values: ProductFormValues;
  fieldErrors: {
    name?: string;
    sku?: string;
  };
  message: string;
};
