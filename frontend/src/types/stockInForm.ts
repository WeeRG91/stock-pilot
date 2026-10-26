export type StockInFormState = {
    values: {
        quantity: string;
    };
    fieldErrors: {
        quantity?: string;
    };
    message: string;
}